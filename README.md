# Intempt plugin for Claude Code

The public marketplace for the **Intempt** plugin — nine skills over the Intempt CLI
and the Intempt MCP server, for analytics instrumentation and platform operations.

## Install

In Claude Code:

```
/plugin marketplace add intempt/intempt-claude-plugin
/plugin install intempt@intempt-plugins
```

Then restart Claude Code. The skills appear as `intempt:<name>`; start with
`intempt:intempt`, which is a table of contents for the rest.

## What this repository is

Two files: a marketplace manifest and this README.

The plugin itself is **not** stored here. It is published to npm as
[`intempt-claude-plugin`](https://www.npmjs.com/package/intempt-claude-plugin) and this manifest points
Claude Code at that package, which it fetches and unpacks on install. Keeping the
plugin in one place means a skill fix ships by publishing, with no second copy here to
drift out of step.

> ⚠️ Do not `npm install intempt-claude-plugin` by hand — it carries no executable code. It is a
> payload Claude Code unpacks for you. Use the two commands above.

Source lives in the Intempt CLI monorepo under `apps/plugin`. Issues and pull requests
for the skills belong there; this repository only ever changes when the marketplace
entry itself does.

## Other clients

⚠️ **Plugins are a Claude Code feature.** They do not exist in Cursor, Windsurf, Claude
Desktop, or the claude.ai app. Those clients consume the MCP server directly:

```
npm install -g intempt-mcp-server
```

MIT © Intempt
