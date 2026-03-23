import { useState, useMemo, useEffect } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useFavorites } from "../data/use-favorites.js"
import { useSkillActions } from "../data/use-skill-actions.js"
import { ConfirmDialog } from "../components/confirm-dialog.js"
import { colors } from "../utils/colors.js"
import type { CatalogSkill } from "../data/api-client.js"
import type { EnrichedSkill } from "../store/types.js"

/**
 * Favorites view: two-column layout.
 * LEFT  - Favorites list (40%)
 * RIGHT - Selected favorite detail (flexGrow)
 *
 * Requires authentication. Shows a prompt to login if not authenticated.
 */
export function FavoritesView() {
  const state = useStore()
  const dispatch = useDispatch()
  const { favorites, loading, error, toggle } = useFavorites()
  const { installSkill } = useSkillActions()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [installTarget, setInstallTarget] = useState<CatalogSkill | null>(null)
  const [previewSkill, setPreviewSkill] = useState<CatalogSkill | null>(null)

  // Build a set of installed skill names for the "installed" badge
  const installedNames = useMemo(() => {
    return new Set(state.installedSkills.map((s) => s.name.toLowerCase()))
  }, [state.installedSkills])

  // Update preview when selection changes
  useEffect(() => {
    if (favorites[selectedIndex]) {
      setPreviewSkill(favorites[selectedIndex])
    } else {
      setPreviewSkill(null)
    }
  }, [selectedIndex, favorites])

  // Keyboard navigation for the favorites list
  useKeyboard((key) => {
    if (state.activeView !== "favorites") return
    if (state.showHelp) return
    if (!state.auth) return // No navigation when not logged in
    if (installTarget) return // Block navigation during confirm dialog

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

    // Enter to view full detail
    if (key.name === "v" && favorites[selectedIndex]) {
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

    // i to install
    if (key.name === "i" && favorites[selectedIndex]) {
      setInstallTarget(favorites[selectedIndex])
      return
    }
  })

  // Confirm dialog for install
  if (installTarget) {
    return (
      <ConfirmDialog
        message={`Install "${installTarget.name}"?`}
        onConfirm={async () => {
          const skill = catalogSkillToEnriched(installTarget, installedNames)
          setInstallTarget(null)
          await installSkill(skill)
        }}
        onCancel={() => setInstallTarget(null)}
      />
    )
  }

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

      {/* Two-column content: list | detail */}
      <box style={{ flexDirection: "row", flexGrow: 1, width: "100%" }}>
        {/* LEFT: Favorites list */}
        <box
          style={{
            width: "40%",
            borderRight: true,
            borderColor: colors.border,
            flexDirection: "column",
          }}
        >
          {/* List header */}
          <box style={{ height: 1, paddingLeft: 1, backgroundColor: colors.bgAlt }}>
            <text fg={colors.textDim}>FAVORITES</text>
          </box>

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
              {favorites.map((skill, i) => {
                const isInstalled = installedNames.has(skill.name?.toLowerCase() ?? "")
                return (
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
                    {isInstalled ? (
                      <text fg={colors.success}> *</text>
                    ) : null}
                  </box>
                )
              })}
            </scrollbox>
          )}
        </box>

        {/* RIGHT: Detail panel */}
        <box style={{ flexGrow: 1, flexDirection: "column" }}>
          {previewSkill ? (
            <FavoriteDetailPanel
              skill={previewSkill}
              isInstalled={installedNames.has(previewSkill.name?.toLowerCase() ?? "")}
            />
          ) : (
            <box style={{ padding: 1 }}>
              <text fg={colors.textDim}>Select a favorite to view details</text>
            </box>
          )}
        </box>
      </box>
    </box>
  )
}

// ---------- Inline Detail Panel ----------

interface FavoriteDetailPanelProps {
  skill: CatalogSkill
  isInstalled: boolean
}

function FavoriteDetailPanel({ skill, isInstalled }: FavoriteDetailPanelProps) {
  const description = skill.summary || skill.description || ""
  const categories = skill.categories?.join(", ") ?? ""
  const sourceLabel = skill.githubUrl ? "github" : "skillsgate"

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

        {/* Status */}
        {isInstalled ? (
          <text fg={colors.success}>Installed</text>
        ) : (
          <text fg={colors.textDim}>Not installed</text>
        )}
        <text>{" "}</text>

        {/* Description */}
        <text fg={colors.text}>{description}</text>
        <text>{" "}</text>

        {/* Source */}
        <box style={{ flexDirection: "row", height: 1 }}>
          <text fg={colors.textDim}>Source: </text>
          <text fg={colors.secondary}>{sourceLabel}</text>
        </box>

        {/* Categories */}
        {categories ? (
          <box style={{ flexDirection: "row", height: 1 }}>
            <text fg={colors.textDim}>Categories: </text>
            <text fg={colors.secondary}>{categories}</text>
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
        <text fg={colors.textDim}>Enter=full detail  x=unfavorite  i=install</text>
      </box>
    </scrollbox>
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
