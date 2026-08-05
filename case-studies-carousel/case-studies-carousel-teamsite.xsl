<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<!-- Declared 2.0 to match Teamsite's "Rendering Mode: XSLT 2.0" (the house
     setting per the Conference-Insights BRD). Do NOT set this to 1.0. -->
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: RBC CM Case Studies Carousel
       ===================================================================
       Replaces the legacy Bootstrap 3 carousel at #cs-carousel:
         <h2>Signature case studies</h2>
         <ol class="carousel-indicators">…</ol>
         <div class="carousel-inner">…</div>
         <button class="slick-prev">…</button>
         <button class="slick-next">…</button>
         <a class="btn btn-inverse">View all</a>
       All three components (heading, carousel, CTA) now live in one skin.

       One horizontal card per slide, driven by accessible-slick at every
       viewport (1-per-view). Arrows swap between plain-chevron (below
       the track, <1300) and chevron-in-circle (outside the track, ≥1300).
       Dots always visible, styled to match leadership-carousel.

       DCR-DRIVEN with per-slide OVERRIDES, like deal-carousel and
       how-we-think. Each slide binds ONE article/story DCR — the XSL
       reads title / description / image / read-time and applies per-
       slide overrides on top.

       DCR TREE ↔ ROOT ELEMENT MAP
       ---------------------------
       The picker is scoped by the templatedata path (article/story), but
       the tree it returns is rooted at the DCR's own root-container
       element, which the story datacapture names `press_release` (same
       root as insights stories AND deals). So the XSL selects:

           Datum[@Name='Case Study Record']/DCR/press_release

       If your Teamsite installs case studies under a different DCR type,
       update the Category/Type in the properties.xml AND change
       `$dcr` below to match.

       SINGLE-FILE VARIANT: CSS and JS are inlined below. No external
       /assets/rbccm/css/components/case-studies-carousel.css or
       /assets/rbccm/js/components/case-studies-carousel.js need to be
       deployed alongside this skin. Paste this file into the TeamSite
       component slot and it renders end-to-end on its own.
       =================================================================== -->

  <xsl:output method="html" indent="no" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>


  <!-- ═══════════════════════════════════════════════════════════════════
       clean — strip TinyMCE bogus <br> + fold non-breaking spaces
       Same template deal-carousel and how-we-think use; kept in sync
       by hand.
       ═══════════════════════════════════════════════════════════════════ -->
  <xsl:template name="clean">
    <xsl:param name="s" select="''"/>
    <xsl:variable name="stripped" select="replace(string($s), '&lt;[^&gt;]+&gt;', '')"/>
    <xsl:variable name="nbspFolded" select="translate($stripped, '&#160;', ' ')"/>
    <xsl:variable name="entityFolded" select="replace($nbspFolded, '&amp;(nbsp|#160|#xA0);', ' ')"/>
    <xsl:value-of select="normalize-space($entityFolded)"/>
  </xsl:template>

  <!-- ═══════════════════════════════════════════════════════════════════
       story-url — resolve a story DCR's public URL from its path.
       Case studies live at /en/story/story.page?dcr=<full-dcr-path>,
       same route the insights stories use. Falls back to # if the DCR
       has no path yet (author dropped a slide but hasn't picked a
       record).
       ═══════════════════════════════════════════════════════════════════ -->
  <xsl:template name="story-url">
    <xsl:param name="path" select="''"/>
    <xsl:if test="$path != ''">
      <xsl:text>/en/story/story.page?dcr=</xsl:text><xsl:value-of select="$path"/>
    </xsl:if>
  </xsl:template>


  <!-- ═══════════════════════════════════════════════════════════════════
       MAIN TEMPLATE
       ═══════════════════════════════════════════════════════════════════ -->
  <xsl:template match="/">

    <!-- ═══ SECTION-LEVEL DATUMS ═══ -->

    <xsl:variable name="heading">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='Heading']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Heading'])"/>
        </xsl:when>
        <xsl:otherwise>Signature case studies</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="headingId" select="normalize-space(/Properties/Datum[@ID='HeadingId'])"/>

    <xsl:variable name="ariaLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='AriaLabel']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='AriaLabel'])"/>
        </xsl:when>
        <xsl:otherwise><xsl:value-of select="$heading"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="introRaw" select="/Properties/Datum[@ID='Intro']"/>
    <xsl:variable name="intro">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$introRaw"/></xsl:call-template>
    </xsl:variable>

    <!-- View all CTA -->
    <xsl:variable name="ctaLabel" select="normalize-space(/Properties/Datum[@ID='CtaLabel'])"/>
    <xsl:variable name="ctaLink"  select="normalize-space(/Properties/Datum[@ID='CtaLink'])"/>
    <xsl:variable name="ctaNewTab" select="/Properties/Datum[@ID='CtaNewTab'] = 'true'"/>
    <xsl:variable name="ariaViewAllLabel" select="normalize-space(/Properties/Datum[@ID='AriaViewAllLabel'])"/>

    <!-- Accessibility overrides — passed to slick via data attrs on the
         root, so the JS can pick them up in ensureSlickLoaded's init
         block. Blank = JS uses its baked-in defaults. -->
    <xsl:variable name="regionLabel"      select="normalize-space(/Properties/Datum[@ID='RegionLabel'])"/>
    <xsl:variable name="instructionsText" select="normalize-space(/Properties/Datum[@ID='InstructionsText'])"/>
    <xsl:variable name="prevArrowAriaLabel" select="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel'])"/>
    <xsl:variable name="nextArrowAriaLabel" select="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel'])"/>

    <!-- Transition mode — case-insensitive. Anything not exactly
         "fade" falls back to slide, so a typo defaults to the safe
         option rather than breaking the component. -->
    <xsl:variable name="transitionMode">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Datum[@ID='TransitionMode']),
                                  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                                  'abcdefghijklmnopqrstuvwxyz') = 'fade'">fade</xsl:when>
        <xsl:otherwise>slide</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Slides -->
    <xsl:variable name="slides"     select="/Properties/Data/Group[@ID='CaseStudy' or @Name='Case Study']"/>
    <xsl:variable name="slideCount" select="count($slides)"/>

    <!-- Padding overrides -->
    <xsl:variable name="padTopMobile"     select="normalize-space(/Properties/Datum[@ID='PadTopMobile'])"/>
    <xsl:variable name="padBottomMobile"  select="normalize-space(/Properties/Datum[@ID='PadBottomMobile'])"/>
    <xsl:variable name="padTopDesktop"    select="normalize-space(/Properties/Datum[@ID='PadTopDesktop'])"/>
    <xsl:variable name="padBottomDesktop" select="normalize-space(/Properties/Datum[@ID='PadBottomDesktop'])"/>
    <xsl:variable name="hasPadOverride"
                  select="$padTopMobile != '' or $padBottomMobile != ''
                       or $padTopDesktop != '' or $padBottomDesktop != ''"/>


    <!-- Gate render at >= 3 slides. Below that the carousel has less
         visual weight than a single hero card (2 dots looks broken,
         1 dot pointless), so we drop the whole component. Same
         gating pattern featured-conferences uses (it requires exactly
         3 conferences to render). -->
    <xsl:if test="$slideCount &gt;= 3">

      <!-- ═══ EXTERNAL CSS ═══ -->
      <!-- ═══ INLINE CSS ═══
           Full stylesheet inlined so this single skin file can be pasted
           directly into a TeamSite component slot without needing the
           external /assets/rbccm/css/components/case-studies-carousel.css
           to also be deployed. The <link> reference in the split-file
           version at case-studies-carousel.xsl still works if you prefer
           to keep CSS separate. -->
      <style type="text/css">
        <xsl:text disable-output-escaping="yes"><![CDATA[
/* ============================================================
   RBC CM — Case Studies Carousel
   All rules scoped to .rbccm-case-studies
   Mobile-first; layout switches at min-width: 1300px
   ============================================================
   Consumed by case-studies-carousel.xsl. Slick runs at every
   viewport (1-per-view); arrows always visible; arrows swap
   from plain-chevron (below track, <1300) to chevron-in-circle
   (outside track, >=1300). Dot pattern ported from leadership-
   carousel so both components stay visually aligned.

   Deploy at: /assets/rbccm/css/components/case-studies-carousel.css
             (path referenced from the skin's <link>).
   ============================================================ */

/* Design tokens — scoped to the section so the --cs-* names
   don't leak into the page's global :root. */
.rbccm-case-studies {
  --cs-navy:      #002144;
  --cs-navy-med:  #003168;
  --cs-blue:      #0051A5;
  --cs-blue-br:   #006AC3;
  --cs-yellow:    #FFC72C;
  --cs-ink:       #082043;
  --cs-text:      #494949;
  --cs-muted:     #6B7280;
  --cs-hairline:  #E5E7EB;
  --cs-border:    #A8A8A8;
  --cs-white:     #FFFFFF;
  --cs-serif:     "RBC Display", RBCDisplay, Georgia, Times, serif;
  --cs-sans:      Roboto, Arial, sans-serif;
  /* Padding tokens — XSL writes overrides as inline properties
     on the section; these var() fallbacks are the defaults. */
  --cs-pad-top-mobile:     40px;
  --cs-pad-bottom-mobile:  40px;
  --cs-pad-top-desktop:    64px;
  --cs-pad-bottom-desktop: 64px;
}

/* ---------- Section shell ---------- */

.rbccm-case-studies {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: var(--cs-pad-top-mobile) 16px var(--cs-pad-bottom-mobile);
  background: #fff;
  box-sizing: border-box;
}
@media (min-width: 992px)  {
  .rbccm-case-studies {
    padding: var(--cs-pad-top-desktop) 24px var(--cs-pad-bottom-desktop);
    gap: 32px;
  }
}
@media (min-width: 1440px) {
  .rbccm-case-studies { padding: var(--cs-pad-top-desktop) 170px var(--cs-pad-bottom-desktop); }
}
.rbccm-case-studies *,
.rbccm-case-studies *::before,
.rbccm-case-studies *::after { box-sizing: border-box; }

/* Inner content rail — heading + carousel + view-all all
   centre on the same 1140 rail. The carousel itself breaks
   OUT of this rail at ≥1300px via negative side margins so
   the arrows can sit in the section's outer gutter (same
   pattern as leadership-carousel). */
.rbccm-case-studies__container {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
}

/* Scroll-margin-top on the heading — kicks in when the H2 has
   an id set via the HeadingId Datum, so anchor links landing on
   this section clear the sticky nav. */
.rbccm-case-studies__heading[id] { scroll-margin-top: 167px; }

/* ---------- Header (H2 + optional intro) ---------- */

.rbccm-case-studies__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 32px;
}
.rbccm-case-studies__heading {
  color: #002144;
  font-family: RBCDisplay, Georgia, Times, serif;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
}
@media (min-width: 992px) {
  .rbccm-case-studies__heading { font-size: 29px; line-height: 34.8px; letter-spacing: 1px; }
}
.rbccm-case-studies__intro {
  color: #003168;
  font-family: Roboto, sans-serif;
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  max-width: 780px;
}

/* ---------- Carousel wrapper ----------
   Ported from leadership-carousel.__carousel. Two layouts:

   <1300: 5-col grid, arrows sit BELOW the track alongside the
          dots (`prev · dots · next` centred on row 2). Track
          spans row 1. Keeps everything inside the 1140 rail.

   >=1300: 3-col grid, track locked at 1140 in the middle,
           arrows live in `auto` columns OUTSIDE the rail. The
           wrapper itself extends beyond the __container via
           negative side margins so the arrows sit in the
           section's gutter without shrinking the track. */
.rbccm-case-studies__carousel {
  align-items: center;
  box-sizing: border-box;
  display: grid;
  gap: 24px 26px;
  grid-template-columns: 1fr auto auto auto 1fr;
  grid-template-areas:
    "track track track track track"
    ".     prev  dots  next  .";
  margin: 32px auto 0;
  max-width: 1140px;
  width: 100%;
}
@media (min-width: 1300px) {
  .rbccm-case-studies__carousel {
    column-gap: 24px;
    grid-template-areas:
      "prev track next"
      ".    dots  .";
    grid-template-columns: auto 1140px auto;
    margin: 32px -68px 0 -68px;
    max-width: none;
  }
}
/* Grid-area assignment. Class-based (not ID-based) so multi-
   instance carousels on the same page don't collide. */
.rbccm-case-studies__btn--prev  { grid-area: prev; }
.rbccm-case-studies__track      { grid-area: track; min-width: 0; }
.rbccm-case-studies__btn--next  { grid-area: next; }
.rbccm-case-studies__dots-wrap  { grid-area: dots; justify-self: center; }


/* ---------- Arrow buttons — leadership pattern ----------
   Mobile chevron (14x24 plain), desktop chevron in outlined
   circle (44x44). Both SVGs live in each __btn; CSS swaps
   which one renders based on the same 1300 breakpoint as the
   __carousel grid switch. */
.rbccm-case-studies__btn {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  height: 44px;
  justify-content: center;
  padding: 0;
  width: 44px;
}
.rbccm-case-studies__btn:focus-visible {
  outline: 2px solid #0051A5;
  outline-offset: 2px;
  border-radius: 50%;
}
.rbccm-case-studies__btn svg { display: block; }

.rbccm-case-studies__btn .rbccm-case-studies__btn-icon--mobile   { display: block; }
.rbccm-case-studies__btn .rbccm-case-studies__btn-icon--desktop  { display: none; }
@media (min-width: 1300px) {
  .rbccm-case-studies__btn .rbccm-case-studies__btn-icon--mobile   { display: none; }
  .rbccm-case-studies__btn .rbccm-case-studies__btn-icon--desktop  { display: block; }
}

/* Desktop arrow hover — fills the circle blue, chevron flips
   to white. Targets the SVG paths directly. */
.rbccm-case-studies__btn-icon--desktop rect,
.rbccm-case-studies__btn-icon--desktop path {
  transition: fill 0.2s ease, stroke 0.2s ease;
}
.rbccm-case-studies__btn:hover .rbccm-case-studies__btn-icon--desktop rect { fill: #003168; }
.rbccm-case-studies__btn:hover .rbccm-case-studies__btn-icon--desktop path { stroke: #ffffff; }


/* ---------- Track / slide ---------- */

.rbccm-case-studies__track {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.rbccm-case-studies__track.slick-initialized {
  display: block;
  gap: 0;
}

/* accessible-slick ships default padding on .slick-list (used
   for its centerPadding behaviour) and a margin on .slick-track.
   Both need zeroing for 1-per-view so the active slide fills
   the full track. Same fix story-carousel needed (tasks 131/142). */
.rbccm-case-studies__track.slick-initialized .slick-list {
  padding: 0 !important;
  margin: 0 !important;
}
.rbccm-case-studies__track.slick-initialized .slick-track {
  display: flex;
  align-items: stretch;
  margin: 0 !important;
}
.rbccm-case-studies__track.slick-initialized .slick-slide { height: auto; }
.rbccm-case-studies__track.slick-initialized .slick-slide > div { height: 100%; }
.rbccm-case-studies__track.slick-initialized .rbccm-case-studies__slide {
  display: flex !important;
  height: 100%;
}
.rbccm-case-studies__track.slick-initialized .rbccm-case-studies__card { width: 100%; }

.rbccm-case-studies__slide { width: 100%; }


/* ---------- Card ----------
   Visuals ported wholesale from how-we-think tiles so the two
   components share the same border, hover, typography and CTA
   treatment. Structural difference: how-we-think stacks a tall
   tile (image on top, body below); case-studies uses a
   horizontal card (image left, body right) on tablet+ and
   stacks to 1 column on mobile. */
.rbccm-case-studies__card {
  align-items: stretch;
  background: #FFF;
  border: 1px solid #A8A8A8;
  color: #000;
  display: flex;
  flex-direction: column;
  font-family: Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
  height: 100%;
  overflow: hidden;
  text-decoration: none;
  transition: border-color 0.15s ease;
  width: 100%;
}
@media (min-width: 768px) {
  .rbccm-case-studies__card { flex-direction: row; }
}
/* Beat Bootstrap 3's `a:focus, a:hover` blue underline default —
   same specificity trick how-we-think uses. */
a.rbccm-case-studies__card,
a.rbccm-case-studies__card:link,
a.rbccm-case-studies__card:visited,
a.rbccm-case-studies__card:hover,
a.rbccm-case-studies__card:focus,
a.rbccm-case-studies__card:focus-visible,
a.rbccm-case-studies__card:active {
  color: #000;
  text-decoration: none;
  outline-offset: 0;
}

/* Media — mobile 16:9 above the body, tablet+ takes half the
   card width. `overflow: hidden` clips the 1.08 scale on hover
   so it doesn't shift the card. */
.rbccm-case-studies__media {
  align-self: stretch;
  background: #003168 center/cover no-repeat;
  flex-shrink: 0;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}
@media (min-width: 768px) {
  .rbccm-case-studies__media {
    aspect-ratio: auto;
    width: 50%;
    min-height: 320px;
  }
}
.rbccm-case-studies__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}

/* Body — vertical stack: eyebrow / divider / title / desc /
   CTA. min-height carves out room so the CTA can `margin-top:
   auto` and pin to the bottom without collapsing. */
.rbccm-case-studies__body {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 240px;
  padding: 24px;
}
@media (min-width: 992px) {
  .rbccm-case-studies__body { padding: 32px; min-height: 315px; }
}

/* Eyebrow — Roboto Light 14/140 wt 400, LS 2, #006AC3 uppercase
   (matches how-we-think tile eyebrow). */
.rbccm-case-studies__eyebrow {
  color: #006AC3;
  font-family: "Roboto Light", Roboto, Arial, Verdana, sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 2px;
  line-height: 140%;
  margin: 0 0 5px 0;
  text-transform: uppercase;
}
/* Yellow divider — 30.9px baseline, widens to 56 on card hover
   / focus-within. */
.rbccm-case-studies__divider {
  background: #FFC72C;
  flex-shrink: 0;
  height: 2px;
  margin: 0;
  transition: width 0.3s ease;
  width: 30.9px;
}
/* Title — Roboto Medium 20/125 wt 400 #000 (matches how-we-think). */
.rbccm-case-studies__title {
  color: #000;
  font-family: "Roboto Medium", Arial, sans-serif;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 125%;
  margin: 10px 0 10px 0;
}
@media (min-width: 992px) {
  .rbccm-case-studies__title { font-size: 22px; }
}
/* Description — Roboto Light 14/140 wt 400 #555, LS 0.5. */
.rbccm-case-studies__desc {
  color: #555;
  font-family: "Roboto Light", Roboto, Arial, Verdana, sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.5px;
  line-height: 140%;
  margin: 0 0 20px 0;
}
/* CTA (read-time) — inline-flex + fit-content so the hover
   border-bottom only underlines the label + arrow, not the
   full card width. */
.rbccm-case-studies__cta {
  align-items: center;
  border-bottom: 1px solid transparent;
  color: #006AC3;
  display: inline-flex;
  font-family: Roboto, Arial, Verdana, sans-serif;
  font-size: 14px;
  font-weight: 400;
  gap: 7px;
  letter-spacing: normal;
  line-height: 20px;
  margin: auto 0 0 0;
  padding-bottom: 2px;
  transition: border-color 0.2s ease;
  width: fit-content;
}
.rbccm-case-studies__cta svg { flex-shrink: 0; }

/* Hover / focus — gated by (hover: hover) so touch devices
   skip the transforms. Same trio as how-we-think:
     card border → brand blue
     image → scale 1.08
     yellow divider → widens to 56
     CTA gains currentColor underline */
@media (hover: hover) {
  .rbccm-case-studies__card:hover {
    border-color: #0051A5;
    outline: none;
  }
  .rbccm-case-studies__card:hover .rbccm-case-studies__media img,
  .rbccm-case-studies__card:focus-visible .rbccm-case-studies__media img {
    transform: scale(1.08);
  }
  .rbccm-case-studies__card:hover .rbccm-case-studies__divider,
  .rbccm-case-studies__card:focus-visible .rbccm-case-studies__divider {
    width: 56px;
  }
  .rbccm-case-studies__card:hover .rbccm-case-studies__cta,
  .rbccm-case-studies__card:focus-visible .rbccm-case-studies__cta {
    border-bottom-color: currentColor;
  }
}
/* Keyboard focus mirrors hover (blue border, no double ring). */
.rbccm-case-studies__card:focus { outline: none; }
.rbccm-case-studies__card:focus-visible { border-color: #0051A5; outline: none; }

/* Reduced-motion — kill all card transitions. */
@media (prefers-reduced-motion: reduce) {
  .rbccm-case-studies__card,
  .rbccm-case-studies__media img,
  .rbccm-case-studies__divider,
  .rbccm-case-studies__cta {
    transition: none !important;
  }
  .rbccm-case-studies__card:hover .rbccm-case-studies__media img,
  .rbccm-case-studies__card:focus-visible .rbccm-case-studies__media img {
    transform: none !important;
  }
}


/* =====================================================
   DOTS — ported verbatim from leadership-carousel.css
   (SVG data URI outlined-circle default, filled with
   box-shadow ring on active / hover / focus-visible).
   Same shape and specificity so this block can lift
   straight into a shared partial down the line.
   ===================================================== */

.rbccm-case-studies__dots-wrap {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
}

#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots {
  align-items: center;
  bottom: auto !important;
  display: flex !important;
  /* Wrap dots onto a second line when the count outgrows the
     row. Tighter column-gap on mobile means ~16 dots fit on a
     375px screen before a second row is needed. Row-gap kicks
     in only if wrapping happens; single-row cases unaffected. */
  flex-wrap: wrap;
  gap: 12px 16px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
  position: static !important;
  width: auto !important;
}
@media (min-width: 992px) {
  #rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots {
    gap: 12px 26px;
  }
}
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li {
  align-items: center;
  box-sizing: border-box;
  display: flex !important;
  height: 11px !important;
  justify-content: center;
  margin: 0 !important;
  padding: 0 !important;
  width: 11px !important;
}
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button {
  background: none !important;
  border: none !important;
  box-sizing: border-box !important;
  cursor: pointer;
  display: block !important;
  font-size: 0 !important;
  height: 11px !important;
  line-height: 0 !important;
  margin: 0 !important;
  outline: none;
  padding: 0 !important;
  position: static !important;
  width: 11px !important;
}
/* Inactive dot: outlined circle */
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 11 11'%3E%3Ccircle cx='5.5' cy='5.5' r='5' stroke='%23003168' stroke-width='1' fill='none'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-size: 11px 11px !important;
  content: '' !important;
  display: block !important;
  height: 11px !important;
  opacity: 1 !important;
  position: static !important;
  width: 11px !important;
  transition: background-image 0.2s ease, box-shadow 0.2s ease, border-radius 0.2s ease;
}
/* Active dot: filled circle + 4px ring via box-shadow. Same
   treatment for keyboard focus (:focus-visible) and hover. */
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li.slick-active button::before,
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button:focus-visible::before,
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button:hover::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 11 11'%3E%3Ccircle cx='5.5' cy='5.5' r='5.5' fill='%23003168'/%3E%3C/svg%3E") !important;
  background-size: 11px 11px !important;
  border-radius: 50% !important;
  box-shadow: 0 0 0 4px #ffffff, 0 0 0 5px #003168 !important;
  height: 11px !important;
  width: 11px !important;
  outline: 0;
}
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button:focus-visible { outline: none; }
/* accessible-slick specifics — it injects <span class="slick-dot-icon">
   inside each button and applies a default ::before border. Both need
   suppressing so our custom SVG-data-URI dots render cleanly. Same
   fix story-carousel added (tasks 142 + 143). */
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button .slick-dot-icon,
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button .slick-dot-icon::before {
  display: none !important;
}
#rbccm-case-studies .rbccm-case-studies__dots-wrap .slick-dots li button::after {
  border: 0 !important;
  display: none !important;
}


/* ---------- View all CTA ---------- */
.rbccm-case-studies__viewall-wrap {
  display: flex;
  justify-content: center;
  /* 40px (not 32) because the dots strip is short (~11px) —
     the row below the track collapses to almost nothing at
     ≥1300 where the arrows sit outside, so 32px feels tight
     against the CTA. */
  margin-top: 40px;
}
.rbccm-case-studies__viewall {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  padding: 12px 32px;
  border: 1px solid #003168;
  background: transparent;
  color: #003168;
  font-family: Roboto, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  text-align: center;
  text-decoration: none;
  transition: background 150ms ease, color 150ms ease;
}
.rbccm-case-studies__viewall:hover,
.rbccm-case-studies__viewall:focus-visible {
  background: #003168;
  color: #fff;
  outline: none;
  text-decoration: none;
}
        ]]></xsl:text>
      </style>

      <!-- Inline padding overrides. Written as CSS custom properties on
           the section so the stylesheet's var() fallbacks stay in charge
           of the defaults. -->
      <xsl:if test="$hasPadOverride">
        <style>
          #rbccm-case-studies {
            <xsl:if test="$padTopMobile     != ''">--cs-pad-top-mobile: <xsl:value-of select="$padTopMobile"/>;</xsl:if>
            <xsl:if test="$padBottomMobile  != ''">--cs-pad-bottom-mobile: <xsl:value-of select="$padBottomMobile"/>;</xsl:if>
            <xsl:if test="$padTopDesktop    != ''">--cs-pad-top-desktop: <xsl:value-of select="$padTopDesktop"/>;</xsl:if>
            <xsl:if test="$padBottomDesktop != ''">--cs-pad-bottom-desktop: <xsl:value-of select="$padBottomDesktop"/>;</xsl:if>
          }
        </style>
      </xsl:if>


      <!-- ═══════════════════════════════════════════════════════════
           MARKUP
           ═══════════════════════════════════════════════════════════ -->
      <section class="rbccm-case-studies" id="rbccm-case-studies">
        <xsl:attribute name="aria-label"><xsl:value-of select="$ariaLabel"/></xsl:attribute>
        <!-- Data attrs picked up by the JS init to override the JS-
             side aria defaults for accessible-slick. Blank Datums emit
             empty attributes, which the JS treats as "use default". -->
        <xsl:if test="$regionLabel      != ''"><xsl:attribute name="data-region-label"><xsl:value-of select="$regionLabel"/></xsl:attribute></xsl:if>
        <xsl:if test="$instructionsText != ''"><xsl:attribute name="data-instructions"><xsl:value-of select="$instructionsText"/></xsl:attribute></xsl:if>
        <!-- Transition mode always emitted (never blank) so the JS
             can trust it without a fallback branch. -->
        <xsl:attribute name="data-transition"><xsl:value-of select="$transitionMode"/></xsl:attribute>

        <div class="rbccm-case-studies__container">

          <header class="rbccm-case-studies__header">
            <h2 class="rbccm-case-studies__heading">
              <xsl:if test="$headingId != ''">
                <xsl:attribute name="id"><xsl:value-of select="$headingId"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="$headingId = ''">
                <xsl:attribute name="id">rbccm-case-studies-heading</xsl:attribute>
              </xsl:if>
              <xsl:value-of select="$heading"/>
            </h2>
            <xsl:if test="$intro != ''">
              <p class="rbccm-case-studies__intro"><xsl:value-of select="$intro"/></p>
            </xsl:if>
          </header>

          <!-- Carousel wrapper: [prev arrow] [track] [next arrow] + dots.
               Grid layout swaps between "arrows below track" (<1300) and
               "arrows outside track" (>=1300) — the wrapper breaks out of
               the 1140 rail via negative side margins at >=1300 so the
               arrows sit in the section's gutter. -->
          <div class="rbccm-case-studies__carousel">

            <!-- PREV -->
            <button type="button"
                    class="rbccm-case-studies__btn rbccm-case-studies__btn--prev"
                    tabindex="0">
              <xsl:attribute name="aria-label">
                <xsl:choose>
                  <xsl:when test="$prevArrowAriaLabel != ''"><xsl:value-of select="$prevArrowAriaLabel"/></xsl:when>
                  <xsl:otherwise>Previous case study</xsl:otherwise>
                </xsl:choose>
              </xsl:attribute>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--mobile" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--desktop" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="21" stroke="#003168" stroke-width="2"/>
                <path d="M25 31L16 21.5L25 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- TRACK — slick target. One <div class="__slide"> per bound
                 case study, emitted by the for-each below. -->
            <div class="rbccm-case-studies__track">
              <xsl:for-each select="$slides">
                <xsl:call-template name="render-slide"/>
              </xsl:for-each>
            </div>

            <!-- NEXT -->
            <button type="button"
                    class="rbccm-case-studies__btn rbccm-case-studies__btn--next"
                    tabindex="0">
              <xsl:attribute name="aria-label">
                <xsl:choose>
                  <xsl:when test="$nextArrowAriaLabel != ''"><xsl:value-of select="$nextArrowAriaLabel"/></xsl:when>
                  <xsl:otherwise>Next case study</xsl:otherwise>
                </xsl:choose>
              </xsl:attribute>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--mobile" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--desktop" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="21" stroke="#003168" stroke-width="2"/>
                <path d="M19 31L28 21.5L19 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- DOTS — slick appends its <ul class="slick-dots"> here via
                 the appendDots option in the JS init. -->
            <div class="rbccm-case-studies__dots-wrap"></div>

          </div><!-- /.__carousel -->

          <!-- View all CTA — outlined pill below the dots. Only rendered
               when BOTH label and link are set. -->
          <xsl:if test="$ctaLabel != '' and $ctaLink != ''">
            <div class="rbccm-case-studies__viewall-wrap">
              <a class="rbccm-case-studies__viewall">
                <xsl:attribute name="href"><xsl:value-of select="$ctaLink"/></xsl:attribute>
                <xsl:if test="$ctaNewTab">
                  <xsl:attribute name="target">_blank</xsl:attribute>
                  <xsl:attribute name="rel">noopener</xsl:attribute>
                </xsl:if>
                <xsl:if test="$ariaViewAllLabel != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaViewAllLabel"/></xsl:attribute>
                </xsl:if>
                <xsl:value-of select="$ctaLabel"/>
              </a>
            </div>
          </xsl:if>

        </div><!-- /.__container -->
      </section>

      <!-- ═══ EXTERNAL JS (scoped to #rbccm-case-studies) ═══ -->
      <!-- ═══ INLINE JS ═══
           Full controller inlined for the same single-file reason. -->
      <script type="text/javascript">
        <xsl:text disable-output-escaping="yes"><![CDATA[
/* =========================================================================
   Case Studies Carousel — accessible-slick implementation
   =========================================================================
   Same carousel stack as the rest of rbccm.com: jQuery + slick, preferring
   the accessible-slick build. Mirrors the loader, the arrow wiring and the
   dots container used by story-carousel / leadership-carousel / icon-
   carousel so all four behave and are maintained the same way.

   ---- Config (data attributes on .rbccm-case-studies) --------------------
     data-region-label     accessible-slick regionLabel override (aria)
     data-instructions     accessible-slick instructionsText override (aria)
     data-speed            ms transition speed (default 350)

   ---- Multi-instance -----------------------------------------------------
   All queries are scoped to each .rbccm-case-studies root. A BOUND_FLAG on
   the root prevents double-init if a page injects more markup later —
   consumers can also call window.RBCCMCaseStudiesCarousel.init(ctx) to
   bind newly-added roots (feed scripts, TeamSite preview re-render, etc.).

   Deploy at: /assets/rbccm/js/components/case-studies-carousel.js
             (path referenced from the skin's <script>).
   ========================================================================= */
(function () {
  'use strict';

  var BOUND_FLAG = 'data-case-studies-carousel-bound';

  /* Prefer the accessible-slick build hosted on rbccm.com so we get the
     same screen-reader experience as every page that already includes it;
     fall back to vanilla slick from cdnjs only if that 404s. Straight port
     of the story-carousel / icon-carousel loader. */
  function ensureSlickLoaded(cb) {
    if (typeof window.jQuery === 'undefined') return;   /* no jQuery, no carousel */
    if (typeof window.jQuery.fn.slick !== 'undefined') { cb(); return; }

    var s = document.createElement('script');
    s.src = '/assets/rbccm/js/accessible-slick.min.js';
    s.onload = function () { cb(); };
    s.onerror = function () {
      var fallback = document.createElement('script');
      fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
      fallback.onload = function () { cb(); };
      document.head.appendChild(fallback);
    };
    document.head.appendChild(s);
  }

  function intAttr(root, name, fallback) {
    var n = parseInt(root.getAttribute(name), 10);
    return (!n || n < 1) ? fallback : n;
  }

  function attrOr(root, name, fallback) {
    var v = root.getAttribute(name);
    return (v && v.length) ? v : fallback;
  }

  function init(root) {
    var $ = window.jQuery;
    if (root.getAttribute(BOUND_FLAG) === 'true') return;

    var $root  = $(root);
    var $track = $root.find('.rbccm-case-studies__track');
    var $prev  = $root.find('.rbccm-case-studies__btn--prev');
    var $next  = $root.find('.rbccm-case-studies__btn--next');
    var $dots  = $root.find('.rbccm-case-studies__dots-wrap');

    if (!$track.length || !$track.children().length) return;
    if ($track.hasClass('slick-initialized')) return;
    root.setAttribute(BOUND_FLAG, 'true');

    /* Config — pulled from data-attrs on the root (see XSL). Falls back to
       sensible defaults when the Datum is blank. */
    var cfgSpeed = intAttr(root, 'data-speed', 350);

    /* Region label — accessible-slick's aria-label on the wrapper region.
       Blank Datum → derive from the H2 (heading text is a natural label).
       If the H2 isn't present for some reason, fall back to "carousel". */
    var $heading = $root.find('.rbccm-case-studies__heading').first();
    var headingText = $heading.length ? $.trim($heading.text()) : '';
    var regionLabel = attrOr(root, 'data-region-label', headingText || 'carousel');

    var instructionsText = attrOr(root, 'data-instructions', '');

    /* Transition — 'slide' (default) or 'fade'. The XSL always emits
       this attribute so we can trust attrOr's fallback for the
       edge case of markup that predates the attr. */
    var transition = attrOr(root, 'data-transition', 'slide');

    var opts = {
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: true,
      speed: cfgSpeed,
      adaptiveHeight: false,
      prevArrow: $prev,
      nextArrow: $next,
      appendDots: $dots,
      regionLabel: regionLabel
    };
    /* Fade: cross-fade between cards instead of horizontal slide.
       Requires slidesToShow: 1 (which we have). cssEase defaults
       to 'ease'; leave alone unless a designer flags the fall-off
       feels wrong. */
    if (transition === 'fade') opts.fade = true;
    /* Only pass instructionsText if the author set one — accessible-slick
       renders the sr-only block even for an empty string, which adds
       unwanted markup. */
    if (instructionsText) opts.instructionsText = instructionsText;

    $track.slick(opts);
  }

  function initAll(ctx) {
    var root = (ctx && ctx.querySelectorAll) ? ctx : document;
    var roots = root.querySelectorAll('.rbccm-case-studies');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    ensureSlickLoaded(function () { initAll(); });
  });

  /* Expose init for consumers that inject markup after load (feed scripts,
     TeamSite preview re-render, etc.). */
  window.RBCCMCaseStudiesCarousel = { init: initAll };
})();
        ]]></xsl:text>
      </script>

    </xsl:if><!-- /slideCount >= 1 -->

  </xsl:template>


  <!-- =============================================================
       NAMED TEMPLATE — one slide
       =============================================================
       Called from within the for-each on the CaseStudy Group, so the
       context node is the Group and Datum[@Name=...] resolves relative
       to that Group's own children.

       Field resolution order (per field): override > record > default.
       ============================================================= -->
  <xsl:template name="render-slide">

    <!-- Bound record (see the DCR TREE ↔ ROOT ELEMENT MAP comment at
         the top of this file). If a field access below is silently
         empty in preview, the root name is the first thing to check —
         story-tiles-default and the deals datacapture both root at
         `press_release`, so it's the safe default for article/*. -->
    <xsl:variable name="dcr"     select="Datum[@Name='Case Study Record']/DCR/press_release"/>
    <xsl:variable name="dcrPath" select="Datum[@Name='Case Study Record']/DCR/@path"/>

    <!-- Per-slide overrides — blank means "use the bound record". -->
    <xsl:variable name="ovEyebrow"  select="normalize-space(Datum[@Name='Eyebrow Label (blank = record subcategory or Expertise)'])"/>
    <xsl:variable name="ovTitle"    select="normalize-space(Datum[@Name='Title'])"/>
    <xsl:variable name="ovDescRaw" select="Datum[@Name='Description']"/>
    <xsl:variable name="ovDesc">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$ovDescRaw"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ovImage"    select="normalize-space(Datum[@Name='Card Image']/Image/Path)"/>
    <xsl:variable name="ovImageAlt" select="normalize-space(Datum[@Name='Card Image Alt Text (blank = title)'])"/>
    <xsl:variable name="ovMeta"     select="normalize-space(Datum[@Name='Read Time (e.g. 4 min read)'])"/>
    <xsl:variable name="ovLink"     select="normalize-space(Datum[@Name='Card Link URL'])"/>
    <xsl:variable name="ovNewTab"   select="Datum[@Name='Open Card Link in New Tab'] = 'true'"/>

    <!-- Resolve: override > record > default -->
    <xsl:variable name="eyebrow">
      <xsl:choose>
        <xsl:when test="$ovEyebrow != ''"><xsl:value-of select="$ovEyebrow"/></xsl:when>
        <xsl:when test="normalize-space($dcr/subcategory) != ''"><xsl:value-of select="normalize-space($dcr/subcategory)"/></xsl:when>
        <xsl:otherwise>Expertise</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="titleRaw">
      <xsl:choose>
        <xsl:when test="$ovTitle != ''"><xsl:value-of select="$ovTitle"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$dcr/title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="title">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$titleRaw"/></xsl:call-template>
    </xsl:variable>

    <xsl:variable name="descRaw">
      <xsl:choose>
        <xsl:when test="$ovDesc != ''"><xsl:value-of select="$ovDesc"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$dcr/description"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="desc">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$descRaw"/></xsl:call-template>
    </xsl:variable>

    <xsl:variable name="imagePath">
      <xsl:choose>
        <xsl:when test="$ovImage != ''"><xsl:value-of select="$ovImage"/></xsl:when>
        <!-- The story DCR's thumbnail field name may be `thumbnail`,
             `hero_image`, `image`, or nested under a media element.
             Adjust the path here to match the actual DCR schema in
             your Teamsite if this comes up empty. -->
        <xsl:otherwise><xsl:value-of select="normalize-space($dcr/thumbnail)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="imageAlt">
      <xsl:choose>
        <xsl:when test="$ovImageAlt != ''"><xsl:value-of select="$ovImageAlt"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="meta">
      <xsl:choose>
        <xsl:when test="$ovMeta != ''"><xsl:value-of select="$ovMeta"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($dcr/time_to_read)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="link">
      <xsl:choose>
        <xsl:when test="$ovLink != ''"><xsl:value-of select="$ovLink"/></xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="story-url"><xsl:with-param name="path" select="$dcrPath"/></xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Skip slides that have neither a title nor a bound record. A
         card with no headline isn't a card. -->
    <xsl:if test="$title != '' or $dcr">
      <div class="rbccm-case-studies__slide">
        <a class="rbccm-case-studies__card">
          <xsl:attribute name="href">
            <xsl:choose>
              <xsl:when test="$link != ''"><xsl:value-of select="$link"/></xsl:when>
              <xsl:otherwise>#</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:if test="$ovNewTab">
            <xsl:attribute name="target">_blank</xsl:attribute>
            <xsl:attribute name="rel">noopener</xsl:attribute>
          </xsl:if>

          <div class="rbccm-case-studies__media">
            <xsl:if test="$imagePath != ''">
              <img loading="lazy">
                <xsl:attribute name="src"><xsl:value-of select="$imagePath"/></xsl:attribute>
                <xsl:attribute name="alt"><xsl:value-of select="$imageAlt"/></xsl:attribute>
              </img>
            </xsl:if>
          </div>

          <div class="rbccm-case-studies__body">
            <p class="rbccm-case-studies__eyebrow"><xsl:value-of select="$eyebrow"/></p>
            <div class="rbccm-case-studies__divider" aria-hidden="true"></div>
            <h3 class="rbccm-case-studies__title"><xsl:value-of select="$title"/></h3>
            <xsl:if test="$desc != ''">
              <p class="rbccm-case-studies__desc"><xsl:value-of select="$desc"/></p>
            </xsl:if>
            <xsl:if test="$meta != ''">
              <span class="rbccm-case-studies__cta">
                <xsl:value-of select="$meta"/>
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true"><path d="M2 0L1 1l3 4-3 4 1 1 4-5z"/></svg>
              </span>
            </xsl:if>
          </div>
        </a>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
