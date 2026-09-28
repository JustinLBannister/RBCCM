# RBCCM Video Poster

Rounded poster image with a centred play button that opens a Brightcove video in a modal. Extracted from the MAAS+MATA page (the "Execution Console" image under the hero).

## Files

| File | What it is |
|---|---|
| `rbccm-video-poster.xsl` | TeamSite skin |
| `rbccm-video-poster-properties.xml` | Fields |
| `rbccm-video-poster.css` | Ships to `/assets/rbccm/css/components/rbccm-video-poster.css` |
| `rbccm-video-poster.js` | Ships to `/assets/rbccm/js/components/rbccm-video-poster.js` |
| `local-test.html` | Local preview (with video, and image only) |

## Fields

- **Appearance:** CssPath, JsPath, CacheVersion, SectionID (also names the modal: `SectionID-modal`, so keep it unique per page), SpaceAbove (desktop px, default 75), OverlapBelow (px the next section slides up under the image, default 200, 0 = none), BrightcoveAccount and BrightcovePlayer (RBC-wide constants).
- **Content:** PosterImage, PosterAlt, BrightcoveVideoId (blank = image only, no play button or modal), PlayButtonLabel, VideoTitle.

## Behaviour

- Box is 1140 x 366 on desktop (radius 30), full width minus 23px gutters below 992 (radius 20). The image is fixed at 1100 x 366 and centred, so narrow screens show its middle.
- The modal uses the site's Bootstrap modal markup (BS3 and BS5 attributes both present). The iframe loads only when the modal opens (with autoplay + muted) and is cleared on close so the video stops. Focus moves to Close on open and back to the play button on close. Without Bootstrap, the JS opens and closes the modal itself (Esc and backdrop click work).
- The modal dialog is `width: 100%` (max 960). With `width: auto` the 16:9 box has nothing to size against and the modal opens at zero width.

## On MAAS+MATA

`maas-mata.xsl` outputs this component's markup directly from its Chart Datums (like the awards and CTA band), keeps the modal id `herovideo`, and loads this CSS and JS. The old chart-image CSS in `maas-mata.css` and the video script in `maas-mata.js` were removed.
