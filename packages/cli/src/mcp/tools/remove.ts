import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { detectInstalledAgents, agents } from "../../core/agents.js";
import {
  listInstalledSkills,
  removeSkillFromAgent,
  removeCanonicalSkill,
  sanitizeName,
} from "../../core/installer.js";
import { removeSkillFromLock } from "../../core/skill-lock.js";
import { mcpSuccess, mcpError } from "../helpers.js";
import type { AgentConfig, InstallScope } from "../../types.js";

export function registerRemove(server: McpServer): void {
  server.tool(
    "skillsgate_remove",
    "Remove installed AI agent skills by name. Can remove specific skills or all installed skills.",
    {
      names: z
        .array(z.string())
        .optional()
        .describe(
          "Skill names to remove. If omitted and remove_all is false, returns an error.",
        ),
      remove_all: z
        .boolean()
        .default(false)
        .describe("If true, remove all installed skills."),
      agents: z
        .array(z.string())
        .optional()
        .describe(
          "Target specific agents. If omitted, all detected agents are used.",
        ),
      scope: z
        .enum(["global", "project"])
        .default("global")
        .describe("Installation scope to remove from."),
    },
    async ({ names, remove_all, agents: agentFilter, scope }) => {
      try {
        // 1. Resolve target agents
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

        // 2. List installed skills
        const installed = await listInstalledSkills(
          targetAgents,
          scope as InstallScope,
        );

        if (installed.size === 0) {
          return mcpSuccess({
            removed: [],
            notFound: names ?? [],
            message: "No skills currently installed.",
          });
        }

        // 3. Determine what to remove
        let toRemove: string[];

        if (remove_all) {
          toRemove = [...installed.keys()];
        } else if (names && names.length > 0) {
          toRemove = names
            .map((n) => sanitizeName(n))
            .filter((n) => installed.has(n));
        } else {
          return mcpError(
            "Specify skill names to remove, or set remove_all to true.",
          );
        }

        // 4. Track what was not found
        const notFound: string[] = [];
        if (names && !remove_all) {
          for (const n of names) {
            const safe = sanitizeName(n);
            if (!installed.has(safe)) {
              notFound.push(n);
            }
          }
        }

        // 5. Remove from agents, canonical location, and lock file
        const removed: string[] = [];

        for (const name of toRemove) {
          for (const agent of targetAgents) {
            await removeSkillFromAgent(name, agent, scope as InstallScope);
          }
          await removeCanonicalSkill(name);
          await removeSkillFromLock(name);
          removed.push(name);
        }

        return mcpSuccess({
          removed,
          notFound,
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to remove skills",
        );
      }
    },
  );
}
