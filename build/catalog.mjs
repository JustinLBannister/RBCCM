/* =========================================================================
   Component catalog

   One description of what is in the repo, shared by the dashboard
   (build/dashboard.mjs) and the Storybook story generator
   (build/stories.mjs): every component with its preview page, variants,
   editor fields and files, the pages built from them, and the earlier
   component folders.

   Sections, page names and which pages are live are set in the lists
   just below.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/* Page names as people say them, and which pages are live. */
const PAGE_LABELS = {
  'us-credentials': 'US Credentials',
  'strategy-and-economics': 'Strategy & Economics',
  'maas-mata': 'MAAS+MATA',
  'etf-innovators': 'ETF Innovators',
  'outlook-2027': '2027 Outlook'
};
const LIVE_PAGES = ['us-credentials', 'maas-mata'];

/* Sections on the Components view, in order. A folder not listed lands
   in "Other". */
const CATEGORIES = [
  ['Heroes and Intros', ['rbccm-hero', 'rbccm-intro-statement', 'rbccm-video-poster']],
  ['Cards and Features', ['rbccm-awards', 'rbccm-capability-cards', 'rbccm-two-up-cards', 'rbccm-platforms',
    'rbccm-numbered-features', 'rbccm-accordions', 'rbccm-expertise']],
  ['Insights and Lists', ['rbccm-insight-cards', 'rbccm-insight-list', 'rbccm-featured-insights',
    'rbccm-in-the-media', 'rbccm-strategic-themes', 'filtered-content']],
  ['People', ['rbccm-leadership', 'rbccm-leading-experts', 'rbccm-host-profile']],
  ['Actions and Forms', ['rbccm-cta-band', 'rbccm-button', 'rbccm-marketo-footer', 'rbccm-marketo-modal']],
  ['Utilities', ['rbccm-animate', 'rbccm-brightcove-bg-layer', 'rbccm-section-group', 'rbccm-json-schema',
    'rbccm-disclaimer']],
  ['Page Templates', ['maas-mata-page']]
];

/* Folders that are components even though they are not named rbccm-*. */
const EXTRA_COMPONENTS = ['filtered-content', 'maas-mata-page'];
/* rbccm-* folders that are tools, not components. */
const NOT_COMPONENTS = ['rbccm-global'];
/* Top-level folders left out of "Earlier work". */
const NOT_EARLIER = ['build', 'dist', 'node_modules', 'stories', 'storybook-static', 'local-test-fixtures', 'outlook-2027',
  '_package', 'invoices', 'transactions-preview', 'insights-json-builder'];

const TEAMSITE = {
  css: '/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components',
  js: '/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components',
  component: '/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components'
};

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const isDir = (p) => exists(p) && fs.statSync(path.join(ROOT, p)).isDirectory();
const isXsl = (p) => /<xsl:stylesheet\b/.test(read(p).slice(0, 4000));

function slugify(s) {
  return String(s).toLowerCase().replace(/&/g, 'and').replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* Same rule as build/page-preview.mjs: <folder>.html unless that file is
   a skin, then local-test.html. */
function previewFor(dir) {
  for (const f of [`${dir}/${dir}.html`, `${dir}/local-test.html`]) {
    if (exists(f) && !isXsl(f)) return f;
  }
  return '';
}

function variantsIn(file) {
  if (!file) return [];
  const used = {};
  const out = [];
  const seen = new Set();
  for (const m of read(file).matchAll(/\sdata-variant="([^"]*)"/g)) {
    const name = m[1].replace(/&amp;/g, '&').replace(/&#43;/g, '+').replace(/&quot;/g, '"');
    if (seen.has(name)) continue;
    seen.add(name);
    let slug = slugify(name) || 'variant';
    if (used[slug]) slug += '-' + (++used[slug]); else used[slug] = 1;
    out.push({ name, slug });
  }
  return out;
}

function plain(md) {
  return md.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
}

function readmeInfo(dir) {
  const file = `${dir}/README.md`;
  if (!exists(file)) return { readme: '', title: '', desc: '', ba: false };
  const text = read(file);
  const title = (text.match(/^# (.+)$/m) || [])[1] || '';
  let desc = '';
  for (const block of text.split(/\n\s*\n/).slice(1)) {
    const b = block.trim();
    if (!b || /^(#|>|\||-{3,}|```|- |\* |\d+\. )/.test(b)) continue;
    desc = plain(b);
    break;
  }
  if (desc.length > 230) {
    const cut = desc.slice(0, 230);
    const stop = cut.lastIndexOf('. ');
    desc = stop > 90 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '') + '...';
  }
  return { readme: file, title: plain(title), desc, ba: text.includes('## For editors and BAs') };
}

function decode(s) {
  return s.replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

/* The editor's fields, read from the component's properties file. */
function fieldsIn(dir) {
  const file = fs.readdirSync(path.join(ROOT, dir)).find((n) => /-properties\.xml$/.test(n));
  if (!file) return [];
  const xml = read(`${dir}/${file}`).replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  /* Repeatable lists (a Group): where each starts and ends, so the
     fields inside one can be named with it. */
  const lists = [];
  for (const g of xml.matchAll(/<Group\b([^>]*)>/g)) {
    const end = xml.indexOf('</Group>', g.index);
    const name = (g[1].match(/\bName="([^"]*)"/) || [])[1] || (g[1].match(/\bID="([^"]*)"/) || [])[1] || 'List';
    lists.push({ from: g.index, to: end === -1 ? xml.length : end, name: decode(name) });
  }
  const re = /<Datum\b([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(xml))) {
    const attr = (k) => {
      const a = m[1].match(new RegExp('\\b' + k + '="([^"]*)"'));
      return a ? decode(a[1]) : '';
    };
    const list = lists.find((l) => m.index > l.from && m.index < l.to);
    const id = attr('ID') && list ? list.name + ' list: ' + attr('ID') : attr('ID');
    if (!id) continue;
    let value = '';
    let options = 0;
    if (!m[2]) {
      const end = xml.indexOf('</Datum>', re.lastIndex);
      const inner = end === -1 ? '' : xml.slice(re.lastIndex, end);
      if (/<Option\b/.test(inner)) {
        options = (inner.match(/<Option\b/g) || []).length;
        const sel = inner.match(/<Option[^>]*Selected="true"[^>]*>\s*<Display>([^<]*)<\/Display>/);
        value = sel ? decode(sel[1]) : '';
      } else if (!/<(?!!\[CDATA\[)/.test(inner)) {
        value = decode(inner.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/\s+/g, ' ').trim());
      }
    }
    if (value.length > 90) value = value.slice(0, 90).replace(/\s+\S*$/, '') + '...';
    out.push({ id, type: attr('Type') || 'String', label: (list ? 'One per entry in the ' + list.name + ' list. ' : '') + (attr('Name') || attr('Label')), value, options });
  }
  return out;
}

function prettyName(dir) {
  return dir.replace(/^rbccm-/, '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

function kindOf(dir, name) {
  if (name === 'README.md') return 'Readme';
  if (/-properties\.xml$/.test(name)) return 'Fields';
  if (/\.xsl$/.test(name)) return 'Skin';
  if (/\.html$/.test(name)) return isXsl(`${dir}/${name}`) ? 'Skin' : 'Preview';
  if (/\.css$/.test(name)) return 'CSS';
  if (/\.m?js$/.test(name)) return 'Script';
  if (/\.(json|xml)$/.test(name)) return 'Data';
  if (/\.(png|jpe?g|webp|svg|gif|mp4)$/i.test(name)) return 'Media';
  return 'Other';
}

/* Names in a folder that git ignores (files kept local, not in the repo). */
function ignoredIn(dir, names) {
  if (!names.length) return [];
  try {
    return execFileSync('git', ['check-ignore', '--stdin'], {
      cwd: ROOT, encoding: 'utf8', input: names.map((n) => dir + '/' + n).join('\n'), stdio: ['pipe', 'pipe', 'ignore']
    }).split('\n').filter(Boolean).map((line) => path.basename(line));
  } catch (e) {
    /* Exit code 1 means nothing is ignored; no git means nothing to check. */
    return [];
  }
}

function filesIn(dir) {
  const order = ['Skin', 'Fields', 'CSS', 'Script', 'Preview', 'Readme', 'Data', 'Media', 'Other', 'Folder'];
  const all = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  const ignored = ignoredIn(dir, all.map((e) => e.name));
  return all
    .filter((e) => !e.name.startsWith('.') && !/\.tmp$/.test(e.name) && !ignored.includes(e.name))
    .map((e) => (e.isDirectory() ? { name: e.name + '/', kind: 'Folder' } : { name: e.name, kind: kindOf(dir, e.name) }))
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.name.localeCompare(b.name));
}

const config = (await import(pathToFileURL(path.join(HERE, 'pages.config.mjs')).href)).default;
const compName = (c) => (typeof c === 'string' ? c : c.name);

const pages = Object.entries(config.pages).map(([name, page]) => ({
  name,
  label: PAGE_LABELS[name] || prettyName(name),
  live: LIVE_PAGES.includes(name),
  url: LIVE_PAGES.includes(name) ? (page.url || '') : '',
  preview: `dist/${name}.html`,
  components: page.components.map(compName)
}));

const categoryOf = (dir) => (CATEGORIES.find(([, list]) => list.includes(dir)) || ['Other'])[0];

const top = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
  .map((e) => e.name)
  .sort();

const componentDirs = top.filter((d) => (d.startsWith('rbccm-') && !NOT_COMPONENTS.includes(d)) || EXTRA_COMPONENTS.includes(d));

const components = componentDirs.map((dir) => {
  const info = readmeInfo(dir);
  const preview = previewFor(dir);
  const files = filesIn(dir);
  return {
    id: dir,
    title: info.title || prettyName(dir),
    desc: info.desc,
    category: categoryOf(dir),
    preview,
    variants: variantsIn(preview),
    pages: pages.filter((p) => p.components.includes(dir)).map((p) => p.name),
    readme: info.readme,
    ba: info.ba,
    files,
    fields: fieldsIn(dir),
    css: exists(`${dir}/${dir}.css`) ? `${dir}.css` : '',
    js: exists(`${dir}/${dir}.js`) ? `${dir}.js` : '',
    hasSkin: files.some((f) => f.kind === 'Skin')
  };
});

const earlier = top
  .filter((d) => !componentDirs.includes(d) && !NOT_COMPONENTS.includes(d) && !NOT_EARLIER.includes(d))
  .map((dir) => {
    const entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
    const html = entries.filter((e) => e.isFile() && /\.html$/.test(e.name) && !isXsl(`${dir}/${e.name}`)).map((e) => e.name).sort();
    return { id: dir, title: prettyName(dir), html, count: entries.length, readme: exists(`${dir}/README.md`) ? `${dir}/README.md` : '' };
  });

export const catalog = {
  generated: new Date().toISOString(),
  intro: exists('README.md') ? 'README.md' : '',
  categories: CATEGORIES.map(([name]) => name).concat('Other'),
  components,
  pages,
  earlier,
  tools: exists('rbccm-global/local-test.html') ? [{ title: 'Every component on one page', href: 'rbccm-global/local-test.html' }] : [],
  inventory: 'dist/inventory.html',
  teamsite: TEAMSITE
};

export { ROOT };
