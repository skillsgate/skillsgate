import { useState, useCallback, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useDb } from "../db/context.js"
import { ConfirmDialog } from "../components/confirm-dialog.js"
import { testConnection, syncRemoteServer } from "../db/ssh.js"
import { colors } from "../utils/colors.js"
import type { RemoteServer } from "../db/servers.js"

interface ServersViewProps {
  onServerCountChange: (count: number) => void
}

type PendingAction = {
  type: "delete" | "sync" | "test"
  server: RemoteServer
} | null

/**
 * Compute a human-readable relative time string from an ISO date string.
 */
function relativeTime(isoDate: string | null): string {
  if (!isoDate) return "never"
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ServersView({ onServerCountChange }: ServersViewProps) {
  const state = useStore()
  const dispatch = useDispatch()
  const { servers, skills } = useDb()

  const [serverList, setServerList] = useState<RemoteServer[]>(() => servers.list())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncLog, setSyncLog] = useState<string[] | null>(null)
  const [testing, setTesting] = useState(false)

  const refreshList = useCallback(() => {
    const list = servers.list()
    setServerList(list)
    onServerCountChange(list.length)
  }, [servers, onServerCountChange])

  // Refresh when coming back to this view
  useEffect(() => {
    refreshList()
  }, [])

  // Get skill counts for each server
  const skillCounts = new Map<string, number>()
  for (const srv of serverList) {
    skillCounts.set(srv.id, servers.skillCount(srv.id))
  }

  const selectedServer = serverList[selectedIndex] ?? null

  useKeyboard((key) => {
    if (state.activeView !== "servers") return
    if (state.showHelp) return
    if (pendingAction) return
    if (syncing || testing) return

    // j/k or arrow keys
    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      setSelectedIndex((i) => Math.max(0, i - 1))
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      setSelectedIndex((i) => Math.min(serverList.length - 1, i + 1))
    }

    // g = first, G = last
    if (key.name === "g" && !key.shift) {
      setSelectedIndex(0)
    }
    if (key.name === "g" && key.shift) {
      setSelectedIndex(Math.max(0, serverList.length - 1))
    }

    // a = add new server
    if (key.name === "a") {
      dispatch({ type: "NAVIGATE", view: "add-server" })
      return
    }

    // e = edit selected server
    if (key.name === "e" && selectedServer) {
      dispatch({ type: "SET_SELECTED_SERVER", serverId: selectedServer.id })
      dispatch({ type: "NAVIGATE", view: "edit-server" })
      return
    }

    // d = delete selected server (with confirm)
    if (key.name === "d" && selectedServer) {
      setPendingAction({ type: "delete", server: selectedServer })
      return
    }

    // t = test connection
    if (key.name === "t" && selectedServer) {
      handleTestConnection(selectedServer)
      return
    }

    // S = sync selected server
    if (key.name === "S" && selectedServer) {
      handleSync(selectedServer)
      return
    }

    // Enter = browse server's skills
    if (key.name === "return" && selectedServer) {
      const count = skillCounts.get(selectedServer.id) ?? 0
      if (count === 0 && !selectedServer.lastSyncAt) {
        dispatch({
          type: "SHOW_NOTIFICATION",
          notification: { type: "info", message: "Sync server first (S) to discover remote skills" },
        })
        return
      }
      dispatch({ type: "SET_SELECTED_SERVER", serverId: selectedServer.id })
      dispatch({ type: "NAVIGATE", view: "server-skills" })
      return
    }
  })

  const handleTestConnection = useCallback(async (server: RemoteServer) => {
    setTesting(true)
    dispatch({
      type: "SHOW_NOTIFICATION",
      notification: { type: "info", message: `Testing connection to ${server.host}...` },
    })

    const result = await testConnection(server)

    setTesting(false)
    if (result.ok) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "success", message: `Connection to ${server.host} successful` },
      })
    } else {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: `Connection failed: ${result.error}` },
      })
    }
  }, [dispatch])

  const handleSync = useCallback(async (server: RemoteServer) => {
    setSyncing(true)
    setSyncLog([`Connecting to ${server.username}@${server.host}...`])
    dispatch({
      type: "SHOW_NOTIFICATION",
      notification: { type: "info", message: `Syncing ${server.label}...` },
    })

    const result = await syncRemoteServer(server, servers, skills)

    setSyncLog(result.log)
    setSyncing(false)
    refreshList()

    if (result.total > 0 || result.removed > 0) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: {
          type: "success",
          message: `Synced ${server.label}: ${result.added} new, ${result.updated} updated, ${result.removed} removed`,
        },
      })
    } else if (result.log.some((l) => l.includes("failed"))) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: `Sync failed for ${server.label}` },
      })
    } else {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "info", message: `No skills found on ${server.label}` },
      })
    }
  }, [servers, skills, dispatch, refreshList])

  // Confirm dialog for delete
  if (pendingAction?.type === "delete") {
    return (
      <ConfirmDialog
        message={`Delete server "${pendingAction.server.label}"? This will remove all cached skills.`}
        onConfirm={() => {
          servers.delete(pendingAction.server.id)
          setPendingAction(null)
          refreshList()
          if (selectedIndex >= serverList.length - 1 && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
          }
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "success", message: `Deleted "${pendingAction.server.label}"` },
          })
        }}
        onCancel={() => setPendingAction(null)}
      />
    )
  }

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
      {/* Action bar */}
      <box
        style={{
          height: 1,
          width: "100%",
          paddingLeft: 1,
          backgroundColor: colors.bgAlt,
          flexDirection: "row",
        }}
      >
        <text fg={colors.textDim}>
          {serverList.length} server{serverList.length !== 1 ? "s" : ""}
          {"  "}
          {syncing ? "syncing..." : testing ? "testing..." : ""}
        </text>
      </box>

      {/* Two-column layout: server list (left) | detail/log (right) */}
      <box style={{ flexDirection: "row", flexGrow: 1, width: "100%" }}>
        {/* LEFT: Server list */}
        <box
          style={{
            width: "50%",
            borderRight: true,
            borderColor: colors.border,
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
            <text fg={colors.textDim}>SERVERS</text>
          </box>

          {/* Add server shortcut */}
          <box style={{ height: 1, paddingLeft: 1 }}>
            <text fg={colors.primary}>[+] Add Server (a)</text>
          </box>

          {serverList.length === 0 ? (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>
                No remote servers configured. Press 'a' to add one.
              </text>
            </box>
          ) : (
            <scrollbox
              focused={state.activeView === "servers" && !state.showHelp}
              style={{
                width: "100%",
                flexGrow: 1,
                rootOptions: { backgroundColor: colors.bg },
                viewportOptions: { backgroundColor: colors.bg },
                contentOptions: { backgroundColor: colors.bg },
                scrollbarOptions: {
                  trackOptions: {
                    foregroundColor: colors.primary,
                    backgroundColor: colors.border,
                  },
                },
              }}
            >
              {serverList.map((srv, i) => {
                const count = skillCounts.get(srv.id) ?? 0
                const hasError = !!srv.lastSyncError
                const neverSynced = !srv.lastSyncAt && !srv.lastSyncError
                const statusColor = hasError
                  ? colors.error
                  : neverSynced
                    ? colors.warning
                    : colors.success
                const statusChar = hasError ? "x" : neverSynced ? "?" : "o"
                const syncInfo = hasError
                  ? "error"
                  : srv.lastSyncAt
                    ? relativeTime(srv.lastSyncAt)
                    : "never"

                return (
                  <box
                    key={srv.id}
                    style={{
                      width: "100%",
                      paddingLeft: 1,
                      paddingRight: 1,
                      flexDirection: "row",
                      backgroundColor: i === selectedIndex ? colors.bgAlt : "transparent",
                    }}
                  >
                    <text fg={statusColor}>[{statusChar}]</text>
                    <text fg={i === selectedIndex ? colors.primary : colors.text}>
                      {" "}{srv.label}
                    </text>
                    <text fg={colors.textDim}>
                      {"  "}{srv.username}@{srv.host}
                    </text>
                    <text fg={colors.textDim}>
                      {"  "}{count > 0 ? `${count} skills` : "--"}
                    </text>
                    <text fg={colors.textDim}>
                      {"  "}{syncInfo}
                    </text>
                  </box>
                )
              })}
            </scrollbox>
          )}

          {/* Bottom shortcut hints */}
          <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
            <text fg={colors.textDim}>
              S=sync  Enter=browse  a=add  e=edit  d=delete  t=test
            </text>
          </box>
        </box>

        {/* RIGHT: Server detail / sync log */}
        <box style={{ flexGrow: 1, flexDirection: "column" }}>
          {syncLog ? (
            <SyncLogPanel log={syncLog} onDismiss={() => setSyncLog(null)} />
          ) : selectedServer ? (
            <ServerDetailPanel
              server={selectedServer}
              skillCount={skillCounts.get(selectedServer.id) ?? 0}
            />
          ) : (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>No server selected</text>
            </box>
          )}
        </box>
      </box>
    </box>
  )
}

// ---------- Server Detail Panel ----------

interface ServerDetailPanelProps {
  server: RemoteServer
  skillCount: number
}

function ServerDetailPanel({ server, skillCount }: ServerDetailPanelProps) {
  return (
    <box style={{ paddingLeft: 1, paddingRight: 1, paddingTop: 0, flexDirection: "column" }}>
      <text fg={colors.primary}>
        <strong>{server.label}</strong>
      </text>
      <text>{" "}</text>

      <text fg={colors.textDim}>Host</text>
      <text fg={colors.text}>  {server.host}:{server.port}</text>
      <text>{" "}</text>

      <text fg={colors.textDim}>Username</text>
      <text fg={colors.text}>  {server.username}</text>
      <text>{" "}</text>

      <text fg={colors.textDim}>Skills Base Path</text>
      <text fg={colors.text}>  {server.skillsBasePath}</text>
      <text>{" "}</text>

      <text fg={colors.textDim}>SSH Key</text>
      <text fg={colors.text}>  {server.sshKeyPath ?? "(auto-discover)"}</text>
      <text>{" "}</text>

      <text fg={colors.textDim}>Skills Cached</text>
      <text fg={colors.text}>  {skillCount}</text>
      <text>{" "}</text>

      <text fg={colors.textDim}>Last Sync</text>
      <text fg={colors.text}>  {server.lastSyncAt ? relativeTime(server.lastSyncAt) : "never"}</text>
      <text>{" "}</text>

      {server.lastSyncError ? (
        <>
          <text fg={colors.textDim}>Last Error</text>
          <text fg={colors.error}>  {server.lastSyncError}</text>
          <text>{" "}</text>
        </>
      ) : null}

      <text fg={colors.border}>---</text>
      <text fg={colors.textDim}>S=sync  t=test  e=edit  d=delete  Enter=browse skills</text>
    </box>
  )
}

// ---------- Sync Log Panel ----------

interface SyncLogPanelProps {
  log: string[]
  onDismiss: () => void
}

function SyncLogPanel({ log, onDismiss }: SyncLogPanelProps) {
  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "return") {
      onDismiss()
    }
  })

  return (
    <box
      style={{
        flexDirection: "column",
        flexGrow: 1,
        paddingLeft: 1,
        paddingRight: 1,
        border: true,
        borderColor: colors.primary,
      }}
      title="Sync Log"
    >
      {log.map((line, i) => (
        <text
          key={i}
          fg={
            line.includes("failed") || line.includes("Error")
              ? colors.error
              : line.includes("Synced:") || line.includes("Found")
                ? colors.success
                : colors.text
          }
        >
          {line}
        </text>
      ))}
      <text>{" "}</text>
      <text fg={colors.textDim}>Press Enter or Esc to dismiss</text>
    </box>
  )
}
