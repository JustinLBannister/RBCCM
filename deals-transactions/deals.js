var lmScroll = 0;
/* ─── Year-Filter constants ─── */
var STICKY_TOP    = 60;
var DEFAULT_COUNT = 6;
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
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}
function getURLtag(tag) {
  var init_tag = getQueryValue(tag);
  if (init_tag) {
    return init_tag
      .replace(/%20/g, ' ')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  } else {
    return '';
  }
}
/* ─── KO ViewModel ─── */
function FormViewModel(page) {
  var self = this;
  self.show = ko.observable(9 + page * 6);
  self.items = ko.observableArray();
  self.topics = ko
    .observableArray()
    .extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' } });
  self.pubs    = ko.observableArray();
  self.authors = ko.observableArray();
  self.notify  = ko.observable();
  self.loaded  = ko.observable(false);
  self.loading = ko.observable(false);
  self.year    = new Date().getFullYear();
  self.fronly  = ko.observable(false);
  /* ── active year filter (null = no filter / show most-recent 6) ── */
  self.activeYear = ko.observable(null);
  self.query = ko
    .observable('')
    .extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' } });
  /* ── base filtered list (topics / pubs / authors / query) ── */
  self.filteredItems = ko.computed(function () {
    self.notify();
    if (
      self.topics().length  === 0 &&
      self.pubs().length    === 0 &&
      self.authors().length === 0 &&
      self.query().length   === 0
    ) {
      return self.items();
    } else {
      return ko.utils.arrayFilter(self.items(), function (item) {
        var tmatch = false;
        var pmatch = false;
        var amatch = false;
        // ── title filter ──
        if (self.pubs().length > 0) {
          $.each(self.pubs(), function (key, value) {
            if (item.title.toLowerCase().indexOf(value.toLowerCase()) != -1) {
              pmatch = true;
            }
          });
        } else {
          pmatch = true;
        }
        // ── author filter ──
        if (self.authors().length > 0) {
          $.each(self.authors(), function (key, value) {
            if (item.author !== undefined) {
              if (
                item.author.toString().toLowerCase()
                  .indexOf(value.toLowerCase()) != -1
              ) {
                amatch = true;
              }
            }
          });
        } else {
          amatch = true;
        }
        // ── topic / category / tag filter ──
        if (self.topics().length > 0) {
          var itemTopics;
          if (item.tags !== undefined) {
            var itemTags = item.tags.split(',');
            if (item.category !== undefined) {
              var itemCategories = item.category.split(',');
              itemTopics = itemTags.concat(itemCategories);
            }
          } else if (item.category !== undefined && itemTopics === undefined) {
            itemTopics = item.category.split(',');
          }
          $.each(itemTopics, function (key, value) {
            if ($.trim(value)) {
              if (
                self.topics().filter(function (item) {
                  return item.toLowerCase().indexOf($.trim(value.toLowerCase())) !== -1;
                })[0] !== undefined ||
                self.topics().filter(function (item) {
                  return $.trim(value.toLowerCase()).indexOf(item.toLowerCase()) !== -1;
                })[0] !== undefined
              ) {
                tmatch = true;
              }
            }
          });
        } else {
          tmatch = true;
        }
        if (self.query()) {
          return tmatch || pmatch || amatch;
        }
        return tmatch && pmatch && amatch;
      });
    }
  });
  /* ── year-aware display list ─────────────────────────────────────
     • activeYear = null  → show most-recent DEFAULT_COUNT (6) items
     • activeYear = "YYYY" → show all items whose date contains that year
     • Respects self.show() for "Load More" paging when no year is set
  ──────────────────────────────────────────────────────────────── */
  self.displayItems = ko.computed(function () {
    var base = self.filteredItems();
    var year = self.activeYear();
    if (year !== null) {
      // Return every item whose date string contains the selected year.
      // Items from years after 2024 are excluded when no year is selected
      // but are still reachable via the dropdown.
      return ko.utils.arrayFilter(base, function (item) {
        return item.date && item.date.indexOf(year) !== -1;
      });
    }
    // No year selected: show most-recent DEFAULT_COUNT, excluding post-2024
    var cutoff = base.filter(function (item) {
      var y = item.date ? parseInt(item.date.split(',')[1]) : 0;
      return y <= 2024;
    });
    return cutoff.slice(0, self.show());
  });
  /* ── available years for the dropdown (derived from loaded items) ── */
  self.availableYears = ko.computed(function () {
    self.notify();
    var seen   = {};
    var years  = [];
    self.filteredItems().forEach(function (item) {
      var y = item.date ? item.date.split(',')[1] : null;
      if (y) {
        y = y.trim();
        if (!seen[y]) { seen[y] = 0; }
        seen[y]++;
      }
    });
    Object.keys(seen).sort().reverse().forEach(function (y) {
      years.push({ year: y, count: seen[y] });
    });
    return years;
  });
  /* ── year filter actions ── */
  self.selectYear = function (yearObj) {
    self.activeYear(yearObj.year);
    self.updateYearUI();
  };
  self.clearYear = function () {
    self.activeYear(null);
    self.updateYearUI();
  };
  /* ── update the static DOM filter-bar UI to match KO state ── */
  self.updateYearUI = function () {
    var year    = self.activeYear();
    var visible = self.displayItems().length;
    var dropBtn = document.getElementById('yf-drop-btn');
    var badge   = document.getElementById('yf-count-badge');
    var clearBtn = document.getElementById('yf-clear-btn');
    var arrowEl = document.getElementById('yf-arrow');
    if (dropBtn) {
      var arrowHTML = arrowEl ? arrowEl.outerHTML : '';
      dropBtn.innerHTML = (year ? year : 'Select year&hellip;') + arrowHTML;
    }
    if (badge) {
      badge.textContent = year === null
        ? 'Showing ' + visible + ' most recent deal' + (visible !== 1 ? 's' : '')
        : 'Showing ' + visible + ' deal' + (visible !== 1 ? 's' : '') + ' from ' + year;
    }
    if (clearBtn) {
      clearBtn.style.display = year !== null ? 'inline' : 'none';
    }
    buildDropdownOptions();
  };
  /* ── rebuild dropdown <li> options ── */
  function buildDropdownOptions() {
    var listbox = document.getElementById('yf-listbox');
    if (!listbox) return;
    var activeYear = self.activeYear();
    listbox.innerHTML = '';
    self.availableYears().forEach(function (yObj) {
      var y        = yObj.year;
      var isActive = activeYear === y;
      var li = document.createElement('li');
      li.setAttribute('role',         'option');
      li.setAttribute('data-value',   y);
      li.setAttribute('tabindex',     '-1');
      li.setAttribute('aria-selected', isActive ? 'true' : 'false');
      li.style.cssText = [
        'display:flex', 'justify-content:space-between', 'align-items:center',
        'padding:9px 14px', 'cursor:pointer',
        'font-family:Fira,"Lucida Grande",Verdana,sans-serif', 'font-size:14px',
        'color:'       + (isActive ? '#0051A5' : '#333'),
        'background:'  + (isActive ? '#e8f0fb' : '#fff'),
        'font-weight:' + (isActive ? '600'     : '400'),
        'outline:none', 'user-select:none'
      ].join(';') + ';';
      var yLabel = document.createElement('span');
      yLabel.textContent   = y;
      yLabel.style.pointerEvents = 'none';
      var cnt = document.createElement('span');
      cnt.textContent  = yObj.count;
      cnt.style.cssText = 'margin-left:12px;font-size:12px;color:#fff;background:#0051A5;' +
        'padding:2px 8px;border-radius:10px;font-weight:600;min-width:22px;' +
        'text-align:center;pointer-events:none;';
      li.appendChild(yLabel);
      li.appendChild(cnt);
      li.addEventListener('mouseover', function () {
        if (self.activeYear() !== y) li.style.background = '#f0f6ff';
      });
      li.addEventListener('mouseout', function () {
        li.style.background = self.activeYear() === y ? '#e8f0fb' : '#fff';
      });
      li.addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); });
      li.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        closeDropdown();
        self.selectYear(yObj);
      });
      listbox.appendChild(li);
    });
  }
  /* ── dropdown open / close ── */
  function openDropdown() {
    var listbox  = document.getElementById('yf-listbox');
    var dropBtn  = document.getElementById('yf-drop-btn');
    var arrowEl  = document.getElementById('yf-arrow');
    if (!listbox) return;
    buildDropdownOptions();
    listbox.style.display = 'block';
    dropBtn.setAttribute('aria-expanded', 'true');
    if (arrowEl) arrowEl.style.transform = 'translateY(-50%) rotate(180deg)';
    var sel = listbox.querySelector('[aria-selected="true"]') || listbox.querySelector('[role="option"]');
    if (sel) setTimeout(function () { sel.focus(); }, 10);
  }
  function closeDropdown() {
    var listbox = document.getElementById('yf-listbox');
    var dropBtn = document.getElementById('yf-drop-btn');
    var arrowEl = document.getElementById('yf-arrow');
    if (!listbox) return;
    listbox.style.display = 'none';
    dropBtn.setAttribute('aria-expanded', 'false');
    if (arrowEl) arrowEl.style.transform = 'translateY(-50%) rotate(0deg)';
  }
  /* ── KO action methods ── */
  self.selectNoTopics = function () {
    self.show(9);
    self.query('');
    self.topics([]);
    self.pubs([]);
    self.authors([]);
    self.notify.notifySubscribers();
  };
  self.selectTopic = function (t) {
    self.show(0);
    self.loadContent();
    self.query('');
    self.topics(t);
    self.pubs([]);
    self.authors([]);
    self.notify.notifySubscribers();
    $('.initial').remove();
    self.show(9);
  };
  self.selectAuthor = function (a) {
    self.show(0);
    self.loadContent();
    self.query('');
    self.topics([]);
    self.pubs([]);
    self.authors([a]);
    self.notify.notifySubscribers();
    $('.initial').remove();
    self.show(9);
  };
  self.query.subscribe(function () {
    self.loadContent();
    var q = self.query();
    self.topics([q]);
    self.pubs([q]);
    self.authors([q]);
    self.notify.notifySubscribers();
    $('#clear-search').show();
  });
  self.resetQuery = function () {
    self.loadContent();
    self.query('');
    self.topics([]);
    self.pubs([]);
    self.authors([]);
    self.notify.notifySubscribers();
    $('#clear-search').hide();
  };
  self.selectFromURL = function (tag, author) {
    self.loadContent();
    self.query('');
    self.topics(tag ? [tag] : []);
    self.pubs([]);
    self.authors(author ? [author] : []);
    self.notify.notifySubscribers();
  };
  self.loadContent = function () {
    var scroll = $(window).scrollTop();
    if (self.show() === 0) { self.show(9); }
    if (self.items().length < 1) {
      $('.initial').remove();
      $('#load-more').text('Loading...');
      self.fetchYear(self.year);
      $(window).scrollTop(scroll);
    } else {
      $('#load-more').text('Load More');
    }
  };
  self.fetchYear = function (y) {
    $.ajax({
      url: 'transactions/data/deals.page',
      dataType: 'xml',
      cache: true,
      success: function (data) {
        var item = {};
        $(data).find('news').each(function () {
          item = {};
          item.date        = $(this).find('date').text();
          item.year        = item.date.split(',')[1];
          item.link        = $(this).find('link').text();
          item.thumbnail   = $(this).find('thumbnail').text();
          item.title       = $(this).find('title').text();
          item.description = $(this).find('description').text();
          if (item.description.length > 130) {
            item.description =
              item.description.substring(
                0,
                item.description.substring(0, 130).lastIndexOf(' ')
              ) + '...';
            if (item.description.charAt(item.description.length - 1) == ',') {
              item.description = item.description.substring(0, item.description.length - 1);
            }
          }
          item.role      = $(this).find('role').text();
          item.status    = $(this).find('status').text();
          item.amount    = $(this).find('amount').text();
          item.region    = $(this).find('region').text();
          item.specialty = $(this).find('specialty').text();
          self.items().push(item);
        });
        $('#load-more').text('Load More');
        if ($('.initial').length > 0) { $('.initial').remove(); }
        self.notify.notifySubscribers();
        // Sync year-filter UI now that items are loaded
        self.updateYearUI();
        $(window).scrollTop(lmScroll);
      }
    });
  };
  self.loadMore = function () {
    lmScroll = $(window).scrollTop();
    $('#load-more').text('Loading...');
    setTimeout(function () {
      if (self.items().length < 1) {
        self.fetchYear(self.year);
      } else {
        $('.initial').remove();
        $('#load-more').text('Load More');
      }
      // If a year is selected, don't cap by self.show() –
      // all matching items are already shown
      if (self.activeYear() === null) {
        if (self.show() === 0) {
          self.show(18);
        } else {
          self.show(self.show() + 6);
        }
        setPage((self.show() - 9) / 6);
      }
      self.updateYearUI();
      $(window).scrollTop(lmScroll);
    }, 50);
    $('#load-more').hide();
  };
  if (self.show() > 9) {
    $('.initial').remove();
    $('#load-more').text('Loading...');
    setTimeout(function () {
      if (self.items().length < 1 && getUrlParameter('t') === undefined) {
        self.fetchYear(self.year);
      } else {
        $('#load-more').text('Load More');
      }
      setPage((self.show() - 9) / 6);
    }, 50);
  }
  /* ── wire up filter-bar DOM events after KO is ready ── */
  self.initFilterBar = function () {
    var filterBar = document.getElementById('yf-filter-bar');
    if (!filterBar) return;
    var dropBtn  = document.getElementById('yf-drop-btn');
    var dropWrap = document.getElementById('yf-drop-wrap');
    var listbox  = document.getElementById('yf-listbox');
    var badge    = document.getElementById('yf-count-badge');
    var clearBtn = document.getElementById('yf-clear-btn');
    if (!dropBtn || !listbox || !badge || !clearBtn) return;
    // ── dropdown button ──
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
        if (v) {
          closeDropdown();
          self.selectYear({ year: v });
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });
    document.addEventListener('click', function (e) {
      if (dropWrap && !dropWrap.contains(e.target)) closeDropdown();
    }, true);
    clearBtn.addEventListener('click', function () { self.clearYear(); });
    // ── sticky bar ──
    var placeholder  = document.getElementById('yf-sticky-placeholder');
    var topSentinel  = document.createElement('div');
    topSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    filterBar.parentNode.insertBefore(topSentinel, filterBar);
    var bottomSentinel = document.createElement('div');
    bottomSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
    var stickyContainer = document.querySelector('.insights-stories.initial') ||
                          document.querySelector('.insights-stories.ko');
    if (stickyContainer) stickyContainer.appendChild(bottomSentinel);
    var isSticky = false;
    function makeSticky() {
      if (isSticky) return;
      isSticky = true;
      if (placeholder) {
        placeholder.style.height  = filterBar.offsetHeight + 'px';
        placeholder.style.display = 'block';
      }
      filterBar.style.cssText = 'position:fixed;top:' + STICKY_TOP + 'px;left:0;right:0;z-index:500;' +
        'background:#f7f7f7;border-top:2px solid #ddd;border-bottom:2px solid #ddd;' +
        'margin:0;padding:14px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
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
    // initial UI state
    self.updateYearUI();
  };
}
/* ─── DOM Ready ─── */
$(document).ready(function () {
  /* ── dropdown accessibility ── */
  var menuTimeout;
  $('.insights-dropdown-toggle').on({
    click: function (e) {
      $(this).toggleClass('active');
      $(this).next('.insights-dropdown-items').toggleClass('active').focus();
      e.preventDefault();
    },
    focusout: function () {
      $(this).next('.insights-dropdown-items').data(
        'menuTimeout',
        setTimeout(function () {
          $(this).removeClass('active');
          $(this).next('.insights-dropdown-items').removeClass('active');
        }.bind(this), 100)
      );
    },
    focusin: function () {
      clearTimeout($(this).next('.insights-dropdown-items').data('menuTimeout'));
    }
  });
  $('.insights-dropdown-items').on({
    focusout: function () {
      $(this).data(
        'menuTimeout',
        setTimeout(function () {
          $(this).removeClass('active');
          $(this).prev('.insights-dropdown-toggle').removeClass('active');
        }.bind(this), 100)
      );
    },
    focusin:  function () { clearTimeout($(this).data('menuTimeout')); },
    keydown:  function (e) {
      if (e.which === 27) {
        $(this).removeClass('active');
        $(this).prev('.insights-dropdown-toggle').removeClass('active');
        e.preventDefault();
      }
    }
  });
  $('.insights-dropdown-items label').on({
    click: function (e) {
      $(this).focus();
      clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
    },
    focusin: function () {
      clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
    },
    keydown: function (e) {
      if (e.which === 27) {
        $(this).parent('.insights-dropdown-items').removeClass('active');
        $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active');
        e.preventDefault();
      }
    }
  });
  $('.insights-dropdown-items input').change(function () {
    clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
  });
  /* ── category list ── */
  $('#search-categories-list .category').on({
    click: function (e) {
      $('#search-categories-list .category').removeClass('active');
      $('#insights-search-bar #search').val('');
      $(this).toggleClass('active').focus();
      clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
    },
    focusin: function () {
      clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
    },
    keydown: function (e) {
      if (e.which === 27) {
        $(this).parent('.insights-dropdown-items').removeClass('active');
        $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active');
        e.preventDefault();
      }
    }
  });
  $('#insights-search-bar input').change(function () {
    $('#search-categories-list li').removeClass('active');
  });
  $('#clear-search').on('click', function () {
    $('#search-categories-list .category').removeClass('active');
  });
  /* ── KO date binding ── */
  ko.bindingHandlers.dateString = {
    init: function (element, valueAccessor) {
      element.onchange = function () {
        var value = valueAccessor();
        value(formatDate(element.value).toDate());
      };
    },
    update: function (element, valueAccessor) {
      var value          = valueAccessor();
      var valueUnwrapped = ko.utils.unwrapObservable(value);
      if (valueUnwrapped) {
        element.innerHTML = formatDate(valueUnwrapped);
      }
    }
  };
  /* ── Bootstrap KO + year-filter bar ── */
  var model;
  if (location.hash !== '') {
    model = new FormViewModel(parseInt(location.hash.replace('#', '')));
    ko.applyBindings(model);
  } else {
    model = new FormViewModel(0);
    ko.applyBindings(model);
    if (getQueryValue('author')) {
      model.selectFromURL(null, getURLtag('author'));
    } else if (getQueryValue('tag')) {
      model.selectFromURL(getURLtag('tag'), null);
    }
  }
  // Init the sticky year-filter bar (wires events, sticky scroll, initial UI)
  model.initFilterBar();
  /* ── URL topic parameter ── */
  var topics = getUrlParameter('t');
  if (topics !== undefined) {
    var t_arr = topics.split(',');
    $.each(t_arr, function (key, value) {
      $("input[value='" + $.trim(value) + "']").click();
    });
  }
  /* ── slick slider ── */
  $('#ls-row-3-area-1 .story-tiles > .row').slick({ dots: true });
  $('button.slick-autoplay-toggle-button').css('display', 'none');
});