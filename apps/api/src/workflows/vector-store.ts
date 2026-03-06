import type { DatabaseClient } from "@skillsgate/database";
import type { TextChunk } from "../lib/chunker";

/**
 * Delete all existing chunks for a skill.
 * Used before inserting new chunks during re-vectorization.
 */
export async function deleteSkillChunks(
  db: DatabaseClient,
  skillId: string
): Promise<void> {
  await (db as any).$executeRawUnsafe(
    `DELETE FROM skill_chunks WHERE skill_id = $1`,
    skillId
  );
}

/**
 * Insert vector chunks with embeddings into the skill_chunks table.
 * 
 * Uses raw SQL for the embedding column (vector type) which is not in the Prisma schema.
 * Each chunk is inserted with its metadata and vector embedding.
 */
export async function insertSkillChunks(
  db: DatabaseClient,
  skillId: string,
  namespace: string,
  chunks: TextChunk[],
  embeddings: number[][]
): Promise<void> {
  if (chunks.length !== embeddings.length) {
    throw new Error(`Chunk count (${chunks.length}) does not match embedding count (${embeddings.length})`);
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const id = `${skillId}::${chunk.index}`;
    const chunkId = `${skillId}::chunk_${chunk.index}`;
    const vectorStr = `[${embedding.join(',')}]`;

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
}

/**
 * Check if skill chunks exist for a given skill.
 */
export async function skillChunksExist(
  db: DatabaseClient,
  skillId: string
): Promise<boolean> {
  const result = await (db as any).$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM skill_chunks WHERE skill_id = $1`,
    skillId
  );
  return result[0]?.count > 0;
}

/**
 * Count the number of chunks for a skill.
 */
export async function countSkillChunks(
  db: DatabaseClient,
  skillId: string
): Promise<number> {
  const result = await (db as any).$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM skill_chunks WHERE skill_id = $1`,
    skillId
  );
  return Number(result[0]?.count) || 0;
}
