import { ipcMain, shell, type BrowserWindow } from "electron"
import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import { execFile, spawn } from "node:child_process"
import matter from "gray-matter"
import { app } from "electron"
import { openDb } from "./db/index"
import { SettingsStore } from "./db/settings"
import { RemoteServerStore } from "./db/servers"
import { RemoteSkillStore } from "./db/skills"
import { FavoritesStore } from "./db/favorites"
import { loadCachedSkills, saveCachedSkills } from "./db/skills-cache"
import {
  loadTrendingCache,
  saveTrendingCache,
  type TrendingSkill,
} from "./db/trending-cache"
import { testConnection, syncRemoteServer, readRemoteFile, writeRemoteFile } from "./db/ssh"
import { planPush, applyPush } from "./db/push"
import type { PushPreview } from "./db/push"
import { checkForAppUpdates, getUpdateState, quitAndInstallUpdate } from "./auto-updater"

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
const factoryHome = process.env.FACTORY_HOME || path.join(home, ".factory")
const ob1Home = process.env.OB1_HOME || path.join(home, ".ob1")


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
  "droid-cli": {
    name: "droid-cli",
    displayName: "Droid CLI",
    shortCode: "DR",
    globalSkillsDir: path.join(factoryHome, "skills"),
    detectInstalled: () => dirExists(factoryHome),
  },
  "ob-1": {
    name: "ob-1",
    displayName: "OB-1",
    shortCode: "OB1",
    globalSkillsDir: path.join(ob1Home, "skills"),
    detectInstalled: () => dirExists(ob1Home),
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
// SKILL.md parsing
// ---------------------------------------------------------------------------

interface ParsedSkill {
  name: string
  description: string
  filePath: string
}

interface SupportingFile {
  relativePath: string
  size: number
}

const CUSTOM_SCAN_PATHS_KEY = "scan.customPaths"
const DEFAULT_AGENTS_KEY = "install.defaultAgents"
const MIRROR_AGENTS_KEY = "sync.mirrorAgents"

const PROJECT_PROBES = [
  { subpath: ".claude/skills" },
  { subpath: ".cursor/skills" },
  { subpath: ".cursor/rules" },
  { subpath: ".codex/skills" },
  { subpath: ".github/skills" },
  { subpath: ".windsurf/skills" },
  { subpath: ".continue/skills" },
  { subpath: ".cline/skills" },
  { subpath: ".amp/skills" },
  { subpath: ".opencode/skills" },
  { subpath: ".goose/skills" },
  { subpath: ".junie/skills" },
  { subpath: ".kilo-code/skills" },
  { subpath: ".pear-ai/skills" },
  { subpath: ".roo-code/skills" },
  { subpath: ".trae/skills" },
  { subpath: ".zed/skills" },
  { subpath: ".agents/skills" },
]

// ---------------------------------------------------------------------------
// Agent detection cache
// ---------------------------------------------------------------------------

type DetectedAgentInfo = {
  name: string
  displayName: string
  shortCode: string
}

let cachedAgents: DetectedAgentInfo[] | null = null
let agentCacheTime = 0
let detectAgentsPromise: Promise<DetectedAgentInfo[]> | null = null
const AGENT_CACHE_TTL_MS = 60_000 // Re-detect at most once per minute

const supportingFilesCache = new Map<string, SupportingFile[]>()
const rescanInFlight = new Map<string, Promise<Array<Omit<InternalSkill, "folderName">>>>()
let cachedSkillsFingerprint: string | null = null
let lastBroadcastFingerprint: string | null = null

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

function getScopeForPath(resolvedPath: string): "global" | "project" | "custom" {
  const globalRoots = [
    CANONICAL_SKILLS_DIR,
    ...Object.values(agentRegistry).map((agent) => agent.globalSkillsDir),
  ].map((root) => path.resolve(root))

  if (globalRoots.some((root) => resolvedPath.startsWith(root))) {
    return "global"
  }

  if (resolvedPath.split(path.sep).some((segment) => segment.startsWith("."))) {
    return "project"
  }

  return "custom"
}

function getProjectNameForPath(resolvedPath: string): string | null {
  const parts = path.resolve(resolvedPath).split(path.sep).filter(Boolean)
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith(".")) {
      return parts[i - 1] || null
    }
  }
  return null
}

async function listSupportingFiles(skillDir: string): Promise<SupportingFile[]> {
  const resolvedSkillDir = await fs.realpath(skillDir).catch(() => path.resolve(skillDir))
  const cached = supportingFilesCache.get(resolvedSkillDir)
  if (cached) {
    return cached
  }

  const files: SupportingFile[] = []

  async function walk(currentDir: string, prefix = ""): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name)
      const relativePath = prefix ? path.join(prefix, entry.name) : entry.name

      if (entry.isDirectory()) {
        await walk(absolutePath, relativePath)
        continue
      }

      if (!entry.isFile() || relativePath === "SKILL.md") continue

      const stat = await fs.stat(absolutePath)
      files.push({
        relativePath: relativePath.split(path.sep).join("/"),
        size: stat.size,
      })
    }
  }

  try {
    await walk(resolvedSkillDir)
  } catch {
    return []
  }

  const sorted = files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  supportingFilesCache.set(resolvedSkillDir, sorted)
  return sorted
}

function clearSupportingFilesCache(skillDir?: string): void {
  if (!skillDir) {
    supportingFilesCache.clear()
    return
  }

  const resolved = path.resolve(skillDir)
  for (const key of supportingFilesCache.keys()) {
    if (key === resolved) {
      supportingFilesCache.delete(key)
    }
  }
}

function isSkillPathAllowed(resolvedPath: string): boolean {
  return (
    Object.values(agentRegistry).some((agent) =>
      resolvedPath.startsWith(path.resolve(agent.globalSkillsDir)),
    ) || resolvedPath.startsWith(path.resolve(CANONICAL_SKILLS_DIR))
  )
}

function getExpandedTargetAgents(requestedAgentNames: string[]): AgentEntry[] {
  ensureStores()
  const configuredDefaultAgents = settingsStore?.get<string[]>(DEFAULT_AGENTS_KEY, []) ?? []
  const configuredMirrorAgents = settingsStore?.get<string[]>(MIRROR_AGENTS_KEY, []) ?? []

  const baseNames =
    requestedAgentNames.length > 0
      ? requestedAgentNames
      : configuredDefaultAgents.length > 0
        ? configuredDefaultAgents
        : []

  const resolvedBaseNames = baseNames.length > 0 ? baseNames : Object.keys(agentRegistry)
  const finalNames = Array.from(
    new Set([...resolvedBaseNames, ...configuredMirrorAgents]),
  )

  return finalNames
    .map((name) => agentRegistry[name])
    .filter((value): value is AgentEntry => Boolean(value))
}

async function collectSkillsFromRoot(
  rootPath: string,
  scopeHint: "custom" | "project",
  lock: SkillLockFile,
): Promise<
  Array<{
    name: string
    description: string
    path: string
    canonicalPath: string
    agents: string[]
    agentShortCodes: string[]
    scope: "global" | "project" | "custom"
    projectName: string | null
    hasSupportingFiles: boolean
    supportingFiles: SupportingFile[]
    source?: string
    sourceType?: string
    installedAt?: string
    updatedAt?: string
    folderName: string
  }>
> {
  const results: Array<{
    name: string
    description: string
    path: string
    canonicalPath: string
    agents: string[]
    agentShortCodes: string[]
    scope: "global" | "project" | "custom"
    projectName: string | null
    hasSupportingFiles: boolean
    supportingFiles: SupportingFile[]
    source?: string
    sourceType?: string
    installedAt?: string
    updatedAt?: string
    folderName: string
  }> = []

  const resolvedRoot = path.resolve(rootPath.replace(/^~(?=$|\/|\\)/, home))
  async function maybeCollectSkillDir(skillDir: string, scope: "project" | "custom") {
    const skillMdPath = path.join(skillDir, "SKILL.md")
    if (!(await fileExists(skillMdPath))) return

    const canonicalPath = await fs.realpath(skillDir).catch(() => skillDir)
    const parsed = await parseSkillMd(skillMdPath)
    const folderName = path.basename(skillDir)
    const lockEntry = lock.skills[folderName]

    results.push({
      name: parsed?.name || folderName,
      description: parsed?.description || "",
      path: skillDir,
      canonicalPath,
      agents: [],
      agentShortCodes: [],
      scope,
      projectName: scope === "project" ? getProjectNameForPath(skillDir) : null,
      hasSupportingFiles: false,
      supportingFiles: [],
      source: lockEntry?.source,
      sourceType: lockEntry?.sourceType,
      installedAt: lockEntry?.installedAt,
      updatedAt: lockEntry?.updatedAt,
      folderName,
    })
  }

  await maybeCollectSkillDir(resolvedRoot, scopeHint)

  let rootEntries: Awaited<ReturnType<typeof fs.readdir>> = []
  try {
    rootEntries = await fs.readdir(resolvedRoot, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of rootEntries) {
    if (!entry.isDirectory()) continue
    const full = path.join(resolvedRoot, entry.name)
    await maybeCollectSkillDir(full, scopeHint)
  }

  for (const entry of rootEntries) {
    if (!entry.isDirectory()) continue
    const projectRoot = path.join(resolvedRoot, entry.name)
    for (const probe of PROJECT_PROBES) {
      const probeDir = path.join(projectRoot, probe.subpath)
      let entries: Awaited<ReturnType<typeof fs.readdir>> = []
      try {
        entries = await fs.readdir(probeDir, { withFileTypes: true })
      } catch {
        continue
      }
      for (const skillEntry of entries) {
        if (!skillEntry.isDirectory()) continue
        await maybeCollectSkillDir(path.join(probeDir, skillEntry.name), "project")
      }
    }
  }

  return results
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
async function detectAgents(): Promise<DetectedAgentInfo[]> {
  const now = Date.now()
  if (cachedAgents && now - agentCacheTime < AGENT_CACHE_TTL_MS) {
    return cachedAgents
  }

  if (detectAgentsPromise) {
    return detectAgentsPromise
  }

  detectAgentsPromise = (async () => {
    const detected: DetectedAgentInfo[] = []
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

    cachedAgents = detected
    agentCacheTime = Date.now()
    return detected
  })()

  try {
    return await detectAgentsPromise
  } finally {
    detectAgentsPromise = null
  }
}

async function getDetectedAgentEntries(): Promise<AgentEntry[]> {
  const detected = await detectAgents()
  return detected
    .map((agent) => agentRegistry[agent.name])
    .filter((value): value is AgentEntry => Boolean(value))
}

/** Scan all detected agents for installed skills, merging with lock file data.
 *  Returns the full internal shape including folderName (needed for caching). */
async function listInstalledSkillsInternal(
  opts: {
    skipCustomPaths?: boolean
    agents?: AgentEntry[]
    lock?: SkillLockFile
  } = {},
): Promise<
  Array<{
    name: string
    description: string
    path: string
    canonicalPath: string
    agents: string[]
    agentShortCodes: string[]
    scope: "global" | "project" | "custom"
    projectName: string | null
    hasSupportingFiles: boolean
    supportingFiles: SupportingFile[]
    source?: string
    sourceType?: string
    installedAt?: string
    updatedAt?: string
    folderName: string
  }>
> {
  const lock = opts.lock ?? await readSkillLock()
  const skillMap = new Map<
    string,
    {
      name: string
      description: string
      path: string
      canonicalPath: string
      agents: string[]
      agentShortCodes: string[]
      scope: "global" | "project" | "custom"
      projectName: string | null
      hasSupportingFiles: boolean
      supportingFiles: SupportingFile[]
      source?: string
      sourceType?: string
      installedAt?: string
      updatedAt?: string
      folderName: string
    }
  >()

  const agentsToScan = opts.agents ?? await getDetectedAgentEntries()

  for (const agent of agentsToScan) {
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

        // A directory without a SKILL.md is not a skill, it is a grouping folder
        // (e.g. ~/.claude/skills/<group>/<skill>/). This branch used to take it
        // anyway and fall back to the folder name (parsed?.name || entry.name),
        // which caused two problems:
        //   1. a ghost entry in the list that always reports "this skill may not
        //      have a SKILL.md file" on open -- it genuinely does not have one;
        //   2. the real skills inside the group were never listed at all.
        // The custom scan path branch (maybeCollectSkillDir) already skips
        // directories without a SKILL.md, so align with it here, and descend one
        // level so grouped skills are still discovered.
        if (!(await fileExists(skillMdPath))) {
          // Deliberately not annotated: Awaited<ReturnType<typeof fs.readdir>>
          // resolves to the Buffer overload, which is exactly what the existing
          // Dirent<NonSharedBuffer> errors in this file come from. Let TS infer.
          let nested
          try {
            nested = await fs.readdir(skillDir, { withFileTypes: true })
          } catch {
            continue
          }
          for (const child of nested) {
            if (!child.isDirectory() && !child.isSymbolicLink()) continue
            const childDir = path.join(skillDir, child.name)
            if (!(await fileExists(path.join(childDir, "SKILL.md")))) continue
            const childParsed = await parseSkillMd(path.join(childDir, "SKILL.md"))
            if (skillMap.has(childDir)) continue
            const childLock = lock.skills[child.name]
            skillMap.set(childDir, {
              name: childParsed?.name || child.name,
              description: childParsed?.description || "",
              path: childDir,
              canonicalPath: childDir,
              agents: [agent.displayName],
              agentShortCodes: [agent.shortCode],
              scope: getScopeForPath(childDir),
              projectName: null,
              hasSupportingFiles: false,
              supportingFiles: [],
              source: childLock?.source,
              sourceType: childLock?.sourceType,
              installedAt: childLock?.installedAt,
              updatedAt: childLock?.updatedAt,
              folderName: child.name,
            })
          }
          continue
        }

        const parsed = await parseSkillMd(skillMdPath)
        const supportingFiles: SupportingFile[] = []
        const scope = getScopeForPath(skillDir)
        const projectName =
          scope === "project" ? getProjectNameForPath(skillDir) : null

        const skillName = parsed?.name || entry.name
        const existing = skillMap.get(skillDir)

        if (existing) {
          if (!existing.agents.includes(agent.displayName)) {
            existing.agents.push(agent.displayName)
            existing.agentShortCodes.push(agent.shortCode)
          }
        } else {
          const lockEntry = lock.skills[entry.name]
          skillMap.set(skillDir, {
            name: skillName,
            description: parsed?.description || "",
            path: skillDir,
            canonicalPath: skillDir,
            agents: [agent.displayName],
            agentShortCodes: [agent.shortCode],
            scope,
            projectName,
            hasSupportingFiles: false,
            supportingFiles: [],
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

  if (!opts.skipCustomPaths) {
    ensureStores()
    const customScanPaths = settingsStore?.get<string[]>(CUSTOM_SCAN_PATHS_KEY, []) ?? []
    for (const customPath of customScanPaths) {
      const collected = await collectSkillsFromRoot(customPath, "custom", lock)
      for (const item of collected) {
        if (!skillMap.has(item.canonicalPath)) {
          skillMap.set(item.canonicalPath, item)
        }
      }
    }
  }

  return Array.from(skillMap.values())
}

/** Internal skill type that includes folderName for cache storage. */
type InternalSkill = Awaited<ReturnType<typeof listInstalledSkillsInternal>>[number]

/** Strip the internal folderName field before sending to the renderer. */
function toRendererSkills(skills: InternalSkill[]) {
  return skills.map(
    ({ folderName: _, ...rest }) => rest,
  ) as Array<Omit<InternalSkill, "folderName">>
}

/** Backward-compatible wrapper -- returns the renderer-safe shape. */
async function listInstalledSkills() {
  const raw = await listInstalledSkillsInternal()
  return toRendererSkills(raw)
}

function createSkillsFingerprint(skills: InternalSkill[]): string {
  return JSON.stringify(
    [...skills]
      .sort((a, b) => a.canonicalPath.localeCompare(b.canonicalPath))
      .map((skill) => ({
        canonicalPath: skill.canonicalPath,
        name: skill.name,
        description: skill.description,
        agents: [...skill.agents].sort(),
        agentShortCodes: [...skill.agentShortCodes].sort(),
        scope: skill.scope,
        projectName: skill.projectName,
        hasSupportingFiles: skill.hasSupportingFiles,
        supportingFiles: [...skill.supportingFiles].sort((a, b) =>
          a.relativePath.localeCompare(b.relativePath),
        ),
        source: skill.source,
        sourceType: skill.sourceType,
        installedAt: skill.installedAt,
        updatedAt: skill.updatedAt,
        folderName: skill.folderName,
      })),
  )
}

function getCachedSkillsFingerprint(): string {
  if (cachedSkillsFingerprint === null) {
    cachedSkillsFingerprint = createSkillsFingerprint(
      loadCachedSkills() as InternalSkill[],
    )
  }
  return cachedSkillsFingerprint
}

function persistCachedSkills(raw: InternalSkill[]): string {
  const fingerprint = createSkillsFingerprint(raw)
  if (fingerprint !== getCachedSkillsFingerprint()) {
    saveCachedSkills(raw)
    cachedSkillsFingerprint = fingerprint
  }
  return fingerprint
}

function maybeBroadcastSkills(
  raw: InternalSkill[],
  fingerprint: string,
  broadcast: boolean,
): void {
  if (!broadcast || fingerprint === lastBroadcastFingerprint) {
    return
  }

  if (_mainWindow && !_mainWindow.isDestroyed()) {
    _mainWindow.webContents.send("skills:updated", toRendererSkills(raw))
  }
  lastBroadcastFingerprint = fingerprint
}

async function runRescan(
  key: string,
  run: () => Promise<InternalSkill[]>,
  broadcast: boolean,
): Promise<Array<Omit<InternalSkill, "folderName">>> {
  const inFlight = rescanInFlight.get(key)
  if (inFlight) {
    return inFlight
  }

  const task = (async () => {
    const raw = await run()
    clearSupportingFilesCache()
    const fingerprint = persistCachedSkills(raw)
    maybeBroadcastSkills(raw, fingerprint, broadcast)
    return toRendererSkills(raw)
  })().finally(() => {
    rescanInFlight.delete(key)
  })

  rescanInFlight.set(key, task)
  return task
}

// ---------------------------------------------------------------------------
// Skills cache: rescan, save, and push to renderer
// ---------------------------------------------------------------------------

let _mainWindow: BrowserWindow | null = null

/** Called from the main process to provide a window reference for pushing events. */
export function setMainWindow(win: BrowserWindow): void {
  _mainWindow = win
}

/**
 * Run a filesystem scan, persist results to the SQLite cache,
 * and push the updated list to the renderer via the skills:updated event.
 *
 * Pass { skipCustomPaths: true } from the file watcher to avoid
 * walking potentially large custom scan directories on every change.
 */
async function rescanAndCache(
  opts: { skipCustomPaths?: boolean; broadcast?: boolean } = {},
) {
  const key = opts.skipCustomPaths ? "quick" : "full"
  return runRescan(
    key,
    async () => {
      const [agents, lock] = await Promise.all([
        getDetectedAgentEntries(),
        readSkillLock(),
      ])
      return listInstalledSkillsInternal({
        skipCustomPaths: opts.skipCustomPaths,
        agents,
        lock,
      })
    },
    opts.broadcast ?? true,
  )
}

/**
 * Re-scan a single skill by folder name across all agent directories.
 * Falls back to full rescan if the skill can't be identified.
 */
async function rescanSingleSkill(changedPath: string): Promise<void> {
  // Extract the skill folder name from the changed path.
  // Changed paths look like: "skill-folder-name/SKILL.md" or "skill-folder-name"
  const segments = changedPath.split(path.sep).filter(Boolean)
  const skillFolderName = segments[0]

  if (!skillFolderName || skillFolderName.startsWith(".")) {
    // Ambiguous change (root-level or hidden dir) -- full rescan
    await rescanAndCache()
    return
  }

  // Load current cache
  const cached = loadCachedSkills()
  const existingIdx = cached.findIndex((s) => s.folderName === skillFolderName)

  // Re-scan just this skill across all agents
  const [lock, agentsToScan] = await Promise.all([
    readSkillLock(),
    getDetectedAgentEntries(),
  ])
  const agents: string[] = []
  const agentShortCodes: string[] = []
  let resolvedDir: string | null = null
  let parsed: ParsedSkill | null = null

  for (const agent of agentsToScan) {
    const skillDir = path.join(agent.globalSkillsDir, skillFolderName)
    try {
      const realPath = await fs.realpath(skillDir)
      await fs.stat(realPath)
      if (!resolvedDir) {
        resolvedDir = realPath
        const skillMdPath = path.join(realPath, "SKILL.md")
        parsed = await parseSkillMd(skillMdPath)
      }
      agents.push(agent.displayName)
      agentShortCodes.push(agent.shortCode)
    } catch {
      // Not present in this agent
    }
  }

  if (resolvedDir && parsed && agents.length > 0) {
    const lockEntry = lock.skills[skillFolderName]
    const scope = getScopeForPath(resolvedDir)
    const updatedSkill = {
      name: parsed.name,
      description: parsed.description,
      path: resolvedDir,
      canonicalPath: resolvedDir,
      agents,
      agentShortCodes,
      scope,
      projectName: scope === "project" ? getProjectNameForPath(resolvedDir) : null,
      hasSupportingFiles: false,
      supportingFiles: [] as SupportingFile[],
      source: lockEntry?.source,
      sourceType: lockEntry?.sourceType,
      installedAt: lockEntry?.installedAt,
      updatedAt: lockEntry?.updatedAt,
      folderName: skillFolderName,
    }

    if (existingIdx >= 0) {
      cached[existingIdx] = updatedSkill
    } else {
      cached.push(updatedSkill)
    }
  } else if (existingIdx >= 0) {
    // Skill was deleted
    cached.splice(existingIdx, 1)
  } else {
    // Can't resolve -- full rescan
    await rescanAndCache()
    return
  }

  clearSupportingFilesCache(resolvedDir ?? undefined)
  const fingerprint = persistCachedSkills(cached as InternalSkill[])
  maybeBroadcastSkills(cached as InternalSkill[], fingerprint, true)
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
      { timeout: 60_000, env: buildCliEnv() },
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
// Trending scrape (mirrored from packages/cli/src/core/skills-sh-client.ts)
//
// The trending listing has no JSON API, so we read the trending page HTML and
// extract the embedded skill payload. The page lives on the www host (the apex
// host serves the JSON search API). Results arrive ranked by install count.
// ---------------------------------------------------------------------------

const SKILLS_SH_TRENDING_URL = "https://www.skills.sh/trending"

const TRENDING_SKILL_RE =
  /\{"source":"[^"]*","skillId":"[^"]*","name":"[^"]*","installs":\d+(?:,"isOfficial":(?:true|false))?\}/g

/**
 * Extract skills from the trending page HTML. The skill objects live inside JS
 * string literals (a server-rendered framework payload), so JSON quotes arrive
 * escaped as \"; we unescape, pull out each object, and decode it. Page order
 * (install-count descending) is preserved and duplicates are dropped.
 */
function parseTrending(html: string): TrendingSkill[] {
  const unescaped = html.replace(/\\"/g, '"')
  const seen = new Set<string>()
  const result: TrendingSkill[] = []

  for (const match of unescaped.match(TRENDING_SKILL_RE) ?? []) {
    let obj: Omit<TrendingSkill, "id">
    try {
      obj = JSON.parse(match)
    } catch {
      continue
    }
    const id = `${obj.source}/${obj.skillId}`
    if (seen.has(id)) continue
    seen.add(id)
    result.push({ ...obj, id })
  }

  return result
}

/**
 * Scrape the skills.sh trending page for the most-installed skills.
 * Throws on a bad response or an empty parse so callers can fall back.
 */
async function fetchTrending(): Promise<TrendingSkill[]> {
  const res = await fetch(SKILLS_SH_TRENDING_URL, {
    headers: {
      "User-Agent": "SkillsGate (+https://github.com/skillsgate/skillsgate)",
    },
  })
  if (!res.ok) {
    throw new Error(`skills.sh trending failed (HTTP ${res.status})`)
  }

  const skills = parseTrending(await res.text())
  if (skills.length === 0) {
    throw new Error("skills.sh trending returned no skills")
  }
  return skills
}

// ---------------------------------------------------------------------------
// IPC Handlers
// ---------------------------------------------------------------------------

// Initialize SQLite stores lazily so cold start is not blocked on DB open.
let settingsStore!: SettingsStore
let serverStore!: RemoteServerStore
let skillStore!: RemoteSkillStore
let favoritesStore!: FavoritesStore

function ensureStores(): void {
  if (settingsStore && serverStore && skillStore && favoritesStore) {
    return
  }

  const db = openDb()
  settingsStore ??= new SettingsStore(db)
  serverStore ??= new RemoteServerStore(db)
  skillStore ??= new RemoteSkillStore(db)
  favoritesStore ??= new FavoritesStore(db)
}

const COMMON_BIN_DIRS =
  process.platform === "win32"
    ? [
        path.join(process.env.APPDATA ?? "", "npm"),
        path.join(process.env.ProgramFiles ?? "C:\\Program Files", "nodejs"),
        path.join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "nodejs"),
      ].filter(Boolean)
    : [
        "/opt/homebrew/bin",
        "/opt/homebrew/sbin",
        "/usr/local/bin",
        "/usr/local/sbin",
        "/usr/bin",
        "/bin",
        "/usr/sbin",
        "/sbin",
      ]

function dedupePathEntries(entries: string[]): string {
  return [...new Set(entries.filter(Boolean))].join(path.delimiter)
}

function buildCliEnv(): NodeJS.ProcessEnv {
  const currentPath = process.env.PATH?.split(path.delimiter) ?? []
  return {
    ...process.env,
    PATH: dedupePathEntries([...currentPath, ...COMMON_BIN_DIRS]),
  }
}

function execFileAsync(
  file: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { env }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

async function resolveNpxPath(): Promise<string> {
  const env = buildCliEnv()
  const isWindows = process.platform === "win32"

  try {
    const { stdout } = isWindows
      ? await execFileAsync("where.exe", ["npx"], env)
      : await execFileAsync(process.env.SHELL || "/bin/sh", ["-lc", "command -v npx"], env)
    const lines = stdout.trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const resolved = isWindows
      ? lines.find((line) => /\.cmd$/i.test(line)) ?? lines[0]
      : lines.at(-1)
    if (resolved) {
      return await fs.realpath(resolved).catch(() => resolved)
    }
  } catch (error) {
    console.error("[skills:install-via-cli] failed to resolve npx via system shell:", error)
  }

  const candidatePaths = isWindows
    ? COMMON_BIN_DIRS.flatMap((dir) => [
        path.join(dir, "npx.cmd"),
        path.join(dir, "npx.exe"),
      ])
    : ["/opt/homebrew/bin/npx", "/usr/local/bin/npx", "/usr/bin/npx", "/bin/npx"]

  for (const candidate of candidatePaths) {
    try {
      await fs.access(candidate)
      return await fs.realpath(candidate).catch(() => candidate)
    } catch {
      continue
    }
  }

  throw new Error(
    `Unable to locate npx. PATH=${env.PATH || "<empty>"} platform=${process.platform}`,
  )
}

function quoteWindowsCmdArg(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function buildNpxInstallCommand(
  npxPath: string,
  safeSource: string,
): { command: string; args: string[] } {
  const args = ["skills", "add", safeSource, "--all", "--global", "-y"]

  if (process.platform !== "win32") {
    return { command: npxPath, args }
  }

  const quotedCommand = [npxPath, ...args].map(quoteWindowsCmdArg).join(" ")
  return {
    command: process.env.ComSpec || "cmd.exe",
    args: ["/d", "/s", "/c", `"${quotedCommand}"`],
  }
}

export function registerIpcHandlers(): void {
  console.log("[ipc] registerIpcHandlers initialized")
  // Detect which agents are installed on this machine
  ipcMain.handle("agents:detect", async () => {
    return detectAgents()
  })

  // List all installed skills across all detected agents.
  // Returns cached data instantly when available, then rescans in the
  // background and pushes a skills:updated event when the fresh data is ready.
  ipcMain.handle("skills:list-installed", async () => {
    const cached = loadCachedSkills()
    if (cached.length > 0) {
      const cachedFingerprint = createSkillsFingerprint(cached as InternalSkill[])
      cachedSkillsFingerprint = cachedFingerprint
      lastBroadcastFingerprint = cachedFingerprint
      // Return stale-while-revalidate: send cached data now, rescan later
      rescanAndCache({ skipCustomPaths: true }).catch((err) => {
        console.error("Background rescan failed:", err)
      })
      return toRendererSkills(cached)
    }
    // Cache is empty (first launch or cleared) -- do a full scan synchronously
    return rescanAndCache({ broadcast: false })
  })

  // Force a full filesystem rescan, update the cache, and push to renderer
  ipcMain.handle("skills:rescan", async () => {
    return rescanAndCache()
  })

  // Read the content of a skill's SKILL.md file
  ipcMain.handle("skill:read-content", async (_event, skillPath: string) => {
    // Validate the path is within allowed skill directories
    const resolved = path.resolve(skillPath)
    if (!isSkillPathAllowed(resolved)) {
      throw new Error("Access denied: path is outside skill directories")
    }

    const skillMdPath = path.join(resolved, "SKILL.md")
    try {
      return await fs.readFile(skillMdPath, "utf-8")
    } catch {
      // If skillPath itself is a SKILL.md file, try reading it directly
      if (resolved.endsWith("SKILL.md")) {
        try {
          return await fs.readFile(resolved, "utf-8")
        } catch {
          return ""
        }
      }
      return ""
    }
  })

  ipcMain.handle("skill:list-supporting-files", async (_event, skillPath: string) => {
    const resolved = path.resolve(skillPath)
    if (!isSkillPathAllowed(resolved)) {
      throw new Error("Access denied: path is outside skill directories")
    }
    return listSupportingFiles(resolved)
  })

  ipcMain.handle(
    "skill:read-supporting-file",
    async (_event, skillPath: string, relativePath: string) => {
      const resolved = path.resolve(skillPath)
      if (!isSkillPathAllowed(resolved)) {
        throw new Error("Access denied: path is outside skill directories")
      }
      const filePath = path.resolve(resolved, relativePath)
      if (!filePath.startsWith(resolved)) {
        throw new Error("Access denied: invalid supporting file path")
      }
      return fs.readFile(filePath, "utf-8")
    },
  )

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
        tmpDir = path.join(os.tmpdir(), `skillsgate-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`)
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
      const detected = await detectAgents()
      const detectedNames = new Set(detected.map((agent) => agent.name))
      const targetAgents = getExpandedTargetAgents(agentNames).filter((agent) =>
        detectedNames.has(agent.name),
      )

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

  // Search skills.sh from main process (avoids CORS)
  ipcMain.handle(
    "skills:search-catalog",
    async (
      _event,
      query: string,
      limit: number = 30,
      offset: number = 0,
    ): Promise<{ skills: { id: string; skillId: string; name: string; installs: number; source: string }[]; count: number }> => {
      const q = query.trim().length >= 2 ? query.trim() : "skill"
      const url = `https://skills.sh/api/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`skills.sh search failed (HTTP ${res.status})`)
      const data = await res.json()
      return { skills: data.skills ?? [], count: data.count ?? 0 }
    },
  )

  // Trending browse: scrape skills.sh's trending page (no JSON API exists).
  // Returns a fresh six-hour cache when available, otherwise scrapes, persists,
  // and returns the result. Rejects on scrape failure so the renderer can
  // treat trending as a non-fatal enhancement over live search.
  ipcMain.handle(
    "skills:fetch-trending",
    async (): Promise<TrendingSkill[]> => {
      const cached = loadTrendingCache()
      if (cached) return cached

      const skills = await fetchTrending()
      saveTrendingCache(skills)
      return skills
    },
  )

  // Fetch SKILL.md content from GitHub raw (avoids CORS)
  const branchCache = new Map<string, string>()

  ipcMain.handle(
    "skills:fetch-content",
    async (
      _event,
      source: string,
      skillId: string,
    ): Promise<string | null> => {
      // Resolve default branch
      let branch = branchCache.get(source)
      if (!branch) {
        try {
          const res = await fetch(`https://api.github.com/repos/${source}`)
          if (res.ok) {
            const data = await res.json()
            branch = data.default_branch || "main"
          } else {
            branch = "main"
          }
        } catch {
          branch = "main"
        }
        branchCache.set(source, branch)
      }

      const paths = [
        `skills/${skillId}/SKILL.md`,
        `skills/.curated/${skillId}/SKILL.md`,
        `skills/.experimental/${skillId}/SKILL.md`,
        `${skillId}/SKILL.md`,
        `SKILL.md`,
      ]

      for (const p of paths) {
        try {
          const res = await fetch(`https://raw.githubusercontent.com/${source}/${branch}/${p}`)
          if (res.ok) return await res.text()
        } catch {
          continue
        }
      }
      return null
    },
  )

  // Install a skill using the `npx skills add` CLI command
  ipcMain.handle(
    "skills:install-via-cli",
    async (
      _event,
      source: string,
    ): Promise<{ success: boolean; output: string; error?: string }> => {
      const safeSource = source.replace(/[^a-zA-Z0-9_./-]/g, "")
      const env = buildCliEnv()
      console.log("[skills:install-via-cli] request received", {
        source,
        safeSource,
        platform: process.platform,
        shell: process.env.SHELL || process.env.ComSpec || "<none>",
        path: env.PATH,
      })

      try {
        const npxPath = await resolveNpxPath()
        console.log("[skills:install-via-cli] resolved npx", npxPath)

        return await new Promise((resolve) => {
          const { command, args } = buildNpxInstallCommand(npxPath, safeSource)
          const child = spawn(command, args, {
            cwd: os.homedir(),
            env,
            stdio: ["ignore", "pipe", "pipe"],
            windowsVerbatimArguments: process.platform === "win32",
          })

          let stdout = ""
          let stderr = ""
          let timedOut = false
          const timeout = setTimeout(() => {
            timedOut = true
            console.error("[skills:install-via-cli] timed out after 120000ms")
            child.kill("SIGTERM")
          }, 120_000)

          child.stdout.on("data", (chunk) => {
            const text = chunk.toString()
            stdout += text
            console.log("[skills:install-via-cli][stdout]", text.trimEnd())
          })

          child.stderr.on("data", (chunk) => {
            const text = chunk.toString()
            stderr += text
            console.error("[skills:install-via-cli][stderr]", text.trimEnd())
          })

          child.on("error", (error) => {
            clearTimeout(timeout)
            console.error("[skills:install-via-cli] spawn error:", error)
            resolve({
              success: false,
              output: stdout,
              error: error.message,
            })
          })

          child.on("close", async (code, signal) => {
            clearTimeout(timeout)
            console.log("[skills:install-via-cli] process closed", { code, signal, timedOut })
            if (code === 0 && !timedOut) {
              try {
                await rescanAndCache()
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                console.error("[skills:install-via-cli] rescan failed after successful install:", message)
                resolve({
                  success: false,
                  output: stdout,
                  error: `Install completed but refresh failed: ${message}`,
                })
                return
              }

              resolve({
                success: true,
                output: stdout,
              })
              return
            }

            resolve({
              success: false,
              output: stdout,
              error: stderr || `Install exited with code ${code ?? "unknown"}${signal ? ` (signal ${signal})` : ""}`,
            })
          })
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error("[skills:install-via-cli] setup failed:", message)
        return {
          success: false,
          output: "",
          error: message,
        }
      }
    },
  )

  ipcMain.handle(
    "skills:create",
    async (
      _event,
      data: { name: string; description?: string; content?: string; agentNames?: string[] },
    ) => {
      const trimmedName = data.name.trim()
      if (!trimmedName) {
        throw new Error("Skill name is required")
      }

      const safeName = sanitizeName(trimmedName)
      const canonicalDir = path.join(CANONICAL_SKILLS_DIR, safeName)
      const skillFilePath = path.join(canonicalDir, "SKILL.md")

      if (await dirExists(canonicalDir)) {
        throw new Error(`Skill "${trimmedName}" already exists`)
      }

      await fs.mkdir(canonicalDir, { recursive: true })
      const content = (data.content?.trim() || `---
name: ${safeName}
description: ${(data.description?.trim() || trimmedName).replace(/\n/g, " ")}
---

# ${trimmedName}

## Instructions

Add your skill instructions here.
`).trimEnd() + "\n"
      await fs.writeFile(skillFilePath, content, "utf-8")

      const detected = await detectAgents()
      const detectedNames = new Set(detected.map((agent) => agent.name))
      const targetAgents = getExpandedTargetAgents(data.agentNames ?? []).filter((agent) =>
        detectedNames.has(agent.name),
      )

      for (const agent of targetAgents) {
        await installSkillToAgent(canonicalDir, trimmedName, agent)
      }

      const lock = await readSkillLock()
      const now = new Date().toISOString()
      lock.skills[safeName] = {
        source: canonicalDir,
        sourceType: "local",
        originalUrl: canonicalDir,
        skillFolderHash: "",
        installedAt: now,
        updatedAt: now,
      }
      await writeSkillLock(lock)

      return {
        name: trimmedName,
        path: canonicalDir,
        targets: targetAgents.map((agent) => agent.name),
      }
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
      tmpDir = path.join(os.tmpdir(), `skillsgate-upd-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`)
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
  // Remote server handlers
  // -------------------------------------------------------------------------

  ipcMain.handle("servers:list", () => {
    ensureStores()
    const servers = serverStore.list()
    // Enrich with skill count
    return servers.map((s) => ({
      ...s,
      skillCount: skillStore.countByServer(s.id),
    }))
  })

  ipcMain.handle("servers:create", (_event, data) => {
    ensureStores()
    return serverStore.create(data)
  })

  ipcMain.handle("servers:update", (_event, id: string, fields) => {
    ensureStores()
    return serverStore.update(id, fields)
  })

  ipcMain.handle("servers:delete", (_event, id: string) => {
    ensureStores()
    serverStore.delete(id)
  })

  ipcMain.handle("servers:test", async (_event, id: string) => {
    ensureStores()
    const server = serverStore.get(id)
    if (!server) return { ok: false, error: "Server not found" }
    return testConnection(server)
  })

  ipcMain.handle("servers:sync", async (_event, id: string) => {
    ensureStores()
    const server = serverStore.get(id)
    if (!server) return { added: 0, updated: 0, removed: 0, unchanged: 0, error: "Server not found" }
    return syncRemoteServer({ remoteServers: serverStore, remoteSkills: skillStore }, server)
  })

  ipcMain.handle("servers:skills", (_event, serverId: string) => {
    ensureStores()
    return skillStore.listByServer(serverId)
  })

  ipcMain.handle("servers:read-skill", async (_event, serverId: string, remotePath: string) => {
    ensureStores()
    const server = serverStore.get(serverId)
    if (!server) {
      throw new Error("Server not found")
    }
    return readRemoteFile(server, remotePath)
  })

  ipcMain.handle(
    "servers:write-skill",
    async (_event, serverId: string, remotePath: string, content: string) => {
      ensureStores()
      const server = serverStore.get(serverId)
      if (!server) {
        throw new Error("Server not found")
      }
      await writeRemoteFile(server, remotePath, content)
      const contentHash = require("node:crypto")
        .createHash("sha256")
        .update(content, "utf-8")
        .digest("hex")
      skillStore.updateContent(serverId, remotePath, content, contentHash)
      return { ok: true }
    },
  )

  ipcMain.handle(
    "servers:push-preview",
    async (_event, serverId: string, mirror: boolean) => {
      ensureStores()
      const server = serverStore.get(serverId)
      if (!server) throw new Error("Server not found")
      return planPush(server, { mirror })
    },
  )

  ipcMain.handle(
    "servers:push-apply",
    async (_event, serverId: string, preview: PushPreview) => {
      ensureStores()
      const server = serverStore.get(serverId)
      if (!server) throw new Error("Server not found")
      const result = await applyPush(server, preview)
      // Refresh remote_skills cache so the UI shows post-push state correctly
      try {
        await syncRemoteServer(
          { remoteServers: serverStore, remoteSkills: skillStore },
          server,
        )
      } catch {
        // Non-fatal: push already happened; cache will refresh on next sync.
      }
      return result
    },
  )

  ipcMain.handle("servers:count", () => {
    ensureStores()
    return serverStore.count()
  })

  // -------------------------------------------------------------------------
  // Settings handlers
  // -------------------------------------------------------------------------

  ipcMain.handle("settings:get", (_event, key: string, defaultValue: unknown) => {
    ensureStores()
    return settingsStore.get(key, defaultValue)
  })

  ipcMain.handle("settings:set", (_event, key: string, value: unknown) => {
    ensureStores()
    settingsStore.set(key, value)
  })

  ipcMain.handle("settings:all", () => {
    ensureStores()
    return settingsStore.getAll()
  })

  // -------------------------------------------------------------------------
  // Favorites handlers
  // -------------------------------------------------------------------------

  ipcMain.handle("favorites:list", () => {
    ensureStores()
    return favoritesStore.list()
  })

  ipcMain.handle("favorites:toggle", (_event, name: string) => {
    ensureStores()
    return favoritesStore.toggle(name)
  })

  // -------------------------------------------------------------------------
  // Updates
  // -------------------------------------------------------------------------

  ipcMain.handle("updates:get-state", () => {
    return getUpdateState()
  })

  ipcMain.handle("updates:check", async () => {
    return checkForAppUpdates()
  })

  ipcMain.handle("updates:install", () => {
    quitAndInstallUpdate()
  })

  ipcMain.handle("app:get-version", () => {
    return app.getVersion()
  })

  // -------------------------------------------------------------------------
  // Skill editing & management
  // -------------------------------------------------------------------------

  // Write skill content back to disk
  ipcMain.handle("skill:write-content", async (_, filePath: string, content: string) => {
    // Validate the path is within allowed skill directories
    const resolved = path.resolve(filePath)
    if (!isSkillPathAllowed(resolved)) {
      throw new Error("Access denied: path is outside skill directories")
    }

    try {
      await fs.writeFile(resolved, content, "utf-8")
    } catch (err) {
      throw new Error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`)
    }
  })

  // Open skill folder in Finder/Explorer
  ipcMain.handle("skill:open-in-finder", (_, filePath: string) => {
    // Validate the path is within allowed skill directories
    const resolved = path.resolve(filePath)
    if (!isSkillPathAllowed(resolved)) {
      throw new Error("Access denied: path is outside skill directories")
    }
    shell.showItemInFolder(resolved)
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

  ipcMain.handle(
    "skills:add-to-agent",
    async (_event, skillName: string, canonicalPath: string, agentName: string) => {
      const safeName = sanitizeName(skillName)
      const agent = agentRegistry[agentName]
      if (!agent) throw new Error(`Unknown agent: ${agentName}`)

      const resolvedCanonical = path.resolve(canonicalPath)
      if (!resolvedCanonical.startsWith(path.resolve(CANONICAL_SKILLS_DIR))) {
        throw new Error("Access denied: canonical path is outside local skill storage")
      }

      const result = await installSkillToAgent(resolvedCanonical, safeName, agent)
      if (!result.success) {
        throw new Error(result.error || "Failed to add skill to target agent")
      }
    },
  )
}

// Export for use by file-watcher and main process
export { listInstalledSkills, listInstalledSkillsInternal, rescanAndCache, rescanSingleSkill, detectAgents, agentRegistry }
