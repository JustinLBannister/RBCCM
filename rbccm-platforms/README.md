# RBCCM Platforms

Section header + 2x2 grid of feature-tile cards. Each card is a navy tile with a right-aligned bg photo that fades under a left-to-right navy gradient; title + body + gold "Explore" CTA sit over the dark left half. Whole card is clickable.

## For editors and BAs

### Purpose
A section title and subtitle above up to six photo tiles, each one linking to a platform, podcast or other destination. It is used on US Credentials (live) and on Strategy & Economics and 2027 Outlook (in progress, not live yet). There is one skin and two presets.

### What the editor can change
- The section title and subtitle, their HTML tags, and the header alignment (Left or Center).
- The section background colour. Blank uses the preset default: light blue (`#E7EEF1`) for Strategy and Economics, white for Outlook 2027.
- Each card (Card 1 to Card 6): a **platform** dropdown. Pick a platform and the tile's title, description, link, button label and photo fill in by themselves. The title, link and photo of a platform are the same everywhere. Its description was written differently for three pages, so the dropdown lists each wording by page: for example "Markets in Motion - Outlook 2027", "Markets in Motion - US Credentials" and "Markets in Motion - Strategy and Economics". Strategic Alternatives reads the same everywhere and has one entry. The tiles show in card order, so to reorder them change which platform each card has.
- A card left on Typed uses its own fields, as before: the desktop photo and mobile photo (picked from the DAM), title, body, CTA copy (for example "Explore" or "Listen") and CTA URL. Use this for a tile that is not one of the six, or that needs its own wording on one page. A card shows when it has a platform picked or a typed title.
- Per card fine-tuning: the title tag and body tag, the photo focal point (which part of the photo stays in view) and the body max-width at desktop (default 340px).
- The Preset field: Strategy and Economics - Platforms, or Outlook 2027 - Platforms.
- Technical fields exist (Section ID, Section ARIA label, CSS path, JS path, Last updated). They are set at deploy; Last updated is bumped on each save.

### What it does not do
- It does not pull content from a feed or a record. The six platforms are written into the skin (`platformText` in `rbccm-platforms.xsl`); changing one there changes it on every page that picks it, after the skin is uploaded.
- It shows six tiles at most. There is no seventh slot, no carousel and no paging.
- A tile has no separate button. The whole tile is the link; the CTA copy is only the visible label.
- It does not darken the photo. The source images have to carry the navy tone behind the text themselves.
- There is no per-tile colour choice.
- It has no script.

### Limits
- Zero to six tiles. One column below 768px wide, two columns from 768px up.
- In the two-column layout, three tiles leave the third alone on the second row.
- Tile height: at least 253px below 992px wide and 200px from 992px; taller when the copy needs it. The Outlook 2027 preset uses a 185px minimum and tighter padding below 992px.
- Photos: the mobile photo is used below 992px and the desktop photo from 992px up. The photo fills the tile and is cropped to fit. No image size or ratio is stated.
- One skin, two presets.
- No enforced character limit. The field labels mark the section title and each card's photos, title, body, CTA copy and CTA URL as required.

### Empty and edge cases
- A card with no platform picked and a blank title is hidden, whatever else is filled in.
- A picked platform ignores that card's typed title, body, link, button label and photos. Focal point, body max-width and the tag fields still apply.
- A tile title, tile body or the subtitle set to h1 prints with its default tag instead (h3, p and p). Those dropdowns list h1 first, and TeamSite saves the first option when nobody chooses, so an untouched tile would otherwise become a second h1 on the page.
- Outlook 2027 preset: the section title is at most 740px wide, so a long title wraps onto two lines.
- Outlook 2027 preset: to choose where the section title breaks on desktop, type a space and then `<br>` at that point in the title (for example `from across <br>RBC Capital Markets`). It breaks there from 992px wide and is ignored on narrower screens, where the title wraps by itself. Keep the space before it, so the two words stay apart when the break is ignored.
- A blank subtitle is hidden. A blank section title is hidden too, although its label says not to blank it.
- A blank card body is hidden. A blank CTA copy hides the label, but the tile is still a link.
- A blank CTA URL makes the tile link to `#`, which goes nowhere.
- A blank mobile photo: the desktop photo is used at every width. Both photos blank: the tile prints with no image, and the tile has no fill colour of its own.
- If the Preset value is not recognised, nothing is printed.
- Scripts off: no change to the content. The component has no script of its own.

### Accessibility
- The section title is an h2 and each card title an h3 by default. The editor can change them with the tag fields (h1 to h6, p, div or span).
- The section is named for screen readers by its visible title. If the title is blank, the Section ARIA label is used.
- Each tile is one link. Screen readers read the title, body and CTA copy as the link name; there is deliberately no separate screen-reader label.
- Image alt text comes from the desktop photo's description in the DAM. If that is blank the card title is used. The mobile photo's description is not read.
- The tile has a visible keyboard focus style, and the arrow icon is hidden from screen readers.
- Reduced motion: the tile lift, photo zoom and arrow movement on hover or focus are turned off.

### Open questions
- Recommended photo dimensions for the desktop and mobile pickers are not stated.
- The page list notes that two new platform cards are still to come for 2027 Outlook. Their content is not in this folder.
- There is no stated guidance on title or body length.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-platforms.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-platforms.css`.

## Status

**v1 ready for TeamSite deploy.** CSS + XSL + Properties + local preview all shipped. `Type="Image"` DAM picker for each of the 4 photo slots, per-card focal point + body-max-width overrides via optional String Datums.

## Files

- `rbccm-platforms.css` -- shared partial + variant modifier. Deploys to `/assets/rbccm/css/components/rbccm-platforms.css`.
- `rbccm-platforms.html` -- local preview, 4 hardcoded cards.
- `rbccm-platforms.xsl` -- Preset-driven TeamSite skin (emits real `<img>` per card).
- `rbccm-platforms-properties.xml` -- Datums (section header + 4 fixed card slots).

## Layout

| Viewport | Behavior |
|---|---|
| <768px | Cards stack full-width, single column, 16px gap |
| >=768px | 2-column CSS Grid, 16px gap |

Card min-height 253 mobile / 200 desktop (Outlook 2027 preset: 185 below 992).

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
| Outlook 2027 -- Platforms | `outlook-2027-platforms` | `.rbccm-platforms--outlook-2027-platforms` |

## Consumers

| Page | Modifier class |
|---|---|
| Strategy & Economics -- Platforms | `.rbccm-platforms--strategy-and-economics-platforms` |
