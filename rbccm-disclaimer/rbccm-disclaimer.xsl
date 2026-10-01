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
          <p class="rbccm-disclaimer__text"><xsl:value-of select="$TEXT"/></p>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
