import { t } from "../lib/i18n"
import { useEffect, useState } from "react"
import { electronAPI } from "../lib/electron-api"

export function ScanSources() {
  const [paths, setPaths] = useState<string[]>([])
  const [newPath, setNewPath] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    electronAPI
      .settingsAll()
      .then((settings) => {
        setPaths((settings["scan.customPaths"] as string[]) || [])
      })
      .catch(() => {
        setPaths([])
      })
  }, [])

  async function persist(next: string[]) {
    setSaving(true)
    try {
      await electronAPI.settingsSet("scan.customPaths", next)
      setPaths(next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-1">{t("Scan Sources")}</h2>
          <p className="text-[12px] text-muted">
            Add folders that SkillsGate should crawl for direct skill bundles and project-local tool skill directories.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div>
              <h3 className="text-[13px] font-semibold text-foreground mb-2">
                {t("Bring Your Own Skill Folders")}
              </h3>
              <p className="text-[12px] text-muted leading-relaxed mb-4">
                Point SkillsGate at places like `~/projects`, `~/workspaces`, or `~/my-skills`. It will discover:
              </p>
              <div className="flex flex-col gap-2 text-[12px] text-foreground">
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  Direct skill folders:
                  <code className="ml-2 text-muted">~/my-skills/example/SKILL.md</code>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  Project-local tool paths:
                  <code className="ml-2 text-muted">~/projects/app/.claude/skills/foo/SKILL.md</code>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] uppercase tracking-widest text-muted mb-2">
                {t("Current Coverage")}
              </p>
              <div className="flex flex-col gap-2">
                <div className="rounded-md border border-border px-3 py-2 text-[12px] text-foreground">
                  {paths.length} custom scan source{paths.length === 1 ? "" : "s"}
                </div>
                <div className="rounded-md border border-border px-3 py-2 text-[12px] text-foreground">
                  {t("Global installs still scanned automatically")}
                </div>
                <div className="rounded-md border border-border px-3 py-2 text-[12px] text-foreground">
                  {t("Project-local paths discovered under each root")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-[13px] font-semibold text-foreground">
                {t("Custom Roots")}
              </h3>
              <p className="text-[12px] text-muted">
                {t("Add and remove folders to include in local skill discovery.")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="~/projects or ~/my-skills"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-[12px] text-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPath.trim()) {
                  const value = newPath.trim()
                  if (!paths.includes(value)) {
                    void persist([...paths, value])
                  }
                  setNewPath("")
                }
              }}
            />
            <button
              onClick={() => {
                const value = newPath.trim()
                if (!value || paths.includes(value)) return
                void persist([...paths, value])
                setNewPath("")
              }}
              disabled={saving}
              className="rounded-lg bg-foreground px-4 py-2 text-[12px] font-medium text-background disabled:opacity-40"
            >
              {t("Add Root")}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {paths.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                <p className="text-[12px] text-muted">
                  No custom roots yet. Add one above to start discovering extra local skills.
                </p>
              </div>
            ) : (
              paths.map((scanPath) => (
                <div
                  key={scanPath}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <code className="block text-[12px] text-foreground">{scanPath}</code>
                    <p className="text-[11px] text-muted mt-1">
                      Direct skills and project-local tool paths under this root will be discovered.
                    </p>
                  </div>
                  <button
                    onClick={() => void persist(paths.filter((item) => item !== scanPath))}
                    className="rounded-md border border-border px-3 py-1.5 text-[11px] text-red-400 hover:text-red-300 hover:bg-surface"
                  >
                    {t("Remove")}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
