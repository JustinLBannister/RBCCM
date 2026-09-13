# RBCCM Weekly Invoice Log

A running log of weekly activity summaries — appended automatically every Friday at 2pm by the `rbccm-weekly-invoice-draft` scheduled task.

When it's time to send a full invoice, consolidate the most recent unbilled entries into the email format defined in `INVOICE.md`.

**Status legend:**
- `unbilled` — not yet sent
- `billed YYYY-MM-DD` — included in an invoice sent on that date

---

<!-- Newest entries appended below. Format:

## Week ending YYYY-MM-DD (Mon DD – Mon DD)
**Status:** unbilled
**Hours estimate:** XX (dev XX + meetings XX)
**PTO/non-working days:** none | dates

**Activities:**
- Bullet 1
- Bullet 2

**Notes:**
- Anything noteworthy (Toronto travel, compliance training, partial week, etc.)

---
-->

## Period: 2026-05-23 – 2026-06-26 (5 weeks, 1 week PTO)
**Status:** billed 2026-06-27
**Hours:** 165 (dev 145 + meetings 20) — compliance training rolled into dev
**Total:** $10,725 @ $65/hr
**PTO/non-working days:** Jun 15 – Jun 19 (1 full week)

**Activities (as sent):**
- Featured Conferences component refactor and Insights tab restructure
- Conference Hub content updates
- RBC Imagine Phase 2 "Load More" Insights implementation
- Transaction page filter-by-year build
- New slick carousel applied to rbccm.com priority pages
- Accessibility Team Carousel QA and remediation
- Navigation menu hover interaction reimplementation
- Continued component/platform refactoring supporting dynamic page builds
- Required RBC compliance training modules (Market Data, Annual Compliance, MNPI, Anti-Bribery, AML, Privacy & Security, Code of Conduct)

**Notes:**
- No Toronto travel this period
- 4 hrs compliance training rolled into the dev line, not broken out separately
- First period sent under the new weekly-cadence workflow — this entry is a consolidated backfill; future entries will be one-per-week as the Friday task runs

---

## Period: 2026-06-29 – 2026-07-10 (2 weeks, 2 PTO days)
**Status:** billed 2026-07-13 (invoice #72)
**Hours estimate:** ~64 (dev ~56 + meetings ~8)
**Total:** $4,160 @ $65/hr
**PTO/non-working days:** Jul 03 (US Independence Day observed), Jul 07 (World Cup)

**Activities:**
- Conference Insights filter, hero, and tiles component builds
- Conference Insights tiles feed — manual whitelist escape hatch and second-pass loop
- Featured Conferences component refactor, homepage variants, and updates
- Filter-by component build and refinements
- Past Speakers & Attendees component updates
- Story Tiles shared component updates
- Secondary Nav component build (XSL, CSS, JS, Datums)
- Leadership carousel Datum work and TeamSite iteration
- Insights JSON Builder updates
- Local test fixtures for feed parser QA

**Notes:**
- 2 PTO days (Jul 03, US Independence Day observed; Jul 07, World Cup) — two 4-day weeks
- No Toronto travel this period
- Consolidated from the weekly entries for Jun 29 – Jul 03 and Jul 06 – Jul 10

---

## Week ending 2026-07-17 (Jul 13 – Jul 17)
**Status:** billed 2026-08-03
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Insights JSON Builder — live fetch fallback, local-first hardcoded feeds, BRD reference expansion
- Insights Listing skin — baseline save + collapse-to-one-anchor fix on KO section
- Structured Data (JSON-LD) component build
- Filter-by component — scroll-to-top on pagination + drawer close, URL param sync (filter + pagination state), scroll target consolidation, scrollIntoView / window.scrollTo iteration, focus-clobber fix, dropdown defensive Clear reset
- Icon Carousel component — build bootstrap (XSL, CSS, properties)
- Mobile Search page CSS/JS fixes
- Deal filter / Deals updates

---

## Week ending 2026-07-24 (Jul 20 – Jul 24)
**Status:** billed 2026-08-03
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Leadership/Team slider CMS prototype and hardcoded European + GIB variants
- Conference Insights tiles feed and styling updates
- Filter-by component refinements
- MAAS/MATA page build — JSON bind, CMS, and page templates
- Change a Life tiles component build

---

## Week ending 2026-07-31 (Jul 27 – Jul 31)
**Status:** billed 2026-08-03
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Icon Carousel component build (XSL, CSS, HTML, properties)
- Story Carousel component build and TeamSite iteration
- MAAS/MATA page JSON bind, CMS, and template refinements
- Leadership/Team slider hardcoded European and GIB variant updates
- Continued shared component refactoring supporting dynamic page builds

---

## Week ending 2026-08-07 (Aug 03 – Aug 07)
**Status:** unbilled
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Case Studies Carousel component build (XSL, CSS, JS, properties, TeamSite variant)
- How We Think component build (XSL, CSS, JS, properties)
- Story Tiles — Featured component build with featured + 3-up layout and variants
- New Tiles content card redesign exploration (podcast picker, meta row, tag chips)
- Leadership/Team slider carousel XSL iteration
- Continued shared component refactoring supporting dynamic page builds

---

## Week ending 2026-08-14 (Aug 10 – Aug 14)
**Status:** unbilled
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Case Studies Carousel component — feed XSL, JS, CSS, and properties build
- How We Think component — feed integration, XSL, JS, and CSS build
- New Tiles content card — TeamSite XSL variant and layout build
- Insights JSON Builder — article visualizer and 2026 feed data updates
- Leadership/Team slider — GIB bio panel and carousel XSL/CSS iteration
- Continued shared component refactoring supporting dynamic page builds

---

## Week ending 2026-08-21 (Aug 17 – Aug 21)
**Status:** unbilled
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- MAAS/MATA page — JSON bind, CMS, XSL, JS, and CSS build with dev runbook
- MAAS/MATA preview generator — hosted preview build and deploy configuration
- How We Think component — XSL, CSS, and properties build
- Insights JSON Builder — article visualizer build
- Continued shared component refactoring supporting dynamic page builds

---

## Week ending 2026-08-28 (Aug 24 – Aug 28)
**Status:** unbilled
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- MAAS/MATA page — Structured Data (JSON-LD) entities, CMS, XSL, JS, and CSS build
- MAAS/MATA page — properties config and shared asset integration
- Leadership/Team slider — GIB carousel XSL, JS, and CSS iteration
- CSS audit tool build supporting component QA
- Continued shared component refactoring supporting dynamic page builds

---

## Week ending 2026-09-04 (Aug 31 – Sep 04)
**Status:** unbilled
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Leadership/Team slider — GIB carousel XSL, JS, and CSS iteration
- Filtered Content shared component — consolidated filter engine, tiles feed, and styling build
- MAAS/MATA page — JSON bind, CMS, XSL, JS, and CSS refinements
- CTA Band component build (XSL, CSS, HTML, properties)
- Tabbed Panels component build (HTML, CSS)
- In The Media redesign — shared filter component integration and concept mock
- Continued shared component refactoring supporting dynamic page builds

---

## Week ending 2026-09-11 (Sep 07 – Sep 11)
**Status:** unbilled
**Hours estimate:** ~40 (dev ~34 + meetings ~6)
**PTO/non-working days:** none

**Activities:**
- Accordions component build (XSL, JS, CSS, properties)
- Hero component build — sample DCR, XSL, JS, properties, and styling
- CTA Band and Tabbed Panels component builds (XSL, JS, CSS, properties)
- Expertise, Leading Experts, and Platforms component builds with profile and tile assets
- In The Media redesign — component build (XSL, JS, CSS, properties) and poster asset
- MAAS/MATA page — JSON bind, CMS, XSL, JS, and CSS refresh
- Featured Conferences and How We Think components deprecated and consolidated into shared components
- Continued shared component refactoring supporting dynamic page builds

---
