import { NavLink, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@skillsgate/ui"
import { useAuthStore } from "../lib/auth-store"
import { electronAPI } from "../lib/electron-api"

interface NavItem {
  to: string
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
    to: "/favorites",
    label: "Favorites",
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
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
    to: "/dashboard",
    label: "Dashboard",
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
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
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
      title={label}
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
      <span className="flex-1">{label}</span>
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
  const { user, loading: authLoading, signIn } = useAuthStore()
  const [serverCount, setServerCount] = useState(0)

  useEffect(() => {
    electronAPI.serversCount().then(setServerCount).catch(() => {})
  }, [location.pathname])

  // Enrich nav items with badge data
  const enrichedNavItems = navItems.map((item) =>
    item.to === "/servers" ? { ...item, badge: serverCount } : item,
  )

  // On Home view: show compact icon-only sidebar (the Home page has its own
  // left panel with filters). On other views: show full sidebar with labels.
  if (isHome) {
    return (
      <aside className="w-14 flex-shrink-0 flex flex-col items-center bg-surface border-r border-border">
        {/* App icon */}
        <div className="py-4">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
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
          {/* User avatar or sign-in */}
          {!authLoading && (
            user ? (
              <button
                title={user.name}
                className="flex items-center justify-center w-9 h-9 rounded-lg"
              >
                {user.image ? (
                  <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[9px] font-medium text-muted">
                    {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={signIn}
                title="Sign in"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )
          )}
          <NavLink
            to="/settings"
            title="Settings"
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
      {/* App header */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="text-base font-semibold text-foreground">
            SkillsGate
          </span>
        </div>
        <span className="text-xs text-muted mt-1 block">
          Desktop v0.1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {enrichedNavItems.map((item) => (
          <FullNavButton key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom section: Auth + Settings + Theme */}
      <div className="px-3 py-3 border-t border-border flex flex-col gap-1">
        {/* Auth row */}
        {!authLoading && (
          user ? (
            <div className="flex items-center gap-2.5 px-3 py-2">
              {user.image ? (
                <img src={user.image} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[9px] font-medium text-muted flex-shrink-0">
                  {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
              )}
              <span className="text-[12px] text-foreground font-medium truncate">
                {user.name}
              </span>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide font-medium transition-colors text-muted hover:text-foreground hover:bg-surface-hover"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Sign in
            </button>
          )
        )}
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
          Settings
        </NavLink>
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
