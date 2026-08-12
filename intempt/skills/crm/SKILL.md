---
name: crm
description: Intempt CRM — look up and manage accounts, users/contacts, deals, and segments (saved lists). Use for "who is this account/user/deal," building a targeting list, or any entity lookup that feeds another product (Design, Marketing, Sales, Analytics all use this data).
---

# Intempt CRM

The entity/record layer underneath all four Intempt products — Design needs customer
data, Marketing needs an audience to target, Analytics needs entities to analyze, Sales
needs pipeline. This skill is that shared lookup/list-management layer: accounts (12
entries), users (13), deals (8), segments (10) — 43 real registry entries total. If your
actual task is a sales motion (drafting outreach, reviewing a call), use `sell`, which
references this skill for entity lookup rather than duplicating it.

## Looking someone up

Every `{id}`-parameterized users/accounts tool accepts a name or email directly — it
resolves to an internal ID via `POST /profile-lists/{users|accounts}`. The lookup asks for
up to 5 candidates: **if more than one matches, you get the candidate list back instead of
a silent first-match**, and you must pass an explicit identifier (`--id` from the CLI, `id`
from an MCP tool call). A same-name collision therefore surfaces as a choice, not as
mystery data.

Consolidated detail views (`get_user_detail`, `get_account_detail`) replace what used to
be several narrow reads — pass the view you want rather than looking for a
dedicated tool per field.

## The Intent-level gotcha (users)

A user's Intent level can show **opposite polarity depending on which pane you're
reading** — a "bad sign" (red, High) on the Users List page and a "good sign" (green,
High) on that same user's Details sidebar. Same underlying value, two different visual
framings. If asked to interpret intent level, say what the number/level actually is and
let the human resolve the polarity, rather than asserting "this is good" or "this is
bad" yourself.

## Segments — and the naming trap around them

A **real segment** is a named, static-membership group of Users, created by bulk-select
on the Users list. It is never edited after creation — there's no add/remove-member
action, only create and reference. Segments feed Attributes, Experiences, and Journeys
as a targeting scope.

**`create_segment` is not reachable from MCP** — it is classed
`create-or-bulk-or-destructive`, and that whole class is excluded from MCP tools by
write-safety. ⚠️ **This is a write-safety exclusion, not a missing body builder** — it used
to throw "not yet implemented" and no longer does. **It IS callable from the CLI.** So if
asked to build a segment: from MCP, tell the user to use the CLI or the console; from the
CLI, just call it.

**"Segment" is overloaded three other ways in the product — don't conflate them:**

1. The **Users/Accounts list "Segment selector"** actually switches between **Lists** —
   a different entity from real segments.
2. The **Deals/Tasks/Meetings "Segment selector"** is hardcoded UI presets (All/Won/Lost,
   etc.) with **zero backend** — not wired to any real entity at all.
3. Only the thing described above (created via Users-list bulk-select, consumed by
   Attributes/Experiences/Journeys) is the real, registry-backed segment.

If a user says "segment," ask which they mean if it's ambiguous — the wrong assumption
here silently sends you down a UI path that isn't real.

## Errors here are real errors

The accounts/deals entries that used to throw "not yet implemented"
(`enrich_accounts`, `get_account_event_overview`, `get_account_activity`, `list_deals`,
`create_deal`, `get_deal_activity`, `create_group`) all have body builders now —
`KNOWN_STRUCTURAL_BODYKEY_GAPS` is **empty**. **So a failure from one of these is a
genuine error to report to the user, not an expected "unimplemented" response.** Don't
silently swallow it as known-broken, and don't retry blindly either.

**Deals has no AI assistance wired up in the product at all** ("Ask AI about the deal"
has no submit handler in the console) — don't imply deal analysis beyond what the
registry's real, structured reads (`get_deals_analytics` etc.) return.
