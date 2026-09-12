/**
 * The user's curated tool set ("My Tools"), shared by every route that shows or
 * installs to agents: the Home tools panel, the Discover install dropdown, and
 * the Settings pickers.
 *
 * Design notes (read before reaching for a store):
 *  1. **One `useEffect` load per mounted route, no global state.** The three
 *     consumers are separate routes that are rarely mounted at once, and the
 *     main process is the single source of truth. A shared store would buy
 *     cross-route live updates that nothing currently needs, at the cost of
 *     cache invalidation.
 *  2. **Writes are optimistic, then adopt the server's answer.** The main
 *     process normalises the list (drops unknown keys, re-sorts into registry
 *     order), so the value that lands in state is the stored one, not the one
 *     that was sent.
 *  3. **`resetToDetected` is an IPC call, not a local filter.** Reproducing the
 *     rule here would store `[]` on a machine where Universal is the only
 *     detected tool, and `[]` reads as "configured", so the derivation
 *     fallbacks would never run again.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { electronAPI } from "./electron-api"

export interface UseActiveAgents {
  /** Every registry agent, with its `detected` flag. */
  registry: AgentInfo[]
  /** Active registry keys, in registry order. */
  activeNames: string[]
  /** `registry` narrowed to `activeNames`. */
  activeAgents: AgentInfo[]
  setActive: (names: string[]) => Promise<void>
  resetToDetected: () => Promise<void>
  loading: boolean
}

/**
 * Narrows a stored list of registry keys to the active set. Used for
 * `install.defaultAgents`, whose entries for hidden tools are ignored rather
 * than deleted, so re-enabling a tool restores its default.
 */
export function intersectActive(
  names: string[] | null | undefined,
  activeNames: string[],
): string[] {
  return (names ?? []).filter((name) => activeNames.includes(name))
}

export function useActiveAgents(): UseActiveAgents {
  const [registry, setRegistry] = useState<AgentInfo[]>([])
  const [activeNames, setActiveNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    electronAPI
      .agentsList()
      .then(({ registry: list, active }) => {
        if (cancelled) return
        setRegistry(list)
        setActiveNames(active)
      })
      .catch((err) => {
        console.error("Failed to load tools:", err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeAgents = useMemo(
    () => registry.filter((agent) => activeNames.includes(agent.name)),
    [registry, activeNames],
  )

  const setActive = useCallback(async (names: string[]) => {
    setActiveNames(names)
    try {
      setActiveNames(await electronAPI.agentsSetActive(names))
    } catch (err) {
      console.error("Failed to save active tools:", err)
    }
  }, [])

  const resetToDetected = useCallback(async () => {
    try {
      setActiveNames(await electronAPI.agentsResetActive())
    } catch (err) {
      console.error("Failed to reset active tools:", err)
    }
  }, [])

  return { registry, activeNames, activeAgents, setActive, resetToDetected, loading }
}
