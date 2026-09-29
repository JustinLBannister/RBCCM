/* =========================================================================
   RBCCM Accordions -- shared runtime
   Deploy path: /assets/rbccm/js/components/rbccm-accordions.js

   Behavior
   =========================================================================
   Vanilla JS, no dependencies. Self-contained IIFE. Idempotent -- safe
   to re-run without double-binding. Multi-instance -- one
   .rbccm-accordions per section, any number per page.

   For each instance:
     - Click any .__item-toggle button -> toggle its item's .is-open + ARIA
     - "Expand all" button expands every item in that instance; label
       flips to "Collapse all" when all items are open, and clicking it
       collapses them
     - Keyboard: toggles are native <button>s so Enter/Space work by default

   Data contract (matches the CSS + XSL):
     .__item                         [class ~ is-open when open]
     .__item-toggle                  [aria-expanded="true|false"]
                                     [aria-controls="{expanded-id}"]
     .__item-expanded                [id="{expanded-id}"]
     .__expand-all                   [data-accordions-expand-all]
                                     [aria-expanded="true|false"]
     .__expand-all-label--collapse   optional inner <span> shown when
                                     all items are open; falls back to
                                     swapping the button's textContent
                                     between "Expand all" / "Collapse all"
                                     using data-* label overrides.
   ========================================================================= */

(function () {
  var BLOCK          = 'rbccm-accordions';
  var ROOT_SEL       = '.' + BLOCK;
  var ITEM_SEL       = '.' + BLOCK + '__item';
  var TOGGLE_SEL     = '.' + BLOCK + '__item-toggle';
  var EXPAND_ALL_SEL = '[data-accordions-expand-all]';
  var BOUND_ATTR     = 'data-accordions-bound';
  var OPEN_CLASS     = 'is-open';

  /* ---- Media in the body copy (video / podcast embeds) ----------------
     A collapsed note only hides its body, so without this a video or
     podcast keeps playing after the note closes, and every embed on the
     page loads up front even though the notes start closed.
       - iframes: the src is kept in data-rbccm-src and only set while the
         note is open. Removing it on collapse stops any player (Brightcove,
         YouTube, Vimeo, Spotify, Apple Podcasts...) without needing its API.
       - <video>, <audio> and Brightcove in-page players (<video-js>):
         paused on collapse.
       - iframes with no title get one from the note title, so screen
         readers can name the frame. */
  var MEDIA_SRC_ATTR = 'data-rbccm-src';

  function noteTitle(item) {
    var t = item.querySelector('.' + BLOCK + '__item-title');
    return t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function prepMedia(item) {
    var frames = item.querySelectorAll('.' + BLOCK + '__item-expanded iframe');
    var title = noteTitle(item);
    var isOpen = item.classList.contains(OPEN_CLASS);
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (!f.getAttribute('title')) f.setAttribute('title', title ? 'Media: ' + title : 'Embedded media');
      var src = f.getAttribute('src');
      if (src && src !== 'about:blank' && !f.getAttribute(MEDIA_SRC_ATTR)) {
        f.setAttribute(MEDIA_SRC_ATTR, src);
        if (!isOpen) f.removeAttribute('src');
      }
    }
  }

  function loadMedia(item) {
    var frames = item.querySelectorAll('.' + BLOCK + '__item-expanded iframe[' + MEDIA_SRC_ATTR + ']');
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute(MEDIA_SRC_ATTR);
      if (frames[i].getAttribute('src') !== src) frames[i].setAttribute('src', src);
    }
  }

  function stopMedia(item) {
    var scope = item.querySelector('.' + BLOCK + '__item-expanded');
    if (!scope) return;
    var frames = scope.querySelectorAll('iframe[' + MEDIA_SRC_ATTR + ']');
    for (var i = 0; i < frames.length; i++) frames[i].removeAttribute('src');
    var players = scope.querySelectorAll('video, audio');
    for (var j = 0; j < players.length; j++) {
      try { players[j].pause(); } catch (e) { /* not playable */ }
    }
    var vjs = scope.querySelectorAll('video-js, .video-js');
    for (var k = 0; k < vjs.length; k++) {
      try {
        var pl = vjs[k].player ||
          (window.videojs && window.videojs.getPlayer && window.videojs.getPlayer(vjs[k]));
        if (pl && pl.pause) pl.pause();
      } catch (e2) { /* player not ready */ }
    }
  }

  function toggleItem(item, forceOpen) {
    var wasOpen = item.classList.contains(OPEN_CLASS);
    var willOpen = (typeof forceOpen === 'boolean')
      ? forceOpen
      : !wasOpen;
    item.classList.toggle(OPEN_CLASS, willOpen);
    if (willOpen && !wasOpen) loadMedia(item);
    if (!willOpen && wasOpen) stopMedia(item);
    var toggle = item.querySelector(TOGGLE_SEL);
    if (toggle) toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  /* Notes with something to expand. A note with no body copy and no
     read-more link has no expanded region (the skin leaves it out), so
     it is skipped by the card click and by Expand all. */
  function expandableItems(root) {
    var all = root.querySelectorAll(ITEM_SEL);
    var out = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].querySelector('.' + BLOCK + '__item-expanded')) out.push(all[i]);
    }
    return out;
  }

  function allOpen(root) {
    var items = expandableItems(root);
    if (!items.length) return false;
    for (var i = 0; i < items.length; i++) {
      if (!items[i].classList.contains(OPEN_CLASS)) return false;
    }
    return true;
  }

  function syncExpandAll(root) {
    var btn = root.querySelector(EXPAND_ALL_SEL);
    if (!btn) return;
    var open = allOpen(root);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* Label swap. Author can supply data-label-expand + data-label-collapse
       on the button; otherwise we default to English strings that match
       the Figma spec. */
    var expandLabel   = btn.getAttribute('data-label-expand')   || 'Expand all';
    var collapseLabel = btn.getAttribute('data-label-collapse') || 'Collapse all';
    btn.textContent = open ? collapseLabel : expandLabel;
  }

  function bindInstance(root) {
    if (root.getAttribute(BOUND_ATTR) === 'true') return;
    root.setAttribute(BOUND_ATTR, 'true');

    /* Delegated click handler at the root. One listener per instance,
       covers three surfaces:
         1. Expand-all button -- toggles every item
         2. Anywhere inside .__item-expanded (body copy + read-more) --
            NO toggle, so users can select body text and click links
            without accidentally collapsing the card
         3. Anywhere else inside a .__item (header row, title, summary,
            or the +/x toggle button itself) -- toggle that item.
            The whole card is the click surface, not just the icon.
       The <button class="__item-toggle"> stays as the semantic
       control that assistive tech announces via aria-expanded;
       the card click is a mouse convenience layered on top. */
    root.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      var expandAllBtn = target.closest(EXPAND_ALL_SEL);
      if (expandAllBtn && root.contains(expandAllBtn)) {
        var open = !allOpen(root);
        var items = expandableItems(root);
        for (var i = 0; i < items.length; i++) toggleItem(items[i], open);
        syncExpandAll(root);
        return;
      }

      /* Ignore clicks inside the expanded body -- leaves body text
         selectable and lets nested links/buttons behave normally. */
      var inExpanded = target.closest('.' + BLOCK + '__item-expanded');
      if (inExpanded && root.contains(inExpanded)) return;

      var item = target.closest(ITEM_SEL);
      if (item && root.contains(item) && item.querySelector('.' + BLOCK + '__item-expanded')) {
        toggleItem(item);
        syncExpandAll(root);
      }
    });

    /* Initial sync -- if the server rendered any items with .is-open
       already, keep the button label in sync. */
    var all = root.querySelectorAll(ITEM_SEL);
    for (var m = 0; m < all.length; m++) prepMedia(all[m]);
    syncExpandAll(root);
  }

  function init() {
    var roots = document.querySelectorAll(ROOT_SEL);
    for (var i = 0; i < roots.length; i++) bindInstance(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
