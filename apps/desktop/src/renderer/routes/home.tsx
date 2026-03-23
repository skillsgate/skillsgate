import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { electronAPI } from "../lib/electron-api"

// Agent short code mapping for display badges
const AGENT_SHORT_CODES: Record<string, string> = {
  "Claude Code": "CC",
  Cursor: "CU",
  "GitHub Copilot": "GC",
  Windsurf: "WS",
  Cline: "CL",
  Continue: "CN",
  "Codex CLI": "CX",
  Amp: "AM",
  Goose: "GO",
  Junie: "JU",
  "Kilo Code": "KC",
  OpenCode: "OC",
  OpenClaw: "OW",
  "Pear AI": "PA",
  "Roo Code": "RC",
  Trae: "TR",
  Zed: "ZD",
  "Universal (.agents/skills)": "UA",
}

function getShortCode(displayName: string, shortCode?: string): string {
  if (shortCode) return shortCode
  return AGENT_SHORT_CODES[displayName] || displayName.slice(0, 2).toUpperCase()
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

function AgentBadge({ name, shortCode }: { name: string; shortCode?: string }) {
  const code = getShortCode(name, shortCode)
  return (
    <span
      title={name}
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-hover text-muted"
    >
      {code}
    </span>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function ToolIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

export function Home() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<DetectedAgent[]>([])
  const [skills, setSkills] = useState<InstalledSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

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

  // Only show agents that actually have skills in the sidebar filter
  const agentsWithSkills = useMemo(() => {
    return agents.filter((a) => (agentSkillCounts[a.displayName] || 0) > 0)
  }, [agents, agentSkillCounts])

  return (
    <div className="flex h-full">
      {/* Left sidebar: Agent filter */}
      <aside className="w-56 flex-shrink-0 border-r border-border bg-surface p-4">
        <h3 className="text-[11px] uppercase tracking-widest font-semibold text-muted mb-3">
          Filter by Agent
        </h3>
        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] tracking-wide font-medium transition-colors text-left ${
              selectedAgent === null
                ? "bg-surface-hover text-foreground"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            <span>All</span>
            <span
              className={`text-[11px] font-mono ${
                selectedAgent === null ? "text-foreground" : "text-muted"
              }`}
            >
              {skills.length}
            </span>
          </button>
          {agentsWithSkills.map((agent) => (
            <button
              key={agent.name}
              onClick={() =>
                setSelectedAgent(
                  selectedAgent === agent.displayName
                    ? null
                    : agent.displayName,
                )
              }
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] tracking-wide font-medium transition-colors text-left ${
                selectedAgent === agent.displayName
                  ? "bg-surface-hover text-foreground"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <span className="truncate">{agent.displayName}</span>
              <span
                className={`text-[11px] font-mono ml-2 ${
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
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Installed Skills
          </h2>
          <p className="text-sm text-muted">
            Skills installed on your device across all detected agents.
          </p>
        </div>

        {/* Search bar */}
        <div className="px-8 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-foreground transition-colors"
              >
                <svg
                  width="14"
                  height="14"
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

        {/* Skills list */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-sm text-muted animate-fade-in">
                Scanning for installed skills...
              </div>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {skills.length === 0 ? (
                <>
                  <ToolIcon />
                  <p className="text-muted text-sm mt-4">
                    No skills installed yet.
                  </p>
                  <p className="text-muted text-xs mt-1">
                    Head to Discover to find and install skills.
                  </p>
                </>
              ) : (
                <>
                  <SearchIcon />
                  <p className="text-muted text-sm mt-4">
                    No skills match your search.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedAgent(null)
                    }}
                    className="text-accent text-xs mt-2 hover:text-foreground transition-colors"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Results count */}
              <div className="text-[11px] uppercase tracking-widest text-muted mb-1">
                {filteredSkills.length} skill
                {filteredSkills.length !== 1 ? "s" : ""}
                {selectedAgent ? ` in ${selectedAgent}` : ""}
              </div>

              {filteredSkills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() =>
                    navigate(
                      `/skill/${encodeURIComponent(skill.name)}`,
                    )
                  }
                  className="flex items-start justify-between p-4 rounded-lg bg-card-bg border border-card-border hover:border-accent transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {skill.name}
                      </h3>
                      <SourceBadge sourceType={skill.sourceType} />
                    </div>
                    {skill.description && (
                      <p className="text-xs text-muted mt-1 truncate max-w-[500px]">
                        {skill.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      {skill.agents.map((agentName, i) => (
                        <AgentBadge
                          key={agentName}
                          name={agentName}
                          shortCode={skill.agentShortCodes?.[i]}
                        />
                      ))}
                    </div>
                  </div>
                  {skill.source && (
                    <span className="text-[11px] text-muted ml-4 flex-shrink-0 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {skill.source}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
