import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { fileExists, dirExists } from "../utils/fs.js";
import { SKILL_MD } from "../constants.js";
import type { PublishSkillMetadata, ValidationResult, ParsedSkill, SizeCheckResult, DirectoryValidationResult } from "../types.js";

// Size limits (bytes)
export const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
export const MAX_SKILL_MD_SIZE = 500 * 1024; // 500 KB

// Name validation regex per agentskills.io spec
// Must start/end with alphanumeric, no consecutive hyphens, max 64 chars
export const NAME_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

// File exclusion patterns
export const EXCLUDED_PATTERNS = [
  ".git/",
  "node_modules/",
  ".DS_Store",
  "*.log",
  "dist/",
  "build/",
  "__pycache__/",
];

/**
 * Validate skill name per agentskills.io spec
 * - 1-64 chars
 * - Lowercase a-z, 0-9, hyphens only
 * - No start/end hyphen
 * - No consecutive hyphens
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.length === 0) {
    errors.push("Name is required");
    return { valid: false, errors };
  }

  if (name.length > 64) {
    errors.push(`Name is ${name.length} characters (max 64)`);
  }

  if (!NAME_REGEX.test(name)) {
    errors.push(
      "Invalid name format. Use only lowercase letters, numbers, and hyphens. Cannot start/end with hyphen or use consecutive hyphens."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate description length
 * - Min 1 char
 * - Max 1024 chars
 */
export function validateDescription(desc: string): ValidationResult {
  const errors: string[] = [];

  if (!desc || desc.trim().length === 0) {
    errors.push("Description is required");
    return { valid: false, errors };
  }

  const trimmed = desc.trim();

  if (trimmed.length > 1024) {
    errors.push(`Description is ${trimmed.length} characters (max 1024). Shorten your description.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse SKILL.md content and validate frontmatter
 */
export function parseSkillMd(content: string): ParsedSkill | null {
  try {
    const parsed = matter(content);
    const data = parsed.data as Record<string, unknown>;

    // Required fields
    if (!data.name || typeof data.name !== "string") {
      return null;
    }

    if (!data.description || typeof data.description !== "string") {
      return null;
    }

    const nameValidation = validateName(data.name);
    if (!nameValidation.valid) {
      return null;
    }

    const descValidation = validateDescription(data.description);
    if (!descValidation.valid) {
      return null;
    }

    // Parse optional fields
    const result: ParsedSkill = {
      name: data.name,
      description: data.description,
      content: parsed.content,
    };

    if (data.license && typeof data.license === "string") {
      result.license = data.license;
    }

    if (data.compatibility && typeof data.compatibility === "string") {
      result.compatibility = data.compatibility;
    }

    if (data.metadata && typeof data.metadata === "object" && data.metadata !== null) {
      result.metadata = data.metadata as Record<string, string>;
    }

    if (data["allowed-tools"] && typeof data["allowed-tools"] === "string") {
      result.allowedTools = data["allowed-tools"];
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Check if a file should be excluded from upload
 */
export function shouldExcludeFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  
  // Check hidden files (starting with .)
  if (basename.startsWith(".")) {
    return true;
  }

  // Check excluded patterns
  for (const pattern of EXCLUDED_PATTERNS) {
    if (pattern.endsWith("/")) {
      // Directory pattern
      const dirName = pattern.slice(0, -1);
      if (filePath.includes(`/${dirName}/`) || filePath.startsWith(`${dirName}/`)) {
        return true;
      }
    } else if (pattern.startsWith("*.")) {
      // Extension pattern
      const ext = pattern.slice(1);
      if (basename.endsWith(ext)) {
        return true;
      }
    } else {
      // Exact match
      if (basename === pattern) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Recursively collect files in a directory, excluding certain patterns
 */
export async function collectFiles(
  dir: string,
  baseDir: string = dir
): Promise<Array<{ relativePath: string; fullPath: string; size: number }>> {
  const files: Array<{ relativePath: string; fullPath: string; size: number }> = [];

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (shouldExcludeFile(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await collectFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const stats = await fs.stat(fullPath);
      files.push({
        relativePath,
        fullPath,
        size: stats.size,
      });
    }
  }

  return files;
}

/**
 * Check total size against limits
 */
export async function checkSizeLimit(dir: string): Promise<SizeCheckResult> {
  const errors: string[] = [];
  
  try {
    const files = await collectFiles(dir);
    let totalSize = 0;
    const fileSizes: Array<{ name: string; size: number }> = [];

    // Check individual file sizes
    for (const file of files) {
      if (file.relativePath === SKILL_MD && file.size > MAX_SKILL_MD_SIZE) {
        errors.push(
          `SKILL.md is ${formatBytes(file.size)} (max ${formatBytes(MAX_SKILL_MD_SIZE)}). Consider moving content to reference files.`
        );
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.relativePath} is ${formatBytes(file.size)} (max ${formatBytes(MAX_FILE_SIZE)}). Remove or compress this file.`
        );
      }

      totalSize += file.size;
      fileSizes.push({ name: file.relativePath, size: file.size });
    }

    // Check total size
    if (totalSize > MAX_TOTAL_SIZE) {
      // Sort by size descending to show largest files first
      const largestFiles = fileSizes
        .sort((a, b) => b.size - a.size)
        .slice(0, 5);
      
      const largestFilesStr = largestFiles
        .map((f) => `${f.name} (${formatBytes(f.size)})`)
        .join(", ");
      
      errors.push(
        `Package size is ${formatBytes(totalSize)} (max ${formatBytes(MAX_TOTAL_SIZE)}). Largest files: ${largestFilesStr}. Remove or compress large files.`
      );
    }

    return {
      valid: errors.length === 0,
      totalSize,
      files: fileSizes,
      errors,
    };
  } catch (err) {
    return {
      valid: false,
      totalSize: 0,
      files: [],
      errors: [`Failed to check directory size: ${(err as Error).message}`],
    };
  }
}

/**
 * Validate full skill directory
 */
export async function validateDirectory(dir: string): Promise<DirectoryValidationResult> {
  const errors: string[] = [];

  // Check if directory exists
  const exists = await dirExists(dir);
  if (!exists) {
    return {
      valid: false,
      skillName: null,
      errors: [`Directory does not exist: ${dir}`],
    };
  }

  // Check for SKILL.md
  const skillMdPath = path.join(dir, SKILL_MD);
  const hasSkillMd = await fileExists(skillMdPath);
  if (!hasSkillMd) {
    return {
      valid: false,
      skillName: null,
      errors: [`No SKILL.md found in ${dir}. Run 'skillsgate publish --init' to create one.`],
    };
  }

  // Parse SKILL.md
  let content: string;
  try {
    content = await fs.readFile(skillMdPath, "utf-8");
  } catch (err) {
    return {
      valid: false,
      skillName: null,
      errors: [`Failed to read SKILL.md: ${(err as Error).message}`],
    };
  }

  const parsed = parseSkillMd(content);
  if (!parsed) {
    return {
      valid: false,
      skillName: null,
      errors: ["Invalid SKILL.md format. Must include valid 'name' and 'description' in YAML frontmatter."],
    };
  }

  // Check directory name matches skill name
  const dirName = path.basename(dir);
  if (dirName !== parsed.name) {
    return {
      valid: false,
      skillName: parsed.name,
      errors: [
        `Directory name '${dirName}' does not match skill name '${parsed.name}'. Rename directory to '${parsed.name}'.`,
      ],
    };
  }

  // Validate name format (should already be valid from parseSkillMd, but double-check)
  const nameValidation = validateName(parsed.name);
  if (!nameValidation.valid) {
    errors.push(...nameValidation.errors);
  }

  // Validate description
  const descValidation = validateDescription(parsed.description);
  if (!descValidation.valid) {
    errors.push(...descValidation.errors);
  }

  return {
    valid: errors.length === 0,
    skillName: parsed.name,
    errors,
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Get directory name and validate it as a skill name
 */
export function getDirectorySkillName(dir: string): { name: string; valid: boolean } {
  const dirName = path.basename(dir);
  const validation = validateName(dirName);
  return {
    name: dirName,
    valid: validation.valid,
  };
}
