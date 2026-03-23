import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useSkillActions } from "../data/use-skill-actions.js"
import { SkillListItem } from "./skill-list-item.js"
import { ConfirmDialog } from "./confirm-dialog.js"
import { colors, agentBadges as badgeMap } from "../utils/colors.js"
import { agents } from "../../../cli/src/core/agents.js"
import type { EnrichedSkill } from "../store/types.js"

interface SkillListProps {
  skills: EnrichedSkill[]
}

type PendingAction = {
  type: "remove" | "update"
  skill: EnrichedSkill
} | null

type RemoveMode = null | "select-agent"

/**
 * Returns the display name for an agent key.
 */
function agentDisplayName(agentName: string): string {
  return agents[agentName]?.displayName ?? agentName
}

export function SkillList({ skills }: SkillListProps) {
  const dispatch = useDispatch()
  const state = useStore()
  const { removeSkill, removeSkillFromOneAgent, updateSkill } = useSkillActions()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [removeMode, setRemoveMode] = useState<RemoveMode>(null)
  const [removeTarget, setRemoveTarget] = useState<EnrichedSkill | null>(null)

  // Preview the selected skill in the right panel whenever selection changes
  useEffect(() => {
    if (skills[selectedIndex]) {
      dispatch({ type: "PREVIEW_SKILL", skill: skills[selectedIndex] })
    }
  }, [selectedIndex, skills])

  // Only handle navigation when on a list-bearing view and list is focused
  useKeyboard((key) => {
    if (state.showHelp) return
    if (state.activeView !== "home") return
    if (state.focusedPane !== "list") return

    // Handle agent selection menu for per-agent delete
    if (removeMode === "select-agent" && removeTarget) {
      if (key.name === "n" || key.name === "escape") {
        setRemoveMode(null)
        setRemoveTarget(null)
        return
      }
      if (key.name === "a") {
        // Remove from all agents
        setRemoveMode(null)
        setRemoveTarget(null)
        setPendingAction({ type: "remove", skill: removeTarget })
        return
      }
      // Number keys 1-9 to select a specific agent
      const num = parseInt(key.raw ?? "", 10)
      if (num >= 1 && num <= removeTarget.agents.length) {
        const agentName = removeTarget.agents[num - 1]
        setRemoveMode(null)
        setRemoveTarget(null)
        removeSkillFromOneAgent(removeTarget, agentName)
        return
      }
      return
    }

    if (pendingAction) return // Block navigation during confirm dialog

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

    // Enter to open full skill detail view (navigates away)
    if (key.name === "v" && skills[selectedIndex]) {
      dispatch({ type: "SELECT_SKILL", skill: skills[selectedIndex] })
    }

    // d to remove selected skill (with per-agent support)
    if (key.name === "d" && skills[selectedIndex]) {
      const skill = skills[selectedIndex]
      if (skill.agents.length > 1) {
        // Multiple agents: show selection menu
        setRemoveTarget(skill)
        setRemoveMode("select-agent")
      } else {
        // Single agent or catalog: simple confirm
        setPendingAction({ type: "remove", skill })
      }
    }

    // u to update selected skill
    if (key.name === "u" && skills[selectedIndex]) {
      setPendingAction({ type: "update", skill: skills[selectedIndex] })
    }
  })

  // Handle confirm/cancel for pending actions
  const handleConfirm = async () => {
    if (!pendingAction) return
    const { type, skill } = pendingAction
    setPendingAction(null)

    if (type === "remove") {
      await removeSkill(skill)
    } else if (type === "update") {
      await updateSkill(skill)
    }
  }

  const handleCancel = () => {
    setPendingAction(null)
  }

  // Agent selection menu for per-agent delete
  if (removeMode === "select-agent" && removeTarget) {
    return (
      <box
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <box
          style={{
            width: 60,
            border: true,
            borderColor: colors.primary,
            backgroundColor: "#1a1a2e",
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 1,
            paddingBottom: 1,
            flexDirection: "column",
          }}
          title="Remove"
        >
          <text fg={colors.text}>
            Remove "<span fg={colors.primary}>{removeTarget.name}</span>" from:
          </text>
          <text>{" "}</text>
          {removeTarget.agents.map((agentName, i) => {
            const badge = badgeMap[agentName]
            return (
              <text key={agentName} fg={colors.text}>
                {"  "}<span fg={colors.primary}>{i + 1}</span>{"  "}<span fg={badge?.color ?? colors.agent}>{agentDisplayName(agentName)}</span>
              </text>
            )
          })}
          <text>{" "}</text>
          <text fg={colors.text}>
            {"  "}<span fg={colors.error}>a</span>{"  "}All agents (removes completely)
          </text>
          <text fg={colors.text}>
            {"  "}<span fg={colors.textDim}>n</span>{"  "}Cancel
          </text>
        </box>
      </box>
    )
  }

  // Show confirm dialog if there's a pending action
  if (pendingAction) {
    const actionLabel = pendingAction.type === "remove" ? "Remove" : "Update"
    return (
      <ConfirmDialog
        message={`${actionLabel} "${pendingAction.skill.name}"?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }

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

  const isFocused = state.activeView === "home" && state.focusedPane === "list" && !state.showHelp

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      {/* List header */}
      <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
        <text fg={colors.textDim}>SKILLS ({skills.length})</text>
      </box>

      <scrollbox
        focused={isFocused}
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
    </box>
  )
}
