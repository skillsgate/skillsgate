import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import {
  findUserByGithubUsername,
  enrichUsersWithGithubUsername,
} from "../lib/users";

export const orgsRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

orgsRoute.use("*", authMiddleware);

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/**
 * POST /orgs
 * Create a new organization. The caller becomes the owner.
 */
orgsRoute.post("/orgs", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const body = await c.req.json<{ name?: string; slug?: string }>();
  const name = body.name?.trim();
  const slug = body.slug?.trim().toLowerCase();

  if (!name || name.length === 0) {
    return c.json({ error: "name is required" }, 400);
  }
  if (!slug || !SLUG_REGEX.test(slug)) {
    return c.json(
      {
        error:
          "slug must be 3-40 lowercase alphanumeric characters or hyphens, starting and ending with alphanumeric",
      },
      400,
    );
  }

  try {
    // Create org, membership, namespace, and namespace access in a transaction
    const org = await db.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          slug,
          name,
        },
      });

      // Make caller the owner
      await tx.organizationMember.create({
        data: {
          orgId: newOrg.id,
          userId,
          role: "owner",
        },
      });

      // Create namespace for the org
      const namespaceId = `org_${newOrg.id}`;
      await tx.namespace.create({
        data: {
          id: namespaceId,
          name,
          type: "org",
          ownerId: userId,
        },
      });

      // Give the caller publisher access to the org namespace
      await tx.namespaceAccess.create({
        data: {
          namespaceId,
          userId,
          role: "publisher",
        },
      });

      return newOrg;
    });

    return c.json(
      {
        org: {
          id: org.id,
          slug: org.slug,
          name: org.name,
        },
      },
      201,
    );
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return c.json({ error: "Organization slug is already taken" }, 409);
    }
    throw err;
  }
});

/**
 * GET /orgs/:orgId/members
 * List all members of an organization.
 * Authorization: caller must be a member.
 */
orgsRoute.get("/orgs/:orgId/members", async (c) => {
  const orgId = c.req.param("orgId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify caller is a member
  const callerMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!callerMembership) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const members = await db.organizationMember.findMany({
    where: { orgId },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const userIds = members.map((m) => m.user.id);
  const githubMap = await enrichUsersWithGithubUsername(db, userIds);

  const result = members.map((m) => ({
    user: {
      id: m.user.id,
      name: m.user.name,
      image: m.user.image,
      githubUsername: githubMap.get(m.user.id) ?? null,
    },
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
  }));

  return c.json({ members: result });
});

/**
 * POST /orgs/:orgId/members
 * Add a member to an organization by GitHub username.
 * Authorization: caller must be owner or admin.
 * Body: { githubUsername: string, role?: string }
 */
orgsRoute.post("/orgs/:orgId/members", async (c) => {
  const orgId = c.req.param("orgId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify caller is owner or admin
  const callerMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!callerMembership || !["owner", "admin"].includes(callerMembership.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json<{ githubUsername?: string; role?: string }>();
  const githubUsername = body.githubUsername?.trim();
  const role = body.role?.trim() ?? "member";

  if (!githubUsername) {
    return c.json({ error: "githubUsername is required" }, 400);
  }
  if (!["owner", "admin", "member"].includes(role)) {
    return c.json({ error: "role must be owner, admin, or member" }, 400);
  }

  // Look up user by GitHub username
  const targetUser = await findUserByGithubUsername(db, githubUsername);
  if (!targetUser) {
    return c.json(
      { error: "User not found on SkillsGate", code: "USER_NOT_FOUND" },
      404,
    );
  }

  try {
    const member = await db.$transaction(async (tx) => {
      // Add org membership
      const membership = await tx.organizationMember.create({
        data: {
          orgId,
          userId: targetUser.id,
          role,
        },
      });

      // Grant namespace access
      const namespaceId = `org_${orgId}`;
      await tx.namespaceAccess.create({
        data: {
          namespaceId,
          userId: targetUser.id,
          role: "reader",
        },
      });

      return membership;
    });

    return c.json(
      {
        member: {
          user: {
            id: targetUser.id,
            name: targetUser.name,
            image: targetUser.image,
            githubUsername: targetUser.githubUsername,
          },
          role: member.role,
          joinedAt: member.joinedAt.toISOString(),
        },
      },
      201,
    );
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return c.json({ error: "User is already a member of this organization" }, 409);
    }
    throw err;
  }
});

/**
 * DELETE /orgs/:orgId/members/:userId
 * Remove a member from an organization.
 * Authorization: caller must be owner or admin. Cannot remove the last owner.
 */
orgsRoute.delete("/orgs/:orgId/members/:userId", async (c) => {
  const orgId = c.req.param("orgId");
  const targetUserId = c.req.param("userId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify caller is owner or admin
  const callerMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!callerMembership || !["owner", "admin"].includes(callerMembership.role)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Check if the target user is an owner and if they are the last owner
  const targetMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId: targetUserId } },
  });
  if (!targetMembership) {
    return c.json({ error: "Member not found" }, 404);
  }

  if (targetMembership.role === "owner") {
    const ownerCount = await db.organizationMember.count({
      where: { orgId, role: "owner" },
    });
    if (ownerCount <= 1) {
      return c.json({ error: "Cannot remove the last owner" }, 400);
    }
  }

  // Delete membership and namespace access in a transaction
  await db.$transaction(async (tx) => {
    await tx.organizationMember.delete({
      where: { orgId_userId: { orgId, userId: targetUserId } },
    });

    const namespaceId = `org_${orgId}`;
    const access = await tx.namespaceAccess.findFirst({
      where: { namespaceId, userId: targetUserId },
    });
    if (access) {
      await tx.namespaceAccess.delete({
        where: { id: access.id },
      });
    }
  });

  return c.body(null, 204);
});

/**
 * PATCH /orgs/:orgId/members/:userId
 * Update a member's role.
 * Authorization: caller must be owner. Cannot demote the last owner.
 * Body: { role: string }
 */
orgsRoute.patch("/orgs/:orgId/members/:userId", async (c) => {
  const orgId = c.req.param("orgId");
  const targetUserId = c.req.param("userId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify caller is an owner
  const callerMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!callerMembership || callerMembership.role !== "owner") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const body = await c.req.json<{ role?: string }>();
  const newRole = body.role?.trim();

  if (!newRole || !["owner", "admin", "member"].includes(newRole)) {
    return c.json({ error: "role must be owner, admin, or member" }, 400);
  }

  // Check if demoting the last owner
  const targetMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId: targetUserId } },
  });
  if (!targetMembership) {
    return c.json({ error: "Member not found" }, 404);
  }

  if (targetMembership.role === "owner" && newRole !== "owner") {
    const ownerCount = await db.organizationMember.count({
      where: { orgId, role: "owner" },
    });
    if (ownerCount <= 1) {
      return c.json({ error: "Cannot demote the last owner" }, 400);
    }
  }

  const updated = await db.organizationMember.update({
    where: { orgId_userId: { orgId, userId: targetUserId } },
    data: { role: newRole },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const githubMap = await enrichUsersWithGithubUsername(db, [updated.user.id]);

  return c.json({
    member: {
      user: {
        id: updated.user.id,
        name: updated.user.name,
        image: updated.user.image,
        githubUsername: githubMap.get(updated.user.id) ?? null,
      },
      role: updated.role,
      joinedAt: updated.joinedAt.toISOString(),
    },
  });
});

/**
 * GET /orgs/:orgId/skills
 * List all skills belonging to an organization.
 * Authorization: caller must be a member.
 */
orgsRoute.get("/orgs/:orgId/skills", async (c) => {
  const orgId = c.req.param("orgId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify caller is a member
  const callerMembership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!callerMembership) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const skills = await db.skill.findMany({
    where: { orgId },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      sourceType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const result = skills.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    sourceType: s.sourceType,
    createdAt: s.createdAt.toISOString(),
  }));

  return c.json({ skills: result });
});
