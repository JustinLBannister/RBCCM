# RBCCM Platforms

Section header + 2x2 grid of feature-tile cards. Each card is a navy tile with a right-aligned bg photo that fades under a left-to-right navy gradient; title + body + gold "Explore" CTA sit over the dark left half. Whole card is clickable.

## Status

**v1 ready for TeamSite deploy.** CSS + XSL + Properties + local preview all shipped. `Type="Image"` DAM picker for each of the 4 photo slots, per-card focal point + body-max-width overrides via optional String Datums.

## Files

- `rbccm-platforms.css` -- shared partial + variant modifier. Deploys to `/assets/rbccm/css/components/rbccm-platforms.css`.
- `rbccm-platforms.html` -- local preview, 4 hardcoded cards.
- `rbccm-platforms.xsl` -- Preset-driven TeamSite skin (emits real `<img>` per card).
- `rbccm-platforms-properties.xml` -- Datums (section header + 4 fixed card slots).
- `photos/` -- local FPO tile art for preview.

## Layout

| Viewport | Behavior |
|---|---|
| <768px | Cards stack full-width, single column, 16px gap |
| >=768px | 2-column CSS Grid, 16px gap |

Card min-height 253 mobile / 200 desktop.

## Palette

- Card bg fallback: transparent (source images carry navy in pixels)
- Border: `rgba(0, 49, 104, 0.05)`
- Title / body / CTA: white / white / gold `#FFC72C`
- Section bg (variant): `#E7EEF1` light blue

## Card layer stack

1. Card fallback -- transparent (no color-flash before img loads)
2. `.__photo` -- real `<img>`, `object-fit: cover`, scaled 1.2x from center at rest, 1.248x on hover
3. Content (title / body / CTA) -- `position: relative`, `z-index: 2`

## Photo hookup

Each card emits an `<img class="rbccm-platforms__photo">` inside the anchor. In the local preview:

```html
<a class="rbccm-platforms__card" href="#">
  <img class="rbccm-platforms__photo" src="photos/rbc-economics.png" alt="" loading="lazy">
  ...
</a>
```

In TeamSite, the XSL reads the DAM path + description off `Card{N}Photo` and emits the `<img>` automatically.

## Per-card overrides (inline custom props)

| Custom property | Datum | Default | Purpose |
|---|---|---|---|
| `--rbccm-platforms-focal` | `Card{N}FocalPoint` | `50% 50%` | Object-position focal point |
| `--rbccm-platforms-scale` | (CSS only) | `1.2` | Rest-state zoom scale |
| `--rbccm-platforms-body-max-width` | `Card{N}BodyMaxWidth` | `340px` | Body cap at desktop (>=992) |

## Consumers

| Page | Preset value | Modifier class |
|---|---|---|
| Strategy and Economics -- Platforms | `strategy-and-economics-platforms` | `.rbccm-platforms--strategy-and-economics-platforms` |

## Consumers

| Page | Modifier class |
|---|---|
| Strategy & Economics -- Platforms | `.rbccm-platforms--strategy-and-economics-platforms` |
