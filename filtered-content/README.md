# Filtered Content

One component, four presets: a filter bar (dropdowns, optional search, Clear filters, active-filter chips) over a paginated list of cards. Every preset shares the same filter engine and pagination; each preset brings its own data source and card template.

| Preset | Used on | Data source | Card |
|---|---|---|---|
| `in-the-media-and-press-releases` | In the Media / About pages | Server rendered by the skin from a MetaQueryExternal query, older years fetched on demand | Row: outlet + date, title link, Featured person, region + type tags |
| `conference-insights` | Conference Insights | Insights feeds (2024-2026) + a whitelist JSON | Featured tile + 3-up insight tiles |
| `deals-and-transactions` | Transactions | Deals feed | Tombstone cards, optional featured deal above the filters |
| `etf-innovators` | ETF Innovators | Insights feeds (2023 onward) + `etf-innovators-episodes.json` | 3-up episode cards (thumbnail, pill, play badge, category, title, speaker, date + watch time) |

The Preset field sets the modifier class on the section (`rbccm-filtered-content--<preset>`); the JS picks the matching adapter from that class.

---

## Files

| File | What it is |
|---|---|
| `filtered-content.html` | TeamSite skin (XSL). Despite the extension, this is not a preview page. |
| `filtered-content--deals-preview.html` | Second skin, for deal preview pages only. See "Deals preview skin" below. |
| `filtered-content-properties.xml` | Properties + Data fields for all presets. |
| `filtered-content.js` | Filter engine (part 1), preset adapters (part 2), coordinator (part 3). Ships to `/assets/rbccm/js/components/filtered-content.js`. |
| `filtered-content.css` | All presets. Ships to `/assets/rbccm/css/components/filtered-content.css`. |
| `etf-innovators-episodes.json` | ETF Innovators settings, company names, category rules and per-episode overrides. Ships to `/assets/rbccm/js/components/data/etf-innovators-episodes.json`. |
| `local-test.html` | Local preview of all four presets. Each preset is labelled with `data-variant`, so page previews can keep just one. |
| `_local-data/` | Trimmed copies of the 2023-2026 insights feeds for the local ETF preview. Not deployed. |
| `_production/` | Copies of the files currently live, for before/after comparison (`local-test.html?assets=production`). Do not edit. |
| `_src-*.js` | The original separate scripts the component was merged from. Reference only. |

---

## How a preset loads

1. The coordinator finds each `.rbccm-filtered-content` section and reads its preset from the modifier class.
2. If the list already holds items (In the Media renders them server side), it binds the filters straight away.
3. Otherwise the preset's adapter fetches its feed(s), builds the cards and then binds the filters.
4. The filter engine builds each dropdown from the items' `data-<filter>` attributes, so a dropdown with no matching data hides itself.

Filters and the page number are written to the URL (`?company=vanguard&year=2023&page=2`), so a filtered view can be linked to.

---

## ETF Innovators preset

**Where the episodes come from.** The adapter loads the insights feed for every year from `settings.firstYear` to the current year (`/en/insights/data/{year}-insights`) and keeps the items whose link matches `settings.linkMatch` (`etf-innovators` or `etf_innovators`). Old `story.page?dcr=` duplicates in the 2023 feed are dropped, then anything with the same title. New episodes appear on their own.

**What the JSON adds.** The feed has no company, category or speaker title, so `etf-innovators-episodes.json` fills those in:

| Key | Purpose |
|---|---|
| `settings` | `firstYear`, `linkMatch`, `titlePrefix` (stripped from titles), `pillLabel` ("Full Episode"), `dateFrom` (`url` = the month in the article URL, `feed` = the feed date) |
| `companies` | Names for the Company filter. Each is looked for in the title, then tags, then description; `match` is an optional pattern when the name alone will not match (e.g. `"BMO"`). |
| `categoryRules` | Ordered keyword rules for the label above the title. Checked against tags + title, then description; first match wins. |
| `overrides` | Keyed by the last part of the episode URL. Any of `title`, `company`, `category`, `speaker`, `date` (e.g. `May 2026`), `watch` (e.g. `8 min`), `thumbnail`, `hidden: true`. |

An override with a `title` and `url` for an episode not in the feed adds it by hand (give it `date` and `thumbnail` too). Keys starting with `_` are notes.

**What each card shows.**
- Title: feed title without the "ETF Innovators:" prefix. The 2023 titles are just the guest's name, so those use overrides.
- Speaker: from the 2023 title ("Kathy Bock, Head, Vanguard Canada"), otherwise the guest named in the author field plus the company.
- Date: the URL month by default (the feed date runs later on several episodes).
- Watch time: `watchtime`, or `readtime` on video items that have no watch time.

If the JSON fails to load, the grid still renders from the feed alone, without company, category or overrides.

**Latest episode link.** Once the episodes load, any link on the page to `#latest-episode` is pointed at card 1 of the unfiltered list (the newest episode). The ETF hero's "Watch the latest interview" button uses this: set its button URL to `#latest-episode`. Its screen reader label becomes "Watch the latest interview: {episode title}" unless the button has its own aria label. If the list can't load, the link stays on `#latest-episode`. When the episode has a video (the feed's `<video>` Brightcove URL), the link also gets `data-video-src` and `data-video-label`, and a normal click plays the episode in the page's video modal (rbccm-video-poster). Cmd/Ctrl-click, new tab and crawlers still get the episode page.

**Instance settings.** Preset `etf-innovators`, Section heading "Explore the full series", Items per page 6 / 6, Items per page on mobile 3, Show Type / Month / Region / Search `false`, Show Year `true`, Filter by label "Filter by:".

---

## Fields (Data)

| Field | Presets | Notes |
|---|---|---|
| `Preset` | all | Type one exactly: `in-the-media-and-press-releases`, `conference-insights`, `deals-and-transactions`, `etf-innovators`. |
| `SectionID`, `SectionAriaLabel` | all | Unique id per page; screen reader name for the section. |
| `SectionHeading` | all | h2 above the filters. Blank hides it. |
| `PageSize`, `PageSizeFiltered` | all | Items per page in the default view and when a filter is active. |
| `PageSizeMobile` | all | Optional page size under 768px (both views). Blank uses the two above. |
| `ShowType`, `ShowYear`, `ShowMonth`, `ShowRegion`, `ShowSearch` | all | Dropdown / search visibility. The ETF Company dropdown is always on for that preset. |
| `ShowRegionTag` | In the Media | Region tag on each row. |
| `FilterByLabel`, `ClearFiltersLabel` | all | Filter bar labels. |
| `SearchPlaceholder`, `SearchAriaLabel`, `SearchScreenReaderLabel` | with search | Search input text. |
| `EmptyHeading`, `EmptyMessage`, `EmptyMessageEmphasis`, `EmptyClearLabel` | all | No-results state. The message is rewritten from the active filters when it can be ("We couldn't find any episodes from AllianceBernstein in 2023."). |
| `Featured*` | Deals | Featured deal above the filters. Blank title hides it. |
| `ViewPage`, `AvailableYears`, `YearFeedUrlTemplate` | In the Media | Article fallback link; Year dropdown values; per-year archive URL. |
| `EtfEpisodesUrl` | ETF Innovators | Path to `etf-innovators-episodes.json`. |
| `CssPath`, `JsPath`, `CacheVersion` | all | Sidecar paths; bump `CacheVersion` after each upload. |

---

## Section attributes the engine reads

Set by the skin from the fields above; useful when building a test page by hand.

| Attribute | Purpose |
|---|---|
| `data-page-size`, `data-page-size-filtered`, `data-page-size-mobile` | Pagination sizes. |
| `data-empty-*` | No-results text. `data-empty-message-subject` is the noun ("episodes"). |
| `data-available-years`, `data-year-feed-template` | In the Media year archive. |
| `data-option-counts` | Builds hidden per-option counts (Deals). |
| `data-episodes-url`, `data-feed-url-template`, `data-asset-origin` | ETF Innovators: episodes JSON, per-year feed URL (`{year}`), and an origin prefix for root-relative links and images (local preview only). |

Items can carry `data-<filter>-label` next to `data-<filter>` (e.g. `data-company="t-rowe-price" data-company-label="T. Rowe Price"`) so the dropdown, chips and empty message show the proper name instead of a title-cased slug.

---

## Local testing

Serve the repo root (the `rbccm-root` / `rbccm-root-alt` preview servers) and open `/filtered-content/local-test.html`. The ETF section reads the trimmed feeds in `_local-data/` and shows thumbnails from rbccm.com.

Opened straight from disk (`file://`), the browser blocks the feed requests, so the page draws a saved snapshot of the 11 episodes instead (the FPO block near the end of `local-test.html`). Filters and pagination work the same.

`local-test.html?assets=production` swaps in the files from `_production/` to compare against what is live.

---

## Deals preview skin

`filtered-content--deals-preview.html` lets a preview page list deals the live Transactions list leaves out, such as deals that have been saved in TeamSite but don't have a publish date yet. It is the main skin as live on Transactions (2026-10-20) plus one addition for the deals preset: the deal list is loaded with **this component's own Query and Maximum Items**.

To set up a preview page:

1. Copy the Transactions page (noindex it).
2. On its filtered-content component, pick the **deals-preview** skin and keep the `deals-and-transactions` preset.
3. In the component's **Query**, type the deals to show. Deals with no publish date yet:
   `TeamSite/Templating/DCR/Type:rbccm/deals AND TeamSite/Metadata/publishdate:=0000-00-00`
   (deals are `rbccm/deals`; `article/news` is the news-story type and returns news, not deals).
4. **Maximum Items** caps how many come back.
5. Clear the featured deal title if the preview shouldn't show the live featured deal.

The skin sends the Query and Maximum Items to the deals feed page (`DealsFeedUrl`, blank = `/en/expertise/transactions/data/deals-preview.page`) as `qQuery` and `qPagesize`, so it depends on that feed page accepting them from the URL, which it does today.

Pending deals show in the unfiltered list only (as on Transactions), so with mostly pending deals the Year and Transaction type dropdowns are nearly empty.

Never pick this skin on the live Transactions page. Everything the preview page lists is public: the page, the feed URL and each deal's own page.

---

## Deploy checklist

1. Upload `filtered-content.js` and `filtered-content.css` to `/assets/rbccm/js/components/` and `/assets/rbccm/css/components/`.
2. ETF Innovators: upload `etf-innovators-episodes.json` to `/assets/rbccm/js/components/data/`.
3. Update the skin (`filtered-content.html`) and the Properties file in TeamSite.
4. Bump `CacheVersion` on every instance.
5. Replace the files in `_production/` with the uploaded copies.
