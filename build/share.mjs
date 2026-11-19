#!/usr/bin/env node
/* =========================================================================
   Share package

     npm run share            build the pages, then write the package
     npm run share -- --no-build   skip the page build (use dist/ as it is)

   Writes _share/rbccm-components.zip: everything a coworker needs to
   preview the components and run the page builds. The zip is the only
   thing under _share/ that is tracked in git.

   The unzipped copy is left next to it in _share/rbccm-components/ so it
   can be opened or served locally. That folder is rebuilt from scratch
   on every run and is ignored by git; never edit files in it.

   What goes in is set by the three lists below.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NAME = 'rbccm-components';
const SHARE = path.join(ROOT, '_share');
const STAGE = path.join(SHARE, NAME);
const ZIP = path.join(SHARE, NAME + '.zip');

/* Top-level files and folders that go in. Every rbccm-* folder is added
   to this automatically. */
const INCLUDE = [
  'README.md',
  'package.json',
  'package-lock.json',
  'build',
  'dist',
  'local-test-fixtures',
  'filtered-content',
  'maas-mata-page',
  'outlook-2027'
];

/* Left out wherever they appear: a folder or file with one of these names. */
const SKIP_NAMES = ['.DS_Store', 'node_modules', '_retired', 'snapshots', '.claude'];

/* Left out by path (relative to the repo root). A trailing slash means
   the whole folder. */
const SKIP_PATHS = [
  'outlook-2027/design/',
  'rbccm-global/dist/',
  'filtered-content/filtered-content--deals-preview.html',
  'filtered-content/future-state.png',
  'filtered-content/rbccm-en-expertise-transactions.png',
  'filtered-content/rbccm-en-expertise-transactions-preview-1012.png',
  'rbccm-two-up-cards/two-cards-video-single.png'
];

/* Left out by file type: office documents, archives, editor leftovers. */
const SKIP_EXT = ['.docx', '.pdf', '.pptx', '.key', '.zip', '.tmp'];

function skip(rel) {
  const parts = rel.split('/');
  const base = parts[parts.length - 1];
  if (parts.some((p) => SKIP_NAMES.includes(p))) return true;
  if (base.startsWith('.~lock')) return true;
  if (SKIP_EXT.includes(path.extname(base).toLowerCase())) return true;
  return SKIP_PATHS.some((p) => (p.endsWith('/') ? (rel + '/').startsWith(p) : rel === p));
}

/* The package copy of the filtered-content README leaves out the deal
   preview skin, which is not in the package. */
function trimFilteredContentReadme(text) {
  let out = text.replace(/\n---\n\n## Deals preview skin\n[\s\S]*?(?=\n## |$)/, '\n');
  out = out
    .split('\n')
    .filter((line) => !(line.includes('filtered-content--deals-preview.html') &&
      (line.startsWith('| ') || line.startsWith('- A second skin'))))
    .join('\n');
  out = out.replace(' (Transactions; the "Deals preview skin" section below records this skin as live there)', ' (Transactions)');
  out = out.replace(', plus the separate skin for deal preview pages', '');
  return out.replace(/\n+$/, '\n');
}

const TRANSFORMS = {
  'filtered-content/README.md': trimFilteredContentReadme
};

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

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
if (path.basename(STAGE) !== NAME || path.basename(path.dirname(STAGE)) !== '_share') {
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

/* 4. Stamp it, so anyone can tell which package they have. */
const commit = git(['rev-parse', '--short', 'HEAD']);
const dirty = git(['status', '--porcelain', '--untracked-files=no']) !== '';
const stamp = [
  'RBCCM components package',
  'Built: ' + new Date().toISOString(),
  'Commit: ' + (commit || 'unknown') + (dirty ? ' + uncommitted changes' : ''),
  'Files: ' + count,
  ''
].join('\n');
fs.writeFileSync(path.join(STAGE, 'VERSION.txt'), stamp);

/* 5. Zip. */
fs.rmSync(ZIP, { force: true });
execFileSync('zip', ['-r', '-q', '-X', NAME + '.zip', NAME], { cwd: SHARE, stdio: 'inherit' });

const zipMb = (fs.statSync(ZIP).size / 1048576).toFixed(1);
console.log('');
console.log('Share package written: _share/' + NAME + '.zip');
console.log('  ' + count + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB unzipped, ' + zipMb + ' MB zipped');
console.log('  ' + components.length + ' rbccm-* folders');
console.log('  commit ' + (commit || 'unknown') + (dirty ? ' + uncommitted changes' : ''));
if (missing.length) console.log('  not found, left out: ' + missing.join(', '));
