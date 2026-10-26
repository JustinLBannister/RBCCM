<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Awards  |  XSL skin
  ============================================================
  Renders a row of award cards on a dark background. Extracted
  from the MAAS+MATA landing page's __awards block so any page can
  drop it in.

  Layout comes from the card count (no preset field)
  ============================================================
  3 cards   3-up modifier   MAAS+MATA (#041e42)
  4 cards   4-up modifier   US Credentials (#051B38)

  Cards are the repeatable AwardCard Group in Data. A card with a
  blank title is skipped; only the first 4 titled cards render.
  Group / Datum lookups match on @ID or @Name (same as
  icon-carousel), since saved Group data can carry either.
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Render one award card. Skipped when title is blank so an
       editor can safely leave later slots empty. -->
  <xsl:template name="renderAwardCard">
    <xsl:param name="year"/>
    <xsl:param name="title"/>
    <xsl:param name="issuer"/>

    <xsl:if test="$title != ''">
      <article class="rbccm-awards__card">
        <xsl:if test="$year != ''">
          <span class="rbccm-awards__year"><xsl:value-of select="$year"/></span>
        </xsl:if>
        <h3 class="rbccm-awards__title"><xsl:value-of select="$title"/></h3>
        <xsl:if test="$issuer != ''">
          <p class="rbccm-awards__issuer"><xsl:value-of select="$issuer"/></p>
        </xsl:if>
      </article>
    </xsl:if>
  </xsl:template>

  <!-- One AwardCard Group -> renderAwardCard. -->
  <xsl:template name="renderAwardGroup">
    <xsl:param name="g"/>
    <xsl:call-template name="renderAwardCard">
      <xsl:with-param name="year"   select="normalize-space($g/Datum[@ID='Year' or @Name='Year'])"/>
      <xsl:with-param name="title"  select="normalize-space($g/Datum[@ID='Title' or @Name='Title'])"/>
      <xsl:with-param name="issuer" select="normalize-space($g/Datum[@ID='Issuer' or @Name='Issuer'])"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <!-- Cards with a title, in author order. -->
    <xsl:variable name="CARDS" select="//Group[@ID='AwardCard' or @Name='Award Card'][normalize-space(Datum[@ID='Title' or @Name='Title']) != '']"/>
    <xsl:variable name="CARD_COUNT" select="count($CARDS)"/>
    <xsl:variable name="EYEBROW"       select="normalize-space(//Datum[@ID='SectionEyebrowText']/text()[last()])"/>
    <xsl:variable name="BG_COLOR"      select="normalize-space(//Datum[@ID='SectionBgColor']/text()[last()])"/>

    <!-- Stylesheet hoist. -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <!-- Card count picks the layout: 4 -> 4-up, otherwise 3-up. -->
    <xsl:variable name="VARIANT">
      <xsl:choose>
        <xsl:when test="$CARD_COUNT >= 4">4</xsl:when>
        <xsl:otherwise>3</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <section>
      <xsl:attribute name="class">rbccm-awards rbccm-awards--<xsl:value-of select="$VARIANT"/></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="aria-label">Awards</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <!-- Optional background colour override, emitted as the CSS
           custom property the variant rules read. Blank = the
           layout's own navy. -->
      <xsl:if test="$BG_COLOR != ''">
        <xsl:attribute name="style">--rbccm-awards-bg: <xsl:value-of select="$BG_COLOR"/>;</xsl:attribute>
      </xsl:if>

      <!-- Inner content rail. The <section> above paints the bg
           full-width; this wrapper caps the content at 1440 and
           carries the flex-column layout + padding. -->
      <div class="rbccm-awards__inner">

        <xsl:if test="$EYEBROW != ''">
          <div class="rbccm-awards__eyebrow" data-animate="fadeInUp">
            <xsl:value-of select="$EYEBROW"/>
          </div>
        </xsl:if>

        <!-- data-stagger-parent lets rbccm-animate.js reveal each
             card in sequence as the grid appears. Grid also carries
             its own variant modifier (mirrors MAAS/MATA convention
             where the modifier class lives on __awards-grid too). -->
        <div data-stagger-parent="fadeInUp" data-stagger-step="120">
          <xsl:attribute name="class">rbccm-awards__grid rbccm-awards__grid--<xsl:value-of select="$VARIANT"/></xsl:attribute>
          <xsl:for-each select="$CARDS[position() &lt;= 4]">
            <xsl:call-template name="renderAwardGroup"><xsl:with-param name="g" select="."/></xsl:call-template>
          </xsl:for-each>
        </div>

        <!-- Carousel controls: mobile-first visible. Hidden via CSS at
             each variant's row-fits-statically breakpoint (870 for
             awards-3, 1146 for awards-4). Dots are Slick-rendered into
             __dots; arrows use the same chevron pattern as rbccm-expertise. -->
        <div class="rbccm-awards__controls">
          <button type="button" class="rbccm-awards__btn rbccm-awards__btn--prev" aria-label="Previous award">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true"><path d="M12 1L2 12L12 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <div class="rbccm-awards__dots" role="group" aria-label="Award slides"></div>
          <button type="button" class="rbccm-awards__btn rbccm-awards__btn--next" aria-label="Next award">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true"><path d="M2 1L12 12L2 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>

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
