# Case Studies Carousel

Signature case studies presented as one large horizontal card at a
time, with a slick carousel driving prev/next arrows and dot
pagination. Optional H2 + intro paragraph above; optional "View
all" outlined CTA below.

## Anatomy

- **Section header** — H2 (RBCDisplay, dark blue, left-aligned).
  Optional intro paragraph below.
- **Carousel track** — one slide visible at a time on desktop,
  each slide is a horizontal card:
    - **Left (~2/3)** — image, fills the card height.
    - **Right (~1/3)** — white panel with:
      - Uppercase eyebrow (e.g. "EXPERTISE")
      - Short yellow divider
      - Title (bold, black)
      - Description (muted grey, 2-3 line clamp)
      - "X min read" link with chevron
- **Prev / next arrows** — positioned outside the card, vertically
  centred, bright blue chevrons.
- **Dot pagination** — bottom-centre.
- **View all button** — outlined pill, below dots.

## Responsive behaviour

- **Desktop (≥992px)** — slick carousel, 1 slide per view, arrows +
  dots visible.
- **Mobile (<992px)** — slick `unslick` in the responsive config.
  Cards stack vertically as a plain column; no arrows, no dots. The
  "View all" CTA still renders below.

## Slick init

- Init selector is the wrapper `.rbccm-case-studies__track` inside
  each `#rbccm-case-studies` root, so the same component can appear
  more than once on a page and each instance stays isolated.
- Uses accessible-slick (loaded elsewhere on the site; the local
  test.html pulls it from CDN).
- `variableWidth: false`, `slidesToShow: 1`, `slidesToScroll: 1`,
  `infinite: true`, `arrows: true`, `dots: true`.

## Files

- `test.html` — local preview with 4 case study slides and the
  slick config above, wired to CDN slick for demo.
