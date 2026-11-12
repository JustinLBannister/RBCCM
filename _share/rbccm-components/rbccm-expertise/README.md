# RBCCM Expertise

Shared pillar/column-list component. Section header + N pillars, each with an icon, title, and short body. On desktop pillars sit in a 4-column row separated by thin blue dividers; below 1245px the row collapses into a Slick carousel (1 pillar per view <768px, 2 pillars 768-1244px).

## Files

- `rbccm-expertise.css` -- shared partial + all variant modifiers. Deploys to `/assets/rbccm/css/components/rbccm-expertise.css`.
- `rbccm-expertise.xsl` -- Preset-driven TeamSite skin. Section header + 4 pillar slots + icon library.
- `rbccm-expertise-properties.xml` -- Datum declarations (Preset selector + header Datums + 4 pillars x icon-name + text + tag pickers).
- `rbccm-expertise.js` -- vanilla jQuery IIFE that lazy-loads Slick from CDN on first mobile init. Deploys to `/assets/rbccm/js/components/rbccm-expertise.js`.
- `rbccm-expertise.html` -- local preview with 4 pillars matching the S&E Figma.

## Base block owns

- Section shell + container max-width
- Font-family lock on tag-pickable text nodes (defends against unified.css `!important` overrides)
- Tag-agnostic margin/padding reset
- 4-column desktop grid with 2px blue dividers between pillars
- Mobile/tablet Slick slider chrome + a11y live-region announcer
- Reduced-motion guard

## Semantic tag picker

Every editable text field ships as a pair: `<Field>Text` (String/Textarea) + `<Field>Tag` (enum: h1|h2|h3|h4|h5|h6|p|div|span). The XSL emits the chosen tag via `xsl:element name="{...}"` with a `pickTag` allow-list guard.

Defaults: section title `h2`, section description `p`, pillar title `h3`, pillar body `p`.

## Icon library

Icons are inline SVGs dispatched by name via `xsl:choose` inside the `iconSvg` template. Every icon uses `currentColor` + a 32x32 viewBox so variant CSS drives color from `.__pillar-icon { color: ... }`.

Current library:
| Name | Icon |
|---|---|
| `globe` | Latitude/longitude globe (Geopolitics) |
| `bank` | Classical building with columns (Economics) |
| `chart` | Ascending bar chart with data-point cap (Equity Markets) |
| `search` | Magnifying glass (Cross-Asset Strategy) |
| `none` | Skip the icon slot for this pillar |

Add more by:
1. Adding a new `<xsl:when>` branch in the `iconSvg` template with the inline SVG
2. Adding a matching `<Option>` to every `Pillar{N}IconName` Datum in Properties.xml

## Consumers

| Page | Modifier class |
|---|---|
| Strategy & Economics - Areas of expertise | `.rbccm-expertise--strategy-and-economics-expertise` |
| Why RBC Capital Markets | `.rbccm-expertise--why-rbc-capital-markets` |

## Presets

Presets swap only the palette + a few structural bits -- same shared skeleton, XSL, JS.

| Preset value | Bg | Border | Pillar title | Pillar body | Icons | Description |
|---|---|---|---|---|---|---|
| `strategy-and-economics-expertise` | `#E7EEF1` light blue | 1px warm gray | Navy | Warm gray | Shown | Shown |
| `why-rbc-capital-markets` | `#FFFFFF` white | 2px bright blue `#0051A5` | Bright blue | Black | **Hidden** (CSS) | Usually empty |

Palette hook: `--rbccm-expertise-bg-color` is set per variant scope; other colors override direct declarations under the variant scope.

## Adding a new variant

1. Author page markup with `class="rbccm-expertise rbccm-expertise--{page-slug}"`
2. Add a modifier block at the bottom of `rbccm-expertise.css` with the variant's palette
3. Add a new `<xsl:when test="$PRESET = '{page-slug}'">` branch in `rbccm-expertise.xsl`
4. Add a new `<Option>` to the Preset Datum in Properties.xml

## Deploy checklist

1. Push `rbccm-expertise.css` -> `/assets/rbccm/css/components/rbccm-expertise.css`
2. Push `rbccm-expertise.js` -> `/assets/rbccm/js/components/rbccm-expertise.js`
3. Publish the TeamSite skin (xsl + properties)
4. Bump `CacheVersion` Datum after every sidecar deploy

## Responsive breakpoints

| Viewport | Layout |
|---|---|
| >=1245px | CSS grid, 4 columns side-by-side with 2px blue dividers |
| 768-1244px | Slick slider, 2 pillars per view |
| <768px | Slick slider, 1 pillar per view |

Prev/Next arrows + dot navigation appear in slider mode only. Keyboard-accessible (arrow keys on the controls row scrub prev/next; arrow keys on a focused dot move dot-to-dot).

## Palette notes

Palette tokens intentionally sit alongside `rbccm-hero` / `rbccm-accordions` so the whole Strategy & Economics page reads as one visual system -- dark blue `#003168`, bright blue `#0051A5`, light-blue bg `#E7EEF1`, warm gray `#494949`.
