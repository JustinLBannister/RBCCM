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

## For editors and BAs

### Purpose

A list that visitors can filter, search and page through. One component does this for four kinds of content; the editor picks which one with the Preset field. Newest items come first in every preset.

- `in-the-media-and-press-releases` (In the Media / About pages): rows of media coverage and news releases. The most recent items (up to 200, the "Maximum Items" setting) are printed into the page from a TeamSite query when the page is published. After the page loads, the script adds newer items that link to outside sites from this year's live feed, and loads a year from its live archive when a visitor picks that year in the Year filter.
- `conference-insights` (Conference Insights): one featured tile and a grid of insight tiles. The items come from the live insights feeds for 2024, 2025 and 2026, kept to the stories named in a whitelist JSON file. The script adds them after the page loads.
- `deals-and-transactions` (Transactions; the "Deals preview skin" section below records this skin as live there): deal cards from the live deals feed, added by the script, with an optional featured deal typed by the editor above the filters.
- `etf-innovators` (ETF Innovators, in progress, not live yet): episode cards from the live insights feeds, 2023 to the current year, kept to ETF Innovators links. A JSON file adds the company, category and any corrections. The script adds the cards after the page loads.
- A second skin, `filtered-content--deals-preview.html`, is for deal preview pages only. See "Deals preview skin" below.

### What the editor can change

- The preset. It is typed, not picked from a list, and must match one of the four names exactly.
- The section heading (blank hides it) and the screen reader name of the section ("Section ARIA label").
- How many items show per page: in the default view, when a filter is active, and on phones.
- Which filters show: the Type, Year, Month and Region dropdowns and the search box, each with its own true/false field. On In the Media, whether each row shows its region tag.
- The wording of the filter bar: the "Filter by:" label, the Clear filters button, the search box placeholder and its two screen reader labels.
- The wording of the "no results" message: heading, message, emphasised line and button label.
- Deals only: the featured deal above the filters (image and its alt text, date, title, up to three paragraphs, a link, its label and whether it opens in a new tab). A blank title hides it.
- In the Media only: the list of years offered in the Year dropdown ("Year dropdown values"). Add each new year at the front of the list; the first year is treated as the current year.
- Technical fields exist and are set at deploy: section ID, CSS and JS paths, the cache buster, the In the Media query settings and per year archive address, the internal article page, and the ETF episodes JSON path.

### What it does not do

- The editor does not pick, add, remove or reorder list items in TeamSite, in any preset. Items come from the query or the feeds, newest first.
- Conference Insights, Deals and ETF Innovators items are not in the page as published. The script adds them in the visitor's browser. Only In the Media rows are printed at publish.
- ETF Innovators episode titles, companies, categories, speakers and hidden episodes are not TeamSite fields. They are in `etf-innovators-episodes.json`, which is uploaded as a file. The Conference Insights whitelist is a file too.
- The editor does not type the dropdown options. They are built from the items that loaded, and a dropdown with nothing to offer hides itself. The exceptions are the In the Media Year list (typed) and Month (always all twelve months).
- Each dropdown takes one choice at a time. Choices in different dropdowns narrow the list together.
- There is no sort control. The order is always newest first.
- Search does not read the full article. It looks at the text held for each item (title and description; for In the Media also the outlet and featured person; for deals the title, role, amount and type; for ETF episodes the title, speaker, company and category) plus the item's filter values.
- Conference Insights does not pick up a new year by itself. The feed years (2024 to 2026) are set in the script, so adding 2027 needs a developer.
- Deals: pending deals show in the unfiltered list only. As soon as any filter or search is used they drop out, and they do not count towards the dropdown options.
- Deals: the amount slider and the per-option counts are built but hidden by the stylesheet.
- In the Media: rows loaded for an older year carry less detail than the published rows (date, title, description and type only; no outlet, featured person or region tag), and they do not match a Region filter.
- It does not show a message when the list is empty and no filter is in use (see "Empty and edge cases").
- It does not remember a visitor's filters between visits. The filters and page number are held in the page address, so a filtered view can be bookmarked or shared.

### Limits

- Presets: 4, plus the separate skin for deal preview pages.
- Items: no fixed maximum for the feed presets; everything that matches is loaded and paged. In the Media prints up to 200 items at publish ("Maximum Items") and adds more as years are chosen.
- Page size: set per instance. The field defaults are 10 (default view) and 10 (filtered). ETF Innovators uses 6 and 6, and 3 on phones. The first page of the unfiltered list uses the default-view size; later pages and every filtered page use the filtered size. Under 768px the phone size, when set, replaces both.
- Page numbers shown at once: up to 7 on phones, 9 on tablets (768 to 1023px), 11 on desktops (1024px and up), with "..." for the gap.
- Items per row: In the Media, one row per item at every width. Conference Insights, 1 below 768px, 2 from 768px, 3 from 992px; from 992px the first tile is the featured tile and spans the full row on the first unfiltered page. Deals, 1 below 600px, 2 from 600px, 3 from 992px. ETF Innovators, 1 below 768px, 2 from 768px, 3 from 992px.
- Region choices: Global, US, Canada, Europe, APAC. Country codes on the items are grouped into these.
- Deals transaction types are listed in a fixed order: Mergers and Acquisitions, Equity Capital Markets, Debt Capital Markets, Gold Stream.
- Featured deal: 0 to 3 paragraphs; the image is optional.
- Text length: No enforced character limit on the typed fields. Conference Insights tile descriptions from the feed are cut at 150 characters, at a whole word, with "...".
- Image sizes: none are stated in these files.

### Empty and edge cases

- Blank section heading: no heading. Blank featured deal title: no featured deal. A featured deal with no image shows text only; with no link it shows no link; with a blank link label the link reads "Read more".
- A filter combination with no matches: a "no results" block shows with the heading, a sentence built from the chosen filters (for example "We couldn't find any episodes from {company} in 2023."), the emphasised line and a Clear filters button. The typed "Empty state message" is only used if that sentence cannot be built.
- Feed empty, feed failed, or the Conference Insights whitelist failed to load: the heading and filter bar show, the list is empty and there is no message. Dropdowns with nothing to offer hide themselves.
- ETF Innovators JSON failed to load: the episodes still show from the feed, without the Company filter values, category labels or corrections.
- One year's feed failed (Conference Insights, ETF Innovators): the other years still load.
- In the Media, an older year cannot be loaded: the script tries the oldest year's archive instead; if that also fails the "no results" block shows.
- In the Media, while a year is loading: grey placeholder rows show in place of the list.
- Fewer items than one page: no page numbers show. Both "Items per page" fields blank or 0: everything shows on one page.
- A deal with no amount in the feed shows "Undisclosed". A deal with no logo shows without one.
- Section ID blank: the list never becomes visible, because the script reveals the list through the section's ID. Keep it filled in and unique on the page.
- A preset name typed wrongly: no items are loaded (In the Media rows are not printed either).
- No script, or the script fails: the heading, the featured deal and the filter bar show, but the filters do nothing and the list is not visible. In the Media rows are in the page source but stay hidden until the script reveals them; the other presets have no items at all. A crawler that does not run scripts therefore reads the In the Media rows and nothing from the other three lists.
- ETF Innovators "latest episode" link: if the episodes cannot load, a link to `#latest-episode` elsewhere on the page stays as it is.

### Accessibility

- Headings: the section heading is an h2 and so is the featured deal title. In the Media row titles and ETF episode titles are h3. Conference Insights tile titles are h2. Deal names on the cards are plain text, not headings. The "no results" heading is an h3. The editor cannot change the levels.
- The section is a landmark named by "Section ARIA label" (prefilled "Filter articles"), not by the heading. Give each instance a name that fits its content.
- Dropdowns: each is a button named "Filter by Year" (and so on) that says whether it is open, and opens a list of options. Enter, Space or Down arrow opens it; Up and Down move; Home and End jump; Enter or Space chooses; Escape closes and returns focus to the button; Tab closes. After a choice, focus returns to the button.
- The dropdown button keeps the name "Filter by Year" for screen readers after a choice is made. The choice itself is given by the selected option and by the active-filter chips.
- Active filters appear as chips in a list named "Active filters". Each has a remove button named, for example, "Remove Year filter: 2023".
- Search box: has a hidden label and an ARIA label; both are editable.
- Cards: a Conference Insights tile, a deal card and an ETF episode card are each one link. The tile is named by its category, title and reading or watching time; the episode by its title, speaker, date and watch time; the deal card by "Link to" plus the role when the feed has a role, otherwise "Deal:" plus the title. On In the Media rows only the title is a link.
- Images: tile and episode thumbnails are treated as decoration (empty alt text). Deal logos are background images with no text alternative. The featured deal image uses "Featured deal : image alt text"; blank makes it decoration.
- In the Media links to outside coverage open in a new tab. Nothing tells screen reader users this in advance.
- Pagination: a navigation region named "Pagination" with "Previous page", "Next page" and "Page 3" style names. The current page is marked, and the arrows are disabled at each end. After a page change the page scrolls to the top of the filter bar and focus stays on the matching page button.
- Changes to the list (number of results, a new page, the "no results" block) are not announced to screen readers.
- Focus styles: the dropdowns, options, chips, Clear filters, page buttons and cards have a visible focus style. The In the Media row title shows an underline on focus instead of an outline.
- Reduced motion: the scroll after a page change jumps instead of gliding, and the loading shimmer, the list fade-in and the card hover motion are switched off.

### Open questions

- Live status of the In the Media and Conference Insights instances. The page manifest (`build/pages.config.mjs`) lists this component for ETF Innovators only.
- The page sizes and filter settings used on the In the Media, Conference Insights and Transactions instances. Only the ETF Innovators instance settings are written down here.
- Whether news releases are in the In the Media rows printed at publish. The fields file says the query was widened to include them; a note in the script says the published list does not include them.
- The US region choice also returns items tagged Global. The script marks this as temporary until stories can be tagged US. Is that still wanted?
- Who updates the Conference Insights feed years when 2027 stories arrive (see "What it does not do").
- Several 2023 ETF Innovators episode titles in the JSON file are marked as drafts to confirm with the content team.
- Whether the missing detail on older In the Media rows (no outlet, featured person or region) is acceptable, or the archive feed should supply it.
- The ETF Innovators page has no address yet, so the live URL is not recorded.

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/filtered-content.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/filtered-content.js` |
| Data (ETF Innovators episodes) | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/data/etf-innovators-episodes.json` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/filtered-content.css`, `/assets/rbccm/js/components/filtered-content.js` and `/assets/rbccm/js/components/data/etf-innovators-episodes.json`.

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

`filtered-content--deals-preview.html` lets a preview page list deals the live Transactions list leaves out: by default, deals saved in TeamSite that have no publish date yet (`TeamSite/Templating/DCR/Type:rbccm/deals AND TeamSite/Metadata/publishdate:=0000-00-00`). It is the main skin as live on Transactions (2026-10-20) plus one addition for the deals preset: the deal list is loaded from the deals feed page with that query.

To set up a preview page:

1. Copy the Transactions page. The skin adds a robots noindex, nofollow tag to the page itself, so the page settings don't need it.
2. On its filtered-content component, pick the **deals-preview** skin and keep the `deals-and-transactions` preset.
3. Clear the featured deal title if the preview shouldn't show the live featured deal.
4. Bump the cache buster.

The component's Query box doesn't change the list: LiveSite runs that query but doesn't pass its text to the skin. To show a different set of deals, add a `DealsQuery` String field to the component and type the query there. The skin sends the query (with `qPagesize=1000`) to the deals feed page (`DealsFeedUrl`, blank = `/en/expertise/transactions/data/deals.page`, the live list's feed; `deals-preview.page` leaves out the transaction type, so the Transaction type filter would hide itself), so it depends on that feed page accepting `qQuery` from the URL, which it does today.

Pending deals show in the unfiltered list only (as on Transactions), so with mostly pending deals the Year and Transaction type dropdowns are nearly empty.

Never pick this skin on the live Transactions page. Everything the preview page lists is public: the page, the feed URL and each deal's own page.

---

## Deploy checklist

1. Upload `filtered-content.js` and `filtered-content.css` to `/assets/rbccm/js/components/` and `/assets/rbccm/css/components/`.
2. ETF Innovators: upload `etf-innovators-episodes.json` to `/assets/rbccm/js/components/data/`.
3. Update the skin (`filtered-content.html`) and the Properties file in TeamSite.
4. Bump `CacheVersion` on every instance.
5. Replace the files in `_production/` with the uploaded copies.
