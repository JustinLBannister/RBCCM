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

  var EMPTY_ICON_SVG = '<svg class="rbccm-filter__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 43" fill="none" aria-hidden="true">'
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
    var existing = container.querySelector('.rbccm-filter__empty');
    if (existing) {
      if (isDark) existing.classList.add('rbccm-filter__empty--dark');
      return existing;
    }
    var el = document.createElement('div');
    el.className = 'rbccm-filter__empty' + (isDark ? ' rbccm-filter__empty--dark' : '');
    container.appendChild(el);
    return el;
  }

  function ensurePaginationHost(container) {
    var existing = container.querySelector('.rbccm-filter__pagination-host');
    if (existing) return existing;
    var el = document.createElement('div');
    el.className = 'rbccm-filter__pagination-host';
    container.appendChild(el);
    return el;
  }

  function bindFilter(filterRoot) {
    if (filterRoot.getAttribute('data-filter-bound') === 'true') return;
    filterRoot.setAttribute('data-filter-bound', 'true');

    var strings        = readStrings(filterRoot);
    var isDark         = filterRoot.classList.contains('rbccm-filter--dark');
    var containerSel   = filterRoot.getAttribute('data-container');
    var container      = containerSel ? document.querySelector(containerSel) : null;

    if (!container) {
      console.warn('[rbccm-filter] No container found for selector:', containerSel);
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

    /* -------- Register every dropdown in the filter markup --------
       Each `.rbccm-filter__select-wrap[data-filter="<dim>"]` gets a
       custom-styled popup listbox built from item data-<dim> values.
       Wrap is hidden if no items carry that attribute. */
    var dropdowns = [];      /* [{ dim, wrap, button, panel, getValue, setValue, close }] */
    var dropdownWraps = filterRoot.querySelectorAll('.rbccm-filter__select-wrap[data-filter]');
    for (var d = 0; d < dropdownWraps.length; d++) {
      var w = dropdownWraps[d];
      var dm = w.getAttribute('data-filter');
      if (!dm || dm === 'search') continue;
      var built = buildCustomDropdown(w, dm);
      if (built) dropdowns.push(built);
    }

    function buildCustomDropdown(wrap, dim) {
      var attrName = 'data-' + dim;
      var button = wrap.querySelector('.rbccm-filter__select');
      if (!button) return null;

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

      /* Read the default label from the button's initial text (e.g. "Month"). */
      var labelEl = button.querySelector('.rbccm-filter__select-label');
      var defaultLabel;
      if (labelEl) {
        defaultLabel = labelEl.textContent.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
      } else {
        defaultLabel = button.textContent.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        button.textContent = '';
        labelEl = document.createElement('span');
        labelEl.className = 'rbccm-filter__select-label';
        labelEl.textContent = defaultLabel;
        button.appendChild(labelEl);
      }

      /* Build popup panel. */
      var panel = document.createElement('ul');
      panel.className = 'rbccm-filter__select-panel';
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-label', defaultLabel);
      panel.setAttribute('hidden', 'hidden');

      /* First option clears the filter. */
      panel.appendChild(makeOption('', defaultLabel));
      for (var v = 0; v < values.length; v++) {
        panel.appendChild(makeOption(values[v], formatValue(values[v], dim)));
      }
      wrap.appendChild(panel);

      var options = panel.querySelectorAll('.rbccm-filter__select-option');
      var currentValue = '';
      options[0].setAttribute('aria-selected', 'true');

      function makeOption(value, text) {
        var li = document.createElement('li');
        li.className = 'rbccm-filter__select-option';
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
        var focused = panel.querySelector('.rbccm-filter__select-option[aria-selected="true"]') || options[0];
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
            setValue(opt.getAttribute('data-value'));
            close();
            button.focus();
            apply(true);
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
    var resetBtn    = filterRoot.querySelector('.rbccm-filter__reset');
    var currentPage = 0;

    function resetFilters() {
      for (var i = 0; i < dropdowns.length; i++) dropdowns[i].setValue('');
      if (searchInput) searchInput.value = '';
      apply(true);
    }

    function getState() {
      var state = { search: searchInput ? searchInput.value.trim().toLowerCase() : '' };
      for (var i = 0; i < dropdowns.length; i++) {
        state[dropdowns[i].dim] = dropdowns[i].getValue().trim();
      }
      return state;
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
          var haystack = ((item.getAttribute('data-search-text') || item.getAttribute('data-title') || '')).toLowerCase();
          if (haystack.indexOf(state.search) === -1) pass = false;
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
    }

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
      iconWrap.className = 'rbccm-filter__empty-icon-wrap';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.innerHTML = EMPTY_ICON_SVG;
      emptyState.appendChild(iconWrap);

      if (strings.emptyHeading) {
        var heading = document.createElement('h3');
        heading.className = 'rbccm-filter__empty-heading';
        heading.textContent = strings.emptyHeading;
        emptyState.appendChild(heading);
      }
      if (strings.emptyMessage) {
        var msg1 = document.createElement('p');
        msg1.className = 'rbccm-filter__empty-message';
        msg1.textContent = strings.emptyMessage;
        emptyState.appendChild(msg1);
      }
      if (strings.emptyMessageEmphasis) {
        var msg2 = document.createElement('p');
        msg2.className = 'rbccm-filter__empty-message rbccm-filter__empty-message--emphasis';
        msg2.textContent = strings.emptyMessageEmphasis;
        emptyState.appendChild(msg2);
      }
      if (strings.emptyClearLabel) {
        var clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'rbccm-filter__empty-clear';
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
      nav.className = 'rbccm-filter__pagination';
      nav.setAttribute('aria-label', 'Pagination');

      nav.appendChild(buildArrowBtn('prev', currentPage === 0));
      var pages = computePageList(currentPage, totalPages);
      for (var i = 0; i < pages.length; i++) {
        if (pages[i] === '…') {
          var el = document.createElement('span');
          el.className = 'rbccm-filter__page-ellipsis';
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

    function computePageList(current, total) {
      var set = {};
      set[0] = true;
      set[total - 1] = true;
      set[current] = true;
      if (current - 1 >= 0) set[current - 1] = true;
      if (current + 1 < total) set[current + 1] = true;

      var indices = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
      var out = [];
      for (var i = 0; i < indices.length; i++) {
        if (i > 0 && indices[i] - indices[i - 1] > 1) out.push('…');
        out.push(indices[i]);
      }
      return out;
    }

    /* ---------- Focus retention after pagination clicks ----------
       paginate() rebuilds the entire nav on every click, so the button
       the user just activated is destroyed and replaced. Without help,
       focus drops to <body> — keyboard users get dumped mid-navigation.
       These helpers restore focus to the equivalent button after
       re-render, preserving the "focus stays on the thing I clicked"
       expectation that lets keyboard users rapid-fire pagination. */
    function focusRebuiltPageBtn(pageIndex) {
      var buttons = paginationHost.querySelectorAll('.rbccm-filter__page-btn:not(.rbccm-filter__page-btn--prev):not(.rbccm-filter__page-btn--next)');
      /* Match by the button label (page number, 1-indexed). */
      var target = String(pageIndex + 1);
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent === target) { buttons[i].focus(); return; }
      }
    }

    function focusRebuiltArrowBtn(dir) {
      var arrow = paginationHost.querySelector('.rbccm-filter__page-btn--' + dir);
      /* If the arrow is now disabled (reached start/end of range), fall
         back to the newly-current page number so focus doesn't land on
         an unreachable control. */
      if (arrow && !arrow.hasAttribute('disabled')) { arrow.focus(); return; }
      var active = paginationHost.querySelector('.rbccm-filter__page-btn--active');
      if (active) active.focus();
    }

    function buildPageBtn(pageIndex) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rbccm-filter__page-btn';
      if (pageIndex === currentPage) {
        btn.className += ' rbccm-filter__page-btn--active';
        btn.setAttribute('aria-current', 'page');
      }
      btn.textContent = String(pageIndex + 1);
      btn.setAttribute('aria-label', fmt(strings.pageBtnLabel, { n: pageIndex + 1 }));
      btn.addEventListener('click', function () {
        if (pageIndex === currentPage) return;
        currentPage = pageIndex;
        var r = computeMatches();
        paginate(r.matched, r.unmatched, anyFilterActive(r.state));
        focusRebuiltPageBtn(pageIndex);
      });
      return btn;
    }

    function buildArrowBtn(dir, disabled) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rbccm-filter__page-btn rbccm-filter__page-btn--' + dir;
      btn.setAttribute('aria-label', dir === 'prev' ? strings.prevPageLabel : strings.nextPageLabel);
      /* Chevron SVG — 14x24 viewBox from the RBC design spec. Base path
         is a right-facing chevron; prev mirrors it horizontally to point
         left. stroke="currentColor" so hover/focus/dark/disabled states
         adapt automatically. */
      var chevronPath = dir === 'prev'
        ? 'M13 1L2.111 11.889L13 22.778'
        : 'M1 1L11.889 11.889L1 22.778';
      btn.innerHTML =
        '<svg class="rbccm-filter__page-btn-icon" width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
          '<path d="' + chevronPath + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" />' +
        '</svg>';
      if (disabled) btn.setAttribute('disabled', 'disabled');
      btn.addEventListener('click', function () {
        if (dir === 'prev' && currentPage > 0) currentPage--;
        if (dir === 'next') currentPage++;
        var r = computeMatches();
        paginate(r.matched, r.unmatched, anyFilterActive(r.state));
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

    apply(false);

    /* Signal to consumer CSS that the filter has initialized and tiles
       are in their correct visible/hidden state. Consumers can hide the
       tile grid (opacity 0) + show a skeleton state until this attribute
       lands, then cross-fade to the real tiles — kills the "everything
       flashes then re-renders" moment on page load. */
    container.setAttribute('data-filter-ready', 'true');
  }

  function init() {
    var roots = document.querySelectorAll('.rbccm-filter');
    for (var i = 0; i < roots.length; i++) bindFilter(roots[i]);
  }

  /* When another script (e.g. conference-insights-tiles-feed.js) populates
     tiles into a filter's target container AFTER our initial bind,
     unbind and re-bind the matching filter root(s) so the dropdowns pick
     up the fresh items. Safe no-op for filters bound to a container
     that isn't the event's target. */
  function rebindFilterForContainer(container) {
    if (!container) return;
    var roots = document.querySelectorAll('.rbccm-filter[data-container]');
    for (var i = 0; i < roots.length; i++) {
      var sel = roots[i].getAttribute('data-container');
      if (!sel) continue;
      var target = document.querySelector(sel);
      if (target !== container) continue;
      /* Reset bound flag and clear any listbox/popup panels the previous
         bind attached so bindFilter can build fresh dropdowns from the
         new item set. */
      roots[i].removeAttribute('data-filter-bound');
      var panels = roots[i].querySelectorAll('.rbccm-filter__select-panel');
      for (var p = 0; p < panels.length; p++) panels[p].parentNode.removeChild(panels[p]);
      bindFilter(roots[i]);
    }
  }

  /* Listen for the tiles-populated signal. Bubbles up from the tiles
     container, so we listen at the document level. */
  document.addEventListener('rbccm:tiles-populated', function (e) {
    var target = e.target;
    rebindFilterForContainer(target);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
