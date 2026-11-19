#!/usr/bin/env node
/* =========================================================================
   Component dashboard

     npm run dashboard

   Writes index.html at the repo root: one page that lists every
   component, the pages built from them and the earlier component work,
   with live previews. Open it through the local server:

     http://localhost:8743/

   The page is build/dashboard.template.html with the data below dropped
   in. Edit the look in the template; re-run this after adding a
   component, a variant or a page so the list stays current.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog as data, ROOT } from './catalog.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(HERE, 'dashboard.template.html');
const OUT = path.join(ROOT, 'index.html');
const MARK = '/*__DASHBOARD_DATA__*/null';
const { components, pages, earlier } = data;

/* JSON that is safe inside a <script> tag and plain ASCII. */
const json = JSON.stringify(data)
  .replace(/</g, '\\u003c')
  .replace(/[\u007f-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

const template = fs.readFileSync(TEMPLATE, 'utf8');
if (!template.includes(MARK)) throw new Error('Data marker not found in ' + path.relative(ROOT, TEMPLATE));
fs.writeFileSync(OUT, template.replace(MARK, () => json));

const variants = components.reduce((n, c) => n + c.variants.length, 0);
console.log('Dashboard written: index.html');
console.log('  ' + components.length + ' components (' + variants + ' variants), ' + pages.length + ' pages, ' +
  earlier.length + ' earlier folders');
const noPreview = components.filter((c) => !c.preview).map((c) => c.id);
if (noPreview.length) console.log('  no preview page: ' + noPreview.join(', '));
