<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="no" />

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl" />
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl" />

  <!-- ============================================================
       PROPERTY VARIABLES
       Every Datum is read into a named variable so the template
       body stays readable. String Datums get normalize-space to
       trim TinyMCE whitespace; Textareas keep whitespace as-is
       (multi-paragraph copy stays intact).
       ============================================================ -->

  <!-- Asset cache-buster — sourced from the AssetVersion Datum in
       Properties. Appended as ?v=… to every <link>/<script> URL below
       so browsers/CDN treat the file as new after a deploy. Bump the
       Datum value (format YYYY-MM-DD-HHMM recommended) whenever a new
       maas-mata.css, maas-mata.js, or rbccm-json-bind.js is deployed. -->
  <xsl:variable name="ASSET_VERSION" select="normalize-space(/Properties/Datum[@ID='AssetVersion'])" />

  <!-- Hero -->
  <xsl:variable name="HERO_EYEBROW"        select="/Properties/Datum[@ID='HeroEyebrow']" />
  <xsl:variable name="HERO_TITLE_1"        select="/Properties/Datum[@ID='HeroTitleLine1']" />
  <xsl:variable name="HERO_TITLE_2"        select="/Properties/Datum[@ID='HeroTitleLine2']" />
  <xsl:variable name="HERO_SUBTITLE"       select="/Properties/Datum[@ID='HeroSubtitle']" />
  <xsl:variable name="HERO_CTA_LABEL"      select="/Properties/Datum[@ID='HeroCtaLabel']" />
  <xsl:variable name="HERO_CTA_HREF"       select="/Properties/Datum[@ID='HeroCtaHref']" />

  <!-- Chart Card -->
  <xsl:variable name="CHART_IMG"   select="/Properties/Datum[@ID='ChartImage']" />
  <xsl:variable name="CHART_IMG_ALT"       select="/Properties/Datum[@ID='ChartImageAlt']" />
  <xsl:variable name="CHART_BC_ACCOUNT"    select="normalize-space(/Properties/Datum[@ID='ChartBrightcoveAccount'])" />
  <xsl:variable name="CHART_BC_PLAYER"     select="normalize-space(/Properties/Datum[@ID='ChartBrightcovePlayer'])" />
  <xsl:variable name="CHART_BC_VIDEO"      select="normalize-space(/Properties/Datum[@ID='ChartBrightcoveVideoId'])" />
  <xsl:variable name="CHART_HAS_VIDEO"     select="$CHART_BC_VIDEO != ''" />

  <!-- Video modal iframe URL. Built from the three Brightcove Datums
       when they're all set. Falls back to the FPO Brightcove video
       so the modal always has something to play while marketing
       lines up the real one. Account and Player IDs are hidden in
       the CMS — only the Video ID is editable there. -->
  <xsl:variable name="BC_IFRAME_SRC">
    <xsl:choose>
      <xsl:when test="$CHART_BC_VIDEO != '' and $CHART_BC_ACCOUNT != ''">
        <xsl:text>https://players.brightcove.net/</xsl:text>
        <xsl:value-of select="$CHART_BC_ACCOUNT" />
        <xsl:text>/</xsl:text>
        <xsl:choose>
          <xsl:when test="$CHART_BC_PLAYER != ''"><xsl:value-of select="$CHART_BC_PLAYER" /></xsl:when>
          <xsl:otherwise>default</xsl:otherwise>
        </xsl:choose>
        <xsl:text>_default/index.html?videoId=</xsl:text>
        <xsl:value-of select="$CHART_BC_VIDEO" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>https://players.brightcove.net/6021289101001/VyvCc9BZx_default/index.html?videoId=6385114247112</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- New Standard -->
  <xsl:variable name="NS_LEAD"             select="/Properties/Datum[@ID='NewStandardHeadingLead']" />
  <xsl:variable name="NS_HIGHLIGHT"        select="/Properties/Datum[@ID='NewStandardHeadingHighlight']" />
  <xsl:variable name="NS_ACCENT"           select="/Properties/Datum[@ID='NewStandardHeadingAccent']" />
  <xsl:variable name="NS_CTA_LABEL"        select="/Properties/Datum[@ID='NewStandardCtaLabel']" />
  <xsl:variable name="NS_CTA_HREF"         select="/Properties/Datum[@ID='NewStandardCtaHref']" />

  <!-- Platforms -->
  <xsl:variable name="PLATFORMS_EYEBROW"   select="/Properties/Datum[@ID='PlatformsEyebrow']" />
  <xsl:variable name="PLATFORMS_HEADING"   select="/Properties/Datum[@ID='PlatformsHeading']" />

  <!-- Innovation Era -->
  <xsl:variable name="INV_HEADING"         select="/Properties/Datum[@ID='InnovationEraHeading']" />
  <xsl:variable name="INV_BODY"            select="/Properties/Datum[@ID='InnovationEraBody']" />

  <!-- MATA Capabilities -->
  <xsl:variable name="MC_EYEBROW"          select="/Properties/Datum[@ID='MataCapEyebrow']" />
  <xsl:variable name="MC_HEADING"          select="/Properties/Datum[@ID='MataCapHeading']" />
  <xsl:variable name="MC_SUBHEADING"       select="/Properties/Datum[@ID='MataCapSubheading']" />
  <xsl:variable name="MC_INDEX_ICON"       select="/Properties/Datum[@ID='IndexEventsIcon']/Option[@Selected='true']/Value" />
  <xsl:variable name="MC_INDEX_TITLE"      select="/Properties/Datum[@ID='IndexEventsTitle']" />
  <xsl:variable name="MC_INDEX_SUBTITLE"   select="/Properties/Datum[@ID='IndexEventsSubtitle']" />
  <xsl:variable name="MC_INDEX_BODY"       select="/Properties/Datum[@ID='IndexEventsBody']" />

  <!-- Market Insights -->
  <xsl:variable name="MK_EYEBROW"          select="/Properties/Datum[@ID='MarketInsightsEyebrow']" />
  <xsl:variable name="MK_HEADING"          select="/Properties/Datum[@ID='MarketInsightsHeading']" />

  <!-- Demo CTA -->
  <xsl:variable name="DEMO_EYEBROW"        select="/Properties/Datum[@ID='DemoEyebrow']" />
  <xsl:variable name="DEMO_PREFIX"         select="/Properties/Datum[@ID='DemoHeadlinePrefix']" />
  <xsl:variable name="DEMO_HIGHLIGHT"      select="/Properties/Datum[@ID='DemoHeadlineHighlight']" />
  <xsl:variable name="DEMO_BODY"           select="/Properties/Datum[@ID='DemoBody']" />
  <xsl:variable name="DEMO_CTA_LABEL"      select="/Properties/Datum[@ID='DemoCtaLabel']" />
  <xsl:variable name="DEMO_CTA_HREF"       select="/Properties/Datum[@ID='DemoCtaHref']" />

  <!-- Newsletter -->
  <xsl:variable name="NL_HEADING"          select="/Properties/Datum[@ID='NewsletterHeading']" />
  <xsl:variable name="NL_BODY"             select="/Properties/Datum[@ID='NewsletterBody']" />
  <xsl:variable name="NL_MARKETO_BASE"     select="normalize-space(/Properties/Datum[@ID='NewsletterMarketoBaseUrl'])" />
  <xsl:variable name="NL_MARKETO_MUNCHKIN" select="normalize-space(/Properties/Datum[@ID='NewsletterMarketoMunchkinId'])" />
  <xsl:variable name="NL_MARKETO_FORM"     select="normalize-space(/Properties/Datum[@ID='NewsletterMarketoFormId'])" />
  <xsl:variable name="NL_LINKEDIN_LABEL"   select="/Properties/Datum[@ID='NewsletterLinkedinLabel']" />
  <xsl:variable name="NL_LINKEDIN_HREF"    select="/Properties/Datum[@ID='NewsletterLinkedinHref']" />
  <xsl:variable name="NL_CONSENT"          select="/Properties/Datum[@ID='NewsletterConsent']" />
  <xsl:variable name="NL_PRIVACY_LABEL"    select="/Properties/Datum[@ID='NewsletterPrivacyLabel']" />
  <xsl:variable name="NL_PRIVACY_HREF"     select="/Properties/Datum[@ID='NewsletterPrivacyHref']" />
  <xsl:variable name="NL_SUBMIT_LABEL"     select="/Properties/Datum[@ID='NewsletterSubmitLabel']" />

  <!-- Appearance -->
  <xsl:variable name="COLOR_SCHEME">
    <xsl:choose>
      <xsl:when test="translate(normalize-space(/Properties/Datum[@ID='ColorScheme']/Option[@Selected='true']/Value), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'dark'">dark</xsl:when>
      <xsl:otherwise>default</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Awards eyebrow (top-level Datum). -->
  <xsl:variable name="AWD_EYEBROW" select="/Properties/Datum[@ID='AwardsEyebrow']" />

  <!-- New Standard body paragraphs (3 fixed slots) -->
  <xsl:variable name="NS_P1" select="/Properties/Datum[@ID='NewStandardParagraph1']" />
  <xsl:variable name="NS_P2" select="/Properties/Datum[@ID='NewStandardParagraph2']" />
  <xsl:variable name="NS_P3" select="/Properties/Datum[@ID='NewStandardParagraph3']" />

  <!-- Awards (3 fixed slots) -->
  <xsl:variable name="AWD1_YEAR"   select="/Properties/Datum[@ID='Award1Year']"   />
  <xsl:variable name="AWD1_TITLE"  select="/Properties/Datum[@ID='Award1Title']"  />
  <xsl:variable name="AWD1_ISSUER" select="/Properties/Datum[@ID='Award1Issuer']" />
  <xsl:variable name="AWD2_YEAR"   select="/Properties/Datum[@ID='Award2Year']"   />
  <xsl:variable name="AWD2_TITLE"  select="/Properties/Datum[@ID='Award2Title']"  />
  <xsl:variable name="AWD2_ISSUER" select="/Properties/Datum[@ID='Award2Issuer']" />
  <xsl:variable name="AWD3_YEAR"   select="/Properties/Datum[@ID='Award3Year']"   />
  <xsl:variable name="AWD3_TITLE"  select="/Properties/Datum[@ID='Award3Title']"  />
  <xsl:variable name="AWD3_ISSUER" select="/Properties/Datum[@ID='Award3Issuer']" />

  <!-- Platform cards (2 fixed slots) -->
  <xsl:variable name="PLT1_THEME"   select="/Properties/Datum[@ID='Platform1Theme']/Option[@Selected='true']/Value" />
  <xsl:variable name="PLT1_EYEBROW" select="/Properties/Datum[@ID='Platform1Eyebrow']" />
  <xsl:variable name="PLT1_TITLE"   select="/Properties/Datum[@ID='Platform1Title']" />
  <xsl:variable name="PLT1_BODY"    select="/Properties/Datum[@ID='Platform1Body']" />
  <xsl:variable name="PLT1_B1"      select="/Properties/Datum[@ID='Platform1Bullet1']" />
  <xsl:variable name="PLT1_B2"      select="/Properties/Datum[@ID='Platform1Bullet2']" />
  <xsl:variable name="PLT1_B3"      select="/Properties/Datum[@ID='Platform1Bullet3']" />
  <xsl:variable name="PLT1_B4"      select="/Properties/Datum[@ID='Platform1Bullet4']" />
  <xsl:variable name="PLT1_B5"      select="/Properties/Datum[@ID='Platform1Bullet5']" />
  <xsl:variable name="PLT2_THEME"   select="/Properties/Datum[@ID='Platform2Theme']/Option[@Selected='true']/Value" />
  <xsl:variable name="PLT2_EYEBROW" select="/Properties/Datum[@ID='Platform2Eyebrow']" />
  <xsl:variable name="PLT2_TITLE"   select="/Properties/Datum[@ID='Platform2Title']" />
  <xsl:variable name="PLT2_BODY"    select="/Properties/Datum[@ID='Platform2Body']" />
  <xsl:variable name="PLT2_B1"      select="/Properties/Datum[@ID='Platform2Bullet1']" />
  <xsl:variable name="PLT2_B2"      select="/Properties/Datum[@ID='Platform2Bullet2']" />
  <xsl:variable name="PLT2_B3"      select="/Properties/Datum[@ID='Platform2Bullet3']" />
  <xsl:variable name="PLT2_B4"      select="/Properties/Datum[@ID='Platform2Bullet4']" />
  <xsl:variable name="PLT2_B5"      select="/Properties/Datum[@ID='Platform2Bullet5']" />

  <!-- Innovation features (3 fixed slots) -->
  <xsl:variable name="F1_NUM"   select="/Properties/Datum[@ID='Feature1Number']" />
  <xsl:variable name="F1_TITLE" select="/Properties/Datum[@ID='Feature1Title']"  />
  <xsl:variable name="F1_BODY"  select="/Properties/Datum[@ID='Feature1Body']"   />
  <xsl:variable name="F2_NUM"   select="/Properties/Datum[@ID='Feature2Number']" />
  <xsl:variable name="F2_TITLE" select="/Properties/Datum[@ID='Feature2Title']"  />
  <xsl:variable name="F2_BODY"  select="/Properties/Datum[@ID='Feature2Body']"   />
  <xsl:variable name="F3_NUM"   select="/Properties/Datum[@ID='Feature3Number']" />
  <xsl:variable name="F3_TITLE" select="/Properties/Datum[@ID='Feature3Title']"  />
  <xsl:variable name="F3_BODY"  select="/Properties/Datum[@ID='Feature3Body']"   />

  <!-- MATA capability cards (3 fixed slots) -->
  <xsl:variable name="C1_ICON"     select="/Properties/Datum[@ID='Card1Icon']/Option[@Selected='true']/Value" />
  <xsl:variable name="C1_TITLE"    select="/Properties/Datum[@ID='Card1Title']"    />
  <xsl:variable name="C1_SUBTITLE" select="/Properties/Datum[@ID='Card1Subtitle']" />
  <xsl:variable name="C1_BODY"     select="/Properties/Datum[@ID='Card1Body']"     />
  <xsl:variable name="C2_ICON"     select="/Properties/Datum[@ID='Card2Icon']/Option[@Selected='true']/Value" />
  <xsl:variable name="C2_TITLE"    select="/Properties/Datum[@ID='Card2Title']"    />
  <xsl:variable name="C2_SUBTITLE" select="/Properties/Datum[@ID='Card2Subtitle']" />
  <xsl:variable name="C2_BODY"     select="/Properties/Datum[@ID='Card2Body']"     />
  <xsl:variable name="C3_ICON"     select="/Properties/Datum[@ID='Card3Icon']/Option[@Selected='true']/Value" />
  <xsl:variable name="C3_TITLE"    select="/Properties/Datum[@ID='Card3Title']"    />
  <xsl:variable name="C3_SUBTITLE" select="/Properties/Datum[@ID='Card3Subtitle']" />
  <xsl:variable name="C3_BODY"     select="/Properties/Datum[@ID='Card3Body']"     />

  <!-- Market insight (1 fixed slot) -->
  <xsl:variable name="INS1_EYEBROW"   select="/Properties/Datum[@ID='Insight1Eyebrow']" />
  <xsl:variable name="INS1_TITLE"     select="/Properties/Datum[@ID='Insight1Title']" />
  <xsl:variable name="INS1_BODY"      select="/Properties/Datum[@ID='Insight1Body']" />
  <xsl:variable name="INS1_CTA_LABEL" select="/Properties/Datum[@ID='Insight1CtaLabel']" />
  <xsl:variable name="INS1_CTA_HREF"  select="/Properties/Datum[@ID='Insight1CtaHref']" />
  <xsl:variable name="INS1_IMAGE"     select="/Properties/Datum[@ID='Insight1Image']" />
  <xsl:variable name="INS1_IMAGE_ALT" select="/Properties/Datum[@ID='Insight1ImageAlt']" />
  <xsl:variable name="INS2_EYEBROW"   select="/Properties/Datum[@ID='Insight2Eyebrow']" />
  <xsl:variable name="INS2_TITLE"     select="/Properties/Datum[@ID='Insight2Title']" />
  <xsl:variable name="INS2_BODY"      select="/Properties/Datum[@ID='Insight2Body']" />
  <xsl:variable name="INS2_CTA_LABEL" select="/Properties/Datum[@ID='Insight2CtaLabel']" />
  <xsl:variable name="INS2_CTA_HREF"  select="/Properties/Datum[@ID='Insight2CtaHref']" />
  <xsl:variable name="INS2_IMAGE"     select="/Properties/Datum[@ID='Insight2Image']" />
  <xsl:variable name="INS2_IMAGE_ALT" select="/Properties/Datum[@ID='Insight2ImageAlt']" />
  <xsl:variable name="INS3_EYEBROW"   select="/Properties/Datum[@ID='Insight3Eyebrow']" />
  <xsl:variable name="INS3_TITLE"     select="/Properties/Datum[@ID='Insight3Title']" />
  <xsl:variable name="INS3_BODY"      select="/Properties/Datum[@ID='Insight3Body']" />
  <xsl:variable name="INS3_CTA_LABEL" select="/Properties/Datum[@ID='Insight3CtaLabel']" />
  <xsl:variable name="INS3_CTA_HREF"  select="/Properties/Datum[@ID='Insight3CtaHref']" />
  <xsl:variable name="INS3_IMAGE"     select="/Properties/Datum[@ID='Insight3Image']" />
  <xsl:variable name="INS3_IMAGE_ALT" select="/Properties/Datum[@ID='Insight3ImageAlt']" />

  <!-- Newsletter form fields (5 fixed slots) -->
  <xsl:variable name="FLD1_LABEL" select="/Properties/Datum[@ID='Field1Label']" />
  <xsl:variable name="FLD1_NAME"  select="/Properties/Datum[@ID='Field1Name']"  />
  <xsl:variable name="FLD1_TYPE"  select="/Properties/Datum[@ID='Field1Type']/Option[@Selected='true']/Value" />
  <xsl:variable name="FLD2_LABEL" select="/Properties/Datum[@ID='Field2Label']" />
  <xsl:variable name="FLD2_NAME"  select="/Properties/Datum[@ID='Field2Name']"  />
  <xsl:variable name="FLD2_TYPE"  select="/Properties/Datum[@ID='Field2Type']/Option[@Selected='true']/Value" />
  <xsl:variable name="FLD3_LABEL" select="/Properties/Datum[@ID='Field3Label']" />
  <xsl:variable name="FLD3_NAME"  select="/Properties/Datum[@ID='Field3Name']"  />
  <xsl:variable name="FLD3_TYPE"  select="/Properties/Datum[@ID='Field3Type']/Option[@Selected='true']/Value" />
  <xsl:variable name="FLD4_LABEL" select="/Properties/Datum[@ID='Field4Label']" />
  <xsl:variable name="FLD4_NAME"  select="/Properties/Datum[@ID='Field4Name']"  />
  <xsl:variable name="FLD4_TYPE"  select="/Properties/Datum[@ID='Field4Type']/Option[@Selected='true']/Value" />
  <xsl:variable name="FLD5_LABEL" select="/Properties/Datum[@ID='Field5Label']" />
  <xsl:variable name="FLD5_NAME"  select="/Properties/Datum[@ID='Field5Name']"  />
  <xsl:variable name="FLD5_TYPE"  select="/Properties/Datum[@ID='Field5Type']/Option[@Selected='true']/Value" />

  <!-- SEO / JSON-LD — single Datum, pasted verbatim by whoever
       owns SEO. XSL outputs it inside a <script type="application/ld+json">
       tag without escaping so the JSON survives unchanged. -->
  <xsl:variable name="SEO_JSONLD" select="/Properties/Datum[@ID='SeoJsonLd']" />



  <!-- ============================================================
       MAIN TEMPLATE
       ============================================================ -->
  <xsl:template match="/">

    <!-- animate.css from CDN (drives fade + zoom entrances) + our
         own component stylesheet. Local keyframes are duplicated
         inside maas-mata.css as a fallback so the animations still
         run if the CDN is ever blocked. -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <link rel="stylesheet">
      <xsl:attribute name="href">/assets/rbccm/css/pages/maas-mata.css?v=<xsl:value-of select="$ASSET_VERSION" /></xsl:attribute>
    </link>

    <!-- JSON-LD structured data. Whole @graph block lives in
         the SeoJsonLd Datum. When SEO delivers a new schema, paste
         it into that field verbatim — no XSL edit needed. -->
    <script type="application/ld+json">
      <xsl:value-of select="$SEO_JSONLD" disable-output-escaping="yes" />
    </script>


    <div class="rbccm-maas-mata" id="rbccm-mm-page">
      <xsl:if test="$COLOR_SCHEME = 'dark'">
        <xsl:attribute name="data-color-scheme">dark</xsl:attribute>
      </xsl:if>


      <!-- ===== SVG SPRITE =====
           Icon symbols referenced by MATA capability cards via
           <use href="#mata-cap-icon-{key}">. Full sprite lives in
           maas-mata.html; the four symbols authors can pick
           between are equities, fx, futures, and info. -->
      <svg width="0" height="0" style="position:absolute;overflow:hidden;" aria-hidden="true" focusable="false">
        <defs>
          <symbol id="mata-cap-icon-equities" viewBox="0 0 27 30">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.00167582 21.5625C0.00167582 21.8111 0.100448 22.0496 0.276263 22.2254C0.452079 22.4012 0.690535 22.5 0.939176 22.5H23.0511L17.1504 28.3987C16.9744 28.5748 16.8755 28.8135 16.8755 29.0625C16.8755 29.3114 16.9744 29.5502 17.1504 29.7262C17.3265 29.9023 17.5652 30.0011 17.8142 30.0011C18.0631 30.0011 18.3019 29.9023 18.4779 29.7262L25.9779 22.2262C26.0652 22.1391 26.1345 22.0357 26.1818 21.9218C26.229 21.8079 26.2534 21.6858 26.2534 21.5625C26.2534 21.4392 26.229 21.317 26.1818 21.2032C26.1345 21.0893 26.0652 20.9858 25.9779 20.8987L18.4779 13.3987C18.3019 13.2227 18.0631 13.1238 17.8142 13.1238C17.5652 13.1238 17.3265 13.2227 17.1504 13.3987C16.9744 13.5748 16.8755 13.8135 16.8755 14.0625C16.8755 14.3114 16.9744 14.5502 17.1504 14.7262L23.0511 20.625H0.939176C0.690535 20.625 0.452079 20.7237 0.276263 20.8996C0.100448 21.0754 0.00167582 21.3138 0.00167582 21.5625ZM26.2517 8.43746C26.2517 8.6861 26.1529 8.92456 25.9771 9.10038C25.8013 9.27619 25.5628 9.37496 25.3142 9.37496H3.2023L9.10293 15.2737C9.19009 15.3609 9.25923 15.4644 9.30641 15.5782C9.35358 15.6921 9.37786 15.8142 9.37786 15.9375C9.37786 16.0607 9.35358 16.1828 9.30641 16.2967C9.25923 16.4106 9.19009 16.514 9.10293 16.6012C9.01576 16.6884 8.91228 16.7575 8.79839 16.8047C8.68451 16.8519 8.56245 16.8761 8.43918 16.8761C8.31591 16.8761 8.19384 16.8519 8.07996 16.8047C7.96607 16.7575 7.86259 16.6884 7.77543 16.6012L0.275426 9.10121C0.18812 9.01413 0.118852 8.91067 0.0715898 8.79678C0.0243277 8.68288 0 8.56078 0 8.43746C0 8.31415 0.0243277 8.19205 0.0715898 8.07815C0.118852 7.96425 0.18812 7.8608 0.275426 7.77371L7.77543 0.273714C7.95146 0.0976761 8.19022 -0.0012207 8.43918 -0.0012207C8.68813 -0.0012207 8.92689 0.0976761 9.10293 0.273714C9.27896 0.449751 9.37786 0.688509 9.37786 0.937464C9.37786 1.18642 9.27896 1.42518 9.10293 1.60121L3.2023 7.49996H25.3142C25.5628 7.49996 25.8013 7.59874 25.9771 7.77455C26.1529 7.95037 26.2517 8.18882 26.2517 8.43746Z" fill="#FFC72C"/>
      </symbol>
          <symbol id="mata-cap-icon-fx" viewBox="0 0 30 23">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.25 2.8125C11.25 2.06658 11.5463 1.35121 12.0738 0.823762C12.6012 0.296316 13.3166 0 14.0625 0H15.9375C16.6834 0 17.3988 0.296316 17.9262 0.823762C18.4537 1.35121 18.75 2.06658 18.75 2.8125V4.6875C18.75 5.43342 18.4537 6.14879 17.9262 6.67624C17.3988 7.20368 16.6834 7.5 15.9375 7.5V9.375H26.25C26.4986 9.375 26.7371 9.47377 26.9129 9.64959C27.0887 9.8254 27.1875 10.0639 27.1875 10.3125V12.1875C27.1875 12.4361 27.0887 12.6746 26.9129 12.8504C26.7371 13.0262 26.4986 13.125 26.25 13.125C26.0014 13.125 25.7629 13.0262 25.5871 12.8504C25.4113 12.6746 25.3125 12.4361 25.3125 12.1875V11.25H15.9375V12.1875C15.9375 12.4361 15.8387 12.6746 15.6629 12.8504C15.4871 13.0262 15.2486 13.125 15 13.125C14.7514 13.125 14.5129 13.0262 14.3371 12.8504C14.1613 12.6746 14.0625 12.4361 14.0625 12.1875V11.25H4.6875V12.1875C4.6875 12.4361 4.58873 12.6746 4.41291 12.8504C4.2371 13.0262 3.99864 13.125 3.75 13.125C3.50136 13.125 3.2629 13.0262 3.08709 12.8504C2.91127 12.6746 2.8125 12.4361 2.8125 12.1875V10.3125C2.8125 10.0639 2.91127 9.8254 3.08709 9.64959C3.2629 9.47377 3.50136 9.375 3.75 9.375H14.0625V7.5C13.3166 7.5 12.6012 7.20368 12.0738 6.67624C11.5463 6.14879 11.25 5.43342 11.25 4.6875V2.8125ZM15.9375 5.625C16.1861 5.625 16.4246 5.52623 16.6004 5.35041C16.7762 5.1746 16.875 4.93614 16.875 4.6875V2.8125C16.875 2.56386 16.7762 2.3254 16.6004 2.14959C16.4246 1.97377 16.1861 1.875 15.9375 1.875H14.0625C13.8139 1.875 13.5754 1.97377 13.3996 2.14959C13.2238 2.3254 13.125 2.56386 13.125 2.8125V4.6875C13.125 4.93614 13.2238 5.1746 13.3996 5.35041C13.5754 5.52623 13.8139 5.625 14.0625 5.625H15.9375ZM0 17.8125C0 17.0666 0.296316 16.3512 0.823762 15.8238C1.35121 15.2963 2.06658 15 2.8125 15H4.6875C5.43342 15 6.14879 15.2963 6.67624 15.8238C7.20368 16.3512 7.5 17.0666 7.5 17.8125V19.6875C7.5 20.4334 7.20368 21.1488 6.67624 21.6762C6.14879 22.2037 5.43342 22.5 4.6875 22.5H2.8125C2.06658 22.5 1.35121 22.2037 0.823762 21.6762C0.296316 21.1488 0 20.4334 0 19.6875L0 17.8125ZM2.8125 16.875C2.56386 16.875 2.3254 16.9738 2.14959 17.1496C1.97377 17.3254 1.875 17.5639 1.875 17.8125V19.6875C1.875 19.9361 1.97377 20.1746 2.14959 20.3504C2.3254 20.5262 2.56386 20.625 2.8125 20.625H4.6875C4.93614 20.625 5.1746 20.5262 5.35041 20.3504C5.52623 20.1746 5.625 19.9361 5.625 19.6875V17.8125C5.625 17.5639 5.52623 17.3254 5.35041 17.1496C5.1746 16.9738 4.93614 16.875 4.6875 16.875H2.8125ZM11.25 17.8125C11.25 17.0666 11.5463 16.3512 12.0738 15.8238C12.6012 15.2963 13.3166 15 14.0625 15H15.9375C16.6834 15 17.3988 15.2963 17.9262 15.8238C18.4537 16.3512 18.75 17.0666 18.75 17.8125V19.6875C18.75 20.4334 18.4537 21.1488 17.9262 21.6762C17.3988 22.2037 16.6834 22.5 15.9375 22.5H14.0625C13.3166 22.5 12.6012 22.2037 12.0738 21.6762C11.5463 21.1488 11.25 20.4334 11.25 19.6875V17.8125ZM14.0625 16.875C13.8139 16.875 13.5754 16.9738 13.3996 17.1496C13.2238 17.3254 13.125 17.5639 13.125 17.8125V19.6875C13.125 19.9361 13.2238 20.1746 13.3996 20.3504C13.5754 20.5262 13.8139 20.625 14.0625 20.625H15.9375C16.1861 20.625 16.4246 20.5262 16.6004 20.3504C16.7762 20.1746 16.875 19.9361 16.875 19.6875V17.8125C16.875 17.5639 16.7762 17.3254 16.6004 17.1496C16.4246 16.9738 16.1861 16.875 15.9375 16.875H14.0625ZM22.5 17.8125C22.5 17.0666 22.7963 16.3512 23.3238 15.8238C23.8512 15.2963 24.5666 15 25.3125 15H27.1875C27.9334 15 28.6488 15.2963 29.1762 15.8238C29.7037 16.3512 30 17.0666 30 17.8125V19.6875C30 20.4334 29.7037 21.1488 29.1762 21.6762C28.6488 22.2037 27.9334 22.5 27.1875 22.5H25.3125C24.5666 22.5 23.8512 22.2037 23.3238 21.6762C22.7963 21.1488 22.5 20.4334 22.5 19.6875V17.8125ZM25.3125 16.875C25.0639 16.875 24.8254 16.9738 24.6496 17.1496C24.4738 17.3254 24.375 17.5639 24.375 17.8125V19.6875C24.375 19.9361 24.4738 20.1746 24.6496 20.3504C24.8254 20.5262 25.0639 20.625 25.3125 20.625H27.1875C27.4361 20.625 27.6746 20.5262 27.8504 20.3504C28.0262 20.1746 28.125 19.9361 28.125 19.6875V17.8125C28.125 17.5639 28.0262 17.3254 27.8504 17.1496C27.6746 16.9738 27.4361 16.875 27.1875 16.875H25.3125Z" fill="#FFC72C"/>
      </symbol>
          <symbol id="mata-cap-icon-futures" viewBox="0 0 30 30">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1.875V28.125H30V30H0V0ZM18.75 6.5625C18.75 6.31386 18.8488 6.0754 19.0246 5.89959C19.2004 5.72377 19.4389 5.625 19.6875 5.625H27.1875C27.4361 5.625 27.6746 5.72377 27.8504 5.89959C28.0262 6.0754 28.125 6.31386 28.125 6.5625V14.0625C28.125 14.3111 28.0262 14.5496 27.8504 14.7254C27.6746 14.9012 27.4361 15 27.1875 15C26.9389 15 26.7004 14.9012 26.5246 14.7254C26.3488 14.5496 26.25 14.3111 26.25 14.0625V9.1875L19.4756 17.4694C19.3927 17.5706 19.2895 17.6533 19.1727 17.7123C19.0558 17.7712 18.9279 17.805 18.7972 17.8116C18.6666 17.8181 18.5359 17.7972 18.4138 17.7502C18.2917 17.7032 18.1807 17.6312 18.0881 17.5388L13.2375 12.6881L6.3825 22.1137C6.23254 22.3044 6.01451 22.4296 5.77422 22.4629C5.53393 22.4961 5.29009 22.435 5.09395 22.2922C4.8978 22.1495 4.76462 21.9363 4.72239 21.6974C4.68017 21.4585 4.73218 21.2126 4.8675 21.0113L12.3675 10.6987C12.4471 10.5891 12.5495 10.498 12.6677 10.4317C12.7859 10.3655 12.9171 10.3256 13.0522 10.3149C13.1873 10.3042 13.3231 10.3229 13.4502 10.3698C13.5774 10.4166 13.6929 10.4905 13.7888 10.5862L18.6806 15.48L25.2094 7.5H19.6875C19.4389 7.5 19.2004 7.40123 19.0246 7.22541C18.8488 7.0496 18.75 6.81114 18.75 6.5625Z" fill="#FFC72C"/>
      </symbol>
          <symbol id="mata-cap-icon-info" viewBox="0 0 30 30">
        <path d="M15 28.125C11.519 28.125 8.18064 26.7422 5.71922 24.2808C3.25781 21.8194 1.875 18.481 1.875 15C1.875 11.519 3.25781 8.18064 5.71922 5.71922C8.18064 3.25781 11.519 1.875 15 1.875C18.481 1.875 21.8194 3.25781 24.2808 5.71922C26.7422 8.18064 28.125 11.519 28.125 15C28.125 18.481 26.7422 21.8194 24.2808 24.2808C21.8194 26.7422 18.481 28.125 15 28.125ZM15 30C18.9782 30 22.7936 28.4196 25.6066 25.6066C28.4196 22.7936 30 18.9782 30 15C30 11.0218 28.4196 7.20644 25.6066 4.3934C22.7936 1.58035 18.9782 0 15 0C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15C0 18.9782 1.58035 22.7936 4.3934 25.6066C7.20644 28.4196 11.0218 30 15 30Z" fill="#FFC72C"/>
        <path d="M16.7437 12.3525L12.4499 12.8906L12.2962 13.6031L13.1399 13.7587C13.6912 13.89 13.7999 14.0887 13.6799 14.6381L12.2962 21.1406C11.9324 22.8225 12.493 23.6137 13.8112 23.6137C14.833 23.6137 16.0199 23.1412 16.558 22.4925L16.723 21.7125C16.348 22.0425 15.8005 22.1737 15.4368 22.1737C14.9212 22.1737 14.7337 21.8119 14.8668 21.1744L16.7437 12.3525ZM16.8749 8.4375C16.8749 8.93478 16.6774 9.41169 16.3257 9.76332C15.9741 10.115 15.4972 10.3125 14.9999 10.3125C14.5026 10.3125 14.0257 10.115 13.6741 9.76332C13.3225 9.41169 13.1249 8.93478 13.1249 8.4375C13.1249 7.94022 13.3225 7.46331 13.6741 7.11167C14.0257 6.76004 14.5026 6.5625 14.9999 6.5625C15.4972 6.5625 15.9741 6.76004 16.3257 7.11167C16.6774 7.46331 16.8749 7.94022 16.8749 8.4375Z" fill="#FFC72C"/>
      </symbol>
        </defs>
      </svg>


      <!-- ═══ 1. HERO ═════════════════════════════════════════ -->
      <section class="rbccm-maas-mata__hero" aria-label="Hero">
        <div class="rbccm-maas-mata__container">
          <h1 class="rbccm-maas-mata__hero-eyebrow" data-animate-hero="fadeInDown" data-animate-delay="0" data-json="hero.eyebrow">
            <xsl:value-of select="$HERO_EYEBROW" />
          </h1>
          <p class="rbccm-maas-mata__hero-title" data-animate-hero="fadeInUp" data-animate-delay="150" data-json-list="hero.headlineLines">
            <template><span class="rbccm-maas-mata__hero-title-line" data-json=""></span></template>
            <span class="rbccm-maas-mata__hero-title-line" data-json-list-fallback=""><xsl:value-of select="$HERO_TITLE_1" /></span>
            <span class="rbccm-maas-mata__hero-title-line" data-json-list-fallback=""><xsl:value-of select="$HERO_TITLE_2" /></span>
          </p>
          <p class="rbccm-maas-mata__hero-subtitle" data-animate-hero="fadeInUp" data-animate-delay="300" data-json-html="hero.subtitle">
            <xsl:value-of select="$HERO_SUBTITLE" disable-output-escaping="yes" />
          </p>
          <div class="rbccm-maas-mata__hero-actions" data-animate-hero="fadeInUp" data-animate-delay="450">
            <a class="rbccm-maas-mata__btn rbccm-maas-mata__btn--primary" data-json-attr-href="hero.primaryCta.href">
              <xsl:attribute name="href"><xsl:value-of select="$HERO_CTA_HREF" /></xsl:attribute>
              <span data-json="hero.primaryCta.label"><xsl:value-of select="$HERO_CTA_LABEL" /></span>
              <svg class="rbccm-maas-mata__btn-icon" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden="true" focusable="false">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.4375 11.4999C1.4375 11.3093 1.51323 11.1265 1.64802 10.9917C1.78281 10.8569 1.96563 10.7812 2.15625 10.7812H19.1087L14.5849 6.25881C14.4499 6.12384 14.3741 5.9408 14.3741 5.74993C14.3741 5.55907 14.4499 5.37602 14.5849 5.24106C14.7198 5.10609 14.9029 5.03027 15.0938 5.03027C15.2846 5.03027 15.4677 5.10609 15.6026 5.24106L21.3526 10.9911C21.4196 11.0578 21.4727 11.1371 21.5089 11.2245C21.5451 11.3118 21.5638 11.4054 21.5638 11.4999C21.5638 11.5945 21.5451 11.6881 21.5089 11.7754C21.4727 11.8627 21.4196 11.942 21.3526 12.0088L15.6026 17.7588C15.4677 17.8938 15.2846 17.9696 15.0938 17.9696C14.9029 17.9696 14.7198 17.8938 14.5849 17.7588C14.4499 17.6238 14.3741 17.4408 14.3741 17.2499C14.3741 17.0591 14.4499 16.876 14.5849 16.7411L19.1087 12.2187H2.15625C1.96563 12.2187 1.78281 12.143 1.64802 12.0082C1.51323 11.8734 1.4375 11.6906 1.4375 11.4999Z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </section>


      <!-- ═══ 2. CHART CARD ═══════════════════════════════════ -->
      <div class="rbccm-maas-mata__chart rbccm-maas-mata__chart-image" id="rbccm-mm-chart-image" data-animate-hero="fadeIn" data-animate-delay="600">
        <!-- Poster image: XSL fills src/alt from Datums on the live
             page; data-json-attr-* lets ?preview=draft rebind from
             chartCard.posterImage / .posterAlt in the CMS JSON. -->
        <img class="rbccm-maas-mata__chart-image-poster" data-json-attr-src="chartCard.posterImage" data-json-attr-alt="chartCard.posterAlt">
          <xsl:attribute name="src"><xsl:value-of select="$CHART_IMG" /></xsl:attribute>
          <xsl:attribute name="alt"><xsl:value-of select="$CHART_IMG_ALT" /></xsl:attribute>
        </img>
        <!-- Play button always renders so editors can see the UI in
             preview. The Brightcove attrs are set from Datums when
             filled; when empty, the modal opens with an empty iframe
             (useful for design review, not for a live launch). -->
        <!-- Play button — uses the site-standard Bootstrap modal
             (#herovideo below). data-toggle/data-target are handled
             by the page-shell's Bootstrap JS; nothing custom here. -->
        <button type="button" class="rbccm-maas-mata__chart-image-play" data-toggle="modal" data-target="#herovideo" aria-label="Play platform video" aria-haspopup="dialog" aria-controls="herovideo">
          <svg class="rbccm-maas-mata__chart-image-play-icon" width="56" height="56" viewBox="0 0 56 56" fill="currentColor" aria-hidden="true"><path d="M36.6843 28.4791L22.9275 36.4216L22.9275 20.5366L36.6843 28.4791Z"/></svg>
        </button>
      </div>


      <!-- ═══ DEEP-BAND WRAPPER (new-standard + awards + platforms) ═══ -->
      <div class="rbccm-maas-mata__dark-strip">

        <!-- 3. NEW STANDARD -->
        <section class="rbccm-maas-mata__new-standard" aria-label="A new standard for multi-asset trading">
          <div class="rbccm-maas-mata__container">
            <h2 class="rbccm-maas-mata__new-standard-heading" data-animate="fadeInUp">
              <span class="rbccm-maas-mata__new-standard-heading-lead" data-json="newStandard.headingLead"><xsl:value-of select="$NS_LEAD" /></span>
              <span class="rbccm-maas-mata__new-standard-heading-highlight"><span data-json="newStandard.headingHighlight"><xsl:value-of select="$NS_HIGHLIGHT" /></span><xsl:text>&#160;</xsl:text><span class="rbccm-maas-mata__new-standard-heading-accent" data-json="newStandard.headingHighlightAccent"><xsl:value-of select="$NS_ACCENT" /></span>.</span>
            </h2>
            <div class="rbccm-maas-mata__new-standard-body" data-animate="fadeInUp" data-animate-delay="150" data-json-list="newStandard.body">
              <template><p data-json=""></p></template>
              <p><xsl:value-of select="$NS_P1" disable-output-escaping="yes" /></p>
              <p><xsl:value-of select="$NS_P2" disable-output-escaping="yes" /></p>
              <p><xsl:value-of select="$NS_P3" disable-output-escaping="yes" /></p>
            </div>
            <a class="rbccm-maas-mata__btn rbccm-maas-mata__btn--yellow" data-animate="fadeInUp" data-animate-delay="300" data-json-attr-href="newStandard.cta.href">
              <xsl:attribute name="href"><xsl:value-of select="$NS_CTA_HREF" /></xsl:attribute>
              <span data-json="newStandard.cta.label"><xsl:value-of select="$NS_CTA_LABEL" /></span>
            </a>
          </div>
        </section>

        <!-- 4. AWARDS -->
        <section class="rbccm-maas-mata__awards" aria-label="Awards">
          <h5 class="rbccm-maas-mata__awards-eyebrow" data-animate="fadeInUp" data-json="awards.eyebrow">
            <xsl:value-of select="$AWD_EYEBROW" />
          </h5>

          <div class="rbccm-maas-mata__awards-grid rbccm-maas-mata__awards-grid--3" data-awards-track="" data-stagger-parent="fadeInUp" data-stagger-step="120" data-json-list="awards.items">
            <template>
              <article class="rbccm-maas-mata__award-card">
                <div class="rbccm-maas-mata__award-year" data-json="year"></div>
                <h6 class="rbccm-maas-mata__award-title" data-json="title"></h6>
                <div class="rbccm-maas-mata__award-issuer" data-json="issuer"></div>
              </article>
            </template>
            <article class="rbccm-maas-mata__award-card">
              <span class="rbccm-maas-mata__award-year"><xsl:value-of select="$AWD1_YEAR" /></span>
              <h3 class="rbccm-maas-mata__award-title"><xsl:value-of select="$AWD1_TITLE" /></h3>
              <p class="rbccm-maas-mata__award-issuer"><xsl:value-of select="$AWD1_ISSUER" /></p>
            </article>
            <article class="rbccm-maas-mata__award-card">
              <span class="rbccm-maas-mata__award-year"><xsl:value-of select="$AWD2_YEAR" /></span>
              <h3 class="rbccm-maas-mata__award-title"><xsl:value-of select="$AWD2_TITLE" /></h3>
              <p class="rbccm-maas-mata__award-issuer"><xsl:value-of select="$AWD2_ISSUER" /></p>
            </article>
            <article class="rbccm-maas-mata__award-card">
              <span class="rbccm-maas-mata__award-year"><xsl:value-of select="$AWD3_YEAR" /></span>
              <h3 class="rbccm-maas-mata__award-title"><xsl:value-of select="$AWD3_TITLE" /></h3>
              <p class="rbccm-maas-mata__award-issuer"><xsl:value-of select="$AWD3_ISSUER" /></p>
            </article>
          </div>

          <div class="rbccm-maas-mata__awards-controls" data-animate="zoomIn" data-animate-delay="350" data-awards-controls="" hidden="hidden">
            <button type="button" class="rbccm-maas-mata__awards-arrow" data-awards-prev="" aria-label="Previous award">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 1L2 12L12 23" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <div class="rbccm-maas-mata__awards-dots" data-awards-dots="" role="tablist" aria-label="Award slides"></div>
            <button type="button" class="rbccm-maas-mata__awards-arrow" data-awards-next="" aria-label="Next award">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false"><path d="M2 1L12 12L2 23" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </section>

        <!-- 5. PLATFORMS -->
        <section class="rbccm-maas-mata__platforms" id="platform" aria-label="Two platforms, one unified ecosystem">
          <div class="rbccm-maas-mata__container">
            <h5 class="rbccm-maas-mata__platforms-eyebrow" data-animate="fadeInUp" data-json="platforms.eyebrow"><xsl:value-of select="$PLATFORMS_EYEBROW" /></h5>
            <h2 class="rbccm-maas-mata__platforms-heading" data-animate="fadeInUp" data-animate-delay="100" data-json="platforms.heading"><xsl:value-of select="$PLATFORMS_HEADING" /></h2>

            <div class="rbccm-maas-mata__platforms-grid" data-stagger-parent="fadeInUp" data-stagger-step="150" data-json-list="platforms.cards">
              <!-- First card carries data-json hooks — the runtime
                   promotes it as the implicit template on JSON bind.
                   NOTE: theme class stays dark (Figma default); JSON
                   theme swap needs a data-json-class hook wired
                   separately if editors want to flip per-card. -->
              <article data-json-attr-data-theme="theme">
                <xsl:attribute name="class">rbccm-maas-mata__platform-card<xsl:choose>
                    <xsl:when test="translate($PLT1_THEME, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'dark'"> rbccm-maas-mata__platform-card--dark</xsl:when>
                    <xsl:otherwise> rbccm-maas-mata__platform-card--light</xsl:otherwise>
                  </xsl:choose></xsl:attribute>
                <h6 class="rbccm-maas-mata__platform-eyebrow" data-json="eyebrow"><xsl:value-of select="$PLT1_EYEBROW" /></h6><div class="rbccm-maas-mata__platform-content"><h3 class="rbccm-maas-mata__platform-title" data-json="title"><xsl:value-of select="$PLT1_TITLE" /></h3>
                <p class="rbccm-maas-mata__platform-body" data-json-html="body"><xsl:value-of select="$PLT1_BODY" disable-output-escaping="yes" /></p>
                <!-- Nested list: first <li> becomes the implicit template
                     when JSON provides bullets[]. data-json="" binds the
                     item's own value (each bullet is a string). -->
                <ul class="rbccm-maas-mata__platform-list" data-json-list="bullets">
                  <xsl:if test="normalize-space($PLT1_B1) != ''"><li data-json=""><xsl:value-of select="$PLT1_B1" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT1_B2) != ''"><li><xsl:value-of select="$PLT1_B2" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT1_B3) != ''"><li><xsl:value-of select="$PLT1_B3" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT1_B4) != ''"><li><xsl:value-of select="$PLT1_B4" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT1_B5) != ''"><li><xsl:value-of select="$PLT1_B5" /></li></xsl:if>
                </ul></div>
              </article>
              <article>
                <xsl:attribute name="class">rbccm-maas-mata__platform-card<xsl:choose>
                    <xsl:when test="translate($PLT2_THEME, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'dark'"> rbccm-maas-mata__platform-card--dark</xsl:when>
                    <xsl:otherwise> rbccm-maas-mata__platform-card--light</xsl:otherwise>
                  </xsl:choose></xsl:attribute>
                <h6 class="rbccm-maas-mata__platform-eyebrow"><xsl:value-of select="$PLT2_EYEBROW" /></h6><div class="rbccm-maas-mata__platform-content"><h3 class="rbccm-maas-mata__platform-title"><xsl:value-of select="$PLT2_TITLE" /></h3>
                <p class="rbccm-maas-mata__platform-body"><xsl:value-of select="$PLT2_BODY" disable-output-escaping="yes" /></p>
                <ul class="rbccm-maas-mata__platform-list">
                  <xsl:if test="normalize-space($PLT2_B1) != ''"><li><xsl:value-of select="$PLT2_B1" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B2) != ''"><li><xsl:value-of select="$PLT2_B2" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B3) != ''"><li><xsl:value-of select="$PLT2_B3" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B4) != ''"><li><xsl:value-of select="$PLT2_B4" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B5) != ''"><li><xsl:value-of select="$PLT2_B5" /></li></xsl:if>
                </ul></div>
              </article>
            </div>
          </div>
        </section>

      </div><!-- /.dark-strip -->


      <!-- ═══ 6. INNOVATION ERA ═══════════════════════════════ -->
      <section class="rbccm-maas-mata__innovation-era" aria-label="Innovation for the next execution era">
        <div class="rbccm-maas-mata__container">
          <div class="rbccm-maas-mata__innovation-era-header" data-animate="fadeInUp">
            <h2 class="rbccm-maas-mata__innovation-era-heading" data-json="innovationEra.heading"><xsl:value-of select="$INV_HEADING" /></h2>
            <p class="rbccm-maas-mata__innovation-era-body" data-json-html="innovationEra.body"><xsl:value-of select="$INV_BODY" disable-output-escaping="yes" /></p>
          </div>

          <div class="rbccm-maas-mata__features-grid" data-stagger-parent="fadeInUp" data-stagger-step="120" data-json-list="innovationEra.features">
            <!-- First feature carries the data-json hooks — rbccm-json-bind
                 promotes it to the implicit template when the JSON binds. -->
            <article class="rbccm-maas-mata__feature">
              <div class="rbccm-maas-mata__feature-content">
                <div class="rbccm-maas-mata__feature-number" data-json="number">/<xsl:value-of select="$F1_NUM" /></div>
                <h3 class="rbccm-maas-mata__feature-title" data-json="title"><xsl:value-of select="$F1_TITLE" /></h3>
                <p class="rbccm-maas-mata__feature-body" data-json-html="body"><xsl:value-of select="$F1_BODY" disable-output-escaping="yes" /></p>
              </div>
            </article>
            <article class="rbccm-maas-mata__feature">
              <div class="rbccm-maas-mata__feature-content">
                <div class="rbccm-maas-mata__feature-number">/<xsl:value-of select="$F2_NUM" /></div>
                <h3 class="rbccm-maas-mata__feature-title"><xsl:value-of select="$F2_TITLE" /></h3>
                <p class="rbccm-maas-mata__feature-body"><xsl:value-of select="$F2_BODY" disable-output-escaping="yes" /></p>
              </div>
            </article>
            <article class="rbccm-maas-mata__feature">
              <div class="rbccm-maas-mata__feature-content">
                <div class="rbccm-maas-mata__feature-number">/<xsl:value-of select="$F3_NUM" /></div>
                <h3 class="rbccm-maas-mata__feature-title"><xsl:value-of select="$F3_TITLE" /></h3>
                <p class="rbccm-maas-mata__feature-body"><xsl:value-of select="$F3_BODY" disable-output-escaping="yes" /></p>
              </div>
            </article>
          </div>
        </div>
      </section>


      <!-- ═══ DEEP-BAND WRAPPER (mata-cap + market-insights + demo) ═══ -->
      <div class="rbccm-maas-mata__deep-band">

        <!-- 7. MATA CAPABILITIES -->
        <section class="rbccm-maas-mata__mata-cap" aria-label="MATA Capabilities">
          <h5 class="rbccm-maas-mata__mata-cap-eyebrow" data-animate="fadeInUp" data-json="mataCapabilities.eyebrow"><xsl:value-of select="$MC_EYEBROW" /></h5>
          <div class="rbccm-maas-mata__mata-cap-header" data-animate="fadeInUp" data-animate-delay="100">
            <h2 class="rbccm-maas-mata__mata-cap-heading" data-json="mataCapabilities.heading"><xsl:value-of select="$MC_HEADING" /></h2>
            <p class="rbccm-maas-mata__mata-cap-sub" data-json-html="mataCapabilities.subheading"><xsl:value-of select="$MC_SUBHEADING" disable-output-escaping="yes" /></p>
          </div>

          <div class="rbccm-maas-mata__mata-cap-cards">
            <div class="rbccm-maas-mata__mata-cap-grid" data-stagger-parent="fadeInUp" data-stagger-step="120" data-json-list="mataCapabilities.cards">
              <!-- First card carries data-json hooks — rbccm-json-bind
                   promotes it to the implicit template when JSON binds. -->
              <article class="rbccm-maas-mata__mata-cap-card">
                <div class="rbccm-maas-mata__mata-cap-content">
                  <svg class="rbccm-maas-mata__mata-cap-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><use data-json-attr-href="iconHref"><xsl:attribute name="href">#mata-cap-icon-<xsl:value-of select="$C1_ICON" /></xsl:attribute></use></svg>
                  <h3 class="rbccm-maas-mata__mata-cap-title" data-json="title"><xsl:value-of select="$C1_TITLE" /></h3>
                  <p class="rbccm-maas-mata__mata-cap-subtitle" data-json="subtitle"><xsl:value-of select="$C1_SUBTITLE" /></p>
                  <p class="rbccm-maas-mata__mata-cap-body" data-json-html="body"><xsl:value-of select="$C1_BODY" disable-output-escaping="yes" /></p>
                </div>
              </article>
              <article class="rbccm-maas-mata__mata-cap-card">
                <div class="rbccm-maas-mata__mata-cap-content">
                  <svg class="rbccm-maas-mata__mata-cap-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><use><xsl:attribute name="href">#mata-cap-icon-<xsl:value-of select="$C2_ICON" /></xsl:attribute></use></svg>
                  <h3 class="rbccm-maas-mata__mata-cap-title"><xsl:value-of select="$C2_TITLE" /></h3>
                  <p class="rbccm-maas-mata__mata-cap-subtitle"><xsl:value-of select="$C2_SUBTITLE" /></p>
                  <p class="rbccm-maas-mata__mata-cap-body"><xsl:value-of select="$C2_BODY" disable-output-escaping="yes" /></p>
                </div>
              </article>
              <article class="rbccm-maas-mata__mata-cap-card">
                <div class="rbccm-maas-mata__mata-cap-content">
                  <svg class="rbccm-maas-mata__mata-cap-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><use><xsl:attribute name="href">#mata-cap-icon-<xsl:value-of select="$C3_ICON" /></xsl:attribute></use></svg>
                  <h3 class="rbccm-maas-mata__mata-cap-title"><xsl:value-of select="$C3_TITLE" /></h3>
                  <p class="rbccm-maas-mata__mata-cap-subtitle"><xsl:value-of select="$C3_SUBTITLE" /></p>
                  <p class="rbccm-maas-mata__mata-cap-body"><xsl:value-of select="$C3_BODY" disable-output-escaping="yes" /></p>
                </div>
              </article>
            </div>

            <!-- Fixed Index Events card (full width below the 3-card grid).
                 Not inside a data-json-list, so paths are absolute. -->
            <article class="rbccm-maas-mata__mata-cap-wide">
              <svg class="rbccm-maas-mata__mata-cap-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><use><xsl:attribute name="href">#mata-cap-icon-<xsl:value-of select="$MC_INDEX_ICON" /></xsl:attribute></use></svg>
              <div class="rbccm-maas-mata__mata-cap-wide-body">
                <h3 class="rbccm-maas-mata__mata-cap-title" data-json="mataCapabilities.indexEvents.title"><xsl:value-of select="$MC_INDEX_TITLE" /></h3>
                <p class="rbccm-maas-mata__mata-cap-subtitle" data-json="mataCapabilities.indexEvents.subtitle"><xsl:value-of select="$MC_INDEX_SUBTITLE" /></p>
                <p class="rbccm-maas-mata__mata-cap-body" data-json-html="mataCapabilities.indexEvents.body"><xsl:value-of select="$MC_INDEX_BODY" disable-output-escaping="yes" /></p>
              </div>
            </article>
          </div>
        </section>


        <!-- 8. MARKET INSIGHTS -->
        <section class="rbccm-maas-mata__market-insights" aria-label="Market insights">
          <div class="rbccm-maas-mata__container">
            <h5 class="rbccm-maas-mata__market-insights-eyebrow" data-animate="fadeInUp" data-json="marketInsights.eyebrow"><xsl:value-of select="$MK_EYEBROW" /></h5>
            <h2 class="rbccm-maas-mata__market-insights-heading" data-animate="fadeInUp" data-animate-delay="100" data-json="marketInsights.heading"><xsl:value-of select="$MK_HEADING" /></h2>

            <div class="rbccm-maas-mata__featured-track" data-animate="fadeInUp" data-animate-delay="200" data-insights-track="" data-json-list="marketInsights.items">
              <!-- First card carries data-json hooks — the runtime
                   promotes it as the implicit template on JSON bind. -->
              <article class="rbccm-maas-mata__featured-card"><div class="rbccm-maas-mata__featured-body"><h4 class="rbccm-maas-mata__featured-eyebrow" data-json="eyebrow"><xsl:value-of select="$INS1_EYEBROW" /></h4><div class="rbccm-maas-mata__featured-content"><h3 class="rbccm-maas-mata__featured-title" data-json="title"><xsl:value-of select="$INS1_TITLE" /></h3><p class="rbccm-maas-mata__featured-copy" data-json-html="body"><xsl:value-of select="$INS1_BODY" disable-output-escaping="yes" /></p></div><a class="rbccm-maas-mata__featured-cta" data-json-attr-href="cta.href">
                  <xsl:attribute name="href"><xsl:value-of select="$INS1_CTA_HREF" /></xsl:attribute>
                  <span class="rbccm-maas-mata__featured-cta-read" data-json="cta.label"><xsl:value-of select="$INS1_CTA_LABEL" /></span>
                  <svg class="rbccm-maas-mata__featured-cta-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a></div><div class="rbccm-maas-mata__featured-illustration"><img data-json-attr-src="image" data-json-attr-alt="imageAlt"><xsl:attribute name="src"><xsl:value-of select="$INS1_IMAGE" /></xsl:attribute><xsl:attribute name="alt"><xsl:value-of select="$INS1_IMAGE_ALT" /></xsl:attribute></img></div></article>
              <article class="rbccm-maas-mata__featured-card"><div class="rbccm-maas-mata__featured-body"><h4 class="rbccm-maas-mata__featured-eyebrow"><xsl:value-of select="$INS2_EYEBROW" /></h4><div class="rbccm-maas-mata__featured-content"><h3 class="rbccm-maas-mata__featured-title"><xsl:value-of select="$INS2_TITLE" /></h3><p class="rbccm-maas-mata__featured-copy"><xsl:value-of select="$INS2_BODY" disable-output-escaping="yes" /></p></div><a class="rbccm-maas-mata__featured-cta">
                  <xsl:attribute name="href"><xsl:value-of select="$INS2_CTA_HREF" /></xsl:attribute>
                  <span class="rbccm-maas-mata__featured-cta-read"><xsl:value-of select="$INS2_CTA_LABEL" /></span>
                  <svg class="rbccm-maas-mata__featured-cta-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a></div><div class="rbccm-maas-mata__featured-illustration"><img><xsl:attribute name="src"><xsl:value-of select="$INS2_IMAGE" /></xsl:attribute><xsl:attribute name="alt"><xsl:value-of select="$INS2_IMAGE_ALT" /></xsl:attribute></img></div></article>
              <article class="rbccm-maas-mata__featured-card"><div class="rbccm-maas-mata__featured-body"><h4 class="rbccm-maas-mata__featured-eyebrow"><xsl:value-of select="$INS3_EYEBROW" /></h4><div class="rbccm-maas-mata__featured-content"><h3 class="rbccm-maas-mata__featured-title"><xsl:value-of select="$INS3_TITLE" /></h3><p class="rbccm-maas-mata__featured-copy"><xsl:value-of select="$INS3_BODY" disable-output-escaping="yes" /></p></div><a class="rbccm-maas-mata__featured-cta">
                  <xsl:attribute name="href"><xsl:value-of select="$INS3_CTA_HREF" /></xsl:attribute>
                  <span class="rbccm-maas-mata__featured-cta-read"><xsl:value-of select="$INS3_CTA_LABEL" /></span>
                  <svg class="rbccm-maas-mata__featured-cta-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a></div><div class="rbccm-maas-mata__featured-illustration"><img><xsl:attribute name="src"><xsl:value-of select="$INS3_IMAGE" /></xsl:attribute><xsl:attribute name="alt"><xsl:value-of select="$INS3_IMAGE_ALT" /></xsl:attribute></img></div></article>
            </div>

            <div class="rbccm-maas-mata__insights-controls" data-animate="zoomIn" data-animate-delay="350" data-insights-controls="">
              <button type="button" class="rbccm-maas-mata__awards-arrow" data-insights-prev="" aria-label="Previous insight">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 1L2 12L12 23" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <div class="rbccm-maas-mata__awards-dots" data-insights-dots="" role="tablist" aria-label="Insight slides"></div>
              <button type="button" class="rbccm-maas-mata__awards-arrow" data-insights-next="" aria-label="Next insight">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false"><path d="M2 1L12 12L2 23" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>
        </section>


        <!-- 9. DEMO CTA -->
        <section class="rbccm-maas-mata__demo" id="demo" aria-label="See the platform">
          <div class="rbccm-maas-mata__container">
            <h5 class="rbccm-maas-mata__demo-eyebrow" data-animate="fadeInUp" data-json="demoCta.eyebrow"><xsl:value-of select="$DEMO_EYEBROW" /></h5>
            <h2 class="rbccm-maas-mata__demo-heading" data-animate="fadeInUp" data-animate-delay="100">
              <span data-json="demoCta.headlinePrefix"><xsl:value-of select="$DEMO_PREFIX" /></span><xsl:text>&#160;</xsl:text><span class="rbccm-maas-mata__demo-heading-highlight" data-json="demoCta.headlineHighlight"><xsl:value-of select="$DEMO_HIGHLIGHT" /></span>.
            </h2>
            <p class="rbccm-maas-mata__demo-body" data-animate="fadeInUp" data-animate-delay="200" data-json-html="demoCta.body"><xsl:value-of select="$DEMO_BODY" disable-output-escaping="yes" /></p>
            <a class="rbccm-maas-mata__btn rbccm-maas-mata__btn--yellow" data-animate="fadeInUp" data-animate-delay="300" data-json-attr-href="demoCta.cta.href">
              <xsl:attribute name="href"><xsl:value-of select="$DEMO_CTA_HREF" /></xsl:attribute>
              <span data-json="demoCta.cta.label"><xsl:value-of select="$DEMO_CTA_LABEL" /></span>
              <svg class="rbccm-maas-mata__btn-icon" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden="true" focusable="false">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.4375 11.4999C1.4375 11.3093 1.51323 11.1265 1.64802 10.9917C1.78281 10.8569 1.96563 10.7812 2.15625 10.7812H19.1087L14.5849 6.25881C14.4499 6.12384 14.3741 5.9408 14.3741 5.74993C14.3741 5.55907 14.4499 5.37602 14.5849 5.24106C14.7198 5.10609 14.9029 5.03027 15.0938 5.03027C15.2846 5.03027 15.4677 5.10609 15.6026 5.24106L21.3526 10.9911C21.4196 11.0578 21.4727 11.1371 21.5089 11.2245C21.5451 11.3118 21.5638 11.4054 21.5638 11.4999C21.5638 11.5945 21.5451 11.6881 21.5089 11.7754C21.4727 11.8627 21.4196 11.942 21.3526 12.0088L15.6026 17.7588C15.4677 17.8938 15.2846 17.9696 15.0938 17.9696C14.9029 17.9696 14.7198 17.8938 14.5849 17.7588C14.4499 17.6238 14.3741 17.4408 14.3741 17.2499C14.3741 17.0591 14.4499 16.876 14.5849 16.7411L19.1087 12.2187H2.15625C1.96563 12.2187 1.78281 12.143 1.64802 12.0082C1.51323 11.8734 1.4375 11.6906 1.4375 11.4999Z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </section>

      </div><!-- /.deep-band -->



      <!-- Newsletter section removed — the site's shared Marketo
           component is now dropped in on the page separately. If
           we ever bring it back in-component, restore from git. -->


    </div><!-- /.rbccm-maas-mata -->

    <!-- Site-standard Bootstrap video modal (matches the pattern used
         on the home page and elsewhere). Bootstrap owns open/close via
         data-toggle="modal" on the trigger + data-dismiss="modal" on
         the button; no custom JS needed. Brightcove player is embedded
         directly in the iframe src. -->
    <div role="dialog" class="modal fade" tabindex="-1" id="herovideo">
      <div role="document" class="modal-dialog" style="top: 0px; width: auto; max-width: 960px;">
        <div class="modal-content">
          <div>
            <div class="modal-header" style="border: none; border-top: 8px #FBDE00 solid; padding: 0px;">
              <button aria-label="Close Modal" class="close" style="font-size: 41px; color: #595959; font-weight: normal;" type="button" data-dismiss="modal">×</button>
            </div>
            <div class="modal-body" style="padding: 0px;">
              <div class="white-box-text" style="padding: 25px; padding-top: 10px;">
                <div style="margin-bottom: 20px;">
                  <div>
                    <div style="position: relative; display: block; max-width: 960px;">
                      <div style="padding-top: 56.25%;">
                        <iframe title="MAAS + MATA platform overview video" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; width: 100%; height: 100%;" allowfullscreen="allowfullscreen" frameborder="0">
                          <xsl:attribute name="src"><xsl:value-of select="$BC_IFRAME_SRC" /></xsl:attribute>
                        </iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- rbccm-json-bind must load BEFORE maas-mata.js so the
         bootstrap block at the bottom of maas-mata.js finds the
         RBCCMBind global. If this file is ever removed, the page
         gracefully falls back to XSL-baked Datums (bootstrap
         checks for RBCCMBind and no-ops when missing). -->
    <script>
      <xsl:attribute name="src">/assets/rbccm/js/pages/rbccm-json-bind.js?v=<xsl:value-of select="$ASSET_VERSION" /></xsl:attribute>
    </script>
    <script>
      <xsl:attribute name="src">/assets/rbccm/js/pages/maas-mata.js?v=<xsl:value-of select="$ASSET_VERSION" /></xsl:attribute>
    </script>

  </xsl:template>
</xsl:stylesheet>
