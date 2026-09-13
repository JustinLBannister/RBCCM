# New Tiles (working name)

Exploratory redesign of the content card / tile pattern. Richer
metadata row, tag chips, multi-action footer, and a progressive-
disclosure "Listen" button that expands into a podcast-platform
picker.

Rename the folder once the pattern settles - candidates: `content-
cards`, `insights-cards-v2`, `podcast-tiles`, or roll into
`story-tiles-default` as a new modifier.

## Anatomy (per card)

- **Media** - 16:9 image with two overlays:
  - Play button, bottom-left (round white outline, blue fill on
    hover)
  - Duration pill, bottom-right (headphone icon + "7 min", dark
    translucent chip)
- **Eyebrow** - "INSIGHTS" (bright blue, uppercase, letter-spaced)
- **Meta row** - icon + label groups separated by a thin `|`:
    date icon + "Feb 2026"
    format icon (headphone) + "Podcast"
    topic icon (tag) + "Healthcare"
    duration icon (clock) + "7 min"
- **Title** - RBCDisplay bold, black
- **Description** - Roboto Light, muted grey
- **Tag chips** - light-blue rounded pills, dark blue text
- **Action row** - primary "Listen" (blue, play icon) +
  secondary Save / Share + overflow (…) menu

## Progressive disclosure: LISTEN

Three states:

1. **Default** - Listen button in the action row.
2. **Hover / Click Listen** - a small popover fades in
   with 5 icon buttons (Apple Podcasts, Spotify, YouTube,
   Amazon Music, More).
3. **Expanded options** - clicking "More" opens a wider panel:
   full platform list (Apple Podcasts, Spotify, YouTube, Amazon
   Music, Pocket Casts, RSS Feed) plus Download MP3 and View
   Transcript actions.

## Files

- `test.html` - local preview showing the 3-card row and the
  3-state disclosure demo side-by-side.

## Interaction notes

- The Listen popover opens on click (not hover - hover-only
  popovers are hostile to touch users).
- ESC closes any open popover.
- Focus is trapped inside the popover while open; closing
  returns focus to the Listen button.
- The "..." overflow button opens the same expanded panel
  from state 3, so users have two ways in.
