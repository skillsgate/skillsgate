import { ipcMain, shell } from "electron"
import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import { execFile } from "node:child_process"
import matter from "gray-matter"
import { openDb } from "./db/index"
import { SettingsStore } from "./db/settings"
import { RemoteServerStore } from "./db/servers"
import { RemoteSkillStore } from "./db/skills"
import { testConnection, syncRemoteServer } from "./db/ssh"

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
  shortCode: string
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

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p)
    return stat.isFile()
  } catch {
    return false
  }
}

const agentRegistry: Record<string, AgentEntry> = {
  "claude-code": {
    name: "claude-code",
    displayName: "Claude Code",
    shortCode: "CC",
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
    shortCode: "CU",
    globalSkillsDir: path.join(home, ".cursor", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".cursor")),
  },
  "github-copilot": {
    name: "github-copilot",
    displayName: "GitHub Copilot",
    shortCode: "GC",
    globalSkillsDir: path.join(configHome, "github-copilot", "skills"),
    detectInstalled: () => dirExists(path.join(configHome, "github-copilot")),
  },
  windsurf: {
    name: "windsurf",
    displayName: "Windsurf",
    shortCode: "WS",
    globalSkillsDir: path.join(home, ".windsurf", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".windsurf")),
  },
  cline: {
    name: "cline",
    displayName: "Cline",
    shortCode: "CL",
    globalSkillsDir: path.join(home, ".cline", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".cline")),
  },
  continue: {
    name: "continue",
    displayName: "Continue",
    shortCode: "CN",
    globalSkillsDir: path.join(home, ".continue", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".continue")),
  },
  "codex-cli": {
    name: "codex-cli",
    displayName: "Codex CLI",
    shortCode: "CX",
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
    shortCode: "AM",
    globalSkillsDir: path.join(home, ".amp", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".amp")),
  },
  goose: {
    name: "goose",
    displayName: "Goose",
    shortCode: "GO",
    globalSkillsDir: path.join(home, ".goose", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".goose")),
  },
  junie: {
    name: "junie",
    displayName: "Junie",
    shortCode: "JU",
    globalSkillsDir: path.join(home, ".junie", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".junie")),
  },
  "kilo-code": {
    name: "kilo-code",
    displayName: "Kilo Code",
    shortCode: "KC",
    globalSkillsDir: path.join(home, ".kilo-code", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".kilo-code")),
  },
  opencode: {
    name: "opencode",
    displayName: "OpenCode",
    shortCode: "OC",
    globalSkillsDir: path.join(home, ".opencode", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".opencode")),
  },
  openclaw: {
    name: "openclaw",
    displayName: "OpenClaw",
    shortCode: "OW",
    globalSkillsDir: path.join(home, ".openclaw", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".openclaw"))) ||
      (await dirExists(path.join(home, ".clawdbot"))) ||
      (await dirExists(path.join(home, ".moltbot"))),
  },
  "pear-ai": {
    name: "pear-ai",
    displayName: "Pear AI",
    shortCode: "PA",
    globalSkillsDir: path.join(home, ".pear-ai", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".pear-ai")),
  },
  "roo-code": {
    name: "roo-code",
    displayName: "Roo Code",
    shortCode: "RC",
    globalSkillsDir: path.join(home, ".roo-code", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".roo-code")),
  },
  trae: {
    name: "trae",
    displayName: "Trae",
    shortCode: "TR",
    globalSkillsDir: path.join(home, ".trae", "skills"),
    detectInstalled: () => dirExists(path.join(home, ".trae")),
  },
  zed: {
    name: "zed",
    displayName: "Zed",
    shortCode: "ZD",
    globalSkillsDir: path.join(configHome, "zed", "skills"),
    detectInstalled: () => dirExists(path.join(configHome, "zed")),
  },
  universal: {
    name: "universal",
    displayName: "Universal (.agents/skills)",
    shortCode: "UA",
    globalSkillsDir: path.join(home, ".agents", "skills"),
    detectInstalled: async () => true,
  },
}

// ---------------------------------------------------------------------------
// Lock file reading (mirrored from packages/cli/src/core/skill-lock.ts)
// ---------------------------------------------------------------------------

const LOCK_FILE_VERSION = 1
const LOCK_FILE_PATH = path.join(home, ".agents", ".skill-lock.json")
const CANONICAL_SKILLS_DIR = path.join(home, ".agents", "skills")

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
  try {
    const raw = await fs.readFile(LOCK_FILE_PATH, "utf-8")
    const data = JSON.parse(raw) as SkillLockFile
    if (data.version !== LOCK_FILE_VERSION) {
      return { version: LOCK_FILE_VERSION, skills: {} }
    }
    return data
  } catch {
    return { version: LOCK_FILE_VERSION, skills: {} }
  }
}

async function writeSkillLock(lock: SkillLockFile): Promise<void> {
  await fs.mkdir(path.dirname(LOCK_FILE_PATH), { recursive: true })
  await fs.writeFile(LOCK_FILE_PATH, JSON.stringify(lock, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// Auth (mirrors packages/cli/src/utils/auth-store.ts and constants.ts)
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.SKILLSGATE_API_URL ?? "https://skillsgate.ai"
const AUTH_DIR = path.join(home, ".skillsgate")
const AUTH_FILE_PATH = path.join(home, ".skillsgate", "auth.json")

interface StoredAuth {
  token: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface ExchangeResponse {
  access_token: string
  user: { id: string; name: string; email: string; image?: string }
}

// Auth stored in shared SQLite (syncs with TUI)
const AUTH_TOKEN_KEY = "auth.token"
const AUTH_USER_KEY = "auth.user"

function loadAuth(): StoredAuth | null {
  try {
    const token = settingsStore?.get<string | null>(AUTH_TOKEN_KEY, null)
    const user = settingsStore?.get<StoredAuth["user"] | null>(AUTH_USER_KEY, null)
    if (token && user) return { token, user }

    // Fallback: try legacy file-based auth and migrate
    try {
      const raw = require("fs").readFileSync(AUTH_FILE_PATH, "utf-8")
      const data = JSON.parse(raw) as StoredAuth
      if (data.user && data.token) {
        // Migrate to SQLite
        settingsStore?.set(AUTH_TOKEN_KEY, data.token)
        settingsStore?.set(AUTH_USER_KEY, data.user)
        return data
      }
    } catch {}

    return null
  } catch {
    return null
  }
}

function saveAuthToDb(data: StoredAuth): void {
  settingsStore?.set(AUTH_TOKEN_KEY, data.token)
  settingsStore?.set(AUTH_USER_KEY, data.user)
  // Also write legacy file for CLI compatibility
  require("fs").mkdirSync(AUTH_DIR, { recursive: true })
  require("fs").writeFileSync(AUTH_FILE_PATH, JSON.stringify(data, null, 2), "utf-8")
}

function clearAuthFromDb(): void {
  settingsStore?.set(AUTH_TOKEN_KEY, null)
  settingsStore?.set(AUTH_USER_KEY, null)
  try { require("fs").unlinkSync(AUTH_FILE_PATH) } catch {}
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
// Helpers
// ---------------------------------------------------------------------------

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Detect all installed agents on this machine */
async function detectAgents(): Promise<
  Array<{ name: string; displayName: string; shortCode: string }>
> {
  const detected: Array<{
    name: string
    displayName: string
    shortCode: string
  }> = []
  for (const agent of Object.values(agentRegistry)) {
    try {
      if (await agent.detectInstalled()) {
        detected.push({
          name: agent.name,
          displayName: agent.displayName,
          shortCode: agent.shortCode,
        })
      }
    } catch {
      // Skip agents that fail detection
    }
  }
  return detected
}

/** Scan all detected agents for installed skills, merging with lock file data */
async function listInstalledSkills(): Promise<
  Array<{
    name: string
    description: string
    path: string
    agents: string[]
    agentShortCodes: string[]
    source?: string
    sourceType?: string
    installedAt?: string
    updatedAt?: string
  }>
> {
  const lock = await readSkillLock()
  const skillMap = new Map<
    string,
    {
      name: string
      description: string
      path: string
      agents: string[]
      agentShortCodes: string[]
      source?: string
      sourceType?: string
      installedAt?: string
      updatedAt?: string
      folderName: string
    }
  >()

  for (const agent of Object.values(agentRegistry)) {
    const skillsDir = agent.globalSkillsDir
    try {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

        // For symlinks, resolve the actual path to read SKILL.md
        let skillDir = path.join(skillsDir, entry.name)
        try {
          const realPath = await fs.realpath(skillDir)
          // Check if the resolved path still exists
          await fs.stat(realPath)
          skillDir = realPath
        } catch {
          // Broken symlink or unresolvable - skip
          continue
        }

        const skillMdPath = path.join(skillDir, "SKILL.md")
        const parsed = await parseSkillMd(skillMdPath)

        const skillName = parsed?.name || entry.name
        const existing = skillMap.get(skillName)

        if (existing) {
          if (!existing.agents.includes(agent.displayName)) {
            existing.agents.push(agent.displayName)
            existing.agentShortCodes.push(agent.shortCode)
          }
        } else {
          const lockEntry = lock.skills[entry.name]
          skillMap.set(skillName, {
            name: skillName,
            description: parsed?.description || "",
            path: skillDir,
            agents: [agent.displayName],
            agentShortCodes: [agent.shortCode],
            source: lockEntry?.source,
            sourceType: lockEntry?.sourceType,
            installedAt: lockEntry?.installedAt,
            updatedAt: lockEntry?.updatedAt,
            folderName: entry.name,
          })
        }
      }
    } catch {
      // Directory does not exist or is not readable
    }
  }

  return Array.from(skillMap.values()).map(({ folderName: _, ...rest }) => rest)
}

// ---------------------------------------------------------------------------
// Git clone helper (uses system git to avoid simple-git dependency)
// ---------------------------------------------------------------------------

function gitClone(
  url: string,
  dest: string,
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    execFile(
      "git",
      ["clone", "--depth", "1", url, dest],
      { timeout: 60_000 },
      (error) => {
        if (error) {
          resolve({ success: false, error: error.message })
        } else {
          resolve({ success: true })
        }
      },
    )
  })
}

// ---------------------------------------------------------------------------
// Source parser (mirrored from packages/cli/src/core/source-parser.ts)
// ---------------------------------------------------------------------------

interface ParsedSource {
  type: "github" | "local"
  owner: string
  repo: string
  url: string
  subpath?: string
  ref?: string
}

function parseSource(source: string): ParsedSource | null {
  // GitHub URL
  if (
    source.startsWith("https://github.com/") ||
    source.startsWith("github.com/")
  ) {
    let url = source
    if (url.startsWith("github.com/")) url = `https://${url}`
    try {
      const parsed = new URL(url)
      const parts = parsed.pathname.split("/").filter(Boolean)
      if (parts.length < 2) return null
      return {
        type: "github",
        owner: parts[0],
        repo: parts[1],
        url: `https://github.com/${parts[0]}/${parts[1]}`,
      }
    } catch {
      return null
    }
  }

  // owner/repo shorthand
  const match = source.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)$/)
  if (match) {
    return {
      type: "github",
      owner: match[1],
      repo: match[2],
      url: `https://github.com/${match[1]}/${match[2]}`,
    }
  }

  // Local path
  if (
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("/") ||
    source.startsWith("~/")
  ) {
    let resolved = source
    if (resolved.startsWith("~/")) {
      resolved = path.join(home, resolved.slice(2))
    }
    resolved = path.resolve(resolved)
    return {
      type: "local",
      owner: "",
      repo: path.basename(resolved),
      url: resolved,
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Skill discovery in a directory tree
// ---------------------------------------------------------------------------

const SKILL_MD = "SKILL.md"
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "__pycache__"])

async function discoverSkillsInDir(
  dir: string,
  depth = 0,
  maxDepth = 5,
): Promise<ParsedSkill[]> {
  if (depth > maxDepth) return []

  const skills: ParsedSkill[] = []

  // Check if this directory has a SKILL.md
  const skillMdPath = path.join(dir, SKILL_MD)
  if (await fileExists(skillMdPath)) {
    const parsed = await parseSkillMd(skillMdPath)
    if (parsed) skills.push(parsed)
    // If at root and found a skill, don't recurse further
    if (depth === 0 && skills.length > 0) return skills
  }

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (SKIP_DIRS.has(entry.name)) continue
      if (entry.name.startsWith(".") && depth > 0) continue

      const subSkills = await discoverSkillsInDir(
        path.join(dir, entry.name),
        depth + 1,
        maxDepth,
      )
      skills.push(...subSkills)
    }
  } catch {
    // Directory not readable
  }

  return skills
}

// ---------------------------------------------------------------------------
// Install skill files to an agent directory (symlink with copy fallback)
// ---------------------------------------------------------------------------

async function installSkillToAgent(
  skillDir: string,
  skillName: string,
  agent: AgentEntry,
): Promise<{ success: boolean; error?: string }> {
  const safeName = sanitizeName(skillName)
  const agentTargetDir = path.join(agent.globalSkillsDir, safeName)
  const canonicalDir = path.join(CANONICAL_SKILLS_DIR, safeName)

  try {
    // Ensure agent skills directory exists
    await fs.mkdir(agent.globalSkillsDir, { recursive: true })

    // If the agent IS the universal agent, the canonical dir IS the target
    if (path.resolve(agentTargetDir) === path.resolve(canonicalDir)) {
      // Copy skill files directly to the canonical dir
      await fs.rm(canonicalDir, { recursive: true, force: true }).catch(() => {})
      await fs.cp(skillDir, canonicalDir, { recursive: true })
      return { success: true }
    }

    // Ensure canonical dir has the skill
    if (!(await dirExists(canonicalDir))) {
      await fs.cp(skillDir, canonicalDir, { recursive: true })
    }

    // Try symlink from agent dir to canonical dir
    try {
      // Remove existing target
      try {
        const stat = await fs.lstat(agentTargetDir)
        if (stat.isSymbolicLink()) {
          await fs.unlink(agentTargetDir)
        } else {
          await fs.rm(agentTargetDir, { recursive: true, force: true })
        }
      } catch {
        // Target doesn't exist, that's fine
      }

      const relativePath = path.relative(
        path.dirname(agentTargetDir),
        canonicalDir,
      )
      const type = process.platform === "win32" ? "junction" : undefined
      await fs.symlink(relativePath, agentTargetDir, type)
      return { success: true }
    } catch {
      // Symlink failed, fall back to copy
      await fs.rm(agentTargetDir, { recursive: true, force: true }).catch(
        () => {},
      )
      await fs.cp(skillDir, agentTargetDir, { recursive: true })
      return { success: true }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ---------------------------------------------------------------------------
// IPC Handlers
// ---------------------------------------------------------------------------

// Initialize SQLite stores (lazy, created on first registerIpcHandlers call)
let settingsStore: SettingsStore
let serverStore: RemoteServerStore
let skillStore: RemoteSkillStore

export function registerIpcHandlers(): void {
  // Open shared SQLite database
  const db = openDb()
  settingsStore = new SettingsStore(db)
  serverStore = new RemoteServerStore(db)
  skillStore = new RemoteSkillStore(db)
  // Detect which agents are installed on this machine
  ipcMain.handle("agents:detect", async () => {
    return detectAgents()
  })

  // List all installed skills across all detected agents
  ipcMain.handle("skills:list-installed", async () => {
    return listInstalledSkills()
  })

  // Read the content of a skill's SKILL.md file
  ipcMain.handle("skill:read-content", async (_event, skillPath: string) => {
    const skillMdPath = path.join(skillPath, "SKILL.md")
    try {
      return await fs.readFile(skillMdPath, "utf-8")
    } catch {
      // If skillPath itself is a file, try reading it directly
      try {
        return await fs.readFile(skillPath, "utf-8")
      } catch {
        return ""
      }
    }
  })

  // Install a skill from a source (GitHub owner/repo, URL, or local path)
  ipcMain.handle(
    "skills:install",
    async (
      _event,
      source: string,
      agentNames: string[],
      _scope: string,
    ): Promise<
      Array<{ skillName: string; agent: string; success: boolean; error?: string }>
    > => {
      const parsed = parseSource(source)
      if (!parsed) {
        return [
          {
            skillName: source,
            agent: "unknown",
            success: false,
            error: `Could not parse source: "${source}". Expected owner/repo, GitHub URL, or local path.`,
          },
        ]
      }

      let sourceDir: string
      let tmpDir: string | null = null

      if (parsed.type === "github") {
        // Clone repository to temp directory
        tmpDir = path.join(os.tmpdir(), `skillsgate-${Date.now()}`)
        const cloneResult = await gitClone(`${parsed.url}.git`, tmpDir)
        if (!cloneResult.success) {
          return [
            {
              skillName: source,
              agent: "unknown",
              success: false,
              error: `Clone failed: ${cloneResult.error}`,
            },
          ]
        }
        sourceDir = tmpDir
      } else {
        sourceDir = parsed.url
      }

      // Discover skills in the source
      const discovered = await discoverSkillsInDir(sourceDir)
      if (discovered.length === 0) {
        // Cleanup temp dir
        if (tmpDir) {
          await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
        }
        return [
          {
            skillName: source,
            agent: "unknown",
            success: false,
            error: "No SKILL.md files found in source.",
          },
        ]
      }

      // Determine target agents
      const targetAgents: AgentEntry[] = []
      if (agentNames.length === 0) {
        // Install to all detected agents
        const detected = await detectAgents()
        for (const d of detected) {
          const entry = agentRegistry[d.name]
          if (entry) targetAgents.push(entry)
        }
      } else {
        for (const name of agentNames) {
          const entry = agentRegistry[name]
          if (entry) targetAgents.push(entry)
        }
      }

      const results: Array<{
        skillName: string
        agent: string
        success: boolean
        error?: string
      }> = []

      const lock = await readSkillLock()
      const now = new Date().toISOString()

      for (const skill of discovered) {
        const skillDir = path.dirname(skill.filePath)

        for (const agent of targetAgents) {
          const result = await installSkillToAgent(skillDir, skill.name, agent)
          results.push({
            skillName: skill.name,
            agent: agent.displayName,
            success: result.success,
            error: result.error,
          })
        }

        // Update lock file
        const safeName = sanitizeName(skill.name)
        const existing = lock.skills[safeName]
        lock.skills[safeName] = {
          source:
            parsed.type === "github"
              ? `${parsed.owner}/${parsed.repo}`
              : parsed.url,
          sourceType: parsed.type,
          originalUrl: source,
          skillFolderHash: "",
          installedAt: existing?.installedAt || now,
          updatedAt: now,
        }
      }

      await writeSkillLock(lock)

      // Cleanup temp dir
      if (tmpDir) {
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
      }

      return results
    },
  )

  // Remove a skill from all agents + canonical dir + lock file
  ipcMain.handle("skills:remove", async (_event, name: string) => {
    const safeName = sanitizeName(name)

    // Remove from all agent directories
    for (const agent of Object.values(agentRegistry)) {
      const targetDir = path.join(agent.globalSkillsDir, safeName)
      try {
        const stat = await fs.lstat(targetDir)
        if (stat.isSymbolicLink()) {
          await fs.unlink(targetDir)
        } else {
          await fs.rm(targetDir, { recursive: true, force: true })
        }
      } catch {
        // Directory doesn't exist for this agent
      }
    }

    // Remove canonical directory
    const canonicalDir = path.join(CANONICAL_SKILLS_DIR, safeName)
    try {
      await fs.rm(canonicalDir, { recursive: true, force: true })
    } catch {
      // Best effort
    }

    // Remove from lock file
    const lock = await readSkillLock()
    delete lock.skills[safeName]
    await writeSkillLock(lock)
  })

  // Update a skill (re-install from source)
  ipcMain.handle("skills:update", async (_event, name: string) => {
    const safeName = sanitizeName(name)
    const lock = await readSkillLock()
    const entry = lock.skills[safeName]

    if (!entry?.originalUrl) {
      throw new Error(`No source recorded for skill "${name}". Cannot update.`)
    }

    // Re-install from the original source
    // This triggers the install handler logic internally
    const detected = await detectAgents()
    const agentNames = detected.map((a) => a.name)

    const parsed = parseSource(entry.originalUrl)
    if (!parsed) {
      throw new Error(`Cannot parse stored source: "${entry.originalUrl}"`)
    }

    let sourceDir: string
    let tmpDir: string | null = null

    if (parsed.type === "github") {
      tmpDir = path.join(os.tmpdir(), `skillsgate-upd-${Date.now()}`)
      const cloneResult = await gitClone(`${parsed.url}.git`, tmpDir)
      if (!cloneResult.success) {
        throw new Error(`Clone failed: ${cloneResult.error}`)
      }
      sourceDir = tmpDir
    } else {
      sourceDir = parsed.url
    }

    const discovered = await discoverSkillsInDir(sourceDir)
    // Find the specific skill we're updating
    const target = discovered.find(
      (s) => sanitizeName(s.name) === safeName,
    )

    if (!target) {
      if (tmpDir) {
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
      }
      throw new Error(`Skill "${name}" not found in source.`)
    }

    const skillDir = path.dirname(target.filePath)

    for (const agentName of agentNames) {
      const agent = agentRegistry[agentName]
      if (agent) {
        await installSkillToAgent(skillDir, target.name, agent)
      }
    }

    // Update lock entry timestamp
    lock.skills[safeName] = {
      ...entry,
      updatedAt: new Date().toISOString(),
    }
    await writeSkillLock(lock)

    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    }
  })

  // -------------------------------------------------------------------------
  // Auth handlers
  // -------------------------------------------------------------------------

  // Load stored auth (shared with CLI)
  ipcMain.handle("auth:load", async () => {
    return loadAuth()
  })

  // Exchange a device code for an access token
  ipcMain.handle("auth:exchange", async (_event, code: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/device/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      const errorMsg =
        data?.error === "rate_limited"
          ? "Too many attempts. Wait a minute and try again."
          : data?.error === "invalid_code"
            ? "Invalid code. Check and try again."
            : data?.error === "expired"
              ? "Code has expired. Get a new one."
              : "Verification failed. Please try again."
      throw new Error(errorMsg)
    }

    const result = (await res.json()) as ExchangeResponse
    const stored: StoredAuth = {
      token: result.access_token,
      user: result.user,
    }
    saveAuthToDb(stored)
    return stored
  })

  // Logout
  ipcMain.handle("auth:logout", async () => {
    clearAuthFromDb()
  })

  // Open a URL in the default browser
  ipcMain.handle("auth:open-browser", async (_event, url: string) => {
    await shell.openExternal(url)
  })

  // -------------------------------------------------------------------------
  // Remote server handlers
  // -------------------------------------------------------------------------

  ipcMain.handle("servers:list", () => {
    const servers = serverStore.list()
    // Enrich with skill count
    return servers.map((s) => ({
      ...s,
      skillCount: skillStore.countByServer(s.id),
    }))
  })

  ipcMain.handle("servers:create", (_event, data) => {
    return serverStore.create(data)
  })

  ipcMain.handle("servers:update", (_event, id: string, fields) => {
    return serverStore.update(id, fields)
  })

  ipcMain.handle("servers:delete", (_event, id: string) => {
    serverStore.delete(id)
  })

  ipcMain.handle("servers:test", async (_event, id: string) => {
    const server = serverStore.get(id)
    if (!server) return { ok: false, error: "Server not found" }
    return testConnection(server)
  })

  ipcMain.handle("servers:sync", async (_event, id: string) => {
    const server = serverStore.get(id)
    if (!server) return { added: 0, updated: 0, removed: 0, unchanged: 0, error: "Server not found" }
    return syncRemoteServer({ remoteServers: serverStore, remoteSkills: skillStore }, server)
  })

  ipcMain.handle("servers:skills", (_event, serverId: string) => {
    return skillStore.listByServer(serverId)
  })

  ipcMain.handle("servers:count", () => {
    return serverStore.count()
  })

  // -------------------------------------------------------------------------
  // Settings handlers
  // -------------------------------------------------------------------------

  ipcMain.handle("settings:get", (_event, key: string, defaultValue: unknown) => {
    return settingsStore.get(key, defaultValue)
  })

  ipcMain.handle("settings:set", (_event, key: string, value: unknown) => {
    settingsStore.set(key, value)
  })

  ipcMain.handle("settings:all", () => {
    return settingsStore.getAll()
  })

  // -------------------------------------------------------------------------
  // Skill editing & management
  // -------------------------------------------------------------------------

  // Write skill content back to disk
  ipcMain.handle("skill:write-content", async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, "utf-8")
    } catch (err) {
      throw new Error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`)
    }
  })

  // Open skill folder in Finder/Explorer
  ipcMain.handle("skill:open-in-finder", (_, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  // Remove skill from a specific agent only (delete symlink, keep canonical)
  ipcMain.handle("skills:remove-from-agent", async (_, skillName: string, agentName: string) => {
    const safeName = sanitizeName(skillName)
    const agent = agentRegistry[agentName]
    if (!agent) throw new Error(`Unknown agent: ${agentName}`)
    const skillPath = path.join(agent.globalSkillsDir, safeName)
    try {
      await fs.rm(skillPath, { recursive: true, force: true })
    } catch (err) {
      throw new Error(`Failed to remove: ${err instanceof Error ? err.message : String(err)}`)
    }
  })
}

// Export for use by file-watcher
export { listInstalledSkills, detectAgents, agentRegistry }
