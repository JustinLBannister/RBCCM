/* =========================================================================
   RBCCM Hero - Strategy & Economics insight card hydrator
   Deploy path: /assets/rbccm/js/components/rbccm-hero.js

   Behavior
   -------------------------------------------------------------------------
   For every .rbccm-hero--strategy-and-economics section marked with
   data-hero-source="auto-latest":

     1. Read config from data-* attrs authored by the XSL:
          data-hero-feed-urls      comma-separated XML feed URLs
          data-hero-pinned-url     optional specific article URL to pin;
                                   accepts a full https URL or the /en/
                                   path. When present it OVERRIDES the
                                   keyword search - the hydrator matches
                                   this URL against feed records by slug
                                   and uses that specific record's
                                   title / description / date. Blank =
                                   fall back to keyword-based auto-latest.
          data-hero-tag-keywords   comma-separated keywords; records
                                   whose <tags> contain ANY keyword
                                   (case-insensitive substring) survive.
                                   Only consulted when data-hero-pinned-url
                                   is blank.
          data-hero-locale         "en" or "fr" (currently informational -
                                   the RBCCM insights feeds are per-locale
                                   so language filtering is implicit in
                                   the URL choice)
          data-hero-link-override  optional CTA href override
     2. Fetch every feed in parallel, parse XML, collect <news> records.
     3. Select record: pinned URL match if provided, else newest by
        keyword filter.
     4. Overwrite the insight card's title / body / date / href in place.
        The XSL pre-rendered the manual SeInsight* Datums as fallback,
        which stays visible if the fetch fails or nothing matched.

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
  var ROOT_SEL = '.rbccm-hero--strategy-and-economics[data-hero-source="auto-latest"]';
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

  function hydrateCard(section, rec, linkOverride) {
    var card = section.querySelector(CARD_SEL);
    if (!card) return;

    var title = decodeEntities(childText(rec, 'title'));
    var desc  = decodeEntities(childText(rec, 'description'));
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

    var feedAttr = section.getAttribute('data-hero-feed-urls') || '';
    var feeds = feedAttr.split(',').map(function (u) { return u.trim(); }).filter(Boolean);
    if (!feeds.length) return;

    var pinned   = section.getAttribute('data-hero-pinned-url') || '';
    var keywords = section.getAttribute('data-hero-tag-keywords') || '';
    var override = section.getAttribute('data-hero-link-override') || '';
    var keepFn   = makeTagFilter(keywords);

    Promise.all(feeds.map(fetchFeed)).then(function (docs) {
      /* Pinned URL takes precedence when set; falls through to
         auto-latest only if the target slug isn't in any feed. */
      var rec = pinned ? pickPinned(docs, pinned) : null;
      if (!rec) rec = pickLatest(docs, keepFn);
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
