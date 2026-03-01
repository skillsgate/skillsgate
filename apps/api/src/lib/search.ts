import type { DatabaseClient } from "@skillsgate/database";
import { OpenAIEmbeddingProvider } from "./embedding";
import { searchVectors, type VectorSearchResult } from "./vector-store";

export interface SearchResult {
  skillId: string;
  slug: string;
  name: string;
  summary: string;
  categories: string[];
  capabilities: string[];
  keywords: string[];
  githubUrl: string;
  installCommand: string | null;
}

export async function searchSkills(
  db: DatabaseClient,
  openaiApiKey: string,
  query: string,
  limit: number
): Promise<SearchResult[]> {
  const embedder = new OpenAIEmbeddingProvider(openaiApiKey);

  // 1. Embed the query
  const embedding = await embedder.embedQuery(query);

  // 2. pgvector search with headroom for dedup
  const topK = limit * 4;
  const rawResults = await searchVectors(db, embedding, topK, ["public"]);

  if (rawResults.length === 0) return [];

  // 3. Dedup by skillId — keep best score per skill
  const skillGroups = new Map<string, number>();
  for (const result of rawResults) {
    const existing = skillGroups.get(result.skillId);
    if (existing === undefined || result.score > existing) {
      skillGroups.set(result.skillId, result.score);
    }
  }

  // 4. Rank and take top N
  const ranked = [...skillGroups.entries()]
    .map(([skillId, bestScore]) => ({ skillId, bestScore }))
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, limit);

  // 5. Batch fetch skill metadata
  const skillIds = ranked.map((r) => r.skillId);
  const skills = await db.skill.findMany({
    where: { id: { in: skillIds } },
  });
  const skillMap = new Map(skills.map((s) => [s.id, s]));

  // 6. Build response
  return ranked.map(({ skillId }) => {
    const skill = skillMap.get(skillId);
    const githubRepo = skill?.githubRepo ?? "";
    const githubPath = skill?.githubPath ?? "";
    const githubUrl = githubRepo
      ? `https://github.com/${githubRepo}${githubPath ? `/blob/main/${githubPath}` : ""}`
      : "";

    return {
      skillId,
      slug: skill?.slug ?? "",
      name: skill?.name ?? skillId,
      summary: skill?.summary ?? skill?.description ?? "",
      categories: (skill?.categories as string[]) ?? [],
      capabilities: (skill?.capabilities as string[]) ?? [],
      keywords: (skill?.keywords as string[]) ?? [],
      githubUrl,
      installCommand: deriveInstallCommand(githubRepo, githubPath),
    };
  });
}

function deriveInstallCommand(
  githubRepo: string,
  githubPath: string
): string | null {
  if (!githubRepo) return null;

  const isSingleSkill = githubPath === "SKILL.md" || !githubPath;
  if (isSingleSkill) {
    return `npx skills add ${githubRepo} -y`;
  }

  const parts = githubPath.split("/");
  const skillIdx = parts.indexOf("skills");
  const skillName =
    skillIdx >= 0 && parts.length > skillIdx + 1
      ? parts[skillIdx + 1]
      : undefined;

  if (skillName) {
    return `npx skills add ${githubRepo} --skill ${skillName} -y`;
  }

  return `npx skills add ${githubRepo} -y`;
}
