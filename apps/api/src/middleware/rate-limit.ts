import { createMiddleware } from "hono/factory";
import type { Bindings, Variables } from "../types";

const MAX_SEARCHES_PER_DAY = 30;

export const rateLimitMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const db = c.var.db;
  const userId = c.var.userId;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const count = await db.searchUsage.count({
    where: {
      userId,
      searchedAt: { gte: since },
    },
  });

  if (count >= MAX_SEARCHES_PER_DAY) {
    return c.json(
      {
        error: "Rate limit exceeded",
        message: `You have reached the maximum of ${MAX_SEARCHES_PER_DAY} searches per 24 hours. Please try again later.`,
      },
      429
    );
  }

  c.set("remainingSearches", MAX_SEARCHES_PER_DAY - count - 1);

  await next();
});
