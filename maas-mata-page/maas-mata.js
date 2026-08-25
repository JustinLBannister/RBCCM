/* maas-mata.js
   Five IIFEs, each self-contained and a no-op if its markup isn't on
   the page: video modal, animate.css bindings (IO + reduced-motion),
   awards carousel (mobile scroll-snap), insights carousel, chart
   ticker. RBCCMBind bootstrap at the bottom runs only when the runtime
   is present (preview builds). Otherwise Datums render server-side. */

  // ---- Brightcove video modal ---------------------------------
  // Play button on the chart image opens a modal with a Brightcove
  // iframe. Data attributes (data-bc-account / -player / -video)
  // live on the play button so the CMS can populate per page.
  // The iframe src is built + injected on open (lazy load), and
  // cleared on close so the player stops playing.
  (function () {
    var modal = document.getElementById('rbccm-mm-video-modal');
    if (!modal) return;
    var iframe = modal.querySelector('[data-video-iframe]');
    var closers = modal.querySelectorAll('[data-video-close]');
    var lastTrigger = null;

    function bcSrc(acct, player, video) {
      var p = player || 'default';
      return 'https://players.brightcove.net/' + encodeURIComponent(acct) +
             '/' + encodeURIComponent(p) + '_default/index.html?videoId=' +
             encodeURIComponent(video) + '&autoplay=1';
    }

    // Fallback video for design review / preview. Plays when the
    // Brightcove Datums are empty so the modal always has something
    // to show. Replace with the real Brightcove video once configured.
    var FALLBACK_VIDEO_SRC = 'https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&rel=0';

    function open(trigger) {
      var acct  = trigger.getAttribute('data-bc-account') || '';
      var player = trigger.getAttribute('data-bc-player') || '';
      var video = trigger.getAttribute('data-bc-video') || '';
      lastTrigger = trigger;
      // Prefer Brightcove when both account + video are set; otherwise
      // fall back to the YouTube placeholder so the modal isn't empty.
      if (acct && video) {
        iframe.src = bcSrc(acct, player, video);
      } else {
        iframe.src = FALLBACK_VIDEO_SRC;
      }
      modal.hidden = false;
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
      });
      document.body.classList.add('rbccm-maas-mata--modal-open');
      var closeBtn = modal.querySelector('.rbccm-maas-mata__video-modal-close');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.classList.remove('rbccm-maas-mata--modal-open');
      iframe.src = '';
      setTimeout(function () { modal.hidden = true; }, 220);
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-video-play]');
      if (trigger) {
        e.preventDefault();
        open(trigger);
      }
    });
    closers.forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  })();

  // ---- animate.css bindings ----------------------------------
  // Two triggers:
  //   data-animate-hero="fadeInUp"       fires on load (staggered)
  //   data-animate="fadeInUp"            fires on scroll-in
  //   data-stagger-parent="fadeInUp"     children stagger on scroll-in
  //   data-animate-delay="200"           optional ms delay
  //   data-animate-duration="800"        optional ms duration
  // Reduced-motion users: everything reveals instantly (CSS above
  // forces opacity:1 and disables the animation property).
  (function () {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ?noanim=1 in the URL forces every data-animate element to
    // opacity:1 immediately so full-page screenshot tools capture
    // everything without needing to scroll (IntersectionObserver
    // otherwise leaves below-fold sections hidden).
    var noanim = /[?&]noanim=1/.test(window.location.search);
    document.body.classList.add('rbccm-anim-ready');
    if (noanim) {
      document.querySelectorAll('[data-animate], [data-animate-hero], [data-stagger-parent] > *').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }
    if (reduced) return;

    function play(el, name, delay, duration) {
      setTimeout(function () {
        if (duration) el.style.setProperty('--animate-duration', duration + 'ms');
        el.classList.add('animate__animated', 'animate__' + name);
      }, delay || 0);
    }

    // Hero on-load cascade (each element runs immediately, offset by
    // its own delay attribute so section reads eyebrow → title → sub → CTA).
    document.querySelectorAll('[data-animate-hero]').forEach(function (el) {
      var name = el.getAttribute('data-animate-hero') || 'fadeInUp';
      var delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
      var duration = parseInt(el.getAttribute('data-animate-duration') || '0', 10) || null;
      play(el, name, delay, duration);
    });

    if (!('IntersectionObserver' in window)) {
      // Old browsers: reveal everything without animation.
      document.querySelectorAll('[data-animate], [data-stagger-parent] > *').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    // Single-element reveals.
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
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      singleIo.observe(el);
    });

    // Staggered children: parent enters viewport → each child animates
    // 100ms after the previous. Stagger step configurable via
    // data-stagger-step="150" (default 100).
    var staggerIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var parent = entry.target;
        var name = parent.getAttribute('data-stagger-parent') || 'fadeInUp';
        var step = parseInt(parent.getAttribute('data-stagger-step') || '100', 10);
        var children = parent.children;
        for (var i = 0; i < children.length; i++) {
          play(children[i], name, i * step);
        }
        staggerIo.unobserve(parent);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-stagger-parent]').forEach(function (el) {
      staggerIo.observe(el);
    });
  })();

  // ---- Awards carousel (mobile only, unslicks on tablet+) ---------
  // At <=720 the awards grid becomes a horizontal scroll-snap track
  // (one card per snap stop, next card peeks off-canvas). Arrows
  // scroll by one slide; dots reflect the visible slide via an
  // IntersectionObserver so touch-swipes stay in sync. Above 720
  // the controls hide and the grid returns to its natural row -
  // no explicit "unslick" needed since the state lives in CSS + a
  // scroll offset that gets reset by the resize handler.
  (function () {
    var track = document.querySelector('.rbccm-maas-mata__awards-grid');
    var controls = document.querySelector('[data-awards-controls]');
    if (!track || !controls) return;

    // Unslick breakpoint: 3 × 264 card + 2 × 16 gap = 824, plus
     // 2 × 24 section padding = 872. Below 872 the three cards
     // can't sit side-by-side without wrap, so the carousel wins.
    var mq = window.matchMedia('(max-width: 871px)');
    var dotsHost = controls.querySelector('[data-awards-dots]');
    var prevBtn = controls.querySelector('[data-awards-prev]');
    var nextBtn = controls.querySelector('[data-awards-next]');
    var wired = false;
    var activeIndex = 0;

    function getSlides() { return Array.prototype.slice.call(track.querySelectorAll('.rbccm-maas-mata__award-card')); }

    function renderDots(count) {
      // Two SVG glyphs per dot: a filled white disc shown when active,
      // and a hollow ring shown at rest. CSS toggles visibility off
      // the parent .--active class so no re-render is needed on nav.
      var FILL = '<svg class="rbccm-maas-mata__awards-dot-fill" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><circle cx="5.5" cy="5.5" r="5.5" fill="white"/></svg>';
      var RING = '<svg class="rbccm-maas-mata__awards-dot-ring" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><circle cx="5.5" cy="5.5" r="5" stroke="white"/></svg>';
      dotsHost.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rbccm-maas-mata__awards-dot' + (i === activeIndex ? ' rbccm-maas-mata__awards-dot--active' : '');
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Show award ' + (i + 1));
        b.setAttribute('data-idx', String(i));
        b.innerHTML = FILL + RING;
        dotsHost.appendChild(b);
      }
    }

    function setActive(i) {
      var slides = getSlides();
      if (!slides.length) return;
      activeIndex = Math.max(0, Math.min(slides.length - 1, i));
      var dots = dotsHost.querySelectorAll('.rbccm-maas-mata__awards-dot');
      dots.forEach(function (d, di) {
        d.classList.toggle('rbccm-maas-mata__awards-dot--active', di === activeIndex);
      });
      if (prevBtn) prevBtn.disabled = activeIndex === 0;
      if (nextBtn) nextBtn.disabled = activeIndex === slides.length - 1;
    }

    function goTo(i) {
      var slides = getSlides();
      if (!slides.length) return;
      var target = slides[Math.max(0, Math.min(slides.length - 1, i))];
      if (!target) return;
      // Scroll the track so the target's left edge aligns with the
      // track's scroll-padding-left. Using scrollTo keeps native
      // smooth-scroll + snap behaviour.
      var offset = target.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || '0');
      track.scrollTo({ left: offset, behavior: 'smooth' });
    }

    function wire() {
      if (wired) return;
      var slides = getSlides();
      renderDots(slides.length);
      setActive(0);

      prevBtn.addEventListener('click', onPrev);
      nextBtn.addEventListener('click', onNext);
      dotsHost.addEventListener('click', onDotClick);

      // Scroll-based active-index: whichever slide is closest to
      // the track's scroll-padding-left is the current one. More
      // reliable than IntersectionObserver at this card size /
      // peek ratio since the observer's threshold check races the
      // snap animation. Debounced so we don't thrash the DOM.
      var scrollTimer = null;
      function onScroll() {
        if (scrollTimer) return;
        scrollTimer = requestAnimationFrame(function () {
          scrollTimer = null;
          var slides = getSlides();
          var offset = track.scrollLeft + parseFloat(getComputedStyle(track).paddingLeft || '0');
          var closest = 0;
          var minDist = Infinity;
          slides.forEach(function (s, i) {
            var d = Math.abs(s.offsetLeft - track.offsetLeft - offset);
            if (d < minDist) { minDist = d; closest = i; }
          });
          if (closest !== activeIndex) setActive(closest);
        });
      }
      track.addEventListener('scroll', onScroll, { passive: true });
      // Store on track so unwire can remove it.
      track._awardsScrollHandler = onScroll;
      controls.hidden = false;
      wired = true;
    }

    function unwire() {
      if (!wired) return;
      prevBtn.removeEventListener('click', onPrev);
      nextBtn.removeEventListener('click', onNext);
      dotsHost.removeEventListener('click', onDotClick);
      if (track._awardsScrollHandler) {
        track.removeEventListener('scroll', track._awardsScrollHandler);
        track._awardsScrollHandler = null;
      }
      // Reset the track's scroll so returning to mobile starts at slide 0.
      track.scrollTo({ left: 0 });
      controls.hidden = true;
      wired = false;
    }

    function onPrev() { goTo(activeIndex - 1); }
    function onNext() { goTo(activeIndex + 1); }
    function onDotClick(e) {
      var t = e.target.closest('[data-idx]');
      if (!t) return;
      goTo(parseInt(t.getAttribute('data-idx'), 10) || 0);
    }

    function apply() {
      if (mq.matches) wire(); else unwire();
    }

    apply();
    // Debounced resize so we don't thrash wire/unwire during drags.
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(apply, 100);
    });
  })();

  // ---- Market Insights carousel (always-on, all breakpoints) ----
  // 3 real cards in a scroll-snap track. Arrow + dot controls work
  // the same as the awards mobile carousel: click arrow to nudge
  // scrollLeft by one card, IO tracks which card is centred so the
  // dots reflect the visible slide (touch-swipe stays in sync).
  (function () {
    var track = document.querySelector('[data-insights-track]');
    var controls = document.querySelector('[data-insights-controls]');
    if (!track || !controls) return;

    var dotsHost = controls.querySelector('[data-insights-dots]');
    var prevBtn = controls.querySelector('[data-insights-prev]');
    var nextBtn = controls.querySelector('[data-insights-next]');
    var activeIndex = 0;

    function getSlides() { return Array.prototype.slice.call(track.querySelectorAll('.rbccm-maas-mata__featured-card')); }

    function renderDots(count) {
      var FILL = '<svg class="rbccm-maas-mata__awards-dot-fill" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><circle cx="5.5" cy="5.5" r="5.5" fill="white"/></svg>';
      var RING = '<svg class="rbccm-maas-mata__awards-dot-ring" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><circle cx="5.5" cy="5.5" r="5" stroke="white"/></svg>';
      dotsHost.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rbccm-maas-mata__awards-dot' + (i === activeIndex ? ' rbccm-maas-mata__awards-dot--active' : '');
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Show insight ' + (i + 1));
        b.setAttribute('data-idx', String(i));
        b.innerHTML = FILL + RING;
        dotsHost.appendChild(b);
      }
    }

    function setActive(i) {
      var slides = getSlides();
      if (!slides.length) return;
      activeIndex = Math.max(0, Math.min(slides.length - 1, i));
      var dots = dotsHost.querySelectorAll('.rbccm-maas-mata__awards-dot');
      dots.forEach(function (d, di) {
        d.classList.toggle('rbccm-maas-mata__awards-dot--active', di === activeIndex);
      });
      if (prevBtn) prevBtn.disabled = activeIndex === 0;
      if (nextBtn) nextBtn.disabled = activeIndex === slides.length - 1;
    }

    function goTo(i) {
      var slides = getSlides();
      if (!slides.length) return;
      var target = slides[Math.max(0, Math.min(slides.length - 1, i))];
      if (!target) return;
      var offset = target.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: offset, behavior: 'smooth' });
    }

    function init() {
      var slides = getSlides();
      renderDots(slides.length);
      setActive(0);

      prevBtn.addEventListener('click', function () { goTo(activeIndex - 1); });
      nextBtn.addEventListener('click', function () { goTo(activeIndex + 1); });
      dotsHost.addEventListener('click', function (e) {
        var t = e.target.closest('[data-idx]');
        if (!t) return;
        goTo(parseInt(t.getAttribute('data-idx'), 10) || 0);
      });

      // Scroll-based active tracker (rAF-throttled). More reliable than
      // IntersectionObserver on a snap track — IO can race with the
      // snap animation and miss transitions. Finds the slide whose left
      // edge is closest to the track's current scrollLeft.
      var scrollTimer = null;
      function onScroll() {
        if (scrollTimer) return;
        scrollTimer = requestAnimationFrame(function () {
          scrollTimer = null;
          var slides = getSlides();
          if (!slides.length) return;
          var offset = track.scrollLeft + parseFloat(getComputedStyle(track).paddingLeft || '0');
          var closest = 0, minDist = Infinity;
          slides.forEach(function (s, i) {
            var d = Math.abs(s.offsetLeft - track.offsetLeft - offset);
            if (d < minDist) { minDist = d; closest = i; }
          });
          if (closest !== activeIndex) setActive(closest);
        });
      }
      track.addEventListener('scroll', onScroll, { passive: true });
    }

    // Data binding may inflate the list from 0 fallback cards to
    // N JSON cards after DOMContentLoaded, so if the track was
    // empty at init time, wait for the binder before rendering.
    if (getSlides().length) {
      init();
    } else {
      // Simple retry loop capped at ~1s; binder normally runs
      // synchronously after DOMContentLoaded.
      var tries = 0;
      var iv = setInterval(function () {
        if (getSlides().length || ++tries > 20) {
          clearInterval(iv);
          if (getSlides().length) init();
        }
      }, 50);
    }
  })();

  // ---- Fake live ticker on the MAAS/MATA chart card ----------------
  // Cosmetic only — makes the demo card feel "live" by nudging the quote
  // prices, deltas, execution-quality score, and consistent-trades total
  // on a short interval. Baselines are captured after JSON bind so any
  // authored values from the CMS become the anchor.
  (function () {
    var TICK_MS_QUOTES  = 1800;   // price/delta refresh cadence
    var TICK_MS_TRADES  = 3200;   // headline number drift cadence
    var VOLATILITY_PCT  = 0.006;  // ±0.6% random walk per tick
    var CARD_SELECTOR   = '.rbccm-maas-mata__chart-card';
    var QUOTE_ROW_SEL   = '.rbccm-maas-mata__chart-quote';
    var VALUE_SEL       = '.rbccm-maas-mata__chart-quote-value';
    var DELTA_SEL       = '.rbccm-maas-mata__chart-quote-delta';
    var DELTA_POS_CLASS = 'rbccm-maas-mata__chart-quote-delta--positive';
    var QUALITY_SEL     = '.rbccm-maas-mata__chart-quality-score';
    var HEADLINE_SEL    = '.rbccm-maas-mata__chart-headline-value';

    function parseNum(str) {
      if (!str) return null;
      var n = parseFloat(String(str).replace(/[+$,\s]/g, ''));
      return isFinite(n) ? n : null;
    }
    function decimalsOf(str) {
      var p = String(str).split('.')[1];
      return p ? p.replace(/[^\d]/g, '').length : 0;
    }
    function fmt(n, decimals, prefix) {
      return (prefix || '') + n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    function initTicker() {
      var card = document.querySelector(CARD_SELECTOR);
      if (!card) return;

      // Quote rows — snapshot value, delta sign, format
      var rows = [].slice.call(card.querySelectorAll(QUOTE_ROW_SEL));
      var quoteState = rows.map(function (row) {
        var valueEl = row.querySelector(VALUE_SEL);
        var deltaEl = row.querySelector(DELTA_SEL);
        if (!valueEl || !deltaEl) return null;
        var raw = valueEl.textContent.trim();
        var num = parseNum(raw);
        if (num == null || num === 0) return null;
        return {
          valueEl: valueEl,
          deltaEl: deltaEl,
          baseline: num,
          current: num,
          decimals: decimalsOf(raw),
          prefix: raw.charAt(0) === '$' ? '$' : ''
        };
      }).filter(Boolean);

      // Execution quality
      var qualityEl = card.querySelector(QUALITY_SEL);
      var qualityCurrent = qualityEl ? parseNum(qualityEl.textContent) : null;

      // Consistent trades headline
      var headlineEl = card.querySelector(HEADLINE_SEL);
      var headlineRaw = headlineEl ? headlineEl.textContent.trim() : '';
      var headlineCurrent = headlineEl ? parseNum(headlineRaw) : null;
      var headlineHasM = /M\s*$/i.test(headlineRaw);
      var headlinePrefix = headlineRaw.charAt(0) === '+' ? '+' : '';

      if (!quoteState.length && qualityCurrent == null && headlineCurrent == null) return;

      setInterval(function () {
        quoteState.forEach(function (s) {
          var change = (Math.random() - 0.5) * 2 * VOLATILITY_PCT * s.baseline;
          s.current = Math.max(0.0001, s.current + change);
          var delta = ((s.current - s.baseline) / s.baseline) * 100;
          s.valueEl.textContent = fmt(s.current, s.decimals, s.prefix);
          s.deltaEl.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%';
          if (delta >= 0) s.deltaEl.classList.add(DELTA_POS_CLASS);
          else            s.deltaEl.classList.remove(DELTA_POS_CLASS);
        });
        if (qualityEl && qualityCurrent != null) {
          qualityCurrent += (Math.random() - 0.5) * 0.25;
          qualityCurrent = Math.max(95, Math.min(99.6, qualityCurrent));
          qualityEl.textContent = qualityCurrent.toFixed(1);
        }
      }, TICK_MS_QUOTES);

      if (headlineEl && headlineCurrent != null) {
        setInterval(function () {
          headlineCurrent += Math.random() * 6 + 1;
          headlineEl.textContent = headlinePrefix
            + Math.round(headlineCurrent).toLocaleString('en-US')
            + (headlineHasM ? ' M' : '');
        }, TICK_MS_TRADES);
      }
    }

    // Values are populated by RBCCMBind.load() which is async. Poll for
    // the card content to be non-empty (up to ~1.5s) before capturing
    // baselines so we snapshot the JSON-rendered numbers, not the
    // interstitial fallback ones.
    var tries = 0;
    var poll = setInterval(function () {
      tries += 1;
      var v = document.querySelector(VALUE_SEL);
      if ((v && v.textContent.trim()) || tries > 15) {
        clearInterval(poll);
        initTicker();
      }
    }, 100);
  })();


/* JSON bind bootstrap. Guarded by RBCCMBind presence AND by the
   ?preview=draft URL flag. Default (no preview flag) = do nothing;
   XSL-baked Datums render as-is. Only when an editor visits with
   ?preview=draft do we fetch the JSON file and rebind live text.
   That JSON lives at /assets/rbccm/js/pages/data/maas-mata.json
   (editor uploads their exported CMS draft to that path). */
(function () {
  if (typeof window.RBCCMBind !== 'object' || typeof RBCCMBind.load !== 'function') return;
  var isPreview = /[?&]preview=draft(?:&|$)/.test(window.location.search);
  if (!isPreview) return;
  RBCCMBind.load({
    url: '/assets/rbccm/js/pages/data/maas-mata.json',
    fallbackSelector: '#fallback-data',
    root: document.getElementById('rbccm-mm-page'),
    /* Runs after the bind pass finishes (sync or async fetch). Handles
       touch-ups that data-json attributes can't express directly. */
    onRendered: function (/* data, root */) {
      /* Platform card theme swap. Bind writes data-theme="light|dark"
         from JSON via data-json-attr-data-theme; here we translate that
         to the BEM modifier class so all existing CSS rules apply. */
      var cards = document.querySelectorAll('.rbccm-maas-mata__platform-card[data-theme]');
      for (var i = 0; i < cards.length; i++) {
        var theme = (cards[i].getAttribute('data-theme') || '').toLowerCase();
        if (theme !== 'light' && theme !== 'dark') continue;
        cards[i].classList.remove('rbccm-maas-mata__platform-card--light');
        cards[i].classList.remove('rbccm-maas-mata__platform-card--dark');
        cards[i].classList.add('rbccm-maas-mata__platform-card--' + theme);
      }
    }
  });
})();
