import { useState, useMemo } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useFavorites } from "../data/use-favorites.js"
import { agents } from "../../../cli/src/core/agents.js"
import { colors } from "../utils/colors.js"
import type { CatalogSkill } from "../data/api-client.js"
import type { EnrichedSkill } from "../store/types.js"

/**
 * Favorites view: displays the user's favorited skills from the API.
 * Requires authentication. Shows a prompt to login if not authenticated.
 */
export function FavoritesView() {
  const state = useStore()
  const dispatch = useDispatch()
  const { favorites, loading, error, toggle } = useFavorites()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Build a set of installed skill names for the "installed" badge
  const installedNames = useMemo(() => {
    return new Set(state.installedSkills.map((s) => s.name.toLowerCase()))
  }, [state.installedSkills])

  // Keyboard navigation for the favorites list
  useKeyboard((key) => {
    if (state.activeView !== "favorites") return
    if (state.showHelp) return
    if (!state.auth) return // No navigation when not logged in

    // j/k or arrow keys
    if (key.name === "up" || (key.name === "k" && !key.ctrl)) {
      setSelectedIndex((i) => Math.max(0, i - 1))
    }
    if (key.name === "down" || (key.name === "j" && !key.ctrl)) {
      setSelectedIndex((i) => Math.min(favorites.length - 1, i + 1))
    }

    // g = first, G = last
    if (key.name === "g" && !key.shift) {
      setSelectedIndex(0)
    }
    if (key.name === "g" && key.shift) {
      setSelectedIndex(Math.max(0, favorites.length - 1))
    }

    // Enter to view detail
    if (key.name === "return" && favorites[selectedIndex]) {
      const skill = favorites[selectedIndex]
      dispatch({
        type: "SELECT_SKILL",
        skill: catalogSkillToEnriched(skill, installedNames),
      })
      return
    }

    // x to unfavorite
    if (key.name === "x" && favorites[selectedIndex]) {
      const skill = favorites[selectedIndex]
      toggle(skill.id)
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "info", message: `Removed "${skill.name}" from favorites` },
      })
      // Adjust selection if we removed the last item
      if (selectedIndex >= favorites.length - 1 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1)
      }
      return
    }

    // i to install (placeholder for now, will be implemented in Task 25)
    if (key.name === "i" && favorites[selectedIndex]) {
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: {
          type: "info",
          message: `Install "${favorites[selectedIndex].name}": coming soon. Use CLI: skillsgate add <source>`,
        },
      })
      return
    }
  })

  // Not authenticated
  if (!state.auth) {
    return (
      <box style={{ flexDirection: "column", padding: 2 }}>
        <text fg={colors.text}>
          Sign in to view your favorites
        </text>
        <text>{" "}</text>
        <text fg={colors.textDim}>
          Press <span fg={colors.primary}>l</span> to login
        </text>
      </box>
    )
  }

  // Loading state
  if (loading && favorites.length === 0) {
    return (
      <box style={{ padding: 1 }}>
        <text fg={colors.textDim}>Loading favorites...</text>
      </box>
    )
  }

  // Error state
  if (error && favorites.length === 0) {
    return (
      <box style={{ padding: 1 }}>
        <text fg={colors.error}>Error: {error}</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", width: "100%", flexGrow: 1 }}>
      {/* Status line */}
      <box
        style={{
          height: 1,
          width: "100%",
          paddingLeft: 1,
          backgroundColor: colors.bgAlt,
        }}
      >
        <text fg={colors.textDim}>
          {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
          {loading ? " (refreshing...)" : ""}
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
        <text fg={colors.textDim} style={{ width: 12 }}>
          STATUS
        </text>
        <text fg={colors.textDim} style={{ width: 6 }}>
          SRC
        </text>
      </box>

      {/* Favorites list */}
      {favorites.length === 0 ? (
        <box style={{ padding: 1 }}>
          <text fg={colors.textDim}>
            No favorites yet. Browse the Discover tab to find and favorite skills.
          </text>
        </box>
      ) : (
        <scrollbox
          focused={state.activeView === "favorites" && !state.showHelp}
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
          {favorites.map((skill, i) => (
            <FavoriteListItem
              key={skill.id ?? `${skill.slug}-${i}`}
              skill={skill}
              selected={i === selectedIndex}
              isInstalled={installedNames.has(skill.name?.toLowerCase() ?? "")}
            />
          ))}
        </scrollbox>
      )}
    </box>
  )
}

// ---------- List item component ----------

interface FavoriteListItemProps {
  skill: CatalogSkill
  selected: boolean
  isInstalled: boolean
}

function FavoriteListItem({ skill, selected, isInstalled }: FavoriteListItemProps) {
  const description = (skill.summary || skill.description || "").slice(0, 50)
  const sourceLabel = skill.githubUrl ? "gh" : "sg"

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
      <text fg={isInstalled ? colors.success : colors.textDim} style={{ width: 12 }}>
        {isInstalled ? "installed" : ""}
      </text>
      <text fg={colors.secondary} style={{ width: 6 }}>
        [{sourceLabel}]
      </text>
    </box>
  )
}

// ---------- Helpers ----------

function catalogSkillToEnriched(
  skill: CatalogSkill,
  installedNames: Set<string>
): EnrichedSkill {
  return {
    name: skill.name,
    description: skill.summary || skill.description || "",
    filePath: "",
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
