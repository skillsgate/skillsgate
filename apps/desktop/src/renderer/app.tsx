import { t, useLocale } from "./lib/i18n"
import { Suspense, lazy } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { Sidebar } from "./components/sidebar"
import { UpdateBanner } from "./components/update-banner"
import { Home } from "./routes/home"

const Discover = lazy(() =>
  import("./routes/discover").then((module) => ({ default: module.Discover })),
)
const Servers = lazy(() =>
  import("./routes/servers").then((module) => ({ default: module.Servers })),
)
const ServerSkills = lazy(() =>
  import("./routes/server-skills").then((module) => ({
    default: module.ServerSkills,
  })),
)
const Settings = lazy(() =>
  import("./routes/settings").then((module) => ({ default: module.Settings })),
)
const ScanSources = lazy(() =>
  import("./routes/scan-sources").then((module) => ({
    default: module.ScanSources,
  })),
)

function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center text-[12px] text-muted">
      {t("Loading view...")}
    </div>
  )
}

export function App() {
  const locale = useLocale()

  return (
    <HashRouter>
      {/* Keyed on the locale: t() is a plain function, so re-keying the tree is
          what makes a language switch reach memoised components immediately,
          without reloading the window. */}
      <div
        key={locale}
        className="flex h-screen overflow-hidden bg-background text-foreground font-sans"
      >
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <UpdateBanner />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<div className="flex-1 overflow-y-auto"><Discover /></div>} />
              <Route path="/servers" element={<div className="flex-1 overflow-y-auto"><Servers /></div>} />
              <Route path="/servers/:id/skills" element={<ServerSkills />} />
              <Route path="/scan-sources" element={<ScanSources />} />
              <Route path="/settings" element={<div className="flex-1 overflow-y-auto"><Settings /></div>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </HashRouter>
  )
}
