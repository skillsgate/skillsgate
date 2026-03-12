# SkillsGate

**The open marketplace for AI agent skills.**

Discover, install, and publish skills for Claude Code, Cursor, Windsurf, GitHub Copilot, and 13 other AI coding agents — all from one place.

[skillsgate.ai](https://skillsgate.ai) &middot; [npm package](https://www.npmjs.com/package/skillsgate)

---

## Why SkillsGate?

AI coding skills are scattered across hundreds of GitHub repos. You can't find what exists, creators get no visibility, and every team builds the same workflows from scratch.

SkillsGate fixes this. One search, one install command, every agent.

```bash
npx skillsgate search "tailwind responsive"
npx skillsgate add @anthropic/frontend-design
```

---

## Get Started

```bash
# Install globally
npm install -g skillsgate

# Sign in (enables search + private skills)
skillsgate login

# Find a skill
skillsgate search "SEO audit"

# Install it — works across all your agents instantly
skillsgate add @anthropic/audit-website
```

That's it. The skill is now available in Claude Code, Cursor, Windsurf, and every other agent you have installed.

---

## How It Works

### Search with natural language

Describe what you need. SkillsGate understands intent, not just keywords.

```bash
skillsgate search "pdf manipulation"
skillsgate search "deploy to AWS"
skillsgate search "code review best practices"
```

### Install from anywhere

```bash
skillsgate add @username/my-skill               # from SkillsGate
skillsgate add vercel-labs/agent-skills          # from GitHub
skillsgate add anthropics/skills@audit-website   # specific skill in a repo
skillsgate add ./my-local-skills                 # from a local path
```

One command installs across all your agents. No manual config, no duplication.

### Publish your own skills

Share your workflows with the world — or keep them private for your team.

```bash
# Create a skill template
skillsgate publish --init

# Publish to SkillsGate
skillsgate publish ./my-skill
```

Your skill gets a scoped identifier (`@username/skill-name`) and becomes instantly searchable and installable by anyone.

### Security scan before you install

Skills run on your machine. Scan them first — SkillsGate uses your own AI coding tool to analyze skills for prompt injection, data exfiltration, malicious commands, and more.

```bash
skillsgate scan @username/audit-website        # scan a SkillsGate skill
skillsgate scan vercel-labs/agent-skills        # scan a GitHub repo
skillsgate scan ./local-skill                   # scan a local path
```

Supports Claude Code, Codex CLI, OpenCode, Goose, and Aider. After scanning, share your results with the community to help others make informed decisions.

### Private skills & team sharing

Not everything should be public. SkillsGate gives you fine-grained control:

- **Share with individuals** — grant access by GitHub username
- **Organization skills** — private skills for your whole team
- **Publisher catalogs** — bundle and distribute premium skills

### 17 supported agents

claude-code &middot; cursor &middot; github-copilot &middot; windsurf &middot; cline &middot; continue &middot; codex-cli &middot; amp &middot; goose &middot; junie &middot; kilo-code &middot; opencode &middot; openclaw &middot; pear-ai &middot; roo-code &middot; trae &middot; zed

The universal `.agents/skills/` directory works as a fallback for any MCP-compatible tool.

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `skillsgate add <source>` | Install from SkillsGate, GitHub, or local path |
| `skillsgate scan <source>` | Security-scan skills before installing |
| `skillsgate search <query>` | Semantic search for skills |
| `skillsgate publish [path]` | Publish a skill to SkillsGate |
| `skillsgate remove [name]` | Remove installed skills |
| `skillsgate list` | Show installed skills |
| `skillsgate update [name]` | Check and apply updates |
| `skillsgate sync` | Sync skills from node_modules |
| `skillsgate login` | Sign in via browser |
| `skillsgate logout` | Sign out |
| `skillsgate whoami` | Show current user |

See the [CLI README](packages/cli/README.md) for full usage and options.

---

## Architecture

```
apps/
  api/        Hono API on Cloudflare Workers (api.skillsgate.ai)
  web/        React Router v7 on Cloudflare Workers (skillsgate.ai)
packages/
  cli/        CLI published as `skillsgate` on npm
  database/   Prisma schema + migrations (PlanetScale Postgres)
```

## Development

```bash
npm install          # install dependencies
npm run db:generate  # generate Prisma client
npm run dev          # run locally
npm run deploy       # deploy to Cloudflare
```

Requires Node.js 18+, a Cloudflare account, PlanetScale database, and a GitHub OAuth app.

## Contributing

SkillsGate is open source. Contributions welcome.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request

## License

MIT
