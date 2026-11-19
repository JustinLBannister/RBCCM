# RBCCM Awards

A row of award cards on a dark navy background, with an optional caption line above the cards. Each card shows a year, an award title and the issuer. On wide screens the cards sit in one row; on narrower screens the row becomes a carousel with arrows and dots.

## For editors and BAs

### Purpose
Shows a short list of awards as proof points. It is used on US Credentials and MAAS+MATA (both live). There is one skin; the layout (3-up or 4-up) follows the number of cards.

### What the editor can change
- The caption above the cards (Section eyebrow). Blank hides it.
- The award cards: add or remove cards, and for each one type the Year, Title and Issuer. Cards show in the order they are entered.
- The background colour (Background colour override). Blank uses the default navy: `#041e42` with up to three cards, `#051B38` with four.
- The screen-reader name of the section (Section aria-label, default "Awards") and the Section ID used for anchor links.
- Technical fields exist (CSS path, JS path, Last updated). They are set at deploy; Last updated is bumped on each save.

### What it does not do
- It does not pull awards from anywhere. Every card is typed.
- It shows four cards at most. A fifth card and any after it are not shown.
- It has no layout picker. The number of cards with a title decides the layout.
- Cards are not links and have no logo or image. Year, Title and Issuer are plain text.
- The carousel does not move by itself. It only moves when the visitor uses the arrows, the dots or a swipe.

### Limits
- Built for three or four cards. Maximum shown: four.
- Up to three cards with a title: 3-up layout, cards 264px wide, one static row from 870px wide and a carousel below that.
- Four or more cards with a title: 4-up layout, cards 250px wide, one static row from 1146px wide and a carousel below that.
- One skin, no variants.
- No enforced character limit.

### Empty and edge cases
- A card with a blank Title is skipped, even if Year or Issuer is filled.
- A blank Year or Issuer is hidden on that card.
- Two cards use the 3-up layout.
- One card: the carousel is not started. On small screens the arrows still show but do nothing.
- No cards with a title: the section still prints, empty.
- Where the carousel is active it loops, so Next on the last card goes back to the first.
- Scripts off: the cards print as one row that does not page, so on narrow screens part of the row is cut off and the arrows do nothing.

### Accessibility
- Each award title is an h3. This is fixed. The caption above the cards is not a heading.
- The section is named "Awards" for screen readers unless the Section aria-label field is filled.
- The arrows are buttons named "Previous award" and "Next award", with a visible focus outline. The dots sit in a group named "Award slides".
- On wide screens, where every card is visible, the script makes all cards readable by screen readers and removes the extra Tab stop the carousel would add.
- Reduced motion: slides change instantly and the fade-in on scroll is turned off.

### Open questions
- The stylesheet has styles for links inside a card (for example a footnote number in the Issuer line), but the skin prints Year, Title and Issuer as plain text. Confirm whether footnote links are needed.
- There is no stated guidance on title or issuer length.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-awards.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-awards.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-awards.css` and `/assets/rbccm/js/components/rbccm-awards.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-awards.xsl` | TeamSite skin. |
| `rbccm-awards-properties.xml` | Fields: section settings plus the repeatable Award Card group. |
| `rbccm-awards.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-awards.css`. |
| `rbccm-awards.js` | Carousel for narrower screens. Ships to `/assets/rbccm/js/components/rbccm-awards.js`. |
| `local-test.html` | Local preview. Not deployed. |
