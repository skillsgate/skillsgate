import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createElement, type ReactNode } from "react"
import { electronAPI } from "./electron-api"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthUser {
  id: string
  name: string
  email: string
  image?: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  awaitingCode: boolean
  codeError: string | null
  signIn: () => void
  exchangeCode: (code: string) => Promise<void>
  cancelSignIn: () => void
  signOut: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  awaitingCode: false,
  codeError: null,
  signIn: () => {},
  exchangeCode: async () => {},
  cancelSignIn: () => {},
  signOut: async () => {},
})

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [awaitingCode, setAwaitingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)

  // Load stored auth on mount
  useEffect(() => {
    electronAPI.authLoad().then((stored) => {
      if (stored) {
        setUser(stored.user)
        setToken(stored.token)
      }
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(() => {
    // Open the device auth page in the default browser
    electronAPI.authOpenBrowser("https://skillsgate.ai/cli/auth")
    // Show the code input dialog
    setAwaitingCode(true)
    setCodeError(null)
  }, [])

  const exchangeCode = useCallback(async (code: string) => {
    setCodeError(null)
    try {
      const stored = await electronAPI.authExchange(code)
      setUser(stored.user)
      setToken(stored.token)
      setAwaitingCode(false)
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Invalid code. Please try again.")
    }
  }, [])

  const cancelSignIn = useCallback(() => {
    setAwaitingCode(false)
    setCodeError(null)
  }, [])

  const signOut = useCallback(async () => {
    await electronAPI.authLogout()
    setUser(null)
    setToken(null)
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { user, token, loading, awaitingCode, codeError, signIn, exchangeCode, cancelSignIn, signOut } },
    children,
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuthStore(): AuthState {
  return useContext(AuthContext)
}
