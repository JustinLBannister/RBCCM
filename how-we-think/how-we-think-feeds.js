/* ============================================================
   RBC CM - How We Think - feed hydration
   ============================================================
   Runs alongside how-we-think.js (which owns tab-switching).
   This file handles data fetches for the Insights and Newsroom
   tabs only. Conferences tab is server-rendered by the XSL.

     Insights - URL shells (data-hwt-url) matched to records in
                the 2024 / 2025 / 2026 insights feeds by slug.
                Same pattern as case-studies-carousel.

     Newsroom - Empty shell (data-hwt-newsroom). Fetches the URL
                from the section root's data-newsroom-feed attr
                (default /en/insights/data/all), takes the top
                N items (data-newsroom-max, default 3), renders
                date + title link + description.

   Both fetches run on load whether or not the user visits the
   tab, so a tab click is instant once populated. Fetch failures
   fall back to empty state (loading placeholders removed).

   Deploy at: /assets/rbccm/js/sub/test/how-we-think-feeds.js
   ============================================================ */
(function () {
  var section = document.getElementById('rbccm-how-we-think');
  if (!section) return;

  /* ---------- Helpers ---------------------------------------- */
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
  function attrOr(el, name, fallback) {
    var v = el.getAttribute(name);
    return (v && v.length) ? v : fallback;
  }


  /* ---------- Insights hydration ----------------------------- */
  /* Extract the slug segment from an insight URL. Insight feeds
     use the article's link as the identifier, so we match on
     the last non-empty path segment (handles /en/insights/story/
     <slug> as well as /en/insights/<slug> and querystring links). */
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
        var it   = items[i];
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
      '<div class="rbccm-how-we-think__tile-img">' +
        (rec.thumbnail ? '<img loading="lazy" src="' + escapeAttr(rec.thumbnail) + '" alt="" />' : '') +
      '</div>' +
      '<div class="rbccm-how-we-think__tile-body">' +
        '<p class="rbccm-how-we-think__tile-eyebrow">' + escapeAttr(eyebrow) + '</p>' +
        '<div class="rbccm-how-we-think__tile-divider" aria-hidden="true"></div>' +
        '<h3 class="rbccm-how-we-think__tile-title">' + escapeAttr(rec.title) + '</h3>' +
        '<p class="rbccm-how-we-think__tile-copy">' + escapeAttr(rec.description) + '</p>' +
        (cta ? '<span class="rbccm-how-we-think__tile-cta">' + escapeAttr(cta) + '</span>' : '') +
      '</div>';
  }

  var INSIGHTS_FEEDS = [
    '/en/insights/data/2024-insights',
    '/en/insights/data/2025-insights',
    '/en/insights/data/2026-insights'
  ];

  function loadInsights() {
    var tiles = section.querySelectorAll('.rbccm-how-we-think__tile[data-hwt-url]');
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


  /* ---------- Newsroom hydration ----------------------------- */
  function newsDateSort(a, b) {
    return (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0);
  }

  function loadNewsroom() {
    var container = section.querySelector('[data-hwt-newsroom]');
    if (!container) return;
    var feedUrl = attrOr(section, 'data-newsroom-feed', '/en/insights/data/all');
    var maxItems = parseInt(attrOr(section, 'data-newsroom-max', '3'), 10) || 3;

    fetch(feedUrl)
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (xml) {
        if (!xml) throw new Error('empty');
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        var items = Array.prototype.slice.call(doc.getElementsByTagName('news'));
        var parsed = items.map(function (it) {
          return {
            date:        childText(it, 'date'),
            link:        childText(it, 'link'),
            title:       decodeEntities(childText(it, 'title')),
            description: decodeEntities(childText(it, 'description'))
          };
        }).filter(function (n) { return n.title && n.link; })
          .sort(newsDateSort)
          .slice(0, maxItems);
        if (!parsed.length) throw new Error('no items');
        container.innerHTML = parsed.map(function (n) {
          return '<div class="rbccm-how-we-think__news-item">' +
              '<span class="rbccm-how-we-think__news-date">' + escapeAttr(n.date) + '</span>' +
              '<a class="rbccm-how-we-think__news-link" href="' + escapeAttr(n.link) + '" target="_blank" rel="noopener">' + escapeAttr(n.title) + '</a>' +
              '<p class="rbccm-how-we-think__news-summary">' + escapeAttr(n.description) + '</p>' +
            '</div>';
        }).join('');
      })
      .catch(function () {
        container.innerHTML = '';
      });
  }


  /* ---------- Bootstrap -------------------------------------- */
  if (document.readyState !== 'loading') {
    loadInsights();
    loadNewsroom();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      loadInsights();
      loadNewsroom();
    });
  }
})();
