import os from "node:os";
import { VERSION, SEARCH_API_URL } from "./constants.js";

const TELEMETRY_URL = `${SEARCH_API_URL}/t`;

const CI_ENV_VARS = [
  "CI",
  "GITHUB_ACTIONS",
  "GITLAB_CI",
  "CIRCLECI",
  "JENKINS_URL",
  "BUILDKITE",
];

function isDisabled(): boolean {
  return !!(
    process.env.DO_NOT_TRACK ||
    process.env.SKILLSGATE_TELEMETRY_DISABLED
  );
}

function isCI(): boolean {
  return CI_ENV_VARS.some((v) => !!process.env[v]);
}

let pending: Promise<unknown> | null = null;

function trackEvent(params: Record<string, string | number | undefined>): void {
  try {
    if (isDisabled()) return;

    const searchParams = new URLSearchParams();
    searchParams.set("v", VERSION);
    searchParams.set("os", os.platform());
    searchParams.set("ci", isCI() ? "1" : "0");

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }

    const url = `${TELEMETRY_URL}?${searchParams.toString()}`;
    pending = fetch(url).catch(() => {});
  } catch {
    // telemetry must never crash the CLI
  }
}

/**
 * Wait for any in-flight telemetry request to complete.
 * Call before process.exit() to prevent Node from killing the
 * TCP connection before the request leaves the machine.
 */
export async function flushTelemetry(): Promise<void> {
  try {
    if (pending) await pending;
  } catch {
    // never crash
  }
}

// ─── Typed convenience wrappers ──────────────────────────────────

export function trackAdd(data: {
  source?: string;
  skills?: string[];
  agents?: string[];
  scope?: string;
  sourceType?: string;
}): void {
  try {
    trackEvent({
      e: "add",
      source: data.source,
      sourceType: data.sourceType,
      skills: data.skills?.join(","),
      agents: data.agents?.join(","),
      scope: data.scope,
    });
  } catch {
    // never crash
  }
}

export function trackRemove(data: {
  skills?: string[];
  agents?: string[];
  scope?: string;
}): void {
  try {
    trackEvent({
      e: "remove",
      skills: data.skills?.join(","),
      agents: data.agents?.join(","),
      scope: data.scope,
    });
  } catch {
    // never crash
  }
}

export function trackSearch(data: {
  query?: string;
  resultCount?: number;
}): void {
  try {
    trackEvent({
      e: "search",
      query: data.query,
      resultCount: data.resultCount,
    });
  } catch {
    // never crash
  }
}

export function trackUpdate(data: {
  skillCount?: number;
  updatedCount?: number;
  upToDateCount?: number;
}): void {
  try {
    trackEvent({
      e: "update",
      skillCount: data.skillCount,
      updatedCount: data.updatedCount,
      upToDateCount: data.upToDateCount,
    });
  } catch {
    // never crash
  }
}

export function trackSync(data: {
  skillCount?: number;
  installedCount?: number;
  agents?: string[];
}): void {
  try {
    trackEvent({
      e: "sync",
      skillCount: data.skillCount,
      updatedCount: data.installedCount,
      agents: data.agents?.join(","),
    });
  } catch {
    // never crash
  }
}

export function trackList(data: { skillCount?: number }): void {
  try {
    trackEvent({
      e: "list",
      skillCount: data.skillCount,
    });
  } catch {
    // never crash
  }
}
