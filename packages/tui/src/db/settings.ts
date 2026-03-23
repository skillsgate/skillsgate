import type { Database } from "bun:sqlite"

export class SettingsStore {
  private db: Database

  constructor(db: Database) {
    this.db = db
  }

  get<T>(key: string, defaultValue: T): T {
    const row = this.db.query("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | null
    if (!row) return defaultValue
    try {
      return JSON.parse(row.value) as T
    } catch {
      return defaultValue
    }
  }

  set<T>(key: string, value: T): void {
    this.db
      .query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key)
         DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .run(key, JSON.stringify(value))
  }

  getAll(): Record<string, unknown> {
    const rows = this.db.query("SELECT key, value FROM settings").all() as { key: string; value: string }[]
    const result: Record<string, unknown> = {}
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value)
      } catch {
        result[row.key] = row.value
      }
    }
    return result
  }
}
