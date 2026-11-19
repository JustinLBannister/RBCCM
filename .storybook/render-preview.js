/* =========================================================================
   Renders one variant of a component's local preview page as a story.

     renderPreview({ file: 'rbccm-hero/rbccm-hero.html', variant: 'etf-innovators' })

   The preview pages are the single source: this loads the page, keeps
   the one variant asked for (the same grouping rule as
   local-test-fixtures/variant-picker.js), drops the demo labels and the
   picker, and puts the markup into the story with the page's own
   stylesheets and scripts, so the component starts up as it does on its
   preview page. Nothing about a component is repeated here.
   ========================================================================= */

const SKIP = { SCRIPT: 1, LINK: 1, STYLE: 1 };
const pages = new Map();
const loadedLibs = new Set();
let headNodes = [];
let bodyClass = '';
let run = 0;

function slugify(s) {
  return String(s).toLowerCase().replace(/&/g, 'and').replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function fetchPage(file) {
  if (!pages.has(file)) {
    pages.set(file, fetch('/' + file).then((r) => {
      if (!r.ok) throw new Error(file + ' returned ' + r.status);
      return r.text();
    }));
  }
  return pages.get(file);
}

/* Variant groups, as the picker builds them: a label and every sibling
   after it up to the next label, an end marker, or a script/link/style. */
function groupsIn(body) {
  const used = {};
  return [].map.call(body.querySelectorAll('[data-variant]'), (label) => {
    let slug = slugify(label.getAttribute('data-variant') || 'Variant') || 'variant';
    if (used[slug]) slug += '-' + (++used[slug]); else used[slug] = 1;
    const nodes = [];
    let n = label.nextElementSibling;
    while (n && !n.hasAttribute('data-variant') && !n.hasAttribute('data-variant-end') && !SKIP[n.tagName]) {
      nodes.push(n);
      n = n.nextElementSibling;
    }
    return { slug, label, nodes };
  });
}

const isRelative = (u) => u && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|\{)/i.test(u.trim());

function rebaseCss(css, base) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) =>
    (isRelative(u) ? 'url(' + q + new URL(u, base).pathname + q + ')' : m));
}

function rebase(root, base) {
  const fix = (u) => {
    const url = new URL(u, base);
    return url.pathname + url.search + url.hash;
  };
  root.querySelectorAll('[src], [href], [poster], [data-src]').forEach((el) => {
    ['src', 'href', 'poster', 'data-src'].forEach((a) => {
      const v = el.getAttribute(a);
      if (isRelative(v)) el.setAttribute(a, fix(v));
    });
  });
  root.querySelectorAll('[srcset]').forEach((el) => {
    el.setAttribute('srcset', el.getAttribute('srcset').split(',').map((part) => {
      const bits = part.trim().split(/\s+/);
      if (isRelative(bits[0])) bits[0] = fix(bits[0]);
      return bits.join(' ');
    }).join(', '));
  });
  root.querySelectorAll('[style*="url("]').forEach((el) => {
    el.setAttribute('style', rebaseCss(el.getAttribute('style'), base));
  });
  root.querySelectorAll('style').forEach((el) => { el.textContent = rebaseCss(el.textContent, base); });
}

function cleanup() {
  headNodes.forEach((n) => n.remove());
  headNodes = [];
  if (bodyClass) bodyClass.split(/\s+/).forEach((c) => c && document.body.classList.remove(c));
  bodyClass = '';
}

function whenConnected(el) {
  return new Promise((resolve) => {
    let tries = 0;
    (function check() {
      if (el.isConnected || tries++ > 200) resolve();
      else requestAnimationFrame(check);
    }());
  });
}

function addStylesheet(href) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = link.onerror = resolve;
    setTimeout(resolve, 4000);
    document.head.appendChild(link);
    headNodes.push(link);
  });
}

const isCode = (s) => !s.type || /^(text|application)\/(java|ecma)script$|^module$/i.test(s.type);

/* Scripts that came through the parser never run, so each one is put
   back as a fresh element, in page order, waiting for external files.

   A preview page may pick its files with document.write. Called after
   the page has loaded that would wipe the story, so while an inline
   script runs the call is caught, and what it wrote is put in place
   the same way as the rest of the page. */
async function runScript(old, inHead, base) {
  const src = old.getAttribute('src');
  const external = src && /^(https?:)?\/\//i.test(src) && new URL(src, location.href).origin !== location.origin;
  if (external && loadedLibs.has(src)) { if (!inHead) old.remove(); return; }
  const s = document.createElement('script');
  [].forEach.call(old.attributes, (a) => s.setAttribute(a.name, a.value));
  const place = () => {
    if (inHead) { document.head.appendChild(s); headNodes.push(s); }
    else old.replaceWith(s);
  };
  if (src) {
    s.async = false;
    if (external) loadedLibs.add(src);
    await new Promise((resolve) => { s.onload = s.onerror = resolve; place(); });
    return;
  }
  s.textContent = old.textContent;
  const written = [];
  const write = document.write;
  const writeln = document.writeln;
  document.write = document.writeln = function () { written.push([].join.call(arguments, '')); };
  try { place(); } finally { document.write = write; document.writeln = writeln; }
  if (!written.length) return;

  const box = document.createElement('template');
  box.innerHTML = written.join('');
  rebase(box.content, base);
  const sheets = [].slice.call(box.content.querySelectorAll('link[rel~="stylesheet"]'));
  await Promise.all(sheets.map((l) => { l.remove(); return addStylesheet(l.getAttribute('href')); }));
  const scripts = [].filter.call(box.content.querySelectorAll('script'), isCode);
  if (inHead) {
    for (const w of scripts) await runScript(w, true, base);
  } else {
    s.after(box.content);
    for (const w of scripts) await runScript(w, false, base);
  }
}

async function build(file, variant, host, mine) {
  const html = await fetchPage(file);
  if (mine !== run) return;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const base = new URL('/' + file, location.origin);

  const groups = groupsIn(doc.body);
  if (groups.length && variant !== 'all') {
    const keep = groups.find((g) => g.slug === variant) || groups[0];
    groups.forEach((g) => { if (g !== keep) g.nodes.forEach((n) => n.remove()); });
  }
  groups.forEach((g) => g.label.remove());
  doc.querySelectorAll('script[src*="variant-picker"]').forEach((s) => s.remove());
  /* Preview-only chrome that is not part of the component. */
  doc.querySelectorAll('.demo-fake-nav').forEach((n) => n.remove());

  rebase(doc.head, base);
  rebase(doc.body, base);

  const sheets = [].map.call(doc.head.querySelectorAll('link[rel~="stylesheet"]'), (l) => l.getAttribute('href'));
  const styles = [].slice.call(doc.head.querySelectorAll('style'));
  const headScripts = [].filter.call(doc.head.querySelectorAll('script'), isCode);

  bodyClass = doc.body.className || '';
  if (bodyClass) bodyClass.split(/\s+/).forEach((c) => c && document.body.classList.add(c));

  await Promise.all(sheets.map(addStylesheet));
  if (mine !== run) return;
  styles.forEach((st) => {
    const copy = document.createElement('style');
    copy.textContent = st.textContent;
    document.head.appendChild(copy);
    headNodes.push(copy);
  });

  while (doc.body.firstChild) host.appendChild(document.adoptNode(doc.body.firstChild));
  await whenConnected(host);

  for (const s of headScripts) {
    if (mine !== run) return;
    await runScript(s, true, base);
  }
  for (const s of [].filter.call(host.querySelectorAll('script'), isCode)) {
    if (mine !== run) return;
    await runScript(s, false, base);
  }
  host.setAttribute('data-ready', 'true');
}

export function renderPreview({ file, variant = '' }) {
  const host = document.createElement('div');
  host.className = 'rbccm-story';
  run += 1;
  cleanup();
  build(file, variant, host, run).catch((err) => {
    host.innerHTML = '';
    const p = document.createElement('p');
    p.style.cssText = 'margin:24px;font:16px/1.5 Roboto,Arial,sans-serif;color:#C8102E';
    p.textContent = 'This preview could not be loaded: ' + err.message;
    host.appendChild(p);
  });
  return host;
}

/* A whole page (a build preview) shown in a frame. */
export function renderFrame({ src, title }) {
  cleanup();
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = title;
  frame.style.cssText = 'display:block;width:100%;height:100vh;border:0';
  return frame;
}
