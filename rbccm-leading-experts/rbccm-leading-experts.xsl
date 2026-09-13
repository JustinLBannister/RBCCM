<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Leading Experts - XSL skin
  ==============================================================
  Renders a Preset-driven 3-card grid of expert profiles. Each
  card sets a DAM photo behind a navy gradient, with an eyebrow
  pill + name + role + gold CTA on top.

  Presets
  ==============================================================
  The $VARIANT_CLASS map resolves the Preset Datum to a BEM
  modifier class on the .rbccm-leading-experts section. Extend by:
    1. Adding a <xsl:when> branch to VARIANT_CLASS
    2. Adding a modifier scope in rbccm-leading-experts.css
    3. Adding a matching <Option> to the Preset Datum

  Current presets:
    strategy-and-economics-leading-experts

  Photo hookup
  ==============================================================
  Each Expert{N}Photo Datum uses Type="Image" (native DAM picker).
  The XSL reads:
    /Image/Path         becomes src on the &lt;img&gt;
    /Image/Description  becomes alt on the &lt;img&gt;
  If the Description Datum is empty, alt falls back to NameText so
  screen readers still announce the person the card represents.

  Focal point (optional per card)
  ==============================================================
  Expert{N}FocalPoint is an optional String Datum that overrides
  the CSS default object-position (50% 20%) for that card's
  portrait. When set, the XSL writes it inline on the &lt;article&gt;
  as the CSS custom property named rbccm-leading-experts-focal
  (with the CSS custom-property double-dash prefix at write time),
  which the .__photo rule reads via object-position: var(...).
  Leave blank to inherit the CSS default.

  Semantic tag pickers guarded via the pickTag allow-list. Blank
  Expert{N}NameText hides that slot entirely.
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

  <!-- Render one expert card. -->
  <xsl:template name="renderExpert">
    <xsl:param name="photo"/>
    <xsl:param name="photoAlt"/>
    <xsl:param name="focalPoint"/>
    <xsl:param name="eyebrowText"/>
    <xsl:param name="eyebrowTag"/>
    <xsl:param name="nameText"/>
    <xsl:param name="nameTag"/>
    <xsl:param name="roleText"/>
    <xsl:param name="roleTag"/>
    <xsl:param name="ctaText"/>
    <xsl:param name="ctaHref"/>

    <article class="rbccm-leading-experts__card">
      <!-- Optional per-card focal-point override. Written as an
           inline CSS custom property that the .__photo rule reads
           via its object-position rule (see rbccm-leading-experts.css). -->
      <xsl:if test="$focalPoint != ''">
        <xsl:attribute name="style">--rbccm-leading-experts-focal: <xsl:value-of select="$focalPoint"/></xsl:attribute>
      </xsl:if>

      <xsl:if test="$photo != ''">
        <img class="rbccm-leading-experts__photo" loading="lazy" decoding="async">
          <xsl:attribute name="src"><xsl:value-of select="$photo"/></xsl:attribute>
          <!-- alt defaults to the DAM Description; falls back to
               empty string (decorative) when Description is blank,
               since the adjacent .__name h3 already announces the
               person. Emitting NameText here would cause SR users
               to hear the name twice (WCAG 1.1.1 nuance). -->
          <xsl:attribute name="alt"><xsl:value-of select="$photoAlt"/></xsl:attribute>
        </img>
      </xsl:if>

      <div class="rbccm-leading-experts__card-inner">

        <xsl:if test="$eyebrowText != ''">
          <xsl:element name="{$eyebrowTag}">
            <xsl:attribute name="class">rbccm-leading-experts__eyebrow</xsl:attribute>
            <xsl:value-of select="$eyebrowText"/>
          </xsl:element>
        </xsl:if>

        <div class="rbccm-leading-experts__card-body">
          <div class="rbccm-leading-experts__name-role">
            <xsl:element name="{$nameTag}">
              <xsl:attribute name="class">rbccm-leading-experts__name</xsl:attribute>
              <xsl:value-of select="$nameText"/>
            </xsl:element>
            <xsl:if test="normalize-space($roleText) != ''">
              <xsl:element name="{$roleTag}">
                <xsl:attribute name="class">rbccm-leading-experts__role</xsl:attribute>
                <xsl:value-of select="$roleText" disable-output-escaping="yes"/>
              </xsl:element>
            </xsl:if>
          </div>

          <xsl:if test="$ctaText != ''">
            <a class="rbccm-leading-experts__cta">
              <xsl:attribute name="href">
                <xsl:choose>
                  <xsl:when test="$ctaHref != ''"><xsl:value-of select="$ctaHref"/></xsl:when>
                  <xsl:otherwise>#</xsl:otherwise>
                </xsl:choose>
              </xsl:attribute>
              <span><xsl:value-of select="$ctaText"/></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2.70801 6.5H10.2913" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.5 2.70833L10.2917 6.5L6.5 10.2917" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </xsl:if>
        </div>

      </div>
    </article>
  </xsl:template>

  <!-- Per-slot lookup + renderExpert dispatcher (reads Expert{N}FieldName). -->
  <xsl:template name="renderSlot">
    <xsl:param name="n"/>
    <xsl:variable name="name" select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'NameText')]/text()[last()])"/>
    <xsl:if test="$name != ''">
      <xsl:variable name="photo"        select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'Photo')]/Image/Path)"/>
      <xsl:variable name="photoAlt"     select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'Photo')]/Image/Description)"/>
      <xsl:variable name="focalPoint"   select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'FocalPoint')]/text()[last()])"/>
      <xsl:variable name="eyebrow"      select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'EyebrowText')]/text()[last()])"/>
      <xsl:variable name="eyebrowTagRaw" select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'EyebrowTag')]/text()[last()])"/>
      <xsl:variable name="nameTagRaw"    select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'NameTag')]/text()[last()])"/>
      <xsl:variable name="role"         select="/Properties/Data/Datum[@ID=concat('Expert', $n, 'RoleText')]"/>
      <xsl:variable name="roleTagRaw"    select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'RoleTag')]/text()[last()])"/>
      <xsl:variable name="ctaText"      select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'CtaText')]/text()[last()])"/>
      <xsl:variable name="ctaHref"      select="normalize-space(/Properties/Data/Datum[@ID=concat('Expert', $n, 'CtaHref')]/text()[last()])"/>

      <xsl:variable name="eyebrowTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$eyebrowTagRaw"/>
          <xsl:with-param name="default" select="'span'"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="nameTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$nameTagRaw"/>
          <xsl:with-param name="default" select="'h3'"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="roleTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$roleTagRaw"/>
          <xsl:with-param name="default" select="'p'"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:call-template name="renderExpert">
        <xsl:with-param name="photo" select="$photo"/>
        <xsl:with-param name="photoAlt" select="$photoAlt"/>
        <xsl:with-param name="focalPoint" select="$focalPoint"/>
        <xsl:with-param name="eyebrowText" select="$eyebrow"/>
        <xsl:with-param name="eyebrowTag" select="$eyebrowTag"/>
        <xsl:with-param name="nameText" select="$name"/>
        <xsl:with-param name="nameTag" select="$nameTag"/>
        <xsl:with-param name="roleText" select="$role"/>
        <xsl:with-param name="roleTag" select="$roleTag"/>
        <xsl:with-param name="ctaText" select="$ctaText"/>
        <xsl:with-param name="ctaHref" select="$ctaHref"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="PRESET"        select="normalize-space(/Properties/Data/Datum[@ID='Preset']/text()[last()])"/>

    <xsl:variable name="TITLE_TEXT"    select="normalize-space(/Properties/Data/Datum[@ID='SectionTitleText']/text()[last()])"/>
    <xsl:variable name="TITLE_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SectionTitleTag']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(/Properties/Data/Datum[@ID='HeaderAlignment']/text()[last()])"/>
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
        <xsl:when test="$PRESET = 'strategy-and-economics-leading-experts'">rbccm-leading-experts--strategy-and-economics-leading-experts</xsl:when>
        <xsl:otherwise/>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$VARIANT_CLASS != ''">

      <xsl:variable name="TITLE_ID">
        <xsl:choose>
          <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/>-title</xsl:when>
          <xsl:otherwise>rbccm-leading-experts-title</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <section>
        <xsl:attribute name="class">rbccm-leading-experts <xsl:value-of select="$VARIANT_CLASS"/><xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-leading-experts--header-center</xsl:if></xsl:attribute>
        <xsl:if test="$SECTION_ID != ''">
          <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
        </xsl:if>
        <!-- Prefer aria-labelledby pointing at the visible h2 so SR
             users don't hear the label twice (once from aria-label
             and again from the h2). Falls back to aria-label when
             no title is present. -->
        <xsl:choose>
          <xsl:when test="$TITLE_TEXT != ''">
            <xsl:attribute name="aria-labelledby"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
          </xsl:when>
          <xsl:when test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:when>
        </xsl:choose>

        <div class="container rbccm-leading-experts__inner">

          <xsl:if test="$TITLE_TEXT != ''">
            <xsl:element name="{$TITLE_TAG}">
              <xsl:attribute name="class">rbccm-leading-experts__title</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
              <!-- Scroll-triggered reveal driven by rbccm-animate/rbccm-animate.js. -->
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:value-of select="$TITLE_TEXT" disable-output-escaping="yes"/>
            </xsl:element>
          </xsl:if>

          <!-- data-stagger-parent lets rbccm-animate.js reveal each
               .rbccm-leading-experts__card in sequence. -->
          <div class="rbccm-leading-experts__grid" data-stagger-parent="fadeInUp" data-stagger-step="200">
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="1"/></xsl:call-template>
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="2"/></xsl:call-template>
            <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="3"/></xsl:call-template>
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
