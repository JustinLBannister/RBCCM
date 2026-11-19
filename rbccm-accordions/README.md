# RBCCM Accordions

Shared disclosure/accordion component. One CSS partial, one BEM block (`.rbccm-accordions`), per-page variant modifiers (`.rbccm-accordions--strategy-and-economics-notes`, etc.). Each variant owns its palette + any structural quirks; the base block owns the section shell, container, disclosure interaction, "Expand all" utility, and reduced-motion guards.

## For editors and BAs

### Purpose
A section of short notes that open and close (an accordion): a section title, a short description, an "Expand all" button and a list of notes. Each note shows a category, byline, title and one-line summary; opening it shows the body copy and a read-more link. Used on Strategy & Economics (in progress, not live yet).

Variants (one today):
- Strategy and Economics Notes: dark navy section with expandable notes.

### What the editor can change
- The section header: "Section title", "Section description" (HTML allowed), "Header alignment" (Left or Center) and the two button labels ("Expand-all button label", "Collapse-all button label").
- Up to eight notes ("Item 1" to "Item 8"). For each: category eyebrow, author name, date string, title, one-line summary, expanded body copy, and a read-more label, URL and accessible name.
- The expanded body copy takes HTML, including a video or podcast embed code (Brightcove, YouTube, Vimeo, Spotify, Apple Podcasts) or a `<video>` / `<audio>` tag.
- The HTML tag used for the section title, the section description and each note's category, title and summary (h1 to h6, p, div or span).
- "Preset - component variant": only one option exists today.
- "Last updated": bump it each time content is saved (format YYYY-MM-DD-HHMM). The Section ID, Section ARIA label and the CSS and JS paths are technical fields set once at deploy.

### What it does not do
- It does not pull notes from a feed or from published articles. Every note is typed; the order on the page is the order of the fields.
- It does not sort by date. The date is free text and is printed as typed.
- It shows eight notes at most. A ninth needs a developer change. There is no paging or "load more".
- Opening one note does not close the others. Any number can be open at once.
- No note starts open. All notes are closed when the page loads and there is no field to change that.
- It does not open a note from a link (no deep link to a single note).
- The read-more link has no "open in new tab" option.

### Limits
- Notes: 0 to 8. The skin does not enforce a minimum; three are filled in by default.
- Variants: 1.
- Layout: notes stack in one column at every width. From 992px up, the title and description sit on the left of the header row and the Expand all button on the right; below that they stack.
- Text length: No enforced character limit. The summary field is labelled "one-line summary".
- Embeds: Brightcove, YouTube and Vimeo players and `<video>` fill the card width at 16:9. Podcast players keep the height from their embed code.

### Empty and edge cases
- A note shows when it has a category or a title. A note with neither is left out, whatever else is filled in.
- Blank category, author, date, summary, body or read-more label: that piece is hidden. The " | " between author and date only shows when both are filled.
- A note with no body copy and no read-more label has no +/x toggle and cannot be opened. Expand all skips it.
- A body that is only an embed (no text) still counts as content.
- Read-more label filled but URL blank: the link is still printed, with an empty address.
- Blank "Section title": the heading is left out. Blank description: hidden. Blank button labels: "Expand all" and "Collapse all" are used. The Expand all button always shows, even with no notes.
- Fields that look empty but hold an editor placeholder (an empty paragraph or a non-breaking space) are treated as blank.
- Hidden Figma data pasted in with copy is removed from the output.
- If "Preset" is blank or not recognised, the section does not render.
- Scripts off: all notes stay closed and cannot be opened, so body copy and read-more links cannot be reached.
- Embedded players only load while their note is open, and stop when the note closes (or on Collapse all).

### Accessibility
- Headings: the section title is an h2 and each note title an h3 by default. The editor can change both with the tag pickers; an invalid value falls back to the default. Category and summary default to p.
- Each note's toggle is a real button with `aria-expanded` and a label "Expand note: {note title}" (the category is used when the title is blank). The label text does not change when the note is open; the open or closed state is carried by `aria-expanded`.
- The expanded area is a region linked to its toggle with `aria-controls`. These IDs are built from the Section ID, so each accordion on a page needs its own Section ID.
- The read-more link always has an accessible name: the "read-more accessible name" field if filled, otherwise "{label}: {note title}".
- The Expand all button reports `aria-expanded` true only when every expandable note is open, and its label swaps to the collapse label.
- Keyboard: both controls are native buttons, so Enter and Space work. Clicking anywhere on a note's header, title or summary also toggles it (mouse convenience); clicks inside the open body do not.
- Visible focus outlines are defined for the toggle, the Expand all button and the read-more link.
- An embedded iframe with no title gets "Media: {note title}".
- The section's ARIA label is the "Section ARIA label" field (set at deploy; "Notes" by default).
- Reduced motion: button, card, icon and link transitions and the read-more arrow animation are turned off.

### Open questions
- Desktop design: the Status section below says the desktop (992px and up) styles are a placeholder awaiting spec, but the stylesheet now has desktop rules. Has the desktop layout been signed off?
- Does the TeamSite editor keep `<iframe>` tags when a note's body is saved? (The "Video and podcast embeds" section below asks for a one-time check.)
- Is there a required date format for the "date string" field? The component prints whatever is typed.
- The title and summary labels say "required", but the skin does not enforce it. Should a note with a category and no title be allowed?

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-accordions.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-accordions.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-accordions.css` and `/assets/rbccm/js/components/rbccm-accordions.js`.

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
