/* Storybook setup for the RBCCM component library.

   Stories are generated from each component's local preview page by
   `npm run stories` (build/stories.mjs). The preview pages and their
   CSS, JS and images are served as they are, at the same paths they
   have in the repo. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Folders the previews load files from. */
const served = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((n) => n.startsWith('rbccm-') || ['filtered-content', 'local-test-fixtures', 'maas-mata-page', 'outlook-2027', 'dist'].includes(n));

export default {
  framework: { name: '@storybook/html-vite', options: {} },
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  staticDirs: served.map((dir) => ({ from: '../' + dir, to: '/' + dir })),
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  features: { sidebarOnboardingChecklist: false }
};
