<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Two-Up Cards :: features (single-skin build)
  ============================================================
  Standalone skin for TeamSite's Skin dropdown. Renders ONLY the
  features variant (MAAS+MATA parity): dark section, cards hold
  eyebrow + title + body + up to 5 bullets. Each card is themed
  dark or light via Card{N}Theme (plain text: dark / light).
  No JS.

  Companion skin: rbccm-two-up-cards (double-dash) video-callouts.xsl
  Fields: rbccm-two-up-cards-properties.xml (shared by both skins).
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
      <xsl:attribute name="class">rbccm-two-up-cards__card <xsl:choose>
          <xsl:when test="$theme = 'light'">rbccm-two-up-cards__card--light</xsl:when>
          <xsl:otherwise>rbccm-two-up-cards__card--dark</xsl:otherwise>
        </xsl:choose></xsl:attribute>

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
       renderCardSlot : per-slot lookup.
       ============================================================ -->
  <xsl:template name="renderCardSlot">
    <xsl:param name="n"/>

    <xsl:variable name="title"     select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()])"/>
    <xsl:variable name="theme"     select="normalize-space(//Datum[@ID=concat('Card', $n, 'Theme')]/text()[last()])"/>
    <xsl:variable name="eyebrow"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'EyebrowText')]/text()[last()])"/>
    <xsl:variable name="body"      select="//Datum[@ID=concat('Card', $n, 'BodyText')]"/>

    <!-- Blank title hides the whole card. -->
    <xsl:if test="$title != ''">
      <xsl:call-template name="renderFeatureCard">
        <xsl:with-param name="n" select="$n"/>
        <xsl:with-param name="theme" select="$theme"/>
        <xsl:with-param name="eyebrow" select="$eyebrow"/>
        <xsl:with-param name="title" select="$title"/>
        <xsl:with-param name="body" select="$body"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
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

    <section>
      <xsl:attribute name="class">rbccm-two-up-cards rbccm-two-up-cards--features</xsl:attribute>
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
        </xsl:call-template>
        <xsl:call-template name="renderCardSlot">
          <xsl:with-param name="n" select="2"/>
        </xsl:call-template>
      </div>

    </section>

  </xsl:template>

</xsl:stylesheet>
