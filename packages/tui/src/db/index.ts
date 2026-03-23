import { Database } from "bun:sqlite"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import { runMigrations } from "./migrations.js"

const DB_DIR = path.join(os.homedir(), ".skillsgate")
const DB_PATH = path.join(DB_DIR, "skillsgate.db")

export function openDb(): Database {
  fs.mkdirSync(DB_DIR, { recursive: true })
  const db = new Database(DB_PATH)
  db.exec("PRAGMA journal_mode=WAL")
  db.exec("PRAGMA foreign_keys=ON")
  runMigrations(db)
  return db
}

export type { Database } from "bun:sqlite"
