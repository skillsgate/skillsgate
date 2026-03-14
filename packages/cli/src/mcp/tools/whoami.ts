import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuth } from "../../utils/auth-store.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerWhoami(server: McpServer): void {
  server.tool(
    "skillsgate_whoami",
    "Returns the currently authenticated SkillsGate user, or indicates that no user is logged in.",
    {},
    async () => {
      try {
        const auth = await loadAuth();

        if (!auth) {
          return mcpSuccess({
            authenticated: false,
            message: "Not logged in to SkillsGate.",
          });
        }

        return mcpSuccess({
          authenticated: true,
          user: {
            id: auth.user.id,
            name: auth.user.name,
            email: auth.user.email,
            image: auth.user.image ?? null,
          },
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to read auth state",
        );
      }
    },
  );
}
