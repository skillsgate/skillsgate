import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readSkillLock, addSkillToLock } from "../../core/skill-lock.js";
import { fetchTreeSha, cloneRepo, cleanupTempDir } from "../../core/git.js";
import { downloadSkill } from "../../core/skillsgate-client.js";
import { getToken } from "../../utils/auth-store.js";
import { parseSource } from "../../core/source-parser.js";
import { discoverSkills } from "../../core/skill-discovery.js";
import { installSkillForAgent, sanitizeName } from "../../core/installer.js";
import { detectInstalledAgents } from "../../core/agents.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerUpdate(server: McpServer): void {
  server.tool(
    "skillsgate_update",
    "Check for and apply updates to installed skills. Compares with remote sources and reinstalls changed skills.",
    {
      name: z
        .string()
        .optional()
        .describe(
          "Name of a specific skill to update. If omitted, all skills in the lock file are checked.",
        ),
    },
    async ({ name: skillName }) => {
      try {
        const lock = await readSkillLock();
        const entries = Object.entries(lock.skills);

        if (entries.length === 0) {
          return mcpSuccess({
            updated: [],
            upToDate: [],
            failed: [],
            message: "No skills in lock file. Nothing to update.",
          });
        }

        const toCheck = skillName
          ? entries.filter(([n]) => n === sanitizeName(skillName))
          : entries;

        if (toCheck.length === 0) {
          return mcpError(
            `Skill "${skillName}" not found in lock file.`,
          );
        }

        // Group by source for efficient batch processing
        const sourceGroups = new Map<
          string,
          Array<[string, (typeof lock.skills)[string]]>
        >();
        for (const [n, entry] of toCheck) {
          const group = sourceGroups.get(entry.source) || [];
          group.push([n, entry]);
          sourceGroups.set(entry.source, group);
        }

        const updated: Array<{ name: string; source: string }> = [];
        const upToDate: Array<{ name: string }> = [];
        const failed: Array<{ name: string; error: string }> = [];

        for (const [, skills] of sourceGroups) {
          const entry0 = skills[0][1];

          // SkillsGate-sourced: always re-download
          if (entry0.sourceType === "skillsgate") {
            for (const [n, entry] of skills) {
              let tmpDir: string | undefined;
              try {
                const sgMatch = entry.originalUrl.match(
                  /^@([^/]+)\/(.+)$/,
                );
                if (!sgMatch) {
                  failed.push({
                    name: n,
                    error: `Invalid SkillsGate source: ${entry.originalUrl}`,
                  });
                  continue;
                }
                const [, sgUsername, sgSlug] = sgMatch;

                const token = await getToken();
                tmpDir = await downloadSkill(sgUsername, sgSlug, token);
                const discovered = await discoverSkills(tmpDir);
                const matched = discovered.filter(
                  (s) => sanitizeName(s.name) === n,
                );

                if (matched.length === 0) {
                  failed.push({
                    name: n,
                    error: "Skill no longer exists on SkillsGate.",
                  });
                  continue;
                }

                const detectedAgents = await detectInstalledAgents();
                for (const skill of matched) {
                  for (const agent of detectedAgents) {
                    await installSkillForAgent(
                      skill,
                      agent,
                      "global",
                      "symlink",
                    );
                  }
                }

                await addSkillToLock(n, {
                  source: entry.source,
                  sourceType: entry.sourceType,
                  originalUrl: entry.originalUrl,
                  skillFolderHash: "",
                });

                updated.push({ name: n, source: entry.source });
              } catch (err: unknown) {
                failed.push({
                  name: n,
                  error:
                    err instanceof Error
                      ? err.message
                      : "Update failed",
                });
              } finally {
                if (tmpDir) await cleanupTempDir(tmpDir);
              }
            }
            continue;
          }

          // GitHub-sourced: hash-based update detection
          const parsed = parseSource(entry0.originalUrl);
          const { owner, repo } = parsed;

          for (const [n, entry] of skills) {
            let tmpDir: string | undefined;
            try {
              const currentSha = await fetchTreeSha(owner, repo, n);
              if (!currentSha) {
                failed.push({
                  name: n,
                  error:
                    "Could not fetch update info from GitHub.",
                });
                continue;
              }

              if (currentSha === entry.skillFolderHash) {
                upToDate.push({ name: n });
                continue;
              }

              tmpDir = await cloneRepo(parsed);
              const discovered = await discoverSkills(tmpDir);
              const matched = discovered.filter(
                (s) => sanitizeName(s.name) === n,
              );

              if (matched.length === 0) {
                failed.push({
                  name: n,
                  error: `Skill no longer exists in ${entry.source}.`,
                });
                continue;
              }

              const detectedAgents = await detectInstalledAgents();
              for (const skill of matched) {
                for (const agent of detectedAgents) {
                  await installSkillForAgent(
                    skill,
                    agent,
                    "global",
                    "symlink",
                  );
                }
              }

              await addSkillToLock(n, {
                source: entry.source,
                sourceType: entry.sourceType,
                originalUrl: entry.originalUrl,
                skillFolderHash: currentSha,
              });

              updated.push({ name: n, source: entry.source });
            } catch (err: unknown) {
              failed.push({
                name: n,
                error:
                  err instanceof Error
                    ? err.message
                    : "Update failed",
              });
            } finally {
              if (tmpDir) await cleanupTempDir(tmpDir);
            }
          }
        }

        return mcpSuccess({
          updated,
          upToDate,
          failed,
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to update skills",
        );
      }
    },
  );
}
