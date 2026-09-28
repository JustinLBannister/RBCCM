<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Intro Statement
  ============================================================
  Big centred serif statement (grey lead / white highlight /
  yellow accent), up to 3 body paragraphs, and a ghost pill CTA.
  Extracted from the MAAS+MATA "A new standard for multi-asset
  electronic trading." section. Transparent background by default
  so it can sit inside the MAAS+MATA dark strip (rbccm-section-group).

  Blank fields don't render. The lead may contain a br tag (kept
  on phones, hidden from 600px up); include a space before it.
  Paragraphs accept simple HTML (strong, em, links).

  Fields: rbccm-intro-statement-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:template name="datum">
    <xsl:param name="id"/>
    <xsl:value-of select="normalize-space(//Datum[@ID=$id]/text()[last()])"/>
  </xsl:template>

  <!-- Visible text of a rich-text value (tags stripped), used to skip
       fields the editor left with only placeholder markup. -->
  <xsl:template name="stripTags">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, '&lt;') and contains(substring-after($s, '&lt;'), '&gt;')">
        <xsl:value-of select="substring-before($s, '&lt;')"/>
        <xsl:call-template name="stripTags">
          <xsl:with-param name="s" select="substring-after(substring-after($s, '&lt;'), '&gt;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- One body paragraph, skipped when it has no real text. -->
  <xsl:template name="paragraph">
    <xsl:param name="id"/>
    <xsl:variable name="raw"><xsl:call-template name="datum"><xsl:with-param name="id" select="$id"/></xsl:call-template></xsl:variable>
    <xsl:variable name="text"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$raw"/></xsl:call-template></xsl:variable>
    <xsl:if test="normalize-space(translate($text, '&#160;&amp;nbsp;', '')) != ''">
      <p><xsl:value-of select="$raw" disable-output-escaping="yes"/></p>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/">
    <xsl:variable name="CSS_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CssPath'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CACHE"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CacheVersion'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="SECTION_ID"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionID'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="ARIA"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionAriaLabel'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="BG"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionBgColor'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="TAG_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'HeadingTag'"/></xsl:call-template></xsl:variable>

    <xsl:variable name="LEAD"><xsl:call-template name="datum"><xsl:with-param name="id" select="'HeadingLead'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HIGHLIGHT"><xsl:call-template name="datum"><xsl:with-param name="id" select="'HeadingHighlight'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="ACCENT"><xsl:call-template name="datum"><xsl:with-param name="id" select="'HeadingAccent'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CTA_LABEL"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CtaLabel'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CTA_HREF"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CtaHref'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CTA_ARIA"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CtaAriaLabel'"/></xsl:call-template></xsl:variable>

    <xsl:variable name="CSS">
      <xsl:choose>
        <xsl:when test="$CSS_RAW != ''"><xsl:value-of select="$CSS_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/css/components/rbccm-intro-statement.css</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TAG">
      <xsl:choose>
        <xsl:when test="$TAG_RAW = 'h1' or $TAG_RAW = 'h2' or $TAG_RAW = 'h3' or $TAG_RAW = 'p' or $TAG_RAW = 'div'"><xsl:value-of select="$TAG_RAW"/></xsl:when>
        <xsl:otherwise>h2</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- Plain-text version of the whole heading for the aria-label. -->
    <xsl:variable name="LEAD_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$LEAD"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HEADING_TEXT" select="normalize-space(concat($LEAD_TEXT, ' ', $HIGHLIGHT, ' ', $ACCENT))"/>

    <link rel="stylesheet" type="text/css">
      <xsl:attribute name="href">
        <xsl:value-of select="$CSS"/>
        <xsl:if test="$CACHE != ''">?v=<xsl:value-of select="$CACHE"/></xsl:if>
      </xsl:attribute>
    </link>

    <section class="rbccm-intro-statement">
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$ARIA != ''"><xsl:attribute name="aria-label"><xsl:value-of select="$ARIA"/></xsl:attribute></xsl:when>
        <xsl:when test="$HEADING_TEXT != ''"><xsl:attribute name="aria-label"><xsl:value-of select="$HEADING_TEXT"/></xsl:attribute></xsl:when>
      </xsl:choose>
      <xsl:if test="$BG != ''">
        <xsl:attribute name="style">--rbccm-is-bg: <xsl:value-of select="$BG"/>;</xsl:attribute>
      </xsl:if>

      <div class="rbccm-intro-statement__inner">

        <xsl:if test="$HEADING_TEXT != ''">
          <xsl:element name="{$TAG}">
            <xsl:attribute name="class">rbccm-intro-statement__heading</xsl:attribute>
            <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
            <xsl:if test="$LEAD != ''">
              <span class="rbccm-intro-statement__heading-lead"><xsl:value-of select="$LEAD" disable-output-escaping="yes"/></span>
            </xsl:if>
            <xsl:if test="$HIGHLIGHT != '' or $ACCENT != ''">
              <span class="rbccm-intro-statement__heading-highlight">
                <xsl:value-of select="$HIGHLIGHT"/>
                <xsl:if test="$HIGHLIGHT != '' and $ACCENT != ''"><xsl:text> </xsl:text><br/></xsl:if>
                <xsl:if test="$ACCENT != ''">
                  <span class="rbccm-intro-statement__heading-accent"><xsl:value-of select="$ACCENT"/></span>
                </xsl:if>
              </span>
            </xsl:if>
          </xsl:element>
        </xsl:if>

        <xsl:variable name="BODY">
          <xsl:call-template name="paragraph"><xsl:with-param name="id" select="'Paragraph1'"/></xsl:call-template>
          <xsl:call-template name="paragraph"><xsl:with-param name="id" select="'Paragraph2'"/></xsl:call-template>
          <xsl:call-template name="paragraph"><xsl:with-param name="id" select="'Paragraph3'"/></xsl:call-template>
        </xsl:variable>
        <xsl:if test="string($BODY) != ''">
          <div class="rbccm-intro-statement__body" data-animate="fadeInUp" data-animate-delay="150">
            <xsl:call-template name="paragraph"><xsl:with-param name="id" select="'Paragraph1'"/></xsl:call-template>
            <xsl:call-template name="paragraph"><xsl:with-param name="id" select="'Paragraph2'"/></xsl:call-template>
            <xsl:call-template name="paragraph"><xsl:with-param name="id" select="'Paragraph3'"/></xsl:call-template>
          </div>
        </xsl:if>

        <xsl:if test="$CTA_LABEL != '' and $CTA_HREF != ''">
          <a class="rbccm-intro-statement__cta" data-animate="fadeInUp" data-animate-delay="300">
            <xsl:attribute name="href"><xsl:value-of select="$CTA_HREF"/></xsl:attribute>
            <xsl:if test="$CTA_ARIA != ''">
              <xsl:attribute name="aria-label"><xsl:value-of select="$CTA_ARIA"/></xsl:attribute>
            </xsl:if>
            <span><xsl:value-of select="$CTA_LABEL"/></span>
          </a>
        </xsl:if>

      </div>
    </section>
  </xsl:template>

</xsl:stylesheet>
