<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: CTA Band — shared component.

    Renders a dark navy call-to-action band with an optional
    eyebrow, a two-tone serif headline, a body paragraph, and a
    yellow pill CTA. Extracted from MAAS+MATA "Talk with an
    expert." and US Credentials "Ready to turn insight into
    results?" — both share ~95% of the same visual system.

    Nesting
    ───────
    By default paints its own gradient (standalone use). When
    placed inside .rbccm-deep-band, a compound selector in the
    CSS zeros the background so the wrapper's continuous gradient
    shows through. No modifier needed on the section itself.

    Runtime binder hooks
    ────────────────────
    Every author-facing string carries a data-json / data-json-html /
    data-json-attr-* attribute so a page's preview build can hydrate
    live content from a JSON draft (see maas-mata pattern). Falls
    back to the XSL Datum value when no JSON is bound.
  -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- Datum reads. Everything is optional except the heading
         parts and the CTA target; if those are missing the
         component still renders but obviously with blank content. -->
    <xsl:variable name="EYEBROW"           select="normalize-space(/Properties/Datum[@ID='Eyebrow'])"/>
    <xsl:variable name="HEADING_LEAD"      select="normalize-space(/Properties/Datum[@ID='HeadingLead'])"/>
    <xsl:variable name="HEADING_HIGHLIGHT" select="normalize-space(/Properties/Datum[@ID='HeadingHighlight'])"/>
    <xsl:variable name="BODY"              select="/Properties/Datum[@ID='Body']"/>
    <xsl:variable name="CTA_LABEL"         select="normalize-space(/Properties/Datum[@ID='CtaLabel'])"/>
    <xsl:variable name="CTA_HREF"          select="normalize-space(/Properties/Datum[@ID='CtaHref'])"/>

    <!-- Tunable widths — surfaced as inline CSS custom properties
         on the section so page instances can shift the content /
         body cap without a new modifier class. If the Datum is
         blank, the CSS default applies (690 / 41 / 100%). -->
    <xsl:variable name="CONTENT_WIDTH" select="normalize-space(/Properties/Datum[@ID='ContentWidth'])"/>
    <xsl:variable name="CONTENT_GAP"   select="normalize-space(/Properties/Datum[@ID='ContentGap'])"/>
    <xsl:variable name="BODY_WIDTH"    select="normalize-space(/Properties/Datum[@ID='BodyWidth'])"/>

    <xsl:variable name="INLINE_STYLE">
      <xsl:if test="$CONTENT_WIDTH != ''"><xsl:text>--cta-band-content-width: </xsl:text><xsl:value-of select="$CONTENT_WIDTH"/><xsl:text>; </xsl:text></xsl:if>
      <xsl:if test="$CONTENT_GAP   != ''"><xsl:text>--cta-band-content-gap: </xsl:text><xsl:value-of select="$CONTENT_GAP"/><xsl:text>; </xsl:text></xsl:if>
      <xsl:if test="$BODY_WIDTH    != ''"><xsl:text>--cta-band-body-width: </xsl:text><xsl:value-of select="$BODY_WIDTH"/><xsl:text>;</xsl:text></xsl:if>
    </xsl:variable>

    <link rel="stylesheet" href="/assets/rbccm/css/components/cta-band.css"/>

    <section class="rbccm-cta-band">
      <xsl:if test="normalize-space($INLINE_STYLE) != ''">
        <xsl:attribute name="style"><xsl:value-of select="normalize-space($INLINE_STYLE)"/></xsl:attribute>
      </xsl:if>

      <div class="rbccm-cta-band__inner">

        <!-- Eyebrow (optional). Only rendered when the Datum is
             non-empty. data-json="eyebrow" so the runtime binder
             can hydrate at preview time. -->
        <xsl:if test="$EYEBROW != ''">
          <p class="rbccm-cta-band__eyebrow" data-json="eyebrow">
            <xsl:value-of select="$EYEBROW"/>
          </p>
        </xsl:if>

        <!-- Heading — split into lead (white) + highlight (yellow).
             Both spans carry data-json bindings. The &#160; between
             them preserves the space visually so the runtime binder
             can swap either half without collapsing the join. -->
        <h2 class="rbccm-cta-band__heading">
          <span class="rbccm-cta-band__heading-lead" data-json="headingLead"><xsl:value-of select="$HEADING_LEAD"/></span>
          <xsl:text>&#160;</xsl:text>
          <span class="rbccm-cta-band__heading-highlight" data-json="headingHighlight"><xsl:value-of select="$HEADING_HIGHLIGHT"/></span>
        </h2>

        <!-- Body copy. data-json-html allows inline emphasis /
             italic / links in the JSON body without escaping. -->
        <p class="rbccm-cta-band__body" data-json-html="body">
          <xsl:value-of select="$BODY" disable-output-escaping="yes"/>
        </p>

        <!-- Yellow pill CTA. Arrow SVG matches the byte-identical
             glyph used in MAAS+MATA and US Credentials so the
             component drops in visually identical on either page. -->
        <a class="rbccm-cta-band__cta" data-json-attr-href="cta.href">
          <xsl:attribute name="href"><xsl:value-of select="$CTA_HREF"/></xsl:attribute>
          <span data-json="cta.label"><xsl:value-of select="$CTA_LABEL"/></span>
          <svg class="rbccm-cta-band__cta-icon" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden="true" focusable="false">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.4375 11.5C1.4375 11.3094 1.51323 11.1266 1.64802 10.9918C1.78281 10.857 1.96563 10.7812 2.15625 10.7812H19.1087L14.5849 6.25887C14.4499 6.12391 14.3741 5.94086 14.3741 5.74999C14.3741 5.55913 14.4499 5.37608 14.5849 5.24112C14.7198 5.10616 14.9029 5.03033 15.0938 5.03033C15.2846 5.03033 15.4677 5.10616 15.6026 5.24112L21.3526 10.9911C21.4196 11.0579 21.4727 11.1372 21.5089 11.2245C21.5451 11.3118 21.5638 11.4055 21.5638 11.5C21.5638 11.5945 21.5451 11.6881 21.5089 11.7755C21.4727 11.8628 21.4196 11.9421 21.3526 12.0089L15.6026 17.7589C15.4677 17.8938 15.2846 17.9696 15.0938 17.9696C14.9029 17.9696 14.7198 17.8938 14.5849 17.7589C14.4499 17.6239 14.3741 17.4409 14.3741 17.25C14.3741 17.0591 14.4499 16.8761 14.5849 16.7411L19.1087 12.2187H2.15625C1.96563 12.2187 1.78281 12.143 1.64802 12.0082C1.51323 11.8734 1.4375 11.6906 1.4375 11.5Z" fill="currentColor"/>
          </svg>
        </a>

      </div>
    </section>

  </xsl:template>
</xsl:stylesheet>
