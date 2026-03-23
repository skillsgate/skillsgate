import { useEffect, useCallback } from "react"
import { useStore, useDispatch } from "../store/context.js"
import { useDb } from "../db/context.js"

const API_BASE_URL = process.env.SKILLSGATE_API_URL ?? "https://skillsgate.ai"

// SQLite settings keys for auth
const AUTH_TOKEN_KEY = "auth.token"
const AUTH_USER_KEY = "auth.user"

interface AuthUser {
  id: string
  name: string
  email: string
  image?: string
}

interface ExchangeResponse {
  access_token: string
  user: AuthUser
}

/**
 * Auth hook using the shared SQLite database.
 * Both TUI and Electron read/write auth to the same DB at ~/.skillsgate/skillsgate.db
 * No keyring dependency -- works in both Bun and Node.
 */
export function useAuth() {
  const state = useStore()
  const dispatch = useDispatch()
  const { settings } = useDb()

  // On mount, load auth from SQLite
  useEffect(() => {
    let cancelled = false

    try {
      const token = settings.get<string | null>(AUTH_TOKEN_KEY, null)
      const user = settings.get<AuthUser | null>(AUTH_USER_KEY, null)

      if (token && user) {
        dispatch({
          type: "SET_AUTH",
          auth: { token, user },
        })
      } else {
        // Try legacy file-based auth as fallback
        loadLegacyAuth().then((legacy) => {
          if (cancelled) return
          if (legacy) {
            settings.set(AUTH_TOKEN_KEY, legacy.token)
            settings.set(AUTH_USER_KEY, legacy.user)
            dispatch({
              type: "SET_AUTH",
              auth: { token: legacy.token, user: legacy.user },
            })
          } else {
            dispatch({ type: "SET_AUTH", auth: null })
          }
        }).catch(() => {
          if (!cancelled) dispatch({ type: "SET_AUTH", auth: null })
        })
      }
    } catch {
      dispatch({ type: "SET_AUTH", auth: null })
    }

    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (code: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/device/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        const result = (await res.json()) as ExchangeResponse

        // Save to SQLite (shared with Electron)
        settings.set(AUTH_TOKEN_KEY, result.access_token)
        settings.set(AUTH_USER_KEY, result.user)

        dispatch({
          type: "SET_AUTH",
          auth: { token: result.access_token, user: result.user },
        })
        return null
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (data?.error === "rate_limited") {
        return "Too many attempts. Please wait a minute and try again."
      } else if (data?.error === "invalid_code") {
        return "Invalid code. Please check and try again."
      } else if (data?.error === "expired") {
        return "Code has expired. Get a new one from the browser."
      }
      return "Something went wrong. Please try again."
    } catch {
      return "Network error. Please check your connection and try again."
    }
  }, [dispatch, settings])

  const logout = useCallback(async () => {
    settings.set(AUTH_TOKEN_KEY, null)
    settings.set(AUTH_USER_KEY, null)
    dispatch({ type: "SET_AUTH", auth: null })
  }, [dispatch, settings])

  return {
    auth: state.auth,
    login,
    logout,
  }
}

/**
 * Try to load auth from the legacy CLI file (~/.skillsgate/auth.json + keyring).
 * Used as a one-time migration to SQLite.
 */
async function loadLegacyAuth(): Promise<{ token: string; user: AuthUser } | null> {
  try {
    const { loadAuth } = await import("../../../cli/src/utils/auth-store.js")
    const stored = await loadAuth()
    if (stored?.token && stored?.user) {
      return { token: stored.token, user: stored.user }
    }
  } catch {
    // CLI auth-store not available or keyring failed
  }
  return null
}
