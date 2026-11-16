# RBCCM Hero

Shared page hero. One CSS file, one BEM block (`.rbccm-hero`), five variants, each with its own TeamSite skin. All five skins share one Properties file.

## Files

| File | What it is |
|---|---|
| `rbccm-hero--maas-mata.xsl` | Skin: MAAS+MATA (centred eyebrow, 2-line title, subtitle, 2 buttons, glow halo) |
| `rbccm-hero--strategy-and-economics.xsl` | Skin: S+E (split layout, title + body left, "Latest insight" card right, optional bg video) |
| `rbccm-hero--us-credentials.xsl` | Skin: US Credentials (centred 2-line title + subtitle on navy, optional bg video, no buttons) |
| `rbccm-hero--etf-innovators.xsl` | Skin: ETF Innovators (left-aligned title + paragraph + yellow button over a background photo, name tag on the photo) |
| `rbccm-hero--outlook-2027.xsl` | Skin: Outlook 2027 (left-aligned 2-line title + paragraph + yellow button over a background video, pause / play button, rolling year digit) |
| `rbccm-hero-properties.xml` | Fields for all the skins. Each field's label says which variants use it. |
| `rbccm-hero-sample-dcr.xml` | Sample data for running a skin locally with any XSLT 1.0 tool. Not shipped. |
| `rbccm-hero.css` | Base block + all variant modifiers. Ships to `/assets/rbccm/css/components/rbccm-hero.css`. |
| `rbccm-hero.js` | S+E insight card hydrator (auto-latest / pinned URL). |
| `rbccm-hero.html` | Local preview of all the variants (uses the shared variant picker). |
| `photos/` | FPO art for the ETF preview, cut from the page comp. Not deployed. |
| `_retired/rbccm-hero.xsl` | Old combined Preset-driven skin. Not used; had no US Credentials branch. |

The variant is picked by the skin, not a field. There is no Preset field.

## Fields (53)

| Group | Fields | Used by |
|---|---|---|
| Setup | CacheVersion, SectionID, SectionAriaLabel, CssPath, ButtonCssPath, JsPath, HeaderAlignment | all (JsPath: S+E; ButtonCssPath optional, leave blank: rbccm-hero.css styles the MAAS+MATA and ETF buttons itself) |
| Hero content | EyebrowText/Tag, TitleLine1Text, TitleLine2Text, TitleTag, SubtitleText/Tag | all. S+E and ETF use line 1 + subtitle only (no eyebrow, no line 2). Outlook uses lines 1 and 2 + subtitle (no eyebrow). |
| Background video | BgVideoMp4, BgBrightcoveVideoId, BgBrightcoveAccount, BgBrightcovePlayer, BgBrightcoveLayerCssPath | S+E, US Credentials, Outlook |
| MAAS+MATA buttons | MmCta1/2 Label, Href, AriaLabel, Title, Style, Icon (arrow / play / none) | MAAS+MATA. ETF uses button 1 (always yellow, Style is ignored); set its Href to `#latest-episode` and the episodes list points it at the newest episode (see filtered-content README). |
| ETF | EtfBgImageDesktop / EtfBgImageMobile, EtfNameTagName / EtfNameTagTitle | ETF Innovators |
| Outlook | OlYearRoll | Outlook 2027. Button 1 as on ETF (always yellow). |
| Strategy and Economics | SeBodyMaxWidth, SeInsight* card fields + sourcing (DCR picker / auto-latest / manual), SeInsightTitleLimit / SeInsightBodyLimit | S+E |

In TeamSite, settings (paths, IDs, alignment, tag pickers, button style/icon, Brightcove IDs, feed URLs) sit on the Appearance tab (`<Properties>`); copy, links, media and the S+E insight card sit on the Content tab (`<Data>`).

Insight card length limits: `SeInsightTitleLimit` and `SeInsightBodyLimit` take `default` (title 70, body 170 characters), `full` (no limit) or `custom=N`. Text over the limit is cut at the last whole word with an ellipsis, both server-side (manual / DCR picker) and in `rbccm-hero.js` (feed content). A body within its limit keeps its HTML; a body over it is shown as plain text.

Tag pickers default to **Auto**, which uses each variant's SEO default (MAAS+MATA and US Creds: eyebrow h1, title p; S+E: title h1). The S+E insight card title is always h2, with no picker.

## Outlook 2027

- **Title:** line 1 and line 2 on two lines (e.g. `2027` / `Outlook`). When line 1 is a four-digit year, its last digit is yellow and rolls up from the year before (the 6 rises out and fades as the 7 rises in) about a second after the page loads. `OlYearRoll` set to `no` keeps the yellow digit without the roll. Screen readers hear the plain year.
- **Background video:** an MP4 (`BgVideoMp4`) or Brightcove (`BgBrightcoveVideoId`; one ID, or mobile, tablet, desktop cuts separated by commas, as on S+E). Brightcove loads the in-page player with every control hidden by `rbccm-brightcove-bg-layer.css`.
- **Pause / play:** whenever there is a background video, a round button sits bottom right. It pauses and resumes the video, and its screen reader label says what it will do ("Pause background video" / "Play background video"). Visitors who have asked their device to reduce motion get the video paused from the start, and the year doesn't roll.
- **Sizes:** desktop is measured from the Outlook 2027 page PDF (1440 frame); mobile follows the ETF hero until there is a mobile spec.

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

1. Push `rbccm-hero.css` (and `rbccm-hero.js` for S+E) to `/assets/rbccm/.../components/`. Pages with a Brightcove background (S+E, Outlook) also need `rbccm-brightcove-bg-layer.css` there.
2. Upload the skins and `rbccm-hero-properties.xml` to TeamSite.
3. Bump CacheVersion on each hero after saving.
