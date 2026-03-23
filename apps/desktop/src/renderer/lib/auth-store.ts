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
  signIn: () => void
  exchangeCode: (code: string) => Promise<void>
  signOut: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  signIn: () => {},
  exchangeCode: async () => {},
  signOut: async () => {},
})

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  const exchangeCode = useCallback(async (code: string) => {
    const stored = await electronAPI.authExchange(code)
    setUser(stored.user)
    setToken(stored.token)
  }, [])

  const signOut = useCallback(async () => {
    await electronAPI.authLogout()
    setUser(null)
    setToken(null)
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { user, token, loading, signIn, exchangeCode, signOut } },
    children,
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuthStore(): AuthState {
  return useContext(AuthContext)
}
