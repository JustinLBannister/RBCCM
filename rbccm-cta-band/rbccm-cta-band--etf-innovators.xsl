<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: CTA Band :: etf-innovators (single-skin build)

    ETF Innovators "Powering the performance of global ETFs."
    White section holding a rounded bright blue card: heading + body
    (wrapped in .__intro) and one yellow pill button with a line arrow.
    Mobile stacks; desktop puts the text left and the button right.

    Every element carries the variant modifier (__inner, __intro,
    __heading, __body, __actions, __btn, __btn-icon) so the variant CSS
    never collides with the other skins.

    Reads the shared rbccm-cta-band-properties.xml: HeadingLead (plus
    HeadingHighlight if filled, shown in yellow), Body, Cta1Label,
    Cta1Href, Cta1AriaLabel, SectionId, SectionAriaLabel, CssPath,
    CacheVersion. Eyebrow, Cta2 and BgTransparent are not used.

    Runtime binder hooks: same data-json attributes as the other skins.
  -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

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

    <!-- === Datum reads ======================================= -->
    <xsl:variable name="CSS_PATH_RAW"   select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>

    <xsl:variable name="HEADING_LEAD"      select="normalize-space(//Datum[@ID='HeadingLead'])"/>
    <xsl:variable name="HEADING_HIGHLIGHT" select="normalize-space(//Datum[@ID='HeadingHighlight'])"/>
    <xsl:variable name="BODY"              select="//Datum[@ID='Body']"/>
    <xsl:variable name="BODY_NORM"         select="normalize-space($BODY)"/>

    <xsl:variable name="CTA1_LABEL"        select="normalize-space(//Datum[@ID='Cta1Label'])"/>
    <xsl:variable name="CTA1_HREF"         select="normalize-space(//Datum[@ID='Cta1Href'])"/>
    <xsl:variable name="CTA1_ARIA"         select="normalize-space(//Datum[@ID='Cta1AriaLabel'])"/>

    <xsl:variable name="SECTION_ID"        select="normalize-space(//Datum[@ID='SectionId'])"/>
    <xsl:variable name="SECTION_ARIA"      select="normalize-space(//Datum[@ID='SectionAriaLabel'])"/>


    <!-- === Stylesheet link ================================== -->
    <link rel="stylesheet">
      <xsl:attribute name="href">
        <xsl:choose>
          <xsl:when test="$CSS_PATH_RAW != ''"><xsl:value-of select="$CSS_PATH_RAW"/></xsl:when>
          <xsl:otherwise>/assets/rbccm/css/components/rbccm-cta-band.css</xsl:otherwise>
        </xsl:choose>
        <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
      </xsl:attribute>
    </link>


    <!-- === Section shell ==================================== -->
    <section class="rbccm-cta-band rbccm-cta-band--etf-innovators">
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <!-- Named region for screen readers: the aria label field, else
           the heading. -->
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING_LEAD != '' or $HEADING_HIGHLIGHT != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="normalize-space(concat($HEADING_LEAD, ' ', $HEADING_HIGHLIGHT))"/></xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <!-- The card. -->
      <div class="rbccm-cta-band__inner rbccm-cta-band__inner--etf-innovators">

        <div class="rbccm-cta-band__intro rbccm-cta-band__intro--etf-innovators">
          <xsl:if test="$HEADING_LEAD != '' or $HEADING_HIGHLIGHT != ''">
            <h2 class="rbccm-cta-band__heading rbccm-cta-band__heading--etf-innovators">
              <xsl:choose>
                <xsl:when test="$HEADING_HIGHLIGHT != ''">
                  <span data-json="headingLead"><xsl:value-of select="$HEADING_LEAD"/></span>
                  <xsl:text>&#160;</xsl:text>
                  <span class="rbccm-cta-band__heading-highlight rbccm-cta-band__heading-highlight--etf-innovators" data-json="headingHighlight"><xsl:value-of select="$HEADING_HIGHLIGHT"/></span>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="$HEADING_LEAD"/>
                </xsl:otherwise>
              </xsl:choose>
            </h2>
          </xsl:if>
          <xsl:if test="$BODY_NORM != ''">
            <p class="rbccm-cta-band__body rbccm-cta-band__body--etf-innovators" data-json-html="body">
              <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$BODY"/></xsl:call-template>
            </p>
          </xsl:if>
        </div>

        <!-- === Button: yellow pill, line arrow ================= -->
        <xsl:if test="$CTA1_LABEL != ''">
          <div class="rbccm-cta-band__actions rbccm-cta-band__actions--etf-innovators">
            <a class="rbccm-cta-band__btn rbccm-cta-band__btn--primary rbccm-cta-band__btn--etf-innovators" data-json-attr-href="cta.href">
              <xsl:attribute name="href"><xsl:value-of select="$CTA1_HREF"/></xsl:attribute>
              <xsl:if test="$CTA1_ARIA != ''"><xsl:attribute name="aria-label"><xsl:value-of select="$CTA1_ARIA"/></xsl:attribute></xsl:if>
              <span class="rbccm-cta-band__btn-label rbccm-cta-band__btn-label--etf-innovators" data-json="cta.label"><xsl:value-of select="$CTA1_LABEL"/></span>
              <svg class="rbccm-cta-band__btn-icon rbccm-cta-band__btn-icon--etf-innovators" xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true" focusable="false">
                <path d="M0.75 6H15.25M15.25 6L10.25 1M15.25 6L10.25 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </xsl:if>

      </div>
    </section>

  </xsl:template>

</xsl:stylesheet>
