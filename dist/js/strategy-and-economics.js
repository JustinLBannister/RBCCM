/*! RBCCM strategy-and-economics.js | v1 | built 2026-10-28T14:40:48.280Z
 *  rbccm-hero, rbccm-accordions, rbccm-expertise, rbccm-in-the-media, rbccm-featured-insights, rbccm-animate */

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

/* ==== rbccm-accordions/rbccm-accordions.js ==== */
/* =========================================================================
   RBCCM Accordions -- shared runtime
   Deploy path: /assets/rbccm/js/components/rbccm-accordions.js

   Behavior
   =========================================================================
   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent -- safe
   to re-run without double-binding. Multi-instance -- one
   .rbccm-accordions per section, any number per page.

   For each instance:
     - Click any .__item-toggle button -> toggle its item's .is-open + ARIA
     - "Expand all" button expands every item in that instance; label
       flips to "Collapse all" when all items are open, and clicking it
       collapses them
     - Keyboard: toggles are native <button>s so Enter/Space work by default

   Data contract (matches the CSS + XSL):
     .__item                         [class ~ is-open when open]
     .__item-toggle                  [aria-expanded="true|false"]
                                     [aria-controls="{expanded-id}"]
     .__item-expanded                [id="{expanded-id}"]
     .__expand-all                   [data-accordions-expand-all]
                                     [aria-expanded="true|false"]
     .__expand-all-label--collapse   optional inner <span> shown when
                                     all items are open; falls back to
                                     swapping the button's textContent
                                     between "Expand all" / "Collapse all"
                                     using data-* label overrides.
   ========================================================================= */

(function () {
  var BLOCK          = 'rbccm-accordions';
  var ROOT_SEL       = '.' + BLOCK;
  var ITEM_SEL       = '.' + BLOCK + '__item';
  var TOGGLE_SEL     = '.' + BLOCK + '__item-toggle';
  var EXPAND_ALL_SEL = '[data-accordions-expand-all]';
  var BOUND_ATTR     = 'data-accordions-bound';
  var OPEN_CLASS     = 'is-open';

  /* ---- Media in the body copy (video / podcast embeds) ----------------
     A collapsed note only hides its body, so without this a video or
     podcast keeps playing after the note closes, and every embed on the
     page loads up front even though the notes start closed.
       - iframes: the src is kept in data-rbccm-src and only set while the
         note is open. Removing it on collapse stops any player (Brightcove,
         YouTube, Vimeo, Spotify, Apple Podcasts...) without needing its API.
       - <video>, <audio> and Brightcove in-page players (<video-js>):
         paused on collapse.
       - iframes with no title get one from the note title, so screen
         readers can name the frame. */
  var MEDIA_SRC_ATTR = 'data-rbccm-src';

  function noteTitle(item) {
    var t = item.querySelector('.' + BLOCK + '__item-title');
    return t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function prepMedia(item) {
    var frames = item.querySelectorAll('.' + BLOCK + '__item-expanded iframe');
    var title = noteTitle(item);
    var isOpen = item.classList.contains(OPEN_CLASS);
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (!f.getAttribute('title')) f.setAttribute('title', title ? 'Media: ' + title : 'Embedded media');
      var src = f.getAttribute('src');
      if (src && src !== 'about:blank' && !f.getAttribute(MEDIA_SRC_ATTR)) {
        f.setAttribute(MEDIA_SRC_ATTR, src);
        if (!isOpen) f.removeAttribute('src');
      }
    }
  }

  function loadMedia(item) {
    var frames = item.querySelectorAll('.' + BLOCK + '__item-expanded iframe[' + MEDIA_SRC_ATTR + ']');
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute(MEDIA_SRC_ATTR);
      if (frames[i].getAttribute('src') !== src) frames[i].setAttribute('src', src);
    }
  }

  function stopMedia(item) {
    var scope = item.querySelector('.' + BLOCK + '__item-expanded');
    if (!scope) return;
    var frames = scope.querySelectorAll('iframe[' + MEDIA_SRC_ATTR + ']');
    for (var i = 0; i < frames.length; i++) frames[i].removeAttribute('src');
    var players = scope.querySelectorAll('video, audio');
    for (var j = 0; j < players.length; j++) {
      try { players[j].pause(); } catch (e) { /* not playable */ }
    }
    var vjs = scope.querySelectorAll('video-js, .video-js');
    for (var k = 0; k < vjs.length; k++) {
      try {
        var pl = vjs[k].player ||
          (window.videojs && window.videojs.getPlayer && window.videojs.getPlayer(vjs[k]));
        if (pl && pl.pause) pl.pause();
      } catch (e2) { /* player not ready */ }
    }
  }

  function toggleItem(item, forceOpen) {
    var wasOpen = item.classList.contains(OPEN_CLASS);
    var willOpen = (typeof forceOpen === 'boolean')
      ? forceOpen
      : !wasOpen;
    item.classList.toggle(OPEN_CLASS, willOpen);
    if (willOpen && !wasOpen) loadMedia(item);
    if (!willOpen && wasOpen) stopMedia(item);
    var toggle = item.querySelector(TOGGLE_SEL);
    if (toggle) toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  /* Notes with something to expand. A note with no body copy and no
     read-more link has no expanded region (the skin leaves it out), so
     it is skipped by the card click and by Expand all. */
  function expandableItems(root) {
    var all = root.querySelectorAll(ITEM_SEL);
    var out = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].querySelector('.' + BLOCK + '__item-expanded')) out.push(all[i]);
    }
    return out;
  }

  function allOpen(root) {
    var items = expandableItems(root);
    if (!items.length) return false;
    for (var i = 0; i < items.length; i++) {
      if (!items[i].classList.contains(OPEN_CLASS)) return false;
    }
    return true;
  }

  function syncExpandAll(root) {
    var btn = root.querySelector(EXPAND_ALL_SEL);
    if (!btn) return;
    var open = allOpen(root);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* Label swap. Author can supply data-label-expand + data-label-collapse
       on the button; otherwise we default to English strings that match
       the Figma spec. */
    var expandLabel   = btn.getAttribute('data-label-expand')   || 'Expand all';
    var collapseLabel = btn.getAttribute('data-label-collapse') || 'Collapse all';
    btn.textContent = open ? collapseLabel : expandLabel;
  }

  function bindInstance(root) {
    if (root.getAttribute(BOUND_ATTR) === 'true') return;
    root.setAttribute(BOUND_ATTR, 'true');

    /* Delegated click handler at the root. One listener per instance,
       covers three surfaces:
         1. Expand-all button -- toggles every item
         2. Anywhere inside .__item-expanded (body copy + read-more) --
            NO toggle, so users can select body text and click links
            without accidentally collapsing the card
         3. Anywhere else inside a .__item (header row, title, summary,
            or the +/x toggle button itself) -- toggle that item.
            The whole card is the click surface, not just the icon.
       The <button class="__item-toggle"> stays as the semantic
       control that assistive tech announces via aria-expanded;
       the card click is a mouse convenience layered on top. */
    root.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      var expandAllBtn = target.closest(EXPAND_ALL_SEL);
      if (expandAllBtn && root.contains(expandAllBtn)) {
        var open = !allOpen(root);
        var items = expandableItems(root);
        for (var i = 0; i < items.length; i++) toggleItem(items[i], open);
        syncExpandAll(root);
        return;
      }

      /* Ignore clicks inside the expanded body -- leaves body text
         selectable and lets nested links/buttons behave normally. */
      var inExpanded = target.closest('.' + BLOCK + '__item-expanded');
      if (inExpanded && root.contains(inExpanded)) return;

      var item = target.closest(ITEM_SEL);
      if (item && root.contains(item) && item.querySelector('.' + BLOCK + '__item-expanded')) {
        toggleItem(item);
        syncExpandAll(root);
      }
    });

    /* Initial sync -- if the server rendered any items with .is-open
       already, keep the button label in sync. */
    var all = root.querySelectorAll(ITEM_SEL);
    for (var m = 0; m < all.length; m++) prepMedia(all[m]);
    syncExpandAll(root);
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
;

/* ==== rbccm-expertise/rbccm-expertise.js ==== */
/* =========================================================================
   RBCCM Expertise - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-expertise.js

   Behavior
   =========================================================================
   Below 1245px the .rbccm-expertise__track collapses from a 4-column
   grid into a Slick carousel:
     - <768px: 1 pillar per view
     - 768-1244px: 2 pillars per view
     - >=1245px: Slick is destroyed and the CSS grid takes over

   Requires jQuery. Slick is lazy-loaded from CDN on first mobile init
   so the desktop path pays no JS cost.

   Ported from the earlier rbccm-reasons pattern. Class-selector prefix
   swapped rbccm-reasons -> rbccm-expertise; behavior otherwise
   identical. Safe on multi-instance pages (each section binds
   independently).
   ========================================================================= */
jQuery(document).ready(function ($) {
  var reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Universal Slick loader. Runs on ANY page + ANY component that
     uses this pattern. Four resolution paths, in order:
       1. Slick already available globally ($.fn.slick defined) --
          site chrome or a previously-initialized component loaded
          it. Fire the callback immediately.
       2. Our shared window promise exists -- another RBCCM component
          on this page kicked off a load a moment ago. Wait on it.
       3. A <script src="...slick*"> tag is already in the DOM but
          hasn't finished loading yet -- site chrome or a legacy
          component beat us to it. Poll for $.fn.slick until it
          appears, with a 10s safety net that falls back to inject.
       4. Nothing anywhere -- inject the RBCCM-hosted accessible
          Slick (a11y-enhanced fork the site chrome uses site-wide;
          preferred over vanilla Slick for keyboard + SR support).
     Only path 4 hits the network. Paths 1-3 dedupe. Result: multi-
     Slick pages (S&E: expertise + featured-insights + any future
     component) never load Slick more than once. */
  function loadSlick(callback) {
    if (typeof $.fn.slick !== 'undefined') { callback(); return; }
    if (!window.__rbccmSlickLoader__) {
      window.__rbccmSlickLoader__ = new Promise(function (resolve) {
        function poll() {
          if (typeof $.fn.slick !== 'undefined') { resolve(); return true; }
          return false;
        }
        /* Sniff for anything Slick-shaped: RBCCM's accessible-slick
           fork, vanilla slick.min.js, slick-carousel via CDN, etc. */
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
          /* Two-tier inject:
             (a) Prefer RBCCM's accessible-slick fork (a11y-enhanced,
                 matches what site chrome loads on rbccm.com). Full
                 absolute URL so production, TeamSite, and local
                 file:// previews all resolve the same host.
             (b) If that fails (CORS blocked on file://, network
                 error, 404, etc.) fall back to public cdnjs Slick
                 so local development still works. Production almost
                 never hits (b) because chrome-loaded Slick is picked
                 up by the earlier detection paths anyway. */
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
    var $track    = $section.find('.rbccm-expertise__track');
    var $pillars  = $track.children('.rbccm-expertise__pillar');
    var $dots     = $section.find('.rbccm-expertise__dots');
    var $announce = $section.find('.rbccm-expertise__sr-only');

    $section.toggleClass('rbccm-expertise--single', $pillars.length <= 1);

    function updateAnnounce(currentSlide) {
      if (!$announce.length || $pillars.length <= 1) return;
      $announce.text('Item ' + (currentSlide + 1) + ' of ' + $pillars.length);
    }
    function syncDots() {
      var $buttons = $dots.find('li button');
      if (!$buttons.length) return;
      $dots.attr({ 'role': 'group', 'aria-label': 'Choose a pillar' });
      $buttons.each(function (idx) {
        $(this).attr('tabindex', '0').attr('aria-label', 'Go to slide ' + (idx + 1));
      });
    }
    /* Per a11y QA: pillar cards are static content (icon + title + body,
       no anchor / button / interactive child), so keyboard focus should
       skip them entirely. Slick's default `accessibility: true` runs its
       `initADA()` on every slide change and adds `tabindex="0"` to the
       currently-visible `.slick-slide` wrappers so its own keyboard
       nav can shuttle focus between panels. Strip those tabindexes
       (and the aria-describedby that pairs with the tabpanel role)
       right after Slick sets them; Slick's arrow-key handler still
       works when a dot button has focus, so keyboard nav is unchanged
       for keyboard users -- they just don't have to Tab through four
       empty "panels" to reach the next content section. */
    function stripSlideTabindex() {
      $track.find('.slick-slide').each(function () {
        this.removeAttribute('tabindex');
      });
    }

    function initSlider() {
      if ($pillars.length <= 1 || $track.hasClass('slick-initialized')) return;
      $track.off('.rbccmExpertise');
      $track.on('init.rbccmExpertise afterChange.rbccmExpertise setPosition.rbccmExpertise breakpoint.rbccmExpertise', function (event, slick, currentSlide) {
        var active = typeof currentSlide === 'number' ? currentSlide : (slick && typeof slick.currentSlide === 'number' ? slick.currentSlide : 0);
        updateAnnounce(active);
        syncDots();
        stripSlideTabindex();
      });
      $track.on('destroy.rbccmExpertise', function () {
        $dots.empty();
        $announce.empty();
      });
      $track.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,  /* equalize slide heights (tallest wins) */
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        mobileFirst: true,
        responsive: [
          {
            /* 640-991: 2-per-view slider. */
            breakpoint: 640,
            settings: { slidesToShow: 2, slidesToScroll: 2 }
          },
          {
            /* 992-1244: 3-per-view slider. */
            breakpoint: 992,
            settings: { slidesToShow: 3, slidesToScroll: 3 }
          },
          {
            /* 1245+: 4-per-view. Slick STAYS initialized (not
               unslicked) but the CSS below hides the controls
               since all pillars are visible at once. */
            breakpoint: 1245,
            settings: { slidesToShow: 4, slidesToScroll: 4 }
          }
        ]
      });
      syncDots();
      stripSlideTabindex();

      $section.find('.rbccm-expertise__btn--prev').off('click.rbccmExpertise').on('click.rbccmExpertise', function () {
        if ($track.hasClass('slick-initialized')) $track.slick('slickPrev');
      });
      $section.find('.rbccm-expertise__btn--next').off('click.rbccmExpertise').on('click.rbccmExpertise', function () {
        if ($track.hasClass('slick-initialized')) $track.slick('slickNext');
      });

      /* Keyboard: arrow keys on the controls row scrub prev/next; when
         focus sits on a dot button, arrow keys move focus dot-to-dot. */
      $section.find('.rbccm-expertise__controls').off('keydown.rbccmExpertise').on('keydown.rbccmExpertise', function (e) {
        if (!$track.hasClass('slick-initialized')) return;
        var dir = 0;
        if (e.key === 'ArrowLeft'  || e.key === 'Left')  dir = -1;
        if (e.key === 'ArrowRight' || e.key === 'Right') dir =  1;
        if (!dir) return;
        var $target = $(e.target);
        var $dotBtn = $target.closest('.rbccm-expertise__dots button');
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
        if (dir === -1) $track.slick('slickPrev');
        if (dir ===  1) $track.slick('slickNext');
      });
    }

    /* Slick always initializes; its responsive breakpoints handle
       1/2/3/4-per-view. At >=1245 controls are hidden via CSS so the
       row reads as a static 4-col grid. This avoids a first-load bug
       where a desktop viewport skipped init and pillars stacked. */
    loadSlick(initSlider);
  }

  $('.rbccm-expertise').each(function () { setupSection($(this)); });
});
;

/* ==== rbccm-in-the-media/rbccm-in-the-media.js ==== */
/* =========================================================================
   RBCCM In the Media - sidecar JS runtime
   Deploy path: /assets/rbccm/js/components/rbccm-in-the-media.js

   What this file does
   =========================================================================
   1. Reads window.RBCCM_IN_THE_MEDIA_CONFIG (set by the XSL from Datums):
        feedUrl     -- XML feed URL (default: press-releases.page)
        itemCount   -- total items to render (default: 4 = 1 featured + 3 rows)
        heroPoster  -- fallback image URL for the featured card
   2. Fetches every root section with [data-rbccm-in-the-media-root].
   3. For each root: fetches the feed, parses <news> nodes, sorts by
      date desc, takes the first N items, splits each concatenated
      title into { kind, person, source, timecode } via regex, and
      populates the shell emitted by the XSL.

   Title parsing
   =========================================================================
   Feed titles arrive concatenated, e.g.:
     "RBC TV: Amy Wu Silverman on CNBC"
     "RBC Radio: Frances Donald on Bloomberg (starts 01:30:25)"
   Regex captures: prefix (RBC TV / RBC Radio / RBC Talks / RBC Podcast),
   person, source (network), and optional starts-at timecode. Falls
   back to the raw title for anything that doesn't match the pattern.

   Truncation
   =========================================================================
   Featured title  -> capped at 98 chars (visible, with surrounding quotes)
   Row title       -> capped at 115 chars (visible, with surrounding quotes)
   Ellipsis (U+2026) replaces the tail when a title exceeds the cap.
   ========================================================================= */

(function () {
  'use strict';

  var CONFIG = window.RBCCM_IN_THE_MEDIA_CONFIG || {};
  var DEFAULT_FEED_URL = '/en/about-us/data/2026';
  var DEFAULT_ITEM_COUNT = 4;
  var FEATURED_TITLE_MAX = 98;  /* rendered chars including surrounding quotes */
  var ROW_TITLE_MAX      = 115;

  /* Play-triangle SVG for the featured media anchor. */
  var PLAY_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
    'viewBox="0 0 24 24" fill="none">' +
    '<path d="M8 5v14l11-7z" fill="currentColor"/>' +
    '</svg>';


  /* ---------- Fetch + parse helpers ---------------------------------- */
  function fetchOptional(url) {
    return fetch(url).then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
  }
  function escapeStrayAmpersands(s) {
    if (!s) return s;
    var parts = s.split(/(<!\[CDATA\[[\s\S]*?\]\]>)/);
    for (var i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i].replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
    }
    return parts.join('');
  }
  function parseNewsNodes(xmlStr) {
    if (!xmlStr) return [];
    try {
      var doc = new DOMParser().parseFromString(escapeStrayAmpersands(xmlStr), 'application/xml');
      if (!doc || doc.getElementsByTagName('parsererror').length > 0) return [];
      return Array.prototype.slice.call(doc.getElementsByTagName('news'));
    } catch (e) { return []; }
  }
  function childText(node, tag) {
    var el = node.getElementsByTagName(tag)[0];
    return el ? (el.textContent || '').trim() : '';
  }


  /* ---------- Title split --------------------------------------------
     Returns { kind, person, source, timecode, raw } for whatever the
     regex could pull out. Fields not matched come back as ''.

     Feed titles arrive in the shape:
       "RBC {KIND}: {PERSON} on {NETWORK}   [optionally: (timecode)]"
     where KIND is TV / Radio / Podcast / Talks. A two-shape regex
     handles ~97% of real items cleanly; the ~3% remainder are RBC-
     domain articles / press releases whose links start with /rbccm/
     or /assets/rbccm/ and get filtered upstream.

     Trailing "(...)" is only extracted when it CLEARLY looks like a
     timecode / modifier ("starts, HH:MM", "from HH:MM", or a bare
     HH:MM). Anything else -- e.g. "(Video)" -- stays in the source
     so it survives into the rendered card. */
  function parseTitle(raw) {
    var out = { kind: '', person: '', source: '', timecode: '', raw: raw || '' };
    if (!raw) return out;
    var s = String(raw).replace(/\s+/g, ' ').trim();

    var paren = s.match(/^(.+?)\s*\((?:(starts|from)[,\s].*?|\d+:\d+(?::\d+)?)\)\s*$/i);
    if (paren) { s = paren[1].trim(); out.timecode = raw.match(/\(([^)]+)\)\s*$/)[1].trim(); }

    /* Shape A: "RBC {KIND}: {PERSON} on {NETWORK}" */
    var m = s.match(/^RBC\s+([A-Za-z]+):\s*(.+?)\s+on\s+(.+)$/i);
    if (m) {
      out.kind   = 'RBC ' + m[1].trim();
      out.person = m[2].trim();
      out.source = m[3].trim();
      return out;
    }

    /* Shape B (fallback, no RBC prefix): "{PERSON} on {NETWORK}" */
    m = s.match(/^(.+?)\s+on\s+(.+)$/i);
    if (m) {
      out.person = m[1].trim();
      out.source = m[2].trim();
      return out;
    }

    return out;   /* nothing matched -- caller decides what to do */
  }


  /* ---------- Date formatters ---------------------------------------- */
  var MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  function parseDate(s) {
    if (!s) return null;
    var ts = Date.parse(s);
    return isNaN(ts) ? null : new Date(ts);
  }
  function formatLongDate(s) {
    var d = parseDate(s);
    if (!d) return s || '';
    return MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  /* Zero-padded day version used on the row date column ("June 05, 2025"). */
  function formatRowDate(s) {
    var d = parseDate(s);
    if (!d) return s || '';
    var day = d.getDate();
    var dd  = day < 10 ? '0' + day : String(day);
    return MONTH_NAMES[d.getMonth()] + ' ' + dd + ', ' + d.getFullYear();
  }


  /* ---------- Text helpers ------------------------------------------- */
  function quoteTitle(raw) {
    if (!raw) return '';
    return '"' + raw.replace(/^"+|"+$/g, '') + '"';
  }
  /* Truncates the RENDERED (quoted) string to max chars, using an
     ellipsis + closing quote when it overflows. If already short
     enough returns unchanged. */
  function capQuotedTitle(raw, max) {
    var quoted = quoteTitle(raw);
    if (quoted.length <= max) return quoted;
    /* We need: opening quote + N content chars + ellipsis + closing quote = max
       -> N = max - 3  (quotes = 2, ellipsis = 1) */
    var contentBudget = max - 3;
    if (contentBudget < 1) contentBudget = 1;
    var stripped = raw.replace(/^"+|"+$/g, '');
    /* ... = HORIZONTAL ELLIPSIS. Kept as a Unicode escape (not a
       literal glyph) so this source file is pure ASCII -- that way a
       misconfigured charset header on the JS response can't mojibake
       the truncation suffix in the rendered title. */
    return '"' + stripped.slice(0, contentBudget) + '\u2026"';
  }

  /* Uppercase-safe eyebrow prefix by feed kind. */
  function eyebrowKindLabel(kind) {
    if (/RBC TV/i.test(kind))      return 'Featured Video Interview';
    if (/RBC Radio/i.test(kind))   return 'Featured Podcast';
    if (/RBC Talks/i.test(kind))   return 'Featured Talk';
    if (/RBC Podcast/i.test(kind)) return 'Featured Podcast';
    return 'Featured Media Coverage';
  }


  /* ---------- Row DOM ------------------------------------------------ */
  function renderRow(entry) {
    var li = document.createElement('li');
    li.className = 'rbccm-in-the-media__item';

    var card = document.createElement('div');
    card.className = 'rbccm-in-the-media__card';

    var topbar = document.createElement('div');
    topbar.className = 'rbccm-in-the-media__card-topbar';
    var source = document.createElement('span');
    source.className = 'rbccm-in-the-media__card-source';
    source.textContent = entry.source || entry.title.raw;
    var date = document.createElement('span');
    date.className = 'rbccm-in-the-media__card-date';
    date.textContent = entry.dateRowLabel || '';
    topbar.appendChild(source);
    topbar.appendChild(date);

    var titleH = document.createElement('h3');
    titleH.className = 'rbccm-in-the-media__card-title';
    var anchor = document.createElement('a');
    anchor.href = entry.href || '#';
    var visibleTitle = capQuotedTitle(entry.title.raw, ROW_TITLE_MAX);
    var fullTitle    = quoteTitle(entry.title.raw);
    anchor.textContent = visibleTitle;
    /* When the title was truncated with ellipsis OR the link opens in
       a new tab, set an aria-label that carries the full context so
       screen-reader users get the untruncated title AND the "opens in
       new tab" announcement (WCAG 2.4.4 / 3.2.5). */
    if (entry.external) {
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.setAttribute('aria-label', fullTitle + ' (opens in new tab)');
    } else if (visibleTitle !== fullTitle) {
      anchor.setAttribute('aria-label', fullTitle);
    }
    titleH.appendChild(anchor);

    var featured = document.createElement('p');
    featured.className = 'rbccm-in-the-media__card-featured';
    if (entry.title.person) {
      var label = document.createElement('span');
      label.className = 'rbccm-in-the-media__card-featured-label';
      /* Trailing space so the accessible name reads "Featured: <name>"
         and not "Featured:<name>" when the two spans concatenate. */
      label.textContent = 'Featured: ';
      var name = document.createElement('span');
      name.textContent = entry.title.person;
      featured.appendChild(label);
      featured.appendChild(name);
    }

    card.appendChild(topbar);
    card.appendChild(titleH);
    if (entry.title.person) card.appendChild(featured);
    li.appendChild(card);
    return li;
  }


  /* ---------- Featured card fill ------------------------------------- */
  function fillFeatured(root, entry) {
    if (!entry) return;

    var mediaAnchor = root.querySelector('[data-rbccm-in-the-media-media-anchor]');
    var image       = root.querySelector('[data-rbccm-in-the-media-image]');
    var eyebrow     = root.querySelector('[data-rbccm-in-the-media-eyebrow]');
    var title       = root.querySelector('[data-rbccm-in-the-media-featured-title]');
    var expert      = root.querySelector('[data-rbccm-in-the-media-featured-expert]');

    if (mediaAnchor && entry.href) {
      mediaAnchor.href = entry.href;
      if (entry.external) {
        mediaAnchor.target = '_blank';
        mediaAnchor.rel = 'noopener';
      }
      var aria = (eyebrowKindLabel(entry.title.kind) + ': ' + entry.title.raw + ' (opens in new tab)');
      mediaAnchor.setAttribute('aria-label', aria);
    }

    if (image) {
      var src = entry.thumbnail || CONFIG.heroPoster || image.getAttribute('src') || '';
      if (src) image.setAttribute('src', src);
      image.setAttribute('alt', '');
    }

    if (eyebrow) {
      var pieces = [eyebrowKindLabel(entry.title.kind)];
      if (entry.dateLongLabel) pieces.push(entry.dateLongLabel);
      /* * = BULLET. Escape form keeps this source file pure ASCII. */
      eyebrow.textContent = pieces.join(' \u2022 ');
    }

    if (title) {
      title.textContent = capQuotedTitle(entry.title.raw, FEATURED_TITLE_MAX);
    }

    if (expert) {
      expert.textContent = entry.title.person
        ? ('Featured Expert: ' + entry.title.person)
        : '';
    }
  }


  /* ---------- Root render -------------------------------------------- */
  function renderRoot(root, entries) {
    if (!entries.length) return;

    fillFeatured(root, entries[0]);

    var list = root.querySelector('[data-rbccm-in-the-media-list]');
    if (!list) return;
    list.innerHTML = '';
    for (var i = 1; i < entries.length; i++) {
      list.appendChild(renderRow(entries[i]));
    }
  }


  /* ---------- Feed adapter ------------------------------------------- */
  function buildEntry(node) {
    var titleRaw = childText(node, 'title');
    if (!titleRaw) return null;
    var link      = childText(node, 'link');
    var dateStr   = childText(node, 'date') || childText(node, 'publish_date');
    var thumbnail = childText(node, 'thumbnail');
    var topic     = (childText(node, 'topic') || childText(node, 'type')).toLowerCase();
    var isMedia   = topic.indexOf('press') === -1;
    var isExternal = isMedia || /^https?:\/\//i.test(link);

    return {
      title: parseTitle(titleRaw),
      href: link,
      external: isExternal,
      thumbnail: thumbnail,
      topic: topic,
      dateStr: dateStr,
      dateTs: Date.parse(dateStr) || 0,
      dateLongLabel: formatLongDate(dateStr),
      dateRowLabel: formatRowDate(dateStr)
    };
  }

  function fetchEntries(root, feedUrl) {
    return fetchOptional(feedUrl).then(function (xml) {
      var news = parseNewsNodes(xml);
      var entries = news.map(buildEntry).filter(Boolean);
      entries.sort(function (a, b) { return (b.dateTs || 0) - (a.dateTs || 0); });
      return entries;
    });
  }


  /* ---------- Play-button "explode" on launch ------------------------
     Delegated click / activation handler that adds .is-launching to the
     .__play span when the featured media anchor is triggered. CSS
     animates the ring outward + fades everything to transparent so
     the button visibly dissolves as the video opens in a new tab.
     Idempotent + delegated so it survives feed re-renders. */
  function wirePlayExplode() {
    if (document._rbccmInTheMediaExplodeWired) return;
    document._rbccmInTheMediaExplodeWired = true;

    function trigger(anchor) {
      if (!anchor) return;
      var play = anchor.querySelector('.rbccm-in-the-media__play');
      if (!play) return;
      /* Force a reflow before adding the class so a rapid re-launch
         (spacebar-mash, second click) re-runs the transition from the
         rest state instead of jumping straight to the end state. */
      play.classList.remove('is-launching');
      // eslint-disable-next-line no-unused-expressions
      play.offsetWidth;
      play.classList.add('is-launching');
      /* Reset after the transition completes so a return-to-page (back
         button from the new tab) shows the rest-state ring again. */
      window.setTimeout(function () {
        play.classList.remove('is-launching');
      }, 650);
    }

    document.addEventListener('click', function (e) {
      var anchor = e.target && e.target.closest
        ? e.target.closest('.rbccm-in-the-media__media')
        : null;
      if (anchor) trigger(anchor);
    });
    /* Keyboard: Space / Enter on the focused anchor also counts as a
       launch. The browser fires a click for Enter on an <a>, but
       Space doesn't -- catch it here so keyboard users get the same
       explode animation. */
    document.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      var anchor = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('.rbccm-in-the-media__media')
        : null;
      if (anchor) trigger(anchor);
    });
  }


  /* ---------- Boot --------------------------------------------------- */
  function init() {
    var roots = document.querySelectorAll('[data-rbccm-in-the-media-root]');
    if (!roots.length) return;

    var feedUrl   = CONFIG.feedUrl   || DEFAULT_FEED_URL;
    var itemCount = parseInt(CONFIG.itemCount, 10) || DEFAULT_ITEM_COUNT;

    wirePlayExplode();

    Array.prototype.forEach.call(roots, function (root) {
      fetchEntries(root, feedUrl).then(function (entries) {
        /* Keep only genuine "Person on Network" media appearances in
           the S&E hero. Drops:
             (a) RBC-authored articles / press releases whose link
                 starts with /rbccm/ or /assets/rbccm/, and
             (b) items whose title didn't parse at all (kind + person
                 + source all empty) -- the parser can't stage them
                 into the "Featured Expert on Network" layout. */
        var mediaOnly = entries.filter(function (e) {
          if (!e || !e.title) return false;
          var link = e.href || '';
          if (link.indexOf('/rbccm/') === 0 || link.indexOf('/assets/rbccm/') === 0) return false;
          var t = e.title;
          if (!t.kind && !t.person && !t.source) return false;
          return true;
        });
        renderRoot(root, mediaOnly.slice(0, itemCount));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
;

/* ==== rbccm-featured-insights/rbccm-featured-insights.js ==== */
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

  /* Character limits. The skin stamps data-title-max / data-desc-max on
     each tile from the Tile{N}TitleLimit / Tile{N}DescLimit fields
     (0 = no limit), so feed content is cut the same way as server-
     rendered content. Same rule as rbccm-hero.js: cut at the last whole
     word (unless that drops more than 40% of the allowance), trim
     trailing punctuation, add an ellipsis that counts toward the limit. */
  function readMax(tile, attr, fallback) {
    var v = parseInt(tile.getAttribute(attr), 10);
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

    if (titleEl && title) titleEl.textContent = truncate(title, readMax(tile, 'data-title-max', 70));
    if (descEl  && desc)  descEl.textContent  = truncate(desc, readMax(tile, 'data-desc-max', 170));
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
