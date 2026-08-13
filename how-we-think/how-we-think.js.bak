/* ============================================================
   RBC CM — How We Think
   Tab / accordion controller.
   ============================================================
   - Runs as a desktop tab strip (all 3 tabs in a row, only the
     active panel visible below) and a mobile accordion (each
     tab shows its own panel inline when opened).
   - Same DOM serves both viewports; on mobile the active panel
     is physically moved to sit after the active tab so keyboard
     Tab-flow follows visual accordion order. On desktop panels
     are parked at the end of the wrapper so Tab-flow is
     tab → tab → tab → active panel content.
   - Uses the ARIA disclosure/accordion pattern (button +
     aria-expanded + aria-controls), NOT the tab pattern —
     screen readers announce each button as "expanded/collapsed,
     button", consistent across both viewports. Wrapper carries
     aria-labelledby pointing at the H2. Panels are role="region"
     with aria-labelledby pointing at their button, so a screen
     reader lands inside as "Insights, region" and can jump
     between regions with landmark navigation.
   - Scoped to #rbccm-how-we-think so multiple instances of the
     component on one page stay isolated.

   Deploy at: /assets/rbccm/js/sub/test/how-we-think.js
             (path referenced from the skin's <script>).
   ============================================================ */
(function () {
  var root = document.getElementById('rbccm-how-we-think');
  if (!root) return;

  var tabs   = root.querySelectorAll('.rbccm-how-we-think__tab');
  var panels = root.querySelectorAll('.rbccm-how-we-think__panel');
  if (!tabs.length || !panels.length) return;

  // Cached refs
  var wrapper    = root.querySelector('.rbccm-how-we-think__tablist');
  var panelOrder = ['insights', 'newsroom', 'conferences'];

  // Viewport-conditional DOM reorder — see reorderForViewport() below.
  // matchMedia listener keeps the DOM in sync when the user resizes
  // across the mobile ↔ desktop boundary.
  var mobileQuery = window.matchMedia('(max-width: 991px)');

  // ARIA labels with position — gives screen-reader users orientation
  // ("Insights, section 1 of 3") on top of the disclosure/accordion
  // pattern's default "expanded/collapsed, button" announcement.
  var n = tabs.length;
  Array.prototype.forEach.call(tabs, function (tab, i) {
    var name = tab.textContent.trim();
    tab.setAttribute('aria-label', name + ', section ' + (i + 1) + ' of ' + n);
  });

  function activate(key, setFocus) {
    Array.prototype.forEach.call(tabs, function (tab) {
      var on = tab.getAttribute('data-panel') === key;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-expanded', on ? 'true' : 'false');
      // Do NOT apply roving-tabindex. This component runs as a
      // desktop tab strip AND a mobile accordion; roving tabindex is
      // right for the tab strip but breaks the accordion — on mobile,
      // Tab-ing out of an open panel needs to reach the next
      // accordion header, and tabindex="-1" on inactive tabs blocks
      // that. Native <button> default (tabindex 0) is fine for both
      // patterns; arrow-key nav still works via the keydown handler
      // below.
      if (on && setFocus) tab.focus();
    });
    Array.prototype.forEach.call(panels, function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-panel') === key);
    });
    // Keep DOM order in sync with visual order so Tab-key nav matches
    // what the user sees — mobile visual is an accordion (tab → its
    // open panel → next tab), desktop visual is a tab strip (all
    // tabs → active panel).
    reorderForViewport();
  }

  // reorderForViewport
  // -------------------
  // Mobile: physically move the active panel to be the next DOM
  // sibling of the active tab, so natural Tab flow follows the visual
  // accordion order:
  //     tab1 → (if active) panel1 → tab2 → (if active) panel2 → tab3
  // Hidden panels are just parked at the end of the wrapper — they're
  // display: none so they don't participate in Tab flow anyway.
  //
  // Desktop: reset panels back to the end of the wrapper in their
  // canonical order (insights, newsroom, conferences), so natural Tab
  // flow is: tab1 → tab2 → tab3 → active panel content. Grid layout
  // pins tabs to row 1 and panels to row 2 regardless of DOM order,
  // so the visual doesn't change — only the tab sequence does.
  function reorderForViewport() {
    if (mobileQuery.matches) {
      var activeTab   = wrapper.querySelector('.rbccm-how-we-think__tab.is-active');
      var activePanel = wrapper.querySelector('.rbccm-how-we-think__panel.is-active');
      if (activeTab && activePanel) {
        // .after() preserves focus on any element inside activePanel,
        // so keyboard users mid-navigation don't lose their place.
        activeTab.after(activePanel);
      }
    } else {
      panelOrder.forEach(function (key) {
        var panel = wrapper.querySelector(
          '.rbccm-how-we-think__panel[data-panel="' + key + '"]'
        );
        if (panel) wrapper.appendChild(panel);
      });
    }
  }

  // Initial sync + re-sync when crossing the 992px boundary.
  reorderForViewport();
  // addEventListener('change', ...) is the modern equivalent of the
  // deprecated addListener; Safari <14 falls back to addListener.
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', reorderForViewport);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(reorderForViewport);
  }

  // Click / touch
  wrapper.addEventListener('click', function (e) {
    var tab = e.target.closest('.rbccm-how-we-think__tab');
    if (!tab) return;
    activate(tab.getAttribute('data-panel'), false);
  });

  // Keyboard: Left/Right/Home/End for tab-strip navigation. Only
  // activates when focus is on a tab — inside panel content, arrow
  // keys keep their default behaviour (scroll).
  wrapper.addEventListener('keydown', function (e) {
    var current = document.activeElement;
    var idx = Array.prototype.indexOf.call(tabs, current);
    if (idx === -1) return;
    var next = null;
    if (e.key === 'ArrowRight')      next = tabs[(idx + 1) % tabs.length];
    else if (e.key === 'ArrowLeft')  next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home')       next = tabs[0];
    else if (e.key === 'End')        next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      activate(next.getAttribute('data-panel'), true);
    }
  });
})();
