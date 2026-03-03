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

export default app;
