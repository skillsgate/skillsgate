import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import {
  findUserByGithubUsername,
  enrichUsersWithGithubUsername,
} from "../lib/users";

export const sharesRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

sharesRoute.use("*", authMiddleware);

/**
 * GET /skills/:skillId/shares
 * List all users who have access to a private skill.
 * Authorization: caller must be the skill's publisherId (owner).
 */
sharesRoute.get("/skills/:skillId/shares", async (c) => {
  const skillId = c.req.param("skillId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify skill exists and caller is the publisher
  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { id: true, publisherId: true },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  if (skill.publisherId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const namespaceId = `skill_${skillId}`;

  const accessRows = await db.namespaceAccess.findMany({
    where: { namespaceId },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { grantedAt: "desc" },
  });

  // Enrich with GitHub usernames
  const userIds = accessRows.map((row) => row.user.id);
  const githubMap = await enrichUsersWithGithubUsername(db, userIds);

  const shares = accessRows.map((row) => ({
    user: {
      id: row.user.id,
      name: row.user.name,
      image: row.user.image,
      githubUsername: githubMap.get(row.user.id) ?? null,
    },
    role: row.role,
    grantedAt: row.grantedAt.toISOString(),
  }));

  return c.json({ shares });
});

/**
 * POST /skills/:skillId/shares
 * Share a private skill with a user by GitHub username.
 * Authorization: caller must be the skill's publisherId.
 * Body: { githubUsername: string }
 */
sharesRoute.post("/skills/:skillId/shares", async (c) => {
  const skillId = c.req.param("skillId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify skill exists and caller is the publisher
  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { id: true, publisherId: true, name: true },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  if (skill.publisherId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json<{ githubUsername?: string }>();
  const githubUsername = body.githubUsername?.trim();

  if (!githubUsername) {
    return c.json({ error: "githubUsername is required" }, 400);
  }

  // Look up user by GitHub username
  const targetUser = await findUserByGithubUsername(db, githubUsername);
  if (!targetUser) {
    return c.json(
      { error: "User not found on SkillsGate", code: "USER_NOT_FOUND" },
      404,
    );
  }

  const namespaceId = `skill_${skillId}`;

  // Ensure the namespace exists (should already exist for private skills)
  await db.namespace.upsert({
    where: { id: namespaceId },
    create: {
      id: namespaceId,
      name: skill.name ?? skillId,
      type: "personal",
      ownerId: userId,
    },
    update: {},
  });

  // Insert namespace access
  try {
    const access = await db.namespaceAccess.create({
      data: {
        namespaceId,
        userId: targetUser.id,
        role: "reader",
        grantedBy: userId,
      },
    });

    return c.json(
      {
        share: {
          user: {
            id: targetUser.id,
            name: targetUser.name,
            image: targetUser.image,
            githubUsername: targetUser.githubUsername,
          },
          role: access.role,
          grantedAt: access.grantedAt.toISOString(),
        },
      },
      201,
    );
  } catch (err: unknown) {
    // Handle unique constraint violation (already shared)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return c.json({ error: "Skill is already shared with this user" }, 409);
    }
    throw err;
  }
});

/**
 * DELETE /skills/:skillId/shares/:userId
 * Revoke a user's access to a private skill.
 * Authorization: caller must be the skill's publisherId.
 */
sharesRoute.delete("/skills/:skillId/shares/:userId", async (c) => {
  const skillId = c.req.param("skillId");
  const targetUserId = c.req.param("userId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify skill exists and caller is the publisher
  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { id: true, publisherId: true },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  if (skill.publisherId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const namespaceId = `skill_${skillId}`;

  // Find and delete the access record
  const existing = await db.namespaceAccess.findFirst({
    where: { namespaceId, userId: targetUserId },
  });

  if (existing) {
    await db.namespaceAccess.delete({
      where: { id: existing.id },
    });
  }

  return c.body(null, 204);
});
