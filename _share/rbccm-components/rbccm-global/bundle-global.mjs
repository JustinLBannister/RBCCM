#!/usr/bin/env node
/* =========================================================================
   rbccm-global -- portable bundle.

     npm run global:bundle      (from the RBCCM root)

   Rebuilds local-test.html, then copies it plus every local file it
   touches (component CSS/JS, photos, videos, anything a CSS url() points
   at) into rbccm-global/dist/rbccm-global-bundle/, keeping the same
   folder layout so every relative path still resolves. Zips that to
   rbccm-global/dist/rbccm-global-bundle.zip.

   On the other computer: unzip, open index.html. jQuery / Slick /
   Bootstrap / animate.css and the placeholder headshots still load from
   their CDNs, so it needs an internet connection.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(HERE, 'dist');
const NAME = 'rbccm-global-bundle';
const OUT = path.join(DIST, NAME);

execFileSync(process.execPath, [path.join(HERE, 'build-global.mjs')], { stdio: 'inherit' });

const isLocal = (u) => u && !/^(?:[a-z]+:|\/\/|\/|#|%23|data:|\{)/i.test(u);
const clean = (u) => decodeURIComponent(u.replace(/&amp;/g, '&').split(/[?#]/)[0]);

function refsInHtml(html) {
  const out = [];
  for (const m of html.matchAll(/\s(?:src|href|poster)=["']([^"']+)["']/g)) out.push(m[1]);
  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/g)) {
    m[1].split(',').forEach((p) => out.push(p.trim().split(/\s+/)[0]));
  }
  return out.concat(refsInCss(html));
}
function refsInCss(css) {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]);
}

const copied = new Set();
const missing = [];
function take(absFile) {
  const rel = path.relative(ROOT, absFile);
  if (rel.startsWith('..')) { missing.push(`${rel} (outside RBCCM folder)`); return; }
  if (copied.has(rel)) return;
  if (!fs.existsSync(absFile) || !fs.statSync(absFile).isFile()) { missing.push(rel); return; }
  copied.add(rel);
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(absFile, dest);
  if (absFile.endsWith('.html')) {
    // Standalone test pages linked from the global page: bring their
    // assets too so the "Open standalone test" links work in the bundle.
    const html = fs.readFileSync(absFile, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    refsInHtml(html).filter(isLocal).forEach((u) => take(path.resolve(path.dirname(absFile), clean(u))));
  }
  if (absFile.endsWith('.css')) {
    const css = fs.readFileSync(absFile, 'utf8');
    refsInCss(css).filter(isLocal).forEach((u) => take(path.resolve(path.dirname(absFile), clean(u))));
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
const page = path.join(HERE, 'local-test.html');
take(page);
const html = fs.readFileSync(page, 'utf8');
refsInHtml(html).filter(isLocal).forEach((u) => take(path.resolve(HERE, clean(u))));


fs.writeFileSync(path.join(OUT, 'index.html'),
`<!DOCTYPE html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=rbccm-global/local-test.html">
<title>rbccm-global</title>
<a href="rbccm-global/local-test.html">Open rbccm-global</a>
`);

const zip = path.join(DIST, `${NAME}.zip`);
execFileSync('zip', ['-qr', zip, NAME], { cwd: DIST });

const bytes = [...copied].reduce((n, r) => n + fs.statSync(path.join(ROOT, r)).size, 0);
console.log(`Bundled ${copied.size} files (${(bytes / 1048576).toFixed(1)} MB) -> ${path.relative(ROOT, zip)}`);
if (missing.length) console.warn('Referenced but not found (broken in the source too):\n  ' + [...new Set(missing)].join('\n  '));
