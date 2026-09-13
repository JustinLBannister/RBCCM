<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM CTA Band :: research-portal (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the "Research portal" variant of rbccm-cta-band. No Preset
  branching - everything below unconditionally emits the nested
  __intro wrapper (heading + body inside .__intro, then actions
  row) that keeps the tight heading/body gap.

  Animation cascade: heading / body / primary CTA / secondary CTA
  at 0 / 250 / 500 / 650 ms.

  Companion skin: rbccm-cta-band-talk-with-an-expert.xsl
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
      <path fill-rule="evenodd" clip-rule="evenodd" d="M1.4375 11.1274C1.4375 10.9367 1.51323 10.7539 1.64802 10.6191C1.78281 10.4843 1.96563 10.4086 2.15625 10.4086H19.1087L14.5849 5.88625C14.4499 5.75129 14.3741 5.56824 14.3741 5.37737C14.3741 5.18651 14.4499 5.00346 14.5849 4.8685C14.7198 4.73354 14.9029 4.65771 15.0938 4.65771C15.2846 4.65771 15.4677 4.73354 15.6026 4.8685L21.3526 10.6185C21.4196 10.6853 21.4727 10.7646 21.5089 10.8519C21.5451 10.9392 21.5638 11.0328 21.5638 11.1274C21.5638 11.2219 21.5451 11.3155 21.5089 11.4028C21.4727 11.4902 21.4196 11.5695 21.3526 11.6362L15.6026 17.3862C15.4677 17.5212 15.2846 17.597 15.0938 17.597C14.9029 17.597 14.7198 17.5212 14.5849 17.3862C14.4499 17.2513 14.3741 17.0682 14.3741 16.8774C14.3741 16.6865 14.4499 16.5035 14.5849 16.3685L19.1087 11.8461H2.15625C1.96563 11.8461 1.78281 11.7704 1.64802 11.6356C1.51323 11.5008 1.4375 11.318 1.4375 11.1274Z" fill="currentColor"/>
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

    <xsl:variable name="SECTION_ID"    select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="BG_TRANSPARENT" select="normalize-space(/Properties/Data/Datum[@ID='BgTransparent']/text()[last()])"/>

    <xsl:variable name="HEADING_TEXT"  select="/Properties/Data/Datum[@ID='HeadingText']"/>
    <xsl:variable name="HEADING_TAG_R" select="normalize-space(/Properties/Data/Datum[@ID='HeadingTag']/text()[last()])"/>

    <xsl:variable name="BODY_TEXT"     select="/Properties/Data/Datum[@ID='BodyText']"/>
    <xsl:variable name="BODY_TAG_R"    select="normalize-space(/Properties/Data/Datum[@ID='BodyTag']/text()[last()])"/>

    <xsl:variable name="PRIMARY_TEXT"     select="normalize-space(/Properties/Data/Datum[@ID='PrimaryCtaText']/text()[last()])"/>
    <xsl:variable name="PRIMARY_HREF"     select="normalize-space(/Properties/Data/Datum[@ID='PrimaryCtaHref']/text()[last()])"/>
    <xsl:variable name="PRIMARY_NEWTAB"   select="normalize-space(/Properties/Data/Datum[@ID='PrimaryCtaNewTab']/text()[last()])"/>

    <xsl:variable name="SECONDARY_TEXT"   select="normalize-space(/Properties/Data/Datum[@ID='SecondaryCtaText']/text()[last()])"/>
    <xsl:variable name="SECONDARY_HREF"   select="normalize-space(/Properties/Data/Datum[@ID='SecondaryCtaHref']/text()[last()])"/>
    <xsl:variable name="SECONDARY_NEWTAB" select="normalize-space(/Properties/Data/Datum[@ID='SecondaryCtaNewTab']/text()[last()])"/>

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
      <xsl:attribute name="class">rbccm-cta-band rbccm-cta-band--research-portal<xsl:if test="$BG_TRANSPARENT = 'yes'"> rbccm-cta-band--bg-transparent</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <div class="container rbccm-cta-band__inner">

        <xsl:if test="normalize-space($HEADING_TEXT) != '' or normalize-space($BODY_TEXT) != ''">
          <div class="rbccm-cta-band__intro">
            <xsl:if test="normalize-space($HEADING_TEXT) != ''">
              <xsl:element name="{$HEADING_TAG}">
                <xsl:attribute name="class">rbccm-cta-band__heading</xsl:attribute>
                <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
                <xsl:value-of select="$HEADING_TEXT" disable-output-escaping="yes"/>
              </xsl:element>
            </xsl:if>
            <xsl:if test="normalize-space($BODY_TEXT) != ''">
              <xsl:element name="{$BODY_TAG}">
                <xsl:attribute name="class">rbccm-cta-band__body</xsl:attribute>
                <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
                <xsl:attribute name="data-animate-delay">250</xsl:attribute>
                <xsl:value-of select="$BODY_TEXT" disable-output-escaping="yes"/>
              </xsl:element>
            </xsl:if>
          </div>
        </xsl:if>

        <xsl:if test="$PRIMARY_TEXT != '' or $SECONDARY_TEXT != ''">
          <!-- Actions row: no parent-level data-animate. Each button
               carries its own delay (primary 500, secondary 650) so
               the second lands slightly after the first instead of
               both fading in together. -->
          <div class="rbccm-cta-band__actions">
            <xsl:call-template name="renderButton">
              <xsl:with-param name="kind" select="'primary'"/>
              <xsl:with-param name="text" select="$PRIMARY_TEXT"/>
              <xsl:with-param name="href" select="$PRIMARY_HREF"/>
              <xsl:with-param name="newTab" select="$PRIMARY_NEWTAB"/>
              <xsl:with-param name="animateDelay" select="'500'"/>
            </xsl:call-template>
            <xsl:call-template name="renderButton">
              <xsl:with-param name="kind" select="'secondary'"/>
              <xsl:with-param name="text" select="$SECONDARY_TEXT"/>
              <xsl:with-param name="href" select="$SECONDARY_HREF"/>
              <xsl:with-param name="newTab" select="$SECONDARY_NEWTAB"/>
              <xsl:with-param name="animateDelay" select="'650'"/>
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
