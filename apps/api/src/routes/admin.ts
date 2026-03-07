import { Hono } from "hono";
import { z } from "zod";
import { createDatabaseClient } from "@skillsgate/database";
import type { Bindings, Variables, VectorizeSkillWorkflowInput, DiscoverRepoQueueMessage } from "../types";

/**
 * Validation schema for vectorize-skill request body
 */
const vectorizeSkillSchema = z.object({
  sourceId: z.string().min(1, "sourceId is required"),
  source: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("r2"),
      r2Key: z.string().min(1, "r2Key is required for r2 source")
    }),
    z.object({
      type: z.literal("github"),
      repo: z.string().min(1, "repo is required for github source"),
      path: z.string().min(1, "path is required for github source"),
      ref: z.string().optional()
    })
  ]),
  metadata: z.object({
    slug: z.string().min(1, "slug is required"),
    visibility: z.enum(["public", "private", "premium"]),
    publisherId: z.string().min(1, "publisherId is required"),
    orgId: z.string().optional(),
    sourceType: z.enum(["r2", "github"]),
    priceCents: z.number().int().nonnegative().optional()
  }),
  namespace: z.string().min(1, "namespace is required"),
  options: z.object({
    force: z.boolean().optional()
  }).optional()
});

/**
 * Validation schema for discover-repo request body
 */
const discoverRepoSchema = z.object({
  githubOwner: z.string().min(1),
  githubRepo: z.string().min(1),
  defaultBranch: z.string().min(1).default('main'),
  source: z.string().optional().default('csv_import'),
});

export const adminRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

/**
 * POST /api/admin/vectorize-skill
 * 
 * Queue a skill for vectorization.
 * 
 * Headers:
 *   - X-Internal-Api-Key: Secret internal API key for authentication
 * 
 * Body:
 *   - sourceId: Canonical source identifier
 *   - source: Source location (r2, github, or direct)
 *   - metadata: Skill metadata (slug, visibility, publisherId, etc.)
 *   - namespace: Namespace for vector chunks
 *   - options: Optional processing options (force)
 * 
 * Returns 202 Accepted on success with queue confirmation.
 */
adminRoute.post("/admin/vectorize-skill", async (c) => {
  // Verify internal API key
  const apiKey = c.req.header('X-Internal-Api-Key');
  if (!apiKey || apiKey !== c.env.INTERNAL_API_KEY) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid or missing X-Internal-Api-Key header'
    }, 401);
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body'
    }, 400);
  }

  const parseResult = vectorizeSkillSchema.safeParse(body);

  if (!parseResult.success) {
    const errors = parseResult.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return c.json({
      error: 'Validation failed',
      message: 'Request body validation failed',
      details: errors
    }, 400);
  }

  const payload: VectorizeSkillWorkflowInput = parseResult.data;

  try {
    // Enqueue the vectorization job
    await c.env.VECTORIZE_QUEUE.send(payload);

    return c.json({
      status: 'queued',
      sourceId: payload.sourceId,
      message: 'Vectorization job queued successfully'
    }, 202);
  } catch (error) {
    console.error('[admin] Failed to enqueue vectorization job:', error);

    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to queue vectorization job'
    }, 500);
  }
});

/**
 * POST /api/admin/discover-repo
 *
 * Queue a repository for skill discovery.
 *
 * Headers:
 *   - X-Internal-Api-Key: Secret internal API key for authentication
 *
 * Body:
 *   - githubOwner: GitHub repository owner
 *   - githubRepo: GitHub repository name
 *   - defaultBranch: Default branch name (defaults to 'main')
 *   - source: Discovery source identifier (defaults to 'csv_import')
 *
 * Returns 202 Accepted on success with queue confirmation.
 */
adminRoute.post("/admin/discover-repo", async (c) => {
  // Verify internal API key
  const apiKey = c.req.header('X-Internal-Api-Key');
  if (!apiKey || apiKey !== c.env.INTERNAL_API_KEY) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid or missing X-Internal-Api-Key header'
    }, 401);
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body'
    }, 400);
  }

  const parseResult = discoverRepoSchema.safeParse(body);

  if (!parseResult.success) {
    const errors = parseResult.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return c.json({
      error: 'Validation failed',
      message: 'Request body validation failed',
      details: errors
    }, 400);
  }

  const { githubOwner, githubRepo, defaultBranch, source } = parseResult.data;

  try {
    const db = createDatabaseClient(c.env.HYPERDRIVE.connectionString);

    // Upsert into discovered_repos
    const id = crypto.randomUUID();
    const rows: any[] = await (db as any).$queryRawUnsafe(
      `INSERT INTO discovered_repos (id, github_owner, github_repo, default_branch, source, discovery_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       ON CONFLICT (github_owner, github_repo)
       DO UPDATE SET discovery_status = 'pending', default_branch = EXCLUDED.default_branch, updated_at = NOW()
       RETURNING id`,
      id,
      githubOwner,
      githubRepo,
      defaultBranch,
      source,
    );

    const discoveredRepoId = rows[0].id as string;

    // Enqueue the discovery job
    const message: DiscoverRepoQueueMessage = {
      discoveredRepoId,
      githubOwner,
      githubRepo,
      defaultBranch,
    };
    await c.env.DISCOVERY_QUEUE.send(message);

    return c.json({
      status: 'queued',
      githubOwner,
      githubRepo,
    }, 202);
  } catch (error) {
    console.error('[admin] Failed to queue repo discovery:', error);

    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to queue repo discovery job'
    }, 500);
  }
});

/**
 * GET /api/admin/health
 *
 * Health check endpoint for admin API.
 * Returns basic status information.
 */
adminRoute.get("/admin/health", async (c) => {
  // Verify internal API key
  const apiKey = c.req.header('X-Internal-Api-Key');
  if (!apiKey || apiKey !== c.env.INTERNAL_API_KEY) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid or missing X-Internal-Api-Key header'
    }, 401);
  }

  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'skillsgate-admin-api'
  }, 200);
});
