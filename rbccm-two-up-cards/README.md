# RBCCM Two-Up Cards

A section header (eyebrow, heading, description) with one or two cards beside each other. Three TeamSite skins share one Properties file: one for feature lists and two for video. The skin decides what a card shows.

## For editors and BAs

### Purpose
Puts two related items side by side, either two feature lists or two videos, or presents a single video next to a heading. The component is in the page bundles for US Credentials and MAAS+MATA (both live).

The variant is chosen by picking the skin in TeamSite, not by a field:
- Features (`rbccm-two-up-cards--features.xsl`): dark section. Each card has an eyebrow, title, body and up to eight bullets, in a dark or light theme.
- Video callouts (`rbccm-two-up-cards--video-callouts.xsl`): light section. Each card has an image with a play icon, title, optional subtitle, body and a CTA label. The card opens the video in a pop-up.
- Video single (`rbccm-two-up-cards--video-single.xsl`): one video. The section heading, description and a text link sit on the left; the video thumbnail sits on the right.

### What the editor can change
- On every skin: Section eyebrow, Section heading and Section description (all optional), the Section heading tag (default h2), the Section background colour, the Section ID and the Section aria-label.
- Features skin, for Card 1 and Card 2: eyebrow, title, body copy, bullets 1 to 8 and the theme (type `dark` or `light`).
- Video callouts skin, for Card 1 and Card 2: media image path, media image alt, video URL, title, subtitle, body copy, CTA label and CTA href (used when there is no video URL).
- Video single skin, Card 1 only: media image path, media image alt, video URL, CTA href, the CTA label (used as the text link under the description; default "Watch the video") and the title (not shown; it names the video for screen readers).
- The video URL can be a YouTube, Vimeo or Brightcove player address, or a direct video file such as .mp4.
- Technical fields exist (CSS path, JS path, Cache version). They are set at deploy.

### What it does not do
- It shows two cards at most. There is no carousel and no third card.
- It does not pull content from anywhere. Everything is typed.
- Features cards are not links and have no image or icon. Bullets are plain text.
- Video cards have no separate buttons. The whole card is one link, so links typed into the body copy are removed (the words are kept).
- It does not host the video. It plays the address it is given in a pop-up player.
- It does not add captions or a transcript.
- The video single skin ignores Card 2, and does not show Card 1's title, subtitle or body copy.
- The dark / light theme applies to the features skin only. There is no other per-card colour choice.
- Fields for another skin are ignored. Each field's label says which skin uses it.

### Limits
- Three skins.
- Features and video callouts: up to two cards. Side by side from 872px wide, stacked below. A single card takes one column, half the row, on wide screens.
- Video single: one video. Heading and video sit in two columns from 872px wide, stacked below.
- Bullets: up to eight per card. The stylesheet notes describe the design as a list of three to six.
- Images: on video callouts the image fills a strip 243px tall and is cropped to fit; on video single the thumbnail is shown at 16:9. No image size is enforced.
- No enforced character limit.

### Empty and edge cases
- Features and video callouts: a card with a blank title is hidden.
- Blank section eyebrow, heading or description, card eyebrow, subtitle, body, bullet or CTA label: that piece is hidden. With all eight bullets blank the list is not printed.
- Theme: `light` gives the light card; anything else, including blank, gives the dark card.
- Video callouts, per card:
  - Video URL set: the card opens the video in the pop-up.
  - No video URL but a CTA href: the card is a normal link to that address, with no play icon.
  - Neither: the card is not a link.
  - No image: the image area and the play icon are not printed.
- Video single:
  - No image: the thumbnail is hidden.
  - The text link goes to the video URL, or to the CTA href when there is no video URL. It is a normal link; only the thumbnail opens the pop-up.
  - Placeholder: while Card 1 has neither a video URL nor an image, the skin ignores the entered text and shows built-in placeholder content (heading "Find conviction through complexity", an Institutional Investors image and link). The skin marks this as temporary.
- In the pop-up, direct video files start muted. Brightcove player addresses have autoplay and muted added unless the address already sets them.
- The pop-up closes with its close button, the Esc key or a click outside it. The video stops when it closes.
- Scripts off: a video card goes straight to the video address instead of opening the pop-up. The features skin has no script.

### Accessibility
- The section heading level is set by the Section heading tag field (default h2). Card titles are always h3.
- The section is named for screen readers by the Section aria-label field, or by the heading text when that field is blank.
- Video callouts: each card is a single Tab stop and screen readers read the whole card text as the link name. The image alt text comes from the media image alt field; blank gives an empty alt. The play icon and arrow are decorative.
- Video single: with a video URL the thumbnail link is named "Watch the video: " followed by the Card 1 title (or the image alt text if the title is blank). With only a CTA href it is named by the title (or alt text) alone.
- Pop-up: it is announced as a dialog named "Video", the close button is named "Close Modal", keyboard focus stays inside it while it is open, and focus returns to the card when it closes.
- Linked cards and the text link have visible keyboard focus styles.
- Reduced motion: the fade-in on scroll, the image zoom and the hover animations are turned off.

### Open questions
- Which skin each live page uses. The page list names the component, not the skin. (The MAAS+MATA bundle loads the stylesheet only, with no script.)
- When the video single placeholder content will be removed.
- Recommended image dimensions are not stated.
- Whether the video single text link should open the pop-up like the thumbnail does. Today it is a plain link.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-two-up-cards.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-two-up-cards.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-two-up-cards.css` and `/assets/rbccm/js/components/rbccm-two-up-cards.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-two-up-cards--features.xsl` | Skin: features (two feature-list cards, dark section). |
| `rbccm-two-up-cards--video-callouts.xsl` | Skin: video callouts (two video cards, light section). |
| `rbccm-two-up-cards--video-single.xsl` | Skin: video single (heading on the left, one video thumbnail on the right). |
| `rbccm-two-up-cards-properties.xml` | Fields shared by the three skins. |
| `rbccm-two-up-cards.css` | Styles for all skins. Ships to `/assets/rbccm/css/components/rbccm-two-up-cards.css`. |
| `rbccm-two-up-cards.js` | Video pop-up for the two video skins. Ships to `/assets/rbccm/js/components/rbccm-two-up-cards.js`. |
| `local-test.html` | Local preview. Not deployed. |
