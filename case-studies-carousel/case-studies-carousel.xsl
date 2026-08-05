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

       Deploy alongside this skin:
         /assets/rbccm/css/components/case-studies-carousel.css
         /assets/rbccm/js/components/case-studies-carousel.js
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
      <link rel="stylesheet" href="/assets/rbccm/css/components/case-studies-carousel.css"/>

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
      <script src="/assets/rbccm/js/components/case-studies-carousel.js"></script>

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
