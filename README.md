<p align="center">
  <img src="apps/web/public/favicon.svg" width="96" height="96" alt="SkillsGate" />
</p>

<h1 align="center">SkillsGate</h1>

<p align="center">The open marketplace for AI agent skills.</p>

<p align="center">
  <a href="https://skillsgate.ai">Website</a> &middot;
  <a href="https://github.com/skillsgate/skillsgate/releases/latest">Download Desktop App</a> &middot;
  <a href="https://www.npmjs.com/package/skillsgate">CLI on npm</a> &middot;
  <a href="https://x.com/sultanvaliyev">@sultanvaliyev</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/skillsgate?color=a8a29e&label=CLI" alt="CLI version" />
  <img src="https://img.shields.io/github/v/release/skillsgate/skillsgate?color=a8a29e&label=Desktop" alt="Desktop version" />
  <img src="https://img.shields.io/badge/agents-18-a8a29e" alt="18 agents" />
  <img src="https://img.shields.io/badge/license-MIT-a8a29e" alt="MIT license" />
</p>

---

Discover, install, and publish skills for Claude Code, Cursor, Windsurf, GitHub Copilot, and 14 other AI coding agents -- all from one place. Think of it as **npm for AI skills**.

## Download

### Desktop App (macOS, Windows, Linux)

<p>
  <a href="https://github.com/skillsgate/skillsgate/releases/latest/download/SkillsGate.dmg">
    <img src="https://img.shields.io/badge/macOS-Download%20.dmg-1c1917?style=for-the-badge&logo=apple&logoColor=white" alt="Download for macOS" />
  </a>
  &nbsp;
  <a href="https://github.com/skillsgate/skillsgate/releases/latest/download/SkillsGate-Setup.exe">
    <img src="https://img.shields.io/badge/Windows-Download%20.exe-1c1917?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows" />
  </a>
  &nbsp;
  <a href="https://github.com/skillsgate/skillsgate/releases/latest/download/SkillsGate.AppImage">
    <img src="https://img.shields.io/badge/Linux-Download%20.AppImage-1c1917?style=for-the-badge&logo=linux&logoColor=white" alt="Download for Linux" />
  </a>
</p>

Three-column skill browser with search, favorites, remote servers, and a built-in editor. Auto-updates via GitHub Releases.

### CLI

```bash
npm install -g skillsgate
```

### TUI (Terminal UI)

```bash
npm install -g @skillsgate/tui
```

Or run directly: `npx @skillsgate/tui`

---

## Features

- **Search with natural language** -- AI-powered semantic search across 80,000+ skills
- **One install, every agent** -- Skills installed to all your detected agents simultaneously
- **18 agents supported** -- Claude Code, Cursor, Windsurf, GitHub Copilot, Codex CLI, Cline, Continue, Amp, Goose, Junie, Kilo Code, OpenCode, OpenClaw, Pear AI, Roo Code, Trae, Zed, and Universal
- **Desktop app** -- Three-column Finder-style browser, view/edit skills, per-agent management
- **Terminal UI** -- Full-featured TUI with keyboard-driven navigation
- **Remote servers** -- Connect via SSH to browse and sync skills from other machines
- **Security scanning** -- Scan skills for prompt injection and malicious code before installing
- **Publish your own** -- Share skills publicly or keep them private for your team
- **Settings sync** -- Shared SQLite database keeps desktop and TUI settings in sync

---

## Quick Start

```bash
# Install the CLI
npm install -g skillsgate

# Sign in (enables AI search + favorites)
skillsgate login

# Find a skill
skillsgate search "SEO audit"

# Install it
skillsgate add @anthropic/audit-website

# Or install from GitHub
skillsgate add vercel-labs/agent-skills
```

The skill is now available in Claude Code, Cursor, Windsurf, and every other agent you have installed.

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `skillsgate add <source>` | Install from SkillsGate, GitHub, or local path |
| `skillsgate search <query>` | AI-powered semantic search |
| `skillsgate scan <source>` | Security scan before installing |
| `skillsgate publish [path]` | Publish a skill to SkillsGate |
| `skillsgate remove [name]` | Remove installed skills |
| `skillsgate list` | Show installed skills |
| `skillsgate update [name]` | Check and apply updates |
| `skillsgate sync` | Sync skills from node_modules |
| `skillsgate tui` | Launch terminal UI |
| `skillsgate login` | Sign in via browser |
| `skillsgate logout` | Sign out |
| `skillsgate whoami` | Show current user |

---

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1/2/3/4` | Switch tabs (Installed/Discover/Favorites/Servers) |
| `j/k` | Navigate list |
| `/` | Focus search input |
| `v` | View skill detail |
| `e` | Toggle raw source view |
| `i` | Install skill |
| `d` | Remove skill (per-agent selection) |
| `o` | Open folder / URL |
| `m` | Toggle keyword / AI search |
| `l` | Login / re-login |
| `s` | Settings |
| `?` | Help overlay |
| `Ctrl+Q` | Quit |

---

## Architecture

```
apps/
  api/          Hono API on Cloudflare Workers (api.skillsgate.ai)
  web/          React Router v7 on Workers (skillsgate.ai)
  desktop/      Electron desktop app

packages/
  cli/          CLI published as `skillsgate` on npm
  tui/          Terminal UI published as `@skillsgate/tui`
  ui/           Shared React components
  local-db/     Shared SQLite persistence + SSH client
  database/     Prisma schema + migrations (PlanetScale Postgres)
```

## Development

```bash
# Install dependencies
npm install

# Run the web app
npm run dev -w skillsgate-web

# Run the desktop app
cd apps/desktop && npx electron-vite dev

# Run the TUI
cd packages/tui && bun run src/index.tsx

# Deploy web + API
npm run deploy
```

Requires Node.js 18+, Bun (for TUI), a Cloudflare account, and PlanetScale database.

---

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
  Built by <a href="https://x.com/sultanvaliyev">Sultan Valiyev</a>
</p>
