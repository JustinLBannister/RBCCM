/* =========================================================================
   Case Studies Carousel - feed loader + accessible-slick init (v2)
   =========================================================================
   Two-phase startup:
     1. Feed loader: on DOMContentLoaded, for every .rbccm-case-studies
        root that contains URL shells, fetch its data-feed-url once,
        parse it, and hydrate each shell with the tile markup for the
        matching case-study record (matched by slug).
     2. Slick init: after hydration completes (or a 3s safety timeout),
        bind accessible-slick to each track. Shells with no matching
        feed record are removed first so slick never sees an empty
        slide - carousel silently self-heals when a case study is
        unpublished or renamed.

   ---- Config (data attributes on .rbccm-case-studies) --------------------
     data-feed-url         Feed URL to fetch (required for hydration).
                           Set by the XSL from the FeedUrl Datum.
     data-region-label     accessible-slick regionLabel override.
     data-instructions     accessible-slick instructionsText override.
     data-transition       'slide' (default) or 'fade'.
     data-speed            ms transition speed (default 350).

   ---- Multi-instance -----------------------------------------------------
   All queries are scoped to each .rbccm-case-studies root. A BOUND_FLAG
   on each root prevents double-init. Consumers can call
   window.RBCCMCaseStudiesCarousel.init(ctx) to rebind newly-added roots
   (feed scripts, TeamSite preview re-render, etc.).

   Deploy at: /assets/rbccm/js/components/case-studies-carousel.js
   ========================================================================= */
(function () {
  'use strict';

  var BOUND_FLAG = 'data-case-studies-carousel-bound';
  var HYDRATED_EVENT = 'rbccm-case-studies:hydrated';

  /* ---------- accessible-slick loader --------------------------------- */
  /* Load accessible-slick from the local rbccm.com asset. If it fails
     to load, the carousel silently no-ops (jQuery.fn.slick stays
     undefined and initSlick bails). */
  function ensureSlickLoaded(cb) {
    if (typeof window.jQuery === 'undefined') return;
    if (typeof window.jQuery.fn.slick !== 'undefined') { cb(); return; }
    var s = document.createElement('script');
    s.src = '/assets/rbccm/js/accessible-slick.min.js';
    s.onload = function () { cb(); };
    document.head.appendChild(s);
  }

  /* ---------- Small helpers ------------------------------------------- */
  function attrOr(root, name, fallback) {
    var v = root.getAttribute(name);
    return (v && v.length) ? v : fallback;
  }
  function intAttr(root, name, fallback) {
    var n = parseInt(root.getAttribute(name), 10);
    return (!n || n < 1) ? fallback : n;
  }
  function extractSlug(url) {
    var m = String(url || '').match(/\/case-study\/(.+?)(?:[?#]|$)/);
    return m ? m[1] : null;
  }
  function childText(parent, tag) {
    if (!parent) return '';
    var el = parent.getElementsByTagName(tag)[0];
    return el ? (el.textContent || '').trim() : '';
  }
  /* Decode HTML entities via a throwaway textarea (native decoder). */
  var _decodeEl = document.createElement('textarea');
  function decodeEntities(text) {
    _decodeEl.innerHTML = text || '';
    return _decodeEl.value;
  }
  function escapeAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function fireHydrated() {
    try {
      document.dispatchEvent(new CustomEvent(HYDRATED_EVENT));
    } catch (e) {
      var ev = document.createEvent('Event');
      ev.initEvent(HYDRATED_EVENT, true, true);
      document.dispatchEvent(ev);
    }
  }

  /* ---------- Feed parsing -------------------------------------------- */
  /* Description sanitizer.
     Descriptions in the feed may carry authored HTML - <br>, <strong>,
     <sup>, <em>, etc. - which we WANT to render. But two patterns
     break the card:
       1. Nested <a> tags. The whole card is wrapped in <a class="__card">.
          Browsers don't allow <a> inside <a> and will close the outer
          one prematurely, splitting the card into fragments (Kroger
          tile shows this - CTA link at the end fragments the layout).
       2. Literal "\n" sequences (backslash-n as text, not real
          newlines). Some records were authored with escape sequences
          rather than actual newlines; they render as visible junk.
       3. TinyMCE bogus BR (<br data-mce-bogus="1">). Placeholder
          markup that should never make it to output. */
  function sanitizeDescription(html) {
    if (!html) return '';
    return String(html)
      /* Unwrap nested anchors: keep the inner text/HTML, drop the <a>. */
      .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      /* Drop TinyMCE bogus BRs. */
      .replace(/<br[^>]*data-mce-bogus[^>]*>/gi, '')
      /* Collapse literal "\n" escape sequences to a space. */
      .replace(/\\n/g, ' ')
      /* Squash the whitespace runs that the previous replacement
         can leave behind. */
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /* Build a slug -> record lookup from the parsed feed XML.
     First record for a given slug wins (feed is sorted newest-first
     so the most recent version of any accidentally duplicated case
     study is what gets shown). */
  function buildLookup(xmlDoc) {
    var map = {};
    var records = xmlDoc.getElementsByTagName('caseStudy');
    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      var slug = childText(rec, 'slug');
      if (!slug || map[slug]) continue;
      map[slug] = {
        slug:        slug,
        title:       decodeEntities(childText(rec, 'title')),
        /* Description kept as HTML (br / strong / sup preserved) but
           run through sanitizeDescription to strip patterns that
           break the card layout - see sanitizeDescription above. */
        description: sanitizeDescription(childText(rec, 'description')),
        thumbnail:   childText(rec, 'thumbnail'),
        eyebrow:     childText(rec, 'eyebrow') || 'Case Study',
        link:        childText(rec, 'link'),
        readtime:    childText(rec, 'readtime')
      };
    }
    return map;
  }

  /* ---------- Slide HTML builder -------------------------------------- */
  var CTA_CHEVRON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true">' +
      '<path d="M2 0L1 1l3 4-3 4 1 1 4-5z"/>' +
    '</svg>';

  function buildSlideHTML(record, overrides) {
    var eyebrow  = overrides.eyebrow  || record.eyebrow;
    var readtime = overrides.readtime || record.readtime;
    /* Some feed records already include the word "read" (e.g. "3 min read"),
       others don't ("3 min"). Only append " read" when it's missing. */
    var ctaText  = readtime
      ? (readtime.toLowerCase().indexOf('read') !== -1 ? readtime : readtime + ' read')
      : '';
    var cta = ctaText
      ? '<span class="rbccm-case-studies__cta">' + escapeAttr(ctaText) + ' ' + CTA_CHEVRON + '</span>'
      : '';

    return (
      '<a class="rbccm-case-studies__card" href="' + escapeAttr(record.link) + '">' +
        '<div class="rbccm-case-studies__media">' +
          '<img loading="lazy" src="' + escapeAttr(record.thumbnail) + '" alt="" />' +
        '</div>' +
        '<div class="rbccm-case-studies__body">' +
          '<p class="rbccm-case-studies__eyebrow">' + escapeAttr(eyebrow) + '</p>' +
          '<div class="rbccm-case-studies__divider" aria-hidden="true"></div>' +
          '<h3 class="rbccm-case-studies__title">' + escapeAttr(record.title) + '</h3>' +
          '<p class="rbccm-case-studies__desc">' + record.description + '</p>' +
          cta +
        '</div>' +
      '</a>'
    );
  }

  /* ---------- Hydrate a single root's shells -------------------------- */
  function hydrateRoot(root, lookup) {
    var track = root.querySelector('.rbccm-case-studies__track');
    if (!track) return;
    var shells = track.querySelectorAll('.rbccm-case-studies__slide[data-cs-url]');
    for (var i = 0; i < shells.length; i++) {
      var shell = shells[i];
      var url  = shell.getAttribute('data-cs-url');
      var slug = extractSlug(url);
      var rec  = slug && lookup[slug];
      if (!rec) {
        /* Missing / renamed / unpublished - drop the shell so slick
           doesn't see an empty slide. Self-healing carousel. */
        shell.parentNode.removeChild(shell);
        continue;
      }
      shell.innerHTML = buildSlideHTML(rec, {
        eyebrow:  shell.getAttribute('data-cs-eyebrow')  || '',
        readtime: shell.getAttribute('data-cs-readtime') || ''
      });
    }
  }

  /* Drop unhydrated shells (called when feed fetch fails). */
  function dropEmpties(root) {
    var track = root.querySelector('.rbccm-case-studies__track');
    if (!track) return;
    var empties = track.querySelectorAll('.rbccm-case-studies__slide[data-cs-url]:empty');
    for (var i = 0; i < empties.length; i++) empties[i].parentNode.removeChild(empties[i]);
  }

  /* ---------- Feed cache (multiple carousels share fetches) ---------- */
  var _feedCache = {};
  function loadFeed(url) {
    if (_feedCache[url]) return _feedCache[url];
    _feedCache[url] = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Feed HTTP ' + r.status);
        return r.text();
      })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        var err = doc.querySelector('parsererror');
        if (err) throw new Error('Feed XML parse error');
        return buildLookup(doc);
      });
    return _feedCache[url];
  }

  /* ---------- Hydration entry point ----------------------------------- */
  function hydrateAll(cb) {
    var roots = document.querySelectorAll('.rbccm-case-studies');
    if (!roots.length) { cb(); return; }

    /* Group roots by feed URL so we only fetch each feed once even
       when multiple carousels on the same page share a feed. */
    var byFeed = {};
    var noFeed = [];
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      var hasShells = root.querySelector('.rbccm-case-studies__slide[data-cs-url]');
      if (!hasShells) { noFeed.push(root); continue; }
      var feedUrl = attrOr(root, 'data-feed-url', '/en/expertise/transactions/data/case-studies.page');
      (byFeed[feedUrl] = byFeed[feedUrl] || []).push(root);
    }

    var pending = Object.keys(byFeed).length;
    if (!pending) { cb(); return; }

    Object.keys(byFeed).forEach(function (feedUrl) {
      loadFeed(feedUrl)
        .then(function (lookup) {
          byFeed[feedUrl].forEach(function (root) { hydrateRoot(root, lookup); });
        })
        .catch(function (e) {
          /* eslint-disable no-console */
          if (window.console && console.error) {
            console.error('[case-studies-carousel] Feed load failed:', feedUrl, e);
          }
          byFeed[feedUrl].forEach(dropEmpties);
        })
        .then(function () {
          if (--pending === 0) cb();
        });
    });
  }

  /* ---------- Slick init ---------------------------------------------- */
  function initSlick(root) {
    var $ = window.jQuery;
    if (root.getAttribute(BOUND_FLAG) === 'true') return;

    var $root  = $(root);
    var $track = $root.find('.rbccm-case-studies__track');
    var $prev  = $root.find('.rbccm-case-studies__btn--prev');
    var $next  = $root.find('.rbccm-case-studies__btn--next');
    var $dots  = $root.find('.rbccm-case-studies__dots-wrap');

    if (!$track.length || !$track.children().length) return;
    if ($track.hasClass('slick-initialized')) return;
    root.setAttribute(BOUND_FLAG, 'true');

    var cfgSpeed = intAttr(root, 'data-speed', 350);
    var $heading = $root.find('.rbccm-case-studies__heading').first();
    var headingText = $heading.length ? $.trim($heading.text()) : '';
    var regionLabel = attrOr(root, 'data-region-label', headingText || 'carousel');
    var instructionsText = attrOr(root, 'data-instructions', '');
    var transition = attrOr(root, 'data-transition', 'slide');

    var opts = {
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: true,
      speed: cfgSpeed,
      adaptiveHeight: false,
      prevArrow: $prev,
      nextArrow: $next,
      appendDots: $dots,
      regionLabel: regionLabel
    };
    if (transition === 'fade') opts.fade = true;
    if (instructionsText) opts.instructionsText = instructionsText;

    $track.slick(opts);
  }

  function initAllSlick(ctx) {
    var scope = (ctx && ctx.querySelectorAll) ? ctx : document;
    var roots = scope.querySelectorAll('.rbccm-case-studies');
    for (var i = 0; i < roots.length; i++) initSlick(roots[i]);
  }

  /* ---------- Bootstrap ------------------------------------------------ */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    hydrateAll(function () {
      fireHydrated();
      ensureSlickLoaded(function () { initAllSlick(); });
    });
  });

  /* Public API - lets consumers rebind newly-injected markup, or
     re-run hydration after a feed refresh (e.g. TeamSite preview). */
  window.RBCCMCaseStudiesCarousel = {
    init: initAllSlick,
    hydrate: function (cb) { hydrateAll(cb || function () {}); }
  };
})();
