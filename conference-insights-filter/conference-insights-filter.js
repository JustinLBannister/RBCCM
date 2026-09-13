/* =========================================================================
   Conference Insights Filter
   -------------------------------------------------------------------------
   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent.

   Behaviour:
   - On load, find every .rbccm-conference-insights-filter root
   - Read its data-target selector (defaults to
     .rbccm-conference-insights-tiles__item)
   - Wire month + region + search controls to run a filter pass against
     the target elements' data-month / data-region / data-search-text
     attributes
   - Toggle `hidden` on each target to show/hide
   - Render active-filter chips + empty-state message

   Multiple filter instances on the same page are supported: each one only
   drives its own target selector.
   ========================================================================= */

(function () {
  'use strict';

  var STRINGS = {
    activeLabel:     'Active filters:',
    monthChipPrefix: 'Month: ',
    regionChipPrefix: 'Region: ',
    searchChipPrefix: 'Search: ',
    removeAria:      'Remove {label} filter',
    emptyState:      'No conference insights match your filters. Try clearing one or more.',
    monthAllLabel:   'All months',
    regionAllLabel:  'All regions'
  };

  function fmt(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (_, k) {
      return (vars && vars[k] != null) ? vars[k] : '';
    });
  }

  function bindFilter(filterRoot) {
    if (filterRoot.getAttribute('data-cif-bound') === 'true') return;
    filterRoot.setAttribute('data-cif-bound', 'true');

    var targetSelector = filterRoot.getAttribute('data-target') || '.rbccm-conference-insights-tiles__item';
    var monthSelect    = filterRoot.querySelector('[data-filter="month"]');
    var regionSelect   = filterRoot.querySelector('[data-filter="region"]');
    var searchInput    = filterRoot.querySelector('[data-filter="search"]');
    var resetBtn       = filterRoot.querySelector('.rbccm-conference-insights-filter__reset');
    var chipsWrap      = filterRoot.querySelector('.rbccm-conference-insights-filter__chips');
    var emptyState     = document.querySelector(filterRoot.getAttribute('data-empty-target') || '.rbccm-conference-insights-filter__empty');

    function getState() {
      return {
        month:  monthSelect  ? monthSelect.value.trim() : '',
        region: regionSelect ? regionSelect.value.trim() : '',
        search: searchInput  ? searchInput.value.trim().toLowerCase() : ''
      };
    }

    function labelOfOption(select, value) {
      if (!select || !value) return value;
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) return select.options[i].text;
      }
      return value;
    }

    function apply() {
      var state = getState();
      var items = document.querySelectorAll(targetSelector);
      var visibleCount = 0;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemMonth   = (item.getAttribute('data-month') || '').toLowerCase();
        var itemRegions = (item.getAttribute('data-region') || '').toLowerCase().split(/\s+/);
        var itemText    = (item.getAttribute('data-search-text') || '').toLowerCase();

        var matchMonth  = !state.month  || itemMonth === state.month.toLowerCase();
        var matchRegion = !state.region || itemRegions.indexOf(state.region.toLowerCase()) !== -1;
        var matchSearch = !state.search || itemText.indexOf(state.search) !== -1;

        var show = matchMonth && matchRegion && matchSearch;
        if (show) {
          item.removeAttribute('hidden');
          visibleCount++;
        } else {
          item.setAttribute('hidden', 'hidden');
        }
      }

      renderChips(state);
      renderEmptyState(visibleCount === 0 && (state.month || state.region || state.search));
    }

    function renderChips(state) {
      if (!chipsWrap) return;
      chipsWrap.innerHTML = '';
      var anyActive = state.month || state.region || state.search;
      if (!anyActive) return;

      var label = document.createElement('span');
      label.className = 'rbccm-conference-insights-filter__chips-label';
      label.textContent = STRINGS.activeLabel;
      chipsWrap.appendChild(label);

      if (state.month)  chipsWrap.appendChild(buildChip(STRINGS.monthChipPrefix  + labelOfOption(monthSelect, state.month),  function () { monthSelect.value = '';  apply(); }));
      if (state.region) chipsWrap.appendChild(buildChip(STRINGS.regionChipPrefix + labelOfOption(regionSelect, state.region), function () { regionSelect.value = ''; apply(); }));
      if (state.search) chipsWrap.appendChild(buildChip(STRINGS.searchChipPrefix + '"' + state.search + '"',                 function () { searchInput.value = '';  apply(); }));
    }

    function buildChip(text, onRemove) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'rbccm-conference-insights-filter__chip';
      chip.setAttribute('aria-label', fmt(STRINGS.removeAria, { label: text }));

      var textNode = document.createElement('span');
      textNode.textContent = text;
      chip.appendChild(textNode);

      var close = document.createElement('span');
      close.className = 'rbccm-conference-insights-filter__chip-close';
      close.setAttribute('aria-hidden', 'true');
      close.textContent = '×'; // ×
      chip.appendChild(close);

      chip.addEventListener('click', onRemove);
      return chip;
    }

    function renderEmptyState(show) {
      if (!emptyState) return;
      if (show) {
        emptyState.classList.add('is-visible');
        emptyState.textContent = STRINGS.emptyState;
      } else {
        emptyState.classList.remove('is-visible');
      }
    }

    if (monthSelect)  monthSelect.addEventListener('change', apply);
    if (regionSelect) regionSelect.addEventListener('change', apply);
    if (searchInput) {
      searchInput.addEventListener('input', apply);
      searchInput.addEventListener('search', apply); // native "search" event fires on Enter/clear-x in type=search
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (monthSelect)  monthSelect.value = '';
        if (regionSelect) regionSelect.value = '';
        if (searchInput)  searchInput.value = '';
        apply();
      });
    }

    // Initial pass in case URL/state pre-populates the controls.
    apply();
  }

  function init() {
    var roots = document.querySelectorAll('.rbccm-conference-insights-filter');
    for (var i = 0; i < roots.length; i++) bindFilter(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
