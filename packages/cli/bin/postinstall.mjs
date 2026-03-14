#!/usr/bin/env node

// Postinstall script for skillsgate
// Auto-detects AI tools and offers to configure MCP

import { execFileSync } from "node:child_process";

// Skip in CI or non-interactive environments
const CI_VARS = ["CI", "GITHUB_ACTIONS", "GITLAB_CI", "CIRCLECI", "JENKINS_URL", "BUILDKITE"];
if (CI_VARS.some((v) => process.env[v])) {
  process.exit(0);
}

if (!process.stdout.isTTY) {
  process.exit(0);
}

// Run `skillsgate setup` which handles detection and prompting
try {
  execFileSync("node", [new URL("cli.mjs", import.meta.url).pathname, "setup"], {
    stdio: "inherit",
  });
} catch {
  // Don't fail the install if setup fails
}
