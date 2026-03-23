import crypto from "node:crypto"
import type { RemoteServer, ScannedRemoteSkill } from "../types.js"
import { sshExec } from "./client.js"

const DELIMITER_PREFIX = "---SKILLSGATE_DELIM:"
const DELIMITER_SUFFIX = "---"

/**
 * Expand ~ to $HOME for use in remote shell commands.
 * Double-quotes preserve $HOME expansion while protecting spaces.
 */
function shellQuotePath(remotePath: string): string {
  let expanded = remotePath
  if (expanded.startsWith("~/")) {
    expanded = "$HOME/" + expanded.slice(2)
  } else if (expanded === "~") {
    expanded = "$HOME"
  }
  // Double-quote: preserves $HOME expansion, protects spaces
  return `"${expanded.replace(/"/g, '\\"')}"`
}

/**
 * Extract name and description from YAML frontmatter.
 * Uses a simple regex approach -- no gray-matter dependency.
 *
 * Expects format:
 *   ---
 *   name: My Skill
 *   description: Does something useful
 *   ---
 */
function parseFrontmatter(content: string): {
  name: string
  description: string | null
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) {
    // Fall back to first heading or filename
    const headingMatch = content.match(/^#\s+(.+)/m)
    return {
      name: headingMatch?.[1]?.trim() ?? "Untitled",
      description: null,
    }
  }

  const frontmatter = match[1]
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m)
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m)

  return {
    name: nameMatch?.[1]?.trim() ?? "Untitled",
    description: descMatch?.[1]?.trim() ?? null,
  }
}

/** Compute SHA-256 hex digest of a string. */
function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf-8").digest("hex")
}

/**
 * Parse the delimiter-separated output from a batch cat command
 * into individual (path, content) pairs.
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
        line.length - DELIMITER_SUFFIX.length
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

/**
 * Discover SKILL.md files on a remote server using exactly 2 SSH round trips.
 *
 * Round trip 1: find all SKILL.md files under the server's skills base path.
 * Round trip 2: batch-read ALL files in a single SSH call using delimiter parsing.
 */
export async function scanRemoteSkills(
  server: RemoteServer
): Promise<ScannedRemoteSkill[]> {
  const basePath = shellQuotePath(server.skillsBasePath)

  // Round trip 1: Find all SKILL.md files
  const findResult = await sshExec(
    server,
    `find ${basePath} -name 'SKILL.md' -type f 2>/dev/null`
  )

  if (findResult.exitCode !== 0 && findResult.stderr.trim()) {
    throw new Error(`Find failed: ${findResult.stderr.trim()}`)
  }

  const paths = findResult.stdout
    .trim()
    .split("\n")
    .filter((p) => p.length > 0)

  if (paths.length === 0) {
    return []
  }

  // Round trip 2: Batch read ALL files in a single SSH call
  // Each file is prefixed with a delimiter line containing its path
  const catCommands = paths
    .map((p) => {
      // Single-quote paths for the cat command to avoid shell interpretation
      const escaped = p.replace(/'/g, "'\\''")
      return `echo '${DELIMITER_PREFIX}${p}${DELIMITER_SUFFIX}' && cat '${escaped}'`
    })
    .join(" && ")

  const catResult = await sshExec(server, catCommands)

  if (catResult.exitCode !== 0 && catResult.stderr.trim()) {
    throw new Error(`Batch read failed: ${catResult.stderr.trim()}`)
  }

  return parseDelimitedOutput(catResult.stdout)
}
