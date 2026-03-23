import { spawn } from "node:child_process"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import crypto from "node:crypto"
import type { RemoteServer } from "./servers.js"
import type { RemoteServerStore } from "./servers.js"
import type { RemoteSkillStore } from "./skills.js"

// ---------- SSH Execution ----------

export interface SshResult {
  stdout: string
  stderr: string
  exitCode: number
}

export function buildSshArgs(server: RemoteServer): string[] {
  const home = os.homedir()
  const args = [
    "-p",
    String(server.port),
    "-o",
    "ConnectTimeout=10",
    "-o",
    "BatchMode=yes",
    "-o",
    "StrictHostKeyChecking=accept-new",
  ]

  if (server.sshKeyPath) {
    const resolved = server.sshKeyPath.startsWith("~/")
      ? path.join(home, server.sshKeyPath.slice(2))
      : server.sshKeyPath
    args.push("-i", resolved)
  } else {
    // Auto-discover first existing default key
    for (const name of ["id_ed25519", "id_rsa", "id_ecdsa"]) {
      const keyPath = path.join(home, ".ssh", name)
      if (fs.existsSync(keyPath)) {
        args.push("-i", keyPath)
        break
      }
    }
  }

  args.push(`${server.username}@${server.host}`)
  return args
}

export function sshExec(server: RemoteServer, command: string): Promise<SshResult> {
  return new Promise((resolve, reject) => {
    const args = [...buildSshArgs(server), command]
    const proc = spawn("ssh", args, {
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString()
    })

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn ssh: ${err.message}`))
    })

    proc.on("close", (exitCode) => {
      resolve({
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
      })
    })
  })
}

export async function testConnection(
  server: RemoteServer
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await sshExec(server, "echo ok")
    if (result.exitCode === 0 && result.stdout.trim() === "ok") {
      return { ok: true }
    }
    return { ok: false, error: result.stderr.trim() || `Exit code ${result.exitCode}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}

// ---------- Remote Skill Scanner ----------

function shellQuotePath(remotePath: string): string {
  let expanded = remotePath
  if (expanded.startsWith("~/")) {
    expanded = "$HOME/" + expanded.slice(2)
  } else if (expanded === "~") {
    expanded = "$HOME"
  }
  return `"${expanded.replace(/"/g, '\\"')}"`
}

const DELIMITER_PREFIX = "---SKILLSGATE_DELIM:"
const DELIMITER_SUFFIX = "---"

interface ScannedRemoteSkill {
  name: string
  description: string | null
  remotePath: string
  content: string
  contentHash: string
}

/**
 * Parse simple frontmatter from SKILL.md content to extract name and description.
 */
function parseFrontmatter(content: string): { name: string; description: string | null } {
  const lines = content.split("\n")
  if (lines[0]?.trim() !== "---") {
    // No frontmatter; derive name from first heading
    for (const line of lines) {
      if (line.startsWith("# ")) {
        return { name: line.slice(2).trim(), description: null }
      }
    }
    return { name: "unknown", description: null }
  }

  let name = "unknown"
  let description: string | null = null

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") break
    const match = lines[i].match(/^(\w+):\s*(.+)/)
    if (match) {
      const key = match[1].toLowerCase()
      const value = match[2].trim().replace(/^["']|["']$/g, "")
      if (key === "name") name = value
      if (key === "description") description = value
    }
  }

  return { name, description }
}

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex")
}

export async function scanRemoteSkills(
  server: RemoteServer
): Promise<ScannedRemoteSkill[]> {
  const basePath = shellQuotePath(server.skillsBasePath)

  // Round trip 1: Find all SKILL.md files
  const findResult = await sshExec(
    server,
    `find ${basePath} -name 'SKILL.md' -type f 2>/dev/null`
  )
  if (findResult.exitCode !== 0 && findResult.stdout.trim() === "") {
    throw new Error(`Find failed: ${findResult.stderr.trim()}`)
  }

  const paths = findResult.stdout.trim().split("\n").filter(Boolean)
  if (paths.length === 0) return []

  // Round trip 2: Batch read all files in a single SSH call
  const catCommands = paths
    .map((p) => {
      const escaped = `'${p.replace(/'/g, "'\\''")}'`
      return `echo '${DELIMITER_PREFIX}${p}${DELIMITER_SUFFIX}' && cat ${escaped}`
    })
    .join(" && ")

  const catResult = await sshExec(server, catCommands)
  if (catResult.exitCode !== 0) {
    throw new Error(`Batch read failed: ${catResult.stderr.trim()}`)
  }

  return parseDelimitedOutput(catResult.stdout)
}

function parseDelimitedOutput(output: string): ScannedRemoteSkill[] {
  const skills: ScannedRemoteSkill[] = []
  let currentPath: string | null = null
  let currentLines: string[] = []

  for (const line of output.split("\n")) {
    if (line.startsWith(DELIMITER_PREFIX) && line.endsWith(DELIMITER_SUFFIX)) {
      // Flush previous skill
      if (currentPath) {
        const content = currentLines.join("\n").trim()
        const { name, description } = parseFrontmatter(content)
        skills.push({
          name,
          description,
          remotePath: currentPath,
          content,
          contentHash: sha256(content),
        })
      }
      // Start next skill
      currentPath = line.slice(DELIMITER_PREFIX.length, -DELIMITER_SUFFIX.length)
      currentLines = []
    } else {
      currentLines.push(line)
    }
  }

  // Flush last skill
  if (currentPath) {
    const content = currentLines.join("\n").trim()
    const { name, description } = parseFrontmatter(content)
    skills.push({
      name,
      description,
      remotePath: currentPath,
      content,
      contentHash: sha256(content),
    })
  }

  return skills
}

// ---------- Sync Orchestrator ----------

export interface SyncResult {
  added: number
  updated: number
  removed: number
  unchanged: number
  total: number
  log: string[]
}

export async function syncRemoteServer(
  server: RemoteServer,
  serverStore: RemoteServerStore,
  skillStore: RemoteSkillStore
): Promise<SyncResult> {
  const log: string[] = []
  log.push(`Connecting to ${server.username}@${server.host}...`)

  try {
    const scanned = await scanRemoteSkills(server)

    log.push(`Found ${scanned.length} skill(s):`)
    for (const s of scanned) {
      log.push(`  ${s.remotePath}`)
    }

    // Get existing skills for comparison
    const existing = skillStore.listByServer(server.id)
    const existingByPath = new Map(existing.map((s) => [s.remotePath, s]))

    let added = 0
    let updated = 0
    let unchanged = 0

    for (const scannedSkill of scanned) {
      const prev = existingByPath.get(scannedSkill.remotePath)
      if (!prev) {
        added++
      } else if (prev.contentHash !== scannedSkill.contentHash) {
        updated++
      } else {
        unchanged++
      }

      skillStore.upsert({
        serverId: server.id,
        name: scannedSkill.name,
        description: scannedSkill.description,
        remotePath: scannedSkill.remotePath,
        content: scannedSkill.content,
        contentHash: scannedSkill.contentHash,
      })
    }

    // Remove stale skills
    const currentPaths = scanned.map((s) => s.remotePath)
    const removed = skillStore.removeStale(server.id, currentPaths)

    // Update sync status on success
    serverStore.updateSyncStatus(server.id, null)

    const summary = `Synced: ${added} new, ${updated} updated, ${removed} removed, ${unchanged} unchanged`
    log.push(summary)

    return {
      added,
      updated,
      removed,
      unchanged,
      total: scanned.length,
      log,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    log.push(`SSH connection failed: ${errorMsg}`)
    serverStore.updateSyncStatus(server.id, errorMsg)
    return {
      added: 0,
      updated: 0,
      removed: 0,
      unchanged: 0,
      total: 0,
      log,
    }
  }
}
