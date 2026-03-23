import type { Database } from "bun:sqlite"
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

export interface RemoteSkillWithServer extends RemoteSkill {
  serverLabel: string
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

interface SkillRowWithServer extends SkillRow {
  server_label: string
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
  private db: Database

  constructor(db: Database) {
    this.db = db
  }

  listByServer(serverId: string): RemoteSkill[] {
    const rows = this.db
      .query("SELECT * FROM remote_skills WHERE server_id = ? ORDER BY name ASC")
      .all(serverId) as SkillRow[]
    return rows.map(rowToSkill)
  }

  listAll(): RemoteSkillWithServer[] {
    const rows = this.db
      .query(
        `SELECT rs.*, s.label as server_label
         FROM remote_skills rs
         JOIN remote_servers s ON s.id = rs.server_id
         ORDER BY rs.name ASC`
      )
      .all() as SkillRowWithServer[]
    return rows.map((row) => ({
      ...rowToSkill(row),
      serverLabel: row.server_label,
    }))
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
      .query(
        `INSERT INTO remote_skills (id, server_id, name, description, remote_path, content, content_hash, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(server_id, remote_path)
         DO UPDATE SET
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
        skill.contentHash,
      )
  }

  /**
   * Remove remote skills that no longer exist on the remote server.
   * Returns the number of removed rows.
   */
  removeStale(serverId: string, currentPaths: string[]): number {
    if (currentPaths.length === 0) {
      // All skills were removed from remote; delete everything for this server
      const info = this.db
        .query("DELETE FROM remote_skills WHERE server_id = ?")
        .run(serverId)
      return info.changes
    }

    // Build a parameterized IN clause
    const placeholders = currentPaths.map(() => "?").join(", ")
    const info = this.db
      .query(
        `DELETE FROM remote_skills
         WHERE server_id = ? AND remote_path NOT IN (${placeholders})`
      )
      .run(serverId, ...currentPaths)
    return info.changes
  }

  getContent(id: string): string | null {
    const row = this.db
      .query("SELECT content FROM remote_skills WHERE id = ?")
      .get(id) as { content: string | null } | null
    return row?.content ?? null
  }
}
