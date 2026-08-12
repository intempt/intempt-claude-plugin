---
name: intempt
description: Intempt — start here. A table of contents for working with the Intempt CLI and MCP tools, and which skill to use for each thing. Read this first to answer "what can I do with Intempt?" or when unsure which skill applies.
---

# Intempt

Intempt is agentic GTM: four sold products (Analytics, Design, Marketing, Sales), each
with its own agent(s), reachable from Claude Code via the `intempt` CLI and the MCP
tools this plugin registers. This skill routes you to the right one — read it first,
then jump to the specific skill for your task.

## Setup first

If `intempt` isn't on `PATH`, `intempt whoami` fails, or the MCP tools error on auth,
use `intempt:setup` before anything else. Everything below assumes you're signed in
with a resolved org/project.

## Choosing the right skill

| You're trying to... | Use |
|---|---|
| Look up an account, user/contact, deal, or a saved list (segment) of them | `intempt:crm` |
| Understand revenue, funnels, retention, or any metrics question | `intempt:analyze` |
| Generate a page/email/SMS/image/video, manage brand assets (avatars, poses, scenes), or look up brand voice/knowledge base | `intempt:design` |
| Build or check on a lifecycle/outreach sequence (journeys), an A/B test or personalization (experiences), or raw event data | `intempt:market` |
| Draft/reply to prospect outreach, review a call summary, or anything sales-motion related | `intempt:sell` |
| Set up analytics tracking in a codebase (tracking plan, typed SDK codegen) | `intempt:instrument` |
| Call a specific registry command directly, or your task doesn't fit any of the above | `intempt:registry` |
| Send feedback or report a bug in this plugin | there's no feedback command shipped yet — tell the user directly, don't invent one |

## What each skill actually wraps

| Skill | Real registry domains | Entry count |
|---|---|---|
| `crm` | accounts, users, deals, segments | 12 + 13 + 8 + 10 = 43 |
| `analyze` | analytics | 21 |
| `design` | designer, blu-chat (brand kit/personas/knowledge base slice), content-gen | 20 + partial-33 + 7 |
| `market` | journeys, experiences, events | 43 + 17 + 9 |
| `sell` | meetings, blu-chat (outreach slice) | 14 + partial-33 |
| `instrument` | native CLI layer, not registry-backed | n/a |
| `registry` | meta — covers anything above by domain+action name directly | all 204 |

**blu-chat's 33 entries split across two skills, not one** — Brand Kit/personas/knowledge
base go to `design` (matches Design's own "brand kit + customer data" claim), outreach
actions (`draft_outreach`, `reply_to_email`, `preflight_email`) go to `sell` (matches
Sales' "sequence" step). If you're not sure which side a blu-chat entry is on, check
both skills before guessing.

## What doesn't exist yet — don't reach for these

- **Recipes** (`recipes list/search/get/preview/run`) — the backend is confirmed absent
  (two independent searches, zero matches). The `recipe` CLI alias exists but always
  errors. Content generation (`generate_email` etc., under `design`) is a *different*,
  real, working mechanism — don't confuse the two.
- **Agent/NDJSON mode** (`--agent`, `plan --json`) — speced but not built.
- **`intempt pull`/`intempt diff`** — no such commands exist.
- **`intempt push`** — exists but doesn't match its own spec (wrong endpoint, no diff
  display, no confirmation, no `--force`). Don't rely on it working correctly.
- **`intempt config`/`intempt switch`/`intempt doctor`/`intempt completion`/`intempt upgrade`/raw `intempt api`** — none of these exist in the shipped CLI.
- **Scheduling** (booking links) — a real, fully shipped product feature, just not yet
  exposed via any CLI/MCP tool. See `sell`.
- **Catalogs / product recommendations** — a real, substantial, shipped product
  (17 merchandising-feed algorithms, ad feeds), deliberately built with zero AI/agent
  touchpoint by design. Nothing to wrap here, not an oversight.

## Cross-cutting things worth knowing before you start

- **Natural-language resolution**: any `{id}`-parameterized `users`/`accounts` tool
  resolves a name or email to an internal ID automatically. **Multiple matches return a
  candidate list rather than silently picking the first** — pass an explicit identifier
  (`--id` from the CLI, `id` from an MCP tool). See `crm`.
- **Write-safety**: the CLI exposes all 204 registry entries; MCP only exposes the 156
  non-stub entries that aren't `create-or-bulk-or-destructive` (creating something new, or
  anything with real blast radius, isn't a registry-backed MCP tool at all).
- **No entry throws "not yet implemented"** — `KNOWN_STRUCTURAL_BODYKEY_GAPS` is empty;
  entries needing a structural body have a body builder. A failure is a real error.
- **23 entries DO return a console URL** (via `consoleUrl`) — use the entry's own value,
  never a constructed one. No `compare_*`-style tool exists in any domain.
