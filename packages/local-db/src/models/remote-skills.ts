import crypto from "node:crypto"
import type { SqliteDriver, RemoteSkill, UpsertRemoteSkill } from "../types.js"

/** Map a snake_case DB row to a camelCase RemoteSkill object. */
function rowToSkill(row: any): RemoteSkill {
  return {
    id: row.id,
    serverId: row.server_id,
    name: row.name,
    description: row.description ?? null,
    remotePath: row.remote_path,
    content: row.content ?? null,
    contentHash: row.content_hash ?? null,
    syncedAt: row.synced_at,
  }
}

export class RemoteSkillStore {
  constructor(private driver: SqliteDriver) {}

  listByServer(serverId: string): RemoteSkill[] {
    const rows = this.driver
      .prepare(
        "SELECT * FROM remote_skills WHERE server_id = ? ORDER BY name ASC"
      )
      .all(serverId)
    return rows.map(rowToSkill)
  }

  listAll(): (RemoteSkill & { serverLabel: string })[] {
    const rows = this.driver
      .prepare(
        `SELECT rs.*, srv.label AS server_label
         FROM remote_skills rs
         JOIN remote_servers srv ON srv.id = rs.server_id
         ORDER BY srv.label ASC, rs.name ASC`
      )
      .all() as any[]

    return rows.map((row) => ({
      ...rowToSkill(row),
      serverLabel: row.server_label,
    }))
  }

  upsert(skill: UpsertRemoteSkill): void {
    const id = crypto.randomUUID()
    this.driver
      .prepare(
        `INSERT INTO remote_skills (id, server_id, name, description, remote_path, content, content_hash, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(server_id, remote_path) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           content = excluded.content,
           content_hash = excluded.content_hash,
           synced_at = excluded.synced_at`
      )
      .run(
        id,
        skill.serverId,
        skill.name,
        skill.description,
        skill.remotePath,
        skill.content,
        skill.contentHash
      )
  }

  /**
   * Remove skills for a server whose remote_path is NOT in the given list.
   * Returns the number of rows deleted.
   */
  removeStale(serverId: string, currentPaths: string[]): number {
    if (currentPaths.length === 0) {
      // No paths found remotely -- remove everything for this server
      const result = this.driver
        .prepare("DELETE FROM remote_skills WHERE server_id = ?")
        .run(serverId)
      return result.changes
    }

    // Build parameterized placeholders for the IN clause
    const placeholders = currentPaths.map(() => "?").join(", ")
    const result = this.driver
      .prepare(
        `DELETE FROM remote_skills
         WHERE server_id = ?
         AND remote_path NOT IN (${placeholders})`
      )
      .run(serverId, ...currentPaths)
    return result.changes
  }

  getContent(id: string): string | null {
    const row = this.driver
      .prepare("SELECT content FROM remote_skills WHERE id = ?")
      .get(id) as { content: string | null } | undefined
    return row?.content ?? null
  }
}
