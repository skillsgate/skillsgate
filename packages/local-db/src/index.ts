// Database
export { openLocalDb, DB_PATH } from "./db.js"
export { runMigrations } from "./migrations.js"

// Stores
export { SettingsStore } from "./models/settings.js"
export { RemoteServerStore } from "./models/remote-servers.js"
export { RemoteSkillStore } from "./models/remote-skills.js"

// SSH
export { buildSshArgs, sshExec, testConnection } from "./ssh/client.js"
export { scanRemoteSkills } from "./ssh/scanner.js"
export { syncRemoteServer } from "./ssh/sync.js"
export { parseSshConfig } from "./ssh/config-parser.js"

// Types
export type {
  SqliteStatement,
  SqliteDriver,
  RemoteServer,
  CreateRemoteServer,
  RemoteSkill,
  UpsertRemoteSkill,
  SshResult,
  ScannedRemoteSkill,
  SyncResult,
  SshConfigEntry,
  LocalDb,
} from "./types.js"
