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
    + '.variant-picker__note{font-size:11px;color:rgba(255,255,255,.6);margin:10px 0 0}';
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

  body.insertBefore(bar, body.firstChild);

  function syncHeight() {
    document.documentElement.style.setProperty('--variant-picker-h', bar.offsetHeight + 'px');
  }
  syncHeight();
  window.addEventListener('resize', syncHeight);
})();
