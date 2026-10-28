/*! RBCCM us-credentials.js | v1 | built 2026-10-28T14:40:48.275Z
 *  rbccm-hero, rbccm-awards, rbccm-capability-cards, rbccm-two-up-cards, rbccm-animate */

/* ==== rbccm-hero/rbccm-hero.js ==== */
/* =========================================================================
   RBCCM Hero - Strategy & Economics insight card hydrator
   Deploy path: /assets/rbccm/js/components/rbccm-hero.js

   Behavior
   -------------------------------------------------------------------------
   Runs on every .rbccm-hero--strategy-and-economics section whose
   data-hero-source is either "auto-latest" or "dcr-picker".

   The dispatch splits on data-hero-source per section:

     auto-latest   Full flow. Pinned URL match if data-hero-pinned-url
                   is set; otherwise newest record surviving the
                   data-hero-tag-keywords filter.

     dcr-picker    Fallback flow. Runs only when data-hero-pinned-url
                   is non-empty. Pinned-URL match ONLY - no keyword
                   scan. If the URL match hits, the feed record
                   overwrites the DCR-rendered card; if it misses,
                   the server-rendered DCR content stays in place.
                   Purpose: safety net for pages where the TeamSite
                   DCR pipeline is broken, so editors can point at
                   an insights-feed article by URL and still ship.

     1. Read config from data-* attrs authored by the XSL:
          data-hero-feed-urls      comma-separated XML feed URLs.
                                   Emitted in both auto-latest and
                                   dcr-picker modes.
          data-hero-pinned-url     optional specific article URL to
                                   pin; accepts a full https URL or
                                   the /en/ path. In auto-latest it
                                   OVERRIDES the keyword search. In
                                   dcr-picker it is the ONLY lookup
                                   the hydrator performs. Emitted
                                   in both modes.
          data-hero-tag-keywords   comma-separated keywords; records
                                   whose <tags> contain ANY keyword
                                   (case-insensitive substring)
                                   survive. Only consulted in
                                   auto-latest mode when
                                   data-hero-pinned-url is blank.
          data-hero-locale         "en" or "fr" (currently
                                   informational - the RBCCM insights
                                   feeds are per-locale so language
                                   filtering is implicit in the URL
                                   choice). auto-latest only.
          data-hero-link-override  optional CTA href override.
                                   auto-latest only.
     2. Fetch every feed in parallel, parse XML, collect <news> records.
     3. Select record per the mode rules above.
     4. Overwrite the insight card's title / body / date / href in place.
        The XSL pre-rendered fallback (SeInsight* Datums in auto-latest,
        DCR-resolved content in dcr-picker) stays visible if the fetch
        fails or nothing matched.

   Field shape confirmed against
   https://www.rbccm.com/en/insights/data/2026-insights (Sept 2026):
     <news>
       <date>September 3, 2026</date>       already human-readable
       <link>/en/insights/2026/09/...</link> relative path
       <title>...</title>
       <description>...</description>
       <tags>tag1, tag2, tag3</tags>        comma-list, freeform casing
     </news>

   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent -
   safe to re-run without double-hydrating (guarded by an
   `is-hydrated` class on the card + a data-hero-bound flag on
   the section).
   ========================================================================= */

(function () {
  /* Matches both hydrator-eligible modes. The per-section dispatch
     inside hydrateSection() then routes on data-hero-source and
     the presence of data-hero-pinned-url. */
  var ROOT_SEL = '.rbccm-hero--strategy-and-economics[data-hero-source="auto-latest"], .rbccm-hero--strategy-and-economics[data-hero-source="dcr-picker"]';
  var CARD_SEL = '.rbccm-hero__insight-card';
  var HYDRATED = 'is-hydrated';

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

  /* Filter helper. Keeps a record if any keyword appears (case-
     insensitive substring) inside the record's <tags> field. Empty
     keyword list = passthrough (keep everything). */
  function makeTagFilter(rawKeywords) {
    var keys = (rawKeywords || '')
      .split(',')
      .map(function (k) { return k.trim().toLowerCase(); })
      .filter(Boolean);
    if (!keys.length) return function () { return true; };
    return function (rec) {
      var tags = childText(rec, 'tags').toLowerCase();
      if (!tags) return false;
      for (var i = 0; i < keys.length; i++) {
        if (tags.indexOf(keys[i]) !== -1) return true;
      }
      return false;
    };
  }

  /* Sort key from <date>. The feed already ships human-readable
     strings ("September 3, 2026") which Date.parse handles fine.
     Records that fail to parse drop to the bottom rather than
     winning by accident. */
  function sortKey(rec) {
    var raw = childText(rec, 'date');
    if (!raw) return 0;
    var t = Date.parse(raw);
    return isNaN(t) ? 0 : t;
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

  function pickLatest(docs, keepFn) {
    var candidates = [];
    docs.forEach(function (doc) {
      if (!doc) return;
      var items = doc.getElementsByTagName('news');
      for (var i = 0; i < items.length; i++) {
        if (keepFn(items[i])) candidates.push(items[i]);
      }
    });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) { return sortKey(b) - sortKey(a); });
    return candidates[0];
  }

  /* Pin-by-URL selector. Walks every feed doc, matches the pinned
     slug against each record's <link>, returns the first hit.
     Returns null if nothing matches so the caller can fall through
     to the manual pre-render. */
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

  /* Character limits for the card title / body. The XSL writes them
     to data-hero-title-max / data-hero-body-max (70 / 170 by default,
     0 = no limit) and applies them to server-rendered text; this
     applies the same cut to text that comes from a feed. Same rule as
     the XSL: at most max characters including the ellipsis, cut at
     the last whole word unless that drops more than 40% of the
     allowance, trailing punctuation trimmed. */
  function readMax(section, attr, fallback) {
    var v = parseInt(section.getAttribute(attr), 10);
    return isNaN(v) ? fallback : v;
  }
  function truncate(text, max) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!max || max <= 0 || t.length <= max) return t;
    var cut = t.slice(0, max - 1);
    var sp = cut.lastIndexOf(' ');
    if (sp + 1 > max * 0.6) cut = cut.slice(0, sp);
    return cut.replace(/[\s,;:.\-]+$/, '') + '\u2026';
  }

  function hydrateCard(section, rec, linkOverride) {
    var card = section.querySelector(CARD_SEL);
    if (!card) return;

    var title = truncate(decodeEntities(childText(rec, 'title')), readMax(section, 'data-hero-title-max', 70));
    var desc  = truncate(decodeEntities(childText(rec, 'description')), readMax(section, 'data-hero-body-max', 170));
    var date  = childText(rec, 'date');           // already pretty-formatted
    var link  = linkOverride || childText(rec, 'link') || '';

    var titleEl = card.querySelector('.rbccm-hero__insight-title');
    var bodyEl  = card.querySelector('.rbccm-hero__insight-body');
    var dateEl  = card.querySelector('.rbccm-hero__insight-date');
    var linkEl  = card.querySelector('.rbccm-hero__insight-link');

    if (titleEl && title) titleEl.textContent = title;
    if (bodyEl  && desc)  bodyEl.textContent  = desc;
    if (dateEl  && date)  dateEl.textContent  = date;
    if (linkEl  && link)  linkEl.setAttribute('href', link);

    card.classList.add(HYDRATED);
  }

  function hydrateSection(section) {
    if (section.getAttribute('data-hero-bound') === 'true') return;
    section.setAttribute('data-hero-bound', 'true');

    var mode   = section.getAttribute('data-hero-source') || '';
    var pinned = section.getAttribute('data-hero-pinned-url') || '';

    /* dcr-picker mode: the server-rendered DCR content is the primary
       path. The hydrator only runs as a fallback when the author has
       set a pinned URL. No keyword scan in this mode. */
    if (mode === 'dcr-picker' && !pinned) return;

    var feedAttr = section.getAttribute('data-hero-feed-urls') || '';
    var feeds = feedAttr.split(',').map(function (u) { return u.trim(); }).filter(Boolean);
    if (!feeds.length) return;

    var keywords = section.getAttribute('data-hero-tag-keywords') || '';
    var override = section.getAttribute('data-hero-link-override') || '';
    var keepFn   = makeTagFilter(keywords);

    Promise.all(feeds.map(fetchFeed)).then(function (docs) {
      var rec;
      if (mode === 'dcr-picker') {
        /* dcr-picker fallback: pinned URL is the ONLY lookup. If it
           doesn't match a feed record, leave the DCR-rendered card
           in place - do not fall through to a keyword scan. */
        rec = pickPinned(docs, pinned);
      } else {
        /* auto-latest: pinned URL takes precedence when set; falls
           through to keyword-filtered latest when the target slug
           isn't in any feed. */
        rec = pinned ? pickPinned(docs, pinned) : null;
        if (!rec) rec = pickLatest(docs, keepFn);
      }
      if (rec) hydrateCard(section, rec, override);
    });
  }

  function init() {
    var sections = document.querySelectorAll(ROOT_SEL);
    for (var i = 0; i < sections.length; i++) hydrateSection(sections[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
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

/* ==== rbccm-two-up-cards/rbccm-two-up-cards.js ==== */
/* =========================================================================
   RBCCM Two-Up Cards - video modal runtime
   Deploy path: /assets/rbccm/js/components/rbccm-two-up-cards.js

   Behavior
   =========================================================================
   Only needed for the video-callouts preset. Attaches a click handler on
   any .rbccm-two-up-cards__card[data-video-url] (the whole-card link) and
   opens a Bootstrap-shaped modal with the video URL. Older markup (a
   .rbccm-two-up-cards__card-media[data-video-url] button plus a separate
   "Watch the video" link) is still handled until every page is on the
   current skin. The DOM shape mirrors the
   MAAS/MATA hero video modal (yellow top border, 8px), so the modal
   inherits site-standard Bootstrap CSS on production while carrying its
   own fallback CSS in rbccm-two-up-cards.css for local previews.

   Player selection is automatic based on URL:
     - Direct file  (.mp4, .m4v, .webm, .ogg, .ogv, .mov)
                    -> native <video controls autoplay muted playsinline>
                    (iframes don't play direct files reliably; muted so
                    autoplay isn't blocked by Chrome's policy).
     - YouTube      -> <iframe> to youtube.com/embed/... with autoplay=1&rel=0.
     - Vimeo        -> <iframe> to player.vimeo.com/video/... with autoplay=1.
     - Everything else (Brightcove players, Wistia, etc.)
                    -> <iframe> loading the URL verbatim. If the URL is a
                    Brightcove player embed (players.brightcove.net) and
                    doesn't already carry autoplay/muted, we append
                    ?autoplay=1&muted=1 so the video starts immediately
                    when the modal opens (matches MAAS/MATA hero behavior).

   Open / close mechanism
   =========================================================================
   Runtime tries three backends in order and stops on the first match:
     1. Bootstrap 5 (window.bootstrap.Modal) - live site.
     2. Bootstrap 3/4 (jQuery.fn.modal)      - legacy pages.
     3. Vanilla                              - local previews / edge cases.
   When Bootstrap is present it owns focus trap, backdrop, and Esc; we
   add a supplementary focus-guard span AFTER the iframe so Tab escapes
   from the video player (YouTube etc.) get pulled back to the close
   button - same pattern the MAAS/MATA hero modal uses.

   Accessibility
   =========================================================================
   - Focus is trapped inside the modal while open. Bootstrap handles the
     usual trap; the focus-guard span catches iframe Tab escapes.
   - ESC closes the modal (Bootstrap handles it; vanilla fallback wires it
     manually) and returns focus to the card link that opened it.
   - Clicking the backdrop closes.
   - The whole card is one link, so it is a single tab stop and screen
     readers hear the full card text. Enter opens the video.
   ========================================================================= */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Element refs (created lazily on first open)
     ------------------------------------------------------------------ */
  var modalEl       = null;   // .modal.fade wrapper
  var playerHost    = null;   // aspect-ratio wrapper the player element lives in
  var closeBtn      = null;
  var focusGuardEl  = null;
  var player        = null;   // active iframe or video
  var lastTrigger   = null;   // the button/link that opened the modal
  var MODAL_ID      = 'rbccm-two-up-cards-modal';
  var MODAL_DESC_ID = MODAL_ID + '-desc';


  /* ------------------------------------------------------------------
     URL classification - decides which player element to mount.
     ------------------------------------------------------------------ */
  function classifyUrl(url) {
    if (!url) return { kind: 'embed', src: '' };
    // Strip querystring/hash for extension check so signed .mp4?sig=...
    // URLs still classify as file.
    var pathOnly = url.split('?')[0].split('#')[0].toLowerCase();

    if (/\.(mp4|m4v|webm|ogg|ogv|mov)$/i.test(pathOnly)) {
      return { kind: 'file', src: url };
    }
    var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
    if (ytMatch) {
      return { kind: 'youtube', src: 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1&rel=0' };
    }
    var vmMatch = url.match(/vimeo\.com\/(\d+)/i);
    if (vmMatch) {
      return { kind: 'vimeo', src: 'https://player.vimeo.com/video/' + vmMatch[1] + '?autoplay=1' };
    }

    /* Brightcove player URL - matches players.brightcove.net/.../index.html
       Auto-append autoplay + muted params if the URL doesn't already
       carry them; matches the MAAS/MATA hero pattern (muted required
       because Chrome blocks unmuted autoplay). */
    if (/players\.brightcove\.net/i.test(url)) {
      var next = url;
      if (!/[?&]autoplay=/i.test(next)) {
        next += (next.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
      }
      if (!/[?&]muted=/i.test(next)) {
        next += '&muted=1';
      }
      return { kind: 'embed', src: next };
    }

    // Fallback: use verbatim.
    return { kind: 'embed', src: url };
  }


  /* ------------------------------------------------------------------
     Modal shell construction  (mirrors MAAS/MATA hero video modal)
     ------------------------------------------------------------------ */
  function ensureModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.id = MODAL_ID;
    modalEl.className = 'modal fade rbccm-two-up-cards__modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('tabindex', '-1');
    modalEl.setAttribute('aria-label', 'Video');
    modalEl.setAttribute('aria-describedby', MODAL_DESC_ID);

    /* Inline styles + Bootstrap classes intentionally match the
       MAAS/MATA hero modal so the visual (yellow top border, 960 max
       width, tight padding) is identical across the site. */
    modalEl.innerHTML =
      '<div role="document" class="modal-dialog" style="top: 0px; width: 100%; max-width: 960px;">' +
        '<div class="modal-content">' +
          '<div>' +
            '<div class="modal-header" style="border: none; border-top: 8px #FBDE00 solid; padding: 0px;">' +
              '<button aria-label="Close Modal" class="close" style="font-size: 41px; color: #595959; font-weight: normal;" type="button" data-dismiss="modal" data-bs-dismiss="modal">&times;</button>' +
            '</div>' +
            '<div class="modal-body" style="padding: 0px;">' +
              '<div class="white-box-text" style="padding: 25px; padding-top: 10px;">' +
                '<div style="margin-bottom: 20px;">' +
                  '<p id="' + MODAL_DESC_ID + '" class="sr-only">Video opens in an embedded player.</p>' +
                  '<div>' +
                    '<div style="position: relative; display: block; max-width: 960px;">' +
                      '<div class="rbccm-two-up-cards__modal-aspect" style="padding-top: 56.25%;">' +
                        // Player element (iframe or video) mounted here on open.
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<span tabindex="0" aria-hidden="true" data-focus-guard="' + MODAL_ID + '"></span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modalEl);

    playerHost   = modalEl.querySelector('.rbccm-two-up-cards__modal-aspect');
    closeBtn     = modalEl.querySelector('.close');
    focusGuardEl = modalEl.querySelector('[data-focus-guard]');

    /* Close button - Bootstrap's data-bs-dismiss / data-dismiss handles
       this automatically when Bootstrap's JS is on the page. The
       explicit click listener catches the vanilla-fallback path. */
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeModal();
    });

    /* Focus guard - Bootstrap's native focus trap can't reach into the
       iframe (cross-origin), so when Tab moves focus out of the iframe
       it lands on this span. On focus, we shoot it back to the close
       button so the user stays inside the modal. */
    focusGuardEl.addEventListener('focus', function () {
      closeBtn.focus();
    });

    /* Vanilla-fallback wiring - noops when Bootstrap owns open/close. */
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.key === 'Esc') closeModal();
    });

    /* When Bootstrap fires its hidden.bs.modal event, teardown the
       player. Registered for both BS5 (native event) and jQuery/BS3-4.
       Idempotent with the closeModal() teardown path. */
    modalEl.addEventListener('hidden.bs.modal', teardownPlayer);
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery(modalEl).on('hidden.bs.modal', teardownPlayer);
    }
  }


  function isOpen() {
    if (!modalEl) return false;
    return modalEl.classList.contains('show')
        || modalEl.classList.contains('in')
        || modalEl.style.display === 'block';
  }


  /* ------------------------------------------------------------------
     Player mount / teardown
     ------------------------------------------------------------------ */
  function mountPlayer(kind, src) {
    teardownPlayer();

    if (kind === 'file') {
      player = document.createElement('video');
      player.className = 'rbccm-two-up-cards__modal-video';
      player.setAttribute('controls', 'controls');
      player.setAttribute('autoplay', 'autoplay');
      player.setAttribute('muted', 'muted');       // required for Chrome autoplay policy
      player.muted = true;
      player.setAttribute('playsinline', 'playsinline');
      player.setAttribute('preload', 'metadata');
      player.setAttribute('title', 'Video player');
      // Fill the 56.25% aspect-ratio wrapper.
      player.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;object-fit:contain;';
      player.src = src;
    } else {
      player = document.createElement('iframe');
      player.className = 'rbccm-two-up-cards__modal-iframe';
      player.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      player.setAttribute('allowfullscreen', 'allowfullscreen');
      player.setAttribute('frameborder', '0');
      player.setAttribute('title', 'Video player');
      player.style.cssText = 'position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;';
      player.src = src;
    }
    playerHost.appendChild(player);
  }

  function teardownPlayer() {
    if (!player) return;
    if (player.tagName === 'IFRAME') {
      player.src = 'about:blank';
    }
    if (player.tagName === 'VIDEO') {
      try { player.pause(); } catch (_e) {}
      player.removeAttribute('src');
      player.load();
    }
    if (player.parentNode) player.parentNode.removeChild(player);
    player = null;
  }


  /* ------------------------------------------------------------------
     Open / close  (BS5 -> BS3/4 -> vanilla)
     ------------------------------------------------------------------ */
  function openModal(url, trigger) {
    ensureModal();
    lastTrigger = trigger || document.activeElement;

    var route = classifyUrl(url);
    mountPlayer(route.kind, route.src);
    modalEl.setAttribute('data-player-kind', route.kind);

    // Bootstrap 5 (window.bootstrap.Modal) - preferred.
    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
      return;
    }
    // Bootstrap 3/4 via jQuery.
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery(modalEl).modal('show');
      return;
    }
    // Vanilla fallback (local-test path).
    modalEl.classList.add('show', 'in');
    modalEl.style.display = 'block';
    modalEl.removeAttribute('aria-hidden');
    modalEl.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');
    window.setTimeout(function () { closeBtn.focus(); }, 30);
  }

  function closeModal() {
    if (!modalEl) return;

    if (window.bootstrap && window.bootstrap.Modal) {
      var inst = window.bootstrap.Modal.getInstance(modalEl);
      if (inst) {
        inst.hide();
        // teardownPlayer + focus restore happen via hidden.bs.modal listener + below.
        restoreFocusToTrigger();
        return;
      }
    }
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery(modalEl).modal('hide');
      restoreFocusToTrigger();
      return;
    }
    // Vanilla teardown.
    modalEl.classList.remove('show', 'in');
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.removeAttribute('aria-modal');
    document.body.classList.remove('modal-open');
    teardownPlayer();
    restoreFocusToTrigger();
  }

  function restoreFocusToTrigger() {
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }


  /* ------------------------------------------------------------------
     Play-button "explode" animation on click (unchanged)
     ------------------------------------------------------------------ */
  function explodePlayButton(cardEl) {
    if (!cardEl) return;
    var play = cardEl.querySelector('.rbccm-two-up-cards__card-play');
    if (!play) return;
    play.classList.remove('is-launching');
    // eslint-disable-next-line no-unused-expressions
    play.offsetWidth;                       // force reflow to restart transition
    play.classList.add('is-launching');
    window.setTimeout(function () {
      play.classList.remove('is-launching');
    }, 650);
  }


  /* ------------------------------------------------------------------
     Delegated click handler - media button + "Watch the video" CTA.
     Multi-instance safe (any number of cards on the page share one modal).
     ------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;

    // 1. Whole-card link (current skin).
    var cardTrigger = e.target.closest('a.rbccm-two-up-cards__card[data-video-url]');
    if (cardTrigger) {
      var cardUrl = cardTrigger.getAttribute('data-video-url');
      if (cardUrl) {
        e.preventDefault();
        explodePlayButton(cardTrigger);
        openModal(cardUrl, cardTrigger);
      }
      return;
    }

    // 2. Older markup: media button (with data-video-url).
    var mediaTrigger = e.target.closest('.rbccm-two-up-cards__card-media[data-video-url]');
    if (mediaTrigger) {
      e.preventDefault();
      var mediaUrl = mediaTrigger.getAttribute('data-video-url');
      if (mediaUrl) {
        explodePlayButton(mediaTrigger.closest('.rbccm-two-up-cards__card'));
        openModal(mediaUrl, mediaTrigger);
      }
      return;
    }

    // 3. Older markup: "Watch the video" CTA - opens the same modal, reading the URL
    //    from the sibling media button. Falls through to a plain link
    //    if the card has no video URL.
    var ctaTrigger = e.target.closest('.rbccm-two-up-cards__card-cta');
    if (ctaTrigger) {
      var card = ctaTrigger.closest('.rbccm-two-up-cards__card');
      if (!card) return;
      var media = card.querySelector('.rbccm-two-up-cards__card-media[data-video-url]');
      if (!media) return;
      var ctaUrl = media.getAttribute('data-video-url');
      if (!ctaUrl) return;
      e.preventDefault();
      explodePlayButton(card);
      openModal(ctaUrl, ctaTrigger);
    }
  });


  /* ------------------------------------------------------------------
     Tiny public API - analytics / deep-link teams occasionally need it.
     ------------------------------------------------------------------ */
  window.RBCCMTwoUpCards = {
    open: openModal,
    close: closeModal
  };
})();
;

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
