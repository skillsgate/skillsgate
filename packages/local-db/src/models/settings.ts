import type { SqliteDriver } from "../types.js"

export class SettingsStore {
  constructor(private driver: SqliteDriver) {}

  get<T>(key: string, defaultValue: T): T {
    const row = this.driver
      .prepare("SELECT value FROM settings WHERE key = ?")
      .get(key) as { value: string } | undefined

    if (!row) {
      return defaultValue
    }

    try {
      return JSON.parse(row.value) as T
    } catch {
      return defaultValue
    }
  }

  set<T>(key: string, value: T): void {
    const json = JSON.stringify(value)
    this.driver
      .prepare(
        `INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at`
      )
      .run(key, json)
  }

  getAll(): Record<string, unknown> {
    const rows = this.driver
      .prepare("SELECT key, value FROM settings")
      .all() as { key: string; value: string }[]

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
