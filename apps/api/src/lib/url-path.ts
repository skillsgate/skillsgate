/**
 * Derive a URL-safe path for a skill based on its sourceId.
 *
 * - GitHub-sourced: "owner/repo/skill-dir-name"
 * - Other sources (R2, etc.): uses the skill's UUID (never exposes "r2")
 */
export function deriveUrlPath(sourceId: string | null, skillId: string): string {
  if (sourceId && sourceId.startsWith("github:")) {
    // Format: github:{owner}/{repo}:{path/to/skill/SKILL.md}
    // or github:{owner}/{repo}:{path/to/skill-dir}
    try {
      const withoutPrefix = sourceId.slice("github:".length); // "owner/repo:path/to/skill/SKILL.md"
      const colonIdx = withoutPrefix.indexOf(":");
      if (colonIdx === -1) return skillId;

      const ownerRepo = withoutPrefix.slice(0, colonIdx); // "owner/repo"
      let path = withoutPrefix.slice(colonIdx + 1); // "path/to/skill/SKILL.md"

      // Strip SKILL.md from end
      path = path.replace(/\/?SKILL\.md$/i, "");
      // Strip trailing slashes
      path = path.replace(/\/+$/, "");

      if (!path) {
        // SKILL.md is at repo root — use repo name as skill name
        return ownerRepo;
      }

      // Get just the last directory name (the skill name)
      const parts = path.split("/");
      const skillName = parts[parts.length - 1];

      // owner/repo/skill-name
      return `${ownerRepo}/${skillName}`;
    } catch {
      return skillId;
    }
  }
  // For R2 or unknown source types, use skill id (never expose "r2")
  return skillId;
}
