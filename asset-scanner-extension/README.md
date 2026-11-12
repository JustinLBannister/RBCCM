# RBCCM Asset Scanner (Chrome extension)

Lists every CSS and JS file the page you're on loads and exports it to a
spreadsheet (CSV opens in Excel / Google Sheets). Scan several pages and
export a comparison to see which assets every page loads and which only
some do.

## Install (once)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this `asset-scanner-extension` folder.
4. Pin it: puzzle-piece icon in the toolbar, then the pin next to
   "RBCCM Asset Scanner".

After editing any file here, click the reload arrow on its card in
`chrome://extensions`.

## Use

- **Scan this page** - lists the page's stylesheets, scripts and inline
  blocks with category, version and size.
- **Download CSV** - one row per asset.
- **Copy for sheet** - same rows, tab-separated; paste into the first cell
  of a sheet.
- **Compare pages** - scan a page, **Add this page**, move to the next page,
  repeat. Then:
  - **Download comparison** - one row per asset, one column per page
    (the version loaded, or "yes"), plus "Pages" (e.g. "5 of 5" = loaded
    everywhere, "1 of 5" = page-specific). Sorted most-shared first.
  - **Download all rows** - every page's rows in one sheet.
  - **Clear** - start a new comparison. Collected pages are kept until
    cleared, even after closing the popup.

## Columns

Page, Page title, Scanned, Order (document order), Type (CSS / JS /
JSON-LD), Source (link tag, script tag, inline, loaded later), Category,
File, Folder, Host, Version (`?v=`), Transfer KB, Size KB, Inline chars,
Load ms, Attributes (async, defer, media...), URL.

**Categories** (first match wins):

| Category | Rule |
|---|---|
| Test path | path contains `/sub/test/` |
| Component | `/assets/rbccm/css/components/` or `/js/components/` |
| Page bundle | `/assets/rbccm/css/bundles/` or `/js/bundles/` |
| LiveSite platform | `/iwov-resources/`, `/iw-cc/`, `livesite` |
| Vendor library | jQuery, Bootstrap, Slick, Owl, animate.css, Font Awesome, Knockout, JsRender, Swiper, GSAP, Lodash |
| Site-wide (rbccm) | anything else under `/assets/rbccm/` |
| Third party | any other host (Marketo, Brightcove, analytics...) |
| Inline / Structured data | `<style>` / `<script>` blocks; JSON-LD |

Edit the `RBCCM_CATEGORIES` list in `lib.js` to change the rules.

## Notes

- Sizes come from the browser's timing data. They're blank for files
  served from cache (transfer) or from other hosts that don't share timing
  data. Reload the page with the cache off (DevTools > Network > Disable
  cache) for full transfer sizes.
- "Loaded later" = CSS/JS fetched after the page loaded (by another
  script, `@import`, etc.) that isn't a tag in the page.
- Chrome won't let extensions scan `chrome://` pages or the Web Store.
- Nothing is sent anywhere: the scan runs in your browser and the files
  download locally.
