import { Hono } from "hono";
import { getDb } from "@skillsgate/database";
import type { Bindings, Variables } from "../types";

const VALID_EVENTS = new Set(["add", "remove", "search", "update", "sync", "list"]);

export const telemetryRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

telemetryRoute.get("/t", async (c) => {
  try {
    const e = c.req.query("e");
    const v = c.req.query("v");

    if (!e || !v || !VALID_EVENTS.has(e)) {
      return c.body(null, 400);
    }

    const os = c.req.query("os") ?? "";
    const ci = c.req.query("ci") ?? "";
    const source = c.req.query("source") ?? "";
    const sourceType = c.req.query("sourceType") ?? "";
    const skills = c.req.query("skills") ?? "";
    const agents = c.req.query("agents") ?? "";
    const scope = c.req.query("scope") ?? "";
    const query = c.req.query("query") ?? "";

    const resultCount = parseFloat(c.req.query("resultCount") ?? "") || 0;
    const skillCount = parseFloat(c.req.query("skillCount") ?? "") || 0;
    const updatedCount = parseFloat(c.req.query("updatedCount") ?? "") || 0;
    const upToDateCount = parseFloat(c.req.query("upToDateCount") ?? "") || 0;

    // Write to Analytics Engine (non-blocking)
    try {
      c.env.TELEMETRY.writeDataPoint({
        indexes: [e],
        blobs: [v, os, ci, source, sourceType, skills, agents, scope, query],
        doubles: [resultCount, skillCount, updatedCount, upToDateCount],
      });
    } catch {
      // silently fail
    }

    // DB side-effects for add events
    if (e === "add" && source) {
      c.executionCtx.waitUntil(handleAddEvent(c.env, source));
    }

    return c.body(null, 204);
  } catch {
    return c.body(null, 204);
  }
});

async function handleAddEvent(
  env: Bindings,
  source: string,
): Promise<void> {
  try {
    const db = getDb(env);

    // Try to increment downloads for known skills
    const skill = await db.skill.findFirst({
      where: {
        OR: [
          { githubRepo: source },
          { slug: source },
        ],
      },
      select: { id: true },
    });

    if (skill) {
      await db.skill.update({
        where: { id: skill.id },
        data: { downloads: { increment: 1 } },
      });
    } else {
      // Capture unknown repo for later processing
      const githubUrl = source.includes("/") && !source.startsWith("http")
        ? `https://github.com/${source}`
        : source;

      await db.$executeRawUnsafe(
        `INSERT INTO pending_skills (id, github_url, source, submitted_at, status)
         VALUES (gen_random_uuid()::text, $1, 'cli_add', now(), 'pending')
         ON CONFLICT (github_url) DO NOTHING`,
        githubUrl,
      );
    }
  } catch {
    // silently fail — telemetry should never break
  }
}
