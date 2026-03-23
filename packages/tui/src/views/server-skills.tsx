import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useDb } from "../db/context.js"
import { colors } from "../utils/colors.js"
import type { RemoteSkill } from "../db/skills.js"

interface ServerSkillsViewProps {
  serverId: string
}

/**
 * Browse cached remote skills from a selected server.
 * Two-column layout: skill list (left) | skill detail (right).
 * 'i' to install a remote skill locally (placeholder), Esc to go back.
 */
export function ServerSkillsView({ serverId }: ServerSkillsViewProps) {
  const state = useStore()
  const dispatch = useDispatch()
  const { servers, skills } = useDb()

  const server = servers.get(serverId)
  const [skillList, setSkillList] = useState<RemoteSkill[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSkillList(skills.listByServer(serverId))
  }, [serverId])

  const selectedSkill = skillList[selectedIndex] ?? null

  useKeyboard((key) => {
    if (state.activeView !== "server-skills") return
    if (state.showHelp) return

    // j/k or arrow keys
    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      setSelectedIndex((i) => Math.max(0, i - 1))
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      setSelectedIndex((i) => Math.min(skillList.length - 1, i + 1))
    }

    // g = first, G = last
    if (key.name === "g" && !key.shift) {
      setSelectedIndex(0)
    }
    if (key.name === "g" && key.shift) {
      setSelectedIndex(Math.max(0, skillList.length - 1))
    }

    // i = install locally (placeholder)
    if (key.name === "i" && selectedSkill) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: {
          type: "info",
          message: `Install from remote is not yet implemented. Skill: ${selectedSkill.name}`,
        },
      })
      return
    }

    // Esc = go back (handled by layout)
  })

  if (!server) {
    return (
      <box style={{ padding: 1 }}>
        <text fg={colors.error}>Server not found</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
      {/* Header bar */}
      <box
        style={{
          height: 1,
          width: "100%",
          paddingLeft: 1,
          backgroundColor: colors.bgAlt,
          flexDirection: "row",
        }}
      >
        <text fg={colors.primary}>{server.label}</text>
        <text fg={colors.textDim}>
          {"  "}{server.username}@{server.host}{"  "}
          {skillList.length} skill{skillList.length !== 1 ? "s" : ""}
        </text>
      </box>

      {/* Two-column content */}
      <box style={{ flexDirection: "row", flexGrow: 1, width: "100%" }}>
        {/* LEFT: Skill list */}
        <box
          style={{
            width: "40%",
            borderRight: true,
            borderColor: colors.border,
            flexDirection: "column",
          }}
        >
          <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
            <text fg={colors.textDim}>REMOTE SKILLS</text>
          </box>

          {skillList.length === 0 ? (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>
                No cached skills. Go back and sync the server (S).
              </text>
            </box>
          ) : (
            <scrollbox
              focused={state.activeView === "server-skills" && !state.showHelp}
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
              {skillList.map((skill, i) => (
                <box
                  key={skill.id}
                  style={{
                    width: "100%",
                    paddingLeft: 1,
                    paddingRight: 1,
                    flexDirection: "row",
                    backgroundColor: i === selectedIndex ? colors.bgAlt : "transparent",
                  }}
                >
                  <text fg={i === selectedIndex ? colors.primary : colors.text}>
                    {skill.name}
                  </text>
                </box>
              ))}
            </scrollbox>
          )}

          {/* Bottom hints */}
          <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
            <text fg={colors.textDim}>i=install locally  Esc=back</text>
          </box>
        </box>

        {/* RIGHT: Skill detail */}
        <box style={{ flexGrow: 1, flexDirection: "column" }}>
          {selectedSkill ? (
            <RemoteSkillDetail skill={selectedSkill} />
          ) : (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>Select a skill to view details</text>
            </box>
          )}
        </box>
      </box>
    </box>
  )
}

// ---------- Remote Skill Detail ----------

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

interface RemoteSkillDetailProps {
  skill: RemoteSkill
}

function RemoteSkillDetail({ skill }: RemoteSkillDetailProps) {
  const content = skill.content ? stripFrontmatter(skill.content) : ""

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
      <box style={{ paddingLeft: 1, paddingRight: 1, flexDirection: "column" }}>
        {/* Name */}
        <text fg={colors.primary}>
          <strong>{skill.name}</strong>
        </text>

        {/* Description */}
        {skill.description ? (
          <text fg={colors.text}>{skill.description}</text>
        ) : null}
        <text>{" "}</text>

        {/* Remote path */}
        <box style={{ flexDirection: "row", height: 1 }}>
          <text fg={colors.textDim}>Remote path: </text>
          <text fg={colors.secondary}>{skill.remotePath}</text>
        </box>

        {/* Synced at */}
        <box style={{ flexDirection: "row", height: 1 }}>
          <text fg={colors.textDim}>Last synced: </text>
          <text fg={colors.secondary}>{skill.syncedAt}</text>
        </box>

        <text>{" "}</text>
        <text fg={colors.textDim}>i=install locally  Esc=back to server list</text>
        <text fg={colors.border}>---</text>

        {/* Skill content */}
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
          <text fg={colors.textDim}>(No skill content cached)</text>
        )}
      </box>
    </scrollbox>
  )
}
