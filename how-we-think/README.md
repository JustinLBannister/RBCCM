# How We Think

Rebuild of the outdated **"How we think"** tabbed section on rbccm.com.
Three tabs (Insights, Newsroom, Conferences), each populated by manual
Datum pickers in the DCR — same authoring pattern as icon-carousel,
secondary-nav, and featured-conferences.

## Scope

- **3 tabs**:
  - **Insights** — 3 story tiles (image, "INSIGHTS" eyebrow, title,
    description, "X min read/listen" label, link) + "More insights" CTA
  - **Newsroom** — 3 news items (date, source/title link, summary) +
    "Show more media hits" CTA
  - **Conferences** — 3 event pills (month/day circle, location, event
    name) + "Review upcoming events" CTA
- **Data model**: manual Datum pickers per tile. No feed. No skin
  detach/appendTo re-parenting.
- **Tech**: vanilla-JS tab logic (no jQuery / Bootstrap 3), BEM markup
  under `.rbccm-how-we-think__*`, own the CSS.
- **Rail**: same 1440 / 170 side padding pattern as icon-carousel and
  featured-conferences.

## Old CMS reference

- Component: "Tabbed Content - Same Page"
- ID: `tab-wrapper`
- Title: "How we think"
- Content DCR: `templatedata/rbccm/tabcontent/data/about-us-tabs`

## Data sources — one Datum-picker per tile, three DCR trees

Each tab pulls 3 items via manual DCR pickers on the "How we think"
component DCR. The pickers browse to three different trees:

- **Insights tab (3 tiles)** → `templatedata/article/story/data/<year>/<month>/<slug>`
  (standard story article DCRs). Each picker resolves to a story record
  and the XSL dereferences it for image, title, description, and
  read-time label. Link points at the story's page URL.

- **Newsroom tab (3 items)** → `templatedata/article/news/data/<year>/<file>`
  (news article DCRs). Each picker resolves to a news record; the XSL
  dereferences date, headline, summary, and external URL.

- **Conferences tab (3 events)** → `templatedata/about-us/conferences/data/<slug>`
  — same tree we already dereference in `upcoming-conferences-component/`.
  Model the picker + card render off that component so we're consistent
  with month/day/location/name parsing.

CTA URLs per tab are separate Datums (not derived from the tile pickers):
- Insights → "More insights" href (default `/en/insights`)
- Newsroom → "Show more media hits" href (default `/en/about-us/in-the-media`)
- Conferences → "Review upcoming events" href (default `/en/about-us/conferences`)

## Files

- `old-markup-reference.html` — the current live 3-tab markup, preserved
  verbatim with inline commentary flagging what's outdated (Bootstrap 3
  tabs, jQuery `.detach().appendTo()` re-parenting, hardcoded tile
  blocks, skin dependency).
- `test.html` — local preview: static-content BEM markup for all 3 tabs
  with working vanilla-JS tab switching. Iterate visuals here before
  cutting the XSL / Datum properties.

## Rebuild plan

1. **`test.html`** — first-pass BEM markup + vanilla-JS tab switching,
   populated with the reference content so Justin can review the shell
   in the browser.
2. **`how-we-think.css`** — extracted CSS matching the Figma screenshots.
3. **`how-we-think.js`** — tab controller (keyboard nav, aria-selected /
   aria-controls, no jQuery).
4. **`how-we-think.xsl` + `how-we-think-properties.xml`** — TeamSite
   Datum wiring once visual + interaction are approved. Datum groups:
   section title, Insights tiles (title, description, image, read/listen
   label, href, category label), CTAs per tab, Newsroom items (date,
   title, summary, href), Conferences items (month, day, location, name).
