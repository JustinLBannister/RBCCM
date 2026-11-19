# RBCCM Section Group

Wraps a run of separately placed sections in one div, so a shared background (the MAAS+MATA dark-strip gradient) runs continuously behind them. For pages built component by component, where the builder can't nest sections inside a wrapper.

## For editors and BAs

### Purpose
An invisible helper that gives a run of sections one shared background. It is placed as a pair: "Group start" above the first section and "Group end" below the last one. When the page loads, everything between the two is wrapped together so the background runs behind all of it without a break. Used on MAAS+MATA (live), where it makes the dark navy strip behind several sections.

Variants (skins), always used together:
- Group start (`rbccm-section-group--start.xsl`): marks where the group begins and holds the wrapper settings.
- Group end (`rbccm-section-group--end.xsl`): marks where the group ends and loads the script.

### What the editor can change
- "Group name": pairs a start with its end. It must be the same on both.
- On the start component: "Wrapper classes", which picks the background (the MAAS+MATA dark strip by default, or the MAAS+MATA deep band), and "Space at the top of the wrapper" in px.
- An optional wrapper aria-label (usually left blank).
- Technical fields exist and are set at deploy: CSS path, JS path and "Last updated" (cache version).

### What it does not do
- It shows nothing by itself: no text, image, link or heading.
- It has no colour picker. The background is one of the two presets in the stylesheet (dark strip, deep band). Any other look needs a developer to add it.
- It does not make the sections inside it transparent. Each section between the markers needs its own background set to transparent, or it will cover the shared background.
- The end component's wrapper settings are not used. Only the start component's "Wrapper classes", space and aria-label count.
- It does not work without its script. The wrap happens in the browser as the page loads.

### Limits
- Always one start and one end per group. Any number of sections can sit between them.
- More than one group can be on a page; give each pair its own Group name.
- Two skins (start and end). Two background presets.
- "Space at the top of the wrapper": digits only, in px. The default 222 leaves room for the video poster above, which overlaps 200px into the group. Use 0 for the deep band.
- Text length: No enforced character limit (the component outputs no visible text).

### Empty and edge cases
- Group name blank: `dark-strip` is used. Spaces typed in the name become hyphens.
- Wrapper classes blank: the MAAS+MATA dark strip is used.
- Space at the top blank: 222.
- End component missing, or the two names do not match: nothing is wrapped and the sections show as they are, with no shared background.
- End placed above the start: nothing is wrapped.
- Scripts off: nothing is wrapped. Sections set to transparent then show whatever the page background is.
- When the page uses layout rows, whole rows are wrapped, so keep both markers in the same row as the sections (or at row level).

### Accessibility
- The component outputs no headings, links, buttons or images. Its two markers are hidden from all users, including screen readers.
- The wrapper it builds is a plain container with no role. If the optional aria-label is filled in, it is copied onto that container.
- Sections are moved into the wrapper in their original order, so reading order and tab order do not change.
- There is no keyboard, focus or motion behaviour.

### Open questions
- How the TeamSite page editor copes with the script moving components around is not confirmed in the files (see "Test in TeamSite" below).
- The wrapper has no role, so it is not confirmed that screen readers read out the optional aria-label. Confirm whether that field is needed.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-section-group.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-section-group.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-section-group.css` and `/assets/rbccm/js/components/rbccm-section-group.js`.

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
