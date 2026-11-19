# MAAS+MATA Page

The original whole-page template for the MAAS+MATA page (Multi-Asset Agency Solutions). One TeamSite skin and one set of fields output the full page body, from the hero down to the demo call to action. It is a page, not a reusable component. Several of its sections have since been split out into the reusable `rbccm-*` components; this folder keeps the original template, its fields, the local previews and the page's structured data files.

## For editors and BAs

### Purpose
The template builds one page only: MAAS+MATA (live), at `https://www.rbccm.com/en/expertise/global-markets/electronic-trading/multi-asset-agency-solutions`.

Sections, top to bottom, and the reusable component each one was later split out into (per `build-components-test.py` and `maas-mata-components.html`):

| Section in this template | Split-out component |
|---|---|
| Hero | `rbccm-hero` (MAAS+MATA skin) |
| Chart image with video | `rbccm-video-poster` |
| New standard ("A new standard for multi-asset electronic trading.") | `rbccm-intro-statement` |
| Awards | `rbccm-awards` |
| Platforms (two cards) | `rbccm-two-up-cards` (features skin) |
| MATA capabilities | `rbccm-capability-cards` (MAAS+MATA skin) |
| Innovation era (three numbered features) | `rbccm-numbered-features` |
| Demo call to action | `rbccm-cta-band` (MAAS+MATA skin) |
| Dark strip and deep band backgrounds behind the sections | `rbccm-section-group` |

- `maas-mata.xsl` already uses the markup and the stylesheet or script of three of those components: `rbccm-awards`, `rbccm-cta-band` and `rbccm-video-poster`.
- The newsletter sign-up was removed from this template; it is a separate component placed on the page (`rbccm-marketo-footer` in the components preview).
- `maas-mata-components.html` is the whole page rebuilt from the split-out components, one per slot. `build/pages.config.mjs` uses it as the page preview and lists the components' files as the ones the live page loads.
- `MAAS+MATA Workflow.md` describes how copy changes are drafted, previewed and published for this template.

### What the editor can change
All fields are on the one template (`maas-mata-properties.xml`).
- Hero: eyebrow, two title lines, subtitle, and the button label and URL.
- Chart image: the image URL, its alt text and the Brightcove video ID.
- New standard: the three-part headline (grey lead, white highlight, yellow accent), three paragraphs, and the button label and URL.
- Awards: the eyebrow and three awards, each with a year, title and issuer.
- Platforms: the eyebrow and heading, and two cards, each with a theme (dark or light), eyebrow, title, body and up to six bullets.
- MATA capabilities: an optional eyebrow, the heading and subheading, three cards (icon, title, subtitle, body) and the full-width "Index events" card (icon, title, subtitle, body).
- Innovation era: the heading, the intro copy and three features (number, title, body).
- Demo call to action: the eyebrow, the two-part headline, the body, and the button label and URL.
- SEO: one field, "SEO: JSON-LD structured data", that takes the whole structured data block as a paste.
- "Color Scheme": Default or Dark.
- Technical fields exist and are set at deploy: "Asset version" (cache version, bumped on every CSS or JS deploy) and the Brightcove account and player IDs (RBC-wide constants).

How a copy change is made (per `MAAS+MATA Workflow.md`): marketing drafts the copy in a web form, exports a file and sends it to dev; dev uploads it so it can be reviewed on the page address with `?preview=draft` added; once approved, dev copies the values into the TeamSite fields and publishes.

### What it does not do
- It cannot be reused for another page. The sections and their order are fixed in the skin; an editor cannot add, remove or reorder sections.
- It does not include the newsletter sign-up or a Market Insights section. Both were taken out of the template.
- It does not include a request-a-demo form or pop-up. The hero and demo buttons are plain links (default `#demo`, the demo section at the bottom of the page).
- The live page does not read the draft copy file. The draft shows only with `?preview=draft` on the address; live shows what is in the TeamSite fields.
- It does not hold the page title or meta description. Those are set on the parent page.
- It has no transcript or captions field for the video.
- The wording screen readers hear for each section (the section labels), the play button label and the video title are fixed in the skin, not fields.
- It does not add slots. A fourth award, a third platform card, a fourth capability card or a fourth feature needs a developer.

### Limits
- Fixed counts: one hero button; three New standard paragraphs; three awards; two platform cards with up to six bullets each; three capability cards plus the Index events card; three features; one demo button.
- Icons: each capability card and the Index events card pick from four icons (equities, FX, futures, info).
- Chart image: shown at 1100 x 366.
- The main layout change is at 992px wide. Below 872px the awards row becomes a carousel.
- Text length: No enforced character limit.

### Empty and edge cases
- Platform bullets left blank are hidden. The awards eyebrow and the MATA capabilities eyebrow are hidden when blank.
- "SEO: JSON-LD structured data" blank: no structured data is output by the template.
- Most other fields are not checked. A blank value leaves an empty heading, card or button in place, so fill every slot.
- Brightcove video ID blank: the play button still shows and the pop-up plays the default placeholder video set in the skin.
- With `?preview=draft` on the address, text, links and images are replaced from the draft file. If the draft file cannot be loaded, the published copy stays.
- Scripts off: the hero and the chart image show, but sections that fade in on scroll stay hidden, because the page stylesheet hides them until the page script runs. Visitors with reduced motion turned on see everything.
- Adding `?noanim=1` to the address shows everything at once with no animation.

### Accessibility
- Heading levels are fixed in the skin and cannot be changed by the editor: the hero eyebrow is the `h1` and the hero title is a paragraph; each section heading is an `h2`; award, platform card, capability card and feature titles are `h3`. Other eyebrows are not headings.
- Every section has a fixed label for screen readers.
- The chart image's alt text comes from "Chart image alt text". Icons and button arrows are decorative and hidden from screen readers.
- Buttons are links named by their label field.
- The video pop-up behaves as in `rbccm-video-poster`: focus moves to the close button on open, Tab loops back to it, Esc closes, and focus returns to the play button.
- The awards carousel's previous and next buttons are labelled "Previous award" and "Next award".
- Reduced motion: entrance animations are turned off and content shows straight away.
- `MAAS+MATA Workflow.md` lists accessibility items that were still open when it was written, including the heading order decision and wrapping the page in a main landmark.

### Open questions
- Whether this one-piece template is still what is published, or the live page is now assembled from the split-out components. `build/pages.config.mjs` lists the components' files as the live page's; `MAAS+MATA Workflow.md` describes the single template.
- Where the "Request a demo" buttons should go. The template's fields default to `#demo`; the components preview points them at `#request-demo`, the `rbccm-marketo-modal` pop-up.
- Whether the newsletter sign-up is on the live page. The components preview ends with `rbccm-marketo-footer`, but `build/pages.config.mjs` does not list it for this page.
- "Color Scheme": the Dark option marks the page wrapper, but no matching rule was found in `maas-mata.css`. Confirm whether the field has any effect.
- Which structured data file is current. `seo-jsonld-paste.json` and `seo-jsonld-paste-id-only.json` give different video details (name, description, length, size, upload date).
- The heading order decision (SEO versus accessibility) recorded as pending in `MAAS+MATA Workflow.md`.

## Files

| File | What it is |
|---|---|
| `maas-mata.xsl` | TeamSite skin for the whole page |
| `maas-mata-properties.xml` | Fields |
| `maas-mata.css` | Page stylesheet; ships to `/assets/rbccm/css/pages/maas-mata.css` |
| `maas-mata.js` | Page script; ships to `/assets/rbccm/js/pages/maas-mata.js` |
| `rbccm-json-bind.js` | Script that fills the page from the draft copy file in preview; ships to `/assets/rbccm/js/pages/rbccm-json-bind.js` |
| `maas-mata.json` | Draft copy file for the preview (this copy holds test text) |
| `maas-mata.html` | Standalone local version of the page |
| `maas-mata-cms.html` | The form used to draft the page copy and export it as a file |
| `maas-mata-components.html` | The page rebuilt from the split-out components (generated; do not edit by hand) |
| `build-components-test.py` | Builds `maas-mata-components.html`. Not shipped |
| `animate-test.html` | Local test page for the entrance animations |
| `MAAS+MATA Workflow.md` | How copy is drafted, previewed and published, and how dev ships changes |
| `seo-jsonld.json` | The page's structured data, laid out for reading |
| `seo-jsonld-entities.json` | The same layout with square brackets written as HTML entities |
| `seo-jsonld-paste.json` | Structured data on one line, for pasting |
| `seo-jsonld-paste-id-only.json` | Structured data on one line, for pasting; its video details differ from `seo-jsonld-paste.json` |
| `*.png`, `*.jpg`, `*.webp` | Page images, including the Execution Console screenshots used for the chart image |
