import { Hono } from "hono";
import { z } from "zod";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { parseSkillMd } from "../lib/skill-parser.js";
import { vectorizeSkill } from "../lib/vectorize.js";

export const skillsRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

skillsRoute.use("*", authMiddleware);

// ─── Validation schemas ──────────────────────────────────────────

const createSkillSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with hyphens",
  }),
  description: z.string().min(1).max(2000),
  visibility: z.enum(["public", "private"]),
});

// ─── POST /skills — Create a new skill ──────────────────────────

skillsRoute.post("/skills", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const body = await c.req.json();
  const parsed = createSkillSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
    );
  }

  const { name, slug, description, visibility } = parsed.data;

  // Check slug uniqueness
  const existing = await db.skill.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    return c.json({ error: "Slug is already taken" }, 409);
  }

  // Generate a cuid-style ID
  const skillId = crypto.randomUUID();

  const skill = await db.skill.create({
    data: {
      id: skillId,
      slug,
      name,
      description,
      visibility,
      publisherId: userId,
      sourceType: "direct",
    },
  });

  // For private skills, create a namespace and grant publisher access
  if (visibility === "private") {
    const namespaceId = `skill_${skillId}`;

    await db.namespace.create({
      data: {
        id: namespaceId,
        name,
        type: "personal",
        ownerId: userId,
      },
    });

    await db.namespaceAccess.create({
      data: {
        namespaceId,
        userId,
        role: "publisher",
        grantedBy: userId,
      },
    });
  }

  return c.json(
    {
      skill: {
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        description: skill.description,
        visibility: skill.visibility,
        sourceType: skill.sourceType,
        createdAt: skill.createdAt.toISOString(),
        updatedAt: skill.updatedAt.toISOString(),
      },
    },
    201,
  );
});

// ─── POST /skills/:id/files — Upload files to R2 ───────────────

skillsRoute.post("/skills/:id/files", async (c) => {
  const skillId = c.req.param("id");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify skill exists and caller is publisher
  const skill = await db.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  if (skill.publisherId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Parse multipart form data
  const formData = await c.req.formData();
  const files: { name: string; size: number; key: string }[] = [];
  let skillMdContent: string | null = null;

  for (const [fieldName, value] of formData.entries()) {
    if (!(value instanceof File)) continue;

    const file = value as File;
    const filename = file.name || fieldName;
    const key = `skills/${skillId}/${filename}`;
    const arrayBuffer = await file.arrayBuffer();

    await c.env.R2_SKILLS.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    files.push({ name: filename, size: file.size, key });

    if (filename === "SKILL.md") {
      skillMdContent = new TextDecoder().decode(arrayBuffer);
    }
  }

  if (!skillMdContent) {
    return c.json({ error: "SKILL.md file is required" }, 400);
  }

  // Parse SKILL.md for metadata
  const metadata = parseSkillMd(skillMdContent);

  // Update skill with extracted metadata and mark as published
  const updatedSkill = await db.skill.update({
    where: { id: skillId },
    data: {
      ...(metadata.name && { name: metadata.name }),
      ...(metadata.description && { description: metadata.description }),
      ...(metadata.summary && { summary: metadata.summary }),
      ...(metadata.categories && { categories: metadata.categories }),
      ...(metadata.capabilities && { capabilities: metadata.capabilities }),
      ...(metadata.keywords && { keywords: metadata.keywords }),
      publishedAt: new Date(),
    },
  });

  // Queue vectorization in the background
  c.executionCtx.waitUntil(
    vectorizeSkill(c.var.db, c.env.OPENAI_API_KEY, c.env.R2_SKILLS, skillId),
  );

  return c.json({
    skill: {
      id: updatedSkill.id,
      slug: updatedSkill.slug,
      name: updatedSkill.name,
      description: updatedSkill.description,
      visibility: updatedSkill.visibility,
      publishedAt: updatedSkill.publishedAt?.toISOString() ?? null,
    },
    files,
  });
});

// ─── DELETE /skills/:id — Delete a skill ────────────────────────

skillsRoute.delete("/skills/:id", async (c) => {
  const skillId = c.req.param("id");
  const db = c.var.db;
  const userId = c.var.userId;

  // Verify skill exists and caller is publisher
  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { id: true, publisherId: true, visibility: true },
  });

  if (!skill) {
    return c.json({ error: "Skill not found" }, 404);
  }
  if (skill.publisherId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Delete all R2 objects under skills/{skillId}/
  const prefix = `skills/${skillId}/`;
  let cursor: string | undefined;

  do {
    const listed = await c.env.R2_SKILLS.list({ prefix, cursor });

    if (listed.objects.length > 0) {
      const keys = listed.objects.map((obj) => obj.key);
      await c.env.R2_SKILLS.delete(keys);
    }

    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  // Delete the skill record (CASCADE handles skill_chunks and namespace_access)
  await db.skill.delete({
    where: { id: skillId },
  });

  // If private, clean up the namespace
  if (skill.visibility === "private") {
    const namespaceId = `skill_${skillId}`;
    try {
      await db.namespace.delete({
        where: { id: namespaceId },
      });
    } catch {
      // Namespace may not exist if it was never created; ignore
    }
  }

  return c.body(null, 204);
});
