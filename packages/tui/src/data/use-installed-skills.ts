import { useEffect } from "react"
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { useStore, useDispatch } from "../store/context.js"
import { agents } from "../../../cli/src/core/agents.js"
import { readSkillLock } from "../../../cli/src/core/skill-lock.js"
import { SKILL_MD } from "../../../cli/src/constants.js"
import type { EnrichedSkill } from "../store/types.js"
import type { AgentType, SkillLockFile } from "../../../cli/src/types.js"

/**
 * Scans all detected agent globalSkillsDir paths for SKILL.md files,
 * parses them with gray-matter, enriches with lock file data, and
 * populates the store.
 */
export function useInstalledSkills() {
  const dispatch = useDispatch()
  const { installedLoading } = useStore()

  useEffect(() => {
    // Only scan when installedLoading is true (initial mount or refresh triggered)
    if (!installedLoading) return

    let cancelled = false

    async function scan() {
      dispatch({ type: "SET_INSTALLED_LOADING", loading: true })

      try {
        const lock = await readSkillLock()
        // Map: skillName -> EnrichedSkill (deduplicating across agents)
        const skillMap = new Map<string, EnrichedSkill>()

        // Scan each agent's global skills directory
        for (const agent of Object.values(agents)) {
          const skillsDir = agent.globalSkillsDir
          try {
            const entries = await fs.readdir(skillsDir, { withFileTypes: true })
            for (const entry of entries) {
              // Include both real directories and symlinks (skills are often symlinked)
              if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

              const skillMdPath = path.join(skillsDir, entry.name, SKILL_MD)
              try {
                const raw = await fs.readFile(skillMdPath, "utf-8")
                const { data: frontmatter } = matter(raw)
                const skillName = entry.name

                const existing = skillMap.get(skillName)
                if (existing) {
                  // Skill already seen from another agent - add this agent
                  if (!existing.agents.includes(agent.name)) {
                    existing.agents.push(agent.name)
                  }
                } else {
                  skillMap.set(skillName, {
                    name: skillName,
                    description:
                      (frontmatter.description as string) ??
                      extractFirstLine(raw),
                    filePath: skillMdPath,
                    agents: [agent.name],
                    metadata: frontmatter as Record<string, unknown>,
                    lock: lock.skills[skillName],
                  })
                }
              } catch {
                // SKILL.md not found or unreadable in this directory - skip
              }
            }
          } catch {
            // Agent skills directory doesn't exist - skip
          }
        }

        if (cancelled) return

        const skills = Array.from(skillMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )

        dispatch({ type: "SET_INSTALLED_SKILLS", skills })

        // Update agent skill counts (without removing agents that have 0 skills)
        const agentCounts = new Map<AgentType, number>()
        for (const skill of skills) {
          for (const agentName of skill.agents) {
            agentCounts.set(agentName, (agentCounts.get(agentName) ?? 0) + 1)
          }
        }

        dispatch({ type: "UPDATE_AGENT_COUNTS", counts: Object.fromEntries(agentCounts) })
      } catch {
        if (!cancelled) {
          dispatch({ type: "SET_INSTALLED_SKILLS", skills: [] })
        }
      }
    }

    scan()
    return () => { cancelled = true }
  }, [installedLoading])
}

/** Extracts the first non-empty, non-heading line from markdown content. */
function extractFirstLine(content: string): string {
  const lines = content.split("\n")
  // Skip frontmatter delimiter and heading lines
  let pastFrontmatter = false
  let frontmatterCount = 0
  for (const line of lines) {
    if (line.trim() === "---") {
      frontmatterCount++
      if (frontmatterCount >= 2) {
        pastFrontmatter = true
        continue
      }
      continue
    }
    if (!pastFrontmatter) continue
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith("#")) continue
    return trimmed.slice(0, 120)
  }
  return ""
}
