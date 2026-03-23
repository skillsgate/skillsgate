import { spawn } from "node:child_process"
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import type { RemoteServer, SshResult } from "../types.js"

/** Default SSH key names to try, in priority order. */
const DEFAULT_KEY_NAMES = ["id_ed25519", "id_rsa", "id_ecdsa"]

/**
 * Build the argument list for the system ssh command.
 *
 * - BatchMode=yes prevents interactive password prompts (fail fast).
 * - StrictHostKeyChecking=accept-new auto-accepts new host keys but
 *   rejects changed ones (TOFU model).
 * - ConnectTimeout=10 gives 10 seconds to establish the connection.
 */
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
    // User-specified key -- expand ~ to home directory
    const resolved = server.sshKeyPath.startsWith("~/")
      ? path.join(home, server.sshKeyPath.slice(2))
      : server.sshKeyPath
    args.push("-i", resolved)
  } else {
    // Auto-discover the first existing default key
    for (const name of DEFAULT_KEY_NAMES) {
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

/**
 * Execute a command on a remote server via SSH.
 *
 * Uses the system ssh binary (available on macOS, Linux, Windows via
 * Git Bash/WSL). The command string is passed as a single argument
 * so the remote shell interprets it.
 */
export function sshExec(
  server: RemoteServer,
  command: string
): Promise<SshResult> {
  return new Promise((resolve, reject) => {
    const args = [...buildSshArgs(server), command]
    const proc = spawn("ssh", args, {
      stdio: ["ignore", "pipe", "pipe"],
    })

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []

    proc.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk)
    })

    proc.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk)
    })

    proc.on("error", (err: Error) => {
      reject(new Error(`Failed to spawn ssh: ${err.message}`))
    })

    proc.on("close", (code: number | null) => {
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        exitCode: code ?? 1,
      })
    })
  })
}

/**
 * Test SSH connectivity to a remote server.
 * Returns { ok: true } on success, or { ok: false, error } on failure.
 */
export async function testConnection(
  server: RemoteServer
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await sshExec(server, "echo ok")
    if (result.exitCode === 0) {
      return { ok: true }
    }
    return {
      ok: false,
      error: result.stderr.trim() || `SSH exited with code ${result.exitCode}`,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
