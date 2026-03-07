import type { DatabaseClient } from "@skillsgate/database";
import { OpenAIEmbeddingProvider } from "./embedding";
import { chunkSkillContent } from "./chunker";
import { parseSkillMd } from "./skill-parser";
import { enrichSkillWithLlm } from "./llm-enrichment";
import type { VectorizeSkillWorkflowInput, SkillMetadata } from "../types";

/**
 * Vectorizes a skill's SKILL.md content: enriches with LLM, chunks it,
 * embeds via OpenAI, and stores the vectors in the skill_chunks table
 * for semantic search.
 *
 * This function is idempotent — calling it again replaces all existing chunks
 * for the skill.
 *
 * Errors are caught and logged so vectorization failures do not crash the
 * upload flow.
 */
export async function vectorizeSkill(
  db: DatabaseClient,
  openaiApiKey: string,
  openRouterApiKey: string,
  r2: R2Bucket,
  skillId: string
): Promise<void> {
  try {
    // 1. Fetch skill record
    const skill = await (db.skill.findUnique as any)({
      where: { id: skillId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        visibility: true,
        publisherId: true,
      },
    }) as { id: string; name: string; slug: string; description: string; visibility: string; publisherId: string | null } | null;

    if (!skill) {
      console.error(`[vectorize] Skill not found: ${skillId}`);
      return;
    }

    // 2. Read SKILL.md from R2
    const r2Key = `skills/${skillId}/SKILL.md`;
    const r2Object = await r2.get(r2Key);

    if (!r2Object) {
      console.error(`[vectorize] SKILL.md not found in R2: ${r2Key}`);
      return;
    }

    const markdownContent = await r2Object.text();

    if (!markdownContent.trim()) {
      console.error(`[vectorize] SKILL.md is empty for skill: ${skillId}`);
      return;
    }

    // 3. Parse frontmatter
    const parsed = parseSkillMd(markdownContent);
    const body = markdownContent.replace(/^---[\s\S]*?---\n?/, '').trim();

    // 4. LLM enrichment — generate summary, categories, capabilities, keywords, chunks
    const frontmatter: Record<string, unknown> = {};
    if (parsed.name) frontmatter.name = parsed.name;
    if (parsed.description) frontmatter.description = parsed.description;
    const llm = await enrichSkillWithLlm(openRouterApiKey, frontmatter, body);

    // 5. Chunk content using LLM output + section fallback
    const chunks = chunkSkillContent({
      slug: skill.slug,
      name: skill.name,
      description: parsed.description || skill.description,
      frontmatter,
      body,
      llm,
    });

    if (chunks.length === 0) {
      console.warn(`[vectorize] No chunks produced for skill: ${skillId}`);
      return;
    }

    // 6. Determine namespace
    const namespace =
      skill.visibility === "public" ? "public" : `skill_${skillId}`;

    // 7. Compose embedding texts
    const embeddingTexts = chunks.map(
      (chunk) =>
        `${skill.name}\n${skill.description}\n\n${chunk.title}\n${chunk.text}`
    );

    // 8. Batch-embed via OpenAI
    const embeddingProvider = new OpenAIEmbeddingProvider(openaiApiKey);
    const embeddings = await embeddingProvider.embedBatch(embeddingTexts);

    // 9. Delete existing chunks for this skill
    await (db as any).$executeRawUnsafe(
      `DELETE FROM skill_chunks WHERE skill_id = $1`,
      skillId
    );

    // 10. Insert new chunks with embeddings using raw SQL
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const id = `${skillId}::${chunk.index}`;
      const chunkId = `${skillId}::chunk_${chunk.index}`;
      const vectorStr = `[${embedding.join(",")}]`;

      await (db as any).$executeRawUnsafe(
        `INSERT INTO skill_chunks (id, chunk_id, skill_id, title, text, chunk_index, namespace, embedding, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, NOW(), NOW())`,
        id,
        chunkId,
        skillId,
        chunk.title,
        chunk.text,
        chunk.index,
        namespace,
        vectorStr
      );
    }

    // 11. Update skill with LLM-generated metadata + mark as vectorized
    const updateData: any = { vectorizedAt: new Date() };
    if (llm.summary) updateData.summary = llm.summary;
    if (llm.categories.length) updateData.categories = llm.categories;
    if (llm.capabilities.length) updateData.capabilities = llm.capabilities;
    if (llm.keywords.length) updateData.keywords = llm.keywords;

    await db.skill.update({
      where: { id: skillId },
      data: updateData,
    });

    console.log(
      `[vectorize] Successfully vectorized skill ${skillId}: ${chunks.length} chunks`
    );
  } catch (error) {
    console.error(
      `[vectorize] Failed to vectorize skill ${skillId}:`,
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Enqueue a skill for vectorization via the workflow queue.
 *
 * This is the preferred way to trigger skill vectorization as it provides:
 * - Durable execution with automatic retries
 * - Idempotent processing via sourceId
 * - Better observability and error handling
 * - Non-blocking API responses
 *
 * @param queue - The VECTORIZE_QUEUE binding from context
 * @param skillId - The unique skill ID
 * @param metadata - Required skill metadata
 * @returns The queue send result
 */
export async function enqueueSkillVectorization(
  queue: Queue<VectorizeSkillWorkflowInput>,
  skillId: string,
  metadata: SkillMetadata
): Promise<void> {
  // Determine source type and construct sourceId
  const sourceId = metadata.sourceType === 'github' && metadata.orgId
    ? `github:${metadata.orgId}/${metadata.slug}`
    : `direct:${skillId}`;

  // Determine namespace based on visibility
  let namespace: string;
  if (metadata.visibility === 'public') {
    namespace = 'public';
  } else if (metadata.orgId) {
    namespace = `org_${metadata.orgId}`;
  } else {
    namespace = `skill_${skillId}`;
  }

  // Construct the workflow input
  const payload: VectorizeSkillWorkflowInput = {
    sourceId,
    source: {
      type: 'direct',
      skillId
    },
    metadata: {
      ...metadata,
      // Ensure these required fields are present
      slug: metadata.slug,
      visibility: metadata.visibility,
      publisherId: metadata.publisherId,
      sourceType: metadata.sourceType
    },
    namespace
  };

  console.log(`[enqueue] Queuing vectorization for ${sourceId} (skill: ${skillId})`);

  // Send to queue - the queue consumer will create a workflow instance
  await queue.send(payload);
}
