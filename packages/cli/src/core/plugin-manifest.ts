import fs from "node:fs/promises";
import path from "node:path";
import {
  MARKETPLACE_JSON,
  CLAUDE_PLUGIN_DIR,
} from "../constants.js";


// ---------- Path Security ----------

function isContainedIn(targetPath: string, basePath: string): boolean {
  const normalizedBase = path.normalize(path.resolve(basePath));
  const normalizedTarget = path.normalize(path.resolve(targetPath));
  return (
    normalizedTarget.startsWith(normalizedBase + path.sep) ||
    normalizedTarget === normalizedBase
  );
}

function isValidRelativePath(p: string): boolean {
  return p.startsWith("./");
}

// ---------- Manifest Types ----------

interface PluginManifestEntry {
  source?: string | { source: string; repo?: string };
  skills?: string[];
  name?: string;
}

interface MarketplaceManifestRaw {
  metadata?: { pluginRoot?: string };
  plugins?: PluginManifestEntry[];
}

interface PluginJsonRaw {
  skills?: string[];
  name?: string;
}

// ---------- Public API ----------

/**
 * Get additional skill search directories from plugin manifests.
 * Matches upstream vercel-labs/skills getPluginSkillPaths().
 *
 * Reads .claude-plugin/marketplace.json and .claude-plugin/plugin.json.
 * Returns directories that should be scanned for skills (one level deep).
 */
export async function getPluginSkillPaths(
  basePath: string,
): Promise<string[]> {
  const searchDirs: string[] = [];

  const addPluginSkillPaths = (
    pluginBase: string,
    skills?: string[],
  ) => {
    if (!isContainedIn(pluginBase, basePath)) return;

    if (skills && skills.length > 0) {
      for (const skillPath of skills) {
        if (!isValidRelativePath(skillPath)) continue;
        const skillDir = path.dirname(path.join(pluginBase, skillPath));
        if (isContainedIn(skillDir, basePath)) {
          searchDirs.push(skillDir);
        }
      }
    }
    // Always add conventional skills/ directory for discovery
    searchDirs.push(path.join(pluginBase, "skills"));
  };

  // 1. Try marketplace.json (multi-plugin catalog)
  try {
    const content = await fs.readFile(
      path.join(basePath, CLAUDE_PLUGIN_DIR, MARKETPLACE_JSON),
      "utf-8",
    );
    const manifest: MarketplaceManifestRaw = JSON.parse(content);
    const pluginRoot = manifest.metadata?.pluginRoot;

    const validPluginRoot =
      pluginRoot === undefined || isValidRelativePath(pluginRoot);

    if (validPluginRoot) {
      for (const plugin of manifest.plugins ?? []) {
        // Skip remote sources (object with source/repo)
        if (
          typeof plugin.source !== "string" &&
          plugin.source !== undefined
        )
          continue;

        // Validate source starts with './'
        if (
          plugin.source !== undefined &&
          !isValidRelativePath(plugin.source)
        )
          continue;

        const pluginBase = path.join(
          basePath,
          pluginRoot ?? "",
          plugin.source ?? "",
        );
        addPluginSkillPaths(pluginBase, plugin.skills);
      }
    }
  } catch {
    // File doesn't exist or invalid JSON
  }

  // 2. Try .claude-plugin/plugin.json (single plugin at root)
  try {
    const content = await fs.readFile(
      path.join(basePath, CLAUDE_PLUGIN_DIR, "plugin.json"),
      "utf-8",
    );
    const manifest: PluginJsonRaw = JSON.parse(content);
    addPluginSkillPaths(basePath, manifest.skills);
  } catch {
    // File doesn't exist or invalid JSON
  }

  return searchDirs;
}

/**
 * Get plugin name groupings from manifests.
 * Returns a map of absolute skill path -> plugin name for display.
 */
export async function getPluginGroupings(
  basePath: string,
): Promise<Map<string, string>> {
  const groupings = new Map<string, string>();

  // 1. Try marketplace.json
  try {
    const content = await fs.readFile(
      path.join(basePath, CLAUDE_PLUGIN_DIR, MARKETPLACE_JSON),
      "utf-8",
    );
    const manifest: MarketplaceManifestRaw = JSON.parse(content);
    const pluginRoot = manifest.metadata?.pluginRoot;
    const validPluginRoot =
      pluginRoot === undefined || isValidRelativePath(pluginRoot);

    if (validPluginRoot) {
      for (const plugin of manifest.plugins ?? []) {
        if (!plugin.name) continue;
        if (
          typeof plugin.source !== "string" &&
          plugin.source !== undefined
        )
          continue;
        if (
          plugin.source !== undefined &&
          !isValidRelativePath(plugin.source)
        )
          continue;

        const pluginBase = path.join(
          basePath,
          pluginRoot ?? "",
          plugin.source ?? "",
        );
        if (!isContainedIn(pluginBase, basePath)) continue;

        if (plugin.skills && plugin.skills.length > 0) {
          for (const skillPath of plugin.skills) {
            if (!isValidRelativePath(skillPath)) continue;
            const skillDir = path.join(pluginBase, skillPath);
            if (isContainedIn(skillDir, basePath)) {
              groupings.set(path.resolve(skillDir), plugin.name);
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Try plugin.json
  try {
    const content = await fs.readFile(
      path.join(basePath, CLAUDE_PLUGIN_DIR, "plugin.json"),
      "utf-8",
    );
    const manifest: PluginJsonRaw = JSON.parse(content);
    if (manifest.name && manifest.skills && manifest.skills.length > 0) {
      for (const skillPath of manifest.skills) {
        if (!isValidRelativePath(skillPath)) continue;
        const skillDir = path.join(basePath, skillPath);
        if (isContainedIn(skillDir, basePath)) {
          groupings.set(path.resolve(skillDir), manifest.name);
        }
      }
    }
  } catch {
    // ignore
  }

  return groupings;
}

