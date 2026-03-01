import * as p from "@clack/prompts";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { detectInstalledAgents } from "../core/agents.js";
import { discoverSkills } from "../core/skill-discovery.js";
import { installSkillForAgent, sanitizeName } from "../core/installer.js";
import { fmt } from "../ui/format.js";
import { Skill, AgentConfig } from "../types.js";
import { trackSync } from "../telemetry.js";

interface SyncOptions {
  yes: boolean;
  agent?: string[];
}

function hashSkillContent(skill: Skill): string {
  return crypto
    .createHash("sha256")
    .update(skill.content)
    .digest("hex")
    .slice(0, 12);
}

export async function runSync(args: string[]): Promise<void> {
  const options = parseSyncOptions(args);

  p.intro(fmt.bold("Sync skills from node_modules"));

  // 1. Find node_modules
  const nodeModulesDir = path.join(process.cwd(), "node_modules");
  try {
    await fs.access(nodeModulesDir);
  } catch {
    p.log.warn("No node_modules directory found. Run npm install first.");
    p.outro("");
    return;
  }

  // 2. Detect agents
  const detected = await detectInstalledAgents();
  const targetAgents = options.agent
    ? detected.filter((a) => options.agent!.includes(a.name))
    : detected;

  if (targetAgents.length === 0) {
    p.log.warn("No agents detected.");
    p.outro("");
    return;
  }

  // 3. Crawl node_modules for skills
  const spinner = p.spinner();
  spinner.start("Scanning node_modules for skills...");

  const allSkills: Skill[] = [];
  const packages = await fs.readdir(nodeModulesDir, { withFileTypes: true });

  for (const pkg of packages) {
    if (!pkg.isDirectory() && !pkg.isSymbolicLink()) continue;
    if (pkg.name.startsWith(".")) continue;

    const pkgDir = path.join(nodeModulesDir, pkg.name);

    // Handle scoped packages (@scope/pkg)
    if (pkg.name.startsWith("@")) {
      try {
        const scopedPkgs = await fs.readdir(pkgDir, { withFileTypes: true });
        for (const scoped of scopedPkgs) {
          if (!scoped.isDirectory() && !scoped.isSymbolicLink()) continue;
          const scopedDir = path.join(pkgDir, scoped.name);
          const skills = await discoverSkillsInPackage(scopedDir);
          allSkills.push(...skills);
        }
      } catch {
        /* skip */
      }
      continue;
    }

    const skills = await discoverSkillsInPackage(pkgDir);
    allSkills.push(...skills);
  }

  spinner.stop(`Found ${allSkills.length} skill(s) in node_modules.`);

  if (allSkills.length === 0) {
    p.log.info("No skills found in node_modules.");
    p.outro("");
    return;
  }

  // 4. Compare hashes and install changed skills
  let installedCount = 0;
  let skippedCount = 0;

  for (const skill of allSkills) {
    const newHash = hashSkillContent(skill);
    const safeName = sanitizeName(skill.name);

    const existingHash = await getInstalledHash(safeName, targetAgents);
    if (existingHash === newHash) {
      skippedCount++;
      continue;
    }

    for (const agent of targetAgents) {
      await installSkillForAgent(skill, agent, "project", "symlink");
    }
    installedCount++;
    p.log.success(
      `Synced ${fmt.skillName(skill.name)}${skill.plugin ? fmt.dim(` (${skill.plugin})`) : ""}`,
    );
  }

  trackSync({
    skillCount: allSkills.length,
    installedCount,
    agents: targetAgents.map((a) => a.name),
  });

  p.outro(
    fmt.success(
      `Synced ${installedCount} skill(s), ${skippedCount} unchanged.`,
    ),
  );
}

async function discoverSkillsInPackage(pkgDir: string): Promise<Skill[]> {
  return discoverSkills(pkgDir);
}

async function getInstalledHash(
  safeName: string,
  agents: AgentConfig[],
): Promise<string | null> {
  for (const agent of agents) {
    const skillDir = path.join(process.cwd(), agent.skillsDir, safeName);
    const skillMdPath = path.join(skillDir, "SKILL.md");
    try {
      const content = await fs.readFile(skillMdPath, "utf-8");
      return crypto
        .createHash("sha256")
        .update(content)
        .digest("hex")
        .slice(0, 12);
    } catch {
      continue;
    }
  }
  return null;
}

function parseSyncOptions(args: string[]): SyncOptions {
  const options: SyncOptions = { yes: false };
  const agentList: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-y" || arg === "--yes") options.yes = true;
    else if ((arg === "-a" || arg === "--agent") && args[i + 1]) {
      agentList.push(args[++i]);
    }
  }

  if (agentList.length > 0) options.agent = agentList;
  return options;
}
