import type { App } from "@slack/bolt";
import { runAgent } from "../ai/agent.js";

export function registerHandlers(app: App): void {
  // Handle @mentions in channels
  app.event("app_mention", async ({ event, say }) => {
    const userMessage = event.text.replace(/<@[^>]+>\s*/g, "").trim();
    if (!userMessage) return;

    const thinkingMsg = await say({
      text: "Looking that up for you...",
      thread_ts: event.ts,
    });

    try {
      const answer = await runAgent(userMessage);
      await app.client.chat.update({
        channel: event.channel,
        ts: thinkingMsg.ts as string,
        text: answer,
      });
    } catch (err) {
      console.error("Agent error:", err);
      await app.client.chat.update({
        channel: event.channel,
        ts: thinkingMsg.ts as string,
        text: "Sorry, something went wrong. Please try again.",
      });
    }
  });

  // Handle DMs
  app.message(async ({ message, say }) => {
    if (message.subtype || !("text" in message) || !message.text) return;

    const thinkingMsg = await say({ text: "Looking that up for you..." });

    try {
      const answer = await runAgent(message.text);
      await app.client.chat.update({
        channel: message.channel,
        ts: thinkingMsg.ts as string,
        text: answer,
      });
    } catch (err) {
      console.error("Agent error:", err);
      await app.client.chat.update({
        channel: message.channel,
        ts: thinkingMsg.ts as string,
        text: "Sorry, something went wrong. Please try again.",
      });
    }
  });
}
