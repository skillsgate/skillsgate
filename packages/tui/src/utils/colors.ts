export const colors = {
  primary: "#00BFFF",    // cyan - skill names, highlights
  secondary: "#888888",  // dim gray - descriptions, secondary text
  success: "#00FF00",    // green - success messages
  error: "#FF4444",      // red - errors
  warning: "#FFAA00",    // amber - warnings
  agent: "#FF00FF",      // magenta - agent badges (fallback)
  bg: "#1a1a1a",         // dark background
  bgAlt: "#2a2a2a",      // slightly lighter background
  border: "#444444",     // border color
  text: "#FFFFFF",       // primary text
  textDim: "#888888",    // dimmed text
  header: "#1e1e2e",     // header background
  statusBar: "#1e1e2e",  // status bar background
  tabActive: "#334455",  // active tab background
  tabText: "#FFFF00",    // active tab text (yellow)
} as const

/**
 * Compact single/two-letter agent badge with a unique color per agent.
 * Used in list items and detail views for a tighter layout than full names.
 */
export const agentBadges: Record<string, { label: string; color: string }> = {
  "claude-code":    { label: "C",  color: "#FFAA00" }, // amber
  antigravity:      { label: "AG", color: "#4285F4" }, // blue
  cursor:           { label: "Cu", color: "#5599FF" }, // blue
  codebuddy:        { label: "CB", color: "#0052D9" }, // deep blue
  "codebuddy-cn":   { label: "CBN", color: "#165DFF" }, // bright blue
  windsurf:         { label: "W",  color: "#00CED1" }, // cyan
  "codex-cli":      { label: "Cx", color: "#FF4444" }, // red
  "droid-cli":      { label: "Dr", color: "#22D3EE" }, // cyan
  "ob-1":          { label: "OB", color: "#12B3DF" }, // openblock cyan
  opencode:         { label: "O",  color: "#2ECCAA" }, // teal
  zed:              { label: "Z",  color: "#FFFF00" }, // yellow
  "github-copilot": { label: "Gh", color: "#8B5CF6" }, // purple
  cline:            { label: "Cl", color: "#F472B6" }, // pink
  continue:         { label: "Cn", color: "#34D399" }, // emerald
  amp:              { label: "A",  color: "#F97316" }, // orange
  goose:            { label: "G",  color: "#A3E635" }, // lime
  junie:            { label: "J",  color: "#E879F9" }, // fuchsia
  "kilo-code":      { label: "K",  color: "#67E8F9" }, // light cyan
  openclaw:         { label: "Oc", color: "#FB923C" }, // light orange
  "pear-ai":        { label: "P",  color: "#86EFAC" }, // light green
  pi:               { label: "PI", color: "#8B5CF6" }, // violet
  "roo-code":       { label: "R",  color: "#FCA5A5" }, // light red
  trae:             { label: "T",  color: "#C4B5FD" }, // lavender
  "trae-cn":        { label: "TCN", color: "#0284C7" }, // sky blue
  workbuddy:        { label: "WB", color: "#07C160" }, // green
  "workbuddy-ai":   { label: "WBA", color: "#10B981" }, // emerald
  mercury:          { label: "MC", color: "#64748B" }, // slate
  universal:        { label: "U",  color: "#888888" }, // dim
}
