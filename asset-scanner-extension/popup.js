/* RBCCM Asset Scanner - popup. Needs lib.js loaded first. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var current = null;                 /* latest scan of the active tab */
  var STORE_KEY = 'rbccmAssetScans';  /* pages collected for comparison */

  function setStatus(msg) { $('status').textContent = msg || ''; }

  function stamp() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function slug(url) {
    try {
      var u = new URL(url);
      return (u.host + u.pathname).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'page';
    } catch (err) { return 'page'; }
  }

  function download(name, text) {
    /* BOM so Excel reads UTF-8 correctly. */
    var blob = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function getStore(cb) {
    chrome.storage.local.get(STORE_KEY, function (o) { cb(o[STORE_KEY] || []); });
  }
  function setStore(list, cb) {
    var o = {}; o[STORE_KEY] = list;
    chrome.storage.local.set(o, cb);
  }

  function renderCollected() {
    getStore(function (list) {
      var ul = $('collected');
      ul.innerHTML = '';
      list.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s.pageUrl + '  (' + s.assets.length + ' assets)';
        li.title = s.pageUrl;
        ul.appendChild(li);
      });
      $('matrix').disabled = list.length < 1;
      $('all').disabled = list.length < 1;
      $('clear').disabled = list.length < 1;
    });
  }

  function renderScan(scan) {
    var rows = rbccmRows(scan);
    var css = rows.filter(function (r) { return r.Type === 'CSS' && r.Source !== 'inline'; });
    var js = rows.filter(function (r) { return r.Type === 'JS' && r.Source !== 'inline'; });
    var inline = rows.filter(function (r) { return r.Source === 'inline'; });
    var third = rows.filter(function (r) { return /third|3rd/i.test(r.Category); });
    var kb = rows.reduce(function (t, r) { return t + (parseFloat(r['Transfer KB']) || 0); }, 0);

    $('summary').hidden = false;
    $('summary').innerHTML =
      '<span><b>' + css.length + '</b> CSS files</span>' +
      '<span><b>' + js.length + '</b> JS files</span>' +
      '<span><b>' + inline.length + '</b> inline blocks</span>' +
      '<span><b>' + third.length + '</b> third-party</span>' +
      '<span><b>' + Math.round(kb) + ' KB</b> transferred</span>';

    var tbody = $('table').querySelector('tbody');
    tbody.innerHTML = '';
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      [r.Order, r.Type, r.Category, r.File === '(inline)' ? '(inline) ' + r.URL.slice(0, 40) : r.File,
       r['Version (?v=)'], r['Transfer KB']].forEach(function (v, i) {
        var td = document.createElement('td');
        td.textContent = v;
        if (i === 3) td.className = 'file';
        if (i === 0 || i === 5) td.className = 'num';
        if (i === 3 && r.URL) td.title = r.URL;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    $('table').hidden = false;
    ['csv', 'copy', 'add'].forEach(function (id) { $(id).disabled = false; });
  }

  $('scan').addEventListener('click', function () {
    setStatus('Scanning...');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs && tabs[0];
      if (!tab) { setStatus('No active tab.'); return; }
      $('page').textContent = tab.url;
      chrome.scripting.executeScript({ target: { tabId: tab.id }, func: rbccmScanAssets }, function (res) {
        if (chrome.runtime.lastError || !res || !res[0]) {
          setStatus("Can't scan this page (" + ((chrome.runtime.lastError && chrome.runtime.lastError.message) || 'no result') + '). Chrome pages and the Web Store are blocked.');
          return;
        }
        current = res[0].result;
        renderScan(current);
        setStatus('Scanned ' + current.assets.length + ' assets.');
      });
    });
  });

  $('csv').addEventListener('click', function () {
    if (!current) return;
    download('assets-' + slug(current.pageUrl) + '-' + stamp() + '.csv', rbccmToDelimited(rbccmRows(current), ','));
  });

  $('copy').addEventListener('click', function () {
    if (!current) return;
    navigator.clipboard.writeText(rbccmToDelimited(rbccmRows(current), '\t')).then(function () {
      setStatus('Copied. Paste into the first cell of a sheet.');
    }, function () { setStatus("Couldn't copy. Use Download CSV instead."); });
  });

  $('add').addEventListener('click', function () {
    if (!current) return;
    getStore(function (list) {
      list = list.filter(function (s) { return s.pageUrl !== current.pageUrl; });
      list.push(current);
      setStore(list, function () {
        setStatus('Added. ' + list.length + ' page' + (list.length === 1 ? '' : 's') + ' collected.');
        renderCollected();
      });
    });
  });

  $('matrix').addEventListener('click', function () {
    getStore(function (list) {
      if (!list.length) return;
      download('asset-comparison-' + list.length + '-pages-' + stamp() + '.csv', rbccmToDelimited(rbccmMatrix(list), ','));
    });
  });

  $('all').addEventListener('click', function () {
    getStore(function (list) {
      if (!list.length) return;
      var rows = [];
      list.forEach(function (s) { rows = rows.concat(rbccmRows(s)); });
      download('assets-all-pages-' + stamp() + '.csv', rbccmToDelimited(rows, ','));
    });
  });

  $('clear').addEventListener('click', function () {
    setStore([], function () { setStatus('Cleared collected pages.'); renderCollected(); });
  });

  renderCollected();
})();
