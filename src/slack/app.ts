import { App } from "@slack/bolt";
import { config } from "../config.js";
import { registerHandlers } from "./handlers.js";

export function createApp(): App {
  const app = new App({
    token: config.slack.botToken,
    appToken: config.slack.appToken,
    socketMode: true,
  });

  registerHandlers(app);
  return app;
}
