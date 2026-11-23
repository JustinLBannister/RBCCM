/* =========================================================================
   RBCCM Strategic Themes - pinned scroll, tabs and drawn graphics
   Deploy path: /assets/rbccm/js/components/rbccm-strategic-themes.js
   =========================================================================
   Runs on every [data-strategic-themes] section. The skin prints the
   themes as a plain numbered list; this file turns the list into the
   interactive version and draws the graphics.

   Two interactive states (classes on the section):

     --pinned   The section is one screen tall per theme and its
                stage sticks under the site header. Scrolling moves
                through the themes: each one holds, then glides to the
                next. The tab bars fill as you go; pressing a tab
                scrolls to that theme. From 992px the text and picture
                sit side by side. Below that the header scrolls away
                first and the stage sticks from the tabs down, with the
                picture in the height that is left.

     --tabs     Everything else: pinning turned off by the skin
                (data-strategic-themes-pin="no", the PinnedScroll
                field), a window shorter than 600px, a narrow
                window with no room left for the picture, a visitor who
                asked for reduced motion, a single theme, or a page
                where sticky positioning can't work (an ancestor that
                clips or scrolls). One theme shows at a time and the
                tabs switch it. Left and right arrow keys on a tab, and
                a sideways swipe on the themes, do the same.

   Each theme has round buttons beside its own button
   ([data-strategic-themes-control]): previous, next and pause.
   Previous and next step one theme. Each drawn graphic plays through
   once when its theme shows, then rests. Pause stops that movement
   part-way (class --still on the section) and starts it again; the scroll and the layout do not change. Moving to
   another theme, by any route, starts the movement again, so a theme
   never arrives paused. Pause shows on themes that have a drawn
   graphic. The graphics always start moving, whatever the device's
   reduced-motion setting; pause is how a visitor turns them off. The
   ring round the pause button shows how far through its one play the
   showing graphic is (up to the end of its last animation). It holds
   while paused and stays full once the graphic has finished. The
   button then shows play, and pressing it plays the graphic again.
   With --loop on the section (the LoopAnimation field) the graphics
   keep repeating instead, and the ring shows how far through one
   round the graphic is.

   The state is re-chosen on resize. On each theme:
     --active   the theme that is showing (text visible, tab marked)
     --shown    its graphic is on screen, so its animation plays once;
                it plays again each time the theme comes back

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
  var PIN_QUERY = '(min-height: 600px)';
  var WIDE_QUERY = '(min-width: 992px)';
  var MIN_PICTURE = 140;       /* narrow pinned layout: least height for the picture */
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

  /* Radar: grid, rings and spokes draw in, a beam sweeps round twice
     (9s), and five blips ping as the beam passes them, each once. The
     animations carry no idle time after their last movement, so the
     pause button's ring ends when the picture stops moving. */
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
    var wideQuery = window.matchMedia(WIDE_QUERY);
    var motionQuery = window.matchMedia(MOTION_QUERY);
    var mode = '';
    var active = -1;
    var offset = 0;
    var lead = 0;
    var frame = 0;
    var still = false;         /* the visitor paused the graphics */
    /* --loop (the LoopAnimation field): the graphics keep repeating,
       so they never finish and the ring follows one round at a time. */
    var looping = root.classList.contains(BLOCK + '--loop');

    function control(item, kind) {
      return item ? item.querySelector('[data-strategic-themes-control="' + kind + '"]') : null;
    }

    /* Previous and next go pale at each end. Pause shows on a theme
       with a drawn graphic. It reads as pressed (the play icon) while
       paused and once the graphic has played through; pressing it
       then plays the graphic again. */
    function syncControls() {
      items.forEach(function (item) {
        var prev = control(item, 'prev');
        var next = control(item, 'next');
        var pause = control(item, 'pause');
        if (prev) prev.setAttribute('aria-disabled', active <= 0 ? 'true' : 'false');
        if (next) next.setAttribute('aria-disabled', active >= count - 1 ? 'true' : 'false');
        if (pause) {
          pause.hidden = !item.querySelector('[data-strategic-themes-graphic]');
          pause.setAttribute('aria-pressed', still || (loopDone && item === items[active]) ? 'true' : 'false');
        }
      });
    }

    function setActive(index) {
      if (index === active) return;
      /* A round button that has focus is about to be hidden with its
         theme: note which one, and hand focus to the same button on
         the theme that is coming in. */
      var held = document.activeElement;
      var kind = held && items[active] && items[active].contains(held) && held.getAttribute('data-strategic-themes-control');
      active = index;
      /* A pause lasts for the theme it was pressed on, and the theme
         coming in plays from the start. */
      still = false;
      root.classList.remove(BLOCK + '--still');
      resetLoop();
      startRing();
      items.forEach(function (item, i) { item.classList.toggle(BLOCK + '__item--active', i === index); });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle(BLOCK + '__tab--active', i === index);
        if (i === index) tab.setAttribute('aria-current', 'true');
        else tab.removeAttribute('aria-current');
      });
      syncControls();
      if (kind) {
        var same = control(items[index], kind);
        if (same) same.focus({ preventScroll: true });
      }
    }

    function setShown(test) {
      items.forEach(function (item, i) { item.classList.toggle(BLOCK + '__item--shown', !!test(i)); });
    }

    /* Tabs state: the graphics wait until the section has scrolled
       into view, so the first one plays where it can be seen and not
       while the page is loading further up. */
    var seen = !('IntersectionObserver' in window);
    if (!seen) {
      var watcher = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          watcher.disconnect();
          seen = true;
          if (mode === 'tabs') {
            setShown(function (n) { return n === active; });
            resetLoop();
            startRing();
          }
          return;
        }
      }, { threshold: 0.3 });
      watcher.observe(root);
    }

    /* Tabs state: show one theme. */
    function show(index) {
      index = clamp(index, 0, count - 1);
      setActive(index);
      setShown(function (i) { return seen && i === index; });
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
      var progress = clamp((offset - lead - rect.top) / range, 0, 1);
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

    /* Pinned state: the page position at which theme index is showing. */
    function themeTop(index) {
      var rect = root.getBoundingClientRect();
      var range = Math.max(1, rect.height - stage.offsetHeight);
      return window.pageYOffset + rect.top - offset + lead + (index / (count - 1)) * range + 1;
    }

    function go(index) {
      index = clamp(index, 0, count - 1);
      if (mode !== 'pinned') { show(index); return; }
      window.scrollTo({ top: themeTop(index), behavior: 'smooth' });
    }

    function setMode(next) {
      if (next === mode) return;
      mode = next;
      root.classList.add(BLOCK + '--enhanced');
      root.classList.toggle(BLOCK + '--pinned', mode === 'pinned');
      root.classList.toggle(BLOCK + '--tabs', mode === 'tabs');
      if (tabsBox) tabsBox.hidden = false;
      slides.forEach(function (slide) { if (slide) slide.style.transform = ''; });
      if (mode === 'tabs') show(active < 0 ? 0 : active);
    }

    /* Narrow pinned layout: the header scrolls away and the stage
       sticks from the tabs down. lead is how far the tabs sit below
       the top of the stage, less a small gap above them. */
    function measureLead() {
      lead = 0;
      if (mode === 'pinned' && !wideQuery.matches && tabsBox) {
        lead = Math.max(0, Math.round(tabsBox.getBoundingClientRect().top - stage.getBoundingClientRect().top) - 16);
      }
      root.style.setProperty('--rbccm-themes-lead', lead + 'px');
    }

    /* Narrow pinned layout: is there room under the text for the picture? */
    function pictureFits() {
      var visual = root.querySelector('.' + BLOCK + '__visual');
      return !visual || visual.clientHeight >= MIN_PICTURE;
    }

    function chooseMode() {
      offset = measureOffset(root);
      root.style.setProperty('--rbccm-themes-offset', offset + 'px');
      var pinAllowed = root.getAttribute('data-strategic-themes-pin') !== 'no';
      var canPin = pinAllowed && count > 1 && pinQuery.matches && !motionQuery.matches && stickyCanWork(root);
      setMode(canPin ? 'pinned' : 'tabs');
      measureLead();
      if (mode === 'pinned' && !wideQuery.matches && !pictureFits()) {
        setMode('tabs');
        measureLead();
      }
      if (mode === 'pinned') update();
      syncControls();
    }

    /* Pause: stop or restart the movement in the showing graphic. Once
       the graphic has played through, the same button plays it again. */
    function togglePause() {
      if (loopDone) { replay(); return; }
      still = !still;
      root.classList.toggle(BLOCK + '--still', still);
      syncControls();
      startRing();
    }

    /* The ring round the pause button: how far the showing graphic is
       through its one play. The animation that is followed is the one
       that ends last (delay included), so the ring is full when the
       whole graphic has come to rest. It is looked up again when the
       theme changes, because the animations start afresh each time. */
    var ringFrame = 0;
    var loop = null;
    var loopItem = -1;
    var loopFound = 0;
    var loopEnd = 0;       /* when the followed animation ends, in ms */
    var loopDone = false;  /* the showing graphic has played through */

    function resetLoop() {
      loop = null;
      loopEnd = 0;
      loopDone = false;
      loopFound = 0;
    }

    /* Play the showing graphic again from the start: its animations
       run while the theme is --shown, so take that off and put it back. */
    function replay() {
      var item = items[active];
      if (!item) return;
      var shownClass = BLOCK + '__item--shown';
      var was = item.classList.contains(shownClass);
      item.classList.remove(shownClass);
      void item.offsetWidth;
      if (was) item.classList.add(shownClass);
      still = false;
      root.classList.remove(BLOCK + '--still');
      resetLoop();
      syncControls();
      startRing();
    }

    function findLoop(item) {
      var box = item && item.querySelector('[data-strategic-themes-graphic]');
      if (!box || !box.getAnimations) return null;
      var best = null;
      var latest = 0;
      box.getAnimations({ subtree: true }).forEach(function (animation) {
        var timing = animation.effect && animation.effect.getComputedTiming ? animation.effect.getComputedTiming() : null;
        if (looping) {
          /* Repeating: follow the longest animation that repeats. */
          if (!timing || timing.iterations !== Infinity) return;
          if (timing.duration > latest) { latest = timing.duration; best = animation; }
          return;
        }
        if (!timing || !isFinite(timing.endTime)) return;
        if (timing.endTime > latest) { latest = timing.endTime; best = animation; }
      });
      return best;
    }

    function drawRing() {
      ringFrame = 0;
      var item = items[active];
      var ring = item && item.querySelector('[data-strategic-themes-ring]');
      if (ring) {
        var now = Date.now();
        if (looping) {
          if (loopItem !== active || !loop || loop.playState === 'idle' || now - loopFound > 1000) {
            loop = findLoop(item);
            loopItem = active;
            loopFound = now;
          }
          var round = loop ? loop.effect.getComputedTiming().progress : null;
          ring.style.strokeDashoffset = String(100 - (round || 0) * 100);
          if (!still) ringFrame = window.requestAnimationFrame(drawRing);
          return;
        }
        if (loopItem !== active) resetLoop();
        var wasDone = loopDone;
        if (!loopDone && (loopItem !== active || !loop || loop.playState === 'idle' || now - loopFound > 1000)) {
          var found = findLoop(item);
          var end = found ? found.effect.getComputedTiming().endTime : 0;
          /* The followed animation has ended and gone (or only shorter
             ones are left): the graphic has played through. */
          if (loop && end < loopEnd) loopDone = true;
          else { loop = found; loopEnd = end; }
          loopFound = now;
        }
        loopItem = active;
        var progress = 0;
        if (loopDone) progress = 1;
        else if (loop && loopEnd > 0) progress = Math.min(1, Math.max(0, (Number(loop.currentTime) || 0) / loopEnd));
        if (progress >= 1) loopDone = true;
        /* Nothing to follow (or not started yet): an empty ring. */
        ring.style.strokeDashoffset = String(100 - progress * 100);
        /* Played through: the button turns to play. */
        if (loopDone && !wasDone) syncControls();
      }
      if (!still && !loopDone) ringFrame = window.requestAnimationFrame(drawRing);
    }

    function startRing() {
      if (!ringFrame) ringFrame = window.requestAnimationFrame(drawRing);
    }

    root.addEventListener('click', function (e) {
      var button = e.target.closest ? e.target.closest('[data-strategic-themes-control]') : null;
      if (!button || !root.contains(button)) return;
      var kind = button.getAttribute('data-strategic-themes-control');
      if (kind === 'pause') { togglePause(); return; }
      if (button.getAttribute('aria-disabled') === 'true') return;
      go(active + (kind === 'next' ? 1 : -1));
    });

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
    [].forEach.call(root.querySelectorAll('[data-strategic-themes-controls]'), function (box) { box.hidden = false; });
    startRing();
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
