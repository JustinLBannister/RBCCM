# Change a Life Tiles

Client-side consolidation + filter script for the Change a Life page.

## What it does

The Change a Life page renders as multiple separate CMS sections. Authors add tiles to whichever section has room, which produces a visually-fragmented page (main section shows N tiles, overflow sits in hidden sections). This script runs after page load and:

1. Copies every tile from the hidden sections into the main section's grid, so the page renders as a single visual grid.
2. Hides the copied-in tiles by default (only revealed on filter change or "Explore" click).
3. Wires up the topic filter dropdown so ticking a category shows tiles whose eyebrow label (`p.content-label`) matches. A small normalizer bridges checkbox slug values (e.g. `ai-and-innovation`) with the visible label text (e.g. `AI & Innovation`) so `&` vs `and`, casing, and spacing don't break the match.
4. Equalizes tile heights per row (text box + image box) so the grid stays tidy when content varies.
5. Re-equalizes on window resize (debounced).

Requires jQuery (already loaded site-wide on rbccm.com).

## File layout

- `change-a-life-tiles.js` — the script. Configuration lives in the `CONFIG` object at the top.

## Updating the section IDs

TeamSite regenerates numeric section IDs when the page is republished. If tiles stop consolidating (main section only shows its original tiles) or filtering breaks, the IDs are the first thing to check.

1. Open the live page and view source (or inspect).
2. Find the main visible section (usually the one with ~6 tiles). Copy its numeric id.
3. Find the hidden sections (they have `style="display: none"` or similar). Copy each of their ids.
4. Update the values in `CONFIG` at the top of `change-a-life-tiles.js`:
   ```js
   var CONFIG = {
     mainSectionId: '#1756778868629',        // main visible section
     hiddenSectionIds: [
       '#1760735061761',                     // hidden section 1
       '#1756778868630',                     // hidden section 2
       '#1756778868631'                      // hidden section 3
       // add / remove as needed
     ],
     ...
   };
   ```
5. Save, republish the script asset, hard-refresh the page.

## Deploy path

Script deploys to the site's shared JS assets folder alongside other page-specific scripts. Reference it from the Change a Life page's script include list.

## Debugging

The script logs each step to the browser console:
- `Starting tile consolidation...`
- `Consolidated N tiles from #sectionId`
- `Total tiles consolidated: N`
- `Filtering with categories: [...]`
- `Visible tiles: N`
- `Equalized heights for N tiles`

If a section ID is wrong, you'll see:
- `Main section not found with ID: #...` (fatal — nothing else runs)
- `Hidden section not found: #...` (that section skipped, others still process)

Open DevTools before hard-refreshing to catch these on first load.
