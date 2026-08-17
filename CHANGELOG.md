# Changelog

Changes to **this repository** — the public marketplace entry.

> **Release notes for the plugin itself now live with the package**, not here:
> <https://www.npmjs.com/package/intempt-claude-plugin>. This repository no longer contains the
> plugin, so entries below are dated rather than versioned. It changes only when the marketplace
> entry does. Entries from 2026-08-01 and earlier are archived plugin releases, kept for history —
> the version numbers and counts in them describe the plugin as it was then, not as it ships today.

## 2026-08-17 — the plugin moved to npm

This repository is now a **pointer**, not a copy. It holds a marketplace manifest and a README.

Previously it carried its own copy of the plugin — both manifests and all nine skills — generated
from Intempt's private CLI monorepo. That meant the same skills existed in two places, and every
skill fix needed both repositories to move.

Claude Code supports an **`npm` plugin source**, so the manifest now points at
[`intempt-claude-plugin`](https://www.npmjs.com/package/intempt-claude-plugin) and Claude Code
fetches and unpacks the package on install. A new plugin release now reaches users by publishing
to npm — with no commit here.

> ⚠️ This removes the copy that lived in *this* repository. It does not make the plugin the only
> place the skills exist: `intempt-mcp-server` also ships a copy for non-Claude-Code clients, and
> that copy is currently behind. Treat `intempt-claude-plugin` as the current one.

- **Removed:** `intempt/` — the copied plugin. Delivered from npm instead.
- **Changed:** `.claude-plugin/marketplace.json` — plugin source is now
  `{ "source": "npm", "package": "intempt-claude-plugin" }`.
- **Fixed, by deletion:** the copied `intempt/.mcp.json` registered `@intempt/mcp-server@^1.0.0`,
  which **404s** — the server publishes unscoped as `intempt-mcp-server`, so the plugin installed
  and its MCP server could never start. The corrected file now ships inside the npm package, and
  the monorepo guards the name against the package it actually publishes rather than trusting a
  string typed in two places.
- **No version pin, deliberately.** Claude Code resolves an npm-sourced plugin's version from the
  package's own `plugin.json`, so the update signal travels inside the package. Pinning a range
  here would mean committing to this repo on every release — the coupling the change removes.

For a **new** install nothing about the commands changes:

```
/plugin marketplace add intempt/intempt-claude-plugin
/plugin install intempt@intempt-plugins
```

If you are **already installed** from an older version of this repository, Claude Code will not
move you onto the npm source on its own — run `/plugin marketplace update intempt-plugins` then
`/plugin update intempt@intempt-plugins`, and restart. See the README for detail.

## 2026-08-01 (v0.2.0)

- **Added:** 8 new skills -- `intempt` (router), `registry`, `instrument`, `crm`,
  `analyze`, `design`, `market`, `sell` -- covering the full 202-entry command
  registry plus native instrumentation. Organized around Intempt's four sold
  products (Analytics, Design, Marketing, Sales) rather than internal registry
  domains, after an adversarial review found the domain-oriented shape produced
  real same-word collisions a developer would actually hit (e.g. "draft a follow-up
  email" and "generate a hero image" each routing to two different skills, "event"
  meaning two unrelated things depending on which skill). `crm` (accounts/users/
  deals/segments) is a cross-cutting exception -- entity lookup is used by all four
  products, not owned by Sales.
- Bumped plugin version to 0.2.0.

## 2026-08-01 (v0.1.0)

- **Added:** initial release. Marketplace manifest, `intempt` plugin (registers the MCP server as `npx -y @intempt/mcp-server@^1.0.0`, no bundled binary since the packages publish to public npm), and the bundled `intempt:setup` skill (installs the CLI via npm if missing, logs in, resolves org/project non-interactively when ambiguous, verifies both surfaces).
- **Fixed** (pre-merge, adversarial review): the setup skill's restart check used `claude mcp list`, a separate process reading on-disk config that can't reflect whether *this* session's tools are actually live -- replaced with a direct tool-reachability check.
- **Fixed:** the skill's org/project gating only checked org count, missing the single-org/multiple-project case entirely (`pickDefaultOrgProject` leaves the project unset there too).
- **Fixed:** the skill's verification step asked for something `intempt whoami` can't show (the currently-selected default, vs. the full membership tree it actually prints) -- rewritten to use `intempt use`'s own confirmation line and the MCP `whoami` tool's Organization/Project fields.
- **Fixed:** the skill treated `intempt whoami`'s exit code 1 as always meaning "not logged in"; it also covers network/API failures, which need a different response.
- **Changed:** the skill now prefers the MCP server's own `login` tool over the CLI's `intempt login` in a Bash call, which blocks until browser approval (can exceed a tool-call timeout) and prints no fallback link in headless/SSH contexts.
