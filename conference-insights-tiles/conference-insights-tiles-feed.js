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

    body.appendChild(label);
    body.appendChild(divider);
    body.appendChild(h2);
    body.appendChild(desc);
    body.appendChild(meta);

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
     application/xml code path so `<news>` etc. stay real elements. */
  function escapeStrayAmpersands(s) {
    if (!s) return s;
    return s.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
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

    return {
      title:       title,
      description: displayDescription,
      href:        link,
      thumbnail:   thumb,
      eyebrow:     category,
      year:        year,
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
         feeds carrying the same article don't produce duplicate tiles. */
      var seen = {};
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

      /* Sort newest first (by year descending). Ties keep feed order,
         which is date-descending on the RBCCM side. */
      entries.sort(function (a, b) {
        var ay = parseInt(a.year || '0', 10);
        var by = parseInt(b.year || '0', 10);
        return by - ay;
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
