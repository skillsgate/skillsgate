import { useState } from "react"
import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useDb } from "../db/context.js"
import { useDetectedAgents } from "../data/use-agents.js"
import { useInstalledSkills } from "../data/use-installed-skills.js"
import { useAuth } from "../data/use-auth.js"
import { StatusBar } from "./status-bar.js"
import { HelpOverlay } from "./help-overlay.js"
import { HomeView } from "../views/home.js"
import { SkillDetailView } from "../views/skill-detail.js"
import { DiscoverView } from "../views/discover.js"
import { FavoritesView } from "../views/favorites.js"
import { ServersView } from "../views/servers.js"
import { AddServerView } from "../views/add-server.js"
import { ServerSkillsView } from "../views/server-skills.js"
import { SettingsView } from "../views/settings.js"
import { LoginView } from "../views/login.js"
import { colors } from "../utils/colors.js"
import type { ViewName } from "../store/types.js"

function getTabOptions(favCount: number, serverCount: number) {
  return [
    { name: "Installed", description: "Locally installed skills", value: "home" },
    { name: "Discover", description: "Search the registry", value: "discover" },
    {
      name: favCount > 0 ? `Favorites (${favCount})` : "Favorites",
      description: "Your starred skills",
      value: "favorites",
    },
    {
      name: serverCount > 0 ? `Servers (${serverCount})` : "Servers",
      description: "Remote SSH servers",
      value: "servers",
    },
  ]
}

export function Layout() {
  const state = useStore()
  const dispatch = useDispatch()
  const { width, height } = useTerminalDimensions()
  const { servers } = useDb()
  const [serverCount, setServerCount] = useState(() => servers.list().length)

  // Load auth, agent + skill data on mount
  useAuth()
  useDetectedAgents()
  useInstalledSkills()

  // Global keyboard shortcuts
  useKeyboard((key) => {
    // Ctrl+Q always works -- clean exit
    if (key.name === "q" && key.ctrl) {
      const exit = (globalThis as any).__skillsgateTuiCleanExit
      if (exit) exit()
      else process.exit(0)
    }

    // When search input is focused, only handle Escape, Tab, and Ctrl shortcuts
    // All other keys pass through to the input component
    if (state.focusedPane === "search") {
      if (key.name === "escape") {
        dispatch({ type: "SET_FOCUSED_PANE", pane: "list" })
        return
      }
      if (key.name === "tab" && !key.shift) {
        dispatch({ type: "CYCLE_FOCUS" })
        return
      }
      return
    }

    // When on login view, only handle Escape -- let input keys pass through
    if (state.activeView === "login") {
      if (key.name === "escape") {
        dispatch({ type: "GO_BACK" })
      }
      return
    }

    // Help overlay toggle
    if (key.name === "?" || (key.shift && key.name === "/")) {
      dispatch({ type: "TOGGLE_HELP" })
      return
    }

    // Dismiss help with Esc
    if (state.showHelp && key.name === "escape") {
      dispatch({ type: "TOGGLE_HELP" })
      return
    }

    // When help is shown, block other shortcuts
    if (state.showHelp) return

    // Tab switching (only when not in detail/form views)
    const inFormView = state.activeView === "detail" || state.activeView === "add-server"
      || state.activeView === "edit-server" || state.activeView === "settings"
      || state.activeView === "server-skills" || state.activeView === "login"
    if (!inFormView) {
      if (key.name === "1") dispatch({ type: "NAVIGATE", view: "home" })
      if (key.name === "2") dispatch({ type: "NAVIGATE", view: "discover" })
      if (key.name === "3") dispatch({ type: "NAVIGATE", view: "favorites" })
      if (key.name === "4") {
        setServerCount(servers.list().length)
        dispatch({ type: "NAVIGATE", view: "servers" })
      }
    }

    // "s" to open settings (from any non-form view)
    if (key.name === "s" && state.focusedPane !== "search" && !inFormView) {
      dispatch({ type: "NAVIGATE", view: "settings" })
      return
    }

    // Tab to cycle focus (only on home/discover views)
    if (key.name === "tab" && !key.shift && (state.activeView === "home" || state.activeView === "discover")) {
      dispatch({ type: "CYCLE_FOCUS" })
      return
    }

    // "/" to focus search from anywhere
    if (key.name === "/" && state.activeView !== "detail") {
      dispatch({ type: "SET_FOCUSED_PANE", pane: "search" })
      return
    }

    // Esc: go back from sub-views, clear search, etc.
    if (key.name === "escape") {
      if (state.activeView === "detail" || state.activeView === "add-server"
        || state.activeView === "edit-server" || state.activeView === "settings"
        || state.activeView === "server-skills") {
        dispatch({ type: "GO_BACK" })
        return
      }
      if (state.installedFilter) {
        dispatch({ type: "SET_INSTALLED_FILTER", filter: "" })
      }
      if (state.focusedPane === "search") {
        dispatch({ type: "SET_FOCUSED_PANE", pane: "list" })
      }
      return
    }

    // "l" to navigate to login view (always -- allows re-login if token expired)
    if (key.name === "l" && state.focusedPane !== "search" && state.activeView !== "detail" && state.activeView !== "login") {
      dispatch({ type: "NAVIGATE", view: "login" })
      return
    }

    // "r" to refresh installed skills (when not typing in search, not on login view)
    if (key.name === "r" && state.focusedPane !== "search" && state.activeView !== "detail" && state.activeView !== "login") {
      dispatch({ type: "REFRESH_SKILLS" })
      return
    }
  })

  const TAB_OPTIONS = getTabOptions(state.favorites.length, serverCount)

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
        focused={state.activeView !== "detail" && !state.showHelp}
        selectedIndex={activeTabIndex >= 0 ? activeTabIndex : 0}
        selectedBackgroundColor={colors.tabActive}
        selectedTextColor={colors.tabText}
        textColor={colors.textDim}
        backgroundColor={colors.bg}
        showDescription={false}
        showUnderline={true}
        wrapSelection={true}
        onChange={(index: number) => {
          const view = TAB_OPTIONS[index]?.value as ViewName | undefined
          if (view) dispatch({ type: "NAVIGATE", view })
        }}
      />

      {/* Content area */}
      <box style={{ flexGrow: 1, width: "100%" }}>
        {state.showHelp ? (
          <HelpOverlay />
        ) : (
          <>
            {state.activeView === "home" && <HomeView />}
            {state.activeView === "discover" && <DiscoverView />}
            {state.activeView === "favorites" && <FavoritesView />}
            {state.activeView === "servers" && <ServersView onServerCountChange={setServerCount} />}
            {(state.activeView === "add-server" || state.activeView === "edit-server") && (
              <AddServerView
                editServerId={state.activeView === "edit-server" ? state.selectedServerId : null}
                onServerCountChange={setServerCount}
              />
            )}
            {state.activeView === "server-skills" && state.selectedServerId && (
              <ServerSkillsView serverId={state.selectedServerId} />
            )}
            {state.activeView === "settings" && <SettingsView />}
            {state.activeView === "login" && <LoginView />}
            {state.activeView === "detail" && state.selectedSkill && (
              <SkillDetailView />
            )}
          </>
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
