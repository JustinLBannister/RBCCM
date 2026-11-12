/* =========================================================================
   RBCCM Asset Scanner - shared logic
   rbccmScanAssets() runs INSIDE the page being scanned (injected by the
   popup with chrome.scripting.executeScript), so it must be fully
   self-contained: no outside variables or helpers.
   The rest (rows, CSV, matrix) runs in the popup.
   ========================================================================= */

function rbccmScanAssets() {
  var origin = location.origin;
  var perf = {};
  try {
    performance.getEntriesByType('resource').forEach(function (e) {
      perf[e.name] = e;
    });
  } catch (err) { /* no timing data */ }

  function abs(u) {
    try { return new URL(u, location.href).href; } catch (err) { return u; }
  }

  function timing(url) {
    var e = perf[url];
    if (!e) return { transfer: null, decoded: null, ms: null };
    return {
      transfer: e.transferSize || null,
      decoded: e.decodedBodySize || null,
      ms: Math.round(e.duration)
    };
  }

  var assets = [];
  var seen = {};
  var order = 0;

  /* Stylesheets and scripts in the document, in document order. */
  var nodes = document.querySelectorAll(
    'link[rel~="stylesheet"][href], link[rel="preload"][as="style"][href], script, style'
  );
  Array.prototype.forEach.call(nodes, function (n) {
    var tag = n.tagName.toLowerCase();
    if (tag === 'link') {
      var href = abs(n.getAttribute('href'));
      var attrs = [];
      if (n.media && n.media !== 'all') attrs.push('media=' + n.media);
      if (n.rel.indexOf('preload') !== -1) attrs.push('preload');
      if (n.disabled) attrs.push('disabled');
      seen[href] = true;
      assets.push({ order: ++order, type: 'CSS', source: 'link tag', url: href,
        attrs: attrs.join(' '), inlineChars: null, t: timing(href) });
    } else if (tag === 'script' && n.src) {
      var src = abs(n.getAttribute('src'));
      var sa = [];
      if (n.async) sa.push('async');
      if (n.defer) sa.push('defer');
      if (n.type) sa.push('type=' + n.type);
      seen[src] = true;
      assets.push({ order: ++order, type: 'JS', source: 'script tag', url: src,
        attrs: sa.join(' '), inlineChars: null, t: timing(src) });
    } else if (tag === 'script') {
      var st = n.type || 'text/javascript';
      var kind = /ld\+json/.test(st) ? 'JSON-LD' : (/json/.test(st) ? 'JSON' : 'JS');
      assets.push({ order: ++order, type: kind, source: 'inline', url: '',
        attrs: n.type ? 'type=' + n.type : '', inlineChars: (n.textContent || '').length,
        snippet: (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        t: { transfer: null, decoded: null, ms: null } });
    } else if (tag === 'style') {
      assets.push({ order: ++order, type: 'CSS', source: 'inline', url: '',
        attrs: n.media ? 'media=' + n.media : '', inlineChars: (n.textContent || '').length,
        snippet: (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        t: { transfer: null, decoded: null, ms: null } });
    }
  });

  /* CSS / JS the page fetched that isn't a tag in the document now
     (loaded by other scripts, @import, removed after load, etc.). */
  Object.keys(perf).forEach(function (url) {
    if (seen[url]) return;
    var e = perf[url];
    var path = url.split('?')[0].split('#')[0].toLowerCase();
    var isCss = e.initiatorType === 'css' && /\.css$/.test(path) || /\.css$/.test(path);
    var isJs = /\.m?js$/.test(path) || e.initiatorType === 'script';
    if (!isCss && !isJs) return;
    assets.push({ order: ++order, type: isCss ? 'CSS' : 'JS', source: 'loaded later',
      url: url, attrs: 'initiator=' + e.initiatorType, inlineChars: null, t: timing(url) });
  });

  return {
    pageUrl: location.href,
    pageTitle: document.title,
    origin: origin,
    scannedAt: new Date().toISOString(),
    assets: assets
  };
}

/* ---------- Popup side ---------------------------------------------------- */

var RBCCM_CATEGORIES = [
  /* [label, test(urlObject, rawUrl)] - first match wins. */
  ['Test path',          function (u) { return /\/sub\/test\//i.test(u.pathname); }],
  ['Component',          function (u) { return /\/assets\/rbccm\/(css|js)\/components\//i.test(u.pathname); }],
  ['Page bundle',        function (u) { return /\/assets\/rbccm\/(css|js)\/bundles\//i.test(u.pathname); }],
  ['LiveSite platform',  function (u) { return /\/iwov-resources\/|\/iw-cc\/|livesite/i.test(u.pathname); }],
  ['Vendor library',     function (u) { return /jquery|bootstrap|slick|owl\.carousel|animate(\.min)?\.css|font-?awesome|knockout|jsrender|swiper|gsap|lodash/i.test(u.pathname); }],
  ['Site-wide (rbccm)',  function (u) { return /\/assets\/rbccm\//i.test(u.pathname); }]
];

function rbccmCategorize(asset, pageOrigin) {
  if (asset.source === 'inline') return asset.type === 'JSON-LD' ? 'Structured data' : 'Inline';
  var u;
  try { u = new URL(asset.url); } catch (err) { return 'Unknown'; }
  if (u.origin !== pageOrigin) {
    for (var i = 0; i < RBCCM_CATEGORIES.length; i++) {
      if (RBCCM_CATEGORIES[i][0] === 'Vendor library' && RBCCM_CATEGORIES[i][1](u)) return 'Vendor library (3rd-party host)';
    }
    return 'Third party';
  }
  for (var j = 0; j < RBCCM_CATEGORIES.length; j++) {
    if (RBCCM_CATEGORIES[j][1](u)) return RBCCM_CATEGORIES[j][0];
  }
  return 'Other (same site)';
}

function rbccmKb(bytes) {
  return bytes == null ? '' : (Math.round(bytes / 102.4) / 10).toFixed(1);
}

/* One row object per asset - column order is the spreadsheet order. */
function rbccmRows(scan) {
  return scan.assets.map(function (a) {
    var u = null;
    try { u = a.url ? new URL(a.url) : null; } catch (err) { u = null; }
    var path = u ? u.pathname : '';
    var file = path ? path.substring(path.lastIndexOf('/') + 1) : '(inline)';
    var folder = path ? path.substring(0, path.lastIndexOf('/') + 1) : '';
    var version = u ? (u.searchParams.get('v') || u.searchParams.get('ver') || u.searchParams.get('version') || '') : '';
    return {
      'Page': scan.pageUrl,
      'Page title': scan.pageTitle,
      'Scanned': scan.scannedAt.replace('T', ' ').slice(0, 16),
      'Order': a.order,
      'Type': a.type,
      'Source': a.source,
      'Category': rbccmCategorize(a, scan.origin),
      'File': file,
      'Folder': folder,
      'Host': u ? u.host : '',
      'Version (?v=)': version,
      'Transfer KB': rbccmKb(a.t.transfer),
      'Size KB': rbccmKb(a.t.decoded),
      'Inline chars': a.inlineChars == null ? '' : a.inlineChars,
      'Load ms': a.t.ms == null ? '' : a.t.ms,
      'Attributes': a.attrs || '',
      'URL': a.url || a.snippet || ''
    };
  });
}

function rbccmToDelimited(rows, sep) {
  if (!rows.length) return '';
  var cols = Object.keys(rows[0]);
  function cell(v) {
    var s = v == null ? '' : String(v);
    if (sep === '\t') return s.replace(/[\t\r\n]+/g, ' ');
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  var lines = [cols.map(cell).join(sep)];
  rows.forEach(function (r) { lines.push(cols.map(function (c) { return cell(r[c]); }).join(sep)); });
  return lines.join('\r\n');
}

/* Asset-by-page matrix for several scans: one row per external asset
   (URL without its query string), one column per page. A cell shows the
   version loaded on that page (or "yes" when unversioned), blank when
   the page doesn't load it. "Pages" counts how many pages load it -
   e.g. loaded everywhere = site-wide, on one page = page-specific. */
function rbccmMatrix(scans) {
  var pages = scans.map(function (s) { return s.pageUrl; });
  var byKey = {};
  var keys = [];
  scans.forEach(function (s, pi) {
    rbccmRows(s).forEach(function (r) {
      if (r.Source === 'inline') return;
      var key = r.URL.split('?')[0];
      if (!byKey[key]) {
        byKey[key] = { type: r.Type, category: r.Category, file: r.File, cells: {} };
        keys.push(key);
      }
      byKey[key].cells[pi] = r['Version (?v=)'] || 'yes';
    });
  });
  var rows = keys.map(function (k) {
    var e = byKey[k];
    var row = { 'Type': e.type, 'Category': e.category, 'File': e.file,
      'Pages': Object.keys(e.cells).length + ' of ' + pages.length, 'Asset': k };
    pages.forEach(function (p, pi) { row[p] = e.cells[pi] || ''; });
    return row;
  });
  rows.sort(function (a, b) {
    var pa = parseInt(a.Pages, 10), pb = parseInt(b.Pages, 10);
    return pb - pa || a.Type.localeCompare(b.Type) || a.File.localeCompare(b.File);
  });
  return rows;
}
