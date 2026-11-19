# RBCCM Numbered Features

Heading + intro line, then exactly 3 numbered features (/01 /02 /03) separated by thin grey rules. Extracted 1:1 from the MAAS+MATA "Innovation for the next execution era" section (`.rbccm-maas-mata__innovation-era`), including the page's font overrides.

## For editors and BAs

### Purpose
A heading and an intro line, then three numbered features (/01, /02, /03), each with a number, a title and a short body. Used on MAAS+MATA (live) for the "Innovation for the next execution era" section. It has one skin.

### What the editor can change
- The heading and the intro line under it.
- For each of the three features: the number, the title and the body.
- Appearance: the background colour (blank = light blue-grey #F1F5FB), the heading tag (h1, h2, h3, p or div), an optional section ID for anchor links and an optional section aria-label.
- Technical fields exist and are set at deploy: CSS path and "Last updated" (cache version).

### What it does not do
- It does not take more or fewer than three features. There is no way to add or remove one.
- It has no link, button, icon or image fields.
- It does not turn into a carousel on phones. The features stack.
- The heading and the feature titles are plain text. HTML typed there shows as typed. The intro line and the bodies are output as entered.
- It does not change its text colours for a dark background. The text is black and dark grey.
- It has no script of its own. The fade-in on scroll comes from the shared rbccm-animate script.

### Limits
- Exactly three features: minimum three, maximum three. One skin.
- Below 992px the features stack, with a thin rule above each and below the last. From 992px they sit in one row of three columns (367px each at most) with vertical rules between them.
- Content width is 1100px at most.
- Text length: No enforced character limit.

### Empty and edge cases
- Any one of the three feature titles blank: the whole row of features is left out. The heading and intro line still show.
- Feature number blank: 01, 02 or 03 is filled in by position. The slash is added automatically; slashes and spaces typed in the field are removed.
- Feature body blank: that feature shows its number and title only.
- Heading blank: not shown. Intro line blank (or only the editor's empty placeholder): not shown. Both blank: the header block is left out.
- Section aria-label blank: the heading is used. With no heading either, the section has no label.
- Heading tag blank or not one of the five allowed values: h2.
- Background colour blank: #F1F5FB.
- Scripts off: all content shows; there is just no fade-in.

### Accessibility
- The section heading is h2 by default and the editor can change it with "Heading tag". The feature titles are always h3 and cannot be changed, so they stay h3 even if the heading tag is changed.
- The features are a list, so screen readers announce how many there are. The /01 numbers are decorative and hidden from screen readers.
- The section is labelled with the section aria-label, or the heading when that is blank.
- There are no links, buttons or images, so no keyboard, focus or alt text behaviour.
- Reduced motion: the fade-in on scroll is turned off; content shows straight away.

### Open questions
- The stylesheet notes say "up to 3" features while the skin requires exactly three. Confirm that fewer than three is not needed.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-numbered-features.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-numbered-features.css`.

## Files

| File | What it is |
|---|---|
| `rbccm-numbered-features.xsl` | TeamSite skin |
| `rbccm-numbered-features-properties.xml` | Fields |
| `rbccm-numbered-features.css` | Ships to `/assets/rbccm/css/components/rbccm-numbered-features.css` |
| `local-test.html` | Local preview |

No JS (scroll reveal uses the shared rbccm-animate attributes).

## Fields

- **Content:** HeadingText, IntroText, Feature1-3 Number / Title / Body.
- **Appearance:** CssPath, CacheVersion, SectionID, SectionAriaLabel (blank = heading), SectionBgColor (blank = #F1F5FB), HeadingTag (h2 default).

Exactly 3 features: the row only renders when all 3 titles are filled in (min and max are both 3, since the layout is built for 3 columns). A blank number is filled in as 01, 02, 03. The heading and the intro line (subheader) each render only when they have text; a field left with only the editor's empty placeholder counts as blank.

## Layout

Below 992: features stack, a rule above each and below the last. 992+: a row of 367px columns with vertical rules between. Content rail 1100px; padding 60/23 mobile, 80/23 desktop.

Features are a list (`ul` / `li`) so screen readers announce the count; the /01 numbers are decorative (`aria-hidden`). Titles are `h3` under the `h2` heading.
