import * as p from "@clack/prompts";
import pc from "picocolors";
import open from "open";
import { API_BASE_URL } from "../constants.js";
import { loadAuth, saveAuth } from "../utils/auth-store.js";

interface ExchangeResponse {
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

  p.log.info(
    `Open ${pc.underline(`${API_BASE_URL}/cli/auth`)} to get your login code.`,
  );

  const shouldOpen = await p.confirm({
    message: "Open browser?",
    initialValue: true,
  });

  if (!p.isCancel(shouldOpen) && shouldOpen) {
    await open(`${API_BASE_URL}/cli/auth`).catch(() => {
      // Best-effort, user can open manually
    });
  }

  const code = await p.text({
    message: "Paste the code from the browser:",
    placeholder: "XXXX-XXXX",
    validate(value) {
      const clean = value.replace(/[\s-]/g, "");
      if (clean.length !== 8) return "Code must be 8 characters (XXXX-XXXX)";
    },
  });

  if (p.isCancel(code)) {
    p.log.info("Login cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start("Verifying code...");

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/device/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      const result = (await res.json()) as ExchangeResponse;
      await saveAuth({
        token: result.access_token,
        user: result.user,
      });
      spinner.stop(
        `Logged in as ${pc.bold(result.user.name)} (${result.user.email})`,
      );
      return;
    }

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    spinner.stop("Failed.");

    if (data?.error === "rate_limited") {
      p.log.error("Too many attempts. Please wait a minute and try again.");
    } else if (data?.error === "invalid_code") {
      p.log.error("Invalid code. Please check and try again.");
    } else if (data?.error === "expired") {
      p.log.error("Code has expired. Get a new one from the browser.");
    } else {
      p.log.error("Something went wrong. Please try again.");
    }
    process.exit(1);
  } catch {
    spinner.stop("Failed.");
    p.log.error("Network error. Please try again.");
    process.exit(1);
  }
}
