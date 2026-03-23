import { HashRouter, Routes, Route } from "react-router-dom"
import { Sidebar } from "./components/sidebar"
import { Home } from "./routes/home"
import { Discover } from "./routes/discover"
import { Favorites } from "./routes/favorites"
import { Dashboard } from "./routes/dashboard"
import { Settings } from "./routes/settings"
import { SkillDetail } from "./routes/skill-detail"

export function App() {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/skill/:name" element={<SkillDetail />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
