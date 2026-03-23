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
  installCommand?: string | null
  score?: number
  username?: string
}

interface CatalogResponse {
  skills: CatalogSkill[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

interface SearchResponse {
  results: CatalogSkill[]
  meta: {
    query: string
    total: number
    limit: number
    remainingSearches?: number
  }
}

// ---------- Catalog ----------

/**
 * Fetches the public skill catalog with pagination.
 */
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

// ---------- Search ----------

/**
 * Searches skills using the public keyword search endpoint.
 * Semantic search (POST /api/v1/search) requires auth -- this uses keyword search.
 */
export async function searchSkills(
  query: string,
  token?: string
): Promise<{ results: CatalogSkill[]; total: number }> {
  const url = `${API_BASE}/api/v1/skills/search?q=${encodeURIComponent(query)}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Search failed (HTTP ${response.status})`)
  }

  const data = (await response.json()) as SearchResponse
  return {
    results: data.results ?? [],
    total: data.meta?.total ?? 0,
  }
}
