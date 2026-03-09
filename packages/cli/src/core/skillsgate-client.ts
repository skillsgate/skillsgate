import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { SEARCH_API_URL } from "../constants.js";

interface DownloadedFile {
  path: string;
  content: string;
  encoding: "utf-8" | "base64";
}

interface DownloadResponse {
  skill: {
    id: string;
    slug: string;
    name: string;
    description: string;
  };
  files: DownloadedFile[];
}

export class SkillsGateDownloadError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "SkillsGateDownloadError";
    this.statusCode = statusCode;
  }
}

/**
 * Download skill files from the SkillsGate API and write them to a temp directory.
 * Returns the path to the temp directory containing the extracted files.
 */
export async function downloadSkill(
  username: string,
  slug: string,
  token?: string | null
): Promise<string> {
  const url = `${SEARCH_API_URL}/api/skills/@${encodeURIComponent(username)}/${encodeURIComponent(slug)}/download`;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 404) {
    throw new SkillsGateDownloadError(
      `Skill "@${username}/${slug}" not found on SkillsGate.`,
      404
    );
  }
  if (response.status === 401) {
    throw new SkillsGateDownloadError(
      "Authentication required for this skill. Run `skillsgate login` first.",
      401
    );
  }
  if (response.status === 403) {
    throw new SkillsGateDownloadError(
      "Access denied. You may need to be granted access to this skill.",
      403
    );
  }
  if (!response.ok) {
    throw new SkillsGateDownloadError(
      `Download failed (HTTP ${response.status}).`,
      response.status
    );
  }

  const data = (await response.json()) as DownloadResponse;

  // Create a temp directory structured as a single-skill repo
  // so discoverSkills() finds it correctly
  const tmpDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "skillsgate-dl-")
  );

  // Write files into a subdirectory named after the slug
  // This ensures discoverSkills() can find the SKILL.md
  const skillDir = path.join(tmpDir, data.skill.slug);
  await fs.mkdir(skillDir, { recursive: true });

  for (const file of data.files) {
    const filePath = path.join(skillDir, file.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    if (file.encoding === "base64") {
      await fs.writeFile(filePath, Buffer.from(file.content, "base64"));
    } else {
      await fs.writeFile(filePath, file.content, "utf-8");
    }
  }

  return tmpDir;
}
