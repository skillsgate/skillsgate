import fs from "node:fs/promises";
import path from "node:path";
import {
  SkillLockFile,
  SkillLockEntry,
  AgentType,
} from "../types.js";
import { GLOBAL_LOCK_PATH, LOCK_FILE_VERSION } from "../constants.js";

export async function readSkillLock(): Promise<SkillLockFile> {
  const lockPath = GLOBAL_LOCK_PATH();
  try {
    const raw = await fs.readFile(lockPath, "utf-8");
    const data = JSON.parse(raw) as SkillLockFile;

    if (data.version !== LOCK_FILE_VERSION) {
      return emptyLock();
    }

    return data;
  } catch {
    return emptyLock();
  }
}

export async function writeSkillLock(lock: SkillLockFile): Promise<void> {
  const lockPath = GLOBAL_LOCK_PATH();
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  await fs.writeFile(lockPath, JSON.stringify(lock, null, 2), "utf-8");
}

export async function addSkillToLock(
  name: string,
  entry: Omit<SkillLockEntry, "installedAt" | "updatedAt">,
): Promise<void> {
  const lock = await readSkillLock();
  const now = new Date().toISOString();

  const existing = lock.skills[name];
  lock.skills[name] = {
    ...entry,
    installedAt: existing?.installedAt || now,
    updatedAt: now,
  };

  await writeSkillLock(lock);
}

export async function removeSkillFromLock(name: string): Promise<void> {
  const lock = await readSkillLock();
  delete lock.skills[name];
  await writeSkillLock(lock);
}

export function getSkillsBySource(
  lock: SkillLockFile,
): Map<string, Array<[string, SkillLockEntry]>> {
  const groups = new Map<string, Array<[string, SkillLockEntry]>>();
  for (const [name, entry] of Object.entries(lock.skills)) {
    const existing = groups.get(entry.source) || [];
    existing.push([name, entry]);
    groups.set(entry.source, existing);
  }
  return groups;
}

export async function saveSelectedAgents(
  agentNames: AgentType[],
): Promise<void> {
  const lock = await readSkillLock();
  lock.lastSelectedAgents = agentNames;
  await writeSkillLock(lock);
}

export async function getLastSelectedAgents(): Promise<
  AgentType[] | undefined
> {
  const lock = await readSkillLock();
  return lock.lastSelectedAgents;
}

function emptyLock(): SkillLockFile {
  return { version: LOCK_FILE_VERSION, skills: {} };
}
