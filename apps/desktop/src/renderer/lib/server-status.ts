// apps/desktop/src/renderer/lib/server-status.ts

export type DotColor = "green" | "amber" | "red" | "grey"

export interface ServerStatus {
  dotColor: DotColor
  text: string
}

export interface RemoteSkillForStatus {
  remotePath: string
  contentHash: string | null
}

export interface LocalSkillForStatus {
  folderName: string
  contentHash: string
}

type ServerLike = { lastSyncAt: string | null; lastSyncError: string | null }

/**
 * Derive the row-level status hint from cached state. Pure function — no SSH,
 * no IPC. Priority order: error > never synced > additions/updates > only-on-remote > in sync.
 *
 * - localSkills: the local skills Push sends (listLocalPushCandidates in main)
 * - remoteSkills: the cached `remote_skills` rows for this server
 *
 * `remoteSkills` is matched to local by folder name (the basename of the path
 * before "/SKILL.md") to tolerate "~/.agents/skills" vs "$HOME/..." differences.
 */
export function computeServerStatus(
  server: ServerLike,
  localSkills: LocalSkillForStatus[],
  remoteSkills: RemoteSkillForStatus[],
): ServerStatus {
  if (server.lastSyncError) {
    return { dotColor: "red", text: "sync failed" }
  }
  if (!server.lastSyncAt) {
    return { dotColor: "grey", text: "never synced" }
  }

  // Match remote skills to folder names
  const remoteByFolder = new Map<string, string | null>()
  for (const r of remoteSkills) {
    if (!r.remotePath.endsWith("/SKILL.md")) continue
    const skillDir = r.remotePath.slice(0, -"/SKILL.md".length)
    const folderName = skillDir.split("/").filter(Boolean).pop() ?? ""
    if (!folderName) continue
    remoteByFolder.set(folderName, r.contentHash)
  }

  let pendingPush = 0
  let onlyOnRemote = 0

  const localFolders = new Set<string>()
  for (const local of localSkills) {
    localFolders.add(local.folderName)
    const remoteHash = remoteByFolder.get(local.folderName)
    if (remoteHash === undefined) {
      pendingPush++
    } else if (remoteHash !== local.contentHash) {
      pendingPush++
    }
  }

  for (const folder of remoteByFolder.keys()) {
    if (!localFolders.has(folder)) onlyOnRemote++
  }

  const localCount = localSkills.length

  if (pendingPush > 0) {
    return {
      dotColor: "amber",
      text: `${localCount} skill${localCount === 1 ? "" : "s"} · ${pendingPush} not yet pushed`,
    }
  }

  if (onlyOnRemote > 0) {
    return {
      dotColor: "grey",
      text: `${localCount} skill${localCount === 1 ? "" : "s"} · ${onlyOnRemote} only on remote`,
    }
  }

  return {
    dotColor: "green",
    text: `${localCount} skill${localCount === 1 ? "" : "s"} · in sync`,
  }
}
