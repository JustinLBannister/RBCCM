<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero - XSL skin
  ==============================================================
  Renders a Preset-driven hero section. Two variants supported:

    maas-mata               eyebrow / 2-line title / subtitle /
                            dual-CTA row, centred, glow halo bg.
    strategy-and-economics  split 2-col layout with an optional
                            Brightcove video backdrop and a dark
                            "Latest insight" card on the right.

  Semantic tag picker
  ==============================================================
  Every editable text field ships with a companion Tag Datum
  (h1..h6, p, div, span). The XSL emits the chosen tag via
  <xsl:element name="{...}"> so authors can pick per-field
  semantics without touching the skin. A pickTag named template
  guards the value: anything outside the allow-list falls back
  to a safe default so a mis-typed Datum never emits garbage
  markup.

  Preset routing
  ==============================================================
  A single xsl:choose branches on the Preset Datum. Each branch
  reads only its own Mm* or Se* Datums; the other preset's
  Datums are ignored and don't render anything.

  Reads
  ==============================================================
    /Properties/Data/Datum[@ID='...']

  Emits
  ==============================================================
    <link rel="stylesheet" href="{CssPath}?v={CacheVersion}">
    <link rel="stylesheet" href="{ButtonCssPath}?v={CacheVersion}">
    <section class="rbccm-hero rbccm-hero__{preset}"
             id="{SectionID}"
             aria-label="{SectionAriaLabel}">
      ...preset-specific body...
    </section>

  (Class names in this file use the __ substitution form in
  comments only so the XML stays well-formed; the emitted
  markup uses the real BEM double-hyphen modifier syntax.)
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- ============================================================
       pickTag - allow-list guard for the tag pickers.
       Every text-field pair (Text + Tag) runs its raw Tag value
       through this template before emission. Returns the input
       when it matches an allowed tag; otherwise returns the
       supplied default. Keeps the skin defensive against a
       Datum that got set to something unexpected. XSL 1.0 safe.
       ============================================================ -->
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

  <!-- Format a publishdate string into "July 14, 2025".
       Accepts YYYY-MM-DD or YYYYMMDD (TeamSite emits either
       depending on the metadata source). Passes anything else
       through unchanged so a legit non-standard date still renders
       rather than blanking the field. XSL 1.0 safe. -->
  <xsl:template name="formatPublishDate">
    <xsl:param name="raw"/>
    <xsl:variable name="d" select="normalize-space($raw)"/>
    <xsl:choose>
      <xsl:when test="contains($d, '-') and string-length($d) >= 10">
        <xsl:variable name="y" select="substring($d, 1, 4)"/>
        <xsl:variable name="m" select="number(substring($d, 6, 2))"/>
        <xsl:variable name="day" select="number(substring($d, 9, 2))"/>
        <xsl:call-template name="monthName"><xsl:with-param name="n" select="$m"/></xsl:call-template>
        <xsl:text> </xsl:text><xsl:value-of select="$day"/>, <xsl:value-of select="$y"/>
      </xsl:when>
      <xsl:when test="string-length($d) = 8 and not(contains($d, '-'))">
        <xsl:variable name="y" select="substring($d, 1, 4)"/>
        <xsl:variable name="m" select="number(substring($d, 5, 2))"/>
        <xsl:variable name="day" select="number(substring($d, 7, 2))"/>
        <xsl:call-template name="monthName"><xsl:with-param name="n" select="$m"/></xsl:call-template>
        <xsl:text> </xsl:text><xsl:value-of select="$day"/>, <xsl:value-of select="$y"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$d"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="monthName">
    <xsl:param name="n"/>
    <xsl:choose>
      <xsl:when test="$n = 1">January</xsl:when>
      <xsl:when test="$n = 2">February</xsl:when>
      <xsl:when test="$n = 3">March</xsl:when>
      <xsl:when test="$n = 4">April</xsl:when>
      <xsl:when test="$n = 5">May</xsl:when>
      <xsl:when test="$n = 6">June</xsl:when>
      <xsl:when test="$n = 7">July</xsl:when>
      <xsl:when test="$n = 8">August</xsl:when>
      <xsl:when test="$n = 9">September</xsl:when>
      <xsl:when test="$n = 10">October</xsl:when>
      <xsl:when test="$n = 11">November</xsl:when>
      <xsl:when test="$n = 12">December</xsl:when>
    </xsl:choose>
  </xsl:template>

  <!-- text()[last()] isolates the trailing plain text of a Datum
       whose body may contain child <Option>/<Display>/<Value>
       elements. A bare <xsl:value-of/> would concatenate the
       Option display strings into the value, defeating the
       "default value after the options" pattern. -->
  <xsl:template match="/">

    <!-- ==================== Shared Datum lookups ==================== -->
    <xsl:variable name="SECTION_ID"     select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"   select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="BUTTON_CSS"     select="normalize-space(/Properties/Data/Datum[@ID='ButtonCssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"        select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="PRESET"         select="normalize-space(/Properties/Data/Datum[@ID='Preset']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(/Properties/Data/Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- ==================== Stylesheet hoist ==================== -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>
    <!-- Button CSS only loads when the MAAS+MATA preset needs it. -->
    <xsl:if test="$BUTTON_CSS != '' and $PRESET = 'maas-mata'">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$BUTTON_CSS"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>


    <!-- ==================== Preset routing ==================== -->
    <xsl:choose>


      <!-- ========================================================
           Preset :: MAAS + MATA
           ======================================================== -->
      <xsl:when test="$PRESET = 'maas-mata'">

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

        <!-- Tag guards. Fall back to the semantically-neutral
             choice used in the local preview if the Datum was
             cleared or set to an unknown value. -->
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

        <section>
          <xsl:attribute name="class">rbccm-hero rbccm-hero--maas-mata<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-hero--header-center</xsl:if></xsl:attribute>
          <xsl:if test="$SECTION_ID != ''">
            <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
          </xsl:if>
          <xsl:if test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:if>

          <div class="rbccm-hero__container">

            <!-- Eyebrow -->
            <xsl:if test="$MM_EYEBROW_TEXT != ''">
              <xsl:element name="{$MM_EYEBROW_TAG}">
                <xsl:attribute name="class">rbccm-hero__eyebrow</xsl:attribute>
                <xsl:value-of select="$MM_EYEBROW_TEXT"/>
              </xsl:element>
            </xsl:if>

            <!-- Title: outer wrapper tag configurable; inner lines
                 are always <span>s (visual line breaks). -->
            <xsl:if test="$MM_TITLE_L1 != '' or $MM_TITLE_L2 != ''">
              <xsl:element name="{$MM_TITLE_TAG}">
                <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
                <xsl:if test="$MM_TITLE_L1 != ''">
                  <span class="rbccm-hero__title-line"><xsl:value-of select="$MM_TITLE_L1"/></span>
                </xsl:if>
                <xsl:if test="$MM_TITLE_L2 != ''">
                  <span class="rbccm-hero__title-line"><xsl:value-of select="$MM_TITLE_L2"/></span>
                </xsl:if>
              </xsl:element>
            </xsl:if>

            <!-- Subtitle. disable-output-escaping so inline
                 <strong>/<em>/<br> markup in the Datum survives. -->
            <xsl:if test="normalize-space($MM_SUBTITLE_TEXT) != ''">
              <xsl:element name="{$MM_SUBTITLE_TAG}">
                <xsl:attribute name="class">rbccm-hero__subtitle</xsl:attribute>
                <xsl:value-of select="$MM_SUBTITLE_TEXT" disable-output-escaping="yes"/>
              </xsl:element>
            </xsl:if>

            <!-- CTA row. Skips entirely when neither button has a label. -->
            <xsl:if test="$MM_CTA1_LABEL != '' or $MM_CTA2_LABEL != ''">
              <div class="rbccm-hero__actions">

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

      </xsl:when>


      <!-- ========================================================
           Preset :: Strategy and Economics
           ======================================================== -->
      <xsl:when test="$PRESET = 'strategy-and-economics'">

        <!-- Datum lookups (Se* prefix) -->
        <xsl:variable name="SE_BG_ACCT"          select="normalize-space(/Properties/Data/Datum[@ID='SeBgBrightcoveAccount']/text()[last()])"/>
        <xsl:variable name="SE_BG_PLAYER"        select="normalize-space(/Properties/Data/Datum[@ID='SeBgBrightcovePlayer']/text()[last()])"/>
        <xsl:variable name="SE_BG_VIDEO_ID"      select="normalize-space(/Properties/Data/Datum[@ID='SeBgBrightcoveVideoId']/text()[last()])"/>

        <!-- Insight sourcing mode + hydrator config. Three modes:
               dcr-picker   card is server-rendered from the DCR record
                            picked in SeInsightDcr (with non-blank
                            SeInsight* Datums acting as per-field
                            overrides). No client-side hydration.
               auto-latest  hydrator data attrs below become authored by
                            the XSL and rbccm-hero.js overwrites the
                            pre-rendered SeInsight* fallback with the
                            newest matching feed record at runtime.
               manual       always uses the SeInsight* Datums; no client
                            hydration.
             Unknown values coerce to dcr-picker (matches Datum default). -->
        <xsl:variable name="SE_INSIGHT_SOURCE_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SeInsightSource']/text()[last()])"/>
        <xsl:variable name="SE_INSIGHT_SOURCE">
          <xsl:choose>
            <xsl:when test="$SE_INSIGHT_SOURCE_RAW = 'manual'">manual</xsl:when>
            <xsl:when test="$SE_INSIGHT_SOURCE_RAW = 'auto-latest'">auto-latest</xsl:when>
            <xsl:otherwise>dcr-picker</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="SE_FEED_URLS"    select="normalize-space(/Properties/Data/Datum[@ID='SeInsightFeedUrls']/text()[last()])"/>
        <xsl:variable name="SE_TAG_KEYWORDS" select="normalize-space(/Properties/Data/Datum[@ID='SeInsightTagKeywords']/text()[last()])"/>
        <xsl:variable name="SE_PINNED_URL"   select="normalize-space(/Properties/Data/Datum[@ID='SeInsightPinnedUrl']/text()[last()])"/>
        <xsl:variable name="SE_LOCALE_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SeLocale']/text()[last()])"/>
        <xsl:variable name="SE_LOCALE">
          <xsl:choose>
            <xsl:when test="$SE_LOCALE_RAW = 'fr'">fr</xsl:when>
            <xsl:otherwise>en</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="SE_AUTO_LINK_OVERRIDE" select="normalize-space(/Properties/Data/Datum[@ID='SeInsightAutoLinkOverride']/text()[last()])"/>

        <xsl:variable name="SE_TITLE_TEXT"       select="normalize-space(/Properties/Data/Datum[@ID='SeTitleText']/text()[last()])"/>
        <xsl:variable name="SE_TITLE_TAG_RAW"    select="normalize-space(/Properties/Data/Datum[@ID='SeTitleTag']/text()[last()])"/>
        <xsl:variable name="SE_BODY_TEXT"        select="/Properties/Data/Datum[@ID='SeBodyText']"/>
        <xsl:variable name="SE_BODY_TAG_RAW"     select="normalize-space(/Properties/Data/Datum[@ID='SeBodyTag']/text()[last()])"/>

        <xsl:variable name="SE_INS_EYE_TEXT"     select="normalize-space(/Properties/Data/Datum[@ID='SeInsightEyebrowText']/text()[last()])"/>
        <xsl:variable name="SE_INS_EYE_TAG_RAW"  select="normalize-space(/Properties/Data/Datum[@ID='SeInsightEyebrowTag']/text()[last()])"/>
        <xsl:variable name="SE_INS_TITLE_TEXT"   select="normalize-space(/Properties/Data/Datum[@ID='SeInsightTitleText']/text()[last()])"/>
        <xsl:variable name="SE_INS_TITLE_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SeInsightTitleTag']/text()[last()])"/>
        <xsl:variable name="SE_INS_BODY_TEXT"    select="/Properties/Data/Datum[@ID='SeInsightBodyText']"/>
        <xsl:variable name="SE_INS_BODY_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SeInsightBodyTag']/text()[last()])"/>
        <xsl:variable name="SE_INS_DATE_TEXT"    select="normalize-space(/Properties/Data/Datum[@ID='SeInsightDateText']/text()[last()])"/>
        <xsl:variable name="SE_INS_DATE_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SeInsightDateTag']/text()[last()])"/>

        <xsl:variable name="SE_INS_LINK_LABEL"   select="normalize-space(/Properties/Data/Datum[@ID='SeInsightLinkLabel']/text()[last()])"/>
        <xsl:variable name="SE_INS_LINK_HREF"    select="normalize-space(/Properties/Data/Datum[@ID='SeInsightLinkHref']/text()[last()])"/>
        <xsl:variable name="SE_INS_LINK_ARIA"    select="normalize-space(/Properties/Data/Datum[@ID='SeInsightLinkAriaLabel']/text()[last()])"/>

        <!-- DCR-picker lookups. The SeInsightDcr picker allows several
             DCR types (article/.*, rbccm/episode, rbccm/imagine2025,
             rbccm/casestudy), so the DCR record wrapper element name
             is not fixed. Wildcard the wrapper via DCR/*/{field} so
             the same XPath works regardless of the picked type. Field
             names (title/description/publish_date/link/url) mirror the
             story-tiles-default convention. SeInsightDcrLink is the
             sibling CTA URL Datum; blank = fall back to the DCR's own
             link/url field. -->
        <xsl:variable name="SE_DCR_ROOT"         select="/Properties/Data/Datum[@ID='SeInsightDcr']/DCR"/>
        <xsl:variable name="SE_DCR_TITLE"        select="normalize-space($SE_DCR_ROOT/*/title)"/>
        <xsl:variable name="SE_DCR_DESC"         select="$SE_DCR_ROOT/*/description"/>
        <xsl:variable name="SE_DCR_PUB"          select="normalize-space($SE_DCR_ROOT/*/publish_date)"/>
        <xsl:variable name="SE_DCR_LINK"         select="normalize-space($SE_DCR_ROOT/*/link)"/>
        <xsl:variable name="SE_DCR_URL"          select="normalize-space($SE_DCR_ROOT/*/url)"/>
        <xsl:variable name="SE_DCR_LINK_DATUM"   select="normalize-space(/Properties/Data/Datum[@ID='SeInsightDcrLink']/text()[last()])"/>

        <!-- Effective card fields. In dcr-picker mode each SeInsight*
             Datum acts as an author override: non-blank wins, blank
             falls through to the DCR record's field. In auto-latest
             and manual modes the effective values are just the
             SeInsight* Datums unchanged (auto-latest hydration
             overwrites the DOM at runtime). -->
        <xsl:variable name="SE_EFF_TITLE">
          <xsl:choose>
            <xsl:when test="$SE_INSIGHT_SOURCE = 'dcr-picker' and $SE_INS_TITLE_TEXT = ''">
              <xsl:value-of select="$SE_DCR_TITLE"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$SE_INS_TITLE_TEXT"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="SE_EFF_BODY">
          <xsl:choose>
            <xsl:when test="$SE_INSIGHT_SOURCE = 'dcr-picker' and normalize-space($SE_INS_BODY_TEXT) = ''">
              <xsl:value-of select="$SE_DCR_DESC"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$SE_INS_BODY_TEXT"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="SE_EFF_DATE">
          <xsl:choose>
            <xsl:when test="$SE_INSIGHT_SOURCE = 'dcr-picker' and $SE_INS_DATE_TEXT = ''">
              <xsl:call-template name="formatPublishDate">
                <xsl:with-param name="raw" select="$SE_DCR_PUB"/>
              </xsl:call-template>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$SE_INS_DATE_TEXT"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="SE_EFF_LINK_HREF">
          <xsl:choose>
            <xsl:when test="$SE_INSIGHT_SOURCE = 'dcr-picker'">
              <xsl:choose>
                <xsl:when test="$SE_DCR_LINK_DATUM != ''"><xsl:value-of select="$SE_DCR_LINK_DATUM"/></xsl:when>
                <xsl:when test="$SE_DCR_LINK != ''"><xsl:value-of select="$SE_DCR_LINK"/></xsl:when>
                <xsl:when test="$SE_DCR_URL != ''"><xsl:value-of select="$SE_DCR_URL"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="$SE_INS_LINK_HREF"/></xsl:otherwise>
              </xsl:choose>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$SE_INS_LINK_HREF"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <!-- Tag guards. -->
        <xsl:variable name="SE_TITLE_TAG">
          <xsl:call-template name="pickTag">
            <xsl:with-param name="raw" select="$SE_TITLE_TAG_RAW"/>
            <xsl:with-param name="default" select="'h1'"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="SE_BODY_TAG">
          <xsl:call-template name="pickTag">
            <xsl:with-param name="raw" select="$SE_BODY_TAG_RAW"/>
            <xsl:with-param name="default" select="'p'"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="SE_INS_EYE_TAG">
          <xsl:call-template name="pickTag">
            <xsl:with-param name="raw" select="$SE_INS_EYE_TAG_RAW"/>
            <xsl:with-param name="default" select="'p'"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="SE_INS_TITLE_TAG">
          <xsl:call-template name="pickTag">
            <xsl:with-param name="raw" select="$SE_INS_TITLE_TAG_RAW"/>
            <xsl:with-param name="default" select="'h3'"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="SE_INS_BODY_TAG">
          <xsl:call-template name="pickTag">
            <xsl:with-param name="raw" select="$SE_INS_BODY_TAG_RAW"/>
            <xsl:with-param name="default" select="'p'"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:variable name="SE_INS_DATE_TAG">
          <xsl:call-template name="pickTag">
            <xsl:with-param name="raw" select="$SE_INS_DATE_TAG_RAW"/>
            <xsl:with-param name="default" select="'span'"/>
          </xsl:call-template>
        </xsl:variable>

        <section>
          <xsl:attribute name="class">rbccm-hero rbccm-hero--strategy-and-economics<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-hero--header-center</xsl:if></xsl:attribute>
          <xsl:if test="$SECTION_ID != ''">
            <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
          </xsl:if>
          <xsl:if test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:if>
          <!-- Sourcing mode is always stamped so CSS or other JS can
               branch on it. Hydrator config attrs are gated by mode:

                 auto-latest   Emits data-hero-feed-urls, -tag-keywords,
                               -pinned-url, -link-override, -locale.
                               The JS runs the keyword scan (or pinned
                               URL match) and overwrites the manual
                               pre-render with the newest match.

                 dcr-picker    Emits data-hero-feed-urls and
                               -pinned-url ONLY when the author has
                               populated the pinned URL Datum. The JS
                               then runs a pinned-URL fallback lookup
                               against the feed - a safety net for
                               pages where DCR publishing is broken.
                               Keyword scan / locale / link override
                               are intentionally NOT emitted here;
                               dcr-picker's fallback is pinned-URL only.

                 manual        No hydrator hooks; fully server-rendered. -->
          <xsl:attribute name="data-hero-source"><xsl:value-of select="$SE_INSIGHT_SOURCE"/></xsl:attribute>
          <xsl:if test="$SE_INSIGHT_SOURCE = 'auto-latest'">
            <xsl:attribute name="data-hero-locale"><xsl:value-of select="$SE_LOCALE"/></xsl:attribute>
            <xsl:if test="$SE_TAG_KEYWORDS != ''">
              <xsl:attribute name="data-hero-tag-keywords"><xsl:value-of select="$SE_TAG_KEYWORDS"/></xsl:attribute>
            </xsl:if>
            <xsl:if test="$SE_AUTO_LINK_OVERRIDE != ''">
              <xsl:attribute name="data-hero-link-override"><xsl:value-of select="$SE_AUTO_LINK_OVERRIDE"/></xsl:attribute>
            </xsl:if>
          </xsl:if>
          <!-- data-hero-feed-urls and data-hero-pinned-url apply to
               both auto-latest and dcr-picker (the fallback path). -->
          <xsl:if test="$SE_INSIGHT_SOURCE = 'auto-latest' or $SE_INSIGHT_SOURCE = 'dcr-picker'">
            <xsl:if test="$SE_FEED_URLS != ''">
              <xsl:attribute name="data-hero-feed-urls"><xsl:value-of select="$SE_FEED_URLS"/></xsl:attribute>
            </xsl:if>
            <xsl:if test="$SE_PINNED_URL != ''">
              <xsl:attribute name="data-hero-pinned-url"><xsl:value-of select="$SE_PINNED_URL"/></xsl:attribute>
            </xsl:if>
          </xsl:if>

          <!-- Optional background video slot. Only rendered when
               the author provides a VideoId. Uses the standard
               Brightcove iframe embed contract (autoplay + muted
               + loop + playsinline + controls disabled). -->
          <xsl:if test="$SE_BG_VIDEO_ID != ''">
            <div class="rbccm-hero__bg-video" aria-hidden="true">
              <iframe allow="autoplay" frameborder="0" scrolling="no" allowfullscreen="allowfullscreen">
                <xsl:attribute name="src">https://players.brightcove.net/<xsl:value-of select="$SE_BG_ACCT"/>/<xsl:value-of select="$SE_BG_PLAYER"/>_default/index.html?videoId=<xsl:value-of select="$SE_BG_VIDEO_ID"/>&amp;autoplay=true&amp;muted=true&amp;loop=true&amp;playsinline=true&amp;controls=false</xsl:attribute>
              </iframe>
            </div>
          </xsl:if>

          <!-- Decorative blur ellipse (desktop only, per CSS). -->
          <div class="rbccm-hero__blur" aria-hidden="true"></div>

          <div class="rbccm-hero__container">
            <div class="rbccm-hero__grid">

              <!-- Left column: title + body -->
              <div class="rbccm-hero__lede">

                <xsl:if test="$SE_TITLE_TEXT != ''">
                  <xsl:element name="{$SE_TITLE_TAG}">
                    <xsl:attribute name="class">rbccm-hero__title</xsl:attribute>
                    <xsl:value-of select="$SE_TITLE_TEXT"/>
                  </xsl:element>
                </xsl:if>

                <xsl:if test="normalize-space($SE_BODY_TEXT) != ''">
                  <xsl:element name="{$SE_BODY_TAG}">
                    <xsl:attribute name="class">rbccm-hero__body</xsl:attribute>
                    <xsl:value-of select="$SE_BODY_TEXT" disable-output-escaping="yes"/>
                  </xsl:element>
                </xsl:if>

              </div>

              <!-- Right column: dark-navy insight card -->
              <article class="rbccm-hero__insight-card">

                <xsl:if test="$SE_INS_EYE_TEXT != ''">
                  <div class="rbccm-hero__insight-eyebrow-row">
                    <div class="rbccm-hero__insight-eyebrow-inner">
                      <xsl:element name="{$SE_INS_EYE_TAG}">
                        <xsl:attribute name="class">rbccm-hero__insight-eyebrow</xsl:attribute>
                        <xsl:value-of select="$SE_INS_EYE_TEXT"/>
                      </xsl:element>
                    </div>
                  </div>
                </xsl:if>

                <xsl:if test="$SE_EFF_TITLE != ''">
                  <xsl:element name="{$SE_INS_TITLE_TAG}">
                    <xsl:attribute name="class">rbccm-hero__insight-title</xsl:attribute>
                    <xsl:value-of select="$SE_EFF_TITLE"/>
                  </xsl:element>
                </xsl:if>

                <xsl:if test="normalize-space($SE_EFF_BODY) != ''">
                  <xsl:element name="{$SE_INS_BODY_TAG}">
                    <xsl:attribute name="class">rbccm-hero__insight-body</xsl:attribute>
                    <xsl:value-of select="$SE_EFF_BODY" disable-output-escaping="yes"/>
                  </xsl:element>
                </xsl:if>

                <xsl:if test="$SE_EFF_DATE != '' or $SE_INS_LINK_LABEL != ''">
                  <footer class="rbccm-hero__insight-footer">

                    <xsl:if test="$SE_EFF_DATE != ''">
                      <xsl:element name="{$SE_INS_DATE_TAG}">
                        <xsl:attribute name="class">rbccm-hero__insight-date</xsl:attribute>
                        <xsl:value-of select="$SE_EFF_DATE"/>
                      </xsl:element>
                    </xsl:if>

                    <xsl:if test="$SE_INS_LINK_LABEL != ''">
                      <a class="rbccm-hero__insight-link">
                        <xsl:attribute name="href"><xsl:value-of select="$SE_EFF_LINK_HREF"/></xsl:attribute>
                        <xsl:if test="$SE_INS_LINK_ARIA != ''">
                          <xsl:attribute name="aria-label"><xsl:value-of select="$SE_INS_LINK_ARIA"/></xsl:attribute>
                        </xsl:if>
                        <xsl:value-of select="$SE_INS_LINK_LABEL"/>
                        <svg class="rbccm-hero__insight-link-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <path d="M2.70801 6.5H10.2913" stroke="#FFC72C" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M6.5 2.70825L10.2917 6.49992L6.5 10.2916" stroke="#FFC72C" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </a>
                    </xsl:if>

                  </footer>
                </xsl:if>

              </article>

            </div>
          </div>
        </section>

        <!-- Hydrator script. Only for S+E preset. Loaded when either:
               * SeInsightSource = auto-latest (full hydrator flow), or
               * SeInsightSource = dcr-picker AND SeInsightPinnedUrl is
                 non-blank (pinned-URL fallback for pages where DCR
                 publishing is broken).
             Skipped for manual mode and for blank-pin dcr-picker (both
             fully server-rendered, no work to do). -->
        <xsl:if test="$JS_PATH != '' and ($SE_INSIGHT_SOURCE = 'auto-latest' or ($SE_INSIGHT_SOURCE = 'dcr-picker' and $SE_PINNED_URL != ''))">
          <script>
            <xsl:attribute name="src">
              <xsl:value-of select="$JS_PATH"/>
              <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
            </xsl:attribute>
          </script>
        </xsl:if>

      </xsl:when>


      <!-- Unknown preset: emit nothing rather than a broken shell. -->
      <xsl:otherwise/>

    </xsl:choose>

  </xsl:template>

</xsl:stylesheet>
