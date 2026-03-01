import type { DatabaseClient } from "@skillsgate/database";

export interface VectorSearchResult {
  id: string;
  skillId: string;
  score: number;
  title: string;
  text: string;
}

export async function searchVectors(
  db: DatabaseClient,
  embedding: number[],
  topK: number,
  namespaces: string[]
): Promise<VectorSearchResult[]> {
  const vectorStr = `[${embedding.join(",")}]`;

  const rows: any[] = await (db as any).$queryRawUnsafe(
    `
    SELECT
      id,
      skill_id,
      title,
      text,
      1 - (embedding <=> $1::vector) AS score
    FROM skill_chunks
    WHERE namespace = ANY($2::text[])
    ORDER BY embedding <=> $1::vector
    LIMIT $3
    `,
    vectorStr,
    namespaces,
    topK
  );

  return rows.map((row) => ({
    id: row.id,
    skillId: row.skill_id,
    score: Number(row.score),
    title: row.title,
    text: row.text,
  }));
}
