import { useEffect } from "react"
import { useDispatch } from "../store/context.js"
import { agents, detectInstalledAgents } from "../../../cli/src/core/agents.js"
import type { DetectedAgent } from "../store/types.js"
import type { AgentConfig } from "../../../cli/src/types.js"

/**
 * Detects which AI agents are installed on the system and populates the store.
 * Runs once on mount.
 */
export function useDetectedAgents() {
  const dispatch = useDispatch()

  useEffect(() => {
    let cancelled = false

    async function detect() {
      try {
        const installed: AgentConfig[] = await detectInstalledAgents()

        if (cancelled) return

        const detected: DetectedAgent[] = installed.map((agent) => ({
          name: agent.name,
          displayName: agent.displayName,
          skillCount: 0, // will be updated after skill scan
        }))

        dispatch({ type: "SET_DETECTED_AGENTS", agents: detected })
      } catch (err) {
        // Silently handle detection errors - agents will show as empty
        if (!cancelled) {
          dispatch({ type: "SET_DETECTED_AGENTS", agents: [] })
        }
      }
    }

    detect()
    return () => { cancelled = true }
  }, [])
}
