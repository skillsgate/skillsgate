import { useState } from "react"
import { useAuthStore } from "../lib/auth-store"

export function Settings() {
  const { user, loading: authLoading, signIn, signOut, exchangeCode } = useAuthStore()
  const [code, setCode] = useState("")
  const [exchanging, setExchanging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExchange() {
    if (!code.trim()) return
    setExchanging(true)
    setError(null)
    try {
      await exchangeCode(code.trim())
      setCode("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code")
    } finally {
      setExchanging(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Settings</h2>
      <p className="text-[12px] text-muted mb-6">
        Configure your SkillsGate Desktop preferences.
      </p>

      <div className="flex flex-col gap-6 max-w-lg">
        {/* Install preferences */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Installation
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
              <div>
                <p className="text-sm text-foreground">Default scope</p>
                <p className="text-[11px] text-muted">
                  Where skills are installed by default
                </p>
              </div>
              <span className="text-[11px] text-muted px-2 py-1 rounded bg-surface-hover">
                Global
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
              <div>
                <p className="text-sm text-foreground">Install method</p>
                <p className="text-[11px] text-muted">
                  How skill files are placed in agent directories
                </p>
              </div>
              <span className="text-[11px] text-muted px-2 py-1 rounded bg-surface-hover">
                Symlink
              </span>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Account
          </h3>
          {authLoading ? (
            <div className="p-3 rounded-lg border border-border bg-surface">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
            </div>
          ) : user ? (
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="flex items-center gap-3 mb-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-sm font-medium text-muted">
                    {user.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-muted">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-border bg-surface">
              <p className="text-sm text-muted mb-3">
                Not signed in. Sign in to sync favorites and access your
                dashboard.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={signIn}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity w-fit"
                >
                  Open sign-in page
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Paste code (XXXX-XXXX)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleExchange()}
                    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono tracking-wider"
                  />
                  <button
                    onClick={handleExchange}
                    disabled={exchanging || !code.trim()}
                    className="px-4 py-2 rounded-lg text-[12px] font-medium border border-border text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
                  >
                    {exchanging ? "..." : "Verify"}
                  </button>
                </div>
                {error && (
                  <p className="text-[11px] text-red-400">{error}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">About</h3>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <p className="text-sm text-foreground">SkillsGate Desktop v0.1.0</p>
            <p className="text-[11px] text-muted mt-1">
              Manage AI agent skills from your desktop.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
