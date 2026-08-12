---
name: setup
description: Intempt setup -- install the intempt CLI, log in, and resolve org/project. Use when `intempt` is not found on PATH, `intempt whoami` fails, the Intempt MCP tools error on auth, or the user asks to set up/configure Intempt.
allowed-tools: Bash
---

# Intempt setup

Two things need to work: the `intempt` CLI (on PATH, signed in) and the
Intempt MCP server's tools (this plugin's `.mcp.json` registers the server;
this skill doesn't configure that part, just verifies it's reachable).

## 1. Check whether the MCP tools are actually reachable in this session

Don't use `claude mcp list` for this -- it's a *separate* `claude` process
reading on-disk config, so it reports what's registered, not what this
running session actually spawned. It will show the server as connected even
seconds after a fresh install, before this session has restarted to pick it
up -- the opposite of what you need here.

Instead, search for the tools directly and try one:

- Search (e.g. via `ToolSearch`) for `intempt` tools. If none are found at
  all, or a call to one (e.g. its `whoami`-equivalent) errors as unavailable,
  the plugin was likely just installed this session -- tell the user to
  exit and restart Claude Code, then continue from step 2 in the new
  session.
- If the tools are found and callable, no restart is needed -- continue to
  step 2.

## 2. Check whether the CLI is installed

```bash
command -v intempt && intempt --version
```

- **Found** -- skip to step 3.
- **Not found** -- install it:

  ```bash
  npm install -g @intempt/cli
  ```

  Then re-run `command -v intempt` to confirm it's on PATH.
  - Still not found after a successful install: npm's global bin directory
    isn't on the user's PATH -- tell them to add it (`npm config get prefix`
    shows the prefix; the bin directory is `<prefix>/bin`) and open a new
    shell.
  - `EACCES`/permission denied during install: npm's default global prefix
    (often `/usr/local`) isn't user-writable. Don't suggest `sudo npm
    install -g` -- point the user at npm's documented fix instead (a
    user-owned prefix, e.g. via `npm config set prefix ~/.npm-global` and
    adding that to PATH, or a Node version manager like nvm).

## 3. Check login state

**Prefer the MCP `login` tool over the CLI here if it's available** (from
step 1). It prints a clickable link and returns immediately; `intempt login`
in a Bash tool call blocks until the user approves in the browser, which
can exceed a typical tool-call timeout, and if `openBrowser` fails silently
(headless/SSH/no display) the CLI's login screen shows no fallback link at
all. Only use the Bash `login` command below as a fallback when the MCP
tools aren't reachable at all (i.e. you're still stuck before step 1
resolves).

```bash
intempt whoami; echo "exit_code=$?"
```

- **exit_code=0** -- logged in. Read the *message*, not just the exit code,
  to know what's actually resolved:
  - If it lists more than one organization, **or** lists exactly one
    organization that itself has more than one project -- go to step 5.
    (`intempt login` only auto-picks a default when both the org and the
    project within it are unambiguous; a single org with several projects
    still needs step 5.)
  - Otherwise (one org, one project resolved) -- skip to step 6.
- **exit_code=1** -- do **not** assume this means "not logged in." Read the
  printed message:
  - `"Not logged in..."` -- go to step 4.
  - Anything else (e.g. a fetch/profile error) -- this is a network or API
    problem, not an auth problem. Re-running login won't fix it; report the
    actual error to the user instead of proceeding to step 4.

## 4. Log in

Prefer calling the MCP `login` tool (see step 3's note). If you have to fall
back to the CLI:

```bash
intempt login
```

This opens a browser automatically (device-code flow) and blocks until the
user approves -- if your tool call has a shorter timeout than the user needs
to click through the browser flow, it may appear to fail when it's actually
still waiting; re-check with `intempt whoami` afterward rather than assuming
failure. No restart is needed afterward for the CLI itself -- every
`intempt` invocation is a fresh process that reads the current session from
`~/.intempt/auth.json`.

**If the MCP tools (not just the CLI) are erroring on auth after this
login**, that's the one case that *does* need a restart: the MCP server is a
long-running process that only reads that file once, at its own startup. It
picks up a session created by a *separate* CLI login only after Claude Code
restarts. If you instead logged in via the MCP server's own `login` tool, no
restart is needed for the MCP side -- that login happens inside the
already-running MCP process and updates its in-memory session directly. But
note that tool is fire-and-forget (it returns before the user has actually
approved) and, like the CLI, still can't pick an org/project for a
multi-org/multi-project account -- step 5 below is CLI-only regardless of
which surface you used to log in.

After login, re-run `intempt whoami` and continue at step 3's logic.

## 5. Resolve org/project (multi-org, or single-org-with-multiple-projects)

There is no MCP-side way to do this -- only the CLI's `intempt use` sets the
stored default. Ask the user which org (and, if that org has more than one
project, which project) they want to use -- list the exact names from
`intempt whoami`'s output. Then set it non-interactively (don't run bare
`intempt use` here -- its interactive picker needs a real terminal, which a
tool call doesn't have):

```bash
intempt use --org "<chosen org name>" --project "<chosen project name>"
```

Omit `--project` only if the chosen org has just one project (it's filled in
automatically) -- for an org with multiple projects, always pass `--project`
explicitly here; leaving it out won't prompt the user again later.

## 6. Verify both surfaces

`intempt whoami` prints the account's full org/project *membership tree*,
not which one is currently selected -- it can't be used to confirm what got
resolved. Use each surface's own confirmation instead:

- **CLI**: `intempt use`'s own output (`✔ Using <org> / <project>`) from
  step 5, or re-run step 5 to see it again.
- **MCP**: call the `whoami` MCP tool and check its `Organization:`/
  `Project:` lines are populated (not "not set").

If the MCP tool's `whoami` shows the org/project as not set even after step
5, and the MCP server was already running before that `intempt use` call,
that's the restart case from step 4: the running server only reads
`~/.intempt/auth.json` at its own startup.

Setup is complete once the CLI's `intempt whoami` exits 0 and the MCP
`whoami` tool shows both Organization and Project populated.

## 7. Which client is the user in? Only MCP *registration* differs

Sections 1–6 assume **Claude Code**, where the plugin registers the MCP server for you.
⚠️ **Scope that precisely: only the REGISTRATION is automatic.** Installing the CLI, logging
in, and resolving org/project (steps 2–5) are manual in **every** client, Claude Code
included — never tell a user "nothing else is needed".

**The stdio server works in every client below** — same `npx -y intempt-mcp-server` command,
same `mcpServers` JSON shape. Only *where you put it* changes.

| Client | Where the config goes | Registration |
|---|---|---|
| **Claude Code** | the plugin does it on install. Manual alternative: `claude mcp add intempt -- npx -y intempt-mcp-server` | ✅ automatic |
| **Claude Desktop** | `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) | ❌ hand-edited |
| **Cursor** | **Settings → MCP Servers → Add** (writes `~/.cursor/mcp.json`, or `.cursor/mcp.json` per project) | ❌ hand-edited |
| **ChatGPT** | connector UI — **HTTPS only**, so the stdio server does **not** apply, and it is **plan-gated** | ❌ needs an endpoint we have not deployed |

⚠️ **Claude Code plugins do not exist in any other client.** Never tell a Cursor or Claude
Desktop user to run `/plugin install` — there is no such command for them. Give them the
config above instead.

⚠️ **Cursor's file is NOT a repo-root `.mcp.json`.** It is `~/.cursor/mcp.json` (global) or
`.cursor/mcp.json` (project). Writing `.mcp.json` at a project root does nothing in Cursor —
it shows no server and there is nothing to debug.

⚠️ **ChatGPT is the only one that needs a hosted HTTPS endpoint, and it is not deployed.**
If a ChatGPT user asks to connect, say it isn't available yet — do **not** improvise a URL.
Claude Desktop and Cursor need no endpoint; they run the npm package locally.

**The honest one-liner:** *"MCP registration is automatic in Claude Code and a small JSON
edit everywhere else. Login and org/project are manual in all of them. ChatGPT is the only
one that needs a hosted endpoint, and that isn't deployed yet."*
