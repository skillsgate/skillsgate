import type { Database } from "bun:sqlite"

interface Migration {
  version: number
  up: string
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS remote_servers (
        id              TEXT PRIMARY KEY,
        label           TEXT NOT NULL,
        host            TEXT NOT NULL,
        port            INTEGER NOT NULL DEFAULT 22,
        username        TEXT NOT NULL,
        skills_base_path TEXT NOT NULL DEFAULT '~/.agents/skills',
        ssh_key_path    TEXT,
        last_sync_at    TEXT,
        last_sync_error TEXT,
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(host, port, username)
      );

      CREATE TABLE IF NOT EXISTS remote_skills (
        id          TEXT PRIMARY KEY,
        server_id   TEXT NOT NULL REFERENCES remote_servers(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        description TEXT,
        remote_path TEXT NOT NULL,
        content     TEXT,
        content_hash TEXT,
        synced_at   TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(server_id, remote_path)
      );

      CREATE INDEX IF NOT EXISTS idx_remote_skills_server ON remote_skills(server_id);

      INSERT OR IGNORE INTO schema_version VALUES (1);
    `,
  },
]

function getCurrentVersion(db: Database): number {
  try {
    const row = db.query("SELECT MAX(version) as v FROM schema_version").get() as { v: number | null } | null
    return row?.v ?? 0
  } catch {
    // Table doesn't exist yet
    return 0
  }
}

export function runMigrations(db: Database): void {
  const current = getCurrentVersion(db)
  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      db.exec(migration.up)
    }
  }
}
