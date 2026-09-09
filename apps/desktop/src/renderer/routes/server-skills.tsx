import { t } from "../lib/i18n"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { marked } from "marked"
import { electronAPI } from "../lib/electron-api"

// Configure marked for synchronous rendering
marked.setOptions({
  async: false,
  breaks: true,
  gfm: true,
})

function sanitizeHtml(html: string): string {
  let clean = html.replace(
    /<(script|iframe|object|embed|form|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
    ""
  )
  clean = clean.replace(/<(script|iframe|object|embed|link)\b[^>]*\/?>/gi, "")
  clean = clean.replace(
    /\s+on\w+\s*=\s*["']?[^"'>\s]*["']?/gi,
    ""
  )
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')
  clean = clean.replace(/src\s*=\s*["']?\s*javascript:/gi, 'src="')
  return clean
}

function renderMarkdown(raw: string): string {
  let content = raw
  if (content.startsWith("---")) {
    const endIdx = content.indexOf("---", 3)
    if (endIdx !== -1) {
      content = content.slice(endIdx + 3).trim()
    }
  }
  return sanitizeHtml(marked.parse(content) as string)
}

export function ServerSkills() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [skills, setSkills] = useState<RemoteSkill[]>([])
  const [servers, setServers] = useState<RemoteServer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<RemoteSkill | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const [skillsList, serversList] = await Promise.all([
          electronAPI.serversSkills(id),
          electronAPI.serversList(),
        ])
        setSkills(skillsList)
        setServers(serversList)
        setSelectedSkill((current) =>
          current
            ? skillsList.find((skill) => skill.id === current.id) ?? current
            : null,
        )
      } catch (err) {
        console.error("Failed to load server skills:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const server = servers.find((s) => s.id === id)
  const serverLabel = server?.label ?? "Server"

  useEffect(() => {
    setEditMode(false)
    setEditContent(selectedSkill?.content ?? "")
    setSaveState("idle")
  }, [selectedSkill?.id])

  async function handleSaveRemote() {
    if (!id || !selectedSkill) return
    setSaveState("saving")
    try {
      await electronAPI.serversWriteSkill(id, selectedSkill.remotePath, editContent)
      const next = { ...selectedSkill, content: editContent }
      setSelectedSkill(next)
      setSkills((prev) =>
        prev.map((skill) =>
          skill.id === selectedSkill.id ? { ...skill, content: editContent } : skill,
        ),
      )
      setSaveState("saved")
      setTimeout(() => {
        setEditMode(false)
        setSaveState("idle")
      }, 700)
    } catch (err) {
      console.error("Failed to save remote skill:", err)
      setSaveState("error")
    }
  }

  return (
    <div className="flex h-full">
      {/* Left: skill list */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-surface">
        {/* Header with back button */}
        <div className="px-4 py-4 border-b border-border">
          <button
            onClick={() => navigate("/servers")}
            className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors mb-2"
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t("Back to Servers")}
          </button>
          <h3 className="text-sm font-semibold text-foreground">
            {serverLabel}
          </h3>
          <p className="text-[10px] text-muted mt-0.5">
            {skills.length} remote skill{skills.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Skill list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[12px] text-muted animate-fade-in">
                {t("Loading skills...")}
              </p>
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted mb-3"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <p className="text-[12px] text-muted">
                {t("No skills found on this server.")}
              </p>
              <p className="text-[11px] text-muted mt-1">
                {t("Try syncing the server to discover skills.")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`flex flex-col items-start w-full px-3 py-2.5 rounded-md text-left transition-colors ${
                    selectedSkill?.id === skill.id
                      ? "bg-surface-hover text-foreground"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <span className="text-[12px] font-medium truncate w-full">
                    {skill.name}
                  </span>
                  {skill.description && (
                    <span className="text-[10px] text-muted truncate w-full mt-0.5">
                      {skill.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: skill detail */}
      <div className="flex-1 overflow-y-auto bg-background">
        {!selectedSkill ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted mx-auto"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <p className="text-muted text-sm mt-3">
                {t("Select a skill to view details")}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl px-8 py-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">
                  {selectedSkill.name}
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-muted border border-border">
                  remote
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditMode((value) => !value)}
                    className="rounded-md border border-border px-3 py-1.5 text-[12px] text-foreground hover:bg-surface-hover transition-colors"
                  >
                    {editMode ? "View" : "Edit"}
                  </button>
                  {editMode && (
                    <button
                      onClick={handleSaveRemote}
                      disabled={saveState === "saving"}
                      className="rounded-md bg-foreground px-3 py-1.5 text-[12px] text-background disabled:opacity-50"
                    >
                      {saveState === "saving" ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
              </div>
              {selectedSkill.description && (
                <p className="text-sm text-muted mb-3">
                  {selectedSkill.description}
                </p>
              )}
              <p className="text-[11px] text-muted font-mono">
                {selectedSkill.remotePath}
              </p>
            </div>

            <hr className="border-border mb-6" />

            {/* Content */}
            {editMode ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[420px] w-full rounded-lg border border-border bg-surface p-4 font-mono text-[13px] text-foreground focus:outline-none focus:border-accent"
                  spellCheck={false}
                />
                {saveState === "saved" && (
                  <p className="text-[12px] text-green-500">{t("Saved")}</p>
                )}
                {saveState === "error" && (
                  <p className="text-[12px] text-red-500">{t("Save failed")}</p>
                )}
              </div>
            ) : selectedSkill.content ? (
              <div
                className="skill-prose"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(selectedSkill.content),
                }}
              />
            ) : (
              <p className="text-sm text-muted">
                {t("Skill content not cached. Sync the server to fetch content.")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
