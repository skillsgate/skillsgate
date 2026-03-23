import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { SkillListItem } from "./skill-list-item.js"
import { colors } from "../utils/colors.js"
import type { EnrichedSkill } from "../store/types.js"

interface SkillListProps {
  skills: EnrichedSkill[]
}

export function SkillList({ skills }: SkillListProps) {
  const dispatch = useDispatch()
  const state = useStore()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Only handle navigation when on a list-bearing view and list is focused
  useKeyboard((key) => {
    if (state.showHelp) return
    if (state.activeView !== "home") return
    if (state.focusedPane !== "list") return

    // j/k or arrow keys for navigation
    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      setSelectedIndex((i) => Math.max(0, i - 1))
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      setSelectedIndex((i) => Math.min(skills.length - 1, i + 1))
    }

    // g = jump to first, G (shift+g) = jump to last
    if (key.name === "g" && !key.shift) {
      setSelectedIndex(0)
    }
    if (key.name === "g" && key.shift) {
      setSelectedIndex(Math.max(0, skills.length - 1))
    }

    // Enter to open skill detail
    if (key.name === "return" && skills[selectedIndex]) {
      dispatch({ type: "SELECT_SKILL", skill: skills[selectedIndex] })
    }
  })

  if (skills.length === 0) {
    return (
      <box style={{ padding: 1 }}>
        <text fg={colors.textDim}>
          {state.installedLoading
            ? "Scanning for installed skills..."
            : "No skills found. Install skills with: skillsgate install <source>"}
        </text>
      </box>
    )
  }

  return (
    <scrollbox
      focused={state.activeView === "home" && state.focusedPane === "list" && !state.showHelp}
      style={{
        width: "100%",
        flexGrow: 1,
        rootOptions: { backgroundColor: colors.bg },
        viewportOptions: { backgroundColor: colors.bg },
        contentOptions: { backgroundColor: colors.bg },
        scrollbarOptions: {
          trackOptions: {
            foregroundColor: colors.primary,
            backgroundColor: colors.border,
          },
        },
      }}
    >
      {skills.map((skill, i) => (
        <SkillListItem
          key={skill.name}
          skill={skill}
          selected={i === selectedIndex}
        />
      ))}
    </scrollbox>
  )
}
