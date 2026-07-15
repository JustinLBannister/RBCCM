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


/* =========================================================================
   TEMPORARY: Typography spec preview toggle
   -------------------------------------------------------------------------
   Injects a floating pill-button in the bottom-right corner of the page
   that flips the .rbccm-conference-insights-tiles--spec-legacy modifier
   on every tile section on the page. Lets stakeholders preview the
   Figma spec vs the current live-site typography in real time without
   needing a code push between views.

   Self-contained IIFE. Idempotent (won't inject twice if init runs again).
   Persists the last-chosen spec in localStorage so a reload keeps state
   for the current viewer only.

   REMOVE THIS ENTIRE BLOCK (and the .--spec-legacy CSS rules) once the
   spec is finalized. One delete = full cleanup.
   ========================================================================= */
(function () {
  'use strict';

  var MODIFIER   = 'rbccm-conference-insights-tiles--spec-legacy';
  var BUTTON_ID  = 'rbccm-tiles-spec-toggle';
  var STORAGE_KEY = 'rbccm-tiles-spec-preview';

  function currentSpec(section) {
    return section.classList.contains(MODIFIER) ? 'legacy' : 'figma';
  }

  function labelFor(spec) {
    // Copy speaks to the outcome, not the modifier name — stakeholders
    // don't care which spec is which, they care what happens when they tap.
    return spec === 'legacy'
      ? 'Increase readability'
      : 'Match live-site style';
  }

  function applySpec(sections, spec) {
    var wantLegacy = spec === 'legacy';
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.toggle(MODIFIER, wantLegacy);
    }
    try { localStorage.setItem(STORAGE_KEY, spec); } catch (e) { /* ignore */ }
  }

  function injectToggle() {
    if (document.getElementById(BUTTON_ID)) return;

    var sections = document.querySelectorAll('.rbccm-conference-insights-tiles');
    if (sections.length === 0) return;

    // Restore stored spec on first paint so a reload preserves the viewer's
    // last choice. Default = figma (no modifier) on first visit.
    var stored;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
    if (stored === 'legacy') applySpec(sections, 'legacy');

    var btn = document.createElement('button');
    btn.id   = BUTTON_ID;
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle tile typography preview spec');
    btn.style.cssText = [
      'position:fixed',
      'right:20px',
      'bottom:20px',
      'z-index:9999',
      'padding:12px 20px',
      'border:0',
      'border-radius:28px',
      'background:#003168',
      'color:#fff',
      'font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'letter-spacing:0.5px',
      'cursor:pointer',
      'box-shadow:0 6px 16px rgba(0,0,0,0.25)',
      'transition:transform 0.15s ease, box-shadow 0.15s ease'
    ].join(';');
    btn.textContent = labelFor(currentSpec(sections[0]));

    btn.addEventListener('mouseenter', function () {
      btn.style.transform  = 'translateY(-2px)';
      btn.style.boxShadow  = '0 8px 20px rgba(0,0,0,0.3)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'none';
      btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
    });

    btn.addEventListener('click', function () {
      var next = currentSpec(sections[0]) === 'legacy' ? 'figma' : 'legacy';
      applySpec(sections, next);
      btn.textContent = labelFor(next);
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }
})();
