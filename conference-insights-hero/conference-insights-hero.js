/* =========================================================================
   Conference Insights Hero
   -------------------------------------------------------------------------
   Vanilla JS, no jQuery. Self-contained IIFE. Safe to load before or after
   DOMContentLoaded. Idempotent.
   ========================================================================= */

(function () {
  'use strict';

  var ROOT_ID = 'rbccm-conference-insights-hero';

  function init() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (root.getAttribute('data-cih-bound') === 'true') return;
    root.setAttribute('data-cih-bound', 'true');

    // TODO: behavior
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
