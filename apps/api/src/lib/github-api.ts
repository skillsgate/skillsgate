// ─── GitHub REST API client ──────────────────────────────────────
//
// Low-level functions for interacting with the GitHub API.
// All functions use native `fetch` (no external HTTP libraries).

// ─── Types ───────────────────────────────────────────────────────

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
  description: string | null;
  html_url: string;
  updated_at: string;
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

const GITHUB_API = "https://api.github.com";

function headers(token: string, accept?: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": "SkillsGate",
    Accept: accept ?? "application/vnd.github+json",
  };
}

/**
 * Throw a descriptive error for common GitHub API failure codes.
 */
function handleErrorStatus(res: Response, context: string): never {
  if (res.status === 401) {
    throw new Error(`GitHub 401 Unauthorized: ${context}. Token may be invalid or expired.`);
  }
  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      const resetAt = res.headers.get("x-ratelimit-reset");
      const resetDate = resetAt ? new Date(Number(resetAt) * 1000).toISOString() : "unknown";
      throw new Error(`GitHub 403 Rate Limit exceeded: ${context}. Resets at ${resetDate}.`);
    }
    throw new Error(`GitHub 403 Forbidden: ${context}.`);
  }
  if (res.status === 404) {
    throw new Error(`GitHub 404 Not Found: ${context}.`);
  }
  throw new Error(`GitHub API error ${res.status}: ${context}.`);
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Fetch all repositories owned by the authenticated user.
 * Paginates automatically by following the `Link` header.
 */
export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let url: string | null = `${GITHUB_API}/user/repos?per_page=100&sort=updated&type=owner`;

  while (url) {
    const res = await fetch(url, { headers: headers(token) });

    if (!res.ok) {
      handleErrorStatus(res, "fetching user repos");
    }

    const page: GitHubRepo[] = await res.json();
    repos.push(...page);

    // Parse Link header for next page
    url = parseLinkNext(res.headers.get("link"));
  }

  return repos;
}

/**
 * Fetch the full recursive tree for a branch/ref.
 * Returns a flat list of all blobs and trees with their paths.
 */
export async function fetchRepoTree(
  token: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<TreeEntry[]> {
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const res = await fetch(url, { headers: headers(token) });

  if (!res.ok) {
    handleErrorStatus(res, `fetching tree for ${owner}/${repo}@${branch}`);
  }

  const body = (await res.json()) as { tree: TreeEntry[]; truncated: boolean };

  if (body.truncated) {
    console.warn(
      `[github-api] Tree for ${owner}/${repo}@${branch} was truncated — very large repo.`,
    );
  }

  return body.tree;
}

/**
 * Fetch raw file content as an ArrayBuffer.
 */
export async function fetchFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string,
): Promise<ArrayBuffer> {
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: headers(token, "application/vnd.github.raw+json"),
  });

  if (!res.ok) {
    handleErrorStatus(res, `fetching file ${owner}/${repo}/${path}@${branch}`);
  }

  return res.arrayBuffer();
}

/**
 * Fetch raw file content as a UTF-8 string.
 */
export async function fetchFileText(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string,
): Promise<string> {
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: headers(token, "application/vnd.github.raw+json"),
  });

  if (!res.ok) {
    handleErrorStatus(res, `fetching file ${owner}/${repo}/${path}@${branch}`);
  }

  return res.text();
}

// ─── Link header pagination parser ──────────────────────────────

/**
 * Extract the `rel="next"` URL from a GitHub `Link` header value.
 * Returns null when there is no next page.
 */
function parseLinkNext(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  const parts = linkHeader.split(",");
  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }

  return null;
}
