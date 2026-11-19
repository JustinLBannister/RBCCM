# CTA Band

Shared component. Four TeamSite skins, one per variant, sharing one Properties file. All three render a centered stack (optional eyebrow → heading → body → button row) on a dark navy surface; the skin picks the typography ramp, the number of buttons, and whether heading + body sit inside a tight `.__intro` wrapper.

Extracted from the "Talk with an expert." section on MAAS+MATA, the "Log in to RBC insights" band on S&E, and the "Ready to turn insights into results?" band on US Credentials. All three shared ~95% of the same visual system — this component collapses them into one.

---

## For editors and BAs

### Purpose
A closing call-to-action band: an optional eyebrow, a heading (a white lead with an optional yellow highlight), a short body and one or two buttons. It is used on US Credentials and MAAS+MATA (both live) and on Strategy & Economics and ETF Innovators (in progress, not live yet).

The variant is chosen by picking the skin in TeamSite, not by a field:
- MAAS+MATA: large serif heading with the yellow highlight running on from the white lead, optional eyebrow, one yellow button. Can be made transparent to sit inside the page's dark strip.
- Strategy & Economics (S+E): smaller heading, body, two buttons (yellow primary and outlined secondary).
- US Credentials: large serif heading with the yellow highlight on its own line at desktop, one yellow button.
- ETF Innovators: a white section holding a rounded blue card, text on the left and one yellow button on the right at desktop.

### What the editor can change
- The copy: Eyebrow, Heading lead (white), Heading highlight (yellow) and Body copy. Bold, italics and links are allowed in the body.
- The primary button: label, URL and an optional screen reader label.
- The secondary button: label, URL and an optional screen reader label.
- Transparent background: type `yes` or `no`.
- The Section id for anchor links and the Section aria-label.
- Technical fields exist (CSS path, Last updated). CSS path is set at deploy; Last updated is bumped on each save.

### What it does not do
- It does not let the editor pick the heading level. The heading is always an h2.
- It has no image, video or icon choice. The arrow on the primary button is fixed.
- It shows two buttons at most, and one at most on the ETF Innovators skin.
- It does not open a form or a modal by itself. The buttons are plain links, and the component has no script.
- It has no colour choices apart from the transparent background.
- The ETF Innovators skin ignores the Eyebrow, the secondary button and the Transparent background field.
- It does not pull content from anywhere. Everything is typed.

### Limits
- Four skins.
- Buttons: none to two; none or one on ETF Innovators. They stack on small screens and sit side by side from 640px wide (678px on S+E).
- One heading, split into a lead and an optional highlight.
- No enforced character limit.

### Empty and edge cases
- Blank eyebrow, body or button label: that piece is hidden. With no button labels the button row is not printed.
- Blank Heading highlight: the heading is one colour.
- Blank Heading lead and highlight: the MAAS+MATA, S+E and US Credentials skins still print an empty heading; the ETF Innovators skin leaves the heading out. Always fill the lead.
- A button with a label but no URL still shows, with an empty link.
- Secondary button: its label says S+E skin only, but the MAAS+MATA and US Credentials skins also print it when the label is filled. Leave it blank there.
- Eyebrow: the MAAS+MATA, S+E and US Credentials skins all print it when filled.
- Transparent background: only `yes` (any letter case) turns it on. Anything else keeps the skin's own background.
- Scripts off: no change. The component has no script.

### Accessibility
- The heading is an h2 on every skin and cannot be changed.
- The section is named for screen readers by the Section aria-label field. If that is blank it uses the eyebrow, then the heading (the ETF Innovators skin goes straight to the heading).
- Buttons are links. Screen readers read the visible label unless the screen reader label field is filled. The field notes advise using it only when the visible label is generic, starting with the visible words and adding where the link goes, for example "Learn more about RBC Capital Markets".
- The arrow icon is hidden from screen readers.
- Buttons have visible keyboard focus styles.
- Reduced motion: the button shine and arrow animations are turned off.

### Open questions
- Whether a secondary button is wanted on the MAAS+MATA and US Credentials skins, since they print it when filled.
- There is no stated guidance on heading or body length.

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-cta-band.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-cta-band.css`.

## Files

- `rbccm-cta-band--maas-mata.xsl`, `rbccm-cta-band--strategy-and-economics.xsl`, `rbccm-cta-band--us-credentials.xsl`, `rbccm-cta-band--etf-innovators.xsl` — TeamSite skins, one per variant (picked in the Skin dropdown; there is no preset field). Render from Datums and emit `data-json` attributes so the runtime binder can hydrate live content in preview mode.
- `rbccm-cta-band-properties.xml` — Datums shared by all four skins. Appearance tab: BgTransparent, CssPath, CacheVersion, section attrs. Content tab: eyebrow, heading, body, CTAs.
- `rbccm-cta-band.css` — Component styles. Self-contained. Ships to `/assets/rbccm/css/components/rbccm-cta-band.css`.
- `rbccm-cta-band.html` — Local preview with a variant picker: maas-mata standalone, maas-mata nested (`--bg-transparent`), strategy-and-economics, us-credentials, etf-innovators.

---

## Variants (one skin each)

**`maas-mata`** — MAAS+MATA "Talk with an expert." pattern. Big serif heading (50 mobile → 75 desktop) with an inline yellow-highlight last span, optional yellow eyebrow with a centered gold rule, single "Request a demo" yellow pill CTA. Own navy gradient (`#082043 → #061730`).

**`strategy-and-economics`** — S&E "Log in to RBC insights" pattern. Small serif heading (28px, single color — no highlight span), body copy, two buttons (primary yellow + secondary outlined ghost). Heading + body are wrapped in `.__intro` so their internal gap (12px) is tighter than the outer `.__inner` gap (32px). Deep navy `#092044`.

**`us-credentials`** — US Credentials "Ready to turn insights into results?" pattern. Same big serif ramp as maas-mata, but the heading uses `display: flex; flex-direction: column;` at desktop so the yellow highlight span always drops beneath the white lead line regardless of copy length. No eyebrow slot (leave the Datum blank). Same navy gradient as maas-mata.

**`etf-innovators`** — ETF Innovators "Powering the performance of global ETFs." White section holding a rounded bright blue card (`#0051A5`, 20px radius). Heading + body sit in `.__intro` (left aligned), one yellow pill button with a line arrow. Mobile stacks with 10px gaps and a full-width button; desktop puts the text left and the button right. Every element carries the `--etf-innovators` modifier. Uses HeadingLead, Body and the primary button fields; Eyebrow, the secondary button and BgTransparent are ignored.

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
2. Register the four skins in TeamSite (`rbccm-cta-band--*.xsl`) with `rbccm-cta-band-properties.xml`.
3. Bump the site-level `AssetVersion` so browsers pull the fresh CSS.
4. On MAAS+MATA pages, drop the legacy `.rbccm-maas-mata__demo*` CSS from `maas-mata.css` (already done in this repo) and link `rbccm-cta-band.css` alongside it — the demo band renders through this component now.
5. Optional: add sample content to the CMS instance for each skin so authors have a template to start from.
