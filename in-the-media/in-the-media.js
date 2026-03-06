(function () {
  'use strict';
  if (window.__brokenLinkCheckerInit) return;
  window.__brokenLinkCheckerInit = true;
  function isSameOrigin(href) {
    try { return new URL(href).origin === window.location.origin; }
    catch (e) { return false; }
  }
  function stripAnchor(anchor) {
    var parent = anchor.parentNode;
    if (parent) parent.replaceChild(document.createTextNode(anchor.textContent), anchor);
  }
  async function stripBrokenLinks() {
    var items = document.querySelectorAll('.news-item');
    var stripped = 0, ok = 0;
    for (var i = 0; i < items.length; i++) {
      var anchor = items[i].querySelector('a[href]');
      if (!anchor) continue;
      var rawHref = anchor.getAttribute('href') || '';
      var fullHref = anchor.href;
      var broken = false;
      var reason = '';
      if (!rawHref || rawHref === '#') {
        stripAnchor(anchor);
        stripped++;
        continue;
      }
      if (rawHref.startsWith('mailto:') || !fullHref.startsWith('http')) continue;
      try {
        var opts = isSameOrigin(fullHref)
          ? { method: 'HEAD', signal: AbortSignal.timeout(10000) }
          : { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(10000) };
        var res = await fetch(fullHref, opts);
        if (isSameOrigin(fullHref) && (res.status === 404 || res.status === 410 || res.status >= 500)) {
          broken = true;
          reason = 'HTTP ' + res.status;
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          broken = true; reason = 'timeout';
        } else if (e.message && e.message.indexOf('Failed to fetch') !== -1) {
          broken = true; reason = 'network error';
        }
      }
      if (broken) {
        stripAnchor(anchor);
        stripped++;
        console.log('[BrokenLinkChecker] stripped "' + fullHref + '" (' + reason + ')');
      } else {
        ok++;
      }
    }
    console.log('[BrokenLinkChecker] done - stripped: ' + stripped + ', ok: ' + ok);
  }
  $(document).ready(function () {
    $(document).ajaxComplete(function (event, xhr, settings) {
      if (settings && settings.url && settings.url.indexOf('.page') !== -1) {
        setTimeout(stripBrokenLinks, 150);
      }
    });
    if (document.querySelectorAll('.news-item').length > 0) {
      stripBrokenLinks();
    }
    console.log('[BrokenLinkChecker] initialised');
  });
}());