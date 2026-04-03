import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@anthropic-ai/sdk/resources/messages.js";
import { config } from "../config.js";

let mcpClient: Client | null = null;

export async function connectNotionMCP(): Promise<void> {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@notionhq/notion-mcp-server"],
    env: {
      ...process.env,
      OPENAPI_MCP_HEADERS: JSON.stringify({
        Authorization: `Bearer ${config.notion.apiKey}`,
        "Notion-Version": "2022-06-28",
      }),
    },
  });

  mcpClient = new Client({ name: "slack-hr-bot", version: "1.0.0" });
  await mcpClient.connect(transport);
  console.log("Notion MCP connected");
}

function getClient(): Client {
  if (!mcpClient) throw new Error("Notion MCP client not connected. Call connectNotionMCP() first.");
  return mcpClient;
}

const ALLOWED_TOOLS = new Set([
  "API-post-search",
  "API-get-block-children",
  "API-retrieve-a-block",
  "API-retrieve-a-page",
  "API-retrieve-a-page-property",
  "API-retrieve-a-database",
  "API-query-data-source",
  "API-retrieve-a-data-source",
  "API-list-data-source-templates",
  "API-retrieve-a-comment",
  "API-get-user",
  "API-get-users",
]);

export async function getNotionTools(): Promise<Tool[]> {
  const { tools } = await getClient().listTools();
  return tools
    .filter((t) => ALLOWED_TOOLS.has(t.name))
    .map((t) => ({
      name: t.name,
      description: t.description ?? "",
      input_schema: t.inputSchema as Tool["input_schema"],
    }));
}

export async function callNotionTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  console.log(`Calling Notion tool: ${name} with input:`, input);
  const result = await getClient().callTool({ name, arguments: input });

  const parts = result.content as Array<{ type: string; text?: string }>;
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n");
}
