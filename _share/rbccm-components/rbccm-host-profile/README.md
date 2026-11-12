# Host Profile

One person presented as a host: section heading, photo, name, role, up to three bio paragraphs, a LinkedIn link and up to six media appearances. Built for the ETF Innovators "Meet the host" section.

---

## Files

| File | What it is |
|---|---|
| `rbccm-host-profile--etf-innovators.xsl` | TeamSite skin for the ETF Innovators variant. |
| `rbccm-host-profile-properties.xml` | Properties + Data fields (prefilled with the ETF Innovators content). |
| `rbccm-host-profile.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-host-profile.css`. |
| `rbccm-host-profile.js` | Fills the media appearances from the In the Media feed. Ships to `/assets/rbccm/js/components/rbccm-host-profile.js`. |
| `_local-data/2025.xml`, `2026.xml` | Trimmed local copies of the In the Media feed, so the preview works from localhost. Not for deploy. |
| `rbccm-host-profile.html` | Local preview, rendered from the skin. |
| `photos/valerie-grimba-fpo.webp` | Placeholder headshot cropped from the page comp. Replace with the real photo. |

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
