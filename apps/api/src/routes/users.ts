import { Hono } from "hono";
import type { Bindings, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";

export const usersRoute = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

usersRoute.use("*", authMiddleware);

/**
 * GET /users/search?q=...
 * Search users by name or GitHub username. Returns up to 10 results.
 * Excludes the requesting user.
 */
usersRoute.get("/users/search", async (c) => {
  const q = c.req.query("q")?.trim();

  if (!q || q.length < 2) {
    return c.json({ error: "Query must be at least 2 characters" }, 400);
  }
  if (q.length > 50) {
    return c.json({ error: "Query must be 50 characters or less" }, 400);
  }

  const db = c.var.db;
  const userId = c.var.userId;

  // Search by user name (ILIKE) OR by GitHub username in accounts table (ILIKE)
  const users = await db.user.findMany({
    where: {
      AND: [
        { id: { not: userId } },
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            {
              accounts: {
                some: {
                  providerId: "github",
                  accountId: { contains: q, mode: "insensitive" },
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      accounts: {
        where: { providerId: "github" },
        select: { accountId: true },
      },
    },
    take: 10,
  });

  const results = users.map((user) => ({
    id: user.id,
    name: user.name,
    image: user.image,
    githubUsername: user.accounts[0]?.accountId ?? null,
  }));

  return c.json({ users: results });
});
