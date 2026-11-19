# RBCCM Leading Experts

Three-card grid of expert profiles. Each card = eyebrow pill + duotone-blue headshot + name/role/CTA on a navy tile. Mounts under the "Areas of expertise" section on the Strategy & Economics page.

## For editors and BAs

### Purpose
A row of three expert cards under a section title and subtitle. Each card shows a photo, a category pill, the expert's name and role, and one link. Used on Strategy & Economics (in progress, not live yet).

Variants (one today):
- Strategy and Economics - Leading experts: light-blue section with navy cards.

### What the editor can change
- The section header: "Section title", "Section subtitle" (HTML allowed) and "Header alignment" (Left or Center).
- Three experts ("Expert 1" to "Expert 3"). For each: the photo (picked from the DAM), an optional photo focal point, the eyebrow / category pill, the name, the role / title (HTML allowed), and the CTA copy and CTA URL.
- The photo's alt text, through the image's Description in the DAM picker.
- The HTML tag used for the section title, the section subtitle and each expert's eyebrow, name and role (h1 to h6, p, div or span).
- "Preset - component variant": only one option exists today.
- "Last updated": bump it each time content is saved (format YYYY-MM-DD-HHMM). The Section ID, Section ARIA label and the CSS and JS paths are technical fields set once at deploy (the JS path stays blank; the component has no script).

### What it does not do
- It does not pull experts from author records or a feed. Names, roles, photos and links are typed or picked by hand.
- It shows three experts at most. There are no fields for a fourth.
- It has no carousel at any width.
- The whole card is not a link. Only the CTA text at the bottom is.
- The CTA has no "open in new tab" option.
- There is no biography, pop-up or contact detail on the card.

### Limits
- Experts: 3 at most; built for exactly 3. The skin does not enforce a minimum, but the field notes say to keep all three filled.
- Variants: 1.
- Layout by screen width:
  - Under 768px: cards stack in one column.
  - 768 to 991px: two columns.
  - 992px and up: three columns.
- Card height is fixed at 436px. The photo sits in about the top 80% of the card, cropped to fit, under a navy gradient. It spans the full card width from 992px up; below that it is capped at 351px wide and centred.
- Photo focal point: defaults to 50% 20%; the optional field takes a CSS object-position value such as "50% 15%".
- Text length: No enforced character limit. Because the card height is fixed, long names, roles or CTA copy have limited room.

### Empty and edge cases
- An expert with a blank name is left out completely. With two cards at 992px and up, the third column stays empty.
- Blank eyebrow: the pill is hidden. Blank role: hidden. Blank CTA copy: the link is hidden.
- CTA copy filled but CTA URL blank: the link is printed and points to "#".
- Blank photo: no image is printed and the card shows its grey and navy background.
- Blank "Section title" and "Section subtitle": the header block is left out.
- If "Preset" is blank or not recognised, the section does not render.
- Hidden Figma data pasted in with copy is removed from the output.
- Scripts off: no change. The component has no script of its own (the scroll-in animation hooks are run by the separate rbccm-animate script).

### Accessibility
- Headings: the section title is an h2 and each expert's name an h3 by default. The editor can change both with the tag pickers; an invalid value falls back to the default.
- The section is labelled by its visible title. If the title is blank, the "Section ARIA label" field is used instead.
- Photo alt text comes from the image's Description in the DAM. If the Description is blank the alt is empty and the photo is treated as decorative; the name next to it identifies the person.
- The CTA is a normal link whose name is its visible text. The arrow icon is hidden from screen readers.
- Keyboard: the CTA link is the only focusable item in a card and has a visible focus style. The photo zoom on hover also runs when the link has keyboard focus.
- Reduced motion: the photo zoom, the link underline fade and the arrow animation are turned off.

### Open questions
- Should the photo alt be empty when the DAM Description is blank? The comments at the top of the properties file and the skin say it falls back to the expert's name, but the skin prints an empty alt.
- Expert 2's CTA URL is "#" in the default content. What is the final destination?
- Photos: the "Photos" section below says the placeholders are missing .jpg files, while the default content points to .webp files under /assets/rbccm/images/insights/strategy-economics/leading-experts/. Are the final photos in place in the DAM?
- What image size or ratio should editors upload? The files only give the card height (436px) and the crop behaviour.
- The "Layout" table below says cards stack under 992px; the stylesheet shows two columns from 768 to 991px. Which is the approved tablet layout?

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-leading-experts.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-leading-experts.css`.

## Status

**Ready for TeamSite deploy.** CSS + markup + XSL + Properties/Datums all built and verified (35 Datums, all unique + all referenced; XSL parses; CSS brace-balanced).

## Files

- `rbccm-leading-experts.css` -- shared partial + variant modifier. Deploys to `/assets/rbccm/css/components/rbccm-leading-experts.css`.
- `rbccm-leading-experts.html` -- local preview with 3 hardcoded experts (FPO photo). Not deployed.
- `rbccm-leading-experts.xsl` -- Preset-driven TeamSite skin. `$VARIANT_CLASS` map + shared render + pickTag guard + per-slot dispatcher.
- `rbccm-leading-experts-properties.xml` -- Datums: Section identity + Preset + section title Text/Tag + 3 fixed Expert slots (Photo Type="Image", Eyebrow/Name/Role Text+Tag pairs, CtaText, CtaHref).

## Deploy checklist

1. Push `rbccm-leading-experts.css` -> `/assets/rbccm/css/components/rbccm-leading-experts.css`
2. Publish the TeamSite skin (`rbccm-leading-experts.xsl` + `rbccm-leading-experts-properties.xml`)
3. Bump `CacheVersion` Datum after every sidecar CSS deploy

## Layout

| Viewport | Behavior |
|---|---|
| <992px | Cards stack full-width, 24px gap |
| >=992px | 3-column CSS Grid, cards side-by-side |

No carousel at any breakpoint (per S&E brief).

## Palette

Card is dark navy `#003168`. Duotone photo blends via `mix-blend-mode: luminosity` on a `#003168 -> #12457E` gradient underlay. Eyebrow pill is RBC Royal Yellow `#FEDF01` with navy text. CTA text + arrow also gold.

Section bg swaps per variant via `--rbccm-leading-experts-bg-color`. Current variant `.rbccm-leading-experts--strategy-and-economics-leading-experts` sets it to the S&E light-blue `#E7EEF1`.

## Photos

Placeholders currently point to `photos/{slug}.jpg` (missing -- shown as the underlying navy gradient). Swap for DAM URLs when authors wire up the picker Datum.

## Consumers

| Page | Modifier class |
|---|---|
| Strategy & Economics - Leading experts | `.rbccm-leading-experts--strategy-and-economics-leading-experts` |
