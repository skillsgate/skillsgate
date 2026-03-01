import { Hono } from "hono";
import type { Bindings, Variables } from "../types";

export const healthRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

healthRoute.get("/health", (c) => {
  return c.json({ status: "ok" });
});
