# RBCCM Button

Shared stylesheet for the pill-shaped buttons used on RBCCM pages. It has no TeamSite skin and no fields of its own: it only styles buttons that other components print with the `rbccm-button` classes.

## For editors and BAs

### Purpose
One look for buttons across pages: a rounded pill in four styles (Primary, Yellow, Secondary, Ghost), with an optional icon after the label. The stylesheet is part of the page bundles for US Credentials (live) and ETF Innovators (in progress, not live yet).

Styles:
- Primary: blue fill, white text.
- Yellow: warm yellow fill, navy text, slightly larger type. Built for navy bands.
- Secondary: no fill, grey text and border.
- Ghost: no fill, light text and border, for dark backgrounds.

### What the editor can change
- Nothing directly. This component has no fields in TeamSite.
- The label, link and (where offered) the style and icon of a button are set in the component that prints the button.
- The file itself is deployed once to `/assets/rbccm/css/components/rbccm-button.css`.

### What it does not do
- It does not put a button on a page by itself. Another component has to print the button.
- It has no script. Nothing here opens a form, a modal or a video.
- It has no size options. Every button is the same height.
- It has no style for a disabled button.
- It does not set a keyboard focus outline of its own.

### Limits
- Four styles. One optional icon per button.
- Height is fixed at 50px. Text is 18px (Primary drops to 14px below 992px wide; Yellow is about 19.5px).
- No enforced character limit. The file has no rule for a label that wraps onto a second line.

### Empty and edge cases
- A button with no icon shows the label alone.
- Scripts off: no change. Everything here is CSS.

### Accessibility
- The buttons are links printed by other components, so the link text and any screen-reader label come from that component.
- Keyboard focus: Primary and Yellow play the same shine and arrow animation as on hover; Yellow and Ghost also change colour. Secondary has no keyboard focus style in this file.
- Reduced motion: the shine and arrow animations are turned off. Colours still change on hover.

### Open questions
- Which live components depend on this stylesheet. In this repo the only skins that print `rbccm-button` classes are three hero skins (MAAS+MATA, ETF Innovators, 2027 Outlook), and the hero stylesheet carries its own rules for those buttons.
- Whether a visible keyboard focus outline is supplied by the site styles, since this file does not set one.

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-button.css` |

On the site this loads from `/assets/rbccm/css/components/rbccm-button.css`.

There is no TeamSite component for this folder; it is a shared file other components use.

## Files

| File | What it is |
|---|---|
| `rbccm-button.css` | The button styles. Ships to `/assets/rbccm/css/components/rbccm-button.css`. |
| `local-test.html` | Local preview of the four styles. Not deployed. |
