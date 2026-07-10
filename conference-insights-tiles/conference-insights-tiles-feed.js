/* =========================================================================
 * Conference Insights Tiles — Feed enhancement (v1)
 * -------------------------------------------------------------------------
 * Fetches the RBCCM insights XML year-feeds, cross-references titles
 * against Joe's whitelist JSON, and renders matching articles as tiles
 * with the data-* attributes the Filter By component consumes.
 *
 *   Feed URLs:
 *     /en/insights/data/{year}-insights   (repeats: 2024, 2025, 2026)
 *
 *   Whitelist (source of truth for taxonomy until DCR/feed enrichment):
 *     /assets/rbccm/js/components/data/conference-insights-whitelist.json
 *
 * Once each article's DCR has `sitelocation` = "Conference Insights"
 * checked AND the year-feed exposes that field, this module can be
 * simplified: drop the whitelist fetch and filter feed entries by
 * `<sitelocation>` instead of by title matching.
 *
 * Author-facing behavior on the page:
 *   - Skeleton loader shows immediately (existing tiles CSS handles this)
 *   - Feed + whitelist fetched in parallel with existing Story Tile group
 *   - Feed-driven tiles PREPEND to the row, then existing Story Tile
 *     items (if any) follow — safe to have both, but on the Conference
 *     Insights page Story Tile group should be empty
 *   - Filter By's `apply(false)` picks up the new tiles and populates
 *     Year/Region dropdowns automatically
 *   - `data-filter-ready` marker flips true once everything is rendered
 *
 * Vanilla JS, no dependencies. IIFE so it doesn't pollute globals.
 * ========================================================================= */

(function () {
  'use strict';

  /* ---------- Config ----------
     Defaults point at production RBCCM paths. A page can override any of
     these by setting window.RBCCM_FEED_CONFIG BEFORE this script loads —
     used by the local-test HTML to swap in fixture files without editing
     this file. Config shape (all optional):
       {
         years:             [2024, 2025, 2026],
         feedUrlTemplate:   '/path/{year}-insights.xml',
         whitelistUrl:      '/path/to/whitelist.json'
       } */
  var CONFIG = (typeof window !== 'undefined' && window.RBCCM_FEED_CONFIG) || {};
  var YEARS_TO_FETCH    = CONFIG.years            || [2024, 2025, 2026];
  var FEED_URL_TEMPLATE = CONFIG.feedUrlTemplate  || '/en/insights/data/{year}-insights';
  var WHITELIST_URL     = CONFIG.whitelistUrl     || '/assets/rbccm/js/components/data/conference-insights-whitelist.json';
  var CONTAINER_SEL     = '#rbccm-conference-insights-tiles';
  var ROW_SEL           = '.rbccm-conference-insights-tiles__row';

  /* ---------- Utilities ---------- */

  /* Normalize a title into the same match key the whitelist uses. */
  function normalizeTitle(t) {
    if (!t) return '';
    return t.toLowerCase()
      .replace(/[‘’]/g, "'")   /* smart single quotes */
      .replace(/[“”]/g, '"')   /* smart double quotes */
      .replace(/[–—]/g, '-')   /* en/em dashes */
      .replace(/[^\w\s]/g, ' ')          /* strip punctuation */
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Parse a human date string ("December 22, 2025") → year "2025". */
  function parseYear(dateStr) {
    if (!dateStr) return '';
    var m = String(dateStr).match(/(\d{4})/);
    return m ? m[1] : '';
  }

  /* Parse a human date string ("July 6, 2026") → abbreviated month + year
     ("Jul 2026") for the bottom-right meta slot. Falls back to just the
     year if we can't extract a month. */
  var MONTH_ABBR = {
    january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
    may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
    september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec'
  };
  function formatMonthYear(dateStr) {
    if (!dateStr) return '';
    var s = String(dateStr).trim();
    var yearMatch = s.match(/(\d{4})/);
    var year = yearMatch ? yearMatch[1] : '';
    var monthMatch = s.match(/^([A-Za-z]+)/);
    var monthAbbr = monthMatch ? MONTH_ABBR[monthMatch[1].toLowerCase()] : '';
    if (monthAbbr && year) return monthAbbr + ' ' + year;
    return year;
  }

  /* Cap description at maxChars, snap back to the last word boundary
     if we can (so we don't cut mid-word), and append an ellipsis. */
  var DESC_MAX = 150;
  function truncateDescription(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    var cut = text.substring(0, maxChars);
    var lastSpace = cut.lastIndexOf(' ');
    /* Only snap back if the last space is reasonably far in — otherwise
       fall back to a hard cut so a single long word doesn't empty us out. */
    if (lastSpace > maxChars * 0.6) cut = cut.substring(0, lastSpace);
    /* Trim trailing punctuation so we don't get "foo,…" */
    cut = cut.replace(/[\s,.;:!?\-–—]+$/, '');
    return cut + '…';
  }

  /* Human labels for topic tokens. Feed emits lowercase slugs like
     "energy-transition" — we display "Energy Transition". Keeps a
     lookup table for the multi-word cases and falls back to a generic
     Title-Case with dash→space for anything unmapped. */
  var TOPIC_LABELS = {
    'energy':                        'Energy',
    'energy-transition':             'Energy Transition',
    'financial-institutions':        'Financial Institutions',
    'healthcare':                    'Healthcare',
    'industrials':                   'Industrials',
    'markets-economics':             'Markets & Economics',
    'mining-materials':              'Mining & Materials',
    'power-utilities-infrastructure':'Power, Utilities & Infrastructure',
    'technology-innovation':         'Technology & Innovation'
  };
  function labelForTopic(slug) {
    if (!slug) return '';
    var s = slug.toLowerCase();
    if (TOPIC_LABELS[s]) return TOPIC_LABELS[s];
    /* Generic fallback for unmapped slugs. */
    return s.split(/[-_\s]+/).map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  /* Region tokens are short codes (us / ca / global / eu / apac). Uppercase
     the 2-letter codes, title-case everything else. */
  var REGION_LABELS = {
    'us':     'US',
    'ca':     'Canada',
    'global': 'Global',
    'eu':     'Europe',
    'apac':   'APAC'
  };
  function labelForRegion(slug) {
    if (!slug) return '';
    var s = slug.toLowerCase();
    if (REGION_LABELS[s]) return REGION_LABELS[s];
    return s.length <= 3 ? s.toUpperCase() : (s.charAt(0).toUpperCase() + s.slice(1));
  }

  /* Pick the FIRST token from a space-separated tag string. Multi-topic
     articles keep the first (primary) label — showing all of them would
     crowd the corner and repeat what the filter dropdowns already surface. */
  function firstToken(str) {
    if (!str) return '';
    var t = String(str).trim().split(/\s+/)[0];
    return t || '';
  }

  /* "14 min" → "14 min listen" (or "read"/"watch") based on type. */
  function formatMeta(readtime, watchtime, type) {
    var t = (type || '').toLowerCase().trim();
    var wt = (watchtime || '').trim();
    var rt = (readtime || '').trim();
    if (t === 'audio' && wt) return wt + ' listen';
    if (t === 'video' && wt) return wt + ' watch';
    if (t === 'text'  && rt) return rt + ' read';
    /* Fallback — prefer readtime when type is ambiguous. */
    if (rt) return rt + ' read';
    if (wt) return wt;
    return '';
  }

  /* Read a child element's text content from a <news> node, or ''. */
  function child(node, tag) {
    var el = node.getElementsByTagName(tag)[0];
    return el ? (el.textContent || '') : '';
  }

  /* Fetch a URL, resolve to text on 2xx, resolve to null on any error
     (so missing years don't reject the outer Promise.all). */
  function fetchOptional(url) {
    return fetch(url).then(function (r) {
      if (r.ok) return r.text();
      return null;
    }).catch(function () {
      return null;
    });
  }

  /* ---------- HTML builder ---------- */

  /* Build one <li> tile matching the existing XSL-emitted structure. */
  function buildTile(entry, isFeatured) {
    var li = document.createElement('li');
    li.className = 'rbccm-conference-insights-tiles__item';

    if (entry.year)       li.setAttribute('data-year', entry.year);
    if (entry.dataRegion) li.setAttribute('data-region', entry.dataRegion);
    if (entry.dataTopic)  li.setAttribute('data-topic', entry.dataTopic);
    if (entry.searchText) li.setAttribute('data-search-text', entry.searchText);

    var aClasses = 'rbccm-conference-insights-tiles__insight rbccm-conference-insights-tiles__insight--card';
    if (isFeatured) aClasses += ' rbccm-conference-insights-tiles__insight--featured';

    /* Compose the aria-label the way the existing XSL does. */
    var ariaLabel = (entry.eyebrow || 'Insights') + ': ' + entry.title;
    if (entry.meta) ariaLabel += '. ' + entry.meta + '.';

    var a = document.createElement('a');
    a.className = aClasses;
    a.href = entry.href || '';
    a.setAttribute('aria-label', ariaLabel);

    /* Media */
    var media = document.createElement('div');
    media.className = 'rbccm-conference-insights-tiles__insight-media';
    var img = document.createElement('img');
    img.setAttribute('loading', 'lazy');
    img.setAttribute('alt', '');
    if (entry.thumbnail) img.setAttribute('src', entry.thumbnail);
    media.appendChild(img);

    /* Body */
    var body = document.createElement('div');
    body.className = 'rbccm-conference-insights-tiles__insight-body';

    var label = document.createElement('div');
    label.className = 'rbccm-conference-insights-tiles__insight-label';
    label.textContent = entry.eyebrow || 'Insights';

    var divider = document.createElement('div');
    divider.className = 'rbccm-conference-insights-tiles__insight-divider';
    divider.setAttribute('aria-hidden', 'true');

    var h2 = document.createElement('h2');
    h2.className = 'rbccm-conference-insights-tiles__insight-title';
    h2.textContent = entry.title || '';

    var desc = document.createElement('p');
    desc.className = 'rbccm-conference-insights-tiles__insight-desc';
    desc.textContent = entry.description || '';

    var meta = document.createElement('p');
    meta.className = 'rbccm-conference-insights-tiles__insight-meta';
    var metaSpan = document.createElement('span');
    metaSpan.textContent = entry.meta || '';
    meta.appendChild(metaSpan);
    meta.insertAdjacentHTML('beforeend',
      '<svg xmlns="http://www.w3.org/2000/svg" class="rbccm-conference-insights-tiles__insight-arrow" width="4" height="10" viewBox="0 0 4 10" fill="none" aria-hidden="true">' +
      '<path d="M0.995898 9.03271L3.46359 5.25064C3.51814 5.16868 3.56143 5.07118 3.59098 4.96374C3.62053 4.85631 3.63574 4.74108 3.63574 4.6247C3.63574 4.50832 3.62053 4.39309 3.59098 4.28566C3.56143 4.17823 3.51814 4.08072 3.46359 3.99876L0.995898 0.260776C0.941794 0.178145 0.877424 0.112559 0.806501 0.067801C0.735579 0.0230433 0.659508 0 0.582677 0C0.505846 0 0.429775 0.0230433 0.358852 0.067801C0.28793 0.112559 0.22356 0.178145 0.169455 0.260776C0.0610566 0.425955 0.000213623 0.649398 0.000213623 0.882305C0.000213623 1.11521 0.0610566 1.33865 0.169455 1.50383L2.22974 4.6247L0.169455 7.74557C0.0619338 7.90978 0.0013175 8.13141 0.000674486 8.36269C0.000231743 8.47871 0.0149126 8.59373 0.0438757 8.70114C0.0728388 8.80855 0.115515 8.90625 0.169455 8.98863C0.221613 9.07421 0.284449 9.14328 0.354334 9.19187C0.424218 9.24045 0.499765 9.26757 0.57661 9.27167C0.653455 9.27577 0.730073 9.25676 0.80204 9.21574C0.874007 9.17473 0.939896 9.11252 0.995898 9.03271Z" fill="currentColor"/>' +
      '</svg>');

    /* Bottom row wraps the existing meta ("14 min listen ›") on the left
       and the new date label ("Jul 2026") on the right. When there's no
       date to show we skip the wrapper and append meta directly, so tiles
       without dates keep the pre-existing layout. */
    body.appendChild(label);
    body.appendChild(divider);
    body.appendChild(h2);
    body.appendChild(desc);
    /* Build the right-side taxonomy stack: topic on top, "region · date"
       on the bottom. Any of the three pieces can be absent — we only emit
       the pieces we have. If nothing at all is present, the whole right
       column collapses and meta renders bare like the original layout. */
    var hasTaxonomy = !!(entry.topicLabel || entry.regionLabel || entry.dateLabel);
    if (hasTaxonomy) {
      var bottomRow = document.createElement('div');
      bottomRow.className = 'rbccm-conference-insights-tiles__insight-bottom';

      var taxonomy = document.createElement('div');
      taxonomy.className = 'rbccm-conference-insights-tiles__insight-taxonomy';

      /* Topic and region rendered as their own elements even though CSS
         currently hides them — keeps the markup shape stable so we can
         un-hide via CSS alone when stakeholders sign off on the extra
         taxonomy. Region carries its " · " separator inline so hiding
         the whole span removes the orphan dot for free. */
      if (entry.topicLabel) {
        var topicEl = document.createElement('span');
        topicEl.className = 'rbccm-conference-insights-tiles__insight-topic';
        topicEl.textContent = entry.topicLabel;
        taxonomy.appendChild(topicEl);
      }
      if (entry.regionLabel) {
        var regionEl = document.createElement('span');
        regionEl.className = 'rbccm-conference-insights-tiles__insight-region';
        regionEl.textContent = entry.dateLabel ? entry.regionLabel + ' · ' : entry.regionLabel;
        taxonomy.appendChild(regionEl);
      }
      if (entry.dateLabel) {
        var dateEl = document.createElement('span');
        dateEl.className = 'rbccm-conference-insights-tiles__insight-date';
        dateEl.textContent = entry.dateLabel;
        taxonomy.appendChild(dateEl);
      }

      bottomRow.appendChild(meta);
      bottomRow.appendChild(taxonomy);
      body.appendChild(bottomRow);
    } else {
      body.appendChild(meta);
    }

    a.appendChild(media);
    a.appendChild(body);
    li.appendChild(a);
    return li;
  }

  /* ---------- Data pipeline ---------- */

  /* Escape bare `&` characters (i.e. not part of a valid XML entity) so
     the strict XML parser doesn't choke on content like "S&P 500" or
     "Software M&A" — the RBCCM feeds ship those un-escaped. Matches the
     lenient behavior browsers apply to text/html but keeps us in the
     application/xml code path so `<news>` etc. stay real elements.

     CRITICAL: only escape ampersands OUTSIDE CDATA sections. Content
     inside CDATA is literal text and doesn't need escaping — escaping
     it corrupts the actual text (e.g., "M&A" → "M&amp;A" which then
     survives XML parsing as the string "M&amp;A" because CDATA blocks
     entity decoding). The 2024 feed wraps every field in CDATA while
     2025/2026 use plain elements, so this only shows up on 2024 data. */
  function escapeStrayAmpersands(s) {
    if (!s) return s;
    /* Split on CDATA boundaries. Even indices are non-CDATA text (needs
       escape); odd indices are CDATA sections (leave untouched). */
    var parts = s.split(/(<!\[CDATA\[[\s\S]*?\]\]>)/);
    for (var i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i].replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
    }
    return parts.join('');
  }

  /* Parse an XML string into an array of raw news nodes. */
  function parseNewsNodes(xmlStr) {
    if (!xmlStr) return [];
    var doc;
    try {
      doc = new DOMParser().parseFromString(escapeStrayAmpersands(xmlStr), 'application/xml');
    } catch (e) {
      return [];
    }
    /* Bail if the parser choked (invalid XML). */
    if (!doc || doc.getElementsByTagName('parsererror').length > 0) return [];
    return Array.prototype.slice.call(doc.getElementsByTagName('news'));
  }

  /* Merge a feed <news> node + its whitelist entry into the shape
     buildTile() consumes. Whitelist wins on taxonomy (topic/region);
     feed wins on presentational data (title/desc/thumb/etc). */
  function makeEntry(newsNode, wl) {
    var title      = child(newsNode, 'title').trim();
    var description = child(newsNode, 'description').trim();
    var dateStr    = child(newsNode, 'date').trim();
    var year       = wl.year || parseYear(dateStr);
    var link       = child(newsNode, 'link').trim();
    var thumb      = child(newsNode, 'thumbnail').trim();
    var category   = child(newsNode, 'category').trim() || 'Insights';
    var readtime   = child(newsNode, 'readtime').trim();
    var watchtime  = child(newsNode, 'watchtime').trim();
    var type       = child(newsNode, 'type').trim();
    var feedRegion = child(newsNode, 'region').trim();

    /* Region tokens: prefer the whitelist's origination+relevancy
       (mapped to our bucket slugs). Fall back to the feed's raw region
       string if the whitelist doesn't carry region for this article. */
    var regionTokens = [];
    if (wl.region_origination) regionTokens.push(wl.region_origination);
    if (wl.region_relevancy && wl.region_relevancy !== wl.region_origination) {
      regionTokens.push(wl.region_relevancy);
    }
    if (regionTokens.length === 0 && feedRegion) {
      /* Feed region can be a comma-separated ISO list — pass through and
         let filter-by.js's REGION_BUCKETS handle the bucketing. */
      regionTokens = feedRegion.split(/[\s,]+/).filter(function (t) { return t.length > 0; });
    }

    var topicTokens = (wl.topics && wl.topics.length) ? wl.topics.slice() : [];

    /* Search uses the FULL description so filtering matches content past
       the visible cap. Display uses the truncated version. */
    var searchText = (title + ' ' + description).toLowerCase();
    var displayDescription = truncateDescription(description, DESC_MAX);
    var dateLabel = formatMonthYear(dateStr);
    var topicLabel = labelForTopic(firstToken(topicTokens.join(' ')));
    var regionLabel = labelForRegion(firstToken(regionTokens.join(' ')));

    /* Numeric timestamp of the actual publish date for sorting. Falls
       back to 0 (Jan 1 1970) if the date fails to parse, which pushes
       unparseable entries to the end of the list — safer than nulling. */
    var dateTs = dateStr ? Date.parse(dateStr) : 0;
    if (isNaN(dateTs)) dateTs = 0;

    return {
      title:       title,
      description: displayDescription,
      href:        link,
      thumbnail:   thumb,
      eyebrow:     category,
      year:        year,
      dateLabel:   dateLabel,
      dateTs:      dateTs,
      topicLabel:  topicLabel,
      regionLabel: regionLabel,
      meta:        formatMeta(readtime, watchtime, type),
      dataRegion:  regionTokens.join(' '),
      dataTopic:   topicTokens.join(' '),
      searchText:  searchText,
    };
  }

  /* Build an entry object from a whitelist row's `manual` sub-object
     when the article isn't in any year XML feed. Same output shape
     as makeEntry() so downstream sort/render treat it identically.
     Falls back gracefully on any missing manual field. */
  function makeManualEntry(wl) {
    var m = wl.manual || {};
    var title       = wl.title || '';
    var description = m.description || '';
    var dateStr     = m.date || '';
    var year        = wl.year || parseYear(dateStr);
    var link        = m.link || '';
    var thumb       = m.thumbnail || '';
    var category    = m.category || 'Insights';
    var readtime    = m.readtime || '';
    var watchtime   = m.watchtime || '';
    var type        = m.type || 'text';

    var regionTokens = [];
    if (wl.region_origination) regionTokens.push(wl.region_origination);
    if (wl.region_relevancy && wl.region_relevancy !== wl.region_origination) {
      regionTokens.push(wl.region_relevancy);
    }

    var topicTokens = (wl.topics && wl.topics.length) ? wl.topics.slice() : [];

    var searchText = (title + ' ' + description).toLowerCase();
    var displayDescription = truncateDescription(description, DESC_MAX);
    var dateLabel = formatMonthYear(dateStr);
    var topicLabel = labelForTopic(firstToken(topicTokens.join(' ')));
    var regionLabel = labelForRegion(firstToken(regionTokens.join(' ')));

    var dateTs = dateStr ? Date.parse(dateStr) : 0;
    if (isNaN(dateTs)) dateTs = 0;

    return {
      title:       title,
      description: displayDescription,
      href:        link,
      thumbnail:   thumb,
      eyebrow:     category,
      year:        year,
      dateLabel:   dateLabel,
      dateTs:      dateTs,
      topicLabel:  topicLabel,
      regionLabel: regionLabel,
      meta:        formatMeta(readtime, watchtime, type),
      dataRegion:  regionTokens.join(' '),
      dataTopic:   topicTokens.join(' '),
      searchText:  searchText,
    };
  }

  /* ---------- Main flow ---------- */

  function bootstrap() {
    var container = document.querySelector(CONTAINER_SEL);
    if (!container) return;
    var row = container.querySelector(ROW_SEL);
    if (!row) return;

    /* Fetch whitelist + every candidate year feed in parallel. Missing
       years (404) resolve to null and are ignored — keeps this future-
       proof for new years without code changes. */
    var yearFetches = YEARS_TO_FETCH.map(function (y) {
      return fetchOptional(FEED_URL_TEMPLATE.replace('{year}', String(y)));
    });

    Promise.all([
      fetch(WHITELIST_URL).then(function (r) {
        if (!r.ok) throw new Error('whitelist fetch failed');
        return r.json();
      }),
    ].concat(yearFetches))
    .then(function (results) {
      var whitelist = results[0];
      var xmlStrings = results.slice(1);

      /* Index whitelist by match key for O(1) lookup. */
      var byKey = {};
      whitelist.articles.forEach(function (a) { byKey[a.match_key] = a; });

      /* Flatten feed → news nodes across every fetched year. */
      var allNews = [];
      xmlStrings.forEach(function (xml) {
        allNews = allNews.concat(parseNewsNodes(xml));
      });

      /* Cross-reference feed titles against the whitelist. Only matched
         articles get rendered. Dedupe by match key so multiple year
         feeds carrying the same article don't produce duplicate tiles.

         SEED the seen{} map with any tiles ALREADY in the row — these
         come from the XSL's Story Tile group (author-picked tiles baked
         in at server render). Without this seed, the feed appends a
         fresh tile for every article that's both author-picked AND in
         the whitelist, producing visible duplicates on the grid.

         Titles are read from the tile's <h2> since that's what the
         XSL-rendered tile carries. Feed-appended tiles won't exist in
         the DOM at this point yet, so they can't self-collide. */
      var seen = {};
      var preExistingTiles = row.querySelectorAll('.rbccm-conference-insights-tiles__item');
      for (var p = 0; p < preExistingTiles.length; p++) {
        var titleEl = preExistingTiles[p].querySelector('.rbccm-conference-insights-tiles__insight-title');
        if (titleEl) {
          seen[normalizeTitle(titleEl.textContent || '')] = true;
        }
      }

      var entries = [];
      allNews.forEach(function (n) {
        var titleRaw = child(n, 'title').trim();
        var key = normalizeTitle(titleRaw);
        var wl = byKey[key];
        if (!wl) return;               /* not in Joe's list — skip */
        if (seen[key]) return;         /* already rendered — dedupe */
        seen[key] = true;
        entries.push(makeEntry(n, wl));
      });

      /* Second pass: pick up any whitelist entries that never matched
         a year-feed article but carry hand-authored `manual` data.
         This is the escape hatch for articles that are live on the
         site but haven't been added to the /en/insights/data/{year}-
         insights XML feeds. As soon as content ops publishes them
         to a feed, the feed match wins on the first pass and this
         second pass is a no-op for that title. */
      whitelist.articles.forEach(function (wl) {
        if (!wl.manual) return;         /* no fallback data */
        if (seen[wl.match_key]) return; /* already rendered from feed */
        seen[wl.match_key] = true;
        entries.push(makeManualEntry(wl));
      });

      /* Sort newest first by the ACTUAL publish date, not the whitelist
         year. Whitelist year is Joe's editorial category (e.g., a Dec
         2024 article can be tagged "2025" because it looks ahead), so
         sorting by year would let older feed articles jump the queue.
         Using dateTs keeps the visible order date-consistent while the
         year attribute still drives the filter dropdown. */
      entries.sort(function (a, b) {
        return (b.dateTs || 0) - (a.dateTs || 0);
      });

      /* Render. First tile gets the featured modifier — Filter By's
         hero-vs-dense pattern already keys off this class. */
      var frag = document.createDocumentFragment();
      entries.forEach(function (entry, i) {
        frag.appendChild(buildTile(entry, i === 0));
      });
      row.appendChild(frag);

      /* Signal to filter-by.js (and any consumer) that tiles are done.
         If a Filter By component is bound to this container, it will
         re-scan items and re-populate its dropdowns. */
      container.setAttribute('data-filter-ready', 'true');

      /* Trigger a re-init on Filter By so it picks up new tiles. If
         filter-by.js exposed a re-scan API we'd call it directly; for
         now we dispatch a custom event that filter-by.js can listen
         for (or ignore — safe either way). */
      container.dispatchEvent(new CustomEvent('rbccm:tiles-populated', {
        bubbles: true,
        detail: { count: entries.length },
      }));
    })
    .catch(function (err) {
      /* Never fatal — if the fetch/whitelist fails, the page still
         renders whatever was in the Story Tile group from XSL (empty
         is fine). Skeleton stays until we flip data-filter-ready. */
      console.warn('[conference-insights-tiles-feed]', err);
      /* Flip ready anyway so the skeleton doesn't spin forever. */
      container.setAttribute('data-filter-ready', 'true');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
