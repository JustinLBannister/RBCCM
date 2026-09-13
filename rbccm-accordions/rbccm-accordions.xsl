<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Accordions - XSL skin
  ==============================================================
  Renders a Preset-driven accordion-section. One variant supported
  today (strategy-and-economics-notes); more can be added by
  appending xsl:when branches inside the Preset routing block.

  Semantic tag picker
  ==============================================================
  Every editable text field ships with a companion Tag Datum
  (h1..h6, p, div, span). The XSL emits the chosen tag via
  xsl:element name="{...}" so authors can pick per-field semantics
  without touching the skin. A pickTag named template guards the
  value: anything outside the allow-list falls back to a safe
  default so a mis-typed Datum never emits garbage markup.

  Repeater
  ==============================================================
  8 note slots exposed. A slot renders only when its CategoryText
  Datum is non-blank, so authors leave later slots empty for
  shorter lists. A renderNote named template holds the per-slot
  markup so a single body handles every slot without duplication.
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

  <!-- Toggle icon -- a single plus SVG whose fill inherits from the
       button's currentColor. CSS rotates it 45deg clockwise on
       .is-open (a symmetric plus becomes an X visually) and swaps
       the button's color from warm yellow to bright blue. One SVG,
       one animation - no SVG swap machinery required. -->
  <xsl:template name="toggleIcon">
    <svg class="rbccm-accordions__item-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 2C9 1.44687 8.55312 1 8 1C7.44688 1 7 1.44687 7 2V7H2C1.44687 7 1 7.44688 1 8C1 8.55312 1.44687 9 2 9H7V14C7 14.5531 7.44688 15 8 15C8.55312 15 9 14.5531 9 14V9H14C14.5531 9 15 8.55312 15 8C15 7.44688 14.5531 7 14 7H9V2Z" fill="currentColor"/>
    </svg>
  </xsl:template>
  <!-- Chevron + shaft arrow (13x13). Stroke uses currentColor so
       the variant modifier's color rule on .__item-readmore
       repaints text + icon in one place. -->
  <xsl:template name="readMoreArrow">
    <svg class="rbccm-accordions__item-readmore-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2.70801 6.5H10.2913" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.5 2.70831L10.2917 6.49998L6.5 10.2916" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </xsl:template>

  <!-- Render one note slot. Params are resolved from Datums in the
       caller so this template stays generic across slots. -->
  <xsl:template name="renderNote">
    <xsl:param name="idx"/>
    <xsl:param name="sectionId"/>
    <xsl:param name="categoryText"/>
    <xsl:param name="categoryTag"/>
    <xsl:param name="author"/>
    <xsl:param name="date"/>
    <xsl:param name="titleText"/>
    <xsl:param name="titleTag"/>
    <xsl:param name="summaryText"/>
    <xsl:param name="summaryTag"/>
    <xsl:param name="bodyHtml"/>
    <xsl:param name="readMoreLabel"/>
    <xsl:param name="readMoreHref"/>
    <xsl:param name="readMoreAria"/>

    <xsl:variable name="expandedId">
      <xsl:value-of select="$sectionId"/>-item-<xsl:value-of select="$idx"/>-body
    </xsl:variable>

    <article class="rbccm-accordions__item">
      <div class="rbccm-accordions__item-header">
        <div class="rbccm-accordions__item-meta">
          <xsl:if test="$categoryText != ''">
            <xsl:element name="{$categoryTag}">
              <xsl:attribute name="class">rbccm-accordions__item-eyebrow</xsl:attribute>
              <xsl:value-of select="$categoryText"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$author != '' or $date != ''">
            <p class="rbccm-accordions__item-byline">
              <xsl:value-of select="$author"/>
              <xsl:if test="$author != '' and $date != ''"><xsl:text> | </xsl:text></xsl:if>
              <xsl:value-of select="$date"/>
            </p>
          </xsl:if>
        </div>
        <button type="button" class="rbccm-accordions__item-toggle" aria-expanded="false">
          <xsl:attribute name="aria-controls"><xsl:value-of select="normalize-space($expandedId)"/></xsl:attribute>
          <xsl:attribute name="aria-label">Expand note: <xsl:value-of select="$titleText"/></xsl:attribute>
          <xsl:call-template name="toggleIcon"/>
        </button>
      </div>

      <xsl:if test="$titleText != '' or normalize-space($summaryText) != ''">
        <div class="rbccm-accordions__item-body">
          <xsl:if test="$titleText != ''">
            <xsl:element name="{$titleTag}">
              <xsl:attribute name="class">rbccm-accordions__item-title</xsl:attribute>
              <xsl:value-of select="$titleText"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="normalize-space($summaryText) != ''">
            <xsl:element name="{$summaryTag}">
              <xsl:attribute name="class">rbccm-accordions__item-summary</xsl:attribute>
              <xsl:value-of select="$summaryText" disable-output-escaping="yes"/>
            </xsl:element>
          </xsl:if>
        </div>
      </xsl:if>

      <xsl:if test="normalize-space($bodyHtml) != '' or $readMoreLabel != ''">
        <div class="rbccm-accordions__item-expanded" role="region">
          <xsl:attribute name="id"><xsl:value-of select="normalize-space($expandedId)"/></xsl:attribute>
          <xsl:if test="normalize-space($bodyHtml) != ''">
            <div class="rbccm-accordions__item-expanded-copy">
              <xsl:value-of select="$bodyHtml" disable-output-escaping="yes"/>
            </div>
          </xsl:if>
          <xsl:if test="$readMoreLabel != ''">
            <a class="rbccm-accordions__item-readmore">
              <xsl:attribute name="href"><xsl:value-of select="$readMoreHref"/></xsl:attribute>
              <xsl:if test="$readMoreAria != ''">
                <xsl:attribute name="aria-label"><xsl:value-of select="$readMoreAria"/></xsl:attribute>
              </xsl:if>
              <xsl:value-of select="$readMoreLabel"/>
              <xsl:call-template name="readMoreArrow"/>
            </a>
          </xsl:if>
        </div>
      </xsl:if>
    </article>
  </xsl:template>


  <!-- text()[last()] isolates the trailing text of a Datum whose
       body may contain child Option elements. -->
  <xsl:template match="/">

    <!-- Shared -->
    <xsl:variable name="SECTION_ID"    select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="PRESET"        select="normalize-space(/Properties/Data/Datum[@ID='Preset']/text()[last()])"/>

    <!-- Section header -->
    <xsl:variable name="TITLE_TEXT"   select="normalize-space(/Properties/Data/Datum[@ID='SectionTitleText']/text()[last()])"/>
    <xsl:variable name="TITLE_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SectionTitleTag']/text()[last()])"/>
    <xsl:variable name="DESC_TEXT"    select="/Properties/Data/Datum[@ID='SectionDescriptionText']"/>
    <xsl:variable name="DESC_TAG_RAW" select="normalize-space(/Properties/Data/Datum[@ID='SectionDescriptionTag']/text()[last()])"/>
    <xsl:variable name="EXPAND_LABEL"   select="normalize-space(/Properties/Data/Datum[@ID='ExpandAllLabel']/text()[last()])"/>
    <xsl:variable name="COLLAPSE_LABEL" select="normalize-space(/Properties/Data/Datum[@ID='CollapseAllLabel']/text()[last()])"/>
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
    <xsl:variable name="DESC_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$DESC_TAG_RAW"/>
        <xsl:with-param name="default" select="'p'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- ==== Stylesheet hoist ==== -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <!-- ==== Preset routing ==== -->
    <xsl:choose>

      <xsl:when test="$PRESET = 'strategy-and-economics-notes'">

        <section>
          <xsl:attribute name="class">rbccm-accordions rbccm-accordions--strategy-and-economics-notes<xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-accordions--header-center</xsl:if></xsl:attribute>
          <xsl:if test="$SECTION_ID != ''">
            <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
          </xsl:if>
          <xsl:if test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:if>

          <div class="rbccm-accordions__container">

            <!-- Section header -->
            <div class="rbccm-accordions__header">
              <div class="rbccm-accordions__header-lede">
                <xsl:if test="$TITLE_TEXT != ''">
                  <xsl:element name="{$TITLE_TAG}">
                    <xsl:attribute name="class">rbccm-accordions__title</xsl:attribute>
                    <xsl:value-of select="$TITLE_TEXT" disable-output-escaping="yes"/>
                  </xsl:element>
                </xsl:if>
                <xsl:if test="normalize-space($DESC_TEXT) != ''">
                  <xsl:element name="{$DESC_TAG}">
                    <xsl:attribute name="class">rbccm-accordions__description</xsl:attribute>
                    <xsl:value-of select="$DESC_TEXT" disable-output-escaping="yes"/>
                  </xsl:element>
                </xsl:if>
              </div>
              <xsl:if test="$EXPAND_LABEL != ''">
                <button type="button" class="rbccm-accordions__expand-all" data-accordions-expand-all="" aria-expanded="false">
                  <xsl:attribute name="data-label-expand"><xsl:value-of select="$EXPAND_LABEL"/></xsl:attribute>
                  <xsl:if test="$COLLAPSE_LABEL != ''">
                    <xsl:attribute name="data-label-collapse"><xsl:value-of select="$COLLAPSE_LABEL"/></xsl:attribute>
                  </xsl:if>
                  <xsl:value-of select="$EXPAND_LABEL"/>
                </button>
              </xsl:if>
            </div>

            <!-- Note list -->
            <div class="rbccm-accordions__list">

              <!-- Loop over 8 slots. Each slot's Datums are read fresh
                   inside a call-template; xsl:call-template with
                   per-slot lookups keeps the template body generic. -->
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="1"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="2"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="3"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="4"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="5"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="6"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="7"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="8"/><xsl:with-param name="sid" select="$SECTION_ID"/></xsl:call-template>

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

      </xsl:when>

      <xsl:otherwise/>
    </xsl:choose>

  </xsl:template>

  <!-- Per-slot lookup + renderNote dispatcher. Reads Datums named
       Item{N}FieldName using concat(). XSL 1.0 safe. -->
  <xsl:template name="renderSlot">
    <xsl:param name="n"/>
    <xsl:param name="sid"/>
    <xsl:variable name="cat"      select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'CategoryText')]/text()[last()])"/>
    <xsl:if test="$cat != ''">
      <xsl:variable name="catTagRaw"     select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'CategoryTag')]/text()[last()])"/>
      <xsl:variable name="author"        select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'Author')]/text()[last()])"/>
      <xsl:variable name="date"          select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'Date')]/text()[last()])"/>
      <xsl:variable name="titleText"     select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'TitleText')]/text()[last()])"/>
      <xsl:variable name="titleTagRaw"   select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'TitleTag')]/text()[last()])"/>
      <xsl:variable name="summaryText"   select="/Properties/Data/Datum[@ID=concat('Item', $n, 'SummaryText')]"/>
      <xsl:variable name="summaryTagRaw" select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'SummaryTag')]/text()[last()])"/>
      <xsl:variable name="bodyHtml"      select="/Properties/Data/Datum[@ID=concat('Item', $n, 'BodyHtml')]"/>
      <xsl:variable name="rmLabel"       select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'ReadMoreLabel')]/text()[last()])"/>
      <xsl:variable name="rmHref"        select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'ReadMoreHref')]/text()[last()])"/>
      <xsl:variable name="rmAria"        select="normalize-space(/Properties/Data/Datum[@ID=concat('Item', $n, 'ReadMoreAria')]/text()[last()])"/>

      <xsl:variable name="catTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$catTagRaw"/>
          <xsl:with-param name="default" select="'p'"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="titleTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$titleTagRaw"/>
          <xsl:with-param name="default" select="'h3'"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="summaryTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$summaryTagRaw"/>
          <xsl:with-param name="default" select="'p'"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:call-template name="renderNote">
        <xsl:with-param name="idx" select="$n"/>
        <xsl:with-param name="sectionId" select="$sid"/>
        <xsl:with-param name="categoryText" select="$cat"/>
        <xsl:with-param name="categoryTag" select="$catTag"/>
        <xsl:with-param name="author" select="$author"/>
        <xsl:with-param name="date" select="$date"/>
        <xsl:with-param name="titleText" select="$titleText"/>
        <xsl:with-param name="titleTag" select="$titleTag"/>
        <xsl:with-param name="summaryText" select="$summaryText"/>
        <xsl:with-param name="summaryTag" select="$summaryTag"/>
        <xsl:with-param name="bodyHtml" select="$bodyHtml"/>
        <xsl:with-param name="readMoreLabel" select="$rmLabel"/>
        <xsl:with-param name="readMoreHref" select="$rmHref"/>
        <xsl:with-param name="readMoreAria" select="$rmAria"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
