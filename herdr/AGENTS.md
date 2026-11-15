# Rules for the Herdr folder

This folder holds SkillsGate for Herdr, a mod for the Herdr desktop app. The share folder `herdr/skillsgate/` is what Herdr's gallery lists: `README.md`, `RECIPE.md`, `preview.png` and `mods/skillsgate/`. These rules apply to anyone editing it, person or agent.

## Views and logic

`mods/skillsgate/main.js` has a header comment that lists every file and what it owns. Keep it true.

- **Views** draw with Herdr's UI kit and may import `herdr`, `gpui-kit` and `gpui-base`: `main.js`, `host.js`, `ui.js`, `toggle.js`, `panel.js`, `installed-tab.js`, `discover-tab.js`, `machines-tab.js`, `skill-dialog.js`, `catalog-dialog.js`. `host.js` and `ui.js` import no view.
- **Logic** never imports Herdr: `registry.js`, `scripts.js`, `model.js`, `view-model.js`, `machine.js`, `catalog.js`, `channel.js`, `requests.js`. Herdr's functions come in as arguments (built in `host.js`), so `node --test` covers them. Logic imports only logic.
- `herdr/tests/package.test.mjs` enforces this and requires every `.js` file in the mod folder to be listed as logic or a view. A new file goes into one of the two lists there and, for a view, gets its own file.
- Put a decision about what a view shows in `view-model.js` with a test. Keep a file under about 500 lines.
- The tool registry (`registry.js`) is a copy of the desktop app's; a test compares it with `apps/desktop/src/main/ipc-handlers.ts`. Change both together.
- Every shared key starts with `skillsgate.` and ends with `.v1`. The mod is called `skillsgate` and the layout nodes `skillsgate-toggle` and `skillsgate-panel`.
- No comment may name another product that does what SkillsGate does.

## Scripts that run on a machine

- Every read or write on a machine goes through `exec("sh", ["-c", script, "skillsgate", ...args], { on, timeout })` or `readTextFile(path, { on })`. Never `writeTextFile`, `fs/promises` or `watchFolder`: they work on this computer only.
- Scripts are POSIX `sh`, in `scripts.js`. Allowed external programs: `mkdir`, `ln`, `rm`, `cp`, `mv`, `find`, `awk`, `sed`, `sort`, `head`, `dirname`, `mktemp`, `grep` and `git`. Shell builtins and parameter expansion (`${x##*/}`) are fine. No `realpath`, `readlink`, `jq`, `node`, `basename`, `tr`, `cat`, `xargs`, `ls`, `echo` or bash syntax. A real path is `$(cd -P -- "$dir" && pwd -P)`.
- Values that come from a machine, the catalog or the person are passed as positional arguments (`$1`...). Only registry expressions are written into script text.
- Scripts that run `git` first append `/opt/homebrew/bin:/usr/local/bin` to `PATH` and set `GIT_TERMINAL_PROMPT=0`.
- `rm -rf` runs only on: a skill folder the same script has just verified (a real folder, inside the base folder passed with it, holding `SKILL.md`); a folder the script made with `mktemp -d`, named `skillsgate-herdr.*`; and an install's own folders, `<store>/.skillsgate-new.<folder>` and `<store>/<folder>`. `REMOVE`'s second argument is an absolute base folder that equals its own real path, or `-` (links only, never `rm -rf`); anything else is refused before anything changes. An install folder that is empty, `.` or `..`, contains `/`, or starts with `.` or `-` is refused in JavaScript and again in `INSTALL`.
- A repository's symbolic links are never followed or installed.
- Timeouts: 30,000 ms for a scan and for each small operation, 120,000 ms for an install.

## Tests

- Run `npm run test:herdr` from the repository root.
- The scripts also have to pass under a Linux `sh` (dash) and `awk` (mawk), and the install tests need `git`. Run the suite in a Linux container with `git` installed:

  ```sh
  docker run --rm -v "$PWD":/w:ro -w /w node:22-bookworm-slim sh -c "apt-get update -qq && apt-get install -y -qq git && node --test herdr/tests/*.test.mjs"
  ```

- Tests write only into temporary homes (`herdr/tests/helpers.mjs` makes them). No test and no command you run while working may write to the real `~/.agents`, a real tool folder, the real `~/.agents/.skill-lock.json`, or a real remote machine.
- For a UI change run `npm run herdr:dev`: it copies the mod to `~/.config/herdr-app/mods/skillsgate` and runs `herdr-app check` on it. `herdr-app check` renders the panel once. It cannot see the toggle, a dialog or any keyboard path, so look at those in the window. To try a change against fixture skills instead of your own, point the `exec` adapter in `host.js` at a scratch home with a temporary line marked `TEMP`, and remove it before you commit (`grep -rn TEMP herdr/skillsgate/mods/skillsgate/` must print nothing).

## Herdr's runtime

- Never keep a `cx` past its callback. Never call `setShared`, `notify` or `cx.notify()` during `render`: start that work with `cx.spawn` and `await cx.sleep(0)` first. Never pass `null` to `.child`; use `.when(Boolean(x), ...)`. No `setTimeout`; use `cx.timer` and `cx.sleep`.
- Herdr's JavaScript runtime has no `TextEncoder`, no `structuredClone` and no `Intl`; `localeCompare` ignores its options and `toLocaleString` does not group digits. `node --test` cannot catch this. Sort with explicit lower-casing and format numbers by hand.
- Inside a mod, `settings().ui_font_size` is the size at zoom 1. Use it as it is.
- A field of a view class must not share a method's name (a field assigned in `init` hides the method); a test checks it.
- The floor is Herdr 0.1.15 (`exec` takes `timeout`).

## Keep the recipe true

`herdr/skillsgate/RECIPE.md` is the brief another agent builds the mod from, and `herdr/skillsgate/README.md` is what a person reads first. When a change alters what the person sees, what the mod runs, reaches or writes, a size, a text, a timing or a limit, change both documents in the same commit. `preview.png` is a screenshot of the Installed tab with fixture skills only: take it again from a scratch home when the panel's look changes, and make sure it shows nothing of your own.
