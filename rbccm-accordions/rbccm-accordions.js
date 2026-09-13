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

  function toggleItem(item, forceOpen) {
    var willOpen = (typeof forceOpen === 'boolean')
      ? forceOpen
      : !item.classList.contains(OPEN_CLASS);
    item.classList.toggle(OPEN_CLASS, willOpen);
    var toggle = item.querySelector(TOGGLE_SEL);
    if (toggle) toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  function allOpen(root) {
    var items = root.querySelectorAll(ITEM_SEL);
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
        var items = root.querySelectorAll(ITEM_SEL);
        for (var i = 0; i < items.length; i++) toggleItem(items[i], open);
        syncExpandAll(root);
        return;
      }

      /* Ignore clicks inside the expanded body -- leaves body text
         selectable and lets nested links/buttons behave normally. */
      var inExpanded = target.closest('.' + BLOCK + '__item-expanded');
      if (inExpanded && root.contains(inExpanded)) return;

      var item = target.closest(ITEM_SEL);
      if (item && root.contains(item)) {
        toggleItem(item);
        syncExpandAll(root);
      }
    });

    /* Initial sync -- if the server rendered any items with .is-open
       already, keep the button label in sync. */
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
