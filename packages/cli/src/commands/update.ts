import * as p from "@clack/prompts";
import { readSkillLock, addSkillToLock } from "../core/skill-lock.js";
import { fetchTreeSha, cloneRepo, cleanupTempDir } from "../core/git.js";
import { parseSource } from "../core/source-parser.js";
import { discoverSkills } from "../core/skill-discovery.js";
import { installSkillForAgent, sanitizeName } from "../core/installer.js";
import { detectInstalledAgents } from "../core/agents.js";
import { fmt } from "../ui/format.js";
import { trackUpdate } from "../telemetry.js";

export async function runUpdate(args: string[]): Promise<void> {
  const { skillName } = parseUpdateOptions(args);

  p.intro(fmt.bold("Update skills"));

  const lock = await readSkillLock();
  const entries = Object.entries(lock.skills);

  if (entries.length === 0) {
    p.log.warn("No skills in lock file. Nothing to update.");
    p.outro("");
    return;
  }

  const toCheck = skillName
    ? entries.filter(([name]) => name === sanitizeName(skillName))
    : entries;

  if (toCheck.length === 0) {
    p.log.warn(`Skill "${skillName}" not found in lock file.`);
    p.outro("");
    return;
  }

  const spinner = p.spinner();
  spinner.start("Checking for updates...");

  const sourceGroups = new Map<
    string,
    Array<[string, (typeof lock.skills)[string]]>
  >();
  for (const [name, entry] of toCheck) {
    const group = sourceGroups.get(entry.source) || [];
    group.push([name, entry]);
    sourceGroups.set(entry.source, group);
  }

  let updatedCount = 0;
  let upToDateCount = 0;

  for (const [, skills] of sourceGroups) {
    const parsed = parseSource(skills[0][1].originalUrl);
    const { owner, repo } = parsed;

    for (const [name, entry] of skills) {
      const currentSha = await fetchTreeSha(owner, repo, name);
      if (!currentSha) {
        p.log.warn(
          `Could not fetch update info for ${fmt.skillName(name)}`,
        );
        continue;
      }

      if (currentSha === entry.skillFolderHash) {
        upToDateCount++;
        continue;
      }

      spinner.message(`Updating ${name}...`);

      let tmpDir: string | undefined;
      try {
        tmpDir = await cloneRepo(parsed);
        const discovered = await discoverSkills(tmpDir);
        const matched = discovered.filter(
          (s) => sanitizeName(s.name) === name,
        );

        if (matched.length === 0) {
          p.log.warn(
            `Skill "${name}" no longer exists in ${entry.source}`,
          );
          continue;
        }

        const agents = await detectInstalledAgents();
        for (const skill of matched) {
          for (const agent of agents) {
            await installSkillForAgent(skill, agent, "global", "symlink");
          }
        }

        await addSkillToLock(name, {
          source: entry.source,
          sourceType: entry.sourceType,
          originalUrl: entry.originalUrl,
          skillFolderHash: currentSha,
        });

        updatedCount++;
      } finally {
        if (tmpDir) await cleanupTempDir(tmpDir);
      }
    }
  }

  spinner.stop("Update check complete.");

  trackUpdate({
    skillCount: toCheck.length,
    updatedCount,
    upToDateCount,
  });

  if (updatedCount > 0) {
    p.log.success(`Updated ${updatedCount} skill(s).`);
  }
  if (upToDateCount > 0) {
    p.log.info(`${upToDateCount} skill(s) already up to date.`);
  }

  p.outro("");
}

function parseUpdateOptions(args: string[]): {
  skillName?: string;
  options: { yes: boolean };
} {
  let skillName: string | undefined;
  let yes = false;

  for (const arg of args) {
    if (arg === "-y" || arg === "--yes") yes = true;
    else if (!arg.startsWith("-")) skillName = arg;
  }

  return { skillName, options: { yes } };
}
