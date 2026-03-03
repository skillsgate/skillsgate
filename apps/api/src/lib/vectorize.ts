import type { DatabaseClient } from "@skillsgate/database";
import { OpenAIEmbeddingProvider } from "./embedding";
import { chunkSkillContent } from "./chunker";

/**
 * Vectorizes a skill's SKILL.md content: chunks it, embeds via OpenAI, and
 * stores the vectors in the skill_chunks table for semantic search.
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
  r2: R2Bucket,
  skillId: string
): Promise<void> {
  try {
    // 1. Fetch skill record
    // Note: visibility and publisherId are defined in the Prisma schema but may
    // not yet be present in the generated client. Use `as any` select + cast to
    // work around the generated-client lag (same pattern as other routes).
    const skill = await (db.skill.findUnique as any)({
      where: { id: skillId },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        publisherId: true,
      },
    }) as { id: string; name: string; description: string; visibility: string; publisherId: string | null } | null;

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

    // 3. Chunk content
    const chunks = chunkSkillContent(skill.name, markdownContent);

    if (chunks.length === 0) {
      console.warn(`[vectorize] No chunks produced for skill: ${skillId}`);
      return;
    }

    // 4. Determine namespace
    const namespace =
      skill.visibility === "public" ? "public" : `skill_${skillId}`;

    // 5. Compose embedding texts
    const embeddingTexts = chunks.map(
      (chunk) =>
        `${skill.name}\n${skill.description}\n\n${chunk.title}\n${chunk.text}`
    );

    // 6. Batch-embed via OpenAI
    const embeddingProvider = new OpenAIEmbeddingProvider(openaiApiKey);
    const embeddings = await embeddingProvider.embedBatch(embeddingTexts);

    // 7. Delete existing chunks for this skill
    await (db as any).$executeRawUnsafe(
      `DELETE FROM skill_chunks WHERE skill_id = $1`,
      skillId
    );

    // 8. Insert new chunks with embeddings using raw SQL
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

    // 9. Mark skill as vectorized
    await db.skill.update({
      where: { id: skillId },
      data: { vectorizedAt: new Date() },
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
