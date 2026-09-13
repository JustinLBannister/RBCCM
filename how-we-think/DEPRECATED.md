# DEPRECATED — migrated into `tabbed-panels`

This standalone component has been consolidated into
[`/tabbed-panels/`](/Users/bannister/Documents/Freelance/RBCCM/tabbed-panels/)
as the **`how-we-think`** preset.

## What changed

The Insights / Newsroom / Conferences 3-tab pattern is now rendered by
setting `Preset=how-we-think` on a tabbed-panels instance. All original
Datums were ported with an `Hwt` prefix (e.g. `HwtInsightsTabLabel`,
`HwtInsightSlide1Url`, `HwtEventsList`). The `<External>` MetaQueryExternal
that populates Newsroom moved into `tabbed-panels-properties.xml`.

CSS BEM was renamed from `.rbccm-how-we-think__*` to
`.rbccm-tabbed-panels__*` and scoped under
`.rbccm-tabbed-panels--how-we-think`.

The insight-tile hydration behavior from `how-we-think-feeds.js` lives
in `tabbed-panels.js` as a second IIFE gated on
`[data-preset="how-we-think"]`.

## Migration path

1. Bump the site-level `CacheVersion` after deploying the new
   `tabbed-panels.css`/`.js` to `/assets/rbccm/css/components/` and
   `/assets/rbccm/js/components/`.
2. Update the CMS instance on the homepage to point at the new
   `tabbed-panels` skin with `Preset=how-we-think` selected.
3. Copy over Datum values (or export/import if TeamSite supports).
4. Delete this folder once the migrated instance is verified in production.

## Files kept for reference until migration verified

- `how-we-think.xsl`, `how-we-think.css`, `how-we-think.js`,
  `how-we-think-feeds.js`, `how-we-think-properties.xml`

Do NOT ship changes to these files. Any fix belongs in `tabbed-panels`.
