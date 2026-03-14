import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuth } from "../../utils/auth-store.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerAuthStatus(server: McpServer): void {
  server.tool(
    "skillsgate_auth_status",
    "Checks SkillsGate authentication status and provides login instructions when not authenticated.",
    {},
    async () => {
      try {
        const auth = await loadAuth();

        if (!auth) {
          return mcpSuccess({
            authenticated: false,
            message: "Not logged in to SkillsGate.",
            instructions:
              "Run `skillsgate login` in your terminal to authenticate with your SkillsGate account.",
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
