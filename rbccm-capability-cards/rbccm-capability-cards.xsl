<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Capability Cards  |  XSL skin
  ============================================================
  Reads the Preset + card Datums from Properties and renders a
  row of 3-6 identical capability cards on a dark navy section.

  Presets
  ============================================================
    capabilities-3   3 cards at desktop
    capabilities-4   4 cards at desktop
    capabilities-5   5 cards at desktop
    capabilities-6   6 cards at desktop

  Icon system
  ============================================================
  Cards use inline SVG icons drawn from a built-in sprite. Editors
  pick an icon by name via Card{N}IconType (chart, building, globe,
  search, exchange, layers, info, chart-trend). The sprite <defs>
  block below carries every icon path so no external asset load
  is required. Icons inherit currentColor from .rbccm-capability-cards__icon
  so the yellow accent flows through.

  Below 1245px the JS runtime attaches Slick to the track; above
  1245 the CSS grid handles layout with no JS involved.
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

  <!-- Preset-to-card-count map. -->
  <xsl:template name="cardCountForPreset">
    <xsl:param name="preset"/>
    <xsl:choose>
      <xsl:when test="$preset = 'capabilities-3'">3</xsl:when>
      <xsl:when test="$preset = 'capabilities-5'">5</xsl:when>
      <xsl:when test="$preset = 'capabilities-6'">6</xsl:when>
      <xsl:otherwise>4</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Emit an icon by name. Class lives directly on the SVG element
       (MATA pattern — no wrapper), so the __icon rule's 30x30 sizing
       and yellow color apply straight to the SVG. Falls back to the
       chart-trend glyph when the Datum doesn't match a known icon. -->
  <xsl:template name="renderIcon">
    <xsl:param name="type"/>
    <xsl:choose>
      <xsl:when test="$type = 'building'">
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M15 0L2.6 5.6H0.9V10.3h1V24.4L0 28.8V30H29.9V28.8L29 24.4V10.3h1V6.6L27.4 5.6L15 0zM22.9 5.6H7.1L15 1.9L22.9 5.6zM26.2 11.2V24.4H24.4V11.2H26.2zM22.5 11.2V24.4H17.8V11.2H22.5zM15.9 11.2V24.4H14.1V11.2H15.9zM12.2 11.2V24.4H7.5V11.2H12.2zM5.6 11.2V24.4H3.8V11.2H5.6zM1.9 9.4V7.5H28.1V9.4H1.9zM2.6 26.3H27.4L27.9 28.1H2.1L2.6 26.3z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:when test="$type = 'globe'">
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M15 0C6.7 0 0 6.7 0 15C0 23.3 6.7 30 15 30C23.3 30 30 23.3 30 15C30 6.7 23.3 0 15 0zM15 2.5C21.4 2.5 26.8 6.5 27.5 12H21.7C21.3 8.4 20.3 5 18.7 2.8C17.5 3 16.3 3 15 3C13.7 3 12.5 3 11.3 2.8C9.7 5 8.7 8.4 8.3 12H2.5C3.2 6.5 8.6 2.5 15 2.5zM12.5 15C12.5 13.4 12.6 11.9 12.8 10.5H17.2C17.4 11.9 17.5 13.4 17.5 15C17.5 16.6 17.4 18.1 17.2 19.5H12.8C12.6 18.1 12.5 16.6 12.5 15zM2.5 15C2.5 14.1 2.6 13.3 2.8 12.5H8.3C8.1 13.3 8 14.1 8 15C8 15.9 8.1 16.7 8.3 17.5H2.8C2.6 16.7 2.5 15.9 2.5 15zM21.7 17.5C21.9 16.7 22 15.9 22 15C22 14.1 21.9 13.3 21.7 12.5H27.2C27.4 13.3 27.5 14.1 27.5 15C27.5 15.9 27.4 16.7 27.2 17.5H21.7zM15 27.5C13.7 27.5 12.5 24.9 11.6 20H18.4C17.5 24.9 16.3 27.5 15 27.5z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:when test="$type = 'search'">
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M7.98 19.39C6.17 16.92 5.35 13.84 5.71 10.79C6.06 7.74 7.55 4.93 9.88 2.94C12.21 0.94 15.21 -0.11 18.28 0.01C21.35 0.13 24.26 1.4 26.43 3.57C28.6 5.75 29.88 8.66 29.99 11.73C30.11 14.8 29.06 17.8 27.06 20.13C25.06 22.46 22.25 23.95 19.2 24.3C16.15 24.65 13.08 23.83 10.6 22.02C10.55 22.09 10.49 22.16 10.42 22.23L3.2 29.45C2.85 29.8 2.37 30 1.88 30C1.38 30 0.9 29.8 0.55 29.45C0.2 29.1 0 28.62 0 28.13C0 27.63 0.2 27.15 0.55 26.8L7.77 19.58C7.83 19.51 7.91 19.45 7.98 19.39zM7.5 12.19C7.5 17.71 11.98 22.19 17.5 22.19C23.02 22.19 27.5 17.71 27.5 12.19C27.5 6.66 23.02 2.19 17.5 2.19C11.98 2.19 7.5 6.66 7.5 12.19z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:when test="$type = 'exchange'">
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M8.3 2.5L3.3 7.5H23.8V10H0L8.3 2.5zM21.7 27.5L26.7 22.5H6.2V20H30L21.7 27.5z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:when test="$type = 'layers'">
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M15 1.25L1.25 8.75L15 16.25L28.75 8.75L15 1.25zM3.75 15L15 21.25L26.25 15L28.75 16.25L15 23.75L1.25 16.25L3.75 15zM3.75 21.25L15 27.5L26.25 21.25L28.75 22.5L15 30L1.25 22.5L3.75 21.25z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:when test="$type = 'info'">
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M15 0C6.7 0 0 6.7 0 15C0 23.3 6.7 30 15 30C23.3 30 30 23.3 30 15C30 6.7 23.3 0 15 0zM15 2.5C21.9 2.5 27.5 8.1 27.5 15C27.5 21.9 21.9 27.5 15 27.5C8.1 27.5 2.5 21.9 2.5 15C2.5 8.1 8.1 2.5 15 2.5zM13.75 6.25V8.75H16.25V6.25H13.75zM13.75 12.5V22.5H16.25V12.5H13.75z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:otherwise>
        <!-- Default: chart-trend (bars with a rising trend line). -->
        <svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><rect x="2" y="18" width="4" height="10" fill="currentColor"/><rect x="9" y="13" width="4" height="15" fill="currentColor"/><rect x="16" y="8" width="4" height="20" fill="currentColor"/><rect x="23" y="3" width="4" height="25" fill="currentColor"/><path d="M2 20L9 15L16 10L23 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Shared card body — the guts inside __content (icon + title +
       optional subtitle + body + optional CTA). Called from both
       branches of renderCard so the anchor and article variants share
       one source of truth. -->
  <xsl:template name="renderCardContent">
    <xsl:param name="iconType"/>
    <xsl:param name="title"/>
    <xsl:param name="subtitle"/>
    <xsl:param name="body"/>
    <xsl:param name="ctaLabel"/>

    <div class="rbccm-capability-cards__content">
      <xsl:call-template name="renderIcon"><xsl:with-param name="type" select="$iconType"/></xsl:call-template>
      <h3 class="rbccm-capability-cards__title"><xsl:value-of select="$title"/></h3>
      <xsl:if test="$subtitle != ''">
        <p class="rbccm-capability-cards__subtitle"><xsl:value-of select="$subtitle"/></p>
      </xsl:if>
      <p class="rbccm-capability-cards__body"><xsl:value-of select="$body" disable-output-escaping="yes"/></p>
      <!-- CTA chip. Rendered whenever a label is present — the parent
           renderCard branch has already decided whether the card is an
           <a> (link semantics live on the card, not the chip) or a
           static <article>. The chip is presentational either way. -->
      <xsl:if test="$ctaLabel != ''">
        <span class="rbccm-capability-cards__cta">
          <span><xsl:value-of select="$ctaLabel"/></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.00014C1.5 7.86753 1.55268 7.74036 1.64645 7.64659C1.74021 7.55282 1.86739 7.50014 2 7.50014H13.793L10.646 4.35414C10.5521 4.26026 10.4994 4.13292 10.4994 4.00014C10.4994 3.86737 10.5521 3.74003 10.646 3.64614C10.7399 3.55226 10.8672 3.49951 11 3.49951C11.1328 3.49951 11.2601 3.55226 11.354 3.64614L15.354 7.64614C15.4006 7.69259 15.4375 7.74776 15.4627 7.80851C15.4879 7.86926 15.5009 7.93438 15.5009 8.00014C15.5009 8.06591 15.4879 8.13103 15.4627 8.19178C15.4375 8.25252 15.4006 8.3077 15.354 8.35414L11.354 12.3541C11.2601 12.448 11.1328 12.5008 11 12.5008C10.8672 12.5008 10.7399 12.448 10.646 12.3541C10.5521 12.2603 10.4994 12.1329 10.4994 12.0001C10.4994 11.8674 10.5521 11.74 10.646 11.6461L13.793 8.50014H2C1.86739 8.50014 1.74021 8.44746 1.64645 8.3537C1.55268 8.25993 1.5 8.13275 1.5 8.00014Z" fill="currentColor"/></svg>
        </span>
      </xsl:if>
    </div>
  </xsl:template>

  <!-- Render one card. Skipped when title is blank.
       Conditional wrapper: when a CtaHref is provided the whole card
       becomes an <a> (the __cta chip inside is decorative — the click
       target is the card). Without a href it renders as a static
       <article>. Card guts live inside a shared __content wrapper so
       the CSS's `margin-top: auto` push on __cta bottom-aligns the
       chip across mixed-height cards. -->
  <xsl:template name="renderCard">
    <xsl:param name="n"/>

    <xsl:variable name="title"    select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()])"/>
    <xsl:variable name="iconType" select="normalize-space(//Datum[@ID=concat('Card', $n, 'IconType')]/text()[last()])"/>
    <xsl:variable name="subtitle" select="normalize-space(//Datum[@ID=concat('Card', $n, 'SubtitleText')]/text()[last()])"/>
    <xsl:variable name="body"     select="//Datum[@ID=concat('Card', $n, 'BodyText')]"/>
    <xsl:variable name="ctaLabel" select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaLabel')]/text()[last()])"/>
    <xsl:variable name="ctaHref"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaHref')]/text()[last()])"/>

    <xsl:if test="$title != ''">
      <xsl:choose>
        <xsl:when test="$ctaHref != ''">
          <!-- Anchor variant: whole card is the link. aria-label sets
               a descriptive accessible name combining title + CTA. -->
          <a class="rbccm-capability-cards__card">
            <xsl:attribute name="href"><xsl:value-of select="$ctaHref"/></xsl:attribute>
            <xsl:attribute name="aria-label">
              <xsl:value-of select="$title"/>
              <xsl:if test="$ctaLabel != ''"> — <xsl:value-of select="$ctaLabel"/></xsl:if>
            </xsl:attribute>
            <xsl:call-template name="renderCardContent">
              <xsl:with-param name="iconType" select="$iconType"/>
              <xsl:with-param name="title"    select="$title"/>
              <xsl:with-param name="subtitle" select="$subtitle"/>
              <xsl:with-param name="body"     select="$body"/>
              <xsl:with-param name="ctaLabel" select="$ctaLabel"/>
            </xsl:call-template>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <!-- Static variant: no href, no CTA — pure informational card. -->
          <article class="rbccm-capability-cards__card">
            <xsl:call-template name="renderCardContent">
              <xsl:with-param name="iconType" select="$iconType"/>
              <xsl:with-param name="title"    select="$title"/>
              <xsl:with-param name="subtitle" select="$subtitle"/>
              <xsl:with-param name="body"     select="$body"/>
              <xsl:with-param name="ctaLabel" select="''"/>
            </xsl:call-template>
          </article>
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
    <xsl:variable name="MAX_WIDTH_RAW" select="normalize-space(//Datum[@ID='SectionMaxWidth']/text()[last()])"/>
    <!-- Accept bare integers ("1140") or values with a CSS unit
         ("1140px", "72rem"). Bare integers get a px suffix appended. -->
    <xsl:variable name="MAX_WIDTH">
      <xsl:choose>
        <xsl:when test="$MAX_WIDTH_RAW = ''"></xsl:when>
        <xsl:when test="contains($MAX_WIDTH_RAW, 'px') or contains($MAX_WIDTH_RAW, 'rem') or contains($MAX_WIDTH_RAW, 'em') or contains($MAX_WIDTH_RAW, '%')"><xsl:value-of select="$MAX_WIDTH_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$MAX_WIDTH_RAW"/>px</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="EYEBROW"     select="normalize-space(//Datum[@ID='SectionEyebrowText']/text()[last()])"/>
    <xsl:variable name="HEADING"     select="normalize-space(//Datum[@ID='SectionHeadingText']/text()[last()])"/>
    <xsl:variable name="HEADING_TAG_RAW" select="normalize-space(//Datum[@ID='SectionHeadingTag']/text()[last()])"/>
    <xsl:variable name="DESCRIPTION" select="normalize-space(//Datum[@ID='SectionDescriptionText']/text()[last()])"/>

    <xsl:variable name="HEADING_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$HEADING_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:variable name="CARD_COUNT">
      <xsl:call-template name="cardCountForPreset">
        <xsl:with-param name="preset" select="$PRESET"/>
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

    <xsl:variable name="VARIANT_CLASS">
      <xsl:choose>
        <xsl:when test="$PRESET = 'capabilities-3'">rbccm-capability-cards--3</xsl:when>
        <xsl:when test="$PRESET = 'capabilities-5'">rbccm-capability-cards--5</xsl:when>
        <xsl:when test="$PRESET = 'capabilities-6'">rbccm-capability-cards--6</xsl:when>
        <xsl:otherwise>rbccm-capability-cards--4</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <section>
      <xsl:attribute name="class">rbccm-capability-cards <xsl:value-of select="$VARIANT_CLASS"/></xsl:attribute>
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
      <xsl:if test="$BG_COLOR != '' or $MAX_WIDTH != ''">
        <xsl:attribute name="style">
          <xsl:if test="$BG_COLOR != ''">--rbccm-capability-cards-bg: <xsl:value-of select="$BG_COLOR"/>;</xsl:if>
          <xsl:if test="$MAX_WIDTH != ''">--rbccm-capability-cards-max-width: <xsl:value-of select="$MAX_WIDTH"/>;</xsl:if>
        </xsl:attribute>
      </xsl:if>

      <xsl:if test="$EYEBROW != '' or $HEADING != '' or $DESCRIPTION != ''">
        <div class="rbccm-capability-cards__header">
          <xsl:if test="$EYEBROW != ''">
            <p class="rbccm-capability-cards__eyebrow" data-animate="fadeInUp"><xsl:value-of select="$EYEBROW"/></p>
          </xsl:if>
          <xsl:if test="$HEADING != ''">
            <xsl:element name="{$HEADING_TAG}">
              <xsl:attribute name="class">rbccm-capability-cards__heading</xsl:attribute>
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:attribute name="data-animate-delay">120</xsl:attribute>
              <xsl:value-of select="$HEADING"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$DESCRIPTION != ''">
            <p class="rbccm-capability-cards__description" data-animate="fadeInUp" data-animate-delay="240">
              <xsl:value-of select="$DESCRIPTION" disable-output-escaping="yes"/>
            </p>
          </xsl:if>
        </div>
      </xsl:if>

      <!-- Cards wrapper (max-width 1100 desktop) holds the grid. Mobile
           stacks the grid vertically via CSS flex-column; no carousel
           JS is emitted for this release. See rbccm-capability-cards.js
           for the design note. -->
      <div class="rbccm-capability-cards__cards">
        <div class="rbccm-capability-cards__grid" data-stagger-parent="fadeInUp" data-stagger-step="120">
          <xsl:call-template name="renderCard"><xsl:with-param name="n" select="1"/></xsl:call-template>
          <xsl:call-template name="renderCard"><xsl:with-param name="n" select="2"/></xsl:call-template>
          <xsl:call-template name="renderCard"><xsl:with-param name="n" select="3"/></xsl:call-template>
          <xsl:if test="$CARD_COUNT &gt;= 4">
            <xsl:call-template name="renderCard"><xsl:with-param name="n" select="4"/></xsl:call-template>
          </xsl:if>
          <xsl:if test="$CARD_COUNT &gt;= 5">
            <xsl:call-template name="renderCard"><xsl:with-param name="n" select="5"/></xsl:call-template>
          </xsl:if>
          <xsl:if test="$CARD_COUNT &gt;= 6">
            <xsl:call-template name="renderCard"><xsl:with-param name="n" select="6"/></xsl:call-template>
          </xsl:if>
        </div>
      </div>

    </section>

    <xsl:if test="$JS_PATH != ''">
      <script>
        <xsl:attribute name="src">
          <xsl:value-of select="$JS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </script>
    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
