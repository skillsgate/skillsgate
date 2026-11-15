// Every `sh` script the mod runs on a machine, as strings.
//
// Scripts are POSIX `sh`. Only registry expressions (tool folders) are written
// into script text; anything that comes from a person or a machine travels as
// a positional argument.

// Quote a registry expression for the script text. Registry values are plain
// `sh` expressions such as "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills", so they
// go inside double quotes and expand on the machine.
const expr = (value) => `"${value}"`;

// The scan script. It prints records ended by \x1e with fields separated by
// \x1f (see `parseScan` in model.js):
//   H  home (real path), git (1 or 0)
//   T  tool name, skills folder, detected (1 or 0); one per tool, registry order
//   S  tool name, entry path, real path, link (1 or 0), SKILL.md frontmatter
export function scanScript(tools) {
  const calls = tools
    .map((tool) => ["scan_tool", tool.name, expr(tool.dir), ...tool.detect.map(expr)].join(" "))
    .join("\n");
  return `HOME=$(cd -P -- "$HOME" && pwd -P) || { printf 'Home folder not found\\n' >&2; exit 1; }
export HOME
PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"

# emit_entry <tool> <entry path> <link 1|0>: one S record for a folder holding SKILL.md
emit_entry() {
  real=$(cd -P -- "$2" && pwd -P) || return 0
  head=$(awk '
    NR == 1 && $0 !~ /^---[ \\r]*$/ { exit }
    { line = $0; gsub(/[\\036\\037]/, "", line); print line }
    NR > 1 && $0 ~ /^---[ \\r]*$/ { exit }
    NR >= 80 { exit }
  ' "$real/SKILL.md" 2>/dev/null)
  printf 'S\\037%s\\037%s\\037%s\\037%s\\037%s\\036' "$1" "$2" "$real" "$3" "$head"
}

# scan_tool <name> <skills folder> <detect folder>...
scan_tool() {
  tool=$1
  dir=$2
  shift 2
  if [ -d "$dir" ]; then dir=$(cd -P -- "$dir" && pwd -P); fi
  found=0
  for probe in "$@"; do
    if [ -d "$probe" ]; then found=1; fi
  done
  printf 'T\\037%s\\037%s\\037%s\\036' "$tool" "$dir" "$found"
  [ -d "$dir" ] || return 0
  for entry in "$dir"/*; do
    [ -d "$entry" ] || continue
    link=0
    if [ -L "$entry" ]; then link=1; fi
    if [ -f "$entry/SKILL.md" ]; then
      emit_entry "$tool" "$entry" "$link"
      continue
    fi
    # No SKILL.md: a grouping folder, listed one level down.
    for child in "$entry"/*; do
      [ -d "$child" ] && [ -f "$child/SKILL.md" ] || continue
      link=0
      if [ -L "$child" ]; then link=1; fi
      emit_entry "$tool" "$child" "$link"
    done
  done
}

git=0
if command -v git >/dev/null 2>&1; then git=1; fi
printf 'H\\037%s\\037%s\\036' "$HOME" "$git"
${calls}
`;
}
