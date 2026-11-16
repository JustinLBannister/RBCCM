# Insight Cards

A section of story cards: an eyebrow, heading and intro, then up to five stories. Each story shows an image with an optional pill and type icon, a category label, the title, a summary, a meta line, an action link and a share button. Built for the 2027 Outlook page, where it is used four times: Featured insight, Macro views, Capital Markets perspectives and Latest insights.

Each story can be picked from TeamSite's article picker, so the title, image and link come from the story itself. Typed fields override the picked story.

---

## Files

| File | What it is |
|---|---|
| `rbccm-insight-cards--outlook-2027.xsl` | TeamSite skin for the 2027 Outlook page. |
| `rbccm-insight-cards-properties.xml` | Properties + Data fields (prefilled with the Macro views content). |
| `rbccm-insight-cards.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-insight-cards.css`. |
| `rbccm-insight-cards.js` | Share popup and filter pills. Ships to `/assets/rbccm/js/components/rbccm-insight-cards.js`. |
| `rbccm-insight-cards.html` | Local preview, rendered from the skin: one variant per layout. |
| `photos/outlook-2027-*-fpo.jpg` | Placeholder images taken from the team's page preview. Replace with the real story images. |

---

## Layouts

The editor picks a Layout and a Background. The number of stories with a title does the rest.

**Cards**

| Stories | Layout |
|---|---|
| 1 | One wide card: image left, text right, action as a button. On Light blue and Dark navy the card sits in a panel. |
| 2 | Two columns. |
| 3 | Three columns. |
| 4 | Four columns. |
| 5 | Three columns; the last two wrap to a second row. |

Below 992px the columns become two, and below 600px one.

**Featured**

Story 1 is the large featured story, with its summary, an action button and a Share button.

| Other stories | Layout |
|---|---|
| 0 | The featured story's text sits beside its image. |
| 1 or 2 | They stack as cards beside the featured story. |
| 3 or 4 | They become rows under an "Also selected" heading: thumbnail, category, title, meta, action and share. |

Below 992px the other stories sit under the featured story.

**Background**: White, Light blue (`#F1F5FB`) or Dark navy. Text, pills and buttons switch colour to suit.

---

## What each story shows

```
[image                    ]
[ (pill)                  ]   pill: e.g. RBC Economics
[ (type icon)             ]   play, headphones or open book
CATEGORY
Title                         (h3)
Summary                       (optional)
Meta line
---------------------------
Action link          (share)
```

- **Type** sets the icon on the image and the default action label: Article (book, "Read"), Podcast (headphones, "Listen"), Video (play, "Watch"). None shows no icon.
- **Action link**: in a column card the whole card is the click target. Screen readers hear the action with the story's title ("Read: Global economic outlook").
- **No image**: the story shows a navy block with the "no image" label (for example RBC Capital Markets Research), so the columns stay level.
- **Name and role** can be placed over the image (the featured story's speaker).

---

## Share

Every story has a share button. It opens a small popup beside the button with:

- Copy link
- X (Twitter)
- LinkedIn
- Email
- More apps (only on devices that have their own share sheet, mostly phones)

The link that is shared is the story's own link. A story with no link shares the page it is on. While the popup is open the rest of that story fades back. Escape, the close button or a click anywhere else closes it, and keyboard focus returns to the share button.

Share can be switched off for the whole section with the `ShowShare` field.

---

## Filter pills

With `ShowFilters` set to Yes (Cards layout), a row of pills appears above the stories: "All", then one pill for each different filter label used on the stories (for example Research, Conferences, Events, Webinars). Choosing a pill shows only the stories with that label. The pills need at least two stories and at least one filter label.

---

## Notification strip

An optional blue strip under the stories with a small heading, a line of text and a yellow button (for example "Never miss an Outlook episode" / "Get notified"). Leave its text fields blank to hide it.

---

## What the editor can change

- The layout (Cards or Featured), the background, and whether share and filter pills show.
- The eyebrow, heading, intro and the header button.
- Up to five stories: pick the story, or type the title, summary, image and link by hand; set the pill, type, category, meta line, action label and filter label.
- The "Also selected" heading, the "no image" label and the notification strip.

## What it does not do

- It does not pull the latest stories by itself. Stories are picked or typed; the order on the page is the order of the fields.
- It shows five stories at most and has no carousel or paging.
- The pill, type, category, meta line and action label are never filled from the picked story. They are always typed.
- On the smaller cards a summary only shows when it is typed. The featured story also uses the picked story's summary.
- The filter pills only filter the stories in their own section.
- Share and filter pills need the script. Without it the stories and their links still show; the share buttons and pills stay hidden.

All stories are printed into the page by the skin, so they are present in the page source for search engines and other crawlers that do not run scripts.

---

## Fields

| Field | Notes |
|---|---|
| `SectionID` | Section id; the heading gets `<id>-heading`. Must be different on each instance on the page. |
| `SectionAriaLabel` | Optional. Blank uses the section heading. |
| `CssPath`, `JsPath`, `CacheVersion` | Stylesheet and script paths; bump `CacheVersion` after each upload. |
| `Layout` | Cards or Featured. |
| `Theme` | White, Light blue or Dark navy. |
| `ShowShare` | Yes (default) or No. |
| `ShowFilters` | No (default) or Yes. Cards layout only. |
| `Eyebrow` | Small label above the heading. Blank hides it. |
| `SectionHeading` | Blank hides it. |
| `SectionIntro` | Intro paragraph. Blank hides it. |
| `HeaderButtonLabel`, `HeaderButtonLink` | Button on the right of the header, e.g. Explore all insights. Needs both. |
| `FilterAllLabel` | Label of the first filter pill. Blank shows "All". |
| `SideHeading` | Featured layout: heading above the rows. Default "Also selected". Blank hides it. |
| `NoImageLabel` | Label on a story with no image. Blank shows a plain navy block. |
| `Item1Story` to `Item5Story` | Article picker. Fills the title, image and link from the picked story. Story 1 is the featured story in the Featured layout. |
| `Item{N}Badge` | Pill on the image, e.g. RBC Economics. Blank hides it. |
| `Item{N}Type` | None, Article, Podcast or Video. |
| `Item{N}Category` | Category label, e.g. Macro &amp; rates. |
| `Item{N}Title` | Blank uses the picked story's title. A story with no title (typed or picked) is hidden. |
| `Item{N}Summary` | Optional. |
| `Item{N}Meta` | Meta line, e.g. Frances Donald &#183; Oct 9, 2026. |
| `Item{N}Image` | DAM image. Blank uses the picked story's thumbnail. The image Description is the alt text; blank makes it decorative. |
| `Item{N}Link` | Blank uses the picked story's link. No link hides the action link. |
| `Item{N}ActionLabel` | e.g. Read &#183; 5 min read. Blank shows Read, Listen or Watch by type. |
| `Item{N}Filter` | Filter label used by the filter pills, e.g. Research. |
| `Item{N}SpeakerName`, `Item{N}SpeakerRole` | Optional name and role shown over the image. |
| `NotifyEyebrow`, `NotifyText` | Notification strip text. Both blank hides the strip. |
| `NotifyButtonLabel`, `NotifyLink` | Notification strip button. Needs both. |

---

## Deploy checklist

1. Upload `rbccm-insight-cards.css` to `/assets/rbccm/css/components/` and `rbccm-insight-cards.js` to `/assets/rbccm/js/components/`.
2. Register `rbccm-insight-cards--outlook-2027.xsl` in TeamSite with `rbccm-insight-cards-properties.xml`.
3. Add one instance per section and give each its own `SectionID`.
4. Set the Layout and Background, then pick the stories (or fill the fields by hand) and upload and pick the story images.
5. Check each action link goes to the right story, and that Copy link in the share popup copies that story's address.
6. Bump `CacheVersion`.
