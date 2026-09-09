# RBCCM Hero

Shared hero component. One CSS partial, one BEM block (`.rbccm-hero`), and per-page variant modifiers (`.rbccm-hero--maas-mata`, `.rbccm-hero--strategy-and-economics`, etc.). Each page authors its own hero markup inline in its own XSL -- the shared CSS just provides the shell, typography lock, and variant-specific layout / bg / accents.

## Files

- `rbccm-hero.css` -- the shared partial. Base block + all variant modifiers. Ships to `/assets/rbccm/css/components/rbccm-hero.css`.
- `rbccm-hero.html` -- local preview showing every variant side-by-side.
- `README.md` -- this file.

No XSL, no Properties.xml, no JS -- this is a pure CSS component. Each consumer page's XSL emits the markup with the right variant class; the component handles the visual result.

## What the base block owns

- Vertical padding response with fixed-nav compensation (`--rbccm-hero-pt-m/d`, `--rbccm-hero-pb-m/d` custom props tunable inline)
- Container max-width + horizontal gutter (`.rbccm-hero__container`, 1180px max, 16/24 padding)
- Font-family lock on `h1` / `h2` / `.__title` / `.__title-line` (defends against `unified.css` tag-level rules that suppress `RBCDisplay`)
- Base color tokens (navy, blue, yellow, ink) as CSS custom props scoped to the block

## Adding a new variant

1. Author page markup with `class="rbccm-hero rbccm-hero--{page-slug}"` on the outer `<section>`
2. Add a new `--{page-slug}` modifier block at the bottom of `rbccm-hero.css` with the variant's layout + typography + bg treatment
3. Load `rbccm-hero.css` in your page **before** any page-specific CSS so page rules can still override

## Consumers

| Page | Modifier class | Markup shape |
|---|---|---|
| MAAS+MATA | `.rbccm-hero--maas-mata` | Centred eyebrow / 2-line H1 / subtitle / dual CTA row, glow halo backdrop |
| Strategy & Economics | `.rbccm-hero--strategy-and-economics` | Split 2-col grid: left = eyebrow / large H1 / body; right = `__aside` slot (video panel OR insight card) |
| _(candidates)_ Insights hub, About Us, others | (TBD) | To be added |

## Migration checklist for MAAS+MATA

1. Import `rbccm-hero.css` before `maas-mata.css` in the page XSL
2. Rename markup classes in `maas-mata.html`/`.xsl`:
   - `rbccm-maas-mata__hero` -> `rbccm-hero rbccm-hero--maas-mata`
   - `rbccm-maas-mata__hero-eyebrow` -> `rbccm-hero__eyebrow`
   - `rbccm-maas-mata__hero-title` -> `rbccm-hero__title`
   - `rbccm-maas-mata__hero-title-line` -> `rbccm-hero__title-line`
   - `rbccm-maas-mata__hero-subtitle` -> `rbccm-hero__subtitle`
   - `rbccm-maas-mata__hero-actions` -> `rbccm-hero__actions`
3. Delete the corresponding rules from `maas-mata.css` (kept in `rbccm-hero.css` now)
4. Bump the page's `AssetVersion` / cache-buster

## Migration checklist for Strategy & Economics

1. Import `rbccm-hero.css` in the page XSL
2. Rename markup classes in `strategy-econ.html`:
   - `rbccm-se__hero` -> `rbccm-hero rbccm-hero--strategy-and-economics`
   - `rbccm-se__hero-grid` -> `rbccm-hero__grid`
   - `rbccm-se__hero-eyebrow` -> `rbccm-hero__eyebrow`
   - `rbccm-se__hero-title` -> `rbccm-hero__title`
   - `rbccm-se__hero-body` -> `rbccm-hero__body`
   - `rbccm-se__hero-media` / `rbccm-se__hero-media-play` -> `rbccm-hero__aside` (and inner content, whether video-panel or insight-card, uses `__insight-*` classes documented in `rbccm-hero.css`)
3. Delete the corresponding rules from `strategy-econ.html`'s inline `<style>` block
4. Bump the page's `AssetVersion` / cache-buster

## Deploy checklist

1. Push `rbccm-hero.css` to `/assets/rbccm/css/components/rbccm-hero.css`
2. Update every consumer page's XSL to import the shared CSS **before** their own component CSS
3. Bump `AssetVersion` on each consumer page after their markup + CSS have been migrated
