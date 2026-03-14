import { createHash } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  parseSource,
  getSourceLabel,
  getOwnerRepo,
} from "../../core/source-parser.js";
import { cloneRepo, cleanupTempDir } from "../../core/git.js";
import {
  downloadSkill,
  submitScanReport,
  fetchScanSummary,
} from "../../core/skillsgate-client.js";
import { getToken } from "../../utils/auth-store.js";
import { discoverSkills, filterSkills } from "../../core/skill-discovery.js";
import { dirExists } from "../../utils/fs.js";
import {
  SCANNERS,
  detectAvailableScanners,
  detectInsideScanner,
  filterInsideScanner,
  buildScanPrompt,
  invokeScanner,
  detectCreditsExhausted,
} from "../../core/scanners.js";
import type { ScannerConfig, ScannerType, ScanSummary } from "../../types.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerScan(server: McpServer): void {
  server.tool(
    "skillsgate_scan",
    "Security-scan AI agent skills using an available coding agent.",
    {
      source: z
        .string()
        .describe(
          "Skill source to scan: @username/slug (SkillsGate), owner/repo (GitHub), owner/repo@skill, or a local path (./path).",
        ),
      scanner: z
        .string()
        .optional()
        .describe(
          "Force a specific scanner (e.g. 'claude-code', 'codex-cli', 'aider'). If omitted, the first available scanner is used.",
        ),
      timeout: z
        .number()
        .default(120)
        .describe("Scanner timeout in seconds (default 120)."),
      share: z
        .boolean()
        .default(true)
        .describe("Share scan results with the SkillsGate community (default true)."),
    },
    async ({ source, scanner: scannerName, timeout, share }) => {
      let tmpDir: string | undefined;

      try {
        // 1. Parse source and resolve skill directory
        const parsed = parseSource(source);
        const sourceLabel = getSourceLabel(parsed);
        let skillDir: string;

        if (parsed.type === "local") {
          if (!(await dirExists(parsed.localPath!))) {
            return mcpError(
              `Local path does not exist: ${parsed.localPath}`,
              "LOCAL_PATH_NOT_FOUND",
            );
          }
          skillDir = parsed.localPath!;
        } else if (parsed.type === "skillsgate") {
          const token = await getToken();
          tmpDir = await downloadSkill(parsed.username!, parsed.slug!, token);
          skillDir = tmpDir;
        } else {
          tmpDir = await cloneRepo(parsed);
          skillDir = tmpDir;
        }

        // 2. Discover and filter skills
        let skills = await discoverSkills(skillDir, parsed.subpath);
        if (skills.length === 0) {
          return mcpError(
            `No skills found in ${sourceLabel}.`,
            "NO_SKILLS_FOUND",
          );
        }

        if (parsed.skillFilter) {
          skills = filterSkills(skills, parsed.skillFilter);
          if (skills.length === 0) {
            return mcpError(
              `Skill "${parsed.skillFilter}" not found in ${sourceLabel}.`,
              "SKILL_NOT_FOUND",
            );
          }
        }

        // 3. Build source ID
        let sourceId: string;
        if (parsed.type === "github") {
          const ownerRepo = getOwnerRepo(parsed);
          const subpath = parsed.subpath || "";
          sourceId = `github:${ownerRepo}:${subpath}`;
        } else if (parsed.type === "skillsgate") {
          sourceId = `skillsgate:${parsed.username}/${parsed.slug}`;
        } else {
          sourceId = `local:${parsed.localPath}`;
        }

        // 4. Fetch community scan summary
        let communitySummary: ScanSummary | null = null;
        try {
          communitySummary = await fetchScanSummary(sourceId);
        } catch {
          // Silent on failure
        }

        // 5. Detect available scanners
        const insideScanner = detectInsideScanner();
        const available = await detectAvailableScanners();
        const filtered = filterInsideScanner(available, insideScanner);

        if (filtered.length === 0 && insideScanner) {
          return mcpError(
            `You are running inside ${SCANNERS[insideScanner].displayName}, which is the only available scanner. Cannot scan recursively.`,
            "SCANNER_INSIDE_ONLY",
          );
        }

        if (filtered.length === 0) {
          return mcpError(
            "No coding agents available for scanning. Install one of: claude-code, codex-cli, opencode, goose, aider.",
            "NO_SCANNERS",
          );
        }

        // 6. Select scanner
        let selectedScanner: ScannerConfig;

        if (scannerName) {
          const entry = Object.values(SCANNERS).find(
            (s) => s.name === scannerName,
          );
          if (!entry) {
            return mcpError(
              `Unknown scanner: "${scannerName}". Available: ${Object.keys(SCANNERS).join(", ")}`,
              "UNKNOWN_SCANNER",
            );
          }
          if (!filtered.find((s) => s.name === entry.name)) {
            return mcpError(
              `"${scannerName}" is not available on this system.`,
              "SCANNER_NOT_AVAILABLE",
            );
          }
          selectedScanner = entry;
        } else {
          selectedScanner = filtered[0];
        }

        // 7. Build prompt and invoke scanner
        const prompt = buildScanPrompt(
          skills.map((s) => ({
            name: s.name,
            content: s.content,
            relativePath: path.relative(skillDir, s.filePath),
          })),
        );

        const startTime = Date.now();

        const result = await invokeScanner({
          scanner: selectedScanner,
          prompt,
          cwd: skillDir,
          timeoutMs: timeout * 1000,
        });

        const durationMs = Date.now() - startTime;

        // 8. Handle timeout
        if (result.timedOut) {
          return mcpError(
            `${selectedScanner.displayName} timed out after ${timeout}s. Try increasing --timeout or using a different scanner.`,
            "SCANNER_TIMEOUT",
          );
        }

        // 9. Handle credits exhausted
        if (detectCreditsExhausted(result.stderr, result.stdout)) {
          return mcpError(
            `${selectedScanner.displayName} ran out of API credits. Try a different scanner.`,
            "CREDITS_EXHAUSTED",
          );
        }

        // 10. Handle crash
        if (result.exitCode !== 0 && result.exitCode !== null) {
          return mcpError(
            `${selectedScanner.displayName} exited with code ${result.exitCode}. ${result.stderr.slice(0, 500)}`,
            "SCANNER_CRASH",
          );
        }

        // 11. Parse report
        const report = selectedScanner.parseOutput(result.stdout, result.stderr);

        if (!report) {
          return mcpSuccess({
            scanner: selectedScanner.name,
            report: null,
            parseFailed: true,
            rawOutput: result.stdout.slice(0, 2000),
            communitySummary,
            durationMs,
          });
        }

        // 12. Share results if enabled
        let shared = false;

        if (share && report) {
          const token = await getToken();
          if (token) {
            const contentHash = createHash("sha256")
              .update(skills.map((s) => s.content).join(""))
              .digest("hex");

            shared = await submitScanReport(
              {
                sourceId,
                contentHash,
                scannerType: selectedScanner.name,
                risk: report.risk,
                summary: report.summary,
                findings: report.findings,
              },
              token,
            );
          }
        }

        // 13. Return result
        return mcpSuccess({
          scanner: selectedScanner.name,
          report: {
            risk: report.risk,
            summary: report.summary,
            findings: report.findings,
          },
          communitySummary,
          shared,
          durationMs,
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Scan failed",
          "SCAN_FAILED",
        );
      } finally {
        if (tmpDir) await cleanupTempDir(tmpDir);
      }
    },
  );
}
