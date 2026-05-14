/* =========================================
   RBC CM — Upcoming Conferences
   Mobile slick carousel mirroring the leadership-slider pattern:
   - variableWidth + centerMode (peek effect)
   - External arrow buttons + custom dots wrapper
   - Init / afterChange handlers
   - Slick destroyed when viewport crosses to desktop (CSS grid takes over)
   ========================================= */
(function () {
  if (typeof jQuery === 'undefined') return;
  var $ = jQuery;

  $(function () {
    var $section = $('#rbccm-upcoming-conferences');
    if (!$section.length) return;

    var $track    = $section.find('#rbccm-upcoming-conferences-cards');
    var $dots     = $section.find('#rbccm-uc-dots');
    var $prev     = $section.find('#rbccm-uc-prev');
    var $next     = $section.find('#rbccm-uc-next');

    // Snapshot the original markup of the cards container BEFORE slick ever touches it,
    // so we can hard-reset on every destroy and avoid cumulative slick clones.
    var originalCardsHtml = $track.html();

    function isMobile() {
      return window.matchMedia('(max-width: 991.98px)').matches;
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Slick 1.9 stores its instance as a DOM property (element.slick), not jQuery data —
    // so the class is the canonical "is slick wired up" signal.
    function slickReady() {
      return $track.hasClass('slick-initialized');
    }

    // ── Arrow click wiring ──
    $prev.on('click', function () {
      if (!slickReady()) return;
      try { $track.slick('slickPrev'); } catch (e) { /* slick mid-teardown */ }
    });
    $next.on('click', function () {
      if (!slickReady()) return;
      try { $track.slick('slickNext'); } catch (e) { /* slick mid-teardown */ }
    });

    // ── Sync arrow enabled/disabled state ──
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

    // ── Slick init (mobile only) ──
    function initCarousel() {
      if (typeof $.fn.slick === 'undefined') return;
      if ($track.hasClass('slick-initialized')) return;

      // Add the modifier class FIRST so the 280px card width is in effect
      // when slick measures each card. Then force a reflow before init.
      $section.addClass('is-carousel');
      // eslint-disable-next-line no-unused-expressions
      $track[0].offsetWidth; // force layout flush

      $track.slick({
        slidesToShow:    1,
        slidesToScroll:  1,
        variableWidth:   true,             // cards have fixed 343px width via !important in CSS
        infinite:        true,
        initialSlide:    0,
        arrows:          false,            // we use external buttons
        dots:            true,
        dotsClass:       'slick-dots',
        appendDots:      $dots,
        speed:           reducedMotion ? 0 : 350,
        cssEase:         reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        easing:          'linear',
        useCSS:          true,
        useTransform:    true,
        fade:            false,
        centerMode:      true,             // peek effect — neighbors visible on either side
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
      $track.html(originalCardsHtml);
      $track.removeAttr('style');
      $dots.empty();

      // Clear all slick-related state so the next .slick() call doesn't short-circuit.
      $track.removeData('slick');
      $track.off('.slick');
      $track.removeClass('slick-initialized slick-slider slick-dotted');
    }

    function syncToViewport() {
      if (isMobile()) {
        ensureSlickLoaded(initCarousel);
      } else {
        destroyCarousel();
      }
    }

    // ── Slick loader (CDN fallback if not already on the page) ──
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

    // ── Init / afterChange handler ──
    $track.on('afterChange init', function (e, slick, currentSlide) {
      syncArrows();

      // Clean up slick's aria-hidden on slides so screen readers see all content;
      // remove the tabindex slick injects on focusable descendants of inactive slides.
      $track.find('.slick-slide').each(function () {
        $(this).removeAttr('aria-hidden');
        $(this).find('a, button').removeAttr('tabindex');
      });

      $prev.add($next).attr('tabindex', '0');
    });

    // ── Initial state ──
    syncToViewport();

    // ── Viewport change handling ──
    var rTimer;
    $(window).on('resize.rbccmUpcoming', function () {
      clearTimeout(rTimer);
      rTimer = setTimeout(function () {
        syncToViewport();
        if ($track.hasClass('slick-initialized')) {
          $track.slick('setPosition');
          syncArrows();
        }
      }, 150);
    });
  });
})();
