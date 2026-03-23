import { useState } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { AuthStoreProvider, useAuthStore } from "./lib/auth-store"
import { Sidebar } from "./components/sidebar"
import { Home } from "./routes/home"
import { Discover } from "./routes/discover"
import { Favorites } from "./routes/favorites"
import { Servers } from "./routes/servers"
import { ServerSkills } from "./routes/server-skills"
import { Dashboard } from "./routes/dashboard"
import { Settings } from "./routes/settings"

function CodeInputDialog() {
  const { awaitingCode, codeError, exchangeCode, cancelSignIn } = useAuthStore()
  const [code, setCode] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!awaitingCode) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setSubmitting(true)
    await exchangeCode(code.trim())
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Enter your login code
        </h3>
        <p className="text-[12px] text-muted mb-4">
          Paste the code from your browser below.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="XXXX-XXXX"
            autoFocus
            className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-[14px] font-mono text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 tracking-widest text-center mb-3"
          />

          {codeError && (
            <p className="text-[11px] text-red-400 mb-3">{codeError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelSignIn}
              className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium text-muted bg-surface-hover hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim() || submitting}
              className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {submitting ? "Verifying..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AppShell() {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<div className="flex-1 overflow-y-auto"><Discover /></div>} />
            <Route path="/favorites" element={<div className="flex-1 overflow-y-auto"><Favorites /></div>} />
            <Route path="/servers" element={<div className="flex-1 overflow-y-auto"><Servers /></div>} />
            <Route path="/servers/:id/skills" element={<ServerSkills />} />
            <Route path="/dashboard" element={<div className="flex-1 overflow-y-auto"><Dashboard /></div>} />
            <Route path="/settings" element={<div className="flex-1 overflow-y-auto"><Settings /></div>} />
          </Routes>
        </main>

        {/* Global code input dialog for device auth flow */}
        <CodeInputDialog />
      </div>
    </HashRouter>
  )
}

export function App() {
  return (
    <AuthStoreProvider>
      <AppShell />
    </AuthStoreProvider>
  )
}
