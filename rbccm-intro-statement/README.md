# RBCCM Intro Statement

Big centred serif statement, up to 3 paragraphs and a ghost pill button. Extracted from the MAAS+MATA "A new standard for multi-asset electronic trading." section (`.rbccm-maas-mata__new-standard`), with the values the live page ends up with after maas-mata.css's page-level overrides.

## For editors and BAs

### Purpose
A large centred statement in three colours (grey, white, yellow), followed by up to three paragraphs and one button. Used on MAAS+MATA (live) for the "A new standard for multi-asset electronic trading." section. It has one skin.

### What the editor can change
- The heading, in three parts: the lead (grey, on its own line), the highlight (white, on its own line) and the accent (yellow, straight after the highlight).
- Up to three paragraphs. Simple HTML such as bold, italic and links is allowed.
- One button: its label, its URL and an optional aria-label.
- Appearance: the background colour (blank = transparent), the heading tag (h1, h2, h3, p or div), an optional section ID for anchor links and an optional section aria-label.
- Technical fields exist and are set at deploy: CSS path and "Last updated" (cache version).

### What it does not do
- It has no image, video or icon.
- It has one button only, and no field to make the link open in a new tab.
- The heading colours go with the position (lead grey, highlight white, accent yellow). The editor cannot pick other colours.
- The highlight and accent are plain text. HTML typed there shows as typed. Only the lead accepts a line break tag.
- It shows three paragraphs at most.
- It does not change its text colours for a light background. The text is white and light grey, made to sit on a dark background.
- It has no script of its own. The fade-in on scroll comes from the shared rbccm-animate script.

### Limits
- One heading (up to three parts), zero to three paragraphs, zero or one button. One skin.
- Text length: No enforced character limit.
- Heading size is 50px on phones and 75px from 992px wide. Below 600px the heading column is 331px wide.
- A line break typed in the lead applies on phones only; from 600px wide it is ignored.
- Paragraphs sit in a column of up to 1050px.
- The layout changes at 600px and 992px.

### Empty and edge cases
- Any heading part left blank is left out. With all three blank there is no heading.
- A paragraph that is blank, or holds only the editor's empty placeholder, is skipped. With all three blank the paragraph block is left out.
- The button shows only when both the label and the URL are filled in.
- Section aria-label blank: the heading text is used. With no heading either, the section has no label.
- Background colour blank: transparent. On MAAS+MATA it sits inside the dark strip made by rbccm-section-group.
- Heading tag blank or not one of the five allowed values: h2.
- Section ID blank: no anchor is output.
- Hidden design-tool data that comes along with pasted text is removed from the lead and the paragraphs.
- Scripts off: all content shows; there is just no fade-in.

### Accessibility
- The three heading parts are output as one heading. The level is h2 by default and the editor can change it with "Heading tag".
- The section is labelled with the section aria-label, or the heading text when that is blank.
- The button is a link. Screen readers read its label, or the button aria-label when one is filled in.
- The button shows a yellow outline on keyboard focus.
- Reduced motion: the button's shine and colour transitions and the fade-in on scroll are turned off; content shows straight away.
- There are no images, so no alt text.

### Open questions
- The grey lead is white at 40% opacity. Whether it meets contrast requirements depends on the background behind it, which the files do not fix.
- The notes in the files call the button a "ghost pill", but the stylesheet makes it a solid yellow pill. Confirm which is the approved design.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-intro-statement.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-intro-statement.css`.

## Files

| File | What it is |
|---|---|
| `rbccm-intro-statement.xsl` | TeamSite skin |
| `rbccm-intro-statement-properties.xml` | Fields |
| `rbccm-intro-statement.css` | Ships to `/assets/rbccm/css/components/rbccm-intro-statement.css` |
| `local-test.html` | Local preview |

No JS (scroll reveal uses the shared rbccm-animate `data-animate` attributes).

## Fields

- **Content:** HeadingLead (grey, own line; a `<br>` breaks the line on phones only), HeadingHighlight (white, own line), HeadingAccent (yellow, follows the highlight), Paragraph1-3 (simple HTML ok), CtaLabel, CtaHref, CtaAriaLabel.
- **Appearance:** CssPath, CacheVersion, SectionID, SectionAriaLabel (blank = heading text), SectionBgColor (blank = transparent), HeadingTag (h2 default).

Blank fields don't render. Paragraphs left with only the editor's empty placeholder (`<br data-mce-bogus>`, `&nbsp;`) are skipped.

## On MAAS+MATA

Transparent by default: place it inside the dark strip using rbccm-section-group (Group start above it, Group end after the last dark-strip section).

MAAS+MATA dark-strip sections and their components:

| Page section | Component / skin |
|---|---|
| `__new-standard` | `rbccm-intro-statement.xsl` |
| awards | `rbccm-awards.xsl` (3 cards) |
| `__platforms` | `rbccm-two-up-cards--features.xsl` |
| `__mata-cap` | `rbccm-capability-cards--maas-mata.xsl` |
