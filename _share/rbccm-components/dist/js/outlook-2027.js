/*! RBCCM outlook-2027.js | v1 | built 2026-11-16T17:10:20.763Z
 *  rbccm-insight-cards, rbccm-strategic-themes, rbccm-animate */

/* ==== rbccm-insight-cards/rbccm-insight-cards.js ==== */
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
;

/* ==== rbccm-strategic-themes/rbccm-strategic-themes.js ==== */
/* =========================================================================
   RBCCM Strategic Themes - pinned scroll, tabs and drawn graphics
   Deploy path: /assets/rbccm/js/components/rbccm-strategic-themes.js
   =========================================================================
   Runs on every [data-strategic-themes] section. The skin prints the
   themes as a plain numbered list; this file turns the list into the
   interactive version and draws the graphics.

   Two interactive states (classes on the section):

     --pinned   Desktop. The section is one screen tall per theme and
                its stage sticks under the site header. Scrolling moves
                through the themes: each one holds, then glides to the
                next. The tab bars fill as you go; pressing a tab
                scrolls to that theme.

     --tabs     Everything else: narrower than 992px, a window shorter
                than 600px, a visitor who asked for reduced motion, a
                single theme, or a page where sticky positioning can't
                work (an ancestor that clips or scrolls). One theme
                shows at a time and the tabs switch it. Left and right
                arrow keys on a tab, and a sideways swipe on the
                themes, do the same.

   The state is re-chosen on resize. On each theme:
     --active   the theme that is showing (text visible, tab marked)
     --shown    its graphic is on screen, so its animation runs; the
                animation starts again each time the theme comes back

   Site header height: the stage sticks below any header that stays
   fixed at the top. It is measured from the page, or taken from
   data-strategic-themes-offset (the StickyOffset field) when set.

   Graphics ([data-strategic-themes-graphic]): defense (radar sweep),
   minerals (element tiles), ai (cell grid and value chain), energy
   (rising bar chart), canada (maple leaf of dots). Decoration only;
   the skin hides them from screen readers. The words on a graphic
   come from data-strategic-themes-caption, comma separated; for
   energy, "Chart title: word, word, word".

   Safe to include more than once: each section is set up once.
   ========================================================================= */
(function () {
  'use strict';

  var BLOCK = 'rbccm-strategic-themes';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var PIN_QUERY = '(min-width: 992px) and (min-height: 600px)';
  var MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  var uid = 0;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function gfx(name) { return BLOCK + '__gfx-' + name; }

  /* ---------- Small DOM helpers ---------- */

  /* HTML element with gfx classes, inline styles and CSS variables. */
  function el(names, styles, text) {
    var node = document.createElement('div');
    if (names) node.className = names.split(' ').map(gfx).join(' ');
    for (var key in styles || {}) {
      if (key.indexOf('--') === 0) node.style.setProperty(key, styles[key]);
      else node.style[key] = styles[key];
    }
    if (text != null) node.textContent = text;
    return node;
  }

  /* SVG element with attributes; "class" takes gfx names, "vars" sets
     CSS variables. */
  function svg(tag, attrs, children) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs || {}) {
      if (key === 'class') node.setAttribute('class', attrs[key].split(' ').map(gfx).join(' '));
      else if (key === 'vars') {
        for (var v in attrs.vars) node.style.setProperty(v, attrs.vars[v]);
      } else node.setAttribute(key, attrs[key]);
    }
    (children || []).forEach(function (child) { node.appendChild(child); });
    return node;
  }

  function caption(box, words) {
    if (!words.length) return;
    var row = el('caption fade', { '--t': '0.8s', '--d': '1s' });
    words.forEach(function (word) {
      var span = document.createElement('span');
      span.textContent = word;
      row.appendChild(span);
    });
    box.appendChild(row);
  }

  /* ---------- The graphics ---------- */

  var GRAPHICS = {};

  /* Radar: grid, rings and spokes draw in, a beam sweeps round, and
     five blips ping as the beam passes them. */
  GRAPHICS.defense = function (box) {
    var id = BLOCK + '-gfx-' + (++uid);
    var rings = [40, 30, 20, 10].map(function (r, i) {
      return svg('circle', { cx: 50, cy: 46, r: r, pathLength: 300, 'class': 'draw', vars: { '--d': (0.15 + i * 0.05) + 's' } });
    });
    var spokes = svg('g', { 'clip-path': 'url(#' + id + '-disc)' }, [
      svg('path', {
        d: 'M-10 46 L110 46 M-1.96 16 L101.96 76 M20 -5.96 L80 97.96 M50 -14 L50 106 M80 -5.96 L20 97.96 M101.96 16 L-1.96 76',
        pathLength: 300, 'class': 'draw', vars: { '--d': '0.45s' }
      })
    ]);
    box.appendChild(svg('svg', { viewBox: '0 0 100 100', 'class': 'svg' }, [
      svg('defs', {}, [
        svg('pattern', { id: id + '-grid', width: 3, height: 3, patternUnits: 'userSpaceOnUse', x: 50, y: 46 }, [
          svg('path', { d: 'M3 0H0V3', fill: 'none', stroke: 'rgba(0,49,104,.09)', 'stroke-width': 0.15 })
        ]),
        svg('clipPath', { id: id + '-disc' }, [svg('rect', { x: 8, y: 4, width: 84, height: 84, rx: 11 })])
      ]),
      svg('rect', { x: 8, y: 4, width: 84, height: 84, fill: 'url(#' + id + '-grid)', 'clip-path': 'url(#' + id + '-disc)', 'class': 'fade', vars: { '--t': '1.2s', '--d': '0.2s' } }),
      svg('g', { fill: 'none', stroke: 'rgba(0,49,104,.16)', 'stroke-width': 0.3, 'stroke-dasharray': 300 }, rings.concat([spokes])),
      svg('rect', { x: 8, y: 4, width: 84, height: 84, rx: 11, pathLength: 300, fill: 'none', stroke: 'rgba(0,49,104,.22)', 'stroke-width': 0.6, 'stroke-dasharray': 300, 'class': 'draw' })
    ]));

    var radar = el('radar fade', { '--t': '1s', '--d': '0.6s' });
    var sweep = el('radar-sweep');
    sweep.appendChild(el('radar-beam'));
    radar.appendChild(sweep);
    box.appendChild(radar);

    /* [x%, y%, pop delay, size px]. Each ring pings when the 4.5s sweep
       reaches the blip's bearing. */
    [[67, 23, 0.9, 12], [28, 34, 1.3, 11], [77, 62, 1.7, 13], [36, 78, 2.1, 10], [57, 46, 2.5, 10]].forEach(function (b) {
      var angle = ((Math.atan2(b[0] - 50, -(b[1] - 46)) * 180 / Math.PI) + 360) % 360;
      var hit = angle / 360 * 4.5;
      while (hit < b[2] + 0.3) hit += 4.5;
      var blip = el('blip', {
        left: b[0] + '%', top: b[1] + '%', width: b[3] + 'px', height: b[3] + 'px',
        margin: (-b[3] / 2) + 'px 0 0 ' + (-b[3] / 2) + 'px'
      });
      blip.appendChild(el('blip-dot pop', { '--d': b[2] + 's' }));
      blip.appendChild(el('blip-ring', { '--d': hit.toFixed(2) + 's' }));
      box.appendChild(blip);
    });
  };

  /* Element tiles: nine tiles pop in, then light up in turn. */
  GRAPHICS.minerals = function (box, words) {
    var order = [0, 4, 2, 7, 5, 1, 8, 3, 6];
    var tiles = el('tiles');
    [['3', 'Li', 'Lithium'], ['28', 'Ni', 'Nickel'], ['27', 'Co', 'Cobalt'], ['29', 'Cu', 'Copper'], ['6', 'C', 'Graphite'],
      ['60', 'Nd', 'Rare earths'], ['25', 'Mn', 'Manganese'], ['92', 'U', 'Uranium'], ['13', 'Al', 'Aluminum']].forEach(function (m, i) {
      var wrap = el('tile-wrap pop', { '--t': '0.55s', '--d': (0.1 + i * 0.07).toFixed(2) + 's' });
      var tile = el('tile', { '--d': (1.2 + order[i] * 0.7).toFixed(2) + 's' });
      tile.appendChild(el('tile-num', null, m[0]));
      tile.appendChild(el('tile-symbol', null, m[1]));
      tile.appendChild(el('tile-name', null, m[2]));
      wrap.appendChild(tile);
      tiles.appendChild(wrap);
    });
    box.appendChild(tiles);
    caption(box, words);
  };

  /* Cell grid: a wave of activity crosses 40 cells; below it a line
     joins the steps of the value chain and a dot travels along it. The
     caption words are the chain's labels. */
  GRAPHICS.ai = function (box, words) {
    var cells = el('cells');
    for (var k = 0; k < 40; k++) {
      cells.appendChild(el('cell', { '--d': (((k % 8) + Math.floor(k / 8)) * 0.11).toFixed(2) + 's' }));
    }
    box.appendChild(cells);

    var chain = el('chain');
    chain.appendChild(el('chain-fill'));
    chain.appendChild(el('chain-dot'));
    box.appendChild(chain);

    var labels = words.length ? words : ['', '', '', ''];
    var nodes = el('nodes');
    labels.forEach(function (label, i) {
      var delay = (0.4 + i * 0.25).toFixed(2) + 's';
      var node = el('node');
      node.appendChild(el('node-dot pop', { '--d': delay }));
      if (label) node.appendChild(el('node-label fade', { '--t': '0.6s', '--d': delay }, label));
      nodes.appendChild(node);
    });
    box.appendChild(nodes);
  };

  /* Bar chart: fourteen bars rise, a trend line draws over them and
     its end point pulses. */
  GRAPHICS.energy = function (box, words, title) {
    if (title) box.appendChild(el('chart-title fade', { '--t': '0.6s' }, title));
    var heights = [22, 26, 24, 30, 33, 31, 38, 42, 40, 48, 55, 60, 68, 78];
    var bars = el('bars');
    heights.forEach(function (h, i) {
      bars.appendChild(el('bar', {
        height: h + '%',
        background: i === heights.length - 1 ? '#003168' : 'rgba(0,81,165,' + (0.14 + i * 0.045).toFixed(2) + ')',
        '--d': (i * 0.06).toFixed(2) + 's'
      }));
    });
    box.appendChild(bars);
    box.appendChild(svg('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'class': 'curve' }, [
      svg('path', {
        d: 'M0 78 C 18 74, 30 66, 46 56 S 74 30, 100 6', fill: 'none', stroke: '#FFC72C', 'stroke-width': 1.6,
        'vector-effect': 'non-scaling-stroke', 'stroke-dasharray': 300, 'class': 'draw',
        vars: { '--t': '2s', '--d': '1.1s', '--e': 'cubic-bezier(0.6, 0, 0.2, 1)' }
      })
    ]));
    var peak = el('peak');
    peak.appendChild(el('peak-dot pop', { '--d': '2.9s' }));
    peak.appendChild(el('peak-ring'));
    box.appendChild(peak);
    caption(box, words);
  };

  /* Maple leaf: the outline draws, dots fill it from the bottom up,
     then flicker yellow at random. */
  GRAPHICS.canada = function (box, words) {
    var leaf = [[48.6, 94], [51.4, 94], [51.2, 77], [70, 80.5], [67.5, 73.5], [84, 60.5], [80, 57.5], [83, 45.5], [72, 47.5],
      [70, 42.5], [61.5, 51.5], [64, 29], [58, 32.5], [50, 17], [42, 32.5], [36, 29], [38.5, 51.5], [30, 42.5], [28, 47.5],
      [17, 45.5], [20, 57.5], [16, 60.5], [32.5, 73.5], [30, 80.5], [48.8, 77]];
    function inside(x, y) {
      var hit = false;
      for (var i = 0, j = leaf.length - 1; i < leaf.length; j = i++) {
        var xi = leaf[i][0], yi = leaf[i][1], xj = leaf[j][0], yj = leaf[j][1];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    }
    var parts = [svg('path', {
      d: 'M' + leaf.map(function (p) { return p.join(' '); }).join(' L') + ' Z',
      pathLength: 300, fill: 'none', stroke: 'rgba(0,49,104,.25)', 'stroke-width': 0.4,
      'stroke-dasharray': 300, 'stroke-linejoin': 'round', 'class': 'draw', vars: { '--t': '2.2s' }
    })];
    for (var y = 19; y < 80; y += 3.6) {
      for (var x = 16; x < 85; x += 3.6) {
        if (!inside(x, y)) continue;
        parts.push(svg('circle', {
          cx: x.toFixed(1), cy: y.toFixed(1), r: 1.15, 'class': 'leaf-dot',
          vars: {
            '--d': (0.3 + (80 - y) * 0.022 + Math.abs(x - 50) * 0.006).toFixed(2) + 's',
            '--h': (1.8 + ((x * 7 + y * 13) % 48) / 10).toFixed(2) + 's'
          }
        }));
      }
    }
    box.appendChild(svg('svg', { viewBox: '0 0 100 100', 'class': 'svg' }, parts));
    caption(box, words);
  };

  function drawGraphic(box) {
    var kind = box.getAttribute('data-strategic-themes-graphic');
    if (!GRAPHICS[kind] || box.firstChild) return;
    var raw = box.getAttribute('data-strategic-themes-caption') || '';
    var title = '';
    if (kind === 'energy' && raw.indexOf(':') !== -1) {
      title = raw.slice(0, raw.indexOf(':')).trim();
      raw = raw.slice(raw.indexOf(':') + 1);
    }
    var words = raw.split(',').map(function (w) { return w.trim(); }).filter(Boolean);
    GRAPHICS[kind](box, words, title);
    box.classList.add(BLOCK + '__graphic--ready');
  }

  /* ---------- Page checks ---------- */

  /* position: sticky does nothing inside an ancestor that clips or
     scrolls, so the pinned state is only used when none does. */
  function stickyCanWork(root) {
    var clips = function (node) {
      var cs = window.getComputedStyle(node);
      var ok = { visible: 1, clip: 1 };
      return !ok[cs.overflowX] || !ok[cs.overflowY];
    };
    for (var node = root.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
      if (clips(node)) return false;
    }
    /* Overflow on the body alone moves to the viewport and is harmless;
       on both html and body it makes the body a scroll box. */
    return !(document.body && clips(document.body) && clips(document.documentElement));
  }

  /* Height of whatever stays fixed at the top of the window (the site
     header), so the stage can stick just below it. */
  function measureOffset(root) {
    var set = root.getAttribute('data-strategic-themes-offset');
    if (set) return parseInt(set, 10) || 0;
    if (!document.elementsFromPoint) return 0;
    var bottom = 0;
    [0.1, 0.5, 0.9].forEach(function (fraction) {
      var stack = document.elementsFromPoint(window.innerWidth * fraction, 1);
      for (var i = 0; i < stack.length; i++) {
        if (root.contains(stack[i])) continue;
        for (var node = stack[i]; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
          var position = window.getComputedStyle(node).position;
          if (position !== 'fixed' && position !== 'sticky') continue;
          var rect = node.getBoundingClientRect();
          if (rect.top <= 1 && rect.bottom > 0 && rect.bottom < window.innerHeight * 0.5) bottom = Math.max(bottom, rect.bottom);
          break;
        }
      }
    });
    return Math.round(bottom);
  }

  /* ---------- One section ---------- */

  function setup(root) {
    if (root.getAttribute('data-strategic-themes-ready')) return;
    root.setAttribute('data-strategic-themes-ready', 'true');

    var stage = root.querySelector('.' + BLOCK + '__stage');
    var items = [].slice.call(root.querySelectorAll('[data-strategic-themes-item]'));
    var tabsBox = root.querySelector('[data-strategic-themes-tabs]');
    var tabs = [].slice.call(root.querySelectorAll('[data-strategic-themes-tab]'));
    var fills = tabs.map(function (tab) { return tab.querySelector('.' + BLOCK + '__tab-fill'); });
    var slides = items.map(function (item) { return item.querySelector('.' + BLOCK + '__slide'); });
    var count = items.length;
    if (!stage || !count) return;

    [].forEach.call(root.querySelectorAll('[data-strategic-themes-graphic]'), drawGraphic);

    var pinQuery = window.matchMedia(PIN_QUERY);
    var motionQuery = window.matchMedia(MOTION_QUERY);
    var mode = '';
    var active = -1;
    var offset = 0;
    var frame = 0;

    function setActive(index) {
      if (index === active) return;
      active = index;
      items.forEach(function (item, i) { item.classList.toggle(BLOCK + '__item--active', i === index); });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle(BLOCK + '__tab--active', i === index);
        if (i === index) tab.setAttribute('aria-current', 'true');
        else tab.removeAttribute('aria-current');
      });
    }

    function setShown(test) {
      items.forEach(function (item, i) { item.classList.toggle(BLOCK + '__item--shown', !!test(i)); });
    }

    /* Tabs state: show one theme. */
    function show(index) {
      index = clamp(index, 0, count - 1);
      setActive(index);
      setShown(function (i) { return i === index; });
      fills.forEach(function (fill, i) { if (fill) fill.style.width = i <= index ? '100%' : '0'; });
    }

    /* Pinned state: where the scroll is, as a theme position from 0 to
       count - 1. Each theme holds for the first and last fifth of its
       stretch and glides to the next in between. */
    function update() {
      frame = 0;
      if (mode !== 'pinned') return;
      var rect = root.getBoundingClientRect();
      var range = Math.max(1, rect.height - stage.offsetHeight);
      var progress = clamp((offset - rect.top) / range, 0, 1);
      var along = progress * (count - 1);
      var index = Math.min(count - 2, Math.floor(along));
      var t = clamp((along - index - 0.2) / 0.6, 0, 1);
      var position = Math.min(count - 1, index + t * t * (3 - 2 * t));

      slides.forEach(function (slide, i) {
        if (slide) slide.style.transform = 'translate3d(' + ((i - position) * 100).toFixed(3) + '%,0,0)';
      });
      fills.forEach(function (fill, i) {
        if (fill) fill.style.width = (clamp(position - i + 1, 0, 1) * 100).toFixed(2) + '%';
      });
      setActive(Math.round(position));
      setShown(function (i) { return Math.abs(position - i) < 0.7; });
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function go(index) {
      index = clamp(index, 0, count - 1);
      if (mode !== 'pinned') { show(index); return; }
      var rect = root.getBoundingClientRect();
      var range = Math.max(1, rect.height - stage.offsetHeight);
      var top = window.pageYOffset + rect.top - offset + (index / (count - 1)) * range + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }

    function chooseMode() {
      offset = measureOffset(root);
      root.style.setProperty('--rbccm-themes-offset', offset + 'px');
      var next = count > 1 && pinQuery.matches && !motionQuery.matches && stickyCanWork(root) ? 'pinned' : 'tabs';
      if (next !== mode) {
        mode = next;
        root.classList.add(BLOCK + '--enhanced');
        root.classList.toggle(BLOCK + '--pinned', mode === 'pinned');
        root.classList.toggle(BLOCK + '--tabs', mode === 'tabs');
        if (tabsBox) tabsBox.hidden = false;
        slides.forEach(function (slide) { if (slide) slide.style.transform = ''; });
        if (mode === 'tabs') show(active < 0 ? 0 : active);
      }
      if (mode === 'pinned') update();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { go(i); });
      tab.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var target = clamp(i + step, 0, count - 1);
        go(target);
        tabs[target].focus();
      });
    });

    /* Tabs state: a sideways swipe on the themes moves one theme. */
    var list = root.querySelector('.' + BLOCK + '__list');
    var startX = null;
    var startY = 0;
    if (list) {
      list.addEventListener('touchstart', function (e) {
        if (mode !== 'tabs' || e.touches.length !== 1) { startX = null; return; }
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      list.addEventListener('touchend', function (e) {
        if (startX === null || mode !== 'tabs') return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        startX = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(active + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', chooseMode);
    window.addEventListener('load', chooseMode);
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', chooseMode);
    chooseMode();
  }

  function init() {
    var roots = document.querySelectorAll('[data-strategic-themes]');
    for (var i = 0; i < roots.length; i++) setup(roots[i]);
  }

  init();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
;

/* ==== rbccm-animate/rbccm-animate.js ==== */
/* rbccm-animate.js
   =====================================================================
   Universal, framework-free scroll-triggered animation runtime for
   RBCCM composed TeamSite pages. Ported 1:1 from the MAAS+MATA page's
   inline animate.css bindings so multi-component pages get the same
   "nice" pacing (elements start hidden, JS adds a body class to reveal
   them, animate.css keyframes take it from there).

   The fadeIn / fadeInUp / fadeInDown / fadeInRight animations are built
   in, so animate.css is optional. If a page does load it, load it first:

     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
     <script src="rbccm-animate/rbccm-animate.js"></script>

   Any RBCCM section opts in by adding data-* attributes in its markup:

     data-animate-hero="fadeInUp"     Fires on load (staggered by
                                      data-animate-delay). For above-
                                      the-fold hero content.
     data-animate="fadeInUp"          Fires on scroll-in via IO.
     data-stagger-parent="fadeInUp"   When the parent enters view, its
                                      direct children animate in
                                      sequence (child 0 at 0ms, child 1
                                      at step ms, etc.).
       data-stagger-step="120"        Optional per-parent stagger step
                                      in ms (default 100).
     data-animate-delay="150"         Optional individual delay in ms.
     data-animate-duration="800"      Optional individual duration in ms
                                      (sets --animate-duration custom
                                      prop on the element).

   URL escape hatch:
     ?noanim=1  Forces every animated element to opacity: 1 immediately
                so full-page screenshot tools capture everything without
                needing to scroll. IntersectionObserver would otherwise
                leave below-fold sections hidden.

   Behavior notes:
     - Pre-state CSS (opacity: 0 on all data-* targets) is injected by
       this file so pages don't need to ship their own hide-until-JS
       stylesheet. Elements reveal only after JS adds .rbccm-anim-ready
       to <body> AND the animate.css class lands on the element.
     - Respects prefers-reduced-motion: forces opacity: 1 on every
       animated element via CSS. JS still runs but the fade/slide keyframes
       are visually skipped.
     - Idempotent. Multiple runs are safe (re-observation is a no-op).
     - Vanilla JS. No jQuery, no build step.
   ===================================================================== */
(function () {
  'use strict';

  /* Inject the pre-state CSS so animated elements are hidden until we
     add .rbccm-anim-ready to <body> AND the animate.css class lands on
     them. Any page that just links this JS gets the whole system --
     no per-component CSS to maintain. */
  function injectRuntimeCss() {
    if (document.getElementById('rbccm-animate-runtime-css')) return;
    var css = ''
      + '[data-animate],'
      + '[data-animate-hero],'
      + '[data-stagger-parent] > *{'
      + '  opacity:0;'
      + '}'
      + '.rbccm-anim-ready [data-animate].animate__animated,'
      + '.rbccm-anim-ready [data-animate-hero].animate__animated,'
      + '.rbccm-anim-ready [data-stagger-parent] > .animate__animated{'
      + '  opacity:1;'
      + '}'
      /* Slow animate.css defaults from the library-standard 1s to 1.3s.
         S&E composed pages have more compact sections than MAAS/MATA, so
         the tighter cadence made animations feel snappy on scroll. Any
         element that wants a bespoke duration can still override via
         data-animate-duration on the element itself (the JS sets the
         same --animate-duration custom prop). */
      + '.animate__animated{'
      + '  --animate-duration:1.3s;'
      + '}'
      /* The four animate.css animations the RBCCM components use, built in
         so they play even on pages that don't load animate.css. Component
         pages built in TeamSite often don't, and without these the classes
         had no animation behind them: elements jumped from hidden straight
         to visible (a flicker instead of a fade). Definitions match
         animate.css 4.1.1 exactly, so a page that does load it looks the
         same. */
      + '.animate__animated{'
      + '  animation-duration:var(--animate-duration,1.3s);'
      + '  animation-fill-mode:both;'
      + '}'
      + '.animate__fadeIn{animation-name:fadeIn}'
      + '.animate__fadeInUp{animation-name:fadeInUp}'
      + '.animate__fadeInDown{animation-name:fadeInDown}'
      + '.animate__fadeInRight{animation-name:fadeInRight}'
      + '@keyframes fadeIn{0%{opacity:0}to{opacity:1}}'
      + '@keyframes fadeInUp{0%{opacity:0;transform:translate3d(0,100%,0)}to{opacity:1;transform:translateZ(0)}}'
      + '@keyframes fadeInDown{0%{opacity:0;transform:translate3d(0,-100%,0)}to{opacity:1;transform:translateZ(0)}}'
      + '@keyframes fadeInRight{0%{opacity:0;transform:translate3d(100%,0,0)}to{opacity:1;transform:translateZ(0)}}'
      + '@media (prefers-reduced-motion: reduce){'
      + '  [data-animate],'
      + '  [data-animate-hero],'
      + '  [data-stagger-parent] > *{'
      + '    opacity:1 !important;'
      + '    animation:none !important;'
      + '  }'
      + '}';
    var style = document.createElement('style');
    style.id = 'rbccm-animate-runtime-css';
    style.textContent = css;
    /* Inject as FIRST child of <head> so any later rules from the
       animate.css CDN or page-specific stylesheets can still override
       specific animations if a page needs a bespoke feel. */
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }
  }

  /* Inject as EARLY as possible so pre-state hides elements before the
     browser paints. Waiting for DOMContentLoaded would leave a flash of
     visible content on slow initial parse. */
  injectRuntimeCss();

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var reduced = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ?noanim=1 in the URL forces every data-animate element to opacity 1
       immediately so screenshot tools capture everything without needing
       to scroll (IntersectionObserver would otherwise leave below-fold
       sections hidden). */
    var noanim = /[?&]noanim=1/.test(window.location.search);

    /* Adding .rbccm-anim-ready to <body> flips the runtime CSS from
       "hide everything with a data-* hook" to "hide until the animate
       class lands". */
    document.body.classList.add('rbccm-anim-ready');

    if (noanim) {
      document.querySelectorAll(
        '[data-animate], [data-animate-hero], [data-stagger-parent] > *'
      ).forEach(function (el) { el.style.opacity = '1'; });
      return;
    }

    function play(el, name, delay, duration) {
      if (!el || !name) return;
      /* setTimeout defers the class add so the browser has a chance to
         paint the pre-state. Without it, adding the class synchronously
         in the same tick can produce a flash on fast machines. */
      setTimeout(function () {
        if (duration) el.style.setProperty('--animate-duration', duration + 'ms');
        el.classList.add('animate__animated', 'animate__' + name);
      }, delay || 0);
    }

    /* ---- Hero on-load cascade ------------------------------------
       Runs immediately at page load, offset by each element's own
       data-animate-delay so a section reads eyebrow -> title -> sub
       -> CTA. No IntersectionObserver -- these are above the fold. */
    document.querySelectorAll('[data-animate-hero]').forEach(function (el) {
      var name = el.getAttribute('data-animate-hero') || 'fadeInUp';
      var delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
      var duration = parseInt(el.getAttribute('data-animate-duration') || '0', 10) || null;
      play(el, name, delay, duration);
    });

    /* Older browsers without IntersectionObserver just reveal
       everything without animation so nothing stays hidden. */
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-animate], [data-stagger-parent] > *').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    /* ---- Single-element reveals ---------------------------------- */
    var singleIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var name = el.getAttribute('data-animate') || 'fadeInUp';
        var delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
        var duration = parseInt(el.getAttribute('data-animate-duration') || '0', 10) || null;
        play(el, name, delay, duration);
        singleIo.unobserve(el);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      singleIo.observe(el);
    });

    /* ---- Stagger parents (children reveal sequentially) ----------
       Direct children reveal in order at (index * step) ms. Step
       is configurable per parent via data-stagger-step (default 100). */
    var staggerIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var parent = entry.target;
        var name = parent.getAttribute('data-stagger-parent') || 'fadeInUp';
        var step = parseInt(parent.getAttribute('data-stagger-step') || '100', 10);
        if (!isFinite(step) || step < 0) step = 100;
        var kids = parent.children;
        for (var i = 0; i < kids.length; i++) {
          play(kids[i], name, i * step);
        }
        staggerIo.unobserve(parent);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('[data-stagger-parent]').forEach(function (el) {
      staggerIo.observe(el);
    });
  });
})();
;
