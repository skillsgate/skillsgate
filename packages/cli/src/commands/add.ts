import * as p from "@clack/prompts";
import {
  parseSource,
  getSourceLabel,
  getOwnerRepo,
} from "../core/source-parser.js";
import { cloneRepo, fetchTreeSha, cleanupTempDir, GitCloneError } from "../core/git.js";
import { discoverSkills, filterSkills } from "../core/skill-discovery.js";
import {
  installSkillForAgent,
  sanitizeName,
} from "../core/installer.js";
import {
  addSkillToLock,
  saveSelectedAgents,
  getLastSelectedAgents,
} from "../core/skill-lock.js";
import { detectInstalledAgents } from "../core/agents.js";
import {
  selectSkills,
  selectAgents,
  selectScope,
  selectMethod,
} from "../ui/prompts.js";
import { dirExists } from "../utils/fs.js";
import { fmt, shortenPath } from "../ui/format.js";
import {
  SkillsGateError,
  NoSkillsInRepoError,
  SkillNotFoundError,
  NoAgentsDetectedError,
} from "../utils/errors.js";
import {
  InstallScope,
  InstallMethod,
  InstallResult,
  AgentConfig,
} from "../types.js";
import { trackAdd } from "../telemetry.js";

interface AddOptions {
  global: boolean;
  yes: boolean;
  agent?: string[];
  skill?: string;
  all: boolean;
  copy: boolean;
  list: boolean;
}

export async function runAdd(args: string[]): Promise<void> {
  const { source, options } = parseAddOptions(args);

  if (!source) {
    console.error(fmt.error("Missing source. Usage: skillsgate add <source>"));
    process.exit(1);
  }

  const parsed = parseSource(source);
  const sourceLabel = getSourceLabel(parsed);

  p.intro(fmt.bold(`Install skills from ${sourceLabel}`));

  let tmpDir: string | undefined;
  const isLocal = parsed.type === "local";

  try {
    let skillDir: string;

    if (isLocal) {
      if (!(await dirExists(parsed.localPath!))) {
        throw new SkillsGateError(
          `Local path does not exist: ${parsed.localPath}`,
          "LOCAL_PATH_NOT_FOUND",
        );
      }
      skillDir = parsed.localPath!;
    } else {
      const spinner = p.spinner();
      spinner.start(`Cloning ${sourceLabel}...`);
      tmpDir = await cloneRepo(parsed);
      spinner.stop("Repository cloned.");
      skillDir = tmpDir;
    }

    // Discover skills
    let skills = await discoverSkills(skillDir, parsed.subpath);
    if (skills.length === 0) {
      throw new NoSkillsInRepoError(sourceLabel);
    }

    // Apply skill filter (from @skill syntax or --skill flag)
    const skillFilter = parsed.skillFilter || options.skill;
    if (skillFilter) {
      skills = filterSkills(skills, skillFilter);
      if (skills.length === 0) {
        throw new SkillNotFoundError(skillFilter);
      }
    }

    p.log.info(
      `Found ${skills.length} skill(s): ${skills.map((s) => fmt.skillName(s.name)).join(", ")}`,
    );

    // --list: just show skills and exit
    if (options.list) {
      for (const s of skills) {
        console.log(`  ${fmt.skillName(s.name)} - ${s.description}`);
      }
      p.outro("");
      return;
    }

    // Select skills
    const selectedSkills =
      options.yes || options.all || skills.length === 1
        ? skills
        : await selectSkills(skills);

    // Detect agents
    const detected = await detectInstalledAgents();
    if (detected.length === 0) {
      throw new NoAgentsDetectedError();
    }

    // Select agents
    let selectedAgents: AgentConfig[];
    if (options.all) {
      selectedAgents = detected;
    } else if (options.agent) {
      selectedAgents = detected.filter((a) => options.agent!.includes(a.name));
      if (selectedAgents.length === 0) {
        p.log.warn("None of the specified agents are installed.");
        p.outro("");
        return;
      }
    } else if (options.yes) {
      const last = await getLastSelectedAgents();
      selectedAgents = last
        ? detected.filter((a) => last.includes(a.name))
        : detected;
      if (selectedAgents.length === 0) selectedAgents = detected;
    } else {
      const last = await getLastSelectedAgents();
      selectedAgents = await selectAgents(detected, last);
    }

    // Select scope
    const scope: InstallScope = options.global
      ? "global"
      : options.yes
        ? "global"
        : await selectScope();

    // Select method
    const method: InstallMethod = options.copy
      ? "copy"
      : options.yes
        ? "symlink"
        : await selectMethod();

    // Install
    const installSpinner = p.spinner();
    installSpinner.start("Installing skills...");

    const results: InstallResult[] = [];
    for (const skill of selectedSkills) {
      const skillResults = await Promise.all(
        selectedAgents.map((agent) =>
          installSkillForAgent(skill, agent, scope, method),
        ),
      );
      results.push(...skillResults);
    }

    installSpinner.stop("Installation complete.");

    // Update lock file for global GitHub installs
    if (scope === "global" && !isLocal) {
      for (const skill of selectedSkills) {
        const sha = await fetchTreeSha(
          parsed.owner,
          parsed.repo,
          sanitizeName(skill.name),
        );
        await addSkillToLock(sanitizeName(skill.name), {
          source: `github:${getOwnerRepo(parsed)}`,
          sourceType: "github",
          originalUrl: source,
          skillFolderHash: sha || "",
        });
      }
    }
    if (scope === "global") {
      await saveSelectedAgents(selectedAgents.map((a) => a.name));
    }

    // Display results
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);
    const symlinkFails = results.filter((r) => r.symlinkFailed);

    for (const skill of selectedSkills) {
      const skillResults = successes.filter((r) => r.skillName === skill.name);
      if (skillResults.length > 0) {
        p.log.success(
          `${fmt.skillName(skill.name)} -> ${skillResults.map((r) => fmt.agentName(r.agent)).join(", ")}`,
        );
        p.log.message(fmt.dim(`  ${shortenPath(skillResults[0].path)}`));
      }
    }

    if (symlinkFails.length > 0) {
      p.log.warn(
        `${symlinkFails.length} symlink(s) failed, fell back to copy mode.`,
      );
    }

    if (failures.length > 0) {
      for (const f of failures) {
        p.log.error(`Failed: ${f.skillName} -> ${f.agent}: ${f.error}`);
      }
    }

    trackAdd({
      source: getOwnerRepo(parsed),
      skills: selectedSkills.map((s) => sanitizeName(s.name)),
      agents: selectedAgents.map((a) => a.name),
      scope,
      sourceType: parsed.type,
    });

    p.outro(
      fmt.success(
        `Installed ${successes.length} skill(s) across ${selectedAgents.length} agent(s).`,
      ),
    );
  } catch (err) {
    if (err instanceof GitCloneError) {
      if (err.isAuth) {
        p.log.error(
          "Authentication failed. For private repos, set GITHUB_TOKEN.",
        );
      } else {
        p.log.error(err.message);
      }
    } else if (err instanceof Error) {
      p.log.error(err.message);
    }
    process.exit(1);
  } finally {
    if (tmpDir) await cleanupTempDir(tmpDir);
  }
}

function parseAddOptions(args: string[]): {
  source: string | undefined;
  options: AddOptions;
} {
  const options: AddOptions = {
    global: false,
    yes: false,
    all: false,
    copy: false,
    list: false,
  };
  let source: string | undefined;
  const agentList: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-g" || arg === "--global") options.global = true;
    else if (arg === "-y" || arg === "--yes") options.yes = true;
    else if (arg === "--all") {
      options.all = true;
      options.yes = true;
    } else if (arg === "--copy") options.copy = true;
    else if (arg === "-l" || arg === "--list") options.list = true;
    else if ((arg === "-a" || arg === "--agent") && args[i + 1]) {
      agentList.push(args[++i]);
    } else if ((arg === "-s" || arg === "--skill") && args[i + 1]) {
      options.skill = args[++i];
    } else if (!arg.startsWith("-")) {
      source = arg;
    }
  }

  if (agentList.length > 0) options.agent = agentList;
  return { source, options };
}
