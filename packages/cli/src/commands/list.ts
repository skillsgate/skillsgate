import { detectInstalledAgents } from "../core/agents.js";
import { listInstalledSkills } from "../core/installer.js";
import { readSkillLock } from "../core/skill-lock.js";
import { fmt, shortenPath } from "../ui/format.js";

export async function runList(args: string[]): Promise<void> {
  const { global: isGlobal, agent: agentFilter } = parseListOptions(args);
  const scope = isGlobal ? "global" : "project";

  const detected = await detectInstalledAgents();
  const targetAgents = agentFilter
    ? detected.filter((a) => agentFilter.includes(a.name))
    : detected;

  const installed = await listInstalledSkills(targetAgents, scope);
  const lock = await readSkillLock();

  if (installed.size === 0) {
    console.log(fmt.dim("  No skills installed."));
    console.log(
      fmt.dim(
        `  Run ${fmt.bold("skillsgate add <source>")} to install skills.`,
      ),
    );
    return;
  }

  console.log();
  console.log(fmt.bold(`  Installed skills (${scope}):`));
  console.log();

  for (const [name, info] of [...installed.entries()].sort()) {
    const lockEntry = lock.skills[name];
    const source = lockEntry ? fmt.dim(` (${lockEntry.source})`) : "";
    console.log(`  ${fmt.skillName(name)}${source}`);
    console.log(`    ${fmt.dim("Path:")} ${fmt.path(shortenPath(info.path))}`);
    console.log(
      `    ${fmt.dim("Agents:")} ${info.agents.map(fmt.agentName).join(", ")}`,
    );
    console.log();
  }
}

function parseListOptions(args: string[]): {
  global: boolean;
  agent?: string[];
} {
  let global = false;
  const agent: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-g" || args[i] === "--global") global = true;
    if ((args[i] === "-a" || args[i] === "--agent") && args[i + 1]) {
      agent.push(args[++i]);
    }
  }

  return { global, agent: agent.length > 0 ? agent : undefined };
}
