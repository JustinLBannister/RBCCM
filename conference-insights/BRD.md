# Conference Insights Page: Business Requirements

**URL:** `/en/about-us/conferences/conference-insights`

## Purpose

A dedicated hub where readers can browse takeaways, podcasts, and videos published from RBC Capital Markets conferences. Everything on the page is filterable and searchable, so a reader who cares about (say) Canadian industrials in 2026 can get to just those pieces in two clicks.

The page pulls from RBC's larger insights library but only surfaces items that were tagged as conference content. That curated set is defined by a whitelist we manage centrally. New articles get added when they should appear; nothing shows up automatically.

---

## What the reader sees, top to bottom

### 1. Hero banner
A single-line breadcrumb (Home › About Us › Conferences), a page title ("Conference insights"), and, if we set one, an optional short subtitle. If the subtitle is empty, the spacing tightens automatically so we're not left with an awkward gap.

### 2. Filter bar
Sits directly under the hero. Four controls:

- **Year** dropdown: 2024, 2025, 2026
- **Region** dropdown: Global, Canada, US, Europe, APAC
- **Topic** dropdown: Energy, Healthcare, Industrials, Financial Institutions, Technology, etc.
- **Search** input: matches any word in a tile's title or description
- **Clear filters** button: resets everything back to defaults

The dropdowns and search work together. Selecting Year "2026" and Region "Canada" narrows the grid to only articles that match both. Typing "hormuz" in search narrows further to just pieces that mention Hormuz.

### 3. Article grid
Below the filter. Each article is a tile with:

- Thumbnail image
- Category label ("Insights") in blue uppercase
- Article title (bold)
- Short description
- Format + duration ("3 min read" / "14 min listen" / "17 min watch")
- Region and publish month/year in the bottom-right corner

The **first tile on page 1 is featured**: it takes the full row width with the image on the left and text on the right. Every tile below it is a standard third-width card in a 3-across grid. On tablet it becomes 2-across, on mobile it stacks single-column.

Once the reader applies a filter, the featured treatment goes away. Filtered results all show at the same size, with no visual hierarchy between them since the reader specified what they wanted to see.

### 4. Pagination
Circles at the bottom (1, 2, 3, …) with prev/next arrows on either side. The circle count adjusts to viewport width: 7 circles on mobile, 9 on tablet, 11 on desktop, with ellipses standing in for the middle when there are more pages than we can show.

Clicking a page number **smooth-scrolls the reader back to the filter bar** so they're re-oriented to the top of the new page instead of being stranded halfway down the previous one.

### 5. Empty state
If a filter combo returns no results, the grid is replaced with a friendly "No articles found" message and a shortcut button to clear the filters.

---

## How the page loads

The default state is: Year "All", Region "All", Topic "All", no search, page 1. Grid shows the most recent items across all conferences.

**Deep linking works.** A URL like `?year=2026&region=us&page=2` opens the page already filtered to that state. The reader lands on page 2 of US-region 2026 articles, no clicking required. Useful for:
- Sharing a filtered view with a colleague
- Linking from a newsletter to a specific conference year
- Linking from a marketing campaign to a specific topic

**As the reader interacts**, the URL updates silently to reflect the current filter and page. If they hit refresh, they stay where they were. If they hit browser Back after clicking through pages, it walks them back page by page, the way pagination should behave.

**Five URL parameters** work in any combination:

| Parameter | Values | Example |
|---|---|---|
| `year` | 2024, 2025, 2026 | `?year=2026` |
| `region` | global, canada, us, europe, apac | `?region=us` |
| `topic` | energy, healthcare, industrials, etc. | `?topic=energy` |
| `search` | any text | `?search=hormuz` |
| `page` | 1, 2, 3… | `?page=3` |

---

## What controls which articles appear

Two sources feed the grid:

1. **Whitelist.** A JSON file we maintain at
   `/assets/rbccm/js/components/data/conference-insights-whitelist.json`.
   Lists every article approved for this page, with its year, region, topic tags, and the conference it came from. Articles not on the whitelist don't show up here even if they exist elsewhere on rbccm.com. This is the source of truth for what appears.

2. **Article feeds.** The same year-based XML feeds that power the main insights section:
   - `/en/insights/data/2024-insights`
   - `/en/insights/data/2025-insights`
   - `/en/insights/data/2026-insights`

   The page reads these to get the actual title, description, thumbnail, and duration for each whitelisted article.

Articles that don't exist in the feed (or exist only in a different section of the site) can still appear via a **manual entry** in the whitelist. We hand-fill their metadata inside a `"manual": { … }` sub-object on the whitelist entry itself. This lets us include, for example, a legacy 2024 piece that lives under a different URL structure.

Region and topic filter values come from the whitelist entry, not the article's own metadata. That lets us tag a piece written from London as relevant to Canada without editing the source article.

---

## Editorial workflow: how to add or remove an article

1. **To add:** open
   `/assets/rbccm/js/components/data/conference-insights-whitelist.json`
   and add a new entry with the article's title (must match the `<title>` in the feed exactly), year, region, topic tags, and conference name. Save and publish. The page picks it up automatically on next load. Live URL to verify:
   `/en/about-us/conferences/conference-insights`

2. **To remove:** delete the whitelist entry. The article disappears from the grid.

3. **To retag:** change `region_origination`, `region_relevancy`, or `topics` in the whitelist entry. Filter behavior updates without touching the article itself.

4. **To feature differently:** the "featured" tile is always the first on page 1. To promote a different article, reorder the whitelist (top entry becomes featured).

---

## Behaviors worth calling out

- **Mobile filter accessibility.** Filters stay visible on mobile (no drawer, no hidden menu). Tapping a filter option updates the grid in place with no scroll disruption.
- **Reduced-motion respect.** Readers who have "reduce motion" enabled at the OS level get instant scroll and no animations, per WCAG guidance.
- **Keyboard navigable.** Every filter, dropdown option, page button, and article tile is reachable and operable via keyboard alone.
- **Screen-reader support.** Filters are announced as filters, active selections are read as such, and the pagination bar identifies itself as pagination.
- **Search matches full description text**, not just what's visible in the tile. If the description mentions "Hormuz" but the visible truncated text cuts off before that word, the search will still find it.

---

## Analytics angles

Because filter state is in the URL, standard analytics tools can answer questions like:
- Which region gets filtered to most often?
- What are people searching for?
- How often do readers navigate past page 1?
- Are certain conferences (topic + year combos) driving more traffic than others?

Every URL a reader lands on is a full snapshot of their filter intent.

---

## Files & endpoints reference

**Live page URL**
- `/en/about-us/conferences/conference-insights`

**Data sources (production paths)**
| Purpose | Path |
|---|---|
| Whitelist (source of truth for which articles appear) | `/assets/rbccm/js/components/data/conference-insights-whitelist.json` |
| 2024 article feed | `/en/insights/data/2024-insights` |
| 2025 article feed | `/en/insights/data/2025-insights` |
| 2026 article feed | `/en/insights/data/2026-insights` |

**Components on the page**
| Component | Stylesheet | Script |
|---|---|---|
| Hero (breadcrumb + title + subtitle) | `/assets/rbccm/css/components/conference-insights-hero.css` | none |
| Filter bar (Year / Region / Topic / Search / Clear) | `/assets/rbccm/css/components/filter-by.css` + `conference-insights-filter.css` | `/assets/rbccm/js/components/filter-by.js` |
| Article grid + featured tile + pagination | `/assets/rbccm/css/components/conference-insights-tiles.css` | `/assets/rbccm/js/components/conference-insights-tiles-feed.js` + `conference-insights-tiles.js` |
| Structured data (JSON-LD) for SEO | static component for now | none |

**Related tooling**

- **JSON Builder:** <https://justinlbannister.github.io/Insights-JSON-Builder/>
