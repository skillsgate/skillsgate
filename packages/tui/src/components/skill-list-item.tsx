import type { EnrichedSkill } from "../store/types.js"
import { colors, agentBadges as badgeMap } from "../utils/colors.js"

interface SkillListItemProps {
  skill: EnrichedSkill
  selected?: boolean
}

export function SkillListItem({ skill, selected }: SkillListItemProps) {
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

      {/* Agent badges - colored single/two-letter indicators */}
      <box style={{ flexDirection: "row", width: 20 }}>
        {skill.agents.map((a, i) => {
          const badge = badgeMap[a]
          return (
            <text key={a} fg={badge?.color ?? colors.agent}>
              {i > 0 ? " " : ""}{badge?.label ?? a.slice(0, 2).toUpperCase()}
            </text>
          )
        })}
      </box>

      {/* Source */}
      {sourceLabel ? (
        <text fg={colors.secondary} style={{ width: 6 }}>
          [{sourceLabel}]
        </text>
      ) : null}
    </box>
  )
}
