import type { EnrichedSkill } from "../store/types.js"
import { agents } from "../../../cli/src/core/agents.js"
import { colors } from "../utils/colors.js"

interface SkillListItemProps {
  skill: EnrichedSkill
  selected?: boolean
}

export function SkillListItem({ skill, selected }: SkillListItemProps) {
  const agentBadges = skill.agents
    .map((a) => agents[a]?.displayName ?? a)
    .join(", ")

  const sourceLabel = skill.lock?.sourceType === "github"
    ? "gh"
    : skill.lock?.sourceType === "skillsgate"
      ? "sg"
      : skill.lock?.sourceType === "local"
        ? "local"
        : ""

  return (
    <box
      style={{
        width: "100%",
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: selected ? colors.bgAlt : "transparent",
      }}
    >
      {/* Skill name */}
      <text fg={colors.primary} style={{ width: 28 }}>
        {skill.name}
      </text>

      {/* Description (truncated) */}
      <text fg={colors.textDim} style={{ flexGrow: 1 }}>
        {skill.description.slice(0, 50)}
      </text>

      {/* Agent badges */}
      <text fg={colors.agent} style={{ width: 20 }}>
        {agentBadges}
      </text>

      {/* Source */}
      {sourceLabel ? (
        <text fg={colors.secondary} style={{ width: 6 }}>
          [{sourceLabel}]
        </text>
      ) : null}
    </box>
  )
}
