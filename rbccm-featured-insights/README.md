# RBCCM Featured Insights

A hand-picked "Featured insights" section: a section title and optional subhead, four insight tiles (one large featured tile and three regular tiles) and a "View all" link at the bottom left. Each tile is a single link with an image, eyebrow, title, description and a meta line such as "6 min listen". Below 992px the tiles become a carousel.

## For editors and BAs

### Purpose
Promotes four chosen insights (articles, episodes, case studies) with a link through to the full insights list. Used on Strategy & Economics (in progress, not live yet).

Variants:
- Default: base spacing, transparent background.
- Strategy and Economics - Featured insights: pale background and spacing tuned for that page.

### What the editor can change
- The section header: "Section title", "Section title tag", "Section subhead" and "Header alignment" (Left or Center).
- The variant ("Preset - component variant").
- "Tile source", one setting for all four tiles:
  - DCR picker: the editor picks an article for each tile ("Tile N : DCR"). The server prints that article's title, description, link and thumbnail.
  - Pinned URL: the editor pastes an article address into "Tile N : pinned URL". The server prints the typed fields first; then the script looks the address up in the insights feeds and replaces the title, description and link with the feed's.
  - Manual: only the typed fields are used. Nothing is picked or looked up.
- For each of the four tiles: eyebrow, title, description, meta (for example "6 min listen"), link URL and image (picked from the DAM; its Description is the alt text).
- In DCR picker mode a typed title, description, link or image wins over the picked article's value. To let the picked article show, leave that typed field blank.
- "Tile N : title length" and "Tile N : description length": type default, full, or custom=N (see Limits).
- "Tile feed URLs": the comma-separated list of insights feeds used for pinned URLs.
- The View all link: label, URL and accessible name.
- "Last updated": bump it each time content is saved (format YYYY-MM-DD-HHMM); it is also the cache version for the CSS and JS. The CSS and JS paths are fixed in the skin, not fields.

### What it does not do
- It does not pull the latest insights by itself. Each tile is picked, pinned or typed by hand, and the order is the order of the fields.
- It always prints four tiles. There is no fifth tile and no way to show fewer.
- The featured (large) tile is always Tile 1. It cannot be moved to another slot.
- The eyebrow, meta line and image alt are never taken from an article or the feed; they are always typed. The feed never supplies an image.
- It does not show the date, topic or region. Those fields exist but the stylesheet hides them on the page.
- It does not use "Tile N : accessible name". The field is kept as a note but is not printed.
- The carousel does not advance by itself. No autoplay is set.
- There is no carousel from 992px up; all four tiles show at once.

### Limits
- Tiles: exactly 4.
- Variants: 2 (one skin).
- Layout by screen width:
  - Under 600px: carousel, 1 tile per view, with arrows and dots.
  - 600 to 991px: carousel, 2 tiles per view, with arrows and dots.
  - 992px and up: no carousel. Tile 1 spans the full row with its image on the right and copy on the left; Tiles 2 to 4 sit in three columns below it.
- Title length: 70 characters by default. Description length: 170 by default. "full" removes the limit; "custom=N" sets another number. Longer text is cut at the last whole word and ends with "..." (which counts toward the limit). When a description is cut, any bold, italics or links in it are removed. The same limits apply to text from a picked article or the feed.
- Images: no size or ratio is stated in the files. From 992px the image band is 280px tall on the featured tile (half the tile's width) and 240px tall on the regular tiles; images are cropped to fit.
- Feeds: the default "Tile feed URLs" cover 2024, 2025 and 2026. The field note says to update the list once a year.

### Empty and edge cases
- A tile with blank fields is still printed. In Manual mode a blank title leaves an empty tile, not a hidden one.
- DCR picker mode with no article picked: the typed fields are used. If those are blank too, the tile is empty unless it has a pinned URL that the feeds can match.
- Pinned URL not found in any feed, or the feeds fail to load: the server-printed content stays as it is.
- A tile in DCR picker mode that also has a pinned URL: when the feeds contain that article, the script replaces the printed title, description and link with the feed's values.
- Blank meta: the text is empty but the small arrow next to it is still printed.
- Blank image (and no article thumbnail): the image tag is printed with no source.
- Blank "Section subhead": hidden. Blank "Section title": an empty heading is still printed.
- Blank View all label: the link is still printed, showing only its arrow.
- A "Tile source" value that is not recognised is treated as DCR picker.
- Hidden Figma data pasted in with copy is removed from the subhead and descriptions.
- Scripts off (or a crawler that does not run scripts): all four tiles are in the page as printed by the server, with typed or picked-article values. Pinned-URL lookups do not happen, so a tile that relies only on a pinned URL shows its typed fields, or nothing if they are blank. Below 992px the tiles stack in one column and the arrow buttons show but do nothing. From 992px the layout is unchanged.

### Accessibility
- Headings: the section title prints as an h2. Every tile title is also an h2 and cannot be changed by the editor.
- The section's ARIA label is fixed as "Featured insights"; it does not follow the section title.
- Each tile is one link. It has no separate label, so screen readers read the eyebrow, title, description and meta as the link's name.
- Image alt text is always the Description on the tile's own image field. If that is blank the alt is empty, including when the picture shown is a picked article's thumbnail.
- The View all link uses "View all : accessible name" as its label when filled; otherwise its visible text.
- Carousel (below 992px): arrow buttons are labelled "Previous insight" and "Next insight"; each dot "Go to slide N"; the dot group "Choose an insight". A polite live region announces "Item N of 4" on each change.
- Keyboard: Left and Right arrow keys on the controls row move to the previous or next slide; on a focused dot they move from dot to dot.
- Visible focus styles are defined for the tiles, the arrows, the dots and the View all link.
- The tiles are a list (ul / li). While the carousel is active the carousel library wraps each item, which automated checks can flag; the skin notes this as a known limitation of the library.
- Reduced motion: slides change instantly, and the tile hover and View all arrow animations are turned off.

### Open questions
- Do "Preset - component variant", "Header alignment" and "Section title tag" take effect in TeamSite? The skin reads these three picker fields differently from "Tile source" (and from the other components), so it needs a check in TeamSite preview that the Strategy and Economics preset, Center alignment and H4 actually change the page.
- "Section title tag" offers H3, but the skin has no H3 case and prints an h2. Should H3 be supported or removed from the list?
- The Preset field marks the Strategy and Economics option as selected but its stored default value is "default". Which is intended for a new instance?
- Should tile titles be h3 under the section's h2, and should editors be able to change them?
- The field notes say a blank title hides the tile; the skin prints it anyway. Which is wanted?
- The field notes describe the pinned URL in DCR picker mode as a safety net, and say typed values win. The script replaces the printed title, description and link whenever the feeds have the article. Which should win?
- The meta field label says blank hides the meta line, but the arrow still prints. Should the whole line hide?
- Who adds the 2027 feed to "Tile feed URLs", and when?
- What image size should editors upload for the featured tile and the regular tiles?
- Dates are hidden "for now" per the stylesheet. Will they return?

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-featured-insights.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-featured-insights.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-featured-insights.css` and `/assets/rbccm/js/components/rbccm-featured-insights.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-featured-insights.xsl` | TeamSite skin. Prints the section, the four tiles and the View all link, and loads the CSS and JS. |
| `rbccm-featured-insights-properties.xml` | The editor's fields (preset, header, tile source, four tiles, View all). |
| `rbccm-featured-insights.css` | Styles. Deploys to `/assets/rbccm/css/components/rbccm-featured-insights.css`. |
| `rbccm-featured-insights.js` | Script: pinned-URL feed lookup and the carousel below 992px. Deploys to `/assets/rbccm/js/components/rbccm-featured-insights.js`. |
| `rbccm-featured-insights.html` | Local preview page showing the Strategy and Economics variant. |
