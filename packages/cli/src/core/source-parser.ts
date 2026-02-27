import path from "node:path";
import os from "node:os";
import { ParsedSource } from "../types.js";

/**
 * Parse a source string into a structured ParsedSource.
 *
 * Supported formats:
 *   ./path/to/skills           (local relative path)
 *   ../path/to/skills          (local relative path)
 *   /absolute/path/to/skills   (local absolute path)
 *   ~/path/to/skills           (local home-relative path)
 *   owner/repo                 (GitHub shorthand)
 *   owner/repo@skill-name      (GitHub shorthand with skill filter)
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/branch/path
 *   github.com/owner/repo
 */
export function parseSource(source: string): ParsedSource {
  // 1. Try local path (starts with ./, ../, /, or ~/)
  const local = parseLocalPath(source);
  if (local) return local;

  // 2. Try full GitHub URL
  const githubUrl = parseGitHubUrl(source);
  if (githubUrl) return githubUrl;

  // 3. Try owner/repo shorthand (with optional @skill filter)
  const shorthand = parseOwnerRepo(source);
  if (shorthand) return shorthand;

  throw new SourceParseError(
    `Could not parse source: "${source}". ` +
      `Expected: owner/repo, owner/repo@skill, a GitHub URL, or a local path (./path).`,
  );
}

function parseGitHubUrl(input: string): ParsedSource | null {
  let url = input;
  if (url.startsWith("github.com/")) url = `https://${url}`;
  if (!url.startsWith("https://github.com/")) return null;

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];
    let subpath: string | undefined;
    let ref: string | undefined;

    if (parts[2] === "tree" && parts.length >= 4) {
      ref = parts[3];
      if (parts.length > 4) {
        subpath = parts.slice(4).join("/");
      }
    }

    return {
      type: "github",
      url: `https://github.com/${owner}/${repo}`,
      owner,
      repo,
      subpath,
      ref,
    };
  } catch {
    return null;
  }
}

function parseOwnerRepo(input: string): ParsedSource | null {
  const match = input.match(
    /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:@(.+))?$/,
  );
  if (!match) return null;

  const [, owner, repo, skillFilter] = match;
  return {
    type: "github",
    url: `https://github.com/${owner}/${repo}`,
    owner,
    repo,
    skillFilter,
  };
}

function parseLocalPath(input: string): ParsedSource | null {
  if (
    !input.startsWith("./") &&
    !input.startsWith("../") &&
    !input.startsWith("/") &&
    !input.startsWith("~/")
  ) {
    return null;
  }

  let resolved = input;
  if (resolved.startsWith("~/")) {
    resolved = path.join(os.homedir(), resolved.slice(2));
  }
  resolved = path.resolve(resolved);

  return {
    type: "local",
    url: resolved,
    owner: "",
    repo: path.basename(resolved),
    localPath: resolved,
  };
}

export function getSourceLabel(source: ParsedSource): string {
  if (source.type === "local") return source.localPath!;
  return `${source.owner}/${source.repo}`;
}

export function getOwnerRepo(source: ParsedSource): string {
  return `${source.owner}/${source.repo}`;
}

export async function isRepoPrivate(
  owner: string,
  repo: string,
): Promise<boolean | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: process.env.GITHUB_TOKEN
          ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
          : {},
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { private?: boolean };
    return data.private === true;
  } catch {
    return null;
  }
}

export class SourceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceParseError";
  }
}
