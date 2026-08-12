---
name: registry
description: Intempt registry — discover and call any of the 204 platform-operation commands directly, across both the CLI and MCP tools. Use when a task doesn't fit crm/analyze/design/market/sell, when you need a command not covered by those skills, or to look up an entry's exact arguments.
---

# Intempt registry

`@intempt/commands` is the single shared registry behind both the CLI and the MCP
tools — 204 entries across 13 feature domains, each with a name, arguments, REST
endpoint, and a write-safety class. Neither surface wraps the other; both render the
same registry independently. This skill is the general-purpose way to reach any of it
directly — the domain skills (`crm`, `analyze`, `design`, `market`, `sell`) are curated
paths through the parts of this same registry that map to a real customer job. Use this
skill when your task doesn't fit one of those, or you need an entry by exact name.

## Discovering what's available

```bash
intempt registry list [--json]              # all 204 entries, grouped by domain
intempt registry describe <tool-name> [--json]   # one entry's args, resolvers, endpoint
```

Via MCP, just ask — the tool descriptions are generated from the same registry, so
listing available tools serves the same purpose.

## Calling an entry directly

CLI: `intempt <domain> <action> [--flags]` — e.g. `intempt users get_user_overview --email sarah@acme.com`, `intempt segments list_segments`. `<domain>` and `<action>` are the registry entry's literal `domain`/`name` fields, used verbatim — no shortening, no prefix-stripping. Entries with no domain (only `search_project`, a confirmed stub) render at the top level: `intempt search_project`.

MCP: the equivalent tool is called directly by name (111 of the 156 MCP-eligible entries
are consolidated into 16 view-parameterized tools — e.g. `get_account_detail` replaces
6 separate account-detail reads).

Both accept `--json`/return raw JSON for machine consumption.

## Natural-language identifier resolution

Any `{id}`-parameterized `users`/`accounts` entry accepts a name or email instead of an
internal ID — it resolves via `POST /profile-lists/{users|accounts}` when no explicit ID
is passed. **Ambiguous matches are reported, not guessed.** The lookup requests up to 5
candidates; if more than one matches, you get a candidate list back and must pass an
explicit identifier rather than a silent first-match. Pass it as `--id` from the CLI and
as `id` from an MCP tool call.

## Write-safety classes — this determines MCP eligibility, not domain

Every entry carries one of three classes:

| Class | Count | Reachable from |
|---|---|---|
| `read` | 107 | CLI + MCP |
| `single-edit` (change one thing you already have permission to touch) | 51 | CLI + MCP |
| `create-or-bulk-or-destructive` | 46 | **CLI only** |

The 46 `create-or-bulk-or-destructive` entries are excluded from MCP entirely — creating
something new, or anything with real blast radius, isn't exposed as an agent tool call
at all in this product. If you need one of these and you're working through MCP tools,
tell the user it needs the CLI (or the console) instead of trying to route around it.

## Request bodies are built for you

Entries that need a structural or derived request body (e.g. a computed filter object the
console UI builds client-side) have a dedicated body builder. `KNOWN_STRUCTURAL_BODYKEY_GAPS`
is **empty** — no entry throws "not yet implemented" any more. If a call fails, treat it as
a real error to report, not as an unimplemented operation.

⚠️ **`create_segment` is still CLI-only** — but for a different reason: it is
`create-or-bulk-or-destructive`, so it is excluded from MCP by write-safety, not by a
missing body builder. Don't conflate the two.

## Other things worth knowing before you assume a capability exists

- **No `compare_*`-style tool exists anywhere in the 204 entries.** If asked to compare
  two things, do it yourself from two separate lookups — don't look for a comparison tool.
- **23 entries DO return a console URL** for the object they're about, via `consoleUrl`.
  Use the one the entry gives you; never construct or guess a console link yourself. The
  other entries don't carry one — in that case say so rather than fabricating a URL.
- **Recipes are readable**: `list_recipes` and `get_recipe` exist in the `recipes` domain.
  There is still no recipe *creation* or *run* entry in the registry.
- **Pagination passes straight through to the real endpoint** — list-returning tools
  expose the underlying REST endpoint's own page/pageSize/cursor args. There's no
  CLI/MCP-imposed cap layered on top.
- **A 402 (insufficient credits) or 403 (tier-gated entitlement) error may not name the
  billing URL even though the product intends it to** — this is a known, confirmed,
  unfixed gap in the CLI/MCP error path (raw gateway string passthrough, no status-code
  branching). If you hit a billing-flavored error with no clear next step, tell the user
  to check `app.intempt.com/settings/billing` yourself rather than assuming the error
  message will point there.
- **`intempt use --org --project`** resolves the "Organization and project are required"
  error for a multi-org/multi-project account — mention this if a registry call fails
  with that specific message.
