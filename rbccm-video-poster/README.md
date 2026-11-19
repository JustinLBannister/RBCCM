# RBCCM Video Poster

Rounded poster image with a centred play button that opens a Brightcove video in a modal. Extracted from the MAAS+MATA page (the "Execution Console" image under the hero).

## For editors and BAs

### Purpose
A poster image with a round play button in the middle. Pressing play opens a Brightcove video in a pop-up over the page. Used on MAAS+MATA (live) and ETF Innovators (in progress, not live yet).

Variants (skins):
- Default (`rbccm-video-poster.xsl`): a wide, short image strip with rounded corners that overlaps the section below it. This is the MAAS+MATA one.
- ETF Innovators (`rbccm-video-poster--etf-innovators.xsl`): a navy "Featured" section with an optional heading and description, a 16:9 poster and an optional pill in the top right corner of the poster.

### What the editor can change
- The poster image ("Poster image URL"), an optional WebP copy of the same image, and the image alt text.
- The video, by typing its "Brightcove video ID". Leave it blank to show the image only.
- The wording screen readers hear: "Play button label for screen readers" and "Video title for screen readers" (names the pop-up and the player).
- ETF Innovators skin only: the section heading, the section description (simple HTML allowed) and the pill text.
- Default skin only: the space above on desktop and how far the next section slides up under the image, both in px.
- Image loading: `priority` (poster near the top of the page) or `lazy` (poster further down).
- The ID (`SectionID`). It also names the pop-up, so each poster on a page needs its own.
- Technical fields exist and are set at deploy: CSS path, JS path, "Last updated" (cache version), and the Brightcove account and player IDs (RBC-wide constants).

### What it does not do
- It has no transcript field, no captions field and no visible video title or description. The only text about the video is the title for screen readers.
- It does not upload or host the video. The video must already be in Brightcove; only its ID is typed here.
- It does not play the video in place on the page. The video always opens in the pop-up, and nothing loads or plays until the visitor presses play.
- It plays one video per poster. There is no playlist, carousel or second video field. (Another link on the page can borrow the pop-up for a different video, but that is set up in that link's markup, not with a field here. See "Other videos in the same modal" below.)
- The default skin shows no heading, description or pill. Those three fields are ignored by it.
- The ETF Innovators skin ignores "Space above" and "Overlap into the next section".
- The play button has no visible text, only the icon.
- It does not resize or re-crop the image file. The editor supplies an image of the right shape.

### Limits
- One image and one video per instance. Two skins.
- Default skin image: shown at 1100 x 366. On narrow screens the box gets narrower and the middle of the image shows.
- ETF Innovators skin image: 16:9, for example 2200 x 1238. An image of another shape is cropped to fill the 16:9 box.
- The layout changes once, at 992px wide (corner radius, spacing, and in the ETF Innovators skin the type sizes, pill size and play button size).
- The pop-up video is 16:9 and at most 960px wide.
- Text length: No enforced character limit. The field labels give "Featured" as an example heading and "Season Promo" as an example pill.

### Empty and edge cases
- Brightcove video ID blank: no play button and no pop-up. The image shows by itself.
- Poster image URL blank: no image is output, but the rounded box keeps its space (white in the ETF Innovators skin).
- Alt text blank: the image is output with empty alt text, so screen readers skip it.
- Play button label blank: "Play video" is used. Video title blank: "Video" is used.
- ETF Innovators skin: heading, description and pill are each hidden when blank. With both heading and description blank the whole header row is left out.
- ID blank: `rbccm-video-poster-1` is used. Spaces typed in the ID become hyphens.
- Space above blank: 75. Overlap blank: 200. 0 means none. Only the digits are read, so "200px" works as 200.
- Image loading: anything other than `lazy` is treated as `priority`.
- Scripts off: the poster image shows, but the play button does not play the video (the script adds the video address when the pop-up opens).
- If the site's Bootstrap is not on the page, the component's script opens and closes the pop-up itself.
- If the browser blocks sound, the video starts muted. Otherwise it starts with sound.

### Accessibility
- Headings: the ETF Innovators skin outputs its section heading as an `h2`. The editor cannot change the level. The default skin outputs no heading.
- The ETF Innovators section is labelled by its heading when the heading is filled in.
- The play button is a real button. Its name comes from "Play button label for screen readers"; the icon is hidden from screen readers.
- Image alt text comes from "Poster image alt text".
- The pop-up is announced as a dialog named by "Video title for screen readers"; the player frame gets the same title. The close button is labelled "Close video" (fixed wording).
- Keyboard: on open, focus moves to the close button. Tab past the player loops back to the close button. Esc closes. On close, focus returns to the play button (or to the link that opened it).
- The play button shows a yellow outline on keyboard focus. In the ETF Innovators skin on phones the small play button has a 44px tap area.
- Reduced motion: the play button's hover scale and fade, and the default skin's slide-up entrance, are turned off.

### Open questions
- Captions and transcript: there is no field for either. Whether captions come from the Brightcove player, and where a transcript should live, is not answered by the files.
- The close button wording "Close video" is fixed in English in both skins. Confirm whether the component is needed on French pages.
- No file size or file format guidance for the poster image is stated beyond the dimensions above.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-video-poster.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-video-poster.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-video-poster.css` and `/assets/rbccm/js/components/rbccm-video-poster.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-video-poster.xsl` | TeamSite skin: default (the MAAS+MATA strip) |
| `rbccm-video-poster--etf-innovators.xsl` | TeamSite skin: ETF Innovators "Featured" section (navy section, heading + description, 16:9 poster, pill) |
| `rbccm-video-poster-properties.xml` | Fields |
| `rbccm-video-poster.css` | Ships to `/assets/rbccm/css/components/rbccm-video-poster.css` |
| `rbccm-video-poster.js` | Ships to `/assets/rbccm/js/components/rbccm-video-poster.js` |
| `local-test.html` | Local preview (with video, image only, ETF Innovators) |

## Fields

- **Appearance:** CssPath, JsPath, CacheVersion, SectionID (also names the modal: `SectionID-modal`, so keep it unique per page), SpaceAbove (desktop px, default 75), OverlapBelow (px the next section slides up under the image, default 200, 0 = none), BrightcoveAccount and BrightcovePlayer (RBC-wide constants).
- **Content:** PosterImage, PosterAlt, BrightcoveVideoId (blank = image only, no play button or modal), PlayButtonLabel, VideoTitle.
- **ETF Innovators skin only (Content):** SectionHeading, SectionDescription (HTML allowed), BadgeText (the pill). Blank hides each one. SpaceAbove and OverlapBelow are ignored by this skin.

## Behaviour

ETF Innovators skin: the section is navy (#092549) with 23px side gutters and 60px (desktop 80px) top and bottom padding. The poster is a 16:9 box at the content width (global 1140px max; 329 x 185 on a 375px phone), radius 7px (20px desktop), with the pill in the top right corner. The play button is 25px on phones (with a 44px tap area) and 56px on desktop. The rest of this section describes the default skin.

- Box is 1140 x 366 on desktop (radius 30), full width minus 23px gutters below 992 (radius 20). The image is fixed at 1100 x 366 and centred, so narrow screens show its middle.
- The modal uses the site's Bootstrap modal markup (BS3 and BS5 attributes both present). The iframe loads only when the modal opens and autoplays with sound (falling back to muted if the browser blocks sound) and is cleared on close so the video stops. Focus moves to Close on open and back to the play button on close. Without Bootstrap, the JS opens and closes the modal itself (Esc and backdrop click work).
- The modal dialog is `width: 100%` (max 960). With `width: auto` the 16:9 box has nothing to size against and the modal opens at zero width.
- **Other videos in the same modal.** Any link with `data-video-src` (a Brightcove player URL) plays that video in the page's video modal instead of the poster's own; `data-video-modal="<modal id>"` picks the modal (otherwise the first on the page) and `data-video-label` names the dialog and player for screen readers. Closing stops it and puts the poster's video back on its play button. Cmd/Ctrl/Shift-click follows the link's href as normal. On ETF Innovators the hero's "Watch the latest interview" button uses this: filtered-content sets the attributes from the newest episode.

## On MAAS+MATA

`maas-mata.xsl` outputs this component's markup directly from its Chart Datums (like the awards and CTA band), keeps the modal id `herovideo`, and loads this CSS and JS. The old chart-image CSS in `maas-mata.css` and the video script in `maas-mata.js` were removed.
