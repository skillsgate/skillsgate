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
import { SkillVectorizationWorkflow } from "./workflows/skill-vectorization";
import type { VectorizeSkillWorkflowInput } from "./types";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", cors());

app.route("/", healthRoute);
app.route("/", telemetryRoute);
app.route("/api/v1", searchRoute);
app.route("/api", usersRoute);
app.route("/api", sharesRoute);
app.route("/api", dashboardRoute);
app.route("/api", publisherRoute);
app.route("/api", orgsRoute);
app.route("/api", skillsRoute);
app.route("/api", githubRoute);
app.route("/api", connectedReposRoute);
app.route("/api", adminRoute);

// Named export required by Cloudflare Workflows
export { SkillVectorizationWorkflow };

// Export the Hono app as default export
export default {
  // Standard fetch handler for HTTP requests
  fetch: app.fetch.bind(app),

  /**
   * Queue consumer handler - triggered by messages on skill-vectorize-queue
   * Each message triggers a new workflow instance for idempotent, durable processing
   */
  async queue(
    batch: MessageBatch<VectorizeSkillWorkflowInput>,
    env: Bindings,
    ctx: ExecutionContext
  ): Promise<void> {
    for (const message of batch.messages) {
      const payload = message.body;

      try {
        console.log(`[queue] Creating workflow instance for ${payload.sourceId}`);

        // Create a new workflow instance for this skill
        // This provides durable execution with automatic retries and observability
        const instance = await env.SKILL_VECTORIZATION_WORKFLOW.create({
          params: payload
        });

        console.log(`[queue] Workflow instance created: ${instance.id} for ${payload.sourceId}`);

        // Acknowledge the message - workflow now owns the processing
        message.ack();
      } catch (error) {
        console.error(`[queue] Failed to create workflow for ${payload.sourceId}:`, error);

        // Retry the message (will go to DLQ after max_retries)
        message.retry();
      }
    }
  },
};
