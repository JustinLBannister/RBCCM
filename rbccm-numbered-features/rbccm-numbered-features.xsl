<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Numbered Features
  ============================================================
  Heading + intro line, then exactly 3 numbered features (/01 /02
  /03), each a number, title and body. Extracted from the
  MAAS+MATA "Innovation for the next execution era" section.

  The row is designed for 3 columns, so the features only render
  when all 3 have a title (min and max are both 3); otherwise the
  whole row is left out. A blank number is filled in as 01, 02, 03.
  The heading and the intro line (subheader) each render only when
  they have text.

  Fields: rbccm-numbered-features-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:template name="datum">
    <xsl:param name="id"/>
    <xsl:value-of select="normalize-space(//Datum[@ID=$id]/text()[last()])"/>
  </xsl:template>

  <!-- Visible text of a rich-text value (tags stripped). -->
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

  <xsl:template name="feature">
    <xsl:param name="n"/>
    <xsl:param name="pos"/>
    <xsl:variable name="num"><xsl:call-template name="datum"><xsl:with-param name="id" select="concat('Feature', $n, 'Number')"/></xsl:call-template></xsl:variable>
    <xsl:variable name="title"><xsl:call-template name="datum"><xsl:with-param name="id" select="concat('Feature', $n, 'Title')"/></xsl:call-template></xsl:variable>
    <xsl:variable name="body"><xsl:call-template name="datum"><xsl:with-param name="id" select="concat('Feature', $n, 'Body')"/></xsl:call-template></xsl:variable>
    <xsl:variable name="bodyText"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$body"/></xsl:call-template></xsl:variable>
    <xsl:variable name="digits">
      <xsl:choose>
        <xsl:when test="translate($num, '/ ', '') != ''"><xsl:value-of select="translate($num, '/ ', '')"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="format-number($pos, '00')"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <li class="rbccm-numbered-features__item">
      <!-- The number is decorative; the list gives screen readers the count. -->
      <p class="rbccm-numbered-features__number" aria-hidden="true">/<xsl:value-of select="$digits"/></p>
      <h3 class="rbccm-numbered-features__title"><xsl:value-of select="$title"/></h3>
      <xsl:if test="normalize-space(translate($bodyText, '&#160;&amp;nbsp;', '')) != ''">
        <p class="rbccm-numbered-features__body"><xsl:value-of select="$body" disable-output-escaping="yes"/></p>
      </xsl:if>
    </li>
  </xsl:template>

  <xsl:template match="/">
    <xsl:variable name="CSS_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CssPath'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CACHE"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CacheVersion'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="SECTION_ID"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionID'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="ARIA"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionAriaLabel'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="BG"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionBgColor'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="TAG_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'HeadingTag'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HEADING"><xsl:call-template name="datum"><xsl:with-param name="id" select="'HeadingText'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="INTRO"><xsl:call-template name="datum"><xsl:with-param name="id" select="'IntroText'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="INTRO_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$INTRO"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_INTRO" select="normalize-space(translate($INTRO_TEXT, '&#160;&amp;nbsp;', '')) != ''"/>

    <xsl:variable name="T1"><xsl:call-template name="datum"><xsl:with-param name="id" select="'Feature1Title'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T2"><xsl:call-template name="datum"><xsl:with-param name="id" select="'Feature2Title'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T3"><xsl:call-template name="datum"><xsl:with-param name="id" select="'Feature3Title'"/></xsl:call-template></xsl:variable>

    <xsl:variable name="CSS">
      <xsl:choose>
        <xsl:when test="$CSS_RAW != ''"><xsl:value-of select="$CSS_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/css/components/rbccm-numbered-features.css</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TAG">
      <xsl:choose>
        <xsl:when test="$TAG_RAW = 'h1' or $TAG_RAW = 'h2' or $TAG_RAW = 'h3' or $TAG_RAW = 'p' or $TAG_RAW = 'div'"><xsl:value-of select="$TAG_RAW"/></xsl:when>
        <xsl:otherwise>h2</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <link rel="stylesheet" type="text/css">
      <xsl:attribute name="href">
        <xsl:value-of select="$CSS"/>
        <xsl:if test="$CACHE != ''">?v=<xsl:value-of select="$CACHE"/></xsl:if>
      </xsl:attribute>
    </link>

    <section class="rbccm-numbered-features">
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$ARIA != ''"><xsl:attribute name="aria-label"><xsl:value-of select="$ARIA"/></xsl:attribute></xsl:when>
        <xsl:when test="$HEADING != ''"><xsl:attribute name="aria-label"><xsl:value-of select="$HEADING"/></xsl:attribute></xsl:when>
      </xsl:choose>
      <xsl:if test="$BG != ''">
        <xsl:attribute name="style">--rbccm-nf-bg: <xsl:value-of select="$BG"/>;</xsl:attribute>
      </xsl:if>

      <div class="rbccm-numbered-features__inner">

        <xsl:if test="$HEADING != '' or $HAS_INTRO">
          <div class="rbccm-numbered-features__header" data-animate="fadeInUp">
            <xsl:if test="$HEADING != ''">
              <xsl:element name="{$TAG}">
                <xsl:attribute name="class">rbccm-numbered-features__heading</xsl:attribute>
                <xsl:value-of select="$HEADING"/>
              </xsl:element>
            </xsl:if>
            <xsl:if test="$HAS_INTRO">
              <p class="rbccm-numbered-features__intro"><xsl:value-of select="$INTRO" disable-output-escaping="yes"/></p>
            </xsl:if>
          </div>
        </xsl:if>

        <!-- Exactly 3: the row only renders when all three have a title. -->
        <xsl:if test="$T1 != '' and $T2 != '' and $T3 != ''">
          <ul class="rbccm-numbered-features__grid" data-stagger-parent="fadeInUp" data-stagger-step="120">
            <xsl:call-template name="feature"><xsl:with-param name="n" select="1"/><xsl:with-param name="pos" select="1"/></xsl:call-template>
            <xsl:call-template name="feature"><xsl:with-param name="n" select="2"/><xsl:with-param name="pos" select="2"/></xsl:call-template>
            <xsl:call-template name="feature"><xsl:with-param name="n" select="3"/><xsl:with-param name="pos" select="3"/></xsl:call-template>
          </ul>
        </xsl:if>

      </div>
    </section>
  </xsl:template>

</xsl:stylesheet>
