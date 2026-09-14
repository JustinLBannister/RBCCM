/* =========================================================================
   RBCCM Featured Insights -- runtime
   Deploy path: /assets/rbccm/js/components/rbccm-featured-insights.js

   This file ships two independent concerns:

     1. Pinned-URL feed hydrator (top IIFE below). Section-level
        dispatch keyed on data-tile-source. In manual mode (and in
        dcr-picker mode without any pinned tile URL) it short-circuits.
        Otherwise it fetches the comma-separated data-tile-feed-urls,
        parses XML, and for each tile with a non-blank data-tile-
        pinned-url replaces title / description / date and rewrites
        the tile <a href>. Mirrors the hero pattern in rbccm-hero.js.

     2. Slick carousel init (jQuery block below). Below 992px the
        .rbccm-insight-tiles__row collapses from a 3-column CSS grid
        into a Slick carousel:
          - <600px:      1 tile per view
          - 600-991px:   2 tiles per view
          - >=992px:     Slick is destroyed and the CSS grid takes over
                         (featured tile spans the full first row)
        Requires jQuery. Slick is lazy-loaded from CDN on first mobile
        init so desktop-only visits pay no JS cost.
        Pattern lifted from rbccm-expertise.js so the two S&E carousels
        share identical dots/arrows/keyboard behavior. Safe on multi-
        instance pages: each section binds independently.
   ========================================================================= */


/* -------------------------------------------------------------------------
   1. Pinned-URL feed hydrator
   -------------------------------------------------------------------------
   Runs on every .rbccm-featured-insights section whose data-tile-source
   is either "pinned-url" or "dcr-picker" AND has at least one tile
   with a non-blank data-tile-pinned-url attribute. Manual mode is a
   no-op; the server-rendered content is authoritative.

   Feed record shape confirmed against
   https://www.rbccm.com/en/insights/data/2026-insights:
     <news>
       <date>September 3, 2026</date>       already human-readable
       <link>/en/insights/2026/09/...</link> relative path
       <title>...</title>
       <description>...</description>
     </news>

   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent -
   safe to re-run without double-hydrating (guarded by an is-hydrated
   class on each hydrated tile + a data-tile-bound flag on the section).
   ------------------------------------------------------------------------- */
(function () {
  var SECTION_SEL = '.rbccm-featured-insights[data-tile-source="pinned-url"], .rbccm-featured-insights[data-tile-source="dcr-picker"]';
  var TILE_SEL    = '.rbccm-insight-tiles__item';
  var ANCHOR_SEL  = '.rbccm-insight-tiles__insight';
  var HYDRATED    = 'is-hydrated';

  /* Decode HTML entities (&amp;, &#8217;, etc.) the feed ships inside
     text fields. The textarea trick converts entity strings back to
     their real characters. */
  var _decodeEl = (typeof document !== 'undefined') ? document.createElement('textarea') : null;
  function decodeEntities(s) {
    if (!s || !_decodeEl) return s || '';
    _decodeEl.innerHTML = s;
    return _decodeEl.value;
  }

  function childText(node, tag) {
    if (!node) return '';
    var el = node.getElementsByTagName(tag)[0];
    return el ? (el.textContent || '').trim() : '';
  }

  /* Reduce a URL (full or path) to its final non-empty slug so we
     can compare "https://www.rbccm.com/en/insights/2026/09/foo" and
     "/en/insights/2026/09/foo" as the same article. Strips query
     strings and hashes. Empty input returns ''. */
  function extractSlug(url) {
    if (!url) return '';
    var clean = String(url).split('?')[0].split('#')[0];
    var parts = clean.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : '';
  }

  function fetchFeed(url) {
    return fetch(url)
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (xml) {
        if (!xml) return null;
        try { return new DOMParser().parseFromString(xml, 'text/xml'); }
        catch (e) { return null; }
      })
      .catch(function () { return null; });
  }

  /* Walk every feed doc looking for a <news> record whose <link>
     slug matches pinnedUrl. First hit wins; returns null when
     nothing matches so the caller can fall through to the pre-
     rendered fallback. */
  function pickPinned(docs, pinnedUrl) {
    var target = extractSlug(pinnedUrl);
    if (!target) return null;
    for (var d = 0; d < docs.length; d++) {
      var doc = docs[d];
      if (!doc) continue;
      var items = doc.getElementsByTagName('news');
      for (var i = 0; i < items.length; i++) {
        if (extractSlug(childText(items[i], 'link')) === target) return items[i];
      }
    }
    return null;
  }

  function hydrateTile(tile, rec) {
    if (!tile || !rec) return;
    if (tile.classList.contains(HYDRATED)) return;

    var title = decodeEntities(childText(rec, 'title'));
    var desc  = decodeEntities(childText(rec, 'description'));
    var date  = childText(rec, 'date');    // already pretty-formatted
    var link  = childText(rec, 'link') || '';

    var titleEl = tile.querySelector('[data-hydrate-title]');
    var descEl  = tile.querySelector('[data-hydrate-desc]');
    var dateEl  = tile.querySelector('[data-hydrate-date]');
    var anchor  = tile.querySelector(ANCHOR_SEL);

    if (titleEl && title) titleEl.textContent = title;
    if (descEl  && desc)  descEl.textContent  = desc;
    if (dateEl  && date)  dateEl.textContent  = date;
    if (anchor  && link)  anchor.setAttribute('href', link);

    tile.classList.add(HYDRATED);
  }

  function hydrateSection(section) {
    if (section.getAttribute('data-tile-bound') === 'true') return;
    section.setAttribute('data-tile-bound', 'true');

    var mode  = section.getAttribute('data-tile-source') || '';

    /* Manual mode never reaches this IIFE (SECTION_SEL excludes it)
       but re-guard defensively in case attrs get flipped later. */
    if (mode === 'manual') return;

    /* Collect tiles that opted into hydration. dcr-picker mode is
       server-authoritative for tiles without a pinned URL; we only
       run the fetch when at least one tile needs a pinned lookup.
       In pinned-url mode the same rule applies - tiles without a
       pinned URL keep their manual pre-rendered content. */
    var tiles = section.querySelectorAll(TILE_SEL + '[data-tile-pinned-url]');
    var targets = [];
    for (var i = 0; i < tiles.length; i++) {
      var pinned = (tiles[i].getAttribute('data-tile-pinned-url') || '').trim();
      if (pinned) targets.push({ tile: tiles[i], pinned: pinned });
    }
    if (!targets.length) return;

    var feedAttr = section.getAttribute('data-tile-feed-urls') || '';
    var feeds = feedAttr.split(',').map(function (u) { return u.trim(); }).filter(Boolean);
    if (!feeds.length) return;

    /* Plain sequential walk through the feed list - fetch each URL
       in order, no retries. pickPinned takes the first matching
       record across all feeds. */
    Promise.all(feeds.map(fetchFeed)).then(function (docs) {
      targets.forEach(function (t) {
        var rec = pickPinned(docs, t.pinned);
        if (rec) hydrateTile(t.tile, rec);
      });
    });
  }

  function initHydrator() {
    var sections = document.querySelectorAll(SECTION_SEL);
    for (var i = 0; i < sections.length; i++) hydrateSection(sections[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHydrator);
  } else {
    initHydrator();
  }
})();


/* -------------------------------------------------------------------------
   2. Slick carousel init (mobile only)
   ------------------------------------------------------------------------- */
jQuery(document).ready(function ($) {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESKTOP_BREAKPOINT = 992;

  /* Universal Slick loader -- same shape as rbccm-expertise.js.
     Injects the RBCCM-hosted accessible-slick fork (same file site
     chrome uses site-wide) rather than vanilla Slick, so keyboard +
     screen-reader users get parity with the rest of the RBCCM UI.
     Resolution paths: (1) $.fn.slick already defined -> fire; (2)
     shared window promise -> wait; (3) existing <script> tag mid-
     load -> poll with 10s safety net; (4) nothing -> inject the
     RBCCM URL once. */
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
          /* Two-tier inject -- see rbccm-expertise.js for the full
             comment. Prefer RBCCM's accessible-slick fork; on error
             (CORS on file://, 404, network) fall back to public
             cdnjs Slick so local previews still render. */
          var s = document.createElement('script');
          s.src = 'https://www.rbccm.com/assets/rbccm/js/accessible-slick.min.js';
          s.onload = function () { resolve(); };
          s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
            s2.integrity = 'sha512-HGOnQO9+SP1V92SrtZfjqxxtLmVzqZpjFFekvzZVWoiASSQgSr4cw9Kqd2+l8Llp4Gm0G8GIFJ4ddwZilcdb8A==';
            s2.crossOrigin = 'anonymous';
            s2.referrerPolicy = 'no-referrer';
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
    var $row      = $section.find('.rbccm-insight-tiles__row');
    var $items    = $row.children('.rbccm-insight-tiles__item');
    var $dots     = $section.find('.rbccm-featured-insights__dots');
    var $announce = $section.find('.rbccm-featured-insights__sr-only');

    // Single-tile fallback: hide controls, do nothing.
    $section.toggleClass('rbccm-featured-insights--single', $items.length <= 1);
    if ($items.length <= 1) return;

    /* Prevent re-fade on Slick re-init at resize.
       ----------------------------------------------------------------
       Slick's destroy + init toggles display: none/block on the tile
       items as it wraps/unwraps them in <div class="slick-slide">.
       Chrome + Safari treat that display change as a fresh render
       context and re-trigger any CSS animations on the element -- so
       animate__fadeInUp keeps replaying on every resize past the 992
       breakpoint. Once the initial stagger has played, strip the
       animate.css classes off each tile and drop data-stagger-parent
       from the row so nothing is left to re-trigger. Delay is stagger
       step * items + a 1.5s cushion for the fade-in duration. */
    var stripTime = (parseInt($row.attr('data-stagger-step') || '100', 10) * $items.length) + 1500;
    window.setTimeout(function () {
      $items.each(function () {
        this.style.opacity = 1;
        this.classList.remove('animate__animated', 'animate__fadeInUp');
      });
      $row.removeAttr('data-stagger-parent');
    }, stripTime);

    function updateAnnounce(currentSlide) {
      if (!$announce.length) return;
      $announce.text('Item ' + (currentSlide + 1) + ' of ' + $items.length);
    }
    function syncDots() {
      var $buttons = $dots.find('li button');
      if (!$buttons.length) return;
      $dots.attr({ 'role': 'group', 'aria-label': 'Choose an insight' });
      $buttons.each(function (idx) {
        $(this).attr('tabindex', '0').attr('aria-label', 'Go to slide ' + (idx + 1));
      });
    }

    function initSlider() {
      if ($row.hasClass('slick-initialized')) return;

      $row.off('.rbccmFeaturedInsights');
      $row.on('init.rbccmFeaturedInsights afterChange.rbccmFeaturedInsights', function (event, slick, currentSlide) {
        var active = typeof currentSlide === 'number' ? currentSlide : slick.currentSlide;
        updateAnnounce(active);
        syncDots();
      });
      $row.on('destroy.rbccmFeaturedInsights', function () {
        $dots.empty();
        $announce.empty();
      });

      $row.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        mobileFirst: true,
        responsive: [
          {
            /* 600-991: 2-per-view slider. */
            breakpoint: 600,
            settings: { slidesToShow: 2, slidesToScroll: 2 }
          }
        ]
      });
      syncDots();

      $section.find('.rbccm-featured-insights__btn--prev').off('click.rbccmFeaturedInsights').on('click.rbccmFeaturedInsights', function () {
        if ($row.hasClass('slick-initialized')) $row.slick('slickPrev');
      });
      $section.find('.rbccm-featured-insights__btn--next').off('click.rbccmFeaturedInsights').on('click.rbccmFeaturedInsights', function () {
        if ($row.hasClass('slick-initialized')) $row.slick('slickNext');
      });

      /* Keyboard: Left/Right on the controls row scrub prev/next; when
         focus is on a dot button, Left/Right move focus dot-to-dot. */
      $section.find('.rbccm-featured-insights__controls').off('keydown.rbccmFeaturedInsights').on('keydown.rbccmFeaturedInsights', function (e) {
        if (!$row.hasClass('slick-initialized')) return;
        var dir = 0;
        if (e.key === 'ArrowLeft'  || e.key === 'Left')  dir = -1;
        if (e.key === 'ArrowRight' || e.key === 'Right') dir =  1;
        if (!dir) return;
        var $target = $(e.target);
        var $dotBtn = $target.closest('.rbccm-featured-insights__dots button');
        e.preventDefault();
        if ($dotBtn.length) {
          var $btns = $dots.find('li button');
          var idx = $btns.index($dotBtn);
          if (idx === -1) return;
          var next = (idx + dir + $btns.length) % $btns.length;
          var $nextDot = $btns.eq(next);
          $nextDot.trigger('click');
          window.setTimeout(function () { $nextDot.get(0).focus({ preventScroll: true }); }, 0);
          return;
        }
        if (dir === -1) $row.slick('slickPrev');
        if (dir ===  1) $row.slick('slickNext');
      });
    }

    function destroySlider() {
      if (!$row.hasClass('slick-initialized')) return;
      $row.slick('unslick');
    }

    /* Width-gated init/destroy. Unlike rbccm-expertise (which keeps
       Slick alive and hides controls at desktop), this component has
       a featured tile that spans the full row in the desktop grid --
       Slick can't express that layout, so we cleanly unslick above
       992 and let CSS Grid take over. */
    function applyMode() {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        destroySlider();
      } else {
        loadSlick(initSlider);
      }
    }

    var resizeTimer = null;
    $(window).on('resize.rbccmFeaturedInsights orientationchange.rbccmFeaturedInsights', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(applyMode, 150);
    });

    applyMode();
  }

  $('.rbccm-featured-insights').each(function () { setupSection($(this)); });
});
