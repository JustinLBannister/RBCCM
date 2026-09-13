# DEPRECATED — migrated into `tabbed-panels`

This standalone component has been consolidated into
[`/tabbed-panels/`](/Users/bannister/Documents/Freelance/RBCCM/tabbed-panels/)
as the **`conference-insights`** preset.

## What changed

The nested-tabs pattern (outer conference selector + inner
Overview/Speakers/Insights tabs, dark navy background, yellow underline
on active) is now rendered by setting `Preset=conference-insights` on a
tabbed-panels instance.

**Datums** — All 175 original Datums ported with a `Ci` prefix:
- Section-level: `CiBCAccount`, `CiBCPlayer`, `CiBCEmbed`, `CiDefaultPoster`, ARIA overrides
- Per conference (× 3): `Ci{N}Name`, `Ci{N}BCVideoId`, `Ci{N}Date`, `Ci{N}Location`,
  `Ci{N}Format`, `Ci{N}OverviewHeading`, `Ci{N}OverviewBody`, `Ci{N}KeyTopics`,
  `Ci{N}ContactText`, `Ci{N}Speaker{1..3}{Name/Title/Image/Alt}`,
  `Ci{N}Insight{1..3}{Label/Title/Description/Meta/Image/ImageAlt/Href}`,
  `Ci{N}InsightsCTAText`, `Ci{N}InsightsCTAHref`

**CSS** — BEM renamed from `.rbccm-featured-conferences__*` to
`.rbccm-tabbed-panels__*`. Content scoped under
`.rbccm-tabbed-panels--conference-insights`. Dark navy bg baked into
the preset — authors do NOT need to also set `Placement=dark`.

**JS** — Inner-tab controller + Speakers slider + Insights slider +
Brightcove video facade all ported to a third IIFE in
`tabbed-panels.js` gated on `[data-preset="conference-insights"]`.
The `rbccm-tp:panel-change` custom event fires from tabbed-panels
when panels toggle so the carousels remeasure correctly.

## Migration path

1. Deploy new `tabbed-panels.css` + `.js` to
   `/assets/rbccm/css/components/` and `/assets/rbccm/js/components/`.
2. Bump `CacheVersion` in `tabbed-panels-properties.xml`.
3. Update the CMS instance on the featured-conferences page to point
   at the new `tabbed-panels` skin with `Preset=conference-insights`.
4. Copy over per-conference Datum values.
5. Verify Brightcove video facade, both sliders, and mobile accordion
   behavior in production before deleting this folder.

## Sibling components in this folder

- `featured-conferences-homepage.*` and `featured-conferences-events*`
  are separate components (light-blue homepage grid + events lookups).
  They are **NOT** part of this consolidation and stay as-is.

Do NOT ship changes to `featured-conferences.html` / `.css` / `.js`.
Any fix belongs in `tabbed-panels`.
