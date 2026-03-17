import { Hono } from "hono";
import { getDb } from "@skillsgate/database";
import type { Bindings, Variables } from "../types";

export const blogRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// ─── Types ──────────────────────────────────────────────────────────

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  cover_image: string | null;
  tags: unknown;
  published_at: string | Date;
}

interface BlogPostDetailRow extends BlogPostRow {
  content: string;
  created_at: string | Date;
  updated_at: string | Date;
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// ─── GET /blog — List published posts ───────────────────────────────

blogRoute.get("/blog", async (c) => {
  const url = new URL(c.req.url);
  let limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
  let offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;
  if (isNaN(offset) || offset < 0) offset = 0;

  const db = getDb(c.env);

  const countResult = await (db.$queryRawUnsafe as any)(
    `SELECT COUNT(*)::int AS total FROM blog_posts WHERE published = true`
  );
  const total: number = countResult[0]?.total ?? 0;

  const rows: BlogPostRow[] = await (db.$queryRawUnsafe as any)(
    `SELECT id, slug, title, description, author, cover_image, tags, published_at
     FROM blog_posts
     WHERE published = true
     ORDER BY published_at DESC
     LIMIT $1 OFFSET $2`,
    limit,
    offset
  );

  const posts = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    author: row.author,
    coverImage: row.cover_image,
    tags: parseJsonArray(row.tags),
    publishedAt: new Date(row.published_at).toISOString(),
  }));

  return c.json({
    posts,
    meta: { total, limit, offset, hasMore: offset + posts.length < total },
  });
});

// ─── GET /blog/:slug — Single post ─────────────────────────────────

blogRoute.get("/blog/:slug", async (c) => {
  const slug = c.req.param("slug");

  const db = getDb(c.env);

  const rows: BlogPostDetailRow[] = await (db.$queryRawUnsafe as any)(
    `SELECT id, slug, title, description, content, author, cover_image, tags,
            published_at, created_at, updated_at
     FROM blog_posts
     WHERE slug = $1 AND published = true
     LIMIT 1`,
    slug
  );

  if (rows.length === 0) {
    return c.json({ error: "Post not found" }, 404);
  }

  const row = rows[0];

  return c.json({
    post: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      content: row.content,
      author: row.author,
      coverImage: row.cover_image,
      tags: parseJsonArray(row.tags),
      publishedAt: new Date(row.published_at).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    },
  });
});
