/* =========================================================================
   Component inventory -- writes dist/inventory.html
   =========================================================================
   Called by build.mjs on every build (and by `npm run inventory`). Reads the
   whole of build/pages.config.mjs, not just the pages being built, so the
   counts always cover every page:

     By component   each component, how many pages use it, which pages
                    (live URL + local preview), and whether a page loads
                    its CSS, JS or both
     By page        each page's components in bundle order
     Not on a page  rbccm-* folders no page lists yet

   One-off pages (--page=... --components=...) aren't saved to the config,
   so they're left out. Page URLs come from `url` in the config.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';

const NOT_COMPONENTS = new Set(['rbccm-global']);   // the all-components preview page

/* 'all' unless the page leaves out a file the component has (e.g. hero
   CSS without its JS): then 'CSS only' / 'JS only'. A component that
   simply has no JS file is still 'all'. */
function loads(root, p) {
  const has = ext => fs.existsSync(path.join(root, p.name, `${p.name}.${ext}`));
  if (has('js') && !p.js.length && p.css.length) return 'CSS only';
  if (has('css') && !p.css.length && p.js.length) return 'JS only';
  return 'all';
}

/* Inventory data, shared by the HTML page and the terminal table. */
export function collectInventory({ root, dist, config, resolvePage, skipPages = [] }) {
  const pages = Object.entries(config.pages)
    .filter(([name]) => !skipPages.includes(name))
    .map(([name, page]) => {
      const parts = resolvePage(name, page);
      return {
        name,
        url: page.url || '',
        preview: fs.existsSync(path.join(dist, `${name}.html`)) ? `${name}.html` : '',
        components: parts.filter(p => !p.name.endsWith('(page files)')).map(p => ({
          name: p.name,
          loads: loads(root, p)
        })),
        pageFiles: parts.filter(p => p.name.endsWith('(page files)')).flatMap(p => [...p.css, ...p.js])
      };
    });

  const byComponent = new Map();
  for (const page of pages) {
    for (const comp of page.components) {
      if (!byComponent.has(comp.name)) byComponent.set(comp.name, []);
      byComponent.get(comp.name).push({ page: page.name, url: page.url, preview: page.preview, loads: comp.loads });
    }
  }
  const components = [...byComponent.entries()]
    .map(([name, uses]) => ({ name, count: uses.length, uses }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const folders = fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('rbccm-') && !NOT_COMPONENTS.has(d.name))
    .map(d => d.name);
  const unused = folders.filter(f => !byComponent.has(f)).sort();

  return { pages, components, unused, folderCount: folders.length };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function pageLinks(u) {
  const links = [];
  if (u.url) links.push(`<a href="${esc(u.url)}" target="_blank" rel="noopener">live</a>`);
  if (u.preview) links.push(`<a href="${esc(u.preview)}">preview</a>`);
  return links.length ? ` <span class="links">${links.join(' &middot; ')}</span>` : '';
}

export function writeInventory(opts) {
  const { dist } = opts;
  const u = collectInventory(opts);
  const generated = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  const componentRows = u.components.map(c => {
    const uses = c.uses.map(x =>
      `<li><strong>${esc(x.page)}</strong>${x.loads !== 'all' ? ` <span class="tag">${esc(x.loads)}</span>` : ''}${pageLinks(x)}</li>`
    ).join('');
    return `<tr data-search="${esc((c.name + ' ' + c.uses.map(x => x.page).join(' ')).toLowerCase())}">
  <td class="name">${esc(c.name)}</td>
  <td class="count"><span class="badge">${c.count}</span></td>
  <td><ul class="uses">${uses}</ul></td>
</tr>`;
  }).join('\n');

  const pageCards = u.pages.map(p => `<section class="page" data-search="${esc((p.name + ' ' + p.components.map(c => c.name).join(' ')).toLowerCase())}">
  <h3>${esc(p.name)} <span class="badge">${p.components.length}</span>${pageLinks(p)}</h3>
  ${p.url ? `<p class="url">${esc(p.url)}</p>` : ''}
  <ol>${p.components.map(c => `<li>${esc(c.name)}${c.loads !== 'all' ? ` <span class="tag">${esc(c.loads)}</span>` : ''}</li>`).join('')}</ol>
  ${p.pageFiles.length ? `<p class="note">Plus page files: ${p.pageFiles.map(esc).join(', ')}</p>` : ''}
</section>`).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Component inventory</title>
<style>
  :root { --ink: #1a1f2b; --muted: #5b6475; --line: #dde3ea; --blue: #0051A5; --navy: #002144; --bg: #f5f7fa; --chip: #e7eef1; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 Roboto, -apple-system, "Segoe UI", Arial, sans-serif; }
  header { background: var(--navy); color: #fff; padding: 28px 24px; }
  header h1 { margin: 0 0 4px; font-size: 26px; font-weight: 500; }
  header p { margin: 0; color: #c9d4e3; font-size: 13px; }
  main { max-width: 1100px; margin: 0 auto; padding: 24px 16px 64px; }
  .stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 20px; }
  .stat { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; min-width: 150px; }
  .stat b { display: block; font-size: 26px; color: var(--navy); font-weight: 500; }
  .stat span { color: var(--muted); font-size: 13px; }
  input[type=search] { width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; font: inherit; margin: 0 0 20px; }
  h2 { font-size: 18px; font-weight: 500; margin: 32px 0 12px; color: var(--navy); }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  th, td { text-align: left; vertical-align: top; padding: 10px 14px; border-bottom: 1px solid var(--line); }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); background: #fafbfc; }
  td.name { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 14px; white-space: nowrap; }
  td.count { width: 70px; }
  .badge { display: inline-block; min-width: 26px; padding: 1px 8px; border-radius: 999px; background: var(--blue); color: #fff; font-size: 13px; text-align: center; font-weight: 500; }
  .tag { display: inline-block; padding: 0 6px; border-radius: 4px; background: var(--chip); color: var(--navy); font-size: 12px; }
  .uses { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  .links { font-size: 13px; color: var(--muted); }
  a { color: var(--blue); }
  .pages { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .page { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
  .page h3 { margin: 0; font-size: 16px; font-weight: 500; }
  .page .url { margin: 2px 0 8px; color: var(--muted); font-size: 12px; word-break: break-all; }
  .page ol { margin: 8px 0 0; padding-left: 22px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; }
  .note { color: var(--muted); font-size: 12px; margin: 8px 0 0; }
  .unused { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
  .unused li { background: #fff; border: 1px dashed var(--line); border-radius: 6px; padding: 4px 10px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; }
  [hidden] { display: none !important; }
  @media (max-width: 640px) {
    table, tbody, tr, td { display: block; width: 100%; }
    thead { display: none; }
    td { border: 0; padding: 4px 14px; }
    tr { border-bottom: 1px solid var(--line); padding: 8px 0; }
    td.name { white-space: normal; }
  }
</style>
</head>
<body>
<header>
  <h1>Component inventory</h1>
  <p>From build/pages.config.mjs &middot; generated ${esc(generated)} &middot; rebuilt by every npm run build</p>
</header>
<main>
  <div class="stats">
    <div class="stat"><b>${u.pages.length}</b><span>pages</span></div>
    <div class="stat"><b>${u.components.length}</b><span>components in use</span></div>
    <div class="stat"><b>${u.unused.length}</b><span>not on a page yet</span></div>
    <div class="stat"><b>${u.folderCount}</b><span>component folders</span></div>
  </div>

  <input type="search" id="filter" placeholder="Filter by component or page" aria-label="Filter by component or page">

  <h2>By component</h2>
  <table>
    <thead><tr><th>Component</th><th>Pages</th><th>Used on</th></tr></thead>
    <tbody>
${componentRows}
    </tbody>
  </table>

  <h2>By page</h2>
  <div class="pages">
${pageCards}
  </div>

  <h2>Not on a page yet</h2>
  ${u.unused.length ? `<ul class="unused">${u.unused.map(n => `<li data-search="${esc(n)}">${esc(n)}</li>`).join('')}</ul>` : '<p class="note">Every component folder is on at least one page.</p>'}
</main>
<script>
  document.getElementById('filter').addEventListener('input', function (e) {
    var q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('[data-search]').forEach(function (el) {
      el.hidden = q !== '' && el.getAttribute('data-search').indexOf(q) === -1;
    });
  });
</script>
</body>
</html>
`;
  fs.mkdirSync(dist, { recursive: true });
  const file = path.join(dist, 'inventory.html');
  fs.writeFileSync(file, html);
  return { file: path.relative(path.dirname(dist), file), inventory: u };
}
