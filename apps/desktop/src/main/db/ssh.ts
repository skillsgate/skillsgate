import { spawn } from "node:child_process"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import crypto from "node:crypto"
import net from "node:net"
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

// ---------------------------------------------------------------------------
// macOS local network privacy
// ---------------------------------------------------------------------------

const LOCAL_NETWORK_HINT =
  "macOS may be blocking SkillsGate from reaching computers on your local network. " +
  "Open System Settings > Privacy & Security > Local Network, turn on SkillsGate, then try again."

function isNoRouteToHost(stderr: string): boolean {
  return /no route to host/i.test(stderr)
}

/**
 * On macOS 15 and later, an app needs Local Network permission to reach
 * computers on the local network, and `ssh` processes it starts are covered
 * by the app's setting. Without it, connections fail with "No route to host".
 */
export function explainSshError(
  stderr: string,
  platform: NodeJS.Platform = process.platform,
): string {
  const message = stderr.trim()
  if (platform !== "darwin" || !isNoRouteToHost(message)) return message
  return `${message}. ${LOCAL_NETWORK_HINT}`
}

const localNetworkProbes = new Map<string, Promise<void>>()

/**
 * Open a short TCP connection to the server from the app's own process.
 * macOS may not ask for Local Network permission when only an `ssh` child
 * process is blocked; a connection from the app itself gives it the chance to
 * ask. The result is ignored. Runs at most once per host and port per launch.
 */
function probeLocalNetwork(host: string, port: number): Promise<void> {
  const key = `${host}:${port}`
  let probe = localNetworkProbes.get(key)
  if (!probe) {
    probe = new Promise<void>((resolve) => {
      const socket = net.connect({ host, port })
      const done = () => {
        clearTimeout(timer)
        socket.destroy()
        resolve()
      }
      // The connection can wait while the permission alert is on screen.
      const timer = setTimeout(done, 3_000)
      socket.once("connect", done)
      socket.once("error", done)
    })
    localNetworkProbes.set(key, probe)
  }
  return probe
}

async function describeSshFailure(
  server: RemoteServer,
  stderr: string,
): Promise<string> {
  if (process.platform === "darwin" && isNoRouteToHost(stderr)) {
    await probeLocalNetwork(server.host, server.port)
  }
  return explainSshError(stderr)
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

    proc.on("close", async (code) => {
      const exitCode = code ?? 1
      let stderr = Buffer.concat(stderrChunks).toString("utf-8")
      if (exitCode !== 0) stderr = await describeSshFailure(server, stderr)
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr,
        exitCode,
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

export async function readRemoteFile(
  server: RemoteServer,
  remotePath: string,
): Promise<string> {
  const escaped = `'${remotePath.replace(/'/g, "'\\''")}'`
  const result = await sshExec(server, `cat ${escaped}`)
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || "Failed to read remote file")
  }
  return result.stdout
}

export async function writeRemoteFile(
  server: RemoteServer,
  remotePath: string,
  content: string,
): Promise<void> {
  const escaped = `'${remotePath.replace(/'/g, "'\\''")}'`
  const command = `mkdir -p "$(dirname ${escaped})" && cat > ${escaped}`
  await new Promise<void>((resolve, reject) => {
    const args = [...buildSshArgs(server), command]
    const proc = spawn("ssh", args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 30_000,
    })

    let stderr = ""
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8")
    })

    proc.on("error", (err) => {
      reject(new Error(err.message))
    })

    proc.on("close", async (code) => {
      if ((code ?? 1) === 0) {
        resolve()
      } else {
        const message = await describeSshFailure(server, stderr)
        reject(new Error(message || `SSH exited with code ${code ?? 1}`))
      }
    })

    proc.stdin.write(content, "utf-8")
    proc.stdin.end()
  })
}

// ---------------------------------------------------------------------------
// Remote skill scanner (2 SSH round trips)
// ---------------------------------------------------------------------------

function shellQuotePath(remotePath: string): string {
  let expanded = remotePath
  if (expanded.startsWith("~/")) {
    // Use single quotes for the rest after $HOME to prevent injection
    const rest = expanded.slice(2).replace(/'/g, "'\\''")
    return `"$HOME"/'${rest}'`
  } else if (expanded === "~") {
    return `"$HOME"`
  }
  // Use single quotes to prevent all shell expansion/injection
  return `'${expanded.replace(/'/g, "'\\''")}'`
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

/**
 * Split the batched read into files. Each delimiter is written as
 * "\n<delimiter>\n", so it always sits on its own line, even after a file with
 * no trailing newline. The lines between two delimiters, joined back with
 * "\n", are therefore the file's exact bytes, and contentHash matches a hash
 * of the same file read locally.
 */
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
        const content = currentLines.join("\n")
        const { name, description } = parseFrontmatter(content.trim())
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
    const content = currentLines.join("\n")
    const { name, description } = parseFrontmatter(content.trim())
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

/**
 * Detect "directory does not exist" errors from `find` stderr.
 * BSD/macOS find: "find: <path>: No such file or directory"
 * GNU find:      "find: '<path>': No such file or directory"
 */
function isMissingDirError(stderr: string): boolean {
  return /no such file or directory/i.test(stderr)
}

export async function scanRemoteSkills(
  server: RemoteServer,
): Promise<ScannedRemoteSkill[]> {
  const basePath = shellQuotePath(server.skillsBasePath)

  // Round trip 1: Find all SKILL.md files. Capture stderr (do NOT redirect to
  // /dev/null) so we can distinguish "directory doesn't exist" from real errors.
  const findResult = await sshExec(
    server,
    `find ${basePath} -name 'SKILL.md' -type f`,
  )

  const paths = findResult.stdout
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)

  if (findResult.exitCode !== 0 && paths.length === 0) {
    const stderr = findResult.stderr.trim()
    // Missing skills directory on a fresh remote is a normal state, not a sync
    // failure -- treat it as zero skills so the user can populate it later.
    if (isMissingDirError(stderr)) return []
    throw new Error(
      stderr || `find exited with code ${findResult.exitCode} on ${server.skillsBasePath}`,
    )
  }
  if (paths.length === 0) return []

  // Round trip 2: Batch read all files in a single SSH call.
  // Single-quote escaping below handles arbitrary characters in the path safely;
  // only reject paths with chars that would break our delimiter parser.
  const safePaths = paths.filter((p) => !/[\x00\n\r]/.test(p))
  if (safePaths.length === 0) return []

  const catCommands = safePaths
    .map((p) => {
      const escaped = `'${p.replace(/'/g, "'\\''")}'`
      const delimPath = p.replace(/'/g, "'\\''")
      return `printf '\\n%s\\n' '${DELIMITER_PREFIX}${delimPath}${DELIMITER_SUFFIX}' && cat ${escaped}`
    })
    .join(" && ")

  const catResult = await sshExec(server, catCommands)
  if (catResult.exitCode !== 0 && catResult.stdout.trim() === "") {
    throw new Error(
      catResult.stderr.trim() ||
        `cat exited with code ${catResult.exitCode}`,
    )
  }

  return parseDelimitedOutput(catResult.stdout)
}

/**
 * Upload an entire local skill directory to the remote server.
 * Streams `tar -cf - -C <parentLocalDir> <folderName>` into
 * `tar -xf - -C <remoteBaseDir>` over SSH.
 *
 * Both directories must already exist on the remote (caller ensures via mkdir -p).
 */
export async function uploadSkillDir(
  server: RemoteServer,
  parentLocalDir: string,
  folderName: string,
  remoteBaseDir: string,
): Promise<void> {
  // Ensure remote base dir exists first
  const baseQuoted = shellQuotePath(remoteBaseDir)
  const mkdirResult = await sshExec(server, `mkdir -p ${baseQuoted}`)
  if (mkdirResult.exitCode !== 0) {
    throw new Error(
      mkdirResult.stderr.trim() || `mkdir -p failed for ${remoteBaseDir}`,
    )
  }

  await new Promise<void>((resolve, reject) => {
    const tarLocal = spawn("tar", ["-cf", "-", "-C", parentLocalDir, folderName], {
      stdio: ["ignore", "pipe", "pipe"],
    })

    const sshArgs = [...buildSshArgs(server), `tar -xf - -C ${baseQuoted}`]
    const tarRemote = spawn("ssh", sshArgs, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120_000,
    })

    let localStderr = ""
    let remoteStderr = ""
    tarLocal.stderr.on("data", (c: Buffer) => (localStderr += c.toString("utf-8")))
    tarRemote.stderr.on("data", (c: Buffer) => (remoteStderr += c.toString("utf-8")))

    tarLocal.stdout.pipe(tarRemote.stdin)

    tarLocal.on("error", (err) => reject(err))
    tarRemote.on("error", (err) => reject(err))

    tarRemote.on("close", async (code) => {
      if ((code ?? 1) === 0) {
        resolve()
      } else {
        const remoteMessage = await describeSshFailure(server, remoteStderr)
        reject(
          new Error(
            remoteMessage ||
              localStderr.trim() ||
              `tar pipeline exited with code ${code ?? 1}`,
          ),
        )
      }
    })
  })
}

/**
 * Delete a single skill directory on the remote.
 * Used only by Mirror mode. Caller is responsible for confirming with the user.
 */
export async function deleteRemoteSkillDir(
  server: RemoteServer,
  remoteSkillDir: string,
): Promise<void> {
  const quoted = shellQuotePath(remoteSkillDir)
  // Refuse to delete the entire skills base path or anything ending in '/'
  if (
    !remoteSkillDir ||
    remoteSkillDir === "/" ||
    remoteSkillDir === server.skillsBasePath ||
    remoteSkillDir === server.skillsBasePath.replace(/\/+$/, "")
  ) {
    throw new Error(`Refusing to delete suspicious remote path: ${remoteSkillDir}`)
  }
  const result = await sshExec(server, `rm -rf ${quoted}`)
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.trim() || `rm -rf failed for ${remoteSkillDir}`)
  }
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
