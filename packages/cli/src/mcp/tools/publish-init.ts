import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { validateName } from "../../core/skill-validator.js";
import { generateSkillMd } from "../../core/skill-template.js";
import { dirExists, fileExists } from "../../utils/fs.js";
import { SKILL_MD } from "../../constants.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerPublishInit(server: McpServer): void {
  server.tool(
    "skillsgate_publish_init",
    "Generate a SKILL.md template file for publishing a new skill.",
    {
      path: z
        .string()
        .optional()
        .describe("Directory path where SKILL.md will be created. Defaults to current working directory."),
      name: z
        .string()
        .describe("Skill name (lowercase, hyphens allowed, 1-64 chars)."),
      description: z
        .string()
        .describe("Short description of the skill (max 1024 chars)."),
      overview: z
        .string()
        .optional()
        .describe("Longer overview of the skill's purpose."),
      license: z
        .string()
        .optional()
        .describe("License identifier (e.g. MIT, Apache-2.0)."),
      overwrite: z
        .boolean()
        .default(false)
        .describe("If true, overwrite an existing SKILL.md file."),
    },
    async ({ path: skillPath, name, description, overview, license, overwrite }) => {
      try {
        // 1. Validate skill name
        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
          return mcpError(
            `Invalid skill name: ${nameValidation.errors.join("; ")}`,
            "INVALID_NAME",
          );
        }

        // 2. Resolve and check target directory
        const targetDir = skillPath ? path.resolve(skillPath) : process.cwd();
        if (!(await dirExists(targetDir))) {
          return mcpError(
            `Directory does not exist: ${targetDir}`,
            "DIR_NOT_FOUND",
          );
        }

        // 3. Check if SKILL.md already exists
        const skillMdPath = path.join(targetDir, SKILL_MD);
        if ((await fileExists(skillMdPath)) && !overwrite) {
          return mcpError(
            `${SKILL_MD} already exists in ${targetDir}. Set overwrite=true to replace it.`,
            "FILE_EXISTS",
          );
        }

        // 4. Generate and write template
        const template = generateSkillMd({
          name,
          description: description.trim(),
          overview: overview?.trim() || undefined,
          license: license?.trim() || undefined,
        });

        await fs.writeFile(skillMdPath, template, "utf-8");

        // 5. Return success
        return mcpSuccess({
          created: true,
          path: skillMdPath,
          name,
          nextSteps: [
            `Edit ${SKILL_MD} to add your instructions`,
            "Add supporting files to scripts/, references/, or assets/ (optional)",
            "Run `skillsgate publish` to publish",
          ],
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to generate SKILL.md",
          "INIT_FAILED",
        );
      }
    },
  );
}
