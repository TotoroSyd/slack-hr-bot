import "dotenv/config";

function require_env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  slack: {
    botToken: require_env("SLACK_BOT_TOKEN"),
    appToken: require_env("SLACK_APP_TOKEN"),
  },
  anthropic: {
    apiKey: require_env("ANTHROPIC_API_KEY"),
  },
  notion: {
    apiKey: require_env("NOTION_API_KEY"),
  },
};
