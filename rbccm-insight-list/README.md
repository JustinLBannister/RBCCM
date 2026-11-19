# Insight List

A section heading and intro, then a list of up to four stories. Each story shows an image, a category label, the title, a summary, a meta line and a button to the story. Built for the ETF Innovators "More on ETFs" section.

Each story can be picked from TeamSite's article picker, so the title, summary, image and link come from the story itself. Typed fields override the picked story.

---

## For editors and BAs

### Purpose

A short, hand-picked list of related stories under a heading and intro, each with an image, a summary and a button to the story. It is used on the ETF Innovators page (in progress, not live yet) as the "More on ETFs" section.

- Variant `etf-innovators`: the only skin. White section, one story per row.

### What the editor can change

- The section heading, the intro paragraph and the screen reader name of the section ("Section aria label").
- Up to four stories ("Story 1" to "Story 4"). For each one:
  - Pick the story in the article picker ("pick the story"). The picker offers articles and episodes. The title, summary, image and link then come from the story.
  - Or type the title, summary, image and link by hand. Anything typed wins over the picked story.
  - Type the category label and the meta line (for example the author, date and listening time). These are never filled from the picked story.
  - Change the button label. Blank shows "Read the story".
- The summary length ("Summary character limit", `SummaryLimit`): one setting for all stories, default 90 characters. Type 0 or "full" for no limit.
- The alt text of each image (the image Description).
- Technical fields (section ID, CSS path, the "Last updated" cache version) exist and are set at deploy.

### What it does not do

- It does not pull the latest stories by itself. Stories are picked or typed, and show in field order (Story 1 first).
- It shows four stories at most and has no filters, paging, carousel or "load more".
- It does not read the category, author, date or reading time from the picked story. The category and meta line are always typed.
- It does not open the story in a new tab.
- It does not keep bold, italic or links in a summary that is longer than the limit. A summary that is cut is shown as plain text.
- It does not put stories side by side. There is one story per row at every screen width.
- It has no script of its own; nothing is loaded after the page is published.

### Limits

- Stories: 0 to 4. The prefilled content and the deploy checklist use 2.
- Layout: one story per row at every width. On phones the image sits above the text. From 768px the image sits on the left at a fixed 367 x 217 and the text on the right.
- Images: cropped to fill the frame. The frame is 329 x 187 on the phone design and 367 x 217 from 768px.
- Summary: 90 characters by default (set by "Summary character limit"). A longer summary is cut at the last whole word and ends with "...".
- Other text (heading, intro, category, title, meta line, button label): No enforced character limit.
- Variants: 1.

### Empty and edge cases

- Every text field is optional. A blank section heading, intro, category, summary or meta line is simply not shown.
- A story with no title, typed or picked, is hidden completely, even if its other fields are filled in.
- No image, typed or picked: the story shows as text only.
- No link, typed or picked: the story shows without a button.
- Blank button label: the button reads "Read the story".
- Blank "Summary character limit": 90 is used.
- No stories at all: the heading and intro show with nothing under them.
- One story or four: the layout is the same, one row each.
- All scripts off in the browser: the heading, intro and stories are in the page source but stay invisible, because they fade in on scroll and that fade is started by the site's animation script (rbccm-animate). Visitors with reduced motion turned on see them without it.

### Accessibility

- Headings: section heading is an h2, each story title is an h3. The editor cannot change the levels.
- The section is named for screen readers by its heading, or by "Section aria label" when that is filled in.
- The stories are a list, so screen readers announce how many there are.
- Each button names its story for screen readers: the button label, a colon, then the title ("Read the story: What is driving the next phase of ETF innovation?").
- Image alt text comes from the image Description. If that is blank the image is treated as decoration and skipped by screen readers. This also applies when the image comes from the picked story.
- The button is a normal link and shows a focus outline. There is no other keyboard behaviour.
- Reduced motion: the fade-in on scroll and the button's hover animation are switched off.

### Open questions

- How many stories the section is designed for. The fields allow four, the content and checklist use two, and no file says three or four have been checked against the design.
- The desktop layout is measured from the page comp; its final spec has not arrived. The intro text style is not in the spec either and borrows the page's other intro style.
- The prefilled links ("#") and images are placeholders. The real stories and images are still to be picked.
- Which story fields the article picker returns in TeamSite has not been confirmed here. The skin expects a title, description, thumbnail and link (or url).
- The ETF Innovators page has no address yet, so the live URL is not recorded.
- Whether the page template gives visitors without scripts a way to see the section (see "All scripts off" above).

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-insight-list.css` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site this loads from `/assets/rbccm/css/components/rbccm-insight-list.css`.

## Files

| File | What it is |
|---|---|
| `rbccm-insight-list--etf-innovators.xsl` | TeamSite skin for the ETF Innovators variant. |
| `rbccm-insight-list-properties.xml` | Properties + Data fields (prefilled with the ETF Innovators content). |
| `rbccm-insight-list.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-insight-list.css`. |
| `rbccm-insight-list.html` | Local preview, rendered from the skin. |

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
