<p align="center">
  <img src="apps/web/public/favicon.svg" width="96" height="96" alt="SkillsGate" />
</p>

<h1 align="center">SkillsGate</h1>

<p align="center">Visual skill manager for AI agents. Desktop app and TUI.</p>

<p align="center">
  <a href="https://skillsgate.ai">Website</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/skillsgate?color=a8a29e&label=npm" alt="npm version" />
  <img src="https://img.shields.io/badge/powered_by-skills.sh-a8a29e" alt="powered by skills.sh" />
  <img src="https://img.shields.io/badge/agents-20-a8a29e" alt="20 agents" />
  <img src="https://img.shields.io/badge/license-MIT-a8a29e" alt="MIT license" />
</p>

<p align="center">
  <img src="docs/desktop-screenshot.png" width="720" alt="SkillsGate Desktop App" />
</p>

---

## What is SkillsGate?

SkillsGate lets you browse, install, and manage AI agent skills from a single interface. It works with 20+ agents and integrates [skills.sh](https://skills.sh) for public skill discovery.

Instead of hunting through GitHub repos and copying markdown files by hand, you open SkillsGate, search for what you need, and install it to any combination of agents with one click.

Available as a **desktop app** (macOS, Windows, Linux) and a **terminal UI** for keyboard-driven workflows.

## Quick Start

### Desktop App

Download for your platform:

[macOS (Apple Silicon)](https://github.com/skillsgate/skillsgate/releases/latest) &middot; [macOS (Intel)](https://github.com/skillsgate/skillsgate/releases/latest) &middot; [Windows](https://github.com/skillsgate/skillsgate/releases/latest) &middot; [Linux](https://github.com/skillsgate/skillsgate/releases/latest)

### TUI (Terminal UI)

```bash
npx skillsgate
```

Or install globally:

```bash
npm install -g skillsgate
```

<p align="center">
  <img src="docs/tui-screenshot.png" width="720" alt="SkillsGate TUI" />
</p>

## Supported Agents

Claude Code, Cursor, Windsurf, GitHub Copilot, Cline, Continue, Codex CLI, Droid CLI, OB-1, Amp, Goose, Junie, Kilo Code, OpenCode, OpenClaw, Pear AI, Roo Code, Trae, Zed, and Universal.

## Features

- **skills.sh integration** -- browse and search the full public catalog directly from the app
- **Per-agent management** -- install a skill to specific agents or all of them at once, remove from one without affecting the others
- **Built-in editor** -- view rendered skill content or edit the raw source with a CodeMirror editor, saved to disk instantly
- **Remote servers** -- connect to other machines via SSH to browse and sync skills
- **Private skills** -- keep skills local to your machine or share them with your team
- **Favorites** -- star skills from the catalog for quick access
- **Settings sync** -- desktop and TUI share preferences via a local SQLite database

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1/2/3/4` | Switch tabs (Installed / Discover / Favorites / Servers) |
| `j/k` | Navigate list |
| `/` | Focus search input |
| `Tab` | Cycle focus between panes |
| `v` | View skill detail |
| `e` | Toggle rendered / raw source view |
| `i` | Install skill |
| `d` | Remove skill |
| `o` | Open folder or URL |
| `m` | Toggle keyword / AI search mode |
| `s` | Settings |
| `?` | Help overlay |
| `Ctrl+Q` | Quit |

## Development

This is a monorepo managed with npm workspaces.

```
apps/
  web/          React Router v7 on Cloudflare Workers
  desktop/      Electron desktop app

packages/
  cli/          Node CLI published as `skillsgate` on npm
  tui/          Terminal UI published as `@skillsgate/tui` (Bun)
  ui/           Shared React components
  local-db/     Shared SQLite persistence and SSH client
```

### Running locally

```bash
# Install dependencies
npm install

# Native desktop dependencies are rebuilt for Electron automatically.
# If install scripts were skipped, run this before starting the desktop app:
# npm run rebuild:native --workspace=@skillsgate/desktop

# Web app (default workspace dev server)
npm run dev

# Desktop app
cd apps/desktop && npm run dev

# TUI (requires Bun)
cd packages/tui && bun run src/index.tsx

# Deploy web app to Cloudflare
npm run deploy
```

Requires Node.js 18+, Bun (for TUI development), and a Cloudflare account.

The desktop app uses the native `better-sqlite3` module. A normal `npm install`
rebuilds it for the Electron version pinned by the desktop workspace. If you
install with `--ignore-scripts` or encounter a native module ABI mismatch, run
`npm run rebuild:native --workspace=@skillsgate/desktop` manually.

## Contributing

SkillsGate is open source. Contributions welcome.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request

## License

MIT

---

<p align="center">
  Built by Sultan Valiyev
</p>
