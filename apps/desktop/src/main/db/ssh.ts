import { spawn } from "node:child_process"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import crypto from "node:crypto"
import type { RemoteServer } from "./servers"
import type { RemoteServerStore } from "./servers"
import type { RemoteSkillStore } from "./skills"

// ---------------------------------------------------------------------------
// Types
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
  error?: string
}

// ---------------------------------------------------------------------------
// SSH helpers
// ---------------------------------------------------------------------------

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

export function sshExec(
  server: RemoteServer,
  command: string,
): Promise<SshResult> {
  return new Promise((resolve) => {
    const args = [...buildSshArgs(server), command]
    const proc = spawn("ssh", args, {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 30_000,
    })

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []

    proc.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk))
    proc.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk))

    proc.on("close", (code) => {
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        exitCode: code ?? 1,
      })
    })

    proc.on("error", (err) => {
      resolve({
        stdout: "",
        stderr: err.message,
        exitCode: 1,
      })
    })
  })
}

export async function testConnection(
  server: RemoteServer,
): Promise<{ ok: boolean; error?: string }> {
  const result = await sshExec(server, "echo ok")
  return result.exitCode === 0
    ? { ok: true }
    : { ok: false, error: result.stderr.trim() || "Connection failed" }
}

// ---------------------------------------------------------------------------
// Remote skill scanner (2 SSH round trips)
// ---------------------------------------------------------------------------

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

function parseFrontmatter(content: string): {
  name: string
  description: string | null
} {
  // Simple YAML frontmatter parser
  if (!content.startsWith("---")) {
    // Use first heading or filename-like fallback
    const headingMatch = content.match(/^#\s+(.+)$/m)
    return {
      name: headingMatch ? headingMatch[1].trim() : "Unknown Skill",
      description: null,
    }
  }

  const endIdx = content.indexOf("---", 3)
  if (endIdx === -1) {
    return { name: "Unknown Skill", description: null }
  }

  const frontmatter = content.slice(3, endIdx)
  let name = "Unknown Skill"
  let description: string | null = null

  for (const line of frontmatter.split("\n")) {
    const nameMatch = line.match(/^name:\s*['"]?(.+?)['"]?\s*$/)
    if (nameMatch) name = nameMatch[1]

    const descMatch = line.match(/^description:\s*['"]?(.+?)['"]?\s*$/)
    if (descMatch) description = descMatch[1]
  }

  return { name, description }
}

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf-8").digest("hex")
}

function parseDelimitedOutput(output: string): ScannedRemoteSkill[] {
  const skills: ScannedRemoteSkill[] = []
  let currentPath: string | null = null
  let currentLines: string[] = []

  for (const line of output.split("\n")) {
    if (
      line.startsWith(DELIMITER_PREFIX) &&
      line.endsWith(DELIMITER_SUFFIX) &&
      line.length > DELIMITER_PREFIX.length + DELIMITER_SUFFIX.length
    ) {
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
      currentPath = line.slice(
        DELIMITER_PREFIX.length,
        line.length - DELIMITER_SUFFIX.length,
      )
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

export async function scanRemoteSkills(
  server: RemoteServer,
): Promise<ScannedRemoteSkill[]> {
  const basePath = shellQuotePath(server.skillsBasePath)

  // Round trip 1: Find all SKILL.md files
  const findResult = await sshExec(
    server,
    `find ${basePath} -name 'SKILL.md' -type f 2>/dev/null`,
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
  if (catResult.exitCode !== 0 && catResult.stdout.trim() === "") {
    throw new Error(`Batch read failed: ${catResult.stderr.trim()}`)
  }

  return parseDelimitedOutput(catResult.stdout)
}

// ---------------------------------------------------------------------------
// Sync orchestrator
// ---------------------------------------------------------------------------

export async function syncRemoteServer(
  stores: { remoteServers: RemoteServerStore; remoteSkills: RemoteSkillStore },
  server: RemoteServer,
): Promise<SyncResult> {
  try {
    const scanned = await scanRemoteSkills(server)

    let added = 0
    let updated = 0
    let unchanged = 0

    // Get existing skills for comparison
    const existing = stores.remoteSkills.listByServer(server.id)
    const existingByPath = new Map(existing.map((s) => [s.remotePath, s]))

    for (const skill of scanned) {
      const prev = existingByPath.get(skill.remotePath)
      if (!prev) {
        added++
      } else if (prev.contentHash !== skill.contentHash) {
        updated++
      } else {
        unchanged++
      }

      stores.remoteSkills.upsert({
        serverId: server.id,
        name: skill.name,
        description: skill.description,
        remotePath: skill.remotePath,
        content: skill.content,
        contentHash: skill.contentHash,
      })
    }

    // Remove stale skills
    const currentPaths = scanned.map((s) => s.remotePath)
    const removed = stores.remoteSkills.removeStale(server.id, currentPaths)

    // Update server sync status to success
    stores.remoteServers.updateSyncStatus(server.id, null)

    return { added, updated, removed, unchanged }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    stores.remoteServers.updateSyncStatus(server.id, errorMsg)
    return { added: 0, updated: 0, removed: 0, unchanged: 0, error: errorMsg }
  }
}
