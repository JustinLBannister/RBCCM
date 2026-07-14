/* =========================================================================
   Icon Carousel — accessible-slick implementation
   =========================================================================
   Uses the same carousel stack as the rest of rbccm.com: jQuery + slick,
   preferring the accessible-slick build. Mirrors the loader, the arrow
   wiring, the dots container and the sr-only announce region used by the
   leadership carousel, so the two behave and are maintained the same way.

   Why slick rather than a bespoke engine: every other carousel on the site
   is slick, accessible-slick's a11y behaviour is already vetted, and a
   one-off implementation would be a maintenance island.

   ---- Config (data attributes on .rbccm-icon-carousel) --------------------
     data-per-view-mobile   items per page  < 768px   (default 4, STACKED)
     data-per-view-tablet   items per page  768–991px (default 2)
     data-per-view-desktop  items per page  >= 992px  (default 4)
     data-loop              "true" = infinite (default true)
     data-autoplay          "true" = auto-advance (default false)

   ---- Layout note ---------------------------------------------------------
   Mobile stacks its items vertically (4 in a column, per the comp). That is
   slick's GRID MODE — `rows: 4, slidesPerRow: 1` — not four separate slides.
   Desktop is the normal case: `slidesToShow: 4, rows: 1`.

   Infinite mode is also what fills the short final page: 11 items at 4-up
   would leave a dead cell, and slick's clones wrap the first items into it.
   ========================================================================= */
(function () {
  'use strict';

  var BOUND_FLAG = 'data-icon-carousel-bound';

  /* Prefer the accessible-slick build hosted on rbccm.com so we get the same
     screen-reader experience as every page that already includes it; fall back
     to vanilla slick from cdnjs only if that 404s. Straight port of the
     leadership carousel's loader. */
  function ensureSlickLoaded(cb) {
    if (typeof window.jQuery === 'undefined') return;           /* no jQuery, no carousel */
    if (typeof window.jQuery.fn.slick !== 'undefined') { cb(); return; }

    var s = document.createElement('script');
    s.src = '/assets/rbccm/js/accessible-slick.min.js';
    s.onload = function () { cb(); };
    s.onerror = function () {
      var fallback = document.createElement('script');
      fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
      fallback.onload = function () { cb(); };
      document.head.appendChild(fallback);
    };
    document.head.appendChild(s);
  }

  function intAttr(root, name, fallback) {
    var n = parseInt(root.getAttribute(name), 10);
    return (!n || n < 1) ? fallback : n;
  }

  function init(root) {
    var $ = window.jQuery;
    if (root.getAttribute(BOUND_FLAG) === 'true') return;

    var $root  = $(root);
    var $track = $root.find('.rbccm-icon-carousel__track');
    var $dots  = $root.find('.rbccm-icon-carousel__dots');
    var $prev  = $root.find('.rbccm-icon-carousel__arrow--prev');
    var $next  = $root.find('.rbccm-icon-carousel__arrow--next');
    var $announce = $root.find('.rbccm-icon-carousel__announce');

    if (!$track.length || !$track.children().length) return;
    if ($track.hasClass('slick-initialized')) return;
    root.setAttribute(BOUND_FLAG, 'true');

    var pvDesktop = intAttr(root, 'data-per-view-desktop', 4);
    var pvTablet  = intAttr(root, 'data-per-view-tablet', 2);
    var pvMobile  = intAttr(root, 'data-per-view-mobile', 4);

    /* Loop defaults ON — it's what wraps the first items into the short final
       page (11 items at 4-up would otherwise leave an empty cell). */
    var infinite = root.getAttribute('data-loop') !== 'false';
    var autoplay = root.getAttribute('data-autoplay') === 'true';

    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Fill the short last page ---------------------------------------
       11 items at 4-per-page leaves the final page with 3 and a dead cell.

       On desktop/tablet slick's infinite clones paper over this — the track
       simply continues into them. GRID MODE DOES NOT: slick chops the items
       into fixed sections of `rows` BEFORE cloning, so the last section really
       is short and you get an empty 4th row (a tall void above the dots).

       Fix it at the source: pad the item list up to a whole multiple of the
       page size, with clones of the leading items, so every page is full at
       every breakpoint. Same trick as the pre-slick build, now applied once to
       the DOM up front, before slick initialises.

       Only when looping — without a wrap, a copy of item 1 dangling off the end
       is a non-sequitur, so a non-looping carousel keeps its gap by design. */
    if (infinite) {
      var $items = $track.children();
      var count  = $items.length;

      /* Pad to a multiple of the MOBILE page size only — not the LCM of all
         three breakpoints.

         Desktop and tablet don't need padding: they run rows:1, so slick's
         infinite clones sit in the same track and the last page simply
         continues into them. No dead cell. Only grid mode chops the items into
         fixed sections up front, so only mobile can strand a short one.

         Padding to the LCM instead looked tidier but was a trap: an author
         setting PerViewDesktop=5 makes LCM(5,2,4) = 20, so a 5-item carousel
         would pad to 20 — 15 clones, three quarters of it duplicates. Far worse
         than the gap it set out to fix. Mobile's stride is at most 4, so the
         padding is at most 3 items. */
      var stride = pvMobile;
      var short  = (stride - (count % stride)) % stride;

      /* Belt and braces: never let the padding outweigh the real content. If a
         config somehow asks for that, take the gap instead. */
      if (short >= count) short = 0;

      for (var p = 0; p < short; p++) {
        var $pad = $items.eq(p % count).clone(false);
        $pad.addClass('is-pad');
        /* Duplicate content — keep it out of the a11y tree. The real item is
           still announced on the page it belongs to. */
        $pad.attr('aria-hidden', 'true');
        $track.append($pad);
      }
    }


    /* Arrows are OUR buttons, in the markup, outside the 1100px rail — slick's
       own arrows can't live there, so `arrows: false` and we drive slick by
       command. Same approach as leadership and upcoming-conferences. */
    $track.slick({
      slidesToShow:   pvDesktop,
      slidesToScroll: pvDesktop,   /* page by a full row, not one item */
      rows:           1,
      slidesPerRow:   1,
      infinite:       infinite,
      arrows:         false,
      dots:           true,
      dotsClass:      'slick-dots',
      appendDots:     $dots,
      autoplay:       autoplay,
      autoplaySpeed:  6000,
      pauseOnHover:   true,
      pauseOnFocus:   true,
      speed:          reducedMotion ? 0 : 400,
      cssEase:        reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      useCSS:         true,
      useTransform:   true,
      adaptiveHeight: false,
      draggable:      true,
      swipe:          true,
      swipeToSlide:   false,       /* snap by page, not by item */
      touchMove:      true,
      waitForAnimate: true,
      respondTo:      'window',
      /* regionLabel is accessible-slick's; it's what lets a screen-reader user
         tell two carousels on one page apart. Taken from the section's own
         aria-label so it's authored once in the DCR. */
      regionLabel:    root.getAttribute('aria-label') || 'Icon carousel',

      responsive: [
        {
          breakpoint: 992,          /* < 992: tablet */
          settings: {
            slidesToShow:   pvTablet,
            slidesToScroll: pvTablet,
            rows:           1,
            slidesPerRow:   1
          }
        },
        {
          breakpoint: 768,          /* < 768: mobile — GRID MODE, items stack */
          settings: {
            slidesToShow:   1,
            slidesToScroll: 1,
            rows:           pvMobile,   /* 4 rows of 1 = the stacked column */
            slidesPerRow:   1
          }
        }
      ]
    });

    /* ---- Arrows ----------------------------------------------------------
       Our buttons, driving slick by command. */
    $prev.on('click', function () {
      try { $track.slick('slickPrev'); } catch (e) { /* mid-teardown */ }
    });
    $next.on('click', function () {
      try { $track.slick('slickNext'); } catch (e) { /* mid-teardown */ }
    });

    /* Non-looping carousels dead-end, so grey the arrow out at the stop.
       Infinite ones never do, so they stay live. */
    function syncArrows() {
      if (infinite) return;
      var slick = $track.slick('getSlick');
      if (!slick) return;
      var atStart = slick.currentSlide === 0;
      var atEnd   = slick.currentSlide >= slick.slideCount - slick.options.slidesToShow;

      $prev.add($dots.find('[data-clone="prev"]'))
        .prop('disabled', atStart).attr('aria-disabled', atStart ? 'true' : 'false');
      $next.add($dots.find('[data-clone="next"]'))
        .prop('disabled', atEnd).attr('aria-disabled', atEnd ? 'true' : 'false');
    }

    /* ---- Announce --------------------------------------------------------
       accessible-slick labels the region and each slide, but does not announce
       the CHANGE. Without this, pressing Next moves the carousel silently.
       Leadership does the same thing with its own live region. */
    $track.on('afterChange', function (e, slick, currentSlide) {
      syncArrows();
      if (!$announce.length) return;
      var perPage = slick.options.slidesToScroll || 1;
      var page  = Math.floor(currentSlide / perPage) + 1;
      var total = Math.ceil(slick.slideCount / perPage);
      $announce.text('Slide ' + page + ' of ' + total);
    });

    /* Single page = nothing to page to, so hide the arrows and dots.
       slick still initialises (it must, for the responsive re-layout), it just
       has one dot. Recomputed on breakpoint change because a 5-item carousel is
       static at 4-up on desktop but pages on tablet at 2-up. */
    function syncStatic() {
      var slick = $track.slick('getSlick');
      if (!slick) return;

      /* slideCount is the number of SLIDES slick is paging between — and in
         grid mode (mobile) a "slide" is a whole SECTION of rows, not an item.
         With 11 items at rows:4 that's 3, not 11.

         So compare against slidesToShow ALONE. Multiplying by `rows` was the
         bug: 3 sections <= (1 x 4) resolved true, the carousel declared itself
         static, and the arrows and dots vanished on mobile. */
      $root.toggleClass('is-static', slick.slideCount <= slick.options.slidesToShow);
    }

    /* Mobile puts the arrows either side of the dots; desktop puts them either
       side of the track. Rather than duplicating markup, clone the real buttons
       into the dots row and let CSS show whichever pair the breakpoint wants.
       Clones delegate straight back to the originals. */
    function mountMobileArrows() {
      if (!$dots.length || !$prev.length || !$next.length) return;
      if ($dots.find('[data-clone]').length) return;   /* already mounted */

      var $mPrev = $prev.clone(false).attr('data-clone', 'prev')
        .on('click', function () { $prev.trigger('click'); });
      var $mNext = $next.clone(false).attr('data-clone', 'next')
        .on('click', function () { $next.trigger('click'); });

      $dots.prepend($mPrev);
      $dots.append($mNext);
    }

    $track.on('init reInit breakpoint', function () {
      syncArrows();
      syncStatic();
      mountMobileArrows();
    });

    syncArrows();
    syncStatic();
    mountMobileArrows();
  }

  function initAll(ctx) {
    var $ = window.jQuery;
    if (!$) return;
    var roots = (ctx || document).querySelectorAll('.rbccm-icon-carousel');
    for (var i = 0; i < roots.length; i++) {
      (function (root) {
        ensureSlickLoaded(function () { init(root); });
      })(roots[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }

  /* Exposed so a page that injects markup later (feed scripts, TeamSite
     preview re-render) can bind the new instances. */
  window.RBCCMIconCarousel = { init: initAll };
})();
