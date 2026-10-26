<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Disclaimer
  ============================================================
  One paragraph of small grey disclaimer copy. Fields:
    DisclaimerText  the paragraph (blank renders nothing)
    SectionBgColor  optional background, white by default
    CacheVersion    cache-buster for the CSS
  Fields: rbccm-disclaimer-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

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

  <xsl:template match="/">
    <xsl:variable name="CACHE" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="BG" select="normalize-space(//Datum[@ID='SectionBgColor']/text()[last()])"/>
    <xsl:variable name="TEXT" select="normalize-space(//Datum[@ID='DisclaimerText']/text()[last()])"/>

    <xsl:if test="normalize-space(translate($TEXT, '&#160;', '')) != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">/assets/rbccm/css/components/rbccm-disclaimer.css<xsl:if test="$CACHE != ''">?v=<xsl:value-of select="$CACHE"/></xsl:if></xsl:attribute>
      </link>
      <div class="rbccm-disclaimer">
        <xsl:if test="$BG != ''">
          <xsl:attribute name="style">--rbccm-disclaimer-bg: <xsl:value-of select="$BG"/>;</xsl:attribute>
        </xsl:if>
        <div class="rbccm-disclaimer__inner">
          <!-- Output as HTML, not escaped text: TeamSite stores codes like
               &amp;#174; and &amp;#8220; literally, and escaping them would show
               the code on the page instead of the symbol. -->
          <p class="rbccm-disclaimer__text"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$TEXT"/></xsl:call-template></p>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
