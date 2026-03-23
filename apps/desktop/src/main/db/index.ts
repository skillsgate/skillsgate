import Database from "better-sqlite3"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import { runMigrations } from "./migrations"

const DB_PATH = path.join(os.homedir(), ".skillsgate", "skillsgate.db")

let _db: Database.Database | null = null

export function openDb(): Database.Database {
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
