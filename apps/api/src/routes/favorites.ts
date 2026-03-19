import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { mapSkill, type CatalogSkillRow } from "../lib/skill-mapper";

export const favoritesRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

favoritesRoute.use("*", authMiddleware);

// ─── POST /favorites — Add a skill to favorites ─────────────────────

favoritesRoute.post("/favorites", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const body = await c.req.json<{ skillId?: string }>().catch(() => ({}) as { skillId?: string });
  const skillId = body.skillId;

  if (!skillId || typeof skillId !== "string") {
    return c.json({ error: "skillId is required" }, 400);
  }

  // Check skill exists
  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { id: true },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }

  // Upsert: create if not exists, return 200 if already exists
  const existing = await (db.favorite.findFirst as any)({
    where: { userId, skillId },
    select: { id: true },
  });

  if (existing) {
    return c.json({ favorited: true }, 200);
  }

  await (db.favorite.create as any)({
    data: { userId, skillId },
  });

  return c.json({ favorited: true }, 201);
});

// ─── DELETE /favorites/:skillId — Remove a skill from favorites ──────

favoritesRoute.delete("/favorites/:skillId", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;
  const skillId = c.req.param("skillId");

  // Idempotent: delete if exists, no error if not
  const existing = await (db.favorite.findFirst as any)({
    where: { userId, skillId },
    select: { id: true },
  });

  if (existing) {
    await (db.favorite.delete as any)({
      where: { id: existing.id },
    });
  }

  return c.body(null, 204);
});

// ─── GET /favorites — List favorites with joined skill data ──────────

interface FavoriteSkillRow extends CatalogSkillRow {
  favorited_at: string | Date;
}

favoritesRoute.get("/favorites", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const url = new URL(c.req.url);
  let limit = parseInt(url.searchParams.get("limit") ?? "24", 10);
  let offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  if (isNaN(limit) || limit < 1) limit = 24;
  if (limit > 50) limit = 50;
  if (isNaN(offset) || offset < 0) offset = 0;

  const countResult = await (db.$queryRawUnsafe as any)(
    `SELECT COUNT(*)::int AS total
     FROM favorites
     WHERE user_id = $1`,
    userId
  );
  const total: number = countResult[0]?.total ?? 0;

  const rows: FavoriteSkillRow[] = await (db.$queryRawUnsafe as any)(
    `SELECT
       s.id, s.slug, s.name, s.description, s.summary,
       s.categories, s.capabilities, s.keywords,
       s.github_repo, s.github_path, s.source_type,
       s.publisher_id, s.source_id, s.github_stars,
       f.created_at AS favorited_at
     FROM favorites f
     JOIN skills s ON s.id = f.skill_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    userId,
    limit,
    offset
  );

  const favorites = rows.map((row) => ({
    ...mapSkill(row),
    favoritedAt: new Date(row.favorited_at).toISOString(),
  }));

  return c.json({
    favorites,
    meta: { total, limit, offset, hasMore: offset + favorites.length < total },
  });
});

// ─── POST /favorites/check — Batch check favorited skill IDs ─────────

favoritesRoute.post("/favorites/check", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const body = await c.req.json<{ skillIds?: string[] }>().catch(() => ({}) as { skillIds?: string[] });
  const skillIds = body.skillIds;

  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    return c.json({ favorited: [] });
  }

  // Cap at 50 IDs
  const ids = skillIds.slice(0, 50).filter((id) => typeof id === "string");

  if (ids.length === 0) {
    return c.json({ favorited: [] });
  }

  // Build parameterized query with positional params
  const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
  const rows: { skill_id: string }[] = await (db.$queryRawUnsafe as any)(
    `SELECT skill_id FROM favorites WHERE user_id = $1 AND skill_id IN (${placeholders})`,
    userId,
    ...ids
  );

  const favorited = rows.map((r) => r.skill_id);

  return c.json({ favorited });
});
