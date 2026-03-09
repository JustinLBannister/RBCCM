(function () {
  'use strict';
  var STICKY_TOP    = 60;
  var DEFAULT_COUNT = 6;
  function init() {
    var koDiv = document.querySelector('.insights-stories.ko');
    if (!koDiv || typeof ko === 'undefined') return;
    var vm = ko.dataFor(koDiv);
    if (!vm) return;
    var filterBar = document.getElementById('yf-filter-bar');
    if (!filterBar) return;
    var dropBtn  = document.getElementById('yf-drop-btn');
    var dropWrap = document.getElementById('yf-drop-wrap');
    var listbox  = document.getElementById('yf-listbox');
    var badge    = document.getElementById('yf-count-badge');
    var clearBtn = document.getElementById('yf-clear-btn');
    if (!dropBtn || !listbox || !badge || !clearBtn) return;
    // FIX: Do NOT hide Load More. deals.js manages it and we need it to keep working.
    // Tag tiles — koDiv is now correct because deals.js has already populated it
    function tagTiles() {
      koDiv.querySelectorAll('.col-md-4:not([data-year])').forEach(function (col) {
        var dateEl = col.querySelector('.deal-date');
        if (dateEl) {
          var m = dateEl.textContent.trim().match(/(\\d{4})/);
          if (m) col.setAttribute('data-year', m[1]);
        }
      });
    }
    tagTiles();
    var state = { activeYear: null };
    function getCols() {
      return Array.from(koDiv.querySelectorAll('.col-md-4[data-year]'));
    }
    function getYearCounts() {
      var counts = {};
      getCols().forEach(function (c) {
        var y = c.getAttribute('data-year');
        counts[y] = (counts[y] || 0) + 1;
      });
      return counts;
    }
    function getYears() {
      var years = getCols().map(function (c) { return c.getAttribute('data-year'); }).filter(Boolean);
      return Array.from(new Set(years)).sort().reverse();
    }
    function getVisibleCount() {
      return getCols().filter(function (c) { return c.style.display !== 'none'; }).length;
    }
    function applyFilter(year) {
      state.activeYear = year;
      var all = getCols();
      if (year === null) {
        var shown = 0;
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
    function openDropdown() {
      buildOptions();
      listbox.style.display = 'block';
      dropBtn.setAttribute('aria-expanded', 'true');
      var arrowEl = document.getElementById('yf-arrow');
      if (arrowEl) arrowEl.style.transform = 'translateY(-50%) rotate(180deg)';
      var sel = listbox.querySelector('[aria-selected="true"]') || listbox.querySelector('[role="option"]');
      if (sel) setTimeout(function () { sel.focus(); }, 10);
    }
    function closeDropdown() {
      listbox.style.display = 'none';
      dropBtn.setAttribute('aria-expanded', 'false');
      var arrowEl = document.getElementById('yf-arrow');
      if (arrowEl) arrowEl.style.transform = 'translateY(-50%) rotate(0deg)';
    }
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      listbox.style.display === 'none' ? openDropdown() : closeDropdown();
    });
    dropBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDropdown();
      }
    });
    listbox.addEventListener('keydown', function (e) {
      var opts = Array.from(listbox.querySelectorAll('[role="option"]'));
      var idx  = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        opts[(idx + 1) % opts.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        opts[(idx - 1 + opts.length) % opts.length].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var v = document.activeElement.getAttribute('data-value');
        if (v) { closeDropdown(); applyFilter(v); }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });
    document.addEventListener('click', function (e) {
      if (dropWrap && !dropWrap.contains(e.target)) closeDropdown();
    }, true);
    clearBtn.addEventListener('click', function () { applyFilter(null); });
    function buildOptions() {
      listbox.innerHTML = '';
      var year   = state.activeYear;
      var counts = getYearCounts();
      getYears().forEach(function (y) {
        var isActive = year === y;
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('data-value', y);
        li.setAttribute('tabindex', '-1');
        li.setAttribute('aria-selected', isActive ? 'true' : 'false');
        li.style.cssText = [
          'display:flex', 'justify-content:space-between', 'align-items:center',
          'padding:9px 14px', 'cursor:pointer',
          'font-family:Fira,"Lucida Grande",Verdana,sans-serif', 'font-size:14px',
          'color:'       + (isActive ? '#0051A5' : '#333'),
          'background:'  + (isActive ? '#e8f0fb' : '#fff'),
          'font-weight:' + (isActive ? '600' : '400'),
          'outline:none', 'user-select:none'
        ].join(';') + ';';
        var yLabel = document.createElement('span');
        yLabel.textContent = y;
        yLabel.style.pointerEvents = 'none';
        var cnt = document.createElement('span');
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
          e.preventDefault(); e.stopPropagation();
        });
        li.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          closeDropdown(); applyFilter(y);
        });
        listbox.appendChild(li);
      });
    }
    function updateUI() {
      var year    = state.activeYear;
      var visible = getVisibleCount();
      var arrowEl = document.getElementById('yf-arrow');
      var arrowHTML = arrowEl ? arrowEl.outerHTML : '';
      dropBtn.innerHTML = (year ? year : 'Select year&hellip;') + arrowHTML;
      badge.textContent = year === null
        ? 'Showing ' + visible + ' most recent deal' + (visible !== 1 ? 's' : '')
        : 'Showing ' + visible + ' deal' + (visible !== 1 ? 's' : '') + ' from ' + year;
      clearBtn.style.display = year !== null ? 'inline' : 'none';
      buildOptions();
    }
    // Sticky — bottomSentinel on koDiv is now correct since .initial is gone
    var placeholder = document.getElementById('yf-sticky-placeholder');
    var topSentinel = document.createElement('div');
    topSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    filterBar.parentNode.insertBefore(topSentinel, filterBar);
    var bottomSentinel = document.createElement('div');
    bottomSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    koDiv.appendChild(bottomSentinel);
    var isSticky = false;
    function makeSticky() {
      if (isSticky) return;
      isSticky = true;
      if (placeholder) {
        placeholder.style.height  = filterBar.offsetHeight + 'px';
        placeholder.style.display = 'block';
      }
      filterBar.style.cssText = 'position:fixed;top:' + STICKY_TOP + 'px;left:0;right:0;z-index:500;background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;margin:0;padding:14px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
    }
    function makeNormal() {
      if (!isSticky) return;
      isSticky = false;
      if (placeholder) placeholder.style.display = 'none';
      filterBar.style.cssText = 'background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;margin:0;padding:14px 0;';
    }
    function onScroll() {
      var topRect    = topSentinel.getBoundingClientRect();
      var bottomRect = bottomSentinel.getBoundingClientRect();
      var barHeight  = filterBar.offsetHeight || 70;
      if (topRect.top < STICKY_TOP && bottomRect.top > STICKY_TOP + barHeight) {
        makeSticky();
      } else {
        makeNormal();
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // MutationObserver: re-tag and re-filter when Load More appends new KO tiles
    new MutationObserver(function () {
      tagTiles();
      applyFilter(state.activeYear);
    }).observe(koDiv, { childList: true, subtree: true });
    applyFilter(null);
  }
  function waitForKO() {
    var koDiv = document.querySelector('.insights-stories.ko');
    if (!koDiv || typeof ko === 'undefined') return;
    var vm = ko.dataFor(koDiv);
    if (!vm || typeof vm.show !== 'function') return;
    // deals.js removes .initial and populates .ko automatically on page load.
    // Wait for .ko to have tiles (deals.js fired loadContent) before wiring up.
    // By the time this script runs, deals.js may have already populated .ko,
    // or it may still be fetching — handle both cases.
    if (koDiv.querySelectorAll('.col-md-4').length > 0) {
      init();
      return;
    }
    // deals.js hasn't finished yet — watch for tiles to appear in .ko
    var observer = new MutationObserver(function () {
      if (koDiv.querySelectorAll('.col-md-4').length > 0) {
        observer.disconnect();
        init();
      }
    });
    observer.observe(koDiv, { childList: true, subtree: true });
    // Also subscribe to show() as a belt-and-suspenders fallback
    var sub = vm.show.subscribe(function (val) {
      if (val > 0 && koDiv.querySelectorAll('.col-md-4').length > 0) {
        sub.dispose();
        observer.disconnect();
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