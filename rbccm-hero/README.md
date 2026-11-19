# RBCCM Hero

Shared page hero. One CSS file, one BEM block (`.rbccm-hero`), five variants, each with its own TeamSite skin. All five skins share one Properties file.

## For editors and BAs

### Purpose
The banner at the top of a page: the page title, a short line of intro copy and, depending on the variant, buttons, breadcrumbs, a background image or video, or a featured insight card. It is used on US Credentials and MAAS+MATA (both live) and on Strategy & Economics, ETF Innovators and 2027 Outlook (in progress, not live yet).

The variant is chosen by picking the skin in TeamSite, not by a field:
- MAAS+MATA: centred eyebrow, two-line title (second line in blue), subtitle, up to two buttons.
- Strategy & Economics (S+E): title and body on the left, a "Latest insight" card on the right, optional background video, breadcrumbs.
- US Credentials: eyebrow, two-line title (second line in yellow), subtitle, background images or a background video, breadcrumbs. No buttons.
- ETF Innovators: left-aligned one-line title, paragraph, one yellow button, a background photo with a name tag, breadcrumbs.
- 2027 Outlook: left-aligned two-line title with a yellow year digit that rolls in, paragraph, one yellow button, a background video with a pause / play button, breadcrumbs.

### What the editor can change
- On every variant: Title line 1, Subtitle / body copy (bold, italics and line breaks are allowed there) and the "Last updated" stamp, which is bumped on each save.
- Eyebrow (MAAS+MATA and US Credentials) and Title line 2 (MAAS+MATA, US Credentials, 2027 Outlook).
- Breadcrumbs (US Credentials, S+E, ETF Innovators, 2027 Outlook): type the list items; blank hides them.
- The heading tags: Eyebrow tag, Title tag and Subtitle tag (Auto, h1 to h6, p, div or span).
- Header alignment (Left or Center). It only moves the S+E title and body; MAAS+MATA is centred either way and the other variants do not change.
- Buttons:
  - MAAS+MATA: two buttons, each with a label, URL, style (Primary, Secondary, Yellow or Ghost), icon (Arrow, Play or None), an optional screen-reader name and an optional tooltip.
  - ETF Innovators and 2027 Outlook: button 1 only (label, URL, icon, screen-reader name, tooltip). It is always yellow.
  - The button 1 URL label lists two special values: `#request-demo` (opens the demo form modal) and `#latest-episode` (goes to the newest ETF Innovators episode).
- Background:
  - S+E, US Credentials and 2027 Outlook: a Background MP4 URL or a Brightcove video ID. On S+E and 2027 Outlook the Brightcove field also takes two or three IDs separated by commas, one cut per screen size (mobile, tablet, desktop).
  - US Credentials: four background image paths (Global Investment Banking desktop and mobile, Global Markets desktop and mobile) and the URL parameter that shows the Global Markets set (default `hero=global-markets`).
  - ETF Innovators: a desktop and a mobile background image, plus the name tag (name and job title) shown over the photo.
- 2027 Outlook: the year roll can be turned off by typing `no` in the Outlook year roll field (`OlYearRoll`).
- S+E insight card: where the card comes from (DCR picker, Auto latest from the feed, or Manual), the pill label, title, body, date, link label, link URL and link screen-reader name, and the length limits for the title and body. For the Auto source there are also the feed URLs, tag keywords, a pinned article URL and a link override. The S+E body width at desktop can be set too.
- Technical fields exist (Section ID, Section ARIA label, CSS and JS paths, Brightcove account and player IDs, Brightcove stylesheet path). They are set at deploy.

### What it does not do
- It does not have a variant field. One hero shows one variant, decided by the skin.
- It is not a carousel. There is one title and one set of copy.
- It does not pull content by itself, with one exception: the S+E insight card can show a picked article or the newest matching article from the insights feed.
- MAAS+MATA has no background image or video and no breadcrumbs. S+E and US Credentials have no hero buttons. ETF Innovators has no eyebrow, no second title line and no background video. 2027 Outlook has no eyebrow and no background image.
- ETF Innovators and 2027 Outlook show one button only. Button 2 and the button style field are ignored there.
- Only 2027 Outlook has a pause / play button for the background video. The S+E and US Credentials background videos cannot be paused by the visitor.
- The accent colours (blue or yellow second line, yellow year digit, yellow button) cannot be changed by the editor.
- Eyebrow, title lines, button labels and the name tag are plain text. HTML typed there is not applied. Only the subtitle / body copy, the breadcrumbs and the S+E insight card body take HTML.
- The US Credentials background set is switched only by the URL parameter. There is no field to pick the set per visitor or per date.
- The S+E locale field (English or French) is passed to the script but does not change anything yet.

### Limits
- Five variants, one skin each.
- Buttons: none to two on MAAS+MATA; none or one on ETF Innovators and 2027 Outlook; none on S+E and US Credentials.
- Title: two lines on MAAS+MATA, US Credentials and 2027 Outlook; one line on S+E and ETF Innovators.
- Text length: No enforced character limit on the hero copy. The S+E insight card is the exception: by default the title is cut at 70 characters and the body at 170 (the "..." counts toward the limit), cut at the last whole word. Each limit can be set to `default`, `full` (no limit) or `custom=N`.
- 2027 Outlook: the yellow digit only appears when Title line 1 is exactly a four-digit year (for example 2027).
- Background images (US Credentials, ETF Innovators): the desktop image is used from 992px wide, the mobile image below that. No image size or ratio is enforced. The stylesheet notes say the US Credentials mobile layout is built around portrait art of 750 x 1068.
- Brightcove background: one ID on US Credentials; one, two or three IDs on S+E and 2027 Outlook (two = mobile and desktop; three = mobile under 768px, tablet 768 to 991px, desktop 992px and up).

### Empty and edge cases
- Blank eyebrow, subtitle, second title line, breadcrumbs, name tag or button label: that piece is hidden. A blank name tag name hides the whole tag, including the job title.
- A button with a label but no URL still shows, with an empty link.
- Both title lines blank: no title is printed.
- MAAS+MATA and US Credentials colour the last title line. If only one line is filled, that line takes the accent colour.
- Background order: an MP4 wins over a Brightcove ID. On US Credentials any background image wins over both. With nothing set the hero is a plain colour (and on 2027 Outlook there is no pause button).
- US Credentials images: a blank image uses the other size of the same set; a blank Global Markets set uses the Global Investment Banking set. The Global Markets set only shows when the page URL carries the parameter. With scripts off the Global Investment Banking set always shows.
- ETF Innovators images: a blank image uses the other one; both blank shows navy only.
- 2027 Outlook: if Title line 1 is not a four-digit year it prints as normal text with no yellow digit. `no` in the year roll field keeps the yellow digit but stops the roll.
- S+E insight card:
  - DCR picker: the card is filled from the picked article. Any card field that is not blank (title, body, date) replaces the article's value. The link uses the card CTA URL field if set, otherwise the article's own link.
  - Auto: the typed card fields show first and are replaced once the feed loads. They stay if the feed fails, nothing matches, or scripts are off. A pinned article URL takes the place of the keyword search.
  - Manual: always the typed fields.
  - A body over its limit is shown as plain text, so bold, italics and links are dropped. A blank pill label, date or link label hides that piece.
- Scripts off: the title, copy, buttons and images still show. Brightcove backgrounds on S+E and 2027 Outlook do not load, and the 2027 Outlook pause / play button does nothing. The entrance of the copy (a slide, or on 2027 Outlook a fade) is CSS only and still runs.
- Pages saved before the 2026-09 field cleanup still show their old content (see "Legacy field IDs" below).

### Accessibility
- Heading levels with the tag fields on Auto: MAAS+MATA eyebrow h1, title p; US Credentials eyebrow h1 and title p, or title h1 when there is no eyebrow; S+E, ETF Innovators and 2027 Outlook title h1. The subtitle is a paragraph. The editor can change all three with the tag fields.
- On MAAS+MATA, Auto keeps the title as a paragraph even when the eyebrow is blank, so the hero then has no h1 unless the Title tag is set by hand.
- The S+E insight card title is always an h2 and cannot be changed.
- The section is named for screen readers by the Section ARIA label (default "Page hero"). Breadcrumbs sit in a navigation region named "Breadcrumb".
- Buttons are links. Screen readers read the visible label unless the button's accessible name field is filled. Button icons are hidden from screen readers.
- The S+E insight card link always gets a screen-reader name: the link accessible name field if filled, otherwise the link label followed by the article title.
- Background images and videos are decorative: hidden from screen readers, with no alt text field. Brightcove backgrounds on S+E and 2027 Outlook are kept out of the Tab order.
- 2027 Outlook: screen readers hear the plain year, and the heading's text in the page source is the plain title ("2027 Outlook"); the rolling digits are drawn by the stylesheet and add nothing to it. The ring round the pause / play button shows how far through the background video is: it fills as the video plays and holds where it is while paused. The ring is decoration and is not read out. The pause / play button is a real button, its name switches between "Pause background video" and "Play background video", and it has a visible focus outline.
- Buttons, the insight card link and breadcrumb links have visible keyboard focus styles.
- Reduced motion: the entrance slide and the button hover animations are turned off. On 2027 Outlook nothing fades in, the background video starts paused and the year does not roll. The S+E and US Credentials background videos keep playing.

### Open questions
- `#request-demo` and `#latest-episode`: the hero only prints the link. The parts that open the demo form and find the newest episode are not in this folder.
- Recommended sizes and file weights for the background images are not stated, apart from the 750 x 1068 note for the US Credentials mobile art.
- S+E and US Credentials background videos have no pause control and do not react to the reduced-motion setting. Confirm whether that is accepted.
- There is no stated guidance on title or subtitle length for any variant.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-hero.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-hero.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-hero.css` and `/assets/rbccm/js/components/rbccm-hero.js`.

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

- **Title:** line 1 and line 2 on two lines (e.g. `2027` / `Outlook`). When line 1 is a four-digit year, its last digit is yellow and rolls up from the year before (the 6 rises out and fades as the 7 rises in) about two seconds after the page loads. `OlYearRoll` set to `no` keeps the yellow digit without the roll. Screen readers hear the plain year.
- **Background video:** an MP4 (`BgVideoMp4`) or Brightcove (`BgBrightcoveVideoId`; one ID, or mobile, tablet, desktop cuts separated by commas, as on S+E). Brightcove loads the in-page player with every control hidden by `rbccm-brightcove-bg-layer.css`.
- **Pause / play:** whenever there is a background video, a round button sits bottom right. It pauses and resumes the video, and its screen reader label says what it will do ("Pause background video" / "Play background video"). Visitors who have asked their device to reduce motion get the video paused from the start, and the year doesn't roll.
- **Entrance:** follows the design team's concept video. The breadcrumbs fade in, the two title lines are revealed left to right, then the paragraph, the button and the pause / play button fade in, in that order, over about 1.8 seconds. The year rolls at 2 seconds. The background video fades up from plain navy once it starts playing (or after 3 seconds if it never starts).
- **Video framing:** the lines in the footage always begin a set distance to the right of the copy, run off the top of the hero and land their wave about 60% of the way down (about 72% on mobile and tablet). The values are at the top of the Outlook video rules in `rbccm-hero.css`.
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
