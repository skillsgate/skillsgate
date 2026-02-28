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

const KEYCHAIN_SERVICE = "skillsgate";
const KEYCHAIN_ACCOUNT = "cli-session";

interface UserMeta {
  user: StoredAuth["user"];
}

async function getKeyring() {
  try {
    const mod = await import("@napi-rs/keyring");
    return mod;
  } catch {
    return null;
  }
}

export async function saveAuth(data: StoredAuth): Promise<void> {
  await fs.mkdir(AUTH_DIR, { recursive: true, mode: 0o700 });

  const keyring = await getKeyring();
  if (keyring) {
    try {
      const entry = new keyring.Entry(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT);
      entry.setPassword(data.token);
      const meta: UserMeta = { user: data.user };
      await fs.writeFile(AUTH_FILE, JSON.stringify(meta, null, 2), {
        mode: 0o600,
      });
      return;
    } catch {
      // Fall through to full file storage
    }
  }

  await fs.writeFile(AUTH_FILE, JSON.stringify(data, null, 2), {
    mode: 0o600,
  });
}

export async function loadAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await fs.readFile(AUTH_FILE, "utf-8");
    const data = JSON.parse(raw) as StoredAuth | UserMeta;

    if (!("user" in data) || !data.user) return null;

    const keyring = await getKeyring();
    if (keyring) {
      try {
        const entry = new keyring.Entry(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT);
        const token = entry.getPassword();
        if (token) {
          return { token, user: data.user };
        }
      } catch {
        // Fall through to file token
      }
    }

    if ("token" in data && data.token) {
      return { token: data.token, user: data.user };
    }

    return null;
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  const keyring = await getKeyring();
  if (keyring) {
    try {
      const entry = new keyring.Entry(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT);
      entry.deletePassword();
    } catch {
      // Ignore if not found
    }
  }

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
