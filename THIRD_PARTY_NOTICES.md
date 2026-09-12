# Third-Party Notices

This project includes code adapted from the following open source projects.

---

## vercel-labs/skills

**Repository:** https://github.com/vercel-labs/skills
**Copyright:** Copyright (c) 2026 Vercel, Inc.

The following sections of `apps/desktop/src/main/ipc-handlers.ts` were
adapted from or inspired by the `vercel-labs/skills` CLI tool. They were
originally written in the now-removed `packages/cli/src/core/` modules and
moved into the desktop app when the CLI was retired.

- Agent registry and detection logic
- Lock file format and tree SHA approach
- GitHub URL and shorthand source parsing
- Recursive SKILL.md discovery algorithm and skip-directory patterns
- Symlink/copy installation logic

These sections have been substantially modified for SkillsGate's desktop
architecture, but the core algorithms and agent configuration patterns
originate from the Vercel project.
