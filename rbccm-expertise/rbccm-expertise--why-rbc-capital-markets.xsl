<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Expertise :: why-rbc-capital-markets (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the "Why RBC Capital Markets" preset of rbccm-expertise. No
  Preset branching -- the variant class is hardcoded below.

  Structure: header (title only, no description in this variant)
  -> 4-pillar track (no icons - title + body only) -> arrow
  controls + dot pager. Each pillar reveals with a 0/150/300/450ms
  fadeInUp cascade.

  Companion skin: rbccm-expertise--strategy-and-economics-expertise.xsl
-->
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

  <!-- Render one pillar. This preset omits icons entirely; the
       Pillar{N}IconName Datum is ignored even if populated. -->
  <xsl:template name="renderPillar">
    <xsl:param name="titleText"/>
    <xsl:param name="titleTag"/>
    <xsl:param name="bodyText"/>
    <xsl:param name="bodyTag"/>
    <xsl:param name="animateDelay"/>

    <div class="rbccm-expertise__pillar" data-animate="fadeInUp">
      <xsl:if test="$animateDelay &gt; 0">
        <xsl:attribute name="data-animate-delay"><xsl:value-of select="$animateDelay"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$titleText != ''">
        <xsl:element name="{$titleTag}">
          <xsl:attribute name="class">rbccm-expertise__pillar-title</xsl:attribute>
          <xsl:value-of select="$titleText"/>
        </xsl:element>
      </xsl:if>
      <xsl:if test="normalize-space($bodyText) != ''">
        <xsl:element name="{$bodyTag}">
          <xsl:attribute name="class">rbccm-expertise__pillar-body</xsl:attribute>
          <xsl:value-of select="$bodyText" disable-output-escaping="yes"/>
        </xsl:element>
      </xsl:if>
    </div>
  </xsl:template>

  <!-- Per-slot lookup + renderPillar dispatcher. -->
  <xsl:template name="renderSlot">
    <xsl:param name="n"/>
    <xsl:variable name="title" select="normalize-space(/Properties/Data/Datum[@ID=concat('Pillar', $n, 'TitleText')]/text()[last()])"/>
    <xsl:if test="$title != ''">
      <xsl:variable name="titleTagRaw" select="normalize-space(/Properties/Data/Datum[@ID=concat('Pillar', $n, 'TitleTag')]/text()[last()])"/>
      <xsl:variable name="body"        select="/Properties/Data/Datum[@ID=concat('Pillar', $n, 'BodyText')]"/>
      <xsl:variable name="bodyTagRaw"  select="normalize-space(/Properties/Data/Datum[@ID=concat('Pillar', $n, 'BodyTag')]/text()[last()])"/>

      <xsl:variable name="titleTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$titleTagRaw"/>
          <xsl:with-param name="default" select="'h3'"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="bodyTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$bodyTagRaw"/>
          <xsl:with-param name="default" select="'p'"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:call-template name="renderPillar">
        <xsl:with-param name="titleText" select="$title"/>
        <xsl:with-param name="titleTag" select="$titleTag"/>
        <xsl:with-param name="bodyText" select="$body"/>
        <xsl:with-param name="bodyTag" select="$bodyTag"/>
        <xsl:with-param name="animateDelay" select="($n - 1) * 150"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>

    <xsl:variable name="TITLE_TEXT"    select="normalize-space(/Properties/Data/Datum[@ID='SectionTitleText']/text()[last()])"/>
    <xsl:variable name="TITLE_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SectionTitleTag']/text()[last()])"/>
    <xsl:variable name="DESC_TEXT"     select="/Properties/Data/Datum[@ID='SectionDescriptionText']"/>
    <xsl:variable name="DESC_TAG_RAW"  select="normalize-space(/Properties/Data/Datum[@ID='SectionDescriptionTag']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(/Properties/Data/Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="DESC_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$DESC_TAG_RAW"/>
        <xsl:with-param name="default" select="'p'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Stylesheet hoist -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <section>
      <xsl:attribute name="class">rbccm-expertise rbccm-expertise--why-rbc-capital-markets<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-expertise--header-center</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <div class="container rbccm-expertise__inner">

        <div class="rbccm-expertise__header">
          <xsl:if test="$TITLE_TEXT != ''">
            <xsl:element name="{$TITLE_TAG}">
              <xsl:attribute name="class">rbccm-expertise__title</xsl:attribute>
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:value-of select="$TITLE_TEXT" disable-output-escaping="yes"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="normalize-space($DESC_TEXT) != ''">
            <xsl:element name="{$DESC_TAG}">
              <xsl:attribute name="class">rbccm-expertise__description</xsl:attribute>
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:attribute name="data-animate-delay">250</xsl:attribute>
              <xsl:value-of select="$DESC_TEXT" disable-output-escaping="yes"/>
            </xsl:element>
          </xsl:if>
        </div>

        <div class="rbccm-expertise__sr-only" aria-live="polite" aria-atomic="true"></div>

        <div class="rbccm-expertise__track">
          <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="1"/></xsl:call-template>
          <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="2"/></xsl:call-template>
          <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="3"/></xsl:call-template>
          <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="4"/></xsl:call-template>
        </div>

        <div class="rbccm-expertise__controls">
          <button class="rbccm-expertise__btn rbccm-expertise__btn--prev" type="button" aria-label="Previous item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
              <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="rbccm-expertise__dots"></div>
          <button class="rbccm-expertise__btn rbccm-expertise__btn--next" type="button" aria-label="Next item">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
              <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
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
