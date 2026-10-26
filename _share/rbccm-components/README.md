# RBCCM components: local previews and page builds

TeamSite/LiveSite components for rbccm.com. Each `rbccm-*` folder is one
component: its XSL skin(s), properties XML, CSS, JS and a local preview page.
This package also has the page bundler and the component picker.

## What you need

- Node.js 18 or newer (includes npm): https://nodejs.org
- A terminal opened in this folder (the one with `package.json`)

## One-time setup

```bash
npm install
```

Installs two small dev tools: esbuild (writes the `.min` files) and acorn
(keeps each component's JS in its own scope when bundled). If npm can't reach
the registry (corporate proxy), the build still runs; it just skips the
`.min` files and prints a warning.

## Preview the components

The preview pages load sample data over HTTP, so serve the folder rather than
opening the files directly:

```bash
npx http-server . -p 8743 -c-1
```

Then open:

- http://localhost:8743/rbccm-global/local-test.html: every component, with a
  variant picker across the top. "Show all" stacks them; "Build a page" picks
  components and writes the build command for you.
- `http://localhost:8743/<component>/<component>.html` or `local-test.html`:
  a single component's preview (e.g. `rbccm-hero/rbccm-hero.html`).

`-c-1` turns caching off so edits show on refresh. Stop the server with Ctrl+C.

## Build page bundles

One CSS and one JS file per page, from the component lists in
`build/pages.config.mjs` (order = load order).

```bash
npm run list                      # pages, their components, file status
npm run build                     # build every page
npm run build -- us-credentials   # build one page
npm run watch -- us-credentials   # rebuild on save
```

A one-off page from any components (the picker's "Build a page" writes this):

```bash
npm run build -- --page=my-page --components=rbccm-hero,rbccm-awards,rbccm-cta-band
```

Output goes to `dist/`:

- `dist/css/<page>.css` and `<page>.min.css`
- `dist/js/<page>.js` and `<page>.min.js`
- `dist/build-report.json`

The build also prints the `<link>` / `<script>` tags for the page, with a
content-hash cache buster, pointing at `/assets/rbccm/css/bundles/` and
`/assets/rbccm/js/bundles/`.

Pages set up today: `us-credentials`, `strategy-and-economics`, `maas-mata`.
Add a page by adding an entry to `build/pages.config.mjs` (instructions are
at the top of that file).

## Good to know

- **Bundles are not live yet.** rbccm.com pages still load each component's
  own CSS/JS from `/assets/rbccm/css/components/` and `/js/components/`. The
  bundles are for review and for a future switch.
- **jQuery, Slick and animate.css are not bundled.** The site loads them
  globally.
- **Not in the picker yet:** Accordions, Expertise, Leading experts, In the
  media, Featured insights, Marketo modal/footer, Brightcove background layer,
  JSON Schema. Their folders are here and they can still be built by name.
- **Files are ASCII only** (JS/CSS/XSL). Use `\u00e9`-style escapes for
  accented characters, and no em dashes or curly quotes in code.
- **XSL skins and properties** are pasted into TeamSite; the preview pages
  are local only.
