# MAAS+MATA Workflow

How the page works, how marketing edits copy, and how dev ships changes.

## The Big Idea

The MAAS+MATA page has two layers:

1. **The page itself** — layout, styling, interactivity. Dev owns this.
2. **The copy on the page** — headlines, body text, awards, links. Marketing drafts changes in a simple web form (the CMS) and hands the result to dev.

**Two-step publishing.** Marketing's exported file gets dropped on the server for a **preview URL** first, so stakeholders can see the changes in context. When approved, dev copies those approved values into TeamSite's Datums (the actual source of the live page) and publishes the component. The preview file is for iteration and review; the Datums are what live readers see.

## Two URLs

- **Live page** — <https://www.rbccm.com/en/expertise/global-markets/electronic-trading/multi-asset-agency-solutions>
- **Preview page** — same URL with `?preview=draft` on the end.

The preview URL shows the latest draft copy that marketing is working on (loaded from a JSON file dev keeps in sync). The live URL always shows the current published version (loaded from TeamSite Datums). The two are independent — pushing a new draft to preview never touches live. Live is only updated when dev copies approved values into the Datums and publishes the component.

## Marketing Workflow

Marketing updates copy through a web form (the CMS) and hands the result to dev. No code, no TeamSite login needed.

### Making an update

1. Open <https://www.rbccm.com/assets/rbccm/tools/preview-generator.html>. The form opens with the current page copy already filled in.
2. Change whatever needs changing — headlines, body text, awards, links, whatever. Every field shows a "Figma:" hint so you know which part of the page it controls.
3. Edits save automatically as you type. You can close the tab and come back later without losing anything.
4. When you're ready to hand it over, click **Export draft → download**. It'll ask for your name and a short note (so dev knows who sent it and why), then save a file to your computer.
5. Send that file to dev — email, ticket, ping, whatever the team prefers.

### Previewing before it goes live

Once dev uploads your file, visit the live page URL with `?preview=draft` on the end. You'll see the edits applied. Nobody else does — the preview flag is only visible to whoever adds it to the URL.

When the copy looks right and stakeholders approve, tell dev to promote it. No re-export needed on your side.

### Making more changes to the same draft

If you want to keep editing a draft you already sent, open the CMS and click **Load JSON**, then paste in the file you exported. It picks up where you left off. Export again when done and hand the new file to dev.

### Rules of thumb

- **Big copy changes:** update in the CMS, don't ask dev to hand-edit — that way it stays in the JSON and won't get overwritten next time.
- **Small typo fixes:** same thing. Once dev has to hand-edit, the CMS gets out of sync.
- **New sections or new fields:** those need dev involvement (they change the page structure). Ask, and we'll add the field so you can edit it in the CMS afterward.
- **Images:** upload the image file to dev separately. In the CMS, put the image path (e.g. `/assets/rbccm/images/…/whatever.png`) into the relevant field.

## For Dev

### To publish new copy from marketing

Two steps: first get it on preview so stakeholders can review, then promote to live.

**Step 1 — Preview.** Marketing sends a file named something like `maas-mata-draft_2026-08-20-1400_kim.json`.

1. Rename it to `maas-mata.json`.
2. Upload to `/assets/rbccm/js/pages/data/maas-mata.json` (overwrite what's there).
3. Open the preview URL (`?preview=draft`), hard-reload, confirm the edits look right.

At this point the live URL is still showing the old copy. Only people who visit with `?preview=draft` see the new version.

**Step 2 — Promote to live.** Once stakeholders approve:

1. Open the `MAAS MATA.component` in TeamSite.
2. Update the Datums in the Properties block to match the approved values from the JSON.
3. Publish the component through the normal TeamSite workflow.
4. The live URL now shows the new copy.

**Why two steps?** The live page only reads the Datums — it never fetches the JSON. The JSON is what powers the preview URL so marketing can iterate quickly without pushing changes to production. Promotion to live is the deliberate act of copying the approved values into Datums.

**Shortcut for text-heavy updates:** if the update is dozens of field edits, easier to update the Datums by hand than transcribe from the JSON. Open the CMS with the approved JSON loaded (paste it via **Load JSON**), then use it as a side-by-side reference while editing Datums in TeamSite.

**Rollback (preview only):** keep the previous JSON around as `maas-mata.2026-08-15.json`. To revert the preview view, rename the backup over the current file. To revert live, restore the previous Datum values in TeamSite.

### To change layout, styling, or behavior

| Task | File | Where it lives |
|---|---|---|
| Change page structure or copy defaults | `MAAS MATA.component` | TeamSite: `//strplvact10001.fg.rbc.com/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Site Template/MAAS MATA.component` (component ID `1786807660057`). Currently one bulk block containing both the XSL skin and the Properties. Will split into per-section pieces later once other pages reuse them. |
| Change styling | `maas-mata.css` | `/assets/rbccm/css/pages/maas-mata.css` |
| Change page behavior (modals, carousels, scroll effects) | `maas-mata.js` | `/assets/rbccm/js/pages/maas-mata.js` |
| Change how JSON binding itself works | `rbccm-json-bind.js` | `/assets/rbccm/js/pages/rbccm-json-bind.js`. This is the shared engine that swaps text and images from the JSON file into the page. Only touch this if you're changing how binding works for **every** page that uses it. For anything MAAS+MATA-specific, edit `maas-mata.js` instead. |

After a CSS or JS upload, **bump the `AssetVersion` Datum** in the Properties block (format: `YYYY-MM-DD-HHMM`, e.g. `2026-08-20-1400`). The XSL appends this to every stylesheet and script URL as `?v=…`, so browsers see it as a new file and fetch a fresh copy. Without the bump, the CDN can serve the old file for hours.

To add a new editable field: put a `data-json="path.to.value"` attribute on the element in the XSL, then add the same field to the CMS's SAMPLE seed and SCHEMA so it appears in the editor.

### Animations

Entrance fades use animate.css. The CDN link is in the XSL, and the four keyframes we use (`fadeIn`, `fadeInUp`, `fadeInDown`, `zoomIn`) are also copied into the local CSS as a fallback in case the CDN is blocked.

Elements opt in by adding `data-animate="fadeInUp"` (fires on scroll into view) or `data-animate-hero="fadeInUp"` (fires on load). Timing is set via `data-animate-delay` in milliseconds.

Users can turn animations off two ways: their OS's "reduce motion" setting is respected, and adding `?noanim=1` to any URL skips them for that visit.

One thing to know: animations sometimes don't fire on RBC corporate laptops or VDI sessions. Cause isn't fully pinned down (likely corp browser policy or GPU restrictions). Content still shows either way — you just don't see the fade-in. If a user reports this, have them try `?noanim=1` first to confirm they at least see the page.

### Attribute reference for JSON binding

When the page loads with `?preview=draft`, the runtime looks for these attributes on elements under `#rbccm-mm-page`:

| Attribute | What it does |
|---|---|
| `data-json="path"` | Sets the element's text from the JSON at `path`. |
| `data-json-html="path"` | Same as above but sets HTML — use for copy that may include `<em>`, `<br>`, links. |
| `data-json-attr-<name>="path"` | Sets any attribute. Common uses: `data-json-attr-href` for links, `data-json-attr-src` for images. |
| `data-json-list="path"` | For repeaters (award cards, insight cards, feature blocks). Clones the first child card once per item in the array. |
| `data-json-if="path"` | Hides the element if the value is empty/falsy. |

For repeaters, the **first** card in the list needs the inner `data-json` attributes — that's the one the runtime clones. Other cards get thrown away when JSON binds. If you need to swap a class based on a JSON value (like the platform card's dark/light theme), use the `onRendered` callback in `maas-mata.js` — there's an example in the file.

## Troubleshooting

**Preview URL isn't showing the new copy.**
Hard-reload with Cmd+Shift+R. If that doesn't help, open the JSON file in a browser tab and confirm it actually contains the edits. If it does, check DevTools → Network for `maas-mata.json` — a stale file size means the CDN is serving an old copy; bump `AssetVersion` in the Properties.

**Console warning: "no `<template>` child".**
The deployed `rbccm-json-bind.js` is the old version. Re-upload it and bump `AssetVersion`.

**A section renders empty on preview.**
The JSON has the wrong shape for that section (usually a plain string where the runtime wanted a list of objects). Ask marketing to re-export from the CMS — the form enforces the right structure automatically.

**Live URL is showing draft content when it shouldn't.**
Check the URL bar carefully — Chrome autocomplete loves to re-append `?preview=draft`. If it's really not there, the deployed `maas-mata.js` is missing the preview flag check. Re-upload it.

**Play button isn't showing on the chart image.**
Fill in the three Brightcove Datums (Account ID, Player ID, Video ID) in the Properties block. The button always renders now — but without those values the modal opens to an empty player.

## Accessibility

Two real issues from the last audit were fixed and shipped:

- The "2 min read" label on Market Insights cards was too light against white. Now it's a darker grey.
- The "Autofill with LinkedIn" button used LinkedIn's brand blue, which was borderline against white text. Now it's a slightly darker blue.

Everything else in the audit is either a false positive (the scanner can't measure contrast on elements that fade in from invisible) or is structural — heading tag levels and a `<main>` landmark. Those are TODOs, not shipped.

### Heading tags — SEO vs. accessibility

Right now the page uses `<h1>` on the hero eyebrow and `<h5>`/`<h6>`/`<h4>` on section eyebrows. This was chosen to match the SEO guidance (one `<h1>` per page, section headings under it). The accessibility scanner wants headings to descend sequentially (h1 → h2 → h3, no skipping), which conflicts with what SEO wants. We need to pick one:

- Leave the tags as they are. Accessibility will keep flagging it, but it's a best-practice note, not a WCAG failure.
- Change the eyebrows to regular paragraphs, and put the `<h1>` on the hero title instead. Clears the accessibility flag. SEO loses one heading it was counting on.
- Same as above, but only change the section eyebrows — keep the hero eyebrow structure alone. Middle ground; needs SEO to say if that trade-off is fine.

Need input from SEO and accessibility before we make the change. Once decided, let me know and I'll apply it.

### Other TODOs

- **Wrap the page in `<main>`.** One-line XSL change. Clears the "content should be in a landmark" flag.
- **Add a canonical URL** (`<link rel="canonical" href="…">`) and `<link rel="alternate" hreflang="…">` tags for EN + FR.
- **Viewport meta.** The page shell has `maximum-scale=1.0` which blocks user zoom (WCAG issue).
- **Search button ARIA warning** — also in top nav shell.
- **Mark the false-positive contrast flags reviewed** on the report with a short note explaining why (scanner can't measure through fade-in animation).

## Who Owns What

- **Marketing** — page copy, via the CMS.
- **Dev** — layout, styling, behaviour, the CMS itself, and uploading marketing's copy exports.
- **Both** — when dev adds a new editable field, the CMS needs to be updated to match so it shows up for marketing to fill in.

---

*Questions or changes — ping Justin.*
