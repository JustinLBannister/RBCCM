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
  <!-- Market Insights section removed from the page; MK_* variables
       stripped along with it. -->


  <!-- Demo CTA -->
  <xsl:variable name="DEMO_EYEBROW"        select="/Properties/Datum[@ID='DemoEyebrow']" />
  <xsl:variable name="DEMO_PREFIX"         select="/Properties/Datum[@ID='DemoHeadlinePrefix']" />
  <xsl:variable name="DEMO_HIGHLIGHT"      select="/Properties/Datum[@ID='DemoHeadlineHighlight']" />
  <xsl:variable name="DEMO_BODY"           select="/Properties/Datum[@ID='DemoBody']" />
  <xsl:variable name="DEMO_CTA_LABEL"      select="/Properties/Datum[@ID='DemoCtaLabel']" />
  <xsl:variable name="DEMO_CTA_HREF"       select="/Properties/Datum[@ID='DemoCtaHref']" />

  <!-- Newsletter -->
  <!-- Newsletter section removed from the component; the site-wide
       Marketo component is dropped on the page separately. NL_*
       variables stripped along with it. -->


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
  <xsl:variable name="PLT1_B6"      select="/Properties/Datum[@ID='Platform1Bullet6']" />
  <xsl:variable name="PLT2_THEME"   select="/Properties/Datum[@ID='Platform2Theme']/Option[@Selected='true']/Value" />
  <xsl:variable name="PLT2_EYEBROW" select="/Properties/Datum[@ID='Platform2Eyebrow']" />
  <xsl:variable name="PLT2_TITLE"   select="/Properties/Datum[@ID='Platform2Title']" />
  <xsl:variable name="PLT2_BODY"    select="/Properties/Datum[@ID='Platform2Body']" />
  <xsl:variable name="PLT2_B1"      select="/Properties/Datum[@ID='Platform2Bullet1']" />
  <xsl:variable name="PLT2_B2"      select="/Properties/Datum[@ID='Platform2Bullet2']" />
  <xsl:variable name="PLT2_B3"      select="/Properties/Datum[@ID='Platform2Bullet3']" />
  <xsl:variable name="PLT2_B4"      select="/Properties/Datum[@ID='Platform2Bullet4']" />
  <xsl:variable name="PLT2_B5"      select="/Properties/Datum[@ID='Platform2Bullet5']" />
  <xsl:variable name="PLT2_B6"      select="/Properties/Datum[@ID='Platform2Bullet6']" />

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
  <!-- Market Insights cards removed with the section; INSn_* stripped. -->


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
         it into that field verbatim — no XSL edit needed. Guard:
         only emit the <script> tag when the Datum is non-empty, so
         pages without an override don't ship a broken empty stub. -->
    <xsl:if test="normalize-space($SEO_JSONLD) != ''">
      <script type="application/ld+json">
        <xsl:value-of select="$SEO_JSONLD" disable-output-escaping="yes" />
      </script>
    </xsl:if>


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
          <symbol id="mata-cap-icon-equities" viewBox="0 0 30 30">
        <!-- Trend line (upward arrow) + L-shaped chart axes. -->
        <path d="M28.0791 3.875C28.3576 3.875 28.6245 3.98824 28.8203 4.18945C29.0161 4.39055 29.125 4.66331 29.125 4.94629V12.5146C29.1249 12.7974 29.0159 13.0695 28.8203 13.2705C28.6245 13.4717 28.3576 13.585 28.0791 13.585C27.8008 13.5849 27.5347 13.4716 27.3389 13.2705C27.1432 13.0695 27.0333 12.7975 27.0332 12.5146V7.95215L20.6025 16.0303C20.5103 16.146 20.3951 16.241 20.2646 16.3086C20.1342 16.3762 19.991 16.4144 19.8447 16.4219C19.6985 16.4294 19.5525 16.4055 19.416 16.3516C19.3138 16.3111 19.2184 16.2548 19.1338 16.1846L19.0527 16.1094L14.3916 11.3213L7.74707 20.7109L7.74414 20.7148C7.57731 20.9328 7.33348 21.0769 7.06445 21.1152C6.7955 21.1534 6.52247 21.0825 6.30371 20.9189C6.08523 20.7555 5.93747 20.512 5.89062 20.2402C5.84385 19.9684 5.90151 19.6878 6.05176 19.458L6.05469 19.4541L13.4209 9.04785C13.5094 8.92257 13.6239 8.8182 13.7559 8.74219C13.8878 8.66624 14.0344 8.62069 14.1855 8.6084C14.3367 8.59612 14.4887 8.6171 14.6309 8.6709C14.773 8.7247 14.902 8.80937 15.0088 8.91895L19.7139 13.7549L25.877 6.0166H20.7129C20.4344 6.0166 20.1675 5.90336 19.9717 5.70215C19.7761 5.50113 19.6671 5.22909 19.667 4.94629C19.667 4.66331 19.7759 4.39055 19.9717 4.18945C20.1675 3.98827 20.4344 3.875 20.7129 3.875H28.0791Z" fill="#FFC72C" stroke="#FFC72C" stroke-width="0.25"/>
        <path d="M28.75 27.5H6.25C5.25544 27.5 4.30161 27.1049 3.59835 26.4017C2.89509 25.6984 2.5 24.7446 2.5 23.75V1.25C2.5 0.918479 2.3683 0.600537 2.13388 0.366117C1.89946 0.131696 1.58152 0 1.25 0C0.918479 0 0.600537 0.131696 0.366117 0.366117C0.131696 0.600537 0 0.918479 0 1.25L0 23.75C0.00198482 25.407 0.661102 26.9956 1.83277 28.1672C3.00445 29.3389 4.59301 29.998 6.25 30H28.75C29.0815 30 29.3995 29.8683 29.6339 29.6339C29.8683 29.3995 30 29.0815 30 28.75C30 28.4185 29.8683 28.1005 29.6339 27.8661C29.3995 27.6317 29.0815 27.5 28.75 27.5Z" fill="#FFC72C"/>
      </symbol>
          <symbol id="mata-cap-icon-fx" viewBox="0 0 27 30">
        <!-- Two crossed exchange arrows (right + down). -->
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.00167582 21.5625C0.00167582 21.8112 0.100448 22.0496 0.276263 22.2254C0.452079 22.4013 0.690535 22.5 0.939176 22.5H23.0511L17.1504 28.3988C16.9744 28.5748 16.8755 28.8136 16.8755 29.0625C16.8755 29.3115 16.9744 29.5502 17.1504 29.7263C17.3265 29.9023 17.5652 30.0012 17.8142 30.0012C18.0631 30.0012 18.3019 29.9023 18.4779 29.7263L25.9779 22.2263C26.0652 22.1392 26.1345 22.0357 26.1818 21.9218C26.229 21.8079 26.2534 21.6858 26.2534 21.5625C26.2534 21.4392 26.229 21.3171 26.1818 21.2032C26.1345 21.0893 26.0652 20.9859 25.9779 20.8988L18.4779 13.3988C18.3019 13.2227 18.0631 13.1238 17.8142 13.1238C17.5652 13.1238 17.3265 13.2227 17.1504 13.3988C16.9744 13.5748 16.8755 13.8136 16.8755 14.0625C16.8755 14.3115 16.9744 14.5502 17.1504 14.7263L23.0511 20.625H0.939176C0.690535 20.625 0.452079 20.7238 0.276263 20.8996C0.100448 21.0754 0.00167582 21.3139 0.00167582 21.5625ZM26.2517 8.43753C26.2517 8.68617 26.1529 8.92462 25.9771 9.10044C25.8013 9.27625 25.5628 9.37503 25.3142 9.37503H3.2023L9.10293 15.2738C9.19009 15.3609 9.25923 15.4644 9.30641 15.5783C9.35358 15.6922 9.37786 15.8143 9.37786 15.9375C9.37786 16.0608 9.35358 16.1829 9.30641 16.2967C9.25923 16.4106 9.19009 16.5141 9.10293 16.6013C9.01576 16.6884 8.91228 16.7576 8.79839 16.8048C8.68451 16.8519 8.56245 16.8762 8.43918 16.8762C8.31591 16.8762 8.19384 16.8519 8.07996 16.8048C7.96607 16.7576 7.86259 16.6884 7.77543 16.6013L0.275426 9.10128C0.18812 9.01419 0.118852 8.91074 0.0715898 8.79684C0.0243277 8.68294 0 8.56084 0 8.43753C0 8.31421 0.0243277 8.19211 0.0715898 8.07821C0.118852 7.96432 0.18812 7.86086 0.275426 7.77378L7.77543 0.273775C7.95146 0.0977371 8.19022 -0.00115967 8.43918 -0.00115967C8.68813 -0.00115967 8.92689 0.0977371 9.10293 0.273775C9.27896 0.449812 9.37786 0.68857 9.37786 0.937525C9.37786 1.18648 9.27896 1.42524 9.10293 1.60127L3.2023 7.50003H25.3142C25.5628 7.50003 25.8013 7.5988 25.9771 7.77461C26.1529 7.95043 26.2517 8.18889 26.2517 8.43753Z" fill="#FFC72C"/>
      </symbol>
          <symbol id="mata-cap-icon-futures" viewBox="0 0 30 30">
        <!-- L-axes + 4 histogram bars + peaks/valleys stroke at top. -->
        <path d="M28.75 27.5H6.25C5.25544 27.5 4.30161 27.1049 3.59835 26.4017C2.89509 25.6984 2.5 24.7446 2.5 23.75V1.25C2.5 0.918479 2.3683 0.600537 2.13388 0.366117C1.89946 0.131696 1.58152 0 1.25 0C0.918479 0 0.600537 0.131696 0.366117 0.366117C0.131696 0.600537 0 0.918479 0 1.25L0 23.75C0.00198482 25.407 0.661102 26.9956 1.83277 28.1672C3.00445 29.3389 4.59301 29.998 6.25 30H28.75C29.0815 30 29.3995 29.8683 29.6339 29.6339C29.8683 29.3995 30 29.0815 30 28.75C30 28.4185 29.8683 28.1005 29.6339 27.8661C29.3995 27.6317 29.0815 27.5 28.75 27.5Z" fill="#FFC72C"/>
        <path d="M7.5 25C7.83152 25 8.14946 24.8683 8.38388 24.6339C8.6183 24.3995 8.75 24.0815 8.75 23.75V15C8.75 14.6685 8.6183 14.3505 8.38388 14.1161C8.14946 13.8817 7.83152 13.75 7.5 13.75C7.16848 13.75 6.85054 13.8817 6.61612 14.1161C6.3817 14.3505 6.25 14.6685 6.25 15V23.75C6.25 24.0815 6.3817 24.3995 6.61612 24.6339C6.85054 24.8683 7.16848 25 7.5 25Z" fill="#FFC72C"/>
        <path d="M12.5 12.5V23.75C12.5 24.0815 12.6317 24.3995 12.8661 24.6339C13.1005 24.8683 13.4185 25 13.75 25C14.0815 25 14.3995 24.8683 14.6339 24.6339C14.8683 24.3995 15 24.0815 15 23.75V12.5C15 12.1685 14.8683 11.8505 14.6339 11.6161C14.3995 11.3817 14.0815 11.25 13.75 11.25C13.4185 11.25 13.1005 11.3817 12.8661 11.6161C12.6317 11.8505 12.5 12.1685 12.5 12.5Z" fill="#FFC72C"/>
        <path d="M18.75 16.25V23.75C18.75 24.0815 18.8817 24.3995 19.1161 24.6339C19.3505 24.8683 19.6685 25 20 25C20.3315 25 20.6495 24.8683 20.8839 24.6339C21.1183 24.3995 21.25 24.0815 21.25 23.75V16.25C21.25 15.9185 21.1183 15.6005 20.8839 15.3661C20.6495 15.1317 20.3315 15 20 15C19.6685 15 19.3505 15.1317 19.1161 15.3661C18.8817 15.6005 18.75 15.9185 18.75 16.25Z" fill="#FFC72C"/>
        <path d="M25 11.25V23.75C25 24.0815 25.1317 24.3995 25.3661 24.6339C25.6005 24.8683 25.9185 25 26.25 25C26.5815 25 26.8995 24.8683 27.1339 24.6339C27.3683 24.3995 27.5 24.0815 27.5 23.75V11.25C27.5 10.9185 27.3683 10.6005 27.1339 10.3661C26.8995 10.1317 26.5815 10 26.25 10C25.9185 10 25.6005 10.1317 25.3661 10.3661C25.1317 10.6005 25 10.9185 25 11.25Z" fill="#FFC72C"/>
        <path d="M7.49998 11.25C7.83147 11.25 8.14936 11.1182 8.38373 10.8838L12.8662 6.40127C13.1045 6.1743 13.4209 6.0477 13.75 6.0477C14.079 6.0477 14.3955 6.1743 14.6337 6.40127L17.3487 9.11627C18.052 9.81929 19.0056 10.2142 20 10.2142C20.9943 10.2142 21.948 9.81929 22.6512 9.11627L29.6337 2.13377C29.8614 1.89802 29.9874 1.58227 29.9846 1.25452C29.9817 0.926773 29.8503 0.613258 29.6185 0.381497C29.3867 0.149737 29.0732 0.0182761 28.7455 0.0154281C28.4177 0.0125801 28.102 0.138573 27.8662 0.366271L20.8837 7.34752C20.6493 7.58186 20.3314 7.7135 20 7.7135C19.6685 7.7135 19.3506 7.58186 19.1162 7.34752L16.4012 4.63377C15.698 3.93075 14.7443 3.53582 13.75 3.53582C12.7556 3.53582 11.802 3.93075 11.0987 4.63377L6.61623 9.11627C6.44147 9.29109 6.32246 9.51379 6.27425 9.75623C6.22604 9.99867 6.25079 10.25 6.34538 10.4783C6.43997 10.7067 6.60014 10.9019 6.80565 11.0393C7.01117 11.1766 7.25279 11.25 7.49998 11.25Z" fill="#FFC72C"/>
      </symbol>
          <symbol id="mata-cap-icon-info" viewBox="0 0 32 32">
        <!-- Magnifying glass + inner bar chart (Index Events). -->
        <path d="M31.6013 29.716L23.6507 21.7653C25.5333 19.4653 26.6667 16.5293 26.6667 13.3333C26.6667 5.98133 20.6853 0 13.3333 0C5.98133 0 0 5.98133 0 13.3333C0 20.6853 5.98133 26.6667 13.3333 26.6667C16.5307 26.6667 19.4667 25.5333 21.7653 23.6507L29.716 31.6013C29.976 31.8613 30.3173 31.992 30.6587 31.992C31 31.992 31.3413 31.8613 31.6013 31.6013C32.1227 31.08 32.1227 30.2373 31.6013 29.716ZM2.66667 13.3333C2.66667 7.452 7.452 2.66667 13.3333 2.66667C19.2147 2.66667 24 7.452 24 13.3333C24 19.2147 19.2147 24 13.3333 24C7.452 24 2.66667 19.2147 2.66667 13.3333ZM19.992 15.992C19.992 16.7293 19.3947 17.3253 18.6587 17.3253H7.992C7.256 17.3253 6.65867 16.7293 6.65867 15.992C6.65867 15.2547 7.256 14.6587 7.992 14.6587V11.992C7.992 11.2547 8.58933 10.6587 9.32533 10.6587C10.0613 10.6587 10.6587 11.2547 10.6587 11.992V14.6587H11.992V7.992C11.992 7.25467 12.5893 6.65867 13.3253 6.65867C14.0613 6.65867 14.6587 7.25467 14.6587 7.992V14.6587H15.992V10.6587C15.992 9.92133 16.5893 9.32533 17.3253 9.32533C18.0613 9.32533 18.6587 9.92133 18.6587 10.6587V14.6587C19.3947 14.6587 19.992 15.2547 19.992 15.992Z" fill="#FFC72C"/>
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
              <!-- data-json-html so the &lt;br&gt; in NewStandardHeadingLead
                   renders; disable-output-escaping keeps the &lt;br&gt; markup.
                   The Lead Datum value should include a space BEFORE the
                   &lt;br&gt; so words stay separated when 600+ hides it. -->
              <span class="rbccm-maas-mata__new-standard-heading-lead" data-json-html="newStandard.headingLead"><xsl:value-of select="$NS_LEAD" disable-output-escaping="yes" /></span>
              <!-- Text-node space between highlight and br so words stay
                   separated when the br is hidden. Period lives inside the
                   Accent Datum so it inherits yellow. -->
              <span class="rbccm-maas-mata__new-standard-heading-highlight"><span data-json="newStandard.headingHighlight"><xsl:value-of select="$NS_HIGHLIGHT" /></span><xsl:text> </xsl:text><br /><span class="rbccm-maas-mata__new-standard-heading-accent" data-json="newStandard.headingHighlightAccent"><xsl:value-of select="$NS_ACCENT" /></span></span>
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

        <!-- 4. AWARDS  (extracted 2026-09-16)
             ============================================================
             The awards row now ships from the standalone rbccm-awards
             component (see /rbccm-awards/). TeamSite pages using this
             MAAS+MATA skin should drop rbccm-awards as a separate
             component into the page layout between MAAS+MATA and the
             next section. That gives editors independent control over
             award copy without republishing the MAAS+MATA skin, and
             makes the same pattern reusable on Credentials, product
             landing pages, etc.

             The MAAS+MATA CSS block (.rbccm-maas-mata__awards*) is
             kept in place for now as dormant code and can be pruned
             in a follow-up once no page references it.

             Original inline block removed; no replacement markup is
             emitted here so the platforms band can flow directly
             beneath new-standard while the awards component sits in
             its own slot in the page layout.
             ============================================================ -->

        <!-- 5. PLATFORMS -->
        <section class="rbccm-maas-mata__platforms" id="platform" aria-label="Two platforms, one unified ecosystem">
          <div class="rbccm-maas-mata__container">
            <div class="rbccm-maas-mata__platforms-eyebrow" data-animate="fadeInUp" data-json="platforms.eyebrow"><xsl:value-of select="$PLATFORMS_EYEBROW" /></div>
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
                <div class="rbccm-maas-mata__platform-eyebrow" data-json="eyebrow"><xsl:value-of select="$PLT1_EYEBROW" /></div><div class="rbccm-maas-mata__platform-content"><h3 class="rbccm-maas-mata__platform-title" data-json="title"><xsl:value-of select="$PLT1_TITLE" /></h3>
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
                  <xsl:if test="normalize-space($PLT1_B6) != ''"><li><xsl:value-of select="$PLT1_B6" /></li></xsl:if>
                </ul></div>
              </article>
              <article>
                <xsl:attribute name="class">rbccm-maas-mata__platform-card<xsl:choose>
                    <xsl:when test="translate($PLT2_THEME, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'dark'"> rbccm-maas-mata__platform-card--dark</xsl:when>
                    <xsl:otherwise> rbccm-maas-mata__platform-card--light</xsl:otherwise>
                  </xsl:choose></xsl:attribute>
                <div class="rbccm-maas-mata__platform-eyebrow"><xsl:value-of select="$PLT2_EYEBROW" /></div><div class="rbccm-maas-mata__platform-content"><h3 class="rbccm-maas-mata__platform-title"><xsl:value-of select="$PLT2_TITLE" /></h3>
                <p class="rbccm-maas-mata__platform-body"><xsl:value-of select="$PLT2_BODY" disable-output-escaping="yes" /></p>
                <ul class="rbccm-maas-mata__platform-list">
                  <xsl:if test="normalize-space($PLT2_B1) != ''"><li><xsl:value-of select="$PLT2_B1" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B2) != ''"><li><xsl:value-of select="$PLT2_B2" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B3) != ''"><li><xsl:value-of select="$PLT2_B3" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B4) != ''"><li><xsl:value-of select="$PLT2_B4" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B5) != ''"><li><xsl:value-of select="$PLT2_B5" /></li></xsl:if>
                  <xsl:if test="normalize-space($PLT2_B6) != ''"><li><xsl:value-of select="$PLT2_B6" /></li></xsl:if>
                </ul></div>
              </article>
            </div>
          </div>
        </section>

        <!-- ═══ MATA CAPABILITIES (relocated into the dark-strip) ═══
             "Sharper insight. Smarter trades." was previously inside
             the deep-band. Moved up here so it shares the same dark
             navy surface as new-standard + awards + platforms; the
             transition to the light innovation-era below now reads
             intentionally. -->
        <section class="rbccm-maas-mata__mata-cap" aria-label="MATA capabilities">
          <!-- Eyebrow is optional. Empty MataCapEyebrow Datum -> no div. -->
          <xsl:if test="normalize-space($MC_EYEBROW) != ''">
            <div class="rbccm-maas-mata__mata-cap-eyebrow" data-animate="fadeInUp" data-json="mataCapabilities.eyebrow"><xsl:value-of select="$MC_EYEBROW" /></div>
          </xsl:if>
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

      </div><!-- /.dark-strip -->


      <!-- ═══ DEEP-BAND WRAPPER (innovation-era + demo) ═══ -->
      <div class="rbccm-maas-mata__deep-band">

        <!-- 7. MATA CAPABILITIES moved ↑ into the dark-strip so
             "Sharper insight. Smarter trades." lives on the same
             navy surface as new-standard + awards + platforms. -->


        <!-- 8. INNOVATION ERA (relocated from above the deep-band —
             took over the removed Market insights slot). Bg goes
             transparent so the shared deep-band gradient reads
             through; text swaps to on-dark treatments in CSS. -->
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


        <!-- 9. DEMO CTA -->
        <section class="rbccm-maas-mata__demo" id="demo" aria-label="See the platform">
          <div class="rbccm-maas-mata__container">
            <div class="rbccm-maas-mata__demo-eyebrow" data-animate="fadeInUp" data-json="demoCta.eyebrow"><xsl:value-of select="$DEMO_EYEBROW" /></div>
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
    <div role="dialog" class="modal fade" tabindex="-1" id="herovideo" aria-label="Video" aria-describedby="herovideo-desc">
      <div role="document" class="modal-dialog" style="top: 0px; width: auto; max-width: 960px;">
        <div class="modal-content">
          <div>
            <div class="modal-header" style="border: none; border-top: 8px #FBDE00 solid; padding: 0px;">
              <button aria-label="Close Modal" class="close" style="font-size: 41px; color: #595959; font-weight: normal;" type="button" data-dismiss="modal">×</button>
            </div>
            <div class="modal-body" style="padding: 0px;">
              <div class="white-box-text" style="padding: 25px; padding-top: 10px;">
                <div style="margin-bottom: 20px;">
                  <p id="herovideo-desc" class="sr-only">Video opens in an embedded player.</p>
                  <div>
                    <div style="position: relative; display: block; max-width: 960px;">
                      <div style="padding-top: 56.25%;">
                        <iframe title="MAAS + MATA platform overview video" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; width: 100%; height: 100%;" allowfullscreen="allowfullscreen" frameborder="0">
                          <xsl:attribute name="src"><xsl:value-of select="$BC_IFRAME_SRC" /></xsl:attribute>
                        </iframe>
                      </div>
                    </div>
                  </div>
                  <!-- Focus guard: catches Tab escapes out of the iframe and
                       loops focus back to the close button. See maas-mata.js. -->
                  <span tabindex="0" aria-hidden="true" data-focus-guard="herovideo"></span>
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
