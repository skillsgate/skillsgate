import { useCallback } from "react"
import { useStore, useDispatch } from "../store/context.js"
import type { EnrichedSkill } from "../store/types.js"

// CLI core imports -- these share the same Bun runtime
import { parseSource } from "../../../cli/src/core/source-parser.js"
import { cloneRepo, cleanupTempDir, fetchTreeSha } from "../../../cli/src/core/git.js"
import { discoverSkills } from "../../../cli/src/core/skill-discovery.js"
import {
  installSkillForAgent,
  removeSkillFromAgent,
  removeCanonicalSkill,
  sanitizeName,
} from "../../../cli/src/core/installer.js"
import {
  addSkillToLock,
  removeSkillFromLock,
  readSkillLock,
} from "../../../cli/src/core/skill-lock.js"
import { agents, detectInstalledAgents } from "../../../cli/src/core/agents.js"
import { downloadSkill } from "../../../cli/src/core/skillsgate-client.js"
import { getToken } from "../../../cli/src/utils/auth-store.js"
import type { Skill, AgentConfig, ParsedSource } from "../../../cli/src/types.js"

interface UseSkillActionsResult {
  installSkill: (skill: EnrichedSkill) => Promise<void>
  removeSkill: (skill: EnrichedSkill) => Promise<void>
  updateSkill: (skill: EnrichedSkill) => Promise<void>
}

/**
 * Provides install, remove, and update actions for skills.
 * Uses CLI core modules directly since they share the same Bun runtime.
 */
export function useSkillActions(): UseSkillActionsResult {
  const state = useStore()
  const dispatch = useDispatch()

  /**
   * Install a skill from its source (GitHub URL, SkillsGate slug, or install command).
   */
  const installSkill = useCallback(async (skill: EnrichedSkill) => {
    dispatch({
      type: "SHOW_NOTIFICATION",
      notification: { type: "info", message: `Installing "${skill.name}"...` },
    })

    try {
      // Determine the source from metadata or lock entry
      const sourceStr = resolveSource(skill)
      if (!sourceStr) {
        dispatch({
          type: "SHOW_NOTIFICATION",
          notification: { type: "error", message: `Cannot determine source for "${skill.name}"` },
        })
        return
      }

      const source = parseSource(sourceStr)

      // Detect installed agents to install to
      const installedAgents = await detectInstalledAgents()
      if (installedAgents.length === 0) {
        dispatch({
          type: "SHOW_NOTIFICATION",
          notification: { type: "error", message: "No AI agents detected on this system" },
        })
        return
      }

      let tmpDir: string
      if (source.type === "skillsgate") {
        // Download from SkillsGate API
        const token = await getToken()
        tmpDir = await downloadSkill(source.username!, source.slug!, token)
      } else if (source.type === "github") {
        // Clone from GitHub
        tmpDir = await cloneRepo(source)
      } else {
        // Local path -- use directly
        tmpDir = source.localPath!
      }

      try {
        // Discover skills in the cloned/downloaded directory
        const skills = await discoverSkills(tmpDir, source.subpath)

        if (skills.length === 0) {
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "error", message: `No skills found in "${sourceStr}"` },
          })
          return
        }

        // Filter if a specific skill was requested
        let targetSkills = skills
        if (source.skillFilter) {
          const filter = source.skillFilter.toLowerCase()
          targetSkills = skills.filter((s) => s.name.toLowerCase() === filter)
          if (targetSkills.length === 0) {
            dispatch({
              type: "SHOW_NOTIFICATION",
              notification: { type: "error", message: `Skill "${source.skillFilter}" not found in "${sourceStr}"` },
            })
            return
          }
        }

        let installedCount = 0

        for (const skillToInstall of targetSkills) {
          // Install to all detected agents
          for (const agent of installedAgents) {
            const result = await installSkillForAgent(
              skillToInstall,
              agent,
              "global",
              "symlink",
            )
            if (result.success) {
              installedCount++
            }
          }

          // Update lock file
          await addSkillToLock(sanitizeName(skillToInstall.name), {
            source: sourceStr,
            sourceType: source.type,
            originalUrl: source.url,
            skillFolderHash: "",
          })
        }

        // Trigger refresh
        dispatch({ type: "REFRESH_SKILLS" })

        const skillNames = targetSkills.map((s) => s.name).join(", ")
        dispatch({
          type: "SHOW_NOTIFICATION",
          notification: {
            type: "success",
            message: `Installed ${targetSkills.length} skill(s): ${skillNames} to ${installedAgents.length} agent(s)`,
          },
        })
      } finally {
        // Clean up temp directory (only if it was a temp clone/download)
        if (source.type !== "local") {
          await cleanupTempDir(tmpDir)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: `Install failed: ${msg}` },
      })
    }
  }, [dispatch])

  /**
   * Remove a skill from all agents and the lock file.
   */
  const removeSkill = useCallback(async (skill: EnrichedSkill) => {
    dispatch({
      type: "SHOW_NOTIFICATION",
      notification: { type: "info", message: `Removing "${skill.name}"...` },
    })

    try {
      const safeName = sanitizeName(skill.name)

      // Remove from all agent directories
      const installedAgents = await detectInstalledAgents()
      for (const agent of installedAgents) {
        await removeSkillFromAgent(safeName, agent, "global")
      }

      // Remove canonical copy
      await removeCanonicalSkill(skill.name)

      // Remove from lock file
      await removeSkillFromLock(safeName)

      // Trigger refresh
      dispatch({ type: "REFRESH_SKILLS" })

      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "success", message: `Removed "${skill.name}"` },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: `Remove failed: ${msg}` },
      })
    }
  }, [dispatch])

  /**
   * Update a skill by re-fetching from its source.
   * For GitHub skills: checks tree SHA for changes before re-installing.
   * For SkillsGate skills: always re-downloads.
   */
  const updateSkill = useCallback(async (skill: EnrichedSkill) => {
    if (!skill.lock) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: `No source information for "${skill.name}"` },
      })
      return
    }

    dispatch({
      type: "SHOW_NOTIFICATION",
      notification: { type: "info", message: `Checking for updates to "${skill.name}"...` },
    })

    try {
      const source = parseSource(skill.lock.source)

      if (source.type === "github") {
        // Check if the tree SHA has changed
        const newSha = await fetchTreeSha(source.owner, source.repo, "")
        if (newSha && newSha === skill.lock.skillFolderHash) {
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "info", message: `"${skill.name}" is already up to date` },
          })
          return
        }
      }

      // Re-install (reuses the install flow)
      await installSkill(skill)

      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "success", message: `Updated "${skill.name}"` },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "error", message: `Update failed: ${msg}` },
      })
    }
  }, [dispatch, installSkill])

  return { installSkill, removeSkill, updateSkill }
}

// ---------- Helpers ----------

/**
 * Resolves the source string for a skill from its metadata.
 * Checks: lock.source, metadata.githubUrl, metadata.installCommand
 */
function resolveSource(skill: EnrichedSkill): string | null {
  // From lock file entry
  if (skill.lock?.source) {
    return skill.lock.source
  }

  // From metadata (catalog skills)
  const meta = skill.metadata
  if (meta?.githubUrl && typeof meta.githubUrl === "string") {
    return meta.githubUrl
  }

  // From install command (e.g. "skillsgate add @user/slug")
  if (meta?.installCommand && typeof meta.installCommand === "string") {
    const cmd = meta.installCommand as string
    // Extract the source from "skillsgate add <source>" or "skillsgate install <source>"
    const match = cmd.match(/skillsgate\s+(?:add|install)\s+(.+)/)
    if (match) {
      return match[1].trim()
    }
  }

  return null
}
