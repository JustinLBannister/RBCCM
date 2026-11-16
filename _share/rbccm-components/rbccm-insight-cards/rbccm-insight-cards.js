/* =========================================================================
   RBCCM Insight Cards - share popup + filter pills
   Deploy path: /assets/rbccm/js/components/rbccm-insight-cards.js
   =========================================================================
   Runs on every [data-insight-cards] section. The skin prints every
   story into the page; this file only adds two things, and both stay
   hidden if it never loads:

   1. Share popup
      Each story's share button ([data-insight-share]) is printed
      hidden and shown here. Pressing it opens the section's one share
      popup ([data-insight-share-panel]) beside that button, with the
      links filled in for that story:
        Copy link     copies the story's address
        X (Twitter)   twitter.com/intent/tweet
        LinkedIn      linkedin.com/sharing/share-offsite
        Email         mailto: with the title as the subject
        More apps     the device's own share sheet, where it has one
      The story's address is its link; a story with no link shares the
      page it is on. Escape, the close button or a click outside closes
      the popup and focus returns to the share button. Tab stays inside
      the popup while it is open.

   2. Filter pills
      Shown when the skin printed them ([data-insight-filters]). Each
      pill shows the stories whose filter label matches; the first pill
      shows them all. The result is announced to screen readers.

   Safe to include more than once (each section's skin outputs the
   script tag): sections are set up once and the page-level listeners
   are bound once.
   ========================================================================= */
(function () {
  'use strict';

  var BLOCK = 'rbccm-insight-cards';
  var OPEN_CLASS = BLOCK + '__share--open';
  var CARD_OPEN_CLASS = BLOCK + '__card--share-open';
  var ITEM_OPEN_CLASS = BLOCK + '__item--share-open';
  var FILTER_ACTIVE_CLASS = BLOCK + '__filter--active';

  /* The popup that is open, if any: { panel, trigger, card, item }. */
  var open = null;
  var flashTimer = 0;

  function closest(el, selector) {
    return el && el.closest ? el.closest(selector) : null;
  }

  function absoluteUrl(url) {
    if (!url || url === '#') return window.location.href.split('#')[0];
    try { return new URL(url, window.location.href).href; }
    catch (e) { return window.location.href.split('#')[0]; }
  }

  /* ---------- Share popup ---------- */

  function focusable(panel) {
    var nodes = panel.querySelectorAll('a[href], button');
    var list = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].offsetParent !== null) list.push(nodes[i]);
    }
    return list;
  }

  function flash(panel, message) {
    var el = panel.querySelector('[data-insight-share-flash]');
    if (!el) return;
    el.textContent = message;
    window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(function () { el.textContent = ''; }, 2000);
  }

  function closeShare(returnFocus) {
    if (!open) return;
    var state = open;
    open = null;
    state.panel.classList.remove(OPEN_CLASS);
    state.panel.hidden = true;
    state.panel.style.top = '';
    state.panel.style.bottom = '';
    state.panel.style.left = '';
    state.panel.style.right = '';
    state.trigger.setAttribute('aria-expanded', 'false');
    if (state.card) state.card.classList.remove(CARD_OPEN_CLASS);
    if (state.item) state.item.classList.remove(ITEM_OPEN_CLASS);
    var el = state.panel.querySelector('[data-insight-share-flash]');
    if (el) el.textContent = '';
    if (returnFocus) state.trigger.focus();
  }

  function openShare(trigger) {
    var root = closest(trigger, '[data-insight-cards]');
    var panel = root && root.querySelector('[data-insight-share-panel]');
    if (!panel) return;
    closeShare(false);

    var title = trigger.getAttribute('data-insight-share-title') || document.title;
    var url = absoluteUrl(trigger.getAttribute('data-insight-share-url'));
    var u = encodeURIComponent(url);
    var t = encodeURIComponent(title);
    var links = {
      x: 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t,
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      email: 'mailto:?subject=' + t + '&body=' + u
    };
    var options = panel.querySelectorAll('a[data-insight-share-to]');
    for (var i = 0; i < options.length; i++) {
      var kind = options[i].getAttribute('data-insight-share-to');
      if (links[kind]) options[i].setAttribute('href', links[kind]);
    }
    panel.setAttribute('aria-label', 'Share: ' + title);
    panel.setAttribute('data-insight-share-current-url', url);
    panel.setAttribute('data-insight-share-current-title', title);

    var card = closest(trigger, '.' + BLOCK + '__card');
    var item = closest(trigger, '.' + BLOCK + '__item');
    trigger.parentNode.appendChild(panel);
    panel.hidden = false;
    if (card) card.classList.add(CARD_OPEN_CLASS);
    if (item) item.classList.add(ITEM_OPEN_CLASS);
    trigger.setAttribute('aria-expanded', 'true');
    open = { panel: panel, trigger: trigger, card: card, item: item };

    /* Keep the popup on screen: drop below when there is no room
       above, and switch sides when it would leave the viewport. */
    var rect = panel.getBoundingClientRect();
    if (rect.top < 8) {
      panel.style.bottom = 'auto';
      panel.style.top = '100%';
    }
    if (rect.left < 8) {
      panel.style.right = 'auto';
      panel.style.left = '0';
    } else if (rect.right > window.innerWidth - 8) {
      panel.style.left = 'auto';
      panel.style.right = '0';
    }

    void panel.offsetWidth;            /* start the fade from the hidden state */
    panel.classList.add(OPEN_CLASS);
    /* Focus the first share option (Copy link), not the close button. */
    var first = panel.querySelector('[data-insight-share-to]') || focusable(panel)[0];
    if (first) first.focus();
  }

  function copyLink(panel) {
    var url = panel.getAttribute('data-insight-share-current-url') || window.location.href;
    var done = function (ok) { flash(panel, ok ? 'Link copied' : 'Copy failed'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
      return;
    }
    /* Older browsers. */
    var field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    try { done(document.execCommand('copy')); } catch (e) { done(false); }
    document.body.removeChild(field);
  }

  function nativeShare(panel) {
    if (!navigator.share) return;
    navigator.share({
      title: panel.getAttribute('data-insight-share-current-title') || document.title,
      url: panel.getAttribute('data-insight-share-current-url') || window.location.href
    }).then(function () { closeShare(true); }, function () {});
  }

  /* ---------- Filter pills ---------- */

  function applyFilter(root, pill) {
    var value = pill.getAttribute('data-insight-filter') || '';
    var pills = root.querySelectorAll('[data-insight-filter]');
    for (var i = 0; i < pills.length; i++) {
      var on = pills[i] === pill;
      pills[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      pills[i].classList.toggle(FILTER_ACTIVE_CLASS, on);
    }
    var items = root.querySelectorAll('.' + BLOCK + '__item');
    var shown = 0;
    for (var j = 0; j < items.length; j++) {
      var match = value === '' || items[j].getAttribute('data-insight-filter-tag') === value;
      items[j].hidden = !match;
      if (match) shown++;
    }
    if (open && open.item && open.item.hidden) closeShare(false);
    var status = root.querySelector('[data-insight-status]');
    if (status) {
      status.textContent = 'Showing ' + shown + ' of ' + items.length +
        (value === '' ? '' : ': ' + value);
    }
  }

  /* ---------- Set up each section once ---------- */

  function setup(root) {
    if (root.getAttribute('data-insight-cards-ready')) return;
    root.setAttribute('data-insight-cards-ready', 'true');

    if (root.querySelector('[data-insight-share-panel]')) {
      var shares = root.querySelectorAll('[data-insight-share]');
      for (var i = 0; i < shares.length; i++) shares[i].hidden = false;
      var native = root.querySelector('[data-insight-share-native]');
      if (native && navigator.share) native.hidden = false;
    }

    var filters = root.querySelector('[data-insight-filters]');
    if (filters) filters.hidden = false;
  }

  function init() {
    var roots = document.querySelectorAll('[data-insight-cards]');
    for (var i = 0; i < roots.length; i++) setup(roots[i]);
  }

  init();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }

  /* ---------- Page-level listeners, bound once ---------- */

  if (window.__rbccmInsightCardsBound) return;
  window.__rbccmInsightCardsBound = true;

  document.addEventListener('click', function (e) {
    var trigger = closest(e.target, '[data-insight-share]');
    if (trigger) {
      e.preventDefault();
      if (open && open.trigger === trigger) closeShare(true);
      else openShare(trigger);
      return;
    }

    if (closest(e.target, '[data-insight-share-close]')) {
      e.preventDefault();
      closeShare(true);
      return;
    }

    var option = closest(e.target, '[data-insight-share-to]');
    if (option && open) {
      var kind = option.getAttribute('data-insight-share-to');
      if (kind === 'copy') { e.preventDefault(); copyLink(open.panel); }
      else if (kind === 'native') { e.preventDefault(); nativeShare(open.panel); }
      else { window.setTimeout(function () { closeShare(false); }, 0); }
      return;
    }

    var pill = closest(e.target, '[data-insight-filter]');
    if (pill) {
      var root = closest(pill, '[data-insight-cards]');
      if (root) applyFilter(root, pill);
      return;
    }

    if (open && !closest(e.target, '[data-insight-share-panel]')) closeShare(false);
  });

  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeShare(true);
      return;
    }
    if (e.key !== 'Tab') return;
    var list = focusable(open.panel);
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (!open.panel.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
