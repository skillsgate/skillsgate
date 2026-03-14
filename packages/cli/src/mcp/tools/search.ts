import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getToken } from "../../utils/auth-store.js";
import { SEARCH_API_URL } from "../../constants.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerSearch(server: McpServer): void {
  server.tool(
    "skillsgate_search",
    "Searches the SkillsGate registry for skills matching a query. Requires authentication.",
    {
      query: z
        .string()
        .max(500)
        .describe("Search query to find skills (max 500 characters)."),
    },
    async ({ query }) => {
      try {
        const token = await getToken();

        if (!token) {
          return mcpError(
            "Authentication required. Run `skillsgate login` in your terminal first.",
            "UNAUTHORIZED",
          );
        }

        const response = await fetch(`${SEARCH_API_URL}/api/v1/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query }),
        });

        if (response.status === 401) {
          return mcpError(
            "Session expired. Run `skillsgate login` to re-authenticate.",
            "AUTH_EXPIRED",
          );
        }

        if (response.status === 429) {
          const body = (await response.json()) as { message?: string };
          return mcpError(
            body.message ?? "Rate limit exceeded. Please try again later.",
            "RATE_LIMITED",
          );
        }

        if (!response.ok) {
          const body = (await response.json().catch(() => ({ error: "Unknown error" }))) as { error?: string };
          return mcpError(
            body.error ?? `Search failed (${response.status})`,
            "SEARCH_FAILED",
          );
        }

        const data = await response.json();
        return mcpSuccess(data);
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Search request failed",
          "SEARCH_FAILED",
        );
      }
    },
  );
}
