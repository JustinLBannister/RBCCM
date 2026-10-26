# RBCCM Intro Statement

Big centred serif statement, up to 3 paragraphs and a ghost pill button. Extracted from the MAAS+MATA "A new standard for multi-asset electronic trading." section (`.rbccm-maas-mata__new-standard`), with the values the live page ends up with after maas-mata.css's page-level overrides.

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
