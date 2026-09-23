#!/usr/bin/env node
/* =========================================================================
   rbccm-global -- builds local-test.html: every component's local test
   page combined into one page. Dev-only, not shipped.

     npm run global          (from the RBCCM root)
     node rbccm-global/build-global.mjs

   Re-run after editing any component's test page; this file is the
   source of truth, local-test.html is generated.

   What it does per component page:
     - lifts the <body> content into <section class="gl gl--<name>">
     - scopes the page's inline <style> to that section (body/html rules
       land on the section itself), so demo styles can't collide
     - rewrites relative src/href/srcset/url() paths to work from here
     - collects external CSS/JS, de-duped (one jQuery, one Slick)
     - renames the page's own data-variant labels so the shared picker
       lists COMPONENTS here, not per-component variants
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'local-test.html');

// Page order = order on the global page.
const PAGES = [
  { name: 'Hero',             dir: 'rbccm-hero',             file: 'rbccm-hero.html' },
  { name: 'Capability cards', dir: 'rbccm-capability-cards', file: 'local-test.html' },
  { name: 'Awards',           dir: 'rbccm-awards',           file: 'local-test.html' },
  { name: 'Platforms',        dir: 'rbccm-platforms',        file: 'rbccm-platforms.html' },
  { name: 'Two-up cards',     dir: 'rbccm-two-up-cards',     file: 'local-test.html' },
  { name: 'Leadership',       dir: 'rbccm-leadership',       file: 'local-test.html' },
  { name: 'CTA band',         dir: 'rbccm-cta-band',         file: 'rbccm-cta-band.html' },
  { name: 'Button',           dir: 'rbccm-button',           file: 'local-test.html' },
  { name: 'Animate',          dir: 'rbccm-animate',          file: 'local-test.html' },
];

// One copy of each shared library, whatever version a page asked for.
const LIB_CSS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
];
const LIB_JS = [
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js',
];
const isLib = (u) => /jquery(-\d[\d.]*)?(\.min)?\.js|slick-carousel|bootstrap@|animate\.css/.test(u);
const PICKER = /variant-picker\.js/;
const ANIMATE_JS = /rbccm-animate\.js/;

/* ---------- path rewriting ---------------------------------------------- */
function rebase(url, dir) {
  if (!url || /^(?:[a-z]+:|\/\/|\/|#|%23|data:|\{)/i.test(url)) return url; // %23 = '#' inside SVG data URIs
  const m = url.match(/^([^?#]*)(.*)$/);
  const abs = path.posix.normalize(path.posix.join(dir, m[1]));
  return '../' + abs + m[2];
}
const rebaseSrcset = (v, dir) =>
  v.split(',').map((part) => {
    const [u, ...rest] = part.trim().split(/\s+/);
    return [rebase(u, dir), ...rest].join(' ');
  }).join(', ');
const rebaseCssUrls = (css, dir) =>
  css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (all, q, u) => `url(${q}${rebase(u, dir)}${q})`);

function rebaseHtml(html, dir) {
  return html
    .replace(/\s(src|href|poster)=(["'])(.*?)\2/g, (a, attr, q, v) => ` ${attr}=${q}${rebase(v, dir)}${q}`)
    .replace(/\ssrcset=(["'])(.*?)\1/g, (a, q, v) => ` srcset=${q}${rebaseSrcset(v, dir)}${q}`)
    .replace(/\sstyle=(["'])(.*?)\1/g, (a, q, v) => ` style=${q}${rebaseCssUrls(v, dir)}${q}`);
}

/* ---------- CSS scoping -------------------------------------------------- */
// Small brace-matching parser; good enough for hand-written demo styles.
function splitTop(s, ch) {
  const out = []; let depth = 0, q = null, cur = '';
  for (const c of s) {
    if (q) { if (c === q) q = null; cur += c; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    if (c === ch && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}
function scopeSelector(sel, scope) {
  sel = sel.trim();
  if (!sel) return sel;
  const lead = sel.match(/^(html\s+body|html|body|:root)\b(.*)$/);
  if (lead) return scope + lead[2];
  return scope + ' ' + sel;
}
function scopeCss(css, scope) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let out = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    // find matching close brace, respecting quotes
    let depth = 0, j = open, q = null;
    for (; j < css.length; j++) {
      const c = css[j];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) break; }
    }
    const prelude = css.slice(i, open).trim();
    const block = css.slice(open + 1, j);
    if (/^@(media|supports|container)/i.test(prelude)) {
      out += `${prelude}{${scopeCss(block, scope)}}\n`;
    } else if (/^@/.test(prelude)) {
      out += `${prelude}{${block}}\n`; // @keyframes, @font-face: untouched
    } else {
      const sels = splitTop(prelude, ',').map((s) => scopeSelector(s, scope)).join(',\n');
      out += `${sels}{${block}}\n`;
    }
    i = j + 1;
  }
  return out;
}

/* ---------- per-page extraction ------------------------------------------ */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const css = new Set(LIB_CSS);
const componentCss = [];
const componentJs = []; // {src} | {code, page}
const seenJs = new Set();
const styles = [];
const sections = [];
const ids = new Map();

for (const p of PAGES) {
  const file = path.join(ROOT, p.dir, p.file);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<\/html>[\s\S]*$/i, '</html>');
  // Drop HTML comments first: some mention "<script>" / "<style>" in prose,
  // which would throw off the tag extraction below.
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  const scope = `.gl--${slug(p.dir)}`;

  // Inline <style> blocks (head or body) -> scoped.
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (a, body) => {
    styles.push(`/* ---- ${p.dir} ---- */\n` + scopeCss(rebaseCssUrls(body, p.dir), scope));
    return '';
  });

  // Stylesheets.
  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
    const href = (tag.match(/href=["']([^"']+)["']/) || [])[1];
    if (href && !isLib(href)) {
      const u = rebase(href, p.dir);
      if (!componentCss.includes(u)) componentCss.push(u);
    }
    return '';
  });

  // Scripts: libs dropped (loaded once), picker dropped (loaded once),
  // everything else kept in page order.
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, code) => {
    const src = (attrs.match(/src=["']([^"']+)["']/) || [])[1];
    if (src) {
      if (isLib(src) || PICKER.test(src) || ANIMATE_JS.test(src)) return '';
      const u = rebase(src, p.dir);
      if (!seenJs.has(u)) { seenJs.add(u); componentJs.push({ src: u }); }
    } else if (code.trim()) {
      componentJs.push({ code, page: p.dir });
    }
    return '';
  });

  let body = (html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || '';

  // Page-specific tweaks.
  body = body.replace(/<div class="demo-fake-nav"[^>]*><\/div>\s*/g, ''); // hero's fixed fake nav would cover everything
  if (p.dir === 'rbccm-leadership') {
    // Its own live toggle bar uses .variant-picker classes; rename so it
    // doesn't collide with the shared picker (styles or click wiring).
    body = body.replace(/variant-picker/g, 'lead-picker');
    componentJs.forEach((j) => { if (j.page === p.dir) j.code = j.code.replace(/variant-picker/g, 'lead-picker'); });
    styles[styles.length - 1] = styles[styles.length - 1].replace(/variant-picker/g, 'lead-picker')
      + `${scope} .lead-picker{position:static}\n`;
  }

  // Inner variant labels become plain labels; the shared picker here
  // switches whole components.
  body = body.replace(/\sdata-variant(-end)?=/g, ' data-demo-variant$1=');
  body = rebaseHtml(body, p.dir);

  for (const m of body.matchAll(/\sid=["']([^"']+)["']/g)) {
    ids.set(m[1], (ids.get(m[1]) || []).concat(p.dir));
  }

  sections.push(
`<section class="gl gl--${slug(p.dir)}" id="${slug(p.dir)}" data-variant="${p.name}">
<div class="gl__bar"><span class="gl__name">${p.dir}</span><a class="gl__open" href="../${p.dir}/${p.file}">Open standalone test &rarr;</a></div>
${body.trim()}
</section>`);
}

const dupes = [...ids].filter(([, pages]) => pages.length > 1);
if (dupes.length) console.warn('Duplicate ids across pages:', dupes.map(([id, pg]) => `${id} (${pg.join(', ')})`).join('; '));

/* ---------- write -------------------------------------------------------- */
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');
const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>rbccm-global -- all components</title>
<!-- GENERATED by rbccm-global/build-global.mjs. Don't edit by hand; edit the
     component test pages and re-run: npm run global -->
${[...css].map((h) => `<link rel="stylesheet" href="${h}">`).join('\n')}
${componentCss.map((h) => `<link rel="stylesheet" href="${h}">`).join('\n')}
<script src="../rbccm-animate/rbccm-animate.js"></script>
<style>
  body { margin: 0; background: #fff; font-family: Roboto, Arial, sans-serif; }
  .gl { position: relative; }
  .gl + .gl { border-top: 6px solid #FFC72C; }
  .gl__bar {
    align-items: center; background: #FFC72C; color: #003168; display: flex;
    font: 600 13px/1 Roboto, Arial, sans-serif; gap: 16px; justify-content: space-between;
    letter-spacing: .06em; padding: 12px 24px; text-transform: uppercase;
  }
  .gl__open { color: #003168; font-weight: 500; letter-spacing: 0; text-decoration: underline; text-transform: none; }
${styles.join('\n')}
</style>
</head>
<body data-picker-title="rbccm-global - all components" data-picker-default="all">

${sections.join('\n\n')}

<script src="../local-test-fixtures/variant-picker.js"></script>
${LIB_JS.map((s) => `<script src="${s}"></script>`).join('\n')}
${componentJs.map((j) => j.src
    ? `<script src="${j.src}"></script>`
    : `<script>/* ${j.page} */\ntry {\n${esc(j.code)}\n} catch (e) { console.error('[rbccm-global] ${j.page} inline script failed', e); }\n</script>`).join('\n')}
</body>
</html>
`;
fs.writeFileSync(OUT, out);
console.log(`Wrote ${path.relative(ROOT, OUT)}: ${PAGES.length} components, ${componentCss.length} component CSS, ${componentJs.length} scripts.`);
