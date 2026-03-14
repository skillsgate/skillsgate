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

        const url = new URL("/v1/skills/search", SEARCH_API_URL);
        url.searchParams.set("q", query);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const status = response.status;
          if (status === 401) {
            return mcpError(
              "Session expired. Run `skillsgate login` to re-authenticate.",
              "UNAUTHORIZED",
            );
          }
          return mcpError(
            `Search request failed with status ${status}`,
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
