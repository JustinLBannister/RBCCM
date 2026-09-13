/* rbccm-animate.js
   =====================================================================
   Universal, framework-free scroll-triggered animation runtime for
   RBCCM composed TeamSite pages. Ported 1:1 from the MAAS+MATA page's
   inline animate.css bindings so multi-component pages get the same
   "nice" pacing (elements start hidden, JS adds a body class to reveal
   them, animate.css keyframes take it from there).

   Load once per page AFTER the animate.css CDN stylesheet:

     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
     <script src="rbccm-animate/rbccm-animate.js"></script>

   Any RBCCM section opts in by adding data-* attributes in its markup:

     data-animate-hero="fadeInUp"     Fires on load (staggered by
                                      data-animate-delay). For above-
                                      the-fold hero content.
     data-animate="fadeInUp"          Fires on scroll-in via IO.
     data-stagger-parent="fadeInUp"   When the parent enters view, its
                                      direct children animate in
                                      sequence (child 0 at 0ms, child 1
                                      at step ms, etc.).
       data-stagger-step="120"        Optional per-parent stagger step
                                      in ms (default 100).
     data-animate-delay="150"         Optional individual delay in ms.
     data-animate-duration="800"      Optional individual duration in ms
                                      (sets --animate-duration custom
                                      prop on the element).

   URL escape hatch:
     ?noanim=1  Forces every animated element to opacity: 1 immediately
                so full-page screenshot tools capture everything without
                needing to scroll. IntersectionObserver would otherwise
                leave below-fold sections hidden.

   Behavior notes:
     - Pre-state CSS (opacity: 0 on all data-* targets) is injected by
       this file so pages don't need to ship their own hide-until-JS
       stylesheet. Elements reveal only after JS adds .rbccm-anim-ready
       to <body> AND the animate.css class lands on the element.
     - Respects prefers-reduced-motion: forces opacity: 1 on every
       animated element via CSS. JS still runs but the fade/slide keyframes
       are visually skipped.
     - Idempotent. Multiple runs are safe (re-observation is a no-op).
     - Vanilla JS. No jQuery, no build step.
   ===================================================================== */
(function () {
  'use strict';

  /* Inject the pre-state CSS so animated elements are hidden until we
     add .rbccm-anim-ready to <body> AND the animate.css class lands on
     them. Any page that just links this JS gets the whole system --
     no per-component CSS to maintain. */
  function injectRuntimeCss() {
    if (document.getElementById('rbccm-animate-runtime-css')) return;
    var css = ''
      + '[data-animate],'
      + '[data-animate-hero],'
      + '[data-stagger-parent] > *{'
      + '  opacity:0;'
      + '}'
      + '.rbccm-anim-ready [data-animate].animate__animated,'
      + '.rbccm-anim-ready [data-animate-hero].animate__animated,'
      + '.rbccm-anim-ready [data-stagger-parent] > .animate__animated{'
      + '  opacity:1;'
      + '}'
      /* Slow animate.css defaults from the library-standard 1s to 1.3s.
         S&E composed pages have more compact sections than MAAS/MATA, so
         the tighter cadence made animations feel snappy on scroll. Any
         element that wants a bespoke duration can still override via
         data-animate-duration on the element itself (the JS sets the
         same --animate-duration custom prop). */
      + '.animate__animated{'
      + '  --animate-duration:1.3s;'
      + '}'
      + '@media (prefers-reduced-motion: reduce){'
      + '  [data-animate],'
      + '  [data-animate-hero],'
      + '  [data-stagger-parent] > *{'
      + '    opacity:1 !important;'
      + '    animation:none !important;'
      + '  }'
      + '}';
    var style = document.createElement('style');
    style.id = 'rbccm-animate-runtime-css';
    style.textContent = css;
    /* Inject as FIRST child of <head> so any later rules from the
       animate.css CDN or page-specific stylesheets can still override
       specific animations if a page needs a bespoke feel. */
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }
  }

  /* Inject as EARLY as possible so pre-state hides elements before the
     browser paints. Waiting for DOMContentLoaded would leave a flash of
     visible content on slow initial parse. */
  injectRuntimeCss();

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var reduced = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ?noanim=1 in the URL forces every data-animate element to opacity 1
       immediately so screenshot tools capture everything without needing
       to scroll (IntersectionObserver would otherwise leave below-fold
       sections hidden). */
    var noanim = /[?&]noanim=1/.test(window.location.search);

    /* Adding .rbccm-anim-ready to <body> flips the runtime CSS from
       "hide everything with a data-* hook" to "hide until the animate
       class lands". */
    document.body.classList.add('rbccm-anim-ready');

    if (noanim) {
      document.querySelectorAll(
        '[data-animate], [data-animate-hero], [data-stagger-parent] > *'
      ).forEach(function (el) { el.style.opacity = '1'; });
      return;
    }

    function play(el, name, delay, duration) {
      if (!el || !name) return;
      /* setTimeout defers the class add so the browser has a chance to
         paint the pre-state. Without it, adding the class synchronously
         in the same tick can produce a flash on fast machines. */
      setTimeout(function () {
        if (duration) el.style.setProperty('--animate-duration', duration + 'ms');
        el.classList.add('animate__animated', 'animate__' + name);
      }, delay || 0);
    }

    /* ---- Hero on-load cascade ------------------------------------
       Runs immediately at page load, offset by each element's own
       data-animate-delay so a section reads eyebrow -> title -> sub
       -> CTA. No IntersectionObserver -- these are above the fold. */
    document.querySelectorAll('[data-animate-hero]').forEach(function (el) {
      var name = el.getAttribute('data-animate-hero') || 'fadeInUp';
      var delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
      var duration = parseInt(el.getAttribute('data-animate-duration') || '0', 10) || null;
      play(el, name, delay, duration);
    });

    /* Older browsers without IntersectionObserver just reveal
       everything without animation so nothing stays hidden. */
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-animate], [data-stagger-parent] > *').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    /* ---- Single-element reveals ---------------------------------- */
    var singleIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var name = el.getAttribute('data-animate') || 'fadeInUp';
        var delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
        var duration = parseInt(el.getAttribute('data-animate-duration') || '0', 10) || null;
        play(el, name, delay, duration);
        singleIo.unobserve(el);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      singleIo.observe(el);
    });

    /* ---- Stagger parents (children reveal sequentially) ----------
       Direct children reveal in order at (index * step) ms. Step
       is configurable per parent via data-stagger-step (default 100). */
    var staggerIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var parent = entry.target;
        var name = parent.getAttribute('data-stagger-parent') || 'fadeInUp';
        var step = parseInt(parent.getAttribute('data-stagger-step') || '100', 10);
        if (!isFinite(step) || step < 0) step = 100;
        var kids = parent.children;
        for (var i = 0; i < kids.length; i++) {
          play(kids[i], name, i * step);
        }
        staggerIo.unobserve(parent);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('[data-stagger-parent]').forEach(function (el) {
      staggerIo.observe(el);
    });
  });
})();
