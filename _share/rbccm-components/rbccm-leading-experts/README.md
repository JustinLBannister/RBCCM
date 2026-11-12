# RBCCM Leading Experts

Three-card grid of expert profiles. Each card = eyebrow pill + duotone-blue headshot + name/role/CTA on a navy tile. Mounts under the "Areas of expertise" section on the Strategy & Economics page.

## Status

**Ready for TeamSite deploy.** CSS + markup + XSL + Properties/Datums all built and verified (35 Datums, all unique + all referenced; XSL parses; CSS brace-balanced).

## Files

- `rbccm-leading-experts.css` -- shared partial + variant modifier. Deploys to `/assets/rbccm/css/components/rbccm-leading-experts.css`.
- `rbccm-leading-experts.html` -- local preview with 3 hardcoded experts (FPO photo). Not deployed.
- `rbccm-leading-experts.xsl` -- Preset-driven TeamSite skin. `$VARIANT_CLASS` map + shared render + pickTag guard + per-slot dispatcher.
- `rbccm-leading-experts-properties.xml` -- Datums: Section identity + Preset + section title Text/Tag + 3 fixed Expert slots (Photo Type="Image", Eyebrow/Name/Role Text+Tag pairs, CtaText, CtaHref).

## Deploy checklist

1. Push `rbccm-leading-experts.css` -> `/assets/rbccm/css/components/rbccm-leading-experts.css`
2. Publish the TeamSite skin (`rbccm-leading-experts.xsl` + `rbccm-leading-experts-properties.xml`)
3. Bump `CacheVersion` Datum after every sidecar CSS deploy

## Layout

| Viewport | Behavior |
|---|---|
| <992px | Cards stack full-width, 24px gap |
| >=992px | 3-column CSS Grid, cards side-by-side |

No carousel at any breakpoint (per S&E brief).

## Palette

Card is dark navy `#003168`. Duotone photo blends via `mix-blend-mode: luminosity` on a `#003168 -> #12457E` gradient underlay. Eyebrow pill is RBC Royal Yellow `#FEDF01` with navy text. CTA text + arrow also gold.

Section bg swaps per variant via `--rbccm-leading-experts-bg-color`. Current variant `.rbccm-leading-experts--strategy-and-economics-leading-experts` sets it to the S&E light-blue `#E7EEF1`.

## Photos

Placeholders currently point to `photos/{slug}.jpg` (missing -- shown as the underlying navy gradient). Swap for DAM URLs when authors wire up the picker Datum.

## Consumers

| Page | Modifier class |
|---|---|
| Strategy & Economics - Leading experts | `.rbccm-leading-experts--strategy-and-economics-leading-experts` |
