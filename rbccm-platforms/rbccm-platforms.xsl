<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Platforms - XSL skin
  ==============================================================
  Renders a Preset-driven 4-card grid of platform tiles. Each
  card is a whole-tile anchor with a background photo (real
  &lt;img&gt;), a title + body, and a gold "Explore" link at the
  bottom.

  Presets
  ==============================================================
  The $VARIANT_CLASS map resolves the Preset Datum to a BEM
  modifier class on the .rbccm-platforms section. Extend by:
    1. Adding a &lt;xsl:when&gt; branch to VARIANT_CLASS
    2. Adding a modifier scope in rbccm-platforms.css
    3. Adding a matching &lt;Option&gt; to the Preset Datum

  Current presets:
    strategy-and-economics-platforms

  Photo hookup (mobile + desktop DAM pickers)
  ==============================================================
  Each card ships two Type="Image" Datums (native DAM picker):
    Card{N}PhotoDesktop  wide-crop art for &gt;=992px, and the
                         fallback &lt;img&gt; inside &lt;picture&gt;
    Card{N}PhotoMobile   portrait-crop art served at &lt;992px via
                         &lt;source media="(max-width: 991px)"&gt;
  The XSL emits a &lt;picture&gt; per card:
    Card{N}PhotoDesktop/Image/Path         src on the fallback &lt;img&gt;
    Card{N}PhotoMobile/Image/Path          srcset on the &lt;source&gt;
    Card{N}PhotoDesktop/Image/Description  alt on the &lt;img&gt;
  Mobile Description is not read (decorative). When the desktop
  Description is blank the alt falls through to Card{N}TitleText
  so the tile still has an accessible name.

  Focal point (optional per card)
  ==============================================================
  Card{N}FocalPoint is an optional String Datum that overrides
  the CSS default object-position (50% 50%) for that card's
  photo. Values are standard CSS object-position ("50% 15%",
  "70% 40%", "top center"). When set, the XSL writes it inline
  on the &lt;a&gt; as the CSS custom property that .__photo reads.

  Body max-width (optional per card)
  ==============================================================
  Card{N}BodyMaxWidth is an optional String Datum (e.g. "274px")
  that caps the body copy width at desktop only via the CSS custom
  property rbccm-platforms-body-max-width (double-dash prefix at
  write time). Kicks in at 992+ where the grid narrows each card
  naturally.

  Semantic tag pickers guarded via the pickTag allow-list. Blank
  Card{N}TitleText hides that slot entirely.
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

  <!-- Render one platform card. -->
  <xsl:template name="renderCard">
    <xsl:param name="photo"/>
    <xsl:param name="photoMobile"/>
    <xsl:param name="photoAlt"/>
    <xsl:param name="focalPoint"/>
    <xsl:param name="bodyMaxWidth"/>
    <xsl:param name="titleText"/>
    <xsl:param name="titleTag"/>
    <xsl:param name="bodyText"/>
    <xsl:param name="bodyTag"/>
    <xsl:param name="ctaText"/>
    <xsl:param name="ctaHref"/>

    <a class="rbccm-platforms__card">
      <xsl:attribute name="href">
        <xsl:choose>
          <xsl:when test="$ctaHref != ''"><xsl:value-of select="$ctaHref"/></xsl:when>
          <xsl:otherwise>#</xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <!-- Whole-card anchor: pin the accessible name to just the
           tile title. Without this, the anchor's name defaults to
           the concatenation of every text descendant (title + body
           + "Explore"), which is long and reads awkwardly (WCAG 2.4.4). -->
      <xsl:if test="$titleText != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$titleText"/></xsl:attribute>
      </xsl:if>

      <!-- Optional per-card inline style: focal point + body cap.
           Concatenated into one style attr when either is set. -->
      <xsl:if test="$focalPoint != '' or $bodyMaxWidth != ''">
        <xsl:attribute name="style">
          <xsl:if test="$focalPoint != ''">--rbccm-platforms-focal: <xsl:value-of select="$focalPoint"/>;</xsl:if>
          <xsl:if test="$bodyMaxWidth != ''"> --rbccm-platforms-body-max-width: <xsl:value-of select="$bodyMaxWidth"/>;</xsl:if>
        </xsl:attribute>
      </xsl:if>

      <xsl:if test="$photo != '' or $photoMobile != ''">
        <picture>
          <xsl:if test="$photoMobile != ''">
            <source media="(max-width: 991px)">
              <xsl:attribute name="srcset"><xsl:value-of select="$photoMobile"/></xsl:attribute>
            </source>
          </xsl:if>
          <img class="rbccm-platforms__photo" loading="lazy" decoding="async">
            <xsl:attribute name="src"><xsl:value-of select="$photo"/></xsl:attribute>
            <xsl:attribute name="alt"><xsl:value-of select="$photoAlt"/></xsl:attribute>
            <xsl:if test="normalize-space($focalPoint) != ''">
              <xsl:attribute name="style">object-position: <xsl:value-of select="$focalPoint"/>;</xsl:attribute>
            </xsl:if>
          </img>
        </picture>
      </xsl:if>

      <div class="rbccm-platforms__card-content">
        <xsl:element name="{$titleTag}">
          <xsl:attribute name="class">rbccm-platforms__card-title</xsl:attribute>
          <xsl:value-of select="$titleText"/>
        </xsl:element>
        <xsl:if test="normalize-space($bodyText) != ''">
          <xsl:element name="{$bodyTag}">
            <xsl:attribute name="class">rbccm-platforms__card-body</xsl:attribute>
            <xsl:value-of select="$bodyText" disable-output-escaping="yes"/>
          </xsl:element>
        </xsl:if>
      </div>

      <xsl:if test="$ctaText != ''">
        <span class="rbccm-platforms__card-cta">
          <span><xsl:value-of select="$ctaText"/></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.00014C1.5 7.86753 1.55268 7.74036 1.64645 7.64659C1.74021 7.55282 1.86739 7.50014 2 7.50014H13.793L10.646 4.35414C10.5521 4.26026 10.4994 4.13292 10.4994 4.00014C10.4994 3.86737 10.5521 3.74003 10.646 3.64614C10.7399 3.55226 10.8672 3.49951 11 3.49951C11.1328 3.49951 11.2601 3.55226 11.354 3.64614L15.354 7.64614C15.4006 7.69259 15.4375 7.74776 15.4627 7.80851C15.4879 7.86926 15.5009 7.93438 15.5009 8.00014C15.5009 8.06591 15.4879 8.13103 15.4627 8.19178C15.4375 8.25252 15.4006 8.3077 15.354 8.35414L11.354 12.3541C11.2601 12.448 11.1328 12.5008 11 12.5008C10.8672 12.5008 10.7399 12.448 10.646 12.3541C10.5521 12.2603 10.4994 12.1329 10.4994 12.0001C10.4994 11.8674 10.5521 11.74 10.646 11.6461L13.793 8.50014H2C1.86739 8.50014 1.74021 8.44746 1.64645 8.3537C1.55268 8.25993 1.5 8.13275 1.5 8.00014Z" fill="currentColor"/>
          </svg>
        </span>
      </xsl:if>
    </a>
  </xsl:template>

  <!-- Per-slot lookup + renderCard dispatcher (reads Card{N}FieldName). -->
  <xsl:template name="renderSlot">
    <xsl:param name="n"/>
    <xsl:variable name="title" select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()])"/>
    <xsl:if test="$title != ''">
      <xsl:variable name="photo"         select="normalize-space(//Datum[@ID=concat('Card', $n, 'PhotoDesktop')]/Image/Path)"/>
      <xsl:variable name="photoMobile"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'PhotoMobile')]/Image/Path)"/>
      <xsl:variable name="photoAltRaw"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'PhotoDesktop')]/Image/Description)"/>
      <xsl:variable name="photoAlt">
        <xsl:choose>
          <xsl:when test="$photoAltRaw != ''"><xsl:value-of select="$photoAltRaw"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="focalPoint"    select="normalize-space(//Datum[@ID=concat('Card', $n, 'FocalPoint')]/text()[last()])"/>
      <xsl:variable name="bodyMaxWidth"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'BodyMaxWidth')]/text()[last()])"/>
      <xsl:variable name="titleTagRaw"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleTag')]/text()[last()])"/>
      <xsl:variable name="body"          select="//Datum[@ID=concat('Card', $n, 'BodyText')]"/>
      <xsl:variable name="bodyTagRaw"    select="normalize-space(//Datum[@ID=concat('Card', $n, 'BodyTag')]/text()[last()])"/>
      <xsl:variable name="ctaText"       select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaText')]/text()[last()])"/>
      <xsl:variable name="ctaHref"       select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaHref')]/text()[last()])"/>

      <xsl:variable name="titleTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$titleTagRaw"/>
          <xsl:with-param name="default" select="'h3'"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="bodyTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$bodyTagRaw"/>
          <xsl:with-param name="default" select="'p'"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:call-template name="renderCard">
        <xsl:with-param name="photo" select="$photo"/>
        <xsl:with-param name="photoMobile" select="$photoMobile"/>
        <xsl:with-param name="photoAlt" select="$photoAlt"/>
        <xsl:with-param name="focalPoint" select="$focalPoint"/>
        <xsl:with-param name="bodyMaxWidth" select="$bodyMaxWidth"/>
        <xsl:with-param name="titleText" select="$title"/>
        <xsl:with-param name="titleTag" select="$titleTag"/>
        <xsl:with-param name="bodyText" select="$body"/>
        <xsl:with-param name="bodyTag" select="$bodyTag"/>
        <xsl:with-param name="ctaText" select="$ctaText"/>
        <xsl:with-param name="ctaHref" select="$ctaHref"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"       select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"     select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"         select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"          select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"    select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="PRESET"           select="normalize-space(//Datum[@ID='Preset']/text()[last()])"/>

    <xsl:variable name="TITLE_TEXT"       select="normalize-space(//Datum[@ID='SectionTitleText']/text()[last()])"/>
    <xsl:variable name="TITLE_TAG_RAW"    select="normalize-space(//Datum[@ID='SectionTitleTag']/text()[last()])"/>
    <xsl:variable name="SUBTITLE_TEXT"    select="normalize-space(//Datum[@ID='SectionSubtitleText']/text()[last()])"/>
    <xsl:variable name="SUBTITLE_TAG_RAW" select="normalize-space(//Datum[@ID='SectionSubtitleTag']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(//Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="SUBTITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$SUBTITLE_TAG_RAW"/>
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

    <!-- Preset-to-variant-class map. Extend by adding another
         xsl:when here + a matching CSS scope + Properties Option. -->
    <xsl:variable name="VARIANT_CLASS">
      <xsl:choose>
        <xsl:when test="$PRESET = 'strategy-and-economics-platforms'">rbccm-platforms--strategy-and-economics-platforms</xsl:when>
        <xsl:otherwise/>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$VARIANT_CLASS != ''">

      <xsl:variable name="TITLE_ID">
        <xsl:choose>
          <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/>-title</xsl:when>
          <xsl:otherwise>rbccm-platforms-title</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <section>
        <xsl:attribute name="class">rbccm-platforms <xsl:value-of select="$VARIANT_CLASS"/><xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-platforms--header-center</xsl:if></xsl:attribute>
        <xsl:if test="$SECTION_ID != ''">
          <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
        </xsl:if>
        <!-- Prefer aria-labelledby pointing at the visible title so
             SR users don't hear the label twice. Falls back to
             aria-label when no title is present. -->
        <xsl:choose>
          <xsl:when test="$TITLE_TEXT != ''">
            <xsl:attribute name="aria-labelledby"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
          </xsl:when>
          <xsl:when test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:when>
        </xsl:choose>

        <div class="rbccm-platforms__inner">

          <xsl:if test="$TITLE_TEXT != '' or $SUBTITLE_TEXT != ''">
            <div class="rbccm-platforms__header">
              <xsl:if test="$TITLE_TEXT != ''">
                <xsl:element name="{$TITLE_TAG}">
                  <xsl:attribute name="class">rbccm-platforms__title</xsl:attribute>
                  <xsl:attribute name="id"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
                  <!-- Scroll-triggered reveal driven by rbccm-animate/rbccm-animate.js. -->
                  <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
                  <xsl:value-of select="$TITLE_TEXT" disable-output-escaping="yes"/>
                </xsl:element>
              </xsl:if>
              <xsl:if test="$SUBTITLE_TEXT != ''">
                <xsl:element name="{$SUBTITLE_TAG}">
                  <xsl:attribute name="class">rbccm-platforms__subtitle</xsl:attribute>
                  <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
                  <xsl:attribute name="data-animate-delay">250</xsl:attribute>
                  <xsl:value-of select="$SUBTITLE_TEXT" disable-output-escaping="yes"/>
                </xsl:element>
              </xsl:if>
            </div>
          </xsl:if>

          <!-- data-stagger-parent lets rbccm-animate.js reveal each
               .rbccm-platforms__card in sequence as the grid appears. -->
          <div class="rbccm-platforms__grid" data-stagger-parent="fadeInUp" data-stagger-step="200">
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="1"/></xsl:call-template>
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="2"/></xsl:call-template>
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="3"/></xsl:call-template>
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="4"/></xsl:call-template>
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

    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
