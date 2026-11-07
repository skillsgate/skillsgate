import { constants } from "node:fs"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

// Adapted from vercel-labs/skills; see THIRD_PARTY_NOTICES.md.
const LOCK_FILE_VERSION = 1
const LOCK_FILE_PATH = path.join(os.homedir(), ".agents", ".skill-lock.json")

interface SkillLockEntry {
  source: string
  sourceType: string
  originalUrl: string
  skillFolderHash: string
  installedAt: string
  updatedAt: string
}

export interface SkillLockFile {
  version: number
  skills: Record<string, SkillLockEntry>
}

export async function readSkillLock({
  forWrite = false,
  filePath = LOCK_FILE_PATH,
} = {}): Promise<SkillLockFile> {
  let raw: string
  try {
    raw = await fs.readFile(filePath, "utf-8")
  } catch (error) {
    if (forWrite && (error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error
    }
    if (forWrite) {
      let parent = path.dirname(filePath)
      while (true) {
        try {
          await fs.access(parent, constants.W_OK | constants.X_OK)
          break
        } catch (parentError) {
          const ancestor = path.dirname(parent)
          if (
            (parentError as NodeJS.ErrnoException).code !== "ENOENT" ||
            ancestor === parent
          ) {
            throw parentError
          }
          parent = ancestor
        }
      }
    }
    return { version: LOCK_FILE_VERSION, skills: {} }
  }
  if (forWrite) await fs.access(filePath, constants.W_OK)

  let data: SkillLockFile
  try {
    data = JSON.parse(raw)
    if (
      !data ||
      data.version !== LOCK_FILE_VERSION ||
      !data.skills ||
      typeof data.skills !== "object" ||
      Array.isArray(data.skills)
    ) {
      throw new Error(
        "Unsupported or invalid skill lock. Its contents have not been changed.",
      )
    }
  } catch (error) {
    if (forWrite) {
      throw new Error(
        `Cannot modify the skill lock: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return { version: LOCK_FILE_VERSION, skills: {} }
  }
  return data
}

export async function writeSkillLock(lock: SkillLockFile): Promise<void> {
  await fs.mkdir(path.dirname(LOCK_FILE_PATH), { recursive: true })
  await fs.writeFile(LOCK_FILE_PATH, JSON.stringify(lock, null, 2), "utf-8")
}
