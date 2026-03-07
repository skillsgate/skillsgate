import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rate-limit";
import { searchSkills } from "../lib/search";

export const searchRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

searchRoute.use("/search", authMiddleware, rateLimitMiddleware);

searchRoute.post("/search", async (c) => {
  const body = await c.req.json<{ query?: string; limit?: number }>();

  // Validate query
  const query = body.query?.trim();
  if (!query || query.length === 0) {
    return c.json({ error: "query is required" }, 400);
  }
  if (query.length > 500) {
    return c.json({ error: "query must be 500 characters or less" }, 400);
  }

  // Validate limit
  let limit = body.limit ?? 5;
  if (typeof limit !== "number" || limit < 1 || limit > 20) {
    limit = 5;
  }

  const db = c.var.db;
  const userId = c.var.userId;

  // Search
  const results = await searchSkills(db, c.env.OPENAI_API_KEY, query, limit, c.env.CACHE, c.executionCtx);

  // Record usage
  await db.searchUsage.create({
    data: { userId, query },
  });

  // Write per-result analytics (non-blocking)
  c.executionCtx.waitUntil((async () => {
    try {
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        c.env.TELEMETRY.writeDataPoint({
          indexes: ["search_result"],
          blobs: [query, r.skillId, r.slug, r.name, r.githubUrl],
          doubles: [r.score, i + 1, results.length],
        });
      }
    } catch (err) {
      console.error(JSON.stringify({ message: "search_result_telemetry_failed", error: err instanceof Error ? err.message : String(err) }));
    }
  })());

  return c.json({
    results,
    meta: {
      query,
      total: results.length,
      limit,
      remainingSearches: c.var.remainingSearches,
    },
  });
});
