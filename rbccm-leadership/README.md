# RBCCM Leadership

A leadership team section: a heading, an optional subheading and a row of people cards (photo, name, role). Each card can carry a LinkedIn link, a Biography button that opens a pop-up, or both. When there are more people than fit across the screen the row becomes a carousel with arrows and dots.

## For editors and BAs

### Purpose
Shows a team's leaders as a row of cards with a route to each person's LinkedIn profile or biography. Not on a page in the build config yet.

There is one skin. The look is set by fields: three colour schemes (light, lightblue, dark) and three card actions (linkedin, biography, both).

### What the editor can change
- "Section Heading" and "Section Subheading (optional)".
- "Card Action": linkedin, biography or both. This decides whether cards show the LinkedIn icon link, the Biography button, or the two together.
- In the biography pop-up: "Show email link in bio modal" and "Show contact info as icons in bio modal" (icons, or text links when off).
- The look: "Color Scheme" (light, lightblue or dark), "Heading Alignment" (left or center) and an optional background image (URL, position, size, repeat).
- How many people are needed for the section to show: "Minimum slides to render section" and "Maximum slides to render section".
- When the row turns into a carousel: "Carousel activation min" for desktop (1300px and up), tablet (640-1299px) and mobile (under 640px), or one fallback value for all three.
- "Locale (en or fr)": switches the built-in default wording between English and French.
- Every label, each optional: the screen-reader labels for the carousel, cards region, arrows, dots, slides and live announcements; the keyboard instructions; the Biography button text; the LinkedIn and email link text in the pop-up; the Close button label; and the placeholder text for a missing photo. Left blank, each uses the English or French default.
- "Asset version": a technical field, bumped at deploy so browsers fetch fresh CSS and JS.
- The people themselves are not fields in this component. Each card's name, title, subtitle, photo, LinkedIn address, email and biography are read from that person's author record (DCR).

### What it does not do
- It does not let the editor type a person's name, role, photo or biography in the component. Those come from the author records.
- It does not show the section at all when the number of people is below the minimum or above the maximum.
- It does not advance by itself. Autoplay is off.
- It cannot appear twice on one page. The section and its controls use fixed IDs, so a second carousel on the same page will not work properly.
- It does not show a Twitter / X link. The author record's twitter value is read but never displayed.
- It does not show email on the card. Email only appears in the biography pop-up, and only when "Show email link in bio modal" is on.
- The Locale field does not translate the people's names, roles or biographies; it only changes the built-in labels.

### Limits
- People: the section shows only when the count is between the minimum and maximum. As shipped: minimum 2, maximum 12. If the fields are blank the skin uses 2 and 8.
- Skins: 1. Colour schemes: 3. Card actions: 3.
- Carousel on or off (set per screen width by number of people): on from 5 people at 1300px and up, from 3 at 640-1299px, from 2 under 640px, unless the activation fields say otherwise. Below the threshold the cards sit in a fixed left-aligned row with no arrows, dots or swiping.
- With the carousel on: it loops, can be swiped or dragged, and has arrows and dots.
- Card size: 343px wide under 560px, 270px wide from 560px. Per the stylesheet notes that gives 1 card in view under 560px, 2 from 560px, 3 from 850px and 4 from 1140px.
- Photos: shown 263px tall across the card width, cropped to fit and anchored to the top centre. The placeholder image is 276 x 263.
- Text length: No enforced character limit. If any card's role is longer than 70 characters, every card gets a taller text area so the cards still match.

### Empty and edge cases
- Fewer people than the minimum, or more than the maximum: nothing is printed, including the heading.
- Blank heading: "European leadership" is used (or the French default when Locale is fr). Blank subheading: hidden.
- Role line: the title, then ", " and the subtitle when there is one.
- Person with no photo, or a photo that fails to load: a grey placeholder image with the text "Team Member" (French default when Locale is fr) is loaded from fpoimg.com.
- Person with no LinkedIn address: no LinkedIn link on the card, and no LinkedIn link in the pop-up.
- Person with no biography: no Biography button, even in biography mode.
- A card with neither a link nor a button is still shown and can still be reached with the Tab key.
- Card Action left blank or misspelled: treated as linkedin. Color Scheme not recognised: light. Heading Alignment not recognised: left. Locale not recognised: en.
- Background image set without position, size or repeat: "center center", "cover" and "no-repeat" are used.
- Scripts off: the cards stack in one column, all visible. The arrows show but do nothing, the Biography buttons do nothing, and LinkedIn links still work.
- The script needs jQuery from the site. The biography pop-up uses the site's Bootstrap modal. The carousel library is loaded from rbccm.com, with a public CDN copy as fallback.

### Accessibility
- Headings: the section heading is an h2 and each person's name an h3. The pop-up's name is an h2. None can be changed by the editor.
- The section has an ARIA label ("European leadership team carousel" by default) and the cards area is a labelled region ("Leadership cards") tied to hidden keyboard instructions. All three texts are editable fields.
- Photo alt text is the person's name. The editor cannot set it separately.
- The LinkedIn link is labelled "{name} on LinkedIn, opens in new tab" and opens in a new tab. The Biography button is labelled "Read {name}'s biography". Both templates are editable.
- Each slide is announced as "{name}, {role}, slide N of M". The current dot is labelled "Current slide: {name}, slide N of M"; other dots "Go to slide N". A polite live region announces the new slide after each move.
- Keyboard: the Tab order is Previous arrow, the visible cards, Next arrow, then the dots. Only cards that are in view can be reached; slides that are out of view are skipped and hidden from screen readers.
- Focus: a card reached by keyboard gets a dark-blue border and its link or button a visible outline. Mouse clicks do not show it.
- The pop-up is a dialog labelled by the person's name, with a Close button labelled "Close" (editable).
- Reduced motion: slides change instantly and card and link transitions are turned off.

### Open questions
- How does an editor add, remove and reorder people? The skin reads author records attached to the component, but the properties file has no field for them.
- Card Action "both": the Biography button is printed, but the skin only prints the pop-up in "biography" mode. Does the Biography button work in "both" mode?
- The hidden keyboard instructions tell users to use the left and right arrow keys to move between slides, but the script has no arrow-key handling and turns the carousel library's own keyboard support off. Should arrow keys work, or should the instructions change?
- Carousel thresholds: the field labels and the arrows-and-dots rule treat 640-1299px as tablet, but the carousel settings in the script switch to the tablet rule only below 1025px. Which range is intended?
- The maximum is 12 in the shipped fields but 8 in the skin when the field is blank. Which is the agreed maximum?
- The inactive dot label is "Go to slide {n}" in the skin but "Go to slide {n} of {total}" in the properties reference table and the script's fallback. Which wording is wanted?
- Is loading the missing-photo placeholder from fpoimg.com (an outside service) acceptable on the live site?
- What photo size and ratio should be uploaded to the author records?
- When the pop-up closes, does focus return to the Biography button that opened it? The component script does not handle this itself.
- Which pages will use this component? The `static/` folder holds hand-built copies for Energy Transition and Global Markets, but neither is in the build config.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-leadership.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-leadership.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-leadership.css` and `/assets/rbccm/js/components/rbccm-leadership.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-leadership.xsl` | TeamSite skin. Prints the section, the cards from the author records and the biography pop-up, and loads the CSS and JS. |
| `rbccm-leadership-properties.xml` | The editor's fields, with a reference table of the English and French default labels. |
| `rbccm-leadership.css` | Styles. Deploys to `/assets/rbccm/css/components/rbccm-leadership.css`. |
| `rbccm-leadership.js` | Script: carousel, keyboard and screen-reader support, biography pop-up. Deploys to `/assets/rbccm/js/components/rbccm-leadership.js`. |
| `local-test.html` | Local preview with a variant picker. Local only. |
