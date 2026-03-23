import { useState, useEffect } from "react"
import fs from "node:fs"
import path from "node:path"
import { spawnSync, exec } from "node:child_process"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useSkillActions } from "../data/use-skill-actions.js"
import { ConfirmDialog } from "../components/confirm-dialog.js"
import { colors, agentBadges as badgeMap } from "../utils/colors.js"
import { agents } from "../../../cli/src/core/agents.js"

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

/**
 * Returns the display name for an agent key (e.g. "claude-code" -> "Claude Code").
 */
function agentDisplayName(agentName: string): string {
  return agents[agentName]?.displayName ?? agentName
}

type DetailPendingAction = "remove" | "install" | null
type RemoveMode = null | "confirm" | "select-agent"

export function SkillDetailView() {
  const state = useStore()
  const dispatch = useDispatch()
  const { installSkill, removeSkill, removeSkillFromOneAgent } = useSkillActions()
  const skill = state.selectedSkill

  const [content, setContent] = useState("")
  const [contentLoading, setContentLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<DetailPendingAction>(null)
  const [removeMode, setRemoveMode] = useState<RemoveMode>(null)

  useEffect(() => {
    if (!skill) return

    // Local skill: read from disk
    if (skill.filePath) {
      const raw = readSkillContent(skill.filePath)
      setContent(stripFrontmatter(raw))
      return
    }

    // Catalog skill: fetch content from API
    const githubUrl = skill.metadata?.githubUrl as string | undefined
    const urlPath = skill.metadata?.urlPath as string | undefined
    if (githubUrl || urlPath) {
      setContentLoading(true)
      const detailPath = urlPath
        ? `/api/v1/skills/detail?path=${encodeURIComponent(urlPath)}`
        : `/api/v1/skills/detail?path=${encodeURIComponent(skill.name)}`
      fetch(`https://api.skillsgate.ai${detailPath}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.content) {
            setContent(stripFrontmatter(data.content))
          } else {
            setContent(skill.description || "(No content available)")
          }
        })
        .catch(() => setContent(skill.description || "(Could not load content)"))
        .finally(() => setContentLoading(false))
    } else {
      setContent(skill.description || "(No content available)")
    }
  }, [skill?.name, skill?.filePath])

  // Detail view keyboard handling
  useKeyboard((key) => {
    if (state.activeView !== "detail") return
    if (state.showHelp) return

    // Handle agent selection menu for per-agent delete
    if (removeMode === "select-agent" && skill) {
      if (key.name === "n" || key.name === "escape") {
        setRemoveMode(null)
        return
      }
      if (key.name === "a") {
        // Remove from all agents
        setRemoveMode(null)
        setPendingAction("remove")
        return
      }
      // Number keys 1-9 to select a specific agent
      const num = parseInt(key.raw ?? "", 10)
      if (num >= 1 && num <= skill.agents.length) {
        const agentName = skill.agents[num - 1]
        setRemoveMode(null)
        removeSkillFromOneAgent(skill, agentName).then(() => {
          // If that was the last agent, go back to list
          if (skill.agents.length <= 1) {
            dispatch({ type: "GO_BACK" })
          }
        })
        return
      }
      return
    }

    if (pendingAction) return // Block during confirm dialog

    // q or Esc to go back
    if (key.name === "q" || key.name === "escape") {
      dispatch({ type: "GO_BACK" })
      return
    }

    // e to edit skill in $EDITOR (only for locally installed skills)
    if (key.name === "e" && skill?.filePath) {
      const editor = process.env.VISUAL || process.env.EDITOR || "vi"

      // Release the terminal from the TUI renderer so the editor can use it.
      // We replicate the cleanup from __skillsgateTuiCleanExit but skip
      // process.exit so the editor can spawn first.
      try {
        process.stdout.write("\x1B[?1049l") // switch back to main screen buffer
        process.stdout.write("\x1B[?25h")   // show cursor
        process.stdout.write("\x1Bc")       // full terminal reset (RIS)
      } catch {
        // best effort terminal cleanup
      }

      spawnSync(editor, [skill.filePath], {
        stdio: "inherit",
      })

      // Exit after editing -- user restarts TUI to see changes
      console.log(`\nEdited: ${skill.filePath}`)
      console.log("Restart the TUI to see your changes.")
      process.exit(0)
    }

    // o to open folder (local skills) or source URL (catalog/github skills)
    if (key.name === "o" && skill) {
      const cmd = process.platform === "darwin" ? "open" : "xdg-open"

      if (skill.filePath) {
        // Local skill: open the containing folder
        const dir = path.dirname(skill.filePath)
        try {
          exec(`${cmd} "${dir}"`)
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "info", message: `Opening ${dir}` },
          })
        } catch {
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "error", message: "Failed to open folder" },
          })
        }
      } else if (skill.lock?.sourceType === "github") {
        // Catalog/GitHub skill: open the source URL
        const url = skill.lock.originalUrl
        if (url) {
          try {
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
      }
      return
    }

    // d to remove skill
    if (key.name === "d" && skill && skill.agents.length > 0) {
      if (skill.agents.length > 1) {
        // Multiple agents: show selection menu
        setRemoveMode("select-agent")
      } else {
        // Single agent: simple confirm
        setPendingAction("remove")
      }
      return
    }

    // i to install (for catalog skills not yet installed)
    if (key.name === "i" && skill && skill.agents.length === 0) {
      setPendingAction("install")
      return
    }
  })

  // Agent selection menu for per-agent delete
  if (removeMode === "select-agent" && skill) {
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
            Remove "<span fg={colors.primary}>{skill.name}</span>" from:
          </text>
          <text>{" "}</text>
          {skill.agents.map((agentName, i) => {
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
  const agentBadgeElements = skill.agents.map((a, i) => {
    const badge = badgeMap[a]
    return (
      <text key={a} fg={badge?.color ?? colors.agent}>
        {i > 0 ? " " : ""}{badge?.label ?? a.slice(0, 2).toUpperCase()}
      </text>
    )
  })
  const isInstalled = skill.agents.length > 0
  const isLocal = !!skill.filePath
  const installedAt = skill.lock?.installedAt
    ? new Date(skill.lock.installedAt).toLocaleDateString()
    : null
  const updatedAt = skill.lock?.updatedAt
    ? new Date(skill.lock.updatedAt).toLocaleDateString()
    : null

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
          {contentLoading && (
            <text fg={colors.textDim}>Loading content...</text>
          )}
          {!contentLoading && content.split("\n").map((line, i) => {
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

        {/* Status */}
        <text fg={colors.textDim}>Status</text>
        <text fg={isInstalled ? colors.success : colors.textDim}>
          {"  "}{isInstalled ? "Installed" : "Not installed"}
        </text>
        <text>{" "}</text>

        {/* Agents (only if installed) */}
        {isInstalled && agentBadgeElements.length > 0 && (
          <>
            <text fg={colors.textDim}>Agents</text>
            <box style={{ flexDirection: "row", paddingLeft: 2 }}>
              {agentBadgeElements}
            </box>
            <text>{" "}</text>
          </>
        )}

        {/* Dates (only if installed) */}
        {installedAt && (
          <>
            <text fg={colors.textDim}>Installed</text>
            <text fg={colors.text}>  {installedAt}</text>
            <text>{" "}</text>
          </>
        )}
        {updatedAt && (
          <>
            <text fg={colors.textDim}>Last updated</text>
            <text fg={colors.text}>  {updatedAt}</text>
            <text>{" "}</text>
          </>
        )}

        {/* Shortcut hints -- contextual based on skill type */}
        <text fg={colors.border}>---</text>
        <text fg={colors.textDim}>q/Esc  Go back</text>
        {isLocal && (
          <text fg={colors.textDim}>e      Edit in $EDITOR</text>
        )}
        {isLocal ? (
          <text fg={colors.textDim}>o      Open folder</text>
        ) : sourceType === "github" ? (
          <text fg={colors.textDim}>o      Open URL</text>
        ) : null}
        {isInstalled ? (
          <text fg={colors.textDim}>d      Remove skill</text>
        ) : (
          <text fg={colors.textDim}>i      Install skill</text>
        )}
      </box>
    </box>
  )
}
