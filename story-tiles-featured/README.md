# Story Tiles — Featured

Stand-alone story-tile grid with a "1 featured card + 3-up row + View
all button" layout. Cloned from `conference-insights-tiles` and made
generic so it can drop on any page.

## What's the same

- 1-column mobile / 3-column desktop CSS Grid layout
- Per-tile `Featured` Boolean promotes a tile to a full-width
  horizontal card (image left, text right on desktop)
- DCR picker on each tile + per-tile Manual Title / Description /
  Link / Eyebrow overrides
- Optional "See more" load-more button, "View all" button below
- Tile title heading level configurable (h2 → h6)
- Filter-by data attributes on each `<li>` so the shared
  filter-by component can attach if it's also on the page
- Skeleton placeholders match the featured + 3-up layout so
  nothing shifts when tiles render

## What's new / different vs. conference-insights-tiles

- `Heading` (String) — the section H2. Conference-insights had none
- `Subheading` (Textarea) — paragraph under H2
- `HeadingId` (String) — optional anchor id, adds scroll-margin-top
- `HeadingAlignment` (SelectSingle) — left (default) / center
- `ColorScheme` (SelectSingle) — light (default) / dark navy
- `BackgroundColor` (String) — optional CSS colour override
- `ViewAllHref` default is BLANK (was `/en/insights`) — author
  supplies the correct destination per instance
- Default `ViewAllText` is `"View all"` (was `"View all conference insights"`)
- Feed-enhancement JS (`conference-insights-tiles-feed.js`) is NOT
  included — that script auto-populates from the insights year XML
  feeds, which is specific to the Conference Insights landing page.
- All BEM classes renamed: `.rbccm-conference-insights-tiles__*` →
  `.rbccm-story-tiles__*`; CSS custom-property prefix
  `--rbccm-cit-*` → `--rbccm-stf-*`

## Files

- `story-tiles-featured.xsl` — the skin
- `story-tiles-featured-properties.xml` — Properties + Data schema
- `story-tiles-featured.css` — all component styles (scoped to
  `.rbccm-story-tiles`)
- `story-tiles-featured.js` — load-more controller

## Deploy paths (referenced from the XSL)

- `/assets/rbccm/css/components/story-tiles-featured.css`
- `/assets/rbccm/js/components/story-tiles-featured.js`

## Author quick-start for the "1 featured + 3 below" layout

1. Add 4+ Story Tile Groups. Bind each to an `article/story` DCR.
2. On tile 1, flip `Featured` to `true`.
3. Fill in `Heading` (e.g. "Latest insights") and optionally
   `Subheading`.
4. Set `ViewAllText` + `ViewAllHref`, keep `ShowAfterLoadAlways`
   on (default true).

## Verification checklist before productionising

- DCR field access matches your Teamsite story schema
  (`title`, `description`, `thumbnail`, `time_to_read`,
  `story_type`, `publish_date`, `subcategory`,
  `regional_origination`, `topic`, `can_url`). Same fields
  conference-insights-tiles already uses in production.
- If a page ever wants the feed enhancement (auto-populate from
  insights year feeds), copy `conference-insights-tiles-feed.js`
  into this component and add a `<script>` reference in the XSL —
  it looks for empty Story Tile groups, so it's a no-op when the
  author has filled them in.
