# RBCCM components: local previews and page builds

TeamSite/LiveSite components for rbccm.com. Each `rbccm-*` folder is one
component: its XSL skin(s), properties XML, CSS, JS and a local preview page.
`filtered-content` is one too (filter bar + paginated list with four presets;
its own README explains them). Its `filtered-content.html` is the TeamSite
skin, so its preview page is `local-test.html`.
This package also has the page bundler and the component picker.

## What you need

- Node.js 22.23.4+, 24.22.1+ or 26.12.1+ (includes npm): https://nodejs.org
  Older versions have a Brotli decoder bug (CVE-2026-111497, "HTTP2Shell").
  Node 18, 20, 23 and 25 are end of life and won't be fixed. Check with
  `node -v`; the build prints a warning if your version needs updating.
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

If it fails with `EADDRINUSE: address already in use`, another server
(often an old one from an earlier session) already has port 8743. Either
stop that one (Ctrl+C in its terminal) or pick another port and use it in
the links too:

```bash
npx http-server . -p 8745 -c-1
```

Then open `http://localhost:8745/...` instead of `8743`.

Open the pages through the server, not by double-clicking them (`file://`):
some images, videos and sample data only load over `http://localhost`.

## Build page bundles

One CSS and one JS file per page, from the component lists in
`build/pages.config.mjs` (order = load order).

```bash
npm run list                      # pages, their components, file status
npm run build                     # build every page
npm run build -- us-credentials   # build one page
npm run watch -- us-credentials   # rebuild on save
npm run inventory                 # component counts only (no bundles)
```

A one-off page from any components (the picker's "Build a page" writes this):

```bash
npm run build -- --page=my-page --components=rbccm-hero,rbccm-awards,rbccm-cta-band,rbccm-animate
```

Add `rbccm-animate` at the end of the list whenever the page has scroll or
entrance animations (most components do). It's the small script that runs
them; it adds no section to the page. Without it everything still shows,
just without the animations, and the build warns:
`... loads rbccm-animate/rbccm-animate.js, which isn't in the bundle`.
The pages in `build/pages.config.mjs` already include it.

Output goes to `dist/`:

- `dist/css/<page>.css` and `<page>.min.css`
- `dist/js/<page>.js` and `<page>.min.js`
- `dist/<page>.html`: a preview of the page (see below)
- `dist/inventory.html`: which components are used where (see below)
- `dist/build-report.json`

The build also prints the `<link>` / `<script>` tags for the page, with a
content-hash cache buster, pointing at `/assets/rbccm/css/bundles/` and
`/assets/rbccm/js/bundles/`.

## Preview a built page

Every build also writes `dist/<page>.html`: the page's components stacked
in bundle order, styled and scripted ONLY by that page's bundle (plus
jQuery, Slick, Bootstrap and animate.css, which the site loads globally).
Use it to check the bundle before uploading. With the server running:

- http://localhost:8743/dist/us-credentials.html
- http://localhost:8743/dist/strategy-and-economics.html
- http://localhost:8743/dist/maas-mata.html
- http://localhost:8743/dist/etf-innovators.html

Each component shows one variant; `preview` in `build/pages.config.mjs`
picks which. If a component's preview page needs a file the bundle doesn't
include, the build prints a warning, since the real page would miss it
too. Sections that load live rbccm.com feeds (In the media, Featured
insights) show their fallback content locally, as in their own previews.
The ETF Innovators episode grid reads saved copies of the insights feeds
in `filtered-content/_local-data/`, and Meet the host's media appearances
read saved copies of the In the Media feed in `rbccm-host-profile/_local-data/`,
so both fill in locally.

Pages set up today: `us-credentials`, `strategy-and-economics`, `maas-mata`,
and `etf-innovators` (not live yet, so it has no `url`; all its sections are
in, with placeholder photos for the host and the two stories).
Add a page by adding an entry to `build/pages.config.mjs` (instructions are
at the top of that file).

## Component inventory

Every build also writes `dist/inventory.html`. Open it with the server
running:

- http://localhost:8743/dist/inventory.html

It has three views:

- **By component:** each component, how many pages use it, and which pages
  (live URL + local preview). It also notes when a page loads only a
  component's CSS or only its JS.
- **By page:** each page's components in bundle order.
- **Not on a page yet:** `rbccm-*` folders that no page in the config lists.

The counts cover the pages in `build/pages.config.mjs`, not every page on
rbccm.com. A component used on a page that isn't in the config (the JSON
Schema, for example) shows under "Not on a page yet".
Add the page to the config to count it. `url` on each page entry is the
live link the inventory shows.

`npm run inventory` rewrites the inventory without building the bundles.

## Good to know

- **Bundles are not live yet.** rbccm.com pages still load each component's
  own CSS/JS from `/assets/rbccm/css/components/` and `/js/components/`. The
  bundles are for review and for a future switch.
- **jQuery, Slick and animate.css are not bundled.** The site loads them
  globally.
- **Not in the picker yet:** Accordions, Expertise, Leading experts, In the
  media, Featured insights, Marketo modal/footer, Brightcove background
  layer, JSON Schema, Filtered content, Host profile, Insight list. Their
  folders are here and they can still be built by name.
- **XSL skins and properties** are pasted into TeamSite; the preview pages
  are local only.
