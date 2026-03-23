import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import type { SshConfigEntry } from "../types.js"

/**
 * Parse ~/.ssh/config to extract Host entries for auto-suggest when
 * adding a remote server.
 *
 * Returns an array of parsed entries with host, hostname, user, port,
 * and identityFile fields. Wildcard hosts (containing * or ?) are skipped.
 */
export function parseSshConfig(
  configPath?: string
): SshConfigEntry[] {
  const filePath =
    configPath ?? path.join(os.homedir(), ".ssh", "config")

  let content: string
  try {
    content = fs.readFileSync(filePath, "utf-8")
  } catch {
    // File doesn't exist or isn't readable -- that's fine
    return []
  }

  const entries: SshConfigEntry[] = []
  let current: Partial<SshConfigEntry> | null = null

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim()

    // Skip comments and empty lines
    if (line.startsWith("#") || line.length === 0) {
      continue
    }

    // Parse "Key Value" or "Key=Value" format
    const match = line.match(/^(\S+)\s+(.+)$/) ?? line.match(/^(\S+)=(.+)$/)
    if (!match) continue

    const key = match[1].toLowerCase()
    const value = match[2].trim()

    if (key === "host") {
      // Flush previous entry
      if (current?.host) {
        entries.push({
          host: current.host,
          hostname: current.hostname ?? null,
          user: current.user ?? null,
          port: current.port ?? null,
          identityFile: current.identityFile ?? null,
        })
      }

      // Skip wildcard hosts
      if (value.includes("*") || value.includes("?")) {
        current = null
        continue
      }

      current = { host: value }
    } else if (current) {
      switch (key) {
        case "hostname":
          current.hostname = value
          break
        case "user":
          current.user = value
          break
        case "port":
          current.port = parseInt(value, 10) || null
          break
        case "identityfile":
          // Expand ~ to home directory
          current.identityFile = value.startsWith("~/")
            ? path.join(os.homedir(), value.slice(2))
            : value
          break
      }
    }
  }

  // Flush last entry
  if (current?.host) {
    entries.push({
      host: current.host,
      hostname: current.hostname ?? null,
      user: current.user ?? null,
      port: current.port ?? null,
      identityFile: current.identityFile ?? null,
    })
  }

  return entries
}
