import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { getToken } from "../../utils/auth-store.js";
import { API_BASE_URL, SKILL_MD } from "../../constants.js";
import {
  validateDirectory,
  checkSizeLimit,
  parseSkillMd,
  collectFiles,
  formatBytes,
  MAX_TOTAL_SIZE,
} from "../../core/skill-validator.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerPublish(server: McpServer): void {
  server.tool(
    "skillsgate_publish",
    "Publish a skill to the SkillsGate registry. Requires authentication.",
    {
      path: z
        .string()
        .optional()
        .describe("Directory path containing the skill. Defaults to current working directory."),
      visibility: z
        .enum(["private", "public"])
        .default("private")
        .describe("Skill visibility on the registry."),
      dry_run: z
        .boolean()
        .default(false)
        .describe("If true, validate the skill without publishing."),
    },
    async ({ path: skillPath, visibility, dry_run }) => {
      try {
        // 1. Check authentication
        const token = await getToken();
        if (!token) {
          return mcpError(
            "Authentication required. Run `skillsgate login` in your terminal first.",
            "UNAUTHORIZED",
          );
        }

        // 2. Resolve target directory
        const targetDir = skillPath ? path.resolve(skillPath) : process.cwd();

        // 3. Validate directory structure
        const validation = await validateDirectory(targetDir);
        if (!validation.valid) {
          return mcpError(
            `Validation failed: ${validation.errors.join("; ")}`,
            "VALIDATION_FAILED",
          );
        }

        // 4. Check size limits
        const sizeCheck = await checkSizeLimit(targetDir);
        if (!sizeCheck.valid) {
          return mcpError(
            `Size check failed: ${sizeCheck.errors.join("; ")}`,
            "SIZE_LIMIT_EXCEEDED",
          );
        }

        // 5. Read and parse SKILL.md
        const skillMdContent = await fs.readFile(
          path.join(targetDir, SKILL_MD),
          "utf-8",
        );
        const parsed = parseSkillMd(skillMdContent);
        if (!parsed) {
          return mcpError(
            "Invalid SKILL.md format. Must include valid 'name' and 'description' in YAML frontmatter.",
            "INVALID_SKILL_MD",
          );
        }

        // 6. Dry run — return validation success with metadata
        if (dry_run) {
          return mcpSuccess({
            dryRun: true,
            valid: true,
            skill: {
              name: parsed.name,
              description: parsed.description,
              license: parsed.license ?? null,
            },
            size: {
              total: formatBytes(sizeCheck.totalSize),
              limit: formatBytes(MAX_TOTAL_SIZE),
              fileCount: sizeCheck.files.length,
            },
            visibility,
          });
        }

        // 7. Create skill record
        const createResponse = await fetch(`${API_BASE_URL}/api/skills`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: parsed.name,
            slug: parsed.name,
            description: parsed.description,
            visibility,
          }),
        });

        if (createResponse.status === 401) {
          return mcpError(
            "Session expired. Run `skillsgate login` to re-authenticate.",
            "AUTH_EXPIRED",
          );
        }

        if (createResponse.status === 409) {
          return mcpError(
            `Skill '${parsed.name}' already exists. Choose a different name or update the existing skill.`,
            "SKILL_EXISTS",
          );
        }

        if (!createResponse.ok) {
          const body = (await createResponse.json().catch(() => ({
            error: "Unknown error",
          }))) as { error?: string };
          return mcpError(
            `Failed to create skill: ${body.error || createResponse.statusText}`,
            "CREATE_FAILED",
          );
        }

        const { skillId, slug } = (await createResponse.json()) as {
          skillId: string;
          slug: string;
        };

        // 8. Upload files via FormData
        const files = await collectFiles(targetDir);
        const formData = new FormData();

        for (const file of files) {
          const content = await fs.readFile(file.fullPath);
          const blob = new Blob([content]);
          formData.append("files", blob, file.relativePath);
        }

        const uploadResponse = await fetch(
          `${API_BASE_URL}/api/skills/${skillId}/files`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          const body = (await uploadResponse.json().catch(() => ({
            error: "Unknown error",
          }))) as { error?: string };
          return mcpError(
            `Skill created but file upload failed: ${body.error || `HTTP ${uploadResponse.status}`}. The skill was saved as a draft.`,
            "UPLOAD_FAILED",
          );
        }

        // 9. Return published result
        return mcpSuccess({
          published: true,
          skillId,
          slug,
          url: `${API_BASE_URL}/skills/${slug}`,
          visibility,
          fileCount: files.length,
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to publish skill",
          "PUBLISH_FAILED",
        );
      }
    },
  );
}
