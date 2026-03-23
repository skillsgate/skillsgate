import { useState, useCallback } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useSearch } from "../data/use-search.js"
import type { CatalogSkill } from "../data/api-client.js"
import { colors } from "../utils/colors.js"

/**
 * Discover view: search the SkillsGate catalog and browse results.
 */
export function DiscoverView() {
  const state = useStore()
  const dispatch = useDispatch()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { results, loading, error, total, hasMore, loadMore } = useSearch(query)

  // Keyboard navigation for the discover list
  useKeyboard((key) => {
    if (state.activeView !== "discover") return
    if (state.showHelp) return
    if (state.focusedPane === "search") return

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

    // Enter to view detail (basic info for catalog items)
    if (key.name === "return" && results[selectedIndex]) {
      const skill = results[selectedIndex]
      dispatch({
        type: "SELECT_SKILL",
        skill: catalogSkillToEnriched(skill),
      })
      return
    }

    // i to install (placeholder)
    if (key.name === "i" && results[selectedIndex]) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: {
          type: "info",
          message: `Install "${results[selectedIndex].name}": coming soon. Use CLI: skillsgate add <source>`,
        },
      })
      return
    }
  })

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
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
        title="Search skills"
      >
        <input
          placeholder="Search the SkillsGate catalog..."
          focused={state.activeView === "discover" && state.focusedPane === "search" && !state.showHelp}
          onInput={(value: string) => {
            setQuery(value)
            setSelectedIndex(0)
          }}
        />
      </box>

      {/* Status line */}
      <box
        style={{
          height: 1,
          width: "100%",
          paddingLeft: 1,
          backgroundColor: colors.bgAlt,
          flexDirection: "row",
        }}
      >
        <text fg={colors.textDim}>
          {loading
            ? "Loading..."
            : error
              ? `Error: ${error}`
              : query.trim()
                ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
                : `Catalog: ${results.length} of ${total} skills loaded`}
        </text>
      </box>

      {/* Column headers */}
      <box
        style={{
          height: 1,
          width: "100%",
          flexDirection: "row",
          paddingLeft: 1,
          paddingRight: 1,
          backgroundColor: colors.bgAlt,
        }}
      >
        <text fg={colors.textDim} style={{ width: 28 }}>
          NAME
        </text>
        <text fg={colors.textDim} style={{ flexGrow: 1 }}>
          DESCRIPTION
        </text>
        <text fg={colors.textDim} style={{ width: 24 }}>
          CATEGORIES
        </text>
      </box>

      {/* Results list */}
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
            <DiscoverListItem
              key={skill.id ?? `${skill.slug}-${i}`}
              skill={skill}
              selected={i === selectedIndex}
            />
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
  )
}

// ---------- List item component ----------

interface DiscoverListItemProps {
  skill: CatalogSkill
  selected: boolean
}

function DiscoverListItem({ skill, selected }: DiscoverListItemProps) {
  const categories = skill.categories?.slice(0, 3).join(", ") ?? ""
  const description = (skill.summary || skill.description || "").slice(0, 50)

  return (
    <box
      style={{
        width: "100%",
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: selected ? colors.bgAlt : "transparent",
      }}
    >
      <text fg={colors.primary} style={{ width: 28 }}>
        {skill.name}
      </text>
      <text fg={colors.textDim} style={{ flexGrow: 1 }}>
        {description}
      </text>
      <text fg={colors.secondary} style={{ width: 24 }}>
        {categories}
      </text>
    </box>
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
