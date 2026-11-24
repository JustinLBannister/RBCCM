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

If it fails with `ENOENT ... package.json`, the terminal is one folder too
high. Unzipping on Windows ("Extract All") puts the package inside a second
folder of the same name, so step into it and run the command again:

```bash
cd rbccm-components
```

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
- http://localhost:8743/dist/outlook-2027.html

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
`etf-innovators` and `outlook-2027`. The last two are not live yet, so they
have no `url`. ETF Innovators has all its sections in, with placeholder
photos for the host and the two stories.

Outlook 2027 uses `rbccm-insight-cards` four times (Featured insight, Macro
views, Perspectives, Latest insights) plus `rbccm-strategic-themes`, so its
preview is one whole page, `outlook-2027/outlook-2027-components.html`,
put together from the skins in page order. That page is included, so
`npm run build` works as is. Images, links and video are placeholders.
Only if you change an Outlook skin or its sample content, rebuild that
page first (needs Python 3 with `lxml`), then run the build. The same
script writes the page's structured data to
`outlook-2027/seo-jsonld-paste.json`, the block to paste into the
`rbccm-json-schema` component; it lists only stories with real links, so
run it again once the links are in:

```bash
python3 outlook-2027/build-components-test.py
npm run build -- outlook-2027
```

Add a page by adding an entry to `build/pages.config.mjs` (instructions are
at the top of that file).

## Component dashboard

`index.html` at the repo root is a dashboard of everything here: every
component with a live preview, what an editor can and cannot change, its
files and TeamSite locations, plus the pages built from them. With the
server running, open:

- http://localhost:8743/

The page is generated. After adding a component, a variant or a page, run:

```bash
npm run dashboard
```

To change how it looks, edit `build/dashboard.template.html`, not
`index.html`. Sections and page names are set at the top of
`build/dashboard.mjs`.

## Storybook

The components are also set up in Storybook: a sidebar of every component
and variant, a Requirements page per component, the editor's fields, and
automated accessibility checks on each variant. The Catalog page lists
every component as a card, grouped by purpose, and the Code tab under each
variant shows its HTML. It needs the one-time `npm install`.

```bash
npm run storybook
```

Then open http://localhost:6006/. The stories are generated from each
component's local preview page, so after changing a component, a preview
page or a README, run:

```bash
npm run stories
```

`npm run build-storybook` writes a static copy to `storybook-static/` that
can be hosted for people who do not have Node. It has to be opened through
a web server (a host, or `npx http-server storybook-static`), not by
double-clicking `index.html`. The look is set in
`.storybook/theme.js`; the Welcome and Foundations pages are in `stories/`.

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
- **Not in the picker:** Brightcove background layer, JSON Schema and
  Filtered content, which have no preview page of their own. Their
  folders are here and they can still be built by name.
- **XSL skins and properties** are pasted into TeamSite; the preview pages
  are local only.
