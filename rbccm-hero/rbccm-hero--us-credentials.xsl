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

  Companion skins: rbccm-hero (double-dash) maas-mata.xsl,
                   rbccm-hero (double-dash) strategy-and-economics.xsl
  Fields: see rbccm-hero-properties.xml (shared by all three skins).
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

    <!-- Content Datums (shared IDs, with pre-cleanup Uc* fallback) -->
    <xsl:variable name="UC_EYEBROW_TEXT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'EyebrowText'"/>
        <xsl:with-param name="legacy" select="'UcEyebrowText'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_EYEBROW_TAG_RAW">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'EyebrowTag'"/>
        <xsl:with-param name="legacy" select="'UcEyebrowTag'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_TITLE_L1">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'TitleLine1Text'"/>
        <xsl:with-param name="legacy" select="'UcTitleLine1Text'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_TITLE_L2">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'TitleLine2Text'"/>
        <xsl:with-param name="legacy" select="'UcTitleLine2Text'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_TITLE_TAG_RAW">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'TitleTag'"/>
        <xsl:with-param name="legacy" select="'UcTitleTag'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_SUBTITLE_TEXT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'SubtitleText'"/>
        <xsl:with-param name="legacy" select="'UcSubtitleText'"/>
        <xsl:with-param name="raw" select="true()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_SUBTITLE_TAG_RAW">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'SubtitleTag'"/>
        <xsl:with-param name="legacy" select="'UcSubtitleTag'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Background video (shared IDs, with pre-cleanup Uc* fallback) -->
    <xsl:variable name="UC_BG_ACCT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'BgBrightcoveAccount'"/>
        <xsl:with-param name="legacy" select="'UcBgBrightcoveAccount'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_BG_PLAYER">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'BgBrightcovePlayer'"/>
        <xsl:with-param name="legacy" select="'UcBgBrightcovePlayer'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_BG_VIDEO_ID">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'BgBrightcoveVideoId'"/>
        <xsl:with-param name="legacy" select="'UcBgBrightcoveVideoId'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="UC_BG_MP4">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'BgVideoMp4'"/>
        <xsl:with-param name="legacy" select="'UcBgVideoMp4'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Background images, two sets picked by the page URL:
           the UcBgUrlParamGm parameter   Global Markets set
           (default ?hero=global-markets)
           anything else / no parameter   Global Investment Banking set
         Each set has a desktop (992px+) and a mobile image. A blank
         image falls back to the other size of the same set, and a blank
         Global Markets set falls back to Global Investment Banking, so
         any one path is enough. Any image set = images win over the
         background video fields. -->
    <xsl:variable name="UC_IMG_GIB_D_RAW" select="normalize-space(//Datum[@ID='UcBgImageGibDesktop']/text()[last()])"/>
    <xsl:variable name="UC_IMG_GIB_M_RAW" select="normalize-space(//Datum[@ID='UcBgImageGibMobile']/text()[last()])"/>
    <xsl:variable name="UC_IMG_GM_D_RAW"  select="normalize-space(//Datum[@ID='UcBgImageGmDesktop']/text()[last()])"/>
    <xsl:variable name="UC_IMG_GM_M_RAW"  select="normalize-space(//Datum[@ID='UcBgImageGmMobile']/text()[last()])"/>
    <xsl:variable name="UC_IMG_GIB_D">
      <xsl:choose>
        <xsl:when test="$UC_IMG_GIB_D_RAW != ''"><xsl:value-of select="$UC_IMG_GIB_D_RAW"/></xsl:when>
        <xsl:when test="$UC_IMG_GIB_M_RAW != ''"><xsl:value-of select="$UC_IMG_GIB_M_RAW"/></xsl:when>
        <xsl:when test="$UC_IMG_GM_D_RAW != ''"><xsl:value-of select="$UC_IMG_GM_D_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$UC_IMG_GM_M_RAW"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="UC_IMG_GIB_M">
      <xsl:choose>
        <xsl:when test="$UC_IMG_GIB_M_RAW != ''"><xsl:value-of select="$UC_IMG_GIB_M_RAW"/></xsl:when>
        <xsl:when test="$UC_IMG_GIB_D_RAW != ''"><xsl:value-of select="$UC_IMG_GIB_D_RAW"/></xsl:when>
        <xsl:when test="$UC_IMG_GM_M_RAW != ''"><xsl:value-of select="$UC_IMG_GM_M_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$UC_IMG_GM_D_RAW"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="UC_IMG_GM_D">
      <xsl:choose>
        <xsl:when test="$UC_IMG_GM_D_RAW != ''"><xsl:value-of select="$UC_IMG_GM_D_RAW"/></xsl:when>
        <xsl:when test="$UC_IMG_GM_M_RAW != ''"><xsl:value-of select="$UC_IMG_GM_M_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$UC_IMG_GIB_D"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="UC_IMG_GM_M">
      <xsl:choose>
        <xsl:when test="$UC_IMG_GM_M_RAW != ''"><xsl:value-of select="$UC_IMG_GM_M_RAW"/></xsl:when>
        <xsl:when test="$UC_IMG_GM_D_RAW != ''"><xsl:value-of select="$UC_IMG_GM_D_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$UC_IMG_GIB_M"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="UC_HAS_IMAGES" select="$UC_IMG_GIB_D != ''"/>

    <!-- URL parameter that switches to the Global Markets set, editable
         on the Content tab so it can change without touching code. Typed
         as it appears in the URL (name=value, not case-sensitive). Blank,
         or missing on older instances, uses hero=global-markets. Without
         it the page always shows Global Investment Banking. -->
    <xsl:variable name="UC_BG_GM_PARAM_RAW" select="normalize-space(//Datum[@ID='UcBgUrlParamGm']/text()[last()])"/>
    <xsl:variable name="UC_BG_GM_PARAM">
      <xsl:choose>
        <xsl:when test="$UC_BG_GM_PARAM_RAW != ''"><xsl:value-of select="translate($UC_BG_GM_PARAM_RAW, '?&amp; ', '')"/></xsl:when>
        <xsl:otherwise>hero=global-markets</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Tag guards -->
    <xsl:variable name="UC_EYEBROW_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$UC_EYEBROW_TAG_RAW"/>
        <xsl:with-param name="default" select="'h1'"/>
      </xsl:call-template>
    </xsl:variable>
    <!-- Title on Auto: p when there is an eyebrow (the eyebrow is the
         h1), h1 when there isn't, so the page always has one h1. The
         Title tag picker overrides either way. -->
    <xsl:variable name="UC_TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$UC_TITLE_TAG_RAW"/>
        <xsl:with-param name="default">
          <xsl:choose>
            <xsl:when test="$UC_EYEBROW_TEXT != ''">p</xsl:when>
            <xsl:otherwise>h1</xsl:otherwise>
          </xsl:choose>
        </xsl:with-param>
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
      <!-- Background image set: server default GIB, the inline script
           below switches it to GM when the URL has the Content tab's
           parameter (see UC_BG_GM_PARAM), before the first paint. The
           four URLs ride on custom properties; the CSS only applies the
           two for the active set, so only the image in use downloads. -->
      <xsl:if test="$UC_HAS_IMAGES">
        <xsl:attribute name="data-hero-bg">gib</xsl:attribute>
        <xsl:attribute name="data-hero-bg-gm-param"><xsl:value-of select="$UC_BG_GM_PARAM"/></xsl:attribute>
        <xsl:attribute name="style">--rbccm-hero-bg-gib-desktop: url('<xsl:value-of select="$UC_IMG_GIB_D"/>'); --rbccm-hero-bg-gib-mobile: url('<xsl:value-of select="$UC_IMG_GIB_M"/>'); --rbccm-hero-bg-gm-desktop: url('<xsl:value-of select="$UC_IMG_GM_D"/>'); --rbccm-hero-bg-gm-mobile: url('<xsl:value-of select="$UC_IMG_GM_M"/>');</xsl:attribute>
      </xsl:if>

      <xsl:if test="$UC_HAS_IMAGES">
        <div class="rbccm-hero__bg-image" aria-hidden="true"></div>
        <script>
(function () {
  var s = document.currentScript;
  var section = s ? s.parentNode : null;
  if (!section) return;
  /* Content tab field, e.g. "hero=global-markets". */
  var want = (section.getAttribute('data-hero-bg-gm-param') || 'hero=global-markets').toLowerCase().split('=');
  var pairs = window.location.search.replace(/^\?/, '').split('&amp;');
  for (var i = 0; i &lt; pairs.length; i++) {
    var kv = pairs[i].split('=');
    var key = '';
    var value = '';
    try {
      key = decodeURIComponent(kv[0]).toLowerCase();
      value = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')).toLowerCase();
    } catch (e) {}
    if (key === want[0]) {
      if (value === (want[1] || '')) section.setAttribute('data-hero-bg', 'gm');
      break;
    }
  }
})();
        </script>
      </xsl:if>

      <!-- Optional bg video. MP4 wins if both are set; renders a
           native <video> for lighter payload + no player chrome.
           Falls back to a Brightcove iframe when only the Brightcove
           Video ID is populated. Blank both = solid navy fill only. -->
      <xsl:choose>
        <xsl:when test="$UC_HAS_IMAGES"></xsl:when>
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
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
            <xsl:attribute name="data-animate-delay">0</xsl:attribute>
            <xsl:value-of select="$UC_EYEBROW_TEXT"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$UC_TITLE_L1 != '' or $UC_TITLE_L2 != ''">
          <xsl:element name="{$UC_TITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
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
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
            <xsl:attribute name="data-animate-delay">300</xsl:attribute>
            <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$UC_SUBTITLE_TEXT"/></xsl:call-template>
          </xsl:element>
        </xsl:if>

      </div>
    </section>

  </xsl:template>

</xsl:stylesheet>
