import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { enrichUsersWithGithubUsername } from "../lib/users";

export const publisherRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

publisherRoute.use("*", authMiddleware);

/**
 * GET /dashboard/publisher/skills
 * Publisher skills list: all skills where the caller is the publisher.
 * Includes share count (private), buyer count (premium), and downloads.
 */
publisherRoute.get("/dashboard/publisher/skills", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const skills = await db.skill.findMany({
    where: { publisherId: userId },
    orderBy: { updatedAt: "desc" },
  });

  const results = await Promise.all(
    skills.map(async (skill) => {
      let shareCount: number | null = null;
      let buyerCount: number | null = null;

      if (skill.visibility === "private") {
        shareCount = await db.namespaceAccess.count({
          where: { namespaceId: `skill_${skill.id}` },
        });
      }

      if (skill.visibility === "premium") {
        buyerCount = await db.purchase.count({
          where: { namespaceId: `skill_${skill.id}` },
        });
      }

      return {
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        description: skill.description,
        visibility: skill.visibility,
        shareCount,
        buyerCount,
        downloads: skill.downloads,
        createdAt: skill.createdAt.toISOString(),
        updatedAt: skill.updatedAt.toISOString(),
      };
    }),
  );

  return c.json({ skills: results });
});

/**
 * GET /dashboard/publisher/skills/:id
 * Single skill detail with sharing information.
 * Authorization: caller must be the skill's publisherId.
 */
publisherRoute.get("/dashboard/publisher/skills/:id", async (c) => {
  const skillId = c.req.param("id");
  const db = c.var.db;
  const userId = c.var.userId;

  const skill = await db.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  if (skill.publisherId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const namespaceId = `skill_${skillId}`;

  // Get sharing list
  const accessRows = await db.namespaceAccess.findMany({
    where: { namespaceId },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { grantedAt: "desc" },
  });

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

  return c.json({
    skill: {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      visibility: skill.visibility,
      sourceType: skill.sourceType,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
      downloads: skill.downloads,
      priceCents: skill.priceCents ?? null,
    },
    shares,
    shareCount: shares.length,
    shareLimit: 10,
  });
});
