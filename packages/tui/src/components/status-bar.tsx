import { useStore } from "../store/context.js"
import { colors } from "../utils/colors.js"

export function StatusBar() {
  const state = useStore()

  const skillCount = state.installedSkills.length
  const agentCount = state.detectedAgents.length
  const user = state.auth?.user?.name ?? "not logged in (l=login)"
  const focusHint = state.activeView === "detail"
    ? "q=back"
    : state.activeView === "login"
      ? "Esc=back"
      : state.focusedPane === "search"
        ? "Tab=results  Esc=exit search"
        : "/=search  Tab=switch pane"

  const statusText = `Skills: ${skillCount} | Agents: ${agentCount} | ${user} | ${focusHint} | ?=help 1/2/3/4=tabs`

  return (
    <box
      style={{
        height: 1,
        width: "100%",
        backgroundColor: colors.statusBar,
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg={colors.textDim}>{statusText}</text>
    </box>
  )
}
