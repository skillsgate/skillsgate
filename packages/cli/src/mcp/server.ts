import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "../constants.js";

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "skillsgate",
    version: VERSION,
  });

  // Tool registrations will be added here by subsequent tasks

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
