import { useEffect, useState, useMemo, useCallback } from "react"
import { marked } from "marked"
import { electronAPI } from "../lib/electron-api"

// Agent color mapping for dot badges
const AGENT_COLORS: Record<string, string> = {
  "claude-code": "#D97706",
  cursor: "#2563EB",
  "github-copilot": "#6366F1",
  windsurf: "#0891B2",
  cline: "#7C3AED",
  continue: "#059669",
  "codex-cli": "#DC2626",
  amp: "#EA580C",
  goose: "#4F46E5",
  junie: "#B45309",
  "kilo-code": "#0369A1",
  opencode: "#0D9488",
  openclaw: "#6D28D9",
  "pear-ai": "#65A30D",
  "roo-code": "#C026D3",
  trae: "#0284C7",
  zed: "#CA8A04",
  universal: "#78716C",
}

// Map display names to registry keys for color lookup
const DISPLAY_NAME_TO_KEY: Record<string, string> = {
  "Claude Code": "claude-code",
  Cursor: "cursor",
  "GitHub Copilot": "github-copilot",
  Windsurf: "windsurf",
  Cline: "cline",
  Continue: "continue",
  "Codex CLI": "codex-cli",
  Amp: "amp",
  Goose: "goose",
  Junie: "junie",
  "Kilo Code": "kilo-code",
  OpenCode: "opencode",
  OpenClaw: "openclaw",
  "Pear AI": "pear-ai",
  "Roo Code": "roo-code",
  Trae: "trae",
  Zed: "zed",
  "Universal (.agents/skills)": "universal",
}

function getAgentColor(displayName: string): string {
  const key = DISPLAY_NAME_TO_KEY[displayName] || displayName.toLowerCase().replace(/\s+/g, "-")
  return AGENT_COLORS[key] || "#78716C"
}

function AgentDots({ agents }: { agents: string[] }) {
  return (
    <span className="flex items-center gap-1">
      {agents.map((agent) => (
        <span
          key={agent}
          title={agent}
          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: getAgentColor(agent) }}
        />
      ))}
    </span>
  )
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function SkillsGateIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" className="text-muted">
      <g transform="translate(8, 8)">
        <path d="M16 2 L4 2 C2 2 1 4 1 6 L1 42 C1 44 2 46 4 46 L16 46" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 2 L44 2 C46 2 47 4 47 6 L47 42 C47 44 46 46 44 46 L32 46" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="14" r="3.5" fill="currentColor"/>
        <circle cx="24" cy="24" r="3.5" fill="currentColor"/>
        <circle cx="24" cy="34" r="3.5" fill="currentColor"/>
      </g>
    </svg>
  )
}

function SourceBadge({ sourceType }: { sourceType?: string }) {
  if (!sourceType) return null
  const label =
    sourceType === "github"
      ? "github"
      : sourceType === "skillsgate"
        ? "skillsgate"
        : "local"
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-muted border border-border">
      {label}
    </span>
  )
}

// Configure marked for synchronous rendering
marked.setOptions({
  async: false,
  breaks: true,
  gfm: true,
})

function renderMarkdown(raw: string): string {
  // Strip frontmatter before rendering
  let content = raw
  if (content.startsWith("---")) {
    const endIdx = content.indexOf("---", 3)
    if (endIdx !== -1) {
      content = content.slice(endIdx + 3).trim()
    }
  }
  return marked.parse(content) as string
}

// --------------------------------------------------------------------------
// Left Sidebar Panel
// --------------------------------------------------------------------------

interface LeftSidebarProps {
  totalSkillCount: number
  agentsWithSkills: DetectedAgent[]
  agentSkillCounts: Record<string, number>
  selectedAgent: string | null
  onSelectAgent: (agent: string | null) => void
  activeFilter: "all" | "favorites"
  onFilterChange: (filter: "all" | "favorites") => void
}

function LeftSidebar({
  totalSkillCount,
  agentsWithSkills,
  agentSkillCounts,
  selectedAgent,
  onSelectAgent,
  activeFilter,
  onFilterChange,
}: LeftSidebarProps) {
  return (
    <aside className="w-48 flex-shrink-0 flex flex-col bg-surface border-r border-border overflow-y-auto">
      {/* Library section */}
      <div className="px-3 pt-4 pb-2">
        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2 px-2">
          Library
        </h3>
        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => {
              onFilterChange("all")
              onSelectAgent(null)
            }}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[12px] tracking-wide font-medium transition-colors text-left ${
              activeFilter === "all" && selectedAgent === null
                ? "bg-surface-hover text-foreground"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span>All Skills</span>
            <span
              className={`text-[10px] font-mono ${
                activeFilter === "all" && selectedAgent === null
                  ? "text-foreground"
                  : "text-muted"
              }`}
            >
              {totalSkillCount}
            </span>
          </button>
          <button
            onClick={() => onFilterChange("favorites")}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[12px] tracking-wide font-medium transition-colors text-left ${
              activeFilter === "favorites"
                ? "bg-surface-hover text-foreground"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span>Favorites</span>
            <span
              className={`text-[10px] font-mono ${
                activeFilter === "favorites" ? "text-foreground" : "text-muted"
              }`}
            >
              0
            </span>
          </button>
        </nav>
      </div>

      {/* Tools / Agents section */}
      {agentsWithSkills.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2 px-2">
            Tools
          </h3>
          <nav className="flex flex-col gap-0.5">
            {agentsWithSkills.map((agent) => (
              <button
                key={agent.name}
                onClick={() => {
                  onFilterChange("all")
                  onSelectAgent(
                    selectedAgent === agent.displayName
                      ? null
                      : agent.displayName,
                  )
                }}
                className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[12px] tracking-wide font-medium transition-colors text-left ${
                  selectedAgent === agent.displayName
                    ? "bg-surface-hover text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span className="truncate">{agent.displayName}</span>
                <span
                  className={`text-[10px] font-mono ml-2 ${
                    selectedAgent === agent.displayName
                      ? "text-foreground"
                      : "text-muted"
                  }`}
                >
                  {agentSkillCounts[agent.displayName] || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Servers section (placeholder) */}
      <div className="px-3 pt-3 pb-4 mt-auto">
        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2 px-2">
          Servers
        </h3>
        <p className="text-[11px] text-muted px-2 italic">None configured</p>
      </div>
    </aside>
  )
}

// --------------------------------------------------------------------------
// Middle Skill List Panel
// --------------------------------------------------------------------------

interface MiddlePanelProps {
  loading: boolean
  skills: InstalledSkill[]
  filteredSkills: InstalledSkill[]
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedSkillName: string | null
  onSelectSkill: (skill: InstalledSkill) => void
  selectedAgent: string | null
  onClearFilters: () => void
}

function MiddlePanel({
  loading,
  skills,
  filteredSkills,
  searchQuery,
  onSearchChange,
  selectedSkillName,
  onSelectSkill,
  selectedAgent,
  onClearFilters,
}: MiddlePanelProps) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-background">
      {/* Search input */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-md bg-surface border border-border text-[12px] text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-muted hover:text-foreground transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted">
        {loading
          ? "Scanning..."
          : `${filteredSkills.length} skill${filteredSkills.length !== 1 ? "s" : ""}${selectedAgent ? ` in ${selectedAgent}` : ""}`}
      </div>

      {/* Scrollable skill list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[12px] text-muted animate-fade-in">
              Scanning for installed skills...
            </p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            {skills.length === 0 ? (
              <>
                <SkillsGateIcon />
                <p className="text-muted text-[12px] mt-3">
                  No skills installed yet.
                </p>
                <p className="text-muted text-[11px] mt-1">
                  Head to Discover to find skills.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted text-[12px]">
                  No skills match your search.
                </p>
                <button
                  onClick={onClearFilters}
                  className="text-accent text-[11px] mt-2 hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredSkills.map((skill) => (
              <button
                key={skill.name}
                onClick={() => onSelectSkill(skill)}
                className={`flex items-center justify-between w-full px-2.5 py-2 rounded-md text-left transition-colors ${
                  selectedSkillName === skill.name
                    ? "bg-surface-hover text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span className="text-[12px] font-medium truncate flex-1 min-w-0">
                  {skill.name}
                </span>
                <span className="ml-2 flex-shrink-0">
                  <AgentDots agents={skill.agents} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Right Detail Panel
// --------------------------------------------------------------------------

interface RightPanelProps {
  skill: InstalledSkill | null
  content: string | null
  contentLoading: boolean
}

function RightPanel({ skill, content, contentLoading }: RightPanelProps) {
  if (!skill) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <SkillsGateIcon />
          <p className="text-muted text-sm mt-3">
            Select a skill to view details
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-foreground">{skill.name}</h1>
            <SourceBadge sourceType={skill.sourceType} />
          </div>
          {skill.description && (
            <p className="text-sm text-muted mb-3">{skill.description}</p>
          )}
          <div className="flex items-center gap-1.5">
            <AgentDots agents={skill.agents} />
          </div>
          {skill.source && (
            <p className="text-[11px] text-muted font-mono mt-2">
              {skill.source}
            </p>
          )}
        </div>

        {/* Divider */}
        <hr className="border-border mb-6" />

        {/* Content */}
        {contentLoading ? (
          <p className="text-sm text-muted animate-fade-in">Loading content...</p>
        ) : content ? (
          <div
            className="skill-prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <p className="text-sm text-muted">
            Skill content not available. This skill may not have a SKILL.md file.
          </p>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Home (three-column layout)
// --------------------------------------------------------------------------

export function Home() {
  const [agents, setAgents] = useState<DetectedAgent[]>([])
  const [skills, setSkills] = useState<InstalledSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites">("all")
  const [selectedSkill, setSelectedSkill] = useState<InstalledSkill | null>(null)
  const [skillContent, setSkillContent] = useState<string | null>(null)
  const [contentLoading, setContentLoading] = useState(false)

  // Load agents and skills on mount
  useEffect(() => {
    async function load() {
      try {
        const [detectedAgents, installedSkills] = await Promise.all([
          electronAPI.detectAgents(),
          electronAPI.listInstalled(),
        ])
        setAgents(detectedAgents)
        setSkills(installedSkills)
      } catch (err) {
        console.error("Failed to load installed skills:", err)
      } finally {
        setLoading(false)
      }
    }

    load()

    const cleanup = electronAPI.onSkillsUpdated((updatedSkills) => {
      setSkills(updatedSkills)
    })

    return cleanup
  }, [])

  // Load skill content when a skill is selected
  useEffect(() => {
    if (!selectedSkill) {
      setSkillContent(null)
      return
    }

    let cancelled = false
    setContentLoading(true)

    async function loadContent() {
      try {
        const raw = await electronAPI.readSkillContent(selectedSkill!.path)
        if (!cancelled) {
          setSkillContent(raw || null)
        }
      } catch (err) {
        console.error("Failed to load skill content:", err)
        if (!cancelled) {
          setSkillContent(null)
        }
      } finally {
        if (!cancelled) {
          setContentLoading(false)
        }
      }
    }

    loadContent()

    return () => {
      cancelled = true
    }
  }, [selectedSkill])

  // Count skills per agent
  const agentSkillCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const skill of skills) {
      for (const agentName of skill.agents) {
        counts[agentName] = (counts[agentName] || 0) + 1
      }
    }
    return counts
  }, [skills])

  // Filter skills by selected agent and search query
  const filteredSkills = useMemo(() => {
    let result = skills

    if (selectedAgent) {
      result = result.filter((s) => s.agents.includes(selectedAgent))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.source && s.source.toLowerCase().includes(q)),
      )
    }

    return result
  }, [skills, selectedAgent, searchQuery])

  // Only show agents that actually have skills
  const agentsWithSkills = useMemo(() => {
    return agents.filter((a) => (agentSkillCounts[a.displayName] || 0) > 0)
  }, [agents, agentSkillCounts])

  const handleSelectSkill = useCallback((skill: InstalledSkill) => {
    setSelectedSkill(skill)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedAgent(null)
    setActiveFilter("all")
  }, [])

  return (
    <div className="flex h-full">
      {/* Column 1: Left sidebar (filter panel) */}
      <LeftSidebar
        totalSkillCount={skills.length}
        agentsWithSkills={agentsWithSkills}
        agentSkillCounts={agentSkillCounts}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Column 2: Skill list */}
      <MiddlePanel
        loading={loading}
        skills={skills}
        filteredSkills={filteredSkills}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSkillName={selectedSkill?.name ?? null}
        onSelectSkill={handleSelectSkill}
        selectedAgent={selectedAgent}
        onClearFilters={handleClearFilters}
      />

      {/* Column 3: Skill detail */}
      <RightPanel
        skill={selectedSkill}
        content={skillContent}
        contentLoading={contentLoading}
      />
    </div>
  )
}
