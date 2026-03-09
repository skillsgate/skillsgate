import { Hono } from "hono";
import { getDb } from "@skillsgate/database";
import { findUserByGithubUsername } from "../lib/users";
import type { Bindings, Variables } from "../types";

export const skillDownloadRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Text file extensions — sent as UTF-8 strings, everything else as base64
const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".yaml", ".yml", ".ts", ".js", ".jsx", ".tsx",
  ".py", ".sh", ".bash", ".zsh", ".toml", ".cfg", ".ini", ".xml", ".html",
  ".css", ".scss", ".less", ".sql", ".rb", ".rs", ".go", ".java", ".kt",
  ".swift", ".c", ".cpp", ".h", ".hpp", ".env", ".gitignore", ".editorconfig",
]);

function isTextFile(path: string): boolean {
  const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

// ─── GET /skills/@:username/:slug/download — Download skill files from R2 ──

skillDownloadRoute.get("/skills/@:username/:slug/download", async (c) => {
  const username = c.req.param("username")!;
  const slug = c.req.param("slug")!;
  const db = getDb(c.env);

  // 1. Resolve GitHub username to user ID
  const publisher = await findUserByGithubUsername(db, username);
  if (!publisher) {
    return c.json({ error: "Publisher not found" }, 404);
  }

  // 2. Look up skill by (publisherId, slug) composite key
  const skill = await (db.skill.findFirst as any)({
    where: { publisherId: publisher.id, slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      sourceType: true,
      publisherId: true,
      orgId: true,
    },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }

  // Only R2-sourced skills can be downloaded from SkillsGate.
  // GitHub-sourced skills should be installed via `skillsgate add owner/repo`.
  if (skill.sourceType !== "r2") {
    return c.json({
      error: "This skill is hosted on GitHub. Install it with: skillsgate add <owner/repo>",
    }, 400);
  }

  // 3. Access control for non-public skills
  if (skill.visibility !== "public") {
    const authorization = c.req.header("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return c.json({ error: "Authentication required for this skill" }, 401);
    }

    const token = authorization.slice("Bearer ".length);
    if (!token) {
      return c.json({ error: "Authentication required for this skill" }, 401);
    }

    const session = await (db.session.findFirst as any)({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    const userId = session.userId;

    // Check if user has access
    const hasAccess = await checkSkillAccess(db, skill, userId);
    if (!hasAccess) {
      return c.json({ error: "Access denied to this skill" }, 403);
    }
  }

  // 4. List and read all R2 objects for this skill
  const prefix = `skills/${skill.id}/`;
  const files: { path: string; content: string; encoding: "utf-8" | "base64" }[] = [];
  let cursor: string | undefined;

  do {
    const listed = await c.env.R2_SKILLS.list({ prefix, cursor });

    for (const obj of listed.objects) {
      const r2Object = await c.env.R2_SKILLS.get(obj.key);
      if (!r2Object) continue;

      // Strip the prefix to get the relative path
      const relativePath = obj.key.slice(prefix.length);
      if (!relativePath) continue;

      const arrayBuffer = await r2Object.arrayBuffer();

      if (isTextFile(relativePath)) {
        files.push({
          path: relativePath,
          content: new TextDecoder().decode(arrayBuffer),
          encoding: "utf-8",
        });
      } else {
        // Base64-encode binary files
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        files.push({
          path: relativePath,
          content: btoa(binary),
          encoding: "base64",
        });
      }
    }

    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  if (files.length === 0) {
    return c.json({ error: "No files found for this skill" }, 404);
  }

  // 5. Increment download counter (non-blocking)
  c.executionCtx.waitUntil(
    (db.skill.update as any)({
      where: { id: skill.id },
      data: { downloads: { increment: 1 } },
    }).catch(() => {
      // Silently ignore download counter failures
    })
  );

  return c.json({
    skill: {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
    },
    files,
  });
});

// ─── Access check helper ─────────────────────────────────────────────

async function checkSkillAccess(
  db: any,
  skill: { id: string; visibility: string; publisherId: string; orgId: string | null },
  userId: string
): Promise<boolean> {
  // Owner always has access
  if (skill.publisherId === userId) return true;

  if (skill.visibility === "private") {
    // Check namespace access (skill_<skillId>)
    const namespaceId = `skill_${skill.id}`;
    const access = await (db.namespaceAccess.findFirst as any)({
      where: { namespaceId, userId },
    });
    if (access) return true;

    // Check org membership if org-owned
    if (skill.orgId) {
      const orgMember = await (db.organizationMember.findFirst as any)({
        where: { orgId: skill.orgId, userId },
      });
      if (orgMember) return true;
    }

    return false;
  }

  // Premium skills — check purchase
  if (skill.visibility === "premium") {
    const namespaceId = `pub_${skill.publisherId}`;
    const access = await (db.namespaceAccess.findFirst as any)({
      where: { namespaceId, userId },
    });
    if (access) return true;

    // Also check org-level purchase
    const orgMemberships = await (db.organizationMember.findMany as any)({
      where: { userId },
      select: { orgId: true },
    });

    for (const membership of orgMemberships) {
      const orgAccess = await (db.namespaceAccess.findFirst as any)({
        where: { namespaceId, userId: membership.orgId },
      });
      if (orgAccess) return true;
    }

    return false;
  }

  return false;
}
