import fs from "node:fs/promises";
import { AUTH_DIR, AUTH_FILE } from "../constants.js";

export interface StoredAuth {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export async function saveAuth(data: StoredAuth): Promise<void> {
  await fs.mkdir(AUTH_DIR, { recursive: true, mode: 0o700 });
  await fs.writeFile(AUTH_FILE, JSON.stringify(data, null, 2), {
    mode: 0o600,
  });
}

export async function loadAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await fs.readFile(AUTH_FILE, "utf-8");
    const data = JSON.parse(raw) as StoredAuth;
    if (!data.token || !data.user) return null;
    return data;
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await fs.unlink(AUTH_FILE);
  } catch {
    // File doesn't exist, that's fine
  }
}

export async function getToken(): Promise<string | null> {
  const auth = await loadAuth();
  return auth?.token ?? null;
}
