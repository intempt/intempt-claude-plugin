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

A pointer, not a copy. `.claude-plugin/marketplace.json` is the manifest Claude Code
reads; everything else here is this README and repository housekeeping. There is no
plugin source in this repository.

The plugin is published to npm as
[`@intempt-technologies/plugin`](https://www.npmjs.com/package/@intempt-technologies/plugin) and the manifest points
Claude Code at that package, which it fetches and unpacks on install. Keeping the
plugin in one place means a skill fix ships by publishing, with no second copy here to
drift out of step.

> ⚠️ Do not `npm install @intempt-technologies/plugin` by hand — it is a payload Claude Code unpacks for
> you. Use the two commands above. The package ships one executable file, a
> `SessionStart` hook that removes duplicate copies of these nine skills from
> `~/.claude/skills/`. It deletes only files whose sha256 matches a published copy, so a
> copy you have edited is left in place; the hook names a kept copy only in a session
> where it also removed a duplicate.

## Reporting a problem

The plugin is built in a private repository, so report bugs and ask for changes in this
repository's issues: https://github.com/intempt/intempt-claude-plugin/issues

For a security problem, do not open an issue. Follow the security policy instead:
https://github.com/intempt/intempt-claude-plugin/security/policy

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
