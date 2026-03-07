import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import type { DatabaseClient } from "@skillsgate/database";
import type { Bindings, VectorizeSkillWorkflowInput } from "../types";
import { parseSkillMd, type ParsedSkillMd } from "../lib/skill-parser";
import { chunkSkillContent, type TextChunk } from "../lib/chunker";
import { OpenAIEmbeddingProvider } from "../lib/embedding";
import { enrichSkillWithLlm, type LlmEnrichment } from "../lib/llm-enrichment";
import { insertSkillChunks, deleteSkillChunks } from "../lib/vector-store";
import { createDatabaseClient } from "@skillsgate/database";

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
 * 5. Enriches with LLM (summary, categories, capabilities, keywords, semantic chunks)
 * 6. Chunks content into structured pieces using LLM output + section fallback
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

    // Helper: create a fresh DB client per step to avoid stale connections
    // after workflow hibernation between steps.
    const freshDb = () => createDatabaseClient(this.env.HYPERDRIVE.connectionString);

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
        return this.checkExistingSkill(freshDb(), sourceId, metadata.slug, contentHash, options?.force);
      });

      if (!existingCheck.shouldProceed) {
        // Mark vectorization_request as completed so it's not retried
        try {
          const db = freshDb();
          await (db.vectorizationRequest.updateMany as any)({
            where: { sourceId },
            data: { status: 'completed' },
          });
        } catch (e) {
          console.warn(`[vectorize] Failed to mark skipped request as completed: ${sourceId}`, e);
        }

        return {
          status: 'skipped',
          sourceId,
          reason: 'unchanged'
        };
      }

      // ─────────────────────────────────────────────────────────────────
      // Step 5: LLM Enrichment
      // ─────────────────────────────────────────────────────────────────
      const llm = await step.do('llm-enrichment', {
        retries: { limit: 2, delay: '5 seconds', backoff: 'exponential' },
        timeout: '2 minutes'
      }, async () => {
        // Build frontmatter object for the prompt
        const frontmatter: Record<string, unknown> = {};
        if (parsed.name) frontmatter.name = parsed.name;
        if (parsed.description) frontmatter.description = parsed.description;
        if (parsed.summary) frontmatter.summary = parsed.summary;
        if (parsed.categories) frontmatter.categories = parsed.categories;
        if (parsed.capabilities) frontmatter.capabilities = parsed.capabilities;
        if (parsed.keywords) frontmatter.keywords = parsed.keywords;

        // Strip frontmatter from body for the prompt
        const body = skillMd.replace(/^---[\s\S]*?---\n?/, '').trim();

        return enrichSkillWithLlm(this.env.OPENROUTER_API_KEY, frontmatter, body);
      });

      // Store LLM output to R2 for debugging/auditing
      const runId = crypto.randomUUID();
      await step.do('store-llm-output', async () => {
        const key = `workflows/${runId}/llm.json`;
        await this.env.R2_WORKFLOW_ARTIFACTS.put(key, JSON.stringify(llm, null, 2), {
          httpMetadata: { contentType: 'application/json' },
        });
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 6: Chunk Content
      // ─────────────────────────────────────────────────────────────────
      const chunks = await step.do('chunk-content', async () => {
        const skillName = parsed.name || metadata.slug;
        const description = parsed.description || '';
        const body = skillMd.replace(/^---[\s\S]*?---\n?/, '').trim();

        // Build frontmatter object for the chunker
        const frontmatter: Record<string, unknown> = {};
        if (parsed.name) frontmatter.name = parsed.name;
        if (parsed.description) frontmatter.description = parsed.description;

        return chunkSkillContent({
          slug: metadata.slug,
          name: skillName,
          description,
          frontmatter,
          body,
          llm,
        });
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
        return this.upsertSkill(freshDb(), sourceId, metadata, parsed, llm, contentHash, existingCheck.existing);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 9: Insert Vector Chunks
      // ─────────────────────────────────────────────────────────────────
      await step.do('insert-vectors', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' }
      }, async () => {
        const db = freshDb();
        await deleteSkillChunks(db, skill.id);
        await insertSkillChunks(db, skill.id, namespace, chunks, embeddings);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 10: Mark Complete
      // ─────────────────────────────────────────────────────────────────
      await step.do('mark-complete', {
        retries: { limit: 5, delay: '2 seconds', backoff: 'exponential' },
        timeout: '30 seconds',
      }, async () => {
        console.log(`[vectorize] Completed: ${sourceId} (${chunks.length} chunks)`);

        const db = freshDb();
        await (db.vectorizationRequest.updateMany as any)({
          where: { sourceId },
          data: { status: 'completed' },
        });
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

      // Best-effort: mark vectorization_request as failed
      try {
        const db = freshDb();
        await (db.vectorizationRequest.updateMany as any)({
          where: { sourceId },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (markError) {
        console.error('[vectorize] Failed to mark request as failed:', markError);
      }

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
        try {
          const errorData = await repoRes.json() as { message?: string };
          if (errorData.message?.includes('Not Found')) {
            throw new NonRetryableError(`Repository not found or is private (private repos not supported): ${source.repo}`);
          }
        } catch {
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

    throw new NonRetryableError(`Invalid source type: ${(source as any).type}`);
  }

  /**
   * Check if an existing skill record exists and if content has changed
   */
  private async checkExistingSkill(
    db: DatabaseClient,
    sourceId: string,
    slug: string,
    contentHash: string,
    force?: boolean
  ): Promise<{ shouldProceed: boolean; existing: { id: string; contentHash: string | null } | null }> {
    // Look up by sourceId first, fall back to slug (for pre-migration records with null sourceId)
    let existing = await (db.skill.findUnique as any)({
      where: { sourceId },
      select: { id: true, contentHash: true }
    });

    if (!existing) {
      existing = await (db.skill.findUnique as any)({
        where: { slug },
        select: { id: true, contentHash: true }
      });
    }

    if (force) {
      return { shouldProceed: true, existing };
    }

    if (existing && existing.contentHash === contentHash) {
      console.log(`[vectorize] Skipping ${sourceId} - content unchanged`);
      return { shouldProceed: false, existing };
    }

    return { shouldProceed: true, existing };
  }

  /**
   * Upsert the skill record in the database.
   * LLM-generated fields fill in when frontmatter doesn't provide them.
   */
  private async upsertSkill(
    db: DatabaseClient,
    sourceId: string,
    metadata: VectorizeSkillWorkflowInput['metadata'],
    parsed: ParsedSkillMd,
    llm: LlmEnrichment,
    contentHash: string,
    existing: { id: string; contentHash: string | null } | null
  ): Promise<{ id: string; slug: string }> {
    // Content-derived fields (safe to update on both create and update)
    const contentData: any = {
      name: parsed.name || metadata.slug,
      description: parsed.description || '',
      summary: parsed.summary || llm.summary || undefined,
      contentHash,
      vectorizedAt: new Date(),
    };

    // Prefer frontmatter, fallback to LLM-generated values
    const categories = parsed.categories?.length ? parsed.categories : llm.categories;
    const capabilities = parsed.capabilities?.length ? parsed.capabilities : llm.capabilities;
    const keywords = parsed.keywords?.length ? parsed.keywords : llm.keywords;

    if (categories.length) contentData.categories = categories;
    if (capabilities.length) contentData.capabilities = capabilities;
    if (keywords.length) contentData.keywords = keywords;

    if (existing) {
      // Update by id (not sourceId) since pre-migration records may have sourceId: null
      // Backfill sourceId but don't overwrite ownership fields (publisherId, orgId, etc.)
      const updated = await (db.skill.update as any)({
        where: { id: existing.id },
        data: { ...contentData, sourceId }
      });
      return { id: updated.id, slug: updated.slug };
    } else {
      const skillId = crypto.randomUUID();
      const created = await (db.skill.create as any)({
        data: {
          id: skillId,
          sourceId,
          slug: metadata.slug,
          ...contentData,
          // Ownership fields only set on creation
          visibility: metadata.visibility,
          publisherId: metadata.publisherId,
          orgId: metadata.orgId,
          sourceType: metadata.sourceType,
          priceCents: metadata.priceCents,
        }
      });
      return { id: created.id, slug: created.slug };
    }
  }
}
