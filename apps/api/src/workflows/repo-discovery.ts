import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { createDatabaseClient } from "@skillsgate/database";
import type { Bindings, RepoDiscoveryWorkflowInput } from "../types";

/**
 * GitHub tree entry returned from the Git Trees API.
 */
interface GitHubTreeEntry {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

/**
 * Result of the repo discovery workflow execution.
 */
export interface RepoDiscoveryResult {
  discoveredRepoId: string;
  skillFilesFound: number;
  requestsInserted: number;
}

/**
 * Durable workflow for discovering SKILL.md files in a GitHub repository.
 *
 * This workflow:
 * 1. Marks the discovered repo as "discovering"
 * 2. Fetches the repo tree from GitHub and filters for SKILL.md files (single step
 *    to avoid serializing the full tree as a workflow step output)
 * 3. Bulk-inserts vectorization requests (chunked createMany, idempotent)
 * 4. Updates the discovered repo with results (records truncation if applicable)
 *
 * The workflow uses the defaultBranch provided in the input — no main/master
 * fallback is attempted.
 */
export class RepoDiscoveryWorkflow extends WorkflowEntrypoint<Bindings, RepoDiscoveryWorkflowInput> {
  async run(event: WorkflowEvent<RepoDiscoveryWorkflowInput>, step: WorkflowStep): Promise<RepoDiscoveryResult> {
    const { discoveredRepoId, githubOwner, githubRepo, defaultBranch } = event.payload;

    try {
      // ─────────────────────────────────────────────────────────────────
      // Step 1: Mark repo as "discovering"
      // ─────────────────────────────────────────────────────────────────
      await step.do('mark-discovering', {
        retries: { limit: 1, delay: '1 second' },
      }, async () => {
        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);
        await (db.discoveredRepo.update as any)({
          where: { id: discoveredRepoId },
          data: { discoveryStatus: 'discovering' },
        });
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 2: Fetch repo tree and find SKILL.md files
      // ─────────────────────────────────────────────────────────────────
      // Merged into a single step so the full tree (potentially several MB
      // for large repos) is never serialized as a Workflow step output.
      // Only the filtered SKILL.md paths are returned.
      const { skillPaths, truncated } = await step.do('fetch-and-find-skills', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' },
        timeout: '60 seconds',
      }, async () => {
        const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/trees/${defaultBranch}?recursive=1`;

        const res = await fetch(url, {
          headers: {
            'Authorization': `token ${this.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SkillsGate-Discovery/1.0',
          },
        });

        if (res.status === 404) {
          throw new NonRetryableError(
            `Repository tree not found: ${githubOwner}/${githubRepo}@${defaultBranch} (404)`,
          );
        }

        if (res.status === 403 || res.status === 429) {
          throw new Error(
            `GitHub API rate limited: ${githubOwner}/${githubRepo} (${res.status})`,
          );
        }

        if (!res.ok) {
          throw new Error(
            `GitHub API error: ${githubOwner}/${githubRepo} (${res.status} ${res.statusText})`,
          );
        }

        const data = await res.json() as { tree: GitHubTreeEntry[]; truncated: boolean };

        if (data.truncated) {
          console.warn(
            `[repo-discovery] Tree for ${githubOwner}/${githubRepo} was truncated; some SKILL.md files may be missed.`,
          );
        }

        const paths = data.tree
          .filter(
            (entry) =>
              entry.type === 'blob' &&
              (entry.path.endsWith('/SKILL.md') || entry.path === 'SKILL.md'),
          )
          .map((entry) => entry.path);

        return { skillPaths: paths, truncated: data.truncated };
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 3: Insert vectorization requests for each SKILL.md
      // ─────────────────────────────────────────────────────────────────
      // Uses createMany with skipDuplicates for bulk insert. Chunked to
      // stay within PostgreSQL's ~65k parameter limit (~5 fields × 500 = 2500).
      const insertedCount: number = await step.do('insert-requests', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' },
        timeout: '60 seconds',
      }, async () => {
        if (skillPaths.length === 0) {
          return 0;
        }

        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);

        const CHUNK_SIZE = 500;
        let inserted = 0;

        for (let i = 0; i < skillPaths.length; i += CHUNK_SIZE) {
          const chunk = skillPaths.slice(i, i + CHUNK_SIZE);
          const data = chunk.map((path) => ({
            id: crypto.randomUUID(),
            sourceId: `github:${githubOwner}/${githubRepo}:${path}`,
            githubOwner,
            githubRepo,
            githubPath: path,
            githubRef: defaultBranch,
            discoveredRepoId,
          }));

          const result = await (db.vectorizationRequest.createMany as any)({
            data,
            skipDuplicates: true,
          });
          inserted += result.count;
        }

        return inserted;
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 4: Mark repo as "discovered" or "not_found"
      // ─────────────────────────────────────────────────────────────────
      await step.do('mark-discovered', {
        retries: { limit: 1, delay: '1 second' },
      }, async () => {
        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);

        if (skillPaths.length === 0) {
          await (db.discoveredRepo.update as any)({
            where: { id: discoveredRepoId },
            data: { discoveryStatus: 'not_found', skillCount: 0 },
          });
        } else {
          await (db.discoveredRepo.update as any)({
            where: { id: discoveredRepoId },
            data: {
              discoveryStatus: 'discovered',
              skillCount: skillPaths.length,
              lastDiscoveredAt: new Date(),
              // Record if GitHub truncated the tree so we can revisit later
              ...(truncated ? { discoveryError: 'GitHub tree was truncated; skill count may be incomplete' } : {}),
            },
          });
        }
      });

      return {
        discoveredRepoId,
        skillFilesFound: skillPaths.length,
        requestsInserted: insertedCount,
      };

    } catch (error) {
      // Best-effort: mark the repo as "failed" with the error message
      try {
        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);
        await (db.discoveredRepo.update as any)({
          where: { id: discoveredRepoId },
          data: {
            discoveryStatus: 'failed',
            discoveryError: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (markError) {
        console.error(`[repo-discovery] Failed to mark repo ${discoveredRepoId} as failed:`, markError);
      }

      throw error;
    }
  }
}
