import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { enrichUsersWithGithubUsername } from "../lib/users";

export const dashboardRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

dashboardRoute.use("*", authMiddleware);

/**
 * GET /dashboard/skills
 * Consumer view: returns all private skills, orgs, and catalogs the user has access to.
 */
dashboardRoute.get("/dashboard/skills", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  // Get all namespace access rows for this user (excluding "public" namespace)
  const accessRows = await db.namespaceAccess.findMany({
    where: {
      userId,
      namespaceId: { not: "public" },
    },
    include: {
      namespace: true,
    },
    orderBy: { grantedAt: "desc" },
  });

  // Categorize by namespace type
  const skillNamespaceIds: string[] = [];
  const orgNamespaceIds: string[] = [];
  const pubNamespaceIds: string[] = [];

  for (const row of accessRows) {
    if (row.namespaceId.startsWith("skill_")) {
      skillNamespaceIds.push(row.namespaceId);
    } else if (row.namespaceId.startsWith("org_")) {
      orgNamespaceIds.push(row.namespaceId);
    } else if (row.namespaceId.startsWith("pub_")) {
      pubNamespaceIds.push(row.namespaceId);
    }
  }

  // --- Shared skills ---
  const shared: Array<{
    skill: { id: string; slug: string; name: string; description: string };
    sharedBy: { id: string; name: string; githubUsername: string | null } | null;
    grantedAt: string;
    namespaceId: string;
  }> = [];

  if (skillNamespaceIds.length > 0) {
    // Extract skill IDs from namespace IDs (skill_{skillId})
    const skillIds = skillNamespaceIds.map((ns) => ns.replace("skill_", ""));

    const skills = await db.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, slug: true, name: true, description: true },
    });

    const skillMap = new Map(skills.map((s) => [s.id, s]));

    // Collect grantedBy user IDs for enrichment
    const granterIds: string[] = [];
    const accessBySkillId = new Map<
      string,
      { grantedBy: string | null; grantedAt: Date; namespaceId: string }
    >();

    for (const row of accessRows) {
      if (row.namespaceId.startsWith("skill_")) {
        const skillId = row.namespaceId.replace("skill_", "");
        accessBySkillId.set(skillId, {
          grantedBy: row.grantedBy ?? null,
          grantedAt: row.grantedAt,
          namespaceId: row.namespaceId,
        });
        if (row.grantedBy) {
          granterIds.push(row.grantedBy);
        }
      }
    }

    // Fetch granter user info
    const granterUsers =
      granterIds.length > 0
        ? await db.user.findMany({
            where: { id: { in: granterIds } },
            select: { id: true, name: true },
          })
        : [];
    const granterMap = new Map(granterUsers.map((u) => [u.id, u]));

    // Enrich granters with GitHub usernames
    const granterGithubMap =
      granterIds.length > 0
        ? await enrichUsersWithGithubUsername(db, granterIds)
        : new Map<string, string>();

    for (const skillId of skillIds) {
      const skill = skillMap.get(skillId);
      const access = accessBySkillId.get(skillId);
      if (!skill || !access) continue;

      let sharedBy: {
        id: string;
        name: string;
        githubUsername: string | null;
      } | null = null;

      if (access.grantedBy) {
        const granter = granterMap.get(access.grantedBy);
        if (granter) {
          sharedBy = {
            id: granter.id,
            name: granter.name,
            githubUsername: granterGithubMap.get(granter.id) ?? null,
          };
        }
      }

      shared.push({
        skill: {
          id: skill.id,
          slug: skill.slug,
          name: skill.name,
          description: skill.description,
        },
        sharedBy,
        grantedAt: access.grantedAt.toISOString(),
        namespaceId: access.namespaceId,
      });
    }
  }

  // --- Orgs ---
  const orgs: Array<{
    org: {
      id: string;
      slug: string;
      name: string;
      avatarUrl: string | null;
    };
    skillCount: number;
  }> = [];

  if (orgNamespaceIds.length > 0) {
    // Extract org IDs from namespace IDs (org_{orgId})
    const orgIds = orgNamespaceIds.map((ns) => ns.replace("org_", ""));

    const organizations = await db.organization.findMany({
      where: { id: { in: orgIds } },
      select: {
        id: true,
        slug: true,
        name: true,
        avatarUrl: true,
        _count: { select: { skills: true } },
      },
    });

    for (const org of organizations) {
      orgs.push({
        org: {
          id: org.id,
          slug: org.slug,
          name: org.name,
          avatarUrl: org.avatarUrl,
        },
        skillCount: org._count.skills,
      });
    }
  }

  // --- Catalogs (pub_*) ---
  const catalogs: Array<{
    namespace: { id: string; name: string };
    skillCount: number;
  }> = [];

  if (pubNamespaceIds.length > 0) {
    // Count skill chunks per pub namespace
    for (const nsId of pubNamespaceIds) {
      const row = accessRows.find((r) => r.namespaceId === nsId);
      if (!row) continue;

      const chunkCount = await db.skillChunk.groupBy({
        by: ["skillId"],
        where: { namespace: nsId },
      });

      catalogs.push({
        namespace: {
          id: row.namespace.id,
          name: row.namespace.name,
        },
        skillCount: chunkCount.length,
      });
    }
  }

  return c.json({ shared, orgs, catalogs });
});

/**
 * DELETE /dashboard/skills/:namespaceId
 * Leave a shared skill (remove own namespace access).
 * Only allows leaving skill_* namespaces.
 */
dashboardRoute.delete("/dashboard/skills/:namespaceId", async (c) => {
  const namespaceId = c.req.param("namespaceId");
  const db = c.var.db;
  const userId = c.var.userId;

  // Only allow leaving skill_* namespaces
  if (!namespaceId.startsWith("skill_")) {
    return c.json(
      { error: "Can only leave skill namespaces via this endpoint" },
      400,
    );
  }

  const existing = await db.namespaceAccess.findFirst({
    where: { namespaceId, userId },
  });

  if (existing) {
    await db.namespaceAccess.delete({
      where: { id: existing.id },
    });
  }

  return c.body(null, 204);
});
