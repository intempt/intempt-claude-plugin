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
[`@intempt-technologies/plugin`](https://www.npmjs.com/package/@intempt-technologies/plugin) and this manifest points
Claude Code at that package, which it fetches and unpacks on install. Keeping the
plugin in one place means a skill fix ships by publishing, with no second copy here to
drift out of step.

> ⚠️ Do not `npm install @intempt-technologies/plugin` by hand — it is a payload Claude Code unpacks for
> you. Use the two commands above. The package ships one executable file, a
> `SessionStart` hook that removes duplicate copies of these nine skills from
> `~/.claude/skills/`; it deletes only files whose sha256 matches a published copy, so
> anything edited locally is preserved and reported.

Source lives in the Intempt CLI monorepo under `packages/plugin`. Issues and pull requests
for the skills belong there; this repository only ever changes when the marketplace
entry itself does.

## Other clients

⚠️ **Plugins are a Claude Code feature.** They do not exist in Cursor, Windsurf, Claude
Desktop, or the claude.ai app. Those clients consume the MCP server directly -- via that client's own MCP config:

```json
{
  "mcpServers": {
    "intempt": {
      "command": "npx",
      "args": ["-y", "@intempt-technologies/mcp@1"]
    }
  }
}
```

A global `npm install -g` also works, but its postinstall writes the nine skills
into `~/.claude/skills/` and overwrites same-named files there.

MIT © Intempt
