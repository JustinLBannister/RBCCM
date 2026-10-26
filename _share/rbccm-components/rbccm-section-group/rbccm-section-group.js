/* =========================================================================
   RBCCM Section Group - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-section-group.js

   Wraps every section between a "Group start" and a "Group end" marker
   component in one div, so a shared background (e.g. the MAAS+MATA
   dark-strip gradient) runs continuously behind them, exactly as if
   they'd been authored inside a wrapper. Needed because the page
   builder places components one by one and can't nest them.

   Markers (output by the two skins, hidden):
     <span class="rbccm-section-group__marker" hidden
           data-group-start="dark-strip"
           data-group-class="rbccm-section-group rbccm-maas-mata__dark-strip"
           data-group-style="--rbccm-sg-pad-top: 222px;"></span>
     ... any number of sections / TeamSite components ...
     <span class="rbccm-section-group__marker" hidden
           data-group-end="dark-strip"></span>
     (then the script tag that loads this file)

   How it wraps: finds the closest element that contains both markers,
   takes its children from the one holding the start marker to the one
   holding the end marker (inclusive), and moves them into the new
   wrapper div, in order. Works whether TeamSite puts each component in
   its own .iw_component div or nests them in layout rows.

   Timing: the end skin loads this script right after its marker, so it
   runs while the page is still being parsed, before DOMContentLoaded.
   The wrapper therefore exists before carousels / animations set up and
   before first paint in most browsers (no flash, nothing re-measures).
   It runs again on DOMContentLoaded to catch anything missed. Each
   start/end pair is wrapped once; start and end match by group name.
   ========================================================================= */
(function () {
  'use strict';

  function commonAncestor(a, b) {
    var seen = [];
    for (var n = a; n; n = n.parentNode) seen.push(n);
    for (var m = b; m; m = m.parentNode) if (seen.indexOf(m) !== -1) return m;
    return null;
  }

  /* Child of `root` that contains `node` (or is it). */
  function childOf(root, node) {
    var n = node;
    while (n && n.parentNode !== root) n = n.parentNode;
    return n;
  }

  function wrapPair(start, end) {
    var root = commonAncestor(start.parentNode, end.parentNode);
    if (!root) return;
    var first = childOf(root, start);
    var last  = childOf(root, end);
    if (!first || !last) return;
    /* End must come after start in the document. */
    if (first !== last &&
        !(first.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING)) return;

    var wrap = document.createElement('div');
    wrap.className = start.getAttribute('data-group-class') || 'rbccm-section-group';
    var style = start.getAttribute('data-group-style');
    if (style) wrap.setAttribute('style', style);
    var label = start.getAttribute('data-group-label');
    if (label) wrap.setAttribute('aria-label', label);
    wrap.setAttribute('data-rbccm-section-group', start.getAttribute('data-group-start') || '');

    root.insertBefore(wrap, first);
    var n = first, next;
    while (n) {
      next = n.nextSibling;
      wrap.appendChild(n);
      if (n === last) break;
      n = next;
    }
  }

  function run() {
    var starts = document.querySelectorAll('[data-group-start]:not([data-rbccm-sg-done])');
    Array.prototype.forEach.call(starts, function (start) {
      var name = start.getAttribute('data-group-start');
      /* First unmatched end with the same name after this start. */
      var ends = document.querySelectorAll('[data-group-end]:not([data-rbccm-sg-done])');
      for (var i = 0; i < ends.length; i++) {
        var end = ends[i];
        if (end.getAttribute('data-group-end') !== name) continue;
        if (!(start.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
        start.setAttribute('data-rbccm-sg-done', '1');
        end.setAttribute('data-rbccm-sg-done', '1');
        wrapPair(start, end);
        break;
      }
    });
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
}());
