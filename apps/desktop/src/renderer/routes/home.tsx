import { t } from "../lib/i18n"
import {
  useDeferredValue,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react"
import { List } from "react-window"
import { marked } from "marked"
import { electronAPI } from "../lib/electron-api"
import { SkillEditor, type SkillEditorHandle } from "../components/skill-editor"
import { AgentLogo, AgentLogoRow } from "../components/agent-logo"

// Map display names to registry keys
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

function StarIcon({
  size = 14,
  filled = false,
}: {
  size?: number
  filled?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
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

function sanitizeHtml(html: string): string {
  let clean = html.replace(
    /<(script|iframe|object|embed|form|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
    ""
  )
  clean = clean.replace(/<(script|iframe|object|embed|link)\b[^>]*\/?>/gi, "")
  clean = clean.replace(
    /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ""
  )
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')
  clean = clean.replace(/src\s*=\s*["']?\s*javascript:/gi, 'src="')
  clean = clean.replace(/data\s*=\s*["']?\s*javascript:/gi, 'data="')
  return clean
}

function renderMarkdown(raw: string): string {
  // Strip frontmatter before rendering
  let content = raw
  if (content.startsWith("---")) {
    const endIdx = content.indexOf("---", 3)
    if (endIdx !== -1) {
      content = content.slice(endIdx + 3).trim()
    }
  }
  return sanitizeHtml(marked.parse(content) as string)
}

const MemoizedMarkdown = memo(function MemoizedMarkdown({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content])
  return <div className="skill-prose" dangerouslySetInnerHTML={{ __html: html }} />
})

interface DragSkillPayload {
  name: string
  canonicalPath: string
}

interface DragToast {
  type: "success" | "error"
  message: string
}

// --------------------------------------------------------------------------
// Left Sidebar Panel
// --------------------------------------------------------------------------

interface LeftSidebarProps {
  totalSkillCount: number
  favoritesCount: number
  agentsWithSkills: DetectedAgent[]
  agentSkillCounts: Record<string, number>
  selectedAgent: string | null
  onSelectAgent: (agent: string | null) => void
  activeFilter: "all" | "favorites"
  onFilterChange: (filter: "all" | "favorites") => void
  collections: Record<string, string[]>
  collectionCounts: Record<string, number>
  selectedCollection: string | null
  onSelectCollection: (collection: string | null) => void
  onCreateCollection: () => void
  onRenameCollection: (name: string) => void
  onDeleteCollection: (name: string) => void
  dragSkill: DragSkillPayload | null
  dragOverTarget: string | null
  onDragEnterTarget: (target: string | null) => void
  onDropOnAgent: (agentDisplayName: string) => void
  onDropOnCollection: (collectionName: string) => void
}

function LeftSidebar({
  totalSkillCount,
  favoritesCount,
  agentsWithSkills,
  agentSkillCounts,
  selectedAgent,
  onSelectAgent,
  activeFilter,
  onFilterChange,
  collections,
  collectionCounts,
  selectedCollection,
  onSelectCollection,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  dragSkill,
  dragOverTarget,
  onDragEnterTarget,
  onDropOnAgent,
  onDropOnCollection,
}: LeftSidebarProps) {
  return (
    <aside className="w-48 flex-shrink-0 flex flex-col bg-surface border-r border-border overflow-y-auto">
      {/* Library section */}
      <div className="px-3 pt-4 pb-2">
        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2 px-2">
          {t("Library")}
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
            <span>{t("All Skills")}</span>
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
            <span>{t("Favorites")}</span>
            <span
              className={`text-[10px] font-mono ${
                activeFilter === "favorites" ? "text-foreground" : "text-muted"
              }`}
            >
              {favoritesCount}
            </span>
          </button>
        </nav>
      </div>

      {/* Tools / Agents section */}
      {agentsWithSkills.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2 px-2">
            {t("Tools")}
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
                    : dragOverTarget === `agent:${agent.displayName}`
                      ? "bg-surface-hover/70 ring-1 ring-accent text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
                onDragOver={(e) => {
                  if (!dragSkill) return
                  e.preventDefault()
                  onDragEnterTarget(`agent:${agent.displayName}`)
                }}
                onDragLeave={() => {
                  if (dragOverTarget === `agent:${agent.displayName}`) onDragEnterTarget(null)
                }}
                onDrop={(e) => {
                  if (!dragSkill) return
                  e.preventDefault()
                  onDropOnAgent(agent.displayName)
                }}
              >
                <AgentLogo name={agent.displayName} shortCode={agent.shortCode} size={14} />
                <span className="truncate ml-1.5">{agent.displayName}</span>
                <span
                  className={`text-[10px] font-mono ml-auto ${
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

      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted">
            {t("Collections")}
          </h3>
          <button
            onClick={onCreateCollection}
            className="text-[11px] text-muted hover:text-foreground"
            title={t("Create collection")}
          >
            +
          </button>
        </div>
        <nav className="flex flex-col gap-0.5">
          {Object.keys(collections).length === 0 ? (
            <p className="text-[11px] text-muted px-2 italic">{t("None yet")}</p>
          ) : (
            Object.keys(collections)
              .sort()
              .map((name) => (
                <div key={name} className="group flex items-center gap-1">
                  <button
                    onClick={() => {
                      onFilterChange("all")
                      onSelectAgent(null)
                      onSelectCollection(selectedCollection === name ? null : name)
                    }}
                    className={`flex flex-1 items-center justify-between px-2 py-1.5 rounded-md text-[12px] tracking-wide font-medium transition-colors text-left ${
                      selectedCollection === name
                        ? "bg-surface-hover text-foreground"
                        : dragOverTarget === `collection:${name}`
                          ? "bg-surface-hover/70 ring-1 ring-accent shadow-[0_0_0_1px_rgba(255,255,255,0.06)] text-foreground scale-[1.01]"
                          : "text-muted hover:text-foreground hover:bg-surface-hover"
                    }`}
                    onDragOver={(e) => {
                      if (!dragSkill) return
                      e.preventDefault()
                      onDragEnterTarget(`collection:${name}`)
                    }}
                    onDragLeave={() => {
                      if (dragOverTarget === `collection:${name}`) onDragEnterTarget(null)
                    }}
                    onDrop={(e) => {
                      if (!dragSkill) return
                      e.preventDefault()
                      onDropOnCollection(name)
                    }}
                  >
                    <span className="truncate">{name}</span>
                    <span className="text-[10px] font-mono">{collectionCounts[name] || 0}</span>
                  </button>
                  <button
                    onClick={() => onRenameCollection(name)}
                    className="hidden group-hover:inline text-[10px] text-muted hover:text-foreground"
                    title={t("Rename collection")}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDeleteCollection(name)}
                    className="hidden group-hover:inline text-[10px] text-muted hover:text-red-400"
                    title={t("Delete collection")}
                  >
                    ×
                  </button>
                </div>
              ))
          )}
        </nav>
      </div>
      <div className="px-3 pt-3 pb-4 mt-auto">
        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-muted mb-2 px-2">
          {t("Servers")}
        </h3>
        <p className="text-[11px] text-muted px-2 italic">{t("None configured")}</p>
      </div>
    </aside>
  )
}

const MemoizedLeftSidebar = memo(LeftSidebar)

// --------------------------------------------------------------------------
// Virtualized Skill List Row
// --------------------------------------------------------------------------

interface SkillRowProps {
  index: number
  style: React.CSSProperties
  skills: InstalledSkill[]
  multiSelected: Set<string>
  isMultiSelectActive: boolean
  selectedSkillPath: string | null
  dragSkill: DragSkillPayload | null
  favorites: Set<string>
  onSelectSkill: (skill: InstalledSkill) => void
  onMultiSelectToggle: (skill: InstalledSkill, e: React.MouseEvent) => void
  onToggleFavorite: (skill: InstalledSkill, e: React.MouseEvent) => void
  onDragSkillStart: (skill: InstalledSkill) => void
  onDragSkillEnd: () => void
}

const SkillListRow = memo(function SkillListRow({
  index,
  style,
  skills,
  multiSelected,
  isMultiSelectActive,
  selectedSkillPath,
  dragSkill,
  favorites,
  onSelectSkill,
  onMultiSelectToggle,
  onToggleFavorite,
  onDragSkillStart,
  onDragSkillEnd,
}: SkillRowProps) {
  const skill = skills[index]
  if (!skill) return null
  const isMultiChecked = multiSelected.has(skill.canonicalPath)
  const isFavorited = favorites.has(skill.name)

  return (
    <div style={style} className="px-0.5">
      <button
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || isMultiSelectActive) {
            onMultiSelectToggle(skill, e)
          } else {
            onSelectSkill(skill)
          }
        }}
        draggable={!isMultiSelectActive}
        onDragStart={(e) => {
          if (isMultiSelectActive) {
            e.preventDefault()
            return
          }
          e.dataTransfer.effectAllowed = "move"
          onDragSkillStart(skill)
        }}
        onDragEnd={() => onDragSkillEnd()}
        className={`flex items-center w-full px-2.5 py-2 rounded-md text-left transition-colors ${
          isMultiChecked
            ? "bg-accent/10 text-foreground ring-1 ring-accent/30"
            : selectedSkillPath === skill.canonicalPath && !isMultiSelectActive
              ? "bg-surface-hover text-foreground"
              : dragSkill?.canonicalPath === skill.canonicalPath
                ? "opacity-60 ring-1 ring-accent/40"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
        }`}
      >
        {isMultiSelectActive && (
          <span className="flex-shrink-0 mr-2">
            <span
              className={`inline-flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                isMultiChecked
                  ? "bg-accent border-accent text-white"
                  : "border-border bg-surface"
              }`}
            >
              {isMultiChecked && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          </span>
        )}
        <span className="text-[12px] font-medium truncate flex-1 min-w-0">
          {skill.name}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorited}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          onClick={(e) => onToggleFavorite(skill, e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onToggleFavorite(skill, e as unknown as React.MouseEvent)
            }
          }}
          className={`ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded transition-colors cursor-pointer ${
            isFavorited
              ? "text-amber-400 hover:text-amber-300"
              : "text-muted hover:text-foreground"
          }`}
        >
          <StarIcon size={13} filled={isFavorited} />
        </span>
        <span className="ml-2 flex-shrink-0">
          <AgentLogoRow agents={skill.agents} size={14} />
        </span>
      </button>
    </div>
  )
})

// --------------------------------------------------------------------------
// Middle Skill List Panel
// --------------------------------------------------------------------------

interface MiddlePanelProps {
  loading: boolean
  skills: InstalledSkill[]
  filteredSkills: InstalledSkill[]
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedSkillPath: string | null
  onSelectSkill: (skill: InstalledSkill) => void
  selectedAgent: string | null
  selectedCollection: string | null
  activeFilter: "all" | "favorites"
  onClearFilters: () => void
  onCreateSkill: () => void
  dragSkill: DragSkillPayload | null
  onDragSkillStart: (skill: InstalledSkill) => void
  onDragSkillEnd: () => void
  multiSelected: Set<string>
  onMultiSelectToggle: (skill: InstalledSkill, e: React.MouseEvent) => void
  onMultiSelectAll: () => void
  onMultiSelectClear: () => void
  favorites: Set<string>
  onToggleFavorite: (skill: InstalledSkill, e: React.MouseEvent) => void
  collections: Record<string, string[]>
  onBulkAddToCollection: (collectionName: string) => void
  onBulkCreateCollection: () => void
  onBulkDelete: () => void
  listRef: React.RefObject<HTMLDivElement | null>
}

function MiddlePanel({
  loading,
  skills,
  filteredSkills,
  searchQuery,
  onSearchChange,
  selectedSkillPath,
  onSelectSkill,
  selectedAgent,
  selectedCollection,
  activeFilter,
  onClearFilters,
  onCreateSkill,
  dragSkill,
  onDragSkillStart,
  onDragSkillEnd,
  multiSelected,
  onMultiSelectToggle,
  onMultiSelectAll,
  onMultiSelectClear,
  favorites,
  onToggleFavorite,
  collections,
  onBulkAddToCollection,
  onBulkCreateCollection,
  onBulkDelete,
  listRef,
}: MiddlePanelProps) {
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMultiSelectActive = multiSelected.size > 0
  const rowProps = useMemo(
    () => ({
      skills: filteredSkills,
      multiSelected,
      isMultiSelectActive,
      selectedSkillPath,
      dragSkill,
      favorites,
      onSelectSkill,
      onMultiSelectToggle,
      onToggleFavorite,
      onDragSkillStart,
      onDragSkillEnd,
    }),
    [
      filteredSkills,
      multiSelected,
      isMultiSelectActive,
      selectedSkillPath,
      dragSkill,
      favorites,
      onSelectSkill,
      onMultiSelectToggle,
      onToggleFavorite,
      onDragSkillStart,
      onDragSkillEnd,
    ],
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showCollectionDropdown) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCollectionDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showCollectionDropdown])

  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-background relative">
      {/* Search input */}
      <div className="p-3 border-b border-border">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted">{t("Local Library")}</p>
          <button
            onClick={onCreateSkill}
            className="rounded-md border border-border px-2 py-1 text-[11px] text-foreground hover:bg-surface-hover"
          >
            {t("New Skill")}
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            placeholder={t("Search skills...")}
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

      {/* Results count and select all toggle */}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted">
          {loading
            ? "Scanning..."
            : `${filteredSkills.length} skill${filteredSkills.length !== 1 ? "s" : ""}${selectedAgent ? ` in ${selectedAgent}` : ""}${selectedCollection ? ` in ${selectedCollection}` : ""}`}
        </span>
        {!loading && filteredSkills.length > 0 && (
          <button
            onClick={isMultiSelectActive ? onMultiSelectClear : onMultiSelectAll}
            className="text-[10px] text-muted hover:text-foreground transition-colors"
          >
            {isMultiSelectActive ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Scrollable skill list */}
      <div className={`flex-1 min-h-0 flex flex-col px-2 ${isMultiSelectActive ? "pb-14" : "pb-2"}`} ref={listRef} tabIndex={-1}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[12px] text-muted animate-fade-in">
              {t("Scanning for installed skills...")}
            </p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            {skills.length === 0 ? (
              <>
                <SkillsGateIcon />
                <p className="text-muted text-[12px] mt-3">
                  {t("No skills installed yet.")}
                </p>
                <p className="text-muted text-[11px] mt-1">
                  {t("Head to Discover to find skills.")}
                </p>
              </>
            ) : activeFilter === "favorites" ? (
              <>
                <p className="text-muted text-[12px]">{t("No favorites yet.")}</p>
                <p className="text-muted text-[11px] mt-1">
                  {t("Click the star on any skill to save it here.")}
                </p>
              </>
            ) : (
              <>
                <p className="text-muted text-[12px]">
                  {t("No skills match your search.")}
                </p>
                <button
                  onClick={onClearFilters}
                  className="text-accent text-[11px] mt-2 hover:text-foreground transition-colors"
                >
                  {t("Clear filters")}
                </button>
              </>
            )}
          </div>
        ) : (
          <List
            rowCount={filteredSkills.length}
            rowHeight={36}
            rowComponent={SkillListRow}
            rowProps={rowProps}
            overscanCount={10}
          />
        )}
      </div>

      {/* Floating action bar when skills are multi-selected */}
      {isMultiSelectActive && (
        <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-3 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-foreground font-medium whitespace-nowrap">
              {multiSelected.size} selected
            </span>
            <div className="flex-1" />
            {/* Add to Collection */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                className="rounded-md border border-border px-2 py-1 text-[11px] text-foreground hover:bg-surface-hover transition-colors flex items-center gap-1"
              >
                <span>{t("Collection")}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showCollectionDropdown && (
                <div className="absolute bottom-full left-0 mb-1 w-48 rounded-lg border border-border bg-surface shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                  {Object.keys(collections).length > 0 && (
                    <>
                      {Object.keys(collections).sort().map((name) => (
                        <button
                          key={name}
                          onClick={() => {
                            onBulkAddToCollection(name)
                            setShowCollectionDropdown(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-[12px] text-foreground hover:bg-surface-hover transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                      <hr className="border-border my-1" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowCollectionDropdown(false)
                      onBulkCreateCollection()
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-accent hover:bg-surface-hover transition-colors"
                  >
                    + New Collection
                  </button>
                </div>
              )}
            </div>
            {/* Delete */}
            <button
              onClick={onBulkDelete}
              className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors"
            >
              {t("Delete")}
            </button>
            {/* Cancel */}
            <button
              onClick={onMultiSelectClear}
              className="rounded-md px-2 py-1 text-[11px] text-muted hover:text-foreground transition-colors"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const MemoizedMiddlePanel = memo(MiddlePanel)

// --------------------------------------------------------------------------
// Bulk Delete Confirmation Dialog
// --------------------------------------------------------------------------

function BulkDeleteDialog({
  count,
  selectedAgent,
  onConfirm,
  onRemoveFromAgent,
  onCancel,
}: {
  count: number
  selectedAgent: string | null
  onConfirm: () => void
  onRemoveFromAgent: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface border border-border rounded-xl shadow-lg w-full max-w-sm mx-4 p-5 animate-slide-down">
        <h2 className="text-[14px] font-semibold text-foreground mb-1">
          {selectedAgent
            ? `Remove ${count} skill${count !== 1 ? "s" : ""} from ${selectedAgent}?`
            : `Delete ${count} skill${count !== 1 ? "s" : ""}?`}
        </h2>
        <p className="text-[12px] text-muted mb-5">
          {selectedAgent
            ? `This will remove ${count === 1 ? "this skill" : `${count} selected skills`} from ${selectedAgent} only. The skill files will remain on disk.`
            : `This will remove ${count === 1 ? "this skill" : `all ${count} selected skills`} from every agent where ${count === 1 ? "it is" : "they are"} installed. This action cannot be undone.`}
        </p>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="text-muted text-[12px] px-4 py-1.5 hover:text-foreground transition-colors"
          >
            {t("Cancel")}
          </button>
          {selectedAgent ? (
            <>
              <button
                onClick={onRemoveFromAgent}
                className="bg-red-600 text-white text-[12px] px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove from {selectedAgent}
              </button>
              <button
                onClick={onConfirm}
                className="text-red-400 text-[12px] px-4 py-1.5 hover:text-red-300 transition-colors"
              >
                {t("Remove from all")}
              </button>
            </>
          ) : (
            <button
              onClick={onConfirm}
              className="bg-red-600 text-white text-[12px] px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete {count} skill{count !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// Inline SVG icons for the right panel
// --------------------------------------------------------------------------

function FolderIcon({ size = 14 }: { size?: number }) {
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
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

// --------------------------------------------------------------------------
// Remove Skill Dialog
// --------------------------------------------------------------------------

interface RemoveSkillDialogProps {
  skill: InstalledSkill
  onClose: () => void
  onRemoveFromAgents: (agentDisplayNames: string[]) => void
  onRemoveAll: () => void
}

function RemoveSkillDialog({ skill, onClose, onRemoveFromAgents, onRemoveAll }: RemoveSkillDialogProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggleAgent = (displayName: string) => {
    setChecked((prev) => ({ ...prev, [displayName]: !prev[displayName] }))
  }

  const selectedAgents = skill.agents.filter((a) => checked[a])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface border border-border rounded-xl shadow-lg w-full max-w-sm mx-4 p-5 animate-slide-down">
        <h2 className="text-[14px] font-semibold text-foreground mb-1">
          Remove "{skill.name}"
        </h2>
        <p className="text-[12px] text-muted mb-4">
          This skill is installed in {skill.agents.length} agent{skill.agents.length !== 1 ? "s" : ""}:
        </p>

        <div className="flex flex-col gap-2 mb-5">
          {skill.agents.map((agent) => (
            <label
              key={agent}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!checked[agent]}
                onChange={() => toggleAgent(agent)}
                className="rounded border-border accent-foreground"
              />
              <AgentLogo name={agent} size={14} />
              <span className="text-[12px] text-foreground">{agent}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onClose}
            className="text-muted text-[12px] px-4 py-1.5 hover:text-foreground transition-colors"
          >
            {t("Cancel")}
          </button>
          <button
            onClick={() => {
              if (selectedAgents.length > 0) onRemoveFromAgents(selectedAgents)
            }}
            disabled={selectedAgents.length === 0}
            className="text-[12px] px-4 py-1.5 rounded-lg border border-border text-foreground hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("Remove selected")}
          </button>
          <button
            onClick={onRemoveAll}
            className="bg-red-600 text-white text-[12px] px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t("Remove all")}
          </button>
        </div>
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
  supportingFiles: InstalledSkill["supportingFiles"]
  collections: Record<string, string[]>
  onContentSaved: (newContent: string) => void
  onSkillRemoved: () => void
  onToggleCollection: (collectionName: string, skill: InstalledSkill) => void
  onCreateCollection: () => void
}

function RightPanel({
  skill,
  content,
  contentLoading,
  supportingFiles,
  collections,
  onContentSaved,
  onSkillRemoved,
  onToggleCollection,
  onCreateCollection,
}: RightPanelProps) {
  const [editMode, setEditMode] = useState(false)
  const [supportingPreview, setSupportingPreview] = useState("")
  const [selectedSupportingFile, setSelectedSupportingFile] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const editorRef = useRef<SkillEditorHandle | null>(null)

  // Reset edit mode when skill changes
  useEffect(() => {
    setEditMode(false)
    setSupportingPreview("")
    setSelectedSupportingFile(null)
    setSaveStatus("idle")
    setShowRemoveDialog(false)
  }, [skill?.canonicalPath])

  useEffect(() => {
    if (!skill?.path || supportingFiles.length === 0) {
      setSupportingPreview("")
      setSelectedSupportingFile(null)
      return
    }

    const firstFile = supportingFiles[0]?.relativePath ?? null
    if (!firstFile) return

    let cancelled = false
    setSelectedSupportingFile(firstFile)
    electronAPI
      .readSupportingFile(skill.path, firstFile)
      .then((value) => {
        if (!cancelled) {
          setSupportingPreview(value)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSupportingPreview("Preview unavailable.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [skill?.path, supportingFiles])

  const isLocalSkill = !!(skill?.path)

  useEffect(() => {
    if (!editMode) return
    const timer = window.setTimeout(() => {
      editorRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [editMode])

  const handleEditToggle = () => {
    if (!editMode) {
      setSaveStatus("idle")
    }
    setEditMode(!editMode)
  }

  const handleSave = async (editorContent?: string) => {
    if (!skill?.path) return
    const nextContent = editorContent ?? editorRef.current?.getValue() ?? content ?? ""
    setSaveStatus("saving")
    try {
      const filePath = skill.path + "/SKILL.md"
      await electronAPI.writeSkillContent(filePath, nextContent)
      onContentSaved(nextContent)
      setSaveStatus("saved")
      setTimeout(() => {
        setEditMode(false)
        setSaveStatus("idle")
      }, 800)
    } catch (err) {
      console.error("Failed to save skill content:", err)
      setSaveStatus("error")
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setSaveStatus("idle")
  }

  const handleOpenInFinder = () => {
    if (!skill?.path) return
    electronAPI.openInFinder(skill.path + "/SKILL.md")
  }

  const handleSupportingFileSelect = async (relativePath: string) => {
    if (!skill?.path) return
    setSelectedSupportingFile(relativePath)
    try {
      const value = await electronAPI.readSupportingFile(skill.path, relativePath)
      setSupportingPreview(value)
    } catch (err) {
      console.error("Failed to read supporting file:", err)
      setSupportingPreview("Preview unavailable.")
    }
  }

  const handleDeleteClick = () => {
    if (!skill) return
    if (skill.agents.length > 1) {
      setShowRemoveDialog(true)
    } else {
      // Single agent: just confirm and remove all
      if (confirm(`Remove "${skill.name}" from ${skill.agents[0]}?`)) {
        electronAPI.removeSkill(skill.name).then(() => onSkillRemoved())
      }
    }
  }

  const handleRemoveFromAgents = async (agentDisplayNames: string[]) => {
    if (!skill) return
    for (const displayName of agentDisplayNames) {
      const registryKey = DISPLAY_NAME_TO_KEY[displayName] || displayName.toLowerCase().replace(/\s+/g, "-")
      await electronAPI.removeFromAgent(skill.name, registryKey)
    }
    setShowRemoveDialog(false)
    onSkillRemoved()
  }

  const handleRemoveAll = async () => {
    if (!skill) return
    await electronAPI.removeSkill(skill.name)
    setShowRemoveDialog(false)
    onSkillRemoved()
  }

  if (!skill) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <SkillsGateIcon />
          <p className="text-muted text-sm mt-3">
            {t("Select a skill to view details")}
          </p>
        </div>
      </div>
    )
  }

  if (editMode) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex items-center justify-between gap-4 border-b border-border px-8 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold text-foreground">{skill.name}</h1>
              <SourceBadge sourceType={skill.sourceType} />
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Editing raw `SKILL.md`
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === "saved" && (
              <span className="text-[12px] text-green-500">{t("Saved")}</span>
            )}
            {saveStatus === "error" && (
              <span className="text-[12px] text-red-500">{t("Save failed")}</span>
            )}
            <button
              onClick={handleCancel}
              className="rounded-lg border border-border px-4 py-2 text-[12px] text-muted transition-colors hover:text-foreground"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saveStatus === "saving"}
              className="rounded-lg bg-foreground px-4 py-2 text-[12px] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saveStatus === "saving" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <SkillEditor
            ref={editorRef}
            content={content ?? ""}
            onSave={handleSave}
            fullBleed
          />
        </div>
      </div>
    )
  }

  return (
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">{skill.name}</h1>
                <SourceBadge sourceType={skill.sourceType} />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* View/Edit toggle */}
                {isLocalSkill && content && (
                  <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden text-[12px]">
                    <button
                      onClick={() => { if (editMode) handleCancel() }}
                      className={`px-3 py-1.5 transition-colors ${!editMode ? "bg-surface-hover text-foreground font-medium" : "text-muted hover:text-foreground"}`}
                    >
                      {t("View")}
                    </button>
                    <button
                      onClick={() => { if (!editMode) handleEditToggle() }}
                      className={`px-3 py-1.5 transition-colors ${editMode ? "bg-surface-hover text-foreground font-medium" : "text-muted hover:text-foreground"}`}
                    >
                      {t("Edit")}
                    </button>
                  </div>
                )}

                {/* Open in Finder */}
                {isLocalSkill && (
                  <button
                    onClick={handleOpenInFinder}
                    title={t("Show in Finder")}
                    className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <FolderIcon />
                  </button>
                )}

                {/* Delete */}
                {isLocalSkill && (
                  <button
                    onClick={handleDeleteClick}
                    title={t("Remove skill")}
                    className="p-1.5 rounded-md text-muted hover:text-red-500 hover:bg-surface-hover transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {skill.description && (
              <p className="text-sm text-muted mb-3">{skill.description}</p>
            )}
            <div className="flex items-center gap-1.5">
              <AgentLogoRow agents={skill.agents} size={16} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
              <span className="rounded border border-border px-2 py-0.5">
                scope: {skill.scope}
              </span>
              {skill.projectName && (
                <span className="rounded border border-border px-2 py-0.5">
                  project: {skill.projectName}
                </span>
              )}
              <span className="rounded border border-border px-2 py-0.5">
                supporting files: {supportingFiles.length}
              </span>
            </div>
            {skill.source && (
              <p className="text-[11px] text-muted font-mono mt-2">
                {skill.source}
              </p>
            )}
            <p className="text-[11px] text-muted font-mono mt-2 break-all">
              {skill.canonicalPath}
            </p>
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-muted">{t("Collections")}</p>
                <button
                  onClick={onCreateCollection}
                  className="text-[11px] text-muted hover:text-foreground"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(collections).length === 0 ? (
                  <span className="text-[11px] text-muted">{t("No collections yet.")}</span>
                ) : (
                  Object.entries(collections).map(([name, items]) => {
                    const included = items.includes(skill.canonicalPath)
                    return (
                      <button
                        key={name}
                        onClick={() => onToggleCollection(name, skill)}
                        className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                          included
                            ? "border-accent bg-surface-hover text-foreground"
                            : "border-border text-muted hover:text-foreground"
                        }`}
                      >
                        {name}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-border mb-6" />

          {/* Content: View or Edit mode */}
          {contentLoading ? (
            <p className="text-sm text-muted animate-fade-in">{t("Loading content...")}</p>
          ) : content ? (
            <MemoizedMarkdown content={content} />
          ) : (
            <p className="text-sm text-muted">
              {t("Skill content not available. This skill may not have a SKILL.md file.")}
            </p>
          )}

          {supportingFiles.length > 0 && !editMode && (
            <>
              <hr className="border-border my-6" />
              <div className="grid grid-cols-[220px_1fr] gap-4">
                <div>
                  <h2 className="text-[12px] uppercase tracking-widest text-muted mb-3">
                    {t("Supporting Files")}
                  </h2>
                  <div className="flex flex-col gap-1">
                    {supportingFiles.map((file) => (
                      <button
                        key={file.relativePath}
                        onClick={() => handleSupportingFileSelect(file.relativePath)}
                        className={`text-left rounded-md border px-2 py-1.5 text-[12px] transition-colors ${
                          selectedSupportingFile === file.relativePath
                            ? "border-accent bg-surface-hover text-foreground"
                            : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
                        }`}
                      >
                        <div className="truncate">{file.relativePath}</div>
                        <div className="text-[10px] text-muted">{file.size} bytes</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-[12px] uppercase tracking-widest text-muted mb-3">
                    {t("Preview")}
                  </h2>
                  <pre className="min-h-[220px] overflow-x-auto rounded-lg border border-border bg-surface p-4 text-[12px] text-foreground whitespace-pre-wrap">
                    {supportingPreview || "Select a supporting file to preview it."}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Remove skill dialog */}
      {showRemoveDialog && skill && (
        <RemoveSkillDialog
          skill={skill}
          onClose={() => setShowRemoveDialog(false)}
          onRemoveFromAgents={handleRemoveFromAgents}
          onRemoveAll={handleRemoveAll}
        />
      )}
    </div>
  )
}

const MemoizedRightPanel = memo(RightPanel)

function CreateSkillDialog({
  open,
  onClose,
  agents,
  defaultTargets,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  agents: DetectedAgent[]
  defaultTargets: string[]
  onCreate: (data: { name: string; description: string; content: string; targets: string[] }) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [targets, setTargets] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setName("")
      setDescription("")
      setContent("")
      setTargets(defaultTargets.length > 0 ? defaultTargets : agents.map((agent) => agent.name))
    }
  }, [open, defaultTargets, agents])

  if (!open) return null

  const toggleTarget = (name: string) => {
    setTargets((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-lg">
        <h2 className="text-[15px] font-semibold text-foreground mb-1">{t("New Skill")}</h2>
        <p className="text-[12px] text-muted mb-4">{t("Create a local skill and install it into one or more targets.")}</p>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Skill name")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("Short description")}
            className="min-h-[90px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`---
name: my-skill
description: What this skill does
---

# My Skill

## Instructions

Add your skill instructions here.`}
            className="min-h-[220px] w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-[12px] text-foreground"
          />
          <div>
            <p className="text-[12px] font-medium text-foreground mb-2">{t("Targets")}</p>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => (
                <label key={agent.name} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] text-foreground">
                  <input
                    type="checkbox"
                    checked={targets.includes(agent.name)}
                    onChange={() => toggleTarget(agent.name)}
                  />
                  <span>{agent.displayName}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-[12px] text-muted">{t("Cancel")}</button>
            <button
              onClick={() => onCreate({ name: name.trim(), description: description.trim(), content, targets })}
              disabled={!name.trim()}
              className="rounded-lg bg-foreground px-4 py-2 text-[12px] text-background disabled:opacity-40"
            >
              {t("Create")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectionDialog({
  open,
  mode,
  initialName,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: "create" | "rename"
  initialName: string
  onClose: () => void
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) {
      setName(initialName)
    }
  }, [open, initialName])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-lg">
        <h2 className="text-[15px] font-semibold text-foreground mb-1">
          {mode === "create" ? "New Collection" : "Rename Collection"}
        </h2>
        <p className="text-[12px] text-muted mb-4">
          {mode === "create"
            ? "Create a collection for grouping local skills."
            : "Choose a new name for this collection."}
        </p>
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Collection name")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                onSubmit(name.trim())
              }
            }}
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-[12px] text-muted">
              {t("Cancel")}
            </button>
            <button
              onClick={() => onSubmit(name.trim())}
              disabled={!name.trim()}
              className="rounded-lg bg-foreground px-4 py-2 text-[12px] text-background disabled:opacity-40"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </div>
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
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites">("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedSkillPath, setSelectedSkillPath] = useState<string | null>(null)
  const [skillContent, setSkillContent] = useState<string | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [selectedSupportingFiles, setSelectedSupportingFiles] = useState<
    InstalledSkill["supportingFiles"]
  >([])
  const [collections, setCollections] = useState<Record<string, string[]>>({})
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [defaultAgents, setDefaultAgents] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [dragSkill, setDragSkill] = useState<DragSkillPayload | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [dragToast, setDragToast] = useState<DragToast | null>(null)
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set())
  const [lastMultiSelectIndex, setLastMultiSelectIndex] = useState<number | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [pendingBulkCollection, setPendingBulkCollection] = useState(false)
  const skillListRef = useRef<HTMLDivElement>(null)
  const contentCacheRef = useRef(new Map<string, string | null>())
  const supportingFilesCacheRef = useRef(
    new Map<string, InstalledSkill["supportingFiles"]>(),
  )
  const [collectionDialog, setCollectionDialog] = useState<{
    open: boolean
    mode: "create" | "rename"
    initialName: string
    targetName: string | null
  }>({
    open: false,
    mode: "create",
    initialName: "",
    targetName: null,
  })
  const selectedSkill = useMemo(
    () =>
      selectedSkillPath
        ? skills.find((skill) => skill.canonicalPath === selectedSkillPath) ?? null
        : null,
    [selectedSkillPath, skills],
  )

  // Load agents and skills on mount
  useEffect(() => {
    async function load() {
      try {
        const [
          detectedAgents,
          installedSkills,
          savedCollections,
          savedDefaultAgents,
          savedFavorites,
        ] = await Promise.all([
          electronAPI.detectAgents(),
          electronAPI.listInstalled(),
          electronAPI.settingsGet("collections.skills", {} as Record<string, string[]>),
          electronAPI.settingsGet("install.defaultAgents", [] as string[]),
          electronAPI.favoritesList(),
        ])
        setAgents(detectedAgents)
        setSkills(installedSkills)
        setCollections(savedCollections || {})
        setDefaultAgents(savedDefaultAgents || [])
        setFavorites(new Set(savedFavorites))
      } catch (err) {
        console.error("Failed to load installed skills:", err)
      } finally {
        setLoading(false)
      }
    }

    load()

    const cleanup = electronAPI.onSkillsUpdated((updatedSkills) => {
      contentCacheRef.current.clear()
      supportingFilesCacheRef.current.clear()
      setSkills(updatedSkills)
    })

    return cleanup
  }, [])

  // Load skill content and supporting files when a skill is selected
  useEffect(() => {
    if (!selectedSkill) {
      setSkillContent(null)
      setSelectedSupportingFiles([])
      setContentLoading(false)
      return
    }

    let cancelled = false
    const cacheKey = selectedSkill.canonicalPath
    const hasCachedContent = contentCacheRef.current.has(cacheKey)
    const cachedContent = contentCacheRef.current.get(cacheKey) ?? null
    const cachedFiles = supportingFilesCacheRef.current.get(cacheKey)

    setSkillContent(hasCachedContent ? cachedContent : null)
    setSelectedSupportingFiles(cachedFiles ?? [])

    if (hasCachedContent && cachedFiles) {
      setContentLoading(false)
      return
    }

    setContentLoading(true)

    async function loadContent() {
      try {
        const [raw, files] = await Promise.all([
          hasCachedContent
            ? Promise.resolve(cachedContent)
            : electronAPI.readSkillContent(selectedSkill.path),
          cachedFiles
            ? Promise.resolve(cachedFiles)
            : electronAPI.listSupportingFiles(selectedSkill.path),
        ])
        if (!cancelled) {
          setSkillContent(raw || null)
          setSelectedSupportingFiles(files)
          contentCacheRef.current.set(cacheKey, raw || null)
          supportingFilesCacheRef.current.set(cacheKey, files)
        }
      } catch (err) {
        console.error("Failed to load skill content:", err)
        if (!cancelled) {
          setSkillContent(null)
          setSelectedSupportingFiles([])
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

  useEffect(() => {
    if (selectedSkillPath && !selectedSkill) {
      setSelectedSkillPath(null)
      setSkillContent(null)
      setSelectedSupportingFiles([])
    }
  }, [selectedSkill, selectedSkillPath])

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

    if (activeFilter === "favorites") {
      result = result.filter((s) => favorites.has(s.name))
    }

    if (selectedCollection) {
      const ids = new Set(collections[selectedCollection] || [])
      result = result.filter((s) => ids.has(s.canonicalPath))
    }

    if (selectedAgent) {
      result = result.filter((s) => s.agents.includes(selectedAgent))
    }

    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.source && s.source.toLowerCase().includes(q)) ||
          s.path.toLowerCase().includes(q) ||
          s.canonicalPath.toLowerCase().includes(q) ||
          (s.projectName && s.projectName.toLowerCase().includes(q)) ||
          s.supportingFiles.some((file) =>
            file.relativePath.toLowerCase().includes(q),
          ),
      )
    }

    return result
  }, [
    skills,
    selectedAgent,
    deferredSearchQuery,
    selectedCollection,
    collections,
    activeFilter,
    favorites,
  ])

  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const [name, items] of Object.entries(collections)) {
      const ids = new Set(items)
      counts[name] = skills.filter((skill) => ids.has(skill.canonicalPath)).length
    }
    return counts
  }, [collections, skills])

  // Only show agents that actually have skills
  const agentsWithSkills = useMemo(() => {
    return agents.filter((a) => (agentSkillCounts[a.displayName] || 0) > 0)
  }, [agents, agentSkillCounts])

  // Count favorites that are currently installed (orphan favorites are
  // preserved in the DB but not shown in the sidebar count).
  const installedFavoritesCount = useMemo(
    () => skills.reduce((n, s) => (favorites.has(s.name) ? n + 1 : n), 0),
    [skills, favorites],
  )

  const handleSelectSkill = useCallback((skill: InstalledSkill) => {
    setSelectedSkillPath(skill.canonicalPath)
  }, [])

  const handleToggleFavorite = useCallback(
    async (skill: InstalledSkill, e: React.MouseEvent) => {
      e.stopPropagation()
      const name = skill.name
      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev)
        if (next.has(name)) next.delete(name)
        else next.add(name)
        return next
      })
      try {
        const isFavoritedAfter = await electronAPI.favoritesToggle(name)
        setFavorites((prev) => {
          const next = new Set(prev)
          if (isFavoritedAfter) next.add(name)
          else next.delete(name)
          return next
        })
      } catch (err) {
        console.error("Failed to toggle favorite:", err)
        // Revert on failure
        setFavorites((prev) => {
          const next = new Set(prev)
          if (next.has(name)) next.delete(name)
          else next.add(name)
          return next
        })
      }
    },
    [],
  )

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedAgent(null)
    setSelectedCollection(null)
    setActiveFilter("all")
  }, [])

  const handleContentSaved = useCallback((newContent: string) => {
    setSkillContent(newContent)
    if (selectedSkill) {
      contentCacheRef.current.set(selectedSkill.canonicalPath, newContent)
    }
  }, [selectedSkill])

  const handleSkillRemoved = useCallback(async () => {
    setSelectedSkillPath(null)
    setSkillContent(null)
    setSelectedSupportingFiles([])
    try {
      const installedSkills = await electronAPI.listInstalled()
      setSkills(installedSkills)
    } catch (err) {
      console.error("Failed to refresh skills after removal:", err)
    }
  }, [])

  const persistCollections = useCallback(async (next: Record<string, string[]>) => {
    setCollections(next)
    await electronAPI.settingsSet("collections.skills", next)
  }, [])

  const handleCreateCollection = useCallback(() => {
    setCollectionDialog({
      open: true,
      mode: "create",
      initialName: "",
      targetName: null,
    })
  }, [])

  const handleRenameCollection = useCallback((name: string) => {
    setCollectionDialog({
      open: true,
      mode: "rename",
      initialName: name,
      targetName: name,
    })
  }, [])

  const handleDeleteCollection = useCallback((name: string) => {
    if (!window.confirm(`Delete collection "${name}"?`)) return
    const next = { ...collections }
    delete next[name]
    if (selectedCollection === name) setSelectedCollection(null)
    void persistCollections(next)
  }, [collections, persistCollections, selectedCollection])

  const handleToggleCollection = useCallback((name: string, skill: InstalledSkill) => {
    const existing = new Set(collections[name] || [])
    if (existing.has(skill.canonicalPath)) {
      existing.delete(skill.canonicalPath)
    } else {
      existing.add(skill.canonicalPath)
    }
    void persistCollections({
      ...collections,
      [name]: Array.from(existing).sort(),
    })
  }, [collections, persistCollections])

  const handleDropOnCollection = useCallback((name: string) => {
    if (!dragSkill) return
    const next = { ...collections }
    const target = new Set(next[name] || [])
    target.add(dragSkill.canonicalPath)
    next[name] = Array.from(target).sort()
    if (selectedCollection && selectedCollection !== name) {
      const source = new Set(next[selectedCollection] || [])
      if (source.has(dragSkill.canonicalPath)) {
        source.delete(dragSkill.canonicalPath)
        next[selectedCollection] = Array.from(source).sort()
      }
    }
    void persistCollections(next)
    setDragToast({
      type: "success",
      message:
        selectedCollection && selectedCollection !== name
          ? `Moved "${dragSkill.name}" to ${name}`
          : `Added "${dragSkill.name}" to ${name}`,
    })
    setDragSkill(null)
    setDragOverTarget(null)
  }, [collections, dragSkill, persistCollections, selectedCollection])

  const handleDropOnAgent = useCallback(async (agentDisplayName: string) => {
    if (!dragSkill) return
    const registryKey =
      DISPLAY_NAME_TO_KEY[agentDisplayName] ||
      agentDisplayName.toLowerCase().replace(/\s+/g, "-")
    try {
      await electronAPI.addToAgent(dragSkill.name, dragSkill.canonicalPath, registryKey)
      const installedSkills = await electronAPI.listInstalled()
      setSkills(installedSkills)
      setDragToast({
        type: "success",
        message: `Added "${dragSkill.name}" to ${agentDisplayName}`,
      })
    } catch (err) {
      console.error("Failed to add skill to agent:", err)
      setDragToast({
        type: "error",
        message: `Failed to add "${dragSkill.name}" to ${agentDisplayName}`,
      })
    } finally {
      setDragSkill(null)
      setDragOverTarget(null)
    }
  }, [dragSkill])

  useEffect(() => {
    if (!dragToast) return
    const timer = window.setTimeout(() => setDragToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [dragToast])

  const handleCreateSkill = useCallback(async (data: { name: string; description: string; content: string; targets: string[] }) => {
    await electronAPI.createSkill({
      name: data.name,
      description: data.description,
      content: data.content,
      agentNames: data.targets,
    })
    setShowCreateDialog(false)
    const installedSkills = await electronAPI.listInstalled()
    setSkills(installedSkills)
  }, [])

  const handleCollectionDialogSubmit = useCallback((name: string) => {
    if (!name) return

    if (collectionDialog.mode === "create") {
      if (collections[name]) {
        setCollectionDialog((prev) => ({ ...prev, open: false }))
        return
      }
      void persistCollections({ ...collections, [name]: [] })
      setCollectionDialog((prev) => ({ ...prev, open: false }))
      return
    }

    const sourceName = collectionDialog.targetName
    if (!sourceName || sourceName === name) {
      setCollectionDialog((prev) => ({ ...prev, open: false }))
      return
    }

    const next = { ...collections }
    next[name] = next[sourceName] || []
    delete next[sourceName]
    if (selectedCollection === sourceName) setSelectedCollection(name)
    void persistCollections(next)
    setCollectionDialog((prev) => ({ ...prev, open: false }))
  }, [collectionDialog, collections, persistCollections, selectedCollection])

  // -- Multi-select handlers --

  const handleMultiSelectToggle = useCallback((skill: InstalledSkill, e: React.MouseEvent) => {
    const path = skill.canonicalPath

    if (e.shiftKey && lastMultiSelectIndex !== null) {
      // Shift+click: select range
      const currentIndex = filteredSkills.findIndex((s) => s.canonicalPath === path)
      if (currentIndex === -1) return
      const start = Math.min(lastMultiSelectIndex, currentIndex)
      const end = Math.max(lastMultiSelectIndex, currentIndex)
      setMultiSelected((prev) => {
        const next = new Set(prev)
        for (let i = start; i <= end; i++) {
          next.add(filteredSkills[i].canonicalPath)
        }
        return next
      })
    } else {
      // Cmd/Ctrl+click or plain click while multi-select active: toggle single
      setMultiSelected((prev) => {
        const next = new Set(prev)
        if (next.has(path)) {
          next.delete(path)
        } else {
          next.add(path)
        }
        return next
      })
      const currentIndex = filteredSkills.findIndex((s) => s.canonicalPath === path)
      setLastMultiSelectIndex(currentIndex)
    }
  }, [filteredSkills, lastMultiSelectIndex])

  const handleMultiSelectAll = useCallback(() => {
    setMultiSelected(new Set(filteredSkills.map((s) => s.canonicalPath)))
    setLastMultiSelectIndex(null)
  }, [filteredSkills])

  const handleMultiSelectClear = useCallback(() => {
    setMultiSelected(new Set())
    setLastMultiSelectIndex(null)
  }, [])

  // Clear multi-selection when the filtered list changes significantly
  useEffect(() => {
    if (multiSelected.size === 0) return
    const visiblePaths = new Set(filteredSkills.map((s) => s.canonicalPath))
    setMultiSelected((prev) => {
      const next = new Set<string>()
      for (const path of prev) {
        if (visiblePaths.has(path)) next.add(path)
      }
      if (next.size === prev.size) return prev
      return next
    })
  }, [filteredSkills, multiSelected.size])

  const handleBulkAddToCollection = useCallback((collectionName: string) => {
    const next = { ...collections }
    const target = new Set(next[collectionName] || [])
    for (const path of multiSelected) {
      target.add(path)
    }
    next[collectionName] = Array.from(target).sort()
    void persistCollections(next)
    setMultiSelected(new Set())
    setLastMultiSelectIndex(null)
  }, [collections, multiSelected, persistCollections])

  const handleBulkCreateCollection = useCallback(() => {
    setPendingBulkCollection(true)
    setCollectionDialog({
      open: true,
      mode: "create",
      initialName: "",
      targetName: null,
    })
  }, [])

  // Extend handleCollectionDialogSubmit to also handle pending bulk adds
  const handleCollectionDialogSubmitWrapped = useCallback((name: string) => {
    handleCollectionDialogSubmit(name)

    if (pendingBulkCollection && name.trim()) {
      // After creating the collection, add the selected skills to it
      const collectionName = name.trim()
      // Need to schedule this for after the collection is persisted
      setTimeout(() => {
        const next = { ...collections }
        if (!next[collectionName]) next[collectionName] = []
        const target = new Set(next[collectionName])
        for (const path of multiSelected) {
          target.add(path)
        }
        next[collectionName] = Array.from(target).sort()
        void persistCollections(next)
        setMultiSelected(new Set())
        setLastMultiSelectIndex(null)
      }, 0)
      setPendingBulkCollection(false)
    }
  }, [handleCollectionDialogSubmit, pendingBulkCollection, collections, multiSelected, persistCollections])

  const handleBulkDelete = useCallback(() => {
    setShowBulkDeleteDialog(true)
  }, [])

  const handleBulkDeleteConfirm = useCallback(async () => {
    const pathsToDelete = new Set(multiSelected)
    const skillNames = skills
      .filter((s) => pathsToDelete.has(s.canonicalPath))
      .map((s) => s.name)

    for (const name of skillNames) {
      try {
        await electronAPI.removeSkill(name)
      } catch (err) {
        console.error(`Failed to remove skill "${name}":`, err)
      }
    }

    // If the currently viewed skill was deleted, clear it
    if (selectedSkill && pathsToDelete.has(selectedSkill.canonicalPath)) {
      setSelectedSkillPath(null)
      setSkillContent(null)
      setSelectedSupportingFiles([])
    }

    setShowBulkDeleteDialog(false)
    setMultiSelected(new Set())
    setLastMultiSelectIndex(null)

    try {
      const installedSkills = await electronAPI.listInstalled()
      setSkills(installedSkills)
    } catch (err) {
      console.error("Failed to refresh skills after bulk removal:", err)
    }
  }, [multiSelected, selectedSkill, skills])

  const handleBulkRemoveFromAgent = useCallback(async () => {
    if (!selectedAgent) return
    const registryKey =
      DISPLAY_NAME_TO_KEY[selectedAgent] ||
      selectedAgent.toLowerCase().replace(/\s+/g, "-")
    const pathsToRemove = new Set(multiSelected)
    const skillNames = skills
      .filter((s) => pathsToRemove.has(s.canonicalPath))
      .map((s) => s.name)

    for (const name of skillNames) {
      try {
        await electronAPI.removeFromAgent(name, registryKey)
      } catch (err) {
        console.error(`Failed to remove skill "${name}" from ${selectedAgent}:`, err)
      }
    }

    if (selectedSkill && pathsToRemove.has(selectedSkill.canonicalPath)) {
      setSelectedSkillPath(null)
      setSkillContent(null)
      setSelectedSupportingFiles([])
    }

    setShowBulkDeleteDialog(false)
    setMultiSelected(new Set())
    setLastMultiSelectIndex(null)

    try {
      const installedSkills = await electronAPI.listInstalled()
      setSkills(installedSkills)
    } catch (err) {
      console.error("Failed to refresh skills after bulk removal:", err)
    }
  }, [multiSelected, selectedAgent, selectedSkill, skills])

  // Keyboard shortcuts: Escape to clear selection, Cmd/Ctrl+A to select all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape clears multi-selection
      if (e.key === "Escape" && multiSelected.size > 0) {
        e.preventDefault()
        setMultiSelected(new Set())
        setLastMultiSelectIndex(null)
        return
      }

      // Cmd/Ctrl+A selects all visible skills when the skill list is focused
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        const listEl = skillListRef.current
        if (listEl && listEl.contains(document.activeElement)) {
          e.preventDefault()
          setMultiSelected(new Set(filteredSkills.map((s) => s.canonicalPath)))
          setLastMultiSelectIndex(null)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [multiSelected, filteredSkills])

  const handleOpenCreateSkill = useCallback(() => {
    setShowCreateDialog(true)
  }, [])

  const handleDragSkillStart = useCallback((skill: InstalledSkill) => {
    setDragSkill({ name: skill.name, canonicalPath: skill.canonicalPath })
  }, [])

  const handleDragSkillEnd = useCallback(() => {
    setDragSkill(null)
    setDragOverTarget(null)
  }, [])

  return (
    <div className="flex h-full">
      {/* Column 1: Left sidebar (filter panel) */}
      <MemoizedLeftSidebar
        totalSkillCount={skills.length}
        favoritesCount={installedFavoritesCount}
        agentsWithSkills={agentsWithSkills}
        agentSkillCounts={agentSkillCounts}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        collections={collections}
        collectionCounts={collectionCounts}
        selectedCollection={selectedCollection}
        onSelectCollection={setSelectedCollection}
        onCreateCollection={handleCreateCollection}
        onRenameCollection={handleRenameCollection}
        onDeleteCollection={handleDeleteCollection}
        dragSkill={dragSkill}
        dragOverTarget={dragOverTarget}
        onDragEnterTarget={setDragOverTarget}
        onDropOnAgent={handleDropOnAgent}
        onDropOnCollection={handleDropOnCollection}
      />

      {/* Column 2: Skill list */}
      <MemoizedMiddlePanel
        loading={loading}
        skills={skills}
        filteredSkills={filteredSkills}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSkillPath={selectedSkill?.canonicalPath ?? null}
        onSelectSkill={handleSelectSkill}
        selectedAgent={selectedAgent}
        selectedCollection={selectedCollection}
        activeFilter={activeFilter}
        onClearFilters={handleClearFilters}
        onCreateSkill={handleOpenCreateSkill}
        dragSkill={dragSkill}
        onDragSkillStart={handleDragSkillStart}
        onDragSkillEnd={handleDragSkillEnd}
        multiSelected={multiSelected}
        onMultiSelectToggle={handleMultiSelectToggle}
        onMultiSelectAll={handleMultiSelectAll}
        onMultiSelectClear={handleMultiSelectClear}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        collections={collections}
        onBulkAddToCollection={handleBulkAddToCollection}
        onBulkCreateCollection={handleBulkCreateCollection}
        onBulkDelete={handleBulkDelete}
        listRef={skillListRef}
      />

      {/* Column 3: Skill detail */}
      <MemoizedRightPanel
        skill={selectedSkill}
        content={skillContent}
        contentLoading={contentLoading}
        supportingFiles={selectedSupportingFiles}
        collections={collections}
        onContentSaved={handleContentSaved}
        onSkillRemoved={handleSkillRemoved}
        onToggleCollection={handleToggleCollection}
        onCreateCollection={handleCreateCollection}
      />

      <CreateSkillDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        agents={agents}
        defaultTargets={defaultAgents}
        onCreate={handleCreateSkill}
      />

      <CollectionDialog
        open={collectionDialog.open}
        mode={collectionDialog.mode}
        initialName={collectionDialog.initialName}
        onClose={() => {
          setCollectionDialog((prev) => ({ ...prev, open: false }))
          setPendingBulkCollection(false)
        }}
        onSubmit={handleCollectionDialogSubmitWrapped}
      />

      {showBulkDeleteDialog && (
        <BulkDeleteDialog
          count={multiSelected.size}
          selectedAgent={selectedAgent}
          onConfirm={handleBulkDeleteConfirm}
          onRemoveFromAgent={handleBulkRemoveFromAgent}
          onCancel={() => setShowBulkDeleteDialog(false)}
        />
      )}

      {dragSkill && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 rounded-full border border-accent/40 bg-surface px-4 py-2 text-[12px] text-foreground shadow-lg">
          Dragging “{dragSkill.name}”
        </div>
      )}

      {dragToast && (
        <div
          className={`pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border px-4 py-2 text-[12px] shadow-lg ${
            dragToast.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-100"
              : "border-red-500/30 bg-red-950/80 text-red-100"
          }`}
        >
          {dragToast.message}
        </div>
      )}
    </div>
  )
}
