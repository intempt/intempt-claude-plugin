---
name: analyze
description: Intempt Analyze — funnels, retention, dashboards, and subscription/revenue metrics. Use for any question about how something is performing, revenue attribution, or ad-hoc metrics analysis.
---

# Intempt Analyze

Intempt's positioning frame for this product is **revenue attribution, not generic
analytics** — one identity graph joining revenue, web, and product data (the "Data
Analyst" agent's job is explaining what moved and why). The registry's 21 real entries
are the ad-hoc/query layer behind that: `analyze_funnel_overall`, `analyze_funnel_steps`,
`analyze_funnel_values`, retention analysis, dashboard/report reads, subscription metrics
(MRR/churn/NRR).

## Always return structured data, never synthesized prose

Every analytics tool returns the underlying real payload (steps/values per the actual
`/analytics-reports` contract) as JSON. Don't summarize a funnel result into a paragraph
and call that the answer — show the actual structured numbers, then interpret them if
asked. This matters more here than in most other domains because the whole point of
these tools is exact figures, not a narrative approximation of them.

## What doesn't exist — don't imply these are possible

- **No `compare_*`-style tool exists anywhere in the registry.** If asked to compare two
  periods, two segments, or two funnels, run two separate calls and do the comparison
  yourself in your response — don't look for a built-in comparison tool, there isn't one.
- **Some entries return a console URL** via `consoleUrl` (23 across the registry, mostly
  single-entity reads). If the entry you called gives you one, pass it through. If it
  doesn't, tell the user to open the console — never fabricate or construct a link.
- **Building/editing a dashboard or report visually is console-only** — the registry only
  reaches the ad-hoc query/read layer (the Data-Analyst-style capability), not the
  Boards/Dashboard-builder UI. If asked to "create a new dashboard," that's not something
  this registry slice can do.
