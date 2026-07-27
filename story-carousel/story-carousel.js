/* =========================================================================
   Story Carousel — accessible-slick implementation
   =========================================================================
   Uses the same carousel stack as the rest of rbccm.com: jQuery + slick,
   preferring the accessible-slick build. Mirrors the loader, the arrow
   wiring, the dots container and the sr-only announce region used by the
   leadership carousel + icon carousel, so all three behave and are
   maintained the same way.

   Why slick rather than a bespoke engine: every other carousel on the site
   is slick, accessible-slick's a11y behaviour is already vetted, and a
   one-off implementation would be a maintenance island.

   ---- Config (data attributes on .rbccm-story-carousel) -------------------
     data-autoplay        "true" = auto-advance   (default false)
     data-arrows          "false" = hide arrows   (default true — the
                                                   external prev/next buttons)
     data-dots            "false" = hide dots     (default true)
     data-speed           ms transition speed     (default 350)
     data-autoplay-speed  ms between advances     (default 6000)

   ---- Multi-instance ------------------------------------------------------
   All queries are scoped to each .rbccm-story-carousel root, so any
   number of instances can coexist on the same page. A BOUND_FLAG on the
   root prevents double-init if a page injects more markup later —
   consumers can also call window.RBCCMStoryCarousel.init(ctx) to bind
   newly-added roots (feed scripts, TeamSite preview re-render, etc.).
   ========================================================================= */
(function () {
  'use strict';

  var BOUND_FLAG = 'data-story-carousel-bound';

  /* Prefer the accessible-slick build hosted on rbccm.com so we get the same
     screen-reader experience as every page that already includes it; fall back
     to vanilla slick from cdnjs only if that 404s. Straight port of the
     leadership / icon-carousel loader. */
  function ensureSlickLoaded(cb) {
    if (typeof window.jQuery === 'undefined') return;                            /* no jQuery, no carousel */
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

    var $root     = $(root);
    var $track    = $root.find('.rbccm-story-carousel__track');
    var $prev     = $root.find('.rbccm-story-carousel__btn--prev');
    var $next     = $root.find('.rbccm-story-carousel__btn--next');
    var $dots     = $root.find('.rbccm-story-carousel__dots-wrap');
    var $announce = $root.find('.rbccm-story-carousel__announce');

    if (!$track.length || !$track.children().length) return;
    if ($track.hasClass('slick-initialized')) return;
    root.setAttribute(BOUND_FLAG, 'true');

    var cfgAutoplay = root.getAttribute('data-autoplay') === 'true';
    var cfgArrows   = root.getAttribute('data-arrows')   !== 'false';
    var cfgDots     = root.getAttribute('data-dots')     !== 'false';
    var cfgSpeed    = intAttr(root, 'data-speed', 350);
    var cfgAuto     = intAttr(root, 'data-autoplay-speed', 6000);

    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Arrows are OUR buttons in the markup — slick's own arrows would sit
       inside the track's box, but ours live in the carousel grid's outer
       cells so they can straddle the container edges on desktop. So
       `arrows: false` and we drive slick by command below. Same approach
       as leadership and icon-carousel. */
    $track.slick({
      slidesToShow:    1,
      slidesToScroll:  1,
      infinite:        true,
      arrows:          false,
      dots:            cfgDots,
      appendDots:      $dots,
      speed:           reducedMotion ? 0 : cfgSpeed,
      cssEase:         reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      autoplay:        cfgAutoplay && !reducedMotion,
      autoplaySpeed:   cfgAuto,
      pauseOnHover:    true,
      pauseOnFocus:    true,
      /* Desktop locks the track to the tallest slide (adaptiveHeight:
         false) so arrows/dots don't bounce between transitions. Mobile
         flips to adaptive because tiles stack vertically and locking
         heights wastes screen real estate. */
      adaptiveHeight:  false,
      /* accessibility:false because Slick's built-in a11y sets
         tabindex="-1" on inactive dots (one-tabstop pattern). We want
         every dot in the tab order — same call leadership made — so
         we manage focus ourselves via the forceDotsTabbable helper. */
      accessibility:   false,
      draggable:       true,
      swipe:           true,
      touchMove:       true,
      /* regionLabel is accessible-slick's — it's what lets a screen-
         reader user tell two carousels on one page apart. Taken from
         the section's own aria-label so it's authored once in the DCR. */
      regionLabel:     root.getAttribute('aria-label') || 'Story carousel',
      responsive: [
        { breakpoint: 768, settings: { adaptiveHeight: true } }
      ]
    });

    /* ---- Arrows -----------------------------------------------------------
       Our buttons, driving slick by command. */
    $prev.on('click', function () {
      try { $track.slick('slickPrev'); } catch (e) { /* mid-teardown */ }
    });
    $next.on('click', function () {
      try { $track.slick('slickNext'); } catch (e) { /* mid-teardown */ }
    });

    if (cfgArrows === false) {
      $prev.hide();
      $next.hide();
    }

    /* Non-looping carousels dead-end, so grey the arrow out at the stop.
       Infinite ones never do, so they stay live. */
    function syncArrows() {
      var slick = $track.slick('getSlick');
      if (!slick) return;
      if (slick.options.infinite) return;                                        /* infinite carousel — never disable */
      var atStart = slick.currentSlide <= 0;
      var atEnd   = slick.currentSlide >= slick.slideCount - 1;
      $prev.prop('disabled', atStart).attr('aria-disabled', atStart ? 'true' : 'false');
      $next.prop('disabled', atEnd).attr('aria-disabled', atEnd ? 'true' : 'false');
    }

    /* Keep the tab order sane: only the currently visible slide's anchor
       should be reachable via Tab. Slick keeps every slide + cloned
       infinite-mode copies in the DOM, so their <a> elements would
       otherwise all sit in the tab sequence. */
    function applyA11y() {
      var slides = root.querySelectorAll('.rbccm-story-carousel__track .slick-slide');
      for (var i = 0; i < slides.length; i++) {
        var slide = slides[i];
        var isActive = slide.classList.contains('slick-active');
        var focusables = slide.querySelectorAll('a, button, [tabindex]');
        for (var j = 0; j < focusables.length; j++) {
          if (isActive) focusables[j].removeAttribute('tabindex');
          else          focusables[j].setAttribute('tabindex', '-1');
        }
        if (isActive) slide.removeAttribute('aria-hidden');
        else          slide.setAttribute('aria-hidden', 'true');
      }
    }

    /* Guarantee every dot button is tab-reachable regardless of Slick's
       internal a11y state. */
    function forceDotsTabbable() {
      var buttons = $dots.length ? $dots[0].querySelectorAll('.slick-dots li button') : [];
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('tabindex', '0');
        if (!buttons[i].getAttribute('aria-label')) {
          buttons[i].setAttribute('aria-label', 'Go to slide ' + (i + 1));
        }
      }
    }

    /* ---- Announce ---------------------------------------------------------
       accessible-slick labels the region and each slide, but does not
       announce the CHANGE. Without this, pressing Next moves the
       carousel silently. Leadership + icon-carousel do the same. */
    $track.on('init reInit breakpoint afterChange', function (e, slick, currentSlide) {
      syncArrows();
      forceDotsTabbable();
      applyA11y();
      if (e.type === 'afterChange' && $announce.length && slick) {
        $announce.text('Slide ' + (currentSlide + 1) + ' of ' + slick.slideCount);
      }
    });

    /* Initial pass — slick's `init` fires before our listener is attached
       on some paths, so run these once immediately too. */
    syncArrows();
    forceDotsTabbable();
    applyA11y();
  }

  function initAll(ctx) {
    if (!window.jQuery) return;
    var roots = (ctx || document).querySelectorAll('.rbccm-story-carousel');
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
  window.RBCCMStoryCarousel = { init: initAll };
})();
