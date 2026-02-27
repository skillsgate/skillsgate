export class SkillsGateError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "SkillsGateError";
  }
}

export class SkillNotFoundError extends SkillsGateError {
  constructor(name: string) {
    super(`Skill "${name}" not found`, "SKILL_NOT_FOUND");
  }
}

export class NoSkillsInRepoError extends SkillsGateError {
  constructor(repo: string) {
    super(
      `No SKILL.md files found in ${repo}. ` +
        `Skills must have a SKILL.md with name and description in YAML frontmatter.`,
      "NO_SKILLS_IN_REPO",
    );
  }
}

export class NoAgentsDetectedError extends SkillsGateError {
  constructor() {
    super(
      "No AI coding agents detected on this system. " +
        "Install an agent like Claude Code, Cursor, or GitHub Copilot first.",
      "NO_AGENTS",
    );
  }
}
