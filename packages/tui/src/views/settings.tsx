import { useState, useCallback } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useDb } from "../db/context.js"
import { colors } from "../utils/colors.js"

interface SettingDef {
  key: string
  label: string
  type: "select" | "toggle"
  options?: string[]
  defaultValue: string | boolean
}

const SETTING_DEFS: SettingDef[] = [
  {
    key: "install.scope",
    label: "Default install scope",
    type: "select",
    options: ["global", "project"],
    defaultValue: "global",
  },
  {
    key: "install.method",
    label: "Default install method",
    type: "select",
    options: ["symlink", "copy"],
    defaultValue: "symlink",
  },
  {
    key: "ui.theme",
    label: "Theme",
    type: "select",
    options: ["dark", "light", "system"],
    defaultValue: "dark",
  },
  {
    key: "search.preferSemantic",
    label: "Prefer semantic search",
    type: "toggle",
    defaultValue: true,
  },
  {
    key: "telemetry.enabled",
    label: "Anonymous telemetry",
    type: "toggle",
    defaultValue: true,
  },
]

/**
 * Settings view: displays a list of key-value settings from SQLite.
 * Navigate with j/k, press Enter to toggle/cycle values.
 * Changes are saved immediately.
 */
export function SettingsView() {
  const state = useStore()
  const dispatch = useDispatch()
  const { settings } = useDb()

  const [selectedIndex, setSelectedIndex] = useState(0)
  // Force re-render after changes
  const [version, setVersion] = useState(0)

  const currentValues = SETTING_DEFS.map((def) => {
    const stored = settings.get(def.key, def.defaultValue)
    return stored
  })

  const handleToggle = useCallback((def: SettingDef, currentValue: unknown) => {
    if (def.type === "toggle") {
      const newVal = !currentValue
      settings.set(def.key, newVal)
      setVersion((v) => v + 1)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "info", message: `${def.label}: ${newVal ? "enabled" : "disabled"}` },
      })
    } else if (def.type === "select" && def.options) {
      const currentStr = String(currentValue)
      const idx = def.options.indexOf(currentStr)
      const nextIdx = (idx + 1) % def.options.length
      const newVal = def.options[nextIdx]
      settings.set(def.key, newVal)
      setVersion((v) => v + 1)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "info", message: `${def.label}: ${newVal}` },
      })
    }
  }, [settings, dispatch])

  useKeyboard((key) => {
    if (state.activeView !== "settings") return
    if (state.showHelp) return

    // j/k or arrow keys
    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      setSelectedIndex((i) => Math.max(0, i - 1))
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      setSelectedIndex((i) => Math.min(SETTING_DEFS.length - 1, i + 1))
    }

    // Enter to toggle/cycle
    if (key.name === "return") {
      const def = SETTING_DEFS[selectedIndex]
      if (def) {
        handleToggle(def, currentValues[selectedIndex])
      }
    }

    // Esc handled by layout
  })

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
      {/* Header */}
      <box
        style={{
          height: 1,
          width: "100%",
          paddingLeft: 1,
          backgroundColor: colors.bgAlt,
        }}
      >
        <text fg={colors.primary}>
          <strong>Settings</strong>
        </text>
      </box>

      <box style={{ flexDirection: "column", paddingLeft: 1, paddingRight: 1, paddingTop: 1 }}>
        {SETTING_DEFS.map((def, i) => {
          const val = currentValues[i]
          const isSelected = i === selectedIndex
          let displayValue: string

          if (def.type === "toggle") {
            displayValue = val ? "ON" : "OFF"
          } else {
            displayValue = String(val)
          }

          const valueColor = def.type === "toggle"
            ? (val ? colors.success : colors.error)
            : colors.secondary

          return (
            <box
              key={def.key}
              style={{
                width: "100%",
                height: 1,
                flexDirection: "row",
                paddingLeft: 1,
                backgroundColor: isSelected ? colors.bgAlt : "transparent",
              }}
            >
              <text fg={isSelected ? colors.primary : colors.text} style={{ width: 30 }}>
                {def.label}
              </text>
              <text fg={valueColor}>
                {"  "}{displayValue}
              </text>
              {isSelected && def.type === "select" ? (
                <text fg={colors.textDim}>
                  {"  "}(Enter to cycle: {def.options?.join(" > ")})
                </text>
              ) : null}
              {isSelected && def.type === "toggle" ? (
                <text fg={colors.textDim}>
                  {"  "}(Enter to toggle)
                </text>
              ) : null}
            </box>
          )
        })}
      </box>

      <box style={{ paddingLeft: 2, paddingTop: 1 }}>
        <text fg={colors.textDim}>j/k=navigate  Enter=change  Esc=back</text>
      </box>
    </box>
  )
}
