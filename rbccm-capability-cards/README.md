# RBCCM Capability Cards

A section header (eyebrow, heading, description) followed by a set of capability cards. Each card has an icon, a title, an optional italic subtitle and body copy. Three TeamSite skins share one Properties file; the skin decides the layout and whether cards can link.

## For editors and BAs

### Purpose
Introduces a set of capabilities or services, one card each. It is used on US Credentials and MAAS+MATA (both live).

The layout is chosen by picking the skin in TeamSite, not by a field:
- US Credentials (`rbccm-capability-cards--us-credentials.xsl`): up to six cards in a row on navy. Cards that do not fit run off the right edge and are reached with arrows and dots. Cards can link.
- Three-up (`rbccm-capability-cards--three-up.xsl`): same fields and links, but paged: three cards per view on desktop, two on tablet, stacked on mobile.
- MAAS+MATA (`rbccm-capability-cards--maas-mata.xsl`): cards 1 to 3 in a row and card 4 as a full-width card underneath. Cards never link.

### What the editor can change
- The section header: Section eyebrow, Section heading and Section description (all optional), and the Section heading tag (default h2).
- Each card (Card 1 to Card 6): the icon (type its name), title, subtitle and body copy.
- On the US Credentials and three-up skins, each card's link URL (makes the whole card a link) and CTA label (for example "Learn more").
- Icon names, not case-sensitive: `investment-banking`, `corporate-banking`, `markets`, `research`, `rbc-clear`, `info`, `equities`, `fx`, `futures`, `index-events`, `rates`, `etf`.
- The background colour (Background colour override) and the content width (Content max width; default 1140 on US Credentials, 1100 on three-up).
- The Section ID for anchor links and the Section aria-label (defaults to the heading text).
- Technical fields exist (CSS path, JS path, Cache version). They are set at deploy.

### What it does not do
- It does not pull content from anywhere. Every card is typed, and the order on the page is Card 1 to Card 6.
- It does not take an uploaded icon or a photo. Icons come from the fixed list above.
- It shows six cards at most. The MAAS+MATA skin shows four at most and ignores cards 5 and 6.
- On the MAAS+MATA skin cards never link; the CTA label and link URL are ignored. The `rbc-clear` icon is not available on that skin.
- A CTA label without a link URL does not show. The card is then a plain card.
- The carousel does not move by itself. It only moves when the visitor uses the arrows, the dots or a swipe.
- There is no per-card colour choice.
- Eyebrow, heading, card title, subtitle and CTA label are plain text. Only the section description and the card body take HTML such as bold or line breaks.

### Limits
- Three skins.
- US Credentials skin: one to six cards, each 276px wide. Four cards fill the 1140px content width exactly, so four or fewer show as a static row with no arrows or dots when the screen is wide enough; five or six always page. The carousel loops.
- Three-up skin: one to six cards. From 992px wide, three per view and paged three at a time; 768 to 991px, two per view; below 768px, no carousel and every card stacked full width. It does not loop: the arrows switch off at the first and last page. With five cards on desktop there are two pages (cards 1 to 3, then 3 to 5).
- MAAS+MATA skin: up to four cards. Cards 1 to 3 stack below 768px, sit in two columns from 768 to 1024px and in one row above that. Card 4 is always full width underneath.
- No enforced character limit. Cards in a row match the tallest card.

### Empty and edge cases
- A card with a blank title is hidden and the remaining cards close up.
- Blank eyebrow, heading, description or subtitle: that piece is hidden. If all three header fields are blank the whole header is hidden.
- A blank or unknown icon name shows the default icon (`investment-banking`; `index-events` on the MAAS+MATA full-width card).
- A link URL without a CTA label: the card still links but shows no "Learn more" chip.
- A blank body on a row card still prints an empty paragraph; the MAAS+MATA full-width card hides a blank body.
- US Credentials skin with one card: static, no arrows or dots.
- Three-up skin: when all cards fit one page (three or fewer on desktop, two or fewer on tablet) there are no arrows or dots.
- Scripts off:
  - US Credentials skin: the cards sit in one row that does not page, so cards past the right edge cannot be reached and the arrows do nothing.
  - Three-up skin: from 768px wide all cards share one row; below that they stack.
  - MAAS+MATA skin: no change. It does not use the script.

### Accessibility
- The section heading level is set by the Section heading tag field (default h2). Card titles are always h3.
- The section is named for screen readers by the Section aria-label field, or by the heading text when that field is blank.
- A linked card is one link. Screen readers read its title, body and CTA label as the link name. It has a visible focus outline.
- Icons are decorative and hidden from screen readers.
- Carousel: the arrows are buttons named "Previous capability" and "Next capability". Dots are named "Go to slide N" (US Credentials) or "Go to page N" (three-up) and the current one is marked. Each card is announced as "N of M". Cards that are off screen are hidden from screen readers and skipped by the Tab key.
- Reduced motion: slides change instantly and the fade-in on scroll is turned off.

### Open questions
- Which skin or skins the live MAAS+MATA page uses. The page list names the component, not the skin.
- There is no stated guidance on title or body length.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-capability-cards.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-capability-cards.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-capability-cards.css` and `/assets/rbccm/js/components/rbccm-capability-cards.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-capability-cards--us-credentials.xsl` | Skin: US Credentials (carousel of up to six cards, cards can link). |
| `rbccm-capability-cards--three-up.xsl` | Skin: three-up (paged three per view on desktop, two on tablet, stacked on mobile). |
| `rbccm-capability-cards--maas-mata.xsl` | Skin: MAAS+MATA (three cards in a row plus a full-width card, no links). |
| `rbccm-capability-cards-properties.xml` | Fields shared by the three skins. |
| `rbccm-capability-cards.css` | Styles for all skins. Ships to `/assets/rbccm/css/components/rbccm-capability-cards.css`. |
| `rbccm-capability-cards.js` | Carousel for the US Credentials and three-up skins. Ships to `/assets/rbccm/js/components/rbccm-capability-cards.js`. |
| `local-test.html` | Local preview. Not deployed. |
