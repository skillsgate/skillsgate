import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings, Variables } from "./types";
import { healthRoute } from "./routes/health";
import { searchRoute } from "./routes/search";
import { telemetryRoute } from "./routes/telemetry";
import { usersRoute } from "./routes/users";
import { sharesRoute } from "./routes/shares";
import { dashboardRoute } from "./routes/dashboard";
import { publisherRoute } from "./routes/publisher";
import { orgsRoute } from "./routes/orgs";
import { skillsRoute } from "./routes/skills";
import { githubRoute } from "./routes/github";
import { connectedReposRoute } from "./routes/connected-repos";
import { adminRoute } from "./routes/admin";
import { skillDownloadRoute } from "./routes/skill-download";
import { catalogRoute } from "./routes/catalog";
import { SkillVectorizationWorkflow } from "./workflows/skill-vectorization";
import { RepoDiscoveryWorkflow } from "./workflows/repo-discovery";
import type { VectorizeSkillWorkflowInput, DiscoverRepoQueueMessage } from "./types";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", cors());

app.route("/", healthRoute);
app.route("/", telemetryRoute);
app.route("/api", adminRoute);
app.route("/api/v1", searchRoute);
app.route("/api/v1", catalogRoute);
app.route("/api", usersRoute);
app.route("/api", sharesRoute);
app.route("/api", dashboardRoute);
app.route("/api", publisherRoute);
app.route("/api", orgsRoute);
app.route("/api", skillsRoute);
app.route("/api", skillDownloadRoute);
app.route("/api", githubRoute);
app.route("/api", connectedReposRoute);

// Named exports required by Cloudflare Workflows
export { SkillVectorizationWorkflow };
export { RepoDiscoveryWorkflow };

// Export the Hono app as default export
export default {
  // Standard fetch handler for HTTP requests
  fetch: app.fetch.bind(app),

  /**
   * Queue consumer handler - dispatches to the appropriate workflow based on queue name.
   * Each message triggers a new workflow instance for idempotent, durable processing.
   */
  async queue(
    batch: MessageBatch,
    env: Bindings,
    ctx: ExecutionContext
  ): Promise<void> {
    if (batch.queue === "repo-discovery-queue") {
      for (const message of batch.messages) {
        const payload = message.body as DiscoverRepoQueueMessage;

        try {
          console.log(
            `[queue] Creating repo discovery workflow for ${payload.githubOwner}/${payload.githubRepo}`
          );

          const instance = await env.REPO_DISCOVERY_WORKFLOW.create({
            params: payload,
          });

          console.log(
            `[queue] Repo discovery workflow created: ${instance.id} for ${payload.githubOwner}/${payload.githubRepo}`
          );

          message.ack();
        } catch (error) {
          console.error(
            `[queue] Failed to create repo discovery workflow for ${payload.githubOwner}/${payload.githubRepo}:`,
            error
          );

          message.retry();
        }
      }
    } else {
      // Default: skill-vectorize-queue
      for (const message of batch.messages) {
        const payload = message.body as VectorizeSkillWorkflowInput;

        try {
          console.log(`[queue] Creating workflow instance for ${payload.sourceId}`);

          const instance = await env.SKILL_VECTORIZATION_WORKFLOW.create({
            params: payload,
          });

          console.log(
            `[queue] Workflow instance created: ${instance.id} for ${payload.sourceId}`
          );

          message.ack();
        } catch (error) {
          console.error(
            `[queue] Failed to create workflow for ${payload.sourceId}:`,
            error
          );

          message.retry();
        }
      }
    }
  },
};
