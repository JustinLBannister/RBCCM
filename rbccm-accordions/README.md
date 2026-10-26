# RBCCM Accordions

Shared disclosure/accordion component. One CSS partial, one BEM block (`.rbccm-accordions`), per-page variant modifiers (`.rbccm-accordions--strategy-and-economics-notes`, etc.). Each variant owns its palette + any structural quirks; the base block owns the section shell, container, disclosure interaction, "Expand all" utility, and reduced-motion guards.

## Files

- `rbccm-accordions.css` -- shared partial. Base block + all variant modifiers. Ships to `/assets/rbccm/css/components/rbccm-accordions.css`.
- `rbccm-accordions.xsl` -- Preset-driven TeamSite skin. Renders section header + up to 8 note slots.
- `rbccm-accordions-properties.xml` -- Datum declarations (Preset selector + header Datums + 8 note slots x per-field text + tag pickers).
- `rbccm-accordions.js` -- vanilla IIFE for expand/collapse per item + "Expand all" toggle. Ships to `/assets/rbccm/js/components/rbccm-accordions.js`.
- `rbccm-accordions.html` -- local preview showing the S&E Notes variant with 3 items (item 2 pre-expanded so both states are visible in one screenshot).

## What the base block owns

- Section shell + container max-width + horizontal gutter
- Disclosure primitives (`.is-open`, `aria-expanded`, `aria-controls`)
- Base "Expand all" pill button (border + padding + hover state)
- Font-family lock on titles (defends against unified.css tag-level rules)
- Tag-agnostic margin/padding resets on `.__title`, `.__description`, `.__item-eyebrow`, `.__item-title`, `.__item-summary`
- `prefers-reduced-motion: reduce` guard

## Semantic tag picker

Every editable text field is a pair: `<Field>Text` (String / Textarea) and `<Field>Tag` (enum picker: h1 | h2 | h3 | h4 | h5 | h6 | p | div | span). The XSL emits the chosen tag via `xsl:element name="{...}"` so authors can promote a title to `<h2>` for SEO, drop a category eyebrow to a `<p>`, etc. `pickTag` guards against typos -- anything outside the allow-list falls back to the semantically-neutral default.

Defaults:
- Section title: `h2`
- Section description: `p`
- Item category eyebrow: `p`
- Item title: `h3`
- Item summary: `p`

## Repeater

8 note slots exposed by default in Properties.xml (Item1..Item8). A slot renders only when its `Item{N}CategoryText` Datum is non-blank, so authors leave later slots empty for shorter lists. All 8 slots share the same field shape via a single `renderSlot` template -- no duplicated XSL body.

Bump the slot count by copying an Item block in Properties.xml and adding one more `<xsl:call-template name="renderSlot">` line in the XSL loop.

## Consumers

| Page | Modifier class | Notes |
|---|---|---|
| Strategy & Economics | `.rbccm-accordions--strategy-and-economics-notes` | Dark navy #031B37 bg, yellow eyebrow, white RBC Display titles, gray body, semi-transparent card fill |
| _(candidates)_ Other RBCCM landing pages | TBD | Palette + structure per Figma; drop a modifier block at the bottom of `rbccm-accordions.css` |

## Adding a new variant

1. Author page markup with `class="rbccm-accordions rbccm-accordions--{page-slug}"` on the outer `<section>`
2. Add a new `--{page-slug}` modifier block at the bottom of `rbccm-accordions.css` with the variant's palette + any structural overrides
3. Add a new `<xsl:when test="$PRESET = '{page-slug}'">` branch in `rbccm-accordions.xsl`
4. Add a new `<Option>` to the Preset Datum in Properties.xml
5. Load `rbccm-accordions.css` in the consumer page **before** any page-specific CSS

## Deploy checklist

1. Push `rbccm-accordions.css` -> `/assets/rbccm/css/components/rbccm-accordions.css`
2. Push `rbccm-accordions.js` -> `/assets/rbccm/js/components/rbccm-accordions.js`
3. Publish the TeamSite skin (xsl + properties)
4. Bump `CacheVersion` Datum after every sidecar deploy so browsers pull the new files

## Interaction

- Click any `.__item-toggle` button -> toggles that item's `.is-open` + swaps `aria-expanded`
- Click `.__expand-all` (`data-accordions-expand-all`) -> expands every item in that instance. When all items are already open, clicking collapses them. Button label swaps between the `data-label-expand` and `data-label-collapse` strings (defaults "Expand all" / "Collapse all"; overridable via the Datums of the same names).
- Keyboard: both toggles are native `<button>`s so Enter/Space work by default. `:focus-visible` outline lands on the yellow icon so the focus ring stays legible on the dark bg.
- ARIA: each `.__item-expanded` is a `role="region"` referenced by the toggle's `aria-controls`.
- Expand all / Collapse all always renders; blank label Datums fall back to the defaults. It only opens notes that have something to expand.
- Blank fields are left out, including editor placeholders like `<p><br data-mce-bogus="1"></p>`. A note shows when it has a category or a title; a note with no body and no read-more link has no toggle.

## Video and podcast embeds

Paste an embed code (Brightcove, YouTube, Vimeo, Spotify, Apple Podcasts...) or a `<video>` / `<audio>` tag into a note's body field, on its own or between paragraphs.

- **Sizing:** embeds fill the card width. Brightcove / YouTube / Vimeo iframes and `<video>` keep 16:9; podcast players keep the height from their embed code. Embeds already in a responsive wrapper (iframe with `position: absolute`) are left alone.
- **Loading:** iframe players only load while their note is open (src is held in `data-rbccm-src`), so closed notes don't load players on page load.
- **Stopping:** collapsing a note (or Collapse all) unloads its iframes and pauses `<video>`, `<audio>` and Brightcove in-page players.
- **Accessibility:** an iframe without a `title` gets "Media: {note title}".
- A body that is only an embed (no text) still counts as content.
- Check once in TeamSite preview that the editor keeps the `<iframe>` tag when saving.

## Status

- **Mobile CSS:** [done] complete per Figma spec (padding 60/23, header stacked, 22px gap header, 32px gap header->list, 24px gap between items, item card 20px padding + 15px radius).
- **Desktop CSS:** [pending] stubbed. `@media (min-width: 992px)` block is a placeholder at the bottom of the CSS file -- awaiting spec.
- **XSL / JS / Properties:** [done] complete and verified via a defaults-driven XSLT round-trip.

## Related

- Palette + typography tokens intentionally sit alongside those in `rbccm-hero.css` (`--rbccm-hero-navy-dark`, `--rbccm-hero-yellow`) so a Strategy & Economics page consuming both components reads as one visual system without either component reaching into the other's CSS.
