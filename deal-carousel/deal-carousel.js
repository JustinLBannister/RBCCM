/* =========================================================================
   Deal Carousel (tombstones)
   =========================================================================
   jQuery + slick (accessible-slick build preferred) — the same carousel stack
   as leadership, upcoming-conferences and icon-carousel.

   ---- Config (data attributes on .rbccm-deal-carousel) --------------------
     data-per-view-mobile   cards per page  < 768px    (default 1)
     data-per-view-tablet   cards per page  768-1099px (default 2)
     data-per-view-desktop  cards per page  >= 1100px  (default 3)
     data-loop              "true" = infinite (default true)
     data-autoplay          "true" = auto-advance (default false)

   ---- What was wrong with the legacy script -------------------------------
   The old inline script initialised slick, then destroyed it, stripped the
   clones, emptied the container, re-appended the slides and initialised it
   AGAIN. That double-init is why the live DOM has `.slick-slide` nested inside
   `.slick-slide` and why every card carried duplicate inline widths. It also
   shipped a console.log. None of that is reproduced here — slick is initialised
   exactly once, on markup it has never seen before.

   The legacy also paged ONE card at a time (`slidesToScroll: 1`) while showing
   three, which produced fifteen dots for fifteen deals — a dot strip nobody can
   use. Here slidesToScroll follows slidesToShow, so the dots count PAGES: five
   for fifteen deals at 3-up.
   ========================================================================= */
(function () {
  'use strict';

  var BOUND_FLAG = 'data-deal-carousel-bound';

  /* Prefer the accessible-slick build hosted on rbccm.com; fall back to vanilla
     slick from cdnjs only if that 404s. Port of leadership's loader. */
  function ensureSlickLoaded(cb) {
    if (typeof window.jQuery === 'undefined') return;
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
    var $track = $root.find('.rbccm-deal-carousel__track');
    var $dots  = $root.find('.rbccm-deal-carousel__dots');
    var $prev  = $root.find('.rbccm-deal-carousel__arrow--prev');
    var $next  = $root.find('.rbccm-deal-carousel__arrow--next');
    var $announce = $root.find('.rbccm-deal-carousel__announce');

    if (!$track.length || !$track.children().length) return;
    if ($track.hasClass('slick-initialized')) return;   /* never double-init */
    root.setAttribute(BOUND_FLAG, 'true');

    var pvDesktop = intAttr(root, 'data-per-view-desktop', 3);
    var pvTablet  = intAttr(root, 'data-per-view-tablet', 2);
    var pvMobile  = intAttr(root, 'data-per-view-mobile', 1);

    var infinite = root.getAttribute('data-loop') !== 'false';
    var autoplay = root.getAttribute('data-autoplay') === 'true';

    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Arrows are OUR buttons, outside the rail, so `arrows: false` and we drive
       slick by command. Same approach as leadership and icon-carousel. */
    $track.slick({
      slidesToShow:   pvDesktop,
      slidesToScroll: pvDesktop,   /* page by a full row — see the header note */
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
      adaptiveHeight: false,       /* equal-height cards; no jump between pages */
      draggable:      true,
      swipe:          true,
      swipeToSlide:   false,       /* snap by page, not by card */
      touchMove:      true,
      waitForAnimate: true,
      respondTo:      'window',
      /* data-region-label, NOT the root's aria-label. They are two different
         labels: aria-label names the SECTION landmark, data-region-label names
         the carousel region inside it, and a page with two carousels needs them
         to differ or a screen reader announces two identical regions. Reading
         aria-label here would silently collapse both to the section's name. */
      regionLabel:    root.getAttribute('data-region-label') ||
                      root.getAttribute('aria-label') ||
                      'Transactions carousel',

      responsive: [
        {
          breakpoint: 1100,        /* < 1100: tablet */
          settings: {
            slidesToShow:   pvTablet,
            slidesToScroll: pvTablet
          }
        },
        {
          breakpoint: 768,         /* < 768: one card at a time */
          settings: {
            slidesToShow:   pvMobile,
            slidesToScroll: pvMobile
          }
        }
      ]
    });

    /* ---- Arrows ---------------------------------------------------------- */
    $prev.on('click', function () {
      try { $track.slick('slickPrev'); } catch (e) { /* mid-teardown */ }
    });
    $next.on('click', function () {
      try { $track.slick('slickNext'); } catch (e) { /* mid-teardown */ }
    });

    /* Non-looping carousels dead-end, so grey the arrow out at the stop.
       Infinite ones never do. */
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

    /* Every card fits in one view -> nothing to page to, so hide the chrome.
       Recomputed on breakpoint change: 3 deals is static at 3-up on desktop but
       pages on mobile at 1-up. */
    function syncStatic() {
      var slick = $track.slick('getSlick');
      if (!slick) return;
      $root.toggleClass('is-static', slick.slideCount <= slick.options.slidesToShow);
    }

    /* Mobile puts the arrows either side of the dots; desktop puts them either
       side of the track. Clone the real buttons into the dots row rather than
       duplicating markup — the clones delegate straight back to the originals. */
    function mountMobileArrows() {
      if (!$dots.length || !$prev.length || !$next.length) return;
      if ($dots.find('[data-clone]').length) return;

      var $mPrev = $prev.clone(false).attr('data-clone', 'prev')
        .on('click', function () { $prev.trigger('click'); });
      var $mNext = $next.clone(false).attr('data-clone', 'next')
        .on('click', function () { $next.trigger('click'); });

      $dots.prepend($mPrev);
      $dots.append($mNext);
    }

    /* ---- Dots: one tab stop per dot, whichever library loaded -------------
       The two slick builds disagree about how the dots should behave, and the
       difference is invisible until someone reaches for the keyboard.

         accessible-slick  customPaging emits a plain <button> per dot with an
                           sr-only "Go to slide N". No role, no tablist. Every
                           dot is an ordinary tab stop, so Tab walks them.

         vanilla slick     Builds an ARIA tablist with a ROVING TABINDEX: the
                           active dot gets tabindex="0" and every other dot gets
                           tabindex="-1". Tab lands on the strip once and skips
                           the rest; you are expected to use arrow keys, which
                           slick binds via keyHandler.

       Both are defensible in isolation. What is not defensible is which one you
       get being decided by whether an asset 404'd — ensureSlickLoaded falls back
       to vanilla slick from cdnjs, so a missing file silently changes the
       keyboard contract with no error anywhere.

       So we pin it. Every dot becomes a real tab stop and the tablist roles come
       off, which is accessible-slick's model — the one the rest of the site is
       built on, and the one this component's CSS already assumes (it hides
       .slick-dot-icon, an accessible-slick-only element).

       Re-run on reInit/breakpoint: slick rebuilds the dots from scratch each
       time, so anything we did to them is thrown away. */
    function normalizeDots() {
      var $ul = $dots.find('.slick-dots');
      if (!$ul.length) return;

      /* Leaving role="tablist" on while making every tab tabbable would be worse
         than either library alone: a tablist promises roving focus, and a screen
         reader would announce "tab 3 of 15" while Tab behaved like a plain list.
         Strip the roles rather than half-honour them. */
      $ul.removeAttr('role');
      $ul.find('li').removeAttr('role');

      $ul.find('button').each(function () {
        var $b = $(this);
        $b.attr('tabindex', '0')
          .removeAttr('role')
          .removeAttr('aria-selected');

        /* vanilla slick's dot is a bare "3" with no accessible name beyond an
           aria-label it sets to "3 of 15". accessible-slick gives it a real
           sr-only sentence. Guarantee SOMETHING names the button either way —
           our CSS sets font-size:0 on it, so the visible digit is not a name. */
        if (!$b.attr('aria-label')) {
          $b.attr('aria-label', 'Go to slide ' + ($b.closest('li').index() + 1));
        }
      });
    }

    /* ---- Announce --------------------------------------------------------
       accessible-slick labels the region and each slide but does NOT announce
       the change — without this, pressing Next moves the carousel silently for
       a screen-reader user. Leadership does the same with its own live region. */
    $track.on('afterChange', function (e, slick, currentSlide) {
      syncArrows();
      if (!$announce.length) return;
      var perPage = slick.options.slidesToScroll || 1;
      var page    = Math.floor(currentSlide / perPage) + 1;
      var total   = Math.ceil(slick.slideCount / perPage);
      $announce.text('Slide ' + page + ' of ' + total);
    });

    $track.on('init reInit breakpoint', function () {
      syncArrows();
      syncStatic();
      mountMobileArrows();
      normalizeDots();
    });

    /* setPosition fires after slick re-renders the dots on a page change, which
       is the other moment our attributes get wiped. */
    $track.on('afterChange', normalizeDots);

    syncArrows();
    syncStatic();
    mountMobileArrows();
    normalizeDots();
  }

  function initAll(ctx) {
    var $ = window.jQuery;
    if (!$) return;
    var roots = (ctx || document).querySelectorAll('.rbccm-deal-carousel');
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

  /* Exposed so a page that injects markup later can bind the new instances. */
  window.RBCCMDealCarousel = { init: initAll };
})();
