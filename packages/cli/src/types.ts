// ---------- Agent Types ----------

export type AgentType =
  | "amp"
  | "claude-code"
  | "cline"
  | "codex-cli"
  | "continue"
  | "cursor"
  | "github-copilot"
  | "goose"
  | "junie"
  | "kilo-code"
  | "opencode"
  | "openclaw"
  | "pear-ai"
  | "roo-code"
  | "trae"
  | "windsurf"
  | "zed"
  | "universal";

export interface AgentConfig {
  name: AgentType;
  displayName: string;
  skillsDir: string;
  globalSkillsDir: string;
  detectInstalled: () => Promise<boolean>;
  showInUniversalList?: boolean;
}

// ---------- Skill Types ----------

export interface Skill {
  name: string;
  description: string;
  filePath: string;
  content: string;
  plugin?: string;
  metadata?: Record<string, unknown>;
}

// ---------- Source Parsing ----------

export type SourceType = "github" | "local";

export interface ParsedSource {
  type: SourceType;
  url: string;
  owner: string;
  repo: string;
  subpath?: string;
  ref?: string;
  skillFilter?: string;
  localPath?: string;
}

// ---------- Lock File ----------

export interface SkillLockEntry {
  source: string;
  sourceType: SourceType;
  originalUrl: string;
  skillFolderHash: string;
  installedAt: string;
  updatedAt: string;
}

export interface SkillLockFile {
  version: number;
  skills: Record<string, SkillLockEntry>;
  lastSelectedAgents?: AgentType[];
}

// ---------- Plugin Manifest Types ----------

export interface PluginManifest {
  name: string;
  skills?: string[];
  source?: string;
  description?: string;
}

export interface MarketplaceManifest {
  name?: string;
  plugins: PluginManifest[];
}

// ---------- Install Types ----------

export type InstallScope = "project" | "global";
export type InstallMethod = "symlink" | "copy";

export interface InstallResult {
  skillName: string;
  agent: AgentType;
  success: boolean;
  path: string;
  symlinkFailed?: boolean;
  error?: string;
}
