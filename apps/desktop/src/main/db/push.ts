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
} from "./ssh"
import { listInstalledSkillsInternal } from "../ipc-handlers"

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

export interface PushPreview {
  toAdd: PushPlanEntry[]
  toUpdate: PushPlanEntry[]
  toDelete: PushPlanEntry[]
  unchanged: PushPlanEntry[]
  mirror: boolean
}

export interface PushResult {
  added: number
  updated: number
  deleted: number
  unchanged: number
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

/**
 * Diff local canonical skills against the remote scan. Returns the plan.
 * Does NOT execute anything.
 */
export async function planPush(
  server: RemoteServer,
  options: PushOptions,
): Promise<PushPreview> {
  // 1. List and hash the local skills Push sends
  const localByFolder = new Map<
    string,
    { folderName: string; name: string; localPath: string; hash: string }
  >()
  for (const c of await listLocalPushCandidates()) {
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

  return { toAdd, toUpdate, toDelete, unchanged, mirror: options.mirror }
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
  return {
    added: preview.toAdd.filter((e) => !failedFolders.has(e.folderName)).length,
    updated: preview.toUpdate.filter((e) => !failedFolders.has(e.folderName)).length,
    deleted: preview.mirror
      ? preview.toDelete.filter((e) => !failedFolders.has(e.folderName)).length
      : 0,
    unchanged: preview.unchanged.length,
    errors,
  }
}
