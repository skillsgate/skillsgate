import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { detectInstalledAgents, agents } from "../../core/agents.js";
import { listInstalledSkills } from "../../core/installer.js";
import { readSkillLock } from "../../core/skill-lock.js";
import { mcpSuccess, mcpError } from "../helpers.js";
import type { AgentConfig, InstallScope } from "../../types.js";

export function registerList(server: McpServer): void {
  server.tool(
    "skillsgate_list",
    "Lists skills currently installed on this machine. Supports filtering by scope (global or project) and by specific agents.",
    {
      scope: z
        .enum(["global", "project"])
        .describe("Installation scope to list skills from."),
      agents: z
        .array(z.string())
        .optional()
        .describe(
          "Optional list of agent names to filter by (e.g. ['claude-code', 'cursor']). If omitted, all installed agents are used.",
        ),
    },
    async ({ scope, agents: agentFilter }) => {
      try {
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

        const installed = await listInstalledSkills(
          targetAgents,
          scope as InstallScope,
        );

        const lock = await readSkillLock();

        const skills = Array.from(installed.entries()).map(
          ([name, { path: skillPath, agents: agentNames }]) => {
            const lockEntry = lock.skills[name];
            return {
              name,
              path: skillPath,
              agents: agentNames,
              source: lockEntry?.source ?? null,
              sourceType: lockEntry?.sourceType ?? null,
              installedAt: lockEntry?.installedAt ?? null,
              updatedAt: lockEntry?.updatedAt ?? null,
            };
          },
        );

        return mcpSuccess({
          scope,
          count: skills.length,
          skills,
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to list skills",
        );
      }
    },
  );
}
