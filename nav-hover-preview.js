/*!
 * nav-hover-preview.js
 * 
 * Adds mouse-hover support to the primary navigation dropdowns while preserving
 * full keyboard accessibility. Mouse-driven hover is layered on top of the
 * existing click/keyboard behavior without affecting screen-reader semantics.
 * 
 * Behavior (when enabled):
 *   - Hover over a top-level toggle opens its dropdown.
 *   - Moving the mouse away closes the dropdown after a 150ms grace period.
 *   - Tab from a hover-opened toggle moves focus into the first submenu link
 *     and promotes the menu to keyboard state.
 *   - Escape closes any open dropdown and restores focus to the toggle.
 *   - Submenu links (Campus Recruiting, Search Opportunities, etc.) always
 *     remain naturally tabbable and clickable. Their Enter/Space behavior is
 *     never suppressed.
 *   - Bootstrap's own dropdown data-api keydown/click handlers are replaced
 *     by this script to avoid double-handling.
 * 
 * Mobile note: This script is desktop-only by design. Mobile and touch devices
 * never fire mouseenter/mouseleave events the same way, so the hover layer is
 * effectively inert on touch. Existing tap-to-open behavior is preserved.
 * 
 * Public API:
 *   window.rbccmHoverPreview.enable()
 *   window.rbccmHoverPreview.disable()
 *   window.rbccmHoverPreview.isEnabled()
 */
(function (root) {
'use strict';


var LOG_PREFIX = '[nav-hover-preview]';


// Silent guard: if jQuery is not present, this script does nothing useful.
var $ = root.jQuery || root.$;
if (!$) {
    console.warn(LOG_PREFIX, 'jQuery not found - preview script disabled.');
    root.rbccmHoverPreview = {
enable: function () {},
disable: function () {},
isEnabled: function () { return false; }
    };
return;
  }


var NS = 'rbccmHoverPreview';
var SELECTOR_LI = 'li.dropdown';
var SELECTOR_TOGGLE = 'li.dropdown > a.dropdown-toggle';
var SELECTOR_SUBMENU = 'li.dropdown > .dropdown-menu';
var SELECTOR_SUBLINK = 'li.dropdown .dropdown-menu a';


var CLOSE_DELAY_MS = 150;
var ESC_SUPPRESS_MS = 300;
var STYLE_ID = 'rbccm-hover-preview-style';


// Internal state
var enabled = false;
var closeTimers = new WeakMap();
var mouseX = 0;
var mouseY = 0;
var suppressFocusOpenUntil = 0;
var captureKeydownRef = null;


function labelOf($li) {
return ($li.find('> a.dropdown-toggle').first().text() || '').trim().substring(0, 20);
  }


// ---------- helpers ----------


function isMouseInLiRegion($li) {
var liEl = $li[0];
if (!liEl) return false;
var liR = liEl.getBoundingClientRect();
if (mouseX >= liR.left && mouseX <= liR.right &&
        mouseY >= liR.top && mouseY <= liR.bottom) {
return true;
    }
var sm = liEl.querySelector(':scope > .dropdown-menu');
if (sm && getComputedStyle(sm).display !== 'none') {
var sR = sm.getBoundingClientRect();
if (mouseX >= sR.left && mouseX <= sR.right &&
          mouseY >= sR.top && mouseY <= sR.bottom) {
return true;
      }
    }
return false;
  }


function openLi($li) {
if ($li.hasClass('open')) return;
$('li.dropdown.open').not($li).each(function () {
closeLiNow($(this), { suppress: false });
    });
    $li.removeAttr('data-rbccm-suppress');
    $li.addClass('open');
    $li.find('> a.dropdown-toggle').attr('aria-expanded', 'true');
    console.log(LOG_PREFIX, 'open', labelOf($li));
  }


function openLiAsHover($li) {
openLi($li);
    $li.addClass('opened-by-hover');
    $li.attr('data-rbccm-mode', 'hover');
  }


function openLiAsKeyboard($li) {
openLi($li);
    $li.removeClass('opened-by-hover');
    $li.attr('data-rbccm-mode', 'keyboard');
  }


function closeLiNow($li, opts) {
    opts = opts || {};
var liEl = $li[0];
var timer = closeTimers.get(liEl);
if (timer) {
clearTimeout(timer);
      closeTimers.delete(liEl);
    }
var $tog = $li.find('> a.dropdown-toggle');
// If focus is inside the submenu (not on the toggle itself), blur it so
// focus does not stay on a soon-to-be-hidden element.
if (liEl.contains(document.activeElement) && document.activeElement !== $tog[0]) {
      document.activeElement.blur();
    }
    $li.removeClass('open opened-by-hover').removeAttr('data-rbccm-mode');
    $tog.attr('aria-expanded', 'false');
if (opts.suppress !== false) {
      $li.attr('data-rbccm-suppress', 'true');
    }
    console.log(LOG_PREFIX, 'close', labelOf($li), 'suppress=' + (opts.suppress !== false));
  }


function scheduleClose($li) {
var liEl = $li[0];
var existing = closeTimers.get(liEl);
if (existing) clearTimeout(existing);
var id = setTimeout(function () {
      closeTimers.delete(liEl);
if (!isMouseInLiRegion($li)) {
closeLiNow($li, { suppress: false });
      } else {
        console.log(LOG_PREFIX, 'close-skipped (mouse still in region)', labelOf($li));
      }
    }, CLOSE_DELAY_MS);
    closeTimers.set(liEl, id);
  }


function cancelClose($li) {
var liEl = $li[0];
var timer = closeTimers.get(liEl);
if (timer) {
clearTimeout(timer);
      closeTimers.delete(liEl);
    }
  }


function forceCloseAll() {
$('li.dropdown.open').each(function () {
closeLiNow($(this), { suppress: true });
    });
  }


// ---------- CSS suppression rule ----------
// The site CSS opens the panel via li.dropdown:hover > .dropdown-menu { display: block }
// We need a way to forcibly hide the panel even while the cursor is over the
// toggle (for example, immediately after pressing Escape). The
// data-rbccm-suppress attribute below beats the :hover rule.
function injectStyle() {
if (document.getElementById(STYLE_ID)) return;
var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
'li.dropdown[data-rbccm-suppress="true"] > .dropdown-menu,' +
'li.dropdown[data-rbccm-suppress="true"]:hover > .dropdown-menu,' +
'li.dropdown[data-rbccm-suppress="true"]:hover > ul.dropdown-menu {' +
'  display: none !important;' +
'  visibility: hidden !important;' +
'  opacity: 0 !important;' +
'}';
    document.head.appendChild(style);
  }


function removeStyle() {
var el = document.getElementById(STYLE_ID);
if (el) el.remove();
  }


// ---------- keyboard capture handler ----------
// Bound on WINDOW with capture=true so it runs before any document-level
// capture handler. This guarantees Escape and Tab take precedence over
// Bootstrap's data-api handlers or any other listener on document.
function buildCaptureKeydown() {
return function captureKeydown(e) {
if (e.key !== 'Tab' && e.key !== 'Escape') return;


if (e.key === 'Escape') {
var $open = $('li.dropdown.open');
if (!$open.length) return;
        console.log(LOG_PREFIX, 'Escape pressed, closing open menus');
        suppressFocusOpenUntil = performance.now() + ESC_SUPPRESS_MS;
        $open.each(function () {
var $li = $(this);
var $tog = $li.find('> a.dropdown-toggle');
var hadFocusInside = $li[0].contains(document.activeElement);
var wasToggleFocused = document.activeElement === $tog[0];
closeLiNow($li, { suppress: true });
if (hadFocusInside && !wasToggleFocused) {
            $tog.focus();
          }
        });
        e.preventDefault();
        e.stopImmediatePropagation();
// Safety-net rechecks: if anything reopens a menu within 150ms,
// force-close it again. Protects against late focus events or any
// third-party script that might reopen state.
setTimeout(function () {
if ($('li.dropdown.open').length) {
            console.warn(LOG_PREFIX, 'Escape recheck #1 found reopened menu, forcing close');
forceCloseAll();
          }
        }, 50);
setTimeout(function () {
if ($('li.dropdown.open').length) {
            console.warn(LOG_PREFIX, 'Escape recheck #2 found reopened menu, forcing close');
forceCloseAll();
          }
        }, 150);
return;
      }


// Tab while a hover-opened menu has the cursor parked on it: move focus
// into the first submenu link instead of letting natural Tab skip past.
if (e.key === 'Tab' && !e.shiftKey) {
var $hoverOpen = $('li.dropdown.open.opened-by-hover');
if (!$hoverOpen.length) return;
var matched = null;
        $hoverOpen.each(function () {
if (isMouseInLiRegion($(this))) {
            matched = this;
return false;
          }
        });
if (!matched) return;
var $li = $(matched);
var $first = $li.find('.dropdown-menu a').first();
if (!$first.length) return;
        e.preventDefault();
        e.stopImmediatePropagation();
openLiAsKeyboard($li);
        $first.focus();
        console.log(LOG_PREFIX, 'Tab from hover ->', $first.text().trim().substring(0, 20));
      }
    };
  }


// ---------- enable / disable ----------


function enable() {
if (enabled) {
      console.log(LOG_PREFIX, 'enable() called but already enabled');
return;
    }
    enabled = true;
    console.log(LOG_PREFIX, 'enable');


injectStyle();


// Remove Bootstrap's competing dropdown data-api handlers. This script
// fully replaces the keydown/click/focus behavior for top-level dropdowns.
$(document).off('keydown.bs.data-api.dropdown');
$(document).off('click.bs.data-api.dropdown');
$(document).off('focusin.bs.data-api.dropdown');


// Window-capture keydown for Escape and parked-Tab.
    captureKeydownRef = buildCaptureKeydown();
    window.addEventListener('keydown', captureKeydownRef, true);


// Mouse position tracking. Also clears the suppress attribute on any LI
// whose region the cursor has left.
$(document).on('mousemove.' + NS, function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
$('li.dropdown[data-rbccm-suppress="true"]').each(function () {
if (!isMouseInLiRegion($(this))) {
$(this).removeAttr('data-rbccm-suppress');
        }
      });
    });


// Hover on the LI
$(document).on('mouseenter.' + NS, SELECTOR_LI, function () {
var $li = $(this);
cancelClose($li);
if ($li.attr('data-rbccm-suppress') === 'true') return;
if (performance.now() < suppressFocusOpenUntil) return;
if (!$li.hasClass('open')) {
openLiAsHover($li);
      } else if (!$li.attr('data-rbccm-mode')) {
$li.attr('data-rbccm-mode', 'hover');
      }
    });


$(document).on('mouseleave.' + NS, SELECTOR_LI, function () {
var $li = $(this);
$li.removeAttr('data-rbccm-suppress');
if (!$li.hasClass('open')) return;
scheduleClose($li);
    });


// Submenu panel hover. The panel is absolutely positioned outside the LI's
// bounding box, so we watch it separately to smooth the seam between
// toggle and panel.
$(document).on('mouseenter.' + NS, SELECTOR_SUBMENU, function () {
cancelClose($(this).closest('li.dropdown'));
    });
$(document).on('mouseleave.' + NS, SELECTOR_SUBMENU, function () {
var $li = $(this).closest('li.dropdown');
if (!$li.hasClass('open')) return;
scheduleClose($li);
    });


// Click on a top-level toggle: toggle keyboard state.
$(document).on('click.' + NS, SELECTOR_TOGGLE, function (e) {
var $tog = $(this);
var $li = $tog.closest('li.dropdown');
if ($tog.attr('href') === '#' || !$tog.attr('href')) {
e.preventDefault();
      }
if ($li.hasClass('open')) {
closeLiNow($li, { suppress: false });
      } else {
$li.removeAttr('data-rbccm-suppress');
openLiAsKeyboard($li);
      }
e.stopPropagation();
    });


// Tab past the last submenu link: close the current LI so natural Tab
// order continues to the next top-level toggle.
$(document).on('keydown.' + NS, SELECTOR_SUBLINK, function (e) {
if (e.key !== 'Tab' || e.shiftKey) return;
var $a = $(this);
var $li = $a.closest('li.dropdown');
var $links = $li.find('.dropdown-menu a');
if ($links.index($a) === $links.length - 1) {
closeLiNow($li, { suppress: false });
      }
    });


// Focus arriving at a toggle (Tab into it from elsewhere) opens the menu
// in keyboard state. Suppressed briefly after Escape to avoid reopen loops.
$(document).on('focusin.' + NS, SELECTOR_TOGGLE, function () {
if (performance.now() < suppressFocusOpenUntil) {
console.log(LOG_PREFIX, 'focusin suppressed (post-Escape window)');
return;
      }
var $li = $(this).closest('li.dropdown');
$('li.dropdown.open').not($li).each(function () {
closeLiNow($(this), { suppress: false });
      });
if (!$li.hasClass('open')) {
$li.removeAttr('data-rbccm-suppress');
openLiAsKeyboard($li);
      }
    });


// Focus arriving inside the submenu cancels a pending close if the mouse
// is also parked on the LI. Promotes state from hover to keyboard.
$(document).on('focusin.' + NS, SELECTOR_SUBLINK, function () {
var $li = $(this).closest('li.dropdown');
if (isMouseInLiRegion($li)) cancelClose($li);
if ($li.attr('data-rbccm-mode') !== 'keyboard') {
$li.attr('data-rbccm-mode', 'keyboard');
$li.removeClass('opened-by-hover');
      }
    });


// Focus leaving the LI entirely (and mouse not on it) closes the menu.
$(document).on('focusout.' + NS, SELECTOR_LI, function () {
var $li = $(this);
setTimeout(function () {
if (!$li.hasClass('open')) return;
if ($li[0].contains(document.activeElement)) return;
if (isMouseInLiRegion($li)) return;
closeLiNow($li, { suppress: false });
      }, 0);
    });


// Click anywhere outside any dropdown LI closes all open dropdowns.
$(document).on('click.' + NS, function (e) {
if (!$(e.target).closest('li.dropdown').length) {
$('li.dropdown.open').each(function () {
closeLiNow($(this), { suppress: false });
        });
      }
    });
  }


function disable() {
if (!enabled) return;
enabled = false;
console.log(LOG_PREFIX, 'disable');


if (captureKeydownRef) {
window.removeEventListener('keydown', captureKeydownRef, true);
captureKeydownRef = null;
    }
$(document).off('.' + NS);
$('li.dropdown')
      .removeClass('open opened-by-hover')
      .removeAttr('data-rbccm-mode data-rbccm-suppress');
$('a.dropdown-toggle').attr('aria-expanded', 'false');
removeStyle();
  }


function isEnabled() {
return enabled;
  }


root.rbccmHoverPreview = {
enable: enable,
disable: disable,
isEnabled: isEnabled
  };


// ---------- toggle button injection ----------
// Renders a fixed-position button in the bottom-right corner that flips
// between Enable and Disable. Injected on DOM ready. Default state on every
// page load is disabled (no persistence across navigations).
var BTN_ID = 'rbccm-hover-preview-toggle';
var LABEL_ENABLE = 'Enable hover menu (preview)';
var LABEL_DISABLE = 'Disable hover menu (preview)';

function injectToggleButton() {
if (document.getElementById(BTN_ID)) return;
var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.textContent = LABEL_ENABLE;
    btn.setAttribute('aria-pressed', 'false');
var s = btn.style;
    s.position = 'fixed';
    s.right = '20px';
    s.bottom = '20px';
    s.zIndex = '2147483647';
    s.padding = '12px 22px';
    s.border = '0';
    s.borderRadius = '999px';
    s.background = '#1d6b4a';
    s.color = '#ffffff';
    s.font = '600 14px/1.2 Arial, Helvetica, sans-serif';
    s.cursor = 'pointer';
    s.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    btn.addEventListener('mouseenter', function () { btn.style.background = '#175839'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = '#1d6b4a'; });
    btn.addEventListener('click', function () {
if (isEnabled()) {
disable();
        btn.textContent = LABEL_ENABLE;
        btn.setAttribute('aria-pressed', 'false');
      } else {
enable();
        btn.textContent = LABEL_DISABLE;
        btn.setAttribute('aria-pressed', 'true');
      }
    });
    document.body.appendChild(btn);
    console.log(LOG_PREFIX, 'toggle button injected');
  }

$(function () { injectToggleButton(); });


})(window);