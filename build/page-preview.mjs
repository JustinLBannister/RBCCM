/* =========================================================================
   Page preview -- writes dist/<page>.html next to the bundles
   =========================================================================
   Called by build.mjs after a page's bundles are written. The preview
   stacks each component's markup (taken from its local preview page) in
   bundle order and loads ONLY the page bundle for component CSS/JS, plus
   the libraries the site loads globally (jQuery, Slick, Bootstrap 3,
   animate.css). So it shows what the page looks like on the bundle alone.

   Serve the repo root and open http://localhost:8743/dist/<page>.html

   Per component:
     - markup comes from <folder>/<folder>.html, else <folder>/local-test.html
     - the component's own <link>/<script> files are dropped (the bundle
       replaces them); a local file the bundle doesn't include is reported
       as a warning, since the page would miss it too
     - demo <style> blocks are kept, scoped to that component's section
     - relative paths are rewritten to work from dist/
     - previews with variants (data-variant labels) keep one variant: the
       one named in the page's `preview.variants`, else the first

   Page config (build/pages.config.mjs), all optional:
     preview: {
       variants: { 'rbccm-hero': 'US Credentials' },  // data-variant label
       skip: ['rbccm-button'],     // components with no markup of their own
       file: 'maas-mata-page/maas-mata.html'  // use one whole page instead
     }
   Without `skip`, rbccm-button and rbccm-animate are skipped (their
   previews are demos, not page sections).
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';

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
const isLib = u => /jquery(-\d[\d.]*)?(\.min)?\.js|slick-carousel|bootstrap@|animate\.css/.test(u);
const PICKER = /variant-picker\.js/;
const DEFAULT_SKIP = ['rbccm-button', 'rbccm-animate'];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- paths ---------------------------------------------------------
   Relative paths become root-relative (/<folder>/...), so the preview needs
   the repo root served (as the README says). Not ../ like build-global.mjs:
   url() inside a CSS custom property resolves against the stylesheet that
   uses it, which here is the bundle in dist/css/. */
function rebase(url, dir) {
  if (!url || /^(?:[a-z]+:|\/\/|\/|#|%23|data:|\{)/i.test(url)) return url;
  const m = url.match(/^([^?#]*)(.*)$/);
  return '/' + path.posix.normalize(path.posix.join(dir, m[1])) + m[2];
}
const repoPath = (url, dir) => path.posix.normalize(path.posix.join(dir, url.replace(/[?#].*$/, '')));
const rebaseSrcset = (v, dir) => v.split(',').map(part => {
  const [u, ...rest] = part.trim().split(/\s+/);
  return [rebase(u, dir), ...rest].join(' ');
}).join(', ');
const rebaseCssUrls = (css, dir) =>
  css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (all, q, u) => `url(${q}${rebase(u, dir)}${q})`);
const rebaseHtml = (html, dir) => html
  .replace(/\s(src|href|poster)=(["'])(.*?)\2/g, (a, attr, q, v) => ` ${attr}=${q}${rebase(v, dir)}${q}`)
  .replace(/\ssrcset=(["'])(.*?)\1/g, (a, q, v) => ` srcset=${q}${rebaseSrcset(v, dir)}${q}`)
  .replace(/\sstyle=(["'])(.*?)\1/g, (a, q, v) => ` style=${q}${rebaseCssUrls(v, dir)}${q}`);

/* ---------- demo CSS scoping (same as build-global.mjs) ----------------- */
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
  return lead ? scope + lead[2] : scope + ' ' + sel;
}
function scopeCss(css, scope) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let out = '', i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
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
    if (/^@(media|supports|container)/i.test(prelude)) out += `${prelude}{${scopeCss(block, scope)}}\n`;
    else if (/^@/.test(prelude)) out += `${prelude}{${block}}\n`;
    else out += `${splitTop(prelude, ',').map(s => scopeSelector(s, scope)).join(',\n')}{${block}}\n`;
    i = j + 1;
  }
  return out;
}

/* ---------- one preview page -> section --------------------------------- */
function previewFileFor(root, dir) {
  for (const f of [`${dir}/${dir}.html`, `${dir}/local-test.html`]) {
    if (fs.existsSync(path.join(root, f))) return f;
  }
  return null;
}

function extract(root, file, scope, bundled, warnings) {
  const dir = path.posix.dirname(file);
  let html = fs.readFileSync(path.join(root, file), 'utf8')
    .replace(/<\/html>[\s\S]*$/i, '</html>')
    .replace(/<!--[\s\S]*?-->/g, '');
  const styles = [];
  const libCss = [];
  const missing = new Set();
  const noteMissing = (url) => {
    const f = repoPath(url, dir);
    if (!bundled.has(f) && fs.existsSync(path.join(root, f))) missing.add(f);
  };

  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (a, body) => {
    styles.push(scopeCss(rebaseCssUrls(body, dir), scope));
    return '';
  });
  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, tag => {
    const href = (tag.match(/href=["']([^"']+)["']/) || [])[1];
    if (!href) return '';
    if (isLib(href) || /^(https?:)?\/\//i.test(href)) libCss.push(href);
    else noteMissing(href);
    return '';
  });

  // Head inline scripts (e.g. a component config object) move to the top
  // of the section; body inline scripts stay where they are. Third-party
  // scripts that aren't shared libraries (Marketo forms, LinkedIn autofill)
  // aren't bundled either, so they're kept as-is.
  const isThirdParty = src => /^(https?:)?\/\//i.test(src) && !isLib(src);
  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || '';
  const headScripts = [];
  head.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, code) => {
    const src = (attrs.match(/src=["']([^"']+)["']/) || [])[1];
    if (src ? isThirdParty(src) : code.trim()) headScripts.push(tag);
    return '';
  });

  let body = (html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [])[1] || '';
  body = body.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs) => {
    const src = (attrs.match(/src=["']([^"']+)["']/) || [])[1];
    if (!src || isThirdParty(src)) return tag;
    if (!isLib(src) && !PICKER.test(src) && !/^(https?:)?\/\//i.test(src)) noteMissing(src);
    return '';
  });
  // Head <script src> tags to local files count too (not kept, only checked).
  head.replace(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi, (tag, src) => {
    if (!isLib(src) && !PICKER.test(src) && !/^(https?:)?\/\//i.test(src)) noteMissing(src);
    return '';
  });

  for (const f of missing) warnings.push(`preview: ${file} loads ${f}, which isn't in the bundle`);
  return { styles, libCss, markup: rebaseHtml(headScripts.join('\n') + '\n' + body.trim(), dir) };
}

/* ---------- write dist/<page>.html -------------------------------------- */
export function writePagePreview({ root, dist, pageName, page, parts, files }) {
  const warnings = [];
  const preview = page.preview || {};
  const variants = preview.variants || {};
  const skip = new Set(preview.skip || DEFAULT_SKIP);
  const bundled = new Set(parts.flatMap(p => [...p.css, ...p.js]));

  const sources = preview.file
    ? [{ name: pageName, file: preview.file }]
    : parts
      .filter(p => !skip.has(p.name) && fs.existsSync(path.join(root, p.name)))
      .map(p => ({ name: p.name, file: previewFileFor(root, p.name), variant: variants[p.name] }));

  const css = new Set(LIB_CSS);
  const styles = [];
  const sections = [];
  for (const s of sources) {
    if (!s.file) { warnings.push(`preview: ${s.name} has no preview page; left out of dist/${pageName}.html`); continue; }
    const scope = `.pp--${slug(s.name)}`;
    const out = extract(root, s.file, scope, bundled, warnings);
    out.libCss.forEach(h => { if (!isLib(h)) css.add(h); });
    styles.push(`/* ---- ${s.file} ---- */\n` + out.styles.join('\n'));
    sections.push(`<section class="pp pp--${slug(s.name)}" data-preview-component="${escAttr(s.name)}"` +
      (s.variant ? ` data-preview-variant="${escAttr(s.variant)}"` : '') + `>\n${out.markup}\n</section>`);
  }

  const pick = f => f && (f.min || f.readable) ? path.posix.relative('dist', (f.min || f.readable).split(path.sep).join('/')) + `?v=${f.hash}` : '';
  const bundleCss = pick(files.css);
  const bundleJs = pick(files.js);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageName} -- bundle preview</title>
<!-- GENERATED by build/page-preview.mjs on npm run build. Don't edit by
     hand. Component CSS/JS here come ONLY from the ${pageName} bundle. -->
${[...css].map(h => `<link rel="stylesheet" href="${h}">`).join('\n')}
${bundleCss ? `<link rel="stylesheet" href="${bundleCss}">` : '<!-- no CSS bundle for this page -->'}
<style>
  body { margin: 0; background: #fff; font-family: Roboto, Arial, sans-serif; }
${styles.join('\n')}
</style>
</head>
<body>

${sections.join('\n\n')}

<script>
/* Keep one variant per component preview (same grouping rules as
   local-test-fixtures/variant-picker.js) and drop the demo labels. */
(function () {
  var SKIP = { SCRIPT: 1, LINK: 1, STYLE: 1, TEMPLATE: 1, NOSCRIPT: 1 };
  [].forEach.call(document.querySelectorAll('[data-preview-component]'), function (sec) {
    var labels = [].slice.call(sec.querySelectorAll('[data-variant]'));
    if (labels.length) {
      var want = sec.getAttribute('data-preview-variant');
      var keep = labels.filter(function (l) { return l.getAttribute('data-variant') === want; })[0];
      if (want && !keep) console.warn('[preview] ' + sec.getAttribute('data-preview-component') + ': no variant "' + want + '", showing the first');
      keep = keep || labels[0];
      labels.forEach(function (l) {
        var group = [];
        for (var n = l.nextElementSibling; n && !n.hasAttribute('data-variant') && !n.hasAttribute('data-variant-end'); n = n.nextElementSibling) {
          if (!SKIP[n.tagName]) group.push(n);
        }
        if (l !== keep) group.forEach(function (e) { e.parentNode.removeChild(e); });
        l.parentNode.removeChild(l);
      });
    }
    [].forEach.call(sec.querySelectorAll('.demo-note, .demo-label, .demo-hint, .demo-caption, .demo-bar, .rbccm-preview-note'), function (e) { e.parentNode.removeChild(e); });
  });
})();
</script>
${LIB_JS.map(s => `<script src="${s}"></script>`).join('\n')}
${bundleJs ? `<script src="${bundleJs}"></script>` : '<!-- no JS bundle for this page -->'}
</body>
</html>
`;
  const out = path.join(dist, `${pageName}.html`);
  fs.writeFileSync(out, html);
  return { file: path.relative(root, out), sections: sections.length, warnings };
}
