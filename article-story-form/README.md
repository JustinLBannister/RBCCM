# Article / Story form: field guide

A plain-language guide to the TeamSite form used to create Insights articles and stories on rbccm.com (articles, podcast episodes and videos). It lists every field in the order it appears in the form, what it does on the page, and which ones to leave alone.

Stories live in TeamSite under `templatedata/article/story/data/` and publish to `https://www.rbccm.com/en/insights/YYYY/MM/headline-slug`.

---

## At a glance: everything an article can include

| Area | What's available |
|---|---|
| **Headline area** | Headline, summary, eyebrow label above the headline, publish date, breadcrumb trail, author byline |
| **Banner** | Banner image, or a Brightcove video, or a Captivate podcast player; a custom title above the play button; running time; "Listen on" links (Apple, Spotify, Google) |
| **Navigation** | Optional series menu bar (preset for Biopharma, Healthcare, Strategic Alternatives, Real-Time Geopolitics, Partner of Choice, or up to 4 custom links) |
| **Body** | Rich-text article content, or a link to an external page instead; key takeaways box (3 to 5 points); up to 4 extra podcast players inside the body; footnotes with a custom heading; transcript link |
| **Right side** | Authors ("Our experts"), featured guests, a callout/promo box, up to 3 related stories |
| **People** | Up to 4 authors from the author library (name, title, company, photo, email, LinkedIn, Twitter, bio); up to 6 featured guests with the same details |
| **Tiles and listings** | Tile image, summary, story type icon (text, video or podcast), read/listen time, Play episode button for podcasts, transcript link option |
| **Where it shows** | 26 listing locations, from Insights and the podcast pages to AI, Geopolitics, Energy Transition and more (section 12) |
| **Search and sharing** | SEO description, SEO keywords, tags, canonical URL |
| **Settings** | Article type (Insights or Related Content), language (English), region (Global) |

---

## Quick start: the minimum for a new story

| Field | What to enter |
|---|---|
| Publish Date | The date the story goes live, as `YYYY-MM-DD` |
| Headline Title | Under 70 characters |
| Summary | About 120 characters (140 max), plain text |
| Tile/Thumbnail Image | 1200 x 628 `.webp`, under 300 KB |
| Banner Image | 1920 x 475 `.webp`, under 300 KB |
| Breadcrumb Link | Pick the section the story belongs to |
| Story Type | Text, Video or Podcast |
| Content | The article body (or an External URL instead) |
| Author(s) | Pick from the existing author list |
| Location to Feature | The pages the story should appear on (only when ready to go live) |
| SEO Description | From the business, or reuse the Summary |

Everything else is optional, filled in automatically, or "only if requested".

---

## Filled in automatically when you save

You don't need to type these. Leave them blank and save, then check the result.

| Field | How it is filled |
|---|---|
| Publish Date | Today's date, if left empty when the form opens |
| Subcategory Tiles | "Insights" |
| Preview Breadcrumb Text | Built from the breadcrumb you picked, e.g. `Home \| Insights \| Podcasts \| Macro Minutes` |
| Preview Author Display Text | Built from the authors, e.g. "**Jane Doe** and **John Smith**", or "**A**, **B** & **C**" for three or more |
| Time to read | For Text Only stories: word count divided by 250, e.g. "6 min" |
| Canonical URL | Filled with an internal address; the live page always uses its clean public address |
| SEO Keywords | Copied from the breadcrumb if left empty (replace with real keywords) |
| Tags | Copied from the breadcrumb if left empty |
| Page address (file name) | Year and month from the Publish Date plus the headline, e.g. `2026/10/canadian-equity-compass`. Set when the story is first saved. |

---

## 1. Basics

| Field | Required | What it does |
|---|---|---|
| **Type of Article** | Yes | **Insights Article** (default) for a normal story. **Related Content Article/Link** saves it to the related-content folder instead of a dated folder. |
| **Publish Date** | Yes | Format `YYYY-MM-DD`. Shown on the story and its tiles, and used to sort stories newest first. The form's own note: save with today's date, then change to `0000-00-00` before publishing for preview. |
| **Headline Title** | Yes | The story's title. Keep it under 70 characters for search results (the box allows 100). Dollar signs are handled automatically. |
| **Summary** | Recommended | Short description shown under the title and on tiles. About 120 characters, 140 max. No HTML and no line breaks. |
| **Above Title Eyebrow** | Only if requested | Small label above the headline. |
| **Subcategory Tiles** | No | Label used on tiles. Defaults to "Insights"; leave it unless asked. |

---

## 2. Navigation and breadcrumbs

### Secondary Navigation (only if requested)
A menu bar for campaign or series pages. Default is **No Navigation**.

Options: No Navigation, Customize Navigation, Biopharma, Healthcare, Strategic Alternatives, Real-Time Geopolitics, Partner of Choice.

**Customize Secondary Navigation:** with "Customize Navigation" selected, add up to 4 menu items, each with a Menu Name and a Menu Link.

### Breadcrumb Link (defaults to Insights)
The trail at the top of the page (Home > Insights > ...). Pick the section the story belongs to. The breadcrumb you pick is also used to auto-fill the Tags and SEO Keywords if those are blank.

| Option | Breadcrumb shown |
|---|---|
| Insights | Home > Insights |
| Artificial Intelligence | Home > Insights > Artificial Intelligence |
| European Insights | Home > Insights > European Insights |
| Geopolitics | Home > Insights > Geopolitics |
| Imagine | Home > Insights > RBC Imagine |
| Trade and Tariffs | Home > Insights > Trade and Tariffs |
| Outlook | Home > Insights > Outlook |
| Outlook - AI | Home > Insights > Artificial Intelligence > Outlook |
| Outlook - Geopolitics | Home > Insights > Geopolitics > Outlook |
| Outlook - Markets in Motion | Home > Insights > Podcasts > Markets in Motion > Outlook |
| Outlook - Pathfinders in Biopharma | Home > Insights > Podcasts > Pathfinders in Biopharma > Outlook |
| Outlook - Strategic Alternatives | Home > Insights > Podcasts > Strategic Alternatives > Outlook |
| Podcasts | Home > Insights > Podcasts |
| Macro Minutes | Home > Insights > Podcasts > Macro Minutes |
| Markets in Motion | Home > Insights > Podcasts > Markets in Motion |
| Pathfinders in Biopharma | Home > Insights > Podcasts > Pathfinders in Biopharma |
| Powering Sustainable Ideas | Home > Insights > Podcasts > Powering Sustainable Ideas |
| Strategic Alternatives | Home > Insights > Podcasts > Strategic Alternatives |
| Expertise | Home > Expertise |
| Cash Management - RBC Clear | Home > Expertise > Cash Management - RBC Clear |
| Corporate Banking | Home > Expertise > Corporate Banking |
| Energy Transition | Home > Expertise > Energy Transition |
| Global Investment Banking | Home > Expertise > Global Investment Banking |
| Global Markets | Home > Expertise > Global Markets |
| Research | Home > Expertise > Research |
| RBC Elements | Home > Expertise > RBC Elements |
| Sustainable Finance | Home > Expertise > Sustainable Finance |
| Transactions | Home > Expertise > Transactions |
| US Municipal Finance | Home > Expertise > US Municipal Finance |
| Australia | Home > Australia |
| Campus Recruiting | Home > Careers > Campus Recruiting |
| Our Impact | Home > Our Impact |

### Manual breadcrumb (only if requested)
For a trail that isn't in the list. Entered as HTML by the web team. If filled in, it overrides the dropdown.

**Which breadcrumb wins:** Manual breadcrumb, then the Breadcrumb Link dropdown, then the site map, then "Home > Insights" if nothing is set.

---

## 3. Images

| Field | Required | Spec |
|---|---|---|
| **Tile/Thumbnail Image** | Yes | The image on story tiles and Insights listings. 1200 x 628 px, `.webp`, under 300 KB. Pick from `/assets/`. |
| **Banner Image** | Yes | The wide image at the top of the story. 1920 x 475 px, `.webp`, under 300 KB. |

---

## 4. Video and podcast

| Field | What it does |
|---|---|
| **Video Link from Brightcove** | The video shown in the banner. For RBCCM videos use the Brightcove player link starting `//players.brightcove.net` (no `https:`), from the RBCCM Brightcove account. For an outside video, use the full `https://` link. |
| **Audio/Podcast Link from Captivate** | The full Captivate player link for the episode, e.g. `https://player.captivate.fm/episode/...`. This is what plays when someone presses Play on the story's tile. If both a video and a podcast are filled in, the video shows in the banner. |
| **CUSTOM Banner Video/Podcast Title** | Optional title shown above the video/listen button in the banner. |
| **Show Banner Video/Podcast Title AFTER Article Title** | Yes puts that title after the headline and before the summary. Default No. |
| **Banner Audio links** | The "Listen on" links (Apple, Spotify, etc.) in the banner. Pick the show to use its standard links: Biopharma, Industries in Motion, Markets in Motion, Strategic Alternatives, Powering Sustainable Ideas, Macro Minutes. Or No Links (default) or Custom Links. |
| **CUSTOM Banner Audio Links** | Apple, Spotify and Google links. These override the show's standard links. |
| **CUSTOM Podcast Player within Content** | Up to 4 extra Captivate players placed inside the article body. Ask the web team how to position them. |
| **Podcast or Video Transcript Link** | Link to the transcript page (shortened URL). |
| **Display Transcript Link at Bottom** | Show (default) or Hide. Hide only if the player is in the Content section and the link would appear twice. |
| **Podcast Tile Transcript Link** | What the podcast's tile shows: "X min" (default) or a Transcript link. |
| **Time to Watch or Listen in Banner** | Running time, e.g. "23 min". |

---

## 5. Story content

| Field | What it does |
|---|---|
| **Content** or **External URL** | Choose one. **Content** is the article body, written in the rich-text editor. **External URL** sends the story's tile to another page instead of a story page. |
| **Keypoints** | The key takeaways box. Three to five points, each ending with a period, up to 215 characters each. |
| **CUSTOM Footnotes heading** | Defaults to "+ Footnotes". |
| **Footnotes** | Footnotes below the article, as a bulleted list. |

---

## 6. Story type and timing

| Field | What it does |
|---|---|
| **Story Type** | **Text Only** (default), **Video/Watch** or **Podcast/Audio/Listen**. Controls the icon shown with the time on tiles. Podcast stories also get the Play episode button on their tiles. |
| **Time to read** | "X min", whole number rounded down. For Text Only stories, leave blank and it fills in on save. For video and podcast stories, enter it yourself. |

---

## 7. Language and region

| Field | What to do |
|---|---|
| **Language** | Always English. Leave as is. |
| **Region** | Always Global only. Leave as is. (The form also lists Australia, Belgium, Canada, China / Hong Kong, France, Germany, Italy, Ireland, Luxembourg, Malaysia, Singapore, Switzerland, UAE and UK.) |

---

## 8. Authors

| Field | What it does |
|---|---|
| **CUSTOM Heading: right side Authors** | Defaults to "Our experts". |
| **Show Authors on right side or Content section bottom** | Must always be **Show Right Side** (default). Other options: Hide Both, Show Bottom, Show Both. |
| **Author(s)** | Add up to four authors. For each, use **Select Existing Author** to pick from the author library; this fills in their name, title, company, photo, email, LinkedIn, Twitter and bio. Edit any of these if needed. |
| **Show company name in the Byline** | Yes adds the author's company after their name in the top byline. Default No. |
| **Preview Author Display Text** | The top byline, built on save. Read-only. |
| **Preview Featuring Display Text** | Optional free text. |
| **Update Manually - Top Author Byline** | Two lines to override the automatic byline. The 1st line replaces the author names; the 2nd line adds a second line. Use only if the automatic byline isn't right. |

If an author isn't in the library, ask the web team to add them so they can be reused.

---

## 9. Featured guests (podcasts and interviews)

| Field | What it does |
|---|---|
| **CUSTOM Heading: Featured guests** | Defaults to "Featured guest". |
| **Show Guests on the side or at bottom** | Should be **Show Right Side** (default), with few exceptions. |
| **Featured Guest** | Up to 6 guests. Each has Name, Photo, Title, Email, LinkedIn, Twitter and Bio. |

---

## 10. Callout box (right side)

A promo box on the right, usually for a series. Markets in Motion stories get one automatically; leave these empty unless you want to override it.

| Field | What it does |
|---|---|
| Callout Box Main Title | Box heading |
| Callout Box Summary | Optional short text |
| Callout Box Background image | Image from `/assets/` |
| Callout Box Tile Link | Where the box links to |
| Callout Box Link Text | Button text. Defaults to "Download" |
| Callout Box Eyebrow | Small label above the title |

---

## 11. Related content

| Field | What it does |
|---|---|
| **Show First Related Content image?** | Yes (default) shows a thumbnail on the first related story. No hides it. |
| **Related Content story path (Right Side)** | Up to 3 related stories, picked from the story library. Shown on the right. |
| **Related Content story path (Bottom)** | Do not use. |

---

## 12. Where the story appears: Location to Feature

Tick each page the story should be listed on. Listing pages and story tiles (for example the podcast pages) pull stories by these ticks, newest Publish Date first.

**Only tick these when the story is ready to go live, and check those pages after it publishes.** Ticking a location on an unfinished story puts it on the live page.

| Option | Option | Option |
|---|---|---|
| Insights | Energy Transition | Mining Metals |
| AI | ESG Stratify | Our Impact |
| Australia | European Insights | Partner of Choice |
| Beyond the Ballot | GIB Hub | Powering Sustainable Ideas |
| Biopharma | Geopolitics | RBC Clear |
| Commercial Fx | Geopolitics Insights | Strategic Alternatives |
| Diversity & Inclusion | Imagine | Sustainable Finance Solutions |
| Conference Insights | Macro Minutes | Tech & Innovation |
| | Markets in Motion | Technology |

"Geopolitics" and "Geopolitics Insights" are separate options that feed different pages. Check with the web team which one you need.

---

## 13. Search (SEO) and tags

| Field | What to enter |
|---|---|
| **SEO Description** | Provided by the business, 160 characters max. If there isn't one, reuse the Summary. Shown in search results. |
| **SEO Keywords** | Six to nine keywords, separated by commas. If left blank it copies the breadcrumb (e.g. "Home, Insights, Podcasts"), so add real keywords after saving. |
| **Tags** | Required. If left blank it copies the breadcrumb. Replace or add to them after saving if needed. |
| **Canonical URL** | Leave empty. |

---

## Fields to leave alone

| Field | Why |
|---|---|
| Business Line | Labelled "LEAVE EMPTY". |
| Content Theme / Series | Labelled "LEAVE EMPTY". |
| Language | Always English. |
| Region | Always Global. |
| Canonical URL | Fills in automatically. |
| Related Content story path (Bottom) | Labelled "DO NOT USE". |
| Preview Breadcrumb Text, Preview Author Display Text | Read-only; built on save. |
