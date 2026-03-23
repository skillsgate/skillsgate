import type { SqliteDriver } from "./types.js"

interface Migration {
  version: number
  up: string
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS remote_servers (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 22,
        username TEXT NOT NULL,
        skills_base_path TEXT NOT NULL DEFAULT '~/.agents/skills',
        ssh_key_path TEXT,
        auto_sync INTEGER NOT NULL DEFAULT 1,
        last_sync_at TEXT,
        last_sync_error TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(host, port, username)
      );

      CREATE TABLE IF NOT EXISTS remote_skills (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES remote_servers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        remote_path TEXT NOT NULL,
        content TEXT,
        content_hash TEXT,
        synced_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(server_id, remote_path)
      );

      CREATE INDEX IF NOT EXISTS idx_remote_skills_server ON remote_skills(server_id);
    `,
  },
]

function getCurrentVersion(driver: SqliteDriver): number {
  // Check if schema_version table exists
  const row = driver
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    )
    .get() as { name: string } | undefined

  if (!row) {
    return 0
  }

  const versionRow = driver
    .prepare("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1")
    .get() as { version: number } | undefined

  return versionRow?.version ?? 0
}

export function runMigrations(driver: SqliteDriver): void {
  const current = getCurrentVersion(driver)

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      driver.exec(migration.up)

      // Upsert schema version
      if (current === 0) {
        driver.exec(
          `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)`
        )
      }
      driver
        .prepare(
          "INSERT INTO schema_version (version) VALUES (?)"
        )
        .run(migration.version)
    }
  }
}
