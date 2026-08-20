# MAAS+MATA Workflow

Dev runbook: how the page renders, how marketing edits copy, and how we ship changes.

## Overview

The MAAS+MATA page is rendered server-side by TeamSite from an XSL component skin and its Properties/Datums. On top of that, a small JavaScript runtime (`rbccm-json-bind.js`) can optionally fetch a JSON file at page load and rebind any element on the page from that JSON. That JSON is what marketing edits in a standalone HTML CMS.

Two publish paths exist:

- **Live URL** (default): XSL renders from TeamSite Datums. JSON is never fetched. Editors cannot change live copy without a dev push.
- **Preview URL** (`?preview=draft`): Same XSL render, but on page load the runtime fetches `/assets/rbccm/js/pages/data/maas-mata.json` and rebinds every element that carries a `data-json` attribute. Marketing uses this URL to review copy changes before we promote them.

Net effect: marketing can iterate copy on their own; dev only touches the page when layout, CSS, JS, or component structure changes.

## URLs

- **Live:** <https://www.rbccm.com/en/expertise/global-markets/electronic-trading/multi-asset-agency-solutions>
- **Preview:** <https://www.rbccm.com/en/expertise/global-markets/electronic-trading/multi-asset-agency-solutions?preview=draft>

Preview is opt-in per URL — no cookie, no header, no auth. Add `?preview=draft` to any visit and JSON is applied on top of XSL. Remove the flag and the page reverts to Datum defaults on next load.

## File Layout

| File | Where it lives |
|---|---|
| `MAAS MATA.component` | TeamSite component template at `//strplvact10001.fg.rbc.com/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Site Template/MAAS MATA.component` (component ID `1786807660057`). Currently one bulk editor block containing both the XSL skin and the Properties/Datums — will be split into per-section components later when other pages reuse the same building blocks. |
| `maas-mata.xsl` (in bulk) | The XSL portion of the `.component` file above. Renders the page markup from Datums. |
| `maas-mata-properties.xml` (in bulk) | The Properties/Datums portion of the same `.component` file. Default copy (fallbacks) that render if JSON is not applied. |
| `maas-mata.css` | `/assets/rbccm/css/pages/maas-mata.css` |
| `maas-mata.js` | `/assets/rbccm/js/pages/maas-mata.js` |
| `rbccm-json-bind.js` | `/assets/rbccm/js/pages/rbccm-json-bind.js` (shared runtime — reusable across future pages) |
| `maas-mata.json` | `/assets/rbccm/js/pages/data/maas-mata.json` (marketing-editable content; only fetched when `?preview=draft` is on the URL) |
| `preview-generator.html` | `/assets/rbccm/tools/preview-generator.html` — internal-only. Standalone HTML file; marketing loads it directly in a browser to draft and export JSON. Local source file is named `maas-mata-cms.html`; deploys as `preview-generator.html`. |

All `/assets/rbccm/…` paths are the RBCCM production server. Update via the standard TeamSite upload path.

### Where to host the CMS

The CMS is a single, self-contained HTML file — no build, no server-side code, no login. It writes drafts to browser localStorage and exports JSON on demand. Deployed location:

- <https://www.rbccm.com/assets/rbccm/tools/preview-generator.html> (gated by internal network / VPN). Marketing bookmarks this URL and uses it directly.
- Local source file is named `maas-mata-cms.html` — deploys as `preview-generator.html`.

The CMS knows nothing about the live site — it only produces JSON. Safe to host internally without exposing anything sensitive.

## Marketing Workflow

This is what marketing does. It does not touch the live site.

1. Open <https://www.rbccm.com/assets/rbccm/tools/preview-generator.html>. On first load it seeds with the current production copy (SAMPLE seed).
2. Edit any field. Every input shows a "Figma:" reference so the editor knows exactly which element on the page it maps to. State auto-saves to localStorage — reloading does not lose work.
3. Click **Export draft → download**. A modal collects editor name + note (audit trail), then downloads a file named `maas-mata-draft_YYYY-MM-DD-HHMM_<editor>.json`.
4. Send the JSON to dev (email, ticket, ping — however the team wants).

The CMS also has a **Load JSON** button. Editors can paste an existing exported JSON back in to continue editing where they left off (or to load a version dev has already deployed).

## Dev Workflow — Publishing Copy Changes

When marketing sends over a `maas-mata-draft_*.json` file:

1. Rename the file to `maas-mata.json`.
2. Upload to `/assets/rbccm/js/pages/data/maas-mata.json` (overwrite the existing file).
3. Verify at the preview URL: <https://www.rbccm.com/en/expertise/global-markets/electronic-trading/multi-asset-agency-solutions?preview=draft>
4. Hard-reload (Cmd+Shift+R). Confirm the edits appear. The live URL (without `?preview=draft`) is untouched.
5. When approved by stakeholder, the same file already lives at the JSON path — nothing else to do. There is no separate "promote to live" step because live and preview both read the same JSON path; only the URL flag decides whether the runtime fetches it.

**Rollback:** keep the previous `maas-mata.json` as `maas-mata.YYYY-MM-DD.json` alongside. To roll back, rename the backup over the current file.

## Dev Workflow — Updating the Component

When the layout, CSS, or JS needs to change (i.e. anything not editable via JSON):

### Layout / markup

- Edit `MAAS MATA.component` at `//strplvact10001.fg.rbc.com/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Site Template/` — currently one bulk editor block that contains the XSL skin and the Properties/Datums together. Future plan: break into per-section components (hero, awards, platforms, etc.) once other pages reuse the same blocks. Until then, all edits happen in the single `.component` file.
- Structural fallbacks live inside the XSL — the copy in the fallback cards is what renders on the live URL if JSON is not applied. Keep it representative.
- When adding a new editable element, add a `data-json="path"` attribute to it (see attribute reference below), and add the same path to the CMS SAMPLE seed + SCHEMA so marketing can edit it.

### CSS

- Edit `maas-mata.css` and upload to `/assets/rbccm/css/pages/maas-mata.css`.
- The `unified.css` / `unified2.css` page shell wins by specificity in many places — defensive rules in the file use `!important` where necessary.

### JS behaviours

- Edit `maas-mata.js` (video modal, animate.css triggers, carousels, chart ticker, JSON-bind bootstrap) and upload to `/assets/rbccm/js/pages/maas-mata.js`.
- The bind runtime itself lives in `rbccm-json-bind.js` and is generic — do not edit it for page-specific tweaks. Page-specific post-bind touch-ups go in the `onRendered` callback in `maas-mata.js`.

### Cache-busting

Handled automatically by an `AssetVersion` Datum in the Properties block. The XSL reads that value and appends `?v={value}` to every `<link>` and `<script>` URL for `maas-mata.css`, `maas-mata.js`, and `rbccm-json-bind.js`.

**When you deploy a new CSS or JS file, edit the `AssetVersion` Datum** in the TeamSite Properties editor and re-save the component. No XSL edit needed. Browsers and the CDN treat all three script/stylesheet URLs as new files on the next page load; between deploys, everything caches normally.

**Format:** `YYYY-MM-DD-HHMM` (24-hour). Example: `2026-08-20-1400`. Sorts chronologically, unique per minute. Any short unique string works (semver, git sha) but the date format keeps history readable at a glance in the Datum editor.

## How JSON Binds Work (Attribute Reference)

Every editable element on the page carries a `data-json*` attribute that tells the runtime where to pull its content from in the JSON. When the page loads with `?preview=draft`, the runtime walks the DOM under `#rbccm-mm-page`, reads each attribute, and sets the corresponding text / attribute / list.

| Attribute | What it does |
|---|---|
| `data-json="path"` | Sets `textContent` from JSON at `path`. Empty string (`""`) binds to the current scope value (used inside lists of primitives). |
| `data-json-html="path"` | Sets `innerHTML` — use for body copy that may include `<em>`, `<br>`, links, etc. |
| `data-json-attr-<name>="path"` | Sets any attribute. Common uses: `data-json-attr-href="cta.href"`, `data-json-attr-src="image"`, `data-json-attr-alt="alt"`, `data-json-attr-data-theme="theme"`. |
| `data-json-list="path"` | Renders an array. The first element child (or `<template>`) is cloned once per array item; nested `data-json` paths inside resolve against each item. |
| `data-json-list-fallback` | (optional) Marks a fallback child that will be removed when the list binds. Not required — the runtime auto-strips non-template children. |
| `data-json-if="path"` | Hides the element if the value is falsy. |

### List binding — how repeaters work

A container marked with `data-json-list="path.to.array"` has one of two setups:

- An explicit `<template>` child. The runtime clones the template once per JSON item and binds each clone.
- No `<template>`, only fallback children (the XSL default cards). The runtime promotes the **first** fallback child to be the implicit template, strips all fallback children, and clones the promoted template once per JSON item.

Practical consequence: the **first** fallback card in each list section must carry the `data-json="…"` hooks. Subsequent fallback cards do not need them — they are removed when the JSON binds. In the current XSL, this is the pattern used for `platforms`, `innovationEra`, `mataCapabilities`, and `marketInsights`.

### Post-bind touch-ups

For things `data-json` cannot express directly (e.g. swapping a BEM modifier class based on a JSON value), use the `onRendered` callback exposed by `RBCCMBind.load({...})`. See the current implementation in `maas-mata.js` for the platform card theme swap.

## Troubleshooting

### Preview URL still shows old copy

- Hard-reload (Cmd+Shift+R).
- Confirm the JSON at `/assets/rbccm/js/pages/data/maas-mata.json` actually contains the new edits (open it in a browser tab).
- Check DevTools → Network. Look for `maas-mata.json` — is it 200 OK? What size? If it is the old file size, CDN cache is stale.

### Warnings in the console like "no `<template>` child"

- You are running an old `rbccm-json-bind.js`. The current runtime auto-promotes the first fallback child to a template. Re-upload the runtime and bump `$ASSET_VERSION` in the XSL.

### A section renders empty when `?preview=draft` is on

- The JSON provided the wrong shape (e.g. a string instead of an array of objects). Check the field in question against the CMS SCHEMA. Ask the editor to re-export from the CMS — its schema enforces correct shapes.

### Live URL (no `?preview=draft`) shows draft content

- It should not. If it does, either (a) the URL still has the query string somewhere (Chrome autocomplete adds it back), or (b) the deployed `maas-mata.js` is the pre-gate version. Confirm the current file has `isPreview = /\?preview=draft/ …` early return.

### Play button is missing on the chart image

- Fill in the three Brightcove chart Datums (Account ID, Player ID, Video ID) in `maas-mata-properties.xml`. The XSL used to guard the button, but the current version always renders it — the modal iframe just has no src when the Datums are empty.

## Accessibility

Status as of 2026-08-20: **real violations fixed, structural work paused pending a11y team's next review.**

### What was flagged (from the audit CSV)

The audit surfaced items in three buckets:

**Real violations (fixed).** Two colour-contrast failures against WCAG 2.1 AA (1.4.3):

- `.rbccm-maas-mata__featured-cta-read` — "2 min read" label on the market-insights card. Colour was `--grey-500` (#8A8F97) on white, roughly 3.2:1. Changed to `--grey-700` (#4A4E55), roughly 8:1. Passes AA with headroom.
- `.rbccm-maas-mata__newsletter-linkedin` — "Autofill with LinkedIn" button. Background was LinkedIn brand blue (#0A66C2), 4.55:1 against white — technically AA-passing but marginal, and axe flagged it as serious. Darkened to #075D9F (roughly 5.4:1). Hover state matches at #054A80.

Both fixes shipped in the current `maas-mata.css`. No further action needed on these.

**False positives ("Needs Review" contrast flags).** Every remaining contrast flag in the report is on light text over the dark-strip background inside a `data-animate` element. Axe throws "Needs Review" — not "Violation" — because it cannot compute contrast on elements that are mid-animation, at `opacity: 0` during the fade-in state, or sit above a gradient background. Real rendered contrast on all of these is 8:1 or better (white / light grey on navy — standard high-contrast pattern). Safe to mark reviewed and compliant on the report.

**Structural best-practice flags (moderate).** Two categories, not blocking any WCAG level but worth cleaning up:

- **Heading order.** Section eyebrows use `<h5>`, `<h6>`, and `<h4>` tags as visual accents. Combined with the real section headings (`<h2>`), this trips the "headings should descend sequentially" check. Also: the hero eyebrow is currently an `<h1>`, and the hero title is a `<p>`. The real page H1 should be the hero title.
- **Landmarks.** The component root is a `<div>`, so the chart-image div and the Market Insights section content sit outside any landmark. Wrapping the whole component in `<main>` would satisfy the check.

**Page-shell items (still to do, not part of the MAAS+MATA component).** These are in TeamSite's global header/meta and need coordination — likely with Joon and the TeamSite team — but they do need to get done:

- `meta[name="viewport"]` has `maximum-scale=1.0` — blocks user zoom (WCAG 1.4.4). Fix: strip `maximum-scale=1.0` (and `user-scalable=no` if present) from the viewport meta in the page shell.
- `.search-toggle` ARIA warning — the search button in the topnav. Fix on the shell side.

**Note on the heading-tag choices.** The current heading levels (`<h1>` on hero eyebrow, `<h5>` / `<h6>` / `<h4>` on section eyebrows) were picked to satisfy the SEO doc's tag guidance — one `<h1>` per page, section headings descend from that. The a11y "heading order" flag comes from screen-reader convention (headings should descend sequentially without skipping levels), which is a different lens. These two goals partly conflict. Options for the a11y pass:

- **Keep the SEO-driven tags as-is** and accept the a11y best-practice flag. WCAG doesn't strictly require sequential descent — it's a best-practice, not an AA violation.
- **Swap eyebrows to `<p>`** and move the `<h1>` to the hero title (most a11y-standard approach). Reduces one signal SEO expects from the eyebrow line but keeps a real H1 on the page.
- **Hybrid** — keep the hero H1 on the title (not the eyebrow), and turn only the section-level eyebrows into `<p>` while leaving the section headings as `<h2>` / `<h3>` as they are today.

Whichever way we go, we should confirm with both the SEO owner and the a11y team so the choice is documented.

### What we started, then paused

We began the structural fixes and pulled back before shipping so the a11y team could weigh in:

- Wrapped the component root in `<main>` (was `<div>`) — reverted.
- Swapped the hero eyebrow from `<h1>` to `<p>`, and the hero title from `<p>` to `<h1>` — reverted.
- Swapped all section eyebrows from `<h5>` / `<h6>` / `<h4>` to `<p>` with the same class — reverted.
- Dropped tag prefixes from the CSS selectors (`h5.__eyebrow` → `.__eyebrow`) so styling stayed intact through the tag swap — reverted.

None of these changes were deployed. The XSL and CSS are back at pre-a11y state. The changes are known-good — parses clean, XSL and CSS have been validated — so we can re-apply the pass quickly when we decide to proceed.

### What to do next

Open TODOs, roughly in priority:

1. **Heading-tag decision.** Confirm with the SEO owner + a11y team which of the three heading-tag options above we should adopt. Once we pick, re-apply the changes — the pattern is worked out (eyebrows → `<p>`, hero title → `<h1>`, CSS selectors drop the tag prefix). Estimated 20 minutes of work; blocked on the call.
2. **Wrap component in `<main>`.** Swap the root `<div class="rbccm-maas-mata">` to `<main class="rbccm-maas-mata">`. Purely additive; no design impact. Clears the "all page content contained by landmarks" flag.
3. **Canonical URL.** Add a `<link rel="canonical" href="…">` for the MAAS+MATA page. If TeamSite doesn't already inject one on the page shell, add it from the XSL. Values: EN → the live URL; FR (when it lands) → the FR URL. Also add `<link rel="alternate" hreflang="…">` for both.
4. **Viewport meta — strip `maximum-scale=1.0`** (and `user-scalable=no` if present). Lives in the TeamSite page shell — need to coordinate with Joon / the shell team. WCAG 1.4.4 fix.
5. **`.search-toggle` ARIA warning.** Search button in the topnav. Also page-shell, same coordination as above.
6. **Mark the "Needs Review" contrast flags reviewed** on the a11y report with a note: "Light-on-navy dark-strip pattern; axe cannot measure through fade-in state or gradient background. Visual contrast >= 8:1."

## Who Owns What

- **Marketing owns:** Copy in `maas-mata.json` (via the CMS). Draft, export, hand off.
- **Dev owns:** The XSL skin, sidecar CSS, sidecar JS, the `rbccm-json-bind` runtime, Datums (fallback copy), and uploading marketing's JSON exports.
- **Both:** The CMS schema. When dev adds a new editable field to the XSL, both sides update the CMS at the same time (SAMPLE + SCHEMA) so the field surfaces in the editor.

---

*Questions or updates to this doc — ping Justin.*
