(function () {
  'use strict';
  const STICKY_TOP    = 60;
  const DEFAULT_COUNT = 6;
  // ── init ──────────────────────────────────────────────────────────────────
  // Called once the KO section has actually rendered its first batch of tiles.
  function init() {
    const koDiv = document.querySelector('.insights-stories.ko');
    if (!koDiv || typeof ko === 'undefined') return;
    const vm = ko.dataFor(koDiv);
    if (!vm) return;
    // Guard: don't inject the bar twice (e.g. if init is called more than once)
    if (document.getElementById('yf-filter-bar')) return;
    // ── 1. Hide Load More button ────────────────────────────────────────────
    const loadMoreBtn = document.querySelector('a.btn[data-bind*="loadMore"]');
    if (loadMoreBtn) {
      // The button sits inside: a.btn > div.text-center > div.container > div.iw_component
      // We want to hide the wrapping .container (two levels up)
      const wrapper = loadMoreBtn.parentElement && loadMoreBtn.parentElement.parentElement;
      if (wrapper) wrapper.style.display = 'none';
    }
    // ── 2. Tag all col-md-4 tiles with data-year ────────────────────────────
    function tagTiles() {
      koDiv.querySelectorAll('.col-md-4:not([data-year])').forEach(function (col) {
        const dateEl = col.querySelector('.deal-date');
        if (dateEl) {
          const m = dateEl.textContent.trim().match(/(\\d{4})/);
          if (m) col.setAttribute('data-year', m[1]);
        }
      });
    }
    tagTiles();
    // ── 3. State ────────────────────────────────────────────────────────────
    const state = { activeYear: null };
    // ── 4. Helpers ──────────────────────────────────────────────────────────
    const getCols        = function () { return Array.from(koDiv.querySelectorAll('.col-md-4[data-year]')); };
    const getYearCounts  = function () {
      const counts = {};
      getCols().forEach(function (c) {
        const y = c.getAttribute('data-year');
        counts[y] = (counts[y] || 0) + 1;
      });
      return counts;
    };
    const getYears       = function () {
      return [...new Set(getCols().map(function (c) { return c.getAttribute('data-year'); }).filter(Boolean))].sort().reverse();
    };
    const getVisibleCount = function () {
      return getCols().filter(function (c) { return c.style.display !== 'none'; }).length;
    };
    // ── 5. Filter logic ─────────────────────────────────────────────────────
    function applyFilter(year) {
      state.activeYear = year;
      const all = getCols();
      if (year === null) {
        let shown = 0;
        all.forEach(function (col) {
          col.style.display = shown < DEFAULT_COUNT ? '' : 'none';
          if (col.style.display !== 'none') shown++;
        });
      } else {
        all.forEach(function (col) {
          col.style.display = col.getAttribute('data-year') === year ? '' : 'none';
        });
      }
      updateUI();
    }
    // ── 6. Build DOM ────────────────────────────────────────────────────────
    const filterBar = document.createElement('div');
    filterBar.id = 'yf-filter-bar';
    filterBar.style.cssText = 'background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;margin:0;padding:14px 0;';
    const inner = document.createElement('div');
    inner.className = 'container';
    inner.style.cssText = 'display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:0 15px;';
    // Label
    const label = document.createElement('label');
    label.setAttribute('for', 'yf-drop-btn');
    label.textContent = 'Filter by Year:';
    label.style.cssText = 'font-family:Fira,"Lucida Grande",Verdana,sans-serif;font-size:14px;font-weight:600;color:#333;white-space:nowrap;cursor:default;';
    // Dropdown wrapper
    const dropWrap = document.createElement('div');
    dropWrap.style.cssText = 'position:relative;display:inline-block;';
    // Button
    // FIX: use actual Unicode characters instead of escaped literals
    const dropBtn = document.createElement('button');
    dropBtn.id = 'yf-drop-btn';
    dropBtn.setAttribute('aria-haspopup', 'listbox');
    dropBtn.setAttribute('aria-expanded', 'false');
    dropBtn.setAttribute('aria-controls', 'yf-listbox');
    dropBtn.setAttribute('aria-label', 'Select year filter');
    dropBtn.style.cssText = 'font-family:Fira,"Lucida Grande",Verdana,sans-serif;font-size:14px;font-weight:500;padding:7px 32px 7px 14px;border:2px solid #0051A5;border-radius:4px;background:#fff;color:#0051A5;cursor:pointer;outline:none;position:relative;min-width:145px;text-align:left;appearance:none;-webkit-appearance:none;';
    dropBtn.appendChild(document.createTextNode('Select year\\u2026'));   // FIX: was 'Select year\\\\u2026'
    const arrow = document.createElement('span');
    arrow.id = 'yf-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '&#9660;';
    arrow.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;color:#0051A5;pointer-events:none;transition:transform 0.2s;';
    dropBtn.appendChild(arrow);
    // Listbox
    const listbox = document.createElement('ul');
    listbox.id = 'yf-listbox';
    listbox.setAttribute('role', 'listbox');
    listbox.setAttribute('aria-label', 'Year options');
    listbox.setAttribute('tabindex', '-1');
    listbox.style.cssText = 'display:none;position:absolute;top:calc(100% + 4px);left:0;min-width:100%;background:#fff;border:2px solid #0051A5;border-radius:4px;margin:0;padding:4px 0;list-style:none;z-index:9999;box-shadow:0 4px 14px rgba(0,81,165,0.18);';
    // Count badge
    const badge = document.createElement('span');
    badge.id = 'yf-count-badge';
    badge.setAttribute('aria-live', 'polite');
    badge.setAttribute('aria-atomic', 'true');
    badge.style.cssText = 'font-family:Fira,"Lucida Grande",Verdana,sans-serif;font-size:13px;color:#555;font-style:italic;white-space:nowrap;';
    badge.textContent = 'Showing ' + DEFAULT_COUNT + ' most recent deals';
    // Clear button
    // FIX: use actual Unicode character instead of escaped literal
    const clearBtn = document.createElement('button');
    clearBtn.id = 'yf-clear-btn';
    clearBtn.textContent = '\\u2715 Clear filter';                        // FIX: was '\\\\u2715 Clear filter'
    clearBtn.setAttribute('aria-label', 'Clear year filter');
    clearBtn.style.cssText = 'font-family:Fira,"Lucida Grande",Verdana,sans-serif;font-size:12px;font-weight:500;color:#0051A5;background:none;border:1px solid #0051A5;border-radius:4px;cursor:pointer;padding:4px 10px;display:none;outline:none;';
    clearBtn.addEventListener('click', function () { applyFilter(null); });
    // ── 7. Dropdown interactions ────────────────────────────────────────────
    function openDropdown() {
      buildOptions();
      listbox.style.display = 'block';
      dropBtn.setAttribute('aria-expanded', 'true');
      document.getElementById('yf-arrow').style.transform = 'translateY(-50%) rotate(180deg)';
      const sel = listbox.querySelector('[aria-selected="true"]') || listbox.querySelector('[role="option"]');
      if (sel) setTimeout(function () { sel.focus(); }, 10);
    }
    function closeDropdown() {
      listbox.style.display = 'none';
      dropBtn.setAttribute('aria-expanded', 'false');
      document.getElementById('yf-arrow').style.transform = 'translateY(-50%) rotate(0deg)';
    }
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      listbox.style.display === 'none' ? openDropdown() : closeDropdown();
    });
    dropBtn.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openDropdown();
      }
    });
    listbox.addEventListener('keydown', function (e) {
      const opts = Array.from(listbox.querySelectorAll('[role="option"]'));
      const idx  = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        opts[(idx + 1) % opts.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        opts[(idx - 1 + opts.length) % opts.length].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const v = document.activeElement.getAttribute('data-value');
        if (v) { closeDropdown(); applyFilter(v); }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });
    document.addEventListener('click', function (e) {
      if (!dropWrap.contains(e.target)) closeDropdown();
    }, true);
    // ── 8. Build listbox options ────────────────────────────────────────────
    function buildOptions() {
      listbox.innerHTML = '';
      const year   = state.activeYear;
      const counts = getYearCounts();
      getYears().forEach(function (y) {
        const isActive = year === y;
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('data-value', y);
        li.setAttribute('tabindex', '-1');
        li.setAttribute('aria-selected', isActive ? 'true' : 'false');
        li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:9px 14px;cursor:pointer;font-family:Fira,"Lucida Grande",Verdana,sans-serif;font-size:14px;color:' + (isActive ? '#0051A5' : '#333') + ';background:' + (isActive ? '#e8f0fb' : '#fff') + ';font-weight:' + (isActive ? '600' : '400') + ';outline:none;user-select:none;';
        const yLabel = document.createElement('span');
        yLabel.textContent = y;
        yLabel.style.pointerEvents = 'none';
        const cnt = document.createElement('span');
        cnt.textContent = counts[y] || 0;
        cnt.style.cssText = 'margin-left:12px;font-size:12px;color:#fff;background:#0051A5;padding:2px 8px;border-radius:10px;font-weight:600;min-width:22px;text-align:center;pointer-events:none;';
        li.appendChild(yLabel);
        li.appendChild(cnt);
        li.addEventListener('mouseover', function () {
          if (state.activeYear !== y) li.style.background = '#f0f6ff';
        });
        li.addEventListener('mouseout', function () {
          li.style.background = state.activeYear === y ? '#e8f0fb' : '#fff';
        });
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
        li.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeDropdown();
          applyFilter(y);
        });
        listbox.appendChild(li);
      });
    }
    // ── 9. Update UI ────────────────────────────────────────────────────────
    function updateUI() {
      const year    = state.activeYear;
      const visible = getVisibleCount();
      // Button label
      // FIX: use actual Unicode character instead of escaped literal
      dropBtn.innerHTML = '';
      dropBtn.appendChild(document.createTextNode(year || 'Select year\\u2026'));  // FIX: was 'Select year\\\\u2026'
      const newArrow = document.createElement('span');
      newArrow.id = 'yf-arrow';
      newArrow.setAttribute('aria-hidden', 'true');
      newArrow.innerHTML = '&#9660;';
      newArrow.style.cssText = 'position:absolute;right:10px;top:50%;transform:translateY(-50%) rotate(0deg);font-size:11px;color:#0051A5;pointer-events:none;transition:transform 0.2s;';
      dropBtn.appendChild(newArrow);
      // Badge
      badge.textContent = year === null
        ? 'Showing ' + visible + ' most recent deal' + (visible !== 1 ? 's' : '')
        : 'Showing ' + visible + ' deal' + (visible !== 1 ? 's' : '') + ' from ' + year;
      // Clear button
      clearBtn.style.display = year !== null ? 'inline' : 'none';
      buildOptions();
    }
    // ── 10. Assemble filter bar ─────────────────────────────────────────────
    dropWrap.appendChild(dropBtn);
    dropWrap.appendChild(listbox);
    inner.appendChild(label);
    inner.appendChild(dropWrap);
    inner.appendChild(badge);
    inner.appendChild(clearBtn);
    filterBar.appendChild(inner);
    koDiv.parentNode.insertBefore(filterBar, koDiv);
    // ── 11. Sticky behaviour ────────────────────────────────────────────────
    const placeholder = document.createElement('div');
    placeholder.id = 'yf-sticky-placeholder';
    placeholder.style.cssText = 'display:none;margin:0;padding:0;';
    filterBar.parentNode.insertBefore(placeholder, filterBar);
    const topSentinel = document.createElement('div');
    topSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    filterBar.parentNode.insertBefore(topSentinel, placeholder);
    const bottomSentinel = document.createElement('div');
    bottomSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    koDiv.appendChild(bottomSentinel);
    let isSticky = false;
    function makeSticky() {
      if (isSticky) return;
      isSticky = true;
      placeholder.style.height  = filterBar.offsetHeight + 'px';
      placeholder.style.display = 'block';
      filterBar.style.cssText   = 'position:fixed;top:' + STICKY_TOP + 'px;left:0;right:0;z-index:500;background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;margin:0;padding:14px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
    }
    function makeNormal() {
      if (!isSticky) return;
      isSticky = false;
      placeholder.style.display = 'none';
      filterBar.style.cssText   = 'background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;margin:0;padding:14px 0;';
    }
    function onScroll() {
      const topRect    = topSentinel.getBoundingClientRect();
      const bottomRect = bottomSentinel.getBoundingClientRect();
      const barHeight  = filterBar.offsetHeight || 70;
      (topRect.top < STICKY_TOP && bottomRect.top > STICKY_TOP + barHeight) ? makeSticky() : makeNormal();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // ── 12. MutationObserver — handles subsequent "Load more" clicks ────────
    new MutationObserver(function () {
      tagTiles();
      applyFilter(state.activeYear);
    }).observe(koDiv, { childList: true, subtree: true });
    // ── 13. Initial render ──────────────────────────────────────────────────
    applyFilter(null);
  }
  // ── Startup ───────────────────────────────────────────────────────────────
  // FIX: The original script ran init() at DOMContentLoaded / setTimeout(500ms).
  // At that point the KO viewmodel exists but the AJAX fetch hasn't completed,
  // so .insights-stories.ko contains zero .col-md-4 tiles and the filter bar
  // was never built (or was built empty with no MutationObserver catch-up).
  //
  // The correct trigger is the KO "show" observable: it goes from 0 → N the
  // moment KO has fetched data AND rendered the first batch of tiles into the
  // DOM (which only happens after the user clicks "Load more" the first time,
  // because the page serves a static .insights-stories.initial section until
  // that point). We subscribe once, fire init(), then immediately dispose the
  // subscription so it never runs again.
  function waitForKO() {
    const koDiv = document.querySelector('.insights-stories.ko');
    if (!koDiv || typeof ko === 'undefined') return;
    const vm = ko.dataFor(koDiv);
    if (!vm || typeof vm.show !== 'function') return;
    // If KO already has tiles in the DOM (e.g. script loaded late), run now.
    if (koDiv.querySelectorAll('.col-md-4').length > 0) {
      init();
      return;
    }
    // Otherwise subscribe to show() and initialise as soon as tiles appear.
    const sub = vm.show.subscribe(function (val) {
      if (val > 0 && koDiv.querySelectorAll('.col-md-4').length > 0) {
        sub.dispose();
        init();
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForKO);
  } else {
    waitForKO();
  }
}());