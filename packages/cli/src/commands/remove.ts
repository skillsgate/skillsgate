import * as p from "@clack/prompts";
import { detectInstalledAgents } from "../core/agents.js";
import {
  listInstalledSkills,
  removeSkillFromAgent,
  removeCanonicalSkill,
  sanitizeName,
} from "../core/installer.js";
import { removeSkillFromLock } from "../core/skill-lock.js";
import { fmt } from "../ui/format.js";
import { trackRemove } from "../telemetry.js";

interface RemoveOptions {
  global: boolean;
  agent?: string[];
  yes: boolean;
  all: boolean;
}

export async function runRemove(args: string[]): Promise<void> {
  const { skillNames, options } = parseRemoveOptions(args);
  const scope = options.global ? "global" : "project";

  p.intro(fmt.bold("Remove skills"));

  // 1. Detect agents
  const detected = await detectInstalledAgents();
  const targetAgents = options.agent
    ? detected.filter((a) => options.agent!.includes(a.name))
    : detected;

  // 2. List installed skills
  const installed = await listInstalledSkills(targetAgents, scope);
  if (installed.size === 0) {
    p.log.warn("No skills currently installed.");
    p.outro("");
    return;
  }

  // 3. Select skills to remove
  let toRemove: string[];
  if (options.all) {
    toRemove = [...installed.keys()];
  } else if (skillNames.length > 0) {
    toRemove = skillNames.filter((n) => installed.has(sanitizeName(n)));
  } else {
    const selected = await p.multiselect({
      message: "Select skills to remove:",
      options: [...installed.entries()].map(([name, info]) => ({
        value: name,
        label: name,
        hint: `${info.agents.join(", ")}`,
      })),
      required: true,
    });
    if (p.isCancel(selected)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    toRemove = selected as string[];
  }

  // 4. Confirm
  if (!options.yes) {
    const ok = await p.confirm({
      message: `Remove ${toRemove.length} skill(s)?`,
    });
    if (p.isCancel(ok) || !ok) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  // 5. Remove from each agent + canonical + lock
  for (const name of toRemove) {
    for (const agent of targetAgents) {
      await removeSkillFromAgent(name, agent, scope);
    }
    await removeCanonicalSkill(name);
    await removeSkillFromLock(name);
    p.log.success(`Removed ${fmt.skillName(name)}`);
  }

  trackRemove({
    skills: toRemove,
    agents: targetAgents.map((a) => a.name),
    scope,
  });

  p.outro(fmt.success(`Removed ${toRemove.length} skill(s).`));
}

function parseRemoveOptions(args: string[]): {
  skillNames: string[];
  options: RemoveOptions;
} {
  const options: RemoveOptions = {
    global: false,
    yes: false,
    all: false,
  };
  const skillNames: string[] = [];
  const agentList: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-g" || arg === "--global") options.global = true;
    else if (arg === "-y" || arg === "--yes") options.yes = true;
    else if (arg === "--all") options.all = true;
    else if ((arg === "-a" || arg === "--agent") && args[i + 1]) {
      agentList.push(args[++i]);
    } else if (!arg.startsWith("-")) {
      skillNames.push(arg);
    }
  }

  if (agentList.length > 0) options.agent = agentList;
  return { skillNames, options };
}
