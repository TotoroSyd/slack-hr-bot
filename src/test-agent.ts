/**
 * Smoke test: verify the MCP connection and agent loop work
 * Usage: npm run test:agent
 */
import { connectNotionMCP, getNotionTools } from "./mcp/notion.js";
import { runAgent } from "./ai/agent.js";

async function main() {
  console.log("Connecting to Notion MCP...");
  await connectNotionMCP();

  console.log("\nAvailable Notion tools:");
  const tools = await getNotionTools();
  tools.forEach((t) => console.log(` - ${t.name}: ${t.description}`));

  const question = process.argv[2] ?? "What is our parental leave policy? I am a permanent employee and want to know how many weeks I can take off when I have a baby?";
  console.log(`\nRunning agent with question: "${question}"\n`);

  const answer = await runAgent(question);
  console.log("Answer:\n", answer);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
