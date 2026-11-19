# RBCCM In the Media

Section title + featured video card + list of media appearances + "See all" link. Whole thing lives in a shared component so the same layout can be dropped onto Strategy & Economics (and any future landing page).

## For editors and BAs

### Purpose
Shows the most recent media appearances by RBC experts: one large featured card with an image and play icon, a short list of further appearances, and a "See all" link. The items come from a live rbccm.com media feed, not from fields. Used on Strategy & Economics (in progress, not live yet).

Variants (one today):
- Strategy and Economics - In the media: light-grey section, featured card left and list right on desktop.

### What the editor can change
- The section header: "Section title" (and its HTML tag), "Section subhead" and "Header alignment" (Left or Center).
- The See-all link: label and URL.
- The feed: "Media/press feed URL" and "Total items to render" (1 featured plus the rest as list rows; 4 by default).
- "Featured card hero poster": the image used on the featured card when the feed item has no thumbnail.
- "Preset - component variant": only one option exists today.
- "Last updated": bump it each time content is saved (format YYYY-MM-DD-HHMM). The Section ID, Section ARIA label and the CSS and JS paths are technical fields set once at deploy.
- Nothing else is typed. Every item's title, link, date and thumbnail come from the feed, loaded by the script in the visitor's browser, sorted newest first.
- The script works out the rest from each feed title (for example "RBC TV: Name on Network"): the featured label ("Featured Video Interview", "Featured Podcast", "Featured Talk" or "Featured Media Coverage"), the expert's name and the network.

### What it does not do
- Editors cannot type, pick, pin, reorder or hide individual items. The list is whatever the feed returns, newest first.
- There are no typed or server-printed fallback items. Without the script the cards are empty (see "Empty and edge cases").
- It does not show every feed item. It drops RBC-authored articles and press releases (links starting with /rbccm/ or /assets/rbccm/) and any item whose title does not follow the "Person on Network" pattern.
- It does not play video on the page. The featured card links out to the item, in a new tab.
- It reads one feed URL only. The default is a year-specific address (/en/about-us/data/2026); it does not move to a new year by itself.
- The labels the script writes ("Featured Expert:", "Featured:", "(opens in new tab)", month names) are English only and are not editable.
- No carousel, paging or filters.

### Limits
- Items: 4 by default (1 featured + 3 rows). The script does not enforce a maximum, but the field note says to keep 4, and on desktop each row is sized as one third of the featured card's height, so the design assumes 3 rows. A total of 1 shows the featured card only.
- If the feed has fewer usable items than the total, it shows what there is.
- Variants: 1.
- Text length: titles are shown inside double quotes and cut with "..." when too long: 98 characters on the featured card and 115 in list rows (quotes included).
- Layout: stacked below 992px (title, featured card, list, See all). From 992px, two equal columns with the featured card on the left, the list on the right and the See-all link under the featured card.
- Images: the featured image area is 277px tall and the image is the feed thumbnail or the hero poster. No size or ratio is stated in the files.

### Empty and edge cases
- Script off, feed fails, feed is empty, or no item passes the filter: the visitor (or a crawler that does not run scripts) sees the section title, the subhead, the featured card with only the hero poster and play icon, an empty text area under it, no list rows, and the See-all link. The featured link then points to "#".
- Feed item with no thumbnail: the hero poster is used. If the hero poster is also blank, the image area shows the card's navy fill.
- An item with no expert name parsed from its title: the "Featured Expert" / "Featured" line is left out.
- An item whose date cannot be read: the date is printed as it appears in the feed and the item sorts last.
- Blank "Total items to render" (or 0): 4 is used. Blank feed URL: the default /en/about-us/data/2026 is used.
- Blank "Section title": the heading is left out. Blank subhead: hidden. Blank See-all label: the link is hidden. See-all label with a blank URL: the link points to "#".
- If "Preset" is blank or not recognised, the section does not render.

### Accessibility
- Headings: the section title is an h2 by default and the editor can change it with the tag picker. The featured title and each row title are h3 and cannot be changed.
- The section is labelled by its visible title. If the title is blank, the "Section ARIA label" field is used instead.
- The featured image link is labelled "{featured label}: {full title} (opens in new tab)" once the feed loads. Before that, or without the script, it is labelled "Featured media coverage".
- Row links that open in a new tab are labelled with the full title plus "(opens in new tab)". A row title that was cut keeps its full title as the link's label.
- The featured image has an empty alt (decorative) in every case; the hero poster's DAM Description is not used. The play icon is hidden from screen readers.
- Keyboard: the featured image link, the row title links and the See-all link are normal links with visible focus styles.
- Reduced motion: hover transitions, the See-all arrow animation and the play icon's scale and blur effects are turned off; the play icon only fades when the link is used.
- When the feed fails, the featured card's h3 stays in the page with no text.

### Open questions
- Who updates "Media/press feed URL" when the year changes, and is there a 2027 address? The default points at the 2026 feed only.
- What should the section show when the feed fails or has no usable items? Today it leaves an empty featured card with a link to "#" and an empty heading. Should the section hide instead, or have typed fallback items?
- Is the feed address reachable in TeamSite preview, or only on the published site?
- Should the featured title itself be a link? Today only the image area is.
- Is English-only wording acceptable for the labels the script writes?

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-in-the-media.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-in-the-media.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-in-the-media.css` and `/assets/rbccm/js/components/rbccm-in-the-media.js`.

## Status

**v1 ready for TeamSite deploy.** CSS + XSL + Properties + JS runtime + local preview all shipped. Feed-driven: XSL emits the shell and the sidecar JS fetches the media/press feed, sorts by date desc, splits each concatenated title into source/person via regex, and populates the first 4 items (1 featured + 3 rows).

## Files

- `rbccm-in-the-media.css` -- shared partial + variant modifier. Deploys to `/assets/rbccm/css/components/rbccm-in-the-media.css`.
- `rbccm-in-the-media.xsl` -- Preset-driven TeamSite skin. Emits shell + pushes runtime config onto `window.RBCCM_IN_THE_MEDIA_CONFIG`.
- `rbccm-in-the-media-properties.xml` -- Datums (section header + see-all link + feed URL + item count + hero-poster fallback).
- `rbccm-in-the-media.js` -- Sidecar runtime. Deploys to `/assets/rbccm/js/components/rbccm-in-the-media.js`.
- `rbccm-in-the-media.html` -- local preview with the same runtime hookup.

## DOM shape

```
section.rbccm-in-the-media
  div.rbccm-in-the-media__inner
    h2.rbccm-in-the-media__title                            (always full width)
    div.rbccm-in-the-media__content                         (mobile flex-col, desktop 2-col grid)
      article.rbccm-in-the-media__featured                  (left col desktop)
        div.rbccm-in-the-media__media                       (277 tall)
          img.rbccm-in-the-media__image
          button.rbccm-in-the-media__play                   (glass circle + play triangle)
        div.rbccm-in-the-media__featured-content            (navy pane)
          span.rbccm-in-the-media__eyebrow                  (yellow, uppercase)
          h3.rbccm-in-the-media__featured-title             (white RBC Display serif)
          div.rbccm-in-the-media__featured-expert           (gray Roboto)
      ul.rbccm-in-the-media__list                           (right col desktop)
        li.rbccm-in-the-media__item * N
          div.rbccm-in-the-media__card
            div.rbccm-in-the-media__card-topbar             (source left, date right)
            h3.rbccm-in-the-media__card-title > a           (bright-blue quoted headline)
            p.rbccm-in-the-media__card-featured             ("Featured:" + person)
    a.rbccm-in-the-media__see-all                           (own row so mobile gap works cleanly)
```

## Layout

| Viewport | Behavior |
|---|---|
| <992px | Section stacks: h2 -> featured video -> media list -> See all link |
| >=992px | 2-col grid inside content wrapper (featured left, list right); See all sits under featured column |

## Palette

- Section bg: `#F9F9F9` with `#E5E7EB` border-bottom
- Featured pane bg: `#051B38` (navy deep)
- Featured eyebrow: `#FFC72C` gold
- Featured title: white
- Featured expert credit: `#D7D7D7` gray
- List row rules: `#CCC`
- List title: `#0051A5` bright blue
- List source: `#003168` dark blue
- List date + body: `#383838`

## Content borrowed from filtered-content

The row-item styling (topbar + underline-sweep link + Featured credit) is a direct port of the `--in-the-media-and-press-releases` preset in `filtered-content.css`. Kept the visual DNA identical so both components share the same "media appearance row" vocabulary.

## Consumers

| Page | Modifier class |
|---|---|
| Strategy and Economics -- In the media | `.rbccm-in-the-media--strategy-and-economics-in-the-media` |
