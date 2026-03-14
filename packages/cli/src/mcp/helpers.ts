import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function mcpSuccess(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function mcpError(message: string, code?: string): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: message, code }, null, 2),
      },
    ],
  };
}
