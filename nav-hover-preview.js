/* =========================================================
   RBCCM Hover-Nav Preview (v4)
   Self-contained. Dormant until the toggle button is clicked.

   Desktop-only by design. Mobile/touch devices do not fire
   mouseenter / mouseleave, so none of the hover handlers below
   run on touch. The CSS also gates hover styles behind
   @media (hover: hover) and (pointer: fine). Mobile continues
   to use its existing tap-to-open behavior unchanged.

   Behavior summary:
   - Adds a "Enable hover menu (preview)" button in the page
   - Hover opens the flyout, mouseleave + 150ms closes
   - Tab promotes a hover-opened menu to keyboard mode
     (submenu links become tabbable)
   - Escape closes any open dropdown
   - Click / Enter / Space on the TOGGLE in hover mode are no-ops
     (will not navigate, will not close)
   - Submenu links (Campus Recruiting, Search Opportunities, etc.)
     always remain clickable and Enter-able. Suppression is only
     on the top-level toggle.
   - Sibling hover closes any other open menu. If focus was
     stranded inside the closing menu, focus transfers to the
     new toggle.
   - State is tied to the .open class via MutationObserver, so
     no stale residue is left when the menu closes.

   Manual disable (in console): $('.navbar-nav').off('.rbccmHover');
   ========================================================= */
   
(function ($) {
  'use strict';

  if (!window.jQuery) {
    console.warn('[rbccmHover] jQuery not found, preview script aborting');
    return;
  }

  // ---------- Config ----------
  var BTN_ID   = 'rbccm-hover-preview-toggle';
  var STYLE_ID = 'rbccm-hover-preview-styles';
  var SELECTOR = 'ul.nav.navbar-nav.navbar-right > li.dropdown,' +
                 'ul.nav.navbar-right.navbar-nav > li.dropdown';
  var CLOSE_DELAY_MS = 150;

  var enabled    = false;
  var closeTimer = null;
  var modeObs    = null;

  // ---------- CSS ----------
  var CSS = [
    '/* rbccm hover-nav preview styles */',
    '.navbar-nav > li.dropdown.open > .dropdown-menu::before,',
    '.navbar-nav > li.dropdown:hover > .dropdown-toggle::after {',
    '  content: ""; position: absolute; top: -4px; left: 0; right: 0;',
    '  height: 4px; background: transparent;',
    '}',
    '@media (hover: hover) and (pointer: fine) {',
    '  .navbar-nav > li.dropdown > .dropdown-toggle:focus-visible + .dropdown-menu {',
    '    display: block;',
    '  }',
    '}',
    '.navbar-nav > li.dropdown:focus-within { outline: none; }',
    '.navbar-nav > li.dropdown > .dropdown-toggle:focus-visible {',
    '  outline: 1.5px dotted CurrentColor; outline-offset: -2px;',
    '}',
    '/* preview button styling */',
    '#' + BTN_ID + ' {',
    '  position: fixed; bottom: 16px; right: 16px; z-index: 99999;',
    '  padding: 10px 14px; border-radius: 999px; border: 0;',
    '  font: 600 13px/1 system-ui, sans-serif; cursor: pointer;',
    '  background: #003168; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,.25);',
    '}',
    '#' + BTN_ID + '[data-on="true"] { background: #00875a; }',
    '#' + BTN_ID + ':focus-visible { outline: 2px solid #ffd700; outline-offset: 2px; }'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---------- State helpers ----------
  function setMode($li, mode) {
    if (mode == null) {
      $li.removeAttr('data-rbccm-mode');
    } else {
      $li.attr('data-rbccm-mode', mode);
    }
  }

  function lockSubmenuTabbing($li) {
    $li.find('.dropdown-menu a').attr('tabindex', '-1');
  }
  function unlockSubmenuTabbing($li) {
    $li.find('.dropdown-menu a[tabindex="-1"]').removeAttr('tabindex');
  }

  function closeLi(li, opts) {
    opts = opts || {};
    var $li = $(li);
    var focusInside = li.contains(document.activeElement);
    $li.removeClass('open opened-by-hover')
       .removeAttr('data-rbccm-mode')
       .removeAttr('data-opened-by');
    var $tog = $li.find('> a.dropdown-toggle, > a').first();
    $tog.attr('aria-expanded', 'false');
    unlockSubmenuTabbing($li);
    if (focusInside && opts.transferTo) {
      try { opts.transferTo.focus(); } catch (e) {}
    }
  }

  // ---------- Hover behavior ----------
  function bindHover() {
    var $doc = $(document);

    $doc.on('mouseenter.rbccmHover', SELECTOR, function () {
      if (!enabled) return;
      var $li = $(this);
      clearTimeout(closeTimer);

      // Close any other open menus. Transfer focus only if it was
      // stranded inside the menu being closed (Option C).
      $(SELECTOR + '.open').each(function () {
        if (this === $li[0]) return;
        var other = this;
        var focusInside = other.contains(document.activeElement);
        if (focusInside) {
          var newToggle = $li.find('> a.dropdown-toggle, > a').first()[0];
          closeLi(other, { transferTo: newToggle });
        } else {
          closeLi(other);
        }
      });

      // Open this one in hover mode if not already open
      if (!$li.hasClass('open')) {
        $li.addClass('open opened-by-hover')
           .attr('data-opened-by', 'hover');
        setMode($li, 'hover');
        $li.find('> a.dropdown-toggle, > a').first().attr('aria-expanded', 'true');
        lockSubmenuTabbing($li);
      }
    });

    $doc.on('mouseleave.rbccmHover', SELECTOR, function () {
      if (!enabled) return;
      var li = this;
      var $li = $(li);
      // Do not auto-close keyboard or click modes on mouseleave
      var mode = $li.attr('data-rbccm-mode');
      if (mode === 'keyboard' || mode === 'click') return;
      // Do not close if focus is inside (safety net)
      if (li.contains(document.activeElement)) return;

      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        if (!li.contains(document.activeElement)) {
          closeLi(li);
        }
      }, CLOSE_DELAY_MS);
    });
  }

  // ---------- Click on toggle in hover mode = no-op ----------
  function getHoverToggleHit(target) {
    if (!target || target.nodeType !== 1) return null;
    var anchor = target.closest && target.closest('a');
    if (!anchor) return null;
    if (anchor.closest('.dropdown-menu')) return null; // submenu link, never suppress
    var li = anchor.closest('li.dropdown');
    if (!li) return null;
    if (!$(li).is(SELECTOR)) return null;
    if (li.getAttribute('data-rbccm-mode') !== 'hover') return null;
    if (!li.classList.contains('open')) return null;
    return li;
  }

  function suppressIfToggleHover(e) {
    if (!enabled) return;
    if (getHoverToggleHit(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  // ---------- Click outside cleanup ----------
  function bindOutsideClick() {
    $(document).on('click.rbccmHover', function (e) {
      if (!enabled) return;
      var $tgt = $(e.target);
      if ($tgt.closest(SELECTOR).length) return;
      $(SELECTOR + '.open').each(function () { closeLi(this); });
    });
  }

  // ---------- Keyboard ----------
  function onKeydown(e) {
    if (!enabled) return;
    var key = e.key;

    // Escape: close any open dropdown
    if (key === 'Escape') {
      var $open = $(SELECTOR + '.open');
      if ($open.length) {
        $open.each(function () { closeLi(this); });
      }
      return;
    }

    // Tab forward: if a hover-mode menu is open, promote it to keyboard
    // mode so submenu links become tabbable. Do not preventDefault.
    if (key === 'Tab' && !e.shiftKey) {
      $(SELECTOR + '.open[data-rbccm-mode="hover"]').each(function () {
        var $li = $(this);
        $li.removeClass('opened-by-hover').removeAttr('data-opened-by');
        setMode($li, 'keyboard');
        unlockSubmenuTabbing($li);
      });
      return;
    }

    // Suppress Enter / Space on the TOGGLE only while in hover mode.
    // Submenu links are not affected.
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      if (getHoverToggleHit(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }

  // ---------- focusin / focusout ----------
  function bindFocusin() {
    $(document).on('focusin.rbccmHover', SELECTOR, function () {
      if (!enabled) return;
      var $li = $(this);
      if ($li.hasClass('open') && $li.attr('data-rbccm-mode') === 'hover') {
        $li.removeClass('opened-by-hover').removeAttr('data-opened-by');
        setMode($li, 'keyboard');
        unlockSubmenuTabbing($li);
      }
    });

    // focusout-close for keyboard mode only
    $(document).on('focusout.rbccmHover', SELECTOR, function () {
      if (!enabled) return;
      var li = this;
      setTimeout(function () {
        if (!li.contains(document.activeElement)) {
          var mode = li.getAttribute('data-rbccm-mode');
          if (mode === 'keyboard') {
            closeLi(li);
          }
        }
      }, 0);
    });
  }

  // ---------- MutationObserver: clear state when .open is removed ----------
  function bindModeObserver() {
    if (modeObs) modeObs.disconnect();
    modeObs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type !== 'attributes' || m.attributeName !== 'class') return;
        var li = m.target;
        if (li.matches && li.matches(SELECTOR) && !li.classList.contains('open')) {
          li.removeAttribute('data-rbccm-mode');
          li.removeAttribute('data-opened-by');
          $(li).find('.dropdown-menu a[tabindex="-1"]').removeAttr('tabindex');
        }
      });
    });
    document.querySelectorAll(SELECTOR).forEach(function (li) {
      modeObs.observe(li, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // ---------- Enable / Disable ----------
  function enable() {
    if (enabled) return;
    enabled = true;
    bindHover();
    bindOutsideClick();
    bindFocusin();
    bindModeObserver();
    document.addEventListener('mousedown', suppressIfToggleHover, true);
    document.addEventListener('click',     suppressIfToggleHover, true);
    document.addEventListener('keydown',   onKeydown,              true);
    var btn = document.getElementById(BTN_ID);
    if (btn) {
      btn.setAttribute('data-on', 'true');
      btn.textContent = 'Disable hover menu (preview)';
    }
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    $(document).off('.rbccmHover');
    document.removeEventListener('mousedown', suppressIfToggleHover, true);
    document.removeEventListener('click',     suppressIfToggleHover, true);
    document.removeEventListener('keydown',   onKeydown,              true);
    if (modeObs) { modeObs.disconnect(); modeObs = null; }
    $(SELECTOR).each(function () {
      $(this).removeClass('opened-by-hover')
             .removeAttr('data-opened-by')
             .removeAttr('data-rbccm-mode');
      unlockSubmenuTabbing($(this));
    });
    var btn = document.getElementById(BTN_ID);
    if (btn) {
      btn.setAttribute('data-on', 'false');
      btn.textContent = 'Enable hover menu (preview)';
    }
  }

  // ---------- Floating preview button ----------
  function injectButton() {
    if (document.getElementById(BTN_ID)) return;
    var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.setAttribute('data-on', 'false');
    btn.textContent = 'Enable hover menu (preview)';
    btn.addEventListener('click', function () {
      if (enabled) disable(); else enable();
    });
    document.body.appendChild(btn);
  }

  // ---------- Public API ----------
  window.rbccmHoverPreview = {
    enable:  enable,
    disable: disable,
    isEnabled: function () { return enabled; }
  };

  // ---------- Boot ----------
  $(function () {
    injectStyles();
    injectButton();
  });
})(window.jQuery);