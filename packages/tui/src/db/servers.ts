import type { Database } from "bun:sqlite"
import crypto from "node:crypto"

export interface RemoteServer {
  id: string
  label: string
  host: string
  port: number
  username: string
  skillsBasePath: string
  sshKeyPath: string | null
  lastSyncAt: string | null
  lastSyncError: string | null
  createdAt: string
}

interface ServerRow {
  id: string
  label: string
  host: string
  port: number
  username: string
  skills_base_path: string
  ssh_key_path: string | null
  last_sync_at: string | null
  last_sync_error: string | null
  created_at: string
}

function rowToServer(row: ServerRow): RemoteServer {
  return {
    id: row.id,
    label: row.label,
    host: row.host,
    port: row.port,
    username: row.username,
    skillsBasePath: row.skills_base_path,
    sshKeyPath: row.ssh_key_path,
    lastSyncAt: row.last_sync_at,
    lastSyncError: row.last_sync_error,
    createdAt: row.created_at,
  }
}

export type CreateServerInput = {
  label: string
  host: string
  port: number
  username: string
  skillsBasePath: string
  sshKeyPath?: string | null
}

export class RemoteServerStore {
  private db: Database

  constructor(db: Database) {
    this.db = db
  }

  list(): RemoteServer[] {
    const rows = this.db
      .query("SELECT * FROM remote_servers ORDER BY label ASC")
      .all() as ServerRow[]
    return rows.map(rowToServer)
  }

  get(id: string): RemoteServer | null {
    const row = this.db
      .query("SELECT * FROM remote_servers WHERE id = ?")
      .get(id) as ServerRow | null
    return row ? rowToServer(row) : null
  }

  create(input: CreateServerInput): RemoteServer {
    const id = crypto.randomUUID()
    this.db
      .query(
        `INSERT INTO remote_servers (id, label, host, port, username, skills_base_path, ssh_key_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        input.label,
        input.host,
        input.port,
        input.username,
        input.skillsBasePath,
        input.sshKeyPath ?? null,
      )
    return this.get(id)!
  }

  update(id: string, fields: Partial<CreateServerInput>): void {
    const sets: string[] = []
    const params: unknown[] = []

    if (fields.label !== undefined) {
      sets.push("label = ?")
      params.push(fields.label)
    }
    if (fields.host !== undefined) {
      sets.push("host = ?")
      params.push(fields.host)
    }
    if (fields.port !== undefined) {
      sets.push("port = ?")
      params.push(fields.port)
    }
    if (fields.username !== undefined) {
      sets.push("username = ?")
      params.push(fields.username)
    }
    if (fields.skillsBasePath !== undefined) {
      sets.push("skills_base_path = ?")
      params.push(fields.skillsBasePath)
    }
    if (fields.sshKeyPath !== undefined) {
      sets.push("ssh_key_path = ?")
      params.push(fields.sshKeyPath)
    }

    if (sets.length === 0) return

    params.push(id)
    this.db.query(`UPDATE remote_servers SET ${sets.join(", ")} WHERE id = ?`).run(...params)
  }

  delete(id: string): void {
    this.db.query("DELETE FROM remote_servers WHERE id = ?").run(id)
  }

  updateSyncStatus(id: string, error: string | null): void {
    if (error) {
      this.db
        .query("UPDATE remote_servers SET last_sync_error = ? WHERE id = ?")
        .run(error, id)
    } else {
      this.db
        .query(
          "UPDATE remote_servers SET last_sync_at = datetime('now'), last_sync_error = NULL WHERE id = ?"
        )
        .run(id)
    }
  }

  /** Returns the count of remote skills for a given server. */
  skillCount(serverId: string): number {
    const row = this.db
      .query("SELECT COUNT(*) as cnt FROM remote_skills WHERE server_id = ?")
      .get(serverId) as { cnt: number } | null
    return row?.cnt ?? 0
  }
}
