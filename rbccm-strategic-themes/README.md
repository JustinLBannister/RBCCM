# Strategic Themes

An eyebrow and heading, then up to five themes. Each theme shows its number, a title, a description, a button and an animated graphic. Built for the "Strategic themes" section of the 2027 Outlook page.

On a desktop the section pins to the screen and scrolling steps through the themes one at a time. On phones and tablets the same numbered tabs switch the theme when pressed.

Each theme can be picked from TeamSite's article picker, so the title, description and link come from the story itself. Typed fields override the picked story.

---

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

| Where | What the visitor gets |
|---|---|
| Desktop (window at least 992px wide and 600px tall) | **Pinned scroll.** The section is one screen tall per theme. It sticks under the site header while the page scrolls through it. Each theme holds, then glides to the next: the text changes on the left and the graphics slide across on the right. The bar above each numbered tab fills as you go. Pressing a tab scrolls to that theme. |
| Phones, tablets, short windows | **Tabs.** One theme shows at a time. Pressing a numbered tab switches it; a sideways swipe moves one theme. On phones the tabs show the bar and number only. |
| Reduced motion (the visitor's device setting) | **Tabs**, with no animation. The graphics show in their finished state. |
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
| Minerals | Nine element tiles (Li, Ni, Co, Cu, C, Nd, Mn, U, Al) that pop in and light up in turn. | Up to three words under the tiles. |
| AI | A grid of cells with a wave of activity, above a value chain with a travelling dot. | The chain's labels (four works best). |
| Energy | A rising bar chart with a trend line and a pulsing end point. | A chart title, then up to three words under the chart. |
| Canada | A maple leaf outline filled with dots that flicker. | Up to three words under the leaf. |

The words come from the theme's `GraphicCaption` field, separated by commas. For Energy the chart title comes first, before a colon: `Power demand: Generation, Grid, Storage`.

A theme can use an **image** instead (square works best). With no graphic and no image, the theme shows text only.

---

## What the editor can change

- The eyebrow and heading.
- Three to five themes: pick the story, or type the title, description and link; set a short title for the tab.
- Each theme's graphic, the words on it, or an image in its place.
- The button label, for all themes or for one.

## What it does not do

- It does not advance on a timer and has no previous, next or pause buttons. The visitor moves through the themes by scrolling or with the tabs.
- It shows five themes at most.
- The graphics are fixed designs. Their shapes, colours and the element tiles can't be edited in TeamSite; only the words on them can.
- A new kind of graphic needs a developer. An image can be used in the meantime.
- The pinned scroll is desktop only.

All theme text and links are printed into the page by the skin, so they are present in the page source for search engines and other crawlers that do not run scripts.

---

## Fields

| Field | Notes |
|---|---|
| `SectionID` | Section id; the heading gets `<id>-heading`. |
| `SectionAriaLabel` | Optional. Blank uses the section heading. |
| `CssPath`, `JsPath`, `CacheVersion` | Stylesheet and script paths; bump `CacheVersion` after each upload. |
| `StickyOffset` | Height in px of the site header that stays fixed at the top. Blank (recommended) measures it from the page. |
| `Eyebrow` | Small label above the heading. Blank hides it. |
| `SectionHeading` | Blank hides it. |
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
4. On the published page, at desktop size, check the section pins under the site header and steps through every theme. If it shows as tabs instead, the page template is clipping the section; see "How it behaves".
5. Check a phone and a tablet: the tabs switch themes.
6. Bump `CacheVersion`.
