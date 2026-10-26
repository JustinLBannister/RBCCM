/* =========================================================================
   Variant picker - shared dev tool for component local-test pages.
   Not shipped. Local previews only.
   =========================================================================
   How a test page uses it:

     1. Put data-variant="Button text" on each variant's label element
        (the .demo-note / .demo-label that sits above the variant).
        A variant = that label plus every sibling after it, up to the
        next [data-variant] element. <script>/<link>/<style> siblings
        are never included, and data-variant-end on an element stops a
        group early (for shared content after the last variant).

     2. Include this script right AFTER the last variant and BEFORE any
        component scripts:
          <script src="../local-test-fixtures/variant-picker.js"></script>

   Clicking a variant puts it in the URL (#variant=slug) and reloads.
   On load the picker removes every other variant from the page before
   the component scripts run, so each variant initializes exactly as it
   would on its own real page: carousels measure correctly, scroll
   animations play, no cross-talk between instances. "Show all" keeps
   everything.

   Optional body attributes:
     data-picker-title="rbccm-awards"   bar title (default: <title>)
     data-picker-default="all"          initial choice when the URL has
                                        no #variant (default: first)

   Pages with fixed-position test chrome (e.g. the hero's fake nav) can
   offset it with the --variant-picker-h custom property this sets on
   the root element.

   Build a page (opt-in): when variant labels also carry
   data-build-component="<component folder>" (rbccm-global does this),
   a "Build a page" button appears next to "Show all". It opens a panel
   where devs toggle components in load order, name the page, and copy
   the matching command:
     npm run build -- --page=<name> --components=<folder,folder,...>
   Picks are kept in localStorage so they survive the reload that
   switching variants does.
   ========================================================================= */
(function () {
  'use strict';
  if (window.__variantPicker) return;
  window.__variantPicker = true;

  var body = document.body;
  var labels = Array.prototype.slice.call(document.querySelectorAll('[data-variant]'));
  if (!labels.length) return;

  var SKIP = { SCRIPT: 1, LINK: 1, STYLE: 1, TEMPLATE: 1, NOSCRIPT: 1 };
  function slugify(s) {
    return String(s).toLowerCase().replace(/&/g, 'and').replace(/\+/g, 'plus')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  var used = {};
  var groups = labels.map(function (label) {
    var name = label.getAttribute('data-variant') || 'Variant';
    var slug = slugify(name) || 'variant';
    if (used[slug]) slug += '-' + (++used[slug]); else used[slug] = 1;
    var nodes = [label];
    var n = label.nextElementSibling;
    while (n && !n.hasAttribute('data-variant') && !n.hasAttribute('data-variant-end') && !SKIP[n.tagName]) {
      nodes.push(n);
      n = n.nextElementSibling;
    }
    return { name: name, slug: slug, nodes: nodes };
  });

  var m = location.hash.match(/(?:^#|&)variant=([^&]+)/);
  var current = m ? decodeURIComponent(m[1]) : (body.getAttribute('data-picker-default') || groups[0].slug);
  if (current !== 'all' && !groups.some(function (g) { return g.slug === current; })) {
    // Stale link (e.g. a variant that was since removed): fall back to the
    // first variant and clean the URL so it doesn't keep pointing at it.
    current = groups[0].slug;
    if (m && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }

  // Remove the other variants before any component script initializes.
  if (current !== 'all') {
    groups.forEach(function (g) {
      if (g.slug === current) return;
      g.nodes.forEach(function (node) { if (node.parentNode) node.parentNode.removeChild(node); });
    });
  }

  /* ---------- bar ------------------------------------------------------ */
  var css = ''
    + '.variant-picker{background:#003168;color:#fff;font:13px/1.2 Roboto,Arial,sans-serif;padding:14px 20px;position:sticky;top:0;z-index:10000;box-shadow:0 2px 12px rgba(0,0,0,.25);box-sizing:border-box}'
    + '.variant-picker *{box-sizing:border-box}'
    + '.variant-picker__title{font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#FFC72C;margin:0 0 10px}'
    + '.variant-picker__row{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:flex-start}'
    + '.variant-picker__row>.variant-picker__group+.variant-picker__group{border-left:1px solid rgba(255,255,255,.3);padding-left:20px}'
    + '.variant-picker__group{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.variant-picker__label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:rgba(255,255,255,.7);margin-right:4px}'
    + '.variant-picker__btn{align-items:center;background:transparent;border:1px solid #fff;border-radius:100px;color:#fff;cursor:pointer;display:inline-flex;font:500 15px/1 Roboto,Arial,sans-serif;height:44px;justify-content:center;padding:0 20px;position:relative;overflow:hidden;transition:background .15s,border-color .15s,color .15s,box-shadow .15s}'
    + '.variant-picker__btn:hover,.variant-picker__btn:focus-visible{background:rgba(255,255,255,.08);outline:none}'
    + '.variant-picker__btn:focus-visible{box-shadow:0 0 0 2px #003168,0 0 0 4px #FFC72C}'
    + '.variant-picker__btn--active{background:#FFC72C;border-color:#FFC72C;color:#003168;isolation:isolate}'
    + '.variant-picker__btn--active:hover{background:#E5B325;border-color:#E5B325;color:#003168;box-shadow:0 6px 18px rgba(0,0,0,.18)}'
    + '.variant-picker__btn--active::before{background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.55) 50%,transparent 100%);bottom:0;content:"";left:-60%;opacity:0;pointer-events:none;position:absolute;top:0;transform:skewX(-18deg);width:40%;z-index:0}'
    + '.variant-picker__btn--active:hover::before{animation:variant-picker-shine 600ms ease-out}'
    + '@keyframes variant-picker-shine{0%{left:-60%;opacity:0}20%{opacity:1}80%{opacity:1}100%{left:120%;opacity:0}}'
    + '.variant-picker__note{font-size:11px;color:rgba(255,255,255,.6);margin:10px 0 0}'
    + '.variant-picker--building{position:relative}'
    + '.variant-picker__btn--open{background:#fff;border-color:#fff;color:#003168}'
    + '.variant-picker__btn--open:hover,.variant-picker__btn--open:focus-visible{background:#E6ECF4;border-color:#E6ECF4}'
    + '.variant-picker__build{border-top:1px solid rgba(255,255,255,.3);margin-top:14px;padding-top:14px;display:flex;flex-direction:column;gap:12px}'
    + '.variant-picker__build[hidden]{display:none}'
    + '.variant-picker__chip{align-items:center;background:transparent;border:1px solid rgba(255,255,255,.55);border-radius:100px;color:#fff;cursor:pointer;display:inline-flex;font:400 14px/1 Roboto,Arial,sans-serif;gap:8px;height:34px;padding:0 14px}'
    + '.variant-picker__chip:hover,.variant-picker__chip:focus-visible{border-color:#fff;outline:none}'
    + '.variant-picker__chip:focus-visible{box-shadow:0 0 0 2px #003168,0 0 0 4px #FFC72C}'
    + '.variant-picker__chip[aria-pressed="true"]{background:#fff;border-color:#fff;color:#003168}'
    + '.variant-picker__num{align-items:center;background:#003168;border-radius:50%;color:#FFC72C;display:inline-flex;font-size:11px;font-weight:700;height:18px;justify-content:center;width:18px}'
    + '.variant-picker__input{background:#fff;border:0;border-radius:4px;color:#003168;font:400 14px/1 Roboto,Arial,sans-serif;height:34px;padding:0 10px;width:200px}'
    + '.variant-picker__input:focus-visible{outline:2px solid #FFC72C;outline-offset:2px}'
    + '.variant-picker__link{background:none;border:0;color:#fff;cursor:pointer;font:400 13px/1 Roboto,Arial,sans-serif;padding:4px;text-decoration:underline}'
    + '.variant-picker__link:focus-visible{outline:2px solid #FFC72C;outline-offset:2px}'
    + '.variant-picker__cmd-row{align-items:center;display:flex;flex-wrap:wrap;gap:10px}'
    + '.variant-picker__cmd{background:#00214a;border:1px solid rgba(255,255,255,.25);border-radius:4px;color:#fff;flex:1 1 420px;font:13px/1.4 Menlo,Consolas,monospace;margin:0;min-width:0;overflow-x:auto;padding:9px 12px;user-select:all;white-space:nowrap}'
    + '.variant-picker__cmd--empty{color:rgba(255,255,255,.6);user-select:none}'
    + '.variant-picker__btn--small{font-size:14px;height:36px;padding:0 16px}'
    + '.variant-picker__btn[disabled]{cursor:not-allowed;opacity:.45}'
    + '.variant-picker__status{color:#FFC72C;font-size:12px;min-width:50px}';
  var style = document.createElement('style');
  style.id = 'variant-picker-css';
  style.textContent = css;
  document.head.appendChild(style);

  function button(text, slug) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'variant-picker__btn' + (slug === current ? ' variant-picker__btn--active' : '');
    b.textContent = text;
    b.setAttribute('aria-pressed', slug === current ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (slug === current) return;
      location.hash = 'variant=' + encodeURIComponent(slug);
      location.reload();
    });
    return b;
  }

  var bar = document.createElement('div');
  bar.className = 'variant-picker';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Variant picker (dev only)');

  var title = document.createElement('p');
  title.className = 'variant-picker__title';
  title.textContent = (body.getAttribute('data-picker-title') || document.title || 'Component') + ' - variant picker';
  bar.appendChild(title);

  var row = document.createElement('div');
  row.className = 'variant-picker__row';

  var left = document.createElement('div');
  left.className = 'variant-picker__group';
  var lbl = document.createElement('span');
  lbl.className = 'variant-picker__label';
  lbl.textContent = 'Variant';
  left.appendChild(lbl);
  groups.forEach(function (g) { left.appendChild(button(g.name, g.slug)); });

  var right = document.createElement('div');
  right.className = 'variant-picker__group';
  right.appendChild(button('Show all', 'all'));

  row.appendChild(left);
  row.appendChild(right);
  bar.appendChild(row);

  var note = document.createElement('p');
  note.className = 'variant-picker__note';
  note.textContent = 'Each variant loads on its own (the page reloads), so carousels and animations initialize the same way they would on a real page.';
  bar.appendChild(note);

  /* ---------- build a page (opt-in) ------------------------------------ */
  var buildable = labels.filter(function (l) { return l.hasAttribute('data-build-component'); })
    .map(function (l) { return { name: l.getAttribute('data-variant') || l.getAttribute('data-build-component'), folder: l.getAttribute('data-build-component') }; });

  if (buildable.length) {
    var STORE = 'rbccm-variant-picker-build';
    var state = { open: false, page: 'my-page', picks: [] };
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (saved) {
        state.open = !!saved.open;
        state.page = typeof saved.page === 'string' ? saved.page : state.page;
        state.picks = (saved.picks || []).filter(function (f) {
          return buildable.some(function (b) { return b.folder === f; });
        });
      }
    } catch (e) { /* storage blocked: start fresh */ }
    var save = function () {
      try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
    };
    var pageSlug = function () {
      return String(state.page).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'my-page';
    };

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'variant-picker__btn';
    toggle.textContent = 'Build a page';
    toggle.setAttribute('aria-controls', 'variant-picker-build');
    right.appendChild(toggle);

    var panel = document.createElement('div');
    panel.className = 'variant-picker__build';
    panel.id = 'variant-picker-build';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Build a page');

    var chipRow = document.createElement('div');
    chipRow.className = 'variant-picker__group';
    var chipLbl = document.createElement('span');
    chipLbl.className = 'variant-picker__label';
    chipLbl.textContent = 'Components, in load order';
    chipRow.appendChild(chipLbl);
    var chips = buildable.map(function (b) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'variant-picker__chip';
      chip.setAttribute('data-folder', b.folder);
      chip.title = b.folder;
      chip.addEventListener('click', function () {
        var i = state.picks.indexOf(b.folder);
        if (i === -1) state.picks.push(b.folder); else state.picks.splice(i, 1);
        render();
      });
      chipRow.appendChild(chip);
      return { el: chip, data: b };
    });

    var nameRow = document.createElement('div');
    nameRow.className = 'variant-picker__group';
    var nameLbl = document.createElement('label');
    nameLbl.className = 'variant-picker__label';
    nameLbl.htmlFor = 'variant-picker-page';
    nameLbl.textContent = 'Page name';
    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'variant-picker-page';
    input.className = 'variant-picker__input';
    input.value = state.page;
    input.setAttribute('spellcheck', 'false');
    input.addEventListener('input', function () { state.page = input.value; render(); });
    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'variant-picker__link';
    allBtn.textContent = 'Pick all';
    allBtn.addEventListener('click', function () {
      buildable.forEach(function (b) { if (state.picks.indexOf(b.folder) === -1) state.picks.push(b.folder); });
      render();
    });
    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'variant-picker__link';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', function () { state.picks = []; render(); });
    nameRow.appendChild(nameLbl);
    nameRow.appendChild(input);
    nameRow.appendChild(allBtn);
    nameRow.appendChild(clearBtn);

    var cmdRow = document.createElement('div');
    cmdRow.className = 'variant-picker__cmd-row';
    var cmd = document.createElement('code');
    cmd.className = 'variant-picker__cmd';
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'variant-picker__btn variant-picker__btn--small';
    copy.textContent = 'Copy command';
    var status = document.createElement('span');
    status.className = 'variant-picker__status';
    status.setAttribute('role', 'status');
    cmdRow.appendChild(cmd);
    cmdRow.appendChild(copy);
    cmdRow.appendChild(status);

    var hint = document.createElement('p');
    hint.className = 'variant-picker__note';
    hint.style.margin = '0';

    panel.appendChild(chipRow);
    panel.appendChild(nameRow);
    panel.appendChild(cmdRow);
    panel.appendChild(hint);
    bar.appendChild(panel);

    var command = function () {
      return 'npm run build -- --page=' + pageSlug() + ' --components=' + state.picks.join(',');
    };

    var render = function () {
      panel.hidden = !state.open;
      toggle.setAttribute('aria-expanded', state.open ? 'true' : 'false');
      toggle.className = 'variant-picker__btn' + (state.open ? ' variant-picker__btn--open' : '');
      // Open panel is tall; let the bar scroll away instead of covering the page.
      bar.classList.toggle('variant-picker--building', state.open);
      chips.forEach(function (c) {
        var n = state.picks.indexOf(c.data.folder);
        c.el.setAttribute('aria-pressed', n === -1 ? 'false' : 'true');
        c.el.textContent = '';
        if (n !== -1) {
          var num = document.createElement('span');
          num.className = 'variant-picker__num';
          num.setAttribute('aria-hidden', 'true');
          num.textContent = String(n + 1);
          c.el.appendChild(num);
        }
        c.el.appendChild(document.createTextNode(c.data.name));
      });
      var has = state.picks.length > 0;
      cmd.textContent = has ? command() : 'Pick at least one component';
      cmd.className = 'variant-picker__cmd' + (has ? '' : ' variant-picker__cmd--empty');
      copy.disabled = !has;
      hint.textContent = 'Run from the RBCCM folder. Bundles in the order picked into dist/css/' + pageSlug()
        + '.css and dist/js/' + pageSlug() + '.js (.min files too once npm install has been run).';
      status.textContent = '';
      save();
      syncHeight();
    };

    toggle.addEventListener('click', function () { state.open = !state.open; render(); });

    copy.addEventListener('click', function () {
      var text = command();
      var done = function () { status.textContent = 'Copied'; };
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { status.textContent = 'Select and copy'; }
        document.body.removeChild(ta);
        copy.focus();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  body.insertBefore(bar, body.firstChild);
  if (typeof render === 'function') render();

  function syncHeight() {
    document.documentElement.style.setProperty('--variant-picker-h', bar.offsetHeight + 'px');
  }
  syncHeight();
  window.addEventListener('resize', syncHeight);
})();
