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

// REMOVE <real path> <base folder, or -> <entry path>...
// The second argument is an absolute base folder, or the single character `-`,
// which means "no base folder". Anything else (empty, relative, any other
// text) is refused with exit 2 before anything is changed, so the script never
// depends on how a transport treats an empty argument.
// Checks first, then removes the entry links, then the folder itself.
//   - Checks (only when a base folder is given): the base folder is its own
//     real path (never a symlink); the path is a real folder, not a link,
//     strictly inside the base folder, and holds SKILL.md. Otherwise exit 4 and
//     nothing is changed.
//   - Entry links: each is removed only if it is a symlink that resolves to the
//     real path. Anything else is left alone.
//   - The folder: removed with rm -rf, only when a base folder was given, so
//     only after the checks above passed. With `-` (a skill that lives outside
//     every tool folder) only the entry links go.
// Exit: 0 done; 2 bad arguments; 4 changed on disk.
export const REMOVE = String.raw`unset CDPATH
bad() { printf 'Bad arguments\n' >&2; exit 2; }
changed() { printf 'Changed on disk\n' >&2; exit 4; }
[ "$#" -ge 2 ] || bad
target=$1
base=$2
shift 2
case "$target" in /?*) ;; *) bad ;; esac
case "$base" in -|/?*) ;; *) bad ;; esac
if [ "$base" != - ]; then
  [ ! -L "$target" ] || changed
  real=$(cd -P -- "$target" 2>/dev/null && pwd -P) || changed
  [ "$real" = "$target" ] || changed
  root=$(cd -P -- "$base" 2>/dev/null && pwd -P) || changed
  [ "$root" = "$base" ] || changed
  case "$real" in "$root"/?*) ;; *) changed ;; esac
  [ -f "$target/SKILL.md" ] || changed
fi
for entry in "$@"; do
  [ -L "$entry" ] || continue
  linked=$(cd -P -- "$entry" 2>/dev/null && pwd -P) || continue
  [ "$linked" = "$target" ] || continue
  rm -f -- "$entry" || exit 1
done
if [ "$base" != - ]; then
  rm -rf -- "$target" || exit 1
fi
exit 0
`;

// INSTALL <clone URL> <skill id> <store folder> <folder name>
// Clones the repository into a temp folder, finds the skill, and copies it to
// `<store>/<folder name>`, replacing a folder that is already there. Prints the
// installed folder.
// Every value is checked before anything is touched; a bad one exits 64:
//   - the URL starts with https:// or file:/// (never an option or a git
//     transport such as ext::);
//   - the skill id holds only letters, digits, ".", "_" and "-", and does not
//     start with "." or "-";
//   - the store is an absolute path;
//   - the folder name is not empty, ".", "..", does not contain "/" and does not
//     start with "." or "-". So `rm -rf` below can only reach a direct child of
//     the store.
// Where the skill is looked for, first match wins: skills/<id>,
// skills/.curated/<id>, skills/.experimental/<id>, <id>, then any
// <dir>/<id>/SKILL.md, then any SKILL.md whose frontmatter has `name: <id>`,
// and last the repo root (a single-skill repository). Every route resolves the
// folder with pwd -P and requires the clone's real root or a real path inside
// it (a path with a newline in it, or ending in "." or "..", is refused) before
// it reads or copies anything. A SKILL.md counts only as a regular file, never
// as a symlink. A repository's symlinks are never followed or installed: if the
// copy holds any, the install stops with exit 7. The skill folder itself may be
// a link to a folder inside the clone; it is resolved and copied by content.
// The copy is made in `<store>/.skillsgate-new.<folder name>`, checked, and only
// then does it replace `<dest>`. That name is hidden (a scan skips it) and no
// valid folder name starts with ".", so it never equals a real skill's folder.
// A stale one left by a killed run is removed before the copy. A failure
// anywhere removes the staging folder and the temp folder and leaves `<dest>`
// as it was.
// Exit: 0 installed; 1 failed; 64 bad arguments; 127 no git; 2 the clone
// failed; 5 the skill is not in the repository; 7 the skill holds symbolic links.
//
// `rm -rf` runs only on: the temp folder this script made with mktemp -d (its
// name is checked); `<store>/.skillsgate-new.<folder>` and the `.git` inside
// it; and `<store>/<folder>`, once the folder name has passed the checks above.
// A symlink at `<dest>` is removed with `rm -f`, never followed.
export const INSTALL = String.raw`unset CDPATH
PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
export PATH
GIT_TERMINAL_PROMPT=0
GIT_ALLOW_PROTOCOL=https:file
export GIT_TERMINAL_PROMPT GIT_ALLOW_PROTOCOL
bad() { printf 'Bad arguments\n' >&2; exit 64; }
[ "$#" -ge 4 ] || bad
url=$1
id=$2
store=$3
folder=$4
case "$url" in https://?*|file:///?*) ;; *) bad ;; esac
case "$id" in ""|.*|-*|*[!A-Za-z0-9._-]*) bad ;; esac
case "$store" in /?*) ;; *) bad ;; esac
case "$folder" in ""|.|..|.*|-*|*/*) bad ;; esac
command -v git >/dev/null 2>&1 || { printf 'git is not installed\n' >&2; exit 127; }

tmp=
staged=
cleanup() {
  case "$tmp" in */skillsgate-herdr.??????) rm -rf -- "$tmp" ;; esac
  case "$staged" in /?*/.skillsgate-new.?*) rm -rf -- "$staged" ;; esac
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

tmpbase=$TMPDIR
case "$tmpbase" in /?*) ;; *) tmpbase=/tmp ;; esac
tmp=$(mktemp -d "$tmpbase/skillsgate-herdr.XXXXXX") || exit 1
repo="$tmp/repo"
if ! git clone -q --depth 1 -- "$url" "$repo" >/dev/null 2>&1; then
  printf 'Could not download\n' >&2
  exit 2
fi
root=$(cd -P -- "$repo" && pwd -P) || exit 1

LF='
'
# inside <dir>: sets here to the real path of <dir>, and succeeds only when that
# is the clone's real root or a real path inside it. Command substitution drops
# trailing newlines, so the path is first printed with a sentinel after it: a
# path that holds a newline anywhere (even a folder really named "..<newline>")
# is refused, and so is one that ends in "." or "..".
inside() {
  probe=$(cd -P -- "$1" 2>/dev/null && pwd -P && printf x) || return 1
  case "$probe" in *"$LF"*"$LF"*) return 1 ;; esac
  here=$(cd -P -- "$1" 2>/dev/null && pwd -P) || return 1
  case "$here" in */.|*/..) return 1 ;; esac
  case "$here" in "$root"|"$root"/*) return 0 ;; esac
  return 1
}
# regular <file>: a regular file that is not a symlink.
regular() {
  [ -f "$1" ] && [ ! -L "$1" ]
}
# try <dir>: sets src when <dir> is inside the clone and holds a regular SKILL.md.
try() {
  inside "$1" || return 1
  regular "$here/SKILL.md" || return 1
  src=$here
  return 0
}

src=
for cand in "$root/skills/$id" "$root/skills/.curated/$id" "$root/skills/.experimental/$id" "$root/$id"; do
  if try "$cand"; then break; fi
done
# Every SKILL.md in the clone, one path per line. A folder name that holds a
# newline splits one path into several lines, so only lines of the form
# ./<dir>/SKILL.md are used, and each is checked by inside as well.
(cd -- "$root" && find . -path ./.git -prune -o -type f -name SKILL.md -print | sort) > "$tmp/list" || exit 1
if [ -z "$src" ]; then
  while IFS= read -r f; do
    case "$f" in ./*/"$id"/SKILL.md) ;; *) continue ;; esac
    if try "$root/$(dirname -- "$f")"; then break; fi
  done < "$tmp/list"
fi
if [ -z "$src" ]; then
  while IFS= read -r f; do
    case "$f" in ./*/SKILL.md) ;; *) continue ;; esac
    inside "$root/$(dirname -- "$f")" || continue
    regular "$here/SKILL.md" || continue
    if SG_ID="$id" awk '
      BEGIN { sq = sprintf("%c", 39) }
      NR == 1 && $0 !~ /^---[ \r]*$/ { exit }
      NR > 1 && $0 ~ /^---[ \r]*$/ { exit }
      NR > 1 && $0 ~ /^name:/ {
        v = $0
        sub(/^name:[ \t]*/, "", v)
        sub(/[ \t\r]*$/, "", v)
        q = substr(v, 1, 1)
        if (length(v) >= 2 && (q == "\"" || q == sq) && substr(v, length(v), 1) == q) v = substr(v, 2, length(v) - 2)
        if (v == ENVIRON["SG_ID"]) ok = 1
        exit
      }
      NR >= 80 { exit }
      END { exit ok ? 0 : 1 }
    ' "$here/SKILL.md" 2>/dev/null; then
      src=$here
      break
    fi
  done < "$tmp/list"
fi
# The repo root is the last resort, for a repository that is a single skill.
if [ -z "$src" ]; then try "$root" || :; fi
if [ -z "$src" ]; then
  printf 'Skill not found\n' >&2
  exit 5
fi

mkdir -p -- "$store" || exit 1
realstore=$(cd -P -- "$store" && pwd -P) || exit 1
case "$realstore" in /?*) ;; *) bad ;; esac
dest="$realstore/$folder"
new="$realstore/.skillsgate-new.$folder"
if [ -e "$new" ] || [ -L "$new" ]; then rm -rf -- "$new" || exit 1; fi
mkdir -- "$new" || exit 1
staged=$new
cp -R -- "$src"/. "$new"/ || exit 1
rm -rf -- "$new/.git"
regular "$new/SKILL.md" || { printf 'The copy has no SKILL.md\n' >&2; exit 1; }
# A repository's symbolic links are never installed.
if [ -n "$(find "$new" -type l -print | head -n 1)" ]; then
  printf 'The skill contains symbolic links\n' >&2
  exit 7
fi
if [ -L "$dest" ]; then
  rm -f -- "$dest" || exit 1
elif [ -e "$dest" ]; then
  rm -rf -- "$dest" || exit 1
fi
mv -- "$new" "$dest" || exit 1
staged=
printf '%s\n' "$dest"
exit 0
`;

// WRITE <path> <text> <new|replace>
// Writes the text to a temp file in the target's own folder, then moves it over
// the target, so a reader sees the old file or the new one, never half of it.
// The temp file is made with a plain redirect, so its mode follows the umask.
// Makes the parent folder.
// The third argument says what the caller believes about the target: `new`
// means it is absent, and the script refuses (exit 3) when something is there,
// so a file that appeared since the caller looked is never replaced; `replace`
// means the caller read the current text.
// Exit: 0 written; 1 failed; 2 bad arguments (a relative path, a path ending in
// "/", empty text, or a third argument other than new or replace); 3 `new`
// and the target exists.
// `rm -f` runs only on the temp file this script named itself.
export const WRITE = String.raw`unset CDPATH
bad() { printf 'Bad arguments\n' >&2; exit 2; }
[ "$#" -ge 3 ] || bad
path=$1
text=$2
mode=$3
case "$path" in /?*) ;; *) bad ;; esac
case "$path" in */) bad ;; esac
[ -n "$text" ] || bad
case "$mode" in new|replace) ;; *) bad ;; esac
dir=$(dirname -- "$path")
mkdir -p -- "$dir" || exit 1
tmp=
cleanup() {
  case "$tmp" in /?*.skillsgate-tmp.*) rm -f -- "$tmp" ;; esac
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
if [ "$mode" = new ] && { [ -e "$path" ] || [ -L "$path" ]; }; then
  printf 'The file already exists\n' >&2
  exit 3
fi
tmp="$path.skillsgate-tmp.$$"
rm -f -- "$tmp" || exit 1
printf '%s' "$text" > "$tmp" || exit 1
mv -- "$tmp" "$path" || exit 1
tmp=
exit 0
`;
