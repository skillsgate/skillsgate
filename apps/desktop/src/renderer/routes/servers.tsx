import { t } from "../lib/i18n"
import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { electronAPI } from "../lib/electron-api"
import { PushDialog, type PushDialogMode } from "./push-dialog"
import { ManagePopover } from "../components/manage-popover"
import {
  computeServerStatus,
  type DotColor,
  type LocalSkillForStatus,
  type RemoteSkillForStatus,
} from "../lib/server-status"

// ---------------------------------------------------------------------------
// SHA-256 helper (Web Crypto, renderer-side)
// ---------------------------------------------------------------------------

async function sha256Hex(s: string): Promise<string> {
  const enc = new TextEncoder().encode(s)
  const buf = await crypto.subtle.digest("SHA-256", enc)
  const bytes = new Uint8Array(buf)
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0")
  }
  return out
}

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(isoString: string | null): string {
  if (!isoString) return "never"
  const now = Date.now()
  const then = new Date(isoString + "Z").getTime() // SQLite datetime is UTC
  const diff = now - then
  if (diff < 0) return "just now"
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return "just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ---------------------------------------------------------------------------
// Status dot
// ---------------------------------------------------------------------------

function StatusDot({
  server,
  syncing,
}: {
  server: RemoteServer
  syncing: boolean
}) {
  if (syncing) {
    return (
      <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block flex-shrink-0" />
    )
  }
  if (server.lastSyncError) {
    return (
      <span
        className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block flex-shrink-0"
        title={server.lastSyncError}
      />
    )
  }
  if (server.lastSyncAt) {
    return (
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block flex-shrink-0" />
    )
  }
  return (
    <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block flex-shrink-0" />
  )
}

// ---------------------------------------------------------------------------
// Add/Edit Server Dialog
// ---------------------------------------------------------------------------

interface ServerFormData {
  label: string
  host: string
  port: string
  username: string
  skillsBasePath: string
  sshKeyPath: string
}

const emptyForm: ServerFormData = {
  label: "",
  host: "",
  port: "22",
  username: "",
  skillsBasePath: "~/.agents/skills",
  sshKeyPath: "",
}

function ServerDialog({
  open,
  editingServer,
  onClose,
  onSave,
}: {
  open: boolean
  editingServer: RemoteServer | null
  onClose: () => void
  onSave: (data: ServerFormData) => void
}) {
  const [form, setForm] = useState<ServerFormData>(emptyForm)

  useEffect(() => {
    if (editingServer) {
      setForm({
        label: editingServer.label,
        host: editingServer.host,
        port: String(editingServer.port),
        username: editingServer.username,
        skillsBasePath: editingServer.skillsBasePath,
        sshKeyPath: editingServer.sshKeyPath ?? "",
      })
    } else {
      setForm(emptyForm)
    }
  }, [editingServer, open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  const isValid = form.label.trim() && form.host.trim() && form.username.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 animate-slide-down">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            {editingServer ? "Edit Server" : "Add Server"}
          </h3>
          <p className="text-[11px] text-muted mt-0.5">
            {t("Configure an SSH connection to discover remote skills.")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Label */}
          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1.5">
              {t("Label")}
            </label>
            <input
              type="text"
              placeholder="e.g. prod-box"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Host + Port */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-foreground mb-1.5">
                {t("Host")}
              </label>
              <input
                type="text"
                placeholder="192.168.1.100 or hostname"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            <div className="w-20">
              <label className="block text-[12px] font-medium text-foreground mb-1.5">
                {t("Port")}
              </label>
              <input
                type="text"
                placeholder="22"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1.5">
              {t("Username")}
            </label>
            <input
              type="text"
              placeholder="e.g. sultan"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Skills Base Path */}
          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1.5">
              {t("Skills Base Path")}
            </label>
            <input
              type="text"
              placeholder="~/.agents/skills"
              value={form.skillsBasePath}
              onChange={(e) =>
                setForm({ ...form, skillsBasePath: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono"
            />
          </div>

          {/* SSH Key Path */}
          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1.5">
              {t("SSH Key Path")}
              <span className="font-normal text-muted ml-1">(optional)</span>
            </label>
            <input
              type="text"
              placeholder={t("Auto-discover (id_ed25519, id_rsa, ...)")}
              value={form.sshKeyPath}
              onChange={(e) =>
                setForm({ ...form, sshKeyPath: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[12px] font-medium border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {editingServer ? "Save Changes" : "Add Server"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Servers page
// ---------------------------------------------------------------------------

export function Servers() {
  const navigate = useNavigate()
  const [servers, setServers] = useState<RemoteServer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingServer, setEditingServer] = useState<RemoteServer | null>(null)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set())
  const [testResults, setTestResults] = useState<
    Record<string, { ok: boolean; error?: string }>
  >({})
  const [syncResults, setSyncResults] = useState<
    Record<
      string,
      { ok: boolean; added?: number; updated?: number; removed?: number; unchanged?: number; error?: string }
    >
  >({})
  const [pushTarget, setPushTarget] = useState<RemoteServer | null>(null)
  const [pushMode, setPushMode] = useState<PushDialogMode>("push")
  const [manageOpenFor, setManageOpenFor] = useState<string | null>(null)
  const manageAnchorRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [localSkills, setLocalSkills] = useState<LocalSkillForStatus[]>([])
  const [remoteSkillsByServer, setRemoteSkillsByServer] = useState<
    Record<string, RemoteSkillForStatus[]>
  >({})

  const loadServers = useCallback(async () => {
    try {
      const list = await electronAPI.serversList()
      setServers(list)
    } catch (err) {
      console.error("Failed to load servers:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServers()
  }, [loadServers])

  // Load + hash local canonical skills once for status hints.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = (await electronAPI.listInstalled()) as Array<{
          canonicalPath: string
          scope: string
        }>
        const canonical = list.filter(
          (s) => s.scope === "global" && s.canonicalPath,
        )
        const hashed: LocalSkillForStatus[] = []
        for (const s of canonical) {
          try {
            const content = (await electronAPI.readSkillContent(
              `${s.canonicalPath}/SKILL.md`,
            )) as string
            const folderName =
              s.canonicalPath.split("/").filter(Boolean).pop() ?? ""
            if (!folderName) continue
            const hash = await sha256Hex(content)
            hashed.push({ folderName, contentHash: hash })
          } catch {
            // Skip skills whose SKILL.md can't be read.
          }
        }
        if (!cancelled) setLocalSkills(hashed)
      } catch {
        // Non-fatal — status hints will fall back to "in sync".
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Refresh per-server cached remote skills whenever the server list reloads.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next: Record<string, RemoteSkillForStatus[]> = {}
      for (const s of servers) {
        try {
          const rows = (await electronAPI.serversSkills(s.id)) as Array<{
            remotePath: string
            contentHash: string | null
          }>
          next[s.id] = rows.map((r) => ({
            remotePath: r.remotePath,
            contentHash: r.contentHash,
          }))
        } catch {
          next[s.id] = []
        }
      }
      if (!cancelled) setRemoteSkillsByServer(next)
    })()
    return () => {
      cancelled = true
    }
  }, [servers])

  async function handleSave(form: ServerFormData) {
    const data = {
      label: form.label.trim(),
      host: form.host.trim(),
      port: parseInt(form.port, 10) || 22,
      username: form.username.trim(),
      skillsBasePath: form.skillsBasePath.trim() || "~/.agents/skills",
      sshKeyPath: form.sshKeyPath.trim() || null,
    }

    if (editingServer) {
      await electronAPI.serversUpdate(editingServer.id, data)
    } else {
      await electronAPI.serversCreate(data)
    }

    setDialogOpen(false)
    setEditingServer(null)
    await loadServers()
  }

  async function handleDelete(id: string) {
    await electronAPI.serversDelete(id)
    await loadServers()
  }

  async function handleTest(id: string) {
    setTestingIds((prev) => new Set([...prev, id]))
    setTestResults((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const result = await electronAPI.serversTest(id)
      setTestResults((prev) => ({ ...prev, [id]: result }))
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [id]: { ok: false, error: "Test failed unexpectedly" },
      }))
    } finally {
      setTestingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  async function handleSync(id: string) {
    setSyncingIds((prev) => new Set([...prev, id]))
    setSyncResults((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    try {
      const result = (await electronAPI.serversSync(id)) as {
        added: number
        updated: number
        removed: number
        unchanged: number
        error?: string
      }
      setSyncResults((prev) => ({
        ...prev,
        [id]: result.error
          ? { ok: false, error: result.error }
          : {
              ok: true,
              added: result.added,
              updated: result.updated,
              removed: result.removed,
              unchanged: result.unchanged,
            },
      }))
      await loadServers()
    } catch (err) {
      setSyncResults((prev) => ({
        ...prev,
        [id]: {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        },
      }))
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  function openAdd() {
    setEditingServer(null)
    setDialogOpen(true)
  }

  function openEdit(server: RemoteServer) {
    setEditingServer(server)
    setDialogOpen(true)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-foreground">{t("Remote Servers")}</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("Add Server")}
        </button>
      </div>
      <p className="text-[12px] text-muted mb-6">
        {t("Connect to remote machines via SSH to discover and sync skills.")}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[12px] text-muted animate-fade-in">
            {t("Loading servers...")}
          </p>
        </div>
      ) : servers.length === 0 ? (
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
            className="text-muted mb-4"
          >
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
          <p className="text-sm text-muted">{t("No servers configured.")}</p>
          <p className="text-[11px] text-muted mt-1">
            {t("Add a server to discover skills from remote machines.")}
          </p>
          <button
            onClick={openAdd}
            className="mt-4 px-4 py-2 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            {t("Add your first server")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-2xl">
          {servers.map((server) => {
            const isSyncing = syncingIds.has(server.id)
            const isTesting = testingIds.has(server.id)
            const testResult = testResults[server.id]
            const syncResult = syncResults[server.id]

            return (
              <div
                key={server.id}
                className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors group"
              >
                <div className="flex items-center gap-4">
                {/* Status dot */}
                <StatusDot server={server} syncing={isSyncing} />

                {/* Server info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {server.label}
                    </span>
                    <span className="text-[11px] text-muted font-mono">
                      {server.username}@{server.host}
                      {server.port !== 22 ? `:${server.port}` : ""}
                    </span>
                  </div>
                  {(() => {
                    const status = computeServerStatus(
                      server,
                      localSkills,
                      remoteSkillsByServer[server.id] ?? [],
                    )
                    const dotClass: Record<DotColor, string> = {
                      green: "text-emerald-400",
                      amber: "text-amber-400",
                      red: "text-red-400",
                      grey: "text-muted",
                    }
                    return (
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-[11px] ${dotClass[status.dotColor]}`}>
                          {status.text}
                        </span>
                        <span className="text-[10px] text-muted">
                          {server.lastSyncAt ? relativeTime(server.lastSyncAt) : ""}
                        </span>
                        {testResult && (
                          <span
                            className={`text-[10px] ${testResult.ok ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {testResult.ok
                              ? "Connection OK"
                              : `Failed: ${testResult.error}`}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/servers/${server.id}/skills`)}
                    title={t("Browse skills")}
                    className="px-2 py-1.5 rounded-md text-[11px] font-medium text-muted hover:text-foreground hover:bg-background transition-colors"
                  >
                    {t("Browse")}
                  </button>
                  <button
                    onClick={() => handleTest(server.id)}
                    disabled={isTesting}
                    title={t("Test connection")}
                    className="px-2 py-1.5 rounded-md text-[11px] font-medium text-muted hover:text-foreground hover:bg-background transition-colors disabled:opacity-40"
                  >
                    {isTesting ? "..." : "Test"}
                  </button>
                  <button
                    ref={(el) => {
                      manageAnchorRefs.current[server.id] = el
                    }}
                    onClick={() =>
                      setManageOpenFor((prev) => (prev === server.id ? null : server.id))
                    }
                    disabled={isSyncing}
                    title={t("Manage this server")}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-border text-foreground hover:bg-background transition-colors disabled:opacity-40"
                  >
                    {isSyncing ? "Syncing..." : "Manage ▾"}
                  </button>
                  <button
                    onClick={() => openEdit(server)}
                    title={t("Edit server")}
                    className="px-2 py-1.5 rounded-md text-[11px] font-medium text-muted hover:text-foreground hover:bg-background transition-colors"
                  >
                    {t("Edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(server.id)}
                    title={t("Delete server")}
                    className="px-2 py-1.5 rounded-md text-[11px] font-medium text-red-400 hover:text-red-300 hover:bg-background transition-colors"
                  >
                    {t("Delete")}
                  </button>
                </div>
                </div>

                {/* Sync result / last error banner */}
                {syncResult && syncResult.ok && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                    <span className="font-medium">Sync complete:</span>
                    <span>
                      {syncResult.added} new, {syncResult.updated} updated,{" "}
                      {syncResult.removed} removed, {syncResult.unchanged} unchanged
                    </span>
                  </div>
                )}
                {syncResult && !syncResult.ok && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 break-words">
                    <span className="font-medium flex-shrink-0">Sync failed:</span>
                    <span className="font-mono break-all">
                      {syncResult.error || "Unknown error"}
                    </span>
                  </div>
                )}
                {!syncResult && server.lastSyncError && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 break-words">
                    <span className="font-medium flex-shrink-0">Last error:</span>
                    <span className="font-mono break-all">
                      {server.lastSyncError}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ServerDialog
        open={dialogOpen}
        editingServer={editingServer}
        onClose={() => {
          setDialogOpen(false)
          setEditingServer(null)
        }}
        onSave={handleSave}
      />
      {servers.map((server) => (
        <ManagePopover
          key={server.id}
          open={manageOpenFor === server.id}
          anchorEl={manageAnchorRefs.current[server.id] ?? null}
          onRefresh={() => handleSync(server.id)}
          onPush={() => {
            setPushMode("push")
            setPushTarget(server)
          }}
          onMirror={() => {
            setPushMode("mirror")
            setPushTarget(server)
          }}
          onClose={() => setManageOpenFor(null)}
        />
      ))}
      <PushDialog
        open={pushTarget !== null}
        serverId={pushTarget?.id ?? null}
        serverLabel={pushTarget?.label ?? ""}
        mode={pushMode}
        onClose={() => {
          setPushTarget(null)
          loadServers()
        }}
      />
    </div>
  )
}
