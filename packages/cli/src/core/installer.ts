import fs from "node:fs/promises";
import path from "node:path";
import {
  AgentConfig,
  InstallResult,
  InstallScope,
  InstallMethod,
  Skill,
} from "../types.js";
import { CANONICAL_SKILLS_DIR } from "../constants.js";

// ---------- Path Safety ----------

export function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isPathSafe(targetPath: string, baseDir: string): boolean {
  const resolved = path.resolve(targetPath);
  const resolvedBase = path.resolve(baseDir);
  return (
    resolved.startsWith(resolvedBase + path.sep) || resolved === resolvedBase
  );
}

// ---------- Installation ----------

export async function installSkillForAgent(
  skill: Skill,
  agent: AgentConfig,
  scope: InstallScope,
  method: InstallMethod,
): Promise<InstallResult> {
  const safeName = sanitizeName(skill.name);

  const agentSkillsDir =
    scope === "global"
      ? agent.globalSkillsDir
      : path.join(process.cwd(), agent.skillsDir);

  const agentTargetDir = path.join(agentSkillsDir, safeName);
  const canonicalDir = path.join(CANONICAL_SKILLS_DIR(), safeName);

  if (!isPathSafe(agentTargetDir, agentSkillsDir)) {
    return {
      skillName: skill.name,
      agent: agent.name,
      success: false,
      path: agentTargetDir,
      error: "Path traversal detected",
    };
  }

  try {
    if (method === "copy") {
      await writeSkillFiles(skill, agentTargetDir);
    } else {
      // Symlink mode: write to canonical, symlink from agent dir
      await writeSkillFiles(skill, canonicalDir);

      const resolvedCanonical = path.resolve(canonicalDir);
      const resolvedAgent = path.resolve(agentTargetDir);

      if (resolvedCanonical !== resolvedAgent) {
        const symlinkOk = await createSymlink(canonicalDir, agentTargetDir);
        if (!symlinkOk) {
          // Fallback to copy
          await writeSkillFiles(skill, agentTargetDir);
          return {
            skillName: skill.name,
            agent: agent.name,
            success: true,
            path: agentTargetDir,
            symlinkFailed: true,
          };
        }
      }
    }

    return {
      skillName: skill.name,
      agent: agent.name,
      success: true,
      path: method === "symlink" ? canonicalDir : agentTargetDir,
    };
  } catch (err: unknown) {
    return {
      skillName: skill.name,
      agent: agent.name,
      success: false,
      path: agentTargetDir,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function writeSkillFiles(
  skill: Skill,
  targetDir: string,
): Promise<void> {
  await cleanAndCreateDirectory(targetDir);
  await fs.writeFile(path.join(targetDir, "SKILL.md"), skill.content, "utf-8");

  const sourceDir = path.dirname(skill.filePath);
  await copyDirectory(sourceDir, targetDir);
}

async function cleanAndCreateDirectory(dir: string): Promise<void> {
  try {
    const stat = await fs.lstat(dir);
    if (stat.isSymbolicLink()) {
      await fs.unlink(dir);
    } else {
      await fs.rm(dir, { recursive: true, force: true });
    }
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ELOOP") {
      await fs.unlink(dir);
    } else if (code !== "ENOENT") {
      throw err;
    }
  }
  await fs.mkdir(dir, { recursive: true });
}

async function copyDirectory(src: string, dest: string): Promise<void> {
  const EXCLUDE = new Set(["metadata.json", ".git", "SKILL.md"]);

  try {
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      if (EXCLUDE.has(entry.name)) continue;
      if (entry.name.startsWith("_")) continue;

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.cp(srcPath, destPath, { recursive: true, dereference: true });
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch {
    // Source directory might not have extra files
  }
}

async function createSymlink(
  canonicalDir: string,
  agentTargetDir: string,
): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(agentTargetDir), { recursive: true });

    try {
      const stat = await fs.lstat(agentTargetDir);
      if (stat.isSymbolicLink() || stat.isDirectory()) {
        await fs.rm(agentTargetDir, { recursive: true, force: true });
      }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ELOOP") {
        await fs.unlink(agentTargetDir);
      } else if (code !== "ENOENT") {
        throw err;
      }
    }

    const relativePath = path.relative(
      path.dirname(agentTargetDir),
      canonicalDir,
    );

    const type = process.platform === "win32" ? "junction" : undefined;
    await fs.symlink(relativePath, agentTargetDir, type);

    return true;
  } catch {
    return false;
  }
}

// ---------- Removal ----------

export async function removeSkillFromAgent(
  skillName: string,
  agent: AgentConfig,
  scope: InstallScope,
): Promise<boolean> {
  const safeName = sanitizeName(skillName);
  const agentSkillsDir =
    scope === "global"
      ? agent.globalSkillsDir
      : path.join(process.cwd(), agent.skillsDir);
  const targetDir = path.join(agentSkillsDir, safeName);

  try {
    const stat = await fs.lstat(targetDir);
    if (stat.isSymbolicLink()) {
      await fs.unlink(targetDir);
    } else {
      await fs.rm(targetDir, { recursive: true, force: true });
    }
    return true;
  } catch {
    return false;
  }
}

export async function removeCanonicalSkill(skillName: string): Promise<void> {
  const safeName = sanitizeName(skillName);
  const dir = path.join(CANONICAL_SKILLS_DIR(), safeName);
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Best effort
  }
}

// ---------- Listing ----------

export async function listInstalledSkills(
  agents: AgentConfig[],
  scope: InstallScope,
): Promise<Map<string, { path: string; agents: string[] }>> {
  const result = new Map<string, { path: string; agents: string[] }>();

  for (const agent of agents) {
    const skillsDir =
      scope === "global"
        ? agent.globalSkillsDir
        : path.join(process.cwd(), agent.skillsDir);

    try {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;

        const existing = result.get(entry.name);
        if (existing) {
          existing.agents.push(agent.displayName);
        } else {
          result.set(entry.name, {
            path: path.join(skillsDir, entry.name),
            agents: [agent.displayName],
          });
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  return result;
}
