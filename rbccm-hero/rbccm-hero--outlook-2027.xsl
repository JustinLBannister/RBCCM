<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero :: outlook-2027 (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the Outlook 2027 variant of rbccm-hero. No Preset branching -
  the variant class is hardcoded below.

  Built from the ETF Innovators skin (navy surface, breadcrumbs,
  left-aligned copy, one yellow button) with the Strategy &amp;
  Economics background video (Brightcove in-page player, or an MP4),
  plus:
    - a two-line title (title lines 1 and 2). When line 1 is a
      four-digit year, its last digit is yellow and rolls up from
      the year before (2026 to 2027) once the hero has loaded.
      OlYearRoll "no" keeps the yellow digit without the roll.
    - a pause / play button for the background video (bottom right),
      so the motion can be stopped. The video always starts playing,
      whatever the device's reduced-motion setting; the button is how
      a visitor turns it off.

  Companion skins: rbccm-hero (double-dash) maas-mata.xsl,
                   rbccm-hero (double-dash) strategy-and-economics.xsl,
                   rbccm-hero (double-dash) us-credentials.xsl,
                   rbccm-hero (double-dash) etf-innovators.xsl
  Fields: see rbccm-hero-properties.xml (shared by all the skins).
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Tag allow-list guard. -->
  <!-- Rich text output. Text pasted into the editor straight from Figma
       carries two hidden spans (data-metadata="(figmeta)..." and
       data-buffer="(figma)...") holding the Figma file key and a base64
       copy of the design, often tens of KB per field. They are invisible
       but bloat the page and expose internal file details, so they are
       removed here; all other HTML is output as entered. -->
  <xsl:template name="rbccmRich">
    <xsl:param name="s"/>
    <xsl:variable name="clean"><xsl:call-template name="rbccmStripFigma"><xsl:with-param name="s" select="string($s)"/></xsl:call-template></xsl:variable>
    <xsl:value-of select="$clean" disable-output-escaping="yes"/>
  </xsl:template>

  <xsl:template name="rbccmStripFigma">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, '&lt;span data-metadata=') and contains(substring-after($s, '&lt;span data-metadata='), '&lt;/span&gt;')">
        <xsl:call-template name="rbccmStripFigma">
          <xsl:with-param name="s" select="concat(substring-before($s, '&lt;span data-metadata='), substring-after(substring-after($s, '&lt;span data-metadata='), '&lt;/span&gt;'))"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($s, '&lt;span data-buffer=') and contains(substring-after($s, '&lt;span data-buffer='), '&lt;/span&gt;')">
        <xsl:call-template name="rbccmStripFigma">
          <xsl:with-param name="s" select="concat(substring-before($s, '&lt;span data-buffer='), substring-after(substring-after($s, '&lt;span data-buffer='), '&lt;/span&gt;'))"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

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
    <xsl:variable name="t" select="normalize-space(($n[1]/Option[@Selected='true']/Value | $n[1]/text()[last()][not(../Option[@Selected='true'])])[1])"/>
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


  <!-- Breadcrumbs (US Creds, S+E, ETF): one Textarea on the Content tab
       (HeroBreadcrumbs) holding just the list items, e.g.
         <li><a href="/en/">Home</a></li><li><a href="/en/insights">Insights</a></li>
       The skin wraps them in the breadcrumb nav + list; separators are
       drawn in CSS. Blank = no breadcrumbs. Figma spans are stripped like
       the other rich-text fields. -->
  <xsl:template name="heroBreadcrumbs">
    <xsl:variable name="CRUMBS_HTML" select="//Datum[@ID='HeroBreadcrumbs']"/>
    <xsl:if test="normalize-space($CRUMBS_HTML) != ''">
      <!-- The field's rich-text editor wraps the items in its own list
           (<ul><li>...</li></ul>) and adds data-mce-* attributes. The
           skin supplies the <ul>, so the editor's wrapper is unwrapped
           (a <ul> directly inside a <ul> isn't valid) and the editor
           attributes are dropped: only the <li> items go in the list. -->
      <xsl:variable name="CRUMBS_ITEMS">
        <xsl:call-template name="heroCrumbsUnwrap">
          <xsl:with-param name="s" select="normalize-space($CRUMBS_HTML)"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="CRUMBS_CLEAN">
        <xsl:call-template name="heroCrumbsStripMce">
          <xsl:with-param name="s" select="string($CRUMBS_ITEMS)"/>
        </xsl:call-template>
      </xsl:variable>
      <nav class="rbccm-hero__breadcrumbs" aria-label="Breadcrumb">
        <ul class="rbccm-hero__breadcrumb-list">
          <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="string($CRUMBS_CLEAN)"/></xsl:call-template>
        </ul>
      </nav>
    </xsl:if>
  </xsl:template>

  <!-- Breadcrumbs: if the field starts with an opening <ul ...> or
       <ol ...>, return just what's inside it (up to its closing tag);
       otherwise return the field as entered. -->
  <xsl:template name="heroCrumbsUnwrap">
    <xsl:param name="s"/>
    <xsl:variable name="head" select="translate(substring($s, 1, 3), 'ULO', 'ulo')"/>
    <xsl:choose>
      <xsl:when test="($head = '&lt;ul' or $head = '&lt;ol') and contains($s, '&gt;')">
        <xsl:variable name="inner" select="substring-after($s, '&gt;')"/>
        <xsl:variable name="innerLc" select="translate($inner, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
        <xsl:choose>
          <xsl:when test="contains($innerLc, '&lt;/ul&gt;')"><xsl:value-of select="substring($inner, 1, string-length(substring-before($innerLc, '&lt;/ul&gt;')))"/></xsl:when>
          <xsl:when test="contains($innerLc, '&lt;/ol&gt;')"><xsl:value-of select="substring($inner, 1, string-length(substring-before($innerLc, '&lt;/ol&gt;')))"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="$inner"/></xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Breadcrumbs: drop every data-mce-* attribute (name="value") the
       editor adds, e.g. data-mce-href="/en/". -->
  <xsl:template name="heroCrumbsStripMce">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, ' data-mce-')">
        <xsl:variable name="rest" select="substring-after($s, ' data-mce-')"/>
        <xsl:value-of select="substring-before($s, ' data-mce-')"/>
        <xsl:call-template name="heroCrumbsStripMce">
          <xsl:with-param name="s" select="substring-after(substring-after($rest, '&quot;'), '&quot;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>


  <!-- Built-in button icons (MmCta*Icon). -->
  <xsl:template name="ctaIcon">
    <xsl:param name="key"/>
    <xsl:variable name="d">
      <xsl:choose>
        <xsl:when test="$key = 'arrow'">M13.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L17.586 13H4a1 1 0 110-2h13.586l-4.293-4.293a1 1 0 010-1.414z</xsl:when>
        <xsl:when test="$key = 'play'">M8 5v14l11-7z</xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="$d != ''">
      <svg class="rbccm-button__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path><xsl:attribute name="d"><xsl:value-of select="$d"/></xsl:attribute></path>
      </svg>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"     select="normalize-space((//Datum[@ID='SectionID']/Option[@Selected='true']/Value | //Datum[@ID='SectionID']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="SECTION_ARIA"   select="normalize-space((//Datum[@ID='SectionAriaLabel']/Option[@Selected='true']/Value | //Datum[@ID='SectionAriaLabel']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="CSS_PATH"       select="normalize-space((//Datum[@ID='CssPath']/Option[@Selected='true']/Value | //Datum[@ID='CssPath']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space((//Datum[@ID='CacheVersion']/Option[@Selected='true']/Value | //Datum[@ID='CacheVersion']/text()[last()][not(../Option[@Selected='true'])])[1])"/>

    <!-- Content Datums (shared IDs) -->
    <xsl:variable name="OL_LINE1">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'TitleLine1Text'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_LINE2">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'TitleLine2Text'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_TITLE_TAG_RAW">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'TitleTag'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_SUBTITLE_TEXT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'SubtitleText'"/>
        <xsl:with-param name="raw" select="true()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_SUBTITLE_TAG_RAW">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'SubtitleTag'"/></xsl:call-template>
    </xsl:variable>

    <!-- Year roll: line 1 is a four-digit year (e.g. 2027). Its last
         digit is yellow; unless OlYearRoll is "no", it rolls up from the
         digit before (6 to 7; 0 rolls up from 9). -->
    <xsl:variable name="OL_IS_YEAR" select="string-length($OL_LINE1) = 4 and translate($OL_LINE1, '0123456789', '') = ''"/>
    <xsl:variable name="OL_ROLL_RAW" select="translate(normalize-space((//Datum[@ID='OlYearRoll']/Option[@Selected='true']/Value | //Datum[@ID='OlYearRoll']/text()[last()][not(../Option[@Selected='true'])])[1]), 'NO', 'no')"/>
    <xsl:variable name="OL_ROLL" select="$OL_IS_YEAR and $OL_ROLL_RAW != 'no'"/>
    <xsl:variable name="OL_YEAR_LAST" select="substring($OL_LINE1, 4, 1)"/>
    <xsl:variable name="OL_YEAR_PREV" select="(number($OL_YEAR_LAST) + 9) mod 10"/>

    <!-- Button: the MAAS+MATA button 1 fields. Blank label = no button. -->
    <xsl:variable name="OL_CTA_LABEL" select="normalize-space((//Datum[@ID='MmCta1Label']/Option[@Selected='true']/Value | //Datum[@ID='MmCta1Label']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="OL_CTA_HREF"  select="normalize-space((//Datum[@ID='MmCta1Href']/Option[@Selected='true']/Value | //Datum[@ID='MmCta1Href']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="OL_CTA_ARIA"  select="normalize-space((//Datum[@ID='MmCta1AriaLabel']/Option[@Selected='true']/Value | //Datum[@ID='MmCta1AriaLabel']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="OL_CTA_TITLE" select="normalize-space((//Datum[@ID='MmCta1Title']/Option[@Selected='true']/Value | //Datum[@ID='MmCta1Title']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="OL_CTA_ICON">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'MmCta1Icon'"/></xsl:call-template>
    </xsl:variable>

    <!-- Background video (shared IDs). MP4 wins if both are set. -->
    <xsl:variable name="OL_BG_ACCT">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'BgBrightcoveAccount'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_BG_PLAYER">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'BgBrightcovePlayer'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_BG_VIDEO_ID">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'BgBrightcoveVideoId'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_BG_IDS" select="translate($OL_BG_VIDEO_ID, ' ', '')"/>
    <xsl:variable name="OL_BG_PLAYER_JS">https://players.brightcove.net/<xsl:value-of select="$OL_BG_ACCT"/>/<xsl:value-of select="$OL_BG_PLAYER"/>_default/index.min.js</xsl:variable>
    <xsl:variable name="OL_BG_LAYER_CSS_RAW" select="normalize-space((//Datum[@ID='BgBrightcoveLayerCssPath']/Option[@Selected='true']/Value | //Datum[@ID='BgBrightcoveLayerCssPath']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="OL_BG_LAYER_CSS">
      <xsl:choose>
        <xsl:when test="$OL_BG_LAYER_CSS_RAW != ''"><xsl:value-of select="$OL_BG_LAYER_CSS_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/css/components/rbccm-brightcove-bg-layer.css</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="OL_BG_MP4">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'BgVideoMp4'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_HAS_VIDEO" select="$OL_BG_MP4 != '' or $OL_BG_IDS != ''"/>

    <!-- Tag guards: no eyebrow on this variant, so the title is the h1. -->
    <xsl:variable name="OL_TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$OL_TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'h1'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OL_SUBTITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$OL_SUBTITLE_TAG_RAW"/>
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
    <!-- Brightcove background only: the layer stylesheet, loaded before
         the player so its controls are hidden from the first frame. -->
    <xsl:if test="$OL_BG_MP4 = '' and $OL_BG_IDS != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$OL_BG_LAYER_CSS"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <section>
      <xsl:attribute name="class">rbccm-hero rbccm-hero--outlook-2027<xsl:if test="normalize-space(//Datum[@ID='HeroBreadcrumbs']) != ''"> rbccm-hero--has-breadcrumbs</xsl:if><xsl:if test="$OL_HAS_VIDEO"> rbccm-hero--has-video</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <!-- Background video. MP4: a native <video>. Brightcove: the
           in-page player (as on S+E), which rbccm-brightcove-bg-layer.css
           strips of every control and crops to cover. One ID plays at
           every width; IDs separated by commas are one cut per
           breakpoint (3 = mobile, tablet, desktop; 2 = mobile, desktop).
           inert keeps the player out of the tab order. Blank both =
           navy only, and no pause button. -->
      <xsl:choose>
        <xsl:when test="$OL_BG_MP4 != ''">
          <div class="rbccm-hero__bg-video" aria-hidden="true">
            <video autoplay="autoplay" muted="muted" loop="loop" playsinline="playsinline" preload="auto">
              <source type="video/mp4">
                <xsl:attribute name="src"><xsl:value-of select="$OL_BG_MP4"/></xsl:attribute>
              </source>
            </video>
          </div>
        </xsl:when>
        <xsl:when test="$OL_BG_IDS != ''">
          <div class="rbccm-hero__bg-video rbccm-brightcove-bg-layer" aria-hidden="true" inert="inert">
            <xsl:attribute name="data-bg-video-ids"><xsl:value-of select="$OL_BG_IDS"/></xsl:attribute>
            <xsl:attribute name="data-bg-player-js"><xsl:value-of select="$OL_BG_PLAYER_JS"/></xsl:attribute>
            <video-js class="rbccm-brightcove-bg-layer__player" data-embed="default" muted="muted" autoplay="autoplay" loop="loop" playsinline="playsinline" preload="auto" tabindex="-1">
              <xsl:attribute name="data-account"><xsl:value-of select="$OL_BG_ACCT"/></xsl:attribute>
              <xsl:attribute name="data-player"><xsl:value-of select="$OL_BG_PLAYER"/></xsl:attribute>
            </video-js>
          </div>
        </xsl:when>
      </xsl:choose>
      <xsl:if test="$OL_HAS_VIDEO">
        <div class="rbccm-hero__bg-shade" aria-hidden="true"></div>
      </xsl:if>

      <div class="rbccm-hero__container">

        <xsl:call-template name="heroBreadcrumbs"/>

        <xsl:if test="$OL_LINE1 != '' or $OL_LINE2 != ''">
          <xsl:element name="{$OL_TITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
            <xsl:attribute name="data-animate-delay">150</xsl:attribute>
            <xsl:if test="$OL_LINE1 != ''">
              <xsl:choose>
                <!-- Year: the plain year is the heading's only text, for
                     screen readers and for anything that reads the page
                     source. The digits people see are drawn by CSS from
                     data-text, so the rolling digit adds no stray
                     characters to the heading. Each of the first three
                     digits is its own span so they can fade in one
                     after the other. -->
                <xsl:when test="$OL_IS_YEAR">
                  <span class="rbccm-hero__title-line rbccm-hero__title-line--year">
                    <span class="rbccm-hero__sr-only"><xsl:value-of select="$OL_LINE1"/></span>
                    <span class="rbccm-hero__year" aria-hidden="true">
                      <span class="rbccm-hero__year-head"><span class="rbccm-hero__year-lead"><xsl:attribute name="data-text"><xsl:value-of select="substring($OL_LINE1, 1, 1)"/></xsl:attribute></span><span class="rbccm-hero__year-lead"><xsl:attribute name="data-text"><xsl:value-of select="substring($OL_LINE1, 2, 1)"/></xsl:attribute></span><span class="rbccm-hero__year-lead"><xsl:attribute name="data-text"><xsl:value-of select="substring($OL_LINE1, 3, 1)"/></xsl:attribute></span></span>
                      <xsl:choose>
                        <xsl:when test="$OL_ROLL">
                          <span class="rbccm-hero__year-roll"><span class="rbccm-hero__year-strip"><span class="rbccm-hero__year-digit"><xsl:attribute name="data-text"><xsl:value-of select="$OL_YEAR_PREV"/></xsl:attribute></span><span class="rbccm-hero__year-digit rbccm-hero__year-digit--new"><xsl:attribute name="data-text"><xsl:value-of select="$OL_YEAR_LAST"/></xsl:attribute></span></span></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="rbccm-hero__year-digit rbccm-hero__year-digit--new"><xsl:attribute name="data-text"><xsl:value-of select="$OL_YEAR_LAST"/></xsl:attribute></span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </span>
                  </span>
                </xsl:when>
                <xsl:otherwise>
                  <span class="rbccm-hero__title-line"><xsl:value-of select="$OL_LINE1"/></span>
                </xsl:otherwise>
              </xsl:choose>
              <xsl:if test="$OL_LINE2 != ''"><xsl:text> </xsl:text></xsl:if>
            </xsl:if>
            <xsl:if test="$OL_LINE2 != ''">
              <span class="rbccm-hero__title-line"><xsl:value-of select="$OL_LINE2"/></span>
            </xsl:if>
          </xsl:element>
        </xsl:if>

        <xsl:if test="normalize-space($OL_SUBTITLE_TEXT) != ''">
          <xsl:element name="{$OL_SUBTITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__subtitle</xsl:attribute>
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
            <xsl:attribute name="data-animate-delay">300</xsl:attribute>
            <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$OL_SUBTITLE_TEXT"/></xsl:call-template>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$OL_CTA_LABEL != ''">
          <div class="rbccm-hero__actions" data-hero-rise="rise" data-animate-delay="450">
            <a class="rbccm-button rbccm-button--yellow">
              <xsl:attribute name="href"><xsl:value-of select="$OL_CTA_HREF"/></xsl:attribute>
              <xsl:if test="$OL_CTA_ARIA != ''">
                <xsl:attribute name="aria-label"><xsl:value-of select="$OL_CTA_ARIA"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="$OL_CTA_TITLE != ''">
                <xsl:attribute name="title"><xsl:value-of select="$OL_CTA_TITLE"/></xsl:attribute>
              </xsl:if>
              <span class="rbccm-button__label"><xsl:value-of select="$OL_CTA_LABEL"/></span>
              <xsl:choose>
                <xsl:when test="$OL_CTA_ICON = 'arrow' or $OL_CTA_ICON = ''">
                  <svg class="rbccm-button__icon rbccm-button__icon--line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" fill="none" aria-hidden="true"><path d="M0.75 6H15.25M15.25 6L10.25 1M15.25 6L10.25 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:call-template name="ctaIcon">
                    <xsl:with-param name="key" select="$OL_CTA_ICON"/>
                  </xsl:call-template>
                </xsl:otherwise>
              </xsl:choose>
            </a>
          </div>
        </xsl:if>

      </div>

      <!-- Pause / play for the background video. The label says what
           the button will do; the script swaps it and the icon, and
           draws the video's progress as the ring round the button. -->
      <xsl:if test="$OL_HAS_VIDEO">
        <button type="button" class="rbccm-hero__video-toggle" aria-label="Pause background video" data-label-pause="Pause background video" data-label-play="Play background video">
          <!-- Ring round the button: how far through the video is. -->
          <svg class="rbccm-hero__video-toggle-ring" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="rbccm-hero__video-toggle-ring-track" cx="16" cy="16" r="15.25" fill="none"/><circle class="rbccm-hero__video-toggle-ring-fill" cx="16" cy="16" r="15.25" fill="none" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>
          <svg class="rbccm-hero__video-toggle-icon rbccm-hero__video-toggle-icon--pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><rect x="2" y="1" width="2.6" height="10" rx="0.8"/><rect x="7.4" y="1" width="2.6" height="10" rx="0.8"/></svg>
          <svg class="rbccm-hero__video-toggle-icon rbccm-hero__video-toggle-icon--play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 1.4v9.2a.6.6 0 00.92.5l7.1-4.6a.6.6 0 000-1L3.92.9A.6.6 0 003 1.4z"/></svg>
        </button>
        <!-- Inline script: written without ampersands or angle brackets
             (as on the S+E skin), so it comes through the XSL unescaped. -->
        <script>
(function () {
  var s = document.currentScript;
  var hero = s ? s.parentNode : null;
  if (!hero) return;
  var btn = hero.querySelector('.rbccm-hero__video-toggle');
  var wrap = hero.querySelector('.rbccm-hero__bg-video');
  if (!btn) return;
  if (!wrap) return;
  var native = wrap.querySelector('video');
  var bcEl = wrap.querySelector('video-js');
  var paused = false;
  var ring = btn.querySelector('.rbccm-hero__video-toggle-ring-fill');
  var frame = 0;

  /* The ring round the button shows how far through the video is. It
     fills as the video plays and holds where it is while paused. If
     the length is not known yet, the ring is drawn whole. */
  function draw() {
    frame = 0;
    var media = native || wrap.querySelector('video');
    if (ring) {
      var length = media ? media.duration : 0;
      var known = isFinite(length) ? length !== 0 : false;
      var part = known ? Math.min(1, Math.max(0, media.currentTime / length)) : 1;
      ring.style.strokeDashoffset = String(100 - part * 100);
    }
    if (!paused) frame = window.requestAnimationFrame(draw);
  }

  function bcPlayer() {
    if (!bcEl) return null;
    if (!bcEl.id) return null;
    return window.videojs ? window.videojs.getPlayer(bcEl.id) : null;
  }
  function apply() {
    var target = native || bcPlayer();
    if (target) {
      if (paused) {
        target.pause();
      } else {
        var p = target.play();
        if (p) {
          if (p.catch) p.catch(function () {});
        }
      }
    }
    hero.classList.toggle('rbccm-hero--video-paused', paused);
    btn.setAttribute('aria-label', btn.getAttribute(paused ? 'data-label-play' : 'data-label-pause'));
    if (!frame) draw();
  }
  btn.addEventListener('click', function () {
    paused = !paused;
    apply();
  });
  if (native) {
    if (paused) native.removeAttribute('autoplay');
    apply();
    return;
  }
  if (!bcEl) return;

  /* Brightcove in-page player (as on S+E): pick the cut for the current
     width, load the player script once, keep it muted and chrome-free,
     and swap the cut when the width crosses a breakpoint. It only
     starts playing if the visitor hasn't paused it. */
  var ids = (wrap.getAttribute('data-bg-video-ids') || '').split(',').filter(function (id) { return id; });
  if (!ids.length) return;
  var last = ids[ids.length - 1];
  var byWidth = {
    mobile:  ids[0],
    tablet:  ids.length === 3 ? ids[1] : last,
    desktop: last
  };
  var desktop = window.matchMedia ? window.matchMedia('(min-width: 992px)') : null;
  var tablet = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;
  function currentId() {
    if (!desktop) return byWidth.desktop;
    return byWidth[desktop.matches ? 'desktop' : (tablet.matches ? 'tablet' : 'mobile')];
  }
  if (!bcEl.id) bcEl.id = 'rbccm-bg-player-' + Math.random().toString(36).slice(2, 9);
  bcEl.setAttribute('data-video-id', currentId());
  if (paused) bcEl.removeAttribute('autoplay');
  apply();

  function quiet(player) {
    player.controls(false);
    player.muted(true);
    apply();
  }
  function onReady() {
    var player = bcPlayer();
    if (!player) return;
    player.ready(function () { quiet(player); });
    if (!desktop) return;
    var shown = currentId();
    function swap() {
      var id = currentId();
      if (id === shown) return;
      shown = id;
      if (!player.catalog) return;
      player.catalog.getVideo(id, function (err, video) {
        if (err) return;
        player.catalog.load(video);
        quiet(player);
      });
    }
    [desktop, tablet].forEach(function (q) {
      if (q.addEventListener) q.addEventListener('change', swap);
      else if (q.addListener) q.addListener(swap);
    });
  }

  /* Brightcove's script sets up every video-js tag on the page when it
     loads. If another component already loaded it, set this one up
     with bc(); otherwise add the script once. */
  var src = wrap.getAttribute('data-bg-player-js');
  var existing = document.querySelector('script[src="' + src + '"]');
  if (window.bc) {
    if (existing) {
      window.bc(bcEl);
      onReady();
      return;
    }
  }
  var tag = existing || document.createElement('script');
  tag.addEventListener('load', onReady);
  if (!existing) {
    tag.src = src;
    document.body.appendChild(tag);
  }
})();
        </script>
      </xsl:if>
    </section>

  </xsl:template>

</xsl:stylesheet>
