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

// The scripts below take every value as a positional argument and never build a
// path from text in the script itself. They are written with String.raw so the
// shell sees them exactly as written (keep `${` out of them).

// LINK <tool folder> <folder name> <link target>
// Makes `<tool folder>/<folder name>` a symlink to `<link target>` (resolved
// from the tool folder) and checks that it leads to a folder holding SKILL.md.
// Exit: 0 linked; 2 bad arguments; 3 a real file or folder already has the
// name, left alone; 5 the new link does not lead to a skill, so it is removed.
export const LINK = String.raw`dir=$1
name=$2
target=$3
bad() { printf 'Bad arguments\n' >&2; exit 2; }
case "$dir" in /?*) ;; *) bad ;; esac
case "$name" in ""|.|..|*/*) bad ;; esac
[ -n "$target" ] || bad
mkdir -p -- "$dir" || exit 1
dest="$dir/$name"
if [ -L "$dest" ]; then
  rm -f -- "$dest" || exit 1
elif [ -e "$dest" ]; then
  printf 'A real file or folder is already there\n' >&2
  exit 3
fi
ln -s -- "$target" "$dest" || exit 1
if [ ! -f "$dest/SKILL.md" ]; then
  if [ -L "$dest" ]; then rm -f -- "$dest"; fi
  printf 'The new link does not lead to a skill\n' >&2
  exit 5
fi
exit 0
`;

// UNLINK <entry path> <expected real path>
// Removes the entry only when it is a symlink that resolves to the expected
// folder. Exit: 0 removed, or nothing there; 2 bad arguments; 3 the entry is a
// real folder, a dangling link or a link to somewhere else, left alone.
export const UNLINK = String.raw`unset CDPATH
entry=$1
expected=$2
bad() { printf 'Bad arguments\n' >&2; exit 2; }
case "$entry" in /?*) ;; *) bad ;; esac
case "$expected" in /?*) ;; *) bad ;; esac
if [ -L "$entry" ]; then
  now=$(cd -P -- "$entry" 2>/dev/null && pwd -P) || exit 3
  [ "$now" = "$expected" ] || exit 3
  rm -f -- "$entry" || exit 1
  exit 0
fi
if [ -e "$entry" ]; then exit 3; fi
exit 0
`;

// REMOVE <real path> <base folder or empty> <entry path>...
// Checks first, then removes the entry links, then the folder itself.
//   - Checks (only when a base folder is given): the path is a real folder, not
//     a link, strictly inside the base folder, and holds SKILL.md. Otherwise
//     exit 4 and nothing is changed.
//   - Entry links: each is removed only if it is a symlink that resolves to the
//     real path. Anything else is left alone.
//   - The folder: removed with rm -rf, only when a base folder was given, so
//     only after the checks above passed. With no base folder (a skill that
//     lives outside every tool folder) only the entry links go.
// Exit: 0 done; 2 bad arguments; 4 changed on disk.
export const REMOVE = String.raw`unset CDPATH
bad() { printf 'Bad arguments\n' >&2; exit 2; }
changed() { printf 'Changed on disk\n' >&2; exit 4; }
[ "$#" -ge 2 ] || bad
target=$1
base=$2
shift 2
case "$target" in /?*) ;; *) bad ;; esac
case "$base" in ""|/?*) ;; *) bad ;; esac
if [ -n "$base" ]; then
  [ ! -L "$target" ] || changed
  real=$(cd -P -- "$target" 2>/dev/null && pwd -P) || changed
  [ "$real" = "$target" ] || changed
  root=$(cd -P -- "$base" 2>/dev/null && pwd -P) || changed
  case "$real" in "$root"/?*) ;; *) changed ;; esac
  [ -f "$target/SKILL.md" ] || changed
fi
for entry in "$@"; do
  [ -L "$entry" ] || continue
  linked=$(cd -P -- "$entry" 2>/dev/null && pwd -P) || continue
  [ "$linked" = "$target" ] || continue
  rm -f -- "$entry" || exit 1
done
if [ -n "$base" ]; then
  rm -rf -- "$target" || exit 1
fi
exit 0
`;
