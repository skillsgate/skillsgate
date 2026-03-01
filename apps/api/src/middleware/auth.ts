import { createMiddleware } from "hono/factory";
import { getDb } from "@skillsgate/database";
import type { Bindings, Variables } from "../types";

export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authorization.slice("Bearer ".length);
  if (!token) {
    return c.json({ error: "Empty token" }, 401);
  }

  const db = getDb(c.env);
  c.set("db", db);

  const session = await db.session.findFirst({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  c.set("userId", session.userId);

  await next();
});
