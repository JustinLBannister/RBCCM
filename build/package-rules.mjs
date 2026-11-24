/* =========================================================================
   What goes in the package and what is left out.

   Used by the package build (build/package.mjs), the static Storybook
   export (build/storybook-static.mjs) and the story generator
   (build/stories.mjs), so all three leave out the same things.
   ========================================================================= */
import path from 'node:path';

/* Top-level files and folders that go in. Every rbccm-* folder is added
   to this automatically. */
export const INCLUDE = [
  'README.md',
  'package.json',
  'package-lock.json',
  'build',
  'dist',
  'local-test-fixtures',
  'filtered-content',
  'maas-mata-page',
  'outlook-2027',
  '.storybook',
  'stories'
];

/* Dot folders that go in even though other dot names are left out. */
export const KEEP_DOT = ['.storybook'];

/* Left out wherever they appear: a folder or file with one of these
   names, and anything whose name starts with a dot (editor and system
   files), apart from the Storybook setup folder. */
export const SKIP_NAMES = ['node_modules', '_retired', 'snapshots'];

/* Left out by path (relative to the repo root). A trailing slash means
   the whole folder. */
export const SKIP_PATHS = [
  'outlook-2027/design/',
  'rbccm-global/dist/',
  'build/package.mjs',
  'filtered-content/filtered-content--deals-preview.html',
  'filtered-content/future-state.png',
  'filtered-content/rbccm-en-expertise-transactions.png',
  'filtered-content/rbccm-en-expertise-transactions-preview-1012.png',
  'rbccm-two-up-cards/two-cards-video-single.png'
];

/* Left out by file type: office documents, archives, editor leftovers. */
export const SKIP_EXT = ['.docx', '.pdf', '.pptx', '.key', '.zip', '.tmp'];

/* A stray copy of a file: the same name with a space and a number
   before the extension ("index 2.html"), as a file sync leaves behind
   when two versions collide. Never part of the package. */
export const isStrayCopy = (name) => / \d+(\.[^./]+)?$/.test(name);
export const strayCopies = [];

export function skip(rel) {
  const parts = rel.split('/');
  const base = parts[parts.length - 1];
  if (isStrayCopy(base)) { strayCopies.push(rel); return true; }
  if (parts.some((p) => SKIP_NAMES.includes(p) || (p.startsWith('.') && !KEEP_DOT.includes(p)))) return true;
  if (SKIP_EXT.includes(path.extname(base).toLowerCase())) return true;
  return SKIP_PATHS.some((p) => (p.endsWith('/') ? (rel + '/').startsWith(p) : rel === p));
}

/* The package copy of the filtered-content README leaves out the deal
   preview skin, which is not in the package. */
export function trimFilteredContentReadme(text) {
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

/* The package copy of package.json has no package command: making the
   package is done from the repo, not from a copy of the package. */
export function trimPackageJson(text) {
  const pkg = JSON.parse(text);
  if (pkg.scripts) delete pkg.scripts.package;
  return JSON.stringify(pkg, null, 2) + '\n';
}

export const TRANSFORMS = {
  'filtered-content/README.md': trimFilteredContentReadme,
  'package.json': trimPackageJson
};
