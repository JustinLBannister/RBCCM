<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero :: maas-mata (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the MAAS+MATA variant of rbccm-hero. No Preset branching --
  the variant class is hardcoded below.

  Structure: eyebrow / two-line title / subtitle / dual-CTA row,
  centred, glow halo background. Above-the-fold animation cascade
  fires immediately on page load at 0 / 150 / 300 / 450 ms.

  Companion skin: rbccm-hero--strategy-and-economics.xsl
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


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"     select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"   select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="BUTTON_CSS"     select="normalize-space(/Properties/Data/Datum[@ID='ButtonCssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(/Properties/Data/Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Datum lookups (Mm* prefix) -->
    <xsl:variable name="MM_EYEBROW_TEXT"     select="normalize-space(/Properties/Data/Datum[@ID='MmEyebrowText']/text()[last()])"/>
    <xsl:variable name="MM_EYEBROW_TAG_RAW"  select="normalize-space(/Properties/Data/Datum[@ID='MmEyebrowTag']/text()[last()])"/>
    <xsl:variable name="MM_TITLE_L1"         select="normalize-space(/Properties/Data/Datum[@ID='MmTitleLine1Text']/text()[last()])"/>
    <xsl:variable name="MM_TITLE_L2"         select="normalize-space(/Properties/Data/Datum[@ID='MmTitleLine2Text']/text()[last()])"/>
    <xsl:variable name="MM_TITLE_TAG_RAW"    select="normalize-space(/Properties/Data/Datum[@ID='MmTitleTag']/text()[last()])"/>
    <xsl:variable name="MM_SUBTITLE_TEXT"    select="/Properties/Data/Datum[@ID='MmSubtitleText']"/>
    <xsl:variable name="MM_SUBTITLE_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='MmSubtitleTag']/text()[last()])"/>

    <xsl:variable name="MM_CTA1_LABEL"       select="normalize-space(/Properties/Data/Datum[@ID='MmCta1Label']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_HREF"        select="normalize-space(/Properties/Data/Datum[@ID='MmCta1Href']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ARIA"        select="normalize-space(/Properties/Data/Datum[@ID='MmCta1AriaLabel']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_TITLE"       select="normalize-space(/Properties/Data/Datum[@ID='MmCta1Title']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_STYLE_RAW"   select="normalize-space(/Properties/Data/Datum[@ID='MmCta1Style']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ICON_D"      select="normalize-space(/Properties/Data/Datum[@ID='MmCta1IconPath']/text()[last()])"/>
    <xsl:variable name="MM_CTA1_ICON_VB"     select="normalize-space(/Properties/Data/Datum[@ID='MmCta1IconViewBox']/text()[last()])"/>

    <xsl:variable name="MM_CTA2_LABEL"       select="normalize-space(/Properties/Data/Datum[@ID='MmCta2Label']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_HREF"        select="normalize-space(/Properties/Data/Datum[@ID='MmCta2Href']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ARIA"        select="normalize-space(/Properties/Data/Datum[@ID='MmCta2AriaLabel']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_TITLE"       select="normalize-space(/Properties/Data/Datum[@ID='MmCta2Title']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_STYLE_RAW"   select="normalize-space(/Properties/Data/Datum[@ID='MmCta2Style']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ICON_D"      select="normalize-space(/Properties/Data/Datum[@ID='MmCta2IconPath']/text()[last()])"/>
    <xsl:variable name="MM_CTA2_ICON_VB"     select="normalize-space(/Properties/Data/Datum[@ID='MmCta2IconViewBox']/text()[last()])"/>

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
                <xsl:if test="$MM_CTA1_ICON_D != ''">
                  <svg class="rbccm-button__icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <xsl:attribute name="viewBox">
                      <xsl:choose>
                        <xsl:when test="$MM_CTA1_ICON_VB != ''"><xsl:value-of select="$MM_CTA1_ICON_VB"/></xsl:when>
                        <xsl:otherwise>0 0 24 24</xsl:otherwise>
                      </xsl:choose>
                    </xsl:attribute>
                    <path><xsl:attribute name="d"><xsl:value-of select="$MM_CTA1_ICON_D"/></xsl:attribute></path>
                  </svg>
                </xsl:if>
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
                <xsl:if test="$MM_CTA2_ICON_D != ''">
                  <svg class="rbccm-button__icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <xsl:attribute name="viewBox">
                      <xsl:choose>
                        <xsl:when test="$MM_CTA2_ICON_VB != ''"><xsl:value-of select="$MM_CTA2_ICON_VB"/></xsl:when>
                        <xsl:otherwise>0 0 24 24</xsl:otherwise>
                      </xsl:choose>
                    </xsl:attribute>
                    <path><xsl:attribute name="d"><xsl:value-of select="$MM_CTA2_ICON_D"/></xsl:attribute></path>
                  </svg>
                </xsl:if>
              </a>
            </xsl:if>

          </div>
        </xsl:if>

      </div>
    </section>

  </xsl:template>

</xsl:stylesheet>
