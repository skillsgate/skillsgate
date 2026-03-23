import { BrowserWindow } from "electron"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { listInstalledSkills, detectAgents, agentRegistry } from "./ipc-handlers"

const DEBOUNCE_MS = 500
const CANONICAL_DIR = path.join(os.homedir(), ".agents", "skills")

/**
 * File watcher that monitors all detected agent skill directories
 * and the canonical ~/.agents/skills/ directory for changes.
 *
 * On change, it debounces and re-scans installed skills, then pushes
 * the updated list to the renderer via IPC.
 */
export class SkillsFileWatcher {
  private watchers: fs.FSWatcher[] = []
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  async start(): Promise<void> {
    // Collect all directories to watch
    const dirsToWatch = new Set<string>()

    // Always watch the canonical skills directory
    dirsToWatch.add(CANONICAL_DIR)

    // Watch each detected agent's globalSkillsDir
    const detected = await detectAgents()
    for (const agent of detected) {
      const entry = agentRegistry[agent.name]
      if (entry) {
        dirsToWatch.add(entry.globalSkillsDir)
      }
    }

    for (const dir of dirsToWatch) {
      this.watchDirectory(dir)
    }
  }

  private watchDirectory(dir: string): void {
    // Ensure the directory exists before watching
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // If we can't create it, try watching anyway
    }

    try {
      // Use recursive option on macOS/Windows (supported natively).
      // On Linux, recursive is supported since Node 19+ with inotify.
      const watcher = fs.watch(
        dir,
        { recursive: true, persistent: false },
        (_eventType, _filename) => {
          this.scheduleRescan()
        },
      )

      watcher.on("error", (err) => {
        console.error(`File watcher error for ${dir}:`, err.message)
      })

      this.watchers.push(watcher)
    } catch (err) {
      // Directory may not exist or not be watchable -- that's ok.
      // Skills might not be installed in every agent yet.
      console.warn(
        `Could not watch ${dir}:`,
        err instanceof Error ? err.message : String(err),
      )
    }
  }

  private scheduleRescan(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(async () => {
      this.debounceTimer = null
      try {
        const updatedSkills = await listInstalledSkills()
        // Only send if the window is still alive and not destroyed
        if (!this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send("skills:updated", updatedSkills)
        }
      } catch (err) {
        console.error("Rescan after file change failed:", err)
      }
    }, DEBOUNCE_MS)
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    for (const watcher of this.watchers) {
      try {
        watcher.close()
      } catch {
        // Best effort
      }
    }
    this.watchers = []
  }
}
