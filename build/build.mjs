#!/usr/bin/env node
/* =========================================================================
   RBCCM page bundler
   =========================================================================
   Reads build/pages.config.mjs and writes one CSS + one JS bundle per page.

   Usage (from the repo root):
     npm run build                       build every page
     npm run build -- us-credentials     build one page (or several)
     npm run watch                       rebuild on save
     npm run watch -- us-credentials     watch one page
     npm run list                        show pages, components, file status

   Output:
     dist/css/<page>.css  + .min.css
     dist/js/<page>.js    + .min.js
     dist/build-report.json

   Minifying uses esbuild (devDependency). If it isn't installed yet the
   readable bundles are still written and minifying is skipped with a
   warning. Run `npm install` once to get the .min files.

   JS files are joined as-is (not wrapped), so each component keeps its
   own scope exactly as it had with separate <script> tags.
   ========================================================================= */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(ROOT, 'build', 'pages.config.mjs');
const DIST = path.join(ROOT, 'dist');
const DEPLOY_CSS = '/assets/rbccm/css/bundles';
const DEPLOY_JS = '/assets/rbccm/js/bundles';

const args = process.argv.slice(2);
const WATCH = args.includes('--watch');
const LIST = args.includes('--list');
const pageArgs = args.filter(a => !a.startsWith('--'));

const c = {
  red: s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  dim: s => `\x1b[2m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`
};

/* ---------- config ------------------------------------------------------ */
async function loadConfig() {
  // Query string defeats Node's module cache so watch mode sees edits.
  const mod = await import(pathToFileURL(CONFIG_PATH).href + '?t=' + Date.now());
  return mod.default;
}

/* Turn one component entry into { name, css: [...], js: [...] } with
   repo-relative paths. Shorthand entries use the naming convention and
   only include files that exist. Explicit entries must exist. */
function resolveComponent(entry) {
  if (typeof entry === 'string') {
    const css = `${entry}/${entry}.css`;
    const js = `${entry}/${entry}.js`;
    const out = {
      name: entry,
      css: fs.existsSync(path.join(ROOT, css)) ? [css] : [],
      js: fs.existsSync(path.join(ROOT, js)) ? [js] : [],
      explicit: false
    };
    if (!fs.existsSync(path.join(ROOT, entry))) out.missingFolder = true;
    return out;
  }
  return {
    name: entry.name,
    css: entry.css || [],
    js: entry.js || [],
    explicit: true
  };
}

function resolvePage(name, page) {
  const comps = (page.components || []).map(resolveComponent);
  const extra = {
    name: `${name} (page files)`,
    css: (page.extra && page.extra.css) || [],
    js: (page.extra && page.extra.js) || [],
    explicit: true
  };
  const hasExtra = extra.css.length || extra.js.length;
  const parts = !hasExtra ? comps
    : page.extraPosition === 'after' ? [...comps, extra] : [extra, ...comps];
  return parts;
}

/* ---------- checks ------------------------------------------------------ */
function validate(pageName, parts) {
  const errors = [];
  for (const p of parts) {
    if (p.missingFolder) errors.push(`component folder "${p.name}/" not found`);
    else if (!p.explicit && !p.css.length && !p.js.length) {
      errors.push(`"${p.name}" has no ${p.name}.css or ${p.name}.js`);
    }
    for (const f of [...p.css, ...p.js]) {
      if (!fs.existsSync(path.join(ROOT, f))) errors.push(`missing file ${f} (from ${p.name})`);
    }
  }
  return errors.map(e => `[${pageName}] ${e}`);
}

/* CSS that points at files by relative path breaks once it's moved into
   dist/. Flag it so it can be switched to an absolute /assets/ path. */
function cssWarnings(file, text) {
  const warnings = [];
  const noComments = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
  let m;
  while ((m = urlRe.exec(noComments))) {
    const u = m[1].trim();
    if (!/^(data:|https?:|\/|#)/i.test(u)) {
      warnings.push(`${file}: relative url(${u}) will break in the bundle, use an absolute /assets/ path`);
    }
  }
  if (/@import\s/i.test(noComments)) {
    warnings.push(`${file}: contains @import; it will not be inlined`);
  }
  return warnings;
}

/* ---------- build ------------------------------------------------------- */
let esbuildMod;
async function getEsbuild() {
  if (esbuildMod !== undefined) return esbuildMod;
  try { esbuildMod = await import('esbuild'); }
  catch { esbuildMod = null; }
  return esbuildMod;
}

function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
function kb(n) { return (n / 1024).toFixed(1) + ' KB'; }
function hash(s) { return crypto.createHash('sha1').update(s).digest('hex').slice(0, 8); }

function banner(pageName, kind, parts, version) {
  const names = parts.filter(p => (kind === 'css' ? p.css : p.js).length).map(p => p.name);
  return `/*! RBCCM ${pageName}.${kind} | v${version} | built ${new Date().toISOString()}\n` +
         ` *  ${names.join(', ')} */\n`;
}

/* ---------- JS isolation ------------------------------------------------ */
/* With separate <script> tags, a component that throws while loading
   doesn't stop the others. In one concatenated file it would, so each
   file gets its own try/catch. That's only safe when the file declares
   nothing at the top level (let/const/class/function would become
   block-scoped inside the try). Every current component is a pure IIFE;
   anything that isn't is left unwrapped and flagged.

   Parsing also turns syntax errors into "file:line" instead of a line
   number inside the bundle. */
let acornMod;
async function getAcorn() {
  if (acornMod !== undefined) return acornMod;
  try { acornMod = await import('acorn'); }
  catch { acornMod = null; }
  return acornMod;
}

function topLevelDeclarations(acorn, file, src) {
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true });
  const names = [];
  for (const n of ast.body) {
    if (n.type === 'VariableDeclaration') n.declarations.forEach(d => names.push(`${n.kind} ${d.id.name || '(pattern)'}`));
    else if (n.type === 'FunctionDeclaration') names.push(`function ${n.id.name}`);
    else if (n.type === 'ClassDeclaration') names.push(`class ${n.id.name}`);
  }
  return names;
}

async function concat(kind, parts) {
  const chunks = [];
  const warnings = [];
  const errors = [];
  const acorn = kind === 'js' ? await getAcorn() : null;

  for (const p of parts) {
    for (const f of (kind === 'css' ? p.css : p.js)) {
      const text = read(f).replace(/^﻿/, '').trimEnd();

      if (kind === 'css') {
        warnings.push(...cssWarnings(f, text));
        chunks.push(`\n/* ==== ${f} ==== */\n${text}\n`);
        continue;
      }

      let wrap = !!acorn;
      if (acorn) {
        try {
          const decls = topLevelDeclarations(acorn, f, text);
          if (decls.length) {
            wrap = false;
            warnings.push(`${f}: top-level ${decls.join(', ')}; joined unwrapped, so a load error here would stop later files`);
          }
        } catch (e) {
          errors.push(`${f}:${e.loc ? e.loc.line + ':' + e.loc.column : ''} syntax error: ${e.message.replace(/\s*\(\d+:\d+\)$/, '')}`);
          continue;
        }
      }

      const label = JSON.stringify(f);
      chunks.push(wrap
        ? `\n/* ==== ${f} ==== */\ntry {\n${text}\n;\n} catch (e) { if (window.console) console.error('[rbccm bundle] ' + ${label} + ' failed to load', e); }\n`
        : `\n/* ==== ${f} ==== */\n${text}\n;\n`);
    }
  }
  if (kind === 'js' && !acorn) {
    warnings.push('acorn not installed: JS files joined without per-file isolation. Run `npm install`.');
  }
  return { body: chunks.join(''), warnings, errors };
}

async function buildPage(pageName, page, version) {
  const parts = resolvePage(pageName, page);
  const errors = validate(pageName, parts);
  if (errors.length) return { pageName, errors };

  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });

  const esbuild = await getEsbuild();
  const result = { pageName, errors: [], warnings: [], files: {} };

  for (const kind of ['css', 'js']) {
    const { body, warnings, errors: concatErrors } = await concat(kind, parts);
    result.warnings.push(...warnings);
    if (concatErrors.length) {
      result.errors.push(...concatErrors.map(e => `[${pageName}] ${e}`));
      continue;
    }
    const outDir = path.join(DIST, kind);
    const readablePath = path.join(outDir, `${pageName}.${kind}`);
    const minPath = path.join(outDir, `${pageName}.min.${kind}`);

    if (!body.trim()) {
      // Nothing of this kind on the page; clear stale output.
      for (const p of [readablePath, minPath]) if (fs.existsSync(p)) fs.unlinkSync(p);
      continue;
    }

    const readable = banner(pageName, kind, parts, version) + body;
    fs.writeFileSync(readablePath, readable);
    const entry = { readable: path.relative(ROOT, readablePath), size: readable.length };

    if (esbuild) {
      try {
        const out = await esbuild.transform(readable, {
          loader: kind,
          minify: true,
          legalComments: 'inline',
          logLevel: 'silent'
        });
        fs.writeFileSync(minPath, out.code);
        entry.min = path.relative(ROOT, minPath);
        entry.minSize = out.code.length;
        entry.hash = hash(out.code);
      } catch (e) {
        // A syntax error in any source file lands here, with the line in
        // the readable bundle. The /* ==== file ==== */ markers above it
        // show which source file it came from.
        result.errors.push(`[${pageName}] ${kind} minify failed: ${(e.errors && e.errors[0] && e.errors[0].text) || e.message}` +
          (e.errors && e.errors[0] && e.errors[0].location ? ` (dist/${kind}/${pageName}.${kind} line ${e.errors[0].location.line})` : ''));
      }
    } else {
      entry.hash = hash(readable);
    }
    result.files[kind] = entry;
  }
  result.components = parts.map(p => p.name);
  return result;
}

async function buildAll(names) {
  const config = await loadConfig();
  const version = config.version || '1';
  const all = Object.keys(config.pages);
  const targets = names.length ? names : all;

  const unknown = targets.filter(n => !config.pages[n]);
  if (unknown.length) {
    console.error(c.red(`Unknown page: ${unknown.join(', ')}. Pages: ${all.join(', ')}`));
    return false;
  }

  const esbuild = await getEsbuild();
  if (!esbuild) console.warn(c.yellow('esbuild not installed, skipping .min files. Run `npm install` once.'));

  const results = [];
  for (const n of targets) results.push(await buildPage(n, config.pages[n], version));

  let ok = true;
  for (const r of results) {
    if (r.errors.length) {
      ok = false;
      r.errors.forEach(e => console.error(c.red('✖ ' + e)));
      continue;
    }
    const css = r.files.css, js = r.files.js;
    const fmt = f => !f ? c.dim('none') : f.minSize != null ? `${kb(f.minSize)} min (${kb(f.size)} raw)` : kb(f.size);
    console.log(`${c.green('✔')} ${c.bold(r.pageName)}  ${c.dim(r.components.length + ' parts')}  css ${fmt(css)}  js ${fmt(js)}`);
    r.warnings.forEach(w => console.warn(c.yellow('  ⚠ ' + w)));
  }

  // Report + include tags (merge with existing report so single-page
  // builds don't drop the others).
  const reportPath = path.join(DIST, 'build-report.json');
  let report = {};
  try { report = JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch {}
  report.version = version;
  report.pages = report.pages || {};
  for (const r of results) {
    if (r.errors.length) continue;
    const tags = [];
    if (r.files.css) tags.push(`<link rel="stylesheet" href="${DEPLOY_CSS}/${r.pageName}.min.css?v=${r.files.css.hash}">`);
    if (r.files.js) tags.push(`<script src="${DEPLOY_JS}/${r.pageName}.min.js?v=${r.files.js.hash}"></script>`);
    report.pages[r.pageName] = { builtAt: new Date().toISOString(), components: r.components, files: r.files, includeTags: tags, warnings: r.warnings };
  }
  if (fs.existsSync(DIST)) fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (!WATCH && results.some(r => !r.errors.length)) {
    console.log(c.dim('\nInclude tags (cache-bust = content hash):'));
    for (const r of results) {
      const p = report.pages[r.pageName];
      if (p) { console.log(c.dim(`  ${r.pageName}:`)); p.includeTags.forEach(t => console.log('    ' + t)); }
    }
  }
  return ok;
}

/* ---------- list -------------------------------------------------------- */
async function list() {
  const config = await loadConfig();
  for (const [name, page] of Object.entries(config.pages)) {
    console.log(c.bold(name));
    for (const p of resolvePage(name, page)) {
      const files = [...p.css, ...p.js];
      const status = p.missingFolder ? c.red('folder missing')
        : files.map(f => fs.existsSync(path.join(ROOT, f)) ? f : c.red(f + ' (missing)')).join(', ') || c.red('no files');
      console.log(`  ${p.name.padEnd(28)} ${status}`);
    }
  }
}

/* ---------- watch ------------------------------------------------------- */
async function watch(names) {
  const config = await loadConfig();
  const targets = names.length ? names : Object.keys(config.pages);

  // file -> pages that use it
  const uses = new Map();
  for (const n of targets) {
    if (!config.pages[n]) continue;
    for (const p of resolvePage(n, config.pages[n])) {
      for (const f of [...p.css, ...p.js]) {
        const abs = path.join(ROOT, f);
        if (!uses.has(abs)) uses.set(abs, new Set());
        uses.get(abs).add(n);
      }
    }
  }

  await buildAll(targets);
  console.log(c.dim(`\nWatching ${uses.size} files. Ctrl+C to stop.`));

  let timer = null;
  const pending = new Set();
  const queue = pagesToBuild => {
    pagesToBuild.forEach(p => pending.add(p));
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const batch = [...pending]; pending.clear();
      console.log(c.dim(`\n${new Date().toLocaleTimeString()} rebuilding ${batch.join(', ')}`));
      await buildAll(batch);
    }, 120);
  };

  const dirs = new Set([...uses.keys()].map(f => path.dirname(f)));
  for (const dir of dirs) {
    fs.watch(dir, (evt, filename) => {
      if (!filename) return;
      const abs = path.join(dir, filename.toString());
      if (uses.has(abs)) queue(uses.get(abs));
    });
  }
  // Editing the manifest rebuilds everything being watched.
  fs.watch(path.dirname(CONFIG_PATH), (evt, filename) => {
    if (filename && filename.toString() === path.basename(CONFIG_PATH)) queue(targets);
  });
}

/* ---------- main -------------------------------------------------------- */
if (LIST) await list();
else if (WATCH) await watch(pageArgs);
else process.exitCode = (await buildAll(pageArgs)) ? 0 : 1;
