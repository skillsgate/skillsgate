import { LOCALES, changeLocale, getLocale, t, type Locale } from "../lib/i18n"
import { useState, useEffect, useCallback } from "react"
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
  // SQLite-backed settings
  const [installScope, setInstallScope] = useState("global")
  const [installMethod, setInstallMethod] = useState("symlink")
  const [searchPreference, setSearchPreference] = useState("semantic")
  const [telemetryEnabled, setTelemetryEnabled] = useState(true)
  const [customScanPaths, setCustomScanPaths] = useState<string[]>([])
  const [newScanPath, setNewScanPath] = useState("")
  const [defaultAgents, setDefaultAgents] = useState<string[]>([])
  const [mirrorAgents, setMirrorAgents] = useState<string[]>([])
  const [detectedAgents, setDetectedAgents] = useState<DetectedAgent[]>([])
  const [appVersion, setAppVersion] = useState("")
  const [updateState, setUpdateState] = useState<UpdateState | null>(null)
  const [checkingUpdates, setCheckingUpdates] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  // Locale lives in the i18n module, not in settingsAll(), because it must be
  // resolved before the first render. Seed from there.
  const [locale, setLocaleChoice] = useState<Locale>(getLocale())

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
      if (Array.isArray(all["scan.customPaths"]))
        setCustomScanPaths(all["scan.customPaths"] as string[])
      if (Array.isArray(all["install.defaultAgents"]))
        setDefaultAgents(all["install.defaultAgents"] as string[])
      if (Array.isArray(all["sync.mirrorAgents"]))
        setMirrorAgents(all["sync.mirrorAgents"] as string[])
    } catch (err) {
      console.error("Failed to load settings:", err)
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    electronAPI.detectAgents().then(setDetectedAgents).catch(() => {})
    electronAPI.appGetVersion().then(setAppVersion).catch(() => {})
    electronAPI.updatesGetState().then(setUpdateState).catch(() => {})
    const cleanup = electronAPI.onUpdateState((state) => {
      setUpdateState(state)
      setCheckingUpdates(state.status === "checking" || state.status === "downloading")
    })
    return cleanup
  }, [])

  async function saveSetting(key: string, value: unknown) {
    try {
      await electronAPI.settingsSet(key, value)
    } catch (err) {
      console.error("Failed to save setting:", err)
    }
  }

  function toggleAgentSelection(
    current: string[],
    setCurrent: (value: string[]) => void,
    key: "install.defaultAgents" | "sync.mirrorAgents",
    value: string,
  ) {
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setCurrent(next)
    saveSetting(key, next)
  }

  async function handleCheckUpdates() {
    setCheckingUpdates(true)
    try {
      const state = await electronAPI.updatesCheck()
      setUpdateState(state)
    } catch (err) {
      console.error("Failed to check updates:", err)
    } finally {
      setCheckingUpdates(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-foreground mb-1">{t("Settings")}</h2>
      <p className="text-[12px] text-muted mb-6">
        {t("Configure your SkillsGate Desktop preferences.")}
      </p>

      <div className="flex flex-col gap-6 max-w-lg">
        {/* Language */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("Language")}
          </h3>
          <SettingSelect
            label={t("Display language")}
            description={t(
              "Applies immediately. Untranslated text stays in English.",
            )}
            value={locale}
            options={LOCALES.map((entry) => ({
              value: entry.code,
              label: entry.label,
            }))}
            onChange={(v) => {
              setLocaleChoice(v as Locale)
              changeLocale(v as Locale)
            }}
          />
        </section>

        {/* Install preferences */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("Installation")}
          </h3>
          <div className="flex flex-col gap-3">
            {settingsLoaded ? (
              <>
                <SettingSelect
                  label={t("Default scope")}
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
                  label={t("Install method")}
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
            {t("Search")}
          </h3>
          <div className="flex flex-col gap-3">
            {settingsLoaded && (
              <SettingSelect
                label={t("Search preference")}
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
            {t("Privacy")}
          </h3>
          <div className="flex flex-col gap-3">
            {settingsLoaded && (
              <SettingToggle
                label={t("Telemetry")}
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

        {/* Updates */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("Updates")}
          </h3>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">{t("Desktop app updates")}</p>
                <p className="text-[11px] text-muted mt-1">
                  Version {appVersion || "unknown"}
                </p>
                <p className="text-[11px] text-muted mt-2">
                  {updateState?.message || "Check for updates from GitHub Releases."}
                </p>
                {updateState?.availableVersion && (
                  <p className="text-[11px] text-foreground mt-1">
                    Latest available: {updateState.availableVersion}
                  </p>
                )}
                {typeof updateState?.progressPercent === "number" && (
                  <p className="text-[11px] text-muted mt-1">
                    Download progress: {Math.round(updateState.progressPercent)}%
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCheckUpdates}
                  disabled={checkingUpdates}
                  className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-foreground hover:bg-surface-hover disabled:opacity-40"
                >
                  {checkingUpdates ? "Checking..." : "Check now"}
                </button>
                {updateState?.status === "downloaded" && (
                  <button
                    onClick={() => electronAPI.updatesInstall()}
                    className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-background"
                  >
                    {t("Restart to install")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Scan paths */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("Scan Paths")}
          </h3>
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm text-foreground mb-1">{t("Custom scan directories")}</p>
              <p className="text-[11px] text-muted mb-3">
                SkillsGate will scan direct skill folders and project-local tool paths inside these roots.
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newScanPath}
                  onChange={(e) => setNewScanPath(e.target.value)}
                  placeholder="~/projects or ~/my-skills"
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono"
                />
                <button
                  onClick={() => {
                    const value = newScanPath.trim()
                    if (!value || customScanPaths.includes(value)) return
                    const next = [...customScanPaths, value]
                    setCustomScanPaths(next)
                    setNewScanPath("")
                    saveSetting("scan.customPaths", next)
                  }}
                  className="px-3 py-2 rounded-lg bg-foreground text-background text-[12px] font-medium"
                >
                  {t("Add")}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {customScanPaths.length === 0 ? (
                  <p className="text-[11px] text-muted">{t("No custom scan paths configured.")}</p>
                ) : (
                  customScanPaths.map((scanPath) => (
                    <div key={scanPath} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <code className="text-[11px] text-foreground">{scanPath}</code>
                      <button
                        onClick={() => {
                          const next = customScanPaths.filter((item) => item !== scanPath)
                          setCustomScanPaths(next)
                          saveSetting("scan.customPaths", next)
                        }}
                        className="text-[11px] text-red-400 hover:text-red-300"
                      >
                        {t("Remove")}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Target defaults */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("Default Targets")}
          </h3>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-sm text-foreground mb-1">{t("Install targets")}</p>
            <p className="text-[11px] text-muted mb-3">
              These targets are used for installs and new local skill creation when no explicit target set is chosen.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {detectedAgents.map((agent) => (
                <label key={agent.name} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] text-foreground">
                  <input
                    type="checkbox"
                    checked={defaultAgents.includes(agent.name)}
                    onChange={() =>
                      toggleAgentSelection(defaultAgents, setDefaultAgents, "install.defaultAgents", agent.name)
                    }
                  />
                  <span>{agent.displayName}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Sync rules */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("Sync Rules")}
          </h3>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-sm text-foreground mb-1">{t("Mirror installs to additional targets")}</p>
            <p className="text-[11px] text-muted mb-3">
              Any skill installed or created in the desktop app will also be linked into these targets.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {detectedAgents.map((agent) => (
                <label key={agent.name} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] text-foreground">
                  <input
                    type="checkbox"
                    checked={mirrorAgents.includes(agent.name)}
                    onChange={() =>
                      toggleAgentSelection(mirrorAgents, setMirrorAgents, "sync.mirrorAgents", agent.name)
                    }
                  />
                  <span>{agent.displayName}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t("About")}</h3>
          <div className="p-3 rounded-lg border border-border bg-surface">
            <p className="text-sm text-foreground">
              SkillsGate Desktop v{appVersion || "0.1.6"}
            </p>
            <p className="text-[11px] text-muted mt-1">
              {t("Manage AI agent skills from your desktop.")}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
