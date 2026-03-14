import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  parseSource,
  getSourceLabel,
  getOwnerRepo,
} from "../../core/source-parser.js";
import { cloneRepo, fetchTreeSha, cleanupTempDir } from "../../core/git.js";
import { downloadSkill } from "../../core/skillsgate-client.js";
import { getToken } from "../../utils/auth-store.js";
import { discoverSkills, filterSkills } from "../../core/skill-discovery.js";
import { installSkillForAgent, sanitizeName } from "../../core/installer.js";
import {
  addSkillToLock,
  saveSelectedAgents,
} from "../../core/skill-lock.js";
import { detectInstalledAgents, agents } from "../../core/agents.js";
import { dirExists } from "../../utils/fs.js";
import { mcpSuccess, mcpError } from "../helpers.js";
import type { AgentConfig, InstallMethod, InstallScope } from "../../types.js";

export function registerAdd(server: McpServer): void {
  server.tool(
    "skillsgate_add",
    "Install AI agent skills from SkillsGate (@username/slug), GitHub (owner/repo), or a local path.",
    {
      source: z
        .string()
        .describe(
          "Skill source: @username/slug (SkillsGate), owner/repo (GitHub), or a local path (./path).",
        ),
      agents: z
        .array(z.string())
        .optional()
        .describe(
          "Target specific agents (e.g. ['claude-code', 'cursor']). If omitted, all detected agents are used.",
        ),
      scope: z
        .enum(["global", "project"])
        .default("global")
        .describe("Installation scope."),
      method: z
        .enum(["symlink", "copy"])
        .default("symlink")
        .describe("Installation method."),
      skill_filter: z
        .string()
        .optional()
        .describe("Filter to a specific skill by name."),
      list_only: z
        .boolean()
        .default(false)
        .describe("If true, list discovered skills without installing."),
    },
    async ({ source, agents: agentFilter, scope, method, skill_filter, list_only }) => {
      let tmpDir: string | undefined;

      try {
        const parsed = parseSource(source);
        const sourceLabel = getSourceLabel(parsed);
        const isLocal = parsed.type === "local";

        // 1. Resolve skill directory
        let skillDir: string;

        if (isLocal) {
          if (!(await dirExists(parsed.localPath!))) {
            return mcpError(`Local path does not exist: ${parsed.localPath}`);
          }
          skillDir = parsed.localPath!;
        } else if (parsed.type === "skillsgate") {
          const token = await getToken();
          tmpDir = await downloadSkill(parsed.username!, parsed.slug!, token);
          skillDir = tmpDir;
        } else {
          tmpDir = await cloneRepo(parsed);
          skillDir = tmpDir;
        }

        // 2. Discover skills
        let skills = await discoverSkills(skillDir, parsed.subpath);
        if (skills.length === 0) {
          return mcpError(`No skills found in ${sourceLabel}.`);
        }

        // 3. Apply skill filter
        const filterName = parsed.skillFilter || skill_filter;
        if (filterName) {
          skills = filterSkills(skills, filterName);
          if (skills.length === 0) {
            return mcpError(`Skill "${filterName}" not found in ${sourceLabel}.`);
          }
        }

        // 4. List only mode
        if (list_only) {
          return mcpSuccess({
            source: sourceLabel,
            skills: skills.map((s) => ({
              name: s.name,
              description: s.description,
              plugin: s.plugin ?? null,
            })),
          });
        }

        // 5. Resolve target agents
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
          return mcpError(
            "No AI coding agents detected on this machine. Install at least one agent first.",
          );
        }

        // 6. Install all skills to all agents
        const installed: Array<{
          skillName: string;
          agent: string;
          path: string;
          symlinkFailed?: boolean;
        }> = [];
        const failures: Array<{
          skillName: string;
          agent: string;
          error: string;
        }> = [];

        for (const skill of skills) {
          for (const agent of targetAgents) {
            const result = await installSkillForAgent(
              skill,
              agent,
              scope as InstallScope,
              method as InstallMethod,
            );

            if (result.success) {
              installed.push({
                skillName: result.skillName,
                agent: result.agent,
                path: result.path,
                ...(result.symlinkFailed ? { symlinkFailed: true } : {}),
              });
            } else {
              failures.push({
                skillName: result.skillName,
                agent: result.agent,
                error: result.error ?? "Unknown error",
              });
            }
          }
        }

        // 7. Update lock file for global non-local installs
        if (scope === "global" && !isLocal) {
          if (parsed.type === "skillsgate") {
            for (const skill of skills) {
              await addSkillToLock(sanitizeName(skill.name), {
                source: `skillsgate:@${parsed.username}/${parsed.slug}`,
                sourceType: "skillsgate",
                originalUrl: `@${parsed.username}/${parsed.slug}`,
                skillFolderHash: "",
              });
            }
          } else {
            for (const skill of skills) {
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
        }

        if (scope === "global") {
          await saveSelectedAgents(targetAgents.map((a) => a.name));
        }

        return mcpSuccess({
          source: sourceLabel,
          installed,
          failures,
          summary: {
            successCount: installed.length,
            failureCount: failures.length,
          },
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to add skills",
        );
      } finally {
        if (tmpDir) await cleanupTempDir(tmpDir);
      }
    },
  );
}
