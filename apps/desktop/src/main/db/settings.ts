import type Database from "better-sqlite3"

export class SettingsStore {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  get<T>(key: string, defaultValue: T): T {
    const row = this.db
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get(key) as { value: string } | undefined

    if (!row) return defaultValue

    try {
      return JSON.parse(row.value) as T
    } catch {
      return defaultValue
    }
  }

  set<T>(key: string, value: T): void {
    this.db
      .prepare(
        `INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .run(key, JSON.stringify(value))
  }

  getAll(): Record<string, unknown> {
    const rows = this.db
      .prepare("SELECT key, value FROM settings")
      .all() as Array<{ key: string; value: string }>

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
