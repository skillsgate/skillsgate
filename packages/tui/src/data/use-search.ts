import { useState, useEffect, useRef, useCallback } from "react"
import { fetchCatalog, searchSkills, type CatalogSkill, type SearchMode } from "./api-client.js"

const DEBOUNCE_MS = 300
const PAGE_SIZE = 20

interface UseSearchResult {
  results: CatalogSkill[]
  loading: boolean
  error: string | null
  total: number
  hasMore: boolean
  loadMore: () => void
  remainingSearches: number | null
}

/**
 * Hook that manages search state with debounce and pagination.
 * - When query is empty, loads the catalog with pagination
 * - When query is provided, searches after 300ms debounce
 * - Supports keyword and semantic search modes
 */
export function useSearch(
  query: string,
  mode: SearchMode,
  token?: string | null
): UseSearchResult {
  const [results, setResults] = useState<CatalogSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [remainingSearches, setRemainingSearches] = useState<number | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset pagination when query or mode changes
  useEffect(() => {
    setResults([])
    setOffset(0)
    setError(null)
  }, [query, mode])

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const doFetch = async () => {
      setLoading(true)
      setError(null)

      try {
        if (query.trim()) {
          const data = await searchSkills(query, mode, token)
          setResults(data.skills)
          setTotal(data.total)
          if (data.remainingSearches !== undefined) {
            setRemainingSearches(data.remainingSearches)
          }
        } else {
          const data = await fetchCatalog(PAGE_SIZE, 0)
          setResults(data.skills)
          setTotal(data.total)
          setOffset(PAGE_SIZE)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes("abort")) {
          setError(msg)
        }
      } finally {
        setLoading(false)
      }
    }

    if (query.trim()) {
      timerRef.current = setTimeout(doFetch, DEBOUNCE_MS)
    } else {
      doFetch()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query, mode, token])

  const loadMore = useCallback(async () => {
    if (query.trim() || loading) return
    if (results.length >= total) return

    setLoading(true)
    try {
      const data = await fetchCatalog(PAGE_SIZE, offset)
      setResults((prev) => [...prev, ...data.skills])
      setTotal(data.total)
      setOffset((prev) => prev + PAGE_SIZE)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [query, loading, results.length, total, offset])

  return {
    results,
    loading,
    error,
    total,
    hasMore: results.length < total,
    loadMore,
    remainingSearches,
  }
}
