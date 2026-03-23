import { useState, useCallback } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useDb } from "../db/context.js"
import { testConnection, syncRemoteServer } from "../db/ssh.js"
import { colors } from "../utils/colors.js"

interface AddServerViewProps {
  editServerId: string | null
  onServerCountChange: (count: number) => void
}

type FieldName = "label" | "host" | "port" | "username" | "skillsBasePath" | "sshKeyPath"

const FIELDS: { name: FieldName; label: string; placeholder: string; defaultValue: string }[] = [
  { name: "label", label: "Label", placeholder: "e.g. prod-box", defaultValue: "" },
  { name: "host", label: "Host", placeholder: "e.g. 192.168.1.100 or dev.example.com", defaultValue: "" },
  { name: "port", label: "Port", placeholder: "22", defaultValue: "22" },
  { name: "username", label: "Username", placeholder: "e.g. sultan", defaultValue: "" },
  { name: "skillsBasePath", label: "Skills Base Path", placeholder: "~/.agents/skills", defaultValue: "~/.agents/skills" },
  { name: "sshKeyPath", label: "SSH Key Path (optional)", placeholder: "(auto-discover)", defaultValue: "" },
]

export function AddServerView({ editServerId, onServerCountChange }: AddServerViewProps) {
  const state = useStore()
  const dispatch = useDispatch()
  const { servers, skills } = useDb()

  // Load existing server data if editing
  const existingServer = editServerId ? servers.get(editServerId) : null
  const isEdit = !!existingServer

  const [values, setValues] = useState<Record<FieldName, string>>(() => {
    if (existingServer) {
      return {
        label: existingServer.label,
        host: existingServer.host,
        port: String(existingServer.port),
        username: existingServer.username,
        skillsBasePath: existingServer.skillsBasePath,
        sshKeyPath: existingServer.sshKeyPath ?? "",
      }
    }
    const initial: Record<FieldName, string> = {} as any
    for (const field of FIELDS) {
      initial[field.name] = field.defaultValue
    }
    return initial
  })

  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFieldChange = useCallback((fieldName: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    setError(null)

    // Validate required fields
    if (!values.label.trim()) {
      setError("Label is required")
      return
    }
    if (!values.host.trim()) {
      setError("Host is required")
      return
    }
    if (!values.username.trim()) {
      setError("Username is required")
      return
    }

    const port = parseInt(values.port || "22", 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      setError("Port must be between 1 and 65535")
      return
    }

    setSaving(true)

    try {
      if (isEdit && editServerId) {
        servers.update(editServerId, {
          label: values.label.trim(),
          host: values.host.trim(),
          port,
          username: values.username.trim(),
          skillsBasePath: values.skillsBasePath.trim() || "~/.agents/skills",
          sshKeyPath: values.sshKeyPath.trim() || null,
        })

        dispatch({
          type: "SHOW_NOTIFICATION",
          notification: { type: "success", message: `Updated "${values.label}"` },
        })
      } else {
        const newServer = servers.create({
          label: values.label.trim(),
          host: values.host.trim(),
          port,
          username: values.username.trim(),
          skillsBasePath: values.skillsBasePath.trim() || "~/.agents/skills",
          sshKeyPath: values.sshKeyPath.trim() || null,
        })

        dispatch({
          type: "SHOW_NOTIFICATION",
          notification: { type: "info", message: `Testing connection to ${values.host}...` },
        })

        // Auto-test and auto-sync after creating
        const testResult = await testConnection(newServer)
        if (testResult.ok) {
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "info", message: `Connected. Syncing skills from ${values.label}...` },
          })
          await syncRemoteServer(newServer, servers, skills)
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "success", message: `Added and synced "${values.label}"` },
          })
        } else {
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: {
              type: "error",
              message: `Added "${values.label}" but connection failed: ${testResult.error}`,
            },
          })
        }
      }

      onServerCountChange(servers.list().length)
      setSaving(false)
      dispatch({ type: "GO_BACK" })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setSaving(false)
      if (msg.includes("UNIQUE constraint")) {
        setError("A server with that host/port/username already exists")
      } else {
        setError(msg)
      }
    }
  }, [values, isEdit, editServerId, servers, skills, dispatch, onServerCountChange])

  // Navigate between fields with Tab / Shift+Tab, save with Ctrl+S
  useKeyboard((key) => {
    if (state.activeView !== "add-server" && state.activeView !== "edit-server") return
    if (state.showHelp) return

    // Esc to cancel handled by the layout

    // Tab to next field
    if (key.name === "tab" && !key.shift) {
      setFocusedFieldIndex((i) => Math.min(FIELDS.length - 1, i + 1))
      return
    }

    // Shift+Tab to previous field
    if (key.name === "tab" && key.shift) {
      setFocusedFieldIndex((i) => Math.max(0, i - 1))
      return
    }

    // Ctrl+S to save
    if (key.name === "s" && key.ctrl) {
      handleSave()
      return
    }
  })

  return (
    <box style={{ flexDirection: "column", padding: 2, flexGrow: 1 }}>
      {/* Title */}
      <text fg={colors.primary}>
        <strong>{isEdit ? "Edit Server" : "Add Remote Server"}</strong>
      </text>
      <text>{" "}</text>

      {/* Form fields */}
      {FIELDS.map((field, i) => (
        <box key={field.name} style={{ flexDirection: "column", marginBottom: 0 }}>
          <text fg={i === focusedFieldIndex ? colors.primary : colors.textDim}>
            {field.label}
          </text>
          <box
            style={{
              height: 3,
              width: 60,
              border: true,
              borderColor: i === focusedFieldIndex ? colors.primary : colors.border,
              paddingLeft: 1,
              paddingRight: 1,
            }}
          >
            <input
              placeholder={field.placeholder}
              focused={i === focusedFieldIndex && !state.showHelp && !saving}
              defaultValue={values[field.name]}
              onInput={(value: string) => handleFieldChange(field.name, value)}
              onSubmit={() => {
                // When pressing Enter on the last field, save
                if (i === FIELDS.length - 1) {
                  handleSave()
                } else {
                  setFocusedFieldIndex(i + 1)
                }
              }}
            />
          </box>
        </box>
      ))}

      {/* Error message */}
      {error ? (
        <>
          <text>{" "}</text>
          <text fg={colors.error}>{error}</text>
        </>
      ) : null}

      {/* Status / hints */}
      <text>{" "}</text>
      {saving ? (
        <text fg={colors.primary}>
          {isEdit ? "Saving..." : "Saving and testing connection..."}
        </text>
      ) : (
        <text fg={colors.textDim}>
          Tab=next field  Shift+Tab=prev  Ctrl+S=save  Esc=cancel
        </text>
      )}
    </box>
  )
}
