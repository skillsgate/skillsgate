import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadAuth } from "../utils/auth-store.js";

export async function runWhoami(): Promise<void> {
  const auth = await loadAuth();
  if (!auth) {
    p.log.info(
      `Not logged in. Run ${pc.bold("skillsgate login")} to authenticate.`,
    );
    return;
  }

  p.log.info(`Logged in as ${pc.bold(auth.user.name)}`);
  p.log.info(`Email: ${auth.user.email}`);
}
