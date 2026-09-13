# RBCCM CTA Band

Shared CTA banner section. Optional eyebrow + heading (with optional highlight span) + body + 1-2 buttons. Preset-driven variants share the same skeleton and swap palette / bg / spacing via custom properties.

## Status

**First-pass CSS + preview.** Data hardcoded in `rbccm-cta-band.html`. XSL / Properties / Datums come next after design signoff.

## Files

- `rbccm-cta-band.css` -- shared partial + variant modifiers. Deploys to `/assets/rbccm/css/components/rbccm-cta-band.css`.
- `rbccm-cta-band.html` -- local preview with both variants stacked.

## Presets

| Preset value | Bg | Card | Heading | Buttons |
|---|---|---|---|---|
| `talk-with-an-expert` | Full-width `#002144` deep navy | None (section-level) | Serif 72 desktop with gold `expert` highlight span, gold eyebrow above | 1 primary yellow |
| `research-portal` | `#E7EEF1` light blue | Dark navy card, 15px radius, 32px padding, 170 side gutters at desktop | Serif 32 desktop, white, no highlight | 2: primary yellow + secondary outlined ghost |

Palette + spacing hooks (per variant scope):
- `--rbccm-cta-band-bg-color` -- section outer bg
- `--rbccm-cta-band-card-bg` -- inner card fill
- `--rbccm-cta-band-card-radius` / `--rbccm-cta-band-card-padding` -- card shape
- `--rbccm-cta-band-heading-color` / `--rbccm-cta-band-body-color` -- text tokens

## Buttons

Shared `.rbccm-cta-band__btn` shell + modifier:
- `--primary` -- warm-yellow `#FFC72C` fill, navy text, fly-by arrow animation on hover
- `--secondary` -- transparent + white border, white text (built for dark card bg)

Fly-by animation is namespaced `rbccm-ctab-arrow-flyby` and matches the easing/timing of `.rbccm-maas-mata__btn-icon` and `.rbccm-leading-experts__cta svg`.

## Adding a new variant

1. Author page markup with `class="rbccm-cta-band rbccm-cta-band--{page-slug}"`
2. Add a modifier scope at the bottom of `rbccm-cta-band.css` with the palette/spacing tokens
3. (When wired to TeamSite) Add an `<xsl:when>` in the `$VARIANT_CLASS` map + a matching `<Option>` in the Preset Datum

## Notes

- `.rbccm-cta-band__actions` stacks buttons vertically on mobile, flips to a horizontal row at >=640.
- `.rbccm-cta-band__heading-highlight` is an optional inline span for accented words (yellow in talk-with-an-expert). Wrap any subset of the heading text.
- Ships intentionally without JS -- no runtime state to manage.
