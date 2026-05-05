/* =========================================================
   rbccm hover-nav PREVIEW BUNDLE (v3-preview)
   Self-contained. Dormant until the toggle button is clicked.
   - Adds a "Enable hover menu (preview)" button to the page
   - Injects CSS + binds JS handlers on enable
   - Removes CSS + unbinds all handlers on disable
   - Remembers state in sessionStorage so refreshes don't surprise reviewers
   - Does NOT modify nav.min.js or rbccm.2.css
   Manual rollback (any time): $('.navbar').off('.rbccmHover');
   ========================================================= */
(function ($) {
  'use strict';

  if (!window.jQuery) {
    console.warn('[rbccmHover] jQuery not found — preview script aborting');
    return;
  }

  var STORAGE_KEY = 'rbccmHoverPreview';
  var STYLE_ID    = 'rbccmHoverPreviewStyles';
  var BTN_ID      = 'rbccmHoverPreviewToggle';
  var SELECTOR = 'ul.nav.navbar-right.navbar-nav > li.dropdown,' +
                 'ul.nav.navbar-nav.navbar-right > li.dropdown';
  var CLOSE_DELAY = 150;
  var closeTimers = new WeakMap();
  var observer = null;
  var enabled = false;

  // ---------- CSS (injected on enable, removed on disable) ----------
  var CSS = [
    '/* rbccm hover-nav preview styles */',
    '.navbar-nav > li.dropdown.open > .dropdown-menu::before,',
    '.navbar-nav > li.dropdown:hover > .dropdown-menu::before {',
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
    '  outline: 1.5px dotted currentColor; outline-offset: -2px;',
    '}',
    /* Preview button styling */
    '#' + BTN_ID + ' {',
    '  position: fixed; bottom: 16px; right: 16px; z-index: 99999;',
    '  padding: 10px 14px; border-radius: 999px; border: 0;',
    '  font: 600 13px/1 system-ui, sans-serif; cursor: pointer;',
    '  box-shadow: 0 4px 14px rgba(0,0,0,.18);',
    '  background: #00386b; color: #fff;',
    '  transition: background .15s ease, transform .15s ease;',
    '}',
    '#' + BTN_ID + '[aria-pressed="true"] { background: #006a4e; }',
    '#' + BTN_ID + ':focus-visible {',
    '  outline: 2px solid #ffd700; outline-offset: 2px;',
    '}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  function removeStyles() {
    var style = document.getElementById(STYLE_ID);
    // Keep the button styles around even when disabled, so we re-inject minimal.
    if (style) style.remove();
    var btnOnly = document.createElement('style');
    btnOnly.id = STYLE_ID;
    btnOnly.textContent =
      '#' + BTN_ID + '{position:fixed;bottom:16px;right:16px;z-index:99999;' +
      'padding:10px 14px;border-radius:999px;border:0;font:600 13px/1 system-ui,sans-serif;' +
      'cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.18);background:#00386b;color:#fff;}' +
      '#' + BTN_ID + ':focus-visible{outline:2px solid #ffd700;outline-offset:2px;}';
    document.head.appendChild(btnOnly);
  }

  // ---------- HOVER PATCH BODY (v3 logic, agreed with a11y team) ----------
  function open($li, openedBy) {
    if (!$li.hasClass('open')) {
      $li.addClass('open');
      $li.find('> .dropdown-toggle').attr('aria-expanded', 'true');
    }
    $li.toggleClass('opened-by-hover', openedBy === 'hover');
    if (openedBy === 'click') $li.attr('data-opened-by', 'click');
    console.log('[rbccmHover] open via', openedBy);
  }
  function close($li) {
    if (!$li.hasClass('open')) return;
    $li.removeClass('open opened-by-hover').removeAttr('data-opened-by');
    $li.find('> .dropdown-toggle').attr('aria-expanded', 'false');
    console.log('[rbccmHover] close');
  }
  function closeSiblings($li) {
    $li.siblings('.dropdown.open').each(function () { close($(this)); });
  }

  function bindHandlers() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      console.log('[rbccmHover] coarse pointer — hover handlers not bound');
      return;
    }

    $(document).on('mouseenter.rbccmHover', SELECTOR, function () {
      var $li = $(this);
      var $focusedMenu = $(document.activeElement).closest('.dropdown.open');
      if ($focusedMenu.length && $focusedMenu[0] !== $li[0]) return;
      clearTimeout(closeTimers.get($li[0]));
      closeSiblings($li);
      open($li, 'hover');
    });

    $(document).on('mouseleave.rbccmHover', SELECTOR, function () {
      var $li = $(this);
      if ($li.attr('data-opened-by') === 'click') return;
      var t = setTimeout(function () {
        if ($.contains($li[0], document.activeElement)) return;
        close($li);
      }, CLOSE_DELAY);
      closeTimers.set($li[0], t);
    });

    $(document).on('click.rbccmHover', SELECTOR + ' > .dropdown-toggle', function () {
      var $li = $(this).parent();
      setTimeout(function () {
        if ($li.hasClass('open')) {
          $li.removeClass('opened-by-hover').attr('data-opened-by', 'click');
        }
      }, 0);
    });

    $(document).on('focusin.rbccmHover', SELECTOR + ' > .dropdown-toggle', function () {
      var $toggle = $(this);
      if (!$toggle.is(':focus-visible')) return;
      var $li = $toggle.parent();
      if ($li.hasClass('opened-by-hover')) {
        $li.removeClass('opened-by-hover');
        console.log('[rbccmHover] tabbed into hover-opened toggle — restored normal keys');
        return;
      }
      if (!$li.hasClass('open')) {
        closeSiblings($li);
        open($li, 'keyboard');
      }
    });

    $(document).on('keydown.rbccmHover', SELECTOR + ' > .dropdown-toggle', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      var $li = $(this).parent();
      if ($li.hasClass('opened-by-hover') && document.activeElement !== this) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[rbccmHover] suppressed Enter/Space on toggle');
      }
    });

    $(document).on('focusout.rbccmHover', SELECTOR, function () {
      var $li = $(this);
      setTimeout(function () {
        if (!$.contains($li[0], document.activeElement) && !$li.is(':hover')) {
          $li.removeClass('opened-by-hover').removeAttr('data-opened-by');
        }
      }, 0);
    });

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== 'class') return;
        var $li = $(m.target);
        if (!$li.hasClass('open')) {
          $li.removeClass('opened-by-hover').removeAttr('data-opened-by');
        }
      });
    });
    $(SELECTOR).each(function () {
      observer.observe(this, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function unbindHandlers() {
    $(document).off('.rbccmHover');
    $('.navbar').off('.rbccmHover');
    if (observer) { observer.disconnect(); observer = null; }
    // Reset any state we may have left on the DOM
    $(SELECTOR).removeClass('opened-by-hover').removeAttr('data-opened-by');
  }

  // ---------- ENABLE / DISABLE ----------
  function enable() {
    if (enabled) return;
    injectStyles();
    bindHandlers();
    enabled = true;
    sessionStorage.setItem(STORAGE_KEY, 'on');
    updateButton();
    console.log('[rbccmHover] PREVIEW: enabled');
  }
  function disable() {
    if (!enabled) return;
    unbindHandlers();
    removeStyles();
    enabled = false;
    sessionStorage.setItem(STORAGE_KEY, 'off');
    updateButton();
    console.log('[rbccmHover] PREVIEW: disabled');
  }

  // ---------- TOGGLE BUTTON ----------
  function buildButton() {
    if (document.getElementById(BTN_ID)) return;
    var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'Enable hover menu (preview)';
    btn.addEventListener('click', function () {
      enabled ? disable() : enable();
    });
    document.body.appendChild(btn);
  }
  function updateButton() {
    var btn = document.getElementById(BTN_ID);
    if (!btn) return;
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.textContent = enabled
      ? 'Disable hover menu (preview)'
      : 'Enable hover menu (preview)';
  }

  // ---------- BOOTSTRAP THE PREVIEW UI ----------
  $(function () {
    // Always inject minimal button styles so the button itself is visible
    var initStyle = document.createElement('style');
    initStyle.id = STYLE_ID;
    initStyle.textContent =
      '#' + BTN_ID + '{position:fixed;bottom:16px;right:16px;z-index:99999;' +
      'padding:10px 14px;border-radius:999px;border:0;font:600 13px/1 system-ui,sans-serif;' +
      'cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.18);background:#00386b;color:#fff;}' +
      '#' + BTN_ID + ':focus-visible{outline:2px solid #ffd700;outline-offset:2px;}';
    document.head.appendChild(initStyle);

    buildButton();

    // Restore last preview state from sessionStorage
    if (sessionStorage.getItem(STORAGE_KEY) === 'on') {
      enable();
    }
  });

  // Expose for console debugging on the preview page
  window.rbccmHoverPreview = { enable: enable, disable: disable };
})(jQuery);