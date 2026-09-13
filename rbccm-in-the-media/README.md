# RBCCM In the Media

Section title + featured video card + list of media appearances + "See all" link. Whole thing lives in a shared component so the same layout can be dropped onto Strategy & Economics (and any future landing page).

## Status

**v1 ready for TeamSite deploy.** CSS + XSL + Properties + JS runtime + local preview all shipped. Feed-driven: XSL emits the shell and the sidecar JS fetches the media/press feed, sorts by date desc, splits each concatenated title into source/person via regex, and populates the first 4 items (1 featured + 3 rows).

## Files

- `rbccm-in-the-media.css` -- shared partial + variant modifier. Deploys to `/assets/rbccm/css/components/rbccm-in-the-media.css`.
- `rbccm-in-the-media.xsl` -- Preset-driven TeamSite skin. Emits shell + pushes runtime config onto `window.RBCCM_IN_THE_MEDIA_CONFIG`.
- `rbccm-in-the-media-properties.xml` -- Datums (section header + see-all link + feed URL + item count + hero-poster fallback).
- `rbccm-in-the-media.js` -- Sidecar runtime. Deploys to `/assets/rbccm/js/components/rbccm-in-the-media.js`.
- `rbccm-in-the-media.html` -- local preview with the same runtime hookup.
- `photos/` -- local FPO thumbnail for hero-poster fallback.

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
