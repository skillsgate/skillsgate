import * as p from "@clack/prompts";
import { loadAuth, clearAuth } from "../utils/auth-store.js";

export async function runLogout(): Promise<void> {
  const existing = await loadAuth();
  if (!existing) {
    p.log.info("Not logged in.");
    return;
  }

  await clearAuth();
  p.log.success("Logged out successfully.");
}
