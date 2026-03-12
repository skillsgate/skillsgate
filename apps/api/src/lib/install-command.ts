/**
 * Derive the CLI install command for a skill based on its source type and location.
 */
export function deriveInstallCommand(
  slug: string,
  sourceType: string | null,
  publisherUsername: string | null,
  githubRepo: string,
  githubPath: string
): string | null {
  // R2-sourced skills (directly published to SkillsGate): install by @username/slug
  if (sourceType === "r2" && slug && publisherUsername) {
    return `skillsgate add @${publisherUsername}/${slug} -y`;
  }

  // GitHub-sourced skills: install via owner/repo
  if (!githubRepo) return null;

  const isSingleSkill = githubPath === "SKILL.md" || !githubPath;
  if (isSingleSkill) {
    return `skillsgate add ${githubRepo} -y`;
  }

  const parts = githubPath.split("/");
  const skillIdx = parts.indexOf("skills");
  const skillName =
    skillIdx >= 0 && parts.length > skillIdx + 1
      ? parts[skillIdx + 1]
      : undefined;

  if (skillName) {
    return `skillsgate add ${githubRepo} --skill ${skillName} -y`;
  }

  return `skillsgate add ${githubRepo} -y`;
}
