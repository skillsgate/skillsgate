import { useState, useEffect } from "react"
import fs from "node:fs"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useSkillActions } from "../data/use-skill-actions.js"
import { ConfirmDialog } from "../components/confirm-dialog.js"
import { agents } from "../../../cli/src/core/agents.js"
import { colors } from "../utils/colors.js"

/**
 * Reads the full SKILL.md content for display.
 * Uses synchronous read since we need it immediately and it's a local file.
 */
function readSkillContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch {
    return "(Could not read skill file)"
  }
}

/**
 * Strips frontmatter (--- delimited block at the top) from markdown content
 * so we display only the body.
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

type DetailPendingAction = "remove" | "install" | null

export function SkillDetailView() {
  const state = useStore()
  const dispatch = useDispatch()
  const { installSkill, removeSkill } = useSkillActions()
  const skill = state.selectedSkill

  const [content, setContent] = useState("")
  const [pendingAction, setPendingAction] = useState<DetailPendingAction>(null)

  useEffect(() => {
    if (skill?.filePath) {
      const raw = readSkillContent(skill.filePath)
      setContent(stripFrontmatter(raw))
    }
  }, [skill?.filePath])

  // Detail view keyboard handling
  useKeyboard((key) => {
    if (state.activeView !== "detail") return
    if (state.showHelp) return
    if (pendingAction) return // Block during confirm dialog

    // q or Esc to go back
    if (key.name === "q" || key.name === "escape") {
      dispatch({ type: "GO_BACK" })
      return
    }

    // o to open source URL in browser
    if (key.name === "o" && skill?.lock?.sourceType === "github") {
      const url = skill.lock.originalUrl
      if (url) {
        try {
          const { exec } = require("node:child_process")
          const cmd = process.platform === "darwin" ? "open" : "xdg-open"
          exec(`${cmd} "${url}"`)
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "info", message: `Opening ${url}` },
          })
        } catch {
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "error", message: "Failed to open URL" },
          })
        }
      }
      return
    }

    // d to remove skill
    if (key.name === "d" && skill) {
      setPendingAction("remove")
      return
    }

    // i to install (for catalog skills not yet installed)
    if (key.name === "i" && skill && skill.agents.length === 0) {
      setPendingAction("install")
      return
    }
  })

  // Confirm dialog for remove/install
  if (pendingAction && skill) {
    const actionLabel = pendingAction === "remove" ? "Remove" : "Install"
    return (
      <ConfirmDialog
        message={`${actionLabel} "${skill.name}"?`}
        onConfirm={async () => {
          const action = pendingAction
          setPendingAction(null)
          if (action === "remove") {
            await removeSkill(skill)
            dispatch({ type: "GO_BACK" })
          } else if (action === "install") {
            await installSkill(skill)
          }
        }}
        onCancel={() => setPendingAction(null)}
      />
    )
  }

  if (!skill) {
    return (
      <box style={{ padding: 1 }}>
        <text fg={colors.textDim}>No skill selected</text>
      </box>
    )
  }

  // Build metadata lines
  const sourceType = skill.lock?.sourceType ?? "unknown"
  const sourceUrl = skill.lock?.originalUrl ?? ""
  const agentBadges = skill.agents
    .map((a) => agents[a]?.displayName ?? a)
    .join(", ")
  const installedAt = skill.lock?.installedAt
    ? new Date(skill.lock.installedAt).toLocaleDateString()
    : "unknown"
  const updatedAt = skill.lock?.updatedAt
    ? new Date(skill.lock.updatedAt).toLocaleDateString()
    : "unknown"

  return (
    <box style={{ flexDirection: "row", width: "100%", flexGrow: 1 }}>
      {/* Left side: Markdown content (70%) */}
      <scrollbox
        focused={state.activeView === "detail" && !state.showHelp}
        style={{
          width: "70%",
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
        <box style={{ paddingLeft: 1, paddingRight: 1, paddingTop: 1, flexDirection: "column" }}>
          {content.split("\n").map((line, i) => {
            // Style headings differently
            if (line.startsWith("### ")) {
              return (
                <text key={i} fg={colors.primary}>
                  {line}
                </text>
              )
            }
            if (line.startsWith("## ")) {
              return (
                <text key={i} fg={colors.primary}>
                  <strong>{line}</strong>
                </text>
              )
            }
            if (line.startsWith("# ")) {
              return (
                <text key={i} fg={colors.primary}>
                  <strong>{line}</strong>
                </text>
              )
            }
            // Code blocks
            if (line.startsWith("```")) {
              return (
                <text key={i} fg={colors.textDim}>
                  {line}
                </text>
              )
            }
            // Bullet points
            if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ")) {
              return (
                <text key={i} fg={colors.text}>
                  {line}
                </text>
              )
            }
            // Empty line
            if (!line.trim()) {
              return <text key={i}>{" "}</text>
            }
            // Normal text
            return (
              <text key={i} fg={colors.text}>
                {line}
              </text>
            )
          })}
        </box>
      </scrollbox>

      {/* Right side: Metadata panel (30%) */}
      <box
        style={{
          width: "30%",
          flexDirection: "column",
          backgroundColor: colors.bgAlt,
          borderLeft: true,
          borderColor: colors.border,
          paddingLeft: 1,
          paddingRight: 1,
          paddingTop: 1,
        }}
      >
        {/* Skill name */}
        <text fg={colors.primary}>
          <strong>{skill.name}</strong>
        </text>
        <text>{" "}</text>

        {/* Description */}
        <text fg={colors.text}>{skill.description}</text>
        <text>{" "}</text>

        {/* Source */}
        <text fg={colors.textDim}>Source</text>
        <text fg={colors.text}>  {sourceType}</text>
        <text>{" "}</text>

        {/* Source URL */}
        {sourceUrl ? (
          <>
            <text fg={colors.textDim}>URL</text>
            <text fg={colors.primary}>  {sourceUrl}</text>
            <text>{" "}</text>
          </>
        ) : null}

        {/* Agents */}
        <text fg={colors.textDim}>Agents</text>
        <text fg={colors.agent}>  {agentBadges}</text>
        <text>{" "}</text>

        {/* Dates */}
        <text fg={colors.textDim}>Installed</text>
        <text fg={colors.text}>  {installedAt}</text>
        <text>{" "}</text>

        <text fg={colors.textDim}>Last updated</text>
        <text fg={colors.text}>  {updatedAt}</text>
        <text>{" "}</text>

        {/* Shortcut hints */}
        <text fg={colors.border}>---</text>
        <text fg={colors.textDim}>q/Esc  Go back</text>
        {sourceType === "github" && (
          <text fg={colors.textDim}>o      Open URL</text>
        )}
        {skill.agents.length > 0 ? (
          <text fg={colors.textDim}>d      Remove skill</text>
        ) : (
          <text fg={colors.textDim}>i      Install skill</text>
        )}
      </box>
    </box>
  )
}
