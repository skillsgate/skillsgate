# skillsgate

Install and manage AI agent skills from GitHub. Works with Claude Code, Cursor, Windsurf, GitHub Copilot, and [15+ other agents](#supported-agents).

## Install

```bash
npm install -g skillsgate
```

Or use directly with `npx`:

```bash
npx skillsgate add vercel-labs/agent-skills
```

## Usage

### Add skills

```bash
# From a GitHub repo (installs all skills found)
skillsgate add owner/repo

# Specific skill from a repo
skillsgate add owner/repo@skill-name

# From a GitHub URL
skillsgate add https://github.com/owner/repo

# From a local path
skillsgate add ./my-skills

# Skip prompts
skillsgate add owner/repo -y

# Install globally (~/.agents/skills/)
skillsgate add owner/repo -g

# Target a specific agent
skillsgate add owner/repo -a cursor

# Copy files instead of symlink
skillsgate add owner/repo --copy
```

### Remove skills

```bash
skillsgate remove           # interactive picker
skillsgate remove my-skill  # by name
skillsgate remove --all     # remove all
```

### List installed skills

```bash
skillsgate list
skillsgate list -g    # global skills
```

### Update skills

```bash
skillsgate update     # check all for updates
```

### Search the marketplace

Requires authentication (`skillsgate login` first).

```bash
skillsgate search "tailwind CSS"
skillsgate search "pdf manipulation"
```

### Sync from node_modules

If a project has skills published as npm packages:

```bash
skillsgate sync
```

### Auth

```bash
skillsgate login      # authenticate via browser
skillsgate logout     # sign out
skillsgate whoami     # show current user
```

## How it works

Skills are markdown files (`SKILL.md`) that tell AI agents what to do. `skillsgate` clones repos, finds skills inside them, and symlinks them into each agent's skills directory.

```
~/.agents/skills/       # canonical store (global)
  my-skill/
    SKILL.md

~/.cursor/skills/       # symlinked per agent
  my-skill -> ~/.agents/skills/my-skill
```

Project-local installs go into `.agents/skills/` in your project root.

## Supported agents

claude-code, cursor, github-copilot, windsurf, cline, continue, codex-cli, amp, goose, junie, kilo-code, opencode, openclaw, pear-ai, roo-code, trae, zed

## Options

| Flag | Description |
|------|-------------|
| `-g, --global` | Install to global scope (`~/.agents/skills/`) |
| `-y, --yes` | Skip confirmation prompts |
| `-a, --agent <id>` | Target specific agent(s) |
| `--all` | Select all skills/agents |
| `--copy` | Copy files instead of symlink |
| `-l, --list` | List skills in a repo without installing |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

## Telemetry

Anonymous usage analytics are collected to improve the tool. No personal data is sent.

Opt out:

```bash
export DO_NOT_TRACK=1
# or
export SKILLSGATE_TELEMETRY_DISABLED=1
```

## License

MIT
