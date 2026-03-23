import crypto from "node:crypto"
import type { SqliteDriver, RemoteServer, CreateRemoteServer } from "../types.js"

/** Map a snake_case DB row to a camelCase RemoteServer object. */
function rowToServer(row: any): RemoteServer {
  return {
    id: row.id,
    label: row.label,
    host: row.host,
    port: row.port,
    username: row.username,
    skillsBasePath: row.skills_base_path,
    sshKeyPath: row.ssh_key_path ?? null,
    autoSync: row.auto_sync === 1,
    lastSyncAt: row.last_sync_at ?? null,
    lastSyncError: row.last_sync_error ?? null,
    createdAt: row.created_at,
  }
}

export class RemoteServerStore {
  constructor(private driver: SqliteDriver) {}

  list(): RemoteServer[] {
    const rows = this.driver
      .prepare("SELECT * FROM remote_servers ORDER BY created_at ASC")
      .all()
    return rows.map(rowToServer)
  }

  get(id: string): RemoteServer | null {
    const row = this.driver
      .prepare("SELECT * FROM remote_servers WHERE id = ?")
      .get(id)
    return row ? rowToServer(row) : null
  }

  create(server: CreateRemoteServer): RemoteServer {
    const id = crypto.randomUUID()
    this.driver
      .prepare(
        `INSERT INTO remote_servers (id, label, host, port, username, skills_base_path, ssh_key_path, auto_sync)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        server.label,
        server.host,
        server.port,
        server.username,
        server.skillsBasePath,
        server.sshKeyPath,
        server.autoSync ? 1 : 0
      )
    return this.get(id)!
  }

  update(id: string, fields: Partial<CreateRemoteServer>): void {
    const sets: string[] = []
    const values: any[] = []

    if (fields.label !== undefined) {
      sets.push("label = ?")
      values.push(fields.label)
    }
    if (fields.host !== undefined) {
      sets.push("host = ?")
      values.push(fields.host)
    }
    if (fields.port !== undefined) {
      sets.push("port = ?")
      values.push(fields.port)
    }
    if (fields.username !== undefined) {
      sets.push("username = ?")
      values.push(fields.username)
    }
    if (fields.skillsBasePath !== undefined) {
      sets.push("skills_base_path = ?")
      values.push(fields.skillsBasePath)
    }
    if (fields.sshKeyPath !== undefined) {
      sets.push("ssh_key_path = ?")
      values.push(fields.sshKeyPath)
    }
    if (fields.autoSync !== undefined) {
      sets.push("auto_sync = ?")
      values.push(fields.autoSync ? 1 : 0)
    }

    if (sets.length === 0) return

    values.push(id)
    this.driver
      .prepare(`UPDATE remote_servers SET ${sets.join(", ")} WHERE id = ?`)
      .run(...values)
  }

  delete(id: string): void {
    // CASCADE in schema handles remote_skills deletion
    this.driver.prepare("DELETE FROM remote_servers WHERE id = ?").run(id)
  }

  updateSyncStatus(id: string, error: string | null): void {
    if (error) {
      this.driver
        .prepare(
          "UPDATE remote_servers SET last_sync_error = ? WHERE id = ?"
        )
        .run(error, id)
    } else {
      this.driver
        .prepare(
          "UPDATE remote_servers SET last_sync_at = datetime('now'), last_sync_error = NULL WHERE id = ?"
        )
        .run(id)
    }
  }
}
