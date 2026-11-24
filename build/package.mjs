#!/usr/bin/env node
/* =========================================================================
   Package

     npm run package            build the pages, then write the package
     npm run package -- --no-build   skip the page build (use dist/ as it is)

   Writes _package/rbccm-components.zip: everything needed to
   preview the components, run the page builds and run Storybook. The zip is the only
   thing under _package/ that is tracked in git.

   The unzipped copy is left next to it in _package/rbccm-components/ so it
   can be opened or served locally. That folder is rebuilt from scratch
   on every run and is ignored by git; never edit files in it.

   What goes in is set by the lists in build/package-rules.mjs.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { INCLUDE, TRANSFORMS, skip, strayCopies } from './package-rules.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NAME = 'rbccm-components';
const OUT_DIR = path.join(ROOT, '_package');
const STAGE = path.join(OUT_DIR, NAME);
const ZIP = path.join(OUT_DIR, NAME + '.zip');

let count = 0;
let bytes = 0;

function copy(rel) {
  if (skip(rel)) return;
  const from = path.join(ROOT, rel);
  const to = path.join(STAGE, rel);
  const stat = fs.lstatSync(from);
  if (stat.isSymbolicLink()) return;
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(from).sort()) copy(rel + '/' + entry);
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (TRANSFORMS[rel]) {
    fs.writeFileSync(to, TRANSFORMS[rel](fs.readFileSync(from, 'utf8')));
  } else {
    fs.copyFileSync(from, to);
    fs.utimesSync(to, stat.atime, stat.mtime);
  }
  count += 1;
  bytes += fs.statSync(to).size;
}

/* 1. Build the pages so dist/ matches the sources. */
if (!process.argv.includes('--no-build')) {
  execFileSync(process.execPath, [path.join(HERE, 'build.mjs')], { cwd: ROOT, stdio: 'inherit' });
}

/* 2. Start the unzipped copy from scratch. */
if (path.basename(STAGE) !== NAME || path.basename(path.dirname(STAGE)) !== '_package') {
  throw new Error('Refusing to clear ' + STAGE);
}
fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });

/* 3. Copy. */
const components = fs.readdirSync(ROOT)
  .filter((n) => n.startsWith('rbccm-') && fs.statSync(path.join(ROOT, n)).isDirectory())
  .sort();
const missing = [];
for (const item of INCLUDE.concat(components)) {
  if (fs.existsSync(path.join(ROOT, item))) copy(item);
  else missing.push(item);
}

/* 4. Zip. */
fs.rmSync(ZIP, { force: true });
execFileSync('zip', ['-r', '-q', '-X', NAME + '.zip', NAME], { cwd: OUT_DIR, stdio: 'inherit' });

const zipMb = (fs.statSync(ZIP).size / 1048576).toFixed(1);
console.log('');
console.log('Package written: _package/' + NAME + '.zip');
console.log('  ' + count + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB unzipped, ' + zipMb + ' MB zipped');
console.log('  ' + components.length + ' rbccm-* folders');
if (missing.length) console.log('  not found, left out: ' + missing.join(', '));
if (strayCopies.length) {
  console.log('  WARNING: ' + strayCopies.length + ' stray copies left out (delete them):');
  for (const rel of strayCopies) console.log('    ' + rel);
}
