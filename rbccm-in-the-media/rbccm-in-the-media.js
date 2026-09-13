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
  var DEFAULT_FEED_URL = '/en/press-releases/data/press-releases.page';
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
