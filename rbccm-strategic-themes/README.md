# Strategic Themes

An eyebrow and heading, then up to five themes. Each theme shows its number, a title, a description, a button and an animated graphic. Built for the "Strategic themes" section of the 2027 Outlook page.

One theme shows at a time and numbered tabs switch it, while the page scrolls past as normal. An optional pinned scroll can be turned on instead: the section then pins to the screen and scrolling steps through the themes one at a time.

Each theme can be picked from TeamSite's article picker, so the title, description and link come from the story itself. Typed fields override the picked story.

---

## For editors and BAs

### Purpose

Presents a short set of themes one at a time, each with its number, a title, a description, a button to the story and an animated graphic. It is used on the 2027 Outlook page as the "Strategic themes" section. The "01 / 05" number above each title can be hidden with the Hide count setting, and the picture can link to the theme's story (Picture style).

- Variant `outlook-2027`: the only skin.
- Tabs mode (the default): numbered tabs switch the theme and the page scrolls as normal.
- Pinned scroll mode (only when the Pinned scroll field is `yes`): when the window is at least 600px tall, the section sticks to the screen and scrolling steps through the themes. From 992px wide the text and picture sit side by side. Below that the heading scrolls away first, then the tabs, text and picture stay in view, stacked.
- With pinned scroll on, tabs mode is still used in short windows, on a narrow screen with no room left for the picture, for visitors with reduced motion turned on, and wherever pinning cannot work, numbered tabs switch the theme.

### What the editor can change

- The eyebrow and heading.
- Three to five themes: pick the story, or type the title, description and link; set a short title for the tab.
- Each theme's graphic, the words on it, or an image in its place.
- The button label, for all themes or for one.
- The alt text of a theme's image (the image Description).
- The screen reader name of the section ("Section aria label") and of the row of numbered tabs.
- Technical fields (section ID, CSS and JS paths, the "Last updated" cache version, the fixed site header height) exist and are set at deploy.

### What it does not do

- It does not advance on a timer. The visitor moves through the themes by scrolling, with the numbered tabs, or with the previous and next buttons beside each theme's button.
- Each drawn graphic plays through once when its theme shows, then rests; it plays again each time the visitor comes back to that theme. With the Loop animation setting on, the graphics keep repeating instead. The first graphic waits until the section scrolls into view. Pause only stops that movement part-way (the radar sweep, the tile highlights and so on), and starts it again. It does not change the scroll or the layout, and the visitor cannot turn the pinned scroll off. A pause lasts for the theme it was pressed on: moving to another theme, by scrolling, a tab or the previous and next buttons, starts the movement again.
- The ring round the pause button shows how far the showing graphic is through its one play. It holds while paused, stays full once the graphic has finished, and starts again with each theme. When the graphic has finished, the button turns to play and pressing it plays the graphic again. It is decoration and is not read out.
- The pause button shows only on themes with a drawn graphic. It shows with reduced motion turned on too, because the graphics play by default there as well.
- It shows five themes at most.
- The graphics are fixed designs. Their shapes, colours and the element tiles can't be edited in TeamSite; only the words on them can.
- A new kind of graphic needs a developer. An image can be used in the meantime.
- The pinned scroll is not used in windows shorter than 600px.
- The editor chooses whether pinned scroll is allowed (the Pinned scroll field, off by default). When it is allowed, the script still falls back to tabs from the visitor's screen and settings.
- It does not show a graphic and an image together. When a theme has an image, the image is used and the graphic choice is ignored.
- It does not use the picked story's image unless Picture style is set to Article. Otherwise a theme's image is always picked in the theme's own image field.
- It does not open the story in a new tab.
- It has no address for a single theme. A link to the page cannot open it on, say, theme 3.

All theme text and links are printed into the page by the skin, so they are present in the page source for search engines and other crawlers that do not run scripts.

### Limits

- Themes: 1 to 5 will show. The fields ask for three to five. Only themes with a title count, and they are numbered in field order (01, 02 and so on).
- Two or more themes: the numbered tabs show. With pinned scroll turned on, it is used where the window allows. In pinned scroll the section is one screen tall for each theme, so five themes make it five screens tall.
- One theme: it shows on its own with no tabs and no pinned scroll.
- Graphics: 5 fixed designs (Defense, Minerals, AI, Energy, Canada) or None, one per theme.
- Words on a graphic (guidance from this README and the field label, not enforced): up to three words for Minerals and Energy, up to four for Canada; four labels work best for AI; Defense shows none. Energy can also take a chart title before a colon.
- Image in place of a graphic: shown as a square, cropped to fill. Square works best. No pixel size is stated.
- Tabs: each tab shows its bar, number and short title at every width. On phones five tabs share the width, so a long word in a short title breaks across lines; keep short titles to one or two short words.
- Tabs mode layout: text above the picture on phones, side by side from 768px. Pinned scroll below 992px: text above the picture, and the picture takes the height that is left (460px wide at most).
- Text length: No enforced character limit. In pinned scroll the section is exactly one screen tall and anything that does not fit is cut off, so keep the heading, titles and descriptions short. On a phone the picture shrinks as the text grows; if less than 140px is left for it, the tabs version is used.
- Variants: 1.

### Empty and edge cases

- A blank eyebrow or heading is simply not shown.
- A theme with no title, typed or picked, is hidden and the rest renumber.
- No description, typed or picked: the theme shows without one.
- No link, typed or picked: the theme shows without a button.
- Blank button label on a theme: the label for every theme is used. If that is blank too, the button reads "Watch the episode".
- Blank short title: the tab uses the theme's title.
- Graphic "None" and no image: the theme shows text only.
- A graphic with no words typed: it is drawn without words. The AI graphic then shows four unlabelled points on its chain.
- Energy words typed without a colon: there is no chart title and all the words go under the chart.
- No themes at all: only the eyebrow and heading show.
- The page template clips or scrolls the section: the tabs version is used instead of pinned scroll, at every width. The site wrapper (`#ls-canvas`) does this by default, so the stylesheet switches it to clipping sideways overflow on any page that has this section, which lets the pinned scroll run.
- The window is resized or reduced motion is switched on: the mode is chosen again.
- Blank "Fixed site header height": the script measures the header from the page.
- No script: every theme shows in a plain numbered list with its number, title, description and button. Images show; the drawn graphics and the tabs do not.

### Accessibility

- Headings: section heading is an h2, each theme title is an h3. The editor cannot change the levels.
- The section is named for screen readers by its heading, or by "Section aria label" when that is filled in.
- The themes are a numbered list. The visible "01 / 05" counter is hidden from screen readers because the list already gives the position.
- The numbered tabs are buttons in a group named "Themes" (or the name typed in the tabs field). The showing one is marked as current.
- Keyboard: Tab reaches each numbered tab; Enter or Space shows that theme; Left and Right arrows move to the next tab and show its theme. Focus stays on the tabs; it is not moved into the theme.
- Previous, next and pause are real buttons named "Previous theme", "Next theme" and "Pause the animation", in a group named "Move between themes". Previous and next are marked as unavailable at the first and last theme. Pause is a toggle and says whether it is pressed. When the theme changes, focus stays on the same button.
- The graphics play once each time their theme shows, then stop (or keep repeating when Loop animation is on). Pause is the visitor's way to stop that movement part-way.
- Only the showing theme can be reached. The other themes' text and buttons are hidden from the keyboard and from screen readers until their tab is chosen.
- Each button names its theme for screen readers: the button label, a colon, then the title ("Watch the episode: Defense Outlook").
- The drawn graphics are decoration and hidden from screen readers. An image's alt text comes from the image Description; if that is blank the image is treated as decoration.
- The sideways swipe is touch only. The tabs do the same job for everyone else.
- The tabs and the buttons show a focus outline.
- Reduced motion: the tabs version is used and the glides between themes are off. The drawn graphics still play by default, and the pause button stops them.
- A change of theme is not announced to screen readers; the chosen tab is marked as current.

### Open questions

- Whether the live page template lets the section pin. The deploy checklist asks for this to be checked on the published page; if the template clips the section, visitors get the tabs version.
- Whether fewer than three themes is acceptable. The fields ask for three to five, but one or two will still show.
- Sizes follow the team's page preview; the final spec has not arrived.
- No pixel size is stated for the optional theme image.
- The prefilled links are "#". The real story links are still to be supplied.
- Which story fields the article picker returns in TeamSite has not been confirmed here. The skin expects a title, description and link (or url).
- The 2027 Outlook page is at `/en/insights/outlook-2027`; it launches December 2, 2026 and its content is placeholder until then.

---

## TeamSite locations

| What | Where |
|---|---|
| CSS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/css/components/rbccm-strategic-themes.css` |
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-strategic-themes.js` |
| Component (skins and properties) | `/iwadmin/main/livesite/component/WORKAREA/shared/WWW/RBCCM.com/Components` |

On the site these load from `/assets/rbccm/css/components/rbccm-strategic-themes.css` and `/assets/rbccm/js/components/rbccm-strategic-themes.js`.

## Files

| File | What it is |
|---|---|
| `rbccm-strategic-themes--outlook-2027.xsl` | TeamSite skin for the 2027 Outlook page. |
| `rbccm-strategic-themes-properties.xml` | Properties + Data fields (prefilled with the five Outlook themes). |
| `rbccm-strategic-themes.css` | Styles. Ships to `/assets/rbccm/css/components/rbccm-strategic-themes.css`. |
| `rbccm-strategic-themes.js` | Pinned scroll, tabs and the drawn graphics. Ships to `/assets/rbccm/js/components/rbccm-strategic-themes.js`. |
| `rbccm-strategic-themes.html` | Local preview, rendered from the skin: five themes, three themes, and a theme with an image. |

---

## How it behaves

Pinned scroll is off by default, so every visitor gets the tabs version at every size. The pinned rows below apply only when the Pinned scroll field is `yes`.

| Where | What the visitor gets |
|---|---|
| Window at least 992px wide and 600px tall | **Pinned scroll.** The section is one screen tall per theme. It sticks under the site header while the page scrolls through it. Each theme holds, then glides to the next: the text changes on the left and the graphics slide across on the right. The bar above each numbered tab fills as you go. Pressing a tab scrolls to that theme. |
| Narrower than 992px, at least 600px tall | **Pinned scroll, stacked.** The heading and intro scroll away, then the tabs stick under the site header with the showing theme's text below them and its picture in the height that is left. Scrolling steps through the themes the same way. |
| Windows shorter than 600px, or no room for the picture | **Tabs.** One theme shows at a time. Pressing a numbered tab switches it; a sideways swipe moves one theme. |
| Reduced motion (the visitor's device setting) | **Tabs**, with no glide between themes. The drawn graphics still play; pause stops them. |
| No script | A plain numbered list of every theme: number, title, description and button. Images show; the drawn graphics don't. |

The page falls back to the tabs version by itself when pinning can't work, for example when there is only one theme or when the section sits inside a container that clips or scrolls.

Left and right arrow keys move between the tabs. Only the showing theme's button can be reached with the keyboard.

---

## Layout (desktop, pinned)

```
STRATEGIC THEMES                          +---------------------+
Insights on the thematic shifts           |                     |
expected to shape the year ahead.  (h2)   |                     |
                                          |      graphic        |
==== ---- ---- ---- ----   (progress)     |                     |
01   02   03   04   05     (tabs)         |                     |
                                          +---------------------+
01 / 05
Defense Outlook                    (h3)
How rising defense budgets ...
[Watch the episode ->]
```

The themes are an ordered list (`ol` / `li`). The button's screen reader label names the theme ("Watch the episode: Defense Outlook"). The numbered tabs are buttons, and the showing one is marked as current.

---

## Graphics

Each theme picks one of five graphics, drawn by the script. They are decoration and are hidden from screen readers. Each plays when its theme comes into view and starts again when the theme comes back.

| Graphic | What it shows | Words on it |
|---|---|---|
| Defense | A radar: rings draw in, a beam sweeps round, blips ping as it passes. | None. |
| Minerals | Nine element tiles (Li, Ni, Co, Cu, KCl, Zn, Au, U, Al) that pop in and light up in turn. | Up to three words under the tiles. |
| AI | A grid of cells with a wave of activity, above a value chain with a travelling dot. | The chain's labels (four works best). |
| Energy | A rising bar chart with a trend line and a pulsing end point. | A chart title, then up to three words under the chart. |
| Canada | A maple leaf outline filled with dots that flicker. | Up to four words under the leaf. |

The words come from the theme's `GraphicCaption` field, separated by commas. For Energy the chart title comes first, before a colon: `Power demand: Generation, Grid, Storage`.

A theme can use an **image** instead (square works best). With no graphic and no image, the theme shows text only.

---

## Fields

| Field | Notes |
|---|---|
| `SectionID` | Section id; the heading gets `<id>-heading`. |
| `SectionAriaLabel` | Optional. Blank uses the section heading. |
| `CssPath`, `JsPath`, `CacheVersion` | Stylesheet and script paths; bump `CacheVersion` after each upload. |
| `StickyOffset` | Height in px of the site header that stays fixed at the top. Blank (recommended) measures it from the page. Only matters with pinned scroll on. |
| `PinnedScroll` | `yes` turns on the pinned scroll. Blank or `no` (the default) is tabs only: the page scrolls past the section as normal. |
| `LoopAnimation` | `yes` keeps the graphics repeating. Blank or `no` (the default): each graphic plays once when its theme shows, then rests. |
| `HideCount` | `yes` hides the "01 / 05" count above each title. Blank or `no` (the default) shows it. |
| `PictureStyle` | **Graphic** (the default): the picture is not a link. **Clickable graphic**: the picture links where the theme's button links. **Article**: the picked story's image, as a link, in place of the graphic (a typed Image wins over the story's; with no image the theme keeps its graphic). |
| `Eyebrow` | Small label above the heading. Blank hides it. |
| `SectionHeading` | Blank hides it. |
| `SectionIntro` | One line under the heading. Blank hides it. |
| `ButtonLabel` | Button label for every theme. Blank shows "Watch the episode". |
| `TabsLabel` | Screen reader name for the row of tabs. Blank uses "Themes". |
| `Theme1Story` to `Theme5Story` | Article picker. Fills the title, description and link from the picked story. |
| `Theme{N}Title` | Blank uses the picked story's title. A theme with no title (typed or picked) is hidden and the rest renumber. |
| `Theme{N}ShortTitle` | Label under the theme's numbered tab. Blank uses the title. |
| `Theme{N}Description` | Blank uses the picked story's description. |
| `Theme{N}Link` | Blank uses the picked story's link. No link hides the button. |
| `Theme{N}ButtonLabel` | Blank uses `ButtonLabel`. |
| `Theme{N}Graphic` | None, Defense, Minerals, AI, Energy or Canada. |
| `Theme{N}GraphicCaption` | Words on the graphic, comma separated. See Graphics above. |
| `Theme{N}Image` | DAM image shown instead of a graphic. The image Description is the alt text; blank makes it decorative. |

---

## Deploy checklist

1. Upload `rbccm-strategic-themes.css` to `/assets/rbccm/css/components/` and `rbccm-strategic-themes.js` to `/assets/rbccm/js/components/`.
2. Register `rbccm-strategic-themes--outlook-2027.xsl` in TeamSite with `rbccm-strategic-themes-properties.xml`.
3. Pick the stories (or fill the fields by hand) and check each button goes to the right story.
4. Only if pinned scroll is turned on: on the published page, at desktop size, check the section pins under the site header and steps through every theme. If it shows as tabs instead, the page template is clipping the section; see "How it behaves".
5. Check a phone and a tablet: the tabs and the previous and next buttons switch the theme. With pinned scroll on, the heading scrolls away, the tabs stick under the site header, and scrolling steps through every theme. Check the last theme's button can still be reached.
6. Bump `CacheVersion`.
