import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "@skillsgate/database";
import { authMiddleware } from "../middleware/auth";
import type { Bindings, Variables } from "../types";

// ─── Validation schemas ──────────────────────────────────────────

const submitScanSchema = z.object({
  sourceId: z.string().min(1),
  contentHash: z.string().min(1),
  scannerType: z.enum(["claude-code", "codex-cli", "opencode", "goose", "aider"]),
  risk: z.enum(["CLEAN", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  summary: z.string().optional(),
  findings: z.array(z.object({
    file: z.string(),
    line: z.number().optional(),
    severity: z.enum(["info", "low", "medium", "high", "critical"]),
    category: z.string(),
    description: z.string(),
  })).default([]),
});

// ─── Route ───────────────────────────────────────────────────────

export const communityScansRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// ─── POST /v1/scans — Submit scan results (auth required) ───────

communityScansRoute.post("/v1/scans", authMiddleware, async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const body = await c.req.json();
  const parsed = submitScanSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  const { sourceId, contentHash, scannerType, risk, summary, findings } = parsed.data;

  // Resolve skillId from sourceId
  const skill = await (db.skill.findFirst as any)({
    where: { sourceId },
    select: { id: true },
  });
  const skillId = skill?.id ?? null;

  // Upsert on (sourceId, userId, contentHash)
  const scan = await (db.communityScan.upsert as any)({
    where: {
      sourceId_userId_contentHash: { sourceId, userId, contentHash },
    },
    create: {
      sourceId,
      skillId,
      contentHash,
      scannerType,
      risk,
      summary: summary ?? null,
      findings,
      findingCount: findings.length,
      userId,
    },
    update: {
      skillId,
      scannerType,
      risk,
      summary: summary ?? null,
      findings,
      findingCount: findings.length,
    },
  });

  return c.json({ id: scan.id, message: "Scan submitted" }, 201);
});

// ─── GET /v1/scans/:sourceId/summary — Aggregated findings (no auth) ──

communityScansRoute.get("/v1/scans/:sourceId/summary", async (c) => {
  const sourceId = decodeURIComponent(c.req.param("sourceId"));

  // Check KV cache
  const cacheKey = `scan-summary:${sourceId}`;
  try {
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }
  } catch {
    // Cache miss or error — continue
  }

  const db = getDb(c.env);

  // Get risk breakdown via groupBy
  const riskGroups = await (db.communityScan.groupBy as any)({
    by: ["risk"],
    where: { sourceId },
    _count: true,
  });

  // If no scans exist, return empty summary
  if (!riskGroups || riskGroups.length === 0) {
    const empty = {
      sourceId,
      totalScans: 0,
      riskBreakdown: { CLEAN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      topFindings: [],
      lastScannedAt: null,
    };
    return c.json(empty);
  }

  // Build risk breakdown with defaults
  const riskBreakdown: Record<string, number> = { CLEAN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  let totalScans = 0;
  for (const group of riskGroups) {
    riskBreakdown[group.risk] = group._count;
    totalScans += group._count;
  }

  // Get latest scan timestamp
  const latestScan = await (db.communityScan.findFirst as any)({
    where: { sourceId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const lastScannedAt = latestScan?.createdAt?.toISOString() ?? null;

  // Aggregate top findings from recent scans
  const recentScans = await (db.communityScan.findMany as any)({
    where: { sourceId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { findings: true },
  });

  // Group findings by category and count occurrences
  const findingCounts = new Map<string, { count: number; description: string; severity: string }>();
  for (const scan of recentScans) {
    const findings = Array.isArray(scan.findings) ? scan.findings : [];
    for (const finding of findings) {
      const key = `${finding.category}:${finding.file}`;
      const existing = findingCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        findingCounts.set(key, {
          count: 1,
          description: finding.description ?? "",
          severity: finding.severity ?? "info",
        });
      }
    }
  }

  // Sort by count desc and take top 10
  const topFindings = Array.from(findingCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([key, val]) => ({
      category: key.split(":")[0],
      file: key.split(":").slice(1).join(":"),
      severity: val.severity,
      description: val.description,
      reportCount: val.count,
    }));

  const result = {
    sourceId,
    totalScans,
    riskBreakdown,
    topFindings,
    lastScannedAt,
  };

  // Cache in KV with 300s TTL (non-blocking)
  c.executionCtx.waitUntil(
    c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 }).catch(() => {})
  );

  return c.json(result);
});
