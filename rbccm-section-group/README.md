# RBCCM Section Group

Wraps a run of separately placed sections in one div, so a shared background (the MAAS+MATA dark-strip gradient) runs continuously behind them. For pages built component by component, where the builder can't nest sections inside a wrapper.

## How to use

1. Add **Group start** (skin `rbccm-section-group--start.xsl`) directly above the first section of the group.
2. Add the sections as normal.
3. Add **Group end** (skin `rbccm-section-group--end.xsl`) directly below the last one.
4. Give both the same Group name (default `dark-strip`).

Neither outputs anything visible. On page load, `rbccm-section-group.js` moves everything between the two markers into:

```html
<div class="rbccm-section-group rbccm-section-group--dark-strip rbccm-maas-mata__dark-strip"
     style="--rbccm-sg-pad-top: 222px;" data-rbccm-section-group="dark-strip"> ... </div>
```

Sections inside need a transparent background so the gradient shows (CTA band: Transparent background = yes; capability cards MAAS+MATA skin is already transparent).

## Fields (shared properties file)

- **Group name**: pairs a start with its end. Use different names for more than one group on a page.
- **Wrapper classes** (start only): default is the MAAS+MATA dark strip. `rbccm-section-group--dark-strip` carries the gradient; `rbccm-maas-mata__dark-strip` keeps existing maas-mata.css rules working.
- **Presets:** `rbccm-section-group--dark-strip` (MAAS+MATA dark strip, default) and `rbccm-section-group--deep-band` (MAAS+MATA deep band: use classes `rbccm-section-group--deep-band rbccm-maas-mata__deep-band`, Space above 0).
- **Space above** (start only): top padding in px, default 222 (the video poster above overlaps 200px into it).
- CssPath, JsPath, CacheVersion; optional wrapper aria-label.

## How the wrap works

- Finds the closest element containing both markers and moves its children from the one holding the start marker to the one holding the end marker into the new div, in order. Works with TeamSite's flat `.iw_component` list or with layout rows (whole rows get wrapped, so keep the markers in the same row as the sections, or at row level).
- The end skin loads the script right after its marker, so the wrap happens while the page is still loading, before carousels, animations and first paint. It runs again on DOMContentLoaded as a fallback.
- Missing end marker: nothing is wrapped (sections render as they are).

## Test in TeamSite

Check the page in the TeamSite page editor as well as preview/live. The script moves the component divs in the DOM; if the editor has trouble with that, we can make the script skip itself in edit mode.
