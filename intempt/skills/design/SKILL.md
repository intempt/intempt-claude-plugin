---
name: design
description: Intempt Design — generate content (email/SMS/push/landing-page/Slack/text/image), manage brand assets (avatars, poses, scenes, brand designs), and look up brand voice/knowledge base. Use for anything about creating or drafting a deliverable, or brand identity.
---

# Intempt Design

Positioning frame: a "three-brain creative engine" — brand kit + customer data +
product catalog, generating "for the person, not the audience" (the Brand Designer
agent). This skill covers two real, working registry slices plus one thing worth
knowing doesn't exist yet:

1. **Content generation (7 tools)** — `generate_email`, `generate_sms`,
   `generate_push_notification`, `generate_landing_page`, `generate_slack_message`,
   `generate_text`, `generate_image`. ⚠️ **These are NOT registry entries.** They are
   hand-written MCP tools in `apps/mcp/src/tools.ts`; a registry lookup for
   `generate_*` returns nothing, and `intempt registry list` will not show them. They
   route through a WebSocket (`/chat` protocol, first-message auth frame then a message
   frame, resolving on `messageEnd`) — a different transport than everything else in
   this skill, but present the same way to you: give it a prompt, get a real generated
   deliverable back, not a stub. **MCP only** — there is no CLI equivalent.
2. **Designer (20 entries)** — brand designs, Creative Studio outputs, Design System
   tokens, Avatars, Poses, Scenes. Real REST registry calls. Creation in all of these
   is AI-chat-mediated only — there's no blank-form UI anywhere in this area, so don't
   expect a "create from scratch, no prompt" path either via the product or via these
   tools.
3. **Brand Kit / personas / knowledge base** — the text half of brand identity
   (voice, tone, ICP/persona definitions, knowledge articles Blu draws on). Also real
   REST registry calls, technically part of the same 33-entry `blu-chat` domain that
   `sell`'s outreach actions come from — but the outreach actions themselves belong to
   `sell`, not here.

## The "product catalog" brain doesn't have a tool

Design's own positioning names three brains — brand kit, customer data, **product
catalog**. The first two are reachable here and in `crm`. The third genuinely isn't:
Catalogs (which is the real, shipped product for this — 17 merchandising-feed
algorithms, ad feeds) has **zero CLI/MCP exposure by explicit design** (its own spec
states no Blu touchpoint of any kind, anywhere). If a generation task would benefit
from live catalog/product data, say so plainly rather than assuming you can fetch it.

## Known gap

Creative Studio (part of the Designer slice) has **no discoverable UI entry point at
all** in the current product, per its own spec — if a generated asset or workflow
seems to reference it, treat that as aspirational until confirmed otherwise.
