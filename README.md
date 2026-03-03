# SkillsGate

**The open marketplace for AI agent skills.**

Find, install, and share skills that extend AI coding assistants like Claude Code, Cursor, Windsurf, GitHub Copilot, and 13 other agents.

[skillsgate.ai](https://skillsgate.ai) &middot; [npm package](https://www.npmjs.com/package/skillsgate)

---

## The Problem

AI coding skills are scattered across hundreds of GitHub repos with no central discovery. You can't find what exists, creators get no visibility, and every team reinvents the same workflows.

## The Solution

SkillsGate is **npm for AI skills** — a central hub with semantic search, trust signals, private skill sharing, and one-command installation across every major AI coding agent.

```bash
npx skillsgate search "tailwind responsive"
npx skillsgate add anthropics/skills@frontend-design
```

## What It Does

### Search

Describe what you need in plain English. SkillsGate uses semantic search powered by pgvector to understand intent, not just keywords.

```bash
skillsgate search "pdf manipulation"
skillsgate search "deploy to AWS"
skillsgate search "code review best practices"
```

### Install

One command installs a skill across all your AI agents. Skills are symlinked into each agent's directory — no duplication, no manual setup.

```bash
skillsgate add vercel-labs/agent-skills          # all skills in a repo
skillsgate add anthropics/skills@audit-website   # specific skill
skillsgate add ./my-local-skills                 # from a local path
```

Supports global (`-g`) and project-local installs. Works with symlinks (default) or file copies (`--copy`).

### Private Skills

Share skills with your team without making them public. SkillsGate supports per-skill access control — share individual skills with specific people by GitHub username.

- **Individual sharing** — Bob shares his deploy helper with Alice, but not his scratchpad
- **Organization skills** — company-wide private skills accessible to all org members
- **Publisher catalogs** — sell premium skill bundles with access gated by purchase

### 17 Supported Agents

claude-code &middot; cursor &middot; github-copilot &middot; windsurf &middot; cline &middot; continue &middot; codex-cli &middot; amp &middot; goose &middot; junie &middot; kilo-code &middot; opencode &middot; openclaw &middot; pear-ai &middot; roo-code &middot; trae &middot; zed

New agents are added regularly. The universal `.agents/skills/` directory works as a fallback for any MCP-compatible tool.

## Quick Start

```bash
# Install the CLI
npm install -g skillsgate

# Authenticate (needed for search and private skills)
skillsgate login

# Search for skills
skillsgate search "SEO audit"

# Install a skill
skillsgate add squirrelscan/skills@audit-website

# List what's installed
skillsgate list
```

## Architecture

SkillsGate is a monorepo with four packages:

```
apps/
  api/        Hono API on Cloudflare Workers (api.skillsgate.ai)
  web/        React Router v7 on Cloudflare Workers (skillsgate.ai)
packages/
  cli/        CLI + MCP server (published as `skillsgate` on npm)
  database/   Prisma schema + migrations (PlanetScale Postgres)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| API | Hono on Cloudflare Workers |
| Web | React Router v7, React 19, Tailwind CSS v4 |
| Database | PlanetScale Postgres with pgvector |
| Search | Semantic vector search (OpenAI embeddings, 1536-dim, HNSW index) |
| Storage | Cloudflare R2 (skill files), KV (caching) |
| Auth | Better Auth (GitHub + Google OAuth, device code flow for CLI) |
| CLI | TypeScript, Commander, published on npm |

### How Search Works

Skills are vectorized into a `skill_chunks` table with a `namespace` column for access scoping. A single pgvector query resolves both relevance and access control:

```sql
SELECT ..., 1 - (embedding <=> query_vector) AS score
FROM skill_chunks
WHERE namespace = 'public' OR namespace = ANY(user_namespaces)
ORDER BY embedding <=> query_vector
LIMIT 20;
```

No external vector database. No post-filtering. One query, scoped results.

### How Access Control Works

Four namespace types handle every access pattern:

| Scenario | Namespace | Who can see |
|---|---|---|
| Public skills | `public` | Everyone |
| Org private | `org_{orgId}` | Org members |
| Publisher catalog | `pub_{publisherId}` | Purchasers |
| Individual private | `skill_{skillId}` | Owner + shared users |

Granting or revoking access is an `INSERT` or `DELETE` on `namespace_access` — immediate, transactional, reflected on the next search.

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run the web app locally
npm run dev

# Deploy
npm run deploy
```

### Environment

Requires:
- Node.js 18+
- Cloudflare account (Workers, R2, KV)
- PlanetScale database with pgvector extension
- GitHub OAuth app (for authentication)

## CLI Reference

| Command | Description |
|---------|-------------|
| `skillsgate add <source>` | Install skills from GitHub repo or local path |
| `skillsgate remove [name]` | Remove installed skills |
| `skillsgate list` | List installed skills |
| `skillsgate update` | Check and apply skill updates |
| `skillsgate search <query>` | Semantic search (requires auth) |
| `skillsgate sync` | Sync skills from node_modules |
| `skillsgate login` | Authenticate via browser |
| `skillsgate logout` | Sign out |
| `skillsgate whoami` | Show current user |

See the [CLI README](packages/cli/README.md) for full usage and options.

## Contributing

SkillsGate is open source. Contributions welcome.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request

## License

MIT
