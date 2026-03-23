import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useDetectedAgents } from "../data/use-agents.js"
import { useInstalledSkills } from "../data/use-installed-skills.js"
import { StatusBar } from "./status-bar.js"
import { HomeView } from "../views/home.js"
import { colors } from "../utils/colors.js"
import type { ViewName } from "../store/types.js"

const TAB_OPTIONS = [
  { name: "Installed", description: "Locally installed skills", value: "home" },
  { name: "Discover", description: "Search the registry", value: "discover" },
  { name: "Favorites", description: "Your starred skills", value: "favorites" },
]

export function Layout() {
  const state = useStore()
  const dispatch = useDispatch()
  const { width, height } = useTerminalDimensions()

  // Load agent + skill data on mount
  useDetectedAgents()
  useInstalledSkills()

  // Keyboard shortcuts for tab switching
  useKeyboard((key) => {
    if (key.name === "1") dispatch({ type: "NAVIGATE", view: "home" })
    if (key.name === "2") dispatch({ type: "NAVIGATE", view: "discover" })
    if (key.name === "3") dispatch({ type: "NAVIGATE", view: "favorites" })
    if (key.name === "q" && key.ctrl) process.exit(0)
  })

  const activeTabIndex = TAB_OPTIONS.findIndex(
    (t) => t.value === state.activeView
  )

  return (
    <box
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        backgroundColor: colors.bg,
      }}
    >
      {/* Header */}
      <box
        style={{
          height: 1,
          width: "100%",
          backgroundColor: colors.header,
          flexDirection: "row",
          paddingLeft: 1,
          paddingRight: 1,
          justifyContent: "space-between",
        }}
      >
        <text fg={colors.primary}>
          <strong>SkillsGate TUI</strong> <span fg={colors.textDim}>v0.1.0</span>
        </text>
      </box>

      {/* Tab navigation */}
      <tab-select
        options={TAB_OPTIONS}
        focused={state.activeView !== "detail"}
        selectedBackgroundColor={colors.tabActive}
        selectedTextColor={colors.tabText}
        textColor={colors.textDim}
        backgroundColor={colors.bg}
        showDescription={false}
        showUnderline={true}
        wrapSelection={true}
        onChange={(index) => {
          const view = TAB_OPTIONS[index]?.value as ViewName | undefined
          if (view) dispatch({ type: "NAVIGATE", view })
        }}
      />

      {/* Content area */}
      <box style={{ flexGrow: 1, width: "100%" }}>
        {state.activeView === "home" && <HomeView />}
        {state.activeView === "discover" && (
          <box style={{ padding: 1 }}>
            <text fg={colors.textDim}>Discover view - coming soon</text>
          </box>
        )}
        {state.activeView === "favorites" && (
          <box style={{ padding: 1 }}>
            <text fg={colors.textDim}>Favorites view - coming soon</text>
          </box>
        )}
        {state.activeView === "detail" && state.selectedSkill && (
          <box style={{ padding: 1 }}>
            <text fg={colors.primary}>{state.selectedSkill.name}</text>
          </box>
        )}
      </box>

      {/* Notification bar (conditional) */}
      {state.notification && (
        <box
          style={{
            height: 1,
            width: "100%",
            backgroundColor:
              state.notification.type === "error"
                ? "#331111"
                : state.notification.type === "success"
                  ? "#113311"
                  : "#111133",
            paddingLeft: 1,
          }}
        >
          <text
            fg={
              state.notification.type === "error"
                ? colors.error
                : state.notification.type === "success"
                  ? colors.success
                  : colors.primary
            }
          >
            {state.notification.message}
          </text>
        </box>
      )}

      {/* Status bar */}
      <StatusBar />
    </box>
  )
}
