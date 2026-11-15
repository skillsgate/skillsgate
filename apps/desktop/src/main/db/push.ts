// apps/desktop/src/main/db/push.ts
import crypto from "node:crypto"
import path from "node:path"
import os from "node:os"
import { promises as fs } from "node:fs"

import type { RemoteServer } from "./servers"
import {
  scanRemoteSkills,
  uploadSkillDir,
  deleteRemoteSkillDir,
  probeRemoteToolDirs,
  applyRemoteLinkOps,
  type RemoteLinkOp,
  type RemoteToolDirState,
} from "./ssh"
import { listInstalledSkillsInternal, agentRegistry } from "../ipc-handlers"

const home = os.homedir()
const CANONICAL_SKILLS_DIR = path.join(home, ".agents", "skills")

export interface PushPlanEntry {
  folderName: string
  name: string
  localPath: string
  remotePath: string
  remoteDir: string
  reason: "added" | "updated" | "deleted" | "unchanged"
  localHash?: string
  remoteHash?: string
}

/** A link in a tool's skills folder on the remote, such as ~/.claude/skills/<name>. */
export interface LinkPlanEntry {
  /** Display name of the tool, or several joined when tools share a folder. */
  tool: string
  /** Home-relative tool skills folder on the remote, for example "~/.claude/skills". */
  remoteDir: string
  /** Entry name inside that folder. */
  name: string
  /** Skill folder in the remote skills base that the link points to. */
  folderName: string
  /** Link text, relative to remoteDir where possible. */
  target: string
}

export interface PushPreview {
  toAdd: PushPlanEntry[]
  toUpdate: PushPlanEntry[]
  toDelete: PushPlanEntry[]
  unchanged: PushPlanEntry[]
  mirror: boolean
  /** Links the local tools have that the remote is missing. */
  linksToAdd: LinkPlanEntry[]
  /** Mirror only: remote links into the skills base that no local tool has. */
  linksToRemove: LinkPlanEntry[]
  /** Something other than the expected link is at that name; left alone. */
  linkConflicts: LinkPlanEntry[]
  linksUnchanged: number
  /** Tools with local links that are not installed on the remote. */
  toolsNotOnServer: string[]
}

export interface PushResult {
  added: number
  updated: number
  deleted: number
  unchanged: number
  linksAdded: number
  linksRemoved: number
  errors: { folderName: string; message: string }[]
}

export interface PushOptions {
  mirror: boolean
}

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s, "utf-8").digest("hex")
}

/**
 * Resolve the remote skills base path to an absolute path relative to the server,
 * dropping a trailing slash. We don't expand "~/" here -- that happens server-side
 * via $HOME inside shellQuotePath.
 */
function normalizeRemoteBase(p: string): string {
  return p.replace(/\/+$/, "")
}

export interface LocalPushCandidate {
  folderName: string
  name: string
  localPath: string
  contentHash: string
}

/**
 * The local skills Push sends: global skills whose real folder is inside
 * CANONICAL_SKILLS_DIR, with a hash of each SKILL.md as stored. Skills that
 * live elsewhere (a tool's built-in skills, or a folder in the canonical dir
 * that links outside it) are never pushed. The Servers page uses the same
 * list for its "not yet pushed" count.
 */
export async function listLocalPushCandidates(): Promise<LocalPushCandidate[]> {
  const allLocal = await listInstalledSkillsInternal({ skipCustomPaths: true })
  const localCanonical = allLocal.filter(
    (s) =>
      s.scope === "global" &&
      path.resolve(s.canonicalPath).startsWith(path.resolve(CANONICAL_SKILLS_DIR)),
  )

  const candidates: LocalPushCandidate[] = []
  for (const s of localCanonical) {
    const skillMdPath = path.join(s.canonicalPath, "SKILL.md")
    let content: string
    try {
      content = await fs.readFile(skillMdPath, "utf-8")
    } catch {
      continue // skill dir without SKILL.md -- skip
    }
    candidates.push({
      folderName: s.folderName,
      name: s.name,
      localPath: s.canonicalPath,
      contentHash: sha256(content),
    })
  }
  return candidates
}

// ---------------------------------------------------------------------------
// Tool links
// ---------------------------------------------------------------------------

interface ToolDir {
  tool: string
  localDir: string
  /** Home-relative path on the remote, for example "~/.claude/skills". */
  remoteDir: string
}

/**
 * Each tool's global skills folder, mapped to the same home-relative path on
 * the remote. Folders shared by several tools are listed once. Skipped: the
 * canonical folder itself (tools that read it need no links) and folders
 * outside the home folder, which have no counterpart on the remote.
 */
function listToolDirs(): ToolDir[] {
  const byDir = new Map<string, ToolDir>()
  for (const agent of Object.values(agentRegistry)) {
    const localDir = path.resolve(agent.globalSkillsDir)
    if (localDir === path.resolve(CANONICAL_SKILLS_DIR)) continue
    const rel = path.relative(home, localDir)
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) continue
    const existing = byDir.get(localDir)
    if (existing) {
      existing.tool = `${existing.tool}, ${agent.displayName}`
    } else {
      byDir.set(localDir, {
        tool: agent.displayName,
        localDir,
        remoteDir: `~/${rel.split(path.sep).join("/")}`,
      })
    }
  }
  return [...byDir.values()]
}

/**
 * Local tool links to the skills Push sends: entries in a tool's skills folder
 * that are links resolving to one of `candidates`. Copies are not links and
 * are not counted. Returns entry names per tool folder, keyed by localDir.
 */
async function listLocalToolLinks(
  toolDirs: ToolDir[],
  candidates: LocalPushCandidate[],
): Promise<Map<string, Map<string, string>>> {
  const folderByRealPath = new Map<string, string>()
  for (const c of candidates) {
    try {
      folderByRealPath.set(await fs.realpath(c.localPath), c.folderName)
    } catch {
      // Candidate folder vanished since the scan.
    }
  }

  const links = new Map<string, Map<string, string>>()
  for (const dir of toolDirs) {
    const names = new Map<string, string>()
    let entries: import("node:fs").Dirent[] = []
    try {
      entries = await fs.readdir(dir.localDir, { withFileTypes: true })
    } catch {
      // Tool folder does not exist locally.
    }
    for (const entry of entries) {
      if (!entry.isSymbolicLink()) continue
      try {
        const real = await fs.realpath(path.join(dir.localDir, entry.name))
        const folderName = folderByRealPath.get(real)
        if (folderName) names.set(entry.name, folderName)
      } catch {
        // Broken link: nothing to recreate.
      }
    }
    links.set(dir.localDir, names)
  }
  return links
}

/** Absolute remote skills base, given the remote $HOME. */
function absoluteRemoteBase(base: string, remoteHome: string): string {
  const trimmed = normalizeRemoteBase(base)
  if (trimmed === "~") return remoteHome
  if (trimmed.startsWith("~/")) return path.posix.join(remoteHome, trimmed.slice(2))
  return path.posix.normalize(trimmed)
}

/** Tool folders that need links on this server (not its skills base itself). */
function toolDirsFor(server: RemoteServer): ToolDir[] {
  return listToolDirs().filter(
    (d) => normalizeRemoteBase(server.skillsBasePath) !== d.remoteDir,
  )
}

/**
 * The remote's tool folders as read over SSH: its $HOME and, per home-relative
 * tool skills folder, whether the tool is installed and what the folder holds.
 * Plain JSON, so it can be stored after a refresh.
 */
export interface RemoteLinkState {
  home: string
  dirs: Record<string, RemoteToolDirState>
}

export async function readRemoteLinkState(server: RemoteServer): Promise<RemoteLinkState> {
  const toolDirs = toolDirsFor(server)
  const probe = await probeRemoteToolDirs(
    server,
    toolDirs.map((d) => d.remoteDir),
  )
  const dirs: Record<string, RemoteToolDirState> = {}
  toolDirs.forEach((d, i) => {
    dirs[d.remoteDir] = probe.dirs[i]
  })
  return { home: probe.home, dirs }
}

type LinkDiff = Pick<
  PushPreview,
  "linksToAdd" | "linksToRemove" | "linkConflicts" | "linksUnchanged" | "toolsNotOnServer"
>

/**
 * Compare local tool links with the remote's tool folders. Push adds missing
 * links for tools installed on the remote; Mirror also removes remote links
 * into the skills base that no local tool has. Anything else in a tool folder
 * (real folders such as a tool's own synced skills, links elsewhere) is never
 * changed. A tool folder missing from `remote` (not read yet) is skipped.
 */
function diffLinks(
  server: RemoteServer,
  toolDirs: ToolDir[],
  localLinks: Map<string, Map<string, string>>,
  remote: RemoteLinkState,
  mirror: boolean,
): LinkDiff {
  const remoteBase = absoluteRemoteBase(server.skillsBasePath, remote.home)

  const linksToAdd: LinkPlanEntry[] = []
  const linksToRemove: LinkPlanEntry[] = []
  const linkConflicts: LinkPlanEntry[] = []
  const toolsNotOnServer: string[] = []
  let linksUnchanged = 0

  toolDirs.forEach((dir) => {
    const wanted = localLinks.get(dir.localDir) ?? new Map<string, string>()
    const state = remote.dirs[dir.remoteDir]
    if (!state) return
    if (!state.toolInstalled) {
      if (wanted.size > 0) toolsNotOnServer.push(dir.tool)
      return
    }
    const remoteDirAbs = path.posix.join(remote.home, dir.remoteDir.slice(2))
    const entries = new Map(state.entries.map((e) => [e.name, e]))

    for (const [name, folderName] of wanted) {
      const expected = path.posix.join(remoteBase, folderName)
      const entry: LinkPlanEntry = {
        tool: dir.tool,
        remoteDir: dir.remoteDir,
        name,
        folderName,
        target: path.posix.relative(remoteDirAbs, expected),
      }
      const existing = entries.get(name)
      if (!existing) {
        linksToAdd.push(entry)
      } else if (
        existing.kind === "link" &&
        path.posix.resolve(remoteDirAbs, existing.target ?? "") === expected
      ) {
        linksUnchanged++
      } else {
        linkConflicts.push(entry)
      }
    }

    if (!mirror) return
    for (const existing of state.entries) {
      if (existing.kind !== "link" || wanted.has(existing.name) || !existing.target) continue
      const resolved = path.posix.resolve(remoteDirAbs, existing.target)
      if (path.posix.dirname(resolved) !== remoteBase) continue
      linksToRemove.push({
        tool: dir.tool,
        remoteDir: dir.remoteDir,
        name: existing.name,
        folderName: path.posix.basename(resolved),
        target: existing.target,
      })
    }
  })

  return { linksToAdd, linksToRemove, linkConflicts, linksUnchanged, toolsNotOnServer }
}

/** Read the remote's tool folders now and compare them with local links. */
async function planLinks(
  server: RemoteServer,
  candidates: LocalPushCandidate[],
  mirror: boolean,
): Promise<LinkDiff> {
  const toolDirs = toolDirsFor(server)
  const localLinks = await listLocalToolLinks(toolDirs, candidates)
  const remote = await readRemoteLinkState(server)
  return diffLinks(server, toolDirs, localLinks, remote, mirror)
}

export interface LinkStatus {
  /** Local tool links the remote is missing (Push adds them). */
  toAdd: number
  /** Remote links into the skills base that no local tool has (Mirror removes them). */
  onlyOnRemote: number
  /** Something other than the expected link is in the way. */
  blocked: number
}

/**
 * Tool link differences for each server, from its stored tool-folder state
 * (read at the last refresh or push) and the local links as they are now.
 * Null for a server whose state has not been read yet.
 */
export async function computeLinkStatuses(
  servers: Array<{ server: RemoteServer; state: RemoteLinkState | null }>,
): Promise<Record<string, LinkStatus | null>> {
  const out: Record<string, LinkStatus | null> = {}
  const withState = servers.filter((s) => s.state)
  for (const s of servers) out[s.server.id] = null
  if (withState.length === 0) return out

  const candidates = await listLocalPushCandidates()
  const localLinks = await listLocalToolLinks(listToolDirs(), candidates)
  for (const { server, state } of withState) {
    const diff = diffLinks(server, toolDirsFor(server), localLinks, state!, true)
    out[server.id] = {
      toAdd: diff.linksToAdd.length,
      onlyOnRemote: diff.linksToRemove.length,
      blocked: diff.linkConflicts.length,
    }
  }
  return out
}

/** Only apply link entries shaped like the ones planLinks produces. */
function isSafeLinkEntry(e: LinkPlanEntry): boolean {
  return (
    typeof e.remoteDir === "string" &&
    e.remoteDir.startsWith("~/") &&
    !e.remoteDir.split("/").includes("..") &&
    typeof e.name === "string" &&
    e.name !== "" &&
    e.name !== "." &&
    e.name !== ".." &&
    !e.name.includes("/") &&
    typeof e.target === "string" &&
    e.target !== ""
  )
}

/**
 * Diff local canonical skills against the remote scan. Returns the plan.
 * Does NOT execute anything.
 */
export async function planPush(
  server: RemoteServer,
  options: PushOptions,
): Promise<PushPreview> {
  // 1. List and hash the local skills Push sends
  const candidates = await listLocalPushCandidates()
  const localByFolder = new Map<
    string,
    { folderName: string; name: string; localPath: string; hash: string }
  >()
  for (const c of candidates) {
    localByFolder.set(c.folderName, {
      folderName: c.folderName,
      name: c.name,
      localPath: c.localPath,
      hash: c.contentHash,
    })
  }

  // 2. Scan remote
  const remote = await scanRemoteSkills(server)
  const remoteBase = normalizeRemoteBase(server.skillsBasePath)

  // Match remote skills to local folder names by remotePath suffix.
  // remotePath looks like "<skillsBasePath>/<folderName>/SKILL.md".
  // We strip the basePath prefix and the "/SKILL.md" suffix to recover folderName.
  const remoteByFolder = new Map<string, { remotePath: string; hash: string }>()
  for (const r of remote) {
    const rp = r.remotePath
    if (!rp.endsWith("/SKILL.md")) continue
    // Remove the trailing "/SKILL.md"
    const skillDir = rp.slice(0, -"/SKILL.md".length)
    // Try to match by basename so we tolerate "~/.agents/skills" vs "$HOME/..." differences
    const folderName = path.posix.basename(skillDir)
    if (!folderName) continue
    remoteByFolder.set(folderName, { remotePath: rp, hash: r.contentHash })
  }

  const toAdd: PushPlanEntry[] = []
  const toUpdate: PushPlanEntry[] = []
  const unchanged: PushPlanEntry[] = []
  const toDelete: PushPlanEntry[] = []

  for (const [folderName, local] of localByFolder) {
    const remoteEntry = remoteByFolder.get(folderName)
    const remoteDir = `${remoteBase}/${folderName}`
    const remotePath = `${remoteDir}/SKILL.md`
    if (!remoteEntry) {
      toAdd.push({
        folderName,
        name: local.name,
        localPath: local.localPath,
        remotePath,
        remoteDir,
        reason: "added",
        localHash: local.hash,
      })
    } else if (remoteEntry.hash !== local.hash) {
      toUpdate.push({
        folderName,
        name: local.name,
        localPath: local.localPath,
        remotePath,
        remoteDir,
        reason: "updated",
        localHash: local.hash,
        remoteHash: remoteEntry.hash,
      })
    } else {
      unchanged.push({
        folderName,
        name: local.name,
        localPath: local.localPath,
        remotePath,
        remoteDir,
        reason: "unchanged",
        localHash: local.hash,
        remoteHash: remoteEntry.hash,
      })
    }
  }

  if (options.mirror) {
    for (const [folderName, remoteEntry] of remoteByFolder) {
      if (localByFolder.has(folderName)) continue
      const remoteDir = `${remoteBase}/${folderName}`
      toDelete.push({
        folderName,
        name: folderName,
        localPath: "",
        remotePath: remoteEntry.remotePath,
        remoteDir,
        reason: "deleted",
        remoteHash: remoteEntry.hash,
      })
    }
  }

  // 3. Tool links (~/.claude/skills/<skill> and so on)
  const links = await planLinks(server, candidates, options.mirror)

  return { toAdd, toUpdate, toDelete, unchanged, mirror: options.mirror, ...links }
}

/**
 * Apply a previously-computed plan. Errors per skill are collected, not thrown,
 * so a single failure doesn't abort the entire push.
 */
export async function applyPush(
  server: RemoteServer,
  preview: PushPreview,
): Promise<PushResult> {
  const errors: { folderName: string; message: string }[] = []
  const remoteBase = normalizeRemoteBase(server.skillsBasePath)

  // Uploads (added + updated). Use uploadSkillDir which handles tar pipeline.
  for (const entry of [...preview.toAdd, ...preview.toUpdate]) {
    try {
      await uploadSkillDir(server, CANONICAL_SKILLS_DIR, entry.folderName, remoteBase)
    } catch (err) {
      errors.push({
        folderName: entry.folderName,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  // Deletions (mirror only)
  if (preview.mirror) {
    for (const entry of preview.toDelete) {
      try {
        await deleteRemoteSkillDir(server, entry.remoteDir)
      } catch (err) {
        errors.push({
          folderName: entry.folderName,
          message: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  // Compute counts: subtract failures
  const failedFolders = new Set(errors.map((e) => e.folderName))

  // Tool links, after the folders they point to are in place. A link is not
  // created for a skill whose upload failed.
  const linkEntries: LinkPlanEntry[] = []
  const linkOps: RemoteLinkOp[] = []
  for (const e of preview.linksToAdd ?? []) {
    if (failedFolders.has(e.folderName) || !isSafeLinkEntry(e)) continue
    linkEntries.push(e)
    linkOps.push({ kind: "add", dir: e.remoteDir, name: e.name, target: e.target })
  }
  if (preview.mirror) {
    for (const e of preview.linksToRemove ?? []) {
      if (!isSafeLinkEntry(e)) continue
      linkEntries.push(e)
      linkOps.push({ kind: "remove", dir: e.remoteDir, name: e.name, target: e.target })
    }
  }
  let linksAdded = 0
  let linksRemoved = 0
  let applied: boolean[] = []
  let linkError: string | null = null
  try {
    applied = await applyRemoteLinkOps(server, linkOps)
  } catch (err) {
    linkError = err instanceof Error ? err.message : String(err)
  }
  linkOps.forEach((op, i) => {
    const e = linkEntries[i]
    if (applied[i]) {
      if (op.kind === "add") linksAdded++
      else linksRemoved++
      return
    }
    errors.push({
      folderName: `${e.tool}: ${e.name}`,
      message:
        linkError ??
        (op.kind === "add"
          ? "Could not create the link; something may already be there."
          : "Could not remove the link; it changed since the preview."),
    })
  })

  return {
    added: preview.toAdd.filter((e) => !failedFolders.has(e.folderName)).length,
    updated: preview.toUpdate.filter((e) => !failedFolders.has(e.folderName)).length,
    deleted: preview.mirror
      ? preview.toDelete.filter((e) => !failedFolders.has(e.folderName)).length
      : 0,
    unchanged: preview.unchanged.length,
    linksAdded,
    linksRemoved,
    errors,
  }
}
