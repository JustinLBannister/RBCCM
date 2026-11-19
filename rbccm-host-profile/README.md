# Host Profile

One person presented as a host: section heading, photo, name, role, up to three bio paragraphs, a LinkedIn link and up to six media appearances. Built for the ETF Innovators "Meet the host" section.

---

## For editors and BAs

### Purpose

Introduces one person as the host of a series: a photo, name, role, short bio, a LinkedIn link and a short list of their recent media appearances. It is used on the ETF Innovators page (in progress, not live yet).

- Variant `etf-innovators`: the only skin. Light blue section, photo beside the text on tablet and desktop, stacked on phones.

### What the editor can change

- The section heading ("Section heading") and the screen reader name of the section ("Section aria label").
- The photo ("Photo", picked from the DAM) and its alt text (the image Description).
- The name, the role line under it, and up to three bio paragraphs. Bold, italic and links typed into a bio paragraph are kept.
- The LinkedIn link ("LinkedIn profile URL") and its screen reader label.
- The heading above the media appearances ("Media appearances heading").
- Where the media appearances come from:
  - Live feed: type the person's name in "Media feed : name to match in the In the Media titles" (`MediaFeedMatch`). The page then shows the newest In the Media items whose title contains that name. "Media feed : how many appearances to show" sets the number (default 4).
  - Typed: up to six appearances ("Appearance 1" to "Appearance 6"), each with an outlet, date, source, topic, link and button label. These are the fallback when the feed is on, and the only source when the name-to-match field is blank.
- Technical fields (section ID, CSS and JS paths, the feed URL template, the "Last updated" cache version) exist and are set at deploy.

### What it does not do

- It shows one person only. A second host needs a second instance.
- It does not mix feed and typed appearances. As soon as the feed returns at least one match, every typed appearance is replaced, even if the feed has fewer matches than the number asked for.
- It does not show the topic. The topic is typed (or read from the feed) and is in the page, but the stylesheet hides it for now.
- It cannot match on an author or person field. The feed has none, so the match is on the words in the item's title.
- It does not look further back than three years of the feed (this year and the two before).
- It does not reformat typed dates. A typed date shows exactly as typed; feed dates always show as month and year ("Nov 2026").
- The editor cannot choose the button label for feed items. It is set from the source in the title: Watch for TV or video, Listen for radio, podcast or audio, otherwise Read.
- It does not show a "see all" link or page through older appearances.

### Limits

- People: exactly one per instance.
- Bio: 0 to 3 paragraphs.
- Typed appearances: 0 to 6. Feed appearances: the number in "how many appearances to show" (default 4). The script sets no upper limit on that number.
- Appearance cards: one per row on phones, two per row from 768px. On tablet (768 to 1199px) the cards sit in their own row under the photo and text; from 1200px they sit in the right-hand column.
- Photo: shown as a square, cropped to fill (full width on phones, a fixed 379 x 379 from 768px). The field label suggests an image of about 760 x 734.
- Text length: No enforced character limit on any field.
- Variants: 1.

### Empty and edge cases

- Every text field is optional. A blank section heading, name, role, bio paragraph, LinkedIn URL or media heading is simply not shown. A blank photo leaves the text on its own.
- A typed appearance with no outlet is hidden. With no link it shows without a button. With no button label the button reads "Watch". A blank date or source is left out of the second line.
- Feed off and no typed appearances: the whole media appearances block, heading included, is not shown.
- Feed on and no typed appearances: the block stays hidden until the feed returns a match, and stays hidden if it never does.
- Feed on with typed appearances: the typed ones show first and are swapped for the feed items once the feed has loaded.
- Feed has no match, cannot be read, or the browser is too old for the script: the typed appearances stay.
- A feed item is only used if it has a link and a date written like "November 3, 2026". Items that share the same link are shown once.
- A feed title that does not follow the "Source: Name on Outlet" pattern still shows: the outlet is whatever follows the last " on ", or failing that the rest of the title after the colon.
- Component script missing: the typed appearances show, as above.
- All scripts off in the browser: the heading, photo and text are in the page source but stay invisible, because they fade in on scroll and that fade is started by the site's animation script (rbccm-animate). Visitors with reduced motion turned on see them without it.

### Accessibility

- Headings: section heading is an h2, the name is an h3, the media appearances heading is an h4. The editor cannot change the levels.
- The section is named for screen readers by its heading, or by "Section aria label" when that is filled in.
- Photo alt text comes from the image Description. If that is blank, the name is used.
- The LinkedIn link is an icon with a screen reader label: "LinkedIn screen reader label" if typed, otherwise "{Name} on LinkedIn", followed by "(opens in a new tab)".
- Each appearance button names the outlet and date, for example "Watch: CNBC, Oct 2026 (opens in a new tab)".
- The appearances are a list, so screen readers announce how many there are.
- Everything is a normal link, so the keyboard order is the reading order. The LinkedIn icon and the buttons show a focus outline.
- Reduced motion: the fade-in on scroll and the hover transitions are switched off and the content shows straight away.
- The swap from typed appearances to feed appearances is not announced to screen readers.

### Open questions

- Topic: the stylesheet hides it "for now", pending a decision. Will it be shown, and if so with what wording for feed items (the feed supplies a full sentence)?
- Photo size: the field label says about 760 x 734, but the photo is always cropped to a square. Which size should the real headshot be supplied at?
- The prefilled LinkedIn URL, appearance links ("#") and headshot are placeholders. The real values are still to be supplied.
- The ETF Innovators page has no address yet, so the live URL is not recorded.
- Whether the page template gives visitors without scripts a way to see the section (see "All scripts off" above).

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-host-profile.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-host-profile.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-host-profile.css` and `/assets/rbccm/js/components/rbccm-host-profile.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-host-profile--etf-innovators.xsl` | TeamSite skin for the ETF Innovators variant. |
| `rbccm-host-profile-properties.xml` | Properties + Data fields (prefilled with the ETF Innovators content). |
| `rbccm-host-profile.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-host-profile.css`. |
| `rbccm-host-profile.js` | Fills the media appearances from the In the Media feed. Ships to `/assets/rbccm/js/components/rbccm-host-profile.js`. |
| `rbccm-host-profile.html` | Local preview, rendered from the skin. |

---

## Variants (one skin each)

**`etf-innovators`**: Light blue section (`#F1F5FB`), photo left and content right (stacked on mobile), 32px apart. Photo is square and full width on mobile (up to 767px). From 768px the photo sits beside the content as a fixed 379 x 379 square that never shrinks; 20px radius. The content column has two groups 32px apart: the summary (name + role 10px apart, then the bio and the LinkedIn icon, 16px apart) and the media appearances (heading, then cards 12px apart: one column on mobile, two from 768px). On tablet (768 to 1199px) the media appearances sit on their own row under the photo and text, across the whole section; from 1200px they go back into the right-hand column. Desktop (992px and up) puts 24px between the summary items, a 45px LinkedIn icon, and 42px / 36px heading and name at 125% line height. Cards have a 14px radius. Every element carries the `--etf-innovators` modifier. Mobile and desktop follow the Figma specs; the desktop frame's 1100 content width (170px side padding) is replaced by the global 1140 width and 23px gutter.

---

## Layout

```
Meet the host                                  (h2)
[photo]   Valerie Grimba                       (h3)
          Director, Global ETF Strategy, ...   (role)
          Bio paragraph 1
          Bio paragraph 2
          [in]                                 (LinkedIn, new tab)
          LATEST MEDIA APPEARANCES             (h4)
          [Bloomberg       Watch] [CNBC          Watch]
          [Aug 2026 . ETF flows ] [Jun 2026 . ...     ]
```

Each appearance card shows the outlet, then the date and source (e.g. "Nov 2026 . RBC TV"), and an outlined button (Watch / Read / Listen) that opens the link in a new tab. The button's screen reader label names the outlet and date ("Watch: CNBC, Oct 2026 (opens in a new tab)").

**Topic is hidden for now.** It is still in the markup (a `__appearance-topic` span after the source). To show it, delete the rule marked "TOPIC HIDDEN FOR NOW" in the CSS; the dot before it comes back on its own. From the feed, the topic is the item's full description sentence.

### Media appearances from the In the Media feed

With `MediaFeedMatch` set, `rbccm-host-profile.js` reads the In the Media feed (this year first, then up to two earlier years until it has enough) and shows the newest items whose title contains the match, e.g. "RBC TV: Valerie Grimba on BNN Bloomberg". From each item:

| Card | From the feed item |
|---|---|
| Outlet | Title after " on " (BNN Bloomberg) |
| Date | `<date>` as Mon YYYY (Nov 2026) |
| Source | Title before ":" (RBC TV) |
| Topic (hidden) | `<description>` |
| Button | RBC TV: Watch; RBC Radio or podcast: Listen; otherwise Read |
| Link | `<link>`, new tab |

The typed appearances are the fallback. The feed has no author field, so the match is on the title text; every Valerie item so far follows the "RBC TV/Radio: Valerie Grimba on Outlet" pattern. The local preview points the feed at `_local-data/{year}.xml` because the browser can't read rbccm.com's feed from localhost.

---

## Fields

| Field | Notes |
|---|---|
| `SectionID` | Section id; the heading gets `<id>-heading`. |
| `SectionAriaLabel` | Optional. Blank uses the section heading. |
| `CssPath`, `JsPath`, `CacheVersion` | Stylesheet and script paths; bump `CacheVersion` after each upload. The script only loads when the media feed is on. |
| `SectionHeading` | "Meet the host". Blank hides it. |
| `Photo` | DAM image (about 760 x 734). Its Description is the alt text; blank uses the name. |
| `Name`, `Role` | Name (h3) and the blue role line. |
| `Bio1`, `Bio2`, `Bio3` | Bio paragraphs. Inline HTML (bold, italic, links) is kept. Blank ones are skipped. |
| `LinkedInUrl` | Blank hides the icon. |
| `LinkedInLabel` | Screen reader label. Blank uses "Name on LinkedIn". |
| `MediaHeading` | "Latest media appearances". Blank hides it. |
| `MediaFeedMatch` | Name to look for in the In the Media titles, e.g. Valerie Grimba. Blank turns the feed off (typed appearances only). |
| `MediaFeedUrlTemplate` | Per-year In the Media feed, `/en/about-us/data/{year}?qPagesize=500`. |
| `MediaFeedCount` | How many appearances to show from the feed (default 4). |
| `Media1` to `Media6` `Outlet`, `Date`, `Source`, `Topic`, `Url`, `Action` | Typed appearances. They show until the feed loads, and stay if the feed has no matches or can't be read. Blank outlet hides the card; blank URL hides the button; blank action shows "Watch". |

---

## Deploy checklist

1. Upload `rbccm-host-profile.css` to `/assets/rbccm/css/components/` and `rbccm-host-profile.js` to `/assets/rbccm/js/components/`.
2. Upload the real headshot to the DAM and pick it in the Photo field.
3. Register `rbccm-host-profile--etf-innovators.xsl` in TeamSite with `rbccm-host-profile-properties.xml`.
4. Fill in the real LinkedIn and media appearance links.
5. Bump `CacheVersion`.
