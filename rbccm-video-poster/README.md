# RBCCM Video Poster

Rounded poster image with a centred play button that opens a Brightcove video in a modal. Extracted from the MAAS+MATA page (the "Execution Console" image under the hero).

## Files

| File | What it is |
|---|---|
| `rbccm-video-poster.xsl` | TeamSite skin: default (the MAAS+MATA strip) |
| `rbccm-video-poster--etf-innovators.xsl` | TeamSite skin: ETF Innovators "Featured" section (navy section, heading + description, 16:9 poster, pill) |
| `rbccm-video-poster-properties.xml` | Fields |
| `rbccm-video-poster.css` | Ships to `/assets/rbccm/css/components/rbccm-video-poster.css` |
| `rbccm-video-poster.js` | Ships to `/assets/rbccm/js/components/rbccm-video-poster.js` |
| `local-test.html` | Local preview (with video, image only, ETF Innovators) |
| `upload-images/etf-innovators-video-poster.webp` | ETF Innovators poster (2200 x 1238) to upload to the DAM; the preview uses it too. |

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
