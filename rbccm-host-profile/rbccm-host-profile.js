/* =========================================================================
   RBCCM Host Profile - media appearances from the In the Media feed
   Deploy path: /assets/rbccm/js/components/rbccm-host-profile.js
   =========================================================================
   Runs on any .rbccm-host-profile section with data-media-match and
   data-media-feed (set by the skin from MediaFeedMatch and
   MediaFeedUrlTemplate). Reads the per-year In the Media feed, newest
   year first, keeps items whose title contains the match text
   (e.g. "RBC TV: Valerie Grimba on CNBC"), and replaces the typed
   appearances with the newest data-media-count of them (default 4).

   From each feed item:
     outlet  title after " on "            -> "CNBC"
     source  title before ":"              -> "RBC TV"
     date    <date> as "Mon YYYY"          -> "Oct 2026"
     topic   <description>                 (in the markup; hidden by CSS)
     button  RBC TV -> Watch, RBC Radio -> Listen, otherwise Read
     link    <link>, opens in a new tab

   The typed appearances stay if the feed can't be read or has no
   matches. Up to three years are read (this year and two before) to
   fill the count. Markup matches the skin's appearance template.
   ========================================================================= */
(function () {
  'use strict';

  var BLOCK = 'rbccm-host-profile';
  var MAX_YEARS = 3;
  var MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
    'august', 'september', 'october', 'november', 'december'];
  var MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* "November 3, 2026" -> { y: 2026, m: 10, d: 3 }, or null. */
  function parseDate(s) {
    var m = /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/.exec(s || '');
    if (!m) return null;
    var mi = MONTHS.indexOf(m[1].toLowerCase());
    if (mi < 0) return null;
    return { y: +m[3], m: mi, d: +m[2] };
  }

  function text(node, tag) {
    var el = node.getElementsByTagName(tag)[0];
    return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function safeLink(url) {
    return /^(https?:)?\/\//i.test(url) || url.charAt(0) === '/' ? url : '';
  }

  function action(source) {
    if (/\b(tv|video)\b/i.test(source)) return 'Watch';
    if (/\b(radio|podcast|audio)\b/i.test(source)) return 'Listen';
    return 'Read';
  }

  /* One feed <news> node -> appearance data, or null if it isn't a match. */
  function toItem(node, matchLower) {
    var title = text(node, 'title');
    if (!title || title.toLowerCase().indexOf(matchLower) < 0) return null;
    var link = safeLink(text(node, 'link'));
    var date = parseDate(text(node, 'date'));
    if (!link || !date) return null;

    var colon = title.indexOf(':');
    var source = colon > -1 ? title.slice(0, colon).trim() : '';
    var rest = colon > -1 ? title.slice(colon + 1).trim() : title;
    var on = rest.toLowerCase().lastIndexOf(' on ');
    var outlet = on > -1 ? rest.slice(on + 4).trim() : rest;

    return {
      outlet: outlet,
      source: source,
      topic: text(node, 'description'),
      date: MONTH_SHORT[date.m] + ' ' + date.y,
      sortKey: date.y * 10000 + date.m * 100 + date.d,
      link: link,
      action: action(source)
    };
  }

  function fetchYear(template, year) {
    var url = template.replace('{year}', year);
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (xml) {
        if (!xml) return [];
        var doc = new DOMParser().parseFromString(xml, 'text/xml');
        if (doc.getElementsByTagName('parsererror').length) return [];
        return Array.prototype.slice.call(doc.getElementsByTagName('news'));
      })
      .catch(function () { return []; });
  }

  /* Element with the block class and the section's variant modifier. */
  function el(tag, elem, variant, txt) {
    var node = document.createElement(tag);
    var base = BLOCK + '__' + elem;
    node.className = variant ? base + ' ' + base + '--' + variant : base;
    if (txt != null) node.textContent = txt;
    return node;
  }

  function buildCard(item, variant) {
    var li = el('li', 'appearance', variant);
    var textWrap = el('div', 'appearance-text', variant);
    textWrap.appendChild(el('p', 'appearance-outlet', variant, item.outlet));

    var meta = el('p', 'appearance-meta', variant);
    meta.appendChild(el('span', 'appearance-date', variant, item.date));
    if (item.source) meta.appendChild(el('span', 'appearance-source', variant, item.source));
    if (item.topic) meta.appendChild(el('span', 'appearance-topic', variant, item.topic));
    textWrap.appendChild(meta);
    li.appendChild(textWrap);

    var a = el('a', 'appearance-link', variant, item.action);
    a.href = item.link;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', item.action + ': ' + item.outlet + ', ' + item.date + ' (opens in a new tab)');
    li.appendChild(a);
    return li;
  }

  function init(section) {
    var template = section.getAttribute('data-media-feed') || '';
    var match = (section.getAttribute('data-media-match') || '').trim();
    if (!template || !match || template.indexOf('{year}') < 0) return;
    var count = parseInt(section.getAttribute('data-media-count'), 10) || 4;
    var list = section.querySelector('.' + BLOCK + '__appearance-list');
    var wrap = section.querySelector('.' + BLOCK + '__appearances');
    if (!list || !wrap) return;

    var variant = '';
    section.className.split(/\s+/).forEach(function (c) {
      if (c.indexOf(BLOCK + '--') === 0) variant = c.slice(BLOCK.length + 2);
    });

    var matchLower = match.toLowerCase();
    var items = [];
    var seen = {};
    var thisYear = new Date().getFullYear();

    function collect(nodes) {
      nodes.forEach(function (node) {
        var item = toItem(node, matchLower);
        if (item && !seen[item.link]) {
          seen[item.link] = true;
          items.push(item);
        }
      });
    }

    function next(year) {
      if (items.length >= count || year <= thisYear - MAX_YEARS) return Promise.resolve();
      return fetchYear(template, year).then(function (nodes) {
        collect(nodes);
        return next(year - 1);
      });
    }

    next(thisYear).then(function () {
      if (!items.length) return; // keep the typed appearances
      items.sort(function (a, b) { return b.sortKey - a.sortKey; });
      var frag = document.createDocumentFragment();
      items.slice(0, count).forEach(function (item) { frag.appendChild(buildCard(item, variant)); });
      list.innerHTML = '';
      list.appendChild(frag);
      list.setAttribute('data-media-source', 'feed');
      wrap.removeAttribute('hidden');
    });
  }

  function start() {
    if (!window.fetch || !window.DOMParser) return;
    var sections = document.querySelectorAll('.' + BLOCK + '[data-media-match][data-media-feed]');
    Array.prototype.forEach.call(sections, init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
