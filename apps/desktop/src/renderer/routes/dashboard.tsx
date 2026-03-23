import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../lib/auth-store"
import { electronAPI } from "../lib/electron-api"

// ---------------------------------------------------------------------------
// API constants
// ---------------------------------------------------------------------------

const API_BASE = "https://api.skillsgate.ai"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FavoritesResponse {
  favorites: unknown[]
  meta: { total: number; limit: number; offset: number; hasMore: boolean }
}

// ---------------------------------------------------------------------------
// Sign-in Prompt (shared pattern)
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
    <div className="flex flex-col items-center justify-center py-16 text-center">
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
        Sign in to view your dashboard
      </p>
      <p className="text-muted text-[12px] mb-6 max-w-sm">
        Your dashboard shows stats and quick actions for your SkillsGate account.
      </p>

      <button
        onClick={onSignIn}
        className="px-5 py-2.5 rounded-lg text-[13px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity mb-4"
      >
        Open sign-in page
      </button>

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
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="p-5 rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
          {label}
        </p>
        <span className="text-muted">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard (main export)
// ---------------------------------------------------------------------------

export function Dashboard() {
  const { user, token, loading: authLoading, signIn, signOut } = useAuthStore()
  const navigate = useNavigate()

  const [installedCount, setInstalledCount] = useState(0)
  const [agentCount, setAgentCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  // Load local stats (always available even without auth)
  useEffect(() => {
    Promise.all([
      electronAPI.listInstalled(),
      electronAPI.detectAgents(),
    ]).then(([skills, agents]) => {
      setInstalledCount(skills.length)
      setAgentCount(agents.length)
      if (!token) setStatsLoading(false)
    })
  }, [token])

  // Load favorites count when authenticated
  useEffect(() => {
    if (!token) return
    setStatsLoading(true)

    fetch(`${API_BASE}/api/favorites?limit=1&offset=0`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: FavoritesResponse) => {
        setFavoritesCount(data.meta.total)
      })
      .catch(() => {
        setFavoritesCount(0)
      })
      .finally(() => {
        setStatsLoading(false)
      })
  }, [token])

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Dashboard</h2>
          {user && (
            <p className="text-[12px] text-muted">
              Signed in as{" "}
              <span className="text-foreground font-medium">{user.name}</span>{" "}
              ({user.email})
            </p>
          )}
        </div>
        {user && (
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            Sign out
          </button>
        )}
      </div>

      {!user ? (
        <SignInPrompt onSignIn={signIn} />
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Installed Skills"
              value={statsLoading ? "--" : installedCount}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              }
            />
            <StatCard
              label="Detected Agents"
              value={statsLoading ? "--" : agentCount}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              }
            />
            <StatCard
              label="Favorites"
              value={statsLoading ? "--" : favoritesCount}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
            />
            <StatCard
              label="Account"
              value={user.name.split(" ")[0]}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
          </div>

          {/* Quick actions */}
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/discover")}
              className="p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted group-hover:text-foreground transition-colors"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-[13px] font-medium text-foreground">
                  Discover Skills
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Browse and install skills from the catalog.
              </p>
            </button>

            <button
              onClick={() => navigate("/favorites")}
              className="p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted group-hover:text-foreground transition-colors"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-[13px] font-medium text-foreground">
                  View Favorites
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Manage your bookmarked skills.
              </p>
            </button>

            <button
              onClick={() => navigate("/")}
              className="p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted group-hover:text-foreground transition-colors"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="text-[13px] font-medium text-foreground">
                  Installed Skills
                </span>
              </div>
              <p className="text-[11px] text-muted">
                View and manage your locally installed skills.
              </p>
            </button>
          </div>

          {/* Recent activity placeholder */}
          <h3 className="text-sm font-semibold text-foreground mt-8 mb-3">
            Recent Activity
          </h3>
          <div className="p-5 rounded-lg border border-border bg-surface">
            <p className="text-[12px] text-muted text-center">
              Activity tracking will be available in a future update.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
