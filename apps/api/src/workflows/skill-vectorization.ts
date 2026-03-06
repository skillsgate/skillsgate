import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import type { DatabaseClient } from "@skillsgate/database";
import type { Bindings, VectorizeSkillWorkflowInput } from "../types";
import { parseSkillMd, type ParsedSkillMd } from "../lib/skill-parser";
import { chunkSkillContent, type TextChunk } from "../lib/chunker";
import { OpenAIEmbeddingProvider } from "../lib/embedding";
import { insertSkillChunks, deleteSkillChunks } from "../lib/vector-store-workflow";
import { createDatabaseClient } from "@skillsgate/database";

/**
 * Non-retryable error - indicates a permanent failure that should not be retried.
 * Examples: 404 errors, invalid configuration, validation failures
 */
export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonRetryableError";
  }
}

/**
 * Retryable error - indicates a transient failure that should be retried.
 * Examples: network timeouts, rate limits, temporary service unavailability
 */
export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableError";
  }
}

/**
 * Result of the workflow execution
 */
export interface VectorizeResult {
  status: 'success' | 'skipped' | 'failed';
  sourceId: string;
  skillId?: string;
  slug?: string;
  chunks?: number;
  namespace?: string;
  isNew?: boolean;
  reason?: string;
}

/**
 * Durable workflow for vectorizing a single skill.
 * 
 * This workflow:
 * 1. Reads SKILL.md from the specified source (R2, GitHub, or Direct)
 * 2. Parses frontmatter metadata
 * 3. Computes content hash for idempotency
 * 4. Checks for existing skill and content changes
 * 5. Validates slug uniqueness
 * 6. Chunks content into semantic pieces
 * 7. Generates embeddings via OpenAI
 * 8. Upserts the skill record in the database
 * 9. Inserts vector chunks with embeddings
 * 10. Marks completion
 * 
 * The workflow is idempotent via sourceId - running it multiple times with the same
 * sourceId will either skip (if content unchanged) or update the existing skill.
 */
export class SkillVectorizationWorkflow extends WorkflowEntrypoint<Bindings, VectorizeSkillWorkflowInput> {
  async run(event: WorkflowEvent<VectorizeSkillWorkflowInput>, step: WorkflowStep): Promise<VectorizeResult> {
    const { sourceId, source, metadata, namespace, options } = event.payload;

    // Create database client
    const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);

    try {
      // ─────────────────────────────────────────────────────────────────
      // Step 1: Read SKILL.md from Source
      // ─────────────────────────────────────────────────────────────────
      const skillMd = await step.do('read-skill-md', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' },
        timeout: '30 seconds'
      }, async () => {
        return this.readSkillMd(source);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 2: Parse SKILL.md Frontmatter
      // ─────────────────────────────────────────────────────────────────
      const parsed = await step.do('parse-skill-md', async () => {
        return parseSkillMd(skillMd);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 3: Compute Content Hash
      // ─────────────────────────────────────────────────────────────────
      const contentHash = await step.do('compute-content-hash', async () => {
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(skillMd));
        return Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 4: Check for Existing Skill
      // ─────────────────────────────────────────────────────────────────
      const existingCheck = await step.do('check-existing', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' }
      }, async () => {
        return this.checkExistingSkill(db, sourceId, contentHash, options?.force);
      });

      if (!existingCheck.shouldProceed) {
        return {
          status: 'skipped',
          sourceId,
          reason: 'unchanged'
        };
      }

      // ─────────────────────────────────────────────────────────────────
      // Step 5: Validate Slug Uniqueness
      // ─────────────────────────────────────────────────────────────────
      await step.do('validate-slug', async () => {
        return this.validateSlug(db, metadata.slug, sourceId);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 6: Chunk Content
      // ─────────────────────────────────────────────────────────────────
      const chunks = await step.do('chunk-content', async () => {
        const skillName = parsed.name || metadata.slug;
        return chunkSkillContent(skillName, skillMd);
      });

      if (chunks.length === 0) {
        throw new NonRetryableError('No chunks produced from SKILL.md content');
      }

      // ─────────────────────────────────────────────────────────────────
      // Step 7: Generate Embeddings
      // ─────────────────────────────────────────────────────────────────
      const embeddings = await step.do('generate-embeddings', {
        retries: { limit: 3, delay: '5 seconds', backoff: 'exponential' },
        timeout: '2 minutes'
      }, async () => {
        const skillName = parsed.name || metadata.slug;
        const description = parsed.description || '';
        const texts = chunks.map(chunk =>
          `${skillName}\n${description}\n\n${chunk.title}\n${chunk.text}`
        );

        const embeddingProvider = new OpenAIEmbeddingProvider(this.env.OPENAI_API_KEY);
        return embeddingProvider.embedBatch(texts);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 8: Upsert Skill Record
      // ─────────────────────────────────────────────────────────────────
      const skill = await step.do('upsert-skill', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' }
      }, async () => {
        return this.upsertSkill(db, sourceId, metadata, parsed, contentHash, existingCheck.existing);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 9: Insert Vector Chunks
      // ─────────────────────────────────────────────────────────────────
      await step.do('insert-vectors', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' }
      }, async () => {
        await deleteSkillChunks(db, skill.id);
        await insertSkillChunks(db, skill.id, namespace, chunks, embeddings);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 10: Mark Complete
      // ─────────────────────────────────────────────────────────────────
      await step.do('mark-complete', async () => {
        console.log(`[vectorize] Completed: ${sourceId} (${chunks.length} chunks)`);
      });

      return {
        status: 'success',
        sourceId,
        skillId: skill.id,
        slug: skill.slug,
        chunks: chunks.length,
        namespace,
        isNew: !existingCheck.existing
      };

    } catch (error) {
      console.error(`[vectorize] Failed for ${sourceId}:`, error);

      // Re-throw retryable errors for automatic retry
      if (error instanceof RetryableError) {
        throw error;
      }

      // Non-retryable errors should fail immediately
      if (error instanceof NonRetryableError) {
        return {
          status: 'failed',
          sourceId,
          reason: error.message
        };
      }

      // Unknown errors - treat as retryable
      throw error;
    }
  }

  /**
   * Read SKILL.md content from the specified source
   */
  private async readSkillMd(source: VectorizeSkillWorkflowInput['source']): Promise<string> {
    if (source.type === 'r2') {
      const obj = await this.env.R2_SKILLS.get(source.r2Key);
      if (!obj) {
        throw new NonRetryableError(`SKILL.md not found in R2: ${source.r2Key}`);
      }
      return obj.text();
    }

    if (source.type === 'github') {
      // First, check if the repo is private
      const [owner, repo] = source.repo.split('/');
      const repoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const repoRes = await fetch(repoApiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SkillsGate-Vectorization/1.0'
        }
      });

      if (repoRes.status === 404) {
        // Repo doesn't exist or is private without auth
        // Try to get more info from the error response
        try {
          const errorData = await repoRes.json() as { message?: string };
          if (errorData.message?.includes('Not Found')) {
            throw new NonRetryableError(`Repository not found or is private (private repos not supported): ${source.repo}`);
          }
        } catch {
          // If we can't parse the error, assume it's private/not found
          throw new NonRetryableError(`Repository not found or is private (private repos not supported): ${source.repo}`);
        }
        throw new NonRetryableError(`Repository not found or is private (private repos not supported): ${source.repo}`);
      }

      if (repoRes.ok) {
        const repoData = await repoRes.json() as { private: boolean };
        if (repoData.private) {
          throw new NonRetryableError(`Private GitHub repositories are not supported: ${source.repo}`);
        }
      }

      // Repo is public, fetch the file
      const url = `https://raw.githubusercontent.com/${source.repo}/${source.ref || 'main'}/${source.path}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'SkillsGate-Vectorization/1.0'
        }
      });

      if (res.status === 404) {
        throw new NonRetryableError(`SKILL.md not found on GitHub: ${url}`);
      }

      if (!res.ok) {
        throw new RetryableError(`GitHub fetch failed: ${res.status} ${res.statusText}`);
      }

      return res.text();
    }

    if (source.type === 'direct') {
      const r2Key = `skills/${source.skillId}/SKILL.md`;
      const obj = await this.env.R2_SKILLS.get(r2Key);
      if (!obj) {
        throw new NonRetryableError(`SKILL.md not found for direct skill: ${r2Key}`);
      }
      return obj.text();
    }

    throw new NonRetryableError(`Invalid source type: ${(source as any).type}`);
  }

  /**
   * Check if an existing skill record exists and if content has changed
   */
  private async checkExistingSkill(
    db: DatabaseClient,
    sourceId: string,
    contentHash: string,
    force?: boolean
  ): Promise<{ shouldProceed: boolean; existing: { id: string; contentHash: string | null } | null }> {
    if (force) {
      const existing = await (db.skill.findUnique as any)({
        where: { sourceId },
        select: { id: true, contentHash: true }
      });
      return { shouldProceed: true, existing };
    }

    const existing = await (db.skill.findUnique as any)({
      where: { sourceId },
      select: { id: true, contentHash: true }
    });

    if (existing && existing.contentHash === contentHash) {
      console.log(`[vectorize] Skipping ${sourceId} - content unchanged`);
      return { shouldProceed: false, existing };
    }

    return { shouldProceed: true, existing };
  }

  /**
   * Validate that the slug doesn't conflict with another skill
   */
  private async validateSlug(db: DatabaseClient, slug: string, sourceId: string): Promise<void> {
    const existing = await (db.skill.findUnique as any)({
      where: { slug },
      select: { id: true, sourceId: true }
    });

    if (existing && existing.sourceId !== sourceId) {
      throw new NonRetryableError(
        `Slug '${slug}' already exists (sourceId: ${existing.sourceId})`
      );
    }
  }

  /**
   * Upsert the skill record in the database
   */
  private async upsertSkill(
    db: DatabaseClient,
    sourceId: string,
    metadata: VectorizeSkillWorkflowInput['metadata'],
    parsed: ParsedSkillMd,
    contentHash: string,
    existing: { id: string; contentHash: string | null } | null
  ): Promise<{ id: string; slug: string }> {
    // Build data object, excluding null values for JSON fields to avoid Prisma type issues
    const data: any = {
      // From SKILL.md (parsed wins)
      name: parsed.name || metadata.slug,
      description: parsed.description || '',
      summary: parsed.summary,
      // From metadata
      visibility: metadata.visibility,
      publisherId: metadata.publisherId,
      orgId: metadata.orgId,
      sourceType: metadata.sourceType,
      priceCents: metadata.priceCents,
      contentHash,
      vectorizedAt: new Date(),
    };

    // Only include JSON fields if they have values
    if (parsed.categories) data.categories = parsed.categories;
    if (parsed.capabilities) data.capabilities = parsed.capabilities;
    if (parsed.keywords) data.keywords = parsed.keywords;

    if (existing) {
      // Update existing skill using 'as any' for compatibility with generated client
      const updated = await (db.skill.update as any)({
        where: { sourceId },
        data
      });
      return { id: updated.id, slug: updated.slug };
    } else {
      // Create new skill using 'as any' for compatibility with generated client
      const skillId = crypto.randomUUID();
      const created = await (db.skill.create as any)({
        data: {
          id: skillId,
          sourceId,
          slug: metadata.slug,
          ...data
        }
      });
      return { id: created.id, slug: created.slug };
    }
  }
}
