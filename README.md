# Slack HR Bot (Notion base)

A Slack bot that answers employee HR policy questions using Claude AI and your company's Notion knowledge base.

When an employee asks a question — via DM or `@mention` in a channel — the bot queries your Notion HR pages through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) and returns a grounded answer, citing the specific Notion pages it used.

## How it works

```
Employee (Slack DM or @mention)
        │
        ▼
   Slack Bolt App (Socket Mode)
        │
        ▼
   Claude (claude-sonnet-4-6)  ◄──► Notion MCP Server
        │                              (reads HR policy pages)
        ▼
   Answer posted back to Slack
```

1. Employee sends a message or `@mention`s the bot
2. The bot sends a "Looking that up..." placeholder reply
3. Claude uses Notion MCP tools to search and read relevant HR policy pages
4. Claude returns an answer citing the Notion page titles it used
5. The placeholder is updated with the final answer

## Prerequisites

- Node.js 18+
- A Slack app with Socket Mode enabled
- An Anthropic API key
- A Notion integration with access to your HR workspace

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/slack-hr-bot.git
cd slack-hr-bot
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
ANTHROPIC_API_KEY=sk-ant-...
NOTION_API_KEY=secret_...
```

### 3. Configure your Slack app

In the [Slack API dashboard](https://api.slack.com/apps):

- **Socket Mode**: Enable it and generate an App-Level Token (`SLACK_APP_TOKEN`) with the `connections:write` scope
- **Bot Token Scopes**: `app_mentions:read`, `chat:write`, `im:history`, `im:read`, `im:write`
- **Event Subscriptions**: Subscribe to `app_mention` and `message.im` events
- **Install the app** to your workspace and copy the Bot User OAuth Token (`SLACK_BOT_TOKEN`)

### 4. Configure your Notion integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and create a new integration
2. Copy the Internal Integration Token (`NOTION_API_KEY`)
3. Share your HR policy pages/databases with the integration (open the page in Notion → `...` menu → **Connections** → add your integration)

### 5. Build and run

```bash
# Install
npm i
# Build
npm run build
# Start
npm start

## Project structure

```
src/
├── index.ts          # Entry point — starts MCP, Slack, and Express
├── config.ts         # Environment variable validation
├── ai/
│   └── agent.ts      # Claude agentic loop with tool use
├── mcp/
│   └── notion.ts     # Notion MCP client connection and tool wrapper
└── slack/
    ├── app.ts        # Slack Bolt app initialization
    └── handlers.ts   # Event handlers for @mentions and DMs
```

## Stack

| Component | Technology |
|---|---|
| Slack integration | [Slack Bolt for JS](https://slack.dev/bolt-js/) (Socket Mode) |
| AI model | [Claude](https://anthropic.com) via Anthropic SDK |
| Notion access | [Notion MCP Server](https://github.com/makenotion/notion-mcp-server) via MCP |
| Language | TypeScript |

## License

MIT
