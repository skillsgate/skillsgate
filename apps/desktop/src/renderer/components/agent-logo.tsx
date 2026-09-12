import { memo } from "react"
import { t } from "../lib/i18n"
import ampLogo from "../assets/agent-logos/amp.svg"
import claudeLogo from "../assets/agent-logos/claude.svg"
import codexLogo from "../assets/agent-logos/codex.svg"
import copilotLogo from "../assets/agent-logos/copilot.svg"
import cursorLogo from "../assets/agent-logos/cursor.svg"
import droidCliLogo from "../assets/agent-logos/droid-cli.svg"
import ob1Logo from "../assets/agent-logos/ob-1.svg"
import openclawLogo from "../assets/agent-logos/openclaw.svg"
import opencodeLogo from "../assets/agent-logos/opencode.svg"
import windsurfLogo from "../assets/agent-logos/windsurf.svg"

const AGENT_LOGOS: Record<string, string> = {
  "claude-code": claudeLogo,
  cursor: cursorLogo,
  "github-copilot": copilotLogo,
  windsurf: windsurfLogo,
  "codex-cli": codexLogo,
  "droid-cli": droidCliLogo,
  "ob-1": ob1Logo,
  amp: ampLogo,
  opencode: opencodeLogo,
  openclaw: openclawLogo,
}

const AGENT_LOGO_FILTERS: Record<string, string> = {
  "ob-1": "none",
}

const DISPLAY_NAME_TO_KEY: Record<string, string> = {
  "Claude Code": "claude-code",
  Cursor: "cursor",
  "GitHub Copilot": "github-copilot",
  Windsurf: "windsurf",
  Cline: "cline",
  Continue: "continue",
  "Codex CLI": "codex-cli",
  "Droid CLI": "droid-cli",
  "OB-1": "ob-1",
  Amp: "amp",
  Goose: "goose",
  Junie: "junie",
  "Kilo Code": "kilo-code",
  OpenCode: "opencode",
  OpenClaw: "openclaw",
  "Pear AI": "pear-ai",
  "Roo Code": "roo-code",
  Trae: "trae",
  Zed: "zed",
  "Universal (.agents/skills)": "universal",
}

function hashToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = ((hash % 360) + 360) % 360
  return `hsl(${hue}, 55%, 45%)`
}

function getAgentKey(nameOrDisplayName: string): string {
  return (
    DISPLAY_NAME_TO_KEY[nameOrDisplayName] ||
    nameOrDisplayName.toLowerCase().replace(/\s+/g, "-")
  )
}

function getFallbackLetters(nameOrDisplayName: string, shortCode?: string): string {
  if (shortCode) return shortCode.slice(0, 2)
  const parts = nameOrDisplayName.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return nameOrDisplayName.slice(0, 2).toUpperCase()
}

interface AgentLogoProps {
  name: string
  size?: number
  shortCode?: string
  className?: string
}

export const AgentLogo = memo(function AgentLogo({ name, size = 16, shortCode, className = "" }: AgentLogoProps) {
  const key = getAgentKey(name)
  const logo = AGENT_LOGOS[key]
  const logoFilter = AGENT_LOGO_FILTERS[key] ?? "invert(1) brightness(0.9)"

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        className={`inline-block flex-shrink-0 ${className}`}
        style={{ width: size, height: size, filter: logoFilter }}
        draggable={false}
      />
    )
  }

  const letters = getFallbackLetters(name, shortCode)
  const bgColor = hashToColor(key)
  const fontSize = Math.max(7, Math.round(size * 0.5))

  return (
    <span
      title={name}
      className={`inline-flex items-center justify-center rounded-full flex-shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize,
        lineHeight: 1,
        color: "#fff",
        fontWeight: 600,
      }}
    >
      {letters}
    </span>
  )
})

/**
 * `dimmed` lists agents to render at half opacity — tools the skill is installed
 * in that the user has hidden from My Tools. They stay visible so the row is
 * still a truthful account of where the skill lives.
 */
export const AgentLogoRow = memo(function AgentLogoRow({
  agents,
  size = 14,
  dimmed,
}: {
  agents: string[]
  size?: number
  dimmed?: string[]
}) {
  const dimmedSet = dimmed && dimmed.length > 0 ? new Set(dimmed) : null

  return (
    <span className="flex items-center gap-1">
      {agents.map((agent) =>
        dimmedSet?.has(agent) ? (
          <span
            key={agent}
            className="inline-flex opacity-50"
            title={t("Hidden tool — enable in Settings")}
          >
            <AgentLogo name={agent} size={size} />
          </span>
        ) : (
          <AgentLogo key={agent} name={agent} size={size} />
        ),
      )}
    </span>
  )
})
