import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "../constants.js";
import { registerWhoami } from "./tools/whoami.js";
import { registerAuthStatus } from "./tools/auth-status.js";
import { registerList } from "./tools/list.js";
import { registerSearch } from "./tools/search.js";

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "skillsgate",
    version: VERSION,
  });

  registerWhoami(server);
  registerAuthStatus(server);
  registerList(server);
  registerSearch(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
