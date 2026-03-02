import path from "node:path";
import os from "node:os";

export const VERSION = "0.1.1";
export const AGENTS_DIR = ".agents";
export const SKILLS_SUBDIR = "skills";
export const UNIVERSAL_SKILLS_DIR = ".agents/skills";
export const LOCK_FILE_NAME = ".skill-lock.json";
export const SKILL_MD = "SKILL.md";
export const PLUGIN_JSON = "plugin.json";
export const MARKETPLACE_JSON = "marketplace.json";
export const CLAUDE_PLUGIN_DIR = ".claude-plugin";

export const GLOBAL_LOCK_PATH = () =>
  path.join(os.homedir(), AGENTS_DIR, LOCK_FILE_NAME);

export const CANONICAL_SKILLS_DIR = () =>
  path.join(os.homedir(), AGENTS_DIR, SKILLS_SUBDIR);

export const LOCK_FILE_VERSION = 1;

// Matches upstream vercel-labs/skills SKIP_DIRS
export const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "__pycache__",
]);

export const MAX_SKILL_DEPTH = 5;

// Auth
export const API_BASE_URL =
  process.env.SKILLSGATE_API_URL ?? "https://skillsgate.ai";
export const SEARCH_API_URL =
  process.env.SKILLSGATE_SEARCH_API_URL ?? "https://api.skillsgate.ai";
export const AUTH_DIR = path.join(os.homedir(), ".skillsgate");
export const AUTH_FILE = path.join(os.homedir(), ".skillsgate", "auth.json");
export const DEVICE_CODE_POLL_INTERVAL = 5000; // ms
