import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings, Variables } from "./types";
import { healthRoute } from "./routes/health";
import { searchRoute } from "./routes/search";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", cors());

app.route("/", healthRoute);
app.route("/api/v1", searchRoute);

export default app;
