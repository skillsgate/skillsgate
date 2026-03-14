import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { detectInstalledAgents, agents } from "../../core/agents.js";
import { discoverSkills } from "../../core/skill-discovery.js";
import { installSkillForAgent, sanitizeName } from "../../core/installer.js";
import { mcpSuccess, mcpError } from "../helpers.js";
import type { AgentConfig, Skill } from "../../types.js";

function hashSkillContent(skill: Skill): string {
  return crypto
    .createHash("sha256")
    .update(skill.content)
    .digest("hex")
    .slice(0, 12);
}

async function getInstalledHash(
  safeName: string,
  cwd: string,
  targetAgents: AgentConfig[],
): Promise<string | null> {
  for (const agent of targetAgents) {
    const skillDir = path.join(cwd, agent.skillsDir, safeName);
    const skillMdPath = path.join(skillDir, "SKILL.md");
    try {
      const content = await fs.readFile(skillMdPath, "utf-8");
      return crypto
        .createHash("sha256")
        .update(content)
        .digest("hex")
        .slice(0, 12);
    } catch {
      continue;
    }
  }
  return null;
}

async function discoverSkillsInPackage(pkgDir: string): Promise<Skill[]> {
  return discoverSkills(pkgDir);
}

export function registerSync(server: McpServer): void {
  server.tool(
    "skillsgate_sync",
    "Sync skills from node_modules into agent skill directories. Compares content hashes and only installs changed skills.",
    {
      agents: z
        .array(z.string())
        .optional()
        .describe(
          "Target specific agents. If omitted, all detected agents are used.",
        ),
      cwd: z
        .string()
        .optional()
        .describe(
          "Working directory containing node_modules. Defaults to process.cwd().",
        ),
    },
    async ({ agents: agentFilter, cwd }) => {
      try {
        const workDir = cwd || process.cwd();
        const nodeModulesDir = path.join(workDir, "node_modules");

        // 1. Check node_modules exists
        try {
          await fs.access(nodeModulesDir);
        } catch {
          return mcpError(
            "No node_modules directory found. Run npm install first.",
          );
        }

        // 2. Resolve target agents
        let targetAgents: AgentConfig[];

        if (agentFilter && agentFilter.length > 0) {
          targetAgents = agentFilter
            .map((name) => agents[name])
            .filter((a): a is AgentConfig => a !== undefined);

          if (targetAgents.length === 0) {
            return mcpError(
              `No valid agents found for: ${agentFilter.join(", ")}`,
            );
          }
        } else {
          targetAgents = await detectInstalledAgents();
        }

        if (targetAgents.length === 0) {
          return mcpError("No agents detected.");
        }

        // 3. Crawl node_modules for skills
        const allSkills: Skill[] = [];
        const packages = await fs.readdir(nodeModulesDir, {
          withFileTypes: true,
        });

        for (const pkg of packages) {
          if (!pkg.isDirectory() && !pkg.isSymbolicLink()) continue;
          if (pkg.name.startsWith(".")) continue;

          const pkgDir = path.join(nodeModulesDir, pkg.name);

          // Handle scoped packages (@scope/pkg)
          if (pkg.name.startsWith("@")) {
            try {
              const scopedPkgs = await fs.readdir(pkgDir, {
                withFileTypes: true,
              });
              for (const scoped of scopedPkgs) {
                if (!scoped.isDirectory() && !scoped.isSymbolicLink())
                  continue;
                const scopedDir = path.join(pkgDir, scoped.name);
                const skills = await discoverSkillsInPackage(scopedDir);
                allSkills.push(...skills);
              }
            } catch {
              /* skip */
            }
            continue;
          }

          const skills = await discoverSkillsInPackage(pkgDir);
          allSkills.push(...skills);
        }

        if (allSkills.length === 0) {
          return mcpSuccess({
            synced: [],
            unchanged: 0,
            total: 0,
            message: "No skills found in node_modules.",
          });
        }

        // 4. Compare hashes and install changed skills
        const synced: Array<{ name: string; plugin: string | null }> = [];
        let unchanged = 0;

        for (const skill of allSkills) {
          const newHash = hashSkillContent(skill);
          const safeName = sanitizeName(skill.name);
          const existingHash = await getInstalledHash(
            safeName,
            workDir,
            targetAgents,
          );

          if (existingHash === newHash) {
            unchanged++;
            continue;
          }

          for (const agent of targetAgents) {
            await installSkillForAgent(skill, agent, "project", "symlink");
          }

          synced.push({
            name: skill.name,
            plugin: skill.plugin ?? null,
          });
        }

        return mcpSuccess({
          synced,
          unchanged,
          total: allSkills.length,
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to sync skills",
        );
      }
    },
  );
}
