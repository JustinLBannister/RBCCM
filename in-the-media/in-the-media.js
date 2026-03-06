<script>
(function () {
  'use strict';
  // Prevent double-initialisation if the script is included more than once
  if (window.__brokenLinkCheckerInit) return;
  window.__brokenLinkCheckerInit = true;
  // ── Helpers ────────────────────────────────────────────────────────────────
  function isSameOrigin(href) {
    try { return new URL(href).origin === window.location.origin; }
    catch (e) { return false; }
  }
  function stripAnchor(anchor) {
    var parent = anchor.parentNode;
    if (parent) parent.replaceChild(document.createTextNode(anchor.textContent), anchor);
  }
  // ── Core checker ──────────────────────────────────────────────────────────
  // Iterates every .news-item currently in the DOM and removes anchors that
  // point to broken URLs (hash-only, same-origin 4xx/5xx, or timed-out hosts).
  async function stripBrokenLinks() {
    var items   = document.querySelectorAll('.news-item');
    var stripped = 0, ok = 0;
    for (var i = 0; i < items.length; i++) {
      var anchor  = items[i].querySelector('a[href]');
      if (!anchor) continue;
      var rawHref  = anchor.getAttribute('href') || '';
      var fullHref = anchor.href;
      var broken   = false;
      var reason   = '';
      // 1. Hash-only links go nowhere — strip immediately
      if (!rawHref || rawHref === '#') {
        stripAnchor(anchor);
        stripped++;
        continue;
      }
      // 2. Skip mailto / non-http
      if (rawHref.startsWith('mailto:') || !fullHref.startsWith('http')) continue;
      // 3. Fetch check
      try {
        var opts = isSameOrigin(fullHref)
          ? { method: 'HEAD', signal: AbortSignal.timeout(10000) }            // real status code
          : { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(10000) }; // opaque (cross-origin)
        var res = await fetch(fullHref, opts);
        // For same-origin we get real HTTP status; treat 4xx and 5xx as broken
        if (isSameOrigin(fullHref) && (res.status === 404 || res.status === 410 || res.status >= 500)) {
          broken = true;
          reason = 'HTTP ' + res.status;
        }
        // Cross-origin: opaque response (status 0) means the server is alive —
        // we can't read the actual status code, so we leave those anchors intact.
      } catch (e) {
        // Timeout or DNS/connection failure = genuinely unreachable host
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
    console.log('[BrokenLinkChecker] done — stripped: ' + stripped + ', ok: ' + ok);
  }
  // ── Auto-run hooks ────────────────────────────────────────────────────────
  $(document).ready(function () {
    // Hook 1: Run after every $.get("data/YYYY.page") completes.
    // ajaxComplete fires after the success callback finishes, so the
    // .each() + .append() loop in news.js has already written the DOM.
    $(document).ajaxComplete(function (event, xhr, settings) {
      if (settings && settings.url && /data\\/\\d{4}\\.page/.test(settings.url)) {
        // Small buffer in case jQuery batches final appends asynchronously
        setTimeout(stripBrokenLinks, 150);
      }
    });
    // Hook 2: Also run immediately for items already in the DOM at script-load
    // time (e.g. if news.js fired before this script was parsed).
    if (document.querySelectorAll('.news-item').length > 0) {
      stripBrokenLinks();
    }
    console.log('[BrokenLinkChecker] initialised');
  });
}());
</script>