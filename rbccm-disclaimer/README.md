# rbccm-disclaimer

One paragraph of small grey disclaimer copy at the foot of a page.

## For editors and BAs

### Purpose
Prints one paragraph of small grey legal or disclaimer text at the bottom of a page. Not on a page in the build config yet. One skin, no variants.

### What the editor can change
- "Disclaimer text": the paragraph itself. HTML and character codes (for example the registered-trademark and copyright symbols) are printed as entered.
- "Background colour": optional. Blank is white; it takes any CSS colour such as #F1F5FB, or transparent.
- "Last updated": bump it each time the component is saved (format YYYY-MM-DD-HHMM); it makes browsers fetch the latest stylesheet. The CSS path is fixed in the skin, not a field.

### What it does not do
- It does not take more than one paragraph. Line breaks typed in the field are collapsed into spaces and everything prints inside a single paragraph.
- It has no heading, link field, image or button.
- It does not change the text style. Size, colour, weight and spacing are fixed.
- It does not update itself. Dates or years in the text (the default text ends with "Copyright 2020") stay as typed.
- It does not check that the text is readable against the chosen background colour.

### Limits
- Items: one paragraph. Variants: none.
- Layout: full width with 23px side padding and 24px top and bottom at every screen size; the text column stops at 1140px wide and is centred. There are no breakpoints.
- Type: Roboto Light 12px, 150% line height, colour #424242.
- Text length: No enforced character limit.

### Empty and edge cases
- Blank "Disclaimer text" (or only spaces): nothing is printed at all, including the stylesheet link.
- Blank "Background colour": white.
- Hidden Figma data pasted in with copy is removed from the output.
- Scripts off: no change. The component has no script.

### Accessibility
- The text is a plain paragraph inside a div. There is no heading, landmark or ARIA label, and the editor cannot add one through a field.
- Nothing in it is focusable unless a link is typed into the text as HTML.
- The text colour is fixed at #424242 at 12px. A dark "Background colour" would reduce contrast; the component does not prevent that.
- No motion or animation.

### Open questions
- Which pages will use it? It is not in the build config.
- The default text ends with "Copyright 2020". Is that the approved wording, or should the year be current?
- Who owns and signs off the disclaimer wording for each page?

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-disclaimer.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-disclaimer.css`.

## Files

| File | Upload to |
|---|---|
| `rbccm-disclaimer.xsl` | TeamSite skin |
| `rbccm-disclaimer-properties.xml` | TeamSite component properties |
| `rbccm-disclaimer.css` | `/assets/rbccm/css/components/rbccm-disclaimer.css` |
| `local-test.html` | Local preview only |

## Fields

- **Disclaimer text** (Content tab): the paragraph. Blank hides the component.
- **Background colour** (Appearance tab): optional, white by default. Any CSS colour, or `transparent`.
- **Last updated**: cache-buster for the CSS.

## Markup

```html
<div class="rbccm-disclaimer">
  <div class="rbccm-disclaimer__inner">
    <p class="rbccm-disclaimer__text">...</p>
  </div>
</div>
```

Mobile first: full width with 23px side padding and 24px top/bottom; the text stops at 1140px on wide screens. Type: Roboto Light 12px / 150%, #424242, 0.5px tracking (matches the existing site disclaimer). No JS.
