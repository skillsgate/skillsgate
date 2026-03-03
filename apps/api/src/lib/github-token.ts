/**
 * Validates a GitHub OAuth access token by calling the /user endpoint.
 * Returns true if the token is valid and has sufficient scopes, false otherwise.
 */
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "SkillsGate",
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      return false;
    }

    // Check that the token has the `repo` scope
    const scopes = res.headers.get("x-oauth-scopes") ?? "";
    const scopeList = scopes.split(",").map((s) => s.trim());

    // If GitHub doesn't return scopes header (fine-grained tokens), allow it
    // Otherwise verify `repo` scope is present
    if (scopes && !scopeList.includes("repo")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
