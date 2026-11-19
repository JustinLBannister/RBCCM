# RBCCM Expertise

Shared pillar/column-list component. Section header + N pillars, each with an icon, title, and short body. On desktop pillars sit in a 4-column row separated by thin blue dividers; below 1245px the row collapses into a Slick carousel (1 pillar per view <768px, 2 pillars 768-1244px).

## For editors and BAs

### Purpose
A section title and description above four short "pillars", each with an icon, a title and a line or two of body copy. Used on Strategy & Economics (in progress, not live yet) for "Areas of expertise".

Variants:
- Strategy and Economics - Areas of expertise: light-blue section with icons.
- Why RBC Capital Markets: white section, bright-blue pillar titles, no icons. Not on a page in the build config yet.

### What the editor can change
- The variant ("Preset - component variant"), or the matching single-variant skin from the Skin dropdown.
- The section header: "Section title", "Section description" (HTML allowed) and "Header alignment" (Left or Center).
- Four pillars ("Pillar 1" to "Pillar 4"). For each: an icon picked from the library (Globe, Bank, Chart, Search or None), a title and a body (HTML allowed).
- The HTML tag used for the section title, the section description and each pillar's title and body (h1 to h6, p, div or span).
- "Last updated": bump it each time content is saved (format YYYY-MM-DD-HHMM). The Section ID, Section ARIA label and the CSS and JS paths are technical fields set once at deploy.

### What it does not do
- It does not take a fifth pillar. Four is the maximum and the intended number.
- It does not take custom icons. The editor picks from four built-in icons or None; a new icon needs a developer.
- It shows no icons in the Why RBC Capital Markets variant, whatever is picked in the icon fields.
- Pillars are not links and have no button or link field. (A link can only be typed into the body as HTML.)
- The carousel does not advance by itself. No autoplay is set; it moves when the visitor uses the arrows, the dots or the keyboard.
- It does not pull content from anywhere. All copy is typed.

### Limits
- Pillars: built for exactly 4. The field notes say to keep all four filled.
- Variants: 2 (three skins: one with the Preset picker, plus one fixed skin per variant).
- Layout by screen width (set in the script):
  - Under 640px: 1 pillar per view, with arrows and dots.
  - 640 to 991px: 2 per view, with arrows and dots.
  - 992 to 1244px: 3 per view, with arrows and dots.
  - 1245px and up: all 4 in one row with dividers; arrows and dots are hidden.
- Text length: No enforced character limit. The field notes describe the body as one line of copy; pillars in a row are made equal in height to the tallest one.
- Icons: 4 plus None.

### Empty and edge cases
- A pillar with a blank title is left out completely, even if its body and icon are set. The field notes warn this weakens the section and throws off the dividers.
- Blank pillar body: the body is left out and the title stands alone.
- Icon set to None (or blank): no icon space is printed for that pillar.
- Blank "Section title": the heading is left out. Blank "Section description": hidden.
- One pillar only: no carousel is started and the arrows and dots are hidden.
- Preset skin with a blank or unrecognised "Preset": the section does not render. The two fixed skins ignore the Preset field.
- Hidden Figma data pasted in with copy is removed from the output.
- Scripts off (or the carousel library fails to load): the pillars stack in one column at every width, all visible. Below 1245px the arrow buttons still show but do nothing.

### Accessibility
- Headings: the section title is an h2 and each pillar title an h3 by default. The editor can change both with the tag pickers; an invalid value falls back to the default.
- Icons are decorative and hidden from screen readers.
- The arrow buttons are labelled "Previous item" and "Next item". Each dot is labelled "Go to slide N" and the dot group "Choose a pillar".
- A polite live region announces "Item N of M" (M is the number of pillars) when the slide changes.
- Keyboard: Left and Right arrow keys on the controls row move to the previous or next slide; on a focused dot they move from dot to dot. Pillars themselves are skipped by the Tab key because they hold no links or buttons.
- Visible focus styles are defined for the arrows and dots.
- The section's ARIA label is the "Section ARIA label" field (set at deploy; "Areas of expertise" by default).
- Reduced motion: slides change instantly instead of sliding.

### Open questions
- Which page will use the Why RBC Capital Markets variant? It is not in the build config.
- The opening paragraph and the "Responsive breakpoints" table in this README say 1 per view under 768px and 2 per view from 768 to 1244px. The script does 1 / 2 / 3 / 4 per view at under 640 / 640 / 992 / 1245px. Which one matches the approved design?
- What should the section look like with fewer than four pillars at 1245px and up? The files only say it "skews the divider math".

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-expertise.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-expertise.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-expertise.css` and `/assets/rbccm/js/components/rbccm-expertise.js`.

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
