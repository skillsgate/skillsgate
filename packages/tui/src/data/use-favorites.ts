import { useState, useEffect, useCallback } from "react"
import { useStore, useDispatch } from "../store/context.js"
import type { CatalogSkill } from "./api-client.js"

const API_BASE = process.env.SKILLSGATE_SEARCH_API_URL ?? "https://api.skillsgate.ai"

interface FavoriteSkill extends CatalogSkill {
  favoriteId?: string
}

interface UseFavoritesResult {
  favorites: FavoriteSkill[]
  loading: boolean
  error: string | null
  toggle: (skillId: string) => Promise<void>
  refresh: () => void
}

/**
 * Hook that manages the user's favorited skills.
 * Requires authentication -- returns empty list if not logged in.
 */
export function useFavorites(): UseFavoritesResult {
  const state = useStore()
  const dispatch = useDispatch()
  const [favorites, setFavorites] = useState<FavoriteSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  const token = state.auth?.token

  // Fetch favorites when authenticated
  useEffect(() => {
    if (!token) {
      setFavorites([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchFavorites() {
      try {
        const res = await fetch(`${API_BASE}/api/favorites`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch favorites (HTTP ${res.status})`)
        }

        const data = (await res.json()) as { favorites: FavoriteSkill[] }
        if (!cancelled) {
          const items = data.favorites ?? []
          setFavorites(items)
          dispatch({ type: "SET_FAVORITES", favorites: items })
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          setError(msg)
          setFavorites([])
          dispatch({ type: "SET_FAVORITES", favorites: [] })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchFavorites()
    return () => { cancelled = true }
  }, [token, refreshToken])

  /**
   * Toggle a skill's favorite status.
   * If already favorited, removes it. Otherwise, adds it.
   */
  const toggle = useCallback(async (skillId: string) => {
    if (!token) return

    const isFavorited = favorites.some((f) => f.id === skillId)

    try {
      if (isFavorited) {
        // Remove favorite
        const res = await fetch(`${API_BASE}/api/favorites/${skillId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error(`Failed to remove favorite (HTTP ${res.status})`)
        }

        // Optimistic update: remove from local list
        setFavorites((prev) => {
          const updated = prev.filter((f) => f.id !== skillId)
          dispatch({ type: "SET_FAVORITES", favorites: updated })
          return updated
        })
      } else {
        // Add favorite
        const res = await fetch(`${API_BASE}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skillId }),
        })
        if (!res.ok) {
          throw new Error(`Failed to add favorite (HTTP ${res.status})`)
        }

        // Refresh the full list to get the complete skill data
        setRefreshToken((t) => t + 1)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: msg },
      })
    }
  }, [token, favorites, dispatch])

  const refresh = useCallback(() => {
    setRefreshToken((t) => t + 1)
  }, [])

  return {
    favorites,
    loading,
    error,
    toggle,
    refresh,
  }
}
