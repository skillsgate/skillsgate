// ─── GitHub Sync Engine ──────────────────────────────────────────
//
// Orchestrates the full sync cycle: discover SKILL.md files in a
// connected GitHub repo, upsert skills, upload files to R2,
// queue vectorization, and clean up deleted skills.

import { fetchRepoTree, fetchFileContent, fetchFileText } from "./github-api";
import { parseSkillMd } from "./skill-parser";
import { enqueueSkillVectorization } from "./vectorize";
import type { TreeEntry } from "./github-api";
import type { VectorizeSkillWorkflowInput, SkillMetadata } from "../types";

// ─── Types ───────────────────────────────────────────────────────

export interface SyncResult {
  skillsCreated: number;
  skillsUpdated: number;
  skillsDeleted: number;
  errors: Array<{ path: string; error: string }>;
}

export interface SyncRepoParams {
  connectedRepoId: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  githubToken: string;
  publisherId: string;
  db: any; // Prisma DatabaseClient
  r2: R2Bucket;
  openaiApiKey: string;
  vectorizeQueue: Queue<VectorizeSkillWorkflowInput>;
}

export interface DisconnectRepoParams {
  connectedRepoId: string;
  db: any;
  r2: R2Bucket;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Derive a URL-safe slug from a directory name.
 * Lowercases, replaces non-alphanumeric sequences with hyphens, trims hyphens.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get the parent directory of a path, or "." for root-level files.
 */
function parentDir(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? "." : path.substring(0, idx);
}

/**
 * Get the filename portion of a path.
 */
function fileName(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? path : path.substring(idx + 1);
}

/**
 * Delete all R2 objects under a given prefix.
 */
async function deleteR2Prefix(r2: R2Bucket, prefix: string): Promise<void> {
  let cursor: string | undefined;
  do {
    const listed = await r2.list({ prefix, cursor });
    if (listed.objects.length > 0) {
      const keys = listed.objects.map((obj) => obj.key);
      await r2.delete(keys);
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

// ─── Skill directory grouping ────────────────────────────────────

interface SkillDirectory {
  /** The directory containing the SKILL.md (or "." for root) */
  dir: string;
  /** Path to the SKILL.md within the repo */
  skillMdPath: string;
  /** All blob entries that belong to this skill directory */
  files: TreeEntry[];
}

/**
 * Discover SKILL.md files in the tree and group sibling files by
 * each SKILL.md's parent directory.
 */
function discoverSkillDirectories(tree: TreeEntry[]): SkillDirectory[] {
  // Find all SKILL.md entries (case-sensitive)
  const skillMdEntries = tree.filter(
    (entry) => entry.type === "blob" && fileName(entry.path) === "SKILL.md",
  );

  const directories: SkillDirectory[] = [];

  for (const skillMdEntry of skillMdEntries) {
    const dir = parentDir(skillMdEntry.path);

    // Collect all blobs that are direct children of this directory
    const files = tree.filter((entry) => {
      if (entry.type !== "blob") return false;
      return parentDir(entry.path) === dir;
    });

    directories.push({
      dir,
      skillMdPath: skillMdEntry.path,
      files,
    });
  }

  return directories;
}

// ─── Main sync ───────────────────────────────────────────────────

export async function syncRepo(params: SyncRepoParams): Promise<SyncResult> {
  const {
    connectedRepoId,
    githubOwner,
    githubRepo,
    githubBranch,
    githubToken,
    publisherId,
    db,
    r2,
    openaiApiKey,
    vectorizeQueue,
  } = params;

  const result: SyncResult = {
    skillsCreated: 0,
    skillsUpdated: 0,
    skillsDeleted: 0,
    errors: [],
  };

  try {
    // 1. Mark sync as in-progress
    await db.connectedRepo.update({
      where: { id: connectedRepoId },
      data: { syncStatus: "syncing", syncError: null },
    });

    // 2. Fetch full repo tree
    const tree = await fetchRepoTree(githubToken, githubOwner, githubRepo, githubBranch);

    // 3. Discover skill directories
    const skillDirs = discoverSkillDirectories(tree);

    // 4. Track which slugs we discover (for deletion detection)
    const discoveredSlugs = new Set<string>();

    // 5. Process each skill directory
    for (const skillDir of skillDirs) {
      try {
        await processSkillDirectory({
          skillDir,
          connectedRepoId,
          githubOwner,
          githubRepo,
          githubBranch,
          githubToken,
          publisherId,
          db,
          r2,
          openaiApiKey,
          vectorizeQueue,
          result,
          discoveredSlugs,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push({ path: skillDir.skillMdPath, error: message });
        console.error(`[github-sync] Error processing ${skillDir.skillMdPath}: ${message}`);
      }
    }

    // 6. Handle deletions — remove skills whose slugs no longer exist in the repo
    await handleDeletions({
      connectedRepoId,
      discoveredSlugs,
      db,
      r2,
      result,
    });

    // 7. Update connected repo status
    const totalSkills = discoveredSlugs.size;
    await db.connectedRepo.update({
      where: { id: connectedRepoId },
      data: {
        skillCount: totalSkills,
        lastSyncedAt: new Date(),
        syncStatus: "synced",
        syncError: null,
      },
    });
  } catch (err) {
    // Top-level error: mark the repo as errored
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[github-sync] Sync failed for ${githubOwner}/${githubRepo}: ${message}`);

    try {
      await db.connectedRepo.update({
        where: { id: connectedRepoId },
        data: {
          syncStatus: "error",
          syncError: message.substring(0, 1000),
        },
      });
    } catch (updateErr) {
      console.error("[github-sync] Failed to update sync status:", updateErr);
    }
  }

  return result;
}

// ─── Process a single skill directory ────────────────────────────

interface ProcessSkillDirParams {
  skillDir: SkillDirectory;
  connectedRepoId: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  githubToken: string;
  publisherId: string;
  db: any;
  r2: R2Bucket;
  openaiApiKey: string;
  vectorizeQueue: Queue<VectorizeSkillWorkflowInput>;
  result: SyncResult;
  discoveredSlugs: Set<string>;
}

async function processSkillDirectory(params: ProcessSkillDirParams): Promise<void> {
  const {
    skillDir,
    connectedRepoId,
    githubOwner,
    githubRepo,
    githubBranch,
    githubToken,
    publisherId,
    db,
    r2,
    openaiApiKey,
    vectorizeQueue,
    result,
    discoveredSlugs,
  } = params;

  // a. Fetch SKILL.md text
  const skillMdContent = await fetchFileText(
    githubToken,
    githubOwner,
    githubRepo,
    skillDir.skillMdPath,
    githubBranch,
  );

  // b. Parse metadata
  const metadata = parseSkillMd(skillMdContent);

  // c. Determine slug: use directory name, or "root" for top-level SKILL.md
  const dirName = skillDir.dir === "." ? githubRepo : skillDir.dir.split("/").pop()!;
  const slug = slugify(dirName);

  if (!slug) {
    throw new Error(`Could not derive a valid slug from directory: ${skillDir.dir}`);
  }

  discoveredSlugs.add(slug);

  // d. Upsert skill record
  const existingSkill = await db.skill.findFirst({
    where: {
      connectedRepoId,
      sourceType: "github",
      slug,
    },
  });

  let skillId: string;
  const skillData = {
    name: metadata.name || dirName,
    description: metadata.description || `Skill from ${githubOwner}/${githubRepo}`,
    ...(metadata.summary && { summary: metadata.summary }),
    ...(metadata.categories && { categories: metadata.categories }),
    ...(metadata.capabilities && { capabilities: metadata.capabilities }),
    ...(metadata.keywords && { keywords: metadata.keywords }),
    githubRepo: `${githubOwner}/${githubRepo}`,
    githubPath: skillDir.dir === "." ? "" : skillDir.dir,
    publishedAt: new Date(),
  };

  if (existingSkill) {
    // Update existing skill
    skillId = existingSkill.id;
    await db.skill.update({
      where: { id: skillId },
      data: skillData,
    });
    result.skillsUpdated++;
  } else {
    // Create new skill
    skillId = crypto.randomUUID();
    await db.skill.create({
      data: {
        id: skillId,
        slug,
        sourceType: "github",
        connectedRepoId,
        publisherId,
        visibility: "public",
        ...skillData,
      },
    });
    result.skillsCreated++;
  }

  // e. Delete old R2 files for this skill
  await deleteR2Prefix(r2, `skills/${skillId}/`);

  // f. Upload all sibling files to R2
  for (const file of skillDir.files) {
    try {
      const content = await fetchFileContent(
        githubToken,
        githubOwner,
        githubRepo,
        file.path,
        githubBranch,
      );
      const filename = fileName(file.path);
      await r2.put(`skills/${skillId}/${filename}`, content);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push({ path: file.path, error: `Failed to upload: ${message}` });
      console.error(`[github-sync] Failed to upload ${file.path}: ${message}`);
    }
  }

  // g. Create namespace for private skills if needed
  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { visibility: true },
  });

  if (skill?.visibility === "private") {
    const namespaceId = `skill_${skillId}`;
    const existingNamespace = await db.namespace.findUnique({
      where: { id: namespaceId },
    });

    if (!existingNamespace) {
      await db.namespace.create({
        data: {
          id: namespaceId,
          name: metadata.name || dirName,
          type: "personal",
          ownerId: publisherId,
        },
      });

      await db.namespaceAccess.create({
        data: {
          namespaceId,
          userId: publisherId,
          role: "publisher",
          grantedBy: publisherId,
        },
      });
    }
  }

  // h. Queue vectorization via workflow for durable processing
  const vectorizeMetadata: SkillMetadata = {
    slug,
    visibility: skill?.visibility || 'public',
    publisherId,
    sourceType: 'github',
    orgId: undefined, // GitHub skills don't have orgId in current schema
  };

  try {
    await enqueueSkillVectorization(vectorizeQueue, skillId, vectorizeMetadata);
    console.log(`[github-sync] Queued vectorization for ${slug} (skill: ${skillId})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.errors.push({ path: skillDir.skillMdPath, error: `Failed to queue vectorization: ${message}` });
    console.error(`[github-sync] Failed to queue vectorization for ${slug}:`, message);
  }
}

// ─── Deletion handling ───────────────────────────────────────────

interface HandleDeletionsParams {
  connectedRepoId: string;
  discoveredSlugs: Set<string>;
  db: any;
  r2: R2Bucket;
  result: SyncResult;
}

async function handleDeletions(params: HandleDeletionsParams): Promise<void> {
  const { connectedRepoId, discoveredSlugs, db, r2, result } = params;

  // Find all skills for this connected repo
  const existingSkills = await db.skill.findMany({
    where: {
      connectedRepoId,
      sourceType: "github",
    },
    select: {
      id: true,
      slug: true,
      visibility: true,
    },
  });

  for (const skill of existingSkills) {
    if (discoveredSlugs.has(skill.slug)) continue;

    // This skill no longer exists in the repo — delete it
    try {
      // Delete R2 files
      await deleteR2Prefix(r2, `skills/${skill.id}/`);

      // Delete skill_chunks via raw SQL (to avoid generated client issues)
      await (db as any).$executeRawUnsafe(
        `DELETE FROM skill_chunks WHERE skill_id = $1`,
        skill.id,
      );

      // Delete the skill record
      await db.skill.delete({ where: { id: skill.id } });

      // Clean up private namespace if applicable
      if (skill.visibility === "private") {
        const namespaceId = `skill_${skill.id}`;
        try {
          await db.namespace.delete({ where: { id: namespaceId } });
        } catch {
          // Namespace may not exist; ignore
        }
      }

      result.skillsDeleted++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push({ path: `skill:${skill.slug}`, error: `Delete failed: ${message}` });
      console.error(`[github-sync] Failed to delete skill ${skill.slug}: ${message}`);
    }
  }
}

// ─── Disconnect repo ─────────────────────────────────────────────

/**
 * Clean up all resources for a connected repo: R2 files, skill_chunks,
 * skill records, and namespaces. Does NOT delete the connected_repos
 * record itself — the caller is responsible for that.
 */
export async function disconnectRepo(params: DisconnectRepoParams): Promise<void> {
  const { connectedRepoId, db, r2 } = params;

  // Find all skills belonging to this connected repo
  const skills = await db.skill.findMany({
    where: { connectedRepoId },
    select: { id: true, visibility: true },
  });

  for (const skill of skills) {
    // Delete R2 files
    await deleteR2Prefix(r2, `skills/${skill.id}/`);

    // Delete skill_chunks
    await (db as any).$executeRawUnsafe(
      `DELETE FROM skill_chunks WHERE skill_id = $1`,
      skill.id,
    );

    // Delete the skill record
    await db.skill.delete({ where: { id: skill.id } });

    // Clean up private namespace
    if (skill.visibility === "private") {
      const namespaceId = `skill_${skill.id}`;
      try {
        await db.namespace.delete({ where: { id: namespaceId } });
      } catch {
        // Namespace may not exist; ignore
      }
    }
  }
}
