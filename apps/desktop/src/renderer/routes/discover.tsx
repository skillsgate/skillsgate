import { useState, useEffect, useRef, useCallback } from "react"
import { marked } from "marked"
import { electronAPI } from "../lib/electron-api"
import { useAuthStore } from "../lib/auth-store"

type SearchMode = "keyword" | "semantic"

// ---------------------------------------------------------------------------
// API constants
// ---------------------------------------------------------------------------

const API_BASE = "https://api.skillsgate.ai"

// ---------------------------------------------------------------------------
// Types (mirrored from @skillsgate/ui for standalone usage)
// ---------------------------------------------------------------------------

interface CatalogSkill {
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
}

interface CatalogResponse {
  skills: CatalogSkill[]
  meta: { total: number; limit: number; offset: number; hasMore: boolean }
}

interface KeywordSearchResponse {
  skills: CatalogSkill[]
  meta: { total: number; limit: number; offset: number; hasMore: boolean }
}

interface SemanticSearchResponse {
  results: (CatalogSkill & { score: number })[]
  meta: { query: string; total: number; limit: number; remainingSearches: number }
}

interface SkillDetail {
  skillId: string
  slug: string
  name: string
  description: string
  summary: string
  categories: string[]
  capabilities: string[]
  keywords: string[]
  githubUrl: string
  githubRepo: string
  githubStars: number | null
  installCommand: string | null
  urlPath: string
  createdAt: string
  updatedAt: string
}

interface SkillDetailResponse {
  skill: SkillDetail
  content: string
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

// Configure marked for synchronous rendering
marked.setOptions({ async: false, breaks: true, gfm: true })

function renderMarkdown(raw: string): string {
  let content = raw
  if (content.startsWith("---")) {
    const endIdx = content.indexOf("---", 3)
    if (endIdx !== -1) {
      content = content.slice(endIdx + 3).trim()
    }
  }
  return marked.parse(content) as string
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-amber-400/70"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
  )
}

// ---------------------------------------------------------------------------
// Skill Card (catalog grid item)
// ---------------------------------------------------------------------------

interface SkillCardProps {
  skill: CatalogSkill
  onSelect: (skill: CatalogSkill) => void
  installedNames: Set<string>
}

function SkillCard({ skill, onSelect, installedNames }: SkillCardProps) {
  const isInstalled = installedNames.has(skill.name.toLowerCase())
  const displayText = skill.summary || skill.description

  return (
    <button
      onClick={() => onSelect(skill)}
      className="text-left w-full p-4 rounded-lg border border-border bg-surface hover:border-accent/30 hover:bg-surface-hover transition-all duration-200 group"
    >
      {/* Name + stars row */}
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="text-[13px] font-semibold text-foreground truncate">
          {skill.name}
        </h3>
        {isInstalled && (
          <span className="text-[9px] uppercase tracking-wider font-medium text-accent bg-surface-hover px-1.5 py-0.5 rounded flex-shrink-0">
            installed
          </span>
        )}
        {skill.githubStars != null && skill.githubStars > 0 && (
          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-muted ml-auto">
            <StarIcon />
            {formatStars(skill.githubStars)}
          </span>
        )}
      </div>

      {/* Description */}
      {displayText && (
        <p className="text-[12px] text-muted leading-relaxed line-clamp-2 mb-2.5">
          {displayText}
        </p>
      )}

      {/* Categories */}
      {skill.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="text-[9px] font-mono tracking-wider uppercase text-muted bg-surface-hover px-1.5 py-0.5 rounded"
            >
              {cat}
            </span>
          ))}
          {skill.categories.length > 3 && (
            <span className="text-[9px] font-mono text-muted">
              +{skill.categories.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Skill Detail Panel (slide-over from the right)
// ---------------------------------------------------------------------------

interface DetailPanelProps {
  skill: CatalogSkill
  onClose: () => void
  installedNames: Set<string>
  onInstall: (source: string) => Promise<void>
}

function DetailPanel({ skill, onClose, installedNames, onInstall }: DetailPanelProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(
    installedNames.has(skill.name.toLowerCase()),
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setContent(null)

    fetch(`${API_BASE}/api/v1/skills/detail?path=${encodeURIComponent(skill.urlPath)}`)
      .then((res) => res.json())
      .then((data: SkillDetailResponse) => {
        if (!cancelled) {
          setContent(data.content || null)
        }
      })
      .catch(() => {
        if (!cancelled) setContent(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [skill.urlPath])

  // Sync installed state when prop changes
  useEffect(() => {
    setInstalled(installedNames.has(skill.name.toLowerCase()))
  }, [installedNames, skill.name])

  async function handleInstall() {
    // Extract source from install command like "skillsgate add vercel/next.js --skill foo -y"
    // or fall back to githubUrl
    let source = ""
    if (skill.installCommand) {
      const parts = skill.installCommand.split(/\s+/)
      const addIdx = parts.indexOf("add")
      if (addIdx !== -1 && parts[addIdx + 1]) {
        source = parts[addIdx + 1]
      }
    }
    if (!source && skill.githubUrl) {
      // Extract owner/repo from GitHub URL
      try {
        const url = new URL(skill.githubUrl)
        const segments = url.pathname.split("/").filter(Boolean)
        if (segments.length >= 2) {
          source = `${segments[0]}/${segments[1]}`
        }
      } catch {}
    }
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

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-[560px] max-w-[90vw] flex flex-col bg-background border-l border-border overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <ArrowLeftIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">
              {skill.name}
            </h2>
          </div>
          {skill.githubUrl && (
            <a
              href={skill.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-muted hover:text-foreground transition-colors"
            >
              GitHub <ExternalLinkIcon />
            </a>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Meta */}
          <div className="mb-5">
            {skill.description && (
              <p className="text-sm text-muted mb-3">{skill.description}</p>
            )}

            <div className="flex items-center gap-3 mb-3">
              {skill.githubStars != null && skill.githubStars > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-muted">
                  <StarIcon /> {formatStars(skill.githubStars)} stars
                </span>
              )}
            </div>

            {skill.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skill.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] font-mono tracking-wider uppercase text-muted bg-surface-hover px-2 py-0.5 rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Install button */}
            <div className="flex items-center gap-3">
              {installed ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-surface-hover text-muted border border-border">
                  <CheckIcon /> Installed
                </span>
              ) : (
                <button
                  onClick={handleInstall}
                  disabled={installing || !skill.installCommand}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {installing ? (
                    <>
                      <SpinnerIcon /> Installing...
                    </>
                  ) : (
                    <>
                      <DownloadIcon /> Install
                    </>
                  )}
                </button>
              )}

              {skill.installCommand && (
                <code className="text-[11px] font-mono text-muted bg-surface px-2.5 py-1.5 rounded border border-border">
                  $ {skill.installCommand}
                </code>
              )}
            </div>
          </div>

          <hr className="border-border mb-5" />

          {/* Markdown content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <SpinnerIcon />
            </div>
          ) : content ? (
            <div
              className="skill-prose text-[13px]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <p className="text-sm text-muted">
              Skill content not available.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Discover (main export)
// ---------------------------------------------------------------------------

export function Discover() {
  const { token, user } = useAuthStore()
  const isAuthenticated = !!token

  const [skills, setSkills] = useState<CatalogSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword")
  const [remainingSearches, setRemainingSearches] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<CatalogSkill | null>(null)
  const [installedNames, setInstalledNames] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const LIMIT = 24

  // Load installed skills to mark installed state
  useEffect(() => {
    electronAPI.listInstalled().then((installed) => {
      const names = new Set(installed.map((s) => s.name.toLowerCase()))
      setInstalledNames(names)
    })
  }, [])

  // Initial catalog load
  useEffect(() => {
    fetchCatalog(0)
  }, [])

  async function fetchCatalog(newOffset: number) {
    if (newOffset === 0) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/skills?limit=${LIMIT}&offset=${newOffset}`,
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: CatalogResponse = await res.json()

      if (newOffset === 0) {
        setSkills(data.skills)
      } else {
        setSkills((prev) => [...prev, ...data.skills])
      }
      setOffset(newOffset + data.skills.length)
      setHasMore(data.meta.hasMore)
      setTotal(data.meta.total)
    } catch (err) {
      setError("Failed to load catalog. Check your connection.")
      console.error("Catalog fetch error:", err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function fetchSearch(query: string) {
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller
    setSearching(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/skills/search?q=${encodeURIComponent(query)}&limit=30`,
        { signal: controller.signal },
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: KeywordSearchResponse = await res.json()

      setSkills(data.skills)
      setHasMore(data.meta.hasMore)
      setTotal(data.meta.total)
      setOffset(data.skills.length)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setError("Search failed. Please try again.")
      console.error("Search error:", err)
    } finally {
      setSearching(false)
    }
  }

  async function fetchSemanticSearch(query: string) {
    if (!token) return
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller
    setSearching(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/v1/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, limit: 5 }),
        signal: controller.signal,
      })
      if (res.status === 429) {
        setError("Daily search limit reached. Switch to keyword search.")
        setRemainingSearches(0)
        return
      }
      if (res.status === 401) {
        setError("Session expired. Please sign in again.")
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: SemanticSearchResponse = await res.json()

      setSkills(data.results)
      setHasMore(false)
      setTotal(data.meta.total)
      setRemainingSearches(data.meta.remainingSearches)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setError("Semantic search failed. Please try again.")
      console.error("Semantic search error:", err)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    // Only update the input value -- actual search triggers on Enter
    if (!value.trim()) {
      setOffset(0)
      fetchCatalog(0)
    }
  }, [])

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return
    if (searchMode === "semantic" && token) {
      fetchSemanticSearch(searchQuery.trim())
    } else {
      fetchSearch(searchQuery.trim())
    }
  }, [searchQuery, searchMode, token])

  function handleLoadMore() {
    if (searchQuery.trim()) {
      // For search results, load next page
      fetchSearch(searchQuery.trim())
    } else {
      fetchCatalog(offset)
    }
  }

  async function handleInstall(source: string) {
    const results = await electronAPI.installSkill(source, [], "global")
    const hasError = results.some((r) => !r.success)
    if (hasError) {
      const errorMsg = results
        .filter((r) => !r.success)
        .map((r) => r.error)
        .join(", ")
      throw new Error(errorMsg)
    }

    // Refresh installed skills list
    const installed = await electronAPI.listInstalled()
    setInstalledNames(new Set(installed.map((s) => s.name.toLowerCase())))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-6 pb-4">
        <h2 className="text-xl font-bold text-foreground mb-1">Discover</h2>
        <p className="text-[12px] text-muted mb-5">
          Browse and search the SkillsGate catalog.{" "}
          {total > 0 && !searchQuery.trim() && (
            <span className="font-mono">{total} skills available</span>
          )}
        </p>

        {/* Search mode toggle + bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden text-[12px]">
            <button
              onClick={() => { setSearchMode("keyword") }}
              className={`px-3 py-1.5 transition-colors ${searchMode === "keyword" ? "bg-surface-hover text-foreground font-medium" : "text-muted hover:text-foreground"}`}
            >
              Keyword
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) return
                setSearchMode("semantic")
              }}
              className={`px-3 py-1.5 transition-colors ${searchMode === "semantic" ? "bg-surface-hover text-foreground font-medium" : "text-muted hover:text-foreground"} ${!isAuthenticated ? "opacity-40 cursor-not-allowed" : ""}`}
              title={!isAuthenticated ? "Sign in to use AI search" : "AI-powered semantic search"}
            >
              AI Search
            </button>
          </div>
          {searchMode === "semantic" && remainingSearches !== null && (
            <span className={`text-[11px] font-mono ${remainingSearches <= 5 ? "text-red-400" : "text-muted"}`}>
              {remainingSearches} search{remainingSearches !== 1 ? "es" : ""} remaining today
            </span>
          )}
          {!isAuthenticated && (
            <span className="text-[11px] text-muted">
              Sign in to unlock AI search
            </span>
          )}
        </div>

        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon size={15} />
          </div>
          <input
            type="text"
            placeholder={searchMode === "semantic" ? 'AI search -- try "audit website performance" (Enter to search)' : "Search by name, keyword, or category... (Enter to search)"}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit() }}
            className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-surface border border-border text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
          />
          {(searching || loading) && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <SpinnerIcon />
            </div>
          )}
          {searchQuery && !searching && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-foreground transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count when searching */}
        {searchQuery.trim() && !searching && (
          <p className="mt-2 text-[11px] text-muted font-mono">
            {skills.length} result{skills.length !== 1 ? "s" : ""} for "{searchQuery.trim()}"
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-8 pb-3">
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading && skills.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <SpinnerIcon />
              <p className="text-muted text-[12px] mt-3">
                Loading catalog...
              </p>
            </div>
          </div>
        ) : skills.length === 0 ? (
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-muted text-sm">
              No skills found{searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ""}.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.skillId}
                  skill={skill}
                  onSelect={setSelectedSkill}
                  installedNames={installedNames}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && !searchQuery.trim() && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 rounded-lg text-[12px] font-medium border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <SpinnerIcon /> Loading...
                    </span>
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail panel overlay */}
      {selectedSkill && (
        <DetailPanel
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          installedNames={installedNames}
          onInstall={handleInstall}
        />
      )}
    </div>
  )
}
