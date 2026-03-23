import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../lib/auth-store"
import { electronAPI } from "../lib/electron-api"

// ---------------------------------------------------------------------------
// Setting row components
// ---------------------------------------------------------------------------

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-[11px] text-muted">{description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 rounded bg-background border border-border text-[11px] text-foreground focus:outline-none focus:border-accent/40 transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SettingToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-[11px] text-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-foreground" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------

export function Settings() {
  const {
    user,
    loading: authLoading,
    signIn,
    signOut,
    exchangeCode,
  } = useAuthStore()
  const [code, setCode] = useState("")
  const [exchanging, setExchanging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SQLite-backed settings
  const [installScope, setInstallScope] = useState("global")
  const [installMethod, setInstallMethod] = useState("symlink")
  const [searchPreference, setSearchPreference] = useState("semantic")
  const [telemetryEnabled, setTelemetryEnabled] = useState(true)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      const all = await electronAPI.settingsAll()
      if (all["install.scope"]) setInstallScope(all["install.scope"] as string)
      if (all["install.method"])
        setInstallMethod(all["install.method"] as string)
      if (all["search.preferSemantic"] !== undefined)
        setSearchPreference(
          all["search.preferSemantic"] ? "semantic" : "keyword",
        )
      if (all["telemetry.enabled"] !== undefined)
        setTelemetryEnabled(all["telemetry.enabled"] as boolean)
    } catch (err) {
      console.error("Failed to load settings:", err)
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  async function saveSetting(key: string, value: unknown) {
    try {
      await electronAPI.settingsSet(key, value)
    } catch (err) {
      console.error("Failed to save setting:", err)
    }
  }

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
            {settingsLoaded ? (
              <>
                <SettingSelect
                  label="Default scope"
                  description="Where skills are installed by default"
                  value={installScope}
                  options={[
                    { value: "global", label: "Global" },
                    { value: "project", label: "Project" },
                  ]}
                  onChange={(v) => {
                    setInstallScope(v)
                    saveSetting("install.scope", v)
                  }}
                />
                <SettingSelect
                  label="Install method"
                  description="How skill files are placed in agent directories"
                  value={installMethod}
                  options={[
                    { value: "symlink", label: "Symlink" },
                    { value: "copy", label: "Copy" },
                  ]}
                  onChange={(v) => {
                    setInstallMethod(v)
                    saveSetting("install.method", v)
                  }}
                />
              </>
            ) : (
              <div className="p-3 rounded-lg border border-border bg-surface">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              </div>
            )}
          </div>
        </section>

        {/* Search preferences */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Search
          </h3>
          <div className="flex flex-col gap-3">
            {settingsLoaded && (
              <SettingSelect
                label="Search preference"
                description="Preferred search method for discovering skills"
                value={searchPreference}
                options={[
                  { value: "semantic", label: "Semantic" },
                  { value: "keyword", label: "Keyword" },
                ]}
                onChange={(v) => {
                  setSearchPreference(v)
                  saveSetting("search.preferSemantic", v === "semantic")
                }}
              />
            )}
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Privacy
          </h3>
          <div className="flex flex-col gap-3">
            {settingsLoaded && (
              <SettingToggle
                label="Telemetry"
                description="Send anonymous usage data to help improve SkillsGate"
                value={telemetryEnabled}
                onChange={(v) => {
                  setTelemetryEnabled(v)
                  saveSetting("telemetry.enabled", v)
                }}
              />
            )}
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
            <p className="text-sm text-foreground">
              SkillsGate Desktop v0.1.0
            </p>
            <p className="text-[11px] text-muted mt-1">
              Manage AI agent skills from your desktop.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
