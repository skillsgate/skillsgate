// ---------------------------------------------------------------------------
// SQLite driver abstraction
// ---------------------------------------------------------------------------
// Both bun:sqlite and better-sqlite3 satisfy this interface.
// Consumers create the driver instance and pass it to openLocalDb().

export interface SqliteStatement {
  run(...params: any[]): { changes: number }
  get(...params: any[]): any
  all(...params: any[]): any[]
}

export interface SqliteDriver {
  exec(sql: string): void
  prepare(sql: string): SqliteStatement
  close(): void
}

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

export interface RemoteServer {
  id: string
  label: string
  host: string
  port: number
  username: string
  skillsBasePath: string
  sshKeyPath: string | null
  autoSync: boolean
  lastSyncAt: string | null
  lastSyncError: string | null
  createdAt: string
}

export type CreateRemoteServer = Omit<
  RemoteServer,
  "id" | "createdAt" | "lastSyncAt" | "lastSyncError"
>

export interface RemoteSkill {
  id: string
  serverId: string
  name: string
  description: string | null
  remotePath: string
  content: string | null
  contentHash: string | null
  syncedAt: string
}

export type UpsertRemoteSkill = Omit<RemoteSkill, "id" | "syncedAt">

// ---------------------------------------------------------------------------
// SSH types
// ---------------------------------------------------------------------------

export interface SshResult {
  stdout: string
  stderr: string
  exitCode: number
}

export interface ScannedRemoteSkill {
  name: string
  description: string | null
  remotePath: string
  content: string
  contentHash: string
}

export interface SyncResult {
  added: number
  updated: number
  removed: number
  unchanged: number
}

// ---------------------------------------------------------------------------
// SSH config parser types
// ---------------------------------------------------------------------------

export interface SshConfigEntry {
  host: string
  hostname: string | null
  user: string | null
  port: number | null
  identityFile: string | null
}

// ---------------------------------------------------------------------------
// LocalDb aggregate
// ---------------------------------------------------------------------------

import type { SettingsStore } from "./models/settings.js"
import type { RemoteServerStore } from "./models/remote-servers.js"
import type { RemoteSkillStore } from "./models/remote-skills.js"

export interface LocalDb {
  settings: SettingsStore
  remoteServers: RemoteServerStore
  remoteSkills: RemoteSkillStore
  close(): void
}
