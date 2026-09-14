<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM CTA Band :: talk-with-an-expert (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the "Talk with an expert" variant of rbccm-cta-band. No Preset
  branching - everything below unconditionally emits the flat
  DOM (eyebrow + heading + body + actions) that ships with the
  MAAS+MATA "See the platform" band.

  Animation cascade: eyebrow / heading / body / primary CTA at
  0 / 100 / 200 / 300 ms (matches the live page).

  Companion skin: rbccm-cta-band-research-portal.xsl
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

  <!-- Shared arrow SVG for the primary button. -->
  <xsl:template name="ctaArrow">
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden="true" focusable="false">
      <xsl:attribute name="class">rbccm-cta-band__btn-icon</xsl:attribute>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M1.4375 11.4999C1.4375 11.3093 1.51323 11.1265 1.64802 10.9917C1.78281 10.8569 1.96563 10.7812 2.15625 10.7812H19.1087L14.5849 6.25881C14.4499 6.12384 14.3741 5.9408 14.3741 5.74993C14.3741 5.55907 14.4499 5.37602 14.5849 5.24106C14.7198 5.10609 14.9029 5.03027 15.0938 5.03027C15.2846 5.03027 15.4677 5.10609 15.6026 5.24106L21.3526 10.9911C21.4196 11.0578 21.4727 11.1371 21.5089 11.2245C21.5451 11.3118 21.5638 11.4054 21.5638 11.4999C21.5638 11.5945 21.5451 11.6881 21.5089 11.7754C21.4727 11.8627 21.4196 11.942 21.3526 12.0088L15.6026 17.7588C15.4677 17.8938 15.2846 17.9696 15.0938 17.9696C14.9029 17.9696 14.7198 17.8938 14.5849 17.7588C14.4499 17.6238 14.3741 17.4408 14.3741 17.2499C14.3741 17.0591 14.4499 16.876 14.5849 16.7411L19.1087 12.2187H2.15625C1.96563 12.2187 1.78281 12.143 1.64802 12.0082C1.51323 11.8734 1.4375 11.6906 1.4375 11.4999Z" fill="currentColor"/>
    </svg>
  </xsl:template>

  <!-- Render one button. Kind param: 'primary' or 'secondary'. -->
  <xsl:template name="renderButton">
    <xsl:param name="kind"/>
    <xsl:param name="text"/>
    <xsl:param name="href"/>
    <xsl:param name="newTab"/>
    <xsl:param name="animateDelay"/>

    <xsl:if test="$text != ''">
      <a>
        <xsl:attribute name="class">rbccm-cta-band__btn rbccm-cta-band__btn--<xsl:value-of select="$kind"/></xsl:attribute>
        <xsl:attribute name="href">
          <xsl:choose>
            <xsl:when test="$href != ''"><xsl:value-of select="$href"/></xsl:when>
            <xsl:otherwise>#</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:if test="$newTab = 'yes'">
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:attribute name="rel">noopener</xsl:attribute>
        </xsl:if>
        <xsl:if test="$animateDelay != ''">
          <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
          <xsl:attribute name="data-animate-delay"><xsl:value-of select="$animateDelay"/></xsl:attribute>
        </xsl:if>
        <span><xsl:value-of select="$text"/></span>
        <xsl:if test="$kind = 'primary'">
          <xsl:call-template name="ctaArrow"/>
        </xsl:if>
      </a>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="BG_TRANSPARENT" select="normalize-space(//Datum[@ID='BgTransparent']/text()[last()])"/>

    <xsl:variable name="EYEBROW_TEXT"  select="normalize-space(//Datum[@ID='EyebrowText']/text()[last()])"/>
    <xsl:variable name="EYEBROW_TAG_R" select="normalize-space(//Datum[@ID='EyebrowTag']/text()[last()])"/>

    <xsl:variable name="HEADING_TEXT"  select="//Datum[@ID='HeadingText']"/>
    <xsl:variable name="HEADING_TAG_R" select="normalize-space(//Datum[@ID='HeadingTag']/text()[last()])"/>

    <xsl:variable name="BODY_TEXT"     select="//Datum[@ID='BodyText']"/>
    <xsl:variable name="BODY_TAG_R"    select="normalize-space(//Datum[@ID='BodyTag']/text()[last()])"/>

    <xsl:variable name="PRIMARY_TEXT"     select="normalize-space(//Datum[@ID='PrimaryCtaText']/text()[last()])"/>
    <xsl:variable name="PRIMARY_HREF"     select="normalize-space(//Datum[@ID='PrimaryCtaHref']/text()[last()])"/>
    <xsl:variable name="PRIMARY_NEWTAB"   select="normalize-space(//Datum[@ID='PrimaryCtaNewTab']/text()[last()])"/>

    <xsl:variable name="SECONDARY_TEXT"   select="normalize-space(//Datum[@ID='SecondaryCtaText']/text()[last()])"/>
    <xsl:variable name="SECONDARY_HREF"   select="normalize-space(//Datum[@ID='SecondaryCtaHref']/text()[last()])"/>
    <xsl:variable name="SECONDARY_NEWTAB" select="normalize-space(//Datum[@ID='SecondaryCtaNewTab']/text()[last()])"/>

    <xsl:variable name="EYEBROW_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$EYEBROW_TAG_R"/>
        <xsl:with-param name="default" select="'p'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="HEADING_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$HEADING_TAG_R"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="BODY_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$BODY_TAG_R"/>
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
      <xsl:attribute name="class">rbccm-cta-band rbccm-cta-band--talk-with-an-expert<xsl:if test="$BG_TRANSPARENT = 'yes'"> rbccm-cta-band--bg-transparent</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <div class="rbccm-cta-band__inner">

        <xsl:if test="$EYEBROW_TEXT != ''">
          <xsl:element name="{$EYEBROW_TAG}">
            <xsl:attribute name="class">rbccm-cta-band__eyebrow</xsl:attribute>
            <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
            <xsl:value-of select="$EYEBROW_TEXT"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="normalize-space($HEADING_TEXT) != ''">
          <xsl:element name="{$HEADING_TAG}">
            <xsl:attribute name="class">rbccm-cta-band__heading</xsl:attribute>
            <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
            <xsl:attribute name="data-animate-delay">100</xsl:attribute>
            <xsl:value-of select="$HEADING_TEXT" disable-output-escaping="yes"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="normalize-space($BODY_TEXT) != ''">
          <xsl:element name="{$BODY_TAG}">
            <xsl:attribute name="class">rbccm-cta-band__body</xsl:attribute>
            <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
            <xsl:attribute name="data-animate-delay">200</xsl:attribute>
            <xsl:value-of select="$BODY_TEXT" disable-output-escaping="yes"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$PRIMARY_TEXT != '' or $SECONDARY_TEXT != ''">
          <div class="rbccm-cta-band__actions">
            <xsl:call-template name="renderButton">
              <xsl:with-param name="kind" select="'primary'"/>
              <xsl:with-param name="text" select="$PRIMARY_TEXT"/>
              <xsl:with-param name="href" select="$PRIMARY_HREF"/>
              <xsl:with-param name="newTab" select="$PRIMARY_NEWTAB"/>
              <xsl:with-param name="animateDelay" select="'300'"/>
            </xsl:call-template>
            <xsl:call-template name="renderButton">
              <xsl:with-param name="kind" select="'secondary'"/>
              <xsl:with-param name="text" select="$SECONDARY_TEXT"/>
              <xsl:with-param name="href" select="$SECONDARY_HREF"/>
              <xsl:with-param name="newTab" select="$SECONDARY_NEWTAB"/>
              <xsl:with-param name="animateDelay" select="'400'"/>
            </xsl:call-template>
          </div>
        </xsl:if>

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
