<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Section Group :: Group start
  ============================================================
  Drop this component directly ABOVE the first section that belongs
  in the group, and "Group end" directly BELOW the last one. On page
  load everything between them is wrapped in one div (see
  rbccm-section-group.js), e.g. the MAAS+MATA dark-strip gradient.

  Outputs the stylesheet and a hidden marker. Nothing visible.
  Start and end pair up by Group name, so use the same name in both.
  Companion skin: rbccm-section-group (double-dash) end.xsl
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:template match="/">
    <xsl:variable name="NAME_RAW"  select="normalize-space(//Datum[@ID='GroupName']/text()[last()])"/>
    <xsl:variable name="CLASS_RAW" select="normalize-space(//Datum[@ID='WrapperClasses']/text()[last()])"/>
    <xsl:variable name="PAD_RAW"   select="normalize-space(//Datum[@ID='SpaceAbove']/text()[last()])"/>
    <xsl:variable name="LABEL"     select="normalize-space(//Datum[@ID='GroupAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_RAW"   select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="CACHE"     select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>

    <xsl:variable name="NAME">
      <xsl:choose>
        <xsl:when test="$NAME_RAW != ''"><xsl:value-of select="translate($NAME_RAW, ' ', '-')"/></xsl:when>
        <xsl:otherwise>dark-strip</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="CLASSES">
      <xsl:choose>
        <xsl:when test="$CLASS_RAW != ''"><xsl:value-of select="$CLASS_RAW"/></xsl:when>
        <xsl:otherwise>rbccm-section-group--dark-strip rbccm-maas-mata__dark-strip</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- Digits only; blank = 222 (room for the video poster's 200px overlap). -->
    <xsl:variable name="PAD_DIGITS" select="translate($PAD_RAW, translate($PAD_RAW, '0123456789', ''), '')"/>
    <xsl:variable name="PAD">
      <xsl:choose>
        <xsl:when test="$PAD_DIGITS != ''"><xsl:value-of select="$PAD_DIGITS"/></xsl:when>
        <xsl:otherwise>222</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="CSS">
      <xsl:choose>
        <xsl:when test="$CSS_RAW != ''"><xsl:value-of select="$CSS_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/css/components/rbccm-section-group.css</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <link rel="stylesheet" type="text/css">
      <xsl:attribute name="href">
        <xsl:value-of select="$CSS"/>
        <xsl:if test="$CACHE != ''">?v=<xsl:value-of select="$CACHE"/></xsl:if>
      </xsl:attribute>
    </link>

    <span class="rbccm-section-group__marker" hidden="hidden" aria-hidden="true">
      <xsl:attribute name="data-group-start"><xsl:value-of select="$NAME"/></xsl:attribute>
      <xsl:attribute name="data-group-class">rbccm-section-group <xsl:value-of select="$CLASSES"/></xsl:attribute>
      <xsl:attribute name="data-group-style">--rbccm-sg-pad-top: <xsl:value-of select="$PAD"/>px;</xsl:attribute>
      <xsl:if test="$LABEL != ''">
        <xsl:attribute name="data-group-label"><xsl:value-of select="$LABEL"/></xsl:attribute>
      </xsl:if>
    </span>
  </xsl:template>

</xsl:stylesheet>
