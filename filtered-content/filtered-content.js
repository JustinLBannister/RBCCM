/* =========================================================================
   rbccm-filtered-content — SINGLE CONSOLIDATED JS
   ========================================================================= */

/* ---------- PART 1: filter engine (ported from filter-by.js) ---------- */

/* =========================================================================
   Filter Component (shared)
   -------------------------------------------------------------------------
   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent.

   ---- Container-driven API ---------------------------------------------
   Author provides a single `data-container` selector on the filter root.
   The filter then:
     1. Finds every element inside that container with `[data-search-text]`
        (or a custom selector via `data-item-selector`)
     2. Auto-injects an empty-state block and pagination nav at the end
        of the container (unless the author already placed them there)
     3. Filters + paginates the item set as inputs change

   ---- Dimension-agnostic dropdowns -------------------------------------
   Every dropdown in the filter markup has `data-filter="<dim>"` (e.g.
   "year", "region", "topic", "platform", "conference"). On init the
   JS:
     - Scans all items for unique values of `data-<dim>`
     - Populates the dropdown with one option per unique value
     - If ZERO unique values are found, HIDES the dropdown's wrapper
       entirely (until content ops backfills the tag on articles)

   This means authors can drop any number of dropdowns into the filter
   UI — the JS handles auto-populate, hide-if-empty, and match logic
   without code changes. Add a new filter dimension by:
     1. Adding a <select data-filter="topic"> to the filter markup
     2. Emitting data-topic="..." on the items

   ---- Multi-value item attributes --------------------------------------
   Item data attributes can carry multiple values, whitespace / comma /
   slash separated. e.g. data-topic="healthcare energy-transition"
   or data-region="UK/US". The match logic checks if the selected
   dropdown value is any of the item's split values.

   ---- Region bucketing (special) ---------------------------------------
   The `region` dimension uses bucketing: dropdown values are bucket keys
   (e.g. "europe") that expand to raw ISO codes via REGION_BUCKETS.
   Other dimensions use exact match.

   ---- Data contract on filtered items -----------------------------------
     data-<dim>      value(s) for the dropdown labelled data-filter="<dim>"
     data-search-text lowercased searchable haystack (required to be found)

   ---- Free-text search scope --------------------------------------------
   Search matches data-search-text (title + description) PLUS every
   registered dropdown dimension, so typing "financial" also returns
   everything tagged data-topic="financial-institutions", and "europe"
   returns everything tagged data-region="de".
   Hyphens are flattened to spaces on both the query and the haystack, so
   slugged values match either way ("financial institutions" == the slug).
   Region codes are reverse-mapped to their bucket key + label first, since
   nobody searches "de" — see haystackFor() / regionSearchTerms().

   ---- Plural + synonym handling -----------------------------------------
   Query "financials" would normally miss "financial institutions" because
   the substring match is too literal. normalizeSearch() therefore also:
     1. Applies a phrase-level SEARCH_SYNONYMS lookup (whole-query match)
        so common paraphrases route to the canonical taxonomy label
        (e.g. "financial services" → "financial institutions").
     2. Strips trailing "s" per word so plurals fold onto their singular
        (financials → financial, services → service). Skips short words
        (≤3 chars) and double-s words (class → class, not clas).
   Both are applied to query AND haystack so they stay in sync.
   ========================================================================= */

(function () {
  'use strict';

  var REGION_BUCKETS = {
    'global': ['global'],
    'us':     ['us', 'usa', 'global'],   /* TEMP: US matches Global until DCR adds a real "us" option */
    'canada': ['ca', 'canada'],
    'europe': ['be', 'fr', 'de', 'it', 'ie', 'lu', 'ch', 'gb', 'uk', 'ae', 'europe', 'emea'],
    'apac':   ['au', 'hk', 'my', 'sg', 'apac', 'asia', 'asia-pacific']
  };

  /* Order buckets appear in the Region dropdown. */
  var REGION_ORDER = ['global', 'us', 'canada', 'europe', 'apac'];

  var REGION_LABELS = {
    'global': 'Global',
    'us':     'US',
    'canada': 'Canada',
    'europe': 'Europe',
    'apac':   'APAC'
  };

  /* Known acronyms → keep uppercase in display labels rather than
     title-casing them into "Us", "Apac", etc. */
  var ACRONYM_LABELS = {
    'apac':  'APAC',
    'us':    'US',
    'usa':   'USA',
    'uk':    'UK',
    'ai':    'AI',
    'esg':   'ESG',
    'emea':  'EMEA'
  };

  /* Whole-query synonyms — route common paraphrases to the canonical
     taxonomy phrase so search finds articles tagged under the official
     Topic label. Applied by normalizeSearch() before the plural strip.
     Keys and values are lowercased, hyphen-flattened, whitespace-collapsed
     — i.e. the same shape normalizeSearch produces. Extend as content ops
     identifies gaps between what editors write and what users type. */
  var SEARCH_SYNONYMS = {
    'financial services': 'financial institutions'
  };

  /* Canonical Topic labels — kebab-case DCR values map to human-readable
     labels with proper spaces and ampersands. Matches the July 2 taxonomy
     Joe locked in (9 topics). Add here when new topics land in the DCR. */
  var TOPIC_LABELS = {
    'energy':                          'Energy',
    'energy-transition':               'Energy Transition',
    'financial-institutions':          'Financial Institutions',
    'healthcare':                      'Healthcare',
    'industrials':                     'Industrials',
    'markets-economics':               'Markets & Economics',
    'mining-materials':                'Mining & Materials',
    'power-utilities-infrastructure':  'Power, Utilities & Infrastructure',
    'technology-innovation':           'Technology & Innovation'
  };

  var DEFAULT_STRINGS = {
    emptyHeading:           'No results found',
    emptyMessage:           "We couldn't find any results that match your current filters.",
    emptyMessageEmphasis:   'Try adjusting your filters or search terms.',
    emptyClearLabel:        'Clear filters',
    prevPageLabel:          'Previous page',
    nextPageLabel:          'Next page',
    pageBtnLabel:           'Page {n}',
    ellipsis:               '…'
  };

  var STRING_ATTRS = {
    emptyHeading:           'data-empty-heading',
    emptyMessage:           'data-empty-message',
    emptyMessageEmphasis:   'data-empty-message-emphasis',
    emptyClearLabel:        'data-empty-clear-label',
    prevPageLabel:          'data-prev-page-label',
    nextPageLabel:          'data-next-page-label',
    pageBtnLabel:           'data-page-btn-label',
    ellipsis:               'data-ellipsis'
  };

  var EMPTY_ICON_SVG = '<svg class="rbccm-filtered-content__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 43" fill="none" aria-hidden="true">'
    + '<circle cx="17" cy="17" r="12" stroke="currentColor" stroke-width="2.5"/>'
    + '<line x1="25.5" y1="25.5" x2="37" y2="37" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'
    + '</svg>';

  function fmt(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (_, k) {
      return (vars && vars[k] != null) ? vars[k] : '';
    });
  }

  function readStrings(filterRoot) {
    var strings = {};
    for (var key in DEFAULT_STRINGS) {
      if (!DEFAULT_STRINGS.hasOwnProperty(key)) continue;
      var attrVal = filterRoot.getAttribute(STRING_ATTRS[key]);
      strings[key] = (attrVal != null && attrVal !== '') ? attrVal : DEFAULT_STRINGS[key];
    }
    return strings;
  }

  /* Split a raw attribute value into normalized tokens.
     Handles space, comma, and slash separators. Lowercases everything. */
  function tokenize(raw) {
    if (!raw) return [];
    return String(raw).toLowerCase().split(/[\s,\/]+/).filter(Boolean);
  }

  /* Format a raw value into a display label for a given dimension.
     Month YYYY-MM → "Month YYYY". Other dimensions get title-cased with
     hyphens replaced by spaces. */
  function formatValue(value, dim) {
    if (!value) return value;
    /* Year is already display-ready ("2025", "2026") — pass through. */
    if (dim === 'year') {
      return value;
    }
    if (dim === 'region') {
      return REGION_LABELS[value.toLowerCase()] || value;
    }
    if (dim === 'topic') {
      /* Canonical taxonomy label wins so ampersands, commas, and casing
         match Joe's spreadsheet exactly. Falls back to generic title-case
         for unknown topics (new taxonomy entries not yet added to map). */
      return TOPIC_LABELS[value.toLowerCase()] || genericTitleCase(value);
    }
    /* Generic fallback for any other dimension: title-case each word,
       keep known acronyms all-caps ("apac" → "APAC", not "Apac"). */
    return genericTitleCase(value);
  }

  function genericTitleCase(value) {
    return value.replace(/[-_]+/g, ' ').replace(/\S+/g, function (word) {
      var lower = word.toLowerCase();
      if (ACRONYM_LABELS[lower]) return ACRONYM_LABELS[lower];
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    });
  }

  function ensureEmptyState(container, isDark) {
    var existing = container.querySelector('.rbccm-filtered-content__empty');
    if (existing) {
      if (isDark) existing.classList.add('rbccm-filtered-content__empty--dark');
      return existing;
    }
    var el = document.createElement('div');
    el.className = 'rbccm-filtered-content__empty' + (isDark ? ' rbccm-filtered-content__empty--dark' : '');
    container.appendChild(el);
    return el;
  }

  function ensurePaginationHost(container) {
    var existing = container.querySelector('.rbccm-filtered-content__pagination-host');
    if (existing) return existing;
    var el = document.createElement('div');
    el.className = 'rbccm-filtered-content__pagination-host';
    container.appendChild(el);
    return el;
  }

  function bindFilter(filterRoot) {
    if (filterRoot.getAttribute('data-filter-bound') === 'true') return;
    filterRoot.setAttribute('data-filter-bound', 'true');

    var strings        = readStrings(filterRoot);
    var isDark         = filterRoot.classList.contains('rbccm-filtered-content--dark');
    var containerSel   = filterRoot.getAttribute('data-container');
    var container      = containerSel ? document.querySelector(containerSel) : null;

    if (!container) {
      console.warn('[rbccm-filtered-content__filter] No container found for selector:', containerSel);
      return;
    }

    var itemSelector   = filterRoot.getAttribute('data-item-selector') || '[data-search-text], [data-title]';
    var pageSize       = parseInt(filterRoot.getAttribute('data-page-size'), 10) || 0;
    /* Optional "when filter is active" page size. Editorial pattern: default
       view shows a hero + few items (page-size=4); active filtering flips
       to a denser utilitarian view (page-size-filtered=6). Falls back to
       the default page size if not set. */
    var filteredPageSize = parseInt(filterRoot.getAttribute('data-page-size-filtered'), 10) || pageSize;
    var allItems       = container.querySelectorAll(itemSelector);
    var emptyState     = ensureEmptyState(container, isDark);
    var paginationHost = ensurePaginationHost(container);

    /* -------- Lazy per-year loading --------
       When the ITM component has a full archive available at per-year URLs
       (e.g. /en/about-us/data/{year}), the XSL can seed the initial DOM
       with just the current year and let the JS fetch older years on
       demand as the user selects them from the Year dropdown.

       Two data attributes control this:
         data-available-years        comma-separated list of years the
                                     Year dropdown should offer, e.g.
                                     "2010,2011,...,2026". When present,
                                     Year dropdown is built from this
                                     list instead of auto-populating from
                                     items already in the DOM.
         data-year-feed-template     URL template with {year} placeholder,
                                     e.g. "/en/about-us/data/{year}". On
                                     year select, if no items exist in the
                                     DOM for that year, JS fetches this
                                     URL, parses the <news> nodes, and
                                     injects <li>s into the container
                                     before running the filter.

       yearLoadedCache tracks which years are known-loaded in the DOM
       so re-selecting a year doesn't re-fetch. Seeded lazily on first
       year-select from whatever items are already in the DOM. */
    var availableYears   = (filterRoot.getAttribute('data-available-years') || '').split(/[\s,]+/).filter(Boolean);
    var yearFeedTemplate = filterRoot.getAttribute('data-year-feed-template') || '';
    var yearLoadedCache  = null;

    /* Track link URLs already present in the DOM so lazy-fetched
       archives can dedup against them. Rebuilt every time we seed
       (i.e. same time as yearLoadedCache). */
    var seededLinkSet = null;

    function isYearLoaded(year) {
      if (!yearLoadedCache) {
        yearLoadedCache = {};
        seededLinkSet   = {};
        for (var i = 0; i < allItems.length; i++) {
          var y = allItems[i].getAttribute('data-year');
          if (y) yearLoadedCache[y] = true;
          var a = allItems[i].querySelector('a[href]');
          if (a) seededLinkSet[a.getAttribute('href')] = true;
        }
        /* The CURRENT year (first entry in availableYears) is seeded
           from a MetaQueryExternal capped at 200 items, so it may only
           cover recent months. Treat it as NOT loaded so selecting it
           triggers the archive fetch (which returns the full year with
           ?qPagesize=500). Dedup by link URL below prevents dupes. */
        if (availableYears.length > 0) {
          delete yearLoadedCache[availableYears[0]];
        }
      }
      return !!yearLoadedCache[year];
    }

    /* Fetch one year's archive. On the RBC archive endpoints, a URL like
       /en/about-us/data/2025 actually returns items spanning 2025 back
       through the earliest available year (2010) — one endpoint = all
       history from that year down. So instead of trusting the year arg
       to stamp items, we parse each <date> for its real year and mark
       every year we actually saw as loaded. If the requested year has
       no dedicated endpoint (404 / empty), we fall back to the earliest
       available year (last entry in availableYears), which is the
       master archive on the RBC feed. */
    /* Insert N skeleton row placeholders into the list. Sized to
       roughly match the real ITM item shape so the container height
       stays consistent when real items land. Skeleton rows use their
       own class (not `__item`) so filter/pagination logic ignores
       them. */
    function injectSkeletonRows(count) {
      var listEl = container.matches && container.matches('ul')
        ? container
        : (container.querySelector && container.querySelector('.rbccm-filtered-content__list'))
            || container;
      if (!listEl) return;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var li = document.createElement('li');
        li.className = 'rbccm-filtered-content__skeleton-row';
        li.setAttribute('aria-hidden', 'true');
        li.innerHTML =
          '<div class="rbccm-filtered-content__skeleton-row-bar rbccm-filtered-content__skeleton-row-bar--title"></div>' +
          '<div class="rbccm-filtered-content__skeleton-row-bar rbccm-filtered-content__skeleton-row-bar--footer"></div>';
        frag.appendChild(li);
      }
      listEl.appendChild(frag);
    }

    function removeSkeletonRows() {
      var rows = container.querySelectorAll('.rbccm-filtered-content__skeleton-row');
      for (var i = 0; i < rows.length; i++) {
        rows[i].parentNode && rows[i].parentNode.removeChild(rows[i]);
      }
    }

    function fetchYearArchive(year) {
      if (!yearFeedTemplate) return Promise.resolve();
      /* Loading state — hide real items via `.is-lazy-loading` on
         root and inject skeleton rows in their place. Clear on
         success OR failure so a failed fetch doesn't leave the
         list stuck in skeleton mode. */
      container.classList.add('is-lazy-loading');
      injectSkeletonRows(pageSize > 0 ? pageSize : 6);
      var clear = function () {
        container.classList.remove('is-lazy-loading');
        removeSkeletonRows();
      };
      return fetchYearArchiveUrl(yearFeedTemplate.replace('{year}', year), year, true)
        .then(function (r) { clear(); return r; }, function (e) { clear(); throw e; });
    }

    function fetchYearArchiveUrl(url, requestedYear, allowFallback) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (xmlStr) {
        var doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
        if (!doc || doc.getElementsByTagName('parsererror').length > 0) return null;
        var newsNodes = doc.getElementsByTagName('news');
        if (!newsNodes.length) return null;
        var frag = document.createDocumentFragment();
        var yearsSeen = {};
        var addedForRequested = false;
        /* Ensure seed set exists (may not have been triggered yet if
           this is the very first fetch on this filter instance). */
        if (!seededLinkSet) { isYearLoaded('__seed__'); }
        for (var i = 0; i < newsNodes.length; i++) {
          var built = buildYearArchiveItem(newsNodes[i]);
          if (!built) continue;
          /* Dedup against server-rendered items — the current year's
             initial 200 items overlap with the fetched archive. */
          if (built.link && seededLinkSet[built.link]) continue;
          if (built.link) seededLinkSet[built.link] = true;
          frag.appendChild(built.li);
          if (built.year) {
            yearsSeen[built.year] = true;
            if (built.year === String(requestedYear)) addedForRequested = true;
          }
        }
        /* If the endpoint returned items but none for the requested year,
           and we haven't already tried the fallback, try the master
           archive at the earliest available year. */
        if (!addedForRequested && allowFallback && availableYears.length > 0) {
          var fallbackYear = availableYears[availableYears.length - 1];
          if (fallbackYear && fallbackYear !== String(requestedYear)) {
            return fetchYearArchiveUrl(
              yearFeedTemplate.replace('{year}', fallbackYear),
              requestedYear,
              false
            );
          }
        }
        /* `container` may be the OUTER section (when data-container
           points at it) rather than the list <ul>. Inject items into
           the actual list so they participate in the grid — appending
           to the section would put them AFTER the pagination host. */
        var listEl = container.matches && container.matches('ul')
          ? container
          : (container.querySelector && container.querySelector('.rbccm-filtered-content__list'))
              || container;
        listEl.appendChild(frag);
        /* Mark every year that actually appeared in the feed as loaded
           so re-selecting any of them skips a redundant fetch. */
        for (var y in yearsSeen) {
          if (yearsSeen.hasOwnProperty(y)) yearLoadedCache[y] = true;
        }
        yearLoadedCache[requestedYear] = true;
        allItems = container.querySelectorAll(itemSelector);
        /* Clear per-item cached search haystacks — items with the same
           dim tokens will regenerate cleanly on next haystackFor() call. */
        for (var j = 0; j < allItems.length; j++) delete allItems[j].__rbccmHaystack;
        return null;
      }).catch(function (err) {
        /* Direct-year endpoint may 404 for older years — fall back to
           the master archive at the earliest available year. */
        if (allowFallback && availableYears.length > 0) {
          var fallbackYear = availableYears[availableYears.length - 1];
          if (fallbackYear && fallbackYear !== String(requestedYear)) {
            return fetchYearArchiveUrl(
              yearFeedTemplate.replace('{year}', fallbackYear),
              requestedYear,
              false
            );
          }
        }
        console.warn('[rbccm-filtered-content] year lazy-load failed for ' + requestedYear + ':', err);
      });
    }

    /* Convert a <news> node from the archive feed into a
       .rbccm-filtered-content__item <li> that matches the shape of the
       inline server-rendered items. Feed fields:
         <date>September 4, 2026</date>
         <link>...</link>
         <title><![CDATA[ ... ]]></title>
         <description><![CDATA[ ... ]]></description>
         <topic><![CDATA[ media|press|(blank) ]]></topic>
       Returns { li, year } so the caller can track which years were
       actually present in the feed (endpoints span multiple years). */
    function buildYearArchiveItem(node) {
      var getText = function (tag) {
        var el = node.getElementsByTagName(tag)[0];
        return el ? String(el.textContent || '').trim() : '';
      };
      var title = getText('title');
      if (!title) return null;
      var link = getText('link');
      var description = getText('description');
      var dateStr = getText('date');   /* "September 4, 2026" */
      var topic = getText('topic').toLowerCase();

      /* Local HTML-escape — the shared `esc` helper lives in a
         different IIFE and isn't visible from bindFilter's closure. */
      var localEsc = function (s) {
        return String(s == null ? '' : s)
          .replace(/&/g,'&amp;').replace(/</g,'&lt;')
          .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      };
      /* Local month lookup — MONTH_NUM lives in a different IIFE and
         isn't visible from bindFilter's closure. Keep this table in
         sync if the shared one gains new tokens. */
      var LOCAL_MONTH_NUM = {
        january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
        july:'07', august:'08', september:'09', october:'10', november:'11', december:'12',
        jan:'01', feb:'02', mar:'03', apr:'04', jun:'06', jul:'07',
        aug:'08', sep:'09', sept:'09', oct:'10', nov:'11', dec:'12'
      };
      var monthTok = (dateStr.match(/^([A-Za-z]+)/) || [])[1];
      var monthNum = monthTok ? (LOCAL_MONTH_NUM[monthTok.toLowerCase()] || '') : '';
      var yearMatch = dateStr.match(/(\d{4})/);
      var itemYear = yearMatch ? yearMatch[1] : '';
      var typeToken = topic.indexOf('press') !== -1 ? 'press' : 'media';
      var eyebrowLabel = typeToken === 'press' ? 'Press release' : 'Media coverage';
      var eyebrowMod = typeToken === 'press'
        ? 'rbccm-filtered-content__card-eyebrow--press'
        : 'rbccm-filtered-content__card-eyebrow--media';
      var isExternal = /^https?:\/\//i.test(link);
      var haystack = (title + ' ' + description).toLowerCase();

      var li = document.createElement('li');
      li.className = 'rbccm-filtered-content__item';
      li.setAttribute('data-type', typeToken);
      if (itemYear) li.setAttribute('data-year', itemYear);
      if (monthNum) li.setAttribute('data-month', monthNum);
      li.setAttribute('data-search-text', haystack);

      var linkAttrs = ' href="' + localEsc(link || '#') + '"';
      if (isExternal) linkAttrs += ' target="_blank" rel="noopener"';

      li.innerHTML =
        '<div class="rbccm-filtered-content__card rbccm-filtered-content__card--article">' +
          '<div class="rbccm-filtered-content__card-topbar">' +
            '<div class="rbccm-filtered-content__card-date">' + localEsc(dateStr) + '</div>' +
          '</div>' +
          '<h3 class="rbccm-filtered-content__card-title"><a' + linkAttrs + '>' + localEsc(title) + '</a></h3>' +
          '<div class="rbccm-filtered-content__card-footer">' +
            '<div class="rbccm-filtered-content__card-footer-metadata">' +
              '<span class="rbccm-filtered-content__card-eyebrow ' + eyebrowMod + '">' + localEsc(eyebrowLabel) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      return { li: li, year: itemYear, link: link };
    }

    /* -------- Register every dropdown in the filter markup --------
       Each `.rbccm-filtered-content__select-wrapper[data-filter="<dim>"]` gets a
       custom-styled popup listbox built from item data-<dim> values.
       Wrap is hidden if no items carry that attribute. */
    var dropdowns = [];      /* [{ dim, wrap, button, panel, getValue, setValue, close }] */
    var dropdownWraps = filterRoot.querySelectorAll('.rbccm-filtered-content__select-wrapper[data-filter]');
    for (var d = 0; d < dropdownWraps.length; d++) {
      var w = dropdownWraps[d];
      var dm = w.getAttribute('data-filter');
      if (!dm || dm === 'search') continue;
      var built = buildCustomDropdown(w, dm);
      if (built) dropdowns.push(built);
    }

    function buildCustomDropdown(wrap, dim) {
      var attrName = 'data-' + dim;
      var button = wrap.querySelector('.rbccm-filtered-content__select');
      if (!button) return null;

      /* Reset any prior inline display state from a previous bind
         (e.g. a rebind after tiles were populated by the feed script —
         the first bind ran on an empty item set and hid the wrap;
         this bind may find data and needs the wrap visible again). */
      wrap.style.display = '';

      /* On rebind, the previous bind's click/keydown listeners are still
         attached to the button. Clone-and-replace drops them so we don't
         stack a second set of listeners (which would fire twice per
         click and net to open+close = no visible change). */
      var freshButton = button.cloneNode(true);
      button.parentNode.replaceChild(freshButton, button);
      button = freshButton;

      /* Collect unique lowercased tokens across all items. */
      var seen = {};
      var rawTokens = [];
      for (var i = 0; i < allItems.length; i++) {
        var tokens = tokenize(allItems[i].getAttribute(attrName) || '');
        for (var t = 0; t < tokens.length; t++) {
          if (!seen[tokens[t]]) {
            seen[tokens[t]] = true;
            rawTokens.push(tokens[t]);
          }
        }
      }

      /* Year dropdown special case: when data-available-years is authored,
         use that list verbatim instead of auto-populating from items.
         This lets the ITM preset offer historical years (e.g. 2010-2026)
         in the dropdown while only having the current year's items in
         the DOM initially — lazy-loaded on year select. Seed the `seen`
         map with each authored year so subsequent logic treats them as
         known values. */
      if (dim === 'year' && availableYears.length > 0) {
        for (var ay = 0; ay < availableYears.length; ay++) {
          if (!seen[availableYears[ay]]) {
            seen[availableYears[ay]] = true;
            rawTokens.push(availableYears[ay]);
          }
        }
      }

      /* Month dropdown special case: months are universal, so always
         offer all 12 rather than auto-populating from whatever items
         happen to be in the DOM. Otherwise the initial DOM (which may
         only cover the current year, e.g. Apr-Sep) would show a partial
         month list, and lazy-loading older years wouldn't extend it. */
      if (dim === 'month') {
        var allMonths = ['01','02','03','04','05','06','07','08','09','10','11','12'];
        for (var am = 0; am < allMonths.length; am++) {
          if (!seen[allMonths[am]]) {
            seen[allMonths[am]] = true;
            rawTokens.push(allMonths[am]);
          }
        }
      }

      /* No data for this dimension → hide the whole dropdown. */
      if (rawTokens.length === 0) {
        wrap.style.display = 'none';
        return null;
      }

      /* Region: dropdown options are BUCKETS (Global/US/Canada/Europe/APAC),
         not raw ISO codes. Compute which buckets have at least one matching
         code among the collected tokens. */
      var values;
      if (dim === 'region') {
        values = [];
        for (var b = 0; b < REGION_ORDER.length; b++) {
          var bucketKey = REGION_ORDER[b];
          var codes = REGION_BUCKETS[bucketKey];
          for (var c = 0; c < codes.length; c++) {
            if (seen[codes[c]]) { values.push(bucketKey); break; }
          }
        }
        /* No bucket matched — nothing to show. */
        if (values.length === 0) {
          wrap.style.display = 'none';
          return null;
        }
      } else {
        values = rawTokens.slice();
        /* Sort: year descending (newest first), everything else alphabetical. */
        values.sort();
        if (dim === 'year') values.reverse();
      }

      /* Derive the default label from the button's aria-label (e.g. "Filter
         by topic" → "Topic"). Sourcing from aria-label rather than the
         current visible text is important: if URL params or an earlier
         setValue call have already changed the button's visible text to
         (say) "Energy", rebuilding the dropdown would otherwise capture
         "Energy" as the default and stamp it on the clear-filter option,
         producing a duplicate "Energy" at the top of the list.

         Falls back to the current visible text only if aria-label is
         missing, and to the dimension name last of all. */
      var labelEl = button.querySelector('.rbccm-filtered-content__select-label');
      var ariaLabel = (button.getAttribute('aria-label') || '').replace(/^Filter by\s+/i, '').trim();
      var defaultLabel;
      if (ariaLabel) {
        defaultLabel = ariaLabel.charAt(0).toUpperCase() + ariaLabel.slice(1);
      } else if (labelEl) {
        defaultLabel = labelEl.textContent.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
      } else {
        defaultLabel = dim.charAt(0).toUpperCase() + dim.slice(1);
      }
      if (!labelEl) {
        button.textContent = '';
        labelEl = document.createElement('span');
        labelEl.className = 'rbccm-filtered-content__select-label';
        labelEl.textContent = defaultLabel;
        button.appendChild(labelEl);
      }

      /* Build popup panel. */
      var panel = document.createElement('ul');
      panel.className = 'rbccm-filtered-content__select-panel';
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-label', defaultLabel);
      panel.setAttribute('hidden', 'hidden');

      /* First option clears the filter. */
      panel.appendChild(makeOption('', defaultLabel));
      for (var v = 0; v < values.length; v++) {
        panel.appendChild(makeOption(values[v], formatValue(values[v], dim)));
      }
      wrap.appendChild(panel);

      var options = panel.querySelectorAll('.rbccm-filtered-content__select-option');
      var currentValue = '';
      options[0].setAttribute('aria-selected', 'true');

      function makeOption(value, text) {
        var li = document.createElement('li');
        li.className = 'rbccm-filtered-content__select-option';
        li.setAttribute('role', 'option');
        li.setAttribute('data-value', value);
        li.setAttribute('aria-selected', 'false');
        li.tabIndex = -1;
        li.textContent = text;
        return li;
      }

      function findOption(value) {
        for (var i = 0; i < options.length; i++) {
          if (options[i].getAttribute('data-value') === value) return options[i];
        }
        return null;
      }

      function setValue(value) {
        currentValue = value;
        for (var i = 0; i < options.length; i++) {
          options[i].setAttribute('aria-selected', options[i].getAttribute('data-value') === value ? 'true' : 'false');
        }
        var match = findOption(value);
        labelEl.textContent = (match && value !== '') ? match.textContent : defaultLabel;
      }

      function isOpen() {
        return button.getAttribute('aria-expanded') === 'true';
      }

      function open() {
        closeAllExcept(panel);
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
        var focused = panel.querySelector('.rbccm-filtered-content__select-option[aria-selected="true"]') || options[0];
        if (focused) focused.focus();
      }

      function close() {
        panel.setAttribute('hidden', 'hidden');
        button.setAttribute('aria-expanded', 'false');
      }

      /* ---------- Button events ---------- */
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isOpen()) close();
        else open();
      });
      button.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        } else if (e.key === 'Escape' && isOpen()) {
          e.preventDefault();
          close();
        }
      });

      /* ---------- Option events ---------- */
      for (var o = 0; o < options.length; o++) {
        (function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            var value = opt.getAttribute('data-value');
            setValue(value);
            close();
            button.focus();

            /* Year dropdown + lazy-load: if this year's items aren't in
               the DOM yet, fetch the per-year archive first, inject the
               items, then run apply(). If the year IS loaded (or if
               lazy-load isn't configured), apply immediately. */
            if (dim === 'year' && value !== '' && yearFeedTemplate && !isYearLoaded(value)) {
              fetchYearArchive(value).then(function () { apply(true); });
            } else {
              apply(true);
            }
          });
          opt.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              opt.click();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              (opt.nextElementSibling || options[0]).focus();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              (opt.previousElementSibling || options[options.length - 1]).focus();
            } else if (e.key === 'Home') {
              e.preventDefault();
              options[0].focus();
            } else if (e.key === 'End') {
              e.preventDefault();
              options[options.length - 1].focus();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              close();
              button.focus();
            } else if (e.key === 'Tab') {
              close();
            }
          });
        })(options[o]);
      }

      return {
        dim: dim,
        wrap: wrap,
        button: button,
        panel: panel,
        getValue: function () { return currentValue; },
        setValue: setValue,
        close: close
      };
    }

    /* Close all open panels except the given one. */
    function closeAllExcept(exceptPanel) {
      for (var i = 0; i < dropdowns.length; i++) {
        if (dropdowns[i].panel !== exceptPanel) dropdowns[i].close();
      }
    }

    /* Outside-click closes any open panel. Bound at document level so a
       click anywhere off the wraps dismisses. */
    document.addEventListener('click', function (e) {
      for (var i = 0; i < dropdowns.length; i++) {
        if (!dropdowns[i].wrap.contains(e.target)) dropdowns[i].close();
      }
    });

    var searchInput = filterRoot.querySelector('[data-filter="search"]');
    var resetBtn    = filterRoot.querySelector('.rbccm-filtered-content__reset');
    var currentPage = 0;

    function resetFilters() {
      /* Clear each dropdown via its setValue('') closure, which resets
         currentValue, aria-selected states, and labelEl.textContent to
         the default. Also close any open panel so a mid-interaction
         reset doesn't leave a stray panel visible. Belt-and-suspenders:
         re-query the visible label span from the DOM and force it back
         to the button's aria-label as a fallback in case setValue's
         labelEl closure reference got detached. */
      for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].setValue('');
        dropdowns[i].close();
        var btn = dropdowns[i].button;
        if (btn) {
          var lbl = btn.querySelector('.rbccm-filtered-content__select-label');
          var fallback = (btn.getAttribute('aria-label') || '').replace(/^Filter by\s+/i, '');
          if (lbl && fallback) {
            // Capitalize first letter to match default (e.g. "year" → "Year")
            lbl.textContent = fallback.charAt(0).toUpperCase() + fallback.slice(1);
          }
        }
      }
      if (searchInput) searchInput.value = '';
      apply(true);
    }

    /* Search terms and haystacks are normalised the same way: lowercased,
       hyphens flattened to spaces, whitespace collapsed. Dimension values
       are slugs ("financial-institutions markets-economics"), so without
       the hyphen flattening a search for "financial institutions" would
       miss the very items the Topic dropdown returns.

       Also does two matching-friendlier passes:
         1. Whole-query synonym lookup so "financial services" folds to
            "financial institutions" before comparison. Applied to the
            haystack too, harmlessly: an item tagged "financial services"
            would surface under a "financial institutions" query as well.
         2. Trailing-s strip per word so plurals match singulars
            (financials → financial). Skips length ≤3 (spare "as", "is",
            "us", "his") and words ending in "ss" (spare "class"). */
    function stripTrailingS(word) {
      if (word.length <= 3) return word;
      if (word.charAt(word.length - 1) !== 's') return word;
      if (word.charAt(word.length - 2) === 's') return word;
      return word.slice(0, -1);
    }
    function normalizeSearch(raw) {
      var s = String(raw || '').toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      if (!s) return '';
      if (SEARCH_SYNONYMS[s]) s = SEARCH_SYNONYMS[s];
      s = s.split(' ').map(stripTrailingS).join(' ');
      return s;
    }

    function getState() {
      var state = { search: searchInput ? normalizeSearch(searchInput.value) : '' };
      for (var i = 0; i < dropdowns.length; i++) {
        state[dropdowns[i].dim] = dropdowns[i].getValue().trim();
      }
      return state;
    }

    /* ---------------------------------------------------------------
       Search haystack
       ---------------------------------------------------------------
       data-search-text is built from title + description only, so the
       taxonomy was invisible to search: typing "financial" returned just
       the articles with the word in their copy, while the Financial
       Institutions dropdown returned every article tagged with it.

       The haystack is therefore the item's text PLUS every registered
       dropdown dimension.

       Region needs translating first. Items carry raw ISO codes
       ("global us", "de"), while the dropdown offers buckets
       (Global/US/Canada/Europe/APAC), so the codes alone are not what
       anyone would type. regionSearchTerms() reverse-maps an item's OWN
       codes to the bucket key + label it belongs to, and folds those in
       alongside the codes.

       Note it maps the item's own codes only — NOT the bucket's full code
       list. Folding in the whole list would put every European code on a
       German article, so searching "uk" would return it. The narrower map
       keeps "europe"/"canada"/"apac" working without that false positive.
       The trade-off: aliases that live only in the bucket list ("emea")
       won't match an item tagged "de". Supporting those means expanding
       the query through the buckets, which is a different mechanism.

       Cached per element: apply() runs on every keystroke, and these
       attributes don't change between renders. Feed re-renders produce new
       elements, which get fresh caches. */
    function regionSearchTerms(raw) {
      var codes = tokenize(raw);
      if (!codes.length) return '';
      var out = codes.slice();
      var seenBucket = {};
      for (var b = 0; b < REGION_ORDER.length; b++) {
        var bucketKey = REGION_ORDER[b];
        var bucketCodes = REGION_BUCKETS[bucketKey] || [];
        for (var c = 0; c < bucketCodes.length; c++) {
          if (codes.indexOf(bucketCodes[c]) === -1) continue;
          if (seenBucket[bucketKey]) break;
          seenBucket[bucketKey] = true;
          out.push(bucketKey);
          if (REGION_LABELS[bucketKey]) out.push(REGION_LABELS[bucketKey]);
          break;
        }
      }
      return out.join(' ');
    }

    function haystackFor(item) {
      if (item.__rbccmHaystack) return item.__rbccmHaystack;
      var parts = [item.getAttribute('data-search-text') || item.getAttribute('data-title') || ''];
      for (var i = 0; i < dropdowns.length; i++) {
        var dim = dropdowns[i].dim;
        var raw = item.getAttribute('data-' + dim) || '';
        parts.push(dim === 'region' ? regionSearchTerms(raw) : raw);
      }
      item.__rbccmHaystack = normalizeSearch(parts.join(' '));
      return item.__rbccmHaystack;
    }

    /* Region gets special bucketing via REGION_BUCKETS. */
    function matchesRegion(itemRegions, selectedBucket) {
      if (!selectedBucket) return true;
      var bucketKey = selectedBucket.toLowerCase();
      var codes = REGION_BUCKETS[bucketKey];
      if (!codes) return itemRegions.indexOf(bucketKey) !== -1;
      for (var i = 0; i < codes.length; i++) {
        if (itemRegions.indexOf(codes[i]) !== -1) return true;
      }
      return false;
    }

    /* Generic exact-match: any of the item's tokens for this dimension
       equals the selected dropdown value. */
    function matchesDim(item, dim, selectedValue) {
      if (!selectedValue) return true;
      var tokens = tokenize(item.getAttribute('data-' + dim) || '');
      return tokens.indexOf(selectedValue.toLowerCase()) !== -1;
    }

    function computeMatches() {
      var state = getState();
      var matched = [];
      var unmatched = [];

      for (var i = 0; i < allItems.length; i++) {
        var item = allItems[i];
        var pass = true;

        /* Iterate every registered dropdown. */
        for (var d = 0; d < dropdowns.length; d++) {
          var dim = dropdowns[d].dim;
          var val = state[dim];
          if (!val) continue;

          if (dim === 'region') {
            var itemRegions = tokenize(item.getAttribute('data-region') || '');
            if (!matchesRegion(itemRegions, val)) { pass = false; break; }
          } else {
            if (!matchesDim(item, dim, val)) { pass = false; break; }
          }
        }

        if (pass && state.search) {
          if (haystackFor(item).indexOf(state.search) === -1) pass = false;
        }

        if (pass) matched.push(item);
        else unmatched.push(item);
      }

      return { state: state, matched: matched, unmatched: unmatched };
    }

    function paginate(matched, unmatched, isFiltered) {
      for (var u = 0; u < unmatched.length; u++) unmatched[u].setAttribute('hidden', 'hidden');

      /* Mixed page sizes for the editorial pattern:
           - Unfiltered page 1: `pageSize` (default 4 — featured hero + 3).
           - Unfiltered page 2+: `filteredPageSize` (default 6 — dense 3x2).
           - Any filtered page: `filteredPageSize` (dense grid).
         The featured tile only exists as the first item, so once you
         leave page 1 there's no hero to anchor the hero layout anyway —
         switching to the dense page size gives a clean 3-up grid.

         When either size is 0/unset we degrade gracefully to a single page. */
      var heroSize  = pageSize > 0 ? pageSize : matched.length;
      var denseSize = filteredPageSize > 0 ? filteredPageSize : (pageSize > 0 ? pageSize : matched.length);

      var totalPages;
      var start, end;

      if (isFiltered) {
        /* Uniform dense pages. */
        totalPages = denseSize > 0 ? Math.ceil(matched.length / denseSize) : 1;
        if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);
        start = currentPage * denseSize;
        end   = start + denseSize;
      } else {
        /* Mixed: first page = heroSize, remaining pages = denseSize. */
        if (matched.length <= heroSize) {
          totalPages = 1;
        } else {
          totalPages = 1 + Math.ceil((matched.length - heroSize) / denseSize);
        }
        if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);

        if (currentPage === 0) {
          start = 0;
          end   = heroSize;
        } else {
          start = heroSize + (currentPage - 1) * denseSize;
          end   = start + denseSize;
        }
      }

      for (var m = 0; m < matched.length; m++) {
        if (m >= start && m < end) matched[m].removeAttribute('hidden');
        else matched[m].setAttribute('hidden', 'hidden');
      }

      /* The featured-hero layout only makes sense on page 1 unfiltered,
         since the featured tile is index 0. Mirror the `is-filtered`
         class as `is-past-first-page` on page 2+ so the CSS grid can
         collapse the hero back to a plain tile without needing a new
         selector convention. */
      if (!isFiltered && currentPage > 0) {
        container.classList.add('is-past-first-page');
      } else {
        container.classList.remove('is-past-first-page');
      }

      renderPagination(totalPages);
    }

    function anyFilterActive(state) {
      if (state.search) return true;
      for (var d = 0; d < dropdowns.length; d++) {
        if (state[dropdowns[d].dim]) return true;
      }
      return false;
    }

    function apply(resetPage) {
      if (resetPage) currentPage = 0;
      var r = computeMatches();
      var isFiltered = anyFilterActive(r.state);

      /* Toggle `is-filtered` BEFORE paginate so CSS + pagination see the
         same state (e.g. neutralize featured-tile layout + swap page size
         when active filtering flips the list into a denser view). */
      if (isFiltered) container.classList.add('is-filtered');
      else container.classList.remove('is-filtered');

      paginate(r.matched, r.unmatched, isFiltered);
      renderEmptyState(r.matched.length === 0 && isFiltered);

      /* Sync URL. Filter changes use replaceState (no history bloat as
         the user tries combos). Pagination handlers below use pushState
         so back button walks page steps. Init call uses replaceState. */
      writeUrlState(false);
    }


    /* ---------- URL param sync ----------
       Deep-link support. Reads state from
       ?year=…&region=…&topic=…&search=…&page=… on load, writes it back
       on every filter/page change. Popstate re-applies from URL so
       browser back/forward works.

       Param names match dimension keys 1:1 (year, region, topic — whatever
       the filter's dropdown data-dim attributes are), plus `search` for
       the search input and `page` for the 1-indexed page number. All
       values lowercase for readable, shareable URLs. */
    function writeUrlState(pushHistory) {
      if (!window.history || !window.URLSearchParams) return;
      try {
        var params = new URLSearchParams(window.location.search);
        var owned = ['search', 'page'];
        for (var i = 0; i < dropdowns.length; i++) owned.push(dropdowns[i].dim.toLowerCase());
        for (var j = 0; j < owned.length; j++) params.delete(owned[j]);

        for (var k = 0; k < dropdowns.length; k++) {
          var v = (dropdowns[k].getValue() || '').trim();
          if (v) params.set(dropdowns[k].dim.toLowerCase(), v);
        }
        if (searchInput && searchInput.value && searchInput.value.trim()) {
          params.set('search', searchInput.value.trim());
        }
        if (currentPage > 0) params.set('page', String(currentPage + 1));

        var query = params.toString();
        var newUrl = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
        var method = pushHistory ? 'pushState' : 'replaceState';
        window.history[method]({ page: currentPage }, '', newUrl);
      } catch (e) { /* sandboxed iframes / older browsers — silent fail */ }
    }

    function readUrlState() {
      if (!window.URLSearchParams) return;
      var params = new URLSearchParams(window.location.search);
      for (var i = 0; i < dropdowns.length; i++) {
        var val = params.get(dropdowns[i].dim.toLowerCase());
        if (val !== null) dropdowns[i].setValue(val);
      }
      if (searchInput) {
        var s = params.get('search');
        if (s !== null) searchInput.value = s;
      }
      var p = parseInt(params.get('page'), 10);
      if (!isNaN(p) && p > 0) currentPage = p - 1;
    }

    /* If the URL is hydrating a year we haven't loaded yet, fetch that
       year's archive first so the deep-linked page can actually match
       items. Falls through to a no-op if lazy-load isn't configured or
       the year is already in the DOM. Returns a Promise so callers can
       chain apply() after the fetch. */
    function ensureUrlYearLoaded() {
      if (!yearFeedTemplate || !window.URLSearchParams) return Promise.resolve();
      try {
        var y = new URLSearchParams(window.location.search).get('year');
        if (y && !isYearLoaded(y)) return fetchYearArchive(y);
      } catch (e) { /* silent */ }
      return Promise.resolve();
    }

    /* Back / forward — re-apply state from the URL that the browser
       just restored. Don't reset page — the URL is authoritative. */
    window.addEventListener('popstate', function () {
      readUrlState();
      ensureUrlYearLoaded().then(function () { apply(false); });
    });

    /* ---------- Empty state ---------- */
    function renderEmptyState(show) {
      if (!show) {
        emptyState.classList.remove('is-visible');
        emptyState.innerHTML = '';
        return;
      }

      emptyState.classList.add('is-visible');
      emptyState.innerHTML = '';

      var iconWrap = document.createElement('div');
      iconWrap.className = 'rbccm-filtered-content__empty-icon-wrapper';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.innerHTML = EMPTY_ICON_SVG;
      emptyState.appendChild(iconWrap);

      if (strings.emptyHeading) {
        var heading = document.createElement('h3');
        heading.className = 'rbccm-filtered-content__empty-heading';
        heading.textContent = strings.emptyHeading;
        emptyState.appendChild(heading);
      }
      if (strings.emptyMessage) {
        var msg1 = document.createElement('p');
        msg1.className = 'rbccm-filtered-content__empty-message';
        msg1.textContent = strings.emptyMessage;
        emptyState.appendChild(msg1);
      }
      if (strings.emptyMessageEmphasis) {
        var msg2 = document.createElement('p');
        msg2.className = 'rbccm-filtered-content__empty-message rbccm-filtered-content__empty-message--emphasis';
        msg2.textContent = strings.emptyMessageEmphasis;
        emptyState.appendChild(msg2);
      }
      if (strings.emptyClearLabel) {
        var clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'rbccm-filtered-content__empty-clear';
        clearBtn.textContent = strings.emptyClearLabel;
        clearBtn.addEventListener('click', resetFilters);
        emptyState.appendChild(clearBtn);
      }
    }

    /* ---------- Pagination controls ---------- */
    function renderPagination(totalPages) {
      if (pageSize <= 0) return;
      paginationHost.innerHTML = '';
      if (totalPages <= 1) return;

      var nav = document.createElement('nav');
      nav.className = 'rbccm-filtered-content__pagination';
      nav.setAttribute('aria-label', 'Pagination');

      nav.appendChild(buildArrowBtn('previous', currentPage === 0));
      var pages = computePageList(currentPage, totalPages);
      for (var i = 0; i < pages.length; i++) {
        if (pages[i] === '…') {
          var el = document.createElement('span');
          el.className = 'rbccm-filtered-content__page-ellipsis';
          el.setAttribute('aria-hidden', 'true');
          el.textContent = strings.ellipsis;
          nav.appendChild(el);
        } else {
          nav.appendChild(buildPageBtn(pages[i]));
        }
      }
      nav.appendChild(buildArrowBtn('next', currentPage >= totalPages - 1));
      paginationHost.appendChild(nav);
    }

    /* Responsive target circle count. Odd numbers keep the current-page
       chip visually centered when it's in the middle of the range:
         - Mobile   (<768px): 7 max, degrades to 5 when total ≤ 5
         - Tablet   (768-1023): 9 max
         - Desktop  (≥1024): 11 max
       Fall back to 7 when window is unavailable (SSR/pre-hydrate). */
    function getTargetPageCount() {
      if (typeof window === 'undefined' || !window.matchMedia) return 7;
      if (window.matchMedia('(min-width: 1024px)').matches) return 11;
      if (window.matchMedia('(min-width: 768px)').matches) return 9;
      return 7;
    }

    function computePageList(current, total) {
      var target = getTargetPageCount();

      /* Total fits in the window — show every page, no ellipsis. */
      if (total <= target) {
        var all = [];
        for (var i = 0; i < total; i++) all.push(i);
        return all;
      }

      /* Reserve 4 slots for first + last + two ellipses, then a
         centered window of the remaining N pages around current. */
      var windowSize = target - 4;
      var half = Math.floor(windowSize / 2);
      var out;

      /* Near start — no left ellipsis, extend right window. */
      if (current <= half + 1) {
        out = [];
        for (var i = 0; i < target - 2; i++) out.push(i);
        out.push('…');
        out.push(total - 1);
        return out;
      }

      /* Near end — no right ellipsis, extend left window. */
      if (current >= total - half - 2) {
        out = [0, '…'];
        for (var i = total - (target - 2); i < total; i++) out.push(i);
        return out;
      }

      /* Middle — both ellipses, current centered inside window. */
      out = [0, '…'];
      for (var i = current - half; i <= current + half; i++) out.push(i);
      out.push('…');
      out.push(total - 1);
      return out;
    }

    /* ---------- Scroll to first visible result after pagination ----------
       On page change (page number or prev/next arrow), smooth-scroll the
       viewport so the first visible item in the current page is at the
       top of the results area. Prevents users landing mid-page after
       clicking "Page 3" and having to hunt for where the new tiles start.

       Filter changes do NOT trigger this — user's eye is already at the
       filter when they interact, and the results updating in place is
       the expected micro-iteration flow.

       Respects prefers-reduced-motion: skips animation, jumps instantly.

       Offset for sticky headers is handled via CSS `scroll-margin-top`
       on the target element — set it in the consuming component's CSS
       if the page has a fixed top bar. */
    function scrollToFirstResult() {
      /* Default: scroll to the filter root itself. Puts the filter bar
         at the top of the viewport with the first result of the new
         page immediately below — user has both the controls they just
         used and the fresh content in a single glance.

         Override with [data-scroll-target="#some-id"] on the filter root
         if the page prefers landing somewhere else. */
      var targetSelector = filterRoot.getAttribute('data-scroll-target');
      var target = targetSelector ? document.querySelector(targetSelector) : filterRoot;
      if (!target) return;

      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    /* ---------- Focus retention after pagination clicks ----------
       paginate() rebuilds the entire nav on every click, so the button
       the user just activated is destroyed and replaced. Without help,
       focus drops to <body> — keyboard users get dumped mid-navigation.
       These helpers restore focus to the equivalent button after
       re-render, preserving the "focus stays on the thing I clicked"
       expectation that lets keyboard users rapid-fire pagination. */
    /* All focus() calls in these helpers pass { preventScroll: true } so
       the browser's default "scroll focused element into view" doesn't
       yank the viewport back down and undo scrollToFirstResult's
       scroll-to-top. Focus semantics preserved, scroll semantics owned
       entirely by scrollToFirstResult. */
    function focusRebuiltPageBtn(pageIndex) {
      var buttons = paginationHost.querySelectorAll('.rbccm-filtered-content__page-button:not(.rbccm-filtered-content__page-button--previous):not(.rbccm-filtered-content__page-button--next)');
      /* Match by the button label (page number, 1-indexed). */
      var target = String(pageIndex + 1);
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent === target) { buttons[i].focus({ preventScroll: true }); return; }
      }
    }

    function focusRebuiltArrowBtn(dir) {
      var arrow = paginationHost.querySelector('.rbccm-filtered-content__page-button--' + dir);
      /* If the arrow is now disabled (reached start/end of range), fall
         back to the newly-current page number so focus doesn't land on
         an unreachable control. */
      if (arrow && !arrow.hasAttribute('disabled')) { arrow.focus({ preventScroll: true }); return; }
      var active = paginationHost.querySelector('.rbccm-filtered-content__page-button--active');
      if (active) active.focus({ preventScroll: true });
    }

    function buildPageBtn(pageIndex) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rbccm-filtered-content__page-button';
      if (pageIndex === currentPage) {
        btn.className += ' rbccm-filtered-content__page-button--active';
        btn.setAttribute('aria-current', 'page');
      }
      btn.textContent = String(pageIndex + 1);
      btn.setAttribute('aria-label', fmt(strings.pageBtnLabel, { n: pageIndex + 1 }));
      btn.addEventListener('click', function () {
        if (pageIndex === currentPage) return;
        currentPage = pageIndex;
        var r = computeMatches();
        paginate(r.matched, r.unmatched, anyFilterActive(r.state));
        writeUrlState(true); // pushState — back button walks page steps
        scrollToFirstResult();
        focusRebuiltPageBtn(pageIndex);
      });
      return btn;
    }

    function buildArrowBtn(dir, disabled) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rbccm-filtered-content__page-button rbccm-filtered-content__page-button--' + dir;
      btn.setAttribute('aria-label', dir === 'previous' ? strings.prevPageLabel : strings.nextPageLabel);
      /* Chevron SVG — 14x24 viewBox from the RBC design spec. Base path
         is a right-facing chevron; prev mirrors it horizontally to point
         left. stroke="currentColor" so hover/focus/dark/disabled states
         adapt automatically. */
      var chevronPath = dir === 'previous'
        ? 'M13 1L2.111 11.889L13 22.778'
        : 'M1 1L11.889 11.889L1 22.778';
      btn.innerHTML =
        '<svg class="rbccm-filtered-content__page-button-icon" width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
          '<path d="' + chevronPath + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" />' +
        '</svg>';
      if (disabled) btn.setAttribute('disabled', 'disabled');
      btn.addEventListener('click', function () {
        if (dir === 'previous' && currentPage > 0) currentPage--;
        if (dir === 'next') currentPage++;
        var r = computeMatches();
        paginate(r.matched, r.unmatched, anyFilterActive(r.state));
        writeUrlState(true); // pushState — back button walks page steps
        scrollToFirstResult();
        focusRebuiltArrowBtn(dir);
      });
      return btn;
    }

    /* ---------- Event wiring ----------
       Dropdowns already call apply(true) from their option-click
       handler in buildCustomDropdown; no extra listener needed. */
    if (searchInput) {
      searchInput.addEventListener('input', function () { apply(true); });
      searchInput.addEventListener('search', function () { apply(true); });
    }
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    /* Re-render pagination when the viewport crosses a breakpoint so the
       circle count adapts (mobile 7 → tablet 9 → desktop 11). Debounced
       so drag-resizes don't rebuild the DOM on every frame; matchMedia
       fires the callback once per crossing, resize fires continuously so
       we throttle it. Skipped when pageSize <= 0 (no pagination in play). */
    var resizeRaf = 0;
    function onViewportChange() {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = 0;
        apply(false);
      });
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', onViewportChange);
    }

    /* Hydrate filter + page state from the URL BEFORE the first apply()
       so a deep link like ?year=2026&region=us&page=3 lands directly
       on that filtered page instead of flashing page 1 first. If the
       URL year isn't in the DOM yet, ensureUrlYearLoaded() fetches
       that archive first so the deep link actually matches items. */
    readUrlState();
    ensureUrlYearLoaded().then(function () { apply(false); });

    /* Signal to consumer CSS that the filter has initialized and tiles
       are in their correct visible/hidden state. Consumers can hide the
       tile grid (opacity 0) + show a skeleton state until this attribute
       lands, then cross-fade to the real tiles — kills the "everything
       flashes then re-renders" moment on page load. */
    container.setAttribute('data-filter-ready', 'true');
  }

  /* ---------- Re-bind hook ----------
     When an adapter (or any external script) populates items into a
     filter's target container AFTER our initial bind, unbind and re-bind
     the matching filter root(s) so the dropdowns pick up the fresh items.
     Safe no-op for filters bound to a container that isn't the event's
     target. Kept for backward compat + belt-and-suspenders — the
     coordinator below already calls bindFilter after each adapter run. */
  function rebindFilterForContainer(container) {
    if (!container) return;
    var roots = document.querySelectorAll('.rbccm-filtered-content__filter[data-container]');
    for (var i = 0; i < roots.length; i++) {
      var sel = roots[i].getAttribute('data-container');
      if (!sel) continue;
      var target = document.querySelector(sel);
      if (target !== container) continue;
      roots[i].removeAttribute('data-filter-bound');
      var panels = roots[i].querySelectorAll('.rbccm-filtered-content__select-panel');
      for (var p = 0; p < panels.length; p++) panels[p].parentNode.removeChild(panels[p]);
      bindFilter(roots[i]);
    }
  }
  document.addEventListener('rbccm:tiles-populated', function (e) {
    rebindFilterForContainer(e.target);
  });

  /* Expose bindFilter so the coordinator (separate IIFE below) can call it. */
  window.__rbccmFilteredContent = window.__rbccmFilteredContent || {};
  window.__rbccmFilteredContent.bindFilter = bindFilter;
})();


/* =========================================================================
   PART 2 — Preset adapters (feed fetch + parse + render)
   -------------------------------------------------------------------------
   One file, three presets. Each adapter defines:
     - fetchItems(root)     → Promise<Array<entry>>   (feed → common entry shape)
     - render(entry, i)     → HTMLElement (li)         (entry → DOM)

   Common entry fields (all optional except title/href):
     title, href, thumbnail, description, dateStr, year, month (01–12),
     dateTs (numeric for sort), searchText (lowercased haystack),
     + preset-specific fields.

   Preset selection: coordinator reads the root modifier class
   (`--conference-insights`, `--in-the-media-and-press-releases`,
   `--deals-and-transactions`). When no adapter matches, the coordinator
   just binds the filter engine over author-provided items — the "custom"
   preset case.
   ========================================================================= */

(function () {
  'use strict';

  var ENGINE = window.__rbccmFilteredContent || {};

  /* ---------- Shared helpers (fetch + XML parse + text normalization) ---------- */

  function fetchOptional(url) {
    return fetch(url).then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
  }
  function fetchJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('fetch failed: ' + url); return r.json(); });
  }
  function escapeStrayAmpersands(s) {
    if (!s) return s;
    var parts = s.split(/(<!\[CDATA\[[\s\S]*?\]\]>)/);
    for (var i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i].replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
    }
    return parts.join('');
  }
  function parseNewsNodes(xmlStr) {
    if (!xmlStr) return [];
    try {
      var doc = new DOMParser().parseFromString(escapeStrayAmpersands(xmlStr), 'application/xml');
      if (!doc || doc.getElementsByTagName('parsererror').length > 0) return [];
      return Array.prototype.slice.call(doc.getElementsByTagName('news'));
    } catch (e) { return []; }
  }
  function child(node, tag) {
    var el = node.getElementsByTagName(tag)[0];
    return el ? (el.textContent || '') : '';
  }
  function normalizeTitle(t) {
    if (!t) return '';
    return t.toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function parseYear(dateStr) {
    if (!dateStr) return '';
    var m = String(dateStr).match(/(\d{4})/);
    return m ? m[1] : '';
  }
  /* Month lookups accept both full names ("August") AND 3/4-letter abbrevs
     ("Aug", "Sept"). The deals feed emits pre-abbreviated dates like
     "Aug 2026"; the insights + ITM feeds emit ISO or full-month strings.
     One map handles both. */
  var MONTH_ABBR = {
    january:'Jan', february:'Feb', march:'Mar', april:'Apr', may:'May', june:'Jun',
    july:'Jul', august:'Aug', september:'Sep', october:'Oct', november:'Nov', december:'Dec',
    jan:'Jan', feb:'Feb', mar:'Mar', apr:'Apr', jun:'Jun', jul:'Jul',
    aug:'Aug', sep:'Sep', sept:'Sep', oct:'Oct', nov:'Nov', dec:'Dec'
  };
  var MONTH_NUM  = {
    january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
    july:'07', august:'08', september:'09', october:'10', november:'11', december:'12',
    jan:'01', feb:'02', mar:'03', apr:'04', jun:'06', jul:'07',
    aug:'08', sep:'09', sept:'09', oct:'10', nov:'11', dec:'12'
  };
  /* Deterministic "Month YYYY" -> unix ms. Falls back to Date.parse for
     ISO strings, then to 0 if nothing parses. Used to sort deals whose
     <date> is already pre-abbreviated ("Aug 2026") — Date.parse of that
     string returns NaN in some browsers, so we build it ourselves. */
  function parseMonthYearToTs(dateStr) {
    if (!dateStr) return 0;
    var s = String(dateStr).trim();
    var monthTok = (s.match(/^([A-Za-z]+)/) || [])[1];
    var yearTok  = (s.match(/(\d{4})/) || [])[1];
    if (monthTok && yearTok) {
      var monthNum = MONTH_NUM[monthTok.toLowerCase()];
      if (monthNum) return new Date(parseInt(yearTok, 10), parseInt(monthNum, 10) - 1, 1).getTime();
    }
    var iso = Date.parse(s);
    return isNaN(iso) ? 0 : iso;
  }
  /* Deals feed emits <thumbnail> as a CSS declaration:
       background-image: url('/assets/rbccm/images/deals/foo-th.webp');
     Peel the URL out so we can drop it into an <img src>. Also
     tolerates a plain URL value if the feed schema ever normalises. */
  function extractImageUrl(raw) {
    if (!raw) return '';
    var s = String(raw).trim();
    var m = s.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1].trim() : s;
  }
  function formatMonthYear(dateStr) {
    if (!dateStr) return '';
    var s = String(dateStr).trim();
    var year = (s.match(/(\d{4})/) || [])[1] || '';
    var month = (s.match(/^([A-Za-z]+)/) || [])[1];
    var abbr = month ? MONTH_ABBR[month.toLowerCase()] : '';
    return abbr && year ? abbr + ' ' + year : year;
  }
  function parseMonthNum(dateStr) {
    if (!dateStr) return '';
    var month = (String(dateStr).match(/^([A-Za-z]+)/) || [])[1];
    return month ? MONTH_NUM[month.toLowerCase()] || '' : '';
  }
  function truncateDescription(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    var cut = text.substring(0, maxChars);
    var lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > maxChars * 0.6) cut = cut.substring(0, lastSpace);
    cut = cut.replace(/[\s,.;:!?\-–—]+$/, '');
    return cut + '…';
  }
  function firstToken(str) {
    if (!str) return '';
    var t = String(str).trim().split(/\s+/)[0];
    return t || '';
  }
  function formatMeta(readtime, watchtime, type) {
    var t = (type || '').toLowerCase().trim();
    var wt = (watchtime || '').trim();
    var rt = (readtime || '').trim();
    if (t === 'audio' && wt) return wt + ' listen';
    if (t === 'video' && wt) return wt + ' watch';
    if (t === 'text'  && rt) return rt + ' read';
    if (rt) return rt + ' read';
    if (wt) return wt;
    return '';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  var TOPIC_LABELS = {
    'energy': 'Energy',
    'energy-transition': 'Energy Transition',
    'financial-institutions': 'Financial Institutions',
    'healthcare': 'Healthcare',
    'industrials': 'Industrials',
    'markets-economics': 'Markets & Economics',
    'mining-materials': 'Mining & Materials',
    'power-utilities-infrastructure': 'Power, Utilities & Infrastructure',
    'technology-innovation': 'Technology & Innovation'
  };
  function labelForTopic(slug) {
    if (!slug) return '';
    var s = slug.toLowerCase();
    if (TOPIC_LABELS[s]) return TOPIC_LABELS[s];
    return s.split(/[-_\s]+/).map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  var REGION_LABELS = { 'us':'US', 'ca':'Canada', 'global':'Global', 'eu':'Europe', 'apac':'APAC' };
  function labelForRegion(slug) {
    if (!slug) return '';
    var s = slug.toLowerCase();
    if (REGION_LABELS[s]) return REGION_LABELS[s];
    return s.length <= 3 ? s.toUpperCase() : (s.charAt(0).toUpperCase() + s.slice(1));
  }

  /* Transaction type normalization — ported from live filter-deals.js. */
  var TRANSACTION_TYPE_MAP = {
    'mergers and acquisitions': 'Mergers and Acquisitions',
    'equity capital markets':   'Equity Capital Markets',
    'debt capital markets':     'Debt Capital Markets',
    'gold stream':              'Gold Stream',
    'm&a':                      'Mergers and Acquisitions',
    'ma':                       'Mergers and Acquisitions',
    'ecm':                      'Equity Capital Markets',
    'dcm':                      'Debt Capital Markets',
    'equity':                   'Equity Capital Markets',
    'ipo':                      'Equity Capital Markets',
    'joint bookrunner':         'Equity Capital Markets',
    'debt':                     'Debt Capital Markets',
    'sustainable finance':      'Debt Capital Markets',
    'capital structuring':      'Debt Capital Markets',
    'take private':             'Mergers and Acquisitions',
    'spinout':                  'Mergers and Acquisitions'
  };
  var TRANSACTION_TYPE_ORDER = ['Mergers and Acquisitions','Equity Capital Markets','Debt Capital Markets','Gold Stream'];
  function normalizeTransactionType(raw) {
    if (!raw) return null;
    return TRANSACTION_TYPE_MAP[String(raw).trim().toLowerCase()] || null;
  }
  function slugifyTransactionType(name) {
    return String(name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ==========================================================================
     ADAPTER: conference-insights
     -------------------------------------------------------------------------
     Fetches per-year insights feeds + whitelist JSON, cross-references titles
     against the whitelist, renders featured (first) + regular tile cards.
     Override any URL via `window.RBCCM_FEED_CONFIG` before this script loads.
     ========================================================================== */

  var CI_CONFIG = {
    fetchItems: function (root) {
      var opts = window.RBCCM_FEED_CONFIG || {};
      var years = opts.years || [2024, 2025, 2026];
      var template = opts.feedUrlTemplate || '/en/insights/data/{year}-insights';
      var whitelistUrl = opts.whitelistUrl || '/assets/rbccm/js/components/data/conference-insights-whitelist.json';

      var yearFetches = years.map(function (y) { return fetchOptional(template.replace('{year}', String(y))); });

      return Promise.all([fetchJson(whitelistUrl)].concat(yearFetches)).then(function (results) {
        var whitelist = results[0];
        var xmlStrings = results.slice(1);
        var byKey = {};
        whitelist.articles.forEach(function (a) { byKey[a.match_key] = a; });

        var allNews = [];
        xmlStrings.forEach(function (xml) { allNews = allNews.concat(parseNewsNodes(xml)); });

        /* Seed dedup with any pre-authored tiles already in the list. */
        var seen = {};
        var container = root.querySelector('.rbccm-filtered-content__list');
        var preExisting = container ? container.querySelectorAll('.rbccm-filtered-content__item') : [];
        for (var p = 0; p < preExisting.length; p++) {
          var titleEl = preExisting[p].querySelector('.rbccm-filtered-content__card-title');
          if (titleEl) seen[normalizeTitle(titleEl.textContent || '')] = true;
        }

        var entries = [];
        allNews.forEach(function (n) {
          var titleRaw = child(n, 'title').trim();
          var key = normalizeTitle(titleRaw);
          var wl = byKey[key];
          if (!wl || seen[key]) return;
          seen[key] = true;
          entries.push(buildCIEntry(n, wl));
        });

        /* Second pass: whitelist entries with manual data (not yet in the feed). */
        whitelist.articles.forEach(function (wl) {
          if (!wl.manual || seen[wl.match_key]) return;
          seen[wl.match_key] = true;
          entries.push(buildCIManualEntry(wl));
        });

        entries.sort(function (a, b) { return (b.dateTs || 0) - (a.dateTs || 0); });
        return entries;
      });
    },
    render: function (entry, index) {
      var li = document.createElement('li');
      li.className = 'rbccm-filtered-content__item';
      if (entry.year)       li.setAttribute('data-year', entry.year);
      if (entry.dataRegion) li.setAttribute('data-region', entry.dataRegion);
      if (entry.dataTopic)  li.setAttribute('data-topic', entry.dataTopic);
      if (entry.searchText) li.setAttribute('data-search-text', entry.searchText);

      var isFeatured = index === 0;
      var featuredCls = isFeatured ? ' rbccm-filtered-content__card--featured' : '';
      var ariaLabel = (entry.eyebrow || 'Insights') + ': ' + (entry.title || '');
      if (entry.meta) ariaLabel += '. ' + entry.meta + '.';

      var taxonomyHtml = '';
      if (entry.topicLabel || entry.regionLabel || entry.dateLabel) {
        taxonomyHtml = '<div class="rbccm-filtered-content__card-taxonomy">';
        if (entry.topicLabel)  taxonomyHtml += '<span class="rbccm-filtered-content__card-topic">' + esc(entry.topicLabel) + '</span>';
        if (entry.regionLabel) taxonomyHtml += '<span class="rbccm-filtered-content__card-region">' + esc(entry.regionLabel) + (entry.dateLabel ? ' · ' : '') + '</span>';
        if (entry.dateLabel)   taxonomyHtml += '<span class="rbccm-filtered-content__card-date">' + esc(entry.dateLabel) + '</span>';
        taxonomyHtml += '</div>';
      }

      var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="rbccm-filtered-content__card-arrow" width="4" height="10" viewBox="0 0 4 10" fill="none" aria-hidden="true"><path d="M0.995898 9.03271L3.46359 5.25064C3.51814 5.16868 3.56143 5.07118 3.59098 4.96374C3.62053 4.85631 3.63574 4.74108 3.63574 4.6247C3.63574 4.50832 3.62053 4.39309 3.59098 4.28566C3.56143 4.17823 3.51814 4.08072 3.46359 3.99876L0.995898 0.260776C0.941794 0.178145 0.877424 0.112559 0.806501 0.067801C0.735579 0.0230433 0.659508 0 0.582677 0C0.505846 0 0.429775 0.0230433 0.358852 0.067801C0.28793 0.112559 0.22356 0.178145 0.169455 0.260776C0.0610566 0.425955 0.000213623 0.649398 0.000213623 0.882305C0.000213623 1.11521 0.0610566 1.33865 0.169455 1.50383L2.22974 4.6247L0.169455 7.74557C0.0619338 7.90978 0.0013175 8.13141 0.000674486 8.36269C0.000231743 8.47871 0.0149126 8.59373 0.0438757 8.70114C0.0728388 8.80855 0.115515 8.90625 0.169455 8.98863C0.221613 9.07421 0.284449 9.14328 0.354334 9.19187C0.424218 9.24045 0.499765 9.26757 0.57661 9.27167C0.653455 9.27577 0.730073 9.25676 0.80204 9.21574C0.874007 9.17473 0.939896 9.11252 0.995898 9.03271Z" fill="currentColor"/></svg>';
      var metaHtml = '<p class="rbccm-filtered-content__card-metadata"><span>' + esc(entry.meta || '') + '</span>' + arrowSvg + '</p>';
      var bottomHtml = taxonomyHtml
        ? '<div class="rbccm-filtered-content__card-bottom">' + metaHtml + taxonomyHtml + '</div>'
        : metaHtml;

      li.innerHTML =
        '<a class="rbccm-filtered-content__card' + featuredCls + '" href="' + esc(entry.href || '#') + '" aria-label="' + esc(ariaLabel) + '">' +
          '<div class="rbccm-filtered-content__card-media"><img loading="lazy" alt="" src="' + esc(entry.thumbnail || '') + '"></div>' +
          '<div class="rbccm-filtered-content__card-body">' +
            '<div class="rbccm-filtered-content__card-label">' + esc(entry.eyebrow || 'Insights') + '</div>' +
            '<div class="rbccm-filtered-content__card-divider" aria-hidden="true"></div>' +
            '<h2 class="rbccm-filtered-content__card-title">' + esc(entry.title || '') + '</h2>' +
            '<p class="rbccm-filtered-content__card-description">' + esc(entry.description || '') + '</p>' +
            bottomHtml +
          '</div>' +
        '</a>';
      return li;
    }
  };

  function buildCIEntry(newsNode, wl) {
    var title = child(newsNode, 'title').trim();
    var description = child(newsNode, 'description').trim();
    var dateStr = child(newsNode, 'date').trim();
    var year = wl.year || parseYear(dateStr);
    var link = child(newsNode, 'link').trim();
    var thumb = child(newsNode, 'thumbnail').trim();
    var category = wl.category || child(newsNode, 'category').trim() || 'Insights';
    var readtime = child(newsNode, 'readtime').trim();
    var watchtime = child(newsNode, 'watchtime').trim();
    var type = child(newsNode, 'type').trim();
    var feedRegion = child(newsNode, 'region').trim();

    var regionTokens = [];
    if (wl.region_origination) regionTokens.push(wl.region_origination);
    if (wl.region_relevancy && wl.region_relevancy !== wl.region_origination) regionTokens.push(wl.region_relevancy);
    if (!regionTokens.length && feedRegion) {
      regionTokens = feedRegion.split(/[\s,]+/).filter(function (t) { return t.length > 0; });
    }
    var topicTokens = (wl.topics && wl.topics.length) ? wl.topics.slice() : [];

    var dateTs = dateStr ? Date.parse(dateStr) : 0;
    if (isNaN(dateTs)) dateTs = 0;

    return {
      title: title,
      description: truncateDescription(description, 150),
      href: link,
      thumbnail: thumb,
      eyebrow: category,
      year: year,
      dateLabel: formatMonthYear(dateStr),
      dateTs: dateTs,
      topicLabel: labelForTopic(firstToken(topicTokens.join(' '))),
      regionLabel: labelForRegion(firstToken(regionTokens.join(' '))),
      meta: formatMeta(readtime, watchtime, type),
      dataRegion: regionTokens.join(' '),
      dataTopic: topicTokens.join(' '),
      searchText: (title + ' ' + description).toLowerCase()
    };
  }
  function buildCIManualEntry(wl) {
    var m = wl.manual || {};
    var title = wl.title || '';
    var description = m.description || '';
    var dateStr = m.date || '';
    var year = wl.year || parseYear(dateStr);
    var regionTokens = [];
    if (wl.region_origination) regionTokens.push(wl.region_origination);
    if (wl.region_relevancy && wl.region_relevancy !== wl.region_origination) regionTokens.push(wl.region_relevancy);
    var topicTokens = (wl.topics && wl.topics.length) ? wl.topics.slice() : [];
    var dateTs = dateStr ? Date.parse(dateStr) : 0;
    if (isNaN(dateTs)) dateTs = 0;

    return {
      title: title,
      description: truncateDescription(description, 150),
      href: m.link || '',
      thumbnail: m.thumbnail || '',
      eyebrow: m.category || 'Insights',
      year: year,
      dateLabel: formatMonthYear(dateStr),
      dateTs: dateTs,
      topicLabel: labelForTopic(firstToken(topicTokens.join(' '))),
      regionLabel: labelForRegion(firstToken(regionTokens.join(' '))),
      meta: formatMeta(m.readtime || '', m.watchtime || '', m.type || 'text'),
      dataRegion: regionTokens.join(' '),
      dataTopic: topicTokens.join(' '),
      searchText: (title + ' ' + description).toLowerCase()
    };
  }

  /* ==========================================================================
     ADAPTER: in-the-media-and-press-releases
     -------------------------------------------------------------------------
     Fetches the /press_release DCR feed and renders each item as a bare
     row stub — real markup drops in when the authored ITM item CSS spec
     is locked. Data attrs already wired so the filter engine's Type /
     Year / Month / Region dropdowns auto-populate.
     ========================================================================== */

  var ITM_CONFIG = {
    fetchItems: function (root) {
      var opts = window.RBCCM_FEED_CONFIG || {};
      var url = opts.pressReleaseUrl || '/en/press-releases/data/press-releases.page';
      return fetchOptional(url).then(function (xml) {
        var news = parseNewsNodes(xml);
        var entries = news.map(buildITMEntry).filter(Boolean);
        entries.sort(function (a, b) { return (b.dateTs || 0) - (a.dateTs || 0); });
        return entries;
      });
    },
    render: function (entry) {
      var li = document.createElement('li');
      li.className = 'rbccm-filtered-content__item';
      if (entry.type)       li.setAttribute('data-type', entry.type);
      if (entry.year)       li.setAttribute('data-year', entry.year);
      if (entry.month)      li.setAttribute('data-month', entry.month);
      if (entry.dataRegion) li.setAttribute('data-region', entry.dataRegion);
      if (entry.searchText) li.setAttribute('data-search-text', entry.searchText);

      /* Row markup per authored Figma spec:
           [outlet ......... date]                                  (topbar)
           [title]                                                  (only link)
           [Featured: person ....................  region · eyebrow] (footer)
         Wrapper is a <div> — only the title text is a link, which lets
         the CSS :has(.__card-title a:hover) selector propagate hover
         state to the wrapper for the row-level bg tint.
         Footer has two clusters: Featured on the left, meta (region
         pill + type eyebrow) pinned right via margin-left: auto so
         meta always sits right even when Featured is empty. */

      var featuredInner = '';
      if (entry.featured) {
        featuredInner =
          '<div class="rbccm-filtered-content__card-featured">' +
            '<span class="rbccm-filtered-content__card-featured-label">Featured:</span>' +
            '<span class="rbccm-filtered-content__card-featured-name">' + esc(entry.featured) + '</span>' +
          '</div>';
      }

      var regionHtml = entry.regionLabel
        ? '<span class="rbccm-filtered-content__card-region">' + esc(entry.regionLabel) + '</span>'
        : '';

      var eyebrowHtml = '';
      if (entry.type === 'press' || entry.type === 'media') {
        var eyebrowLabel = entry.type === 'press' ? 'Press release' : 'Media coverage';
        var eyebrowMod   = entry.type === 'press'
          ? 'rbccm-filtered-content__card-eyebrow--press'
          : 'rbccm-filtered-content__card-eyebrow--media';
        eyebrowHtml =
          '<span class="rbccm-filtered-content__card-eyebrow ' + eyebrowMod + '">' +
            esc(eyebrowLabel) +
          '</span>';
      }

      var metaInner = '';
      if (regionHtml || eyebrowHtml) {
        metaInner =
          '<div class="rbccm-filtered-content__card-footer-metadata">' +
            regionHtml + eyebrowHtml +
          '</div>';
      }

      var footerHtml = '';
      if (featuredInner || metaInner) {
        footerHtml =
          '<div class="rbccm-filtered-content__card-footer">' +
            featuredInner + metaInner +
          '</div>';
      }

      li.innerHTML =
        '<div class="rbccm-filtered-content__card rbccm-filtered-content__card--article">' +
          '<div class="rbccm-filtered-content__card-topbar">' +
            '<div class="rbccm-filtered-content__card-source">' + esc(entry.outlet || '') + '</div>' +
            '<div class="rbccm-filtered-content__card-date">' + esc(entry.dateLongLabel || entry.dateLabel || '') + '</div>' +
          '</div>' +
          '<h3 class="rbccm-filtered-content__card-title"><a href="' + esc(entry.href || '#') + '">' + esc(entry.title || '') + '</a></h3>' +
          footerHtml +
        '</div>';
      return li;
    }
  };

  /* Long-format date for ITM topbar ("June 28, 2025"). Prefers the raw
     Date parser output; falls back to the raw string if parsing fails so
     we always display something. */
  var MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function formatLongDate(dateStr) {
    if (!dateStr) return '';
    var ts = Date.parse(dateStr);
    if (isNaN(ts)) return String(dateStr);
    var d = new Date(ts);
    return MONTH_FULL[d.getUTCMonth()] + ' ' + String(d.getUTCDate()).padStart(2, '0') + ', ' + d.getUTCFullYear();
  }

  function buildITMEntry(node) {
    var title = child(node, 'title').trim();
    if (!title) return null;
    var link = child(node, 'link').trim();
    var dateStr = child(node, 'date').trim() || child(node, 'publish_date').trim();
    var outlet = child(node, 'outlet').trim() || child(node, 'publication').trim() || child(node, 'source').trim();
    /* Description / summary for the row body — try common tag names. */
    var description = child(node, 'description').trim() || child(node, 'summary').trim() || child(node, 'abstract').trim();
    /* "Featured" person from the feed (kept in searchText for filtering). */
    var featured = child(node, 'featured').trim() || child(node, 'person').trim() || child(node, 'spokesperson').trim();
    /* Feed may expose either a "topic" (media / press) or a "type" field. */
    var rawType = (child(node, 'topic') || child(node, 'type') || '').trim().toLowerCase();
    var type = rawType.indexOf('press') !== -1 ? 'press' : (rawType.indexOf('media') !== -1 ? 'media' : '');
    var region = child(node, 'region').trim();
    var dateTs = dateStr ? Date.parse(dateStr) : 0;
    if (isNaN(dateTs)) dateTs = 0;

    /* External flag — media coverage links leave the RBC domain; press
       releases stay on-site. Also flag any explicit protocol-based URL. */
    var isExternal = (type === 'media') || /^https?:\/\//i.test(link);

    return {
      title: title,
      href: link,
      external: isExternal,
      outlet: outlet,
      featured: featured,
      description: description,
      type: type,
      year: parseYear(dateStr),
      month: parseMonthNum(dateStr),
      dateLabel: formatMonthYear(dateStr),       /* "Jun 2025" — used for filter dropdown option display */
      dateLongLabel: formatLongDate(dateStr),    /* "June 28, 2025" — used for the row date line */
      dateTs: dateTs,
      dataRegion: region ? region.toLowerCase() : '',
      regionLabel: labelForRegion(region),       /* "Global" / "US" / etc — displayed as inline pill */
      searchText: (title + ' ' + outlet + ' ' + featured + ' ' + description).toLowerCase()
    };
  }

  /* ==========================================================================
     ADAPTER: deals-and-transactions
     -------------------------------------------------------------------------
     Fetches the deals XML feed, filters to closed deals, normalizes each
     item's transaction type via the canonical map, renders tombstone-style
     cards. Item CSS is placeholder pending final spec — data attrs wired.
     ========================================================================== */

  var DEALS_CONFIG = {
    fetchItems: function (root) {
      var opts = window.RBCCM_FEED_CONFIG || {};
      var url = opts.dealsUrl || '/en/expertise/transactions/data/deals.page';
      return fetchOptional(url).then(function (xml) {
        var news = parseNewsNodes(xml);
        var entries = news.map(buildDealsEntry).filter(function (e) {
          /* Only closed deals show in the listing (matches live filter-deals.js). */
          return e && e.status === 'closed';
        });
        entries.sort(function (a, b) { return (b.dateTs || 0) - (a.dateTs || 0); });
        return entries;
      });
    },
    render: function (entry) {
      var li = document.createElement('li');
      li.className = 'rbccm-filtered-content__item';
      if (entry.year)                li.setAttribute('data-year', entry.year);
      if (entry.transactionTypeSlug) li.setAttribute('data-transaction-type', entry.transactionTypeSlug);
      if (entry.searchText)          li.setAttribute('data-search-text', entry.searchText);

      /* Card structure (BEM subclasses; visual spec ported from the
         live .tombstone via the deals preset CSS scope):
           __card-header  → date row (top)
           __card-media   → logo container (background-image contain-fit)
           __card-info    → amount (deal value) + deal title + role (desc)
           __card-bottom  → status line (specialty|type / status) + Read more
         Subclasses __card-value / __card-status / __card-link are new;
         __card-title / __card-description collide with CI tile classes and get
         re-styled under the .rbccm-filtered-content--deals-and-transactions
         scope. */
      var logoHtml = entry.thumbnail
        ? '<div class="rbccm-filtered-content__card-media"><div class="rbccm-filtered-content__card-logo" style="background-image:url(\'' + esc(entry.thumbnail) + '\')"></div></div>'
        : '';

      var typeLabel = entry.specialty || entry.transactionType || '';
      var statusLineText = '';
      if (typeLabel && entry.statusLabel)  statusLineText = typeLabel + ' / ' + entry.statusLabel;
      else if (typeLabel)                  statusLineText = typeLabel;
      else if (entry.statusLabel)          statusLineText = entry.statusLabel;

      var linkAriaLabel = entry.role
        ? 'Link to ' + entry.role
        : 'Deal: ' + (entry.title || '');

      li.innerHTML =
        '<a class="rbccm-filtered-content__card rbccm-filtered-content__card--deal" href="' + esc(entry.href || '#') + '" title="' + esc(linkAriaLabel) + '" aria-label="' + esc(linkAriaLabel) + '">' +
          '<div class="rbccm-filtered-content__card-header">' +
            '<p class="rbccm-filtered-content__card-date">' + esc(entry.dateLabel || '') + '</p>' +
          '</div>' +
          logoHtml +
          '<div class="rbccm-filtered-content__card-info">' +
            '<p class="rbccm-filtered-content__card-value">' + esc(entry.amount || '') + '</p>' +
            (entry.title ? '<p class="rbccm-filtered-content__card-title">' + esc(entry.title) + '</p>' : '') +
            (entry.role  ? '<p class="rbccm-filtered-content__card-description">' + esc(entry.role) + '</p>' : '') +
          '</div>' +
          '<div class="rbccm-filtered-content__card-bottom">' +
            (statusLineText ? '<p class="rbccm-filtered-content__card-status">' + esc(statusLineText) + '</p>' : '') +
            '<p class="rbccm-filtered-content__card-link">Read more</p>' +
          '</div>' +
        '</a>';
      return li;
    }
  };

  function buildDealsEntry(node) {
    var title = child(node, 'title').trim();
    if (!title) return null;
    var link = child(node, 'link').trim();
    var thumb = extractImageUrl(child(node, 'thumbnail').trim());  /* CSS bg-image -> plain URL */
    var dateStr = child(node, 'date').trim();
    var role = child(node, 'role').trim();
    var status = child(node, 'status').trim().toLowerCase();
    var amount = child(node, 'amount').trim();
    var specialty = child(node, 'specialty').trim();               /* "Senior Unsecured Notes" etc — populated on debt deals, empty on M&A */
    var rawType = child(node, 'type').trim();
    var canonicalType = normalizeTransactionType(rawType);

    /* Human-facing status ("Closed" / "Pending") for the status line. */
    var statusNorm = status || 'closed';
    var statusLabel = statusNorm.charAt(0).toUpperCase() + statusNorm.slice(1);

    return {
      title: title,                                     /* deal name — used for aria-label + card fallback */
      href: link,
      thumbnail: thumb,
      dateLabel: formatMonthYear(dateStr),              /* "Aug 2026" — displayed at top of card */
      dateTs: parseMonthYearToTs(dateStr),              /* deterministic sort key (Date.parse of "Aug 2026" is browser-inconsistent) */
      role: role,                                       /* "Sole Financial Adviser", "Active Bookrunner" — shown as desc */
      status: statusNorm,
      statusLabel: statusLabel,
      amount: amount || 'Undisclosed',                  /* ensure something renders in the amount slot */
      specialty: specialty,                             /* takes precedence over canonicalType in the status line */
      transactionType: canonicalType,                   /* "Mergers and Acquisitions" — filter dropdown value */
      transactionTypeSlug: canonicalType ? slugifyTransactionType(canonicalType) : '',
      year: parseYear(dateStr),
      searchText: (title + ' ' + role + ' ' + amount + ' ' + specialty + ' ' + (canonicalType || '')).toLowerCase()
    };
  }

  /* ---------- Adapter registry (preset -> config) ---------- */
  var PRESET_ADAPTERS = {
    'conference-insights':             CI_CONFIG,
    'in-the-media-and-press-releases': ITM_CONFIG,
    'deals-and-transactions':          DEALS_CONFIG
  };

  ENGINE.PRESET_ADAPTERS = PRESET_ADAPTERS;
  ENGINE.TRANSACTION_TYPE_MAP = TRANSACTION_TYPE_MAP;
  ENGINE.TRANSACTION_TYPE_ORDER = TRANSACTION_TYPE_ORDER;
  window.__rbccmFilteredContent = ENGINE;
})();


/* =========================================================================
   PART 3 — Coordinator
   -------------------------------------------------------------------------
   For each `.rbccm-filtered-content` root on the page:
     1. Detect preset from the root modifier class (`--conference-insights`,
        `--in-the-media-and-press-releases`, `--deals-and-transactions`).
     2. Locate the inner filter section + list container.
     3. Copy any `data-container` / `data-page-size` / `data-empty-*`
        attributes authored on the root onto the filter section. If
        `data-container` isn't provided anywhere, auto-generate it pointing
        to the inner list.
     4. Run the matching preset adapter (if any) to populate the list from
        its feed. If no adapter matches (e.g., custom preset), skip straight
        to the filter bind.
     5. Bind the filter engine to the filter section.
   ========================================================================= */

(function () {
  'use strict';

  var ENGINE = window.__rbccmFilteredContent || {};
  if (!ENGINE.bindFilter) {
    console.warn('[rbccm-filtered-content] filter engine not loaded — bindFilter missing');
    return;
  }
  var PRESET_ADAPTERS = ENGINE.PRESET_ADAPTERS || {};

  /* Data attrs authored on the root that we forward to the inner filter
     section, since the filter engine reads them from its own root. */
  var FORWARDED_ATTRS = [
    'data-container',
    'data-item-selector',
    'data-page-size',
    'data-page-size-filtered',
    'data-empty-heading',
    'data-empty-message',
    'data-empty-message-emphasis',
    'data-empty-clear-label',
    'data-scroll-target',
    'data-available-years',
    'data-year-feed-template'
  ];

  function detectPreset(root) {
    for (var preset in PRESET_ADAPTERS) {
      if (!PRESET_ADAPTERS.hasOwnProperty(preset)) continue;
      if (root.classList.contains('rbccm-filtered-content--' + preset)) return preset;
    }
    return null;
  }

  function coordinate() {
    var roots = document.querySelectorAll('.rbccm-filtered-content');
    for (var i = 0; i < roots.length; i++) initInstance(roots[i], i);
  }

  function initInstance(root, index) {
    var filterSection = root.querySelector('.rbccm-filtered-content__filter');
    var listContainer = root.querySelector('.rbccm-filtered-content__list');
    if (!filterSection || !listContainer) return;

    /* Ensure the list has an ID so data-container can point at it. */
    if (!listContainer.id) listContainer.id = 'rbccm-filtered-content-list-' + index;

    /* Forward data-* config from root -> filter section (unless already set). */
    for (var a = 0; a < FORWARDED_ATTRS.length; a++) {
      var name = FORWARDED_ATTRS[a];
      if (root.hasAttribute(name) && !filterSection.hasAttribute(name)) {
        filterSection.setAttribute(name, root.getAttribute(name));
      }
    }
    /* Auto-generate data-container if not authored anywhere. */
    if (!filterSection.hasAttribute('data-container')) {
      filterSection.setAttribute('data-container', '#' + listContainer.id);
    }

    var preset = detectPreset(root);
    var adapter = preset && PRESET_ADAPTERS[preset];

    /* Server-rendered items already in the DOM (e.g. TeamSite XSL emits
       the ITM list inline from a MetaQueryExternal result) -> skip the
       async fetch entirely and let the filter engine bind against those
       pre-existing items. This is the primary path for ITM in production;
       CI and Deals typically arrive via JS fetch adapters. */
    var preExistingItems = listContainer.querySelectorAll('[data-search-text]');
    if (preExistingItems.length > 0) {
      finalize(filterSection, listContainer);
      return;
    }

    if (adapter && typeof adapter.fetchItems === 'function') {
      adapter.fetchItems(root).then(function (entries) {
        if (entries && entries.length) {
          var frag = document.createDocumentFragment();
          entries.forEach(function (entry, i) {
            var el = adapter.render(entry, i);
            if (el) frag.appendChild(el);
          });
          listContainer.appendChild(frag);
        }
        finalize(filterSection, listContainer);
      }).catch(function (err) {
        console.warn('[rbccm-filtered-content] adapter failed for preset "' + preset + '":', err);
        finalize(filterSection, listContainer);
      });
    } else {
      /* No adapter or unknown preset -> bind against author-provided items only. */
      finalize(filterSection, listContainer);
    }
  }

  function finalize(filterSection, listContainer) {
    listContainer.setAttribute('data-filter-ready', 'true');
    try {
      listContainer.dispatchEvent(new CustomEvent('rbccm:tiles-populated', { bubbles: true }));
    } catch (e) { /* older browsers */ }
    ENGINE.bindFilter(filterSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', coordinate);
  } else {
    coordinate();
  }
})();
