# rbccm-disclaimer

One paragraph of small grey disclaimer copy at the foot of a page.

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
