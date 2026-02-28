import * as p from "@clack/prompts";
import pc from "picocolors";
import { VERSION } from "./constants.js";
import { runAdd } from "./commands/add.js";
import { runRemove } from "./commands/remove.js";
import { runList } from "./commands/list.js";
import { runUpdate } from "./commands/update.js";
import { runSync } from "./commands/sync.js";
import { runLogin } from "./commands/login.js";
import { runLogout } from "./commands/logout.js";
import { runWhoami } from "./commands/whoami.js";

// "SKILLS" in dark silver (dim), "GATE" in bright white (bold)
const s = (t: string) => pc.dim(t);       // dark silver
const g = (t: string) => pc.bold(pc.white(t)); // glowy white

const LOGO = `
${s("███████╗██╗  ██╗██╗██╗     ██╗     ███████╗")} ${g("██████╗  █████╗ ████████╗███████╗")}
${s("██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝")}${g("██╔════╝ ██╔══██╗╚══██╔══╝██╔════╝")}
${s("███████╗█████╔╝ ██║██║     ██║     ███████╗")}${g("██║  ███╗███████║   ██║   █████╗")}
${s("╚════██║██╔═██╗ ██║██║     ██║     ╚════██║")}${g("██║   ██║██╔══██║   ██║   ██╔══╝")}
${s("███████║██║  ██╗██║███████╗███████╗███████║")}${g("╚██████╔╝██║  ██║   ██║   ███████╗")}
${s("╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝")} ${g("╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝")}
`;

function printLogo(): void {
  console.log(LOGO);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const restArgs = args.slice(1);

  // Show logo for interactive commands
  if (command && !command.startsWith("-")) {
    printLogo();
  }

  switch (command) {
    case "add":
    case "a":
    case "install":
    case "i":
      await runAdd(restArgs);
      break;

    case "remove":
    case "rm":
    case "r":
    case "uninstall":
      await runRemove(restArgs);
      break;

    case "list":
    case "ls":
      await runList(restArgs);
      break;

    case "update":
    case "up":
      await runUpdate(restArgs);
      break;

    case "sync":
      await runSync(restArgs);
      break;

    case "login":
      await runLogin();
      break;

    case "logout":
      await runLogout();
      break;

    case "whoami":
      await runWhoami();
      break;

    case "--version":
    case "-v":
      console.log(`skillsgate v${VERSION}`);
      break;

    case "--help":
    case "-h":
    case undefined:
      printLogo();
      printHelp();
      break;

    default:
      console.error(pc.red(`Unknown command: ${command}`));
      console.error(`Run ${pc.bold("skillsgate --help")} for usage.`);
      process.exit(1);
  }
}

function printHelp(): void {
  const DIM = pc.dim;
  const BOLD = pc.bold;

  console.log();
  console.log(`  ${BOLD("skillsgate")} ${DIM(`v${VERSION}`)}`);
  console.log(`  ${DIM("Install and manage AI agent skills from GitHub")}`);
  console.log();
  console.log(`  ${BOLD("Usage:")}`);
  console.log(`    skillsgate ${DIM("<command>")} ${DIM("[options]")}`);
  console.log();
  console.log(`  ${BOLD("Commands:")}`);
  console.log(
    `    add ${DIM("<source>")}     Install skills from a GitHub repo`,
  );
  console.log(`    remove ${DIM("[name]")}    Uninstall skills`);
  console.log(`    list               Show installed skills`);
  console.log(`    update ${DIM("[name]")}    Check and apply updates`);
  console.log(`    sync               Sync skills from node_modules`);
  console.log(`    login              Authenticate with SkillsGate`);
  console.log(`    logout             Sign out`);
  console.log(`    whoami             Show current user`);
  console.log();
  console.log(`  ${BOLD("Examples:")}`);
  console.log(`    skillsgate add vercel-labs/agent-skills`);
  console.log(`    skillsgate add vercel-labs/agent-skills@my-skill`);
  console.log(`    skillsgate add https://github.com/owner/repo`);
  console.log(`    skillsgate add ./local/skills`);
  console.log(`    skillsgate remove my-skill`);
  console.log(`    skillsgate list -g`);
  console.log(`    skillsgate update`);
  console.log(`    skillsgate sync`);
  console.log();
  console.log(`  ${BOLD("Options:")}`);
  console.log(
    `    -g, --global       Use global scope (~/.agents/skills/)`,
  );
  console.log(`    -y, --yes          Skip confirmation prompts`);
  console.log(`    -a, --agent <id>   Target specific agent(s)`);
  console.log(`    --all              Select all skills/agents`);
  console.log(`    --copy             Use copy mode instead of symlink`);
  console.log(`    -v, --version      Show version`);
  console.log(`    -h, --help         Show this help`);
  console.log();
}

main().catch((err) => {
  console.error(pc.red(err.message || String(err)));
  process.exit(1);
});
