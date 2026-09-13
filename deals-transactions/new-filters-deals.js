/* global ko, $, formatDate */

(function (window, document, $, ko) {
  'use strict';

  var DEALS_URL = 'transactions/data/deals.page';
  var INITIAL_VISIBLE_COUNT = 9;
  var LOAD_MORE_INCREMENT = 6;
  var RECENT_YEAR_CUTOFF = 2024;
  var STICKY_TOP = 60;

  var lmScroll = 0;

  /* ------------------------------------------------------------------ */
  /*  User-facing strings (i18n hook)                                    */
  /*                                                                     */
  /*  Single source of truth for every visible string the filter         */
  /*  produces at runtime. When the XSL component lands these will be    */
  /*  sourced from Datums (Locale + per-string overrides) following the  */
  /*  same pattern as the leadership carousel.                           */
  /*                                                                     */
  /*  Use fmt(template, vars) to substitute {placeholders}.              */
  /* ------------------------------------------------------------------ */
  var STRINGS = {
    yearBtnDefault:        'Year',
    typeBtnDefault:        'Transaction type',
    allYears:              'All years',
    allTypes:              'All types',
    yearTagPrefix:         'Year: ',
    typeTagPrefix:         'Transaction type: ',
    amountTagPrefix:       'Amount: ',
    activeFiltersLabel:    'Active filters:',
    tagSeparator:          'and',
    noDealsMatching:       'No deals matching filters',
    dealCount:             '{n} Deal{plural}',
    pageInfo:              '{from}–{to} of {total} deals',
    pageBtnLabel:          'Page {n}',
    pagePrevLabel:         'Previous page',
    pageNextLabel:         'Next page',
    removeFilterLabel:     'Remove {label} filter',
    showingMostRecent:     'Showing 6 most recent deals',
    showingForYear:        'Showing {count} deal{plural} from {year}'
  };

  function fmt(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (_, k) {
      return (vars && vars[k] != null) ? vars[k] : '';
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Transaction Type taxonomy                                          */
  /*                                                                     */
  /*  Maps every raw <type> value from the deals feed onto one of the    */
  /*  four canonical categories used in the dropdown UI. Add new aliases */
  /*  here as the feed introduces new strings — anything not in the map  */
  /*  returns null and is silently dropped from the dropdown + filter.   */
  /* ------------------------------------------------------------------ */
  var TRANSACTION_TYPE_MAP = {
    // Canonical (already correct)
    'mergers and acquisitions': 'Mergers and Acquisitions',
    'equity capital markets':   'Equity Capital Markets',
    'debt capital markets':     'Debt Capital Markets',
    'gold stream':              'Gold Stream',
    // Abbreviations
    'm&a':                      'Mergers and Acquisitions',
    'ma':                       'Mergers and Acquisitions',
    'ecm':                      'Equity Capital Markets',
    'dcm':                      'Debt Capital Markets',
    // Equity variants
    'equity':                   'Equity Capital Markets',
    'ipo':                      'Equity Capital Markets',
    'joint bookrunner':         'Equity Capital Markets',
    // Debt variants
    'debt':                     'Debt Capital Markets',
    'sustainable finance':      'Debt Capital Markets',
    'capital structuring':      'Debt Capital Markets',
    // M&A variants
    'take private':             'Mergers and Acquisitions',
    'spinout':                  'Mergers and Acquisitions'
  };

  /* Order canonical names appear in the dropdown. */
  var TRANSACTION_TYPE_ORDER = [
    'Mergers and Acquisitions',
    'Equity Capital Markets',
    'Debt Capital Markets',
    'Gold Stream'
  ];

  function normalizeTransactionType(raw) {
    if (!raw) return null;
    var key = String(raw).trim().toLowerCase();
    return TRANSACTION_TYPE_MAP[key] || null;
  }

  function noop() {}

  function setPage(state) {
    if (!state || state === 0) return;

    var hash = '#' + Math.ceil(state);

    if (window.history && typeof window.history.pushState === 'function') {
      window.history.pushState(null, '', hash);
      return;
    }

    window.location.hash = hash;
  }

  function getQueryValue(key) {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.has(key) ? params.get(key) : false;
    } catch (err) {
      return false;
    }
  }

  function getUrlParameter(key) {
    return getQueryValue(key);
  }

  function sanitizeUrlValue(value) {
    if (!value) return '';
    return decodeURIComponent(value)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getURLtag(tag) {
    var value = getQueryValue(tag);
    return value ? sanitizeUrlValue(value) : '';
  }

  function trimText(value) {
    return (value || '').trim();
  }

  function safeLower(value) {
    return String(value || '').toLowerCase();
  }

  function textIncludes(haystack, needle) {
    return safeLower(haystack).indexOf(safeLower(needle)) !== -1;
  }

  function parseItemYear(item) {
    if (!item || !item.date) return null;
    var parts = trimText(item.date).split(/\s+/);
    return parts.length ? parts[parts.length - 1] : null;
  }

  function truncateDescription(text, maxLength) {
    var value = trimText(text);

    if (!value || value.length <= maxLength) {
      return value;
    }

    var truncated = value.substring(0, maxLength);
    var lastSpace = truncated.lastIndexOf(' ');
    var output = (lastSpace > -1 ? truncated.substring(0, lastSpace) : truncated) + '...';

    if (output.charAt(output.length - 4) === ',') {
      output = output.substring(0, output.length - 4) + '...';
    }

    return output;
  }

  function parseAmount(raw) {
    if (!raw) return null;

    var normalized = String(raw)
      .replace(/&#36;/g, '')
      .replace(/\$/g, '')
      .replace(/,/g, '')
      .trim();

    var match = normalized.match(/([\d.]+)\s*(billion|million|trillion)/i);
    if (!match) return null;

    var value = parseFloat(match[1]);
    var unit = match[2].toLowerCase();

    if (!Number.isFinite(value)) return null;
    if (unit === 'million') return value;
    if (unit === 'billion') return value * 1000;
    if (unit === 'trillion') return value * 1000000;

    return null;
  }

  function formatAmount(value) {
    if (!Number.isFinite(value)) return '';

    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1).replace(/\.0$/, '') + 'B';
    }

    return '$' + Math.round(value) + 'M';
  }

  function getKoContainer() {
    return document.querySelector('.insights-stories.ko');
  }

  function getKoTiles() {
    var container = getKoContainer();
    if (!container) return [];

    return Array.from(container.querySelectorAll('.col-md-4')).filter(function (tile) {
      return tile.querySelector('.deal-date');
    });
  }

  function stripKoMarginTop() {
    var row = document.querySelector('.insights-stories.ko .container .row');
    if (row) row.style.marginTop = '';
  }

  function showRecentTilesOnly() {
    getKoTiles().forEach(function (tile) {
      var yearText = trimText(tile.querySelector('.deal-date')?.textContent).split(/\s+/).pop();
      var year = parseInt(yearText, 10);
      tile.style.display = Number.isFinite(year) && year >= RECENT_YEAR_CUTOFF ? '' : 'none';
    });
  }

  function filterKoTilesByYear(year) {
    getKoTiles().forEach(function (tile) {
      var tileYear = trimText(tile.querySelector('.deal-date')?.textContent).split(/\s+/).pop();
      tile.style.display = tileYear === year ? '' : 'none';
    });
  }

  function buildTileSnapshot(selector) {
    var tiles = document.querySelectorAll(selector);
    if (!tiles.length) return [];

    return Array.from(tiles).map(function (tile) {
      return tile.innerHTML;
    });
  }

  function buildInitialFromSnapshot(snapshot) {
    if (!snapshot || !snapshot.length) return null;

    var wrap = document.createElement('div');
    wrap.className = 'insights-stories initial';

    var tombWrap = document.createElement('div');
    tombWrap.className = 'tombstones-wrap';

    var container = document.createElement('div');
    container.className = 'container';

    var row = document.createElement('div');
    row.className = 'row';

    snapshot.forEach(function (tileHTML) {
      var col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = tileHTML;
      row.appendChild(col);
    });

    container.appendChild(row);
    tombWrap.appendChild(container);
    wrap.appendChild(tombWrap);

    return wrap;
  }

  function FormViewModel(page) {
    var self = this;

    self.show = ko.observable(INITIAL_VISIBLE_COUNT + page * LOAD_MORE_INCREMENT);
    self.items = ko.observableArray([]);
    self.topics = ko.observableArray([]).extend({
      rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' }
    });
    self.pubs = ko.observableArray([]);
    self.authors = ko.observableArray([]);
    self.notify = ko.observable();
    self.loaded = ko.observable(false);
    self.loading = ko.observable(false);
    self.year = new Date().getFullYear();
    self.fronly = ko.observable(false);
    self.activeYear = ko.observable(null);
    self.query = ko.observable('').extend({
      rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' }
    });

    self._initialSnapshot = [];
    self._userTriggered = false;
    self._filterBarInitialized = false;

    self.filteredItems = ko.computed(function () {
      self.notify();

      var selectedTopics = self.topics();
      var selectedPubs = self.pubs();
      var selectedAuthors = self.authors();
      var searchQuery = trimText(self.query());

      if (!selectedTopics.length && !selectedPubs.length && !selectedAuthors.length && !searchQuery.length) {
        return self.items();
      }

      return ko.utils.arrayFilter(self.items(), function (item) {
        var publicationMatch = !selectedPubs.length;
        var authorMatch = !selectedAuthors.length;
        var topicMatch = !selectedTopics.length;

        if (selectedPubs.length) {
          publicationMatch = selectedPubs.some(function (pub) {
            return textIncludes(item.title, pub);
          });
        }

        if (selectedAuthors.length) {
          authorMatch = selectedAuthors.some(function (author) {
            return item.author !== undefined && textIncludes(String(item.author), author);
          });
        }

        if (selectedTopics.length) {
          var topics = [];

          if (item.tags) {
            topics = topics.concat(item.tags.split(','));
          }

          if (item.category) {
            topics = topics.concat(item.category.split(','));
          }

          topicMatch = topics.some(function (topic) {
            var normalizedTopic = trimText(topic);
            if (!normalizedTopic) return false;

            return selectedTopics.some(function (selectedTopic) {
              var a = safeLower(selectedTopic);
              var b = safeLower(normalizedTopic);
              return a.indexOf(b) !== -1 || b.indexOf(a) !== -1;
            });
          });
        }

        if (searchQuery) {
          return topicMatch || publicationMatch || authorMatch;
        }

        return topicMatch && publicationMatch && authorMatch;
      });
    });

    self.getAvailableYears = function () {
      var counts = {};

      self.items().forEach(function (item) {
        var year = parseItemYear(item);
        if (year) {
          counts[year] = (counts[year] || 0) + 1;
        }
      });

      return Object.keys(counts)
        .sort()
        .reverse()
        .map(function (year) {
          return {
            year: year,
            count: counts[year]
          };
        });
    };

    self.selectNoTopics = function () {
      self.show(INITIAL_VISIBLE_COUNT);
      self.query('');
      self.topics([]);
      self.pubs([]);
      self.authors([]);
      self.notify.notifySubscribers();
    };

    self.selectTopic = function (topics) {
      self.show(0);
      self.loadContent();
      self.query('');
      self.topics(topics);
      self.pubs([]);
      self.authors([]);
      self.notify.notifySubscribers();
      $('.initial').remove();
      self.show(INITIAL_VISIBLE_COUNT);
    };

    self.selectAuthor = function (author) {
      self.show(0);
      self.loadContent();
      self.query('');
      self.topics([]);
      self.pubs([]);
      self.authors([author]);
      self.notify.notifySubscribers();
      $('.initial').remove();
      self.show(INITIAL_VISIBLE_COUNT);
    };

    self.query.subscribe(function () {
      var value = self.query();

      self.loadContent();
      self.topics([value]);
      self.pubs([value]);
      self.authors([value]);
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
      var scrollTop = $(window).scrollTop();

      if (self.show() === 0) {
        self.show(INITIAL_VISIBLE_COUNT);
      }

      if (self.items().length < 1) {
        $('.initial').remove();
        $('#load-more').text('Loading...');
        self.fetchYear(self.year);
        $(window).scrollTop(scrollTop);
        return;
      }

      $('#load-more').text('Load More');
    };

    self.fetchYear = function () {
      $.ajax({
        url: DEALS_URL,
        dataType: 'xml',
        cache: true
      })
        .done(function (data) {
          $(data).find('news').each(function () {
            var $node = $(this);

            var item = {
              date: $node.find('date').text(),
              link: $node.find('link').text(),
              thumbnail: $node.find('thumbnail').text(),
              title: $node.find('title').text(),
              description: '',
              role: $node.find('role').text(),
              status: $node.find('status').text(),
              amount: $node.find('amount').text(),
              type: trimText($node.find('type').text()),
              region: $node.find('region').text(),
              specialty: $node.find('specialty').text()
            };

            item.year = parseItemYear(item);
            item.description = truncateDescription($node.find('description').text(), 130);

            self.items.push(item);
          });

          if ($('#load-more').text() === 'Loading...') {
            $('#load-more').text('Load More');
          }

          if (self._userTriggered) {
            self._userTriggered = false;

            if ($('.initial').length > 0) {
              $('.initial').remove();
            }

            self.notify.notifySubscribers();

            var currentYear = self.activeYear();
            if (currentYear !== null) {
              setTimeout(function () {
                self.applyYearFilter(currentYear);
              }, 100);
            }
          }

          $(window).scrollTop(lmScroll);
        })
        .fail(function () {
          $('#load-more').text('Load More');
        });
    };

    self.applyYearFilter = function (year) {
      self.activeYear(year);

      var initialContainer = document.querySelector('.insights-stories.initial');
      var koContainer = document.querySelector('.insights-stories.ko');
      var loadMoreButton = document.getElementById('load-more');
      var clearButton = document.getElementById('yf-clear-btn');

      if (year === null) {
        if (!initialContainer) {
          var rebuilt = buildInitialFromSnapshot(self._initialSnapshot);
          if (rebuilt && koContainer && koContainer.parentNode) {
            koContainer.parentNode.insertBefore(rebuilt, koContainer);
            initialContainer = rebuilt;
          }
        }

        if (initialContainer) {
          initialContainer.style.display = '';
          Array.from(initialContainer.querySelectorAll('.col-md-4')).forEach(function (tile) {
            tile.style.display = '';
          });
        }

        if (koContainer) {
          koContainer.style.display = 'none';
        }

        if (loadMoreButton) {
          loadMoreButton.style.removeProperty('display');
        }

        if (clearButton) {
          clearButton.style.display = 'none';
        }

        self.updateYearUI();
        return;
      }

      if (initialContainer) {
        initialContainer.style.display = 'none';
      }

      if (koContainer) {
        koContainer.style.display = '';
        stripKoMarginTop();
      }

      if (self.show() === 0) {
        self.show(INITIAL_VISIBLE_COUNT);
      }

      self.notify.notifySubscribers();

      if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
      }

      if (clearButton) {
        clearButton.style.display = 'inline';
      }

      setTimeout(function () {
        stripKoMarginTop();
        filterKoTilesByYear(year);
        self.updateYearUI();
      }, 100);
    };

    self.updateYearUI = function () {
      var year = self.activeYear();
      var button = document.getElementById('yf-drop-btn');
      var badge = document.getElementById('yf-count-badge');
      var clear = document.getElementById('yf-clear-btn');
      var arrow = document.getElementById('yf-arrow');

      if (badge) {
        badge.style.display = 'none';

        if (year === null) {
          badge.textContent = 'Showing 6 most recent deals';
        } else {
          var count = self.items().filter(function (item) {
            return parseItemYear(item) === year;
          }).length;

          badge.textContent = 'Showing ' + count + ' deal' + (count !== 1 ? 's' : '') + ' from ' + year;
        }
      }

      if (button) {
        var arrowHtml = arrow ? arrow.outerHTML : '';
        button.innerHTML = (year || 'Year') + arrowHtml;
      }

      if (clear) {
        clear.style.display = year !== null ? 'inline' : 'none';
      }
    };

    self.loadMore = function () {
      if (!self._initialSnapshot.length) {
        self._initialSnapshot = buildTileSnapshot('.insights-stories.initial .col-md-4');
      }

      $('#load-more').text('Loading...');

      setTimeout(function () {
        if (self.items().length < 1) {
          self._userTriggered = true;
          self.fetchYear(self.year);
          return;
        }

        $('.initial').remove();

        var koContainer = getKoContainer();
        if (koContainer) {
          koContainer.style.display = '';
          stripKoMarginTop();
        }

        $('#load-more').text('Load More');

        if (self.show() === 0) {
          self.show(INITIAL_VISIBLE_COUNT + LOAD_MORE_INCREMENT + 3);
        } else {
          self.show(self.show() + LOAD_MORE_INCREMENT);
        }

        self.notify.notifySubscribers();

        setTimeout(function () {
          stripKoMarginTop();

          if (self.activeYear() === null) {
            showRecentTilesOnly();
          } else {
            filterKoTilesByYear(self.activeYear());
          }

          var filterBar = document.getElementById('rbccm-deal-filter');
          if (filterBar) {
            var offset = $(filterBar).offset().top - 80;
            $(window).scrollTop(offset);
          }
        }, 100);
      }, 50);

      $('#load-more').hide();

      var clearButton = document.getElementById('yf-clear-btn');
      if (clearButton) {
        clearButton.style.display = 'inline';
      }
    };

    self.initFilterBar = function () {
      if (self._filterBarInitialized) return;
      self._filterBarInitialized = true;

      var filterBar = document.getElementById('rbccm-deal-filter');
      if (!filterBar) return;

      if (!self._initialSnapshot.length) {
        self._initialSnapshot = buildTileSnapshot('.insights-stories.initial .col-md-4');
      }

      // If items haven't loaded yet, fetch them then reinit
      if (self.items().length === 0) {
        self._filterBarInitialized = false; // allow re-init after data loads
        self.items.subscribe(function (newItems) {
          if (newItems.length > 0 && !self._filterBarInitialized) {
            self.initFilterBar();
          }
        });
        self.fetchYear(self.year);
        return; // bail out early, will re-run once data arrives
      }

      /* Styles now live in deal-filter.css. Markup now lives in the
         host page / XSL component. JS no longer constructs DOM or
         injects <style> blocks — it just queries the static markup
         and attaches behaviour. */
      var inner = filterBar.querySelector('.rbccm-deal-filter__inner');
      if (!inner) return;

      var activeFilterYear = null;
      var activeType = null;
      var PAGE_SIZE = 6;
      var currentPage = 1;
      var matchedTiles = [];

      function getClosedItems() {
        return self.items().filter(function (item) {
          return safeLower(trimText(item.status)) === 'closed';
        });
      }

      function computeSliderRange() {
        var values = getClosedItems()
          .map(function (item) {
            return parseAmount(item.amount);
          })
          .filter(function (value) {
            return value !== null && Number.isFinite(value) && value > 0;
          });

        if (!values.length) {
          return { min: 0, max: 50000, step: 250 };
        }

        var dataMin = Math.min.apply(null, values);
        var dataMax = Math.max.apply(null, values);

        var sliderMin = Math.floor(dataMin / 50) * 50;
        var sliderMax = dataMax >= 10000
          ? Math.ceil(dataMax / 10000) * 10000
          : Math.ceil(dataMax / 1000) * 1000;

        return {
          min: sliderMin,
          max: sliderMax,
          step: sliderMin < 1000 ? 50 : 250
        };
      }

      function getYearOptions() {
        var counts = {};
        getClosedItems().forEach(function (item) {
          var year = parseItemYear(item);
          if (year) {
            counts[year] = (counts[year] || 0) + 1;
          }
        });

        return Object.keys(counts)
          .sort()
          .reverse()
          .map(function (year) {
            return { value: year, count: counts[year] };
          });
      }

      function getTypeOptions() {
        var counts = {};
        getClosedItems().forEach(function (item) {
          var type = normalizeTransactionType(item.type);
          if (type) {
            counts[type] = (counts[type] || 0) + 1;
          }
        });

        // Always return in canonical order, omitting any with 0 deals.
        return TRANSACTION_TYPE_ORDER
          .filter(function (name) { return counts[name]; })
          .map(function (name) { return { value: name, count: counts[name] }; });
      }

      function buildLinkMap() {
        var map = {};
        self.items().forEach(function (item) {
          if (item.link) {
            map[trimText(item.link)] = item;
          }
        });
        return map;
      }

      var range = computeSliderRange();
      var AMT_MIN = range.min;
      var AMT_MAX = range.max;
      var AMT_STEP = range.step;

      /* ── Element queries (static markup, no construction) ──
         All elements live in the host page (or XSL component output).
         The IDs/classes match the rbccm-deal-filter BEM block. */
      var row          = filterBar.querySelector('.rbccm-deal-filter__row');
      var yearWrap     = filterBar.querySelector('.rbccm-deal-filter__dropdown--year');
      var yearButton   = document.getElementById('rbccm-deal-filter-year-btn');
      var yearBtnLabel = document.getElementById('rbccm-deal-filter-year-btn-label');
      var yearList     = document.getElementById('rbccm-deal-filter-year-list');
      var typeWrap     = filterBar.querySelector('.rbccm-deal-filter__dropdown--type');
      var typeButton   = document.getElementById('rbccm-deal-filter-type-btn');
      var typeBtnLabel = document.getElementById('rbccm-deal-filter-type-btn-label');
      var typeList     = document.getElementById('rbccm-deal-filter-type-list');
      var minSlider    = document.getElementById('rbccm-deal-filter-amount-min');
      var maxSlider    = document.getElementById('rbccm-deal-filter-amount-max');
      var fill         = filterBar.querySelector('.rbccm-deal-filter__amount-fill');
      var amountValue  = filterBar.querySelector('.rbccm-deal-filter__amount-value');
      var amountClear  = filterBar.querySelector('.rbccm-deal-filter__amount-clear');
      var count        = document.getElementById('rbccm-deal-filter-count');
      var tagsRow      = document.getElementById('rbccm-deal-filter-tags');
      var pagination   = document.getElementById('rbccm-deal-filter-pagination');

      /* Initialise slider attrs from the computed range. The static
         markup ships generic min/max — JS sets the real values from
         the data feed. */
      if (minSlider) {
        minSlider.min = AMT_MIN; minSlider.max = AMT_MAX;
        minSlider.step = AMT_STEP; minSlider.value = AMT_MIN;
      }
      if (maxSlider) {
        maxSlider.min = AMT_MIN; maxSlider.max = AMT_MAX;
        maxSlider.step = AMT_STEP; maxSlider.value = AMT_MAX;
      }

      /* If pagination element wasn't placed by the host page, drop it
         after the KO container as the original behaviour did. */
      if (pagination && !pagination.parentNode) {
        var koContainer = getKoContainer();
        if (koContainer && koContainer.parentNode) {
          koContainer.parentNode.insertBefore(pagination, koContainer.nextSibling);
        }
      }

      function makeOption(value, count, isActive, optionIdPrefix) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('data-value', value);
        li.setAttribute('aria-selected', isActive ? 'true' : 'false');
        li.className = 'rbccm-deal-filter__dropdown-item' +
                       (isActive ? ' rbccm-deal-filter__dropdown-item--active' : '');
        li.id = optionIdPrefix + '-' + value.toString().toLowerCase().replace(/\s+/g, '-');

        var label = document.createElement('span');
        label.textContent = value;

        var countEl = document.createElement('span');
        countEl.className = 'rbccm-deal-filter__dropdown-item-count';
        countEl.textContent = count;

        li.appendChild(label);
        li.appendChild(countEl);
        return li;
      }

      function rebuildYearList() {
        while (yearList.children.length > 1) {
          yearList.removeChild(yearList.lastChild);
        }
        getYearOptions().forEach(function (option) {
          yearList.appendChild(makeOption(
            option.value, option.count,
            activeFilterYear === option.value,
            'rbccm-deal-filter-year-opt'
          ));
        });
      }

      function rebuildTypeList() {
        while (typeList.children.length > 1) {
          typeList.removeChild(typeList.lastChild);
        }
        getTypeOptions().forEach(function (option) {
          typeList.appendChild(makeOption(
            option.value, option.count,
            activeType === option.value,
            'rbccm-deal-filter-type-opt'
          ));
        });
      }

      function updateFill() {
        var min = parseInt(minSlider.value, 10);
        var max = parseInt(maxSlider.value, 10);
        var span = AMT_MAX - AMT_MIN || 1;

        fill.style.left = ((min - AMT_MIN) / span) * 100 + '%';
        fill.style.right = ((AMT_MAX - max) / span) * 100 + '%';

        var isDefault = min === AMT_MIN && max === AMT_MAX;
        amountValue.textContent = formatAmount(min) + ' – ' + (max >= AMT_MAX ? formatAmount(max) + '+' : formatAmount(max));
        amountValue.style.color = isDefault ? '#555' : '#0051A5';
        amountClear.style.display = isDefault ? 'none' : '';
      }

      function updateTags() {
        tagsRow.innerHTML = '';
        var hasTags = false;

        function addLabel() {
          if (hasTags) return;
          hasTags = true;

          var label = document.createElement('span');
          label.className = 'rbccm-deal-filter__tags-label';
          label.textContent = STRINGS.activeFiltersLabel;
          tagsRow.appendChild(label);
        }

        function addTag(text, onClear) {
          addLabel();

          var tag = document.createElement('span');
          tag.className = 'rbccm-deal-filter__tag';
          tag.textContent = text + ' ';

          var clear = document.createElement('button');
          clear.type = 'button';
          clear.className = 'rbccm-deal-filter__tag-remove';
          clear.textContent = '×'; // ×
          clear.setAttribute('aria-label', fmt(STRINGS.removeFilterLabel, { label: text }));
          clear.onclick = onClear;

          tag.appendChild(clear);
          tagsRow.appendChild(tag);
        }

        // if (activeFilterYear) {
        //   addTag('Year: ' + activeFilterYear, function () {
        //     activeFilterYear = null;
        //     yearButton.innerHTML = 'Year <span class="arrow">&#9660;</span>';
        //     applyFilters();
        //   });
        // }

        // if (activeType) {
        //   addTag('Transaction type: ' + activeType, function () {
        //     activeType = null;
        //     typeButton.innerHTML = 'Transaction type <span class="arrow">&#9660;</span>';
        //     applyFilters();
        //   });
        // }

        var activeTags = [];

        if (activeFilterYear) {
          activeTags.push({ text: STRINGS.yearTagPrefix + activeFilterYear, onClear: function () {
            activeFilterYear = null;
            yearBtnLabel.textContent = STRINGS.yearBtnDefault;
            applyFilters();
            var bar = document.getElementById('rbccm-deal-filter');
            if (bar) {
              if (bar.classList.contains('rbccm-deal-filter--sticky')) {
                  var ko = document.querySelector('.insights-stories.ko');
                  if (ko) {
                      window.scrollTo({
                          top: ko.getBoundingClientRect().top + window.scrollY - (bar.offsetHeight + STICKY_TOP + 20),
                          behavior: 'smooth'
                      });
                  }
              } else {
                  window.scrollTo({
                      top: bar.getBoundingClientRect().top + window.scrollY - 80,
                      behavior: 'smooth'
                  });
              }
            }
          }});
        }

        if (activeType) {
          activeTags.push({ text: STRINGS.typeTagPrefix + activeType, onClear: function () {
            activeType = null;
            typeBtnLabel.textContent = STRINGS.typeBtnDefault;
            applyFilters();
            var bar = document.getElementById('rbccm-deal-filter');
            if (bar) {
              if (bar.classList.contains('rbccm-deal-filter--sticky')) {
                  var ko = document.querySelector('.insights-stories.ko');
                  if (ko) {
                      window.scrollTo({
                          top: ko.getBoundingClientRect().top + window.scrollY - (bar.offsetHeight + STICKY_TOP + 20),
                          behavior: 'smooth'
                      });
                  }
              } else {
                  window.scrollTo({
                      top: bar.getBoundingClientRect().top + window.scrollY - 80,
                      behavior: 'smooth'
                  });
              }
            }
          }});
        }

        activeTags.forEach(function (tagDef, index) {
          if (index > 0) {
            addLabel();
            var or = document.createElement('span');
            or.className = 'rbccm-deal-filter__tag-separator';
            or.textContent = STRINGS.tagSeparator;
            tagsRow.appendChild(or);
          }
          addTag(tagDef.text, tagDef.onClear);
        });

        var min = parseInt(minSlider.value, 10);
        var max = parseInt(maxSlider.value, 10);

        if (min > AMT_MIN || max < AMT_MAX) {
          addTag(
            STRINGS.amountTagPrefix + formatAmount(min) + ' – ' + (max >= AMT_MAX ? formatAmount(max) + '+' : formatAmount(max)),
            function () {
              minSlider.value = AMT_MIN;
              maxSlider.value = AMT_MAX;
              updateFill();
              applyFilters();
              var bar = document.getElementById('rbccm-deal-filter');
              if (bar) {
                if (bar.classList.contains('rbccm-deal-filter--sticky')) {
                    var ko = document.querySelector('.insights-stories.ko');
                    if (ko) {
                        window.scrollTo({
                            top: ko.getBoundingClientRect().top + window.scrollY - (bar.offsetHeight + STICKY_TOP + 20),
                            behavior: 'smooth'
                        });
                    }
                } else {
                    window.scrollTo({
                        top: bar.getBoundingClientRect().top + window.scrollY - 80,
                        behavior: 'smooth'
                    });
                }
              }
            }
          );
        }

        tagsRow.classList.toggle('is-visible', hasTags);
      }

      function showPage(page) {
        var start = (page - 1) * PAGE_SIZE;
        var end = start + PAGE_SIZE;

        matchedTiles.forEach(function (tile, index) {
          tile.style.display = index >= start && index < end ? '' : 'none';
        });
      }

      function renderPagination(total, page) {
        pagination.innerHTML = '';

        var pages = Math.ceil(total / PAGE_SIZE);
        if (pages <= 1) {
          pagination.classList.remove('is-visible');
          return;
        }

        pagination.classList.add('is-visible');

        function makeButton(label, target, isActive, disabled, ariaLabel) {
          var button = document.createElement('button');
          button.type = 'button';
          button.innerHTML = label;
          button.className = 'rbccm-deal-filter__page-btn' +
                             (isActive ? ' rbccm-deal-filter__page-btn--active' : '');
          if (isActive) button.setAttribute('aria-current', 'page');
          if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
          if (disabled) button.disabled = true;

          button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            currentPage = target;
            showPage(currentPage);
            renderPagination(total, currentPage);

            var bar = document.getElementById('rbccm-deal-filter');
            if (bar) {
                if (bar.classList.contains('rbccm-deal-filter--sticky')) {
                    var ko = document.querySelector('.insights-stories.ko');
                    if (ko) {
                        window.scrollTo({
                            top: ko.getBoundingClientRect().top + window.scrollY - (bar.offsetHeight + STICKY_TOP + 20),
                            behavior: 'smooth'
                        });
                    }
                } else {
                    window.scrollTo({
                        top: bar.getBoundingClientRect().top + window.scrollY - 80,
                        behavior: 'smooth'
                    });
                }
            }
          });

          return button;
        }

        pagination.appendChild(makeButton('&#8592;', page - 1, false, page === 1, STRINGS.pagePrevLabel));

        var numbers = [];
        var i;

        if (pages <= 7) {
          for (i = 1; i <= pages; i += 1) {
            numbers.push(i);
          }
        } else {
          numbers.push(1);

          if (page > 3) {
            numbers.push('…');
          }

          for (i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i += 1) {
            numbers.push(i);
          }

          if (page < pages - 2) {
            numbers.push('…');
          }

          numbers.push(pages);
        }

        numbers.forEach(function (value) {
          if (value === '…') {
            var ellipsis = document.createElement('span');
            ellipsis.className = 'rbccm-deal-filter__page-ellipsis';
            ellipsis.setAttribute('aria-hidden', 'true');
            ellipsis.textContent = '…';
            pagination.appendChild(ellipsis);
            return;
          }
          pagination.appendChild(makeButton(
            value, value, value === page, false,
            fmt(STRINGS.pageBtnLabel, { n: value })
          ));
        });

        pagination.appendChild(makeButton('&#8594;', page + 1, false, page === pages, STRINGS.pageNextLabel));

        var info = document.createElement('span');
        info.className = 'rbccm-deal-filter__page-info';
        info.textContent = fmt(STRINGS.pageInfo, {
          from:  (page - 1) * PAGE_SIZE + 1,
          to:    Math.min(page * PAGE_SIZE, total),
          total: total
        });
        pagination.appendChild(info);
      }

      function applyFilters() {
        var year = activeFilterYear;
        var type = activeType;
        var min = parseInt(minSlider.value, 10);
        var max = parseInt(maxSlider.value, 10);

        var yearActive = year !== null;
        var typeActive = type !== null;
        var amountActive = min > AMT_MIN || max < AMT_MAX;
        var hasFilter = yearActive || typeActive || amountActive;

        var initialContainer = document.querySelector('.insights-stories.initial');
        var koListContainer = getKoContainer();
        var loadMore = document.getElementById('load-more');

        if (!hasFilter) {
          if (initialContainer) initialContainer.style.display = '';
          if (koListContainer) koListContainer.style.display = 'none';
          if (loadMore) loadMore.style.removeProperty('display');

          pagination.classList.remove('is-visible');
          count.classList.remove('rbccm-deal-filter__count--empty');
          count.textContent = '';
          updateTags();
          return;
        }

        if (initialContainer) initialContainer.style.display = 'none';

        if (koListContainer) {
          koListContainer.style.display = '';
          stripKoMarginTop();
        }

        if (loadMore) {
          loadMore.style.display = 'none';
        }

        if (self.show() === 0) {
          self.show(INITIAL_VISIBLE_COUNT);
        }

        self.show(self.items().length);
        self.topics([]);
        self.pubs([]);
        self.authors([]);

        setTimeout(function () {
          var linkMap = buildLinkMap();
          matchedTiles = [];

          getKoTiles().forEach(function (tile) {
            var dateEl = tile.querySelector('.deal-date');
            if (!dateEl) {
              tile.style.display = 'none';
              return;
            }

            var statusNode = tile.querySelector('[data-bind*="status"]');
            var isClosed = !statusNode || statusNode.style.display === 'none' || String(statusNode.textContent || '').indexOf('Pending') === -1;

            if (!isClosed) {
              tile.style.display = 'none';
              return;
            }

            var passYear = false;
            var passType = false;
            var passAmount = false;

            if (yearActive) {
              var tileYear = trimText(dateEl.textContent).split(/\s+/).pop();
              passYear = tileYear === year;
            }

            if (typeActive) {
              var anchor = tile.querySelector('a[data-bind*="href: link"]') || tile.querySelector('a[href]');
              var tileLink = anchor ? trimText(anchor.getAttribute('href')) : '';
              var item = linkMap[tileLink] || null;
              var tileType = item ? normalizeTransactionType(item.type) : null;
              passType = tileType === type;
            }

            if (amountActive) {
              var amountSpan = Array.from(tile.querySelectorAll('span')).find(function (span) {
                return String(span.getAttribute('data-bind') || '').indexOf('amount') !== -1;
              });

              var parsed = parseAmount(amountSpan ? amountSpan.textContent : '');
              if (parsed !== null) {
                var capped = Math.min(parsed, AMT_MAX);
                passAmount = capped >= min && capped <= max;
              }
            }

            // CURRENT (OR):
            // var passes = (yearActive && passYear) || (typeActive && passType) || (amountActive && passAmount);

            // CHANGE TO (AND):
            var passes = (!yearActive || passYear) && (!typeActive || passType) && (!amountActive || passAmount);

            if (passes) {
              matchedTiles.push(tile);
            } else {
              tile.style.display = 'none';
            }
          });

          currentPage = 1;
          showPage(1);
          renderPagination(matchedTiles.length, 1);
          if (matchedTiles.length === 0) {
            count.textContent = STRINGS.noDealsMatching;
            count.classList.add('rbccm-deal-filter__count--empty');
          } else {
            // Visible count text used by SR; CSS hides it visually unless empty.
            count.textContent = fmt(STRINGS.dealCount, {
              n: matchedTiles.length,
              plural: matchedTiles.length !== 1 ? 's' : ''
            });
            count.classList.remove('rbccm-deal-filter__count--empty');
          }
          stripKoMarginTop();
          updateTags();
        }, 200);
      }

      function openDropdown(list, button) {
        list.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
      function closeDropdown(list, button) {
        list.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      }
      function isDropdownOpen(list) {
        return list.classList.contains('is-open');
      }

      yearButton.addEventListener('click', function (event) {
        event.stopPropagation();
        rebuildYearList();
        if (isDropdownOpen(yearList)) closeDropdown(yearList, yearButton);
        else                          openDropdown(yearList, yearButton);
      });

      yearList.addEventListener('click', function (event) {
        var item = event.target.closest('li');
        if (!item) return;

        var value = item.getAttribute('data-value') || null;
        activeFilterYear = value || null;

        // Update the visible label text only — the arrow span stays in
        // the markup permanently and is purely cosmetic.
        yearBtnLabel.textContent = value || STRINGS.yearBtnDefault;

        closeDropdown(yearList, yearButton);
        applyFilters();
        // var storiesEl = document.querySelector('.insights-stories');
        // if (storiesEl) { storiesEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        var bar = document.getElementById('rbccm-deal-filter');
        if (bar) {
              if (bar.classList.contains('rbccm-deal-filter--sticky')) {
                  var ko = document.querySelector('.insights-stories.ko');
                  if (ko) {
                      window.scrollTo({
                          top: ko.getBoundingClientRect().top + window.scrollY - (bar.offsetHeight + STICKY_TOP + 20),
                          behavior: 'smooth'
                      });
                  }
              } else {
                  window.scrollTo({
                      top: bar.getBoundingClientRect().top + window.scrollY - 80,
                      behavior: 'smooth'
                  });
              }
        }
      });

      typeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        rebuildTypeList();
        if (isDropdownOpen(typeList)) closeDropdown(typeList, typeButton);
        else                          openDropdown(typeList, typeButton);
      });

      typeList.addEventListener('click', function (event) {
        var item = event.target.closest('li');
        if (!item) return;

        var value = item.getAttribute('data-value') || null;
        activeType = value || null;
        typeBtnLabel.textContent = value || STRINGS.typeBtnDefault;

        closeDropdown(typeList, typeButton);
        applyFilters();
        // var storiesEl = document.querySelector('.insights-stories');
        // if (storiesEl) { storiesEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        var bar = document.getElementById('rbccm-deal-filter');
        if (bar) {
              if (bar.classList.contains('rbccm-deal-filter--sticky')) {
                  var ko = document.querySelector('.insights-stories.ko');
                  if (ko) {
                      window.scrollTo({
                          top: ko.getBoundingClientRect().top + window.scrollY - (bar.offsetHeight + STICKY_TOP + 20),
                          behavior: 'smooth'
                      });
                  }
              } else {
                  window.scrollTo({
                      top: bar.getBoundingClientRect().top + window.scrollY - 80,
                      behavior: 'smooth'
                  });
              }
        }
      });

      document.addEventListener(
        'click',
        function (event) {
          if (!yearWrap.contains(event.target)) {
            closeDropdown(yearList, yearButton);
          }

          if (!typeWrap.contains(event.target)) {
            closeDropdown(typeList, typeButton);
          }
        },
        true
      );

      /* ─────────────────────────────────────────────────────────
         Keyboard navigation for the two listbox dropdowns.
         Implements the WAI-ARIA listbox pattern:
           ArrowDown / ArrowUp → move highlight, scroll into view
           Home / End          → first / last option
           Enter / Space       → select current option
           Escape              → close + return focus to button
         Highlight is tracked via aria-activedescendant on the
         listbox and an .is-keyboard-focused class on the option.
         ───────────────────────────────────────────────────────── */
      function getOptions(list) {
        return Array.prototype.filter.call(
          list.querySelectorAll('[role="option"]'),
          function (li) { return li.getAttribute('data-value') !== ''; }
        );
      }

      function highlightOption(list, idx) {
        var options = getOptions(list);
        if (!options.length) return;
        idx = ((idx % options.length) + options.length) % options.length;
        options.forEach(function (li) { li.classList.remove('is-keyboard-focused'); });
        var target = options[idx];
        target.classList.add('is-keyboard-focused');
        list.setAttribute('aria-activedescendant', target.id);
        target.scrollIntoView({ block: 'nearest' });
      }

      function currentHighlightIdx(list) {
        var options = getOptions(list);
        for (var i = 0; i < options.length; i++) {
          if (options[i].classList.contains('is-keyboard-focused')) return i;
        }
        return -1;
      }

      function bindKeyboardNav(button, list, rebuildFn) {
        function ensureOpen() {
          if (!isDropdownOpen(list)) {
            rebuildFn();
            openDropdown(list, button);
          }
        }

        button.addEventListener('keydown', function (event) {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            ensureOpen();
            var idx = event.key === 'ArrowDown' ? 0 : getOptions(list).length - 1;
            highlightOption(list, idx);
            list.focus();
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (isDropdownOpen(list)) closeDropdown(list, button);
            else                      ensureOpen();
          }
        });

        list.addEventListener('keydown', function (event) {
          var options = getOptions(list);
          if (!options.length) return;
          var idx = currentHighlightIdx(list);

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            highlightOption(list, idx < 0 ? 0 : idx + 1);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            highlightOption(list, idx < 0 ? options.length - 1 : idx - 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            highlightOption(list, 0);
          } else if (event.key === 'End') {
            event.preventDefault();
            highlightOption(list, options.length - 1);
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (idx >= 0) options[idx].click();
            button.focus();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            closeDropdown(list, button);
            button.focus();
          } else if (event.key === 'Tab') {
            closeDropdown(list, button);
            // Let Tab propagate normally so focus moves to the next control.
          }
        });
      }

      bindKeyboardNav(yearButton, yearList, rebuildYearList);
      bindKeyboardNav(typeButton, typeList, rebuildTypeList);

      minSlider.addEventListener('input', function () {
        if (+minSlider.value > +maxSlider.value) {
          minSlider.value = maxSlider.value;
        }
        updateFill();
      });

      maxSlider.addEventListener('input', function () {
        if (+maxSlider.value < +minSlider.value) {
          maxSlider.value = minSlider.value;
        }
        updateFill();
      });

      minSlider.addEventListener('change', applyFilters);
      maxSlider.addEventListener('change', applyFilters);

      amountClear.addEventListener('click', function () {
        minSlider.value = AMT_MIN;
        maxSlider.value = AMT_MAX;
        updateFill();
        applyFilters();
      });

      var oldSentinel = filterBar.parentNode.querySelector('.top-sentinel');
      if (oldSentinel) {
        oldSentinel.remove();
      }

      var topSentinel = document.createElement('div');
      topSentinel.className = 'top-sentinel';
      topSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';
      filterBar.parentNode.insertBefore(topSentinel, filterBar);

      var bottomSentinel = document.createElement('div');
      bottomSentinel.style.cssText = 'position:relative;height:1px;pointer-events:none;';

      var storyContainer = document.querySelector('.insights-stories.initial') || document.querySelector('.insights-stories.ko');
      if (storyContainer) {
        storyContainer.appendChild(bottomSentinel);
      }

      var isSticky = false;

      function makeSticky() {
        if (isSticky) return;
        isSticky = true;
        filterBar.classList.remove('container');
        filterBar.classList.add('rbccm-deal-filter--sticky');
        inner.classList.add('rbccm-deal-filter--sticky');
      }

      function makeNormal() {
        if (!isSticky) return;
        isSticky = false;
        filterBar.classList.add('container');
        filterBar.classList.remove('rbccm-deal-filter--sticky');
        inner.classList.remove('rbccm-deal-filter--sticky');
      }

      function onScroll() {
        var topRect = topSentinel.getBoundingClientRect();
        // var bottomRect = bottomSentinel.getBoundingClientRect();
        // var height = filterBar.offsetHeight || 70;

        if (topRect.top < STICKY_TOP) {
          makeSticky();
        } else {
          makeNormal();
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });

      rebuildYearList();
      rebuildTypeList();
      updateFill();
      applyFilters();
      onScroll();
    };
  }

  $(document).ready(function () {
    $('.insights-dropdown-toggle').on({
      click: function (event) {
        event.preventDefault();
        $(this).toggleClass('active');
        $(this).next('.insights-dropdown-items').toggleClass('active').focus();
      },
      focusout: function () {
        var $toggle = $(this);
        $toggle.next('.insights-dropdown-items').data(
          'menuTimeout',
          setTimeout(function () {
            $toggle.removeClass('active');
            $toggle.next('.insights-dropdown-items').removeClass('active');
          }, 100)
        );
      },
      focusin: function () {
        clearTimeout($(this).next('.insights-dropdown-items').data('menuTimeout'));
      }
    });

    $('.insights-dropdown-items').on({
      focusout: function () {
        var $items = $(this);
        $items.data(
          'menuTimeout',
          setTimeout(function () {
            $items.removeClass('active');
            $items.prev('.insights-dropdown-toggle').removeClass('active');
          }, 100)
        );
      },
      focusin: function () {
        clearTimeout($(this).data('menuTimeout'));
      },
      keydown: function (event) {
        if (event.which === 27) {
          $(this).removeClass('active');
          $(this).prev('.insights-dropdown-toggle').removeClass('active');
          event.preventDefault();
        }
      }
    });

    $('.insights-dropdown-items label').on({
      click: function () {
        $(this).focus();
        clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
      },
      focusin: function () {
        clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
      },
      keydown: function (event) {
        if (event.which === 27) {
          $(this).parent('.insights-dropdown-items').removeClass('active');
          $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active');
          event.preventDefault();
        }
      }
    });

    $('.insights-dropdown-items input').on('change', function () {
      clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
    });

    $('#search-categories-list .category').on({
      click: function () {
        $('#search-categories-list .category').removeClass('active');
        $('#insights-search-bar #search').val('');
        $(this).toggleClass('active').focus();
        clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
      },
      focusin: function () {
        clearTimeout($(this).parent('.insights-dropdown-items').data('menuTimeout'));
      },
      keydown: function (event) {
        if (event.which === 27) {
          $(this).parent('.insights-dropdown-items').removeClass('active');
          $(this).parent('.insights-dropdown-items').prev('.insights-dropdown-toggle').removeClass('active');
          event.preventDefault();
        }
      }
    });

    $('#insights-search-bar input').on('change', function () {
      $('#search-categories-list li').removeClass('active');
    });

    $('#clear-search').on('click', function () {
      $('#search-categories-list .category').removeClass('active');
    });

    ko.bindingHandlers.dateString = {
      init: function (element, valueAccessor) {
        element.onchange = function () {
          var value = valueAccessor();
          value(formatDate(element.value).toDate());
        };
      },
      update: function (element, valueAccessor) {
        var value = valueAccessor();
        var unwrapped = ko.utils.unwrapObservable(value);

        if (unwrapped) {
          element.innerHTML = formatDate(unwrapped);
        }
      }
    };

    var page = window.location.hash !== ''
      ? parseInt(window.location.hash.replace('#', ''), 10)
      : 0;

    var model = new FormViewModel(Number.isFinite(page) ? page : 0);

    // Scope bindings to our KO container only — host pages may already
    // have their own ko.applyBindings running on the document, which
    // would otherwise throw "cannot apply bindings multiple times".
    var koEl = document.querySelector('.insights-stories.ko');
    if (koEl) {
      try { ko.cleanNode(koEl); } catch (e) {}
      ko.applyBindings(model, koEl);
    } else {
      // No filter container on this page — bind to document for back-compat
      // (matches original behaviour on pages that have no other KO instance).
      try { ko.applyBindings(model); } catch (e) {}
    }

    if (!window.location.hash) {
      if (getQueryValue('author')) {
        model.selectFromURL(null, getURLtag('author'));
      } else if (getQueryValue('tag')) {
        model.selectFromURL(getURLtag('tag'), null);
      }
    }

    model.initFilterBar();
    model.updateYearUI();

    // (Legacy "Filter by:" label rewrite removed — the static markup
    // now ships that text directly, no DOM patching needed.)

    var topics = getUrlParameter('t');
    if (topics !== undefined && topics !== false && topics !== null) {
      topics.split(',').forEach(function (value) {
        $("input[value='" + $.trim(value) + "']").trigger('click');
      });
    }

    $('#ls-row-3-area-1 .story-tiles > .row').slick({ dots: true });
    $('button.slick-autoplay-toggle-button').hide();
  });

  window.setPage = setPage;
  window.getQueryValue = getQueryValue;
  window.getURLtag = getURLtag;
  window.FormViewModel = FormViewModel;
})(window, document, window.jQuery, window.ko);