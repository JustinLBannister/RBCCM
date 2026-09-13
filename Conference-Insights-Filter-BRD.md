# Conference Insights Filter

**Business Requirements & Implementation Summary — with Component Reference Guide**

Year, Region & Topic taxonomy — end-to-end filter for the Conference Insights landing page.

| | |
|---|---|
| **Prepared by** | Justin Bannister · GlueIQ |
| **For** | Joe · Lauren · RBCCM Digital Team |
| **Date** | July 2, 2026 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Solution Overview](#3-solution-overview)
4. [Data Model](#4-data-model)
5. [Hero Component — Reference Guide](#5-hero-component--reference-guide)
6. [Filter By Component — Reference Guide](#6-filter-by-component--reference-guide)
7. [Tiles Component — Reference Guide](#7-tiles-component--reference-guide)
8. [Article DCR — Reference Guide](#8-article-dcr--reference-guide)
9. [Assembling a Conference Insights Page (Step-by-Step)](#9-assembling-a-conference-insights-page-step-by-step)
10. [User Workflows](#10-user-workflows)
11. [Deployment Reference](#11-deployment-reference)
12. [Success Criteria & Testing](#12-success-criteria--testing)
13. [Future Enhancements](#13-future-enhancements)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

The Conference Insights landing page now supports year, region, and topic filtering across all published conference articles. Readers can narrow the article grid instantly by any dimension — search across titles, filter by year, filter by regional relevance or origination, and drill into specific topics like Energy Transition or Financial Institutions.

The system was built to match Joe's July 2 taxonomy: nine topics that map cleanly to RBCCM's coverage, five regional buckets that align with existing content routing, and year-based grouping (versus month-level) for filter dropdowns that stay useful as content volume grows.

Setup is functionally complete. The remaining operational work is publishing the article DCR schema update and retro-tagging existing articles per Joe's spreadsheet. Neither requires additional development.

> **Bottom line for Lauren:** development is done. Publish the DCR + start tagging = go-live. No further engineering blockers.

---

## 2. Business Objectives

### 2.1 Problem statement

The Conference Insights landing page currently displays all articles in a single ungrouped grid. As RBCCM's conference coverage has scaled to 90+ articles across multiple years, geographies, and topics, readers have no way to narrow to what they care about. This creates a poor discovery experience for anyone arriving via nav, share links, or newsletter — the article they want is somewhere in the list, but they'd have to scroll and scan to find it.

### 2.2 Goals

- Give readers three intuitive filter dimensions that map to how they think about content: **when, where, and what**.
- Preserve the editorial hero experience — a featured article at the top of the unfiltered view — while adding utility below.
- Keep the tagging workflow low-friction for authors: check boxes on the article DCR at publish time, no separate metadata step.
- Match RBCCM's design system so the filter feels native to the site, not a bolted-on utility.
- Make the taxonomy flexible enough to evolve — topics can be added, secondary tags introduced later, without a re-architecture.

### 2.3 Non-goals

- This project does not address auto-population of the tile grid from a centralized article feed. Articles are added to the page manually via the Story Tile picker. A future enhancement (Section 13) would automate this via an InsightsList DCR.
- This project does not build cross-hub content browsing. Platform tagging is captured in the DCR for that future work but not consumed by this filter.

---

## 3. Solution Overview

Three loosely-coupled components + one schema update. Each is independent and reusable across other RBCCM pages.

| Component | Role | Reusable? |
|-----------|------|-----------|
| **Hero** | Breadcrumbs, page title, subtitle | ✅ any landing page |
| **Filter By** | Year / Region / Topic dropdowns, search, pagination, empty state | ✅ any listing page |
| **Tiles** | Article grid: featured hero + 3-up cards | ✅ any insight landing page |
| **Article DCR** | Adds Year, Topic, Regional, Conference, Platform fields | ✅ one schema for all article types |

**Reader experience:**
- **Default:** featured hero card at top + 3-up grid below + pagination.
- **Filtered:** hero collapses to dense 3×2 grid — utilitarian browsing mode.
- **Empty:** branded empty state with a Clear filters CTA.
- **Keyboard/screen-reader:** full a11y — Tab through dropdowns, focus retention on pagination, ARIA live regions.

---

## 4. Data Model

Five fields the filter reads from each article DCR. All optional — untagged articles still render as tiles, they just don't contribute filter values.

### 4.1 New DCR fields

| Field | Type | Required | Filter dimension |
|-------|------|----------|------------------|
| `publish_date` | Text (existing) | No | Year (derived from YYYY prefix) |
| `topic` | Multi-checkbox (9 options) | No | Topic |
| `regional_origination` | Single-select (5 options) | No | Region |
| `regional_relevancy` | Single-select (5 options) | No | Region |
| `associated-conferences` | Container (up to 3 refs) | No | Bidirectional link to conferences |
| `platform` | Single-select (4 options) | No | Reserved for cross-hub filtering |

### 4.2 Topic taxonomy (Joe's July 2 list)

| Author label | DCR value |
|--------------|-----------|
| Energy | `energy` |
| Energy Transition | `energy-transition` |
| Financial Institutions | `financial-institutions` |
| Healthcare | `healthcare` |
| Industrials | `industrials` |
| Markets & Economics | `markets-economics` |
| Mining & Materials | `mining-materials` |
| Power, Utilities & Infrastructure | `power-utilities-infrastructure` |
| Technology & Innovation | `technology-innovation` |

### 4.3 Region taxonomy

| Region | Included ISO codes / labels |
|--------|-----------------------------|
| Global | global |
| US | us, usa, global |
| Canada | ca, canada |
| Europe | be, fr, de, it, ie, lu, ch, gb, uk, ae, europe, emea |
| APAC | au, hk, my, sg, apac, asia, asia-pacific |

> **Why both regions?** Joe's spreadsheet uses Region 1 (source) and Region 2 (additional relevance). Combining both into `data-region` means an article written in the US but relevant globally shows up under both filters — matches reader mental model without doubling author work.

### 4.4 Year filter

Derived from the first four characters of `publish_date` (YYYY-MM-DD format). Dropdown shows unique years across tagged articles, sorted descending (newest first). No new DCR field — uses existing `publish_date`.

---

## 5. Hero Component — Reference Guide

### 5.1 Purpose

Renders the top-of-page identity block on any landing page. Breadcrumbs → H1 → subtitle. Nothing more, nothing less.

### 5.2 Rendered DOM shape

```html
<section class="rbccm-conference-insights-hero" id="rbccm-conference-insights-hero" aria-labelledby="…">
  <div class="rbccm-conference-insights-hero__inner">
    <nav class="rbccm-conference-insights-hero__breadcrumbs" aria-label="Breadcrumb">
      <ol class="rbccm-conference-insights-hero__breadcrumb-list">
        <li class="rbccm-conference-insights-hero__breadcrumb"><a href="/">Home</a></li>
        <li class="rbccm-conference-insights-hero__breadcrumb"><a href="/en/about-us">About Us</a></li>
        <li class="rbccm-conference-insights-hero__breadcrumb rbccm-conference-insights-hero__breadcrumb--current">
          <a href="#" aria-current="page" onclick="return false;">Conferences</a>
        </li>
      </ol>
    </nav>
    <h1 class="rbccm-conference-insights-hero__title" id="…">Conference insights</h1>
    <p class="rbccm-conference-insights-hero__subtitle">Voices that shaped the market.</p>
  </div>
</section>
```

### 5.3 All Datums

**Content:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `HeroTitle` | String | `Conference insights` | H1 text. Set blank to omit H1 (breadcrumb-only hero). |
| `HeroSubtitle` | String | `Voices that shaped the market.` | Subtitle paragraph. Set blank to omit. |

**Layout / spacing overrides (all optional, blank = component default):**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `PadTopMobile` | String | `40px` | Mobile top padding. Include unit (`24px`, `2rem`). |
| `PadBottomMobile` | String | `40px` | Mobile bottom padding. |
| `PadTopDesktop` | String | `64px` | Desktop top padding. |
| `PadBottomDesktop` | String | `48px` | Desktop bottom padding. |

**Breadcrumbs (replicatable Group — click "Add Breadcrumb" for each crumb):**

| Group Datum | Type | Purpose |
|-------------|------|---------|
| `Label` | String | Crumb display text (e.g., "Home", "About Us"). |
| `Href` | String | URL to link to. Leave blank on the current-page crumb — XSL falls back to `#` + `onclick="return false;"` |
| `IsCurrentPage` | Boolean | Marks the crumb with `aria-current="page"` + `--current` CSS modifier. Safety net: last crumb is auto-marked as current even if this is left false. |

### 5.4 Configuration recipes

**Recipe: Standard conference insights page (this is how you should do it)**

1. Drop the Hero component onto the page
2. Set `HeroTitle` = `Conference insights`
3. Set `HeroSubtitle` = `Voices that shaped the market.`
4. Add three Breadcrumb rows:
   - Row 1: Label=`Home`, Href=`/`, IsCurrentPage=false
   - Row 2: Label=`About Us`, Href=`/en/about-us`, IsCurrentPage=false
   - Row 3: Label=`Conferences`, Href=(blank), IsCurrentPage=true
5. Leave all padding Datums blank (use component defaults)
6. Save + publish

**Recipe: Deeper page (four breadcrumb levels)**

Just add a fourth Breadcrumb row above the current-page crumb — hero handles unlimited crumbs.

**Recipe: Custom vertical spacing on a page with a tight design**

Set `PadTopDesktop` = `32px` and `PadBottomDesktop` = `24px`. Leave mobile blank.

### 5.5 Do's & Don'ts

- ✅ Include the last breadcrumb as its own row — it becomes the current page marker
- ✅ Use `disable-output-escaping` compatible HTML in Title/Subtitle if you need inline `<strong>` or `<em>` (the XSL passes through)
- ❌ Don't leave the `Href` blank on a **non**-current breadcrumb — it'll render as a dead link
- ❌ Don't set custom padding values without a unit (`40`, not `40px`) — CSS won't apply them

---

## 6. Filter By Component — Reference Guide

### 6.1 Purpose

The Year / Region / Topic filter that lives above the tiles. Reads `data-*` attributes off items in the container, auto-populates dropdowns from unique values found. Also manages pagination, search, empty state, and the "featured hero on page 1" logic.

### 6.2 Rendered DOM shape (with `insights` preset)

```html
<section class="rbccm-filter" data-container="#rbccm-conference-insights-tiles" data-page-size="4" data-page-size-filtered="6" …>
  <div class="rbccm-filter__inner">
    <div class="rbccm-filter__row">
      <div class="rbccm-filter__filter-group">
        <span class="rbccm-filter__filter-label">Filter by:</span>
        <div class="rbccm-filter__select-wrap" data-filter="year">
          <button type="button" class="rbccm-filter__select" aria-haspopup="listbox" aria-expanded="false">
            <span class="rbccm-filter__select-label">Year</span>
          </button>
          <svg class="rbccm-filter__select-chevron">…</svg>
        </div>
        <div class="rbccm-filter__select-wrap" data-filter="region">…</div>
        <div class="rbccm-filter__select-wrap" data-filter="topic">…</div>
      </div>
      <label class="rbccm-filter__search">
        <svg class="rbccm-filter__search-icon">…</svg>
        <input type="search" class="rbccm-filter__search-input" data-filter="search" placeholder="…">
      </label>
      <button type="button" class="rbccm-filter__reset">Clear filters</button>
    </div>
  </div>
</section>
```

At runtime, the filter JS auto-injects a pagination `<nav>` and an empty state `<div>` **inside the container** it targets (not inside the filter itself).

### 6.3 All Datums

**Preset:**

| ID | Type | Default | Options |
|----|------|---------|---------|
| `Preset` | SelectSingle | `insights` | `insights` / `upcoming` / `custom` — auto-fills theme, page sizes, empty-state copy, container selector |

**Theme override:**

| ID | Type | Default | Options |
|----|------|---------|---------|
| `Theme` | SelectSingle | (blank = preset default) | `light` / `dark` |

**Container binding:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `Container` | String | `#rbccm-conference-insights-tiles` | CSS selector for the section the filter targets. |
| `ItemSelector` | String | (blank = `[data-search-text]`) | CSS selector for filterable items inside the container. |

**Padding overrides:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `PadTopMobile` | String | `40px` | Mobile top padding. |
| `PadBottomMobile` | String | `40px` | Mobile bottom padding. |
| `PadTopDesktop` | String | `43px` | Desktop top padding. |
| `PadBottomDesktop` | String | `43px` | Desktop bottom padding. |

**Labels (all Strings, i18n-ready):**

| ID | Default | Purpose |
|----|---------|---------|
| `AriaLabel` | `Filter conference insights` | Screen-reader label for the section |
| `FilterByLabel` | `Filter by:` | Text left of the dropdowns |
| `YearAllLabel` | `Year` | Default label shown on the Year button |
| `RegionAllLabel` | `Region` | Default label on the Region button |
| `TopicAllLabel` | (blank = `Topic`) | Default label on the Topic button |
| `SearchPlaceholder` | `Search conference insights articles` | Placeholder text in the search input |
| `SearchAriaLabel` | `Search conference insights articles by title or keyword` | Screen-reader label for the search input |
| `ClearFiltersLabel` | `Clear filters` | Text on the Clear button + empty-state CTA |

**Empty state copy:**

| ID | Default | Purpose |
|----|---------|---------|
| `EmptyHeading` | `No articles found` | Empty-state H3 |
| `EmptyMessage` | `We couldn't find any articles that match your current filters.` | Primary message paragraph |
| `EmptyMessageEmphasis` | `Try adjusting your filters or search terms.` | Secondary emphasized message |

**Pagination:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `PageSize` | String | `6` | Items per page. Set to `4` for the featured-hero + 3-up pattern. `0` disables pagination. |
| `PageSizeFiltered` | String | (blank = same as PageSize; insights preset = 6) | Items per page when a filter is active. Bigger denser grid mode. |

**Show/hide toggles:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `ShowYear` | Boolean | `true` | Toggle Year filter visibility. Auto-hides regardless if no items carry `data-year`. |
| `ShowRegion` | Boolean | `true` | Toggle Region filter. Auto-hides if no `data-region`. |
| `ShowTopic` | Boolean | `true` | Toggle Topic filter. Auto-hides if no `data-topic`. |
| `ShowSearch` | Boolean | `true` | Toggle Search input. |
| `ShowReset` | Boolean | `true` | Toggle Clear filters button. |

### 6.4 Configuration recipes

**Recipe: Standard Conference Insights page (THIS is how you should do it)**

1. Drop the Filter By component onto the page **directly above the Tiles component**
2. Set `Preset` = `insights` — this auto-configures:
   - Theme: light
   - Container: `#rbccm-conference-insights-tiles`
   - PageSize: 4 (featured hero + 3-up pattern)
   - PageSizeFiltered: 6 (dense filtered grid)
   - Empty state copy
3. Set `PageSize` = `4` explicitly to guarantee the hero pattern (in case Preset default gets overridden)
4. Leave all labels at their defaults
5. All Show/hide toggles → `true`
6. Save + publish

**Recipe: Dark-theme filter on Upcoming Conferences**

1. Set `Preset` = `upcoming`
2. Container automatically becomes `#rbccm-upcoming-conferences` (upcoming preset default)
3. Empty state copy switches to "No conferences found" wording
4. Theme becomes dark automatically
5. Done — the same filter component skins itself for that use case

**Recipe: Custom listing with different container**

1. Set `Preset` = `custom`
2. Set `Container` = `#your-custom-scope`
3. Set `ItemSelector` = `.your-item` (if not using default `[data-search-text]`)
4. Set labels, page sizes, empty-state copy manually
5. Toggle Show/hide for filters you don't want (e.g., turn off ShowTopic if items don't carry topics)

**Recipe: Hide the Topic dropdown while Joe's still working on the taxonomy**

Set `ShowTopic` = `false`. The filter component still emits `data-topic` from tiles internally, but the dropdown UI hides. Flip back to `true` when ready.

**Recipe: Change the hero-vs-dense split ratio**

Set `PageSize` = `7` and `PageSizeFiltered` = `6`. Page 1 will now show a featured hero + 6 standard tiles (7 total), rest of pages continue at 6.

### 6.5 Do's & Don'ts

- ✅ Use `Preset = insights` for the Conference Insights page — it removes 6 manual config steps
- ✅ Put the Filter By component **before** the Tiles component in the page order — filter's `data-container` selector must resolve to a section that exists at bind time
- ✅ Trust the auto-hide behavior — dropdowns without data disappear automatically, don't fight it
- ❌ Don't hardcode `PageSize` = 0 unless you genuinely want no pagination (rare — this is a large-content page)
- ❌ Don't set `Container` to an ID that doesn't exist on the page — filter silently binds nothing
- ❌ Don't stack two Filter By components on the same page targeting the same container — pagination will fight

---

## 7. Tiles Component — Reference Guide

### 7.1 Purpose

The article grid itself. Renders a `<ul>` of tiles from author-picked article DCRs. Each tile emits filterable `data-*` attributes read from the article DCR. Includes the featured-hero layout, skeleton loading state, and (optional) See More / View All controls.

### 7.2 Rendered DOM shape

```html
<section class="rbccm-conference-insights-tiles" id="rbccm-conference-insights-tiles">
  <div class="rbccm-conference-insights-tiles__inner">
    <!-- Skeleton (visible until Filter By JS marks data-filter-ready) -->
    <div class="rbccm-conference-insights-tiles__skeleton" aria-hidden="true">
      <div class="…__skeleton-card …__skeleton-card--featured">…</div>
      <div class="…__skeleton-row">
        <div class="…__skeleton-card">…</div>×3
      </div>
    </div>

    <!-- Real tiles -->
    <ul class="rbccm-conference-insights-tiles__row">
      <li class="rbccm-conference-insights-tiles__item"
          data-year="2026"
          data-region="us global"
          data-topic="energy, energy-transition"
          data-search-text="…">
        <a class="…__insight …__insight--card …__insight--featured" href="…">
          <div class="…__insight-media"><img src="…"></div>
          <div class="…__insight-body">
            <div class="…__insight-label">Insights</div>
            <div class="…__insight-divider"></div>
            <h2 class="…__insight-title">…</h2>
            <p class="…__insight-desc">…</p>
            <p class="…__insight-meta"><span>14 min listen</span><svg>…</svg></p>
          </div>
        </a>
      </li>
      <!-- More <li> items -->
    </ul>

    <!-- Filter JS auto-injects empty state + pagination here -->

    <!-- Optional See More / View All (per Datum config) -->
    <div class="rbccm-conference-insights-tiles__controls">…</div>
  </div>
</section>
```

### 7.3 All Datums

**Layout / spacing:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `PadTopMobile` | String | `40px` | Mobile top padding |
| `PadBottomMobile` | String | `40px` | Mobile bottom padding |
| `PadTopDesktop` | String | `64px` | Desktop top padding |
| `PadBottomDesktop` | String | `64px` | Desktop bottom padding |

**Load-more behavior (independent of Filter By pagination):**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `EnableLoadMore` | Boolean | `false` | Enable the See More button that reveals hidden tiles progressively. Leave **off** when using Filter By pagination. |
| `ShowAfterLoadAlways` | Boolean | `true` | Always show View All button regardless of load-more state. Turn **off** on the Conference Insights page (it IS the "all" destination). |
| `InitialVisibleCount` | Number | `4` | If EnableLoadMore=true, how many tiles show before See More is clicked. |
| `LoadMoreChunkSize` | Number | `3` | Tiles revealed per See More click. |

**Button labels:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `SeeMoreText` | String | `See more` | See More button label |
| `SeeMoreClass` | String | (blank) | Extra CSS class(es) on See More button |
| `ViewAllText` | String | `View all conference insights` | View All button label |
| `ViewAllHref` | String | `/en/insights` | View All button destination URL |
| `ViewAllClass` | String | (blank) | Extra CSS class(es) on View All button |

**Tile presentation:**

| ID | Type | Default | Purpose |
|----|------|---------|---------|
| `EyebrowDefault` | String | `Insights` | Default label above tile title (per-tile override available) |
| `TitleHeadingLevel` | SelectSingle | `h2` | Semantic heading level for tile titles. Drop to `h3`/`h4` when the page has a higher-level `<h1>` and the tiles are nested under sub-sections. |

**Story Tile group (replicatable — click "Add Story Tile" for each article):**

| ID | Name | Type | Purpose |
|----|------|------|---------|
| `SourceDCR` | Source DCR | DCR | Browser picker to select the article. Constrained to `article/story` DCR type — opens to `templatedata/article/story/data/{year}/`. |
| `ManualTitle` | Manual Article Title | String | Override the article's real title with a custom one (rare, use for editorial framing) |
| `ManualDescription` | Manual Article Description | String | Override the article's real description |
| `OverwriteTitle` | Overwrite Title | SelectSingle (Yes/No) | Set to Yes to activate the Manual Title (otherwise real title wins) |
| `Link` | Link | String | Manual URL override. Blank = use article's `can_url` (canonical URL) |
| `Featured` | Featured | Boolean | Check on **one** article to make it the full-width hero at the top of page 1 |
| `OpenInNewTab` | Open in New Tab | Boolean | Add `target="_blank"` to the tile link |
| `EyebrowOverride` | Eyebrow Override | String | Per-tile eyebrow (falls back to `EyebrowDefault`) |

### 7.4 Data attributes emitted per tile

Each `<li>` emits attributes derived from the article DCR — these are what the Filter By component reads:

| Attribute | Source DCR field | Format |
|-----------|-----------------|--------|
| `data-year` | `publish_date` (first 4 chars) | `2026` |
| `data-region` | `regional_origination` + `regional_relevancy` combined | `us global` (space-separated when different) |
| `data-topic` | `topic` (multi-checkbox) | `energy, energy-transition` (Teamsite's native comma-space serialization; filter JS tokenizes on comma/space) |
| `data-search-text` | `title` + `description` (lowercased) | Free-text search haystack |

If a DCR field is blank, the corresponding attribute is omitted — the filter dropdown for that dimension will auto-hide until at least one tile carries the attribute.

### 7.5 Configuration recipes

**Recipe: Conference Insights landing page (THIS is how you should do it)**

1. Drop the Tiles component **below** the Filter By component
2. Turn OFF load-more:
   - `EnableLoadMore` = `false`
   - `ShowAfterLoadAlways` = `false`
   (This is the destination page — pagination via Filter By handles "there's more")
3. Leave `EyebrowDefault` = `Insights`
4. Leave `TitleHeadingLevel` = `h2`
5. Add Story Tile rows — one per article:
   - Click **Add Story Tile**
   - Click **Source DCR** → browser opens to `templatedata/article/story/data/2026/` → pick article
   - Check **Featured** on the ONE tile that should be the top hero
   - Leave all override Datums blank (uses article's real title/desc/link)
6. Save + publish

**Recipe: Preview module (a homepage widget teasing insights)**

1. Drop Tiles on the homepage
2. Turn ON `EnableLoadMore` = `false` (no load-more on a preview)
3. Turn ON `ShowAfterLoadAlways` = `true` (show View All button that links to the Conference Insights page)
4. Set `ViewAllText` = `View all conference insights`, `ViewAllHref` = `/en/conferences/insights`
5. Add only 3-4 Story Tile rows (the teaser set)
6. Do NOT add a Filter By component on the homepage — this is a curated preview

**Recipe: See-More paginated grid (large scroll-through list without dropdown filter)**

1. `EnableLoadMore` = `true`
2. `InitialVisibleCount` = `6`
3. `LoadMoreChunkSize` = `3`
4. Add all Story Tiles (potentially 30+)
5. Don't add a Filter By component — the See More pattern replaces filtering

**Recipe: Override an article's title without editing the article DCR**

1. On the Story Tile row for that article:
2. Set `OverwriteTitle` = `Yes`
3. Set `ManualTitle` = `Your custom framing`
4. Real DCR title stays intact — this override is page-specific

### 7.6 Do's & Don'ts

- ✅ Check **Featured** on exactly ONE article — Featured tile becomes the full-width hero on page 1
- ✅ Turn OFF `EnableLoadMore` and `ShowAfterLoadAlways` on this destination page
- ✅ Use the DCR picker constraint — it opens to the right folder and hides irrelevant DCR types
- ✅ Trust the auto-populated Link — most tiles don't need a manual Link override
- ❌ Don't check Featured on multiple articles — only the first Featured=true wins, other featured tiles will be hidden
- ❌ Don't set both `EnableLoadMore = true` AND rely on Filter By pagination — the two mechanisms fight over which tiles show
- ❌ Don't leave `EnableLoadMore = true` on the Conference Insights page — the "View All" button becomes redundant

---

## 8. Article DCR — Reference Guide

### 8.1 Purpose

The schema for individual article files. Every conference insights article lives as its own DCR at `templatedata/article/story/data/{year}/{slug}.xml`. The DCR defines the article editor form fields authors see when creating/editing articles.

### 8.2 All fields relevant to the filter

**Pre-existing fields (already in production, no changes):**

| Field | Type | Purpose |
|-------|------|---------|
| `title` | String | Article title, displayed on tiles + tile aria-labels |
| `description` | String | Article description, displayed on tiles + drives search index |
| `publish_date` | Text (YYYY-MM-DD) | Publication date. First 4 chars become `data-year` on tiles. |
| `thumbnail` | Image | Article thumbnail (16:9), displayed on tiles |
| `can_url` | Text | Canonical URL (auto-populated when article is published). Drives `href` on tile links. |
| `sitelocation` | Multi-checkbox | Site-wide routing metadata. Check "Conference Insights" for cross-site indexing. |

**New fields (July 2 update — "net new july 2" red-highlighted in editor):**

| Field | Type | Options | Purpose |
|-------|------|---------|---------|
| `platform` | Single-select | Conferences & Events, Strategy & Economics, Sustainability & Transition, Strategic Alternatives | Reserved for future cross-hub browsing. Not read by this filter. |
| `topic` | Multi-checkbox | 9 Joe-approved topics (Section 4.2) | Feeds `data-topic` on tiles → Topic filter dropdown. Multiple can be checked. |
| `associated-conferences` | Container (max 3, browser picker) | Points at `templatedata/about-us/conferences/data` | Links article to specific conference(s). Enables bidirectional lookup on the conference page. |
| `regional_origination` | Single-select | Global, Canada, US, Europe, APAC | Where the article was written / originated. Combined with relevancy into `data-region`. |
| `regional_relevancy` | Single-select | Global, Canada, US, Europe, APAC | Who the article targets. Combined with origination into `data-region`. |

### 8.3 Tagging recipes (from Joe's spreadsheet)

**Recipe: Retro-tag an article from the spreadsheet (THIS is how you should do it)**

Given a spreadsheet row like:

| Title | Year | Industry | Assoc. Conference | Region 1 | Region 2 |
|-------|------|----------|-------------------|----------|----------|
| Why TC Energy sees renewed opportunity in Canada | 2026 | Energy Transition, Energy | Global EPIC | US | Global |

Do this in Teamsite:

1. Open the article DCR at `templatedata/article/story/data/2026/why-tc-energy-sees-renewed-opportunity-in-canada.xml`
2. Confirm `publish_date` is set to a date within 2026
3. In the **Topic** checkbox, check `Energy Transition` and `Energy`
4. In **Regional Origination**, pick `US`
5. In **Regional Relevancy**, pick `Global`
6. Under **Associated Conference / Event**, click Add → browse to `templatedata/about-us/conferences/data/global-epic` and select
7. In **sitelocation**, check `Conference Insights`
8. Save + publish the article

**Recipe: Tag a new article going forward**

Same as above, but do it at article creation time — before publishing. All fields become part of the standard authoring checklist.

### 8.4 Do's & Don'ts

- ✅ Check multiple Topic boxes if the article covers multiple areas — the filter matches on ANY of the tagged topics
- ✅ Set both Regional Origination AND Relevancy when they differ — the filter includes both
- ✅ Check `sitelocation = Conference Insights` on every conference insight article — future-proofs for auto-population
- ❌ Don't leave `publish_date` blank — the Year filter dropdown can't populate without it
- ❌ Don't tag every article with `topic = All` — that's from the old taxonomy, no longer valid. Pick the specific topics.
- ❌ Don't rename the field IDs in the DCR — they're hard-coded in the tiles XSL

---

## 9. Assembling a Conference Insights Page (Step-by-Step)

**This is the canonical page setup. Follow these steps in order.**

### 9.1 Prerequisites

Before starting, verify:
- Article DCR schema is published to Teamsite (Section 8 fields visible in article editor)
- Filter By, Tiles, Hero components are in the Teamsite Component Library
- CSS + JS files are uploaded to `/assets/rbccm/css/components/` and `/assets/rbccm/js/components/`
- You know the Conference Insights page URL / Teamsite page location

### 9.2 Page assembly

**Step 1: Drop the Hero component at the top of the page**

Configure per Recipe 5.4 "Standard conference insights page". End state: breadcrumbs (Home → About Us → Conferences) + H1 "Conference insights" + subtitle "Voices that shaped the market."

**Step 2: Drop the Filter By component immediately below the Hero**

Configure per Recipe 6.4 "Standard Conference Insights page":
- Preset = `insights`
- PageSize = `4`
- PageSizeFiltered = `6`
- Leave labels at defaults

**Step 3: Drop the Tiles component immediately below the Filter By**

Configure per Recipe 7.5 "Conference Insights landing page":
- EnableLoadMore = `false`
- ShowAfterLoadAlways = `false`

**Step 4: Populate the Story Tile group**

For each article you want on the page:
- Click Add Story Tile
- Pick the article via Source DCR browser
- Check **Featured** on ONE tile (the hero)
- Leave override fields blank

**Step 5: Verify the container binding**

Confirm the Filter By component's `Container` Datum = `#rbccm-conference-insights-tiles`. This matches the ID the Tiles component renders as.

**Step 6: Publish + verify**

Publish the page. In a browser:
- Page loads with hero, filter row, tiles grid
- Filter dropdowns populate with year(s), regions, topics from the tagged articles
- Clicking a filter narrows the tiles
- Clear filters returns to hero-plus-3 view
- Pagination shows if you have more than 4 tiles

### 9.3 What you should NOT do

- ❌ Do NOT drop the View All button component separately — the tiles component handles it via its own Datums
- ❌ Do NOT hardcode article HTML into the page — always use the Story Tile picker so DCR fields drive attributes
- ❌ Do NOT skip step 5 (container binding check) — a mismatched selector = filter renders but does nothing

### 9.4 Ongoing maintenance

When Joe publishes a new insight article:
1. Confirm the article's DCR has the required tags (topic, region, publish_date, sitelocation)
2. Open the Conference Insights page in Teamsite
3. Click Add Story Tile on the Tiles component
4. Pick the new article via Source DCR
5. Save + publish the page

Filter will automatically pick up any new topic or region values in the next page render.

---

## 10. User Workflows

*(Same content as previous section — kept for narrative flow with the reference guide sections above.)*

**10.1 Publishing a new insight article** — see Recipe 8.3 + Section 9.4

**10.2 Retro-tagging existing articles** — see Recipe 8.3 (loop through Joe's spreadsheet)

**10.3 Reader browsing** — see Section 3.2 reader experience

---

## 11. Deployment Reference

### 11.1 File locations & production paths

| Asset | Local source | Production location |
|-------|--------------|---------------------|
| Hero XSL | `conference-insights-hero/conference-insights-hero.html` | Teamsite Component Library |
| Hero CSS | `conference-insights-hero/conference-insights-hero.css` | `/assets/rbccm/css/components/conference-insights-hero.css` |
| Filter By XSL | `filter-by/filter-by.html` | Teamsite Component Library |
| Filter By CSS | `filter-by/filter-by.css` | `/assets/rbccm/css/components/filter-by.css` |
| Filter By JS | `filter-by/filter-by.js` | `/assets/rbccm/js/components/filter-by.js` |
| Tiles XSL | `conference-insights-tiles/conference-insights-tiles.html` | Teamsite Component Library |
| Tiles CSS | `conference-insights-tiles/conference-insights-tiles.css` | `/assets/rbccm/css/components/conference-insights-tiles.css` |
| Tiles JS | `conference-insights-tiles/conference-insights-tiles.js` | `/assets/rbccm/js/components/conference-insights-tiles.js` |
| Article DCR | `article-dcr-updated.xml` | Teamsite DCR Administration (`press_release` schema) |

### 11.2 Publish sequence

1. **DCR first** (adds fields, no visible impact on live pages)
2. **Tiles XSL** (emits new data-* attributes)
3. **Filter By XSL** (dropdowns show Year/Region/Topic labels)
4. **Filter By JS** (Topic labels format with proper spacing + ampersands)
5. **Tiles CSS + JS** (skeleton loading state activates)
6. **Retro-tag articles + republish pages** as coverage grows

### 11.3 Teamsite Component settings (all three components)

- Page Type: HTML5
- Required Page Layout: Any
- Content Type: Empty (unrestricted)
- Rendering Mode: XSLT 2.0
- Output method: html, Indent: no, Encoding: UTF-8

### 11.4 Component versioning

When you re-import an XSL after edits, existing page instances stay on the OLD version — the update doesn't propagate automatically. To promote:

1. Open the page in Teamsite editor
2. Find the component instance
3. Right-click → **Update Component Version**
4. Save + publish

---

## 12. Success Criteria & Testing

### 12.1 Functional success criteria

- Reader lands on Conference Insights and sees featured hero + 3 additional tiles
- Pagination navigation visible when > 4 articles exist
- Year, Region, Topic filter dropdowns render with values from tagged articles (or auto-hide if none)
- Selecting a filter narrows the tile grid instantly
- Multi-filter combinations work conjunctively
- Search matches title + description case-insensitively
- Clear filters returns to default view
- Zero-result state shows branded empty message

### 12.2 Non-functional success criteria

- Matches design spec (RBC Display typography, dark blue accents, yellow active state)
- Skeleton loading state prevents "blank then appears" flash
- Full keyboard operation with focus retention
- Screen reader announces filter state + pagination
- Responsive on mobile / tablet / desktop
- Respects `prefers-reduced-motion`

### 12.3 Testing checklist

1. Publish DCR — verify test article shows 5 new fields
2. Tag 3-5 test articles with different Year/Region/Topic combos
3. View source on rendered tiles — verify `data-*` attributes match tagged fields
4. Verify filter dropdowns populate with correct unique values
5. Select each filter → verify tile grid narrows
6. Combine 2 filters → verify conjunctive filtering
7. Search a title fragment → verify results
8. Tab through row → verify focus order + visible indicators
9. Test mobile viewport → verify filter row stacks
10. Toggle prefers-reduced-motion in OS → verify animations disable

---

## 13. Future Enhancements

Sorted by value + effort. All optional — current build is production-ready.

### 13.1 Automate article listing via InsightsList DCR
Create a centralized InsightsList DCR (mirrors EventsList used by featured-conferences-homepage). Tiles component binds to it, filters by sitelocation, auto-renders every matching article — no manual "add Story Tile row" step. **Effort:** Teamsite admin (~1 day) + XSL rewiring (~30 min).

### 13.2 Secondary tag layer (cross-cutting themes)
Add a `secondary_tags` field for cross-cutting themes (AI, Company Interviews, Insurance, Banks, Geopolitics, Sustainable Finance, A&D) that transcend industry topics.

### 13.3 Cross-hub content discovery
Leverage the `platform` field to enable a "browse all insights" experience filtering across Conferences & Events, Strategy & Economics, Sustainability & Transition, Strategic Alternatives.

### 13.4 Filter chips / active-filter summary
Visible chip pattern above the tile grid showing all active filters with × to remove each. Better feedback for complex filter combos.

### 13.5 URL state for filters
Sync active filters to URL query string. Enables shareable filtered views and browser-back-navigation restoring state.

---

## 14. Appendix

### 14.1 Key decisions log

| Date | Decision | Rationale |
|------|----------|-----------|
| July 2 | Year over Month | Fewer, fatter buckets |
| July 2 | Topic over Industry | Broader — includes non-industry themes like Markets/Economics |
| July 2 | 9 topics not 11 | Joe's simplification — dropped All, Cross-Sector, duplicates |
| July 2 | Both Origination + Relevancy in data-region | Source and audience are different signals — filter matches on either |
| July 2 | Manual Story Tile picker | RBCCM standard pattern; automation requires InsightsList DCR (future work) |
| July 2 | Skeleton loading state | Prevents JS-init flash on page load |
| July 2 | Focus retention on pagination | Keyboard a11y best practice |

### 14.2 Referenced source materials

- Joe's `conference-insights-list-new.csv` (retro-tag reference)
- Existing `featured-conferences-homepage` component (reference pattern for InsightsList DCR future work)
- Existing `citizenship-carousel` component (reference pattern for Story Tile picker)
- RBC Design System (typography, colors, dropdown patterns)

### 14.3 Contact

- **Development / component questions:** Justin Bannister · GlueIQ
- **Taxonomy / content questions:** Joe
- **Program / timeline:** Lauren

---

*End of document.*
