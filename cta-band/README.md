# CTA Band

Shared component. Dark navy call-to-action band with an optional yellow eyebrow, a two-tone serif headline (white lead + yellow highlight), body copy, and a yellow pill CTA.

Extracted from the "Talk with an expert." section on MAAS+MATA and the "Ready to turn insight into results?" band on US Credentials. Both pages shared ~95% of the same visual system — this component collapses them into one.

---

## Files

- `cta-band.xsl` — TeamSite skin. Renders from Datums, emits `data-json` attributes so the runtime binder can hydrate live content in preview mode.
- `cta-band-properties.xml` — Datums (content + optional width tuners).
- `cta-band.css` — Component styles. Self-contained. Ships to `/assets/rbccm/css/components/cta-band.css`.
- `cta-band.html` — Local preview showing three variants side by side (US Credentials style, MAAS+MATA style, nested-in-deep-band).

---

## Placement modes

**Standalone** — paints its own dark navy gradient. Use for pages like US Credentials where the band stands alone between light-background sections.

```html
<section class="rbccm-cta-band">…</section>
```

**Nested inside `.rbccm-deep-band`** — background goes transparent so the wrapper's continuous gradient shows through across sibling sections. Use for pages like MAAS+MATA where three dark sections (MATA Capabilities → Market Insights → CTA Band) need to read as one continuous surface.

```html
<div class="rbccm-deep-band">
  <section class="rbccm-mata-cap">…</section>
  <section class="rbccm-market-insights">…</section>
  <section class="rbccm-cta-band">…</section>
</div>
```

No modifier flag on the CTA band itself. The visual is context-derived via a compound CSS selector.

---

## Content Datums

| Datum | Required | Notes |
|---|---|---|
| `Eyebrow` | Optional | Small yellow caption above heading with a yellow underline. Leave blank to omit (US Credentials style). |
| `HeadingLead` | Yes | First half of the H2 — renders white. |
| `HeadingHighlight` | Yes | Second half of the H2 — renders yellow (`#FFC72C`). |
| `Body` | Yes | Paragraph beneath the heading. Textarea; supports inline HTML. |
| `CtaLabel` | Yes | Text on the yellow pill button. |
| `CtaHref` | Yes | URL the CTA links to. |

---

## Width tuners (optional CSS custom properties, via Datums)

All three are optional. Leave blank to use the CSS defaults (MAAS+MATA proportions).

| Datum | CSS default | US Credentials override |
|---|---|---|
| `ContentWidth` | `690px` | `758px` |
| `ContentGap` | `41px` | `50px` |
| `BodyWidth` | `100%` (stretch) | `432px` |

The XSL emits these as inline `style` custom properties on the `<section>` — no separate modifier class per page.

---

## Runtime binder hooks

Every author-facing string has a `data-json*` attribute so the shared JSON-bind runtime (`rbccm-json-bind.js`) can hydrate a page-level draft at preview time:

| Element | Attribute | JSON key |
|---|---|---|
| Eyebrow `<p>` | `data-json` | `eyebrow` |
| Heading lead `<span>` | `data-json` | `headingLead` |
| Heading highlight `<span>` | `data-json` | `headingHighlight` |
| Body `<p>` | `data-json-html` | `body` |
| CTA `<a>` | `data-json-attr-href` | `cta.href` |
| CTA label `<span>` | `data-json` | `cta.label` |

Sample JSON shape:

```json
{
  "eyebrow": "See the platform",
  "headingLead": "Talk with an",
  "headingHighlight": "expert.",
  "body": "Connect with our product teams to arrange a custom demo.",
  "cta": {
    "label": "Request a demo",
    "href": "#demo"
  }
}
```

---

## Deploy checklist

1. Push `cta-band.css` to `/assets/rbccm/css/components/cta-band.css`.
2. Register the skin in TeamSite from `cta-band.xsl` + `cta-band-properties.xml`.
3. Bump the site-level `AssetVersion` so browsers pull the fresh CSS.
4. Optional: add sample content to the CMS instance so authors have a template to start from.
