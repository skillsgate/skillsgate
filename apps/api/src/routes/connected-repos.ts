import { Hono } from "hono";
import { z } from "zod";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { syncRepo, disconnectRepo } from "../lib/github-sync";
import { validateGitHubToken } from "../lib/github-token";

export const connectedReposRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

connectedReposRoute.use("*", authMiddleware);

// ─── Validation schemas ──────────────────────────────────────────

const connectRepoSchema = z.object({
  githubOwner: z.string().min(1),
  githubRepo: z.string().min(1),
  githubBranch: z.string().min(1).optional(),
});

// ─── Reauth error response helper ────────────────────────────────

function reauthError() {
  return {
    error: "github_reauth_required",
    message:
      "Your GitHub authorization has expired or lacks required permissions. Please re-authorize.",
  } as const;
}

// ─── GET /connected-repos — List user's connected repos ──────────

connectedReposRoute.get("/connected-repos", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const repos = await db.connectedRepo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return c.json({
    repos: repos.map((repo) => ({
      id: repo.id,
      githubOwner: repo.githubOwner,
      githubRepo: repo.githubRepo,
      githubBranch: repo.githubBranch,
      skillCount: repo.skillCount,
      lastSyncedAt: repo.lastSyncedAt?.toISOString() ?? null,
      syncStatus: repo.syncStatus,
      syncError: repo.syncError,
      createdAt: repo.createdAt.toISOString(),
    })),
  });
});

// ─── POST /connected-repos — Connect a new repo ─────────────────

connectedReposRoute.post("/connected-repos", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const body = await c.req.json();
  const parsed = connectRepoSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  const { githubOwner, githubRepo, githubBranch } = parsed.data;

  // Check if this repo is already connected by this user
  const existing = await db.connectedRepo.findFirst({
    where: { userId, githubOwner, githubRepo },
  });

  if (existing) {
    return c.json({ error: "Repository is already connected" }, 409);
  }

  // Get the user's GitHub token for syncing
  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
  });

  if (!account || !account.accessToken) {
    return c.json(reauthError(), 403);
  }

  // Validate the token before proceeding
  const tokenValid = await validateGitHubToken(account.accessToken);
  if (!tokenValid) {
    return c.json(reauthError(), 403);
  }

  const repoId = crypto.randomUUID();
  const branch = githubBranch ?? "main";

  const repo = await db.connectedRepo.create({
    data: {
      id: repoId,
      userId,
      githubOwner,
      githubRepo,
      githubBranch: branch,
      syncStatus: "syncing",
    },
  });

  // Trigger initial sync in the background
  c.executionCtx.waitUntil(
    syncRepo({
      connectedRepoId: repoId,
      githubOwner,
      githubRepo,
      githubBranch: branch,
      githubToken: account.accessToken,
      publisherId: userId,
      db,
      r2: c.env.R2_SKILLS,
      openaiApiKey: c.env.OPENAI_API_KEY,
    }),
  );

  return c.json(
    {
      repo: {
        id: repo.id,
        githubOwner: repo.githubOwner,
        githubRepo: repo.githubRepo,
        githubBranch: repo.githubBranch,
        skillCount: repo.skillCount,
        lastSyncedAt: repo.lastSyncedAt?.toISOString() ?? null,
        syncStatus: repo.syncStatus,
        syncError: repo.syncError,
        createdAt: repo.createdAt.toISOString(),
      },
    },
    201,
  );
});

// ─── GET /connected-repos/:id — Single repo detail ──────────────

connectedReposRoute.get("/connected-repos/:id", async (c) => {
  const repoId = c.req.param("id");
  const db = c.var.db;
  const userId = c.var.userId;

  const repo = await db.connectedRepo.findUnique({
    where: { id: repoId },
  });

  if (!repo) {
    return c.json({ error: "Connected repo not found" }, 404);
  }
  if (repo.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({
    repo: {
      id: repo.id,
      githubOwner: repo.githubOwner,
      githubRepo: repo.githubRepo,
      githubBranch: repo.githubBranch,
      skillCount: repo.skillCount,
      lastSyncedAt: repo.lastSyncedAt?.toISOString() ?? null,
      syncStatus: repo.syncStatus,
      syncError: repo.syncError,
      createdAt: repo.createdAt.toISOString(),
    },
  });
});

// ─── POST /connected-repos/:id/sync — Trigger re-sync ───────────

connectedReposRoute.post("/connected-repos/:id/sync", async (c) => {
  const repoId = c.req.param("id");
  const db = c.var.db;
  const userId = c.var.userId;

  const repo = await db.connectedRepo.findUnique({
    where: { id: repoId },
  });

  if (!repo) {
    return c.json({ error: "Connected repo not found" }, 404);
  }
  if (repo.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Get the user's GitHub token
  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
  });

  if (!account || !account.accessToken) {
    return c.json(reauthError(), 403);
  }

  // Validate the token before proceeding
  const tokenValid = await validateGitHubToken(account.accessToken);
  if (!tokenValid) {
    return c.json(reauthError(), 403);
  }

  // Mark as syncing
  await db.connectedRepo.update({
    where: { id: repoId },
    data: { syncStatus: "syncing", syncError: null },
  });

  // Trigger sync in the background
  c.executionCtx.waitUntil(
    syncRepo({
      connectedRepoId: repoId,
      githubOwner: repo.githubOwner,
      githubRepo: repo.githubRepo,
      githubBranch: repo.githubBranch,
      githubToken: account.accessToken,
      publisherId: userId,
      db,
      r2: c.env.R2_SKILLS,
      openaiApiKey: c.env.OPENAI_API_KEY,
    }),
  );

  return c.json({ message: "Sync started" });
});

// ─── DELETE /connected-repos/:id — Disconnect a repo ─────────────

connectedReposRoute.delete("/connected-repos/:id", async (c) => {
  const repoId = c.req.param("id");
  const db = c.var.db;
  const userId = c.var.userId;

  const repo = await db.connectedRepo.findUnique({
    where: { id: repoId },
  });

  if (!repo) {
    return c.json({ error: "Connected repo not found" }, 404);
  }
  if (repo.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Clean up associated skills and R2 objects
  await disconnectRepo({
    connectedRepoId: repoId,
    db,
    r2: c.env.R2_SKILLS,
  });

  // Delete the connected repo record
  await db.connectedRepo.delete({
    where: { id: repoId },
  });

  return c.body(null, 204);
});
