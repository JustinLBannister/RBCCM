/* =========================================================================
   Conference Insights Tiles
   -------------------------------------------------------------------------
   Vanilla JS, no jQuery. Self-contained IIFE. Idempotent (won't double-bind
   if the component renders twice on a page).

   Behavior:
   - Finds every row marked with data-load-more="true"
   - On See More click, reveals chunkSize hidden cards
   - When the last hidden card is revealed:
       - Hides the See More button
       - Un-hides the View All link IF it was hidden by load-more gating
         (data-view-all-gated="true"). If View All is shown unconditionally
         (ShowAfterLoadAlways=true in XSL), it was never hidden and we
         leave it alone.
   ========================================================================= */

(function () {
  'use strict';

  function bindRow(row) {
    if (row.getAttribute('data-load-more-bound') === 'true') return;
    row.setAttribute('data-load-more-bound', 'true');

    var controls  = row.parentNode.querySelector('.rbccm-conference-insights-tiles__controls');
    if (!controls) return;

    var seeMore   = controls.querySelector('.rbccm-conference-insights-tiles__see-more');
    var viewAll   = controls.querySelector('.rbccm-conference-insights-tiles__view-all');
    if (!seeMore) return;

    var chunkSize = parseInt(row.getAttribute('data-load-more-chunk'), 10);

    seeMore.addEventListener('click', function (e) {
      e.preventDefault();

      var hidden   = row.querySelectorAll('[data-hidden-by-loadmore]');
      var toReveal = (chunkSize > 0) ? Math.min(chunkSize, hidden.length) : hidden.length;

      for (var i = 0; i < toReveal; i++) {
        hidden[i].removeAttribute('hidden');
        hidden[i].removeAttribute('data-hidden-by-loadmore');
      }

      var stillHidden = row.querySelectorAll('[data-hidden-by-loadmore]');
      if (stillHidden.length === 0) {
        seeMore.setAttribute('hidden', 'hidden');
        seeMore.style.display = 'none';

        if (viewAll && viewAll.getAttribute('data-view-all-gated') === 'true') {
          viewAll.removeAttribute('hidden');
          viewAll.removeAttribute('data-view-all-gated');
          viewAll.style.display = '';
        }
      }
    });
  }

  function init() {
    var rows = document.querySelectorAll('.rbccm-conference-insights-tiles__row[data-load-more]');
    for (var i = 0; i < rows.length; i++) {
      bindRow(rows[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


