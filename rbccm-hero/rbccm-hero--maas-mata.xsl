<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero :: maas-mata (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the MAAS+MATA variant of rbccm-hero. No Preset branching -
  the variant class is hardcoded below.

  Structure: eyebrow / two-line title / subtitle / dual-CTA row,
  centred, glow halo background. Above-the-fold animation cascade
  fires immediately on page load at 0 / 150 / 300 / 450 ms.

  Companion skins: rbccm-hero (double-dash) strategy-and-economics.xsl,
                   rbccm-hero (double-dash) us-credentials.xsl
  Fields: see rbccm-hero-properties.xml (shared by all three skins).
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

  <!-- Datum lookup with legacy fallback (2026-09 Properties cleanup).
       Reads the new shared ID; if it's blank (or a tag picker is on
       "auto"), falls back to the pre-cleanup per-variant ID so pages
       saved before the cleanup keep rendering. raw=true keeps the
       full un-normalized value (HTML textareas). -->
  <xsl:template name="datumValue">
    <xsl:param name="n"/>
    <xsl:param name="raw" select="false()"/>
    <xsl:variable name="t" select="normalize-space($n[1]/text()[last()])"/>
    <xsl:choose>
      <xsl:when test="$raw"><xsl:value-of select="$n[1]"/></xsl:when>
      <xsl:when test="$t != ''"><xsl:value-of select="$t"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="normalize-space($n[1]/Option[@Selected='true'][1]/Value)"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="datum">
    <xsl:param name="id"/>
    <xsl:param name="legacy" select="''"/>
    <xsl:param name="raw" select="false()"/>
    <xsl:variable name="v">
      <xsl:call-template name="datumValue">
        <xsl:with-param name="n" select="//Datum[@ID=$id]"/>
        <xsl:with-param name="raw" select="$raw"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$legacy = '' or (normalize-space($v) != '' and normalize-space($v) != 'auto')">
        <xsl:value-of select="$v"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="datumValue">
          <xsl:with-param name="n" select="//Datum[@ID=$legacy]"/>
          <xsl:with-param name="raw" select="$raw"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Built-in button icons (MmCta*Icon). Blank = legacy
       MmCta*IconPath / IconViewBox from pre-cleanup pages. -->
  <xsl:template name="ctaIcon">
    <xsl:param name="key"/>
    <xsl:param name="legacyD"/>
    <xsl:param name="legacyVB"/>
    <xsl:variable name="d">
      <xsl:choose>
        <xsl:when test="$key = 'arrow'">M13.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L17.586 13H4a1 1 0 110-2h13.586l-4.293-4.293a1 1 0 010-1.414z</xsl:when>
        <xsl:when test="$key = 'play'">M8 5v14l11-7z</xsl:when>
        <xsl:when test="$key = 'none'"></xsl:when>
        <xsl:otherwise><xsl:value-of select="$legacyD"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="$d != ''">
      <svg class="rbccm-button__icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <xsl:attribute name="viewBox">
          <xsl:choose>
            <xsl:when test="($key = '' or not($key = 'arrow' or $key = 'play')) and $legacyVB != ''"><xsl:value-of select="$legacyVB"/></xsl:when>
            <xsl:otherwise>0 0 24 24</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <path><xsl:attribute name="d"><xsl:value-of select="$d"/></xsl:attribute></path>
      </svg>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"     select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"   select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"       select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="BUTTON_CSS"     select="normalize-space(//Datum[@ID='ButtonCssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(//Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Content Datums (shared IDs, with pre-cleanup Mm* fallback) -->
    <xsl:variable name="MM_EYEBROW_TEXT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'EyebrowText'"/>
        <xsl:with-param name="legacy" select="'MmEyebrowText'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_EYEBROW_TAG_RAW">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'EyebrowTag'"/>
        <xsl:with-param name="legacy" select="'MmEyebrowTag'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_TITLE_L1">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'TitleLine1Text'"/>
        <xsl:with-param name="legacy" select="'MmTitleLine1Text'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_TITLE_L2">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'TitleLine2Text'"/>
        <xsl:with-param name="legacy" select="'MmTitleLine2Text'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_TITLE_TAG_RAW">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'TitleTag'"/>
        <xsl:with-param name="legacy" select="'MmTitleTag'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_SUBTITLE_TEXT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'SubtitleText'"/>
        <xsl:with-param name="legacy" select="'MmSubtitleText'"/>
        <xsl:with-param name="raw" select="true()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_SUBTITLE_TAG_RAW">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'SubtitleTag'"/>
        <xsl:with-param name="legacy" select="'MmSubtitleTag'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Buttons (MAAS+MATA only; IDs unchanged) -->
    <xsl:variable name="MM_CTA1_LABEL"       select="normalize-space(//Datum[@ID='MmCta1Label']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_HREF"        select="normalize-space(//Datum[@ID='MmCta1Href']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ARIA"        select="normalize-space(//Datum[@ID='MmCta1AriaLabel']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_TITLE"       select="normalize-space(//Datum[@ID='MmCta1Title']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_STYLE_RAW"   select="normalize-space(//Datum[@ID='MmCta1Style']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ICON"        select="normalize-space(//Datum[@ID='MmCta1Icon']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ICON_D"      select="normalize-space(//Datum[@ID='MmCta1IconPath']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ICON_VB"     select="normalize-space(//Datum[@ID='MmCta1IconViewBox']/text()[last()])"/>

    <xsl:variable name="MM_CTA2_LABEL"       select="normalize-space(//Datum[@ID='MmCta2Label']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_HREF"        select="normalize-space(//Datum[@ID='MmCta2Href']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ARIA"        select="normalize-space(//Datum[@ID='MmCta2AriaLabel']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_TITLE"       select="normalize-space(//Datum[@ID='MmCta2Title']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_STYLE_RAW"   select="normalize-space(//Datum[@ID='MmCta2Style']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ICON"        select="normalize-space(//Datum[@ID='MmCta2Icon']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ICON_D"      select="normalize-space(//Datum[@ID='MmCta2IconPath']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ICON_VB"     select="normalize-space(//Datum[@ID='MmCta2IconViewBox']/text()[last()])"/>

    <!-- Tag guards. -->
    <xsl:variable name="MM_EYEBROW_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$MM_EYEBROW_TAG_RAW"/>
        <xsl:with-param name="default" select="'h1'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$MM_TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'p'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="MM_SUBTITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$MM_SUBTITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'p'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Button style fallback: unknown values coerced to primary. -->
    <xsl:variable name="MM_CTA1_STYLE">
      <xsl:choose>
        <xsl:when test="$MM_CTA1_STYLE_RAW = 'primary' or $MM_CTA1_STYLE_RAW = 'secondary' or $MM_CTA1_STYLE_RAW = 'yellow' or $MM_CTA1_STYLE_RAW = 'ghost'">
          <xsl:value-of select="$MM_CTA1_STYLE_RAW"/>
        </xsl:when>
        <xsl:otherwise>primary</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="MM_CTA2_STYLE">
      <xsl:choose>
        <xsl:when test="$MM_CTA2_STYLE_RAW = 'primary' or $MM_CTA2_STYLE_RAW = 'secondary' or $MM_CTA2_STYLE_RAW = 'yellow' or $MM_CTA2_STYLE_RAW = 'ghost'">
          <xsl:value-of select="$MM_CTA2_STYLE_RAW"/>
        </xsl:when>
        <xsl:otherwise>secondary</xsl:otherwise>
      </xsl:choose>
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
    <xsl:if test="$BUTTON_CSS != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$BUTTON_CSS"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <section>
      <xsl:attribute name="class">rbccm-hero rbccm-hero--maas-mata<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-hero--header-center</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <div class="rbccm-hero__container">

        <xsl:if test="$MM_EYEBROW_TEXT != ''">
          <xsl:element name="{$MM_EYEBROW_TAG}">
            <xsl:attribute name="class">rbccm-hero__eyebrow</xsl:attribute>
            <xsl:attribute name="data-animate-hero">fadeInDown</xsl:attribute>
            <xsl:attribute name="data-animate-delay">0</xsl:attribute>
            <xsl:value-of select="$MM_EYEBROW_TEXT"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$MM_TITLE_L1 != '' or $MM_TITLE_L2 != ''">
          <xsl:element name="{$MM_TITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
            <xsl:attribute name="data-animate-hero">fadeInUp</xsl:attribute>
            <xsl:attribute name="data-animate-delay">150</xsl:attribute>
            <xsl:if test="$MM_TITLE_L1 != ''">
              <span class="rbccm-hero__title-line"><xsl:value-of select="$MM_TITLE_L1"/></span>
            </xsl:if>
            <xsl:if test="$MM_TITLE_L2 != ''">
              <span class="rbccm-hero__title-line"><xsl:value-of select="$MM_TITLE_L2"/></span>
            </xsl:if>
          </xsl:element>
        </xsl:if>

        <xsl:if test="normalize-space($MM_SUBTITLE_TEXT) != ''">
          <xsl:element name="{$MM_SUBTITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__subtitle</xsl:attribute>
            <xsl:attribute name="data-animate-hero">fadeInUp</xsl:attribute>
            <xsl:attribute name="data-animate-delay">300</xsl:attribute>
            <xsl:value-of select="$MM_SUBTITLE_TEXT" disable-output-escaping="yes"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$MM_CTA1_LABEL != '' or $MM_CTA2_LABEL != ''">
          <div class="rbccm-hero__actions" data-animate-hero="fadeInUp" data-animate-delay="450">

            <xsl:if test="$MM_CTA1_LABEL != ''">
              <a>
                <xsl:attribute name="class">rbccm-button rbccm-button--<xsl:value-of select="$MM_CTA1_STYLE"/></xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$MM_CTA1_HREF"/></xsl:attribute>
                <xsl:if test="$MM_CTA1_ARIA != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$MM_CTA1_ARIA"/></xsl:attribute>
                </xsl:if>
                <xsl:if test="$MM_CTA1_TITLE != ''">
                  <xsl:attribute name="title"><xsl:value-of select="$MM_CTA1_TITLE"/></xsl:attribute>
                </xsl:if>
                <span class="rbccm-button__label"><xsl:value-of select="$MM_CTA1_LABEL"/></span>
                <xsl:call-template name="ctaIcon">
                  <xsl:with-param name="key" select="$MM_CTA1_ICON"/>
                  <xsl:with-param name="legacyD" select="$MM_CTA1_ICON_D"/>
                  <xsl:with-param name="legacyVB" select="$MM_CTA1_ICON_VB"/>
                </xsl:call-template>
              </a>
            </xsl:if>

            <xsl:if test="$MM_CTA2_LABEL != ''">
              <a>
                <xsl:attribute name="class">rbccm-button rbccm-button--<xsl:value-of select="$MM_CTA2_STYLE"/></xsl:attribute>
                <xsl:attribute name="href"><xsl:value-of select="$MM_CTA2_HREF"/></xsl:attribute>
                <xsl:if test="$MM_CTA2_ARIA != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$MM_CTA2_ARIA"/></xsl:attribute>
                </xsl:if>
                <xsl:if test="$MM_CTA2_TITLE != ''">
                  <xsl:attribute name="title"><xsl:value-of select="$MM_CTA2_TITLE"/></xsl:attribute>
                </xsl:if>
                <span class="rbccm-button__label"><xsl:value-of select="$MM_CTA2_LABEL"/></span>
                <xsl:call-template name="ctaIcon">
                  <xsl:with-param name="key" select="$MM_CTA2_ICON"/>
                  <xsl:with-param name="legacyD" select="$MM_CTA2_ICON_D"/>
                  <xsl:with-param name="legacyVB" select="$MM_CTA2_ICON_VB"/>
                </xsl:call-template>
              </a>
            </xsl:if>

          </div>
        </xsl:if>

      </div>
    </section>

  </xsl:template>

</xsl:stylesheet>
