import type { LocalDb, RemoteServer, SyncResult } from "../types.js"
import { scanRemoteSkills } from "./scanner.js"

/**
 * Sync remote skills from a server into the local database.
 *
 * 1. Scan remote server for SKILL.md files (2 SSH round trips).
 * 2. For each discovered skill: compute hash, upsert (skip if hash unchanged).
 * 3. Remove stale skills (in DB but not found on remote).
 * 4. Update server's last_sync_at / last_sync_error.
 * 5. Return { added, updated, removed, unchanged }.
 */
export async function syncRemoteServer(
  db: LocalDb,
  server: RemoteServer
): Promise<SyncResult> {
  try {
    // Scan remote for skills
    const scanned = await scanRemoteSkills(server)

    // Get existing skills from DB for comparison
    const existing = db.remoteSkills.listByServer(server.id)
    const existingByPath = new Map(
      existing.map((s) => [s.remotePath, s])
    )

    let added = 0
    let updated = 0
    let unchanged = 0

    for (const skill of scanned) {
      const prev = existingByPath.get(skill.remotePath)

      if (!prev) {
        // New skill
        db.remoteSkills.upsert({
          serverId: server.id,
          name: skill.name,
          description: skill.description,
          remotePath: skill.remotePath,
          content: skill.content,
          contentHash: skill.contentHash,
        })
        added++
      } else if (prev.contentHash !== skill.contentHash) {
        // Content changed
        db.remoteSkills.upsert({
          serverId: server.id,
          name: skill.name,
          description: skill.description,
          remotePath: skill.remotePath,
          content: skill.content,
          contentHash: skill.contentHash,
        })
        updated++
      } else {
        unchanged++
      }
    }

    // Remove stale skills (in DB but not found on remote)
    const currentPaths = scanned.map((s) => s.remotePath)
    const removed = db.remoteSkills.removeStale(server.id, currentPaths)

    // Mark sync as successful
    db.remoteServers.updateSyncStatus(server.id, null)

    return { added, updated, removed, unchanged }
  } catch (err) {
    // Mark sync as failed
    const message = err instanceof Error ? err.message : String(err)
    db.remoteServers.updateSyncStatus(server.id, message)
    throw err
  }
}
