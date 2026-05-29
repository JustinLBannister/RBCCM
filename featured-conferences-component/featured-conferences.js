/* =========================================
   RBC CM - Featured Conferences
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

  // -- ARIA labels on the tab buttons -----------------------------------
  // Tabs already announce themselves via role="tab" + their text content,
  // but adding richer aria-labels gives screen-reader users the position
  // ("tab 1 of 3") and, for inner tabs, the parent conference name. Pattern
  // matches the speakers/insights dot labels for consistency.
  (function labelTabs() {
    // Outer tabs: "Global Healthcare Conference, tab 1 of 3"
    var nOuter = outerTabs.length;
    Array.prototype.forEach.call(outerTabs, function (tab, i) {
      var name = tab.textContent.trim();
      tab.setAttribute('aria-label', name + ', tab ' + (i + 1) + ' of ' + nOuter);
    });

    // Inner tabs: "Overview, tab 1 of 3, Global Energy Conference"
    // Walk each outer panel separately so the "of N" count + position are
    // local to that conference (each panel has its own Overview/Speakers/
    // Insights inner tabs).
    Array.prototype.forEach.call(outerPanels, function (panel) {
      // Identify the matching outer tab for this panel by data-panel.
      var key = panel.getAttribute('data-panel');
      var matchingOuter = key
        ? root.querySelector('.rbccm-featured-conferences__tab[data-panel="' + key + '"]')
        : null;
      var confName = matchingOuter ? matchingOuter.textContent.trim() : '';

      var innerTabsInPanel = panel.querySelectorAll('.rbccm-featured-conferences__inner-tab');
      var nInner = innerTabsInPanel.length;

      Array.prototype.forEach.call(innerTabsInPanel, function (tab, i) {
        var labelEl = tab.querySelector('.rbccm-featured-conferences__inner-tab-label');
        var name    = labelEl ? labelEl.textContent.trim() : tab.textContent.trim();
        var aria    = name + ', tab ' + (i + 1) + ' of ' + nInner;
        if (confName) aria += ', ' + confName;
        tab.setAttribute('aria-label', aria);
      });
    });
  })();

  // Dispatch a custom event whenever a panel's visibility could have changed.
  // The slick-based sliders (speakers, insights) listen for this and call
  // setPosition() so they measure correctly after their host panel becomes
  // visible (slick stores slide widths at init time and they're 0 if the
  // panel was display:none when slick first ran).
  function notifyPanelChange() {
    try {
      root.dispatchEvent(new CustomEvent('rbccm-fc:panel-change'));
    } catch (e) { /* old browsers - non-critical */ }
  }

  // -- Outer tabs (conference selector) - single-active at all sizes --
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
    // Default this conference's inner state = Overview open
    // (desktop: single-active tab; mobile: first accordion item expanded).
    setExclusiveInner(key + '-overview');
    notifyPanelChange();
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
    notifyPanelChange();
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
    notifyPanelChange();
  }

  // -- Click wiring --
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

  // -- Initial state --
  if (outerTabs.length) {
    activateOuter(outerTabs[0].getAttribute('data-panel'));
  }

  // -- Viewport change: re-sync --
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

      // Both directions: open Overview as the default inner tab of the
      // visible conference (desktop = active tab, mobile = first accordion
      // expanded). Matches the V2 default in `activateOuter`.
      setExclusiveInner(activeKey + '-overview');
    }, 150);
  });
})();

/* =========================================
   RBC CM - Featured Conferences: Speakers slider
   Fully manual transform-based carousel with infinite wrap.

   Layout: a flex row of 194px speakers with 32px gaps, clipped by the
   slider's `overflow: hidden`. JS clones the first speaker at the end and
   the last speaker at the start, then manages a `transform: translateX(...)`
   on the track to slide one card-step (226px) per nav action. When the row
   lands on a clone, JS silently snaps to the matching real speaker - giving
   the illusion of infinite wrap.

   Accessibility:
   - `role="region"` + `aria-roledescription="carousel"` on the slider
   - `role="group"` + `aria-roledescription="slide"` + per-speaker name
     in the aria-label
   - Arrow buttons: full aria-label, no disabled state (carousel wraps)
   - Dots: buttons with rich aria-label (name + title) + aria-current
   - Cloned slides: `aria-hidden="true"` so they're not announced twice
   - Keyboard: ArrowLeft / ArrowRight / Home / End on the dots strip
   ========================================= */
(function () {
  var root = document.getElementById('rbccm-featured-conferences');
  if (!root) return;

  var sliders = root.querySelectorAll('.rbccm-featured-conferences__speakers-slider');
  if (!sliders.length) return;

  var CARD_WIDTH = 194;
  var GAP        = 32;
  var STEP       = CARD_WIDTH + GAP; // 226 - distance from one card's left edge to the next

  Array.prototype.forEach.call(sliders, initOne);

  function initOne(slider) {
    var track    = slider.querySelector('.rbccm-featured-conferences__speakers');
    var dotsWrap = slider.querySelector('.rbccm-featured-conferences__speakers-dots');
    var btns     = slider.querySelectorAll('.rbccm-featured-conferences__speakers-btn');
    var prevBtn  = btns[0];
    var nextBtn  = btns[1];
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    // Snapshot the real speakers before cloning.
    var realSpeakers = Array.prototype.slice.call(
      track.querySelectorAll('.rbccm-featured-conferences__speaker')
    );
    var n = realSpeakers.length;
    if (!n) return;

    // Build a small (name, title) tuple per speaker to enrich aria-labels.
    function speakerInfo(el) {
      var nameEl  = el.querySelector('.rbccm-featured-conferences__speaker-name');
      var titleEl = el.querySelector('.rbccm-featured-conferences__speaker-title');
      return {
        name:  nameEl  ? nameEl.textContent.trim()  : '',
        title: titleEl ? titleEl.textContent.trim() : ''
      };
    }
    var info = realSpeakers.map(speakerInfo);

    // -- Insert clones for infinite wrap -----------------------------------
    // Layout: [start-clones 0..n-1] [real 0..n-1] [end-clones 0..n-1]
    // Real speakers occupy DOM positions n..2n-1.
    //
    // We clone the FULL set of speakers at each end (not just one) so the
    // right-side peek next to a boundary clone matches the right-side peek
    // next to the corresponding real speaker. Otherwise the user sees a
    // visible flash as the peek content changes during the wrap-teleport.
    //
    // Example for n=5 (Sarah, David, Priya, Marcus, Elena):
    //   Pre-wrap pinned at Elena (pos 9): peek shows end-clone-Sarah (pos 10)
    //                                            + end-clone-David  (pos 11)
    //   Click next -> animate to pos 10 (clone-Sarah pinned), peek = end-clone-David
    //   Teleport to pos 5 (real Sarah pinned), peek = real David
    //   Both states render "Sarah pinned + David peek" -> invisible swap.
    function buildCloneFragment(tag) {
      var frag = document.createDocumentFragment();
      realSpeakers.forEach(function (real) {
        var clone = real.cloneNode(true);
        clone.setAttribute('data-clone', tag);
        clone.setAttribute('aria-hidden', 'true');
        // Strip ID-like attrs from clones if any (we set aria-label later
        // only on the reals, so nothing else to clean here).
        frag.appendChild(clone);
      });
      return frag;
    }
    track.insertBefore(buildCloneFragment('prev'), realSpeakers[0]);
    track.appendChild(buildCloneFragment('next'));

    // currentIndex is a REAL speaker index (0..n-1). DOM position of real i
    // is (n + i). displayedPos tracks the actual DOM position currently
    // shown - needed by the transitionend handler to detect clones.
    var currentIndex = 0;
    var displayedPos = n;

    // -- ARIA setup --------------------------------------------------------
    // Static aria-labels (region, prev/next buttons, dots wrapper) use a
    // "set if empty" pattern so author-overridable values from DCR can
    // flow through the markup and win. The dynamic per-slide / per-dot
    // labels are always built from content because they depend on each
    // speaker's name/title from DCR.
    function setIfEmpty(el, attr, value) {
      if (el && !el.getAttribute(attr)) el.setAttribute(attr, value);
    }

    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    setIfEmpty(slider, 'aria-label', 'Featured speakers');
    track.setAttribute('aria-live', 'polite');
    track.setAttribute('aria-atomic', 'false');

    realSpeakers.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      // Rich label: "1 of 5: Sarah Chen, CEO, Global Healthcare Ventures"
      var label = (i + 1) + ' of ' + n;
      if (info[i].name)  label += ': ' + info[i].name;
      if (info[i].title) label += ', ' + info[i].title;
      s.setAttribute('aria-label', label);
    });

    setIfEmpty(prevBtn,  'aria-label', 'Previous speaker');
    setIfEmpty(nextBtn,  'aria-label', 'Next speaker');
    setIfEmpty(dotsWrap, 'aria-label', 'Choose a speaker');

    // -- Build dots --------------------------------------------------------
    realSpeakers.forEach(function (s, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rbccm-featured-conferences__speakers-dot';
      // Rich aria-label, matching the insights pattern:
      // "Go to speaker 1 of 5: Sarah Chen, CEO, Global Healthcare Ventures"
      var label = 'Go to speaker ' + (i + 1) + ' of ' + n;
      if (info[i].name)  label += ': ' + info[i].name;
      if (info[i].title) label += ', ' + info[i].title;
      dot.setAttribute('aria-label', label);
      dot.setAttribute('data-index', String(i));
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(
      dotsWrap.querySelectorAll('.rbccm-featured-conferences__speakers-dot')
    );

    // -- Translate helpers ------------------------------------------------
    // Sets the track's transform to pin the speaker at the given DOM
    // position to the slider's left edge. `domPos` is 0..3n-1.
    function setTransformAtPos(domPos, animate) {
      displayedPos = domPos;
      var x = -domPos * STEP;
      if (!animate) {
        // Disable transition for an instant teleport.
        track.style.transition = 'none';
        track.style.transform  = 'translateX(' + x + 'px)';
        // Force a sync reflow so transition: none takes effect before we
        // restore the default.
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth;
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(' + x + 'px)';
      }
    }

    function setActive(i) {
      // i is always a REAL index (0..n-1).
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === i);
        d.setAttribute('aria-current', idx === i ? 'true' : 'false');
      });
    }

    // -- Navigation -------------------------------------------------------
    // go() accepts:
    //   -1     -> wrap to last via the last start-clone (pos n-1)
    //   n      -> wrap to first via the first end-clone (pos 2n)
    //   0..n-1 -> direct jump to a real speaker (pos n + i)
    function go(targetReal) {
      if (targetReal === -1) {
        setTransformAtPos(n - 1, true);  // animate to last start-clone
        currentIndex = n - 1;
      } else if (targetReal === n) {
        setTransformAtPos(2 * n, true);  // animate to first end-clone
        currentIndex = 0;
      } else {
        setTransformAtPos(n + targetReal, true);
        currentIndex = targetReal;
      }
      setActive(currentIndex);
    }

    // After every transitionend, check if the row landed on a clone and
    // silently teleport to the matching real speaker at the opposite end.
    // The visual is identical (clone === real visually + same peek
    // neighbors thanks to the full n-element clone strips on each side),
    // so the swap is invisible to the user.
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (displayedPos < n) {
        // On a start-clone (pos 0..n-1) - teleport forward by n positions
        // to the matching real speaker.
        setTransformAtPos(displayedPos + n, false);
      } else if (displayedPos >= 2 * n) {
        // On an end-clone (pos 2n..3n-1) - teleport backward by n.
        setTransformAtPos(displayedPos - n, false);
      }
    });

    // -- Wire up controls -------------------------------------------------
    prevBtn.addEventListener('click', function () {
      if (currentIndex === 0) go(-1);
      else go(currentIndex - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentIndex === n - 1) go(n);
      else go(currentIndex + 1);
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(parseInt(d.getAttribute('data-index'), 10));
      });
    });

    // Keyboard navigation on the dots strip.
    dotsWrap.addEventListener('keydown', function (e) {
      var idx = dots.indexOf(document.activeElement);
      if (idx < 0) return;
      var target = null;
      switch (e.key) {
        case 'ArrowLeft':  target = idx === 0 ? -1 : idx - 1; break;
        case 'ArrowRight': target = idx === n - 1 ? n : idx + 1; break;
        case 'Home':       target = 0; break;
        case 'End':        target = n - 1; break;
        default: return;
      }
      e.preventDefault();
      go(target);
      // After the wrap-jump completes, move focus to the new active dot.
      var realFocusIndex = (target === -1) ? (n - 1) : (target === n ? 0 : target);
      dots[realFocusIndex].focus();
    });

    // Total natural width of the real speakers row (no clones, no end gap).
    // 5 speakers -> 5 x 194 + 4 x 32 = 1098.
    var rowWidth = n * CARD_WIDTH + (n - 1) * GAP;

    // Toggle `.has-overflow` on the slider based on whether the real
    // speakers row is wider than the slider's visible area. The CSS hides
    // the controls (arrows + dots) when this class is absent.
    function updateOverflowState() {
      // slider.clientWidth is 0 while the slider's ancestor is display:none;
      // in that case we conservatively assume overflow IS present (so the
      // controls will show when the panel becomes visible - they're cheap
      // to render). Only when we can confirm `rowWidth <= clientWidth` do
      // we mark `no overflow`.
      var sliderWidth = slider.clientWidth;
      if (sliderWidth > 0 && rowWidth <= sliderWidth) {
        slider.classList.remove('has-overflow');
      } else {
        slider.classList.add('has-overflow');
      }
    }

    // resetToFirst - pin real-0 to the left edge, no animation. Used as the
    // canonical "fresh" state at page load and after every resize.
    function resetToFirst() {
      currentIndex = 0;
      setTransformAtPos(n, false);
      setActive(0);
      updateOverflowState();
    }

    // -- Resize handler ---------------------------------------------------
    // When the viewport changes, reset to real-0 AND recompute the overflow
    // state so the controls re-appear/disappear at the new size. Debounced
    // 150ms so we don't churn during continuous drag-resize.
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resetToFirst, 150);
    });

    // -- Initial state -----------------------------------------------------
    // Defer to the next animation frame so the browser has applied the CSS
    // (clones inserted, flex layout settled) before we measure / position.
    requestAnimationFrame(resetToFirst);

    // Re-check overflow state any time a panel becomes visible (the slider's
    // clientWidth was 0 while hidden - once revealed, we may need to either
    // add or drop `.has-overflow` based on the now-real viewport).
    root.addEventListener('rbccm-fc:panel-change', function () {
      requestAnimationFrame(updateOverflowState);
    });
  }
})();

/* =========================================
   RBC CM - Featured Conferences: Insights slider
   Mobile-only transform-based carousel.

   Layout: a flex row of 346px cards with 32px gaps. On mobile, JS translates
   the row left/right by one card-step per arrow click (346 + 32 = 378px).
   On desktop, CSS reflows the same DOM into a 3-col grid where the first
   card spans the row - no carousel, controls hide via `.has-overflow`.

   No infinite wrap: 4 cards is short enough that simple edge-stop behavior
   (arrows disable at boundaries) feels natural. Active dot tracks
   currentIndex directly.

   Accessibility:
   - `role="region"` + `aria-roledescription="carousel"` on the slider
   - `role="group"` + `aria-roledescription="slide"` on each card
   - Arrows: aria-label + disabled at edges
   - Dots: buttons with rich aria-label + aria-current
   - Keyboard nav on dots strip (ArrowLeft / ArrowRight / Home / End)
   ========================================= */
(function () {
  var root = document.getElementById('rbccm-featured-conferences');
  if (!root) return;

  var sliders = root.querySelectorAll('.rbccm-featured-conferences__insights-slider');
  if (!sliders.length) return;

  var CARD_WIDTH = 346;
  var GAP        = 32;
  var STEP       = CARD_WIDTH + GAP; // 378 - distance from one card's left edge to the next

  Array.prototype.forEach.call(sliders, initOne);

  function initOne(slider) {
    var track    = slider.querySelector('.rbccm-featured-conferences__insights');
    var dotsWrap = slider.querySelector('.rbccm-featured-conferences__insights-dots');
    var btns     = slider.querySelectorAll('.rbccm-featured-conferences__insights-btn');
    var prevBtn  = btns[0];
    var nextBtn  = btns[1];
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    // Snapshot real cards BEFORE we insert clones.
    var cards = Array.prototype.slice.call(
      track.querySelectorAll('.rbccm-featured-conferences__insight')
    );
    var n = cards.length;
    if (!n) return;

    // Tag real cards: first is featured (desktop spans the row), the rest
    // are standard. Both classes get stripped from the cloned copies later
    // so only the real cards carry the desktop styling.
    cards[0].classList.add('rbccm-featured-conferences__insight--featured');
    for (var i = 1; i < n; i++) {
      cards[i].classList.add('rbccm-featured-conferences__insight--card');
    }

    // -- Insert clones for infinite wrap -----------------------------------
    // Layout: [start-clones 0..n-1] [real 0..n-1] [end-clones 0..n-1]
    // Real cards occupy DOM positions n..2n-1.
    //
    // We clone the FULL set on each end (not just one) so the right-side
    // peek visible next to a boundary clone matches the right-side peek
    // visible next to the corresponding real card after the silent
    // teleport. Otherwise on viewports wide enough to show >1 card at a
    // time (e.g. tablet), the peek content visibly changes during the
    // teleport and the user perceives a flash. Same pattern as speakers.
    function buildCloneFragment(tag) {
      var frag = document.createDocumentFragment();
      cards.forEach(function (real) {
        var clone = real.cloneNode(true);
        clone.setAttribute('data-clone', tag);
        clone.setAttribute('aria-hidden', 'true');
        // Strip both modifier classes - clones never carry the desktop styling
        // (they're display: none on desktop anyway, but defensive).
        clone.classList.remove('rbccm-featured-conferences__insight--featured');
        clone.classList.remove('rbccm-featured-conferences__insight--card');
        frag.appendChild(clone);
      });
      return frag;
    }
    track.insertBefore(buildCloneFragment('prev'), cards[0]);
    track.appendChild(buildCloneFragment('next'));

    // currentIndex is a REAL card index (0..n-1). DOM position of real i
    // is (n + i). displayedPos tracks the actual DOM position currently
    // pinned to the slider's left edge.
    var currentIndex = 0;
    var displayedPos = n;

    // -- ARIA setup --------------------------------------------------------
    // Same "set if empty" pattern as speakers - author overrides via DCR
    // flow through markup and win over JS defaults.
    function setIfEmpty(el, attr, value) {
      if (el && !el.getAttribute(attr)) el.setAttribute(attr, value);
    }

    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    setIfEmpty(slider, 'aria-label', 'Conference insights');
    track.setAttribute('aria-live', 'polite');
    track.setAttribute('aria-atomic', 'false');

    // Pull (title, meta text) per card so we can build rich aria-labels.
    // Meta example: "6 min read" or "12 min listen" - surface the format
    // type so screen-reader users know whether the link is article vs audio
    // before they activate it.
    function insightInfo(el) {
      var titleEl = el.querySelector('.rbccm-featured-conferences__insight-title');
      var metaEl  = el.querySelector('.rbccm-featured-conferences__insight-meta');
      return {
        title: titleEl ? titleEl.textContent.trim() : '',
        meta:  metaEl  ? metaEl.textContent.replace(/\s+/g, ' ').trim() : ''
      };
    }
    var info = cards.map(insightInfo);

    cards.forEach(function (c, i) {
      c.setAttribute('role', 'group');
      c.setAttribute('aria-roledescription', 'slide');
      // Rich slide label: "2 of 4: Clinical Trial Innovation, 6 min read"
      var label = (i + 1) + ' of ' + n;
      if (info[i].title) label += ': ' + info[i].title;
      if (info[i].meta)  label += ', ' + info[i].meta;
      c.setAttribute('aria-label', label);
    });

    setIfEmpty(prevBtn,  'aria-label', 'Previous insight');
    setIfEmpty(nextBtn,  'aria-label', 'Next insight');
    setIfEmpty(dotsWrap, 'aria-label', 'Choose an insight');

    // Rich aria-label on the "View all conference insights" CTA - include the
    // specific conference name so screen-reader users know which conference's
    // archive they're heading to. The CTA lives outside the slider but inside
    // the same inner-panel.
    var panel = slider.closest('.rbccm-featured-conferences__inner-panel');
    var cta   = panel ? panel.querySelector('.rbccm-featured-conferences__insights-cta') : null;
    if (cta) {
      var confKey  = slider.getAttribute('data-conf');
      var tab      = confKey
        ? root.querySelector('.rbccm-featured-conferences__tab[data-panel="' + confKey + '"]')
        : null;
      var confName = tab ? tab.textContent.trim() : '';
      setIfEmpty(
        cta,
        'aria-label',
        'View all ' + (confName || 'conference') + ' insights'
      );
    }

    // -- Build dots --------------------------------------------------------
    cards.forEach(function (c, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rbccm-featured-conferences__insights-dot';
      // Rich dot label: "Go to insight 2 of 4: Clinical Trial Innovation, 6 min read"
      var label = 'Go to insight ' + (i + 1) + ' of ' + n;
      if (info[i].title) label += ': ' + info[i].title;
      if (info[i].meta)  label += ', ' + info[i].meta;
      dot.setAttribute('aria-label', label);
      dot.setAttribute('data-index', String(i));
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(
      dotsWrap.querySelectorAll('.rbccm-featured-conferences__insights-dot')
    );

    // -- Overflow state - class-driven control visibility -----------------
    // Row natural width = n cards + (n-1) gaps. Compare to slider's
    // clientWidth. On desktop the slider holds a grid (no horizontal
    // overflow), but we test this from the JS side anyway - when the
    // grid layout is active, the cards aren't a flex row so the calc
    // doesn't really matter; CSS hides the controls on desktop regardless
    // by reflowing the track to grid.
    var rowWidth = n * CARD_WIDTH + (n - 1) * GAP;

    function updateOverflowState() {
      var sliderWidth = slider.clientWidth;
      // Skip when hidden (clientWidth is 0). The panel-change listener will
      // re-run this when the panel becomes visible.
      if (sliderWidth === 0) {
        slider.classList.add('has-overflow');
        return;
      }
      // On desktop, the track CSS switches to grid so transform has no
      // effect. We detect "is this a desktop layout?" by checking whether
      // the cards are still flex-row (mobile) by looking at the track's
      // computed display. Simpler: check viewport directly.
      var isDesktop = window.matchMedia('(min-width: 992px)').matches;
      if (isDesktop || rowWidth <= sliderWidth) {
        slider.classList.remove('has-overflow');
      } else {
        slider.classList.add('has-overflow');
      }
    }

    // -- Sliding helpers --------------------------------------------------
    // Position the row so the speaker at DOM position `domPos` sits at the
    // slider's left edge. `animate: false` snaps without transition (used
    // for the silent teleport off the boundary clones).
    function setTransformAtPos(domPos, animate) {
      displayedPos = domPos;
      var x = -domPos * STEP;
      if (!animate) {
        track.style.transition = 'none';
        track.style.transform  = 'translateX(' + x + 'px)';
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth;     // sync reflow
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(' + x + 'px)';
      }
    }

    // go() accepts:
    //   -1     -> wrap to last via last start-clone (DOM pos n-1)
    //   n      -> wrap to first via first end-clone (DOM pos 2n)
    //   0..n-1 -> direct jump to a real card (DOM pos n + i)
    function go(targetReal) {
      if (targetReal === -1) {
        setTransformAtPos(n - 1, true);   // animate to last start-clone
        currentIndex = n - 1;
      } else if (targetReal === n) {
        setTransformAtPos(2 * n, true);   // animate to first end-clone
        currentIndex = 0;
      } else {
        setTransformAtPos(n + targetReal, true);
        currentIndex = targetReal;
      }
      updateUi();
    }

    // After every transitionend, check if the row landed on a clone and
    // silently teleport to the matching real card at the opposite end.
    // Because we cloned the full n-card strip on each side, the peek
    // visible just before the teleport matches the peek visible just
    // after - invisible swap.
    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || e.propertyName !== 'transform') return;
      if (displayedPos < n) {
        // On a start-clone (pos 0..n-1) - teleport forward by n positions
        // to the matching real card.
        setTransformAtPos(displayedPos + n, false);
      } else if (displayedPos >= 2 * n) {
        // On an end-clone (pos 2n..3n-1) - teleport backward by n.
        setTransformAtPos(displayedPos - n, false);
      }
    });

    function updateUi() {
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === currentIndex);
        d.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
      });
      // No arrow disabled state - infinite wrap means there's always
      // somewhere to go in either direction.
    }

    // -- Reset to first card (used on init + on resize) --------------------
    function resetToFirst() {
      currentIndex = 0;
      setTransformAtPos(n, false);   // DOM position n = real card 0
      updateUi();
      updateOverflowState();
    }

    // -- Wire up controls -------------------------------------------------
    prevBtn.addEventListener('click', function () {
      if (currentIndex === 0) go(-1);
      else go(currentIndex - 1);
    });
    nextBtn.addEventListener('click', function () {
      if (currentIndex === n - 1) go(n);
      else go(currentIndex + 1);
    });

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(parseInt(d.getAttribute('data-index'), 10));
      });
    });

    // Keyboard navigation on dots strip (wraps at edges via go(-1) / go(n))
    dotsWrap.addEventListener('keydown', function (e) {
      var idx = dots.indexOf(document.activeElement);
      if (idx < 0) return;
      var target = null;
      switch (e.key) {
        case 'ArrowLeft':  target = idx === 0 ? -1 : idx - 1; break;
        case 'ArrowRight': target = idx === n - 1 ? n : idx + 1; break;
        case 'Home':       target = 0; break;
        case 'End':        target = n - 1; break;
        default: return;
      }
      e.preventDefault();
      go(target);
      var realFocusIndex = (target === -1) ? (n - 1) : (target === n ? 0 : target);
      dots[realFocusIndex].focus();
    });

    // -- Resize handler ---------------------------------------------------
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resetToFirst, 150);
    });

    // -- Initial state -----------------------------------------------------
    requestAnimationFrame(resetToFirst);

    // Re-check overflow when a panel becomes visible (slider was display:none
    // while the Insights tab was closed).
    root.addEventListener('rbccm-fc:panel-change', function () {
      requestAnimationFrame(updateOverflowState);
    });
  }
})();

/* =========================================================================
   Video facade: click-to-play (custom Poster Override)
   When a conference has a Poster Override, the Overview tab renders a poster
   image + play button instead of the iframe (Brightcove iframe embeds ignore
   the poster URL param). On click we inject the Brightcove iframe with
   autoplay=1 in place of the facade.
   ========================================================================= */
(function () {
  var root = document.getElementById('rbccm-featured-conferences');
  if (!root) return;

  function play(facade) {
    var src = facade.getAttribute('data-bc-src');
    if (!src) return;
    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', src);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
    iframe.setAttribute('allowfullscreen', 'allowfullscreen');
    if (facade.parentNode) {
      facade.parentNode.replaceChild(iframe, facade);
    }
  }

  var facades = root.querySelectorAll('.rbccm-featured-conferences__video-facade');
  Array.prototype.forEach.call(facades, function (facade) {
    facade.addEventListener('click', function (e) {
      e.preventDefault();
      play(facade);
    });
  });
})();
