import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "../constants.js";
import { registerWhoami } from "./tools/whoami.js";
import { registerAuthStatus } from "./tools/auth-status.js";
import { registerList } from "./tools/list.js";
import { registerSearch } from "./tools/search.js";
import { registerAdd } from "./tools/add.js";
import { registerRemove } from "./tools/remove.js";
import { registerUpdate } from "./tools/update.js";
import { registerSync } from "./tools/sync.js";
import { registerLogout } from "./tools/logout.js";

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "skillsgate",
    version: VERSION,
  });

  // Read-only tools
  registerWhoami(server);
  registerAuthStatus(server);
  registerList(server);
  registerSearch(server);

  // Write tools
  registerAdd(server);
  registerRemove(server);
  registerUpdate(server);
  registerSync(server);
  registerLogout(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
