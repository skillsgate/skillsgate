import { createRequire } from "node:module"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import { runMigrations } from "./migrations"

// Use createRequire to load better-sqlite3 at runtime.
// This prevents Vite/Rollup from trying to bundle the native module.
const require = createRequire(import.meta.url)
const Database = require("better-sqlite3")

const DB_PATH = path.join(os.homedir(), ".skillsgate", "skillsgate.db")

let _db: any = null

export function openDb(): any {
  if (_db) return _db

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

  const db = new Database(DB_PATH)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  runMigrations(db)

  _db = db
  return db
}

export function closeDb(): void {
  if (_db) {
    _db.close()
    _db = null
  }
}
