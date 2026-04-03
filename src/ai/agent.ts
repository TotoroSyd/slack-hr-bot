import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam, Tool } from "@anthropic-ai/sdk/resources/messages.js";
import { config } from "../config.js";
import { getNotionTools, callNotionTool } from "../mcp/notion.js";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `You are an HR assistant. Your job is to answer employee questions about HR policies accurately and concisely.

You have access to tools that let you search and read pages from the company's Notion HR policy database. Always retrieve relevant pages before answering. Do not answer from memory — only use what you find in Notion.

If the policy doesn't exist or you can't find relevant content, say so clearly. Cite the Notion page title(s) you used in your answer.`;

const MAX_ITERATIONS = 10;

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

let cachedTools: Tool[] | null = null;

async function getTools(): Promise<Tool[]> {
  if (!cachedTools) cachedTools = await getNotionTools();
  return cachedTools;
}

export async function runAgent(userMessage: string): Promise<string> {
  const tools = await getTools();
  const messages: MessageParam[] = [{ role: "user", content: userMessage }];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      return extractText(response.content);
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      return extractText(response.content);
    }

    const toolResults: ToolResultBlockParam[] = await Promise.all(
      toolUseBlocks.map(async (b) => ({
        type: "tool_result" as const,
        tool_use_id: b.id,
        content: await callNotionTool(b.name, b.input as Record<string, unknown>),
      }))
    );

    messages.push({ role: "user", content: toolResults });
  }

  return "Sorry, I wasn't able to complete the lookup. Please try again.";
}
