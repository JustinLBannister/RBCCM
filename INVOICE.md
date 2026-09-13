# RBCCM Invoicing — Reference & Template

This file is the canonical reference for invoicing GlueIQ / RBCCM. Future Claude sessions should read it before drafting an invoice or weekly summary so format, tone, and contacts stay consistent.

**Companion files (read both when drafting):**
- `INVOICE_LOG.md` — running weekly summaries, appended every Friday by the scheduled task
- `INVOICE_NOTES.md` — chat-sourced ad-hoc context (PTO, travel, training, pivots) that file scans can't see

**Standing instruction for ALL future Claude sessions:** if Justin mentions anything in chat that affects an upcoming RBCCM invoice — PTO/time off, travel days, compliance or required training, project pivots, unusual hours, off-platform work, holidays — proactively append it to the **Active** section of `INVOICE_NOTES.md` with a date. Don't ask first; just do it and mention briefly that you logged it.

---

## Client

- **Client:** GlueIQ / RBC Capital Markets (RBCCM)
- **Primary contact:** David
- **Accounting:** Augusto / Payables
- **Rate:** $65/hr
- **Frequency target:** weekly summary appended to INVOICE_LOG.md; consolidate to a full invoice every 2–4 weeks
- **Workdays:** Mon–Fri, ~8 hrs/day baseline

---

## Project Folder Scan

The weekly scheduled task scans **every immediate subdirectory** of `~/Documents/Freelance/RBCCM/` for activity in the past 7 days. New component folders dropped into RBCCM/ are picked up automatically — no edits to this file needed.

Map each active folder to a project bucket below. If a folder name doesn't match any known bucket, use the folder name itself as the descriptor and add it as a new bucket here later.

---

## Email Sign-off Template

> Hey David,
>
> Here's a round-up covering work completed between {{START}} and {{END}}{{, including the associated short-notice Toronto travel costs for the in-person working sessions and stakeholder meetings — IF travel applies}}.
>
> Let me know if you have any questions or need anything further from me.
>
> Thanks,
> Justin

---

## Standups / Meetings Paragraph (preferred wording)

> Participated in regular standups, stakeholder check-ins, and in-person working sessions, with ongoing follow-ups throughout. Worked through open items, aligned on priorities, edits, and next steps, and helped keep initiatives moving through a combination of live collaboration, stakeholder discussions, and async coordination.

---

## Activities Bullet Style

- Keep bullets **bare and short** — no long trailing clauses.
- Lead with the project/component, follow with the action (refactor, build, QA, implementation).
- Avoid "small fix" / "minor edit" / "ticket" language. Prefer "implementation," "refactor," "remediation," "build," "support."
- Always open with: `Activities included (but were not limited to):`

**Good examples:**
- Featured Conferences component refactor and Insights tab restructure
- Conference Hub content updates
- RBC Imagine Phase 2 "Load More" Insights implementation
- Transaction page filter-by-year build
- New slick carousel applied to rbccm.com priority pages
- Accessibility Team Carousel QA and remediation
- Navigation menu hover interaction reimplementation
- Continued component/platform refactoring supporting dynamic page builds
- Required RBC compliance training modules

---

## Project Buckets (common categories)

- **Conference Pages** — Conference Hub, landing pages, components, speaker/agenda modules, registration CTAs, Featured Conferences component
- **Outlook** — Outlook 2026, content updates, launch support
- **European Insights** — implementation, QA, approvals, launch
- **RBC Imagine** — Phase 1 / Phase 2, component rebuilds, "Load More" Insights, page refinements
- **Global Investment Banking** — Leadership Profiles, "Our Team," slider/carousel, secondary nav
- **Transaction Pages** — filter logic, year filter, search improvements, UX refinements
- **Navigation** — secondary nav, hover states, mega menu, rebuilds
- **Accessibility** — keyboard nav, focus order, contrast, ARIA, carousel a11y, button labeling, WCAG remediation
- **Component Refactoring** — statistics ticker, team slider, hero variants, carousel modernization, shared components
- **Carousel Work** — slick migration, controls, indicators, touch, a11y
- **Strategic Alternatives** — Load More, CTA updates, universal fixes, Hedge Fund, article updates
- **In The Media** — script updates, content, link fixes
- **Podcasts** — banner placement, podcast tiles, component variations
- **Articles** — story pages, dynamic content, transcript automation, related articles
- **Homepage** — fixes, updates
- **Compliance Training** — RBC required modules (Market Data, Annual Compliance, MNPI, Anti-Bribery, AML, Privacy & Security, Code of Conduct) — billable at 4 hrs/module set when due

---

## Hours Math

- Baseline week: **5 days × 8 hrs = 40 hrs**
- Typical split for embedded contractor:
  - Dev & Implementation: ~85%
  - Meetings / Collaboration: ~12%
  - Other (training, travel days, etc.): ~3%
- Always state PTO / non-working days when noting hours; subtract from the period total before splitting.

**Example 4-week period (1 week off):**
- 3 full weeks × 40 = 120
- Compliance training = 4
- Total: 124 hrs → $8,060

---

## Tone

Professional. Technical. Enterprise. Confident. Use "including but not limited to" to avoid itemizing every task.

Avoid: small bug fixes, minor edits, ticket work.
Prefer: development, implementation, platform evolution, shared components, architecture, reusable systems, enterprise-scale front-end work.

---

## Travel (when applicable)

**Last-Minute Toronto Trip:**

> Short-notice travel required for in-person stakeholder meetings, working sessions, and project coordination in Toronto. Expenses reflect expedited travel booking, airfare, lodging, and associated ground transportation costs. PDF included.

---

## Invoice Line Items (typical structure)

1. **Asana Tasks, Mailbox & Component Updates** — main development hours, list activity bullets in description
2. **Standups, Brainstorms & Check-ins** — meetings/collaboration hours, use the standard paragraph
3. **(Optional) Toronto Travel** — flat expense reimbursement with PDF attachment
