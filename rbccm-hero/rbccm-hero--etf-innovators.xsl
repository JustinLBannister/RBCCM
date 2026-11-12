<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero :: etf-innovators (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the ETF Innovators variant of rbccm-hero. No Preset branching -
  the variant class is hardcoded below.

  Built from the US Credentials skin (navy surface, background
  image with a desktop and a mobile version, breadcrumbs) with the
  S+E left-aligned copy column, plus:
    - one yellow button (the MAAS+MATA button 1 fields; always
      yellow here, the style field is ignored)
    - a name tag over the photo (EtfNameTagName / EtfNameTagTitle)
  No eyebrow, no title line 2, no background video.

  Companion skins: rbccm-hero (double-dash) maas-mata.xsl,
                   rbccm-hero (double-dash) strategy-and-economics.xsl,
                   rbccm-hero (double-dash) us-credentials.xsl
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


  <!-- Breadcrumbs (US Creds, S+E): one Textarea on the Content tab
       (HeroBreadcrumbs) holding just the list items, e.g.
         <li><a href="/en/">Home</a></li><li><a href="/en/about-us">About Us</a></li>
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
        <!-- Find the closing tag in a lower-cased copy (so </UL> matches
             too), then cut the original at that position. -->
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
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>

    <!-- Content Datums (shared IDs) -->
    <xsl:variable name="ETF_TITLE">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'TitleLine1Text'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ETF_TITLE_TAG_RAW">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'TitleTag'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ETF_SUBTITLE_TEXT">
      <xsl:call-template name="datum">
        <xsl:with-param name="id" select="'SubtitleText'"/>
        <xsl:with-param name="raw" select="true()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ETF_SUBTITLE_TAG_RAW">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'SubtitleTag'"/></xsl:call-template>
    </xsl:variable>

    <!-- Button: the MAAS+MATA button 1 fields. Blank label = no button. -->
    <xsl:variable name="ETF_CTA_LABEL" select="normalize-space(//Datum[@ID='MmCta1Label']/text()[last()])"/>
    <xsl:variable name="ETF_CTA_HREF"  select="normalize-space(//Datum[@ID='MmCta1Href']/text()[last()])"/>
    <xsl:variable name="ETF_CTA_ARIA"  select="normalize-space(//Datum[@ID='MmCta1AriaLabel']/text()[last()])"/>
    <xsl:variable name="ETF_CTA_TITLE" select="normalize-space(//Datum[@ID='MmCta1Title']/text()[last()])"/>
    <xsl:variable name="ETF_CTA_ICON">
      <xsl:call-template name="datum"><xsl:with-param name="id" select="'MmCta1Icon'"/></xsl:call-template>
    </xsl:variable>

    <!-- Background image: desktop (992px+) and mobile. Either one is
         enough; a blank one uses the other. Blank both = navy only. -->
    <xsl:variable name="ETF_IMG_D_RAW" select="normalize-space(//Datum[@ID='EtfBgImageDesktop']/text()[last()])"/>
    <xsl:variable name="ETF_IMG_M_RAW" select="normalize-space(//Datum[@ID='EtfBgImageMobile']/text()[last()])"/>
    <xsl:variable name="ETF_IMG_D">
      <xsl:choose>
        <xsl:when test="$ETF_IMG_D_RAW != ''"><xsl:value-of select="$ETF_IMG_D_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$ETF_IMG_M_RAW"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="ETF_IMG_M">
      <xsl:choose>
        <xsl:when test="$ETF_IMG_M_RAW != ''"><xsl:value-of select="$ETF_IMG_M_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$ETF_IMG_D_RAW"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Name tag over the photo. Blank name = no tag. -->
    <xsl:variable name="ETF_TAG_NAME"  select="normalize-space(//Datum[@ID='EtfNameTagName']/text()[last()])"/>
    <xsl:variable name="ETF_TAG_TITLE" select="normalize-space(//Datum[@ID='EtfNameTagTitle']/text()[last()])"/>

    <!-- Tag guards: no eyebrow on this variant, so the title is the h1. -->
    <xsl:variable name="ETF_TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$ETF_TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'h1'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ETF_SUBTITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$ETF_SUBTITLE_TAG_RAW"/>
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
      <xsl:attribute name="class">rbccm-hero rbccm-hero--etf-innovators<xsl:if test="normalize-space(//Datum[@ID='HeroBreadcrumbs']) != ''"> rbccm-hero--has-breadcrumbs</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>
      <!-- Both URLs ride on custom properties; the CSS uses one per
           breakpoint, so only the image in use downloads. -->
      <xsl:if test="$ETF_IMG_D != ''">
        <xsl:attribute name="data-hero-bg">image</xsl:attribute>
        <xsl:attribute name="style">--rbccm-hero-bg-desktop: url('<xsl:value-of select="$ETF_IMG_D"/>'); --rbccm-hero-bg-mobile: url('<xsl:value-of select="$ETF_IMG_M"/>');</xsl:attribute>
      </xsl:if>

      <xsl:if test="$ETF_IMG_D != ''">
        <div class="rbccm-hero__bg-image" aria-hidden="true"></div>
      </xsl:if>

      <div class="rbccm-hero__container">

        <xsl:call-template name="heroBreadcrumbs"/>

        <xsl:if test="$ETF_TITLE != ''">
          <xsl:element name="{$ETF_TITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
            <xsl:attribute name="data-animate-delay">150</xsl:attribute>
            <xsl:value-of select="$ETF_TITLE"/>
          </xsl:element>
        </xsl:if>

        <xsl:if test="normalize-space($ETF_SUBTITLE_TEXT) != ''">
          <xsl:element name="{$ETF_SUBTITLE_TAG}">
            <xsl:attribute name="class">rbccm-hero__subtitle</xsl:attribute>
            <xsl:attribute name="data-hero-rise">rise</xsl:attribute>
            <xsl:attribute name="data-animate-delay">300</xsl:attribute>
            <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$ETF_SUBTITLE_TEXT"/></xsl:call-template>
          </xsl:element>
        </xsl:if>

        <xsl:if test="$ETF_CTA_LABEL != ''">
          <div class="rbccm-hero__actions" data-hero-rise="rise" data-animate-delay="450">
            <a class="rbccm-button rbccm-button--yellow">
              <xsl:attribute name="href"><xsl:value-of select="$ETF_CTA_HREF"/></xsl:attribute>
              <xsl:if test="$ETF_CTA_ARIA != ''">
                <xsl:attribute name="aria-label"><xsl:value-of select="$ETF_CTA_ARIA"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="$ETF_CTA_TITLE != ''">
                <xsl:attribute name="title"><xsl:value-of select="$ETF_CTA_TITLE"/></xsl:attribute>
              </xsl:if>
              <span class="rbccm-button__label"><xsl:value-of select="$ETF_CTA_LABEL"/></span>
              <!-- Arrow: the comp's thin line arrow (stroke, so it takes
                   the button's text colour). Play / none use the shared
                   built-in icons. -->
              <xsl:choose>
                <xsl:when test="$ETF_CTA_ICON = 'arrow'">
                  <svg class="rbccm-button__icon rbccm-button__icon--line" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" fill="none" aria-hidden="true"><path d="M0.75 6H15.25M15.25 6L10.25 1M15.25 6L10.25 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:call-template name="ctaIcon">
                    <xsl:with-param name="key" select="$ETF_CTA_ICON"/>
                  </xsl:call-template>
                </xsl:otherwise>
              </xsl:choose>
            </a>
          </div>
        </xsl:if>

      </div>

      <!-- Name tag: bottom right over the photo, on the container's
           right edge (see the CSS). -->
      <xsl:if test="$ETF_TAG_NAME != ''">
        <p class="rbccm-hero__name-tag" data-hero-rise="rise" data-animate-delay="600">
          <span class="rbccm-hero__name-tag-name"><xsl:value-of select="$ETF_TAG_NAME"/></span>
          <xsl:if test="$ETF_TAG_TITLE != ''">
            <span class="rbccm-hero__name-tag-title"><xsl:value-of select="$ETF_TAG_TITLE"/></span>
          </xsl:if>
        </p>
      </xsl:if>
    </section>

  </xsl:template>

</xsl:stylesheet>
