/* =========================================
   RBC CM -- Upcoming Conferences

   Two responsibilities in one IIFE:

   1. Mobile slick carousel (mirrors the leadership-slider pattern):
      - variableWidth + centerMode for the peek effect
      - External arrow buttons + custom dots wrapper
      - Slick destroyed when viewport crosses to desktop OR when a filter is active

   2. Filter / search:
      - Month + Region dropdowns auto-populate from the data-month / data-region
        attributes on rendered cards (XSL already sorts cards chronologically)
      - Title search is case-insensitive, lives off data-title
      - Default state shows the first 6 cards (CSS hides nth-of-type(n+7) via the
        :not(.is-filtered) rule); when any filter is active, the wrapper gains
        `.is-filtered` (lifts the 6-cap) and non-matching cards gain `.is-filtered-out`
      - Empty state element (#rbccm-uc-empty) appears when no card matches
   ========================================= */
(function () {
  if (typeof jQuery === 'undefined') return;
  var $ = jQuery;

  $(function () {
    var $section = $('#rbccm-upcoming-conferences');
    if (!$section.length) return;

    var $track     = $section.find('#rbccm-upcoming-conferences-cards');
    var $dots      = $section.find('#rbccm-uc-dots');
    var $prev      = $section.find('#rbccm-uc-prev');
    var $next      = $section.find('#rbccm-uc-next');
    var $search    = $section.find('#rbccm-uc-search');
    var $monthSel  = $section.find('#rbccm-uc-filter-month');
    var $regionSel = $section.find('#rbccm-uc-filter-region');
    var $empty     = $section.find('#rbccm-uc-empty');
    var $clearBtn  = $section.find('#rbccm-uc-clear');

    // Snapshot the original cards markup BEFORE slick ever touches it.
    // destroyCarousel() restores from this snapshot so each destroy lands clean.
    // applyFilters() re-applies the .is-filtered-out classes after that restore.
    var originalCardsHtml = $track.html();

    function isMobile() {
      return window.matchMedia('(max-width: 991.98px)').matches;
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Slick 1.9 stores its instance as a DOM property (element.slick), not jQuery data --
    // so the class is the canonical "is slick wired up" signal.
    function slickReady() {
      return $track.hasClass('slick-initialized');
    }

    // Cards we care about (skip slick's runtime clones).
    function getCards() {
      return $track.find('.rbccm-upcoming-conferences__card').not('.slick-cloned');
    }

    // -- Build Month + Region dropdowns from rendered card attributes --
    // XSL sorts cards chronologically, so month iteration order is already correct.
    // Regions get alphabetized for predictable UI.
    function buildFilterOptions() {
      var months = [];
      var monthSeen = {};
      var regions = [];
      var regionSeen = {};

      getCards().each(function () {
        var m = $(this).attr('data-month');
        var r = $(this).attr('data-region');
        if (m && !monthSeen[m]) { monthSeen[m] = true; months.push(m); }
        if (r && !regionSeen[r]) { regionSeen[r] = true; regions.push(r); }
      });

      months.forEach(function (m) {
        $monthSel.append($('<option>').val(m).text(m));
      });
      regions.sort().forEach(function (r) {
        $regionSel.append($('<option>').val(r).text(r));
      });
    }

    // -- Arrow click wiring --
    $prev.on('click', function () {
      if (!slickReady()) return;
      try { $track.slick('slickPrev'); } catch (e) { /* slick mid-teardown */ }
    });
    $next.on('click', function () {
      if (!slickReady()) return;
      try { $track.slick('slickNext'); } catch (e) { /* slick mid-teardown */ }
    });

    // -- Sync arrow enabled/disabled state --
    function syncArrows() {
      if (!slickReady()) return;
      var slick;
      try { slick = $track.slick('getSlick'); } catch (e) { return; }
      if (!slick) return;
      var current    = slick.currentSlide;
      var total      = slick.slideCount;
      var isInfinite = slick.options.infinite;

      if (isInfinite) {
        $prev.add($next)
          .prop('disabled', false)
          .attr('aria-disabled', 'false')
          .css('opacity', 1);
        return;
      }

      var cardWidth    = $track.find('.rbccm-upcoming-conferences__card').first().outerWidth(true);
      var trackWidth   = $track.width();
      var visibleCards = cardWidth > 0 ? Math.ceil(trackWidth / cardWidth) : 1;
      var maxIndex     = total - visibleCards;

      var atStart = current <= 0;
      var atEnd   = current >= maxIndex;

      $prev.prop('disabled', atStart)
        .attr('aria-disabled', atStart ? 'true' : 'false')
        .css('opacity', atStart ? 0.3 : 1);
      $next.prop('disabled', atEnd)
        .attr('aria-disabled', atEnd ? 'true' : 'false')
        .css('opacity', atEnd ? 0.3 : 1);
    }

    // -- Slick init (mobile only, only when no filters are active) --
    function initCarousel() {
      if (typeof $.fn.slick === 'undefined') return;
      if ($track.hasClass('slick-initialized')) return;

      // Add the modifier class FIRST so the 343px card width is in effect
      // when slick measures each card. Then force a reflow before init.
      $section.addClass('is-carousel');
      // eslint-disable-next-line no-unused-expressions
      $track[0].offsetWidth; // force layout flush

      $track.slick({
        slidesToShow:    1,
        slidesToScroll:  1,
        variableWidth:   true,
        infinite:        true,
        initialSlide:    0,
        arrows:          false,
        dots:            true,
        dotsClass:       'slick-dots',
        appendDots:      $dots,
        speed:           reducedMotion ? 0 : 350,
        cssEase:         reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        easing:          'linear',
        useCSS:          true,
        useTransform:    true,
        fade:            false,
        centerMode:      true,
        centerPadding:   '0px',
        adaptiveHeight:  false,
        rows:            1,
        slidesPerRow:    1,
        draggable:       true,
        swipe:           true,
        swipeToSlide:    true,
        touchMove:       true,
        touchThreshold:  5,
        edgeFriction:    0.35,
        autoplay:        false,
        accessibility:   false,
        respondTo:       'window',
        mobileFirst:     false,
        waitForAnimate:  true,
        zIndex:          1000
      });
    }

    function destroyCarousel() {
      if (!$track.hasClass('slick-initialized')) return;

      try { $track.slick('unslick'); } catch (e) { /* no-op */ }
      $section.removeClass('is-carousel');

      // Nuclear reset: restore the exact original cards markup so each destroy lands
      // in the same clean state. Prevents slick clones from accumulating across cycles.
      // applyFilters() re-applies any .is-filtered-out classes after this.
      $track.html(originalCardsHtml);
      $track.removeAttr('style');
      $dots.empty();

      $track.removeData('slick');
      $track.off('.slick');
      $track.removeClass('slick-initialized slick-slider slick-dotted');
    }

    // -- Slick loader (CDN fallback if not already on the page) --
    function ensureSlickLoaded(cb) {
      if (typeof $.fn.slick !== 'undefined') { cb(); return; }
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
      s.integrity = 'sha512-HGOnQO9+SP1V92SrtZfjqxxtLmVzqZpjFFekvzZVWoiASSQgSr4cw9Kqd2+l8Llp4Gm0G8GIFJ4ddwZilcdb8A==';
      s.crossOrigin = 'anonymous';
      s.referrerPolicy = 'no-referrer';
      s.onload = function () { cb(); };
      document.head.appendChild(s);
    }

    // -- afterChange / init: clean slick's aria hacks, keep arrows reachable --
    $track.on('afterChange init', function () {
      syncArrows();

      $track.find('.slick-slide').each(function () {
        $(this).removeAttr('aria-hidden');
        $(this).find('a, button').removeAttr('tabindex');
      });
      $prev.add($next).attr('tabindex', '0');
    });

    // -- Apply current search + filter state to cards AND carousel --
    // This is the single entry point that owns both:
    //   - whether the slick carousel should be running (mobile + no filters)
    //   - which cards are visible (via .is-filtered + .is-filtered-out classes)
    function applyFilters() {
      var q = ($search.val() || '').trim().toLowerCase();
      var m = $monthSel.val() || '';
      var r = $regionSel.val() || '';
      var filtersActive = !!(q || m || r);
      var mobile = isMobile();

      // Carousel lifecycle: slick only runs on mobile when no filters are active.
      // Active filters -> destroy slick so cards stack vertically and show/hide cleanly.
      if (mobile && !filtersActive) {
        if (!slickReady()) {
          ensureSlickLoaded(initCarousel);
        }
      } else {
        if (slickReady()) {
          destroyCarousel();
        }
      }

      $track.toggleClass('is-filtered', filtersActive);

      var visibleCount = 0;
      getCards().each(function () {
        var $card  = $(this);
        var title  = $card.attr('data-title')  || '';
        var month  = $card.attr('data-month')  || '';
        var region = $card.attr('data-region') || '';

        // All three filters are AND'd. A card has to satisfy every active
        // filter to remain visible (search keyword, selected month, selected
        // region). Empty / unselected filters pass vacuously.
        var matchQ = !q || title.indexOf(q) >= 0;
        var matchM = !m || month === m;
        var matchR = !r || region === r;
        var match  = matchQ && matchM && matchR;

        if (filtersActive) {
          $card.toggleClass('is-filtered-out', !match);
          if (match) visibleCount++;
        } else {
          $card.removeClass('is-filtered-out');
        }
      });

      // Empty state
      if (filtersActive && visibleCount === 0) {
        $empty.removeAttr('hidden');
      } else {
        $empty.attr('hidden', 'hidden');
      }
    }

    // -- Wire filter / search listeners --
    $search.on('input', applyFilters);
    $monthSel.on('change', applyFilters);
    $regionSel.on('change', applyFilters);

    // -- Clear filters button (lives inside the empty state) --
    // Resets all three filter inputs and re-runs applyFilters, which:
    //   - flips filtersActive back to false
    //   - removes .is-filtered + .is-filtered-out classes
    //   - hides the empty state and restores the default-6 card view
    //   - re-inits the mobile carousel if applicable
    $clearBtn.on('click', function () {
      $search.val('');
      $monthSel.val('');
      $regionSel.val('');
      applyFilters();
      // Return focus to the search input so keyboard users land in a useful spot
      $search.focus();
    });

    // -- Initial state --
    buildFilterOptions();
    applyFilters();

    // -- Viewport change: re-evaluate carousel + reposition slick --
    var rTimer;
    $(window).on('resize.rbccmUpcoming', function () {
      clearTimeout(rTimer);
      rTimer = setTimeout(function () {
        applyFilters();
        if (slickReady()) {
          $track.slick('setPosition');
          syncArrows();
        }
      }, 150);
    });
  });
})();
