# RBCCM Brightcove Background Layer

A stylesheet that turns a Brightcove video player into a silent, decorative background video: no controls, no play button, no title or captions, nothing clickable. It is used by the hero when its background video comes from Brightcove. It has no fields and no skin of its own.

---

## For editors and BAs

### Purpose

Makes a Brightcove video behave like a background image that moves. Two hero variants load it: Strategy & Economics and 2027 Outlook (both in progress, not live yet).

### What the editor can change

- Nothing in this folder. The video itself is chosen in the hero component (its Brightcove video ID fields), and the image shown before the video starts is the poster set on that video in Brightcove.

### What it does not do

- It does not play sound. The background video is muted.
- It does not show controls, captions or a title, and visitors cannot click or tap the video.
- It does not pause the video. Where a variant offers a pause / play button (2027 Outlook), that button belongs to the hero.
- It does not choose a different video per screen size. That is done by the hero, where the variant supports it.

### Limits

- The video is cropped to fill its box and is anchored to the top right, so the top right of the frame is always kept and the left and bottom edges are what get cut off on narrow or tall screens.
- How transparent the video looks over the hero background is set by the hero, not here.

### Empty and edge cases

- Device blocks autoplay (for example a phone in low power mode): the video's poster image from Brightcove shows instead, cropped the same way.
- Stylesheet missing: the Brightcove player would show its normal controls over the hero.

### Accessibility

- The video is decorative. The hero marks it as hidden from assistive technology and removes it from keyboard focus, so it is never announced or tabbed to.
- Because it has no captions or audio, it must not carry information a visitor needs.

### Open questions

- Whether visitors who have asked their device to reduce motion should see the poster image instead of a playing video. This stylesheet has no rule for it; any handling is in the hero variant.

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-brightcove-bg-layer.css` |

On the site this loads from `/assets/rbccm/css/components/rbccm-brightcove-bg-layer.css`.

There is no TeamSite component for this folder; it is a shared file other components use.

## Files

| File | What it is |
|---|---|
| `rbccm-brightcove-bg-layer.css` | The stylesheet. Ships to `/assets/rbccm/css/components/`. |
