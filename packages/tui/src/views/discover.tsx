import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useSearch } from "../data/use-search.js"
import { useSkillActions } from "../data/use-skill-actions.js"
import { ConfirmDialog } from "../components/confirm-dialog.js"
import type { CatalogSkill, SearchMode } from "../data/api-client.js"
import { colors } from "../utils/colors.js"

/**
 * Discover view: two-column layout with search mode toggle.
 * LEFT  - Search input + mode toggle + results list (40%)
 * RIGHT - Selected result detail (flexGrow)
 *
 * Search modes:
 * - Keyword (public, no auth): ILIKE pattern matching, unlimited
 * - Semantic (auth required): AI-powered vector search, 30/day limit
 * Toggle with 'm' key.
 */
export function DiscoverView() {
  const state = useStore()
  const dispatch = useDispatch()
  const [query, setQuery] = useState("")
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [installTarget, setInstallTarget] = useState<CatalogSkill | null>(null)
  const [previewSkill, setPreviewSkill] = useState<CatalogSkill | null>(null)

  const token = state.auth?.token ?? null
  const isAuthenticated = !!state.auth

  const { results, loading, error, total, hasMore, loadMore, remainingSearches } =
    useSearch(query, searchMode, token)
  const { installSkill } = useSkillActions()

  // Update preview when selection changes
  useEffect(() => {
    if (results[selectedIndex]) {
      setPreviewSkill(results[selectedIndex])
    } else {
      setPreviewSkill(null)
    }
  }, [selectedIndex, results])

  // Keyboard navigation for the discover list
  useKeyboard((key) => {
    if (state.activeView !== "discover") return
    if (state.showHelp) return
    if (state.focusedPane === "search") return
    if (installTarget) return
    // Guard: skip Enter if search was just submitted (prevents opening first skill)
    
      
      return
    }

    // j/k or arrow keys
    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      setSelectedIndex((i) => Math.max(0, i - 1))
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      setSelectedIndex((i) => {
        const next = Math.min(results.length - 1, i + 1)
        // If we're near the bottom and there's more, load next page
        if (next >= results.length - 3 && hasMore && !loading) {
          loadMore()
        }
        return next
      })
    }

    // g = first, G = last
    if (key.name === "g" && !key.shift) {
      setSelectedIndex(0)
    }
    if (key.name === "g" && key.shift) {
      setSelectedIndex(Math.max(0, results.length - 1))
    }

    // v to open full detail view
    if (key.name === "v" && results[selectedIndex]) {
      const skill = results[selectedIndex]
      dispatch({
        type: "SELECT_SKILL",
        skill: catalogSkillToEnriched(skill),
      })
      return
    }

    // i to install
    if (key.name === "i" && results[selectedIndex]) {
      setInstallTarget(results[selectedIndex])
      return
    }

    // m to toggle search mode
    if (key.name === "m") {
      if (searchMode === "keyword") {
        if (!isAuthenticated) {
          dispatch({
            type: "SET_NOTIFICATION",
            notification: { type: "info", message: "Sign in to use AI search (press l)" },
          })
          return
        }
        setSearchMode("semantic")
      } else {
        setSearchMode("keyword")
      }
      setSelectedIndex(0)
      return
    }
  })

  // Confirm dialog for install
  if (installTarget) {
    return (
      <ConfirmDialog
        message={`Install "${installTarget.name}"?`}
        onConfirm={async () => {
          const skill = catalogSkillToEnriched(installTarget)
          setInstallTarget(null)
          await installSkill(skill)
        }}
        onCancel={() => setInstallTarget(null)}
      />
    )
  }

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
      {/* Search input */}
      {/* Search input */}
      <box
        style={{
          height: 3,
          width: "100%",
          border: true,
          borderColor: state.focusedPane === "search" ? colors.primary : colors.border,
          paddingLeft: 1,
          paddingRight: 1,
        }}
        title={searchMode === "semantic" ? "AI Search" : "Keyword Search"}
      >
        <input
          placeholder={
            searchMode === "semantic"
              ? 'AI search -- try "audit website performance" (Enter to search)'
              : "Search by keyword... (Enter to search)"
          }
          focused={state.activeView === "discover" && state.focusedPane === "search" && !state.showHelp}
          onSubmit={(value: string) => {
            setQuery(value)
            setSelectedIndex(0)
            // Stay in search pane -- user presses Tab to move to results
          }}
        />
      </box>

      {/* Status line: mode toggle + results + remaining */}
      <box
        style={{
          height: 1,
          width: "100%",
          paddingLeft: 1,
          backgroundColor: colors.bgAlt,
          flexDirection: "row",
        }}
      >
        {/* Mode toggle: show both options, highlight active */}
        <text fg={searchMode === "keyword" ? colors.primary : colors.textDim}>
          {searchMode === "keyword" ? "[Keyword]" : " Keyword "}
        </text>
        <text fg={colors.textDim}>{" | "}</text>
        <text fg={searchMode === "semantic" ? colors.warning : colors.textDim}>
          {searchMode === "semantic" ? "[AI Search]" : (isAuthenticated ? " AI Search " : " AI Search (login) ")}
        </text>
        <text fg={colors.textDim}>{"  m=switch  "}</text>

        {/* Results info */}
        <text fg={colors.textDim}>
          {loading
            ? "Loading..."
            : error
              ? error === "AUTH_EXPIRED"
                ? "Session expired -- press l to re-login"
                : error === "RATE_LIMIT"
                  ? "Daily limit reached -- switch to keyword (m)"
                  : `Error: ${error}`
              : query.trim()
                ? `${results.length} result${results.length !== 1 ? "s" : ""}`
                : `${results.length}/${total} skills`}
        </text>

        {/* Remaining searches (semantic only) */}
        {searchMode === "semantic" && remainingSearches !== null ? (
          <text fg={remainingSearches <= 5 ? colors.error : colors.textDim}>
            {`  ${remainingSearches} left today`}
          </text>
        ) : null}
      </box>

      {/* Two-column content: results list | detail */}
      <box style={{ flexDirection: "row", flexGrow: 1, width: "100%" }}>
        {/* LEFT: Results list */}
        <box
          style={{
            width: "40%",
            borderRight: true,
            borderColor: state.focusedPane === "list" ? colors.primary : colors.border,
            flexDirection: "column",
          }}
        >
          {/* List header */}
          <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
            <text fg={colors.textDim}>RESULTS</text>
          </box>

          {results.length === 0 && !loading ? (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>
                {query.trim()
                  ? "No skills found matching your query."
                  : "No skills available in the catalog."}
              </text>
            </box>
          ) : (
            <scrollbox
              focused={state.activeView === "discover" && state.focusedPane === "list" && !state.showHelp}
              style={{
                width: "100%",
                flexGrow: 1,
                rootOptions: { backgroundColor: colors.bg },
                viewportOptions: { backgroundColor: colors.bg },
                contentOptions: { backgroundColor: colors.bg },
                scrollbarOptions: {
                  trackOptions: {
                    foregroundColor: colors.primary,
                    backgroundColor: colors.border,
                  },
                },
              }}
            >
              {results.map((skill, i) => (
                <box
                  key={skill.id ?? `${skill.slug}-${i}`}
                  style={{
                    width: "100%",
                    paddingLeft: 1,
                    paddingRight: 1,
                    flexDirection: "row",
                    backgroundColor: i === selectedIndex ? colors.bgAlt : "transparent",
                  }}
                >
                  <text fg={i === selectedIndex ? colors.primary : colors.text}>
                    {skill.name}
                  </text>
                </box>
              ))}
              {hasMore && (
                <box style={{ paddingLeft: 1, height: 1 }}>
                  <text fg={colors.textDim}>
                    {loading ? "Loading more..." : "Scroll down to load more..."}
                  </text>
                </box>
              )}
            </scrollbox>
          )}
        </box>

        {/* RIGHT: Detail panel */}
        <box style={{ flexGrow: 1, flexDirection: "column" }}>
          {previewSkill ? (
            <DiscoverDetailPanel skill={previewSkill} />
          ) : (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>Select a skill to view details</text>
            </box>
          )}
        </box>
      </box>
    </box>
  )
}

// ---------- Inline Detail Panel ----------

interface DiscoverDetailPanelProps {
  skill: CatalogSkill
}

function DiscoverDetailPanel({ skill }: DiscoverDetailPanelProps) {
  const description = skill.summary || skill.description || ""
  const categories = skill.categories?.join(", ") ?? ""
  const capabilities = skill.capabilities?.join(", ") ?? ""
  const keywords = skill.keywords?.join(", ") ?? ""

  return (
    <scrollbox
      focused={false}
      style={{
        width: "100%",
        flexGrow: 1,
        rootOptions: { backgroundColor: colors.bg },
        viewportOptions: { backgroundColor: colors.bg },
        contentOptions: { backgroundColor: colors.bg },
        scrollbarOptions: {
          trackOptions: {
            foregroundColor: colors.primary,
            backgroundColor: colors.border,
          },
        },
      }}
    >
      <box style={{ paddingLeft: 1, paddingRight: 1, flexDirection: "column" }}>
        {/* Name */}
        <text fg={colors.primary}>
          <strong>{skill.name}</strong>
        </text>

        {/* Description */}
        <text fg={colors.text}>{description}</text>
        <text>{" "}</text>

        {/* Categories */}
        {categories ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>Categories: </text>
            <text fg={colors.secondary}>{categories}</text>
          </box>
        ) : null}

        {/* Capabilities */}
        {capabilities ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>Capabilities: </text>
            <text fg={colors.secondary}>{capabilities}</text>
          </box>
        ) : null}

        {/* Keywords */}
        {keywords ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>Keywords: </text>
            <text fg={colors.secondary}>{keywords}</text>
          </box>
        ) : null}

        {/* Score (semantic search only) */}
        {skill.score ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>Score: </text>
            <text fg={colors.success}>{skill.score.toFixed(3)}</text>
          </box>
        ) : null}

        {/* GitHub URL */}
        {skill.githubUrl ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>GitHub: </text>
            <text fg={colors.primary}>{skill.githubUrl}</text>
          </box>
        ) : null}

        {/* Install command */}
        {skill.installCommand ? (
          <>
            <text>{" "}</text>
            <text fg={colors.textDim}>Install:</text>
            <text fg={colors.success}>  {skill.installCommand}</text>
          </>
        ) : null}

        <text>{" "}</text>
        <text fg={colors.textDim}>v=full detail  i=install  Tab=switch pane</text>
      </box>
    </scrollbox>
  )
}

// ---------- Helpers ----------

/**
 * Converts a catalog skill to an EnrichedSkill for the detail view.
 * Since catalog skills don't have a local file, we provide a placeholder.
 */
function catalogSkillToEnriched(skill: CatalogSkill): import("../store/types.js").EnrichedSkill {
  return {
    name: skill.name,
    description: skill.summary || skill.description || "",
    filePath: "", // No local file for catalog items
    agents: [],
    metadata: {
      categories: skill.categories,
      capabilities: skill.capabilities,
      keywords: skill.keywords,
      githubUrl: skill.githubUrl,
      installCommand: skill.installCommand,
    },
    lock: skill.githubUrl
      ? {
          source: skill.githubUrl,
          sourceType: "github" as const,
          originalUrl: skill.githubUrl,
          skillFolderHash: "",
          installedAt: "",
          updatedAt: "",
        }
      : undefined,
  }
}
