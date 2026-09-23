# CTA Band

Shared component. Three TeamSite skins, one per variant, sharing one Properties file. All three render a centered stack (optional eyebrow → heading → body → button row) on a dark navy surface; the skin picks the typography ramp, the number of buttons, and whether heading + body sit inside a tight `.__intro` wrapper.

Extracted from the "Talk with an expert." section on MAAS+MATA, the "Log in to RBC insights" band on S&E, and the "Ready to turn insights into results?" band on US Credentials. All three shared ~95% of the same visual system — this component collapses them into one.

---

## Files

- `rbccm-cta-band--maas-mata.xsl`, `rbccm-cta-band--strategy-and-economics.xsl`, `rbccm-cta-band--us-credentials.xsl` — TeamSite skins, one per variant (picked in the Skin dropdown; there is no preset field). Render from Datums and emit `data-json` attributes so the runtime binder can hydrate live content in preview mode.
- `_retired/rbccm-cta-band.xsl` — old Preset-driven skin, not used. Its Preset read picked up every dropdown label, so the variant class came out broken.
- `rbccm-cta-band-properties.xml` — Datums shared by all three skins. Appearance tab: BgTransparent, CssPath, CacheVersion, section attrs. Content tab: eyebrow, heading, body, CTAs.
- `rbccm-cta-band.css` — Component styles. Self-contained. Ships to `/assets/rbccm/css/components/rbccm-cta-band.css`.
- `rbccm-cta-band.html` — Local preview showing all four cases side-by-side: maas-mata standalone, maas-mata nested (`--bg-transparent`), strategy-and-economics, us-credentials.

---

## Variants (one skin each)

**`maas-mata`** — MAAS+MATA "Talk with an expert." pattern. Big serif heading (50 mobile → 75 desktop) with an inline yellow-highlight last span, optional yellow eyebrow with a centered gold rule, single "Request a demo" yellow pill CTA. Own navy gradient (`#082043 → #061730`).

**`strategy-and-economics`** — S&E "Log in to RBC insights" pattern. Small serif heading (28px, single color — no highlight span), body copy, two buttons (primary yellow + secondary outlined ghost). Heading + body are wrapped in `.__intro` so their internal gap (12px) is tighter than the outer `.__inner` gap (32px). Deep navy `#092044`.

**`us-credentials`** — US Credentials "Ready to turn insights into results?" pattern. Same big serif ramp as maas-mata, but the heading uses `display: flex; flex-direction: column;` at desktop so the yellow highlight span always drops beneath the white lead line regardless of copy length. No eyebrow slot (leave the Datum blank). Same navy gradient as maas-mata.

The skin also owns the heading DOM shape:
- `maas-mata` / `us-credentials`: heading emits two spans (lead + highlight). The us-credentials preset skips the nbsp between spans since flex-column owns the split.
- `strategy-and-economics`: heading emits one text run by default; if the author fills in `HeadingHighlight` the two-span pattern renders instead.

---

## Modifier (BgTransparent Datum, plain text yes / no)

Set `BgTransparent = "yes"` to add `.rbccm-cta-band--bg-transparent`, which zeros the section background so a parent wrapper can paint a continuous gradient through the band.

Use this on MAAS+MATA where the CTA sits inside `.rbccm-maas-mata__deep-band` — that wrapper runs a single `#082043 → #061730` gradient across MATA Capabilities → Market Insights → CTA Band. Leave `"no"` for standalone use.

```html
<div class="rbccm-maas-mata__deep-band">
  <section class="rbccm-maas-mata__mata-cap">…</section>
  <section class="rbccm-maas-mata__market-insights">…</section>
  <section class="rbccm-cta-band rbccm-cta-band--maas-mata rbccm-cta-band--bg-transparent">…</section>
</div>
```

---

## Datums

| Datum | Type | Required | Notes |
|---|---|---|---|
| `BgTransparent` | String | Optional | Type `no` (default) or `yes`. Set to `yes` when nested in a wrapper that owns the gradient. |
| `CssPath` | String | Optional | Sidecar CSS URL. Blank uses `/assets/rbccm/css/components/rbccm-cta-band.css`. |
| `CacheVersion` | String | Optional | Appended as `?v=` to the CSS URL; bump after CSS changes. |
| `Eyebrow` | String | Optional | Small yellow caption above the heading. Renders only when non-empty. Typically populated for `maas-mata`; blank for the other two. |
| `HeadingLead` | String | Yes | First half of the H2 — renders white. |
| `HeadingHighlight` | String | Optional | Second half of the H2 — renders yellow (`#FFC72C`). Leave blank for a single-color heading (typical for `strategy-and-economics`). |
| `Body` | Textarea | Optional | Paragraph beneath the heading. Supports inline HTML via `disable-output-escaping`. Skips cleanly when blank. |
| `Cta1Label` | String | Optional | Text on the primary (yellow) pill button. Whole `<a>` skips when blank. |
| `Cta1Href` | String | Optional | URL for the primary button. |
| `Cta2Label` | String | Optional | Text on the secondary (outlined ghost) button. Only meaningful on the strategy-and-economics skin; leave blank on the others. |
| `Cta2Href` | String | Optional | URL for the secondary button. |
| `SectionId` | String | Optional | `id` attribute on the `<section>` — use for hash-anchor targets (`#demo`, etc.). |
| `SectionAriaLabel` | String | Optional | `aria-label` on the `<section>` for screen-reader context. |

---

## Sample content per skin

**maas-mata** (MAAS+MATA):

```
Skin:              rbccm-cta-band--maas-mata.xsl
BgTransparent:     yes   ← nested in .rbccm-maas-mata__deep-band
Eyebrow:           See the platform
HeadingLead:       Talk with an
HeadingHighlight:  expert.
Body:              Connect with our product teams to arrange a custom demo.
Cta1Label:         Request a demo
Cta1Href:          /request-demo
SectionId:         demo
SectionAriaLabel:  See the platform
```

**strategy-and-economics** (S&E):

```
Skin:              rbccm-cta-band--strategy-and-economics.xsl
Eyebrow:           (blank)
HeadingLead:       Explore our full library of research and insights
HeadingHighlight:  (blank)
Body:              Access proprietary research, market perspectives, and industry analysis from RBC Capital Markets' global network of experts.
Cta1Label:         Log in to RBC insights
Cta1Href:          https://insights.rbccm.com/
Cta2Label:         Learn more
Cta2Href:          /research
```

**us-credentials** (US Creds):

```
Skin:              rbccm-cta-band--us-credentials.xsl
Eyebrow:           (blank)
HeadingLead:       Ready to turn insights
HeadingHighlight:  into results?
Body:              Explore how RBC Capital Markets helps clients navigate complex decisions and move forward with confidence.
Cta1Label:         Learn more
Cta1Href:          /us/what-we-do
```

---

## Runtime binder hooks

Every author-facing string has a `data-json*` attribute so the shared JSON-bind runtime (`rbccm-json-bind.js`) can hydrate a page-level draft at preview time:

| Element | Attribute | JSON key |
|---|---|---|
| Eyebrow `<p>` | `data-json` | `eyebrow` |
| Heading lead `<span>` | `data-json` | `headingLead` |
| Heading highlight `<span>` | `data-json` | `headingHighlight` |
| Body `<p>` | `data-json-html` | `body` |
| Primary CTA `<a>` | `data-json-attr-href` | `cta.href` |
| Primary CTA label `<span>` | `data-json` | `cta.label` |
| Secondary CTA `<a>` | `data-json-attr-href` | `cta2.href` |
| Secondary CTA label `<span>` | `data-json` | `cta2.label` |

Sample JSON shape (strategy-and-economics variant):

```json
{
  "eyebrow": "",
  "headingLead": "Explore our full library of research and insights",
  "headingHighlight": "",
  "body": "Access proprietary research, market perspectives, and industry analysis from RBC Capital Markets' global network of experts.",
  "cta": {
    "label": "Log in to RBC insights",
    "href": "https://insights.rbccm.com/"
  },
  "cta2": {
    "label": "Learn more",
    "href": "/research"
  }
}
```

---

## Deploy checklist

1. Push `rbccm-cta-band.css` to `/assets/rbccm/css/components/rbccm-cta-band.css`.
2. Register the three skins in TeamSite (`rbccm-cta-band--*.xsl`) with `rbccm-cta-band-properties.xml`.
3. Bump the site-level `AssetVersion` so browsers pull the fresh CSS.
4. On MAAS+MATA pages, drop the legacy `.rbccm-maas-mata__demo*` CSS from `maas-mata.css` (already done in this repo) and link `rbccm-cta-band.css` alongside it — the demo band renders through this component now.
5. Optional: add sample content to the CMS instance for each skin so authors have a template to start from.
