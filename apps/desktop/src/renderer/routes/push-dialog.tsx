import { t } from "../lib/i18n"
// apps/desktop/src/renderer/routes/push-dialog.tsx
import { useEffect, useState } from "react"

interface PushPlanEntry {
  folderName: string
  name: string
  remoteDir: string
  reason: "added" | "updated" | "deleted" | "unchanged"
}

interface LinkPlanEntry {
  tool: string
  remoteDir: string
  name: string
  folderName: string
  target: string
}

interface PushPreview {
  toAdd: PushPlanEntry[]
  toUpdate: PushPlanEntry[]
  toDelete: PushPlanEntry[]
  unchanged: PushPlanEntry[]
  mirror: boolean
  linksToAdd: LinkPlanEntry[]
  linksToRemove: LinkPlanEntry[]
  linkConflicts: LinkPlanEntry[]
  linksUnchanged: number
  toolsNotOnServer: string[]
}

interface PushResult {
  added: number
  updated: number
  deleted: number
  unchanged: number
  linksAdded: number
  linksRemoved: number
  errors: { folderName: string; message: string }[]
}

export type PushDialogMode = "push" | "mirror"

export function PushDialog({
  open,
  serverId,
  serverLabel,
  mode,
  onClose,
}: {
  open: boolean
  serverId: string | null
  serverLabel: string
  mode: PushDialogMode
  onClose: (result?: PushResult) => void
}) {
  const [stage, setStage] = useState<
    "previewing" | "review" | "applying" | "done" | "error"
  >("previewing")
  const [preview, setPreview] = useState<PushPreview | null>(null)
  const [result, setResult] = useState<PushResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const electronAPI = (window as any).electronAPI
  const isMirror = mode === "mirror"

  useEffect(() => {
    if (!open || !serverId) return
    let cancelled = false
    setStage("previewing")
    setPreview(null)
    setResult(null)
    setError(null)
    ;(async () => {
      try {
        const p = (await electronAPI.serversPushPreview(
          serverId,
          isMirror,
        )) as PushPreview
        if (cancelled) return
        setPreview(p)
        setStage("review")
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setStage("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, serverId, isMirror])

  if (!open || !serverId) return null

  async function handleApply() {
    if (!preview) return
    setStage("applying")
    setError(null)
    try {
      const r = (await electronAPI.serversPushApply(
        serverId,
        preview,
      )) as PushResult
      setResult(r)
      setStage("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStage("error")
    }
  }

  const linksToAdd = preview?.linksToAdd ?? []
  const linksToRemove = isMirror ? (preview?.linksToRemove ?? []) : []
  const linkConflicts = preview?.linkConflicts ?? []
  const toolsNotOnServer = preview?.toolsNotOnServer ?? []
  const removals = (isMirror ? (preview?.toDelete.length ?? 0) : 0) + linksToRemove.length
  const totalChanges =
    (preview?.toAdd.length ?? 0) +
    (preview?.toUpdate.length ?? 0) +
    (preview?.toDelete.length ?? 0) +
    linksToAdd.length +
    linksToRemove.length

  const title = isMirror ? `Mirror to ${serverLabel}` : `Push to ${serverLabel}`
  const subtitle = isMirror
    ? "Match this server one-to-one with your local skills and the tools each one is enabled for."
    : "Send your local skills and link them for the same tools. Adds and updates, never deletes."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose()}
      />
      <div className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-slide-down">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {stage === "previewing" && (
            <p className="text-[12px] text-muted">Computing diff…</p>
          )}

          {stage === "review" && preview && (
            <>
              <div className="text-[12px] text-foreground">
                <strong>{preview.toAdd.length}</strong> to add,{" "}
                <strong>{preview.toUpdate.length}</strong> to update,{" "}
                {isMirror && (
                  <>
                    <strong className="text-red-400">
                      {preview.toDelete.length}
                    </strong>{" "}
                    to delete,{" "}
                  </>
                )}
                <strong>{preview.unchanged.length}</strong> unchanged.
                <br />
                Tool links: <strong>{linksToAdd.length}</strong> to add,{" "}
                {isMirror && (
                  <>
                    <strong className="text-red-400">{linksToRemove.length}</strong> to
                    remove,{" "}
                  </>
                )}
                <strong>{preview.linksUnchanged ?? 0}</strong> already in place.
              </div>
              {totalChanges === 0 && (
                <p className="text-[12px] text-muted">
                  Nothing to {isMirror ? "mirror" : "push"} — the remote
                  already matches your local skills.
                </p>
              )}
              {(preview.toAdd.length > 0 ||
                preview.toUpdate.length > 0 ||
                preview.toDelete.length > 0 ||
                linksToAdd.length > 0 ||
                linksToRemove.length > 0) && (
                <ul className="text-[11px] font-mono flex flex-col gap-0.5 max-h-64 overflow-y-auto border border-border rounded-md p-2 bg-background">
                  {preview.toAdd.map((e) => (
                    <li
                      key={`add-${e.folderName}`}
                      className="text-green-400"
                    >
                      + {e.folderName}
                    </li>
                  ))}
                  {preview.toUpdate.map((e) => (
                    <li
                      key={`upd-${e.folderName}`}
                      className="text-yellow-400"
                    >
                      ~ {e.folderName}
                    </li>
                  ))}
                  {preview.toDelete.map((e) => (
                    <li key={`del-${e.folderName}`} className="text-red-400">
                      − {e.folderName}
                    </li>
                  ))}
                  {linksToAdd.map((e) => (
                    <li
                      key={`link-add-${e.remoteDir}-${e.name}`}
                      className="text-green-400"
                    >
                      + link {e.name} for {e.tool}
                    </li>
                  ))}
                  {linksToRemove.map((e) => (
                    <li
                      key={`link-del-${e.remoteDir}-${e.name}`}
                      className="text-red-400"
                    >
                      − link {e.name} for {e.tool}
                    </li>
                  ))}
                </ul>
              )}
              {linkConflicts.length > 0 && (
                <p className="text-[11px] text-muted">
                  Left alone because something else is already there:{" "}
                  {linkConflicts.map((e) => `${e.name} (${e.tool}, ${e.remoteDir})`).join(", ")}.
                </p>
              )}
              {toolsNotOnServer.length > 0 && (
                <p className="text-[11px] text-muted">
                  Not installed on this server, so their links are skipped:{" "}
                  {toolsNotOnServer.join(", ")}.
                </p>
              )}
              {isMirror && removals > 0 && (
                <p className="text-[11px] text-red-400">
                  Mirror mode will delete {preview.toDelete.length} skill
                  {preview.toDelete.length === 1 ? "" : "s"} and remove{" "}
                  {linksToRemove.length} tool link
                  {linksToRemove.length === 1 ? "" : "s"} on the remote.
                </p>
              )}
            </>
          )}

          {stage === "applying" && (
            <p className="text-[12px] text-muted">
              {isMirror ? "Mirroring to remote…" : "Pushing to remote…"}
            </p>
          )}

          {stage === "done" && result && (
            <div className="text-[12px] text-foreground flex flex-col gap-1">
              <p>
                {result.added} added, {result.updated} updated,{" "}
                {result.deleted} deleted, {result.unchanged} unchanged.
              </p>
              <p>
                Tool links: {result.linksAdded ?? 0} added
                {isMirror ? `, ${result.linksRemoved ?? 0} removed` : ""}.
              </p>
              {result.errors.length > 0 && (
                <ul className="text-red-400 mt-2 flex flex-col gap-0.5">
                  {result.errors.map((e) => (
                    <li key={e.folderName}>
                      {e.folderName}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {stage === "error" && (
            <p className="text-[12px] text-red-400">
              {error || "Operation failed"}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
          {(stage === "review" || stage === "error") && (
            <button
              onClick={() => onClose()}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-foreground hover:bg-background transition-colors"
            >
              {t("Cancel")}
            </button>
          )}

          {stage === "review" && totalChanges > 0 && (
            <button
              onClick={handleApply}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-opacity ${
                isMirror && removals > 0
                  ? "bg-red-500 text-white hover:opacity-90"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              {isMirror && removals > 0 ? `Mirror (remove ${removals})` : "Apply"}
            </button>
          )}

          {stage === "done" && (
            <button
              onClick={() => onClose(result ?? undefined)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              {t("Done")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
