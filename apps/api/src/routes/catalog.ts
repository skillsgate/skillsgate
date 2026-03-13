import { Hono } from "hono";
import { getDb } from "@skillsgate/database";
import { parseJsonArray, mapSkill, type CatalogSkillRow } from "../lib/skill-mapper";
import { deriveInstallCommand } from "../lib/install-command";
import { deriveUrlPath } from "../lib/url-path";
import type { Bindings, Variables } from "../types";

export const catalogRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// ─── Types ──────────────────────────────────────────────────────────

type CatalogSkill = CatalogSkillRow;

interface CatalogSkillDetail extends CatalogSkill {
  created_at: string | Date;
  updated_at: string | Date;
}

interface CatalogResponse {
  skills: {
    skillId: string;
    slug: string;
    name: string;
    description: string;
    summary: string;
    categories: string[];
    capabilities: string[];
    keywords: string[];
    githubUrl: string;
    installCommand: string | null;
    urlPath: string;
  }[];
  meta: { total: number; limit: number; offset: number; hasMore: boolean };
}

async function checkRateLimit(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `ratelimit:catalog:${ip}`;
  const current = await kv.get(key).catch(() => null);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= 100) return false;

  kv.put(key, String(count + 1), { expirationTtl: 60 }).catch(() => {});
  return true;
}

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// ─── GET /skills — Paginated catalog ────────────────────────────────

catalogRoute.get("/skills", async (c) => {
  const ip = getClientIp(c);
  const allowed = await checkRateLimit(c.env.CACHE, ip);
  if (!allowed) {
    return c.json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  const url = new URL(c.req.url);
  let limit = parseInt(url.searchParams.get("limit") ?? "24", 10);
  let offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  if (isNaN(limit) || limit < 1) limit = 24;
  if (limit > 50) limit = 50;
  if (isNaN(offset) || offset < 0) offset = 0;

  const db = getDb(c.env);

  const countResult = await (db.$queryRawUnsafe as any)(
    `SELECT COUNT(*)::int AS total FROM (
       SELECT DISTINCT ON (COALESCE(github_repo, id), name) id
       FROM skills WHERE visibility = 'public'
       ORDER BY COALESCE(github_repo, id), name, created_at DESC
     ) deduped`
  );
  const total: number = countResult[0]?.total ?? 0;

  const rows: CatalogSkill[] = await (db.$queryRawUnsafe as any)(
    `SELECT * FROM (
       SELECT DISTINCT ON (COALESCE(github_repo, id), name)
              id, slug, name, description, summary, categories, capabilities, keywords,
              github_repo, github_path, source_type, publisher_id, source_id,
              created_at
       FROM skills
       WHERE visibility = 'public'
       ORDER BY COALESCE(github_repo, id), name, created_at DESC
     ) deduped
     ORDER BY
       CASE
         WHEN github_repo LIKE 'anthropics/skills%' THEN 1
         WHEN github_repo LIKE 'vercel-labs/%' THEN 2
         WHEN github_repo LIKE 'remotion-dev/skills%' THEN 3
         WHEN github_repo LIKE 'microsoft/github-copilot-for-azure%' THEN 4
         WHEN github_repo LIKE 'browser-use/browser-use%' THEN 5
         WHEN github_repo LIKE 'better-auth/skills%' THEN 6
         WHEN github_repo LIKE 'google-labs-code/%' THEN 7
         ELSE 100
       END,
       md5(id || CURRENT_DATE::text),
       created_at DESC
     LIMIT $1 OFFSET $2`,
    limit,
    offset
  );

  const skills = rows.map(mapSkill);

  // Telemetry (non-blocking)
  c.executionCtx.waitUntil((async () => {
    try {
      c.env.TELEMETRY.writeDataPoint({
        indexes: ["catalog_browse"],
        blobs: [ip],
        doubles: [total, limit, offset, skills.length],
      });
    } catch {}
  })());

  return c.json({
    skills,
    meta: { total, limit, offset, hasMore: offset + skills.length < total },
  } satisfies CatalogResponse);
});

// ─── GET /skills/search — Keyword search ─────────────────────────────

catalogRoute.get("/skills/search", async (c) => {
  const ip = getClientIp(c);
  const allowed = await checkRateLimit(c.env.CACHE, ip);
  if (!allowed) {
    return c.json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  const url = new URL(c.req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return c.json({ error: "Query must be at least 2 characters" }, 400);
  }
  if (q.length > 200) {
    return c.json({ error: "Query must be 200 characters or less" }, 400);
  }

  let limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  let offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 50) limit = 50;
  if (isNaN(offset) || offset < 0) offset = 0;

  const db = getDb(c.env);
  const likePattern = `%${q}%`;
  const prefixPattern = `${q}%`;

  const countResult = await (db.$queryRawUnsafe as any)(
    `SELECT COUNT(*)::int AS total FROM (
       SELECT DISTINCT ON (COALESCE(github_repo, id), name) id
       FROM skills
       WHERE visibility = 'public' AND (
         name ILIKE $1 OR slug ILIKE $1 OR description ILIKE $1
         OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(keywords, '[]'::jsonb)) kw WHERE kw ILIKE $1)
         OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(categories, '[]'::jsonb)) cat WHERE cat ILIKE $1)
         OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(capabilities, '[]'::jsonb)) cap WHERE cap ILIKE $1)
       )
       ORDER BY COALESCE(github_repo, id), name, created_at DESC
     ) deduped`,
    likePattern
  );
  const total: number = countResult[0]?.total ?? 0;

  const rows: CatalogSkill[] = await (db.$queryRawUnsafe as any)(
    `SELECT * FROM (
       SELECT DISTINCT ON (COALESCE(github_repo, id), name)
              id, slug, name, description, summary, categories, capabilities, keywords,
              github_repo, github_path, source_type, publisher_id, source_id,
              created_at
       FROM skills
       WHERE visibility = 'public' AND (
         name ILIKE $1 OR slug ILIKE $1 OR description ILIKE $1
         OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(keywords, '[]'::jsonb)) kw WHERE kw ILIKE $1)
         OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(categories, '[]'::jsonb)) cat WHERE cat ILIKE $1)
         OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(capabilities, '[]'::jsonb)) cap WHERE cap ILIKE $1)
       )
       ORDER BY COALESCE(github_repo, id), name, created_at DESC
     ) deduped
     ORDER BY
       CASE WHEN name ILIKE $2 OR slug ILIKE $2 THEN 0 ELSE 1 END,
       created_at DESC
     LIMIT $3 OFFSET $4`,
    likePattern,
    prefixPattern,
    limit,
    offset
  );

  const skills = rows.map(mapSkill);

  // Telemetry: per-result analytics (non-blocking)
  c.executionCtx.waitUntil((async () => {
    try {
      c.env.TELEMETRY.writeDataPoint({
        indexes: ["keyword_search"],
        blobs: [q, ip],
        doubles: [total, limit, offset, skills.length],
      });
      for (let i = 0; i < skills.length; i++) {
        const s = skills[i];
        c.env.TELEMETRY.writeDataPoint({
          indexes: ["keyword_search_result"],
          blobs: [q, s.skillId, s.slug, s.name],
          doubles: [i + 1, skills.length],
        });
      }
    } catch {}
  })());

  return c.json({
    skills,
    meta: { total, limit, offset, hasMore: offset + skills.length < total },
  } satisfies CatalogResponse);
});

// ─── GET /skills/detail — Skill detail with SKILL.md content ─────────

catalogRoute.get("/skills/detail", async (c) => {
  const ip = getClientIp(c);
  const allowed = await checkRateLimit(c.env.CACHE, ip);
  if (!allowed) {
    return c.json({ error: "Rate limit exceeded. Try again in a minute." }, 429);
  }

  const path = c.req.query("path")?.trim();
  if (!path || path.length > 300) {
    return c.json({ error: "Invalid path" }, 400);
  }

  const db = getDb(c.env);
  let row: CatalogSkillDetail | null = null;

  // Check if path looks like a UUID (for R2/non-GitHub skills)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidPattern.test(path)) {
    // Lookup by skill id
    const rows: CatalogSkillDetail[] = await (db.$queryRawUnsafe as any)(
      `SELECT id, slug, name, description, summary, categories, capabilities, keywords,
              github_repo, github_path, source_type, publisher_id, source_id, created_at, updated_at
       FROM skills
       WHERE id = $1 AND visibility = 'public'
       LIMIT 1`,
      path
    );
    row = rows[0] ?? null;
  } else {
    // Parse as owner/repo/skill-name format
    const segments = path.split("/");
    if (segments.length >= 2) {
      const owner = segments[0];
      const repo = segments[1];
      const skillName = segments.length >= 3 ? segments[segments.length - 1] : null;
      const githubRepo = `${owner}/${repo}`;

      let rows: CatalogSkillDetail[];
      if (skillName) {
        // Match: github_repo = 'owner/repo' AND github_path contains 'skill-name'
        rows = await (db.$queryRawUnsafe as any)(
          `SELECT id, slug, name, description, summary, categories, capabilities, keywords,
                  github_repo, github_path, source_type, publisher_id, source_id, created_at, updated_at
           FROM skills
           WHERE github_repo = $1 AND github_path LIKE $2 AND visibility = 'public'
           ORDER BY created_at DESC
           LIMIT 1`,
          githubRepo,
          `%${skillName}%`
        );
      } else {
        // Just owner/repo — find skill at repo root
        rows = await (db.$queryRawUnsafe as any)(
          `SELECT id, slug, name, description, summary, categories, capabilities, keywords,
                  github_repo, github_path, source_type, publisher_id, source_id, created_at, updated_at
           FROM skills
           WHERE github_repo = $1 AND visibility = 'public'
           ORDER BY created_at DESC
           LIMIT 1`,
          githubRepo
        );
      }
      row = rows[0] ?? null;
    }
  }

  if (!row) {
    return c.json({ error: "Skill not found" }, 404);
  }

  const githubRepo = row.github_repo ?? "";
  const githubPath = row.github_path ?? "";
  const githubUrl = githubRepo
    ? `https://github.com/${githubRepo}${githubPath ? `/blob/main/${githubPath}` : ""}`
    : "";

  // Fetch SKILL.md content (with KV caching)
  const cacheKey = `skill_content:${row.id}`;
  let content: string | null = null;

  try {
    content = await c.env.CACHE.get(cacheKey);
  } catch {
    // Cache miss or error — continue to fetch
  }

  if (!content) {
    try {
      if (row.source_type === "github" && githubRepo) {
        // Determine the raw content URL
        let rawPath = githubPath;
        if (rawPath) {
          rawPath = rawPath.replace(/\/+$/, "");
        }
        if (!rawPath || !rawPath.endsWith("SKILL.md")) {
          rawPath = rawPath ? `${rawPath}/SKILL.md` : "SKILL.md";
        }
        const rawUrl = `https://raw.githubusercontent.com/${githubRepo}/main/${rawPath}`;

        const headers: Record<string, string> = {
          "User-Agent": "SkillsGate/1.0",
        };
        if (c.env.GITHUB_TOKEN) {
          headers["Authorization"] = `token ${c.env.GITHUB_TOKEN}`;
        }

        const res = await fetch(rawUrl, { headers });
        if (res.ok) {
          content = await res.text();
        }
      } else if (row.source_type === "r2") {
        const r2Object = await c.env.R2_SKILLS.get(`skills/${row.id}/SKILL.md`);
        if (r2Object) {
          content = await r2Object.text();
        }
      }
    } catch {
      // Failed to fetch content — continue without it
    }

    // Cache the content if we got it
    if (content) {
      c.executionCtx.waitUntil(
        c.env.CACHE.put(cacheKey, content, { expirationTtl: 3600 }).catch(() => {})
      );
    }
  }

  // Telemetry (non-blocking)
  c.executionCtx.waitUntil((async () => {
    try {
      c.env.TELEMETRY.writeDataPoint({
        indexes: ["skill_view"],
        blobs: [path, ip],
      });
    } catch {}
  })());

  return c.json({
    skill: {
      skillId: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      summary: row.summary ?? "",
      categories: parseJsonArray(row.categories),
      capabilities: parseJsonArray(row.capabilities),
      keywords: parseJsonArray(row.keywords),
      githubUrl,
      githubRepo,
      installCommand: deriveInstallCommand(
        row.slug,
        row.source_type,
        null,
        githubRepo,
        githubPath
      ),
      urlPath: deriveUrlPath(row.source_id, row.id),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    },
    content: content ?? "",
  });
});
