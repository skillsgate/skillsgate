import * as p from "@clack/prompts";
import pc from "picocolors";
import open from "open";
import { API_BASE_URL, DEVICE_CODE_POLL_INTERVAL } from "../constants.js";
import { loadAuth, saveAuth } from "../utils/auth-store.js";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface PollSuccessResponse {
  access_token: string;
  user: { id: string; name: string; email: string; image?: string };
}

export async function runLogin(): Promise<void> {
  const existing = await loadAuth();
  if (existing) {
    p.log.info(
      `Already logged in as ${pc.bold(existing.user.name)} (${existing.user.email}).`,
    );
    const shouldContinue = await p.confirm({
      message: "Log in with a different account?",
    });
    if (p.isCancel(shouldContinue) || !shouldContinue) {
      return;
    }
  }

  // Request device code
  const res = await fetch(`${API_BASE_URL}/api/auth/device/code`, {
    method: "POST",
  });

  if (!res.ok) {
    p.log.error("Failed to start login flow. Please try again later.");
    process.exit(1);
  }

  const data = (await res.json()) as DeviceCodeResponse;

  p.log.info(`Your code: ${pc.bold(pc.cyan(data.user_code))}`);
  p.log.info(
    `Visit ${pc.underline(data.verification_uri)} to complete authentication.`,
  );

  const shouldOpen = await p.confirm({
    message: "Open browser?",
    initialValue: true,
  });

  if (!p.isCancel(shouldOpen) && shouldOpen) {
    await open(data.verification_uri).catch(() => {
      // Best-effort, user can open manually
    });
  }

  const spinner = p.spinner();
  spinner.start("Waiting for authentication...");

  const interval = (data.interval ?? 5) * 1000;
  const maxTime = data.expires_in * 1000;
  const startTime = Date.now();
  let pollInterval = interval;

  while (Date.now() - startTime < maxTime) {
    await sleep(pollInterval);

    try {
      const pollRes = await fetch(
        `${API_BASE_URL}/api/auth/device/poll?device_code=${data.device_code}`,
      );

      if (pollRes.status === 200) {
        const result = (await pollRes.json()) as PollSuccessResponse;
        await saveAuth({
          token: result.access_token,
          user: result.user,
        });
        spinner.stop(
          `Logged in as ${pc.bold(result.user.name)} (${result.user.email})`,
        );
        return;
      }

      if (pollRes.status === 410) {
        spinner.stop("Code expired.");
        p.log.error("The code has expired. Run `skillsgate login` to try again.");
        process.exit(1);
      }

      if (pollRes.status === 429) {
        // Slow down
        pollInterval = Math.min(pollInterval + 1000, 15000);
      }

      // 202 or other: keep polling
    } catch {
      // Network error, keep polling
    }
  }

  spinner.stop("Timed out.");
  p.log.error("Authentication timed out. Run `skillsgate login` to try again.");
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
