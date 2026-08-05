/* =========================================================================
   Case Studies Carousel — accessible-slick implementation
   =========================================================================
   Same carousel stack as the rest of rbccm.com: jQuery + slick, preferring
   the accessible-slick build. Mirrors the loader, the arrow wiring and the
   dots container used by story-carousel / leadership-carousel / icon-
   carousel so all four behave and are maintained the same way.

   ---- Config (data attributes on .rbccm-case-studies) --------------------
     data-region-label     accessible-slick regionLabel override (aria)
     data-instructions     accessible-slick instructionsText override (aria)
     data-speed            ms transition speed (default 350)

   ---- Multi-instance -----------------------------------------------------
   All queries are scoped to each .rbccm-case-studies root. A BOUND_FLAG on
   the root prevents double-init if a page injects more markup later —
   consumers can also call window.RBCCMCaseStudiesCarousel.init(ctx) to
   bind newly-added roots (feed scripts, TeamSite preview re-render, etc.).

   Deploy at: /assets/rbccm/js/components/case-studies-carousel.js
             (path referenced from the skin's <script>).
   ========================================================================= */
(function () {
  'use strict';

  var BOUND_FLAG = 'data-case-studies-carousel-bound';

  /* Load accessible-slick from the local rbccm.com asset. The prior
     cdnjs cross-origin fallback was stripped as a debug step for the
     TeamSite "Initializing deployment" hang — some TeamSite installs
     scan external URLs in deployed asset files, and an unreachable
     cdnjs from the deploy server can stall the publish queue on any
     page referencing this JS. If accessible-slick.min.js fails to
     load, the carousel silently no-ops (jQuery.fn.slick stays
     undefined and init() bails). Restore a fallback only after
     confirming the publish path is clean. */
  function ensureSlickLoaded(cb) {
    if (typeof window.jQuery === 'undefined') return;   /* no jQuery, no carousel */
    if (typeof window.jQuery.fn.slick !== 'undefined') { cb(); return; }

    var s = document.createElement('script');
    s.src = '/assets/rbccm/js/accessible-slick.min.js';
    s.onload = function () { cb(); };
    document.head.appendChild(s);
  }

  function intAttr(root, name, fallback) {
    var n = parseInt(root.getAttribute(name), 10);
    return (!n || n < 1) ? fallback : n;
  }

  function attrOr(root, name, fallback) {
    var v = root.getAttribute(name);
    return (v && v.length) ? v : fallback;
  }

  function init(root) {
    var $ = window.jQuery;
    if (root.getAttribute(BOUND_FLAG) === 'true') return;

    var $root  = $(root);
    var $track = $root.find('.rbccm-case-studies__track');
    var $prev  = $root.find('.rbccm-case-studies__btn--prev');
    var $next  = $root.find('.rbccm-case-studies__btn--next');
    var $dots  = $root.find('.rbccm-case-studies__dots-wrap');

    if (!$track.length || !$track.children().length) return;
    if ($track.hasClass('slick-initialized')) return;
    root.setAttribute(BOUND_FLAG, 'true');

    /* Config — pulled from data-attrs on the root (see XSL). Falls back to
       sensible defaults when the Datum is blank. */
    var cfgSpeed = intAttr(root, 'data-speed', 350);

    /* Region label — accessible-slick's aria-label on the wrapper region.
       Blank Datum → derive from the H2 (heading text is a natural label).
       If the H2 isn't present for some reason, fall back to "carousel". */
    var $heading = $root.find('.rbccm-case-studies__heading').first();
    var headingText = $heading.length ? $.trim($heading.text()) : '';
    var regionLabel = attrOr(root, 'data-region-label', headingText || 'carousel');

    var instructionsText = attrOr(root, 'data-instructions', '');

    /* Transition — 'slide' (default) or 'fade'. The XSL always emits
       this attribute so we can trust attrOr's fallback for the
       edge case of markup that predates the attr. */
    var transition = attrOr(root, 'data-transition', 'slide');

    var opts = {
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: true,
      speed: cfgSpeed,
      adaptiveHeight: false,
      prevArrow: $prev,
      nextArrow: $next,
      appendDots: $dots,
      regionLabel: regionLabel
    };
    /* Fade: cross-fade between cards instead of horizontal slide.
       Requires slidesToShow: 1 (which we have). cssEase defaults
       to 'ease'; leave alone unless a designer flags the fall-off
       feels wrong. */
    if (transition === 'fade') opts.fade = true;
    /* Only pass instructionsText if the author set one — accessible-slick
       renders the sr-only block even for an empty string, which adds
       unwanted markup. */
    if (instructionsText) opts.instructionsText = instructionsText;

    $track.slick(opts);
  }

  function initAll(ctx) {
    var root = (ctx && ctx.querySelectorAll) ? ctx : document;
    var roots = root.querySelectorAll('.rbccm-case-studies');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    ensureSlickLoaded(function () { initAll(); });
  });

  /* Expose init for consumers that inject markup after load (feed scripts,
     TeamSite preview re-render, etc.). */
  window.RBCCMCaseStudiesCarousel = { init: initAll };
})();
