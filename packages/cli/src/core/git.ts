import simpleGit, { SimpleGit } from "simple-git";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { ParsedSource } from "../types.js";

export class GitCloneError extends Error {
  constructor(
    message: string,
    public readonly isAuth: boolean = false,
  ) {
    super(message);
    this.name = "GitCloneError";
  }
}

/**
 * Clone a GitHub repo to a temp directory.
 * Uses shallow clone (depth=1) for speed.
 */
export async function cloneRepo(source: ParsedSource): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "skillsgate-"));

  const git: SimpleGit = simpleGit();
  const cloneUrl = `${source.url}.git`;

  try {
    const cloneOptions = ["--depth", "1"];
    if (source.ref) {
      cloneOptions.push("--branch", source.ref);
    }

    await git.clone(cloneUrl, tmpDir, cloneOptions);
    return tmpDir;
  } catch (err: unknown) {
    await cleanupTempDir(tmpDir);

    const msg = err instanceof Error ? err.message : String(err);
    const isAuth =
      msg.includes("Authentication failed") ||
      msg.includes("could not read Username") ||
      msg.includes("Repository not found");

    throw new GitCloneError(
      `Failed to clone ${source.url}: ${msg}`,
      isAuth,
    );
  }
}

/**
 * Fetch the tree SHA for a specific path in a GitHub repo.
 * Used for update detection.
 */
export async function fetchTreeSha(
  owner: string,
  repo: string,
  skillPath: string,
): Promise<string | null> {
  let normalizedPath = skillPath
    .replace(/^\//, "")
    .replace(/\/SKILL\.md$/, "");
  if (!normalizedPath) normalizedPath = ".";

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) headers.Authorization = `token ${token}`;

  for (const branch of ["main", "master"]) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers },
      );
      if (!res.ok) continue;

      const data = (await res.json()) as {
        sha: string;
        tree: Array<{ path: string; sha: string; type: string }>;
      };

      const entry = data.tree.find(
        (t) => t.path === normalizedPath && t.type === "tree",
      );
      if (entry) return entry.sha;

      if (normalizedPath === ".") return data.sha;
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Clean up a temporary directory safely.
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  if (!dir.startsWith(os.tmpdir())) return;
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Best effort cleanup
  }
}
