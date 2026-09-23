<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: CTA Band :: us-credentials (single-skin build)

    US Credentials "Ready to turn insights into results?"
    Big serif heading; the yellow highlight always drops to its own
    line at desktop. 1 yellow pill CTA.

    Standalone skin for TeamSite's Skin dropdown; the variant is
    fixed here, there is no preset field. Companion skins:
    rbccm-cta-band (double-dash) maas-mata / strategy-and-economics /
    us-credentials .xsl, all reading rbccm-cta-band-properties.xml.

    Runtime binder hooks: author-facing strings carry data-json /
    data-json-html / data-json-attr-* attributes for preview builds
    that hydrate from a JSON draft (harmless otherwise).
  -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- ═══ Datum reads ═══════════════════════════════════════ -->
    <!-- Variant is fixed by this skin (no preset field). -->
    <xsl:variable name="PRESET" select="'us-credentials'"/>

    <!-- Plain text field: yes / no (case-insensitive). -->
    <xsl:variable name="BG_TRANSPARENT" select="translate(normalize-space(//Datum[@ID='BgTransparent']/text()[last()]), 'YES', 'yes')"/>
    <xsl:variable name="CSS_PATH_RAW"   select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"  select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>

    <xsl:variable name="EYEBROW"           select="normalize-space(//Datum[@ID='Eyebrow'])"/>
    <xsl:variable name="HEADING_LEAD"      select="normalize-space(//Datum[@ID='HeadingLead'])"/>
    <xsl:variable name="HEADING_HIGHLIGHT" select="normalize-space(//Datum[@ID='HeadingHighlight'])"/>
    <xsl:variable name="BODY"              select="//Datum[@ID='Body']"/>
    <xsl:variable name="BODY_NORM"         select="normalize-space($BODY)"/>

    <xsl:variable name="CTA1_LABEL"        select="normalize-space(//Datum[@ID='Cta1Label'])"/>
    <xsl:variable name="CTA1_HREF"         select="normalize-space(//Datum[@ID='Cta1Href'])"/>
    <xsl:variable name="CTA2_LABEL"        select="normalize-space(//Datum[@ID='Cta2Label'])"/>
    <xsl:variable name="CTA2_HREF"         select="normalize-space(//Datum[@ID='Cta2Href'])"/>

    <xsl:variable name="SECTION_ID"        select="normalize-space(//Datum[@ID='SectionId'])"/>
    <xsl:variable name="SECTION_ARIA"      select="normalize-space(//Datum[@ID='SectionAriaLabel'])"/>


    <!-- ═══ Class list ═══════════════════════════════════════
         Base + preset modifier + optional bg-transparent flag.
         Assembled here so the <section> element gets one clean
         `class=""` value in the output.
         ═══════════════════════════════════════════════════════ -->
    <xsl:variable name="CLASS_LIST">
      <xsl:text>rbccm-cta-band rbccm-cta-band--</xsl:text>
      <xsl:value-of select="$PRESET"/>
      <xsl:if test="$BG_TRANSPARENT = 'yes'"><xsl:text> rbccm-cta-band--bg-transparent</xsl:text></xsl:if>
    </xsl:variable>


    <!-- ═══ Stylesheet link ══════════════════════════════════
         Component ships its own sidecar CSS. Safe to include on
         every render — browsers dedupe repeat <link> requests.
         ═══════════════════════════════════════════════════════ -->
    <link rel="stylesheet">
      <xsl:attribute name="href">
        <xsl:choose>
          <xsl:when test="$CSS_PATH_RAW != ''"><xsl:value-of select="$CSS_PATH_RAW"/></xsl:when>
          <xsl:otherwise>/assets/rbccm/css/components/rbccm-cta-band.css</xsl:otherwise>
        </xsl:choose>
        <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
      </xsl:attribute>
    </link>


    <!-- ═══ Section shell ════════════════════════════════════ -->
    <section>
      <xsl:attribute name="class"><xsl:value-of select="$CLASS_LIST"/></xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <div class="rbccm-cta-band__inner">

        <!-- ═══ Eyebrow (optional) ══════════════════════════
             Only rendered when the Datum is non-empty. Skips
             cleanly on us-credentials / strategy-and-economics instances
             that leave the field blank.
             ═════════════════════════════════════════════════ -->
        <xsl:if test="$EYEBROW != ''">
          <p class="rbccm-cta-band__eyebrow" data-json="eyebrow">
            <xsl:value-of select="$EYEBROW"/>
          </p>
        </xsl:if>


        <!-- ═══ Heading + body ═════════════════════════════
             strategy-and-economics wraps heading + body in .__intro
             (gap 12 for tight rhythm inside .__inner's gap 32).
             Other presets emit them as flex siblings of .__inner
             so its own gap owns the vertical rhythm.
             ═════════════════════════════════════════════════ -->
        <xsl:choose>
          <xsl:when test="$PRESET = 'strategy-and-economics'">
            <div class="rbccm-cta-band__intro">
              <xsl:call-template name="heading-block">
                <xsl:with-param name="preset" select="$PRESET"/>
                <xsl:with-param name="lead" select="$HEADING_LEAD"/>
                <xsl:with-param name="highlight" select="$HEADING_HIGHLIGHT"/>
              </xsl:call-template>
              <xsl:if test="$BODY_NORM != ''">
                <p class="rbccm-cta-band__body" data-json-html="body">
                  <xsl:value-of select="$BODY" disable-output-escaping="yes"/>
                </p>
              </xsl:if>
            </div>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="heading-block">
              <xsl:with-param name="preset" select="$PRESET"/>
              <xsl:with-param name="lead" select="$HEADING_LEAD"/>
              <xsl:with-param name="highlight" select="$HEADING_HIGHLIGHT"/>
            </xsl:call-template>
            <xsl:if test="$BODY_NORM != ''">
              <p class="rbccm-cta-band__body" data-json-html="body">
                <xsl:value-of select="$BODY" disable-output-escaping="yes"/>
              </p>
            </xsl:if>
          </xsl:otherwise>
        </xsl:choose>


        <!-- ═══ Actions row ════════════════════════════════
             Wrapper renders only when at least one CTA has a
             label. Primary is yellow pill + arrow; secondary
             (strategy-and-economics) is outlined ghost, no icon.
             ═════════════════════════════════════════════════ -->
        <xsl:if test="$CTA1_LABEL != '' or $CTA2_LABEL != ''">
          <div class="rbccm-cta-band__actions">

            <xsl:if test="$CTA1_LABEL != ''">
              <a class="rbccm-cta-band__btn rbccm-cta-band__btn--primary" data-json-attr-href="cta.href">
                <xsl:attribute name="href"><xsl:value-of select="$CTA1_HREF"/></xsl:attribute>
                <span data-json="cta.label"><xsl:value-of select="$CTA1_LABEL"/></span>
                <svg class="rbccm-cta-band__btn-icon" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden="true" focusable="false">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M1.4375 11.5C1.4375 11.3094 1.51323 11.1266 1.64802 10.9918C1.78281 10.857 1.96563 10.7812 2.15625 10.7812H19.1087L14.5849 6.25887C14.4499 6.12391 14.3741 5.94086 14.3741 5.74999C14.3741 5.55913 14.4499 5.37608 14.5849 5.24112C14.7198 5.10616 14.9029 5.03033 15.0938 5.03033C15.2846 5.03033 15.4677 5.10616 15.6026 5.24112L21.3526 10.9911C21.4196 11.0579 21.4727 11.1372 21.5089 11.2245C21.5451 11.3118 21.5638 11.4055 21.5638 11.5C21.5638 11.5945 21.5451 11.6881 21.5089 11.7755C21.4727 11.8628 21.4196 11.9421 21.3526 12.0089L15.6026 17.7589C15.4677 17.8938 15.2846 17.9696 15.0938 17.9696C14.9029 17.9696 14.7198 17.8938 14.5849 17.7589C14.4499 17.6239 14.3741 17.4409 14.3741 17.25C14.3741 17.0591 14.4499 16.8761 14.5849 16.7411L19.1087 12.2187H2.15625C1.96563 12.2187 1.78281 12.143 1.64802 12.0082C1.51323 11.8734 1.4375 11.6906 1.4375 11.5Z" fill="currentColor"/>
                </svg>
              </a>
            </xsl:if>

            <xsl:if test="$CTA2_LABEL != ''">
              <a class="rbccm-cta-band__btn rbccm-cta-band__btn--secondary" data-json-attr-href="cta2.href">
                <xsl:attribute name="href"><xsl:value-of select="$CTA2_HREF"/></xsl:attribute>
                <span data-json="cta2.label"><xsl:value-of select="$CTA2_LABEL"/></span>
              </a>
            </xsl:if>

          </div>
        </xsl:if>

      </div>
    </section>

  </xsl:template>


  <!-- ═══ Heading block template ════════════════════════════
       Emits the <h2>. Handles the three cases:

         • Both lead + highlight: two spans. For us-credentials
           NO text node between them (flex-column at desktop
           stacks each span on its own line); for all other
           presets a non-breaking space keeps the visual join.

         • Only lead: single text run (no spans, no wrapper) —
           strategy-and-economics typically hits this branch since its
           heading is a single sentence with no yellow accent.
       ═════════════════════════════════════════════════════════ -->
  <xsl:template name="heading-block">
    <xsl:param name="preset"/>
    <xsl:param name="lead"/>
    <xsl:param name="highlight"/>

    <h2 class="rbccm-cta-band__heading">
      <xsl:choose>
        <xsl:when test="$highlight != ''">
          <span data-json="headingLead"><xsl:value-of select="$lead"/></span>
          <xsl:if test="$preset != 'us-credentials'"><xsl:text>&#160;</xsl:text></xsl:if>
          <span class="rbccm-cta-band__heading-highlight" data-json="headingHighlight"><xsl:value-of select="$highlight"/></span>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$lead"/>
        </xsl:otherwise>
      </xsl:choose>
    </h2>
  </xsl:template>

</xsl:stylesheet>
