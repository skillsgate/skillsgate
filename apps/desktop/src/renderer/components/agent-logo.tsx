import { memo } from "react"
import ampLogo from "../assets/agent-logos/amp.svg"
import antigravityLogo from "../assets/agent-logos/antigravity.svg"
import claudeLogo from "../assets/agent-logos/claude.svg"
import codebuddyLogo from "../assets/agent-logos/codebuddy.svg"
import codexLogo from "../assets/agent-logos/codex.svg"
import copilotLogo from "../assets/agent-logos/copilot.svg"
import cursorLogo from "../assets/agent-logos/cursor.svg"
import droidCliLogo from "../assets/agent-logos/droid-cli.svg"
import mercuryLogo from "../assets/agent-logos/mercury.svg"
import ob1Logo from "../assets/agent-logos/ob-1.svg"
import openclawLogo from "../assets/agent-logos/openclaw.svg"
import opencodeLogo from "../assets/agent-logos/opencode.svg"
import piLogo from "../assets/agent-logos/pi.svg"
import traeCnLogo from "../assets/agent-logos/trae-cn.svg"
import workbuddyLogo from "../assets/agent-logos/workbuddy.svg"
import workbuddyAiLogo from "../assets/agent-logos/workbuddy-ai.svg"
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
  antigravity: antigravityLogo,
  codebuddy: codebuddyLogo,
  opencode: opencodeLogo,
  openclaw: openclawLogo,
  pi: piLogo,
  "trae-cn": traeCnLogo,
  workbuddy: workbuddyLogo,
  "workbuddy-ai": workbuddyAiLogo,
  mercury: mercuryLogo,
}

const AGENT_LOGO_FILTERS: Record<string, string> = {
  antigravity: "none",
  codebuddy: "none",
  mercury: "none",
  "ob-1": "none",
  pi: "none",
  "trae-cn": "none",
  workbuddy: "none",
  "workbuddy-ai": "none",
}

export const DISPLAY_NAME_TO_KEY: Record<string, string> = {
  "Claude Code": "claude-code",
  Antigravity: "antigravity",
  Cursor: "cursor",
  "CodeBuddy CN": "codebuddy",
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
  "Pi Coding Agent": "pi",
  "Roo Code": "roo-code",
  Trae: "trae",
  "Trae CN": "trae-cn",
  WorkBuddy: "workbuddy",
  "WorkBuddy AI": "workbuddy-ai",
  "Mercury Agent": "mercury",
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

export const AgentLogoRow = memo(function AgentLogoRow({ agents, size = 14 }: { agents: string[]; size?: number }) {
  return (
    <span className="flex items-center gap-1">
      {agents.map((agent) => (
        <AgentLogo key={agent} name={agent} size={size} />
      ))}
    </span>
  )
})
