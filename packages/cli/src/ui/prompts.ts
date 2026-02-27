import * as p from "@clack/prompts";
import { AgentConfig, Skill, InstallScope, InstallMethod } from "../types.js";

export async function selectSkills(skills: Skill[]): Promise<Skill[]> {
  if (skills.length === 1) {
    p.log.info(`Found 1 skill: ${skills[0].name}`);
    return skills;
  }

  const selected = await p.multiselect({
    message: "Select skills to install:",
    options: skills.map((s) => ({
      value: s.name,
      label: s.name,
      hint: s.description,
    })),
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return skills.filter((s) => (selected as string[]).includes(s.name));
}

export async function selectAgents(
  detected: AgentConfig[],
  lastSelected?: string[],
): Promise<AgentConfig[]> {
  const selected = await p.multiselect({
    message: "Select agents to install skills for:",
    options: detected.map((a) => ({
      value: a.name,
      label: a.displayName,
      hint: lastSelected?.includes(a.name) ? "previously selected" : undefined,
    })),
    initialValues: lastSelected || detected.map((a) => a.name),
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return detected.filter((a) => (selected as string[]).includes(a.name));
}

export async function selectScope(): Promise<InstallScope> {
  const scope = await p.select({
    message: "Installation scope:",
    options: [
      {
        value: "global" as const,
        label: "Global",
        hint: "Install in home directory, available across projects",
      },
      {
        value: "project" as const,
        label: "Project",
        hint: "Install in current directory, committed to repo",
      },
    ],
  });

  if (p.isCancel(scope)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return scope as InstallScope;
}

export async function selectMethod(): Promise<InstallMethod> {
  const method = await p.select({
    message: "Installation method:",
    options: [
      {
        value: "symlink" as const,
        label: "Symlink (recommended)",
        hint: "Single source of truth, easy updates",
      },
      {
        value: "copy" as const,
        label: "Copy",
        hint: "Independent copies per agent",
      },
    ],
  });

  if (p.isCancel(method)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return method as InstallMethod;
}

export async function confirmAction(message: string): Promise<boolean> {
  const result = await p.confirm({ message });
  if (p.isCancel(result)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }
  return result as boolean;
}
