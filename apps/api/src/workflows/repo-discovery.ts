import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent, NonRetryableError } from "cloudflare:workers";
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
 * 2. Fetches the full repo tree from GitHub
 * 3. Filters for SKILL.md files
 * 4. Inserts vectorization requests for each SKILL.md found
 * 5. Updates the discovered repo with results
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
        retries: { limit: 1 },
      }, async () => {
        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);
        await (db as any).$executeRawUnsafe(
          `UPDATE discovered_repos SET discovery_status = $1, updated_at = NOW() WHERE id = $2`,
          'discovering',
          discoveredRepoId,
        );
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 2: Fetch the full repo tree from GitHub
      // ─────────────────────────────────────────────────────────────────
      const tree: GitHubTreeEntry[] = await step.do('fetch-repo-tree', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' },
        timeout: '30 seconds',
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

        return data.tree;
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 3: Find SKILL.md files in the tree (deterministic, no retries)
      // ─────────────────────────────────────────────────────────────────
      const skillPaths: string[] = await step.do('find-skill-files', async () => {
        return tree.filter(
          (entry) =>
            entry.type === 'blob' &&
            (entry.path.endsWith('/SKILL.md') || entry.path === 'SKILL.md'),
        ).map((entry) => entry.path);
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 4: Insert vectorization requests for each SKILL.md
      // ─────────────────────────────────────────────────────────────────
      const insertedCount: number = await step.do('insert-requests', {
        retries: { limit: 3, delay: '1 second', backoff: 'exponential' },
      }, async () => {
        if (skillPaths.length === 0) {
          return 0;
        }

        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);

        // Build values for batch INSERT
        const values: string[] = [];
        const params: (string | null)[] = [];
        let paramIndex = 1;

        for (const path of skillPaths) {
          const id = crypto.randomUUID();
          const sourceId = `github:${githubOwner}/${githubRepo}:${path}`;

          values.push(
            `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`,
          );
          params.push(id, sourceId, githubOwner, githubRepo, path, defaultBranch, discoveredRepoId);
          paramIndex += 7;
        }

        const sql = `
          INSERT INTO vectorization_requests (id, source_id, github_owner, github_repo, github_path, github_ref, discovered_repo_id)
          VALUES ${values.join(', ')}
          ON CONFLICT (source_id) DO NOTHING
        `;

        const result = await (db as any).$executeRawUnsafe(sql, ...params);
        return typeof result === 'number' ? result : skillPaths.length;
      });

      // ─────────────────────────────────────────────────────────────────
      // Step 5: Mark repo as "discovered" or "not_found"
      // ─────────────────────────────────────────────────────────────────
      await step.do('mark-discovered', {
        retries: { limit: 1 },
      }, async () => {
        const db = createDatabaseClient(this.env.HYPERDRIVE.connectionString);

        if (skillPaths.length === 0) {
          await (db as any).$executeRawUnsafe(
            `UPDATE discovered_repos SET discovery_status = $1, skill_count = $2, updated_at = NOW() WHERE id = $3`,
            'not_found',
            0,
            discoveredRepoId,
          );
        } else {
          await (db as any).$executeRawUnsafe(
            `UPDATE discovered_repos SET discovery_status = $1, skill_count = $2, last_discovered_at = NOW(), updated_at = NOW() WHERE id = $3`,
            'discovered',
            skillPaths.length,
            discoveredRepoId,
          );
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        await (db as any).$executeRawUnsafe(
          `UPDATE discovered_repos SET discovery_status = $1, discovery_error = $2, updated_at = NOW() WHERE id = $3`,
          'failed',
          errorMessage,
          discoveredRepoId,
        );
      } catch (markError) {
        console.error(`[repo-discovery] Failed to mark repo ${discoveredRepoId} as failed:`, markError);
      }

      throw error;
    }
  }
}
