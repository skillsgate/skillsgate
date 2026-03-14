import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuth, clearAuth } from "../../utils/auth-store.js";
import { API_BASE_URL } from "../../constants.js";
import { mcpSuccess, mcpError } from "../helpers.js";

export function registerLogout(server: McpServer): void {
  server.tool(
    "skillsgate_logout",
    "Log out of SkillsGate by revoking the session and clearing local credentials.",
    {},
    async () => {
      try {
        const existing = await loadAuth();

        if (!existing) {
          return mcpSuccess({
            success: true,
            wasLoggedIn: false,
            message: "No active session. Already logged out.",
          });
        }

        // Attempt to revoke the session on the server
        try {
          await fetch(`${API_BASE_URL}/api/auth/revoke-session`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${existing.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: existing.token }),
          });
        } catch {
          // Network failure should not block local logout
        }

        await clearAuth();

        return mcpSuccess({
          success: true,
          wasLoggedIn: true,
          message: "Logged out successfully.",
        });
      } catch (err: unknown) {
        return mcpError(
          err instanceof Error ? err.message : "Failed to logout",
        );
      }
    },
  );
}
