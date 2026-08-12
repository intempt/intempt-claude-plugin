# Changelog

## 2026-08-12 (v0.3.0)

- 🔴 **Fixed: the MCP server could never start.** `intempt/.mcp.json` registered
  `@intempt/mcp-server@^1.0.0`, which **404s on npm** -- the package shipped **unscoped** as
  **`intempt-mcp-server`**. Every install produced a server that could not launch. Nothing caught it
  because there was no test asserting the `npx` line resolves.
- **Corrected every factual claim in the 9 skills**, each verified against the live command registry:
  202 -> **204** entries; `read` 105 -> **107**; *"no entry returns a console URL"* -> **23 do**, via
  `consoleUrl`; *"12 entries throw not-yet-implemented"* -> **none do**, the list is empty;
  *"no disambiguation, first match"* -> **candidates are returned**, pass `--id` (CLI) / `id` (MCP);
  recipes are **readable** (`list_recipes`, `get_recipe`). `create_segment` is CLI-only for
  **write-safety**, not a missing body builder.
- **This repo is now GENERATED, not hand-authored.** The canonical plugin lives in the `intempt/cli`
  monorepo at `apps/plugin/`; `apps/plugin/scripts/sync-public.mjs` writes this repo and `--check`
  fails when they diverge. Keeping the same 9 skills correct in two places by hand is what caused most
  of the defects above, so it is now mechanical.

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
