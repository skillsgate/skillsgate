import { useState, useEffect, useRef, useCallback } from "react"
import { fetchCatalog, searchSkills, type CatalogSkill } from "./api-client.js"

const DEBOUNCE_MS = 300
const PAGE_SIZE = 20

interface UseSearchResult {
  results: CatalogSkill[]
  loading: boolean
  error: string | null
  total: number
  hasMore: boolean
  loadMore: () => void
}

/**
 * Hook that manages search state with debounce and pagination.
 * - When query is empty, loads the catalog with pagination
 * - When query is provided, searches after 300ms debounce
 */
export function useSearch(query: string): UseSearchResult {
  const [results, setResults] = useState<CatalogSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Reset pagination when query changes
  useEffect(() => {
    setResults([])
    setOffset(0)
    setError(null)
  }, [query])

  useEffect(() => {
    // Clear any pending debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }

    const doFetch = async () => {
      setLoading(true)
      setError(null)

      try {
        if (query.trim()) {
          // Search mode
          const data = await searchSkills(query)
          setResults(data.results)
          setTotal(data.total)
        } else {
          // Catalog mode (load first page)
          const data = await fetchCatalog(PAGE_SIZE, 0)
          setResults(data.skills)
          setTotal(data.total)
          setOffset(PAGE_SIZE)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // Don't report abort errors
        if (!msg.includes("abort")) {
          setError(msg)
        }
      } finally {
        setLoading(false)
      }
    }

    if (query.trim()) {
      // Debounce search queries
      timerRef.current = setTimeout(doFetch, DEBOUNCE_MS)
    } else {
      // Load catalog immediately
      doFetch()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query])

  const loadMore = useCallback(async () => {
    // Only paginate in catalog mode (empty query)
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
  }
}
