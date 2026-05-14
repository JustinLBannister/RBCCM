/* =========================================
   RBC CM — Featured Conferences (V1)
   Scoped to #rbccm-featured-conferences
   ========================================= */
(function () {
  var root = document.getElementById('rbccm-featured-conferences');
  if (!root) return;

  var outerTabs   = root.querySelectorAll('.rbccm-featured-conferences__tab');
  var outerPanels = root.querySelectorAll('.rbccm-featured-conferences__panel');
  var innerTabs   = root.querySelectorAll('.rbccm-featured-conferences__inner-tab');
  var innerPanels = root.querySelectorAll('.rbccm-featured-conferences__inner-panel');

  function isDesktop() {
    return window.matchMedia('(min-width: 992px)').matches;
  }

  // ── Outer tabs (conference selector) — single-active at all sizes ──
  function activateOuter(key) {
    for (var i = 0; i < outerTabs.length; i++) {
      var on = outerTabs[i].getAttribute('data-panel') === key;
      outerTabs[i].classList.toggle('is-active', on);
      outerTabs[i].setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    for (var j = 0; j < outerPanels.length; j++) {
      var match = outerPanels[j].getAttribute('data-panel') === key;
      outerPanels[j].classList.toggle('is-active', match);
    }
    // Default this conference's inner state for desktop = Overview active
    if (isDesktop()) {
      setExclusiveInner(key + '-ghc'); // V1: first visible inner tab (was '-overview' which is now hidden)
    } else {
      // Mobile: collapse all inner accordions when switching conference
      clearInner();
    }
  }

  // Desktop: exclusive single-active inner tab
  function setExclusiveInner(innerKey) {
    for (var i = 0; i < innerTabs.length; i++) {
      var on = innerTabs[i].getAttribute('data-inner') === innerKey;
      innerTabs[i].classList.toggle('is-active', on);
      innerTabs[i].setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    for (var j = 0; j < innerPanels.length; j++) {
      var match = innerPanels[j].getAttribute('data-inner') === innerKey;
      innerPanels[j].classList.toggle('is-active', match);
    }
  }

  function clearInner() {
    for (var i = 0; i < innerTabs.length; i++) {
      innerTabs[i].classList.remove('is-active');
      innerTabs[i].setAttribute('aria-expanded', 'false');
    }
    for (var j = 0; j < innerPanels.length; j++) {
      innerPanels[j].classList.remove('is-active');
    }
  }

  // Mobile: each inner tab toggles its own open/closed
  function toggleInner(innerKey) {
    for (var i = 0; i < innerTabs.length; i++) {
      if (innerTabs[i].getAttribute('data-inner') === innerKey) {
        var open = innerTabs[i].classList.toggle('is-active');
        innerTabs[i].setAttribute('aria-expanded', open ? 'true' : 'false');
        // panel state is driven by CSS adjacent-sibling on mobile,
        // but we also flip the class for consistency
        for (var j = 0; j < innerPanels.length; j++) {
          if (innerPanels[j].getAttribute('data-inner') === innerKey) {
            innerPanels[j].classList.toggle('is-active', open);
          }
        }
        break;
      }
    }
  }

  // ── Click wiring ──
  for (var i = 0; i < outerTabs.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        activateOuter(btn.getAttribute('data-panel'));
      });
    })(outerTabs[i]);
  }

  for (var k = 0; k < innerTabs.length; k++) {
    (function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var key = btn.getAttribute('data-inner');
        if (isDesktop()) {
          setExclusiveInner(key);
        } else {
          toggleInner(key);
        }
      });
    })(innerTabs[k]);
  }

  // ── Initial state ──
  if (outerTabs.length) {
    activateOuter(outerTabs[0].getAttribute('data-panel'));
  }

  // ── Viewport change: re-sync ──
  var lastDesktop = isDesktop();
  var rTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rTimer);
    rTimer = setTimeout(function () {
      var nowDesktop = isDesktop();
      if (nowDesktop === lastDesktop) return;
      lastDesktop = nowDesktop;

      // Find currently active outer key
      var activeKey = null;
      for (var i = 0; i < outerTabs.length; i++) {
        if (outerTabs[i].classList.contains('is-active')) {
          activeKey = outerTabs[i].getAttribute('data-panel');
          break;
        }
      }
      if (!activeKey && outerTabs.length) {
        activeKey = outerTabs[0].getAttribute('data-panel');
      }

      if (nowDesktop) {
        // Mobile → Desktop: ensure one inner is active for the visible conference
        setExclusiveInner(activeKey + '-ghc'); // V1: first visible inner tab
      } else {
        // Desktop → Mobile: collapse all accordions
        clearInner();
      }
    }, 150);
  });
})();
