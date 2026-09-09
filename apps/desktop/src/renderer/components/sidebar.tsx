import { t } from "../lib/i18n"
import { NavLink, useLocation } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@skillsgate/ui"
import { electronAPI } from "../lib/electron-api"

interface NavItem {
  to: string
  /** English source string, translated at render time — see `lib/i18n`. */
  label: string
  icon: React.ReactNode
  badge?: number
}

const navItems: NavItem[] = [
  {
    to: "/",
    label: "Installed",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/discover",
    label: "Discover",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: "/servers",
    label: "Servers",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    to: "/scan-sources",
    label: "Scan Sources",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h18" />
        <path d="M6 12h12" />
        <path d="M10 17h4" />
      </svg>
    ),
  },
]

// Compact icon-only nav button for Home view
function CompactNavButton({ to, label, icon, badge }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={t(label)}
      className={({ isActive }) =>
        `relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          isActive
            ? "bg-surface-hover text-foreground"
            : "text-muted hover:text-foreground hover:bg-surface-hover"
        }`
      }
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-foreground text-background text-[8px] font-bold px-0.5">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

// Full nav button with label for non-Home views
function FullNavButton({ to, label, icon, badge }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide font-medium transition-colors ${
          isActive
            ? "bg-surface-hover text-foreground"
            : "text-muted hover:text-foreground hover:bg-surface-hover"
        }`
      }
    >
      {icon}
      <span className="flex-1">{t(label)}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] font-mono text-muted">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const [serverCount, setServerCount] = useState(0)
  const [appVersion, setAppVersion] = useState("")

  useEffect(() => {
    electronAPI.serversCount().then(setServerCount).catch(() => {})
    electronAPI.appGetVersion().then(setAppVersion).catch(() => {})
  }, [])

  // Enrich nav items with badge data
  const enrichedNavItems = useMemo(
    () =>
      navItems.map((item) =>
        item.to === "/servers" ? { ...item, badge: serverCount } : item,
      ),
    [serverCount],
  )

  // On Home view: show compact icon-only sidebar (the Home page has its own
  // left panel with filters). On other views: show full sidebar with labels.
  if (isHome) {
    return (
      <aside className="w-14 flex-shrink-0 flex flex-col items-center bg-surface border-r border-border">
        {/* App icon (SkillsGate logo) */}
        <div className="py-4">
          <svg width="24" height="24" viewBox="0 0 64 64" className="text-foreground">
            <g transform="translate(8, 8)">
              <path d="M16 2 L4 2 C2 2 1 4 1 6 L1 42 C1 44 2 46 4 46 L16 46" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 2 L44 2 C46 2 47 4 47 6 L47 42 C47 44 46 46 44 46 L32 46" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="14" r="3.5" fill="currentColor"/>
              <circle cx="24" cy="24" r="3.5" fill="currentColor"/>
              <circle cx="24" cy="34" r="3.5" fill="currentColor"/>
            </g>
          </svg>
        </div>

        {/* Compact navigation */}
        <nav className="flex flex-col items-center gap-1 px-1.5">
          {enrichedNavItems.map((item) => (
            <CompactNavButton key={item.to} {...item} />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto pb-3 flex flex-col items-center gap-1 px-1.5">
          <NavLink
            to="/settings"
            title={t("Settings")}
            className={({ isActive }) =>
              `flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                isActive
                  ? "bg-surface-hover text-foreground"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </NavLink>
          <div className="py-1">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    )
  }

  // Full sidebar for non-Home views
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-surface border-r border-border">
      {/* App header with SkillsGate logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 64 64" className="text-foreground flex-shrink-0">
            <g transform="translate(8, 8)">
              <path d="M16 2 L4 2 C2 2 1 4 1 6 L1 42 C1 44 2 46 4 46 L16 46" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32 2 L44 2 C46 2 47 4 47 6 L47 42 C47 44 46 46 44 46 L32 46" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="14" r="3.5" fill="currentColor"/>
              <circle cx="24" cy="24" r="3.5" fill="currentColor"/>
              <circle cx="24" cy="34" r="3.5" fill="currentColor"/>
            </g>
          </svg>
          <span className="text-[17px] font-semibold tracking-tight text-foreground">
            SkillsGate
          </span>
        </div>
        <span className="text-xs text-muted mt-1 block">
          Desktop v{appVersion || "..."}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {enrichedNavItems.map((item) => (
          <FullNavButton key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom section: Settings + Theme */}
      <div className="px-3 py-3 border-t border-border flex flex-col gap-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide font-medium transition-colors ${
              isActive
                ? "bg-surface-hover text-foreground"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`
          }
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {t("Settings")}
        </NavLink>
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted">{t("Theme")}</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
