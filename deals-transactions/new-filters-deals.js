/* global ko, $, formatDate */

(function (window, document, $, ko) {
  'use strict';

  var DEALS_URL = 'transactions/data/deals.page';
  var INITIAL_VISIBLE_COUNT = 9;
  var LOAD_MORE_INCREMENT = 6;
  var RECENT_YEAR_CUTOFF = 2024;
  var STICKY_TOP = 60;

  var lmScroll = 0;

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

          var filterBar = document.getElementById('yf-filter-bar');
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

      var filterBar = document.getElementById('yf-filter-bar');
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

      if (!document.getElementById('yf-filter-bar-styles')) {
        var baseStyle = document.createElement('style');
        baseStyle.id = 'yf-filter-bar-styles';
        baseStyle.textContent = [
          '#yf-filter-bar.container{margin-left:15px;margin-right:15px;}',
          '@media (min-width:768px){#yf-filter-bar.container{margin-left:auto;margin-right:auto;max-width:720px;}}',
          '@media (min-width:992px){#yf-filter-bar.container{max-width:940px;}}',
          '@media (min-width:1200px){#yf-filter-bar.container{max-width:1140px;}}'
        ].join('');
        document.head.appendChild(baseStyle);
      }

      var existingStyles = document.getElementById('yf-x-css');
      if (existingStyles) {
        existingStyles.remove();
      }

      var style = document.createElement('style');
      style.id = 'yf-x-css';
      style.textContent = [
        '#yf-filter-bar .container{display:flex;align-items:center;flex-wrap:wrap;gap:6px;justify-content:flex-end;width:100%;}',
        '#yf-x-row{display:flex;align-items:center;flex-wrap:wrap;gap:10px;justify-content:flex-start;width:100%;padding:0 5px;box-sizing:border-box;}',
        '#yf-x-filter-lbl{font-size:13px;font-weight:700;color:#333;white-space:nowrap;margin-right:2px;}',
        '#yf-x-year-wrap,#yf-x-type-wrap{position:relative;display:inline-block;vertical-align:middle;}',
        '#yf-x-year-btn,#yf-x-type-btn{display:inline-flex;align-items:center;padding:7px 12px;border:1px solid #0051A5;border-radius:4px;background:#fff;color:#0051A5;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;justify-content:space-between;gap:6px;}',
        '#yf-x-year-btn{min-width:110px;}',
        '#yf-x-type-btn{min-width:140px;}',
        '#yf-x-year-btn:hover,#yf-x-type-btn:hover{background:#f0f6ff;}',
        '#yf-x-year-btn .arrow,#yf-x-type-btn .arrow{font-size:10px;transition:transform .2s;}',
        '#yf-x-year-lb,#yf-x-type-lb{display:none;position:absolute;left:0;top:calc(100% + 4px);background:#fff;border:1px solid #d3d3d3;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:700;max-height:280px;overflow-y:auto;padding:4px 0;margin:0;list-style:none;}',
        '#yf-x-year-lb{min-width:180px;}',
        '#yf-x-type-lb{min-width:240px;}',
        '#yf-x-year-lb li,#yf-x-type-lb li{display:flex;justify-content:space-between;align-items:center;padding:7px 14px;cursor:pointer;font-size:13px;color:#333;}',
        '#yf-x-year-lb li[data-value=""],#yf-x-type-lb li[data-value=""]{display:none!important;}',
        '#yf-x-year-lb li:hover,#yf-x-type-lb li:hover{background:#f0f6ff;}',
        '#yf-x-year-lb li.active,#yf-x-type-lb li.active{background:#e8f0fb;color:#0051A5;font-weight:600;}',
        '.ycnt,.tcnt{display:none!important;}',
        '#yf-x-count{display:none;font-size:12px;color:#666;margin-left:auto;white-space:nowrap;padding-right:5px;text-align:left;margin:0;}',
        '#yf-x-amt-wrap{display:inline-flex;align-items:center;gap:8px;vertical-align:middle;display:none;}',
        '#yf-x-amt-lbl{font-size:13px;font-weight:600;color:#333;white-space:nowrap;}',
        '#yf-x-rng-wrap{position:relative;display:inline-block;width:160px;height:28px;}',
        '#yf-x-rng-wrap input[type=range]{-webkit-appearance:none;appearance:none;position:absolute;width:100%;height:4px;background:transparent;outline:none;pointer-events:none;top:50%;transform:translateY(-50%);}',
        '#yf-x-rng-wrap input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#0051A5;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25);cursor:pointer;pointer-events:all;}',
        '#yf-x-track{position:absolute;width:100%;height:4px;background:#d3d3d3;border-radius:2px;top:50%;transform:translateY(-50%);}',
        '#yf-x-fill{position:absolute;height:4px;background:#0051A5;border-radius:2px;top:50%;transform:translateY(-50%);}',
        '#yf-x-amt-v{font-size:12px;color:#555;font-weight:600;white-space:nowrap;min-width:110px;}',
        '#yf-x-amt-clr{display:none;background:none;border:none;cursor:pointer;color:#0051A5;font-size:15px;padding:0;line-height:1;}',
        '#yf-x-tags{display:none;font-size:12px;width:100%;text-align:left;padding:0 5px;box-sizing:border-box;}',
        '.yf-x-tag{display:inline-flex;align-items:center;gap:3px;background:#e8f0fb;color:#0051A5;border-radius:12px;padding:2px 10px;font-size:12px;font-weight:600;margin-right:5px;}',
        '.yf-x-tag button{background:none;border:none;cursor:pointer;color:#0051A5;font-size:14px;line-height:1;padding:0 0 0 3px;}',
        '#yf-x-pagination{display:none;text-align:center;padding:28px 0 12px;width:100%;clear:both;}',
        '#yf-x-pagination button{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 10px;margin:0 3px;border:1px solid #d3d3d3;border-radius:4px;background:#fff;color:#333;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,color .15s,border-color .15s;vertical-align:middle;}',
        '#yf-x-pagination button:hover{background:#f0f6ff;border-color:#0051A5;color:#0051A5;}',
        '#yf-x-pagination button.pg-active{background:#0051A5;border-color:#0051A5;color:#fff;}',
        '#yf-x-pagination button:disabled{opacity:.35;cursor:default;pointer-events:none;}',
        '#load-more{position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;}',
        '#yf-x-pg-info{display:inline-block;font-size:12px;color:#666;margin-left:14px;vertical-align:middle;}'
      ].join('');
      document.head.appendChild(style);

      filterBar.classList.add('container');
      filterBar.style.cssText = 'background:#fff;border:1px solid #d3d3d3;margin-bottom:20px;padding:15px 0;';

      var dropWrap = document.getElementById('yf-drop-wrap');
      var yearLabel = filterBar.querySelector('label');
      var clearButton = document.getElementById('yf-clear-btn');
      var badge = document.getElementById('yf-count-badge');

      if (dropWrap) dropWrap.style.display = 'none';
      if (yearLabel) yearLabel.style.display = 'none';
      if (clearButton) clearButton.style.display = 'none';
      if (badge) badge.style.display = 'none';

      var inner = filterBar.firstElementChild;
      if (!inner) return;

      ['yf-x-row', 'yf-x-tags', 'yf-x-pagination'].forEach(function (id) {
        var existing = document.getElementById(id);
        if (existing) existing.remove();
      });

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
          var type = trimText(item.type);
          if (type) {
            counts[type] = (counts[type] || 0) + 1;
          }
        });

        return Object.keys(counts)
          .map(function (type) {
            return { value: type, count: counts[type] };
          })
          .sort(function (a, b) {
            return b.count - a.count;
          });
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

      var row = document.createElement('div');
      row.id = 'yf-x-row';

      var filterLabel = document.createElement('span');
      filterLabel.id = 'yf-x-filter-lbl';
      filterLabel.textContent = 'Filter by:';
      row.appendChild(filterLabel);

      var yearWrap = document.createElement('div');
      yearWrap.id = 'yf-x-year-wrap';

      var yearButton = document.createElement('button');
      yearButton.id = 'yf-x-year-btn';
      yearButton.type = 'button';
      yearButton.innerHTML = 'Year <span class="arrow">&#9660;</span>';

      var yearList = document.createElement('ul');
      yearList.id = 'yf-x-year-lb';
      yearList.innerHTML = '<li data-value=""><span style="font-style:italic;color:#555;">All years</span></li>';

      yearWrap.appendChild(yearButton);
      yearWrap.appendChild(yearList);
      row.appendChild(yearWrap);

      var typeWrap = document.createElement('div');
      typeWrap.id = 'yf-x-type-wrap';

      var typeButton = document.createElement('button');
      typeButton.id = 'yf-x-type-btn';
      typeButton.type = 'button';
      typeButton.innerHTML = 'Product Type <span class="arrow">&#9660;</span>';

      var typeList = document.createElement('ul');
      typeList.id = 'yf-x-type-lb';
      typeList.innerHTML = '<li data-value=""><span style="font-style:italic;color:#555;">All types</span></li>';

      typeWrap.appendChild(typeButton);
      typeWrap.appendChild(typeList);
      row.appendChild(typeWrap);

      var amountWrap = document.createElement('div');
      amountWrap.id = 'yf-x-amt-wrap';

      var amountLabel = document.createElement('span');
      amountLabel.id = 'yf-x-amt-lbl';
      amountLabel.textContent = 'Amount:';
      amountWrap.appendChild(amountLabel);

      var rangeWrap = document.createElement('div');
      rangeWrap.id = 'yf-x-rng-wrap';

      var track = document.createElement('div');
      track.id = 'yf-x-track';

      var fill = document.createElement('div');
      fill.id = 'yf-x-fill';

      var minSlider = document.createElement('input');
      minSlider.type = 'range';
      minSlider.id = 'yf-x-smin';
      minSlider.min = AMT_MIN;
      minSlider.max = AMT_MAX;
      minSlider.step = AMT_STEP;
      minSlider.value = AMT_MIN;

      var maxSlider = document.createElement('input');
      maxSlider.type = 'range';
      maxSlider.id = 'yf-x-smax';
      maxSlider.min = AMT_MIN;
      maxSlider.max = AMT_MAX;
      maxSlider.step = AMT_STEP;
      maxSlider.value = AMT_MAX;

      rangeWrap.appendChild(track);
      rangeWrap.appendChild(fill);
      rangeWrap.appendChild(minSlider);
      rangeWrap.appendChild(maxSlider);
      amountWrap.appendChild(rangeWrap);

      var amountValue = document.createElement('span');
      amountValue.id = 'yf-x-amt-v';
      amountWrap.appendChild(amountValue);

      var amountClear = document.createElement('button');
      amountClear.id = 'yf-x-amt-clr';
      amountClear.type = 'button';
      amountClear.textContent = '✕';
      amountClear.title = 'Clear amount filter';
      amountWrap.appendChild(amountClear);

      row.appendChild(amountWrap);

      var count = document.createElement('span');
      count.id = 'yf-x-count';
      row.appendChild(count);

      inner.appendChild(row);

      var tagsRow = document.createElement('div');
      tagsRow.id = 'yf-x-tags';
      inner.appendChild(tagsRow);

      var pagination = document.createElement('div');
      pagination.id = 'yf-x-pagination';

      var koContainer = getKoContainer();
      if (koContainer && koContainer.parentNode) {
        koContainer.parentNode.insertBefore(pagination, koContainer.nextSibling);
      }

      function rebuildYearList() {
        while (yearList.children.length > 1) {
          yearList.removeChild(yearList.lastChild);
        }

        getYearOptions().forEach(function (option) {
          var li = document.createElement('li');
          li.setAttribute('data-value', option.value);
          li.className = activeFilterYear === option.value ? 'active' : '';

          var label = document.createElement('span');
          label.textContent = option.value;

          var countEl = document.createElement('span');
          countEl.className = 'ycnt';
          countEl.textContent = option.count;

          li.appendChild(label);
          li.appendChild(countEl);
          yearList.appendChild(li);
        });
      }

      function rebuildTypeList() {
        while (typeList.children.length > 1) {
          typeList.removeChild(typeList.lastChild);
        }

        getTypeOptions().forEach(function (option) {
          var li = document.createElement('li');
          li.setAttribute('data-value', option.value);
          li.className = activeType === option.value ? 'active' : '';

          var label = document.createElement('span');
          label.textContent = option.value;

          var countEl = document.createElement('span');
          countEl.className = 'tcnt';
          countEl.textContent = option.count;

          li.appendChild(label);
          li.appendChild(countEl);
          typeList.appendChild(li);
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
          label.style.cssText = 'color:#777;margin-right:4px;font-size:12px;';
          label.textContent = 'Active filters:';
          tagsRow.appendChild(label);
        }

        function addTag(text, onClear) {
          addLabel();

          var tag = document.createElement('span');
          tag.className = 'yf-x-tag';
          tag.textContent = text + ' ';

          var clear = document.createElement('button');
          clear.type = 'button';
          clear.textContent = '×';
          clear.onclick = onClear;

          tag.appendChild(clear);
          tagsRow.appendChild(tag);
        }

        if (activeFilterYear) {
          addTag('Year: ' + activeFilterYear, function () {
            activeFilterYear = null;
            yearButton.innerHTML = 'Year <span class="arrow">&#9660;</span>';
            applyFilters();
          });
        }

        if (activeType) {
          addTag('Product Type: ' + activeType, function () {
            activeType = null;
            typeButton.innerHTML = 'Product Type <span class="arrow">&#9660;</span>';
            applyFilters();
          });
        }

        var min = parseInt(minSlider.value, 10);
        var max = parseInt(maxSlider.value, 10);

        if (min > AMT_MIN || max < AMT_MAX) {
          addTag(
            'Amount: ' + formatAmount(min) + ' – ' + (max >= AMT_MAX ? formatAmount(max) + '+' : formatAmount(max)),
            function () {
              minSlider.value = AMT_MIN;
              maxSlider.value = AMT_MAX;
              updateFill();
              applyFilters();
            }
          );
        }

        tagsRow.style.display = hasTags ? 'block' : 'none';
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
          pagination.style.display = 'none';
          return;
        }

        pagination.style.display = 'block';

        function makeButton(label, target, isActive, disabled) {
          var button = document.createElement('button');
          button.innerHTML = label;

          if (isActive) button.classList.add('pg-active');
          if (disabled) button.disabled = true;

          button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            currentPage = target;
            showPage(currentPage);
            renderPagination(total, currentPage);

            var bar = document.getElementById('yf-filter-bar');
            if (bar) {
              window.scrollTo({
                top: bar.getBoundingClientRect().top + window.scrollY - 80,
                behavior: 'smooth'
              });
            }
          });

          return button;
        }

        pagination.appendChild(makeButton('&#8592;', page - 1, false, page === 1));

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
            ellipsis.textContent = '…';
            ellipsis.style.cssText = 'display:inline-block;padding:0 6px;line-height:36px;color:#999;font-size:13px;vertical-align:middle;';
            pagination.appendChild(ellipsis);
            return;
          }

          pagination.appendChild(makeButton(value, value, value === page, false));
        });

        pagination.appendChild(makeButton('&#8594;', page + 1, false, page === pages));

        var info = document.createElement('span');
        info.id = 'yf-x-pg-info';
        info.textContent = ((page - 1) * PAGE_SIZE + 1) + '–' + Math.min(page * PAGE_SIZE, total) + ' of ' + total + ' deals';
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

          pagination.style.display = 'none';
          count.style.display = 'none';
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
              var tileType = item ? trimText(item.type) : '';
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

            var passes = (yearActive && passYear) || (typeActive && passType) || (amountActive && passAmount);

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
            count.textContent = 'No Deals Matching Filters';
            count.style.cssText = 'display:block;font-size:12px;color:#c00;margin-left:auto;white-space:nowrap;padding-right:5px;text-align:left;margin:0;';
          } else {
            count.textContent = matchedTiles.length + ' Deal' + (matchedTiles.length !== 1 ? 's' : '');
            count.style.cssText = 'display:none;font-size:12px;color:#666;margin-left:auto;white-space:nowrap;padding-right:5px;text-align:left;margin:0;';
          }
          stripKoMarginTop();
          updateTags();
        }, 200);
      }

      function openDropdown(list, button) {
        list.style.display = 'block';
        var arrow = button.querySelector('.arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }

      function closeDropdown(list, button) {
        list.style.display = 'none';
        var arrow = button.querySelector('.arrow');
        if (arrow) arrow.style.transform = '';
      }

      yearButton.addEventListener('click', function (event) {
        event.stopPropagation();
        rebuildYearList();

        if (yearList.style.display === 'none' || !yearList.style.display) {
          openDropdown(yearList, yearButton);
        } else {
          closeDropdown(yearList, yearButton);
        }
      });

      yearList.addEventListener('click', function (event) {
        var item = event.target.closest('li');
        if (!item) return;

        var value = item.getAttribute('data-value') || null;
        activeFilterYear = value || null;

        yearButton.innerHTML = (value
          ? '<span style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle;">' + value + '</span>'
          : 'Year') + ' <span class="arrow">&#9660;</span>';

        closeDropdown(yearList, yearButton);
        applyFilters();
      });

      typeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        rebuildTypeList();

        if (typeList.style.display === 'none' || !typeList.style.display) {
          openDropdown(typeList, typeButton);
        } else {
          closeDropdown(typeList, typeButton);
        }
      });

      typeList.addEventListener('click', function (event) {
        var item = event.target.closest('li');
        if (!item) return;

        var value = item.getAttribute('data-value') || null;
        activeType = value || null;

        typeButton.innerHTML = (value
          ? '<span style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle;">' + value + '</span>'
          : 'Product Type') + ' <span class="arrow">&#9660;</span>';

        closeDropdown(typeList, typeButton);
        applyFilters();
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
        filterBar.style.cssText =
          'background:#fff;border-bottom:1px solid #d3d3d3;margin:0;padding:15px 0;position:fixed;top:' +
          STICKY_TOP +
          'px;left:0;right:0;z-index:500;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
      }

      function makeNormal() {
        if (!isSticky) return;
        isSticky = false;

        filterBar.classList.add('container');
        filterBar.style.cssText = 'background:#fff;border:1px solid #d3d3d3;margin-bottom:20px;padding:15px 0;';
      }

      function onScroll() {
        var topRect = topSentinel.getBoundingClientRect();
        var bottomRect = bottomSentinel.getBoundingClientRect();
        var height = filterBar.offsetHeight || 70;

        if (topRect.top < STICKY_TOP && bottomRect.top > STICKY_TOP + height) {
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
    ko.applyBindings(model);

    if (!window.location.hash) {
      if (getQueryValue('author')) {
        model.selectFromURL(null, getURLtag('author'));
      } else if (getQueryValue('tag')) {
        model.selectFromURL(getURLtag('tag'), null);
      }
    }

    model.initFilterBar();
    model.updateYearUI();

    var filterLabel = document.querySelector('#yf-filter-bar label[for="yf-drop-btn"]') ||
      document.querySelector('#yf-filter-bar label');

    if (filterLabel) {
      filterLabel.textContent = 'Filter by:';
    }

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