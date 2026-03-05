import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileExists, dirExists } from "../utils/fs.js";
import { getToken } from "../utils/auth-store.js";
import { fmt } from "../ui/format.js";
import { API_BASE_URL, SKILL_MD } from "../constants.js";
import {
  validateDirectory,
  validateName,
  validateDescription,
  parseSkillMd,
  checkSizeLimit,
  formatBytes,
  collectFiles,
  MAX_TOTAL_SIZE,
} from "../core/skill-validator.js";
import { generateSkillMd, getDefaultSkillName, getSkillNameValidationError } from "../core/skill-template.js";
import type { ParsedSkill } from "../types.js";

interface PublishArgs {
  path?: string;
  init: boolean;
  dryRun: boolean;
  interactive: boolean;
}

interface SkillCreateResponse {
  skillId: string;
  slug: string;
}

/**
 * Parse CLI arguments for publish command
 */
function parseArgs(args: string[]): PublishArgs {
  const result: PublishArgs = {
    init: false,
    dryRun: false,
    interactive: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--init" || arg === "-i") {
      result.init = true;
    } else if (arg === "--dry-run" || arg === "-d") {
      result.dryRun = true;
    } else if (arg === "--interactive" || arg === "--stdin") {
      result.interactive = true;
    } else if (!arg.startsWith("-")) {
      // Positional argument - skill path
      result.path = arg;
    }
  }

  return result;
}

/**
 * Main entry point for publish command
 */
export async function runPublish(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  // Check authentication first (unless init-only)
  if (!parsed.init) {
    const token = await getToken();
    if (!token) {
      p.log.error(fmt.error("Not authenticated. Please run 'skillsgate login' first."));
      process.exit(1);
    }
  }

  // Route to appropriate mode
  if (parsed.init) {
    await runInitMode(parsed.path);
  } else if (parsed.interactive) {
    await runInteractiveMode();
  } else {
    await runPublishMode(parsed.path, parsed.dryRun);
  }
}

/**
 * Initialize mode - generate SKILL.md template
 */
async function runInitMode(skillPath?: string): Promise<void> {
  const targetDir = skillPath ? path.resolve(skillPath) : process.cwd();

  // Check if directory exists
  if (!(await dirExists(targetDir))) {
    p.log.error(fmt.error(`Directory does not exist: ${targetDir}`));
    process.exit(1);
  }

  const skillMdPath = path.join(targetDir, SKILL_MD);
  const skillMdExists = await fileExists(skillMdPath);

  // Check if SKILL.md already exists
  if (skillMdExists) {
    const overwrite = await p.confirm({
      message: "SKILL.md already exists. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.log.info("Cancelled.");
      return;
    }
  }

  // Get default name from directory
  const defaultName = getDefaultSkillName(targetDir);

  // Prompt for skill name
  const name = await p.text({
    message: "Skill name:",
    placeholder: defaultName || "my-skill",
    initialValue: defaultName || undefined,
    validate(value) {
      const error = getSkillNameValidationError(value);
      if (error) return error;
    },
  });

  if (p.isCancel(name)) {
    p.log.info("Cancelled.");
    return;
  }

  // Prompt for description
  const description = await p.text({
    message: "Description:",
    placeholder: "Briefly describe what this skill does...",
    validate(value) {
      if (!value || value.trim().length === 0) {
        return "Description is required";
      }
      if (value.trim().length > 1024) {
        return `Description is ${value.length} characters (max 1024)`;
      }
    },
  });

  if (p.isCancel(description)) {
    p.log.info("Cancelled.");
    return;
  }

  // Prompt for overview (optional)
  const overview = await p.text({
    message: "Overview (optional):",
    placeholder: "What should this skill accomplish?",
  });

  if (p.isCancel(overview)) {
    p.log.info("Cancelled.");
    return;
  }

  // Prompt for license (optional)
  const license = await p.text({
    message: "License (optional):",
    placeholder: "MIT, Apache-2.0, etc.",
  });

  if (p.isCancel(license)) {
    p.log.info("Cancelled.");
    return;
  }

  // Generate template
  const template = generateSkillMd({
    name,
    description: description.trim(),
    overview: overview?.trim() || undefined,
    license: license?.trim() || undefined,
  });

  // Write file
  try {
    await fs.writeFile(skillMdPath, template, "utf-8");
    p.log.success(`Generated ${SKILL_MD}`);
    p.log.info(`Skill template created in ${pc.dim(skillMdPath)}`);
    console.log();
    console.log(pc.dim("Next steps:"));
    console.log(`  1. Edit ${SKILL_MD} to add your instructions`);
    console.log(`  2. Add supporting files to scripts/, references/, or assets/ (optional)`);
    console.log(`  3. Run ${pc.bold("skillsgate publish")} to publish`);
  } catch (err) {
    p.log.error(fmt.error(`Failed to write ${SKILL_MD}: ${(err as Error).message}`));
    process.exit(1);
  }
}

/**
 * Interactive mode - paste content via prompts
 */
async function runInteractiveMode(): Promise<void> {
  // Prompt for skill name
  const name = await p.text({
    message: "Skill name:",
    placeholder: "my-awesome-skill",
    validate(value) {
      const error = getSkillNameValidationError(value);
      if (error) return error;
    },
  });

  if (p.isCancel(name)) {
    p.log.info("Cancelled.");
    return;
  }

  // Prompt for description
  const description = await p.text({
    message: "Description:",
    placeholder: "What this skill does and when to use it",
    validate(value) {
      if (!value || value.trim().length === 0) {
        return "Description is required";
      }
      if (value.trim().length > 1024) {
        return `Description is ${value.length} characters (max 1024)`;
      }
    },
  });

  if (p.isCancel(description)) {
    p.log.info("Cancelled.");
    return;
  }

  // Read multi-line SKILL.md content from stdin
  p.log.info("Paste SKILL.md content (press Ctrl+D when done):");
  
  const content = await readStdin();
  
  if (!content || content.trim().length === 0) {
    p.log.error(fmt.error("No content provided."));
    process.exit(1);
  }

  // Validate the content
  const parsed = parseSkillMd(content);
  if (!parsed) {
    p.log.error(fmt.error("Invalid SKILL.md format. Must include valid 'name' and 'description' in YAML frontmatter."));
    process.exit(1);
  }

  // Verify name matches
  if (parsed.name !== name) {
    p.log.error(fmt.error(`Name in SKILL.md ('${parsed.name}') does not match provided name ('${name}').`));
    process.exit(1);
  }

  p.log.success(`Content received (${content.length} chars)`);

  // Create temp directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "skillsgate-publish-"));
  const skillDir = path.join(tempDir, name);

  try {
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, SKILL_MD), content, "utf-8");

    // Prompt for visibility
    const visibility = await p.select({
      message: "Visibility:",
      options: [
        { value: "private", label: "Private" },
        { value: "public", label: "Public" },
      ],
      initialValue: "private",
    });

    if (p.isCancel(visibility)) {
      p.log.info("Cancelled.");
      return;
    }

    // Publish
    await performPublish(skillDir, parsed, visibility as "private" | "public");
  } finally {
    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {
      // Ignore cleanup errors
    });
  }
}

/**
 * Normal publish mode from directory
 */
async function runPublishMode(skillPath?: string, dryRun = false): Promise<void> {
  const targetDir = skillPath ? path.resolve(skillPath) : process.cwd();

  // Validate directory
  const spin = p.spinner();
  spin.start("Validating skill directory...");

  const validation = await validateDirectory(targetDir);
  
  if (!validation.valid) {
    spin.stop("Validation failed");
    for (const error of validation.errors) {
      p.log.error(fmt.error(error));
    }
    process.exit(1);
  }

  spin.stop("Directory validated");
  p.log.success(`Found ${SKILL_MD}`);
  p.log.success(`Directory name matches skill name: "${fmt.skillName(validation.skillName!)}"`);

  // Check size limits
  const sizeSpin = p.spinner();
  sizeSpin.start("Checking package size...");

  const sizeCheck = await checkSizeLimit(targetDir);
  
  if (!sizeCheck.valid) {
    sizeSpin.stop("Size check failed");
    for (const error of sizeCheck.errors) {
      p.log.error(fmt.error(error));
    }
    process.exit(1);
  }

  sizeSpin.stop(`Package size: ${formatBytes(sizeCheck.totalSize)} / ${formatBytes(MAX_TOTAL_SIZE)}`);

  // Read and parse SKILL.md for metadata display
  const skillMdContent = await fs.readFile(path.join(targetDir, SKILL_MD), "utf-8");
  const parsed = parseSkillMd(skillMdContent)!;

  console.log();
  console.log(pc.bold("Skill Metadata:"));
  console.log(`  ${pc.dim("Name:")} ${parsed.name}`);
  console.log(`  ${pc.dim("Description:")} ${parsed.description}`);
  console.log();

  // Dry run - stop here
  if (dryRun) {
    p.log.success("Name format valid");
    p.log.success(`Description length valid (${parsed.description.length} chars)`);
    p.log.success(`Total size: ${formatBytes(sizeCheck.totalSize)} / ${formatBytes(MAX_TOTAL_SIZE)}`);
    console.log();
    p.log.info("Dry run complete. No changes made.");
    p.log.info(`Ready to publish: ${pc.bold("skillsgate publish")}`);
    return;
  }

  // Prompt for visibility
  const visibility = await p.select({
    message: "Visibility:",
    options: [
      { value: "private", label: "Private" },
      { value: "public", label: "Public" },
    ],
    initialValue: "private",
  });

  if (p.isCancel(visibility)) {
    p.log.info("Cancelled.");
    return;
  }

  // Perform publish
  await performPublish(targetDir, parsed, visibility as "private" | "public");
}

/**
 * Perform the actual publish via API
 */
async function performPublish(
  skillDir: string,
  parsed: ParsedSkill,
  visibility: "private" | "public"
): Promise<void> {
  const token = await getToken();
  if (!token) {
    p.log.error(fmt.error("Not authenticated. Please run 'skillsgate login' first."));
    process.exit(1);
  }

  // Step 1: Create skill record
  const createSpin = p.spinner();
  createSpin.start("Creating skill record...");

  let skillId: string;
  let slug: string;

  try {
    const response = await fetch(`${API_BASE_URL}/api/skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: parsed.name,
        slug: parsed.name, // Use name as slug
        description: parsed.description,
        visibility,
      }),
    });

    if (response.status === 401) {
      createSpin.stop("Authentication failed");
      p.log.error(fmt.error("Session expired. Please run 'skillsgate login' to re-authenticate."));
      process.exit(1);
    }

    if (response.status === 409) {
      createSpin.stop("Skill already exists");
      p.log.error(fmt.error(`Skill '${parsed.name}' already exists. Choose a different name or update the existing skill.`));
      process.exit(1);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
      createSpin.stop("Failed");
      p.log.error(fmt.error(`Failed to create skill: ${body.error || response.statusText}`));
      process.exit(1);
    }

    const result = (await response.json()) as SkillCreateResponse;
    skillId = result.skillId;
    slug = result.slug;
    createSpin.stop("Skill record created");
  } catch (err) {
    createSpin.stop("Failed");
    if (err instanceof TypeError && (err as any).cause?.code === "ECONNREFUSED") {
      p.log.error(fmt.error("Could not connect to the API. Please try again later."));
    } else {
      p.log.error(fmt.error(`Failed to create skill: ${(err as Error).message}`));
    }
    process.exit(1);
  }

  // Step 2: Upload files
  const uploadSpin = p.spinner();
  uploadSpin.start("Uploading files...");

  try {
    const files = await collectFiles(skillDir);
    const formData = new FormData();

    for (const file of files) {
      const content = await fs.readFile(file.fullPath);
      const blob = new Blob([content]);
      formData.append("files", blob, file.relativePath);
    }

    const response = await fetch(`${API_BASE_URL}/api/skills/${skillId}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
      throw new Error(body.error || `Upload failed (${response.status})`);
    }

    uploadSpin.stop(`Uploaded ${files.length} file${files.length !== 1 ? "s" : ""}`);
  } catch (err) {
    uploadSpin.stop("Failed");
    const errorMessage = (err as Error).message;
    p.log.error(fmt.error(`Failed to upload files: ${errorMessage}`));
    p.log.warn(fmt.warn("Skill was created as a draft. You can retry by running the publish command again."));
    console.log(`  ${pc.dim("URL:")} ${API_BASE_URL}/skills/${slug}`);
    process.exit(1);
  }

  // Success!
  p.log.success("Skill published successfully!");
  console.log();
  console.log(`  ${pc.dim("URL:")} ${pc.cyan(`${API_BASE_URL}/skills/${slug}`)}`);
  console.log(`  ${pc.dim("Visibility:")} ${visibility === "private" ? "Private" : "Public"}`);
  if (visibility === "private") {
    console.log(`  ${pc.dim("Share with:")} skillsgate share ${slug} <username>`);
  }
}

/**
 * Read multi-line input from stdin
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";

    // Set stdin to raw mode to handle Ctrl+D properly
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf-8");
    }

    process.stdin.on("data", (chunk) => {
      const str = chunk.toString();
      
      // Check for Ctrl+D (EOT character)
      if (str.includes("\x04")) {
        const parts = str.split("\x04");
        data += parts[0];
        
        // Restore stdin
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
          process.stdin.pause();
        }
        
        resolve(data);
        return;
      }
      
      data += str;
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    process.stdin.on("error", (err) => {
      reject(err);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
      }
      reject(new Error("Timeout waiting for input"));
    }, 5 * 60 * 1000);
  });
}
