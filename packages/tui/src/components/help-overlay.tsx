import { colors } from "../utils/colors.js"

interface ShortcutEntry {
  key: string
  description: string
}

const SHORTCUTS_LEFT: ShortcutEntry[] = [
  { key: "j/k", description: "Navigate list up/down" },
  { key: "g", description: "Jump to first item" },
  { key: "G", description: "Jump to last item" },
  { key: "Enter", description: "Open skill detail" },
  { key: "/", description: "Focus search input" },
  { key: "Tab", description: "Cycle focus: agents > search > list" },
  { key: "Esc", description: "Clear search / go back" },
]

const SHORTCUTS_RIGHT: ShortcutEntry[] = [
  { key: "1/2/3", description: "Switch tabs" },
  { key: "r", description: "Refresh installed skills" },
  { key: "l", description: "Login / auth status" },
  { key: "i", description: "Install selected skill" },
  { key: "d", description: "Remove selected skill" },
  { key: "x", description: "Unfavorite (favorites view)" },
  { key: "?", description: "Toggle this help" },
  { key: "Ctrl+Q", description: "Quit" },
  { key: "", description: "" },
  { key: "-- Detail View --", description: "" },
  { key: "q/Esc", description: "Go back" },
  { key: "o", description: "Open source URL" },
]

const KEY_COL_WIDTH = 18
const DESC_COL_WIDTH = 34

function formatShortcutLine(entry: ShortcutEntry): string {
  if (!entry.key && !entry.description) return ""
  if (entry.key.startsWith("--")) {
    return entry.key
  }
  const keyPadded = entry.key.padEnd(KEY_COL_WIDTH)
  return `${keyPadded}${entry.description}`
}

export function HelpOverlay() {
  const maxRows = Math.max(SHORTCUTS_LEFT.length, SHORTCUTS_RIGHT.length)
  const lines: string[] = []

  // Title
  lines.push("")
  lines.push("  Keyboard Shortcuts")
  lines.push("  " + "-".repeat(KEY_COL_WIDTH + DESC_COL_WIDTH + 4 + KEY_COL_WIDTH + DESC_COL_WIDTH))
  lines.push("")

  for (let i = 0; i < maxRows; i++) {
    const left = SHORTCUTS_LEFT[i]
    const right = SHORTCUTS_RIGHT[i]

    const leftStr = left ? formatShortcutLine(left) : ""
    const rightStr = right ? formatShortcutLine(right) : ""

    const leftPadded = leftStr.padEnd(KEY_COL_WIDTH + DESC_COL_WIDTH + 2)
    lines.push(`  ${leftPadded}  ${rightStr}`)
  }

  lines.push("")
  lines.push("  Press ? or Esc to close")
  lines.push("")

  return (
    <box
      style={{
        width: "100%",
        flexGrow: 1,
        backgroundColor: "#1a1a2e",
        border: true,
        borderColor: colors.primary,
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
      }}
      title="Help"
    >
      {lines.map((line, i) => (
        <text key={i} fg={line.includes("--") && !line.includes("Keyboard") ? colors.primary : colors.text}>
          {line}
        </text>
      ))}
    </box>
  )
}
