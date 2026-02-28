import * as p from "@clack/prompts";
import { loadAuth, clearAuth } from "../utils/auth-store.js";
import { API_BASE_URL } from "../constants.js";

export async function runLogout(): Promise<void> {
  const existing = await loadAuth();
  if (!existing) {
    p.log.info("Not logged in.");
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/api/auth/revoke-session`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${existing.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: existing.token }),
    });
  } catch {
    // Network failure should not block local logout
  }

  await clearAuth();
  p.log.success("Logged out successfully.");
}
