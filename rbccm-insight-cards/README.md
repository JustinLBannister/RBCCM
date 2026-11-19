# Insight Cards

A section of story cards: an eyebrow, heading and intro, then up to five stories. Each story shows an image with an optional pill and type icon, a category label, the title, a summary, a meta line, an action link and a share button. Built for the 2027 Outlook page, where it is used four times: Featured insight, Macro views, Capital Markets perspectives and Latest insights.

Each story can be picked from TeamSite's article picker, so the title, image, link, type, author, date and read or watch time come from the story itself, printed into the page on the server with nothing typed. The typed fields show when no story is picked.

---

## For editors and BAs

### Purpose

A section of hand-picked story cards under a heading, with a share button on each story and, optionally, filter pills and a notification strip. It is used on the 2027 Outlook page (in progress, not live yet), four times: Featured insight, Macro views, Capital Markets perspectives and Latest insights.

- Variant `outlook-2027`: the only skin. Each instance sets its own layout and background.
- Layout "Cards": the stories sit in columns; the number of stories sets the number of columns.
- Layout "Featured": Story 1 is large and the other stories sit beside it.
- Background: White, Light blue or Dark navy.

### What the editor can change

- The layout (Cards or Featured), the background, whether share and filter pills show, and how the Cards layout behaves on phones (stacked, or a row to swipe through).
- The eyebrow, heading, intro and the header button.
- Up to five stories: pick the story, or type the title, summary, image and link by hand; set the pill, type, category, meta line, date, action label and filter label.
- The "Also selected" heading, the "no image" label and the notification strip.
- Each image's alt text (the image Description), and a name and role shown over a story's image.
- The label of the first filter pill (blank shows "All") and the screen reader name of the section ("Section aria label").
- Technical fields (section ID, CSS and JS paths, the "Last updated" cache version) exist and are set at deploy. The section ID must be different on each instance on the page.

### What it does not do

- It does not pull the latest stories by itself. Stories are picked or typed; the order on the page is the order of the fields.
- It shows five stories at most and has no carousel or paging.
- The pill, category and filter label are never filled from the picked story. They are always typed. The name and role on the image are typed too, except on the featured story (Story 1 in the Featured layout), where a picked story fills them with its first author and that author's title and company.
- A picked story supplies: the title (the story's short tile title if it has one, else its headline), the image (its thumbnail), the link (the story's own address), the type (text, audio or video), the meta line (the first author's name, when the story has several), the date (its publish date; a story still dated 0000-00-00 shows no date) and the action label ("Read", "Listen" or "Watch" plus the story's read or watch time, for example "Read &#183; 5 min").
- Which wins is one setting for the section ("When a story is picked"). By default the picked story wins: the typed fields show when no story is picked, and fill in any piece the story does not have. Clear sample text from the typed fields once real stories are picked, so a sample author or date cannot appear on a story that has none. The other choice lets a typed field replace the story's.
- On the smaller cards a summary only shows when it is typed. The featured story also uses the picked story's summary.
- The filter pills only filter the stories in their own section.
- Share, filter pills and the swipe row's arrows and dots need the script. Without it the stories and their links still show, and the swipe row still swipes; the share buttons, pills, arrows and dots stay hidden.
- Filter pills are not available in the Featured layout.
- It does not remember the chosen filter pill. Reloading the page shows every story again.
- It does not shorten long titles or summaries.
- It does not open a story in a new tab. Only the X and LinkedIn share links open a new tab.
- The wording inside the share popup (Share, Copy link, X (Twitter), LinkedIn, Email, More apps, Link copied) is fixed and cannot be edited in TeamSite.

All stories are printed into the page by the skin, so they are present in the page source for search engines and other crawlers that do not run scripts.

### Limits

- Stories: 0 to 5 per instance. Only stories with a title count.
- Cards layout by number of stories: 1 = one wide card; 2 = two columns; 3 = three columns; 4 = four columns; 5 = three columns with the last two on a second row. Below 992px the columns become two, and below 600px one. The single wide card puts its image beside the text from 768px.
- Phones (below 600px), Cards layout with two or more stories: stacked by default. With the phone layout set to a swipe option the stories sit in one row that is swiped sideways, with previous and next arrows and one dot per story. "One story at a time" fills the width; "next story peeks in" shows part of the next story.
- Space above and below the section follows the background: white 40px (60px from 992px wide), light blue 40px (80px), dark navy 80px (100px). Side gutters are 23px at every width.
- Phones (below 600px): the filter pills are not shown and every story shows. The header button moves to under the stories.
- Featured layout by number of other stories: 0 = the featured story's text sits beside its image; 1 or 2 = cards beside the featured story; 3 or 4 = rows under the "Also selected" heading. Below 992px the other stories sit under the featured story, and the featured story's text sits under its image.
- Choices: 2 layouts, 3 backgrounds, 4 story types (None, Article, Podcast, Video), 1 skin.
- Filter pills are switched off in the stylesheet for now and do not show at any width, whatever the field says. When they are switched back on: Cards layout only, 600px and wider; they need at least two stories and at least one filter label. There is one pill per different label plus the "All" pill, so six at most. Labels must be typed exactly the same, capitals included, to share a pill.
- Share: one popup per section, with up to five options. "More apps" only shows on devices that have their own share sheet.
- Images: cropped to fill their frame. The frame shapes in the stylesheet are 356:187 for column cards, 16:9 for the single wide card, 660:363 for the featured story, 399:188 for cards beside the featured story and 4:3 for the "Also selected" rows.
- Text length: No enforced character limit on any field. The pill on the image stays on one line and is cut off with "..." if it is wider than the image, so keep it short.

### Empty and edge cases

- Every text field is optional. A blank eyebrow, heading, intro, pill, category, summary or meta line is simply not shown. If the eyebrow, heading, intro and header button are all blank, the header is left out.
- The header button needs both a label and a link. So does the notification strip button.
- A story with no title, typed or picked, is hidden completely. The stories that are left set the layout.
- No image, typed or picked: the story shows a navy block with the "no image" label. With that label blank it is a plain navy block.
- Type "None": no icon on the image, even when a picked story has a type of its own. The picked story's type still sets the action label (Read, Listen or Watch); with no picked story a blank action label reads "Read".
- Featured story with a picked story: the author's name moves onto the image, so the meta line under the summary shows only the date.
- No link, typed or picked: the action link is hidden. The share button still shows and shares the page the visitor is on. A link of "#" is treated the same way when sharing.
- A role typed without a name does not show.
- Notification strip: hidden when both of its text fields are blank.
- "Also selected" heading: only shows with three or four other stories, and is hidden when blank.
- Featured layout with no title on Story 1: there is no large story, and the other stories list one under another.
- No stories at all: the header and the notification strip show with nothing between them, and there is no share popup.
- Filter pills switched on without two stories and a filter label: no pills show.
- Copy link blocked by the browser: the popup shows "Copy failed".
- Component script missing: the stories and their links show; the share buttons, filter pills and the swipe row's arrows and dots stay hidden. The swipe row still swipes.
- All scripts off in the browser: the header, stories and notification strip are in the page source but stay invisible, because they fade in on scroll and that fade is started by the site's animation script (rbccm-animate). Visitors with reduced motion turned on see them without it.

### Accessibility

- Headings: section heading is an h2, each story title is an h3 in every layout. The eyebrow and the "Also selected" heading are plain text, not headings. The editor cannot change the levels.
- The section is named for screen readers by its heading, or by "Section aria label" when that is filled in.
- The stories are a list, except the featured story, which sits outside the list.
- Each action link names its story for screen readers: the action label, a colon, then the title ("Read: Global economic outlook"). On column cards the whole card is the click target for that one link.
- Each story's title is also a link to the story, so search engines see a link whose words say what the story is. It goes to the same place as the action link. It is left out of the keyboard tab order, so there is still one tab stop per story (the action link).
- Image alt text comes from the image Description. If that is blank the image is treated as decoration, including when the image comes from the picked story. The type icon is decoration and hidden from screen readers.
- Share button: labelled "Share: {title}", and tells screen readers that it opens a dialog and whether it is open.
- Share popup: a dialog named "Share: {title}". Focus moves to "Copy link" when it opens. Tab stays inside the popup. Escape or the close button closes it and returns focus to the share button; a click elsewhere closes it without moving focus. "Link copied" or "Copy failed" is announced.
- Filter pills: buttons in a group named "Filter: {section heading}". The chosen pill is marked as pressed and the result is announced ("Showing 2 of 5: Research").
- Swipe row on phones: the arrows and dots are buttons in a group named "Stories: {section heading}". Each dot is named "Story 2 of 4" and the showing one is marked as current. The arrows are named "Previous story" and "Next story" and switch off at each end. Every story stays in the page, so links in stories that are off screen can still be reached with the keyboard.
- The header button is printed twice, in the header and under the stories. Only one shows at any width, so it is read and reached once.
- Links, buttons and pills show a focus outline.
- Reduced motion: the fade-in on scroll, the hover animations and the popup's fade are all switched off.

### Open questions

- Sizes are measured from the page comp; the final spec has not arrived.
- No upload size is stated for story images, only the frame shapes above.
- The prefilled story links and the notification strip link are "#", and the images are placeholders. The real links and images are still to be supplied.
- Only the Macro views instance is prefilled in this folder. The layout, background and content of the other three instances are not recorded here.
- Which story fields the article picker returns in TeamSite has not been confirmed here. The skin expects a title, description, thumbnail and link (or url).
- The 2027 Outlook page has no address yet, so the live URL is not recorded.
- Whether the page template gives visitors without scripts a way to see the section (see "All scripts off" above).

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-insight-cards.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-insight-cards.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-insight-cards.css` and `/assets/rbccm/js/components/rbccm-insight-cards.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-insight-cards--outlook-2027.xsl` | TeamSite skin for the 2027 Outlook page. |
| `rbccm-insight-cards-properties.xml` | Properties + Data fields (prefilled with the Macro views content). |
| `rbccm-insight-cards.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-insight-cards.css`. |
| `rbccm-insight-cards.js` | Share popup, filter pills, and the arrows and dots of the phone swipe row. Ships to `/assets/rbccm/js/components/rbccm-insight-cards.js`. |
| `rbccm-insight-cards.html` | Local preview, rendered from the skin: one variant per layout. |

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

Below 992px the columns become two, and below 600px one. On phones the `MobileLayout` field can turn the one column into a row to swipe through; see "Limits".

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
- **Name and role** can be placed over the image (the featured story's speaker). On the featured story a picked story fills them from its first author: the name, then "title, company" (the company is left off when the title already includes it).

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

The pills are switched off for now: the row is hidden by one rule in `rbccm-insight-cards.css` (`display: none` on the filter row; set it back to `flex` to restore them). What follows describes them when on.

With `ShowFilters` set to Yes (Cards layout), a row of pills appears above the stories: "All", then one pill for each different filter label used on the stories (for example Research, Conferences, Events, Webinars). Choosing a pill shows only the stories with that label. The pills need at least two stories and at least one filter label.

---

## Notification strip

An optional blue strip under the stories with a small heading, a line of text and a yellow button (for example "Never miss an Outlook episode" / "Get notified"). Leave its text fields blank to hide it.

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
| `ShowFilters` | No (default) or Yes. Cards layout only. Not shown on phones. Switched off in the stylesheet for now. |
| `StoryPriority` | When a story is picked: the picked story wins (default; typed fields show when no story is picked or fill what the story lacks), or the typed fields win. |
| `MobileLayout` | On phones, Cards layout with two or more stories: Stacked (default), Swipe - one story at a time, or Swipe - next story peeks in. |
| `Eyebrow` | Small label above the heading. Blank hides it. |
| `SectionHeading` | Blank hides it. |
| `SectionIntro` | Intro paragraph. Blank hides it. |
| `HeaderButtonLabel`, `HeaderButtonLink` | Button on the right of the header, e.g. Explore all insights. Needs both. |
| `FilterAllLabel` | Label of the first filter pill. Blank shows "All". |
| `SideHeading` | Featured layout: heading above the rows. Default "Also selected". Blank hides it. |
| `NoImageLabel` | Label on a story with no image. Blank shows a plain navy block. |
| `Item1Story` to `Item5Story` | Article picker. Fills the title, image and link from the picked story. Story 1 is the featured story in the Featured layout. |
| `Item{N}Badge` | Pill on the image, e.g. RBC Economics. Blank hides it. |
| `Item{N}Type` | From the picked story, None, Article, Podcast or Video. "From the picked story" reads the story's own type (text, audio or video). |
| `Item{N}Category` | Category label, e.g. Macro &amp; rates. |
| `Item{N}Title` | Blank uses the picked story's title. A story with no title (typed or picked) is hidden. |
| `Item{N}Summary` | Optional. |
| `Item{N}Meta` | Meta line, e.g. the author: Frances Donald. |
| `Item{N}Date` | Date published, typed as YYYY-MM-DD (e.g. 2026-10-09). Shows after the meta line as "Oct 9, 2026" and is marked up as a date so search engines can read it. Blank uses the picked story's publish date. No date, or anything not in that form, shows no date. |
| `Item{N}Image` | DAM image. Blank uses the picked story's thumbnail. The image Description is the alt text; blank makes it decorative. |
| `Item{N}Link` | Blank uses the picked story's link. No link hides the action link. The share popup shares the same address. |
| `Item{N}ActionLabel` | e.g. Read &#183; 5 min read. Blank shows Read, Listen or Watch by type, plus the picked story's read or watch time. |
| `Item{N}Filter` | Filter label used by the filter pills, e.g. Research. |
| `Item{N}SpeakerName`, `Item{N}SpeakerRole` | Optional name and role shown over the image. On the featured story a picked story fills them from its first author (`author_name_new`, `author_title_new`, `author_company_new`). |
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
