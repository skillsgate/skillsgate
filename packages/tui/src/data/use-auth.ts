import { useEffect, useCallback } from "react"
import { useStore, useDispatch } from "../store/context.js"
import { loadAuth, saveAuth, clearAuth } from "../../../cli/src/utils/auth-store.js"
import { API_BASE_URL } from "../../../cli/src/constants.js"
import type { AuthState } from "../store/types.js"
import type { StoredAuth } from "../../../cli/src/utils/auth-store.js"

interface ExchangeResponse {
  access_token: string
  user: { id: string; name: string; email: string; image?: string }
}

/**
 * Loads existing auth from keyring/file on mount and dispatches SET_AUTH.
 * Returns helpers to login (exchange code), logout, and check auth state.
 */
export function useAuth() {
  const state = useStore()
  const dispatch = useDispatch()

  // On mount, try to load existing auth from keyring/file
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const stored = await loadAuth()
        if (cancelled) return

        if (stored) {
          dispatch({
            type: "SET_AUTH",
            auth: { token: stored.token, user: stored.user },
          })
        } else {
          dispatch({ type: "SET_AUTH", auth: null })
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: "SET_AUTH", auth: null })
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  /**
   * Exchange a device code for an auth token.
   * On success, saves auth and dispatches SET_AUTH.
   * Returns null on success, or an error message string on failure.
   */
  const login = useCallback(async (code: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/device/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        const result = (await res.json()) as ExchangeResponse
        const authData: StoredAuth = {
          token: result.access_token,
          user: result.user,
        }
        await saveAuth(authData)
        dispatch({
          type: "SET_AUTH",
          auth: { token: authData.token, user: authData.user },
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
  }, [dispatch])

  /**
   * Clear stored auth and dispatch SET_AUTH(null).
   */
  const logout = useCallback(async () => {
    try {
      await clearAuth()
    } catch {
      // Best effort
    }
    dispatch({ type: "SET_AUTH", auth: null })
  }, [dispatch])

  return {
    auth: state.auth,
    login,
    logout,
  }
}
