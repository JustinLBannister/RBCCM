<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Two-Up Cards  |  XSL skin
  ============================================================
  Reads the Preset + card Datums from Properties and renders a
  reusable 2-up card row.

  Presets
  ============================================================
    features        MAAS+MATA parity. Dark section. Cards hold
                    eyebrow + title + body + 5-slot bullet list.
    video-callouts  Find conviction parity. Light section. Cards
                    lead with a media zone (image + play button)
                    then title + optional subtitle + body + CTA.

  Card content is rendered by preset-branched templates so the
  DOM stays clean per preset (no bullet list ever appears under
  video-callouts, no media zone ever appears under features).
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Tag allow-list guard. -->
  <xsl:template name="pickTag">
    <xsl:param name="raw"/>
    <xsl:param name="default"/>
    <xsl:choose>
      <xsl:when test="$raw = 'h1' or $raw = 'h2' or $raw = 'h3' or $raw = 'h4' or $raw = 'h5' or $raw = 'h6' or $raw = 'p' or $raw = 'div' or $raw = 'span'">
        <xsl:value-of select="$raw"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$default"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ============================================================
       renderFeatureCard  (Preset = features)
       Emits eyebrow -> title -> body -> bullet list.
       ============================================================ -->
  <xsl:template name="renderFeatureCard">
    <xsl:param name="n"/>
    <xsl:param name="theme"/>
    <xsl:param name="eyebrow"/>
    <xsl:param name="title"/>
    <xsl:param name="body"/>

    <article>
      <xsl:attribute name="class">
        rbccm-two-up-cards__card
        <xsl:choose>
          <xsl:when test="$theme = 'light'">rbccm-two-up-cards__card--light</xsl:when>
          <xsl:otherwise>rbccm-two-up-cards__card--dark</xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>

      <xsl:if test="$eyebrow != ''">
        <div class="rbccm-two-up-cards__card-eyebrow"><xsl:value-of select="$eyebrow"/></div>
      </xsl:if>

      <h3 class="rbccm-two-up-cards__card-title"><xsl:value-of select="$title"/></h3>

      <xsl:if test="$body != ''">
        <p class="rbccm-two-up-cards__card-body"><xsl:value-of select="$body" disable-output-escaping="yes"/></p>
      </xsl:if>

      <!-- Bullet list. Reads Card{N}Bullet1 through Card{N}Bullet5.
           Only bullets with non-blank text render. -->
      <xsl:variable name="b1" select="normalize-space(//Datum[@ID=concat('Card', $n, 'Bullet1Text')]/text()[last()])"/>
      <xsl:variable name="b2" select="normalize-space(//Datum[@ID=concat('Card', $n, 'Bullet2Text')]/text()[last()])"/>
      <xsl:variable name="b3" select="normalize-space(//Datum[@ID=concat('Card', $n, 'Bullet3Text')]/text()[last()])"/>
      <xsl:variable name="b4" select="normalize-space(//Datum[@ID=concat('Card', $n, 'Bullet4Text')]/text()[last()])"/>
      <xsl:variable name="b5" select="normalize-space(//Datum[@ID=concat('Card', $n, 'Bullet5Text')]/text()[last()])"/>

      <xsl:if test="$b1 != '' or $b2 != '' or $b3 != '' or $b4 != '' or $b5 != ''">
        <ul class="rbccm-two-up-cards__card-bullets">
          <xsl:if test="$b1 != ''"><li class="rbccm-two-up-cards__card-bullet-item"><xsl:value-of select="$b1"/></li></xsl:if>
          <xsl:if test="$b2 != ''"><li class="rbccm-two-up-cards__card-bullet-item"><xsl:value-of select="$b2"/></li></xsl:if>
          <xsl:if test="$b3 != ''"><li class="rbccm-two-up-cards__card-bullet-item"><xsl:value-of select="$b3"/></li></xsl:if>
          <xsl:if test="$b4 != ''"><li class="rbccm-two-up-cards__card-bullet-item"><xsl:value-of select="$b4"/></li></xsl:if>
          <xsl:if test="$b5 != ''"><li class="rbccm-two-up-cards__card-bullet-item"><xsl:value-of select="$b5"/></li></xsl:if>
        </ul>
      </xsl:if>
    </article>
  </xsl:template>

  <!-- ============================================================
       renderVideoCard  (Preset = video-callouts)
       Emits media (with play button) -> title -> subtitle -> body -> CTA.
       ============================================================ -->
  <xsl:template name="renderVideoCard">
    <xsl:param name="n"/>
    <xsl:param name="mediaPath"/>
    <xsl:param name="mediaAlt"/>
    <xsl:param name="videoUrl"/>
    <xsl:param name="title"/>
    <xsl:param name="subtitle"/>
    <xsl:param name="body"/>
    <xsl:param name="ctaLabel"/>
    <xsl:param name="ctaHref"/>

    <article class="rbccm-two-up-cards__card">

      <!-- Media zone. Rendered as a button when videoUrl is set so
           screen readers understand it's actionable and it takes
           keyboard focus. When no videoUrl, renders as a plain img
           with no play overlay. Play SVG uses Figma's 56x56 viewBox
           and its triangle path (path fill white sits over the CSS
           navy-45%-fill + backdrop-blur circle on __card-play). -->
      <xsl:choose>
        <xsl:when test="$videoUrl != ''">
          <button type="button" class="rbccm-two-up-cards__card-media" data-video-url="{$videoUrl}" aria-label="Play video: {$title}">
            <img alt="{$mediaAlt}" loading="lazy" decoding="async">
              <xsl:attribute name="src"><xsl:value-of select="$mediaPath"/></xsl:attribute>
            </img>
            <span class="rbccm-two-up-cards__card-play" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                <path d="M36.6895 28.4828L22.9308 36.4264L22.9308 20.5393L36.6895 28.4828Z" fill="white"/>
              </svg>
            </span>
          </button>
        </xsl:when>
        <xsl:when test="$mediaPath != ''">
          <div class="rbccm-two-up-cards__card-media">
            <img alt="{$mediaAlt}" loading="lazy" decoding="async">
              <xsl:attribute name="src"><xsl:value-of select="$mediaPath"/></xsl:attribute>
            </img>
          </div>
        </xsl:when>
      </xsl:choose>

      <!-- Content: text group at top (title-block + body), CTA pinned
           at bottom via parent justify-content: space-between. -->
      <div class="rbccm-two-up-cards__card-content">
        <div class="rbccm-two-up-cards__card-text">
          <div class="rbccm-two-up-cards__card-headline">
            <h3 class="rbccm-two-up-cards__card-title"><xsl:value-of select="$title"/></h3>
            <xsl:if test="$subtitle != ''">
              <p class="rbccm-two-up-cards__card-subtitle"><xsl:value-of select="$subtitle"/></p>
            </xsl:if>
          </div>
          <xsl:if test="$body != ''">
            <p class="rbccm-two-up-cards__card-body"><xsl:value-of select="$body" disable-output-escaping="yes"/></p>
          </xsl:if>
        </div>

        <xsl:if test="$ctaLabel != ''">
          <a class="rbccm-two-up-cards__card-cta">
            <xsl:attribute name="href">
              <xsl:choose>
                <xsl:when test="$ctaHref != ''"><xsl:value-of select="$ctaHref"/></xsl:when>
                <xsl:otherwise>#</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            <span><xsl:value-of select="$ctaLabel"/></span>
            <!-- Figma arrow icon (16x16, fill via currentColor so the
                 link colour flows through to the glyph). -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.00002C1.5 7.86741 1.55268 7.74024 1.64645 7.64647C1.74021 7.5527 1.86739 7.50002 2 7.50002H13.793L10.646 4.35402C10.5521 4.26013 10.4994 4.1328 10.4994 4.00002C10.4994 3.86725 10.5521 3.73991 10.646 3.64602C10.7399 3.55213 10.8672 3.49939 11 3.49939C11.1328 3.49939 11.2601 3.55213 11.354 3.64602L15.354 7.64602C15.4006 7.69247 15.4375 7.74764 15.4627 7.80839C15.4879 7.86913 15.5009 7.93425 15.5009 8.00002C15.5009 8.06579 15.4879 8.13091 15.4627 8.19165C15.4375 8.2524 15.4006 8.30758 15.354 8.35402L11.354 12.354C11.2601 12.4479 11.1328 12.5007 11 12.5007C10.8672 12.5007 10.7399 12.4479 10.646 12.354C10.5521 12.2601 10.4994 12.1328 10.4994 12C10.4994 11.8672 10.5521 11.7399 10.646 11.646L13.793 8.50002H2C1.86739 8.50002 1.74021 8.44734 1.64645 8.35357C1.55268 8.25981 1.5 8.13263 1.5 8.00002Z" fill="currentColor"/>
            </svg>
          </a>
        </xsl:if>
      </div>
    </article>
  </xsl:template>

  <!-- ============================================================
       renderCardSlot : per-slot lookup + preset dispatcher.
       ============================================================ -->
  <xsl:template name="renderCardSlot">
    <xsl:param name="n"/>
    <xsl:param name="preset"/>

    <xsl:variable name="title"     select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()])"/>
    <xsl:variable name="theme"     select="normalize-space(//Datum[@ID=concat('Card', $n, 'Theme')]/text()[last()])"/>
    <xsl:variable name="eyebrow"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'EyebrowText')]/text()[last()])"/>
    <xsl:variable name="body"      select="//Datum[@ID=concat('Card', $n, 'BodyText')]"/>
    <xsl:variable name="mediaPath" select="normalize-space(//Datum[@ID=concat('Card', $n, 'MediaImagePath')]/text()[last()])"/>
    <xsl:variable name="mediaAlt"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'MediaImageAlt')]/text()[last()])"/>
    <xsl:variable name="videoUrl"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'VideoUrl')]/text()[last()])"/>
    <xsl:variable name="subtitle"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'SubtitleText')]/text()[last()])"/>
    <xsl:variable name="ctaLabel"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaLabel')]/text()[last()])"/>
    <xsl:variable name="ctaHref"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaHref')]/text()[last()])"/>

    <!-- Blank title hides the whole card. -->
    <xsl:if test="$title != ''">
      <xsl:choose>
        <xsl:when test="$preset = 'video-callouts'">
          <xsl:call-template name="renderVideoCard">
            <xsl:with-param name="n" select="$n"/>
            <xsl:with-param name="mediaPath" select="$mediaPath"/>
            <xsl:with-param name="mediaAlt" select="$mediaAlt"/>
            <xsl:with-param name="videoUrl" select="$videoUrl"/>
            <xsl:with-param name="title" select="$title"/>
            <xsl:with-param name="subtitle" select="$subtitle"/>
            <xsl:with-param name="body" select="$body"/>
            <xsl:with-param name="ctaLabel" select="$ctaLabel"/>
            <xsl:with-param name="ctaHref" select="$ctaHref"/>
          </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="renderFeatureCard">
            <xsl:with-param name="n" select="$n"/>
            <xsl:with-param name="theme" select="$theme"/>
            <xsl:with-param name="eyebrow" select="$eyebrow"/>
            <xsl:with-param name="title" select="$title"/>
            <xsl:with-param name="body" select="$body"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="PRESET"        select="normalize-space(//Datum[@ID='Preset']/text()[last()])"/>
    <xsl:variable name="BG_COLOR"      select="normalize-space(//Datum[@ID='SectionBgColor']/text()[last()])"/>

    <xsl:variable name="EYEBROW"       select="normalize-space(//Datum[@ID='SectionEyebrowText']/text()[last()])"/>
    <xsl:variable name="HEADING"       select="normalize-space(//Datum[@ID='SectionHeadingText']/text()[last()])"/>
    <xsl:variable name="HEADING_TAG_RAW" select="normalize-space(//Datum[@ID='SectionHeadingTag']/text()[last()])"/>
    <xsl:variable name="DESCRIPTION"   select="normalize-space(//Datum[@ID='SectionDescriptionText']/text()[last()])"/>

    <xsl:variable name="HEADING_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$HEADING_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Stylesheet hoist. -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <!-- Preset-to-variant-class map. -->
    <xsl:variable name="VARIANT_CLASS">
      <xsl:choose>
        <xsl:when test="$PRESET = 'video-callouts'">rbccm-two-up-cards--video-callouts</xsl:when>
        <xsl:otherwise>rbccm-two-up-cards--features</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <section>
      <xsl:attribute name="class">rbccm-two-up-cards <xsl:value-of select="$VARIANT_CLASS"/></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$HEADING"/></xsl:attribute>
        </xsl:when>
      </xsl:choose>
      <!-- Optional section background colour override. -->
      <xsl:if test="$BG_COLOR != ''">
        <xsl:attribute name="style">--rbccm-two-up-cards-bg: <xsl:value-of select="$BG_COLOR"/>;</xsl:attribute>
      </xsl:if>

      <xsl:if test="$EYEBROW != '' or $HEADING != '' or $DESCRIPTION != ''">
        <div class="rbccm-two-up-cards__header">
          <xsl:if test="$EYEBROW != ''">
            <p class="rbccm-two-up-cards__eyebrow" data-animate="fadeInUp"><xsl:value-of select="$EYEBROW"/></p>
          </xsl:if>
          <xsl:if test="$HEADING != ''">
            <xsl:element name="{$HEADING_TAG}">
              <xsl:attribute name="class">rbccm-two-up-cards__heading</xsl:attribute>
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:attribute name="data-animate-delay">120</xsl:attribute>
              <xsl:value-of select="$HEADING"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$DESCRIPTION != ''">
            <p class="rbccm-two-up-cards__description" data-animate="fadeInUp" data-animate-delay="240">
              <xsl:value-of select="$DESCRIPTION" disable-output-escaping="yes"/>
            </p>
          </xsl:if>
        </div>
      </xsl:if>

      <div class="rbccm-two-up-cards__grid" data-stagger-parent="fadeInUp" data-stagger-step="150">
        <xsl:call-template name="renderCardSlot">
          <xsl:with-param name="n" select="1"/>
          <xsl:with-param name="preset" select="$PRESET"/>
        </xsl:call-template>
        <xsl:call-template name="renderCardSlot">
          <xsl:with-param name="n" select="2"/>
          <xsl:with-param name="preset" select="$PRESET"/>
        </xsl:call-template>
      </div>

    </section>

    <!-- JS only loaded when video-callouts preset is active (only preset
         that needs the modal). Feature preset stays JS-free. -->
    <xsl:if test="$PRESET = 'video-callouts' and $JS_PATH != ''">
      <script>
        <xsl:attribute name="src">
          <xsl:value-of select="$JS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </script>
    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
