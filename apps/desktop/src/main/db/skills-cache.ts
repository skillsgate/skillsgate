import type Database from "better-sqlite3"
import { openDb } from "./index"

/**
 * Cached skill row as stored in SQLite.
 * JSON array fields (agents, agentShortCodes, supportingFiles) are stored as
 * TEXT and parsed on read.
 */
interface CachedSkillRow {
  canonical_path: string
  folder_name: string
  name: string
  description: string
  agents: string
  agent_short_codes: string
  scope: string
  project_name: string | null
  has_supporting_files: number
  supporting_files: string
  source: string | null
  source_type: string | null
  installed_at: string | null
  updated_at: string | null
  file_mod_time: string
  scanned_at: string
}

/**
 * The shape returned by listInstalledSkills and expected by the renderer.
 * Matches the global InstalledSkill interface from api.d.ts.
 */
interface InstalledSkillWithFolder {
  name: string
  description: string
  path: string
  canonicalPath: string
  agents: string[]
  agentShortCodes: string[]
  scope: "global" | "project" | "custom"
  projectName: string | null
  hasSupportingFiles: boolean
  supportingFiles: Array<{ relativePath: string; size: number }>
  source?: string
  sourceType?: string
  installedAt?: string
  updatedAt?: string
  folderName: string
}

function parseJsonSafe<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

function rowToSkill(row: CachedSkillRow): InstalledSkillWithFolder {
  return {
    name: row.name,
    description: row.description,
    path: row.canonical_path,
    canonicalPath: row.canonical_path,
    agents: parseJsonSafe<string[]>(row.agents, []),
    agentShortCodes: parseJsonSafe<string[]>(row.agent_short_codes, []),
    scope: row.scope as "global" | "project" | "custom",
    projectName: row.project_name,
    hasSupportingFiles: row.has_supporting_files === 1,
    supportingFiles: parseJsonSafe<Array<{ relativePath: string; size: number }>>(
      row.supporting_files,
      [],
    ),
    source: row.source ?? undefined,
    sourceType: row.source_type ?? undefined,
    installedAt: row.installed_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    folderName: row.folder_name,
  }
}

/**
 * Load all cached skills from the database.
 * Returns an empty array if the table is empty or an error occurs.
 */
export function loadCachedSkills(): InstalledSkillWithFolder[] {
  try {
    const db: Database.Database = openDb()
    const rows = db
      .prepare("SELECT * FROM cached_skills ORDER BY name ASC")
      .all() as CachedSkillRow[]
    return rows.map(rowToSkill)
  } catch {
    return []
  }
}

/**
 * Real paths of every cached skill folder. Returns an empty array on error.
 */
export function loadCachedSkillPaths(): string[] {
  try {
    const db: Database.Database = openDb()
    const rows = db.prepare("SELECT canonical_path FROM cached_skills").all() as Array<
      Pick<CachedSkillRow, "canonical_path">
    >
    return rows.map((row) => row.canonical_path)
  } catch {
    return []
  }
}

/**
 * Replace the entire cache with a fresh set of skills.
 * Uses a transaction for atomicity and speed (one disk sync instead of N).
 */
export function saveCachedSkills(skills: InstalledSkillWithFolder[]): void {
  const db: Database.Database = openDb()
  const now = new Date().toISOString()

  const insert = db.prepare(`
    INSERT OR REPLACE INTO cached_skills (
      canonical_path, folder_name, name, description,
      agents, agent_short_codes, scope, project_name,
      has_supporting_files, supporting_files,
      source, source_type, installed_at, updated_at,
      file_mod_time, scanned_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?
    )
  `)

  const txn = db.transaction(() => {
    // Callers pass the complete list. A quick rescan, which never walks the scan
    // paths, merges the cached scan-path skills into its result before saving
    // (see runRescan), so replacing the whole table cannot wipe them out.
    db.prepare("DELETE FROM cached_skills").run()

    for (const skill of skills) {
      insert.run(
        skill.canonicalPath,
        skill.folderName,
        skill.name,
        skill.description,
        JSON.stringify(skill.agents),
        JSON.stringify(skill.agentShortCodes),
        skill.scope,
        skill.projectName ?? null,
        skill.hasSupportingFiles ? 1 : 0,
        JSON.stringify(skill.supportingFiles),
        skill.source ?? null,
        skill.sourceType ?? null,
        skill.installedAt ?? null,
        skill.updatedAt ?? null,
        now, // file_mod_time -- best-effort timestamp of when the data was captured
        now, // scanned_at
      )
    }
  })

  txn()
}

/**
 * Clear the entire skills cache.
 */
export function clearCache(): void {
  try {
    const db: Database.Database = openDb()
    db.prepare("DELETE FROM cached_skills").run()
  } catch {
    // Best effort -- table may not exist yet
  }
}
