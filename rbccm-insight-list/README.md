# Insight List

A section heading and intro, then a list of up to four stories. Each story shows an image, a category label, the title, a summary, a meta line and a button to the story. Built for the ETF Innovators "More on ETFs" section.

Each story can be picked from TeamSite's article picker, so the title, summary, image and link come from the story itself. Typed fields override the picked story.

---

## Files

| File | What it is |
|---|---|
| `rbccm-insight-list--etf-innovators.xsl` | TeamSite skin for the ETF Innovators variant. |
| `rbccm-insight-list-properties.xml` | Properties + Data fields (prefilled with the ETF Innovators content). |
| `rbccm-insight-list.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-insight-list.css`. |
| `rbccm-insight-list.html` | Local preview, rendered from the skin. |
| `photos/etf-innovators-story-1-fpo.webp`, `-2-fpo.webp` | Placeholder images cropped from the page comp. Replace with the real story images. |

---

## Variants (one skin each)

**`etf-innovators`**: White section. Heading and intro 16px apart (6px on desktop), then the stories (32px below on mobile, 48px on desktop), always one per row, 32px apart. Mobile: image (329 x 187.24, 20px radius) above the text. From 768px: image left and text right, 32px apart, text centred against the image; the image is a fixed 367 x 217 (the photo covers the whole block). Text: category, title, summary, meta, button, 12px apart; the title is 28px / 128% from 992px. Every element carries the `--etf-innovators` modifier. Mobile follows the Figma spec; desktop is measured from the 1440 comp (60px padding) until its CSS spec arrives, and uses the global 1140 width instead of the comp's 1100. The intro style isn't in the spec; it uses the page's other intro style (Roboto 16px / 150%, #494949).

---

## Layout

```
More on ETFs                                   (h2)
The latest ETF research and insights ...       (intro)

[image          ]  STRATEGIC ALTERNATIVES      (category)
[               ]  What is driving the ...     (h3)
[               ]  Summary
[               ]  Valerie Grimba . May 2026 . 17 min listen
                   [Read the story ->]

[image          ]  STRATEGIC ALTERNATIVES
[               ]  ETF Innovators: BMO ...
                   ...
```
(Mobile stacks each image above its text.)

The stories are a list (`ul` / `li`). The button's screen reader label names the story ("Read the story: What is driving the next phase of ETF innovation?"). Its hover matches the page's other buttons: a shine sweeps across it and the arrow flies out and back.

---

## Fields

| Field | Notes |
|---|---|
| `SectionID` | Section id; the heading gets `<id>-heading`. |
| `SectionAriaLabel` | Optional. Blank uses the section heading. |
| `CssPath`, `CacheVersion` | Stylesheet path; bump `CacheVersion` after each upload. |
| `SectionHeading` | "More on ETFs". Blank hides it. |
| `SectionIntro` | Intro paragraph. Blank hides it. |
| `SummaryLimit` | Summary character limit, default 90. A longer summary (typed or from the picked story) is cut at the last whole word with an ellipsis; within the limit it shows as entered. 0 or `full` = no limit. |
| `Item1Story` to `Item4Story` | Article picker. Fills the title, summary, image and link from the picked story. |
| `Item{N}Category` | Category label, e.g. Strategic Alternatives. Always typed. |
| `Item{N}Title` | Blank uses the picked story's title. A story with no title (typed or picked) is hidden. |
| `Item{N}Summary` | Blank uses the picked story's summary. |
| `Item{N}Meta` | Meta line, e.g. Valerie Grimba &#183; May 2026 &#183; 17 min listen. Always typed. |
| `Item{N}Image` | DAM image. Blank uses the picked story's thumbnail. The image Description is the alt text; blank makes it decorative. |
| `Item{N}Link` | Blank uses the picked story's link. No link hides the button. |
| `Item{N}ButtonLabel` | Blank shows "Read the story". |

---

## Deploy checklist

1. Upload `rbccm-insight-list.css` to `/assets/rbccm/css/components/`.
2. Register `rbccm-insight-list--etf-innovators.xsl` in TeamSite with `rbccm-insight-list-properties.xml`.
3. Pick the two stories (or fill the fields by hand), and upload and pick the story images.
4. Check each button goes to the right story.
5. Bump `CacheVersion`.
