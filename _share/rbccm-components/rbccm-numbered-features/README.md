# RBCCM Numbered Features

Heading + intro line, then exactly 3 numbered features (/01 /02 /03) separated by thin grey rules. Extracted 1:1 from the MAAS+MATA "Innovation for the next execution era" section (`.rbccm-maas-mata__innovation-era`), including the page's font overrides.

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
