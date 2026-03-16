var lmScroll = 0;

/* ─── Utility helpers ─── */

function setPage(state) {
  if (state !== 0) {
    if (history.pushState) {
      history.pushState(null, null, '#' + Math.ceil(state));
    } else {
      location.hash = '#' + Math.ceil(state);
    }
  }
}

function getQueryValue(variable) {
  var query = location.search.substring(1);
  if (query.indexOf('=') > -1) {
    var vars = [query];
  } else {
    return false;
  }
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

/* ─── KO ViewModel ─── */

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

  self._initialSnapshot = null;
  self._initialConsumed = false;

  // CHANGE: snapshot .initial tiles immediately at ViewModel construction,
  // before the show()>9 block below can remove .initial from the DOM
  (function () {
    var initialContainer = document.querySelector('.insights-stories.initial');
    if (initialContainer) {
      var tileCols = Array.from(initialContainer.querySelectorAll('.col-md-4'));
      self._initialSnapshot = tileCols.map(function (c) { return c.outerHTML; }).join('');
    }
  })();

  self.filteredItems = ko.computed(function () {
    self.notify();
    if (self.topics().length === 0 && self.pubs().length === 0 &&
        self.authors().length === 0 && self.query().length === 0) {
      return self.items();
    } else {
      return ko.utils.arrayFilter(self.items(), function (item) {
        var tmatch = false, pmatch = false, amatch = false;
        if (self.pubs().length > 0) {
          $.each(self.pubs(), function (k, v) {
            if (item.title.toLowerCase().indexOf(v.toLowerCase()) != -1) pmatch = true;
          });
        } else { pmatch = true; }
        if (self.authors().length > 0) {
          $.each(self.authors(), function (k, v) {
            if (item.author !== undefined &&
                item.author.toString().toLowerCase().indexOf(v.toLowerCase()) != -1) amatch = true;
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
                if (self.topics().filter(function(t){ return t.toLowerCase().indexOf($.trim(v.toLowerCase())) !== -1; })[0] !== undefined ||
                    self.topics().filter(function(t){ return $.trim(v.toLowerCase()).indexOf(t.toLowerCase()) !== -1; })[0] !== undefined) {
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

  /* ── Year filter helpers ── */

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
    return Object.keys(seen).sort().reverse().map(function (y) {
      return { year: y, count: seen[y] };
    });
  }

  /* ── doFilter: show/hide KO tiles by year ── */

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

  // CHANGE: reset all KO tiles to visible then hide anything older than 2024
  function showRecentTilesOnly() {
    var koContainer = document.querySelector('.insights-stories.ko');
    if (!koContainer) return;
    Array.from(koContainer.querySelectorAll('.col-md-4'))
      .filter(function (c) { return c.querySelector('.deal-date'); })
      .forEach(function (c) {
        var yr = parseInt((c.querySelector('.deal-date').textContent || '').trim().split(' ').pop(), 10);
        c.style.display = (yr && yr < 2024) ? 'none' : '';
      });
  }

  // CHANGE: rebuild .initial with correct DOM structure from snapshot
  function buildInitialFromSnapshot() {
    if (!self._initialSnapshot) return null;
    var wrapper = document.createElement('div');
    wrapper.className = 'insights-stories initial';
    var tombstonesWrap = document.createElement('div');
    tombstonesWrap.className = 'tombstones-wrap';
    tombstonesWrap.style.marginTop = '20px';
    var container = document.createElement('div');
    container.className = 'container';
    var row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = self._initialSnapshot;
    container.appendChild(row);
    tombstonesWrap.appendChild(container);
    wrapper.appendChild(tombstonesWrap);
    return wrapper;
  }

  /* ── restoreInitialSnapshot (kept for internal use) ── */

  function restoreInitialSnapshot() {
    var koContainer = document.querySelector('.insights-stories.ko');
    if (!koContainer || !self._initialSnapshot) return;
    var templateComment = null;
    koContainer.childNodes.forEach(function (node) {
      if (node.nodeType === 8) { templateComment = node; }
    });
    koContainer.innerHTML = '';
    if (templateComment) { koContainer.appendChild(templateComment); }
    koContainer.insertAdjacentHTML('beforeend', self._initialSnapshot);
  }

  /* ── Dropdown ── */

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
      li.style.cssText = [
        'display:flex', 'justify-content:space-between', 'align-items:center',
        'padding:9px 14px', 'cursor:pointer',
        'font-family:Fira,"Lucida Grande",Verdana,sans-serif', 'font-size:14px',
        'color:'       + (isActive ? '#0051A5' : '#333'),
        'background:'  + (isActive ? '#e8f0fb' : '#fff'),
        'font-weight:' + (isActive ? '600'     : '400'),
        'outline:none', 'user-select:none'
      ].join(';') + ';';
      var yLabel = document.createElement('span'); yLabel.textContent = y; yLabel.style.pointerEvents = 'none';
      var cnt = document.createElement('span'); cnt.textContent = yObj.count;
      cnt.style.cssText = 'margin-left:12px;font-size:12px;color:#fff;background:#0051A5;' +
        'padding:2px 8px;border-radius:10px;font-weight:600;min-width:22px;text-align:center;pointer-events:none;';
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

  /* ── applyYearFilter ── */

  self.applyYearFilter = function (year) {
    self.activeYear(year);

    var initialContainer = document.querySelector('.insights-stories.initial');
    var koContainer      = document.querySelector('.insights-stories.ko');
    var lmBtn            = document.getElementById('load-more');
    var clearBtn         = document.getElementById('yf-clear-btn');

    if (year === null) {
      // CHANGE: clear filter — rebuild .initial from snapshot with correct structure,
      // hide .ko, restore load-more, hide clear btn
      if (!initialContainer && self._initialSnapshot) {
        var rebuilt = buildInitialFromSnapshot();
        if (koContainer && rebuilt) koContainer.parentNode.insertBefore(rebuilt, koContainer);
        initialContainer = rebuilt;
        self._initialConsumed = false;
      }
      if (initialContainer) {
        initialContainer.style.display = '';
        Array.from(initialContainer.querySelectorAll('.col-md-4'))
          .forEach(function (c) { c.style.display = ''; });
      }
      if (koContainer) koContainer.style.display = 'none';
      if (lmBtn)    lmBtn.style.removeProperty('display');
      if (clearBtn) clearBtn.style.display = 'none';
      self.updateYearUI();
      return;
    }

    // CHANGE: year selected — hide .initial, show .ko, hide load-more, show clear btn
    if (initialContainer) initialContainer.style.display = 'none';
    if (koContainer) koContainer.style.display = '';
    if (lmBtn)    lmBtn.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'inline';

    if (initialContainer) {
      $('.initial').remove();
      self._initialConsumed = true;
      if (self.show() === 0) { self.show(9); }
      self.notify.notifySubscribers();
      setTimeout(function () {
        doFilter(year);
        self.updateYearUI();
      }, 100);
    } else {
      doFilter(year);
      self.updateYearUI();
    }
  };

  self.updateYearUI = function () {
    var year    = self.activeYear();
    var db      = document.getElementById('yf-drop-btn');
    var badge   = document.getElementById('yf-count-badge');
    var clear   = document.getElementById('yf-clear-btn');
    var arrowEl = document.getElementById('yf-arrow');
    if (badge) {
      if (year === null) {
        badge.textContent = 'Showing 6 most recent deals';
      } else {
        var n = self.items().filter(function (i) { return getItemYear(i) === year; }).length;
        badge.textContent = 'Showing ' + n + ' deal' + (n !== 1 ? 's' : '') + ' from ' + year;
      }
    }
    if (db) { var arHTML = arrowEl ? arrowEl.outerHTML : ''; db.innerHTML = (year ? year : 'Select year&hellip;') + arHTML; }
    if (clear) clear.style.display = year !== null ? 'inline' : 'none';
    buildDropdownOptions();
  };

  /* ── Standard KO action methods — unchanged ── */

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
    self.loadContent(); self.query('');
    self.topics(tag ? [tag] : []); self.pubs([]);
    self.authors(author ? [author] : []);
    self.notify.notifySubscribers();
  };
  self.loadContent = function () {
    var scroll = $(window).scrollTop();
    if (self.show() === 0) self.show(9);
    if (self.items().length < 1) {
      $('.initial').remove();
      self.fetchYear(self.year); $(window).scrollTop(scroll);
    }
  };

  /* ── fetchYear — unchanged, loads ALL items so dropdown shows all years ── */

  self.fetchYear = function (y) {
    $.ajax({
      url: 'transactions/data/deals.page', dataType: 'xml', cache: true,
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
            item.description = item.description.substring(0, item.description.substring(0,130).lastIndexOf(' ')) + '...';
            if (item.description.charAt(item.description.length-1) == ',')
              item.description = item.description.substring(0, item.description.length-1);
          }
          item.role      = $(this).find('role').text();
          item.status    = $(this).find('status').text();
          item.amount    = $(this).find('amount').text();
          item.region    = $(this).find('region').text();
          item.specialty = $(this).find('specialty').text();
          self.items().push(item);
        });
        if (self._userTriggered) {
          self._userTriggered = false;
          if ($('.initial').length > 0) $('.initial').remove();
          self.notify.notifySubscribers();
          var cur = self.activeYear();
          if (cur !== null) {
            setTimeout(function () { self.applyYearFilter(cur); }, 100);
          }
        }
        buildDropdownOptions();
        $(window).scrollTop(lmScroll);
      }
    });
  };

  /* ── loadMore ── */

  self.loadMore = function () {
    lmScroll = $(window).scrollTop();
    setTimeout(function () {
      if (self.items().length < 1) {
        self._userTriggered = true;
        self.fetchYear(self.year);
        return;
      }
      // CHANGE: show .ko, remove .initial
      var koContainer = document.querySelector('.insights-stories.ko');
      if (koContainer) koContainer.style.display = '';
      $('.initial').remove();
      self._initialConsumed = true;
      if (self.show() === 0) { self.show(18); } else { self.show(self.show() + 6); }
      self.notify.notifySubscribers();
      // CHANGE: no setPage() — no hash added to URL
      // CHANGE: hide load-more, show clear filter
      var lmBtn    = document.getElementById('load-more');
      var clearBtn = document.getElementById('yf-clear-btn');
      if (lmBtn)    lmBtn.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'inline';
      setTimeout(function () {
        if (self.activeYear() !== null) {
          self.applyYearFilter(self.activeYear());
        } else {
          // CHANGE: reset all tiles then hide pre-2024
          showRecentTilesOnly();
        }
        // CHANGE: scroll to filter bar instead of lmScroll position
        var filterBar = document.getElementById('yf-filter-bar');
        if (filterBar) {
          $('html, body').animate({ scrollTop: $(filterBar).offset().top }, 0);
        }
      }, 100);
    }, 50);
  };

  if (self.show() > 9) {
    $('.initial').remove();
    self._initialConsumed = true;
    setTimeout(function () {
      if (self.items().length < 1 && getUrlParameter('t') === undefined) {
        self._userTriggered = true;
        self.fetchYear(self.year);
      }
      // CHANGE: no setPage() — no hash added to URL
    }, 50);
  }

  /* ── initFilterBar ── */

  self.initFilterBar = function () {
    var filterBar = document.getElementById('yf-filter-bar');
    if (!filterBar) return;

    var dropBtn  = document.getElementById('yf-drop-btn');
    var dropWrap = document.getElementById('yf-drop-wrap');
    var listbox  = document.getElementById('yf-listbox');
    var badge    = document.getElementById('yf-count-badge');
    var clearBtn = document.getElementById('yf-clear-btn');

    if (!dropBtn || !listbox || !badge || !clearBtn) return;

    // CHANGE: hide badge without removing from DOM
    badge.style.display = 'none';

    // CHANGE: filter bar padding and label margin
    filterBar.style.padding = '15px 0px';
    var filterLabel = filterBar.querySelector('label');
    if (filterLabel) filterLabel.style.marginBottom = '0';

    // Snapshot — use the one captured at ViewModel construction if available
    if (!self._initialSnapshot) {
      var initialContainer = document.querySelector('.insights-stories.initial');
      if (initialContainer) {
        var tileCols = Array.from(initialContainer.querySelectorAll('.col-md-4'));
        self._initialSnapshot = tileCols.map(function (c) { return c.outerHTML; }).join('');
      }
    }

    badge.textContent = 'Showing 6 most recent deals';

    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      listbox.style.display === 'none' ? openDropdown() : closeDropdown();
    });
    dropBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDropdown(); }
    });
    listbox.addEventListener('keydown', function (e) {
      var opts = Array.from(listbox.querySelectorAll('[role="option"]')), idx = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown')      { e.preventDefault(); opts[(idx+1) % opts.length].focus(); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); opts[(idx-1+opts.length) % opts.length].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var v = document.activeElement.getAttribute('data-value'); if (v) { closeDropdown(); self.applyYearFilter(v); } }
      else if (e.key === 'Escape')    { closeDropdown(); }
    });
    document.addEventListener('click', function (e) {
      if (dropWrap && !dropWrap.contains(e.target)) closeDropdown();
    }, true);

    clearBtn.addEventListener('click', function () { self.applyYearFilter(null); });

    // Sticky
    var placeholder  = document.getElementById('yf-sticky-placeholder');
    var STICKY_TOP   = 60;
    var topSentinel  = document.createElement('div');
    topSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    filterBar.parentNode.insertBefore(topSentinel, filterBar);

    var bottomSentinel = document.createElement('div');
    bottomSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    var sc = document.querySelector('.insights-stories.initial') || document.querySelector('.insights-stories.ko');
    if (sc) sc.appendChild(bottomSentinel);

    var isSticky = false;
    function makeSticky() { if (isSticky) return; isSticky = true; if (placeholder) { placeholder.style.height = filterBar.offsetHeight + 'px'; placeholder.style.display = 'block'; } filterBar.style.cssText = 'position:fixed;top:' + STICKY_TOP + 'px;left:0;right:0;z-index:500;background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;padding:15px 0px;box-shadow:0 2px 8px rgba(0,0,0,0.1);'; }
    function makeNormal() { if (!isSticky) return; isSticky = false; if (placeholder) placeholder.style.display = 'none'; filterBar.style.cssText = 'background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;padding:15px 0px;'; }
    function onScroll() { var t = topSentinel.getBoundingClientRect(), b = bottomSentinel.getBoundingClientRect(), h = filterBar.offsetHeight || 70; if (t.top < STICKY_TOP && b.top > STICKY_TOP + h) { makeSticky(); } else { makeNormal(); } }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    self.fetchYear(self.year);
  };

}

/* ─── DOM Ready ─── */

$(document).ready(function () {
  $('#load-more').hide();

  $('.insights-dropdown-toggle').on({
    click:    function (e) { $(this).toggleClass('active'); $(this).next('.insights-dropdown-items').toggleClass('active').focus(); e.preventDefault(); },
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
    focusin: function () { clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    keydown: function (e) { if (e.which === 27) { $(this).parent('.insights-dropdown-items').removeClass('active'); $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active'); e.preventDefault(); } }
  });
  $('.insights-dropdown-items input').change(function () {
    clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
  });
  $('#search-categories-list .category').on({
    click:   function (e) { $('#search-categories-list .category').removeClass('active'); $('#insights-search-bar #search').val(''); $(this).toggleClass('active').focus(); clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    focusin: function () { clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout')); },
    keydown: function (e) { if (e.which === 27) { $(this).parent('.insights-dropdown-items').removeClass('active'); $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active'); e.preventDefault(); } }
  });
  $('#insights-search-bar input').change(function () { $('#search-categories-list li').removeClass('active'); });
  $('#clear-search').on('click', function () { $('#search-categories-list .category').removeClass('active'); });

  ko.bindingHandlers.dateString = {
    init:   function (element, valueAccessor) { element.onchange = function () { var value = valueAccessor(); value(formatDate(element.value).toDate()); }; },
    update: function (element, valueAccessor) { var value = valueAccessor(), v = ko.utils.unwrapObservable(value); if (v) element.innerHTML = formatDate(v); }
  };

  var model;
  if (location.hash !== '') {
    model = new FormViewModel(parseInt(location.hash.replace('#', '')));
    ko.applyBindings(model);
  } else {
    model = new FormViewModel(0);
    ko.applyBindings(model);
    if (getQueryValue('author')) { model.selectFromURL(null, getURLtag('author')); }
    else if (getQueryValue('tag')) { model.selectFromURL(getURLtag('tag'), null); }
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