import type { EnrichedSkill } from "../store/types.js"
import { colors, agentBadges as badgeMap } from "../utils/colors.js"

interface SkillListItemProps {
  skill: EnrichedSkill
  selected?: boolean
}

/**
 * Compact skill list item for the middle panel.
 * Shows just the name and small agent dot indicators.
 */
export function SkillListItem({ skill, selected }: SkillListItemProps) {
  // Build compact agent dots (single-char badges)
  const agentDots = skill.agents.slice(0, 3).map((a) => {
    const badge = badgeMap[a]
    return { char: badge?.label?.[0] ?? "?", color: badge?.color ?? colors.agent }
  })

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
      <text fg={selected ? colors.primary : colors.text} style={{ flexGrow: 1 }}>
        {skill.name}
      </text>

      {/* Small agent dots on the right */}
      <box style={{ flexDirection: "row" }}>
        {agentDots.map((dot, i) => (
          <text key={i} fg={dot.color}>
            {dot.char}
          </text>
        ))}
      </box>
    </box>
  )
}
