import { useStore, useDispatch } from "../store/context.js"
import { colors } from "../utils/colors.js"

export function AgentFilter() {
  const state = useStore()
  const dispatch = useDispatch()

  if (state.detectedAgents.length === 0) return null

  const options = [
    { name: `All (${state.installedSkills.length})`, value: "all" },
    ...state.detectedAgents.map((a) => ({
      name: `${a.displayName} (${a.skillCount})`,
      value: a.name,
    })),
  ]

  const activeIndex = options.findIndex(
    (o) => o.value === state.selectedAgentFilter
  )

  return (
    <box
      style={{
        height: 1,
        width: "100%",
        flexDirection: "row",
        paddingLeft: 1,
        gap: 1,
      }}
    >
      <text fg={colors.textDim}>Filter: </text>
      {options.map((opt, i) => (
        <text
          key={opt.value}
          fg={i === activeIndex ? colors.tabText : colors.textDim}
        >
          {opt.name}
          {i < options.length - 1 ? " | " : ""}
        </text>
      ))}
    </box>
  )
}
