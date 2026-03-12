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

export class NoScannersAvailableError extends SkillsGateError {
  constructor() {
    super(
      "No supported coding agents found on your system.\n\n" +
        "Install one of the following to use scan:\n" +
        "  • Claude Code  — https://docs.anthropic.com/en/docs/claude-code\n" +
        "  • Codex CLI    — https://github.com/openai/codex\n" +
        "  • OpenCode     — https://github.com/opencode-ai/opencode\n" +
        "  • Goose        — https://github.com/block/goose\n" +
        "  • Aider        — https://github.com/paul-gauthier/aider",
      "NO_SCANNERS",
    );
  }
}

export class ScannerInsideOnlyError extends SkillsGateError {
  constructor(scannerName: string) {
    super(
      `The only coding agent available is ${scannerName}, but you're currently running inside it.\n` +
        "Install a second coding agent to avoid recursive invocation.",
      "SCANNER_INSIDE_ONLY",
    );
  }
}

export class ScannerTimeoutError extends SkillsGateError {
  constructor(scannerName: string, timeoutSec: number) {
    super(
      `${scannerName} timed out after ${timeoutSec}s.\n` +
        "Try increasing the timeout with --timeout <seconds> or use a different agent.",
      "SCANNER_TIMEOUT",
    );
  }
}

export class ScannerCrashError extends SkillsGateError {
  constructor(scannerName: string, exitCode: number, stderr: string) {
    const truncated = stderr.length > 500 ? stderr.slice(0, 500) + "..." : stderr;
    super(
      `${scannerName} exited with code ${exitCode}.\n${truncated}`,
      "SCANNER_CRASH",
    );
  }
}
