/*! RBCCM maas-mata.js | v1 | built 2026-10-28T14:40:48.283Z
 *  rbccm-animate, rbccm-video-poster, rbccm-section-group, rbccm-awards, rbccm-capability-cards, rbccm-marketo-modal */

/* ==== rbccm-animate/rbccm-animate.js ==== */
/* rbccm-animate.js
   =====================================================================
   Universal, framework-free scroll-triggered animation runtime for
   RBCCM composed TeamSite pages. Ported 1:1 from the MAAS+MATA page's
   inline animate.css bindings so multi-component pages get the same
   "nice" pacing (elements start hidden, JS adds a body class to reveal
   them, animate.css keyframes take it from there).

   The fadeIn / fadeInUp / fadeInDown / fadeInRight animations are built
   in, so animate.css is optional. If a page does load it, load it first:

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
      /* The four animate.css animations the RBCCM components use, built in
         so they play even on pages that don't load animate.css. Component
         pages built in TeamSite often don't, and without these the classes
         had no animation behind them: elements jumped from hidden straight
         to visible (a flicker instead of a fade). Definitions match
         animate.css 4.1.1 exactly, so a page that does load it looks the
         same. */
      + '.animate__animated{'
      + '  animation-duration:var(--animate-duration,1.3s);'
      + '  animation-fill-mode:both;'
      + '}'
      + '.animate__fadeIn{animation-name:fadeIn}'
      + '.animate__fadeInUp{animation-name:fadeInUp}'
      + '.animate__fadeInDown{animation-name:fadeInDown}'
      + '.animate__fadeInRight{animation-name:fadeInRight}'
      + '@keyframes fadeIn{0%{opacity:0}to{opacity:1}}'
      + '@keyframes fadeInUp{0%{opacity:0;transform:translate3d(0,100%,0)}to{opacity:1;transform:translateZ(0)}}'
      + '@keyframes fadeInDown{0%{opacity:0;transform:translate3d(0,-100%,0)}to{opacity:1;transform:translateZ(0)}}'
      + '@keyframes fadeInRight{0%{opacity:0;transform:translate3d(100%,0,0)}to{opacity:1;transform:translateZ(0)}}'
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
;

/* ==== rbccm-video-poster/rbccm-video-poster.js ==== */
/* =========================================================================
   RBCCM Video Poster - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-video-poster.js

   One pass per .rbccm-video-poster__modal on the page (safe to include
   more than once; each modal is wired once). Ported from the MAAS+MATA
   video modal script.

   - Open: set the iframe src (from data-src) with autoplay=1&muted=1.
     The click that opened the modal counts as the user gesture; muted
     is what lets autoplay work across browsers. Nothing loads before
     the modal opens.
   - Close: clear the src so the video actually stops.
   - Focus: move to Close on open, back to the play button on close.
     A guard after the iframe loops Tab back to Close.
   - Bootstrap 5 (native events), Bootstrap 3/4 (jQuery events), or no
     Bootstrap at all (vanilla open / close / Esc / backdrop click).
   ========================================================================= */
(function () {
  'use strict';

  function withAutoplay(url) {
    if (!url) return url;
    var stripped = url
      .replace(/([&?])autoplay=[^&]*&?/, '$1')
      .replace(/([&?])muted=[^&]*&?/, '$1')
      .replace(/[&?]$/, '');
    return stripped + (stripped.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1&muted=1';
  }

  function wire(modal) {
    if (!modal || modal.getAttribute('data-rbccm-vp-ready')) return;
    modal.setAttribute('data-rbccm-vp-ready', '1');

    var iframe   = modal.querySelector('iframe');
    var closeBtn = modal.querySelector('.close');
    var guard    = modal.querySelector('.rbccm-video-poster__focus-guard');
    if (!iframe) return;
    var src = iframe.getAttribute('data-src') || iframe.getAttribute('src') || '';
    iframe.removeAttribute('src');

    var trigger = null;
    function play() { iframe.setAttribute('src', withAutoplay(src)); }
    function stop() { iframe.removeAttribute('src'); }
    function focusClose() { if (closeBtn) closeBtn.focus(); }
    function focusTrigger() {
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
      trigger = null;
    }
    if (guard) guard.addEventListener('focus', focusClose);

    var selector =
      '[data-bs-toggle="modal"][data-bs-target="#' + modal.id + '"],' +
      '[data-toggle="modal"][data-target="#' + modal.id + '"]';
    /* Remember the play button on click whichever path opens it. */
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (btn) {
      btn.addEventListener('click', function () { trigger = btn; });
    });

    var hasBS5    = !!(window.bootstrap && window.bootstrap.Modal);
    var $         = window.jQuery;
    var hasBS3or4 = !!($ && $.fn && $.fn.modal);

    if (hasBS5) {
      modal.addEventListener('show.bs.modal', function (e) {
        trigger = trigger || (e && e.relatedTarget) || document.activeElement;
        play();
      });
      modal.addEventListener('shown.bs.modal', focusClose);
      modal.addEventListener('hidden.bs.modal', function () { stop(); focusTrigger(); });
      return;
    }
    if (hasBS3or4) {
      var $m = $(modal);
      $m.on('show.bs.modal', function (e) {
        trigger = trigger || (e && e.relatedTarget) || document.activeElement;
        play();
      });
      $m.on('shown.bs.modal', focusClose);
      $m.on('hidden.bs.modal', function () { stop(); focusTrigger(); });
      return;
    }

    /* ---- No Bootstrap: open / close ourselves ---------------------- */
    var backdrop = null;
    function isShown() { return modal.classList.contains('show') || modal.classList.contains('in'); }
    function openModal() {
      if (isShown()) return;
      modal.style.display = 'block';
      void modal.offsetWidth;                         /* reflow for the fade */
      modal.classList.add('show', 'in');
      modal.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-modal', 'true');
      document.body.classList.add('modal-open');
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show in';
      document.body.appendChild(backdrop);
      play();
      setTimeout(focusClose, 0);
    }
    function closeModal() {
      if (!isShown()) return;
      modal.classList.remove('show', 'in');
      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');
      stop();
      setTimeout(function () {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        backdrop = null;
      }, 150);
      focusTrigger();
    }
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (btn) {
      btn.addEventListener('click', function (ev) { ev.preventDefault(); trigger = btn; openModal(); });
    });
    Array.prototype.forEach.call(
      modal.querySelectorAll('[data-bs-dismiss="modal"], [data-dismiss="modal"]'),
      function (btn) { btn.addEventListener('click', function (ev) { ev.preventDefault(); closeModal(); }); }
    );
    modal.addEventListener('click', function (ev) { if (ev.target === modal) closeModal(); });
    document.addEventListener('keydown', function (ev) {
      if ((ev.key === 'Escape' || ev.keyCode === 27) && isShown()) closeModal();
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.rbccm-video-poster__modal'), wire);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
;

/* ==== rbccm-section-group/rbccm-section-group.js ==== */
/* =========================================================================
   RBCCM Section Group - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-section-group.js

   Wraps every section between a "Group start" and a "Group end" marker
   component in one div, so a shared background (e.g. the MAAS+MATA
   dark-strip gradient) runs continuously behind them, exactly as if
   they'd been authored inside a wrapper. Needed because the page
   builder places components one by one and can't nest them.

   Markers (output by the two skins, hidden):
     <span class="rbccm-section-group__marker" hidden
           data-group-start="dark-strip"
           data-group-class="rbccm-section-group rbccm-maas-mata__dark-strip"
           data-group-style="--rbccm-sg-pad-top: 222px;"></span>
     ... any number of sections / TeamSite components ...
     <span class="rbccm-section-group__marker" hidden
           data-group-end="dark-strip"></span>
     (then the script tag that loads this file)

   How it wraps: finds the closest element that contains both markers,
   takes its children from the one holding the start marker to the one
   holding the end marker (inclusive), and moves them into the new
   wrapper div, in order. Works whether TeamSite puts each component in
   its own .iw_component div or nests them in layout rows.

   Timing: the end skin loads this script right after its marker, so it
   runs while the page is still being parsed, before DOMContentLoaded.
   The wrapper therefore exists before carousels / animations set up and
   before first paint in most browsers (no flash, nothing re-measures).
   It runs again on DOMContentLoaded to catch anything missed. Each
   start/end pair is wrapped once; start and end match by group name.
   ========================================================================= */
(function () {
  'use strict';

  function commonAncestor(a, b) {
    var seen = [];
    for (var n = a; n; n = n.parentNode) seen.push(n);
    for (var m = b; m; m = m.parentNode) if (seen.indexOf(m) !== -1) return m;
    return null;
  }

  /* Child of `root` that contains `node` (or is it). */
  function childOf(root, node) {
    var n = node;
    while (n && n.parentNode !== root) n = n.parentNode;
    return n;
  }

  function wrapPair(start, end) {
    var root = commonAncestor(start.parentNode, end.parentNode);
    if (!root) return;
    var first = childOf(root, start);
    var last  = childOf(root, end);
    if (!first || !last) return;
    /* End must come after start in the document. */
    if (first !== last &&
        !(first.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING)) return;

    var wrap = document.createElement('div');
    wrap.className = start.getAttribute('data-group-class') || 'rbccm-section-group';
    var style = start.getAttribute('data-group-style');
    if (style) wrap.setAttribute('style', style);
    var label = start.getAttribute('data-group-label');
    if (label) wrap.setAttribute('aria-label', label);
    wrap.setAttribute('data-rbccm-section-group', start.getAttribute('data-group-start') || '');

    root.insertBefore(wrap, first);
    var n = first, next;
    while (n) {
      next = n.nextSibling;
      wrap.appendChild(n);
      if (n === last) break;
      n = next;
    }
  }

  function run() {
    var starts = document.querySelectorAll('[data-group-start]:not([data-rbccm-sg-done])');
    Array.prototype.forEach.call(starts, function (start) {
      var name = start.getAttribute('data-group-start');
      /* First unmatched end with the same name after this start. */
      var ends = document.querySelectorAll('[data-group-end]:not([data-rbccm-sg-done])');
      for (var i = 0; i < ends.length; i++) {
        var end = ends[i];
        if (end.getAttribute('data-group-end') !== name) continue;
        if (!(start.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
        start.setAttribute('data-rbccm-sg-done', '1');
        end.setAttribute('data-rbccm-sg-done', '1');
        wrapPair(start, end);
        break;
      }
    });
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
}());
;

/* ==== rbccm-awards/rbccm-awards.js ==== */
/* =========================================================================
   RBCCM Awards - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-awards.js

   Behavior
   =========================================================================
   Slick is initialized once at page load with a single static config
   that works at every viewport. NO breakpoint-related Slick params:
   no `responsive` block, no matchMedia listener, no slickSetOption
   calls. The layout adapts via CSS only.

   Config rationale
     - slidesToShow: 1        Slick's "current slide" anchors to the left
                              of the list at every breakpoint. On mobile
                              that's the peek card; on desktop, with
                              `.slick-list { overflow: visible }` and
                              `variableWidth: true`, the extra cards flow
                              out to the right and are all visible in the
                              wider container.
     - variableWidth: true    Cards are fixed 250px (CSS !important); Slick
                              measures them and lays out the track as sum
                              of card widths + gaps. No slide-width math
                              to fight.
     - infinite: true         Carousel loops.

   Controls (arrows + dots) are hidden at desktop via CSS (there's
   nothing to page through when every card is on screen).

   Uses accessible-slick (or CDN fallback) via a shared window promise
   so co-hosted RBCCM components (expertise, capability-cards, etc.)
   dedupe the loader cost.
   ========================================================================= */
jQuery(document).ready(function ($) {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Universal Slick loader shared across RBCCM components. */
  function loadSlick(callback) {
    if (typeof $.fn.slick !== 'undefined') { callback(); return; }
    if (!window.__rbccmSlickLoader__) {
      window.__rbccmSlickLoader__ = new Promise(function (resolve) {
        function poll() {
          if (typeof $.fn.slick !== 'undefined') { resolve(); return true; }
          return false;
        }
        var existing = document.querySelector(
          'script[src*="accessible-slick"], script[src*="slick.min.js"], script[src*="slick-carousel"], script[src*="slick.js"]'
        );
        if (existing) {
          var timer = setInterval(function () { if (poll()) clearInterval(timer); }, 30);
          setTimeout(function () {
            clearInterval(timer);
            if (typeof $.fn.slick === 'undefined') inject();
            else resolve();
          }, 10000);
          return;
        }
        inject();
        function inject() {
          var s = document.createElement('script');
          s.src = 'https://www.rbccm.com/assets/rbccm/js/accessible-slick.min.js';
          s.onload = function () { resolve(); };
          s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
            s2.onload = function () { resolve(); };
            document.head.appendChild(s2);
          };
          document.head.appendChild(s);
        }
      });
    }
    window.__rbccmSlickLoader__.then(callback);
  }

  function setupSection($section) {
    var $grid  = $section.find('.rbccm-awards__grid');
    var $cards = $grid.children('.rbccm-awards__card');
    var $dots  = $section.find('.rbccm-awards__dots');
    var $prev  = $section.find('.rbccm-awards__btn--prev');
    var $next  = $section.find('.rbccm-awards__btn--next');

    /* Breakpoint per variant matches the CSS (row-fits-statically
       width including the 23x2 side inset):
         --3 (MAAS/MATA, 264 cards): 3x264 + 2x16 + 23x2 = 870
         --4 (US Creds,  250 cards): 4x250 + 3x16 + 23x2 = 1146
       On the upward cross we snap to slide 0 so cards 1-N are the
       ones you see, not whatever slide the user paged to on mobile. */
    var desktopBp = $section.hasClass('rbccm-awards--4') ? 1146 : 870;
    var mqDesktop = window.matchMedia('(min-width: ' + desktopBp + 'px)');

    if ($cards.length <= 1) return;

    function initSlider() {
      if ($grid.hasClass('slick-initialized')) return;

      $grid.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      if ($prev.length) $prev[0].disabled = false;
      if ($next.length) $next[0].disabled = false;

      $prev.off('click.rbccmAwards').on('click.rbccmAwards', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickPrev');
      });
      $next.off('click.rbccmAwards').on('click.rbccmAwards', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickNext');
      });

      /* Reset to slide 0 whenever the viewport crosses INTO desktop
         (>=1100). Without this, if the user paged to slide 3 on
         mobile then resized up, Slick's internal transform still
         points to slide 3 - cards 1 and 2 end up off-canvas to the
         left. Only fires on the upward cross; downward transitions
         leave whatever slide is active alone. `true` on slickGoTo
         suppresses the animation for an instant snap. */
      /* Desktop (controls hidden, all cards visible): no swipe or
         mouse-drag, so the row can't be nudged sideways with nothing
         on screen to bring it back. Slick reads these options on each
         touch / drag, so flipping them live is enough. Set directly on
         the instance rather than via slickSetOption, which relies on
         $.type (removed in jQuery 4). */
      function syncSwipe() {
        var slick = $grid.slick('getSlick');
        if (!slick || !slick.options) return;
        var allow = !mqDesktop.matches;
        slick.options.swipe = allow;
        slick.options.draggable = allow;
        slick.options.touchMove = allow;
        $grid.find('.slick-list').toggleClass('draggable', allow);
      }
      syncSwipe();

      /* Desktop a11y: every card is on screen and there are no
         controls, so the row is a static list, not a carousel. Slick
         still marks the current slide tabindex=0 + role=tabpanel and
         aria-hides the rest, which puts a pointless Tab stop on a
         non-interactive card and hides 3 visible cards from screen
         readers. On desktop: strip those from the real slides (stash
         them first) and show all of them to AT; clones stay hidden.
         Back on mobile: restore the stash and let slick re-apply its
         own per-slide state via a no-animation goTo. */
      var ADA_ATTRS = ['tabindex', 'role', 'aria-describedby'];
      function syncA11y() {
        var $real = $grid.find('.slick-slide').not('.slick-cloned');
        var $clones = $grid.find('.slick-cloned');
        if (mqDesktop.matches) {
          $real.each(function () {
            var el = this;
            ADA_ATTRS.forEach(function (a) {
              if (el.hasAttribute(a)) {
                el.setAttribute('data-rbccm-' + a, el.getAttribute(a));
                el.removeAttribute(a);
              }
            });
            el.setAttribute('aria-hidden', 'false');
          });
          $clones.attr({ 'aria-hidden': 'true', tabindex: '-1' });
        } else {
          $real.each(function () {
            var el = this;
            ADA_ATTRS.forEach(function (a) {
              var v = el.getAttribute('data-rbccm-' + a);
              if (v !== null) {
                el.setAttribute(a, v);
                el.removeAttribute('data-rbccm-' + a);
              }
            });
          });
        }
      }
      syncA11y();
      /* Slick re-applies its attributes after each slide change. */
      $grid.on('afterChange.rbccmAwards', function () {
        if (mqDesktop.matches) syncA11y();
      });

      function onBreakpointChange() {
        if (!$grid.hasClass('slick-initialized')) return;
        syncSwipe();
        if (!mqDesktop.matches) {
          syncA11y();
          var slick = $grid.slick('getSlick');
          $grid.slick('slickGoTo', slick ? slick.currentSlide : 0, true);
          return;
        }
        $grid.slick('slickGoTo', 0, true);
        syncA11y();
      }
      if (typeof mqDesktop.addEventListener === 'function') {
        mqDesktop.addEventListener('change', onBreakpointChange);
      } else if (typeof mqDesktop.addListener === 'function') {
        mqDesktop.addListener(onBreakpointChange);
      }
    }

    loadSlick(initSlider);
  }

  $('.rbccm-awards').each(function () { setupSection($(this)); });
});
;

/* ==== rbccm-capability-cards/rbccm-capability-cards.js ==== */
/* =========================================================================
   RBCCM Capability Cards - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-capability-cards.js

   Only acts on `.rbccm-capability-cards--slider` sections (the US
   Credentials and three-up skins). The old MAAS+MATA skin has no
   --slider class, so this file is a no-op there. Sections that also
   carry --three-up use setupThreeUp() (paged 3/2 per view, stacked on
   mobile); everything below describes the US Credentials peek row.

   Behaviour (same pattern as rbccm-awards)
   =========================================================================
   - Slick, variableWidth + infinite. Cards are a fixed 276px (CSS), the
     row starts at the rail's left edge and runs off the right edge of
     the viewport so the next card peeks in. Prev / dots / next below.
   - Static mode: when every card fits the rail (e.g. 4 cards on a wide
     screen) the section gets .is-static. The CSS centres the row at its
     own width and hides the controls; the JS turns swipe off and snaps
     back to card 1. Re-checked on resize.
   - Accessibility: a card link is a Tab stop only when its card is
     fully on screen. Cards that are off canvas (or only peeking) get
     aria-hidden="true" and tabindex="-1" on the link. Slick's
     tabpanel roles are replaced with "slide N of M" groups, and the
     dots get plain "Go to slide N" labels + aria-current. This covers
     both modes: in static mode every real card is visible, so all of
     them are reachable and read, and the clones stay hidden.

   Needs jQuery (on every RBCCM page). Loads accessible-slick (or the
   cdnjs fallback) through the shared window promise used by
   rbccm-awards and the other RBCCM carousels.
   ========================================================================= */
jQuery(document).ready(function ($) {
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Universal Slick loader shared across RBCCM components. */
  function loadSlick(callback) {
    if (typeof $.fn.slick !== 'undefined') { callback(); return; }
    if (!window.__rbccmSlickLoader__) {
      window.__rbccmSlickLoader__ = new Promise(function (resolve) {
        function poll() {
          if (typeof $.fn.slick !== 'undefined') { resolve(); return true; }
          return false;
        }
        var existing = document.querySelector(
          'script[src*="accessible-slick"], script[src*="slick.min.js"], script[src*="slick-carousel"], script[src*="slick.js"]'
        );
        if (existing) {
          var timer = setInterval(function () { if (poll()) clearInterval(timer); }, 30);
          setTimeout(function () {
            clearInterval(timer);
            if (typeof $.fn.slick === 'undefined') inject();
            else resolve();
          }, 10000);
          return;
        }
        inject();
        function inject() {
          var s = document.createElement('script');
          s.src = 'https://www.rbccm.com/assets/rbccm/js/accessible-slick.min.js';
          s.onload = function () { resolve(); };
          s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
            s2.onload = function () { resolve(); };
            document.head.appendChild(s2);
          };
          document.head.appendChild(s);
        }
      });
    }
    window.__rbccmSlickLoader__.then(callback);
  }

  function px(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  /* --three-up (three-up skin, MAAS+MATA): paged, not variableWidth.
       992+     3 per view, paged 3 at a time
       768-991  2 per view, paged 2 at a time
       <768     no carousel: Slick is removed and the cards stack (CSS)
     Non-infinite, so the last page shows the last full set of cards
     (5 cards on desktop = 2 dots: 1-3, then 3-5; 6 cards = 1-3, 4-6) with no clones. When
     the cards fit one page there is no carousel either: the section
     gets .is-static and the CSS lays them out as a plain row. */
  function setupThreeUp($section) {
    var $grid  = $section.find('.rbccm-capability-cards__grid');
    var $cards = $grid.children('.rbccm-capability-cards__card');
    var $dots  = $section.find('.rbccm-capability-cards__dots');
    var $prev  = $section.find('.rbccm-capability-cards__btn--prev');
    var $next  = $section.find('.rbccm-capability-cards__btn--next');
    var count  = $cards.length;
    var mqTablet  = window.matchMedia('(min-width: 768px)');
    var mqDesktop = window.matchMedia('(min-width: 992px)');
    var built = null;   /* cards per view of the current build; 0 = stacked */

    /* Same slide wrapper as the peek row, added once; it survives unslick. */
    $cards.wrap('<div class="rbccm-capability-cards__slide"></div>');
    var $slides = $grid.children('.rbccm-capability-cards__slide');

    function perView() {
      if (!mqTablet.matches) return 0;
      return mqDesktop.matches ? 3 : 2;
    }

    function clearA11y() {
      $slides.each(function () {
        this.removeAttribute('role');
        this.removeAttribute('aria-roledescription');
        this.removeAttribute('aria-label');
        this.removeAttribute('aria-hidden');
        $(this).find('a, button').removeAttr('tabindex');
      });
    }

    /* Only the cards on the current page are read and tabbable. Slick
       marks them .slick-active when slidesToShow > 1. */
    function applyA11y() {
      if (!$grid.hasClass('slick-initialized')) return;
      var slick = $grid.slick('getSlick');
      var total = slick ? slick.slideCount : count;
      $grid.find('.slick-slide').each(function () {
        var el = this;
        var n = parseInt(el.getAttribute('data-slick-index'), 10) + 1;
        var visible = $(el).hasClass('slick-active');
        el.removeAttribute('tabindex');
        el.removeAttribute('aria-describedby');
        el.setAttribute('role', 'group');
        el.setAttribute('aria-roledescription', 'slide');
        el.setAttribute('aria-label', n + ' of ' + total);
        el.setAttribute('aria-hidden', visible ? 'false' : 'true');
        $(el).find('a, button').each(function () {
          if (visible) this.removeAttribute('tabindex');
          else this.setAttribute('tabindex', '-1');
        });
      });
      $dots.find('li, ul').removeAttr('role');
      $dots.find('button').each(function (i) {
        this.removeAttribute('role');
        this.removeAttribute('aria-controls');
        this.removeAttribute('aria-selected');
        this.removeAttribute('tabindex');
        this.setAttribute('aria-label', 'Go to page ' + (i + 1));
        if ($(this).parent().hasClass('slick-active')) this.setAttribute('aria-current', 'true');
        else this.removeAttribute('aria-current');
      });
      /* Arrows disable at the ends (non-infinite). */
      var current = slick ? slick.currentSlide : 0;
      $prev.prop('disabled', current <= 0);
      $next.prop('disabled', current + built >= total);
    }

    function destroy() {
      if ($grid.hasClass('slick-initialized')) {
        $grid.off('.rbccmCap3');
        $grid.slick('unslick');
      }
      $dots.empty();
      $prev.prop('disabled', false);
      $next.prop('disabled', false);
      clearA11y();
      $section.removeClass('is-static');
    }

    function build(n) {
      if (count <= n) { $section.addClass('is-static'); return; }
      $grid.slick({
        rows: 0,
        slidesToShow: n,
        slidesToScroll: n,
        infinite: false,
        arrows: false,
        dots: true,
        appendDots: $dots,
        adaptiveHeight: false,
        accessibility: false,         /* a11y handled in applyA11y */
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)'
      });
      $grid.on('afterChange.rbccmCap3', applyA11y);
      applyA11y();
    }

    function update() {
      var n = perView();
      if (n === built) return;
      destroy();
      built = n;
      if (n > 0) build(n);
    }

    $prev.off('click.rbccmCap').on('click.rbccmCap', function () {
      if ($grid.hasClass('slick-initialized')) $grid.slick('slickPrev');
    });
    $next.off('click.rbccmCap').on('click.rbccmCap', function () {
      if ($grid.hasClass('slick-initialized')) $grid.slick('slickNext');
    });
    $dots.on('click.rbccmCap', 'button', function () { setTimeout(applyA11y, 0); });

    update();
    var t;
    $(window).on('resize.rbccmCap3', function () {
      clearTimeout(t);
      t = setTimeout(update, 100);
    });
  }

  function setupSection($section) {
    if ($section.hasClass('rbccm-capability-cards--three-up')) {
      loadSlick(function () { setupThreeUp($section); });
      return;
    }
    var section = $section[0];
    var $grid   = $section.find('.rbccm-capability-cards__grid');
    var $cards  = $grid.children('.rbccm-capability-cards__card');
    var $dots   = $section.find('.rbccm-capability-cards__dots');
    var $prev   = $section.find('.rbccm-capability-cards__btn--prev');
    var $next   = $section.find('.rbccm-capability-cards__btn--next');
    var count   = $cards.length;

    if (count <= 1) { $section.addClass('is-static'); return; }

    /* Row width from the CSS custom properties, so the numbers live
       in one place (the stylesheet). */
    var cs    = window.getComputedStyle(section);
    var cardW = px(cs.getPropertyValue('--rbccm-cc-card'), 276);
    var gapW  = px(cs.getPropertyValue('--rbccm-cc-gap'), 12);
    var rowW  = count * cardW + (count - 1) * gapW;
    section.style.setProperty('--rbccm-cc-row', rowW + 'px');

    function railWidth() {
      var rail = px(window.getComputedStyle(section)
        .getPropertyValue('--rbccm-capability-cards-max-width'), 1140);
      return Math.min(rail, section.clientWidth - 46);   /* 23px each side */
    }
    function fitsStatically() { return rowW <= railWidth(); }

    function isFullyVisible(slideEl) {
      var list = $grid.find('.slick-list')[0];
      if (!list) return true;
      var lr = list.getBoundingClientRect();
      var sr = slideEl.getBoundingClientRect();
      var w  = sr.right - sr.left;
      if (w <= 0) return false;
      var vis = Math.min(sr.right, lr.right) - Math.max(sr.left, lr.left);
      return vis / w >= 0.9;
    }

    function applyA11y() {
      if (!$grid.hasClass('slick-initialized')) return;
      var slick = $grid.slick('getSlick');
      var total = slick ? slick.slideCount : count;
      $grid.find('.slick-slide').each(function () {
        var el = this;
        var raw = parseInt(el.getAttribute('data-slick-index'), 10);
        var n = ((raw % total) + total) % total + 1;
        var visible = isFullyVisible(el);

        el.removeAttribute('tabindex');
        el.removeAttribute('aria-describedby');
        el.setAttribute('role', 'group');
        el.setAttribute('aria-roledescription', 'slide');
        el.setAttribute('aria-label', n + ' of ' + total);
        el.setAttribute('aria-hidden', visible ? 'false' : 'true');

        $(el).find('a, button').each(function () {
          if (visible) this.removeAttribute('tabindex');
          else this.setAttribute('tabindex', '-1');
        });
      });

      var current = slick ? slick.currentSlide : 0;
      $dots.find('li').removeAttr('role');
      $dots.find('button').each(function (i) {
        this.removeAttribute('role');
        this.removeAttribute('aria-controls');
        this.removeAttribute('aria-selected');
        this.removeAttribute('tabindex');
        this.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        if (i === current) this.setAttribute('aria-current', 'true');
        else this.removeAttribute('aria-current');
      });
      $dots.find('ul').removeAttr('role');
    }

    /* Static mode: no swipe / drag, controls hidden (CSS), back to
       card 1 so the row lines up. Slick reads these options on each
       touch / drag, so setting them on the instance is enough (no
       slickSetOption - it relies on $.type, removed in jQuery 4). */
    var wasStatic = null;
    function syncMode() {
      if (!$grid.hasClass('slick-initialized')) return;
      var isStatic = fitsStatically();
      $section.toggleClass('is-static', isStatic);
      var slick = $grid.slick('getSlick');
      if (slick && slick.options) {
        slick.options.swipe = !isStatic;
        slick.options.draggable = !isStatic;
        slick.options.touchMove = !isStatic;
        $grid.find('.slick-list').toggleClass('draggable', !isStatic);
      }
      if (isStatic !== wasStatic) {
        $grid.slick('setPosition');
        if (isStatic) $grid.slick('slickGoTo', 0, true);
      }
      wasStatic = isStatic;
      applyA11y();
    }

    function initSlider() {
      if ($grid.hasClass('slick-initialized')) return;

      /* Wrap each card in a plain slide div and run Slick with rows: 0,
         so the slide is always that div, whichever Slick build the page
         has (some make the card itself the slide, some add their own
         wrapper). Slide roles and aria-hidden then never land on the
         card link. */
      $cards.wrap('<div class="rbccm-capability-cards__slide"></div>');

      $grid.slick({
        rows: 0,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,
        accessibility: false,         /* a11y handled in applyA11y */
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      $prev.off('click.rbccmCap').on('click.rbccmCap', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickPrev');
      });
      $next.off('click.rbccmCap').on('click.rbccmCap', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickNext');
      });

      $grid.on('afterChange.rbccmCap', applyA11y);
      /* Dot buttons are rebuilt by some slick builds; re-label on click. */
      $dots.on('click.rbccmCap', 'button', function () { setTimeout(applyA11y, 0); });

      syncMode();

      var t;
      $(window).on('resize.rbccmCap', function () {
        clearTimeout(t);
        t = setTimeout(syncMode, 100);
      });
    }

    loadSlick(initSlider);
  }

  $('.rbccm-capability-cards--slider').each(function () { setupSection($(this)); });
});
;

/* ==== rbccm-marketo-modal/rbccm-marketo-modal.js ==== */
/* =========================================================================
   RBCCM Marketo Modal - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-marketo-modal.js
   =========================================================================
   One <dialog class="rbccm-marketo-modal" id="{ModalID}"> per instance
   (rbccm-marketo-modal.xsl). This file:

   Open / close
     - Opens on any click of a link whose URL is #{ModalID} on this page
       (e.g. the hero and CTA band "Request a demo" buttons) or of any
       element with data-rbccm-modal="{ModalID}". Listens in the capture
       phase so smooth-scroll or Bootstrap hash handlers never see it.
     - Opens on load when the page URL ends in #{ModalID} (shareable).
     - Native showModal(): focus is trapped in the dialog, Escape closes,
       the page behind is inert. A focus guard loops Tab / Shift+Tab
       between the X and the last control (same as the video poster and
       two-up card modals). Closes on the X, Cancel, the thank-you
       Close button, or a click on the backdrop. Focus returns to the
       trigger, the page stops scrolling while open, and a #{ModalID}
       hash is cleared from the URL on close.

   Marketo
     - Reuses window.MktoForms2 when the page already has it (the Marketo
       footer, or a legacy form), waits for an existing forms2 script
       tag, otherwise injects {base}/js/forms2/js/forms2.min.js.
     - Loads the form up front so it is ready when the modal opens.
     - Prefixes the form's element IDs with {ModalID}- (labels and aria
       references follow) so they can't clash with another Marketo form
       on the page, which uses the same field IDs.
     - Tags each field column with rbccm-marketo-modal__field--{name}
       (+ --text / --checkbox) so the CSS can lay the form out by field
       name instead of Marketo's own rows and inline widths, and marks
       text fields .is-filled for the floating labels.
     - Submit button label + arrow, Cancel button next to it.
     - Business email check, gacid hidden field, dataLayer "mktoLead"
       push and the thank-you state (same behaviour as the Marketo
       footer, scoped to this form ID).
   ========================================================================= */
(function () {
  'use strict';

  var BAD_DOMAINS = ['@gmail.', '@yahoo.', '@hotmail.', '@live.', '@aol.', '@outlook.'];
  /* Sentence-case labels (design), by Marketo field name. Overrides the
     form builder's wording ("First Name", "Company Name:"); fields not
     listed keep their Marketo label. */
  var FIELD_LABELS = {
    FirstName: 'First name',
    LastName:  'Last name',
    Company:   'Company',
    Title:     'Title',
    Email:     'Business email'
  };
  /* Figma: 18 x 18 frame, 15.751 x 10.126 glyph, white (currentColor). */
  var ARROW_SVG = '<svg class="rbccm-marketo-modal__submit-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.125 8.99998C1.125 8.85079 1.18426 8.70772 1.28975 8.60223C1.39524 8.49674 1.53832 8.43748 1.6875 8.43748H14.9546L11.4142 4.89823C11.3086 4.79261 11.2493 4.64935 11.2493 4.49998C11.2493 4.35061 11.3086 4.20735 11.4142 4.10173C11.5199 3.99611 11.6631 3.93677 11.8125 3.93677C11.9619 3.93677 12.1051 3.99611 12.2108 4.10173L16.7108 8.60173C16.7631 8.65398 16.8047 8.71605 16.8331 8.78439C16.8614 8.85273 16.876 8.92599 16.876 8.99998C16.876 9.07397 16.8614 9.14723 16.8331 9.21557C16.8047 9.2839 16.7631 9.34598 16.7108 9.39823L12.2108 13.8982C12.1051 14.0038 11.9619 14.0632 11.8125 14.0632C11.6631 14.0632 11.5199 14.0038 11.4142 13.8982C11.3086 13.7926 11.2493 13.6494 11.2493 13.5C11.2493 13.3506 11.3086 13.2073 11.4142 13.1017L14.9546 9.56248H1.6875C1.53832 9.56248 1.39524 9.50321 1.28975 9.39773C1.18426 9.29224 1.125 9.14916 1.125 8.99998Z" fill="currentColor"/></svg>';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* One shared forms2 loader for every modal on the page. */
  var forms2Promise = null;
  function loadForms2(base) {
    if (window.MktoForms2) return Promise.resolve();
    if (forms2Promise) return forms2Promise;
    forms2Promise = new Promise(function (resolve) {
      var existing = document.querySelector('script[src*="forms2.min.js"]');
      if (existing) {
        var tries = 0;
        var timer = setInterval(function () {
          if (window.MktoForms2) { clearInterval(timer); resolve(); }
          else if (++tries > 200) { clearInterval(timer); inject(); }   /* ~10s */
        }, 50);
        return;
      }
      inject();
      function inject() {
        var s = document.createElement('script');
        s.src = base + '/js/forms2/js/forms2.min.js';
        s.onload = function () { resolve(); };
        document.head.appendChild(s);
      }
    });
    return forms2Promise;
  }

  function emailOk(email) {
    email = String(email || '').toLowerCase();
    for (var i = 0; i < BAD_DOMAINS.length; i++) {
      if (email.indexOf(BAD_DOMAINS[i]) !== -1) return false;
    }
    return true;
  }
  function gacid() {
    try { return window.ga.getAll()[0].get('clientId'); } catch (e) { return 'n/a'; }
  }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function initModal(modal) {
    if (modal.getAttribute('data-rbccm-modal-ready') === 'true') return;
    modal.setAttribute('data-rbccm-modal-ready', 'true');

    var id       = modal.id;
    var formId   = modal.getAttribute('data-form-id') || '';
    var base     = modal.getAttribute('data-base-url') || '//discover.rbccm.com';
    var munchkin = modal.getAttribute('data-munchkin') || '577-RQV-784';
    var submitLabel = modal.getAttribute('data-submit-label') || 'Submit';
    var cancelLabel = modal.getAttribute('data-cancel-label') || 'Cancel';
    var header   = modal.querySelector('.rbccm-marketo-modal__header');
    var formWrap = modal.querySelector('.rbccm-marketo-modal__form');
    var thanks   = modal.querySelector('.rbccm-marketo-modal__thanks');
    var thanksHeading = thanks ? thanks.querySelector('.rbccm-marketo-modal__thanks-heading') : null;
    var thanksTemplate = thanksHeading ? thanksHeading.textContent : '';
    var lastTrigger = null;
    var canShowModal = typeof modal.showModal === 'function';

    /* ---------- open / close ---------- */
    function open(trigger) {
      lastTrigger = trigger || document.activeElement;
      if (modal.open) return;
      document.documentElement.classList.add('rbccm-marketo-modal-open');
      if (canShowModal) modal.showModal();
      else { modal.setAttribute('open', ''); modal.classList.add('is-fallback-open'); }
      /* Focus the panel (tabindex -1), not the first control: screen
         readers announce the dialog + heading, and Tab moves to the X. */
      try { modal.focus({ preventScroll: true }); } catch (e) { modal.focus(); }
    }
    function close() {
      if (!modal.open) return;
      if (canShowModal) modal.close();
      else { modal.removeAttribute('open'); modal.classList.remove('is-fallback-open'); onClosed(); }
    }
    function onClosed() {
      document.documentElement.classList.remove('rbccm-marketo-modal-open');
      if (window.location.hash === '#' + id && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        try { lastTrigger.focus({ preventScroll: true }); } catch (e) { lastTrigger.focus(); }
      }
    }
    modal.addEventListener('close', onClosed);

    /* Focus guard: Tab past the last control loops back to the X and
       Shift+Tab past the X loops to the last one (Cancel, or the
       thank-you Close). showModal() already makes the page behind inert,
       but browsers send Tab out to their own toolbar before wrapping, and
       the no-showModal fallback has no trap at all. Only visible controls
       count, so the hidden form / thank-you state is skipped. */
    var TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
                   'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !modal.open) return;
      var items = Array.prototype.filter.call(modal.querySelectorAll(TABBABLE), function (el) {
        return el.tabIndex >= 0 && el.getClientRects().length > 0;
      });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || active === modal)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* X, Cancel, thank-you Close; and a click on the backdrop (the dialog
       element itself is the panel, so a click whose point is outside its
       box landed on ::backdrop). */
    modal.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-rbccm-modal-close]')) { close(); return; }
      if (e.target === modal) {
        var r = modal.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
      }
    });

    /* Triggers. Capture phase so other hash / smooth-scroll handlers on
       the page don't act on #{ModalID} first. Only same-page links. */
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-rbccm-modal], a[href*="#"]') : null;
      if (!el || modal.contains(el)) return;
      var target = el.getAttribute('data-rbccm-modal');
      if (!target) {
        if (el.hash !== '#' + id) return;
        if (el.pathname && el.pathname !== window.location.pathname) return;
        target = id;
      }
      if (target !== id) return;
      e.preventDefault();
      open(el);
    }, true);

    if (window.location.hash === '#' + id) open(null);

    /* ---------- Marketo ---------- */
    if (!formId) return;

    loadForms2(base).then(function () {
      if (!window.MktoForms2) return;
      window.MktoForms2.loadForm(base, munchkin, Number(formId));
      window.MktoForms2.whenReady(function (form) {
        if (String(form.getId()) !== formId) return;
        decorate(form);
      });
    });

    function decorate(form) {
      var formEl = form.getFormElem()[0];
      if (!formEl || formEl.getAttribute('data-rbccm-decorated') === 'true') return;
      formEl.setAttribute('data-rbccm-decorated', 'true');

      /* Unique IDs. Marketo gives every form the same field IDs (#Email,
         #FirstName...), so with a second form on the page (the Marketo
         footer) each label for="" resolves to whichever form comes first
         and the other form's inputs lose their labels. Prefix this form's
         IDs and repoint its label / aria references to match. */
      var prefix = id + '-';
      var idMap = {};
      Array.prototype.forEach.call(formEl.querySelectorAll('[id]'), function (el) {
        if (el.id.indexOf(prefix) === 0) return;
        idMap[el.id] = prefix + el.id;
        el.id = idMap[el.id];
      });
      Array.prototype.forEach.call(formEl.querySelectorAll('label[for]'), function (el) {
        var f = el.getAttribute('for');
        if (idMap[f]) el.setAttribute('for', idMap[f]);
      });
      Array.prototype.forEach.call(formEl.querySelectorAll('[aria-describedby], [aria-labelledby]'), function (el) {
        ['aria-describedby', 'aria-labelledby'].forEach(function (attr) {
          var v = el.getAttribute(attr);
          if (!v) return;
          el.setAttribute(attr, v.split(/\s+/).map(function (ref) { return idMap[ref] || ref; }).join(' '));
        });
      });

      /* Field classes: layout by field name, not Marketo's rows. */
      var cols = formEl.querySelectorAll('.mktoFormCol');
      Array.prototype.forEach.call(cols, function (col) {
        var field = col.querySelector('.mktoField');
        if (!field || field.type === 'hidden') return;
        var isCheckbox = field.type === 'checkbox' || field.type === 'radio';
        col.classList.add('rbccm-marketo-modal__field');
        col.classList.add('rbccm-marketo-modal__field--' + slug(field.name));
        col.classList.add(isCheckbox ? 'rbccm-marketo-modal__field--checkbox' : 'rbccm-marketo-modal__field--text');
        if (isCheckbox) return;
        /* Label text: replace Marketo's wording, keep its hidden asterisk
           element. The placeholder follows so autofill / screen readers
           that read it get the same words. */
        var newLabel = FIELD_LABELS[field.name];
        var labelEl = col.querySelector('label.mktoLabel');
        if (newLabel && labelEl) {
          Array.prototype.slice.call(labelEl.childNodes).forEach(function (node) {
            if (node.nodeType === 3) labelEl.removeChild(node);
          });
          labelEl.appendChild(document.createTextNode(newLabel));
          if (field.hasAttribute('placeholder')) field.setAttribute('placeholder', newLabel);
        }
        /* Floating label: .is-filled keeps it up once there is a value
           (typed, autofilled or restored). */
        var sync = function () { col.classList.toggle('is-filled', !!field.value); };
        field.addEventListener('input', sync);
        field.addEventListener('change', sync);
        field.addEventListener('blur', sync);
        sync();
        setTimeout(sync, 600);
      });

      /* Submit label + arrow, Cancel beside it. */
      var btn = formEl.querySelector('.mktoButton');
      function renderButton() {
        btn.innerHTML = '<span class="rbccm-marketo-modal__submit-label"></span>' + ARROW_SVG;
        btn.querySelector('.rbccm-marketo-modal__submit-label').textContent = submitLabel;
        btn.classList.add('rbccm-marketo-modal__submit');
      }
      if (btn) renderButton();

      /* Guard against page-wide scripts from other Marketo forms. The
         MAAS page's legacy form 1205 script runs
         $(".mktoButton").html("Sign up") and
         $("#autofill").prependTo(".mktoCheckboxList"), which hit every
         form on the page, so whichever form loaded last decided this
         button's text. Put the label + arrow back if anything rewrites
         the button, and drop any copy of 1205's #autofill block that
         lands in this form. Our own writes leave the label span in
         place, so this never loops. */
      if (window.MutationObserver) {
        new MutationObserver(function () {
          if (btn && !btn.querySelector('.rbccm-marketo-modal__submit-label')) renderButton();
          Array.prototype.forEach.call(formEl.querySelectorAll('#autofill'), function (el) {
            el.parentNode.removeChild(el);
          });
        }).observe(formEl, { childList: true, subtree: true });
      }
      var buttonRow = formEl.querySelector('.mktoButtonRow');
      if (buttonRow && !buttonRow.querySelector('.rbccm-marketo-modal__cancel')) {
        var cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'rbccm-marketo-modal__cancel';
        cancel.setAttribute('data-rbccm-modal-close', '');
        cancel.textContent = cancelLabel;
        buttonRow.appendChild(cancel);
      }

      /* Validation: every message at once. Marketo flags all invalid
         fields but only writes a message under the first, so the rest
         looked fine until visited. On submit this checks every field
         Marketo marks required (.mktoRequiredField, so it follows the
         form builder), plus email format and the business email rule,
         writes a message under each, and focuses the first. After the
         first attempt each message clears or updates as the field is
         edited. Marketo's own single message is hidden while ours show
         (has-inline-errors); if it rejects something we don't check,
         its message still shows. */
      var attempted = false;
      var errorSeq = 0;

      function checkWrap(wrap) {
        var input = wrap.querySelector('.mktoField');
        if (!input || input.type === 'hidden') return '';
        var required = wrap.classList.contains('mktoRequiredField');
        if (input.type === 'checkbox' || input.type === 'radio') {
          return required && !wrap.querySelector('.mktoField:checked') ? 'This field is required.' : '';
        }
        var value = String(input.value || '').trim();
        if (!value) return required ? 'This field is required.' : '';
        if (input.type === 'email' || input.name === 'Email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Must be valid email.';
          if (input.name === 'Email' && !emailOk(value)) return 'Must be Business email.';
        }
        return '';
      }

      function showError(wrap, msg) {
        var inputs = wrap.querySelectorAll('.mktoField');
        var el = wrap.querySelector('.rbccm-marketo-modal__error');
        if (msg && !el) {
          el = document.createElement('div');
          el.className = 'rbccm-marketo-modal__error';
          el.id = id + '-error-' + (++errorSeq);
          wrap.appendChild(el);
        }
        if (msg) el.textContent = msg;
        /* Our own flag: Marketo clears mktoInvalid / aria-invalid on blur
           for anything its own rules accept (e.g. a gmail address). */
        wrap.classList.toggle('is-invalid', !!msg);
        var errId = el ? el.id : '';
        Array.prototype.forEach.call(inputs, function (input) {
          var refs = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (r) {
            return r && r !== errId;
          });
          if (msg) {
            refs.push(errId);
            input.setAttribute('aria-invalid', 'true');
            input.classList.add('mktoInvalid');
          } else {
            input.removeAttribute('aria-invalid');
            input.classList.remove('mktoInvalid');
          }
          if (refs.length) input.setAttribute('aria-describedby', refs.join(' '));
          else input.removeAttribute('aria-describedby');
        });
        if (!msg && el) el.parentNode.removeChild(el);
        return !!msg;
      }

      function validateAll() {
        var bad = [];
        Array.prototype.forEach.call(formEl.querySelectorAll('.mktoFieldWrap'), function (wrap) {
          if (showError(wrap, checkWrap(wrap))) bad.push(wrap);
        });
        formEl.classList.toggle('has-inline-errors', bad.length > 0);
        return bad;
      }

      form.onValidate(function () {
        attempted = true;
        var bad = validateAll();
        form.submitable(bad.length === 0);
        if (!bad.length) return;
        /* First invalid field on screen (the CSS orders fields by name,
           so DOM order can differ from what the user sees). */
        bad.sort(function (a, b) {
          var ra = a.getBoundingClientRect();
          var rb = b.getBoundingClientRect();
          return (ra.top - rb.top) || (ra.left - rb.left);
        });
        var target = bad[0].querySelector('.mktoField');
        setTimeout(function () { if (target) target.focus(); }, 0);
      });

      function revalidate(e) {
        if (!attempted) return;
        var wrap = e.target.closest && e.target.closest('.mktoFieldWrap');
        if (!wrap || !formEl.contains(wrap)) return;
        showError(wrap, checkWrap(wrap));
        formEl.classList.toggle('has-inline-errors', !!formEl.querySelector('.rbccm-marketo-modal__error'));
      }
      formEl.addEventListener('input', revalidate);
      formEl.addEventListener('change', revalidate);
      /* Marketo re-validates on blur and resets aria-invalid; re-apply
         ours after it runs. */
      formEl.addEventListener('focusout', function (e) {
        setTimeout(function () { revalidate(e); }, 0);
      });

      form.vals({ gacid: gacid() });

      form.onSuccess(function (vals) {
        if (window.dataLayer) window.dataLayer.push({ event: 'mktoLead', mktoFormId: form.getId() });
        if (thanks) {
          var name = String((vals && vals.FirstName) || '').trim();
          if (thanksHeading) {
            thanksHeading.textContent = name
              ? thanksTemplate.replace('{FirstName}', name)
              : thanksTemplate.replace(/,?\s*\{FirstName\}/, '');
          }
          if (header) header.hidden = true;
          if (formWrap) formWrap.hidden = true;
          thanks.hidden = false;
          if (thanksHeading) thanksHeading.focus();
        }
        return false;     /* stay on the page */
      });
    }
  }

  ready(function () {
    var modals = document.querySelectorAll('dialog.rbccm-marketo-modal[id]');
    for (var i = 0; i < modals.length; i++) initModal(modals[i]);
  });
})();
;
