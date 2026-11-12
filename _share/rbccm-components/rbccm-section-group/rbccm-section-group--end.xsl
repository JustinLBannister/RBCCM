<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Section Group :: Group end
  ============================================================
  Drop this component directly BELOW the last section that belongs in
  the group. Outputs a hidden marker and loads rbccm-section-group.js,
  which wraps everything from the matching Group start down to here.
  The script loads right after the marker so the wrap happens while
  the page is still loading, before carousels and animations set up.

  Group name must match the Group start above it.
  Companion skin: rbccm-section-group (double-dash) start.xsl
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:template match="/">
    <xsl:variable name="NAME_RAW" select="normalize-space(//Datum[@ID='GroupName']/text()[last()])"/>
    <xsl:variable name="JS_RAW"   select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE"    select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>

    <xsl:variable name="NAME">
      <xsl:choose>
        <xsl:when test="$NAME_RAW != ''"><xsl:value-of select="translate($NAME_RAW, ' ', '-')"/></xsl:when>
        <xsl:otherwise>dark-strip</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="JS">
      <xsl:choose>
        <xsl:when test="$JS_RAW != ''"><xsl:value-of select="$JS_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/js/components/rbccm-section-group.js</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <span class="rbccm-section-group__marker" hidden="hidden" aria-hidden="true">
      <xsl:attribute name="data-group-end"><xsl:value-of select="$NAME"/></xsl:attribute>
    </span>
    <script>
      <xsl:attribute name="src">
        <xsl:value-of select="$JS"/>
        <xsl:if test="$CACHE != ''">?v=<xsl:value-of select="$CACHE"/></xsl:if>
      </xsl:attribute>
    </script>
  </xsl:template>

</xsl:stylesheet>
