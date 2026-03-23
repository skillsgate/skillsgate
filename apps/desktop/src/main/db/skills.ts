import type Database from "better-sqlite3"
import crypto from "node:crypto"

export interface RemoteSkill {
  id: string
  serverId: string
  name: string
  description: string | null
  remotePath: string
  content: string | null
  contentHash: string | null
  syncedAt: string
}

interface SkillRow {
  id: string
  server_id: string
  name: string
  description: string | null
  remote_path: string
  content: string | null
  content_hash: string | null
  synced_at: string
}

function rowToSkill(row: SkillRow): RemoteSkill {
  return {
    id: row.id,
    serverId: row.server_id,
    name: row.name,
    description: row.description,
    remotePath: row.remote_path,
    content: row.content,
    contentHash: row.content_hash,
    syncedAt: row.synced_at,
  }
}

export class RemoteSkillStore {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  listByServer(serverId: string): RemoteSkill[] {
    const rows = this.db
      .prepare(
        "SELECT * FROM remote_skills WHERE server_id = ? ORDER BY name ASC",
      )
      .all(serverId) as SkillRow[]
    return rows.map(rowToSkill)
  }

  upsert(skill: {
    serverId: string
    name: string
    description: string | null
    remotePath: string
    content: string | null
    contentHash: string | null
  }): void {
    const id = crypto.randomUUID()
    this.db
      .prepare(
        `INSERT INTO remote_skills (id, server_id, name, description, remote_path, content, content_hash, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(server_id, remote_path) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           content = excluded.content,
           content_hash = excluded.content_hash,
           synced_at = excluded.synced_at`,
      )
      .run(
        id,
        skill.serverId,
        skill.name,
        skill.description,
        skill.remotePath,
        skill.content,
        skill.contentHash,
      )
  }

  removeStale(serverId: string, currentPaths: string[]): number {
    if (currentPaths.length === 0) {
      // Remove all skills for this server
      const info = this.db
        .prepare("DELETE FROM remote_skills WHERE server_id = ?")
        .run(serverId)
      return info.changes
    }

    const placeholders = currentPaths.map(() => "?").join(", ")
    const info = this.db
      .prepare(
        `DELETE FROM remote_skills WHERE server_id = ? AND remote_path NOT IN (${placeholders})`,
      )
      .run(serverId, ...currentPaths)
    return info.changes
  }

  countByServer(serverId: string): number {
    const row = this.db
      .prepare(
        "SELECT COUNT(*) as cnt FROM remote_skills WHERE server_id = ?",
      )
      .get(serverId) as { cnt: number }
    return row.cnt
  }
}
