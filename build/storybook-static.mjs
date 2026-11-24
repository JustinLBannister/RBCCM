#!/usr/bin/env node
/* =========================================================================
   Static Storybook export

     npm run build-storybook

   Runs the Storybook build, then takes out of storybook-static/ the same
   files the package leaves out (build/package-rules.mjs), so the
   export is safe to host or zip.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { TRANSFORMS, skip } from './package-rules.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'storybook-static');
const BIN = path.join(ROOT, 'node_modules', 'storybook', 'dist', 'bin', 'dispatcher.js');

execFileSync(process.execPath, [BIN, 'build', '-o', OUT], { cwd: ROOT, stdio: 'inherit' });

/* Only the folders copied over from the repo are checked; Storybook's own
   files are left alone. */
let removed = 0;
function prune(rel) {
  const full = path.join(OUT, rel);
  if (skip(rel)) {
    fs.rmSync(full, { recursive: true, force: true });
    removed += 1;
    return;
  }
  if (fs.lstatSync(full).isDirectory()) {
    for (const entry of fs.readdirSync(full)) prune(rel + '/' + entry);
    return;
  }
  if (TRANSFORMS[rel]) fs.writeFileSync(full, TRANSFORMS[rel](fs.readFileSync(full, 'utf8')));
}

for (const entry of fs.readdirSync(OUT)) {
  const source = path.join(ROOT, entry);
  if (entry.startsWith('rbccm-') || ['filtered-content', 'local-test-fixtures', 'maas-mata-page', 'outlook-2027', 'dist'].includes(entry)) {
    if (fs.existsSync(source)) prune(entry);
  }
}
console.log('Left out of the export: ' + removed + ' files or folders (see build/package-rules.mjs)');
