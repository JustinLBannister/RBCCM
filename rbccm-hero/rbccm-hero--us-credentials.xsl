<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero :: us-credentials (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the US Credentials variant of rbccm-hero. No Preset branching -
  the variant class is hardcoded below.

  Blend of MAAS+MATA (centred stack, 2-line title with accent
  colour on line 2, subtitle) and S+E (optional bg video, MP4 or
  Brightcove). Dark navy surface throughout. No CTA row.

  Companion skins: rbccm-hero--maas-mata.xsl,
                   rbccm-hero--strategy-and-economics.xsl
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

    <xsl:variable name="SECTION_ID"     select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"   select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"       select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(//Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Datum lookups (Uc* prefix) -->
    <xsl:variable name="UC_EYEBROW_TEXT"     select="normalize-space(//Datum[@ID='UcEyebrowText']/text()[last()])"/>
    <xsl:variable name="UC_EYEBROW_TAG_RAW"  select="normalize-space(//Datum[@ID='UcEyebrowTag']/Option[@Selected='true']/Value)"/>
    <xsl:variable name="UC_TITLE_L1"         select="normalize-space(//Datum[@ID='UcTitleLine1Text']/text()[last()])"/>
    <xsl:variable name="UC_TITLE_L2"         select="normalize-space(//Datum[@ID='UcTitleLine2Text']/text()[last()])"/>
    <xsl:variable name="UC_TITLE_TAG_RAW"    select="normalize-space(//Datum[@ID='UcTitleTag']/Option[@Selected='true']/Value)"/>
    <xsl:variable name="UC_SUBTITLE_TEXT"    select="//Datum[@ID='UcSubtitleText']"/>
    <xsl:variable name="UC_SUBTITLE_TAG_RAW" select="normalize-space(//Datum[@ID='UcSubtitleTag']/Option[@Selected='true']/Value)"/>

    <xsl:variable name="UC_BG_ACCT"          select="normalize-space(//Datum[@ID='UcBgBrightcoveAccount']/text()[last()])"/>
    <xsl:variable name="UC_BG_PLAYER"        select="normalize-space(//Datum[@ID='UcBgBrightcovePlayer']/text()[last()])"/>
    <xsl:variable name="UC_BG_VIDEO_ID"      select="normalize-space(//Datum[@ID='UcBgBrightcoveVideoId']/text()[last()])"/>
    <xsl:variable name="UC_BG_MP4"           select="normalize-space(//Datum[@ID='UcBgVideoMp4']/text()[last()])"/>

    <!-- Tag guards -->
    <xsl:variable name="UC_EYEBROW_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$UC_EYEBROW_TAG_RAW"/>
        <xsl:with-param name="default" select="'h1'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$UC_TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'p'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_SUBTITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$UC_SUBTITLE_TAG_RAW"/>
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
      <xsl:attribute name="class">rbccm-hero rbccm-hero--us-credentials<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-hero--header-center</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <!-- Optional bg video. MP4 wins if both are set; renders a
           native <video> for lighter payload + no player chrome.
           Falls back to a Brightcove iframe when only the Brightcove
           Video ID is populated. Blank both = solid navy fill only. -->
      <xsl:choose>
        <xsl:when test="$UC_BG_MP4 != ''">
          <div class="rbccm-hero__bg-video" aria-hidden="true">
            <video autoplay="autoplay" muted="muted" loop="loop" playsinline="playsinline" preload="auto">
              <source type="video/mp4">
                <xsl:attribute name="src"><xsl:value-of select="$UC_BG_MP4"/></xsl:attribute>
              </source>
            </video>
          </div>
        </xsl:when>
        <xsl:when test="$UC_BG_VIDEO_ID != ''">
          <div class="rbccm-hero__bg-video" aria-hidden="true">
            <iframe allow="autoplay" frameborder="0" scrolling="no" allowfullscreen="allowfullscreen">
              <xsl:attribute name="src">https://players.brightcove.net/<xsl:value-of select="$UC_BG_ACCT"/>/<xsl:value-of select="$UC_BG_PLAYER"/>_default/index.html?videoId=<xsl:value-of select="$UC_BG_VIDEO_ID"/>&amp;autoplay=true&amp;muted=true&amp;loop=true&amp;playsinline=true&amp;controls=false</xsl:attribute>
            </iframe>
          </div>
        </xsl:when>
      </xsl:choose>

      <div class="rbccm-hero__container">

        <xsl:if test="$UC_EYEBROW_TEXT != ''">
          <xsl:element name="{$UC_EYEBROW_TAG}">
            <xsl:attribute name="class">rbccm-hero__eyebrow</xsl:attribute>
            <xsl:attribute name="data-animate-hero">fadeInDown</xsl:attribute>
            <xsl:attribute name="data-animate-delay">0</xsl:attribute>
            <xsl:value-of select="$UC_EYEBROW_TEXT"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$UC_TITLE_L1 != '' or $UC_TITLE_L2 != ''">
          <xsl:element name="{$UC_TITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
            <xsl:attribute name="data-animate-hero">fadeInUp</xsl:attribute>
            <xsl:attribute name="data-animate-delay">150</xsl:attribute>
            <xsl:if test="$UC_TITLE_L1 != ''">
              <span class="rbccm-hero__title-line"><xsl:value-of select="$UC_TITLE_L1"/></span>
            </xsl:if>
            <xsl:if test="$UC_TITLE_L2 != ''">
              <span class="rbccm-hero__title-line"><xsl:value-of select="$UC_TITLE_L2"/></span>
            </xsl:if>
          </xsl:element>
        </xsl:if>

        <xsl:if test="normalize-space($UC_SUBTITLE_TEXT) != ''">
          <xsl:element name="{$UC_SUBTITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__subtitle</xsl:attribute>
            <xsl:attribute name="data-animate-hero">fadeInUp</xsl:attribute>
            <xsl:attribute name="data-animate-delay">300</xsl:attribute>
            <xsl:value-of select="$UC_SUBTITLE_TEXT" disable-output-escaping="yes"/>
          </xsl:element>
        </xsl:if>

      </div>
    </section>

  </xsl:template>

</xsl:stylesheet>
