# Secondary Nav — progress notes

## What this is

A horizontally scrollable secondary navigation row that sits below the page
hero. Replaces the legacy `mobile-scroll-nav` component (Bootstrap markup +
jQuery active-state logic) with a modern BEM-named, framework-free build.

## Files in this folder

- **`secondary-nav.html`** — canonical BEM markup. Ready to embed / port into
  the consuming template.
- **`secondary-nav.css`** — component stylesheet. Mobile-first base, with
  a `1200px+` breakpoint override for larger padding and larger active-state
  triangle.
- **`local-test.html`** — browser test bed. Includes a demo strip, a page
  hero, the nav rendered inline, and all the interactive JS (arrow buttons,
  scroll progress bar, scroll-to-current). Open this to iterate visually.
- **`legacy-reference.html`** — old jQuery `mobile-scroll-nav` markup kept
  for reference. Do NOT ship. Only useful for porting the URL-detection
  active-state logic if we decide to replicate it.

## What's done

### Structure and markup

- BEM classes throughout: `.secondary-nav`, `.secondary-nav__inner`,
  `.secondary-nav__wrapper`, `.secondary-nav__list`, `.secondary-nav__item`,
  `.secondary-nav__arrow`, `.secondary-nav__progress-bar`.
- `<nav aria-label="Secondary navigation">` root for a11y.
- Active item marked with both `.active` class and `aria-current="page"` on
  the `<a>`. Both drive the yellow triangle indicator via CSS.

### Layout

- Two-row structure: `.secondary-nav__inner` (arrows + wrapper flex row) on
  top, `.secondary-nav__progress-bar` full-width sibling underneath.
- List centered by default at every breakpoint (`justify-content: center`).
- When the list overflows the wrapper, JS adds `.is-overflowing` on the
  nav → list flips to `flex-start` so items align to the wrapper's left
  edge instead of getting pushed under the prev arrow (fixes the
  centering-with-overflow negative-offset quirk).
- Wrapper hides its scrollbar cross-browser (Chrome/Safari via
  `::-webkit-scrollbar`, Firefox via `scrollbar-width`, IE/Edge via
  `-ms-overflow-style`).

### Prev / next arrow buttons

- 20×20 circular buttons in RBC dark blue (`#003168`), scaled down from the
  32×32 pattern in the leadership carousel.
- Chevron SVG is 8×8 inside the circle (proportional 40%).
- Round button face drawn via `::before` positioned at the center of the
  stretched flex box. The button element itself uses `align-self: stretch`
  so its bounding box fills the full row height — which lets the divider
  span top-to-bottom.
- Hover / focus-visible: circle fills solid blue with a white chevron.

### Vertical dividers

- 1px `#c0c0c0` line drawn via `::after` on each arrow.
- Spans the FULL nav row height (not just the button height) because the
  arrow's flex item stretches vertically via `align-self: stretch`.
- Prev arrow → line on the right; next arrow → line on the left. Visually
  marks where the scrollable list "starts" and "stops."

### Arrow state management (JS)

- **`.is-not-needed`** → `display: none` on the arrows. Applied whenever
  the list fits inside the wrapper (no overflow to scroll through).
- **`disabled` attribute** → muted gray state (`#c0c0c0` border and chevron,
  `cursor: default`, `pointer-events: none`). Applied to the arrow at
  whichever end the scroll has bottomed out against. Arrow stays visible so
  the affordance doesn't jump — it just goes inactive.
- Also mirrored via `.is-disabled` class so consumers that can't set the
  DOM attribute get the same styling.

### Scroll behavior

- Click prev / next → scrolls the wrapper by 80% of its visible width
  (roughly one "page" of items, with a bit of overlap so the user sees
  continuity between pages). Smooth animation via CSS
  `scroll-behavior: smooth`.
- On load, if the wrapper is overflowing:
  - If there's an active/current item → wrapper scrolls instantly so that
    item is centered in the visible portion.
  - If no active/current item → wrapper scrolls to `scrollLeft: 0`.
  - Initial scroll uses `behavior: 'auto'` so there's no visible "wobble"
    animation on page load.

### Scroll progress bar

- 3px full-width bar under the nav, `#c0c0c0` background.
- Blue fill (`#184997`) grows proportionally from 0% (fully scrolled left)
  to 100% (fully scrolled right).
- Updates on `scroll` and `resize`. When there's no overflow at all,
  clamped to 0%.

## Open items / next up

- [ ] **Port URL-based active-state logic** from `legacy-reference.html`.
      Right now the active state is hardcoded on the first item. We need a
      framework-free equivalent of the jQuery block that detects
      `window.location.href` and sets `.active` + `aria-current="page"` on
      the matching item.
- [ ] **Keyboard nav** — arrow keys to move focus between items, focus
      visible states. Not implemented yet.
- [ ] **Re-center current item on resize** — currently `scrollToInitial()`
      only runs once on load. If the viewport is resized in a way that
      changes overflow state, we don't re-center. Judgment call whether
      this is desired.
- [ ] **Consuming template integration** — decide where this lives in the
      RBCCM CMS. XSL? Static include? Component-level?

## Related in-flight work

Feed situation (Insights JSON Builder demo hosted at
`justinlbannister.github.io/Insights-JSON-Builder/`) needs to come back to.
Last state: swapped from `allorigins.win` (was down) to a 4-proxy fallback
chain — codetabs → allorigins/raw → corsproxy.io → allorigins/get. Need to
push the fix to the demo repo and verify the failover kicks in.
</content>
</invoke>