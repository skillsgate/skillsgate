import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { validateGitHubToken } from "../lib/github-token";

export const githubRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

githubRoute.use("*", authMiddleware);

// ─── GET /github/repos — List user's GitHub repos (excluding already connected) ───

githubRoute.get("/github/repos", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  // Retrieve the GitHub OAuth access token from Better Auth's account table
  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
  });

  if (!account || !account.accessToken) {
    return c.json(
      {
        error: "github_not_linked",
        message:
          "No GitHub account is linked. Please link your GitHub account to connect repos.",
      },
      400,
    );
  }

  const githubToken = account.accessToken;

  // Validate token before making the repos call
  const tokenValid = await validateGitHubToken(githubToken);
  if (!tokenValid) {
    return c.json(
      {
        error: "github_reauth_required",
        message:
          "Your GitHub authorization has expired or lacks required permissions. Please re-authorize.",
      },
      403,
    );
  }

  // Fetch repos from GitHub API
  const githubRes = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&type=owner",
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "User-Agent": "SkillsGate",
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (githubRes.status === 401 || githubRes.status === 403) {
    return c.json(
      {
        error: "github_reauth_required",
        message:
          "Your GitHub authorization has expired or lacks required permissions. Please re-authorize.",
      },
      403,
    );
  }

  if (!githubRes.ok) {
    const errorText = await githubRes.text();
    return c.json(
      {
        error: "github_api_error",
        message: "Failed to fetch repos from GitHub",
        details: errorText,
      },
      502,
    );
  }

  const repos = (await githubRes.json()) as Array<{
    id: number;
    name: string;
    full_name: string;
    owner: { login: string };
    description: string | null;
    default_branch: string;
    private: boolean;
    html_url: string;
    updated_at: string;
    language: string | null;
  }>;

  // Get already-connected repos for this user
  const connectedRepos = await db.connectedRepo.findMany({
    where: { userId },
    select: { githubOwner: true, githubRepo: true },
  });

  const connectedSet = new Set(
    connectedRepos.map(
      (r: { githubOwner: string; githubRepo: string }) =>
        `${r.githubOwner}/${r.githubRepo}`,
    ),
  );

  // Filter out already-connected repos
  const availableRepos = repos
    .filter((repo) => !connectedSet.has(repo.full_name))
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      defaultBranch: repo.default_branch,
      private: repo.private,
      htmlUrl: repo.html_url,
      updatedAt: repo.updated_at,
      language: repo.language,
    }));

  return c.json({ repos: availableRepos });
});
