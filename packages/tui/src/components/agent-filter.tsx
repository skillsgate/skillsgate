import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { colors, agentBadges } from "../utils/colors.js"

/**
 * Vertical sidebar showing the Library section (All Skills, Favorites)
 * and the Tools section (detected agents with skill counts).
 * Rendered as the left panel in the three-panel home layout.
 */
export function AgentFilter() {
  const state = useStore()
  const dispatch = useDispatch()

  const allCount = state.installedSkills.length

  // Build the list of filter options
  const agentOptions = state.detectedAgents.map((a) => ({
    name: a.displayName,
    value: a.name,
    count: a.skillCount,
    badge: agentBadges[a.name],
  }))

  // Navigate agent filters with keyboard when agents pane is focused
  useKeyboard((key) => {
    if (state.activeView !== "home") return
    if (state.focusedPane !== "agents") return
    if (state.showHelp) return

    const allOptions = ["all", ...agentOptions.map((o) => o.value)]
    const currentIdx = allOptions.indexOf(state.selectedAgentFilter)

    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      const prev = Math.max(0, currentIdx - 1)
      dispatch({ type: "SET_AGENT_FILTER", filter: allOptions[prev] })
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      const next = Math.min(allOptions.length - 1, currentIdx + 1)
      dispatch({ type: "SET_AGENT_FILTER", filter: allOptions[next] })
    }
  })

  const isFocused = state.focusedPane === "agents"

  return (
    <box
      style={{
        flexDirection: "column",
        width: 22,
        borderRight: true,
        borderColor: isFocused ? colors.primary : colors.border,
        backgroundColor: colors.bg,
        paddingTop: 0,
      }}
    >
      {/* Library section header */}
      <box style={{ paddingLeft: 1, height: 1, backgroundColor: colors.bgAlt }}>
        <text fg={colors.textDim}>LIBRARY</text>
      </box>

      {/* All Skills */}
      <box
        style={{
          paddingLeft: 1,
          paddingRight: 1,
          height: 1,
          backgroundColor: state.selectedAgentFilter === "all" ? colors.bgAlt : "transparent",
        }}
      >
        <text fg={state.selectedAgentFilter === "all" ? colors.primary : colors.text}>
          All Skills
        </text>
        <text fg={colors.textDim}> ({allCount})</text>
      </box>

      {/* Spacer */}
      <box style={{ height: 1 }}>
        <text>{" "}</text>
      </box>

      {/* Tools section header */}
      <box style={{ paddingLeft: 1, height: 1, backgroundColor: colors.bgAlt }}>
        <text fg={colors.textDim}>TOOLS</text>
      </box>

      {/* Agent entries */}
      {agentOptions.length === 0 ? (
        <box style={{ paddingLeft: 1, height: 1 }}>
          <text fg={colors.textDim}>(none)</text>
        </box>
      ) : (
        agentOptions.map((opt) => {
          const isActive = state.selectedAgentFilter === opt.value
          return (
            <box
              key={opt.value}
              style={{
                paddingLeft: 1,
                paddingRight: 1,
                height: 1,
                flexDirection: "row",
                backgroundColor: isActive ? colors.bgAlt : "transparent",
              }}
            >
              <text fg={opt.badge?.color ?? colors.agent}>
                {opt.badge?.label ?? opt.name.slice(0, 2)}
              </text>
              <text fg={isActive ? colors.primary : colors.text}>
                {" "}{opt.name}
              </text>
              <text fg={colors.textDim}> {opt.count}</text>
            </box>
          )
        })
      )}
    </box>
  )
}
