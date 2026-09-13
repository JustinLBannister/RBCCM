/* =========================================================================
   Tabbed Panels — shared runtime
   Deploy path: /assets/rbccm/js/components/tabbed-panels.js

   Behavior
   -------------------------------------------------------------------------
   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent — safe to
   re-run without double-binding. Multi-instance — one .rbccm-tabbed-panels
   per section, any number per page.

   For each instance:
     - Click any .__tab      → activate its matching .__panel
     - Focus a .__tab + arrow-key (Left/Right/Home/End) → move between tabs
     - Sync ARIA state (aria-expanded on tabs, is-active on tab + panel)
     - On mobile (accordion mode) any tab shows/hides its own panel; other
       panels stay collapsed. On desktop (>=992px) tabs act as tablist —
       exactly one panel visible at a time.

   Data contract (matches the CSS + XSL):
     .__tab       [data-panel="<slug>"]
     .__tab       [aria-expanded="true|false"]
     .__tab       [aria-controls="<panel-id>"]
     .__tab.is-active            (visual + JS active flag)
     .__panel     [id="<panel-id>"]
     .__panel     [data-panel="<slug>"]
     .__panel.is-active          (currently-shown; others display:none)
   ========================================================================= */

(function () {
  var BLOCK       = 'rbccm-tabbed-panels';
  var ROOT_SEL    = '.' + BLOCK;
  var TAB_SEL     = '.' + BLOCK + '__tab';
  var PANEL_SEL   = '.' + BLOCK + '__panel';
  var BOUND_ATTR  = 'data-tabbed-panels-bound';

  /* Activate the tab identified by its data-panel slug within a root.
     Sets ARIA + visual state on all tabs and panels in this root only
     (siblings of other roots on the same page are untouched). */
  function activate(root, slug) {
    var tabs   = root.querySelectorAll(TAB_SEL);
    var panels = root.querySelectorAll(PANEL_SEL);

    for (var i = 0; i < tabs.length; i++) {
      var active = tabs[i].getAttribute('data-panel') === slug;
      tabs[i].classList.toggle('is-active', active);
      tabs[i].setAttribute('aria-expanded', active ? 'true' : 'false');
    }
    for (var j = 0; j < panels.length; j++) {
      panels[j].classList.toggle(
        'is-active',
        panels[j].getAttribute('data-panel') === slug
      );
    }
  }

  /* Keyboard navigation between tabs. Left/Right wrap; Home/End jump
     to first/last. Focused tab is also activated (matches the WAI-ARIA
     Authoring Practices "automatic activation" tab pattern — a good fit
     here since panel switching is instant and non-destructive). */
  function bindKeyboard(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll(TAB_SEL));

    for (var i = 0; i < tabs.length; i++) {
      (function (tab, idx) {
        tab.addEventListener('keydown', function (e) {
          var next = -1;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            next = (idx + 1) % tabs.length;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            next = (idx - 1 + tabs.length) % tabs.length;
          } else if (e.key === 'Home') {
            next = 0;
          } else if (e.key === 'End') {
            next = tabs.length - 1;
          }
          if (next === -1) return;
          e.preventDefault();
          var slug = tabs[next].getAttribute('data-panel');
          activate(root, slug);
          tabs[next].focus();
        });
      })(tabs[i], i);
    }
  }

  function bindInstance(root) {
    if (root.getAttribute(BOUND_ATTR) === 'true') return;
    root.setAttribute(BOUND_ATTR, 'true');

    /* Click handler — event-delegated at the root so tabs added later
       (rare, but safe) also work. */
    root.addEventListener('click', function (e) {
      var tab = e.target && e.target.closest && e.target.closest(TAB_SEL);
      if (!tab || !root.contains(tab)) return;
      var slug = tab.getAttribute('data-panel');
      if (!slug) return;
      activate(root, slug);
    });

    bindKeyboard(root);

    /* Guarantee exactly one active tab + panel on init. If the server-
       rendered markup already has an is-active pair, respect it;
       otherwise activate the first tab. */
    var initialActive = root.querySelector(TAB_SEL + '.is-active');
    if (initialActive) {
      activate(root, initialActive.getAttribute('data-panel'));
    } else {
      var firstTab = root.querySelector(TAB_SEL);
      if (firstTab) activate(root, firstTab.getAttribute('data-panel'));
    }
  }

  function init() {
    var roots = document.querySelectorAll(ROOT_SEL);
    for (var i = 0; i < roots.length; i++) bindInstance(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* =========================================================================
   HOW WE THINK preset - Insights tile hydration
   -------------------------------------------------------------------------
   Runs on every `[data-preset="how-we-think"]` root. Fetches the 2024 /
   2025 / 2026 insights year feeds, builds a slug -> record lookup, and
   hydrates each `.rbccm-tabbed-panels__tile[data-hwt-url]` inside a
   how-we-think root by matching the tile's data-hwt-url slug against
   feed <news> records. Tiles that don't match a record are removed
   entirely so the panel doesn't render placeholder shells.

   Newsroom and Conferences panels are server-rendered by the XSL and
   need no client behavior here.

   Ported from how-we-think-feeds.js loadInsights(); class references
   updated from `rbccm-how-we-think__*` to `rbccm-tabbed-panels__*`.
   Behavior otherwise unchanged, including the [data-hwt-url]:not
   (.is-hydrated) CSS guard that hides pre-hydration shells so the
   empty placeholder never flashes on load.
   ========================================================================= */
(function () {
  var INSIGHTS_FEEDS = [
    '/en/insights/data/2024-insights',
    '/en/insights/data/2025-insights',
    '/en/insights/data/2026-insights'
  ];

  var _decodeEl = document.createElement('textarea');
  function decodeEntities(s) { _decodeEl.innerHTML = s || ''; return _decodeEl.value; }
  function escapeAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function childText(node, tag) {
    if (!node) return '';
    var el = node.getElementsByTagName(tag)[0];
    return el ? (el.textContent || '').trim() : '';
  }

  /* Feed identifier is the last non-empty URL path segment. Handles
     /en/insights/story/<slug>, /en/insights/<slug>, and ?query links. */
  function extractSlug(url) {
    if (!url) return null;
    var clean = String(url).split('?')[0].split('#')[0];
    var parts = clean.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
  }

  function buildInsightLookup(xmlDocs) {
    var map = {};
    xmlDocs.forEach(function (doc) {
      if (!doc) return;
      var items = doc.getElementsByTagName('news');
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var link = childText(it, 'link');
        var slug = extractSlug(link);
        if (!slug || map[slug]) continue;
        map[slug] = {
          link:        link,
          title:       decodeEntities(childText(it, 'title')),
          description: decodeEntities(childText(it, 'description')),
          thumbnail:   childText(it, 'thumbnail'),
          category:    childText(it, 'category') || 'Insights',
          type:        childText(it, 'type'),
          readtime:    childText(it, 'readtime'),
          watchtime:   childText(it, 'watchtime')
        };
      }
    });
    return map;
  }

  function insightCtaText(rec, override) {
    if (override) return override;
    var t = (rec.type || '').toLowerCase();
    if (t === 'audio')  return (rec.watchtime || '') + (rec.watchtime ? ' listen' : '');
    if (t === 'video')  return (rec.watchtime || '') + (rec.watchtime ? ' watch'  : '');
    return (rec.readtime || '') + (rec.readtime ? ' read' : '');
  }

  function hydrateInsightTile(tile, rec) {
    var eyebrowOverride  = tile.getAttribute('data-hwt-eyebrow')  || '';
    var readtimeOverride = tile.getAttribute('data-hwt-readtime') || '';
    var eyebrow = (eyebrowOverride || rec.category || 'INSIGHTS').toUpperCase();
    var cta     = insightCtaText(rec, readtimeOverride).trim();

    tile.setAttribute('href', rec.link || '#');
    tile.innerHTML =
      '<div class="rbccm-tabbed-panels__tile-img">' +
        (rec.thumbnail ? '<img loading="lazy" src="' + escapeAttr(rec.thumbnail) + '" alt="" />' : '') +
      '</div>' +
      '<div class="rbccm-tabbed-panels__tile-body">' +
        '<p class="rbccm-tabbed-panels__tile-eyebrow">' + escapeAttr(eyebrow) + '</p>' +
        '<div class="rbccm-tabbed-panels__tile-divider" aria-hidden="true"></div>' +
        '<h3 class="rbccm-tabbed-panels__tile-title">' + escapeAttr(rec.title) + '</h3>' +
        '<p class="rbccm-tabbed-panels__tile-copy">' + escapeAttr(rec.description) + '</p>' +
        (cta ? '<span class="rbccm-tabbed-panels__tile-cta">' + escapeAttr(cta) + '</span>' : '') +
      '</div>';
    /* Reveal the tile — CSS keeps [data-hwt-url]:not(.is-hydrated)
       hidden so the placeholder shell never flashes on load. */
    tile.classList.add('is-hydrated');
  }

  function loadInsightsFor(root) {
    var tiles = root.querySelectorAll('.rbccm-tabbed-panels__tile[data-hwt-url]');
    if (!tiles.length) return;
    Promise.all(INSIGHTS_FEEDS.map(function (url) {
      return fetch(url)
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (xml) {
          if (!xml) return null;
          try { return new DOMParser().parseFromString(xml, 'text/xml'); }
          catch (e) { return null; }
        })
        .catch(function () { return null; });
    })).then(function (docs) {
      var lookup = buildInsightLookup(docs);
      Array.prototype.forEach.call(tiles, function (tile) {
        var slug = extractSlug(tile.getAttribute('data-hwt-url'));
        var rec  = slug && lookup[slug];
        if (rec) hydrateInsightTile(tile, rec);
        else if (tile.parentNode) tile.parentNode.removeChild(tile);
      });
    });
  }

  function initHwt() {
    var roots = document.querySelectorAll('.rbccm-tabbed-panels[data-preset="how-we-think"]');
    for (var i = 0; i < roots.length; i++) loadInsightsFor(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHwt);
  } else {
    initHwt();
  }
})();


/* =========================================================================
   CONFERENCE INSIGHTS preset - nested tab controller + carousels + video
   -------------------------------------------------------------------------
   Runs on every `[data-preset="conference-insights"]` root. Wires:

     1) Inner-tab controller: when an outer conference tab activates (by
        the shell IIFE's click handler), auto-open that conference's
        `<slug>-overview` inner tab. Inner tabs run as accordion on
        mobile (multiple open OK) and single-active on desktop. A custom
        `rbccm-tp:panel-change` event bubbles from the root whenever any
        panel changes so the carousels can re-measure after reveal.
     2) Speakers carousel: 226px-step transform-based infinite loop with
        n-clone teleport, arrows + dots, keyboard nav. `.has-overflow`
        toggled based on measured width vs. slider clientWidth.
     3) Insights carousel: same pattern (378px step). CSS forces the
        insights track into a 3-col grid on desktop and hides the
        controls at every breakpoint under this preset (matches the
        deprecation-in-design of the source featured-conferences).
     4) Video facade: click swaps the `<button>` for a Brightcove
        `<iframe>` sourced from data-bc-src (with autoplay=1).

   The shell IIFE at the top of this file already handles outer conf-tab
   click / activation - we do NOT re-implement that. This IIFE only adds
   the extra inner-tab behaviour on top plus the carousels/facade.
   ========================================================================= */
(function () {
  var BLOCK = 'rbccm-tabbed-panels';
  var ROOT_SEL      = '.' + BLOCK + '[data-preset="conference-insights"]';
  var OUTER_TAB_SEL = '.' + BLOCK + '__tab';
  var OUTER_PNL_SEL = '.' + BLOCK + '__panel';
  var INNER_TAB_SEL = '.' + BLOCK + '__inner-tab';
  var INNER_PNL_SEL = '.' + BLOCK + '__inner-panel';

  function isDesktop() {
    return window.matchMedia('(min-width: 992px)').matches;
  }

  /* Broadcast a bubbling "panel-change" event so carousels can remeasure
     after a previously-hidden panel becomes visible (their slider
     clientWidth was 0 during the hidden phase). */
  function notifyPanelChange(root) {
    try {
      root.dispatchEvent(new CustomEvent('rbccm-tp:panel-change', { bubbles: true }));
    } catch (e) { /* old browsers - non-critical */ }
  }

  function setExclusiveInner(root, innerKey) {
    var innerTabs   = root.querySelectorAll(INNER_TAB_SEL);
    var innerPanels = root.querySelectorAll(INNER_PNL_SEL);
    for (var i = 0; i < innerTabs.length; i++) {
      var on = innerTabs[i].getAttribute('data-inner') === innerKey;
      innerTabs[i].classList.toggle('is-active', on);
      innerTabs[i].setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    for (var j = 0; j < innerPanels.length; j++) {
      var match = innerPanels[j].getAttribute('data-inner') === innerKey;
      innerPanels[j].classList.toggle('is-active', match);
    }
    notifyPanelChange(root);
  }

  function toggleInner(root, innerKey) {
    var innerTabs   = root.querySelectorAll(INNER_TAB_SEL);
    var innerPanels = root.querySelectorAll(INNER_PNL_SEL);
    for (var i = 0; i < innerTabs.length; i++) {
      if (innerTabs[i].getAttribute('data-inner') === innerKey) {
        var open = innerTabs[i].classList.toggle('is-active');
        innerTabs[i].setAttribute('aria-expanded', open ? 'true' : 'false');
        for (var j = 0; j < innerPanels.length; j++) {
          if (innerPanels[j].getAttribute('data-inner') === innerKey) {
            innerPanels[j].classList.toggle('is-active', open);
          }
        }
        break;
      }
    }
    notifyPanelChange(root);
  }

  /* Bind delegated click handling to a preset root:
       - outer tab click → also reset inner state to `<slug>-overview`
         (the shell IIFE handles the outer .is-active toggle first)
       - inner tab click → exclusive on desktop, accordion on mobile */
  function bindInnerBehavior(root) {
    if (root.getAttribute('data-ci-inner-bound') === 'true') return;
    root.setAttribute('data-ci-inner-bound', 'true');

    root.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      /* Inner-tab click - preset-specific. */
      var innerTab = target.closest(INNER_TAB_SEL);
      if (innerTab && root.contains(innerTab)) {
        e.preventDefault();
        var innerKey = innerTab.getAttribute('data-inner');
        if (innerKey) {
          if (isDesktop()) setExclusiveInner(root, innerKey);
          else             toggleInner(root, innerKey);
        }
        return;
      }

      /* Outer conf-tab click. Shell IIFE has already flipped .is-active
         on tabs + panels; we set that conf's default inner (-overview)
         so the panel that just became visible shows Overview first. */
      var outerTab = target.closest(OUTER_TAB_SEL);
      if (outerTab && root.contains(outerTab)) {
        var slug = outerTab.getAttribute('data-panel');
        if (slug) {
          setExclusiveInner(root, slug + '-overview');
        }
      }
    });

    /* Viewport change: re-sync so the currently-visible conference lands
       back on Overview at the new breakpoint. Same 150ms debounce as
       the carousel resize handlers. */
    var lastDesktop = isDesktop();
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var nowDesktop = isDesktop();
        if (nowDesktop === lastDesktop) return;
        lastDesktop = nowDesktop;

        var outerTabs = root.querySelectorAll(OUTER_TAB_SEL);
        var activeKey = null;
        for (var i = 0; i < outerTabs.length; i++) {
          if (outerTabs[i].classList.contains('is-active')) {
            activeKey = outerTabs[i].getAttribute('data-panel');
            break;
          }
        }
        if (!activeKey && outerTabs.length) {
          activeKey = outerTabs[0].getAttribute('data-panel');
        }
        if (activeKey) setExclusiveInner(root, activeKey + '-overview');
      }, 150);
    });

    /* Initial state: whatever outer tab is server-marked is-active, open
       its Overview inner tab. XSL emits conf-1 active + conf-1-overview
       active, so this is normally a no-op but guarantees consistency. */
    var initialOuter = root.querySelector(OUTER_TAB_SEL + '.is-active') ||
                       root.querySelector(OUTER_TAB_SEL);
    if (initialOuter) {
      var initSlug = initialOuter.getAttribute('data-panel');
      if (initSlug) setExclusiveInner(root, initSlug + '-overview');
    }
  }

  /* ---- Speakers carousel ----
     transform-based infinite loop with n-clone teleport. Layout is a
     flex row of 194px speakers with 32px gaps; each nav step is 226px.
     Clones the FULL set at each end so the peek content matches
     before/after teleport (no visible flash on wrap). */
  var SPK_CARD = 194;
  var SPK_GAP  = 32;
  var SPK_STEP = SPK_CARD + SPK_GAP; // 226

  function initSpeakersSlider(root, slider) {
    if (slider.getAttribute('data-ci-spk-bound') === 'true') return;
    slider.setAttribute('data-ci-spk-bound', 'true');

    var track    = slider.querySelector('.rbccm-tabbed-panels__speakers');
    var dotsWrap = slider.querySelector('.rbccm-tabbed-panels__speakers-dots');
    var btns     = slider.querySelectorAll('.rbccm-tabbed-panels__speakers-btn');
    var prevBtn  = btns[0];
    var nextBtn  = btns[1];
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    var reals = Array.prototype.slice.call(
      track.querySelectorAll('.rbccm-tabbed-panels__speaker')
    );
    var n = reals.length;
    if (!n) return;

    function speakerInfo(el) {
      var nameEl  = el.querySelector('.rbccm-tabbed-panels__speaker-name');
      var titleEl = el.querySelector('.rbccm-tabbed-panels__speaker-title');
      return {
        name:  nameEl  ? nameEl.textContent.trim()  : '',
        title: titleEl ? titleEl.textContent.trim() : ''
      };
    }
    var info = reals.map(speakerInfo);

    /* Insert full-set clones on each end for peek-matching wrap. */
    function buildClones(tag) {
      var frag = document.createDocumentFragment();
      reals.forEach(function (real) {
        var clone = real.cloneNode(true);
        clone.setAttribute('data-clone', tag);
        clone.setAttribute('aria-hidden', 'true');
        frag.appendChild(clone);
      });
      return frag;
    }
    track.insertBefore(buildClones('prev'), reals[0]);
    track.appendChild(buildClones('next'));

    var currentIndex = 0;
    var displayedPos = n;

    function setIfEmpty(el, attr, value) {
      if (el && !el.getAttribute(attr)) el.setAttribute(attr, value);
    }

    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    setIfEmpty(slider, 'aria-label', 'Featured speakers');
    track.setAttribute('aria-live', 'polite');
    track.setAttribute('aria-atomic', 'false');

    reals.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      var label = (i + 1) + ' of ' + n;
      if (info[i].name)  label += ': ' + info[i].name;
      if (info[i].title) label += ', ' + info[i].title;
      s.setAttribute('aria-label', label);
    });

    setIfEmpty(prevBtn,  'aria-label', 'Previous speaker');
    setIfEmpty(nextBtn,  'aria-label', 'Next speaker');
    setIfEmpty(dotsWrap, 'aria-label', 'Choose a speaker');

    reals.forEach(function (s, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rbccm-tabbed-panels__speakers-dot';
      var label = 'Go to speaker ' + (i + 1) + ' of ' + n;
      if (info[i].name)  label += ': ' + info[i].name;
      if (info[i].title) label += ', ' + info[i].title;
      dot.setAttribute('aria-label', label);
      dot.setAttribute('data-index', String(i));
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(
      dotsWrap.querySelectorAll('.rbccm-tabbed-panels__speakers-dot')
    );

    function setTransformAtPos(domPos, animate) {
      displayedPos = domPos;
      var x = -domPos * SPK_STEP;
      if (!animate) {
        track.style.transition = 'none';
        track.style.transform  = 'translateX(' + x + 'px)';
        /* Force a sync reflow so transition:none takes effect before
           we restore the default. */
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth;
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(' + x + 'px)';
      }
    }
    function setActive(i) {
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === i);
        d.setAttribute('aria-current', idx === i ? 'true' : 'false');
      });
    }
    function go(targetReal) {
      if (targetReal === -1) {
        setTransformAtPos(n - 1, true);
        currentIndex = n - 1;
      } else if (targetReal === n) {
        setTransformAtPos(2 * n, true);
        currentIndex = 0;
      } else {
        setTransformAtPos(n + targetReal, true);
        currentIndex = targetReal;
      }
      setActive(currentIndex);
    }

    /* On transitionend, if we landed on a clone teleport silently to
       the matching real speaker at the opposite end. Peek matches
       because we cloned the full n-set. */
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (displayedPos < n) {
        setTransformAtPos(displayedPos + n, false);
      } else if (displayedPos >= 2 * n) {
        setTransformAtPos(displayedPos - n, false);
      }
    });

    prevBtn.addEventListener('click', function () {
      if (currentIndex === 0) go(-1); else go(currentIndex - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentIndex === n - 1) go(n); else go(currentIndex + 1);
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(parseInt(d.getAttribute('data-index'), 10));
      });
    });
    dotsWrap.addEventListener('keydown', function (e) {
      var idx = dots.indexOf(document.activeElement);
      if (idx < 0) return;
      var target = null;
      switch (e.key) {
        case 'ArrowLeft':  target = idx === 0 ? -1 : idx - 1; break;
        case 'ArrowRight': target = idx === n - 1 ? n : idx + 1; break;
        case 'Home':       target = 0; break;
        case 'End':        target = n - 1; break;
        default: return;
      }
      e.preventDefault();
      go(target);
      var realFocus = (target === -1) ? (n - 1) : (target === n ? 0 : target);
      dots[realFocus].focus();
    });

    var rowWidth = n * SPK_CARD + (n - 1) * SPK_GAP;
    function updateOverflow() {
      var w = slider.clientWidth;
      if (w > 0 && rowWidth <= w) {
        slider.classList.remove('has-overflow');
      } else {
        slider.classList.add('has-overflow');
      }
    }
    function resetToFirst() {
      currentIndex = 0;
      setTransformAtPos(n, false);
      setActive(0);
      updateOverflow();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resetToFirst, 150);
    });

    requestAnimationFrame(resetToFirst);

    /* Re-check width whenever a panel toggles visibility (was 0-wide
       while hidden). Bubbling event so we can listen at the root. */
    root.addEventListener('rbccm-tp:panel-change', function () {
      requestAnimationFrame(updateOverflow);
    });
  }

  /* ---- Insights carousel ----
     Same clone-teleport pattern as speakers, 378px step. On desktop
     the layout switches to a 3-col grid (CSS forces transform:none
     and hides controls); the carousel still runs harmlessly since
     transform gets cleared. */
  var INS_CARD = 346;
  var INS_GAP  = 32;
  var INS_STEP = INS_CARD + INS_GAP; // 378

  function initInsightsSlider(root, slider) {
    if (slider.getAttribute('data-ci-ins-bound') === 'true') return;
    slider.setAttribute('data-ci-ins-bound', 'true');

    var track    = slider.querySelector('.rbccm-tabbed-panels__insights');
    var dotsWrap = slider.querySelector('.rbccm-tabbed-panels__insights-dots');
    var btns     = slider.querySelectorAll('.rbccm-tabbed-panels__insights-btn');
    var prevBtn  = btns[0];
    var nextBtn  = btns[1];
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    var cards = Array.prototype.slice.call(
      track.querySelectorAll('.rbccm-tabbed-panels__insight')
    );
    var n = cards.length;
    if (!n) return;

    /* Tag real cards: 1st = featured, rest = card. Both stripped from
       clones. Matches the source featured-conferences pattern (the
       --featured modifier is currently a no-op in CSS but preserved
       so it's trivial to re-enable). */
    cards[0].classList.add('rbccm-tabbed-panels__insight--featured');
    for (var i = 1; i < n; i++) {
      cards[i].classList.add('rbccm-tabbed-panels__insight--card');
    }

    function buildClones(tag) {
      var frag = document.createDocumentFragment();
      cards.forEach(function (real) {
        var clone = real.cloneNode(true);
        clone.setAttribute('data-clone', tag);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.remove('rbccm-tabbed-panels__insight--featured');
        clone.classList.remove('rbccm-tabbed-panels__insight--card');
        frag.appendChild(clone);
      });
      return frag;
    }
    track.insertBefore(buildClones('prev'), cards[0]);
    track.appendChild(buildClones('next'));

    var currentIndex = 0;
    var displayedPos = n;

    function setIfEmpty(el, attr, value) {
      if (el && !el.getAttribute(attr)) el.setAttribute(attr, value);
    }

    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    setIfEmpty(slider, 'aria-label', 'Conference insights');
    track.setAttribute('aria-live', 'polite');
    track.setAttribute('aria-atomic', 'false');

    function insightInfo(el) {
      var titleEl = el.querySelector('.rbccm-tabbed-panels__insight-title');
      var metaEl  = el.querySelector('.rbccm-tabbed-panels__insight-meta');
      return {
        title: titleEl ? titleEl.textContent.trim() : '',
        meta:  metaEl  ? metaEl.textContent.replace(/\s+/g, ' ').trim() : ''
      };
    }
    var info = cards.map(insightInfo);

    cards.forEach(function (c, i) {
      c.setAttribute('role', 'group');
      c.setAttribute('aria-roledescription', 'slide');
      var label = (i + 1) + ' of ' + n;
      if (info[i].title) label += ': ' + info[i].title;
      if (info[i].meta)  label += ', ' + info[i].meta;
      c.setAttribute('aria-label', label);
    });

    setIfEmpty(prevBtn,  'aria-label', 'Previous insight');
    setIfEmpty(nextBtn,  'aria-label', 'Next insight');
    setIfEmpty(dotsWrap, 'aria-label', 'Choose an insight');

    /* Rich CTA aria-label with this conference's name. CTA lives
       outside the slider but inside the same inner-panel. */
    var panel = slider.closest('.rbccm-tabbed-panels__inner-panel');
    var cta   = panel ? panel.querySelector('.rbccm-tabbed-panels__insights-cta') : null;
    if (cta) {
      var confKey  = slider.getAttribute('data-conf');
      var outerTab = confKey
        ? root.querySelector('.rbccm-tabbed-panels__tab[data-panel="' + confKey + '"]')
        : null;
      var confName = outerTab ? outerTab.textContent.trim() : '';
      setIfEmpty(cta, 'aria-label',
        'View all ' + (confName || 'conference') + ' insights');
    }

    cards.forEach(function (c, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rbccm-tabbed-panels__insights-dot';
      var label = 'Go to insight ' + (i + 1) + ' of ' + n;
      if (info[i].title) label += ': ' + info[i].title;
      if (info[i].meta)  label += ', ' + info[i].meta;
      dot.setAttribute('aria-label', label);
      dot.setAttribute('data-index', String(i));
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(
      dotsWrap.querySelectorAll('.rbccm-tabbed-panels__insights-dot')
    );

    var rowWidth = n * INS_CARD + (n - 1) * INS_GAP;

    function setTransformAtPos(domPos, animate) {
      displayedPos = domPos;
      var x = -domPos * INS_STEP;
      if (!animate) {
        track.style.transition = 'none';
        track.style.transform  = 'translateX(' + x + 'px)';
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth;
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(' + x + 'px)';
      }
    }
    function updateUi() {
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === currentIndex);
        d.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
      });
    }
    function go(targetReal) {
      if (targetReal === -1) {
        setTransformAtPos(n - 1, true);
        currentIndex = n - 1;
      } else if (targetReal === n) {
        setTransformAtPos(2 * n, true);
        currentIndex = 0;
      } else {
        setTransformAtPos(n + targetReal, true);
        currentIndex = targetReal;
      }
      updateUi();
    }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (displayedPos < n) {
        setTransformAtPos(displayedPos + n, false);
      } else if (displayedPos >= 2 * n) {
        setTransformAtPos(displayedPos - n, false);
      }
    });

    prevBtn.addEventListener('click', function () {
      if (currentIndex === 0) go(-1); else go(currentIndex - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentIndex === n - 1) go(n); else go(currentIndex + 1);
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(parseInt(d.getAttribute('data-index'), 10));
      });
    });
    dotsWrap.addEventListener('keydown', function (e) {
      var idx = dots.indexOf(document.activeElement);
      if (idx < 0) return;
      var target = null;
      switch (e.key) {
        case 'ArrowLeft':  target = idx === 0 ? -1 : idx - 1; break;
        case 'ArrowRight': target = idx === n - 1 ? n : idx + 1; break;
        case 'Home':       target = 0; break;
        case 'End':        target = n - 1; break;
        default: return;
      }
      e.preventDefault();
      go(target);
      var realFocus = (target === -1) ? (n - 1) : (target === n ? 0 : target);
      dots[realFocus].focus();
    });

    function updateOverflow() {
      var w = slider.clientWidth;
      if (w === 0) {
        slider.classList.add('has-overflow');
        return;
      }
      /* Desktop grid mode: no horizontal overflow because CSS flips
         the track to grid. Detect via viewport rather than reading
         computed display (cheaper). */
      var desktop = window.matchMedia('(min-width: 992px)').matches;
      if (desktop || rowWidth <= w) {
        slider.classList.remove('has-overflow');
      } else {
        slider.classList.add('has-overflow');
      }
    }
    function resetToFirst() {
      currentIndex = 0;
      setTransformAtPos(n, false);
      updateUi();
      updateOverflow();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resetToFirst, 150);
    });

    requestAnimationFrame(resetToFirst);
    root.addEventListener('rbccm-tp:panel-change', function () {
      requestAnimationFrame(updateOverflow);
    });
  }

  /* ---- Video facade ----
     Click swaps the poster+play button for a Brightcove iframe. The
     iframe URL is baked into the button's data-bc-src attribute at
     render time (autoplay=1). */
  function bindVideoFacades(root) {
    var facades = root.querySelectorAll('.rbccm-tabbed-panels__video-facade');
    Array.prototype.forEach.call(facades, function (facade) {
      if (facade.getAttribute('data-ci-facade-bound') === 'true') return;
      facade.setAttribute('data-ci-facade-bound', 'true');
      facade.addEventListener('click', function (e) {
        e.preventDefault();
        var src = facade.getAttribute('data-bc-src');
        if (!src) return;
        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', src);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
        iframe.setAttribute('allowfullscreen', 'allowfullscreen');
        if (facade.parentNode) {
          facade.parentNode.replaceChild(iframe, facade);
        }
      });
    });
  }

  function initCi() {
    var roots = document.querySelectorAll(ROOT_SEL);
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      bindInnerBehavior(root);
      bindVideoFacades(root);

      var spkSliders = root.querySelectorAll('.rbccm-tabbed-panels__speakers-slider');
      for (var s = 0; s < spkSliders.length; s++) initSpeakersSlider(root, spkSliders[s]);

      var insSliders = root.querySelectorAll('.rbccm-tabbed-panels__insights-slider');
      for (var t = 0; t < insSliders.length; t++) initInsightsSlider(root, insSliders[t]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCi);
  } else {
    initCi();
  }
})();
