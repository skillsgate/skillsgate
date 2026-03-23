import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../lib/auth-store"
import { electronAPI } from "../lib/electron-api"

// ---------------------------------------------------------------------------
// API constants
// ---------------------------------------------------------------------------

const API_BASE = "https://api.skillsgate.ai"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FavoriteSkill {
  skillId: string
  slug: string
  name: string
  description: string
  summary: string
  categories: string[]
  capabilities: string[]
  keywords: string[]
  githubUrl: string
  githubStars: number | null
  installCommand: string | null
  urlPath: string
  favoritedAt: string
}

interface FavoritesResponse {
  favorites: FavoriteSkill[]
  meta: { total: number; limit: number; offset: number; hasMore: boolean }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`
  }
  return String(stars)
}

// ---------------------------------------------------------------------------
// Sign-in Prompt
// ---------------------------------------------------------------------------

function SignInPrompt({ onSignIn }: { onSignIn: () => void }) {
  const [code, setCode] = useState("")
  const [exchanging, setExchanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { exchangeCode } = useAuthStore()

  async function handleExchange() {
    if (!code.trim()) return
    setExchanging(true)
    setError(null)
    try {
      await exchangeCode(code.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code")
    } finally {
      setExchanging(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4 text-muted"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <p className="text-foreground text-sm font-medium mb-1">
        Sign in to view your favorites
      </p>
      <p className="text-muted text-[12px] mb-6 max-w-sm">
        Favorites are synced with your SkillsGate account. Sign in with a
        device code from the browser.
      </p>

      {/* Step 1: Open browser */}
      <button
        onClick={onSignIn}
        className="px-5 py-2.5 rounded-lg text-[13px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity mb-4"
      >
        Open sign-in page
      </button>

      {/* Step 2: Paste code */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <input
          type="text"
          placeholder="Paste code (XXXX-XXXX)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleExchange()}
          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono text-center tracking-wider"
        />
        <button
          onClick={handleExchange}
          disabled={exchanging || !code.trim()}
          className="px-4 py-2 rounded-lg text-[13px] font-medium border border-border text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
        >
          {exchanging ? "..." : "Verify"}
        </button>
      </div>

      {error && (
        <p className="text-[12px] text-red-400 mt-3">{error}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Favorite Card
// ---------------------------------------------------------------------------

interface FavoriteCardProps {
  skill: FavoriteSkill
  isInstalled: boolean
  onInstall: (source: string) => Promise<void>
  onUnfavorite: (skillId: string) => void
}

function FavoriteCard({ skill, isInstalled, onInstall, onUnfavorite }: FavoriteCardProps) {
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(isInstalled)

  useEffect(() => {
    setInstalled(isInstalled)
  }, [isInstalled])

  async function handleInstall() {
    if (!skill.installCommand) return
    const parts = skill.installCommand.split(" ")
    const source = parts[parts.length - 1]
    if (!source) return

    setInstalling(true)
    try {
      await onInstall(source)
      setInstalled(true)
    } catch (err) {
      console.error("Install failed:", err)
    } finally {
      setInstalling(false)
    }
  }

  const displayText = skill.summary || skill.description

  return (
    <div className="p-4 rounded-lg border border-border bg-surface group">
      {/* Name + stars */}
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="text-[13px] font-semibold text-foreground truncate">
          {skill.name}
        </h3>
        {installed && (
          <span className="text-[9px] uppercase tracking-wider font-medium text-accent bg-surface-hover px-1.5 py-0.5 rounded flex-shrink-0">
            installed
          </span>
        )}
        {skill.githubStars != null && skill.githubStars > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-muted ml-auto">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400/70">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {formatStars(skill.githubStars)}
          </span>
        )}
      </div>

      {/* Description */}
      {displayText && (
        <p className="text-[12px] text-muted leading-relaxed line-clamp-2 mb-3">
          {displayText}
        </p>
      )}

      {/* Categories */}
      {skill.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skill.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="text-[9px] font-mono tracking-wider uppercase text-muted bg-surface-hover px-1.5 py-0.5 rounded"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!installed && skill.installCommand && (
          <button
            onClick={handleInstall}
            disabled={installing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {installing ? "Installing..." : "Install"}
          </button>
        )}
        <button
          onClick={() => onUnfavorite(skill.skillId)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="text-amber-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Unfavorite
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Favorites (main export)
// ---------------------------------------------------------------------------

export function Favorites() {
  const { user, token, loading: authLoading, signIn } = useAuthStore()
  const [favorites, setFavorites] = useState<FavoriteSkill[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [installedNames, setInstalledNames] = useState<Set<string>>(new Set())

  // Fetch installed skills for installed indicator
  useEffect(() => {
    electronAPI.listInstalled().then((installed) => {
      setInstalledNames(new Set(installed.map((s) => s.name.toLowerCase())))
    })
  }, [])

  const fetchFavorites = useCallback(
    async (offset: number) => {
      if (!token) return
      try {
        const res = await fetch(
          `${API_BASE}/api/favorites?limit=24&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: FavoritesResponse = await res.json()

        if (offset === 0) {
          setFavorites(data.favorites)
        } else {
          setFavorites((prev) => [...prev, ...data.favorites])
        }
        setTotal(data.meta.total)
        setHasMore(data.meta.hasMore)
      } catch (err) {
        console.error("Failed to fetch favorites:", err)
      }
    },
    [token],
  )

  // Load favorites when auth is ready
  useEffect(() => {
    if (authLoading || !token) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchFavorites(0).finally(() => setLoading(false))
  }, [authLoading, token, fetchFavorites])

  async function handleLoadMore() {
    setLoadingMore(true)
    await fetchFavorites(favorites.length)
    setLoadingMore(false)
  }

  async function handleUnfavorite(skillId: string) {
    if (!token) return
    // Optimistic remove
    setFavorites((prev) => prev.filter((f) => f.skillId !== skillId))
    setTotal((prev) => prev - 1)

    try {
      await fetch(`${API_BASE}/api/favorites/${encodeURIComponent(skillId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Revert on error
      fetchFavorites(0)
    }
  }

  async function handleInstall(source: string) {
    const results = await electronAPI.installSkill(source, [], "global")
    const hasError = results.some((r) => !r.success)
    if (hasError) {
      throw new Error(results.filter((r) => !r.success).map((r) => r.error).join(", "))
    }
    const installed = await electronAPI.listInstalled()
    setInstalledNames(new Set(installed.map((s) => s.name.toLowerCase())))
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  // Not signed in
  if (!user || !token) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Favorites</h2>
        <p className="text-[12px] text-muted mb-2">
          Your bookmarked skills for quick access.
        </p>
        <SignInPrompt onSignIn={signIn} />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Favorites</h2>
      <p className="text-[12px] text-muted mb-6">
        {total > 0
          ? `${total} favorited skill${total !== 1 ? "s" : ""}`
          : "Your bookmarked skills for quick access."}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 text-muted"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <p className="text-muted text-sm">No favorites yet.</p>
          <p className="text-muted text-[11px] mt-1">
            Star skills from the Discover tab to add them here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {favorites.map((skill) => (
              <FavoriteCard
                key={skill.skillId}
                skill={skill}
                isInstalled={installedNames.has(skill.name.toLowerCase())}
                onInstall={handleInstall}
                onUnfavorite={handleUnfavorite}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-lg text-[12px] font-medium border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
