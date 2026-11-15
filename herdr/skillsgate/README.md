# SkillsGate for Herdr

A mod for [Herdr](https://herdr.dev), the desktop app for coding agents. A mod is a small add-on that Herdr loads from a folder in `~/.config/herdr-app/mods/`. This one adds a SkillsGate button to Herdr's tab bar and a panel beside your work area that manages your AI coding-agent skills.

A skill is a folder with a `SKILL.md` file of instructions for a coding agent. SkillsGate keeps each skill once, in `~/.agents/skills`, and links it into the skills folder of each coding tool that should use it.

![SkillsGate](preview.png)

The panel has three tabs:

- **Installed** lists the skills on the machine you are viewing, filtered by name or by tool. Open one to read its `SKILL.md`, switch it on or off for each tool, or delete it.
- **Discover** searches the public [skills.sh](https://skills.sh) catalog and installs a skill from GitHub into the tools you pick.
- **Machines** lists this computer and every machine Herdr reaches over SSH. The panel follows the machine of the space you are looking at, or you can pick one.

Every change acts only on the machine being viewed. A skill installed here also appears in the SkillsGate desktop app, with its source.

## What it needs

- Herdr 0.1.15 or later.
- `git` on a machine, to install skills there. Without it the panel still lists and manages skills, and says that installs are off.
- macOS or Linux machines. Windows machines are not supported.

## Install

Paste this into an agent in Herdr:

```text
Read ~/.config/herdr-app/AGENTS.md, then add this mod from https://github.com/skillsgate/skillsgate/tree/main/herdr/skillsgate. Follow its RECIPE.md: add only the SkillsGate toggle and panel to my current layout and keep everything else as it is. Reuse existing SkillsGate nodes instead of duplicating them.
```

The agent reads [`RECIPE.md`](RECIPE.md) and every file before it adds anything, and it should tell you what the mod touches (below). It copies the mod to `~/.config/herdr-app/mods/skillsgate` and adds two nodes to your layout, `skillsgate-toggle` and `skillsgate-panel`. A layout is the JSON file in `~/.config/herdr-app/layouts/` that says how Herdr's window is arranged, as a tree of nodes (rows, columns and blocks); a mod appears in the window as a block node.

## What it touches

- **It runs programs.** It runs short `sh` scripts on the machine you are viewing, which use `awk`, `cp`, `dirname`, `find`, `ln`, `mkdir`, `mktemp`, `mv`, `rm` and `sort`, and `git` for installs.
- **It reaches the network.** It calls `skills.sh` to search and `raw.githubusercontent.com` to preview a skill, from your computer. An install runs `git clone` from `github.com` over https on the machine being viewed (over ssh only when that machine's own git configuration rewrites the address).
- **It reads and writes outside its own folder.** It reads every coding tool's skills folder, and it creates, replaces and removes skill folders and links in `~/.agents/skills` and in each tool's skills folder. It also reads and updates `~/.agents/.skill-lock.json`, which records where installed skills came from. While an install runs it also writes a temporary folder `skillsgate-herdr.*` in `$TMPDIR` or `/tmp`, which holds the downloaded repository, and a hidden staging folder `.skillsgate-new.<folder>` inside `~/.agents/skills`, which also holds the old copy during an update. Both are removed when the install ends. If the install is killed outright they are left behind, and the next install of that skill puts an old copy left in the staging folder back, when nothing took its place, before it removes that folder. All of this happens on your computer and on each Herdr machine you use it on.

A delete removes a skill's folder only after the script has checked that it is a real skill folder inside a skills folder. An install replaces a folder in `~/.agents/skills` only when its dialog said so (the button reads "Update" and a line says the folder will be replaced) and the folder is still a real skill folder of that name. Anything else of that name, such as a folder of your own without a `SKILL.md`, a file or a link, is left alone and the install says `"<folder>" already exists in the shared store on <machine> and was not replaced`. The old copy is moved aside, never deleted in place, and removed only once the new copy is in place.

## Remove it

Delete `~/.config/herdr-app/mods/skillsgate`, and delete the two layout nodes `skillsgate-toggle` and `skillsgate-panel` from your layout file (the JSON file for the layout you use, in `~/.config/herdr-app/layouts/`). Skills you installed or linked stay where they are.

## For contributors

See [`../AGENTS.md`](../AGENTS.md). The tests run with `npm run test:herdr` from the root of the SkillsGate repository.
