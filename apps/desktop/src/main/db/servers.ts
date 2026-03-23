import type Database from "better-sqlite3"
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

export class RemoteServerStore {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  list(): RemoteServer[] {
    const rows = this.db
      .prepare("SELECT * FROM remote_servers ORDER BY created_at DESC")
      .all() as ServerRow[]
    return rows.map(rowToServer)
  }

  get(id: string): RemoteServer | null {
    const row = this.db
      .prepare("SELECT * FROM remote_servers WHERE id = ?")
      .get(id) as ServerRow | undefined
    return row ? rowToServer(row) : null
  }

  create(data: {
    label: string
    host: string
    port?: number
    username: string
    skillsBasePath?: string
    sshKeyPath?: string | null
  }): RemoteServer {
    const id = crypto.randomUUID()
    this.db
      .prepare(
        `INSERT INTO remote_servers (id, label, host, port, username, skills_base_path, ssh_key_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        data.label,
        data.host,
        data.port ?? 22,
        data.username,
        data.skillsBasePath ?? "~/.agents/skills",
        data.sshKeyPath ?? null,
      )

    return this.get(id)!
  }

  update(
    id: string,
    fields: Partial<{
      label: string
      host: string
      port: number
      username: string
      skillsBasePath: string
      sshKeyPath: string | null
    }>,
  ): RemoteServer | null {
    const setClauses: string[] = []
    const values: unknown[] = []

    if (fields.label !== undefined) {
      setClauses.push("label = ?")
      values.push(fields.label)
    }
    if (fields.host !== undefined) {
      setClauses.push("host = ?")
      values.push(fields.host)
    }
    if (fields.port !== undefined) {
      setClauses.push("port = ?")
      values.push(fields.port)
    }
    if (fields.username !== undefined) {
      setClauses.push("username = ?")
      values.push(fields.username)
    }
    if (fields.skillsBasePath !== undefined) {
      setClauses.push("skills_base_path = ?")
      values.push(fields.skillsBasePath)
    }
    if (fields.sshKeyPath !== undefined) {
      setClauses.push("ssh_key_path = ?")
      values.push(fields.sshKeyPath)
    }

    if (setClauses.length === 0) return this.get(id)

    values.push(id)
    this.db
      .prepare(
        `UPDATE remote_servers SET ${setClauses.join(", ")} WHERE id = ?`,
      )
      .run(...values)

    return this.get(id)
  }

  delete(id: string): void {
    this.db.prepare("DELETE FROM remote_servers WHERE id = ?").run(id)
  }

  updateSyncStatus(id: string, error: string | null): void {
    if (error) {
      this.db
        .prepare(
          "UPDATE remote_servers SET last_sync_error = ? WHERE id = ?",
        )
        .run(error, id)
    } else {
      this.db
        .prepare(
          "UPDATE remote_servers SET last_sync_at = datetime('now'), last_sync_error = NULL WHERE id = ?",
        )
        .run(id)
    }
  }

  count(): number {
    const row = this.db
      .prepare("SELECT COUNT(*) as cnt FROM remote_servers")
      .get() as { cnt: number }
    return row.cnt
  }
}
