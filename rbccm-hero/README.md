# RBCCM Hero

Shared page hero. One CSS file, one BEM block (`.rbccm-hero`), three variants, each with its own TeamSite skin. All three skins share one Properties file.

## Files

| File | What it is |
|---|---|
| `rbccm-hero--maas-mata.xsl` | Skin: MAAS+MATA (centred eyebrow, 2-line title, subtitle, 2 buttons, glow halo) |
| `rbccm-hero--strategy-and-economics.xsl` | Skin: S+E (split layout, title + body left, "Latest insight" card right, optional bg video) |
| `rbccm-hero--us-credentials.xsl` | Skin: US Credentials (centred 2-line title + subtitle on navy, optional bg video, no buttons) |
| `rbccm-hero-properties.xml` | Fields for all three skins. Each field's label says which variants use it. |
| `rbccm-hero-sample-dcr.xml` | Sample data for running a skin locally with any XSLT 1.0 tool. Not shipped. |
| `rbccm-hero.css` | Base block + all variant modifiers. Ships to `/assets/rbccm/css/components/rbccm-hero.css`. |
| `rbccm-hero.js` | S+E insight card hydrator (auto-latest / pinned URL). |
| `rbccm-hero.html` | Local preview of all three variants (uses the shared variant picker). |
| `_retired/rbccm-hero.xsl` | Old combined Preset-driven skin. Not used; had no US Credentials branch. |

The variant is picked by the skin, not a field. There is no Preset field.

## Fields (46)

| Group | Fields | Used by |
|---|---|---|
| Setup | CacheVersion, SectionID, SectionAriaLabel, CssPath, ButtonCssPath, JsPath, HeaderAlignment | all (ButtonCssPath: MAAS+MATA, JsPath: S+E) |
| Hero content | EyebrowText/Tag, TitleLine1Text, TitleLine2Text, TitleTag, SubtitleText/Tag | all. S+E uses line 1 + subtitle only (no eyebrow, no line 2). |
| Background video | BgVideoMp4, BgBrightcoveVideoId, BgBrightcoveAccount, BgBrightcovePlayer | S+E, US Credentials |
| MAAS+MATA buttons | MmCta1/2 Label, Href, AriaLabel, Title, Style, Icon (arrow / play / none) | MAAS+MATA |
| Strategy and Economics | SeBodyMaxWidth, SeInsight* card fields + sourcing (DCR picker / auto-latest / manual) | S+E |

Tag pickers default to **Auto**, which uses each variant's SEO default (MAAS+MATA and US Creds: eyebrow h1, title p; S+E: title h1). The S+E insight card title is always h2, with no picker.

## Legacy field IDs (2026-09 cleanup)

The Properties file went from 68 to 46 fields by merging the per-variant copies (`Mm*`, `Uc*`, `Se*`) of eyebrow, title, subtitle and background video into shared fields, swapping the buttons' raw SVG path fields for an icon dropdown, and dropping the S+E insight card tag pickers (title fixed at h2).

Pages saved before the cleanup keep rendering: each skin reads the new field, and when it's blank (or a tag is on Auto) falls back to the old ID. The full old-to-new map is in the header comment of `rbccm-hero-properties.xml`.

Once every hero page has been re-saved with the new fields filled in, the fallbacks can be removed from the skins (search the skins for `legacy`).

## Adding a variant

1. Add a `.rbccm-hero--{slug}` modifier block to `rbccm-hero.css`.
2. Copy the closest skin to `rbccm-hero--{slug}.xsl` and change the hardcoded variant class.
3. Reuse the shared fields. Only add new fields for things the other variants don't have, prefixed for the variant.
4. Add the variant to `rbccm-hero.html` with a `data-variant` label.

## Deploy

1. Push `rbccm-hero.css` (and `rbccm-hero.js` for S+E) to `/assets/rbccm/.../components/`.
2. Upload the three skins and `rbccm-hero-properties.xml` to TeamSite.
3. Bump CacheVersion on each hero after saving.
