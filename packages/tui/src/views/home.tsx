import { useMemo } from "react"
import { useStore } from "../store/context.js"
import { AgentFilter } from "../components/agent-filter.js"
import { SkillList } from "../components/skill-list.js"
import { colors } from "../utils/colors.js"

export function HomeView() {
  const state = useStore()

  // Apply agent filter and text filter
  const filteredSkills = useMemo(() => {
    let skills = state.installedSkills

    // Agent filter
    if (state.selectedAgentFilter !== "all") {
      skills = skills.filter((s) =>
        s.agents.includes(state.selectedAgentFilter as any)
      )
    }

    // Text filter
    if (state.installedFilter) {
      const q = state.installedFilter.toLowerCase()
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }

    return skills
  }, [state.installedSkills, state.selectedAgentFilter, state.installedFilter])

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
      {/* Agent filter bar */}
      <AgentFilter />

      {/* Column headers */}
      <box
        style={{
          height: 1,
          width: "100%",
          flexDirection: "row",
          paddingLeft: 1,
          paddingRight: 1,
          backgroundColor: colors.bgAlt,
        }}
      >
        <text fg={colors.textDim} style={{ width: 28 }}>
          NAME
        </text>
        <text fg={colors.textDim} style={{ flexGrow: 1 }}>
          DESCRIPTION
        </text>
        <text fg={colors.textDim} style={{ width: 20 }}>
          AGENTS
        </text>
        <text fg={colors.textDim} style={{ width: 6 }}>
          SRC
        </text>
      </box>

      {/* Skill list */}
      <SkillList skills={filteredSkills} />
    </box>
  )
}
