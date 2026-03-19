import type { CachedSkillMeta } from "./search";

// ─── Types ──────────────────────────────────────────────────────────

export interface RerankerWeights {
  slugName: number;
  keyword: number;
  category: number;
  capability: number;
  textMatch: number;
}

export const DEFAULT_WEIGHTS: RerankerWeights = {
  slugName: 0.020,
  keyword: 0.015,
  category: 0.008,
  capability: 0.005,
  textMatch: 0.002,
};

const MAX_BONUS = 0.05;
const MAX_POPULARITY_BONUS = 0.03;

// ─── Tokenizer ──────────────────────────────────────────────────────

/**
 * Split a query string into lowercase tokens.
 * Splits on whitespace, hyphens, underscores, and common punctuation.
 * Filters out tokens shorter than 2 characters.
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s\-_.,;:!?/\\|()[\]{}<>"'`~@#$%^&*+=]+/)
    .filter((t) => t.length >= 2);
}

// ─── Signal Functions ───────────────────────────────────────────────

/**
 * Signal 1: Slug/Name match.
 * Returns 0–1 indicating how well the query matches the skill's slug or name.
 */
export function slugNameScore(
  normalizedQuery: string,
  queryTokens: string[],
  meta: CachedSkillMeta
): number {
  const slug = meta.slug.toLowerCase();
  const name = meta.name.toLowerCase();

  if (normalizedQuery === slug || normalizedQuery === name) return 1.0;
  if (name.includes(normalizedQuery)) return 0.7;
  if (slug.includes(normalizedQuery) || normalizedQuery.includes(slug)) return 0.6;
  if (normalizedQuery.includes(name)) return 0.6;

  if (queryTokens.length === 0) return 0;
  const nameTokens = tokenizeQuery(name);
  const slugTokens = tokenizeQuery(slug);
  const targetTokens = new Set([...nameTokens, ...slugTokens]);
  const matched = queryTokens.filter((t) => targetTokens.has(t)).length;
  return matched > 0 ? 0.3 * (matched / queryTokens.length) : 0;
}

/**
 * Signal 2: Keyword match.
 * Returns 0–1 indicating how well query tokens match the skill's keywords array.
 */
export function keywordScore(
  normalizedQuery: string,
  queryTokens: string[],
  meta: CachedSkillMeta
): number {
  const keywords = meta.keywords.map((k) => k.toLowerCase());

  if (keywords.includes(normalizedQuery)) return 1.0;
  if (keywords.some((k) => k.includes(normalizedQuery))) return 0.8;

  if (queryTokens.length === 0) return 0;
  const keywordTokenSet = new Set(keywords.flatMap((k) => tokenizeQuery(k)));
  const matched = queryTokens.filter((t) => keywordTokenSet.has(t)).length;
  return matched > 0 ? 0.6 * (matched / queryTokens.length) : 0;
}

/**
 * Signal 3: Category match.
 * Returns 0–1 indicating how well the query matches the skill's categories.
 */
export function categoryScore(
  normalizedQuery: string,
  queryTokens: string[],
  meta: CachedSkillMeta
): number {
  const categories = meta.categories.map((c) => c.toLowerCase());

  if (categories.includes(normalizedQuery)) return 1.0;

  if (
    queryTokens.some((token) =>
      categories.some((cat) => cat.includes(token))
    )
  ) {
    return 0.5;
  }

  return 0;
}

/**
 * Signal 4: Capability match.
 * Returns 0–1 — the best token overlap ratio across all capability phrases.
 */
export function capabilityScore(
  _normalizedQuery: string,
  queryTokens: string[],
  meta: CachedSkillMeta
): number {
  if (queryTokens.length === 0 || meta.capabilities.length === 0) return 0;

  let best = 0;
  for (const cap of meta.capabilities) {
    const capTokens = new Set(tokenizeQuery(cap.toLowerCase()));
    const matched = queryTokens.filter((t) => capTokens.has(t)).length;
    const ratio = matched / queryTokens.length;
    if (ratio > best) best = ratio;
  }

  return best;
}

/**
 * Signal 5: Text match (description + summary).
 * Returns 0–1 — fraction of query tokens found in the combined description+summary text.
 */
export function textMatchScore(
  _normalizedQuery: string,
  queryTokens: string[],
  meta: CachedSkillMeta
): number {
  if (queryTokens.length === 0) return 0;

  const text = `${meta.description ?? ""} ${meta.summary ?? ""}`.toLowerCase();
  const matched = queryTokens.filter((t) => text.includes(t)).length;
  return matched / queryTokens.length;
}

// ─── Popularity Bonus ────────────────────────────────────────────────

/**
 * Compute a query-independent popularity bonus based on GitHub stars.
 * Uses a log10 scale so that differences between 10 and 100 stars matter
 * as much as 10k vs 100k. Capped at MAX_POPULARITY_BONUS (0.03).
 */
export function popularityBonus(githubStars: number | null): number {
  const stars = githubStars || 0;
  if (stars <= 0) return 0;
  const raw = Math.log10(stars + 1) / Math.log10(200000 + 1);
  return Math.min(raw * MAX_POPULARITY_BONUS, MAX_POPULARITY_BONUS);
}

// ─── Core Re-Ranking ────────────────────────────────────────────────

/**
 * Compute the metadata bonus for a single skill.
 * Combines all 5 signal scores using the provided weights, capped at MAX_BONUS (0.05).
 */
export function computeMetadataBonus(
  normalizedQuery: string,
  queryTokens: string[],
  meta: CachedSkillMeta,
  weights: RerankerWeights = DEFAULT_WEIGHTS
): number {
  const raw =
    weights.slugName * slugNameScore(normalizedQuery, queryTokens, meta) +
    weights.keyword * keywordScore(normalizedQuery, queryTokens, meta) +
    weights.category * categoryScore(normalizedQuery, queryTokens, meta) +
    weights.capability * capabilityScore(normalizedQuery, queryTokens, meta) +
    weights.textMatch * textMatchScore(normalizedQuery, queryTokens, meta);

  return Math.min(raw, MAX_BONUS);
}

/**
 * Re-rank a pool of search candidates using metadata bonuses.
 *
 * @param normalizedQuery - The lowercased, trimmed search query
 * @param candidates - Array of { skillId, bestScore } from vector search (pre-ranked pool)
 * @param skillMap - Map of skillId → CachedSkillMeta (from hydration)
 * @param weights - Optional custom weights (defaults to DEFAULT_WEIGHTS)
 * @returns A new array sorted by (bestScore + metadataBonus), descending
 */
export function rerankResults(
  normalizedQuery: string,
  candidates: { skillId: string; bestScore: number }[],
  skillMap: Map<string, CachedSkillMeta>,
  weights: RerankerWeights = DEFAULT_WEIGHTS
): { skillId: string; bestScore: number }[] {
  const queryTokens = tokenizeQuery(normalizedQuery);

  return candidates
    .map((candidate) => {
      const meta = skillMap.get(candidate.skillId);
      if (!meta) return candidate;

      const metaBonus = computeMetadataBonus(
        normalizedQuery,
        queryTokens,
        meta,
        weights
      );
      const popBonus = popularityBonus(meta.githubStars);

      return {
        skillId: candidate.skillId,
        bestScore: candidate.bestScore + metaBonus + popBonus,
      };
    })
    .sort((a, b) => b.bestScore - a.bestScore);
}
