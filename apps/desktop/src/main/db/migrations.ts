import type Database from "better-sqlite3"

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
        id               TEXT PRIMARY KEY,
        label            TEXT NOT NULL,
        host             TEXT NOT NULL,
        port             INTEGER NOT NULL DEFAULT 22,
        username         TEXT NOT NULL,
        skills_base_path TEXT NOT NULL DEFAULT '~/.agents/skills',
        ssh_key_path     TEXT,
        last_sync_at     TEXT,
        last_sync_error  TEXT,
        created_at       TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(host, port, username)
      );

      CREATE TABLE IF NOT EXISTS remote_skills (
        id           TEXT PRIMARY KEY,
        server_id    TEXT NOT NULL REFERENCES remote_servers(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        description  TEXT,
        remote_path  TEXT NOT NULL,
        content      TEXT,
        content_hash TEXT,
        synced_at    TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(server_id, remote_path)
      );

      CREATE INDEX IF NOT EXISTS idx_remote_skills_server ON remote_skills(server_id);

      INSERT OR IGNORE INTO schema_version VALUES (1);
    `,
  },
  {
    version: 2,
    up: `
      CREATE TABLE IF NOT EXISTS cached_skills (
        canonical_path TEXT PRIMARY KEY,
        folder_name TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        agents TEXT NOT NULL DEFAULT '[]',
        agent_short_codes TEXT NOT NULL DEFAULT '[]',
        scope TEXT NOT NULL DEFAULT 'global',
        project_name TEXT,
        has_supporting_files INTEGER NOT NULL DEFAULT 0,
        supporting_files TEXT NOT NULL DEFAULT '[]',
        source TEXT,
        source_type TEXT,
        installed_at TEXT,
        updated_at TEXT,
        file_mod_time TEXT NOT NULL,
        scanned_at TEXT NOT NULL
      );

      INSERT OR IGNORE INTO schema_version VALUES (2);
    `,
  },
  {
    version: 3,
    up: `
      CREATE TABLE IF NOT EXISTS favorites (
        skill_name TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      INSERT OR IGNORE INTO schema_version VALUES (3);
    `,
  },
  {
    version: 4,
    up: `
      CREATE TABLE IF NOT EXISTS trending_cache (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        fetched_at TEXT NOT NULL,
        payload    TEXT NOT NULL
      );

      INSERT OR IGNORE INTO schema_version VALUES (4);
    `,
  },
  {
    version: 5,
    up: `
      -- JSON snapshot of the server's tool skills folders (links and what
      -- they point to), read at the last refresh or push. Drives the tool
      -- link part of the Servers page status.
      ALTER TABLE remote_servers ADD COLUMN tool_links TEXT;

      INSERT OR IGNORE INTO schema_version VALUES (5);
    `,
  },
]

function getCurrentVersion(db: Database.Database): number {
  try {
    const row = db
      .prepare("SELECT MAX(version) as v FROM schema_version")
      .get() as { v: number | null } | undefined
    return row?.v ?? 0
  } catch {
    // Table does not exist yet
    return 0
  }
}

export function runMigrations(db: Database.Database): void {
  const current = getCurrentVersion(db)
  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      db.exec(migration.up)
    }
  }
}
