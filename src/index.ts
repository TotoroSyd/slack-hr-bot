import express from "express";
import { connectNotionMCP } from "./mcp/notion.js";
import { createApp } from "./slack/app.js";

const PORT = process.env.PORT || 3000;

async function main() {
  await connectNotionMCP();

  const app = createApp();
  await app.start();
  console.log("Bolt app running (Socket Mode)");

  const server = express();
  server.use(express.json());

  server.get("/health", (_req, res) => {
    res.json({ status: "ok dokie" });
  });

  server.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
