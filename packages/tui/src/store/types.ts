import type { AgentType, SkillLockEntry, SourceType } from "../../../cli/src/types.js"

// ---------- View Names ----------

export type ViewName = "home" | "discover" | "favorites" | "detail" | "login"

// ---------- Enriched Skill ----------

export interface EnrichedSkill {
  name: string
  description: string
  filePath: string
  /** Which agents have this skill installed (by agent name) */
  agents: AgentType[]
  /** Frontmatter metadata from the SKILL.md */
  metadata: Record<string, unknown>
  /** Lock file entry if tracked */
  lock?: SkillLockEntry
}

// ---------- Detected Agent ----------

export interface DetectedAgent {
  name: AgentType
  displayName: string
  skillCount: number
}

// ---------- Auth ----------

export interface AuthState {
  token: string
  user: { id: string; name: string; email: string }
}

// ---------- Notification ----------

export interface Notification {
  type: "success" | "error" | "info"
  message: string
}

// ---------- Focus Pane ----------

export type FocusedPane = "agents" | "search" | "list"

// ---------- App State ----------

export interface AppState {
  activeView: ViewName
  previousView: ViewName | null

  // Auth
  auth: AuthState | null

  // Agent detection
  detectedAgents: DetectedAgent[]

  // Installed skills (home view)
  selectedAgentFilter: string // agent name or "all"
  installedSkills: EnrichedSkill[]
  installedLoading: boolean
  installedFilter: string

  // Search / discover
  searchQuery: string
  searchResults: unknown[]
  searchLoading: boolean

  // Favorites
  favorites: unknown[]
  favoritesLoading: boolean

  // Detail
  selectedSkill: EnrichedSkill | null

  // UI state
  showHelp: boolean
  focusedPane: FocusedPane

  // Notification toast
  notification: Notification | null
}

// ---------- Actions ----------

export type Action =
  | { type: "NAVIGATE"; view: ViewName }
  | { type: "GO_BACK" }
  | { type: "SET_AUTH"; auth: AuthState | null }
  | { type: "SET_DETECTED_AGENTS"; agents: DetectedAgent[] }
  | { type: "SET_AGENT_FILTER"; filter: string }
  | { type: "SET_INSTALLED_SKILLS"; skills: EnrichedSkill[] }
  | { type: "SET_INSTALLED_LOADING"; loading: boolean }
  | { type: "SET_INSTALLED_FILTER"; filter: string }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_SEARCH_RESULTS"; results: unknown[] }
  | { type: "SET_SEARCH_LOADING"; loading: boolean }
  | { type: "SET_FAVORITES"; favorites: unknown[] }
  | { type: "SET_FAVORITES_LOADING"; loading: boolean }
  | { type: "SELECT_SKILL"; skill: EnrichedSkill }
  | { type: "CLEAR_SKILL" }
  | { type: "SHOW_NOTIFICATION"; notification: Notification }
  | { type: "CLEAR_NOTIFICATION" }
  | { type: "TOGGLE_HELP" }
  | { type: "SET_FOCUSED_PANE"; pane: FocusedPane }
  | { type: "CYCLE_FOCUS" }
  | { type: "REFRESH_SKILLS" }
