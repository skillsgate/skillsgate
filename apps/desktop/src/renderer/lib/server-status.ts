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

export interface LinkStatusForStatus {
  /** Local tool links the remote is missing (Push adds them). */
  toAdd: number
  /** Remote tool links into the skills folder that no local tool has (Mirror removes them). */
  onlyOnRemote: number
  /** Something other than the expected link is in the way. */
  blocked: number
}

type ServerLike = { lastSyncAt: string | null; lastSyncError: string | null }

/**
 * Derive the row-level status hint from cached state. Pure function — no SSH,
 * no IPC. Priority order: error > never synced > additions/updates > only-on-remote > in sync.
 *
 * - localSkills: the local skills Push sends (listLocalPushCandidates in main)
 * - remoteSkills: the cached `remote_skills` rows for this server
 * - links: tool link differences from the server's stored tool-folder state,
 *   or null/undefined when it has not been read yet (skills only)
 *
 * `remoteSkills` is matched to local by folder name (the basename of the path
 * before "/SKILL.md") to tolerate "~/.agents/skills" vs "$HOME/..." differences.
 */
export function computeServerStatus(
  server: ServerLike,
  localSkills: LocalSkillForStatus[],
  remoteSkills: RemoteSkillForStatus[],
  links?: LinkStatusForStatus | null,
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
  const skills = `${localCount} skill${localCount === 1 ? "" : "s"}`
  const toolLinks = (n: number) => `${n} tool link${n === 1 ? "" : "s"}`
  const linksToAdd = links?.toAdd ?? 0
  const linksOnlyOnRemote = links?.onlyOnRemote ?? 0
  const linksBlocked = links?.blocked ?? 0

  if (pendingPush > 0 || linksToAdd > 0) {
    const parts: string[] = []
    if (pendingPush > 0) parts.push(`${pendingPush} not yet pushed`)
    if (linksToAdd > 0) parts.push(`${toolLinks(linksToAdd)} not yet pushed`)
    return { dotColor: "amber", text: [skills, ...parts].join(" · ") }
  }

  if (onlyOnRemote > 0 || linksOnlyOnRemote > 0 || linksBlocked > 0) {
    const parts: string[] = []
    if (onlyOnRemote > 0) parts.push(`${onlyOnRemote} only on remote`)
    if (linksOnlyOnRemote > 0) parts.push(`${toolLinks(linksOnlyOnRemote)} only on remote`)
    if (linksBlocked > 0) parts.push(`${toolLinks(linksBlocked)} blocked`)
    return { dotColor: "grey", text: [skills, ...parts].join(" · ") }
  }

  return { dotColor: "green", text: `${skills} · in sync` }
}
