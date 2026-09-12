// Rebuild better-sqlite3 against the pinned Electron ABI after install.
//
// Skipped on CI: the desktop-publish workflow runs electron-rebuild itself with
// an explicit --arch so the macOS x64 build can cross-compile on an arm64
// runner. Running it here too would just rebuild for the host arch and be
// thrown away.
import { execSync } from "node:child_process";

if (process.env.CI) {
  console.log("[postinstall] CI detected, skipping electron-rebuild (workflow handles it)");
  process.exit(0);
}

execSync("npm run rebuild:native", { stdio: "inherit" });
