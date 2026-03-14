import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { fmt } from "../ui/format.js";

const home = os.homedir();

interface McpToolConfig {
  name: string;
  configPath: string;
  detectDir: string;
}

const MCP_TOOLS: McpToolConfig[] = [
  {
    name: "Claude Code",
    configPath: path.join(home, ".claude.json"),
    detectDir: path.join(home, ".claude"),
  },
  {
    name: "Cursor",
    configPath: path.join(home, ".cursor", "mcp.json"),
    detectDir: path.join(home, ".cursor"),
  },
  {
    name: "Windsurf",
    configPath: path.join(home, ".windsurf", "mcp.json"),
    detectDir: path.join(home, ".windsurf"),
  },
];

const MCP_ENTRY = {
  command: "skillsgate",
  args: ["mcp"],
};

async function dirExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function readJsonConfig(filePath: string): Promise<Record<string, any>> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeJsonConfig(filePath: string, data: Record<string, any>): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function detectTools(): Promise<McpToolConfig[]> {
  const detected: McpToolConfig[] = [];
  for (const tool of MCP_TOOLS) {
    if (await dirExists(tool.detectDir)) {
      detected.push(tool);
    }
  }
  return detected;
}

async function addMcpToTool(tool: McpToolConfig): Promise<"added" | "exists" | "error"> {
  try {
    const config = await readJsonConfig(tool.configPath);

    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    if (config.mcpServers.skillsgate) {
      return "exists";
    }

    config.mcpServers.skillsgate = MCP_ENTRY;
    await writeJsonConfig(tool.configPath, config);
    return "added";
  } catch {
    return "error";
  }
}

async function removeMcpFromTool(tool: McpToolConfig): Promise<"removed" | "not_found" | "error"> {
  try {
    if (!(await fileExists(tool.configPath))) {
      return "not_found";
    }

    const config = await readJsonConfig(tool.configPath);

    if (!config.mcpServers?.skillsgate) {
      return "not_found";
    }

    delete config.mcpServers.skillsgate;

    // Clean up empty mcpServers object
    if (Object.keys(config.mcpServers).length === 0) {
      delete config.mcpServers;
    }

    await writeJsonConfig(tool.configPath, config);
    return "removed";
  } catch {
    return "error";
  }
}

export async function runSetup(args: string[]): Promise<void> {
  const isRemove = args.includes("--remove");

  p.intro(fmt.bold(isRemove ? "Remove SkillsGate MCP" : "Configure SkillsGate MCP"));

  const detected = await detectTools();

  if (detected.length === 0) {
    p.log.warn("No supported AI tools detected.");
    p.log.info("Supported tools: Claude Code, Cursor, Windsurf");
    p.log.info(pc.dim("You can manually add MCP config. See: skillsgate --help"));
    p.outro("");
    return;
  }

  p.log.info("Detected AI tools:");
  for (const tool of detected) {
    p.log.message(`  ${pc.green("\u2714")} ${tool.name} ${pc.dim(`(${tool.configPath})`)}`);
  }

  if (isRemove) {
    const confirm = await p.confirm({
      message: `Remove SkillsGate MCP from ${detected.length} tool(s)?`,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel("Cancelled.");
      return;
    }

    for (const tool of detected) {
      const result = await removeMcpFromTool(tool);
      if (result === "removed") {
        p.log.success(`Removed from ${tool.name}`);
      } else if (result === "not_found") {
        p.log.info(`${tool.name}: not configured, skipped`);
      } else {
        p.log.error(`${tool.name}: failed to update config`);
      }
    }

    p.outro(fmt.success("Done."));
    return;
  }

  // Add mode
  const confirm = await p.confirm({
    message: `Auto-configure MCP for ${detected.length} tool(s)?`,
    initialValue: true,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Cancelled.");
    return;
  }

  for (const tool of detected) {
    const result = await addMcpToTool(tool);
    if (result === "added") {
      p.log.success(`Added SkillsGate MCP to ${tool.name}`);
    } else if (result === "exists") {
      p.log.info(`${tool.name}: already configured, skipped`);
    } else {
      p.log.error(`${tool.name}: failed to update config`);
    }
  }

  console.log();
  p.log.info(`${pc.bold("CLI:")}  skillsgate search "seo"`);
  p.log.info(`${pc.bold("MCP:")}  Ask your AI agent to "find a skill for PDF manipulation"`);

  p.outro(fmt.success("Done! MCP server configured."));
}
