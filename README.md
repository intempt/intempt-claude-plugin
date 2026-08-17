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

A pointer, not a copy. It holds `.claude-plugin/marketplace.json` — the manifest Claude Code
reads — plus this README, a CHANGELOG, a LICENSE and a SECURITY policy. No plugin source.

The plugin itself is published to npm as
[`intempt-claude-plugin`](https://www.npmjs.com/package/intempt-claude-plugin), and the manifest points
Claude Code at that package, which it fetches and unpacks on install. Because no copy of
the skills is kept here, a skill fix ships by publishing to npm — this repository does not
need to change.

> ⚠️ Do not `npm install intempt-claude-plugin` by hand — it carries no executable code. It is a
> payload Claude Code unpacks for you. Use the two commands above.

The plugin's `.mcp.json` starts the Intempt MCP server by running
`npx -y intempt-mcp-server@^1.0.0`, which is fetched from npm the first time a session needs
it. That is the only thing the plugin executes.

Source lives in the Intempt CLI monorepo at `apps/plugin/intempt`. That repository is
private, so **report bugs and request changes as issues on this repository** and we will
route them; for anything security-sensitive follow [SECURITY.md](SECURITY.md) instead of
opening an issue.

### Already installed from an older version of this repo?

Earlier versions served the plugin from a directory here. Claude Code does not migrate that
automatically — run these once:

```
/plugin marketplace update intempt-plugins
/plugin update intempt@intempt-plugins
```

`/plugin list` should then report **0.4.0** or later. Restart Claude Code afterwards.

## Other clients

⚠️ **Plugins are a Claude Code feature.** They do not exist in Cursor, Windsurf, Claude
Desktop, or the claude.ai app. Those clients consume the MCP server directly — add it to
that client's own MCP config rather than installing anything globally:

```json
{
  "mcpServers": {
    "intempt": { "command": "npx", "args": ["-y", "intempt-mcp-server@^1.0.0"] }
  }
}
```

Where that file lives depends on the client — Cursor reads `~/.cursor/mcp.json`, Claude
Desktop reads `claude_desktop_config.json` in its application-support directory. Restart
the client afterwards.

> ⚠️ **Do not run `npm install -g intempt-mcp-server`.** That package's postinstall hook
> writes nine `SKILL.md` files into `~/.claude/skills/`, **overwriting any file already
> there with one of those names**, and it configures none of the clients above. The `npx`
> config block is the supported route; it does not touch your skills directory.

## License

MIT © Intempt — see [LICENSE](LICENSE).
