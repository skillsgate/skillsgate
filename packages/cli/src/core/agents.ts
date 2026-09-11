// Portions adapted from vercel-labs/skills (https://github.com/vercel-labs/skills)
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AgentConfig, AgentType } from "../types.js";
import { AGENTS_DIR, SKILLS_SUBDIR } from "../constants.js";

const home = os.homedir();
const configHome = process.env.XDG_CONFIG_HOME || path.join(home, ".config");
const factoryHome = process.env.FACTORY_HOME || path.join(home, ".factory");
const ob1Home = process.env.OB1_HOME || path.join(home, ".ob1");
const geminiConfigHome = path.join(home, ".gemini", "config");
const geminiSkillsHome = path.join(
  home,
  ".gemini",
  existsSync(geminiConfigHome) ? "config/skills" : "skills",
);
const execFileAsync = promisify(execFile);

async function dirExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function commandExists(command: string): Promise<boolean> {
  const binary = process.platform === "win32" ? "where" : "which";
  try {
    await execFileAsync(binary, [command]);
    return true;
  } catch {
    return false;
  }
}

// ---------- Agent Registry ----------

export const agents: Record<string, AgentConfig> = {
  "claude-code": {
    name: "claude-code",
    displayName: "Claude Code",
    skillsDir: ".claude/skills",
    globalSkillsDir: path.join(
      process.env.CLAUDE_CONFIG_DIR || path.join(home, ".claude"),
      "skills",
    ),
    detectInstalled: async () => {
      return dirExists(
        process.env.CLAUDE_CONFIG_DIR || path.join(home, ".claude"),
      );
    },
  },

  cursor: {
    name: "cursor",
    displayName: "Cursor",
    skillsDir: ".cursor/skills",
    globalSkillsDir: path.join(home, ".cursor", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".cursor")),
  },

  "github-copilot": {
    name: "github-copilot",
    displayName: "GitHub Copilot",
    skillsDir: ".github/skills",
    globalSkillsDir: path.join(configHome, "github-copilot", "skills"),
    detectInstalled: async () =>
      dirExists(path.join(configHome, "github-copilot")),
  },

  windsurf: {
    name: "windsurf",
    displayName: "Windsurf",
    skillsDir: ".windsurf/skills",
    globalSkillsDir: path.join(home, ".windsurf", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".windsurf")),
  },

  cline: {
    name: "cline",
    displayName: "Cline",
    skillsDir: ".cline/skills",
    globalSkillsDir: path.join(home, ".cline", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".cline")),
  },

  continue: {
    name: "continue",
    displayName: "Continue",
    skillsDir: ".continue/skills",
    globalSkillsDir: path.join(home, ".continue", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".continue")),
  },

  "codex-cli": {
    name: "codex-cli",
    displayName: "Codex CLI",
    skillsDir: ".codex/skills",
    globalSkillsDir: path.join(
      process.env.CODEX_HOME || path.join(home, ".codex"),
      "skills",
    ),
    detectInstalled: async () => {
      return dirExists(
        process.env.CODEX_HOME || path.join(home, ".codex"),
      );
    },
  },

  "droid-cli": {
    name: "droid-cli",
    displayName: "Droid CLI",
    skillsDir: ".factory/skills",
    globalSkillsDir: path.join(factoryHome, "skills"),
    detectInstalled: async () => dirExists(factoryHome),
  },

  "ob-1": {
    name: "ob-1",
    displayName: "OB-1",
    skillsDir: ".ob1/skills",
    globalSkillsDir: path.join(ob1Home, "skills"),
    detectInstalled: async () => dirExists(ob1Home),
  },

  amp: {
    name: "amp",
    displayName: "Amp",
    skillsDir: ".amp/skills",
    globalSkillsDir: path.join(home, ".amp", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".amp")),
  },

  antigravity: {
    name: "antigravity",
    displayName: "Antigravity",
    skillsDir: ".gemini/skills",
    globalSkillsDir: geminiSkillsHome,
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".gemini"))) ||
      (await commandExists("agy")) ||
      (await dirExists("/Applications/Antigravity.app")),
  },

  codebuddy: {
    name: "codebuddy",
    displayName: "CodeBuddy",
    skillsDir: ".codebuddy/skills",
    globalSkillsDir: path.join(home, ".codebuddy", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".codebuddy"))) ||
      (await commandExists("codebuddy")) ||
      (await dirExists("/Applications/CodeBuddy.app")),
  },

  "codebuddy-cn": {
    name: "codebuddy-cn",
    displayName: "CodeBuddy CN",
    skillsDir: ".codebuddy-cn/skills",
    globalSkillsDir: existsSync(path.join(home, ".codebuddycn"))
      ? path.join(home, ".codebuddycn", "skills")
      : path.join(home, ".codebuddy-cn", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".codebuddycn"))) ||
      (await dirExists(path.join(home, ".codebuddy-cn"))) ||
      (await dirExists("/Applications/CodeBuddy CN.app")),
  },

  goose: {
    name: "goose",
    displayName: "Goose",
    skillsDir: ".goose/skills",
    globalSkillsDir: path.join(home, ".goose", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".goose")),
  },

  junie: {
    name: "junie",
    displayName: "Junie",
    skillsDir: ".junie/skills",
    globalSkillsDir: path.join(home, ".junie", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".junie")),
  },

  "kilo-code": {
    name: "kilo-code",
    displayName: "Kilo Code",
    skillsDir: ".kilo-code/skills",
    globalSkillsDir: path.join(home, ".kilo-code", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".kilo-code")),
  },

  opencode: {
    name: "opencode",
    displayName: "OpenCode",
    skillsDir: ".opencode/skills",
    globalSkillsDir: path.join(home, ".opencode", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".opencode")),
  },

  openclaw: {
    name: "openclaw",
    displayName: "OpenClaw",
    skillsDir: ".openclaw/skills",
    globalSkillsDir: path.join(home, ".openclaw", "skills"),
    detectInstalled: async () => {
      // Check multiple directory names for backwards compat
      return (
        (await dirExists(path.join(home, ".openclaw"))) ||
        (await dirExists(path.join(home, ".clawdbot"))) ||
        (await dirExists(path.join(home, ".moltbot")))
      );
    },
  },

  "pear-ai": {
    name: "pear-ai",
    displayName: "Pear AI",
    skillsDir: ".pear-ai/skills",
    globalSkillsDir: path.join(home, ".pear-ai", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".pear-ai")),
  },

  pi: {
    name: "pi",
    displayName: "Pi Coding Agent",
    skillsDir: ".pi/skills",
    globalSkillsDir: path.join(home, ".pi", "agent", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".pi", "agent"))) ||
      (await commandExists("pi")),
  },

  "roo-code": {
    name: "roo-code",
    displayName: "Roo Code",
    skillsDir: ".roo-code/skills",
    globalSkillsDir: path.join(home, ".roo-code", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".roo-code")),
  },

  trae: {
    name: "trae",
    displayName: "Trae",
    skillsDir: ".trae/skills",
    globalSkillsDir: path.join(home, ".trae", "skills"),
    detectInstalled: async () => dirExists(path.join(home, ".trae")),
  },

  "trae-cn": {
    name: "trae-cn",
    displayName: "Trae CN",
    skillsDir: ".trae-cn/skills",
    globalSkillsDir: path.join(home, ".trae-cn", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".trae-cn"))) ||
      (await dirExists("/Applications/Trae CN.app")) ||
      (await dirExists("/Applications/TRAE SOLO CN.app")),
  },

  workbuddy: {
    name: "workbuddy",
    displayName: "WorkBuddy",
    skillsDir: ".workbuddy/skills",
    globalSkillsDir: path.join(home, ".workbuddy", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".workbuddy"))) ||
      (await dirExists("/Applications/WorkBuddy.app")),
  },

  "workbuddy-ai": {
    name: "workbuddy-ai",
    displayName: "WorkBuddy AI",
    skillsDir: ".workbuddy-ai/skills",
    globalSkillsDir: path.join(home, ".workbuddy-ai", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".workbuddy-ai"))) ||
      (await dirExists("/Applications/WorkBuddy AI.app")),
  },

  mercury: {
    name: "mercury",
    displayName: "Mercury Agent",
    skillsDir: ".mercury/skills",
    globalSkillsDir: path.join(home, ".mercury", "skills"),
    detectInstalled: async () =>
      (await dirExists(path.join(home, ".mercury"))) ||
      (await commandExists("mercury")),
  },

  zed: {
    name: "zed",
    displayName: "Zed",
    skillsDir: ".zed/skills",
    globalSkillsDir: path.join(configHome, "zed", "skills"),
    detectInstalled: async () => dirExists(path.join(configHome, "zed")),
  },

  universal: {
    name: "universal",
    displayName: "Universal (.agents/skills)",
    skillsDir: ".agents/skills",
    globalSkillsDir: path.join(home, AGENTS_DIR, SKILLS_SUBDIR),
    detectInstalled: async () => true,
    showInUniversalList: true,
  },
};

// ---------- Detection + Classification ----------

export async function detectInstalledAgents(): Promise<AgentConfig[]> {
  const results = await Promise.all(
    Object.values(agents).map(async (agent) => ({
      agent,
      installed: await agent.detectInstalled(),
    })),
  );
  return results.filter((r) => r.installed).map((r) => r.agent);
}

export function getUniversalAgents(): AgentConfig[] {
  return Object.values(agents).filter(
    (a) =>
      a.globalSkillsDir === path.join(home, AGENTS_DIR, SKILLS_SUBDIR),
  );
}

export function getNonUniversalAgents(): AgentConfig[] {
  return Object.values(agents).filter(
    (a) =>
      a.globalSkillsDir !== path.join(home, AGENTS_DIR, SKILLS_SUBDIR),
  );
}

export function isUniversalAgent(name: AgentType): boolean {
  const agent = agents[name];
  return (
    !!agent &&
    agent.globalSkillsDir === path.join(home, AGENTS_DIR, SKILLS_SUBDIR)
  );
}
