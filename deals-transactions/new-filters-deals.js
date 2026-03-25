var lmScroll = 0;

/* --- Utility helpers --- */
function setPage(state) {
  if (state !== 0) {
    if (history.pushState) { history.pushState(null, null, '#' + Math.ceil(state)); }
    else { location.hash = '#' + Math.ceil(state); }
  }
}
function getQueryValue(variable) {
  var query = location.search.substring(1);
  if (query.indexOf('=') > -1) { var vars = [query]; } else { return false; }
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) { return pair[1]; }
  }
  return false;
}
function getURLtag(tag) {
  var init_tag = getQueryValue(tag);
  if (init_tag) {
    return init_tag.replace(/%20/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return '';
}

/* --- KO ViewModel --- */
function FormViewModel(page) {
  var self = this;
  self.show    = ko.observable(9 + page * 6);
  self.items   = ko.observableArray();
  self.topics  = ko.observableArray().extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' } });
  self.pubs    = ko.observableArray();
  self.authors = ko.observableArray();
  self.notify  = ko.observable();
  self.loaded  = ko.observable(false);
  self.loading = ko.observable(false);
  self.year    = new Date().getFullYear();
  self.fronly  = ko.observable(false);
  self.activeYear = ko.observable(null);
  self.query   = ko.observable('').extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' } });

  self.filteredItems = ko.computed(function () {
    self.notify();
    if (self.topics().length === 0 && self.pubs().length === 0 && self.authors().length === 0 && self.query().length === 0) {
      return self.items();
    } else {
      return ko.utils.arrayFilter(self.items(), function (item) {
        var tmatch = false, pmatch = false, amatch = false;
        if (self.pubs().length > 0) {
          $.each(self.pubs(), function (k, v) { if (item.title.toLowerCase().indexOf(v.toLowerCase()) != -1) pmatch = true; });
        } else { pmatch = true; }
        if (self.authors().length > 0) {
          $.each(self.authors(), function (k, v) {
            if (item.author !== undefined && item.author.toString().toLowerCase().indexOf(v.toLowerCase()) != -1) amatch = true;
          });
        } else { amatch = true; }
        if (self.topics().length > 0) {
          var itemTopics;
          if (item.tags !== undefined) {
            var itemTags = item.tags.split(',');
            itemTopics = item.category !== undefined ? itemTags.concat(item.category.split(',')) : itemTags;
          } else if (item.category !== undefined) {
            itemTopics = item.category.split(',');
          }
          if (itemTopics) {
            $.each(itemTopics, function (k, v) {
              if ($.trim(v)) {
                if (self.topics().filter(function (t) { return t.toLowerCase().indexOf($.trim(v.toLowerCase())) !== -1; })[0] !== undefined ||
                    self.topics().filter(function (t) { return $.trim(v.toLowerCase()).indexOf(t.toLowerCase()) !== -1; })[0] !== undefined) {
                  tmatch = true;
                }
              }
            });
          }
        } else { tmatch = true; }
        if (self.query()) return tmatch || pmatch || amatch;
        return tmatch && pmatch && amatch;
      });
    }
  });

  /* -- Year filter helpers -- */
  function getItemYear(item) {
    if (!item || !item.date) return null;
    var parts = item.date.trim().split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : null;
  }
  function getAvailableYears() {
    var seen = {};
    self.items().forEach(function (item) {
      var y = getItemYear(item);
      if (y) seen[y] = (seen[y] || 0) + 1;
    });
    return Object.keys(seen).sort().reverse().map(function (y) { return { year: y, count: seen[y] }; });
  }
  function doFilter(year) {
    var koContainer = document.querySelector('.insights-stories.ko');
    if (!koContainer) return;
    Array.from(koContainer.querySelectorAll('.col-md-4'))
      .filter(function (c) { return c.querySelector('.deal-date'); })
      .forEach(function (c) {
        var tileYear = (c.querySelector('.deal-date').textContent || '').trim().split(' ').pop();
        c.style.display = (tileYear === year) ? '' : 'none';
      });
  }
  function showRecentTilesOnly() {
    var koContainer = document.querySelector('.insights-stories.ko');
    if (!koContainer) return;
    var tiles = Array.from(koContainer.querySelectorAll('.col-md-4')).filter(function (c) { return c.querySelector('.deal-date'); });
    tiles.forEach(function (c) { c.style.display = ''; });
    tiles.forEach(function (c) {
      var tileYear = parseInt((c.querySelector('.deal-date').textContent || '').trim().split(' ').pop(), 10);
      if (tileYear < 2024) c.style.display = 'none';
    });
  }
  function stripKoMarginTop() {
    var koRow = document.querySelector('.insights-stories.ko .container .row');
    if (koRow) koRow.style.marginTop = '';
  }
  function buildInitialFromSnapshot() {
    if (!self._initialSnapshot || self._initialSnapshot.length === 0) return null;
    var wrap = document.createElement('div'); wrap.className = 'insights-stories initial';
    var tombWrap = document.createElement('div'); tombWrap.className = 'tombstones-wrap';
    var container = document.createElement('div'); container.className = 'container';
    var row = document.createElement('div'); row.className = 'row';
    self._initialSnapshot.forEach(function (tileHTML) {
      var col = document.createElement('div'); col.className = 'col-md-4'; col.innerHTML = tileHTML; row.appendChild(col);
    });
    container.appendChild(row); tombWrap.appendChild(container); wrap.appendChild(tombWrap);
    return wrap;
  }

  /* -- Legacy year dropdown (kept for HTML compatibility, hidden by initFilterBar) -- */
  function buildDropdownOptions() {
    var listbox = document.getElementById('yf-listbox');
    if (!listbox) return;
    var activeYear = self.activeYear();
    listbox.innerHTML = '';
    getAvailableYears().forEach(function (yObj) {
      var y = yObj.year, isActive = activeYear === y;
      var li = document.createElement('li');
      li.setAttribute('role', 'option'); li.setAttribute('data-value', y);
      li.setAttribute('tabindex', '-1'); li.setAttribute('aria-selected', isActive ? 'true' : 'false');
      li.style.cssText = ['display:flex','justify-content:space-between','align-items:center','padding:9px 14px','cursor:pointer','font-size:14px',
        'color:'+(isActive?'#0051A5':'#333'),'background:'+(isActive?'#e8f0fb':'#fff'),'font-weight:'+(isActive?'600':'400'),'outline:none','user-select:none'].join(';')+';';
      var yLabel = document.createElement('span'); yLabel.textContent = y; yLabel.style.pointerEvents = 'none';
      var cnt = document.createElement('span'); cnt.textContent = yObj.count;
      cnt.style.cssText = 'margin-left:12px;font-size:12px;color:#fff;background:#0051A5;padding:2px 8px;border-radius:10px;font-weight:600;min-width:22px;text-align:center;pointer-events:none;';
      li.appendChild(yLabel); li.appendChild(cnt);
      li.addEventListener('mouseover', function () { if (self.activeYear() !== y) li.style.background = '#f0f6ff'; });
      li.addEventListener('mouseout',  function () { li.style.background = self.activeYear() === y ? '#e8f0fb' : '#fff'; });
      li.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); });
      li.addEventListener('click',     function (e) { e.preventDefault(); e.stopPropagation(); closeDropdown(); self.applyYearFilter(y); });
      listbox.appendChild(li);
    });
  }
  function openDropdown() {
    var lb = document.getElementById('yf-listbox'), db = document.getElementById('yf-drop-btn'), ar = document.getElementById('yf-arrow');
    if (!lb) return;
    buildDropdownOptions(); lb.style.display = 'block'; db.setAttribute('aria-expanded', 'true');
    if (ar) ar.style.transform = 'translateY(-50%) rotate(180deg)';
    var sel = lb.querySelector('[aria-selected="true"]') || lb.querySelector('[role="option"]');
    if (sel) setTimeout(function () { sel.focus(); }, 10);
  }
  function closeDropdown() {
    var lb = document.getElementById('yf-listbox'), db = document.getElementById('yf-drop-btn'), ar = document.getElementById('yf-arrow');
    if (!lb) return;
    lb.style.display = 'none'; db.setAttribute('aria-expanded', 'false');
    if (ar) ar.style.transform = 'translateY(-50%) rotate(0deg)';
  }

  self.applyYearFilter = function (year) {
    self.activeYear(year);
    var initialContainer = document.querySelector('.insights-stories.initial');
    var koContainer      = document.querySelector('.insights-stories.ko');
    if (year === null) {
      if (!initialContainer) {
        var rebuilt = buildInitialFromSnapshot();
        if (rebuilt && koContainer && koContainer.parentNode) {
          koContainer.parentNode.insertBefore(rebuilt, koContainer); initialContainer = rebuilt;
        }
      }
      if (initialContainer) { initialContainer.style.display = ''; Array.from(initialContainer.querySelectorAll('.col-md-4')).forEach(function (c) { c.style.display = ''; }); }
      if (koContainer) koContainer.style.display = 'none';
      var lmEl = document.getElementById('load-more'); if (lmEl) lmEl.style.removeProperty('display');
      var clearBtn = document.getElementById('yf-clear-btn'); if (clearBtn) clearBtn.style.display = 'none';
      self.updateYearUI(); return;
    }
    if (initialContainer) initialContainer.style.display = 'none';
    if (koContainer) { koContainer.style.display = ''; stripKoMarginTop(); }
    if (self.show() === 0) self.show(9);
    self.notify.notifySubscribers();
    var lmEl2 = document.getElementById('load-more'); if (lmEl2) lmEl2.style.display = 'none';
    var clearBtn2 = document.getElementById('yf-clear-btn'); if (clearBtn2) clearBtn2.style.display = 'inline';
    setTimeout(function () { stripKoMarginTop(); doFilter(year); self.updateYearUI(); }, 100);
  };

  self.updateYearUI = function () {
    var year = self.activeYear(), db = document.getElementById('yf-drop-btn'),
        badge = document.getElementById('yf-count-badge'), clear = document.getElementById('yf-clear-btn'),
        arrowEl = document.getElementById('yf-arrow');
    if (badge) {
      badge.style.display = 'none';
      if (year === null) { badge.textContent = 'Showing 6 most recent deals'; }
      else { var n = self.items().filter(function (i) { return getItemYear(i) === year; }).length; badge.textContent = 'Showing ' + n + ' deal' + (n !== 1 ? 's' : '') + ' from ' + year; }
    }
    if (db) { var arHTML = arrowEl ? arrowEl.outerHTML : ''; db.innerHTML = (year ? year : 'Select year&hellip;') + arHTML; }
    if (clear) clear.style.display = year !== null ? 'inline' : 'none';
    buildDropdownOptions();
  };

  /* -- Standard KO action methods -- */
  self.selectNoTopics = function () { self.show(9); self.query(''); self.topics([]); self.pubs([]); self.authors([]); self.notify.notifySubscribers(); };
  self.selectTopic = function (t) {
    self.show(0); self.loadContent(); self.query(''); self.topics(t); self.pubs([]); self.authors([]);
    self.notify.notifySubscribers(); $('.initial').remove(); self.show(9);
  };
  self.selectAuthor = function (a) {
    self.show(0); self.loadContent(); self.query(''); self.topics([]); self.pubs([]); self.authors([a]);
    self.notify.notifySubscribers(); $('.initial').remove(); self.show(9);
  };
  self.query.subscribe(function () {
    self.loadContent(); var q = self.query(); self.topics([q]); self.pubs([q]); self.authors([q]);
    self.notify.notifySubscribers(); $('#clear-search').show();
  });
  self.resetQuery = function () {
    self.loadContent(); self.query(''); self.topics([]); self.pubs([]); self.authors([]);
    self.notify.notifySubscribers(); $('#clear-search').hide();
  };
  self.selectFromURL = function (tag, author) {
    self.loadContent(); self.query(''); self.topics(tag ? [tag] : []); self.pubs([]); self.authors(author ? [author] : []);
    self.notify.notifySubscribers();
  };
  self.loadContent = function () {
    var scroll = $(window).scrollTop();
    if (self.show() === 0) self.show(9);
    if (self.items().length < 1) { $('.initial').remove(); $('#load-more').text('Loading...'); self.fetchYear(self.year); $(window).scrollTop(scroll); }
    else { $('#load-more').text('Load More'); }
  };

  /* -- fetchYear -- */
  self.fetchYear = function (y) {
    $.ajax({
      url: 'transactions/data/deals.page',
      dataType: 'xml',
      cache: true,
      success: function (data) {
        $(data).find('news').each(function () {
          var item = {};
          item.date        = $(this).find('date').text();
          item.year        = getItemYear(item);
          item.link        = $(this).find('link').text();
          item.thumbnail   = $(this).find('thumbnail').text();
          item.title       = $(this).find('title').text();
          item.description = $(this).find('description').text();
          if (item.description.length > 130) {
            item.description = item.description.substring(0, item.description.substring(0, 130).lastIndexOf(' ')) + '...';
            if (item.description.charAt(item.description.length - 1) == ',') item.description = item.description.substring(0, item.description.length - 1);
          }
          item.role      = $(this).find('role').text();
          item.status    = $(this).find('status').text();
          item.amount    = $(this).find('amount').text();
          item.region    = $(this).find('region').text();
          item.specialty = $(this).find('specialty').text();
          self.items().push(item);
        });
        if ($('#load-more').text() === 'Loading...') $('#load-more').text('Load More');
        if (self._userTriggered) {
          self._userTriggered = false;
          if ($('.initial').length > 0) $('.initial').remove();
          self.notify.notifySubscribers();
          var cur = self.activeYear();
          if (cur !== null) { setTimeout(function () { self.applyYearFilter(cur); }, 100); }
        }
        buildDropdownOptions();
        $(window).scrollTop(lmScroll);
      }
    });
  };

  /* -- loadMore -- */
  self.loadMore = function () {
    if (!self._initialSnapshot) {
      var initTiles = document.querySelectorAll('.insights-stories.initial .col-md-4');
      if (initTiles.length > 0) { self._initialSnapshot = Array.from(initTiles).map(function (t) { return t.innerHTML; }); }
    }
    $('#load-more').text('Loading...');
    setTimeout(function () {
      if (self.items().length < 1) { self._userTriggered = true; self.fetchYear(self.year); return; }
      $('.initial').remove();
      var koContainer = document.querySelector('.insights-stories.ko');
      if (koContainer) { koContainer.style.display = ''; stripKoMarginTop(); }
      $('#load-more').text('Load More');
      if (self.show() === 0) { self.show(18); } else { self.show(self.show() + 6); }
      self.notify.notifySubscribers();
      setTimeout(function () {
        stripKoMarginTop();
        if (self.activeYear() === null) { showRecentTilesOnly(); } else { doFilter(self.activeYear()); }
        var filterBar = document.getElementById('yf-filter-bar');
        if (filterBar) { var offset = $(filterBar).offset().top - 80; $(window).scrollTop(offset); }
      }, 100);
    }, 50);
    $('#load-more').hide();
    var clearBtn = document.getElementById('yf-clear-btn'); if (clearBtn) clearBtn.style.display = 'inline';
  };

  if (self.show() > 9) {
    var initTilesEarly = document.querySelectorAll('.insights-stories.initial .col-md-4');
    if (initTilesEarly.length > 0) { self._initialSnapshot = Array.from(initTilesEarly).map(function (t) { return t.innerHTML; }); }
    $('.initial').remove();
    $('#load-more').text('Loading...');
    setTimeout(function () {
      if (self.items().length < 1 && getUrlParameter('t') === undefined) { self._userTriggered = true; self.fetchYear(self.year); }
      else { $('#load-more').text('Load More'); }
    }, 50);
  }

  /* =====================================================================
     initFilterBar — Role + Amount filters (replaces legacy year dropdown)
     ===================================================================== */
  self.initFilterBar = function () {
    var filterBar = document.getElementById('yf-filter-bar');
    if (!filterBar) return;

    /* -- Responsive container styles -- */
    if (!document.getElementById('yf-filter-bar-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'yf-filter-bar-styles';
      styleEl.textContent = [
        '#yf-filter-bar.container { margin-left:15px; margin-right:15px; }',
        '@media (min-width:768px)  { #yf-filter-bar.container { margin-left:auto; margin-right:auto; max-width:720px;  } }',
        '@media (min-width:992px)  { #yf-filter-bar.container { max-width:940px;  } }',
        '@media (min-width:1200px) { #yf-filter-bar.container { max-width:1140px; } }'
      ].join(' ');
      document.head.appendChild(styleEl);
    }

    /* -- Component styles -- */
    if (!document.getElementById('yf-x-css')) {
      var xCss = document.createElement('style');
      xCss.id = 'yf-x-css';
      xCss.textContent = [
        '#yf-filter-bar .container { display:flex; align-items:center; flex-wrap:wrap; gap:6px; justify-content:flex-end; }',
        '#yf-x-row { display:flex; align-items:center; flex-wrap:wrap; gap:8px; justify-content:flex-start; width:100%; }',
        /* Role dropdown */
        '#yf-x-role-wrap { position:relative; display:inline-block; vertical-align:middle; }',
        '#yf-x-role-btn { display:inline-flex; align-items:center; padding:7px 12px; border:1px solid #0051A5; border-radius:4px; background:#fff; color:#0051A5; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; min-width:155px; justify-content:space-between; gap:6px; }',
        '#yf-x-role-btn:hover { background:#f0f6ff; }',
        '#yf-x-role-btn span.arrow { font-size:10px; transition:transform .2s; }',
        '#yf-x-role-lb { display:none; position:absolute; left:0; top:calc(100% + 4px); background:#fff; border:1px solid #d3d3d3; border-radius:4px; box-shadow:0 4px 12px rgba(0,0,0,.12); z-index:700; min-width:270px; max-height:280px; overflow-y:auto; padding:4px 0; margin:0; list-style:none; }',
        '#yf-x-role-lb li { display:flex; justify-content:flex-start; align-items:center; padding:7px 14px; cursor:pointer; font-size:13px; color:#333; text-align:left !important; }',
        '#yf-x-role-lb li a { text-align:left !important; }',
        '#yf-x-role-lb li:hover { background:#f0f6ff; }',
        '#yf-x-role-lb li.active { background:#e8f0fb; color:#0051A5; font-weight:600; }',
        '#yf-x-role-lb li .cnt { display:none !important; }',
        /* Amount slider */
        '#yf-x-amt-wrap { display:inline-flex; align-items:center; gap:8px; vertical-align:middle; }',
        '#yf-x-amt-lbl { font-size:13px; font-weight:600; color:#333; white-space:nowrap; }',
        '#yf-x-rng-wrap { position:relative; display:inline-block; width:160px; height:28px; }',
        '#yf-x-rng-wrap input[type=range] { -webkit-appearance:none; appearance:none; position:absolute; width:100%; height:4px; background:transparent; outline:none; pointer-events:none; top:50%; transform:translateY(-50%); }',
        '#yf-x-rng-wrap input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#0051A5; border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,.25); cursor:pointer; pointer-events:all; }',
        '#yf-x-track { position:absolute; width:100%; height:4px; background:#d3d3d3; border-radius:2px; top:50%; transform:translateY(-50%); }',
        '#yf-x-fill  { position:absolute; height:4px; background:#0051A5; border-radius:2px; top:50%; transform:translateY(-50%); }',
        '#yf-x-amt-v { font-size:12px; color:#555; font-weight:600; white-space:nowrap; min-width:100px; }',
        '#yf-x-amt-clr { display:none; background:none; border:none; cursor:pointer; color:#0051A5; font-size:15px; padding:0; line-height:1; }',
        /* Deal count */
        '#yf-x-count { font-size:12px; color:#666; margin-left:8px; }',
        /* Active filter tags */
        '#yf-x-tags { display:none; font-size:12px; width:100%; text-align:left; padding-top:4px; }',
        '.yf-x-tag { display:inline-flex; align-items:center; gap:3px; background:#e8f0fb; color:#0051A5; border-radius:12px; padding:2px 10px; font-size:12px; font-weight:600; margin-right:5px; }',
        '.yf-x-tag button { background:none; border:none; cursor:pointer; color:#0051A5; font-size:14px; line-height:1; padding:0 0 0 3px; }'
      ].join('');
      document.head.appendChild(xCss);
    }

    /* -- Apply container class + base bar styles -- */
    filterBar.classList.add('container');
    filterBar.setAttribute('style',
      'background:#fff !important;' +
      'border:1px solid #d3d3d3 !important;' +
      'margin-bottom:20px !important;' +
      'padding:15px 0 !important;'
    );

    /* -- Hide legacy year controls -- */
    var dropWrap = document.getElementById('yf-drop-wrap');
    var yrLabel  = filterBar.querySelector('label');
    var clrBtn   = document.getElementById('yf-clear-btn');
    var badge    = document.getElementById('yf-count-badge');
    if (dropWrap) dropWrap.style.display = 'none';
    if (yrLabel)  yrLabel.style.display  = 'none';
    if (clrBtn)   clrBtn.style.display   = 'none';
    if (badge)    badge.style.display    = 'none';

    var inner = filterBar.firstElementChild;

    /* -- Snapshot .initial tiles -- */
    if (!self._initialSnapshot) {
      var initTiles = document.querySelectorAll('.insights-stories.initial .col-md-4');
      if (initTiles.length > 0) {
        self._initialSnapshot = Array.from(initTiles).map(function (t) { return t.innerHTML; });
      }
    }

    /* -- Helpers -- */
    var AMT_MIN = 0, AMT_MAX = 50000;

    function parseAmount(s) {
      if (!s) return null;
      s = s.replace(/&#36;/g, '').replace(/\$/g, '').replace(/,/g, '').trim();
      var m = s.match(/([\d.]+)\s*(billion|million|trillion)?/i);
      if (!m) return null;
      var n = parseFloat(m[1]), u = (m[2] || '').toLowerCase();
      return u === 'billion' ? n * 1000 : u === 'million' ? n : u === 'trillion' ? n * 1e6 : n;
    }

    function fmtAmt(v) {
      return v >= 1000 ? '$' + (v / 1000).toFixed(1).replace(/\.0$/, '') + 'B' : '$' + Math.round(v) + 'M';
    }

    function getDataRange() {
      var vals = self.items()
        .filter(function (i) { return i.status && i.status.trim().toLowerCase() === 'closed'; })
        .map(function (i) { return parseAmount(i.amount); })
        .filter(function (v) { return v !== null && isFinite(v); });
      return vals.length ? { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) } : { min: 0, max: AMT_MAX };
    }

    function getRoles() {
      var counts = {};
      self.items()
        .filter(function (i) { return i.status && i.status.trim().toLowerCase() === 'closed'; })
        .forEach(function (i) {
          if (i.role && i.role.trim()) counts[i.role.trim()] = (counts[i.role.trim()] || 0) + 1;
        });
      return Object.keys(counts)
        .map(function (r) { return { r: r, c: counts[r] }; })
        .sort(function (a, b) { return b.c - a.c; });
    }

    /* -- Filter state -- */
    var activeRole = null;

    /* -- Build DOM -- */
    ['yf-x-row', 'yf-x-tags'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.parentNode.removeChild(el);
    });

    var row = document.createElement('div');
    row.id = 'yf-x-row';

    /* Role dropdown */
    var rw = document.createElement('div'); rw.id = 'yf-x-role-wrap';
    var rb = document.createElement('button');
    rb.id = 'yf-x-role-btn'; rb.type = 'button';
    rb.innerHTML = 'Filter by Role <span class="arrow">&#9660;</span>';
    var lb = document.createElement('ul'); lb.id = 'yf-x-role-lb';
    var allLi = document.createElement('li');
    allLi.setAttribute('data-value', '');
    allLi.innerHTML = '<span style="font-style:italic;color:#555;">All roles</span>';
    lb.appendChild(allLi);
    /* Roles populated after fetch — see rebuildRoleList() */
    rw.appendChild(rb); rw.appendChild(lb);
    row.appendChild(rw);

    /* Amount slider */
    var aw = document.createElement('div'); aw.id = 'yf-x-amt-wrap';
    var al = document.createElement('span'); al.id = 'yf-x-amt-lbl'; al.textContent = 'Amount:';
    aw.appendChild(al);
    var rngWrap = document.createElement('div'); rngWrap.id = 'yf-x-rng-wrap';
    var track = document.createElement('div'); track.id = 'yf-x-track';
    var fill  = document.createElement('div'); fill.id  = 'yf-x-fill';
    var sMin  = document.createElement('input');
    sMin.type = 'range'; sMin.id = 'yf-x-smin'; sMin.min = AMT_MIN; sMin.max = AMT_MAX; sMin.value = AMT_MIN; sMin.step = 250;
    var sMax  = document.createElement('input');
    sMax.type = 'range'; sMax.id = 'yf-x-smax'; sMax.min = AMT_MIN; sMax.max = AMT_MAX; sMax.value = AMT_MAX; sMax.step = 250;
    rngWrap.appendChild(track); rngWrap.appendChild(fill); rngWrap.appendChild(sMin); rngWrap.appendChild(sMax);
    aw.appendChild(rngWrap);
    var av = document.createElement('span'); av.id = 'yf-x-amt-v';
    aw.appendChild(av);
    var ac = document.createElement('button');
    ac.id = 'yf-x-amt-clr'; ac.type = 'button'; ac.textContent = '\u2715'; ac.title = 'Clear amount filter';
    aw.appendChild(ac);
    row.appendChild(aw);

    /* Deal count — last child = right side */
    var countEl = document.createElement('span'); countEl.id = 'yf-x-count';
    row.appendChild(countEl);

    inner.appendChild(row);

    var tagsRow = document.createElement('div'); tagsRow.id = 'yf-x-tags';
    inner.appendChild(tagsRow);

    /* -- Rebuild role list after data loads -- */
    function rebuildRoleList() {
      while (lb.children.length > 1) lb.removeChild(lb.lastChild);
      getRoles().forEach(function (rObj) {
        var li = document.createElement('li'); li.setAttribute('data-value', rObj.r);
        var span = document.createElement('span'); span.textContent = rObj.r;
        var cnt  = document.createElement('span'); cnt.className = 'cnt'; cnt.textContent = rObj.c;
        li.appendChild(span); li.appendChild(cnt);
        lb.appendChild(li);
      });
    }

    /* -- updateFill -- */
    function updateFill() {
      var mn = parseInt(sMin.value, 10), mx = parseInt(sMax.value, 10);
      var range = AMT_MAX - AMT_MIN;
      fill.style.left  = ((mn - AMT_MIN) / range * 100) + '%';
      fill.style.right = ((AMT_MAX - mx)  / range * 100) + '%';
      if (mn === AMT_MIN && mx === AMT_MAX) {
        var dr = getDataRange();
        av.textContent = fmtAmt(dr.min) + ' \u2013 ' + fmtAmt(dr.max) + '+';
        av.style.color = '#555';
        ac.style.display = 'none';
      } else {
        av.textContent = fmtAmt(mn) + ' \u2013 ' + (mx >= AMT_MAX ? fmtAmt(mx) + '+' : fmtAmt(mx));
        av.style.color = '#0051A5';
        ac.style.display = '';
      }
    }

    /* -- updateTags -- */
    function updateTags() {
      tagsRow.innerHTML = '';
      var hasTags = false;
      if (activeRole) {
        hasTags = true;
        var lbl = document.createElement('span');
        lbl.style.cssText = 'color:#777;margin-right:4px;font-size:12px;'; lbl.textContent = 'Active filters:';
        tagsRow.appendChild(lbl);
        var tag = document.createElement('span'); tag.className = 'yf-x-tag'; tag.textContent = activeRole + ' ';
        var xb  = document.createElement('button'); xb.type = 'button'; xb.textContent = '\xd7'; xb.title = 'Remove role filter';
        xb.onclick = function () { activeRole = null; rb.innerHTML = 'Filter by Role <span class="arrow">&#9660;</span>'; applyFilters(); updateTags(); };
        tag.appendChild(xb); tagsRow.appendChild(tag);
      }
      var mn = parseInt(sMin.value, 10), mx = parseInt(sMax.value, 10);
      if (mn > AMT_MIN || mx < AMT_MAX) {
        if (!hasTags) {
          hasTags = true;
          var lbl2 = document.createElement('span');
          lbl2.style.cssText = 'color:#777;margin-right:4px;font-size:12px;'; lbl2.textContent = 'Active filters:';
          tagsRow.appendChild(lbl2);
        }
        var tag2 = document.createElement('span'); tag2.className = 'yf-x-tag';
        tag2.textContent = 'Amount: ' + fmtAmt(mn) + ' \u2013 ' + (mx >= AMT_MAX ? fmtAmt(mx) + '+' : fmtAmt(mx)) + ' ';
        var xb2 = document.createElement('button'); xb2.type = 'button'; xb2.textContent = '\xd7'; xb2.title = 'Remove amount filter';
        xb2.onclick = function () { sMin.value = AMT_MIN; sMax.value = AMT_MAX; updateFill(); applyFilters(); updateTags(); };
        tag2.appendChild(xb2); tagsRow.appendChild(tag2);
      }
      tagsRow.style.display = hasTags ? 'block' : 'none';
    }

    /* -- applyFilters -- */
    function applyFilters() {
      var role = activeRole;
      var mn   = parseInt(sMin.value, 10);
      var mx   = parseInt(sMax.value, 10);
      var hasFilter = role !== null || mn > AMT_MIN || mx < AMT_MAX;

      var initCont = document.querySelector('.insights-stories.initial');
      var koCont   = document.querySelector('.insights-stories.ko');
      var lmEl     = document.getElementById('load-more');

      if (!hasFilter) {
        if (initCont) initCont.style.display = '';
        if (koCont)   koCont.style.display   = 'none';
        if (lmEl)     lmEl.style.removeProperty('display');
        countEl.textContent = 'Showing recent deals';
        updateTags();
        return;
      }

      if (initCont) initCont.style.display = 'none';
      if (koCont) { koCont.style.display = ''; var kr = koCont.querySelector('.container .row'); if (kr) kr.style.marginTop = ''; }
      if (lmEl) lmEl.style.display = 'none';
      if (self.show() === 0) self.show(9);
      self.show(self.items().length

      self.topics([]); self.pubs([]); self.authors([]);

      setTimeout(function () {
        var koCont2 = document.querySelector('.insights-stories.ko');
        if (koCont2) { var kr2 = koCont2.querySelector('.container .row'); if (kr2) kr2.style.marginTop = ''; }

        var tiles = Array.from(document.querySelectorAll('.insights-stories.ko .col-md-4'));
        var vis = 0;

        tiles.forEach(function (tile) {
          var dateEl = tile.querySelector('.deal-date');
          if (!dateEl) { tile.style.display = 'none'; return; }

          /* Only closed deals */
          if (tile.textContent.indexOf('Pending') !== -1) { tile.style.display = 'none'; return; }

          /* Role filter — read from KO-rendered span */
          var tileRole = '';
          tile.querySelectorAll('span').forEach(function (sp) {
            var b = sp.getAttribute('data-bind') || '';
            if (b === 'html: role' || b.indexOf('html: role') !== -1) tileRole = sp.textContent.trim();
          });
          if (role !== null && tileRole !== role) { tile.style.display = 'none'; return; }

          /* Amount filter */
          if (mn > AMT_MIN || mx < AMT_MAX) {
            var amtSpans = Array.from(tile.querySelectorAll('span')).filter(function (s) {
              return (s.getAttribute('data-bind') || '').indexOf('amount') !== -1;
            });
            var rawAmt    = amtSpans.length ? amtSpans[0].textContent : '';
            var parsedAmt = parseAmount(rawAmt);
            if (parsedAmt === null) { tile.style.display = 'none'; return; }
            var capped = Math.min(parsedAmt, AMT_MAX);
            if (capped < mn || capped > mx) { tile.style.display = 'none'; return; }
          }

          tile.style.display = ''; vis++;
        });

        countEl.textContent = vis + ' deal' + (vis !== 1 ? 's' : '') + ' match' + (vis === 1 ? 'es' : '');
        var koCont3 = document.querySelector('.insights-stories.ko');
        if (koCont3) { var kr3 = koCont3.querySelector('.container .row'); if (kr3) kr3.style.marginTop = ''; }
        updateTags();
      }, 200);
    }

    /* -- Role dropdown events -- */
    function openRD() {
      lb.style.display = 'block';
      rb.setAttribute('aria-expanded', 'true');
      var ar = rb.querySelector('.arrow'); if (ar) ar.style.transform = 'rotate(180deg)';
      lb.querySelectorAll('li').forEach(function (li) {
        li.className = li.getAttribute('data-value') === (activeRole || '') ? 'active' : '';
      });
    }
    function closeRD() {
      lb.style.display = 'none';
      rb.setAttribute('aria-expanded', 'false');
      var ar = rb.querySelector('.arrow'); if (ar) ar.style.transform = '';
    }

    rb.addEventListener('click', function (e) {
      e.stopPropagation();
      lb.style.display === 'none' ? openRD() : closeRD();
    });

    lb.addEventListener('click', function (e) {
      var li = e.target.closest('li'); if (!li) return;
      var v  = li.getAttribute('data-value') || null;
      activeRole = v;
      rb.innerHTML = (v
        ? '<span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle;">' + v + '</span>'
        : 'Filter by Role') + ' <span class="arrow">&#9660;</span>';
      closeRD();
      applyFilters();
    });

    document.addEventListener('click', function (e) {
      if (!rw.contains(e.target)) closeRD();
    }, true);

    /* -- Slider events -- */
    sMin.addEventListener('input', function () {
      if (+sMin.value > +sMax.value) sMin.value = sMax.value;
      updateFill();
    });
    sMax.addEventListener('input', function () {
      if (+sMax.value < +sMin.value) sMax.value = sMin.value;
      updateFill();
    });
    sMin.addEventListener('change', applyFilters);
    sMax.addEventListener('change', applyFilters);

    ac.addEventListener('click', function () {
      sMin.value = AMT_MIN; sMax.value = AMT_MAX;
      updateFill(); applyFilters();
    });

    /* -- Sticky behaviour -- */
    var STICKY_TOP = 60;
    var topSentinel = document.createElement('div');
    topSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    filterBar.parentNode.insertBefore(topSentinel, filterBar);

    var bottomSentinel = document.createElement('div');
    bottomSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    var sc = document.querySelector('.insights-stories.initial') || document.querySelector('.insights-stories.ko');
    if (sc) sc.appendChild(bottomSentinel);

    var isSticky = false;
    function makeSticky() {
      if (isSticky) return; isSticky = true;
      filterBar.classList.remove('container');
      filterBar.setAttribute('style',
        'background:#fff !important;border-bottom:1px solid #d3d3d3 !important;' +
        'margin:0 !important;padding:15px 0 !important;' +
        'position:fixed;top:' + STICKY_TOP + 'px;left:0;right:0;z-index:500;' +
        'box-shadow:0 2px 8px rgba(0,0,0,0.1);'
      );
    }
    function makeNormal() {
      if (!isSticky) return; isSticky = false;
      filterBar.classList.add('container');
      filterBar.setAttribute('style',
        'background:#fff !important;border:1px solid #d3d3d3 !important;' +
        'margin-bottom:20px !important;padding:15px 0 !important;'
      );
    }
    function onScroll() {
      var t = topSentinel.getBoundingClientRect(), b = bottomSentinel.getBoundingClientRect(), h = filterBar.offsetHeight || 70;
      (t.top < STICKY_TOP && b.top > STICKY_TOP + h) ? makeSticky() : makeNormal();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* -- Fetch data, then populate role list + init display -- */
    self.fetchYear(self.year);
    /* updateFill + applyFilters called after fetch populates items via buildDropdownOptions hook */
    var _origBuildDropdown = buildDropdownOptions;
    buildDropdownOptions = function () {
      _origBuildDropdown();
      rebuildRoleList();
      updateFill();
      applyFilters();
      /* Only run once */
      buildDropdownOptions = _origBuildDropdown;
    };
  };

} /* end FormViewModel */

/* --- DOM Ready --- */
$(document).ready(function () {

  $('.insights-dropdown-toggle').on({
    click: function (e) { $(this).toggleClass('active'); $(this).next('.insights-dropdown-items').toggleClass('active').focus(); e.preventDefault(); },
    focusout: function () { $(this).next('.insights-dropdown-items').data('menuTimeout', setTimeout(function () { $(this).removeClass('active'); $(this).next('.insights-dropdown-items').removeClass('active'); }.bind(this), 100)); },
    focusin:  function () { clearTimeout($(this).next('.insights-dropdown-items').data('menuTimeout')); }
  });

  $('.insights-dropdown-items').on({
    focusout: function () { $(this).data('menuTimeout', setTimeout(function () { $(this).removeClass('active'); $(this).prev('.insights-dropdown-toggle').removeClass('active'); }.bind(this), 100)); },
    focusin:  function () { clearTimeout($(this).data('menuTimeout')); },
    keydown:  function (e) { if (e.which === 27) { $(this).removeClass('active'); $(this).prev('.insights-dropdown-toggle').removeClass('active'); e.preventDefault(); } }
  });

  $('.insights-dropdown-items label').on({
    click:   function (e) { $(this).focus(); clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    focusin: function ()  { clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    keydown: function (e) { if (e.which === 27) { $(this).parent('.insights-dropdown-items').removeClass('active'); $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active'); e.preventDefault(); } }
  });

  $('.insights-dropdown-items input').change(function () { clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); });

  $('#search-categories-list .category').on({
    click:   function (e) { $('#search-categories-list .category').removeClass('active'); $('#insights-search-bar #search').val(''); $(this).toggleClass('active').focus(); clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    focusin: function ()  { clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    keydown: function (e) { if (e.which === 27) { $(this).parent('.insights-dropdown-items').removeClass('active'); $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active'); e.preventDefault(); } }
  });

  $('#insights-search-bar input').change(function () { $('#search-categories-list li').removeClass('active'); });
  $('#clear-search').on('click', function () { $('#search-categories-list .category').removeClass('active'); });

  ko.bindingHandlers.dateString = {
    init: function (element, valueAccessor) {
      element.onchange = function () { var value = valueAccessor(); value(formatDate(element.value).toDate()); };
    },
    update: function (element, valueAccessor) {
      var value = valueAccessor(), v = ko.utils.unwrapObservable(value);
      if (v) element.innerHTML = formatDate(v);
    }
  };

  var model;
  if (location.hash !== '') {
    model = new FormViewModel(parseInt(location.hash.replace('#', '')));
    ko.applyBindings(model);
  } else {
    model = new FormViewModel(0);
    ko.applyBindings(model);
    if (getQueryValue('author'))     { model.selectFromURL(null, getURLtag('author')); }
    else if (getQueryValue('tag'))   { model.selectFromURL(getURLtag('tag'), null); }
  }

  model.initFilterBar();

  var topics = getUrlParameter('t');
  if (topics !== undefined) {
    var t_arr = topics.split(',');
    $.each(t_arr, function (key, value) { $("input[value='" + $.trim(value) + "']").click(); });
  }

  $('#ls-row-3-area-1 .story-tiles > .row').slick({ dots: true });
  $('button.slick-autoplay-toggle-button').css('display', 'none');
});