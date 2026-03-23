import { ipcMain } from "electron"
import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import matter from "gray-matter"

// ---------------------------------------------------------------------------
// Agent registry (mirrored from packages/cli/src/core/agents.ts)
//
// We duplicate the agent config here rather than importing from packages/cli
// directly because the CLI uses ESM with .js extensions in imports, which
// complicates bundling. The agent list is small and stable, so maintaining
// a mirror is acceptable. A shared config package can be extracted later.
// ---------------------------------------------------------------------------

const home = os.homedir()
const configHome = process.env.XDG_CONFIG_HOME || path.join(home, ".config")

interface AgentEntry {
  name: string
  displayName: string
  globalSkillsDir: string
  detectInstalled: () => Promise<boolean>
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p)
    return stat.isDirectory()
  } catch {
    return false
  }
}

const agentRegistry: Record<string, AgentEntry> = {
  "claude-code": {
    name: "claude-code",
    displayName: "Claude Code",
    globalSkillsDir: path.join(
      process.env.CLAUDE_CONFIG_DIR || path.join(home, ".claude"),
      "skills",
    ),
    detectInstalled: () =>
      dirExists(process.env.CLAUDE_CONFIG_DIR || path.join(home, ".claude")),
  },
  cursor: {
    name: "cursor",
    displayName: "Cursor",
    globalSkillsDir: path.join(home, ".cursor", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".cursor")),
  },
  "github-copilot": {
    name: "github-copilot",
    displayName: "GitHub Copilot",
    globalSkillsDir: path.join(configHome, "github-copilot", "skills"),
    detectInstalled: () => dirExists(path.join(configHome, "github-copilot")),
  },
  windsurf: {
    name: "windsurf",
    displayName: "Windsurf",
    globalSkillsDir: path.join(home, ".windsurf", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".windsurf")),
  },
  cline: {
    name: "cline",
    displayName: "Cline",
    globalSkillsDir: path.join(home, ".cline", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".cline")),
  },
  continue: {
    name: "continue",
    displayName: "Continue",
    globalSkillsDir: path.join(home, ".continue", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".continue")),
  },
  "codex-cli": {
    name: "codex-cli",
    displayName: "Codex CLI",
    globalSkillsDir: path.join(
      process.env.CODEX_HOME || path.join(home, ".codex"),
      "skills",
    ),
    detectInstalled: () =>
      dirExists(process.env.CODEX_HOME || path.join(home, ".codex")),
  },
  amp: {
    name: "amp",
    displayName: "Amp",
    globalSkillsDir: path.join(home, ".amp", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".amp")),
  },
  goose: {
    name: "goose",
    displayName: "Goose",
    globalSkillsDir: path.join(home, ".goose", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".goose")),
  },
  junie: {
    name: "junie",
    displayName: "Junie",
    globalSkillsDir: path.join(home, ".junie", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".junie")),
  },
  "kilo-code": {
    name: "kilo-code",
    displayName: "Kilo Code",
    globalSkillsDir: path.join(home, ".kilo-code", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".kilo-code")),
  },
  opencode: {
    name: "opencode",
    displayName: "OpenCode",
    globalSkillsDir: path.join(home, ".opencode", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".opencode")),
  },
  openclaw: {
    name: "openclaw",
    displayName: "OpenClaw",
    globalSkillsDir: path.join(home, ".openclaw", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".openclaw"))) ||
      (await dirExists(path.join(home, ".clawdbot"))) ||
      (await dirExists(path.join(home, ".moltbot"))),
  },
  "pear-ai": {
    name: "pear-ai",
    displayName: "Pear AI",
    globalSkillsDir: path.join(home, ".pear-ai", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".pear-ai")),
  },
  "roo-code": {
    name: "roo-code",
    displayName: "Roo Code",
    globalSkillsDir: path.join(home, ".roo-code", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".roo-code")),
  },
  trae: {
    name: "trae",
    displayName: "Trae",
    globalSkillsDir: path.join(home, ".trae", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".trae")),
  },
  zed: {
    name: "zed",
    displayName: "Zed",
    globalSkillsDir: path.join(configHome, "zed", "skills"),
    detectInstalled: () => dirExists(path.join(configHome, "zed")),
  },
  universal: {
    name: "universal",
    displayName: "Universal (.agents/skills)",
    globalSkillsDir: path.join(home, ".agents", "skills"),
    detectInstalled: async () => true,
  },
}

// ---------------------------------------------------------------------------
// Lock file reading (mirrored from packages/cli/src/core/skill-lock.ts)
// ---------------------------------------------------------------------------

const LOCK_FILE_VERSION = 1

interface SkillLockEntry {
  source: string
  sourceType: string
  originalUrl: string
  skillFolderHash: string
  installedAt: string
  updatedAt: string
}

interface SkillLockFile {
  version: number
  skills: Record<string, SkillLockEntry>
}

async function readSkillLock(): Promise<SkillLockFile> {
  const lockPath = path.join(home, ".agents", ".skill-lock.json")
  try {
    const raw = await fs.readFile(lockPath, "utf-8")
    const data = JSON.parse(raw) as SkillLockFile
    if (data.version !== LOCK_FILE_VERSION) {
      return { version: LOCK_FILE_VERSION, skills: {} }
    }
    return data
  } catch {
    return { version: LOCK_FILE_VERSION, skills: {} }
  }
}

// ---------------------------------------------------------------------------
// SKILL.md parsing
// ---------------------------------------------------------------------------

interface ParsedSkill {
  name: string
  description: string
  filePath: string
}

async function parseSkillMd(filePath: string): Promise<ParsedSkill | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    const { data: frontmatter } = matter(raw)

    if (
      typeof frontmatter.name !== "string" ||
      typeof frontmatter.description !== "string"
    ) {
      return null
    }

    return {
      name: frontmatter.name,
      description: frontmatter.description,
      filePath,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// IPC Handlers
// ---------------------------------------------------------------------------

export function registerIpcHandlers(): void {
  // Detect which agents are installed on this machine
  ipcMain.handle("agents:detect", async () => {
    const detected: Array<{ name: string; displayName: string }> = []
    for (const [_key, agent] of Object.entries(agentRegistry)) {
      try {
        if (await agent.detectInstalled()) {
          detected.push({ name: agent.name, displayName: agent.displayName })
        }
      } catch {
        // Skip agents that fail detection
      }
    }
    return detected
  })

  // List all installed skills across all detected agents
  ipcMain.handle("skills:list-installed", async () => {
    const lock = await readSkillLock()
    const skillMap = new Map<
      string,
      {
        name: string
        description: string
        path: string
        agents: string[]
        source?: string
        sourceType?: string
        installedAt?: string
        updatedAt?: string
      }
    >()

    for (const [_key, agent] of Object.entries(agentRegistry)) {
      const skillsDir = agent.globalSkillsDir
      try {
        const entries = await fs.readdir(skillsDir, { withFileTypes: true })
        for (const entry of entries) {
          if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

          const skillDir = path.join(skillsDir, entry.name)
          const skillMdPath = path.join(skillDir, "SKILL.md")
          const parsed = await parseSkillMd(skillMdPath)

          const skillName = parsed?.name || entry.name
          const existing = skillMap.get(skillName)

          if (existing) {
            if (!existing.agents.includes(agent.displayName)) {
              existing.agents.push(agent.displayName)
            }
          } else {
            const lockEntry = lock.skills[entry.name]
            skillMap.set(skillName, {
              name: skillName,
              description: parsed?.description || "",
              path: skillDir,
              agents: [agent.displayName],
              source: lockEntry?.source,
              sourceType: lockEntry?.sourceType,
              installedAt: lockEntry?.installedAt,
              updatedAt: lockEntry?.updatedAt,
            })
          }
        }
      } catch {
        // Directory does not exist or is not readable
      }
    }

    return Array.from(skillMap.values())
  })

  // Read the content of a skill's SKILL.md file
  ipcMain.handle("skill:read-content", async (_event, skillPath: string) => {
    const skillMdPath = path.join(skillPath, "SKILL.md")
    try {
      return await fs.readFile(skillMdPath, "utf-8")
    } catch {
      return ""
    }
  })

  // Stubs for install/remove/update (will be fully implemented in Phase 3+)
  ipcMain.handle(
    "skills:install",
    async (
      _event,
      _source: string,
      _agents: string[],
      _scope: string,
    ) => {
      // TODO: Wire up to CLI core installer module
      return []
    },
  )

  ipcMain.handle("skills:remove", async (_event, _name: string) => {
    // TODO: Wire up to CLI core removal functions
  })

  ipcMain.handle("skills:update", async (_event, _name: string) => {
    // TODO: Wire up to CLI core update logic
  })
}
