import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { Skill } from "../types.js";
import { SKILL_MD, SKIP_DIRS, MAX_SKILL_DEPTH } from "../constants.js";
import {
  getPluginSkillPaths,
  getPluginGroupings,
} from "./plugin-manifest.js";

// ---------- Priority search directories ----------
// Matches upstream vercel-labs/skills exactly

const PRIORITY_SEARCH_SUFFIXES = [
  "",
  "skills",
  "skills/.curated",
  "skills/.experimental",
  "skills/.system",
  ".agent/skills",
  ".agents/skills",
  ".claude/skills",
  ".cline/skills",
  ".codebuddy/skills",
  ".codex/skills",
  ".commandcode/skills",
  ".continue/skills",
  ".github/skills",
  ".goose/skills",
  ".iflow/skills",
  ".junie/skills",
  ".kilocode/skills",
  ".kiro/skills",
  ".mux/skills",
  ".neovate/skills",
  ".opencode/skills",
  ".openhands/skills",
  ".pi/skills",
  ".qoder/skills",
  ".roo/skills",
  ".trae/skills",
  ".windsurf/skills",
  ".zencoder/skills",
];

// ---------- Helpers ----------

async function hasSkillMd(dir: string): Promise<boolean> {
  try {
    const skillPath = path.join(dir, SKILL_MD);
    const stats = await fs.stat(skillPath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Parse a single SKILL.md file into a Skill object.
 */
export async function parseSkillMd(filePath: string): Promise<Skill | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter } = matter(raw);

    if (
      typeof frontmatter.name !== "string" ||
      typeof frontmatter.description !== "string"
    ) {
      return null;
    }

    return {
      name: frontmatter.name,
      description: frontmatter.description,
      filePath,
      content: raw,
      metadata: frontmatter,
    };
  } catch {
    return null;
  }
}

// ---------- Recursive directory walker ----------

/**
 * Recursively find directories containing SKILL.md, up to maxDepth.
 * Uses Promise.all for parallel traversal (matches upstream).
 */
async function findSkillDirs(
  dir: string,
  depth = 0,
  maxDepth = MAX_SKILL_DEPTH,
): Promise<string[]> {
  if (depth > maxDepth) return [];

  try {
    const [hasSkill, entries] = await Promise.all([
      hasSkillMd(dir),
      fs.readdir(dir, { withFileTypes: true }).catch(() => []),
    ]);

    const currentDir = hasSkill ? [dir] : [];

    const subDirResults = await Promise.all(
      entries
        .filter(
          (entry) =>
            entry.isDirectory() && !SKIP_DIRS.has(entry.name),
        )
        .map((entry) =>
          findSkillDirs(
            path.join(dir, entry.name),
            depth + 1,
            maxDepth,
          ),
        ),
    );

    return [...currentDir, ...subDirResults.flat()];
  } catch {
    return [];
  }
}

// ---------- Main Discovery ----------

export interface DiscoverSkillsOptions {
  includeInternal?: boolean;
  fullDepth?: boolean;
}

/**
 * Discover all skills in a directory.
 * Matches the upstream vercel-labs/skills discoverSkills() algorithm exactly:
 *
 * 1. Check if root itself has SKILL.md -> early return (unless fullDepth)
 * 2. Scan 29+ priority directories (one level deep into child dirs)
 *    + plugin manifest directories
 * 3. Fallback: recursive scan if nothing found (or fullDepth)
 *
 * Deduplicates by skill name.
 */
export async function discoverSkills(
  basePath: string,
  subpath?: string,
  options?: DiscoverSkillsOptions,
): Promise<Skill[]> {
  const skills: Skill[] = [];
  const seenNames = new Set<string>();
  const searchPath = subpath
    ? path.join(basePath, subpath)
    : basePath;

  // Load plugin groupings for labeling
  const pluginGroupings = await getPluginGroupings(searchPath);

  const enhanceSkill = (skill: Skill): Skill => {
    const resolvedPath = path.resolve(path.dirname(skill.filePath));
    if (pluginGroupings.has(resolvedPath)) {
      skill.plugin = pluginGroupings.get(resolvedPath);
    }
    return skill;
  };

  const addSkill = (skill: Skill): boolean => {
    if (seenNames.has(skill.name)) return false;
    seenNames.add(skill.name);
    skills.push(enhanceSkill(skill));
    return true;
  };

  // STEP 1: Check if searchPath itself is a skill directory
  if (await hasSkillMd(searchPath)) {
    const skill = await parseSkillMd(
      path.join(searchPath, SKILL_MD),
    );
    if (skill) {
      addSkill(skill);
      if (!options?.fullDepth) {
        return skills;
      }
    }
  }

  // STEP 2: Build priority search directories
  const prioritySearchDirs = PRIORITY_SEARCH_SUFFIXES.map((suffix) =>
    suffix ? path.join(searchPath, suffix) : searchPath,
  );

  // Add plugin manifest directories
  prioritySearchDirs.push(
    ...(await getPluginSkillPaths(searchPath)),
  );

  // STEP 2b: For each priority dir, scan immediate child directories
  for (const dir of prioritySearchDirs) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillDir = path.join(dir, entry.name);
          if (await hasSkillMd(skillDir)) {
            const skill = await parseSkillMd(
              path.join(skillDir, SKILL_MD),
            );
            if (skill) {
              addSkill(skill);
            }
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  // STEP 3: Fallback recursive search if nothing found, or fullDepth
  if (skills.length === 0 || options?.fullDepth) {
    const allSkillDirs = await findSkillDirs(searchPath);

    for (const skillDir of allSkillDirs) {
      const skill = await parseSkillMd(
        path.join(skillDir, SKILL_MD),
      );
      if (skill) {
        addSkill(skill);
      }
    }
  }

  return skills;
}

/**
 * Filter skills by name (case-insensitive).
 */
export function filterSkills(
  skills: Skill[],
  filterName: string,
): Skill[] {
  if (filterName === "*") return skills;
  const lower = filterName.toLowerCase();
  return skills.filter((s) => s.name.toLowerCase() === lower);
}
