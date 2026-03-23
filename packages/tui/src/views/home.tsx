import { useMemo, useState, useEffect } from "react"
import fs from "node:fs"
import { useStore } from "../store/context.js"
import { AgentFilter } from "../components/agent-filter.js"
import { SkillList } from "../components/skill-list.js"
import { colors, agentBadges as badgeMap } from "../utils/colors.js"
import type { EnrichedSkill } from "../store/types.js"

/**
 * Reads the full SKILL.md content for inline display.
 */
function readSkillContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return ""
  }
}

/**
 * Strips frontmatter (--- delimited block at the top) from markdown content.
 */
function stripFrontmatter(content: string): string {
  const lines = content.split("\n")
  if (lines[0]?.trim() !== "---") return content

  let endIndex = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIndex = i
      break
    }
  }

  if (endIndex === -1) return content
  return lines.slice(endIndex + 1).join("\n").trimStart()
}

/**
 * Three-panel home view:
 * LEFT   - Agent filter sidebar (fixed 22 chars)
 * MIDDLE - Compact skill name list (30%)
 * RIGHT  - Skill detail panel (flexGrow)
 */
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
    <box style={{ flexDirection: "row", width: "100%", flexGrow: 1 }}>
      {/* LEFT: Agent filter sidebar */}
      <AgentFilter />

      {/* MIDDLE: Skill list */}
      <box
        style={{
          width: "30%",
          borderRight: true,
          borderColor: state.focusedPane === "list" ? colors.primary : colors.border,
          flexDirection: "column",
        }}
      >
        <SkillList skills={filteredSkills} />
      </box>

      {/* RIGHT: Detail panel */}
      <box style={{ flexGrow: 1, flexDirection: "column" }}>
        {state.selectedSkill ? (
          <DetailPanel skill={state.selectedSkill} />
        ) : (
          <box style={{ padding: 1 }}>
            <text fg={colors.textDim}>
              {filteredSkills.length > 0
                ? "Select a skill to view details"
                : "No skills to display"}
            </text>
          </box>
        )}
      </box>
    </box>
  )
}

// ---------- Inline Detail Panel ----------

interface DetailPanelProps {
  skill: EnrichedSkill
}

function DetailPanel({ skill }: DetailPanelProps) {
  const state = useStore()
  const [content, setContent] = useState("")

  useEffect(() => {
    if (skill.filePath) {
      const raw = readSkillContent(skill.filePath)
      setContent(stripFrontmatter(raw))
    } else {
      setContent("")
    }
  }, [skill.filePath, skill.name])

  const sourceType = skill.lock?.sourceType ?? "unknown"
  const sourceUrl = skill.lock?.originalUrl ?? ""

  return (
    <scrollbox
      focused={false}
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
      <box style={{ paddingLeft: 1, paddingRight: 1, paddingTop: 0, flexDirection: "column" }}>
        {/* Skill name */}
        <text fg={colors.primary}>
          <strong>{skill.name}</strong>
        </text>

        {/* Description */}
        <text fg={colors.text}>{skill.description}</text>
        <text>{" "}</text>

        {/* Metadata row: source + agents */}
        <box style={{ flexDirection: "row", height: 1 }}>
          <text fg={colors.textDim}>Source: </text>
          <text fg={colors.secondary}>{sourceType}</text>
          {sourceUrl ? (
            <>
              <text fg={colors.textDim}>  URL: </text>
              <text fg={colors.primary}>{sourceUrl}</text>
            </>
          ) : null}
        </box>

        {/* Agent badges */}
        {skill.agents.length > 0 ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>Agents: </text>
            {skill.agents.map((a, i) => {
              const badge = badgeMap[a]
              return (
                <text key={a} fg={badge?.color ?? colors.agent}>
                  {i > 0 ? " " : ""}{badge?.label ?? a.slice(0, 2).toUpperCase()}
                </text>
              )
            })}
          </box>
        ) : null}

        <text>{" "}</text>

        {/* Shortcut hints */}
        <text fg={colors.textDim}>v=view detail  d=remove  u=update  Tab=switch pane</text>
        <text fg={colors.border}>---</text>

        {/* SKILL.md content */}
        {content ? (
          content.split("\n").map((line, i) => {
            if (line.startsWith("### ")) {
              return <text key={i} fg={colors.primary}>{line}</text>
            }
            if (line.startsWith("## ")) {
              return <text key={i} fg={colors.primary}><strong>{line}</strong></text>
            }
            if (line.startsWith("# ")) {
              return <text key={i} fg={colors.primary}><strong>{line}</strong></text>
            }
            if (line.startsWith("```")) {
              return <text key={i} fg={colors.textDim}>{line}</text>
            }
            if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ")) {
              return <text key={i} fg={colors.text}>{line}</text>
            }
            if (!line.trim()) {
              return <text key={i}>{" "}</text>
            }
            return <text key={i} fg={colors.text}>{line}</text>
          })
        ) : (
          <text fg={colors.textDim}>(No skill content available)</text>
        )}
      </box>
    </scrollbox>
  )
}
