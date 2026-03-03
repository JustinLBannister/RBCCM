var lmScroll = 0;
function FormViewModel(t) {
  var e = this;
  e.show = ko.observable(t === 0 ? 5 : 9 + 6 * t);
  e.items = ko.observableArray();
  e.topics = ko.observableArray().extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } });
  e.pubs = ko.observableArray();
  e.authors = ko.observableArray();
  e.notify = ko.observable();
  e.loaded = ko.observable(false);
  e.loading = ko.observable(false);
  e.year = new Date().getFullYear();
  e.fronly = ko.observable(false);
  e.query = ko.observable("").extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } });

  e.filteredItems = ko.computed(function () {
    e.notify();
    if (!e.topics().length && !e.pubs().length && !e.authors().length && !e.query().length) {
      return e.items();
    }

    return ko.utils.arrayFilter(e.items(), function (t) {
      let topicMatch = false, pubMatch = false, authorMatch = false;

      if (e.pubs().length > 0) {
        $.each(e.pubs(), function (_, p) {
          if (t.title.toLowerCase().includes(p.toLowerCase())) pubMatch = true;
        });
      } else pubMatch = true;

      if (e.authors().length > 0 && t.author !== undefined) {
        $.each(e.authors(), function (_, a) {
          if (t.author.toLowerCase().includes(a.toLowerCase())) authorMatch = true;
        });
      } else authorMatch = true;

      if (e.topics().length > 0) {
        let allTags = [];
        if (t.tags) allTags = allTags.concat(t.tags.split(","));
        if (t.category) allTags = allTags.concat(t.category.split(","));

        $.each(allTags, function (_, tag) {
          if (!tag.trim()) return;
          const tagLower = tag.trim().toLowerCase();
          topicMatch = e.topics().some(topic => topic.toLowerCase().includes(tagLower) || tagLower.includes(topic.toLowerCase()));
          if (topicMatch) return false;
        });
      } else topicMatch = true;

      return e.query() ? (topicMatch || pubMatch || authorMatch) : (topicMatch && pubMatch && authorMatch);
    });
  });

  e.playPodcast = function () {
    var t = $(".external-button-group").find(".story-podcast-playing"),
        i = t.find("iframe");
    t.toggle();
    t.is(":visible") ? i.attr("src", i.data("src")) : (i.data("src", i.attr("src")), i.attr("src", ""));
  };

  e.selectNoTopics = function () {
    e.show(9);
    e.query("");
    e.topics([]);
    e.pubs([]);
    e.authors([]);
    e.notify.notifySubscribers();
  };

  e.selectTopic = function (t) {
    e.show(0);
    e.loadContent();
    e.query("");
    e.topics(t);
    e.pubs([]);
    e.authors([]);
    e.notify.notifySubscribers();
    $(".initial").remove();
    e.show(9);
  };

  e.selectAuthor = function (t) {
    e.show(0);
    e.loadContent();
    e.query("");
    e.topics([]);
    e.pubs([]);
    e.authors([t]);
    e.notify.notifySubscribers();
    $(".initial").remove();
    e.show(9);
  };

  e.query.subscribe(function () {
    e.loadContent();
    var t = e.query();
    e.topics([t]);
    e.pubs([t]);
    e.authors([t]);
    e.notify.notifySubscribers();
    $("#clear-search").show();
  });

  e.resetQuery = function () {
    e.loadContent();
    e.query("");
    e.topics([]);
    e.pubs([]);
    e.authors([]);
    e.notify.notifySubscribers();
    $("#clear-search").hide();
  };

  e.selectFromURL = function (t, i) {
    e.loadContent();
    e.query("");
    e.topics(t ? [t] : []);
    e.pubs([]);
    e.authors(i ? [i] : []);
    e.notify.notifySubscribers();
  };

  e.loadContent = function () {
    var t = $(window).scrollTop();
    if (e.show() === 0) e.show(5);
    if (e.items().length < 1) {
      $(".initial").remove();
      $("#load-more").text("Loading...");
      e.fetchYear(e.year);
      e.fetchYear(e.year - 1);
      $(window).scrollTop(t);
    } else {
      $("#load-more").text("See more episodes");
    }
  };

  e.fetchYear = function (t) {
    $.ajax({
      url: "https://www.rbccm.com/en/gib/ma-data/data/" + t + "-strategic-alternatives.page",
      dataType: "xml",
      cache: true,
      success: function (i) {
        $(i).find("news").each(function () {
          var o = {
            date: $(this).find("date").text(),
            link: $(this).find("link").text(),
            thumbnail: $(this).find("thumbnail").text(),
            podcast: $(this).find("podcast").text(),
            title: $(this).find("title").text(),
            description: $(this).find("description").text(),
            category: $(this).find("category").text() || "Podcast",
            apple: $(this).find("apple").text(),
            spotify: $(this).find("spotify").text(),
            region: $(this).find("region").text(),
            author: $(this).find("author").text(),
            tags: $(this).find("tags").text(),
            readtime: $(this).find("readtime").text(),
            watchtime: $(this).find("watchtime").text(),
            type: $(this).find("type").text()
          };

          o.year = o.date.split(",")[1];
          o.date1 = o.date.split(",")[0];
          o.month = o.date1.split(" ")[0];
          o.newdate = o.month + " " + o.year;
          if (o.description.length > 200) {
            o.description = o.description.substring(0, o.description.substring(0, 200).lastIndexOf(" ")) + "...";
            if (o.description.endsWith(",")) {
              o.description = o.description.slice(0, -1);
            }
          }
          if (o.thumbnail.charAt(0) === "/") {
            o.thumbnail = "//www.rbccm.com" + o.thumbnail;
          }

          // Deduplicate by title before pushing
          if (!e.items().some(item => item.title === o.title)) {
            e.items.push(o);
          }
        });

        e.loaded(true);
        $("#load-more").text("See more episodes");
        $(".initial").remove();
        e.notify.notifySubscribers();
        // On user click, recurse to next year — but skip current-1 since it was pre-fetched on init
        if (t > 2016 && e.userRequestedMore && t !== e.year - 1) e.fetchYear(t - 1);
        $(window).scrollTop(lmScroll);
      }
    });
  };

  e.userRequestedMore = false;

  e.loadMore = function () {
    e.userRequestedMore = true;
    lmScroll = $(window).scrollTop();
    $("#load-more").text("Loading...");
    setTimeout(function () {
      if (e.items().length < 1) {
        e.fetchYear(e.year);
      } else {
        $(".initial").remove();
        $("#load-more").text("See more episodes");
      }
      if (e.show() === 0) {
        e.show(11);
      } else {
        e.show(e.show() + 6);
      }
      setPage((e.show() - 5) / 6);
      $(window).scrollTop(lmScroll);
    }, 50);
  };

  // ============================================================
  // V2 CHANGE: Always fetch on init regardless of hash/page state.
  // Replaces the old conditional block that only fetched when
  // show() > 9. loadContent() handles both fresh load and
  // deep-link (hash) cases correctly.
  // ============================================================
  setTimeout(function () {
    if (getUrlParameter("t") === undefined) {
      e.loadContent();
    }
    if (e.show() > 5) {
      setPage((e.show() - 5) / 6);
    }
  }, 0);
}

function setPage(t) {
  if (t !== 0) {
    history.pushState ? history.pushState(null, null, "#" + Math.ceil(t)) : location.hash = "#" + Math.ceil(t);
  }
}

function getQueryValue(t) {
  var e = location.search.substring(1).split("&");
  for (var i = 0; i < e.length; i++) {
    var s = e[i].split("=");
    if (s[0] === t) return s[1];
  }
  return false;
}

function getURLtag(t) {
  var e = getQueryValue(t);
  return e ? e.replace(/%20/g, " ").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
}

function getUrlParameter(name) {
  name = name.replace(/[Ã®â‚¬Â]/, "\Ã®â‚¬Â").replace(/[Ã®â‚¬Â]/, "\Ã®â‚¬Â");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function () {
  // Prevent duplicate Knockout bindings
  if (!ko.dataFor(document.body)) {
    let viewModel;
    if (location.hash !== "") {
      viewModel = new FormViewModel(parseInt(location.hash.replace("#", "")));
    } else {
      viewModel = new FormViewModel(0);
    }

    ko.applyBindings(viewModel);

    if (getQueryValue("author")) {
      viewModel.selectFromURL(null, getURLtag("author"));
    } else if (getQueryValue("tag")) {
      viewModel.selectFromURL(getURLtag("tag"), null);
    }

    const tagParam = getUrlParameter("t");
    if (tagParam !== undefined) {
      const tags = tagParam.split(",");
      $.each(tags, function (_, tag) {
        $("input[value='" + $.trim(tag) + "']").click();
      });
    }
  }

  if ($(".insights-dropdown-toggle").on({
        click: function(t) {
            $(this).toggleClass("active"),
            $(this).next(".insights-dropdown-items").toggleClass("active").focus(),
            t.preventDefault()
        },
        focusout: function() {
            $(this).next(".insights-dropdown-items").data("menuTimeout", setTimeout(function() {
                $(this).removeClass("active"),
                $(this).next(".insights-dropdown-items").removeClass("active")
            }
            .bind(this), 100))
        },
        focusin: function() {
            clearTimeout($(this).next(".insights-dropdown-items").data("menuTimeout"))
        }
    }),
    $(".insights-dropdown-items").on({
        focusout: function() {
            $(this).data("menuTimeout", setTimeout(function() {
                $(this).removeClass("active"),
                $(this).prev(".insights-dropdown-toggle").removeClass("active")
            }
            .bind(this), 100))
        },
        focusin: function() {
            clearTimeout($(this).data("menuTimeout"))
        },
        keydown: function(t) {
            27 === t.which && ($(this).removeClass("active"),
            $(this).prev(".insights-dropdown-toggle").removeClass("active"),
            t.preventDefault())
        }
    }),
    $(".insights-dropdown-items label").on({
        click: function(t) {
            $(this).focus(),
            clearTimeout($(this).parent(".insights-dropdown-items").data("menuTimeout"))
        },
        focusin: function() {
            clearTimeout($(this).parent(".insights-dropdown-items").data("menuTimeout"))
        },
        keydown: function(t) {
            27 === t.which && ($(this).parent(".insights-dropdown-items").removeClass("active"),
            $(this).parent(".insights-dropdown-items").prev(".insights-dropdown-toggle").removeClass("active"),
            t.preventDefault())
        }
    }),
    $(".insights-dropdown-items input").change(function() {
        clearTimeout($(this).parent(".insights-dropdown-items").data("menuTimeout"))
    }),
    $("#search-categories-list .category").on({
        click: function(t) {
            $("#search-categories-list .category").removeClass("active"),
            $("#insights-search-bar #search").val(""),
            $(this).toggleClass("active").focus(),
            clearTimeout($(this).parent(".insights-dropdown-items").data("menuTimeout"))
        },
        focusin: function() {
            clearTimeout($(this).parent(".insights-dropdown-items").data("menuTimeout"))
        },
        keydown: function(t) {
            27 === t.which && ($(this).parent(".insights-dropdown-items").removeClass("active"),
            $(this).parent(".insights-dropdown-items").prev(".insights-dropdown-toggle").removeClass("active"),
            t.preventDefault())
        }
    }),
    $("#insights-search-bar input").change(function() {
        $("#search-categories-list li").removeClass("active")
    }),
    $("#clear-search").on("click", function() {
        $("#search-categories-list .category").removeClass("active")
    })
  );

  var e = getUrlParameter("t");
  if (void 0 !== e) {
    var i = e.split(",");
    $.each(i, function(t, e) {
      $("input[value='" + $.trim(e) + "']").click()
    })
  }

});