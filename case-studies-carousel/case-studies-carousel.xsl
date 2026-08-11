<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: RBC CM Case Studies Carousel (v2 - URL-driven)
       ===================================================================
       Replaces the earlier DCR-picker skin that hung TeamSite's
       publish walk. Each slide is now just a URL Datum - the JS
       runtime fetches the shared case-studies feed
         /en/expertise/transactions/data/case-studies.page
       matches each slide's URL to a feed record by slug, and
       hydrates the tile markup from the feed.

       XSL role is now trivial: emit a section shell + one empty
       <div class="rbccm-case-studies__slide" data-cs-url="..."/>
       per slide. Zero DCR walking, zero external calls, zero
       deploy-time dep resolution. Publish is instant.

       Deploy alongside this skin:
         /assets/rbccm/css/components/case-studies-carousel.css
         /assets/rbccm/js/components/case-studies-carousel.js
       =================================================================== -->

  <xsl:output method="html" indent="no" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>


  <!-- ═══════════════════════════════════════════════════════════════════
       clean - fold non-breaking spaces + collapse whitespace.
       XSLT-1.0 compatible (uses only translate() and normalize-space()). -->
  <xsl:template name="clean">
    <xsl:param name="s" select="''"/>
    <xsl:value-of select="normalize-space(translate(string($s), '&#160;', ' '))"/>
  </xsl:template>


  <!-- ═══════════════════════════════════════════════════════════════════
       Main - assemble the section shell.
       =================================================================== -->
  <xsl:template match="/">

    <!-- Heading (blank falls back to "Signature case studies") -->
    <xsl:variable name="headingRaw" select="/Properties/Datum[@ID='Heading']"/>
    <xsl:variable name="heading">
      <xsl:choose>
        <xsl:when test="normalize-space($headingRaw) != ''">
          <xsl:call-template name="clean"><xsl:with-param name="s" select="$headingRaw"/></xsl:call-template>
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
    <xsl:variable name="ctaLabel"        select="normalize-space(/Properties/Datum[@ID='CtaLabel'])"/>
    <xsl:variable name="ctaLink"         select="normalize-space(/Properties/Datum[@ID='CtaLink'])"/>
    <xsl:variable name="ctaNewTab"       select="/Properties/Datum[@ID='CtaNewTab'] = 'true'"/>
    <xsl:variable name="ariaViewAllLabel" select="normalize-space(/Properties/Datum[@ID='AriaViewAllLabel'])"/>

    <!-- Feed URL - blank falls back to the shared feed page. -->
    <xsl:variable name="feedUrl">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='FeedUrl']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='FeedUrl'])"/>
        </xsl:when>
        <xsl:otherwise>/en/expertise/transactions/data/case-studies.page</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Accessibility overrides - piped to slick via data attrs on the
         root; the JS init reads them and falls back to defaults when blank. -->
    <xsl:variable name="regionLabel"        select="normalize-space(/Properties/Datum[@ID='RegionLabel'])"/>
    <xsl:variable name="instructionsText"   select="normalize-space(/Properties/Datum[@ID='InstructionsText'])"/>
    <xsl:variable name="prevArrowAriaLabel" select="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel'])"/>
    <xsl:variable name="nextArrowAriaLabel" select="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel'])"/>

    <!-- Transition mode - case-insensitive; unknown values default to slide. -->
    <xsl:variable name="transitionMode">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Datum[@ID='TransitionMode']),
                                  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                                  'abcdefghijklmnopqrstuvwxyz') = 'fade'">fade</xsl:when>
        <xsl:otherwise>slide</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Slides - one Group per slide, only Url is required. -->
    <xsl:variable name="slides"     select="/Properties/Data/Group[@ID='Slide' or @Name='Case Study Slide']"/>
    <xsl:variable name="slideCount" select="count($slides)"/>

    <!-- Padding overrides - inline CSS vars on the section root. -->
    <xsl:variable name="padTopMobile"     select="normalize-space(/Properties/Datum[@ID='PadTopMobile'])"/>
    <xsl:variable name="padBottomMobile"  select="normalize-space(/Properties/Datum[@ID='PadBottomMobile'])"/>
    <xsl:variable name="padTopDesktop"    select="normalize-space(/Properties/Datum[@ID='PadTopDesktop'])"/>
    <xsl:variable name="padBottomDesktop" select="normalize-space(/Properties/Datum[@ID='PadBottomDesktop'])"/>
    <xsl:variable name="hasPadOverride"
                  select="$padTopMobile != '' or $padBottomMobile != ''
                       or $padTopDesktop != '' or $padBottomDesktop != ''"/>


    <!-- Gate at >= 3 slide Datums with a non-empty URL. Below that
         the carousel has less visual weight than a single hero card
         (2 dots looks broken, 1 dot pointless). Author can queue
         URLs whose case studies don't yet exist in the feed - the
         gate is markup-level; feed misses drop out at runtime. -->
    <xsl:variable name="filledSlideCount"
                  select="count($slides[normalize-space(Datum[@ID='Url' or @Name='Case Study URL']) != ''])"/>

    <xsl:if test="$filledSlideCount &gt;= 3">

      <!-- ═══ EXTERNAL CSS ═══ -->
      <link rel="stylesheet" href="/assets/rbccm/css/components/case-studies-carousel.css"/>

      <!-- Inline padding overrides. -->
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
           MARKUP - shell only. JS hydrates each slide from the feed.
           ═══════════════════════════════════════════════════════════ -->
      <section class="rbccm-case-studies" id="rbccm-case-studies">
        <xsl:attribute name="aria-label"><xsl:value-of select="$ariaLabel"/></xsl:attribute>
        <!-- Data attrs picked up by case-studies-carousel.js: feed URL,
             a11y overrides, transition mode. Blank Datums emit no
             attribute, which the JS treats as "use default". -->
        <xsl:attribute name="data-feed-url"><xsl:value-of select="$feedUrl"/></xsl:attribute>
        <xsl:if test="$regionLabel      != ''"><xsl:attribute name="data-region-label"><xsl:value-of select="$regionLabel"/></xsl:attribute></xsl:if>
        <xsl:if test="$instructionsText != ''"><xsl:attribute name="data-instructions"><xsl:value-of select="$instructionsText"/></xsl:attribute></xsl:if>
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

            <!-- TRACK - one empty shell per slide. JS matches
                 data-cs-url to a feed record and injects the tile. -->
            <div class="rbccm-case-studies__track">
              <xsl:for-each select="$slides">
                <xsl:variable name="url" select="normalize-space(Datum[@ID='Url' or @Name='Case Study URL'])"/>
                <xsl:if test="$url != ''">
                  <div class="rbccm-case-studies__slide">
                    <xsl:attribute name="data-cs-url"><xsl:value-of select="$url"/></xsl:attribute>
                    <xsl:variable name="ovEyebrow"  select="normalize-space(Datum[@ID='Eyebrow'  or @Name='Eyebrow Override (blank = use feed)'])"/>
                    <xsl:variable name="ovReadTime" select="normalize-space(Datum[@ID='ReadTime' or @Name='Read Time Override (blank = use feed)'])"/>
                    <xsl:if test="$ovEyebrow  != ''"><xsl:attribute name="data-cs-eyebrow"><xsl:value-of select="$ovEyebrow"/></xsl:attribute></xsl:if>
                    <xsl:if test="$ovReadTime != ''"><xsl:attribute name="data-cs-readtime"><xsl:value-of select="$ovReadTime"/></xsl:attribute></xsl:if>
                  </div>
                </xsl:if>
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

            <!-- DOTS - slick appends <ul.slick-dots> here via appendDots. -->
            <div class="rbccm-case-studies__dots-wrap"></div>

          </div><!-- /.__carousel -->

          <!-- View all CTA - only rendered when BOTH label and link are set. -->
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

      <!-- ═══ EXTERNAL JS ═══ -->
      <script src="/assets/rbccm/js/components/case-studies-carousel.js"></script>

    </xsl:if><!-- /filledSlideCount >= 3 -->

  </xsl:template>

</xsl:stylesheet>
