<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Hero :: strategy-and-economics (single-skin build)
  ==============================================================
  Standalone XSL skin for TeamSite's Skin dropdown. Renders ONLY
  the Strategy & Economics variant of rbccm-hero. No Preset
  branching -- the variant class is hardcoded below.

  Structure: split 2-column grid, optional Brightcove video
  backdrop + blur ellipse, dark-navy "Latest insight" card on
  the right. Above-the-fold reveal fires immediately on page
  load; insight card follows at 325ms.

  Insight sourcing modes:
    dcr-picker   Server-rendered from a picked DCR record
                 (SeInsight* Datums act as per-field overrides).
    auto-latest  Hydrator overwrites the pre-render at runtime
                 with the newest matching feed record.
    manual       Fully server-rendered from SeInsight* Datums.

  Companion skin: rbccm-hero--maas-mata.xsl
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

  <!-- Format a publishdate string into "July 14, 2025". -->
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


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"     select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"   select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"        select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(/Properties/Data/Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Datum lookups (Se* prefix) -->
    <xsl:variable name="SE_BG_ACCT"          select="normalize-space(/Properties/Data/Datum[@ID='SeBgBrightcoveAccount']/text()[last()])"/>
    <xsl:variable name="SE_BG_PLAYER"        select="normalize-space(/Properties/Data/Datum[@ID='SeBgBrightcovePlayer']/text()[last()])"/>
    <xsl:variable name="SE_BG_VIDEO_ID"      select="normalize-space(/Properties/Data/Datum[@ID='SeBgBrightcoveVideoId']/text()[last()])"/>

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

    <!-- DCR-picker lookups. -->
    <xsl:variable name="SE_DCR_ROOT"         select="/Properties/Data/Datum[@ID='SeInsightDcr']/DCR"/>
    <xsl:variable name="SE_DCR_TITLE"        select="normalize-space($SE_DCR_ROOT/*/title)"/>
    <xsl:variable name="SE_DCR_DESC"         select="$SE_DCR_ROOT/*/description"/>
    <xsl:variable name="SE_DCR_PUB"          select="normalize-space($SE_DCR_ROOT/*/publish_date)"/>
    <xsl:variable name="SE_DCR_LINK"         select="normalize-space($SE_DCR_ROOT/*/link)"/>
    <xsl:variable name="SE_DCR_URL"          select="normalize-space($SE_DCR_ROOT/*/url)"/>
    <xsl:variable name="SE_DCR_LINK_DATUM"   select="normalize-space(/Properties/Data/Datum[@ID='SeInsightDcrLink']/text()[last()])"/>

    <!-- Effective card fields. -->
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
      <xsl:attribute name="class">rbccm-hero rbccm-hero--strategy-and-economics<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-hero--header-center</xsl:if></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>
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
      <xsl:if test="$SE_INSIGHT_SOURCE = 'auto-latest' or $SE_INSIGHT_SOURCE = 'dcr-picker'">
        <xsl:if test="$SE_FEED_URLS != ''">
          <xsl:attribute name="data-hero-feed-urls"><xsl:value-of select="$SE_FEED_URLS"/></xsl:attribute>
        </xsl:if>
        <xsl:if test="$SE_PINNED_URL != ''">
          <xsl:attribute name="data-hero-pinned-url"><xsl:value-of select="$SE_PINNED_URL"/></xsl:attribute>
        </xsl:if>
      </xsl:if>

      <!-- Optional Brightcove video backdrop. -->
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
                <xsl:attribute name="data-animate-hero">fadeInDown</xsl:attribute>
                <xsl:value-of select="$SE_TITLE_TEXT"/>
              </xsl:element>
            </xsl:if>

            <xsl:if test="normalize-space($SE_BODY_TEXT) != ''">
              <xsl:element name="{$SE_BODY_TAG}">
                <xsl:attribute name="class">rbccm-hero__body</xsl:attribute>
                <xsl:attribute name="data-animate-hero">fadeInUp</xsl:attribute>
                <xsl:attribute name="data-animate-delay">150</xsl:attribute>
                <xsl:value-of select="$SE_BODY_TEXT" disable-output-escaping="yes"/>
              </xsl:element>
            </xsl:if>

          </div>

          <!-- Right column: dark-navy insight card -->
          <article class="rbccm-hero__insight-card" data-animate-hero="fadeIn" data-animate-delay="325">

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

    <!-- Hydrator script (only when auto-latest or dcr-picker w/ pinned URL). -->
    <xsl:if test="$JS_PATH != '' and ($SE_INSIGHT_SOURCE = 'auto-latest' or ($SE_INSIGHT_SOURCE = 'dcr-picker' and $SE_PINNED_URL != ''))">
      <script>
        <xsl:attribute name="src">
          <xsl:value-of select="$JS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </script>
    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
