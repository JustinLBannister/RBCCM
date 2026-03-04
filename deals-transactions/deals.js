// deals.js — annotated diff, full ViewModel shown
var lmScroll = 0;
function FormViewModel(page) {
  var self = this;
  self.show = ko.observable(9 + page * 6);
  self.items = ko.observableArray();
  self.topics = ko.observableArray().extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' } });
  self.pubs = ko.observableArray();
  self.authors = ko.observableArray();
  self.notify = ko.observable();
  self.loaded = ko.observable(false);
  self.loading = ko.observable(false);
  // ✅ CHANGED: was `self.year = new Date().getFullYear()` (plain number)
  // Now it's an observable so UI and filteredItems can react to it
  self.year = ko.observable(null); // null = "All Years"
  self.fronly = ko.observable(false);
  self.query = ko.observable('').extend({ rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' } });
  // ✅ NEW: computed list of distinct years from loaded items, descending
  self.availableYears = ko.computed(function () {
    var years = [];
    ko.utils.arrayForEach(self.items(), function (item) {
      // ✅ FIX: was item.date.split(',')[1] — dates are "Jan 2026", no comma
      var y = item.date ? item.date.split(' ')[1] : null;
      if (y && years.indexOf(y) === -1) years.push(y);
    });
    return years.sort(function (a, b) { return b - a; }); // descending
  });
  self.filteredItems = ko.computed(function () {
    self.notify();
    var selectedYear = self.year();
    var noFilters = (
      self.topics().length === 0 &&
      self.pubs().length === 0 &&
      self.authors().length === 0 &&
      self.query().length === 0
    );
    var pool = noFilters ? self.items() : ko.utils.arrayFilter(self.items(), function (item) {
      var tmatch = false, pmatch = false, amatch = false;
      // pubs filter (title)
      if (self.pubs().length > 0) {
        $.each(self.pubs(), function (key, value) {
          if (item.title.toLowerCase().indexOf(value.toLowerCase()) !== -1) pmatch = true;
        });
      } else { pmatch = true; }
      // author filter
      if (self.authors().length > 0) {
        $.each(self.authors(), function (key, value) {
          if (item.author !== undefined &&
              item.author.toString().toLowerCase().indexOf(value.toLowerCase()) !== -1) {
            amatch = true;
          }
        });
      } else { amatch = true; }
      // topic / tag / category filter
      if (self.topics().length > 0) {
        var itemTopics;
        if (item.tags !== undefined) {
          var itemTags = item.tags.split(',');
          itemTopics = item.category !== undefined ? itemTags.concat(item.category.split(',')) : itemTags;
        } else if (item.category !== undefined) {
          itemTopics = item.category.split(',');
        }
        $.each(itemTopics, function (key, value) {
          if ($.trim(value)) {
            if (self.topics().filter(function (t) {
              return t.toLowerCase().indexOf($.trim(value.toLowerCase())) !== -1;
            })[0] !== undefined ||
            self.topics().filter(function (t) {
              return $.trim(value.toLowerCase()).indexOf(t.toLowerCase()) !== -1;
            })[0] !== undefined) {
              tmatch = true;
            }
          }
        });
      } else { tmatch = true; }
      if (self.query()) return tmatch || pmatch || amatch;
      return tmatch && pmatch && amatch;
    });
    // ✅ NEW: apply year filter on top of existing filters
    if (selectedYear) {
      return ko.utils.arrayFilter(pool, function (item) {
        // ✅ FIX: parse year from "MMM YYYY" format correctly
        var itemYear = item.date ? item.date.split(' ')[1] : null;
        return itemYear === String(selectedYear);
      });
    }
    return pool;
  });
  // ✅ NEW: select a year (clears other filters, same pattern as selectTopic)
  self.selectYear = function (y) {
    self.show(0);
    self.loadContent();
    self.query('');
    self.topics([]);
    self.pubs([]);
    self.authors([]);
    self.year(y);           // set the observable
    self.notify.notifySubscribers();
    $('.initial').remove(); // remove static tiles
    self.show(9);
  };
  // ✅ NEW: clear year filter (show all years)
  self.clearYear = function () {
    self.year(null);
    self.show(9);
    self.notify.notifySubscribers();
  };
  // ---- existing functions unchanged below ----
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
    if (self.show() === 0) self.show(9);
    if (self.items().length < 1) {
      $('.initial').remove();
      $('#load-more').text('Loading...');
      // ✅ CHANGED: fetchYear now called without passing self.year since it's observable
      // Pass the raw year value or current year as fallback
      self.fetchYear(new Date().getFullYear());
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
          item.date = $(this).find('date').text();
          // ✅ FIX: was item.date.split(',')[1] — should be split(' ')[1]
          item.year = item.date.split(' ')[1];
          item.link = $(this).find('link').text();
          item.thumbnail = $(this).find('thumbnail').text();
          item.title = $(this).find('title').text();
          item.description = $(this).find('description').text();
          if (item.description.length > 130) {
            item.description = item.description.substring(0, item.description.substring(0, 130).lastIndexOf(' ')) + '...';
            if (item.description.charAt(item.description.length - 1) === ',') {
              item.description = item.description.substring(0, item.description.length - 1);
            }
          }
          item.role = $(this).find('role').text();
          item.status = $(this).find('status').text();
          item.amount = $(this).find('amount').text();
          item.region = $(this).find('region').text();
          item.specialty = $(this).find('specialty').text();
          self.items().push(item);
        });
        $('#load-more').text('Load More');
        if ($('.initial').length > 0) $('.initial').remove();
        self.notify.notifySubscribers();
        $(window).scrollTop(lmScroll);
      }
    });
  };
  self.loadMore = function () {
    lmScroll = $(window).scrollTop();
    $('#load-more').text('Loading...');
    setTimeout(function () {
      if (self.items().length < 1) {
        self.fetchYear(new Date().getFullYear());
      } else {
        $('.initial').remove();
        $('#load-more').text('Load More');
      }
      if (self.show() === 0) {
        self.show(18);
      } else {
        self.show(self.show() + 6);
      }
      setPage((self.show() - 9) / 6);
      $(window).scrollTop(lmScroll);
    }, 50);
    $('#load-more').hide();
  };
  if (self.show() > 9) {
    $('.initial').remove();
    $('#load-more').text('Loading...');
    setTimeout(function () {
      if (self.items().length < 1 && getUrlParameter('t') === undefined) {
        self.fetchYear(new Date().getFullYear());
      } else {
        $('#load-more').text('Load More');
      }
      setPage((self.show() - 9) / 6);
    }, 50);
  }
}