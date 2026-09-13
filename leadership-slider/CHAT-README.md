# RBCCM Component Work — Chat Handoff README

Context for continuing this work in a fresh chat. Covers the Teamsite (Interwoven LiveSite)
DCR/XSL components built and the conventions established.

---

## Working directories

```
/Users/bannister/Documents/Freelance/RBCCM/
├── leadership-slider/                  # Leadership carousel + testimonials + misc
│   ├── leadership-slider-bio.html      # XSL component: leadership carousel (LinkedIn OR Biography modal)
│   ├── leadership-carousel.css         # Production CSS (synced) → /assets/rbccm/css/sub/test/leadership-carousel.css
│   ├── local-test.html                 # Local preview harness (biography mode, 6 sample cards)
│   ├── curren-slick-slider.html        # Earlier slick conversion (DCR authors, LinkedIn icons)
│   ├── testimonials-slider.html        # Synced text+image sliders (asNavFor)
│   └── current-owl-slider.html         # Original owl carousel (reference only)
├── featured-conferences-component/
│   ├── featured-conferences.html       # XSL component (nested tabs)
│   ├── featured-conferences.css
│   ├── featured-conferences.js
│   └── local-test.html
├── upcoming-conferences-component/
│   ├── upcoming-conferences.html       # XSL component (grid/carousel + modal)
│   ├── upcoming-conferences.css
│   ├── upcoming-conferences.js
│   └── local-test.html
└── CHAT-README.md                      # this file
```

**Deploy asset paths (referenced from the XSL):**
- CSS → `/assets/rbccm/css/sub/test/<component>.css`
- JS  → `/assets/rbccm/js/sub/test/<component>.js`

---

## ⏳ CURRENT IN-PROGRESS WORK (pick up here)

**Leadership carousel — keyboard / Tab accessibility fix.**

Problem being fixed: tab order is illogical. Off-canvas + cloned slick slides are tabbable;
order comes out jumbled (slide → prev → next). Desired order: **Prev → visible slides → Next**,
with off-canvas/cloned slides NOT tabbable. After clicking Next, the newly-visible slide becomes
tabbable; shift-tabbing back enters the last visible slide.

Approach chosen (do NOT use the DOM-move approach — it breaks the visual layout because the
controls use normal-flow/flex positioning, not absolute):
- **Roving tabindex** + `aria-hidden` on slides via geometry (`getBoundingClientRect` overlap of
  each `.slick-slide` against `.slick-list`). Visible = tabbable; off-canvas/cloned = `tabindex=-1` + `aria-hidden`.
- **Tab/Shift+Tab interception** to enforce the ring order `[Prev, ...visible card actions, Next]`
  because Prev/Next sit AFTER the slides in the DOM.
- **`focusin` entry redirect**: forward-tab into the section → Prev; shift-tab in → Next.
- **`focusOutside(backward)`** helper to exit backward from Prev (since Prev is DOM-after the slides).
- Re-runs on `init` (via `$track.one('init', …)` + setTimeout 0), `afterChange`, and `resize`.
- Dropped the old `getFocusable`/`navigateSequence`/`focusQueue` logic and the custom Arrow-key nav.
  Carousel still advances via Enter/Space on the Prev/Next buttons (native button behaviour).

**STATUS:**
- ✅ `leadership-slider/local-test.html` — JS rewritten with the new a11y logic (4 edits applied).
  Open in a browser to verify the Tab flow before porting.
- ❌ `leadership-slider/leadership-slider-bio.html` (the actual XSL component) — **NOT yet updated.**
  Next step: port the identical JS fix into the XSL's inline `<script>` block, **with XSL/XML
  escaping** (`<` → `&lt;`, `&&` → `&amp;&amp;`; leave `>` raw, matching the file's existing style).

The new helper functions to port: `isSlideInView`, `activeArrow`, `getRing`, `applyA11y`,
`focusOutside`, the `afterChange` handler, the `keydown.rbccmA11y` Tab interceptor, the
`mousedown.rbccmA11y` reset, and the `section` `focusin` entry redirect. Also: add
`$track.one('init', function(){ setTimeout(function(){ applyA11y(); syncArrows(); }, 0); });`
at the top of `initCarousel()`, remove `focusQueue`/`entryActionIdx` refs, and add `applyA11y()`
to the resize handler.

---

## Components — summary & state

### 1. Leadership carousel (slick, DCR-driven)
- **XSL:** `leadership-slider/leadership-slider-bio.html` · **CSS:** `leadership-carousel.css`
- Pulls authors from the **rbccm "authors" DCR**: `./DCR/authorlist/{name,title,subtitle,photo,linkedin,bio,id}`.
- Renders only when **4–8 authors** (`count` gate).
- **`LinkType` property** (`linkedin` default | `biography`): LinkedIn icon (bottom-right) OR a
  "Biography" text link (bottom-left) that opens a **Bootstrap bio modal** populated from hidden
  `.rbccm-leadership__bio-source` data nodes.
- Slick config: `variableWidth:true`, `centerMode:true`, `infinite:true`, `arrows:false`
  (external buttons), custom dots into `#rbccm-lead-dots`, `accessibility:false`.
- Active (center) card gets a `#003168` border; dots are 11px with an active yellow/blue ring.
- Responsive card widths: 343px (mobile) / 273px (≥1025) / 270px (≥1245). Desktop arrows show ≥1245px;
  mobile controls (prev/dots/next) show below 1245px.

### 2. Testimonials slider
- **File:** `leadership-slider/testimonials-slider.html`
- Two synced slick sliders via `asNavFor` (text owns arrows+dots, image follows).
- **Quote** = per-slide user input; **Author + Role** pulled from a per-slide `AuthorRef` DCR
  picker (`rbccm/authors`). Image alt auto-generated as `"Author - Role"`.

### 3. Featured Conferences
- **Files:** `featured-conferences-component/` (html/css/js/local-test)
- Nested tabs: outer conference selector + inner tabs. Self-contained inline `<script>` IIFE
  scoped to `#rbccm-featured-conferences`. Inner tabs = accordion on mobile, horizontal tabs on desktop.
- **Video:** Brightcove **iframe embed** (NOT the autoloader) in a 16:9 padding-top frame.
  `//players.brightcove.net/{account}/{player}_{embed}/index.html?videoId={id}`. Default video id `6385583003112`.
- **DCR:** nested `<Group>` is NOT allowed by Teamsite schema → speakers/insights flattened to
  numbered datums (`Speaker1Name…Speaker5Alt`, `Insight1Label…Insight4Href`).
- **V1 state:** outer tablist + the original Overview/Speakers/Insights inner tabs are **hidden via CSS**
  (markup preserved). Three NEW fixed-content tabs are shown: **Global Healthcare**, **Canadian
  Industrials**, **Global Energy, Power & Infrastructure** — each rendered by a dedicated named
  template (`render-ghc-content`, `render-cic-content`, `render-gep-content`). "Key themes" renders
  as a pipe-separated `__topics` line (matching the design), not a bulleted list.
- JS default active inner tab key changed `-overview` → `-ghc`.

### 4. Upcoming Conference Programming
- **Files:** `upcoming-conferences-component/` (html/css/js/local-test)
- **Desktop:** 3-col CSS grid. **Mobile (<992px):** slick carousel, peek via `centerMode` +
  fixed card width (343px) `!important`, external arrow buttons (`#rbccm-uc-prev/next`), custom dots.
- JS destroys/rebuilds slick across the 992px breakpoint. **Important fix:** snapshot the original
  cards `innerHTML` once at load and restore it on every destroy — otherwise slick's infinite clones
  accumulate each cycle (6 → 10 → 14 dots…).
- Card hover (desktop, `@media (hover:hover)`): image zooms `scale(1.08)` inside `overflow:hidden`
  card; overlay `rgba(0,49,104,0.8)` stays; yellow→ divider grows.
- Active dot = white fill + `outline:1px solid #FFC72C; outline-offset:4px` (a true ring; box-shadow
  gave a solid band, don't use it). Dots gap 26px.
- Filters/search are **hidden in V1** (`display:none`, markup kept for V2; `data-topic`/`data-region`
  already emitted on cards for future client-side filtering).
- **CTA** → Bootstrap modal: if `CTAHref` starts with `#`, XSL auto-adds `data-toggle="modal"` +
  `data-target`. Modal content is a **BEM flex list (no tables)**: `__modal-row` = date | title |
  location, each with a `1px solid #F3F4F6` bottom border. Standard RBCCM modal chrome (8px `#FBDE00`
  top border). `__modal-dialog { width:100% !important }` to beat Bootstrap's `width:auto`.
- **Render cap:** XSL limits carousel to first **6** Conference groups (`position() <= 6`).
- Section bg `#082043`.

---

## Conventions & gotchas (apply to all components)

1. **DCR/XSL component file = three appended blocks:** the `<xsl:stylesheet>` skin, then a
   `<Properties>` block, then a `<Data>` block (Teamsite component format).
2. **No nested `<Group>`** inside `<Data>` — Teamsite schema rejects it
   (`cvc-complex-type.2.4.a: Invalid content … 'Group'`). Flatten to numbered datums.
3. **Replicated Groups:** Teamsite strips `@ID` on replicated datums, so XSL must match on
   **`@Name`** — keep `Datum Name="…"` identical to the XSL's `@Name='…'` selector, or fields read blank.
4. **Give datums default values** so newly-replicated instances aren't empty.
5. **`disable-output-escaping="yes"`** for rich-text/HTML datum values (bio, overview body, quotes).
6. **BEM**, component-scoped class names. Scope JS to the section id via an IIFE.
7. **Local preview harness** (`local-test.html`): loads jQuery + slick (+ Bootstrap for modals)
   from CDN, links the component CSS/JS by relative path, hardcodes sample DCR data. Fonts
   ("RBCDisplay"/"Inter") fall back locally; CSS vars use hex fallbacks e.g. `var(--Yellow-Warm-Yellow,#FFC72C)`.
8. **Slick pattern** (proven on prod leadership carousel): `variableWidth:true` + fixed px card
   width `!important` + `centerMode` for peek; external arrow buttons (`arrows:false`); custom dots
   via `appendDots`; `.slick-track{display:flex!important}`, `.slick-slide{float:none;height:auto;margin:0!important}`,
   `.slick-list{overflow:visible}`. Destroy on desktop where a CSS grid takes over; snapshot original
   HTML to avoid clone accumulation.
9. **Bootstrap modal chrome:** `.modal-header` with `border-top:8px #FBDE00 solid`; trigger via
   `data-toggle="modal" data-target="#id"`. Add `body.modal-open{padding-right:0!important}` if the
   scrollbar-compensation jump is unwanted (note: that's Bootstrap, not our code).
10. **XSL inline JS escaping:** inside an XSL `<script>`, escape `<` → `&lt;` and `&&` → `&amp;&amp;`;
    `>` can stay raw. (Or move JS to an external file referenced by `<script src>` — done for the two
    *-component folders.) The leadership XSL keeps JS inline, so escaping applies there.

---

## Quick verify

```bash
open /Users/bannister/Documents/Freelance/RBCCM/leadership-slider/local-test.html
open /Users/bannister/Documents/Freelance/RBCCM/featured-conferences-component/local-test.html
open /Users/bannister/Documents/Freelance/RBCCM/upcoming-conferences-component/local-test.html
```
