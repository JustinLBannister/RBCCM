# Tabbed Panels

Consolidated tabs component. One XSL/CSS/JS bundle, four content-typed presets driven by a `Preset` Datum. Same pattern filtered-content uses — one shell, multiple preset variants that render entirely different content shapes.

The component owns the tab visuals (mobile-first accordion, desktop tab-strip with 3px black underline on active) and the panel show/hide behavior. The Preset selector picks the content shape — generic WYSIWYG, structured media contacts, how-we-think tiles/news/conferences, or nested conference-insights with sliders.

## Presets

| Preset | Shape | Datums | Consumers |
|---|---|---|---|
| **`generic`** *(default)* | Up to 4 tabs, WYSIWYG HTML per panel | `Tab{1..4}Label` / `Slug` / `Content` | Any page that needs "some tabs with pasted HTML" |
| **`media-contacts`** | 4 tabs, paste-in `__contact-card` grid per panel | Same as generic — author pastes documented HTML into `Tab{N}Content` | In the Media page's Media Contacts region |
| **`how-we-think`** | 3 fixed tabs (Insights / Newsroom / Conferences) with structured DCR content | `Hwt`-prefixed (see below) | Home page's How We Think section |
| **`conference-insights`** | 3 conferences (outer tabs) × Overview/Speakers/Insights (nested inner tabs), dark bg, Speakers + Insights sliders, Brightcove video facade | `Ci`-prefixed (~175 Datums) | Featured Conferences page |

---

## Files

- `tabbed-panels.css` — component styles + bundled media-contact card pattern. Self-contained, tokens scoped to `.rbccm-tabbed-panels`. Ships to `/assets/rbccm/css/components/tabbed-panels.css`.
- `tabbed-panels.js` — runtime (tab click, arrow-key nav, ARIA sync). Multi-instance safe, idempotent. Ships to `/assets/rbccm/js/components/tabbed-panels.js`.
- `tabbed-panels.xsl` — TeamSite skin. Emits the tablist markup from Datums, with sidecar CSS/JS `<link>`/`<script>` cache-busted via `?v={CacheVersion}`.
- `tabbed-panels-properties.xml` — Datums (4 tab slots + Placement/Alignment/Title/Lede + asset paths + CacheVersion).
- `tabbed-panels.html` — local preview showing all four variants side by side.

---

## Placement modes

**Standalone (default)** — paints its own section shell with responsive padding. Use as a top-level section on a page.

```html
<section class="rbccm-tabbed-panels">…</section>
```

**Compact + headless** — for consumers that already own the surrounding section (e.g. In the Media page where the H2 + lede sit outside the tabbed component). Drops the shell padding and hides the internal title/lede.

```html
<div class="rbccm-tabbed-panels rbccm-tabbed-panels--compact rbccm-tabbed-panels--headless">
  <div class="rbccm-tabbed-panels__tablist">…</div>
</div>
```

**Dark** — inverted color treatment. Yellow (`#FFC72C`) underline on active tab instead of black. Not currently consumed anywhere but wired for future use.

```html
<section class="rbccm-tabbed-panels rbccm-tabbed-panels--dark">…</section>
```

---

## Modifiers

| Modifier | Effect |
|---|---|
| _(default)_ | Light background, full section shell padding, black underline on active tab, **title + lede center-aligned** |
| `--compact` | Drops the outer padding — component sits inline in a parent that owns its own vertical rhythm |
| `--headless` | Hides `.__title` and `.__lede` — use when the surrounding page already carries the H2 |
| `--dark` | Dark navy background, white text, yellow underline on active tab |
| `--title-left` | Left-aligns just the `.__title` |
| `--lede-left` | Left-aligns just the `.__lede` |
| `--align-left` | Shortcut: left-aligns both `.__title` and `.__lede` |

Modifiers stack — `--compact --headless` is the pattern for a page-owned heading; `--align-left` on top gets the whole intro block flush-left.

---

## HTML structure

Tabs **and** panels are children of the same `.__tablist` wrapper. This is required so the desktop grid layout can put tabs on row 1 and pin the active panel to row 2 spanning all columns. Putting panels outside the tablist collapses the grid.

```html
<section class="rbccm-tabbed-panels">
  <h2 class="rbccm-tabbed-panels__title">Section title</h2>
  <p class="rbccm-tabbed-panels__lede">Optional intro paragraph.</p>

  <div class="rbccm-tabbed-panels__tablist" role="group" aria-label="Section picker">

    <!-- Tabs (row 1 on desktop) -->
    <button type="button" class="rbccm-tabbed-panels__tab is-active"
            data-panel="alpha"
            aria-expanded="true"
            aria-controls="tp-panel-alpha"
            aria-label="Alpha, tab 1 of 3">
      Alpha
      <svg class="rbccm-tabbed-panels__tab-chevron" …>…</svg>
    </button>
    <button type="button" class="rbccm-tabbed-panels__tab"
            data-panel="beta"
            aria-expanded="false"
            aria-controls="tp-panel-beta"
            aria-label="Beta, tab 2 of 3">
      Beta
      <svg class="rbccm-tabbed-panels__tab-chevron" …>…</svg>
    </button>

    <!-- Panels (row 2 on desktop, all spanning full width) -->
    <div class="rbccm-tabbed-panels__panel is-active"
         id="tp-panel-alpha"
         data-panel="alpha"
         role="region" tabindex="0"
         aria-label="Alpha">
      <!-- BYO content -->
    </div>
    <div class="rbccm-tabbed-panels__panel"
         id="tp-panel-beta"
         data-panel="beta"
         role="region" tabindex="0"
         aria-label="Beta">
      <!-- BYO content -->
    </div>

  </div>
</section>
```

---

## Data contract

| Element | Attribute | Purpose |
|---|---|---|
| `.__tab` | `data-panel="<slug>"` | Links tab to its panel |
| `.__tab` | `aria-expanded="true\|false"` | Screen-reader state |
| `.__tab` | `aria-controls="<panel-id>"` | Points to the panel's id |
| `.__tab.is-active` | | Visual + JS active flag |
| `.__panel` | `id="<panel-id>"` | Target of `aria-controls` |
| `.__panel` | `data-panel="<slug>"` | Matches its tab |
| `.__panel` | `role="region" tabindex="0"` | Screen-reader landmark, keyboard focusable |
| `.__panel.is-active` | | Shown; others `display: none` |

JS pattern (one snippet handles all instances on the page):

```js
document.querySelectorAll('.rbccm-tabbed-panels').forEach(root => {
  root.querySelectorAll('.rbccm-tabbed-panels__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-panel');
      root.querySelectorAll('.rbccm-tabbed-panels__tab').forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-expanded', active ? 'true' : 'false');
      });
      root.querySelectorAll('.rbccm-tabbed-panels__panel').forEach(p => {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === target);
      });
    });
  });
});
```

Ships as `/assets/rbccm/js/components/tabbed-panels.js`.

---

## Consumers

| Page | Preset | Placement | Notes |
|---|---|---|---|
| In the Media - Media Contacts | `media-contacts` | `standalone` + `align-left` (or `on-ltblue` for the light-blue tint) | Author pastes `__contact-*` card HTML into each `Tab{N}Content` |
| Homepage - How We Think | `how-we-think` | `standalone` | Content sourced from DCR pickers + Newsroom External. Migrated from the standalone `/how-we-think/` component |
| Featured Conferences page | `conference-insights` | (dark baked into preset — no Placement needed) | Nested tabs, sliders, video facade. Migrated from `/featured-conferences-component/` |

---

## Media-contact card pattern

The component ships with a media-contact card grid built in — authors paste the marked-up HTML into any panel's Rich Text Datum and it renders as the standard 4-up grid (mobile 1-up, desktop 4-up).

```html
<div class="rbccm-tabbed-panels__contact-grid">
  <a class="rbccm-tabbed-panels__contact-card"
     href="tel:+12126185589"
     aria-label="Call Sanam Heidary at +1 212 618 5589">
    <h3 class="rbccm-tabbed-panels__contact-name">Sanam Heidary</h3>
    <p class="rbccm-tabbed-panels__contact-role">General Inquiries</p>
    <p class="rbccm-tabbed-panels__contact-phone">+1.212.618.5589</p>
    <span class="rbccm-tabbed-panels__contact-phone-icon" aria-hidden="true">
      <i class="fa fa-phone"></i>
    </span>
  </a>
  <!-- ...more cards... -->
</div>
```

Font Awesome 4 (already loaded site-wide on rbccm.com) provides the `fa-phone` glyph. No JS wiring — the whole card is a `tel:` anchor.

---

## Datum reference

| Datum | Type | Purpose |
|---|---|---|
| `SectionID` | String | Unique root id (used as prefix for panel ids) |
| `SectionAriaLabel` | String | ARIA label on the outer `<section>` |
| `TablistAriaLabel` | String | ARIA label on the `role="group"` tablist |
| `Title` | String | Optional H2 (hidden by `--headless`) |
| `Lede` | String | Optional intro paragraph (hidden by `--headless`) |
| `Placement` | Options: `standalone` / `compact-headless` / `dark` | Root modifier |
| `Alignment` | Options: `center` / `title-left` / `lede-left` / `align-left` | Title/lede text-align |
| `Tab{1..4}Label` | String | Tab button label. Blank = tab is skipped entirely |
| `Tab{1..4}Slug` | String | URL-friendly slug for `data-panel`/`id`. Blank auto-derives from label |
| `Tab{1..4}Content` | RichText | HTML content for the panel — any markup, including the paste-in card pattern |
| `CssPath` | String | Sidecar CSS URL |
| `JsPath` | String | Sidecar JS URL |
| `CacheVersion` | String | Appended as `?v=…` to sidecar URLs. Bump every deploy |

---

## Deploy checklist

1. Push `tabbed-panels.css` to `/assets/rbccm/css/components/tabbed-panels.css`.
2. Push `tabbed-panels.js` to `/assets/rbccm/js/components/tabbed-panels.js`.
3. Register the skin in TeamSite from `tabbed-panels.xsl` + `tabbed-panels-properties.xml`.
4. Bump `CacheVersion` in `tabbed-panels-properties.xml` so browsers pull the fresh assets via the `?v=` query string.
