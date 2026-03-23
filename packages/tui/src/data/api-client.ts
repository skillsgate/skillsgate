const API_BASE = process.env.SKILLSGATE_SEARCH_API_URL ?? "https://api.skillsgate.ai"

// ---------- Types ----------

export interface CatalogSkill {
  id: string
  slug: string
  name: string
  description: string
  summary?: string
  categories: string[]
  capabilities?: string[]
  keywords?: string[]
  githubUrl?: string
  githubStars?: number | null
  installCommand?: string | null
  score?: number
  username?: string
  urlPath?: string
}

interface CatalogResponse {
  skills: CatalogSkill[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore?: boolean
  }
}

interface KeywordSearchResponse {
  skills: CatalogSkill[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore?: boolean
  }
}

interface SemanticSearchResponse {
  results: CatalogSkill[]
  meta: {
    query: string
    total: number
    limit: number
    remainingSearches: number
  }
}

export type SearchMode = "keyword" | "semantic"

export interface SearchResult {
  skills: CatalogSkill[]
  total: number
  remainingSearches?: number
}

// ---------- Catalog ----------

export async function fetchCatalog(
  limit: number = 20,
  offset: number = 0
): Promise<{ skills: CatalogSkill[]; total: number }> {
  const url = `${API_BASE}/api/v1/skills?limit=${limit}&offset=${offset}`

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Catalog fetch failed (HTTP ${response.status})`)
  }

  const data = (await response.json()) as CatalogResponse
  return { skills: data.skills ?? [], total: data.meta?.total ?? 0 }
}

// ---------- Keyword Search (public, no auth) ----------

export async function keywordSearch(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult> {
  const url = `${API_BASE}/api/v1/skills/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Keyword search failed (HTTP ${response.status})`)
  }

  const data = (await response.json()) as KeywordSearchResponse
  return {
    skills: data.skills ?? [],
    total: data.meta?.total ?? 0,
  }
}

// ---------- Semantic Search (authenticated, rate limited) ----------

export async function semanticSearch(
  query: string,
  token: string,
  limit: number = 5
): Promise<SearchResult> {
  const url = `${API_BASE}/api/v1/search`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, limit }),
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMIT")
    }
    if (response.status === 401) {
      throw new Error("AUTH_EXPIRED")
    }
    throw new Error(`Semantic search failed (HTTP ${response.status})`)
  }

  const data = (await response.json()) as SemanticSearchResponse
  return {
    skills: data.results ?? [],
    total: data.meta?.total ?? 0,
    remainingSearches: data.meta?.remainingSearches,
  }
}

// ---------- Unified search ----------

export async function searchSkills(
  query: string,
  mode: SearchMode,
  token?: string | null
): Promise<SearchResult> {
  if (mode === "semantic" && token) {
    return semanticSearch(query, token)
  }
  return keywordSearch(query)
}
