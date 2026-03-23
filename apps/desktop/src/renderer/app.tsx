import { HashRouter, Routes, Route } from "react-router-dom"
import { Sidebar } from "./components/sidebar"
import { Home } from "./routes/home"
import { Discover } from "./routes/discover"
import { Favorites } from "./routes/favorites"
import { Dashboard } from "./routes/dashboard"
import { Settings } from "./routes/settings"

export function App() {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/discover"
              element={
                <div className="flex-1 overflow-y-auto">
                  <Discover />
                </div>
              }
            />
            <Route
              path="/favorites"
              element={
                <div className="flex-1 overflow-y-auto">
                  <Favorites />
                </div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <div className="flex-1 overflow-y-auto">
                  <Dashboard />
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="flex-1 overflow-y-auto">
                  <Settings />
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
