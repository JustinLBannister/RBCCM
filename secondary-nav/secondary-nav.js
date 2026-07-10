/* ============================================================
   Secondary Nav — runtime behavior

   Auto-initializes every `.secondary-nav` instance on the page.
   Responsibilities:
     1. Fill in any missing item labels from the URL slug
        (author left ItemLabel blank in the CMS).
     2. Auto-detect the active item via longest-prefix URL match
        when no item was flagged active at render time.
     3. Wire arrow show/hide + disabled state based on overflow.
     4. Wire arrow-click scrolling to reveal the first
        partially-clipped item on either side.
     5. Update the progress bar as the wrapper scrolls.
     6. Center the active item in view on load when overflowing.

   No dependencies. Vanilla ES5.
   ============================================================ */
(function () {

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); return; }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var navs = document.querySelectorAll('.secondary-nav');
    for (var i = 0; i < navs.length; i++) initSecondaryNav(navs[i]);
  });

  function initSecondaryNav(nav) {
    var wrap = nav.querySelector('.secondary-nav__wrapper');
    var prev = nav.querySelector('.secondary-nav__arrow--prev');
    var next = nav.querySelector('.secondary-nav__arrow--next');
    var fill = nav.querySelector('.secondary-nav__progress-fill');
    if (!wrap || !prev || !next || !fill) return;

    autoLabelFromSlug(nav);
    autoDetectActive(nav);

    var EPS = 2;

    function scrollBehaviorPref() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }

    function refresh() {
      var canScroll = wrap.scrollWidth - wrap.clientWidth > EPS;
      nav.classList.toggle('is-overflowing', canScroll);

      if (!canScroll) {
        prev.classList.add('is-not-needed');
        next.classList.add('is-not-needed');
        prev.disabled = false;
        next.disabled = false;
        fill.style.width = '0%';
        return;
      }
      prev.classList.remove('is-not-needed');
      next.classList.remove('is-not-needed');

      var atStart = wrap.scrollLeft <= EPS;
      var atEnd = wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth - EPS;
      prev.disabled = atStart;
      next.disabled = atEnd;

      var max = wrap.scrollWidth - wrap.clientWidth;
      var pct = max > 0 ? (wrap.scrollLeft / max) * 100 : 0;
      fill.style.width = pct + '%';
    }

    function scrollByPage(direction) {
      var items = wrap.querySelectorAll('.secondary-nav__item');
      var visibleLeft = wrap.scrollLeft;
      var visibleRight = wrap.scrollLeft + wrap.clientWidth;

      if (direction > 0) {
        for (var i = 0; i < items.length; i++) {
          var itemRight = items[i].offsetLeft + items[i].offsetWidth;
          if (itemRight > visibleRight + EPS) {
            wrap.scrollTo({ left: items[i].offsetLeft, behavior: scrollBehaviorPref() });
            return;
          }
        }
      } else {
        for (var j = items.length - 1; j >= 0; j--) {
          var itemLeft = items[j].offsetLeft;
          if (itemLeft < visibleLeft - EPS) {
            var target = items[j].offsetLeft + items[j].offsetWidth - wrap.clientWidth;
            wrap.scrollTo({ left: Math.max(0, target), behavior: scrollBehaviorPref() });
            return;
          }
        }
      }
      wrap.scrollBy({ left: wrap.clientWidth * 0.8 * direction, behavior: scrollBehaviorPref() });
    }

    function scrollToInitial() {
      var canScroll = wrap.scrollWidth - wrap.clientWidth > EPS;
      if (!canScroll) return;
      var current = wrap.querySelector('.secondary-nav__item.active, .secondary-nav__item a[aria-current="page"]');
      if (!current) {
        wrap.scrollTo({ left: 0, behavior: 'auto' });
        return;
      }
      var itemEl = current.closest ? (current.closest('.secondary-nav__item') || current) : current;
      var targetLeft = itemEl.offsetLeft + (itemEl.offsetWidth / 2) - (wrap.clientWidth / 2);
      wrap.scrollTo({ left: Math.max(0, targetLeft), behavior: 'auto' });
    }

    prev.addEventListener('click', function () { scrollByPage(-1); });
    next.addEventListener('click', function () { scrollByPage(1); });
    wrap.addEventListener('scroll', refresh);
    window.addEventListener('resize', refresh);
    refresh();
    scrollToInitial();
  }

  /* If the anchor text is empty, the author left ItemLabel blank in
     the CMS. Derive a display label from the URL's final path
     segment: kebab-case → Title Case (e.g., `industry-coverage` →
     `Industry Coverage`). Escape hatch for authors is to fill in
     ItemLabel in the CMS for any URL whose slug doesn't cleanly
     convert (e.g., "Mergers & Acquisitions"). */
  function autoLabelFromSlug(nav) {
    var links = nav.querySelectorAll('.secondary-nav__item a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if ((a.textContent || '').trim() !== '') continue;
      var href = a.getAttribute('href') || '';
      var segments = href.split('/').filter(function (s) { return s.length > 0; });
      var slug = segments.length ? segments[segments.length - 1] : '';
      var label = slug.split('-').map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
      a.textContent = label;
    }
  }

  /* When no item has been flagged .active by the XSL, detect the
     current one at runtime via longest-prefix URL match. Uses
     window.location.pathname so query strings and hashes don't
     interfere. `Starts with` matching means a deep subsection
     (e.g., /section/industry-coverage/energy) still highlights
     the top-level "Industry Coverage" nav item. Picks the longest
     matching href so /a/b beats /a when both match. */
  function autoDetectActive(nav) {
    if (nav.querySelector('.secondary-nav__item.active')) return;

    var currentPath = (window.location && window.location.pathname) || '';
    var items = nav.querySelectorAll('.secondary-nav__item');
    var match = null;
    var matchLen = 0;

    for (var i = 0; i < items.length; i++) {
      var a = items[i].querySelector('a');
      if (!a) continue;
      var href = a.getAttribute('href') || '';
      if (href && currentPath.indexOf(href) === 0 && href.length > matchLen) {
        match = items[i];
        matchLen = href.length;
      }
    }

    if (match) {
      match.classList.add('active');
      var link = match.querySelector('a');
      if (link) link.setAttribute('aria-current', 'page');
    }
  }

})();
</content>
</invoke>