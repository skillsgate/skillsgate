import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";
import { createGitHubAppJwt, listInstallationRepos } from "../lib/github-app";

export const githubRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

githubRoute.use("*", authMiddleware);

async function syncUserInstallationsFromGitHub(
  userId: string,
  token: string,
  db: Variables["db"],
): Promise<{ ok: true } | { ok: false; reason: "oauth_forbidden" | "github_unavailable" }> {
  type GitHubInstallation = {
    id: number;
    account: {
      login?: string;
      type?: string;
    } | null;
  };

  const installations: GitHubInstallation[] = [];
  let nextUrl: string | null =
    "https://api.github.com/user/installations?per_page=100";

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "SkillsGate",
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, reason: "oauth_forbidden" };
      }
      return { ok: false, reason: "github_unavailable" };
    }

    const page = (await res.json()) as {
      installations?: GitHubInstallation[];
    };

    if (Array.isArray(page.installations)) {
      installations.push(...page.installations);
    }

    const link = res.headers.get("link");
    nextUrl = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) nextUrl = match[1];
    }
  }

  for (const installation of installations) {
    await db.gitHubInstallation.upsert({
      where: {
        userId_installationId: {
          userId,
          installationId: String(installation.id),
        },
      },
      update: {
        accountLogin: installation.account?.login ?? null,
        accountType: installation.account?.type ?? null,
      },
      create: {
        userId,
        installationId: String(installation.id),
        accountLogin: installation.account?.login ?? null,
        accountType: installation.account?.type ?? null,
      },
    });
  }

  return { ok: true };
}

// ─── GET /github/orgs — List orgs the user can install to ────────

githubRoute.get("/github/orgs", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
  });

  if (!account || !account.accessToken) {
    return c.json(
      {
        error: "github_oauth_required",
        message: "GitHub sign-in is required to list orgs.",
      },
      400,
    );
  }

  const token = account.accessToken;
  const orgs: Array<{
    id: number;
    login: string;
    avatarUrl: string | null;
    role: "admin" | "member";
  }> = [];

  let nextUrl: string | null =
    "https://api.github.com/user/memberships/orgs?per_page=100&state=active";

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "SkillsGate",
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return c.json(
        {
          error: "github_orgs_unavailable",
          message: "Unable to load GitHub orgs.",
          details: text,
        },
        res.status === 403 ? 403 : 502,
      );
    }

    const page = (await res.json()) as Array<{
      role: "admin" | "member";
      organization: { id: number; login: string; avatar_url: string | null };
    }>;

    for (const item of page) {
      if (item.role !== "admin") continue;
      orgs.push({
        id: item.organization.id,
        login: item.organization.login,
        avatarUrl: item.organization.avatar_url,
        role: item.role,
      });
    }

    const link = res.headers.get("link");
    nextUrl = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) nextUrl = match[1];
    }
  }

  return c.json({ orgs });
});

// ─── GET /github/repos — List user's GitHub repos (excluding already connected) ───

githubRoute.get("/github/repos", async (c) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const account = await db.account.findFirst({
    where: { userId, providerId: "github" },
  });

  if (!account || !account.accessToken) {
    return c.json(
      {
        error: "github_oauth_required",
        message: "GitHub sign-in is required to list repos.",
      },
      400,
    );
  }

  const syncResult = await syncUserInstallationsFromGitHub(
    userId,
    account.accessToken,
    db,
  );

  if (!syncResult.ok && syncResult.reason === "oauth_forbidden") {
    return c.json(
      {
        error: "github_oauth_required",
        message:
          "GitHub permissions need to be re-authorized. Sign in with GitHub again and grant org access.",
      },
      400,
    );
  }

  const installations = await db.gitHubInstallation.findMany({
    where: { userId },
  });

  if (installations.length === 0) {
    return c.json(
      {
        error: "github_install_required",
        message:
          "No GitHub App installation found. Please install the SkillsGate GitHub App.",
      },
      400,
    );
  }

  if (!c.env.GITHUB_APP_ID || !c.env.GITHUB_APP_PRIVATE_KEY) {
    return c.json(
      {
        error: "github_app_not_configured",
        message: "GitHub App credentials are not configured.",
      },
      500,
    );
  }

  const appJwt = await createGitHubAppJwt(
    c.env.GITHUB_APP_ID,
    c.env.GITHUB_APP_PRIVATE_KEY,
  );

  const repos: Array<{
    id: number;
    name: string;
    fullName: string;
    owner: string;
    description: string | null;
    defaultBranch: string;
    private: boolean;
    htmlUrl: string;
    updatedAt: string;
    installationId: string;
  }> = [];
  let hasValidInstallation = false;

  for (const installation of installations) {
    let installationRepos;
    try {
      installationRepos = await listInstallationRepos(
        appJwt,
        installation.installationId,
      );
      hasValidInstallation = true;
    } catch {
      await db.gitHubInstallation.deleteMany({
        where: {
          userId,
          installationId: installation.installationId,
        },
      });
      continue;
    }

    for (const repo of installationRepos) {
      repos.push({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        defaultBranch: repo.default_branch,
        private: repo.private,
        htmlUrl: repo.html_url,
        updatedAt: repo.updated_at,
        installationId: installation.installationId,
      });
    }
  }

  if (!hasValidInstallation) {
    return c.json(
      {
        error: "github_install_required",
        message:
          "GitHub App installation is missing or no longer valid. Please reinstall.",
      },
      403,
    );
  }

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

  const availableRepos = repos.filter(
    (repo) => !connectedSet.has(repo.fullName),
  );

  return c.json({ repos: availableRepos });
});
