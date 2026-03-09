import type { DatabaseClient } from "@skillsgate/database";
import { OpenAIEmbeddingProvider } from "./embedding";
import { searchVectors, type VectorSearchResult } from "./vector-store";
import { enrichUsersWithGithubUsername } from "./users";

// ─── Types ──────────────────────────────────────────────────────────

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
  score: number;
}

/**
 * Minimal skill metadata cached in KV for search result hydration.
 * Only the fields needed to build a SearchResult — not the full Prisma model.
 */
export interface CachedSkillMeta {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string;
  categories: string[];
  capabilities: string[];
  keywords: string[];
  githubRepo: string | null;
  githubPath: string | null;
  sourceType: string | null;
  publisherId: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Compute a hex-encoded SHA-256 hash using the Web Crypto API
 * (available in Cloudflare Workers).
 */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Skill Metadata Hydration (with KV cache) ──────────────────────

/**
 * Hydrate skill metadata for a list of skill IDs.
 * Checks KV cache first (`skill:{id}`), fetches missing from DB,
 * and writes fetched results back to KV with a 5-minute TTL.
 *
 * KV writes are non-blocking via `ctx.waitUntil()`.
 * All KV operations are wrapped in try/catch so search still works
 * if KV is unavailable.
 */
async function hydrateSkills(
  db: DatabaseClient,
  skillIds: string[],
  cache: KVNamespace,
  ctx?: ExecutionContext
): Promise<Map<string, CachedSkillMeta>> {
  const skillMap = new Map<string, CachedSkillMeta>();
  const missingIds: string[] = [];

  // 1. Try KV for each skill
  try {
    const cacheResults = await Promise.all(
      skillIds.map(async (id) => {
        try {
          const cached = await cache.get(`skill:${id}`, "json");
          return { id, cached };
        } catch {
          return { id, cached: null };
        }
      })
    );

    for (const { id, cached } of cacheResults) {
      if (cached) {
        skillMap.set(id, cached as CachedSkillMeta);
      } else {
        missingIds.push(id);
      }
    }
  } catch {
    // If the entire Promise.all fails, treat all IDs as cache misses
    missingIds.length = 0;
    missingIds.push(...skillIds);
  }

  // 2. Fetch missing from DB
  if (missingIds.length > 0) {
    const skills = await db.skill.findMany({
      where: { id: { in: missingIds } },
      select: {
        id: true,
        slug: true,
        name: true,
        summary: true,
        description: true,
        categories: true,
        capabilities: true,
        keywords: true,
        githubRepo: true,
        githubPath: true,
        sourceType: true,
        publisherId: true,
      },
    });

    for (const skill of skills) {
      const meta: CachedSkillMeta = {
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        summary: skill.summary,
        description: skill.description,
        categories: (skill.categories as string[]) ?? [],
        capabilities: (skill.capabilities as string[]) ?? [],
        keywords: (skill.keywords as string[]) ?? [],
        githubRepo: skill.githubRepo,
        githubPath: skill.githubPath,
        sourceType: skill.sourceType,
        publisherId: skill.publisherId,
      };
      skillMap.set(skill.id, meta);

      // Write-behind (non-blocking)
      ctx?.waitUntil(
        cache
          .put(`skill:${skill.id}`, JSON.stringify(meta), {
            expirationTtl: 300, // 5 minutes
          })
          .catch(() => {
            // Silently ignore KV write failures
          })
      );
    }
  }

  return skillMap;
}

// ─── Main Search Function ───────────────────────────────────────────

export async function searchSkills(
  db: DatabaseClient,
  openaiApiKey: string,
  query: string,
  limit: number,
  cache: KVNamespace,
  ctx?: ExecutionContext
): Promise<SearchResult[]> {
  // 1. Embed the query (with KV cache)
  const normalized = query.trim().toLowerCase();
  const embedCacheKey = `embed:${await sha256(normalized)}`;

  let embedding: number[] | null = null;

  // Try cache first
  try {
    const cached = await cache.get(embedCacheKey, "json");
    if (cached) {
      embedding = cached as number[];
    }
  } catch {
    // KV read failed — fall through to OpenAI
  }

  // Fallback to OpenAI on cache miss
  if (!embedding) {
    const embedder = new OpenAIEmbeddingProvider(openaiApiKey);
    embedding = await embedder.embedQuery(query);

    // Write-behind (non-blocking)
    ctx?.waitUntil(
      cache
        .put(embedCacheKey, JSON.stringify(embedding), {
          expirationTtl: 86400, // 24 hours
        })
        .catch(() => {
          // Silently ignore KV write failures
        })
    );
  }

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

  // 5. Batch fetch skill metadata (with KV cache)
  const skillIds = ranked.map((r) => r.skillId);
  const skillMap = await hydrateSkills(db, skillIds, cache, ctx);

  // 6. Resolve publisher GitHub usernames for R2-sourced skills
  const r2PublisherIds = [...skillMap.values()]
    .filter((s) => s.sourceType === "r2" && s.publisherId)
    .map((s) => s.publisherId!);
  const publisherUsernames =
    r2PublisherIds.length > 0
      ? await enrichUsersWithGithubUsername(db, r2PublisherIds)
      : new Map<string, string>();

  // 7. Build response
  return ranked.map(({ skillId, bestScore }) => {
    const skill = skillMap.get(skillId);
    const slug = skill?.slug ?? "";
    const sourceType = skill?.sourceType ?? null;
    const githubRepo = skill?.githubRepo ?? "";
    const githubPath = skill?.githubPath ?? "";
    const githubUrl = githubRepo
      ? `https://github.com/${githubRepo}${githubPath ? `/blob/main/${githubPath}` : ""}`
      : "";
    const publisherUsername =
      skill?.publisherId ? publisherUsernames.get(skill.publisherId) ?? null : null;

    return {
      skillId,
      slug,
      name: skill?.name ?? skillId,
      summary: skill?.summary ?? skill?.description ?? "",
      categories: skill?.categories ?? [],
      capabilities: skill?.capabilities ?? [],
      keywords: skill?.keywords ?? [],
      githubUrl,
      installCommand: deriveInstallCommand(slug, sourceType, publisherUsername, githubRepo, githubPath),
      score: Math.round(bestScore * 1000) / 1000,
    };
  });
}

function deriveInstallCommand(
  slug: string,
  sourceType: string | null,
  publisherUsername: string | null,
  githubRepo: string,
  githubPath: string
): string | null {
  // R2-sourced skills (directly published to SkillsGate): install by @username/slug
  if (sourceType === "r2" && slug && publisherUsername) {
    return `skillsgate add @${publisherUsername}/${slug} -y`;
  }

  // GitHub-sourced skills: install via owner/repo
  if (!githubRepo) return null;

  const isSingleSkill = githubPath === "SKILL.md" || !githubPath;
  if (isSingleSkill) {
    return `skillsgate add ${githubRepo} -y`;
  }

  const parts = githubPath.split("/");
  const skillIdx = parts.indexOf("skills");
  const skillName =
    skillIdx >= 0 && parts.length > skillIdx + 1
      ? parts[skillIdx + 1]
      : undefined;

  if (skillName) {
    return `skillsgate add ${githubRepo} --skill ${skillName} -y`;
  }

  return `skillsgate add ${githubRepo} -y`;
}
