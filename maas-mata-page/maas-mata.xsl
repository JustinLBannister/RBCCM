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

  <!-- Hero -->
  <xsl:variable name="HERO_EYEBROW"        select="/Properties/Datum[@ID='HeroEyebrow']" />
  <xsl:variable name="HERO_TITLE_1"        select="/Properties/Datum[@ID='HeroTitleLine1']" />
  <xsl:variable name="HERO_TITLE_2"        select="/Properties/Datum[@ID='HeroTitleLine2']" />
  <xsl:variable name="HERO_SUBTITLE"       select="/Properties/Datum[@ID='HeroSubtitle']" />
  <xsl:variable name="HERO_CTA_LABEL"      select="/Properties/Datum[@ID='HeroCtaLabel']" />
  <xsl:variable name="HERO_CTA_HREF"       select="/Properties/Datum[@ID='HeroCtaHref']" />

  <!-- Chart Card -->
  <xsl:variable name="CHART_IMG_DESKTOP"   select="/Properties/Datum[@ID='ChartImageDesktop']" />
  <xsl:variable name="CHART_IMG_MOBILE"    select="/Properties/Datum[@ID='ChartImageMobile']" />
  <xsl:variable name="CHART_IMG_ALT"       select="/Properties/Datum[@ID='ChartImageAlt']" />
  <xsl:variable name="CHART_BC_ACCOUNT"    select="normalize-space(/Properties/Datum[@ID='ChartBrightcoveAccount'])" />
  <xsl:variable name="CHART_BC_PLAYER"     select="normalize-space(/Properties/Datum[@ID='ChartBrightcovePlayer'])" />
  <xsl:variable name="CHART_BC_VIDEO"      select="normalize-space(/Properties/Datum[@ID='ChartBrightcoveVideoId'])" />
  <xsl:variable name="CHART_HAS_VIDEO"     select="$CHART_BC_VIDEO != ''" />

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

  <!-- Awards eyebrow (housed in the Awards Section Header group
       for authoring convenience — see properties file). -->
  <xsl:variable name="AWD_EYEBROW"
    select="/Properties/Data/Group[@Name='Awards Section Header']/Datum[@ID='AwardsEyebrow']" />


  <!-- ============================================================
       MAIN TEMPLATE
       ============================================================ -->
  <xsl:template match="/">

    <!-- Component stylesheet + script. animate.css CDN also required
         (loaded once on the page shell alongside other RBCCM assets). -->
    <link rel="stylesheet" href="/assets/rbccm/css/pages/maas-mata.css"/>

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
          <symbol id="mata-cap-icon-equities" viewBox="0 0 30 30"/>
          <symbol id="mata-cap-icon-fx"       viewBox="0 0 27 30"/>
          <symbol id="mata-cap-icon-futures"  viewBox="0 0 30 30"/>
          <symbol id="mata-cap-icon-info"     viewBox="0 0 30 30"/>
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
            <a class="rbccm-maas-mata__btn rbccm-maas-mata__btn--blue" data-json-attr-href="hero.primaryCta.href">
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
        <picture>
          <source media="(min-width: 992px)">
            <xsl:attribute name="srcset"><xsl:value-of select="$CHART_IMG_DESKTOP" /></xsl:attribute>
          </source>
          <img>
            <xsl:attribute name="src"><xsl:value-of select="$CHART_IMG_MOBILE" /></xsl:attribute>
            <xsl:attribute name="alt"><xsl:value-of select="$CHART_IMG_ALT" /></xsl:attribute>
          </img>
        </picture>
        <xsl:if test="$CHART_HAS_VIDEO">
          <button type="button" class="rbccm-maas-mata__chart-play" data-video-play="" aria-label="Play video">
            <xsl:attribute name="data-bc-account"><xsl:value-of select="$CHART_BC_ACCOUNT" /></xsl:attribute>
            <xsl:attribute name="data-bc-player"><xsl:value-of select="$CHART_BC_PLAYER" /></xsl:attribute>
            <xsl:attribute name="data-bc-video"><xsl:value-of select="$CHART_BC_VIDEO" /></xsl:attribute>
          </button>
        </xsl:if>
      </div>


      <!-- ═══ DEEP-BAND WRAPPER (new-standard + awards + platforms) ═══ -->
      <div class="rbccm-maas-mata__dark-strip">

        <!-- 3. NEW STANDARD -->
        <section class="rbccm-maas-mata__new-standard" aria-label="A new standard for multi-asset trading">
          <div class="rbccm-maas-mata__container">
            <h2 class="rbccm-maas-mata__new-standard-heading" data-animate="fadeInUp">
              <span class="rbccm-maas-mata__new-standard-heading-lead" data-json="newStandard.headingLead"><xsl:value-of select="$NS_LEAD" /></span>
              <span class="rbccm-maas-mata__new-standard-heading-highlight" data-json="newStandard.headingHighlight"><xsl:value-of select="$NS_HIGHLIGHT" /></span>
              <span class="rbccm-maas-mata__new-standard-heading-accent" data-json="newStandard.headingHighlightAccent"><xsl:value-of select="$NS_ACCENT" /></span>
            </h2>
            <div class="rbccm-maas-mata__new-standard-body" data-animate="fadeInUp" data-animate-delay="150" data-json-list="newStandard.body">
              <template><p data-json=""></p></template>
              <xsl:for-each select="/Properties/Data/Group[@Name='New Standard Paragraph']">
                <p><xsl:value-of select="Datum[@ID='Paragraph']" disable-output-escaping="yes" /></p>
              </xsl:for-each>
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

          <div class="rbccm-maas-mata__awards-track" data-awards-track="" data-json-list="awards.items">
              <template>
                <article class="rbccm-maas-mata__award-card">
                  <div class="rbccm-maas-mata__award-year" data-json="year"></div>
                  <h6 class="rbccm-maas-mata__award-title" data-json="title"></h6>
                  <div class="rbccm-maas-mata__award-issuer" data-json="issuer"></div>
                </article>
              </template>
            <xsl:for-each select="/Properties/Data/Group[@Name='Award']">
              <article class="rbccm-maas-mata__award-card">
                <div class="rbccm-maas-mata__award-year"><xsl:value-of select="Datum[@ID='Year']" /></div>
                <h6 class="rbccm-maas-mata__award-title"><xsl:value-of select="Datum[@ID='Title']" /></h6>
                <div class="rbccm-maas-mata__award-issuer"><xsl:value-of select="Datum[@ID='Issuer']" /></div>
              </article>
            </xsl:for-each>
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

            <div class="rbccm-maas-mata__platforms-grid" data-json-list="platforms.cards">
              <xsl:for-each select="/Properties/Data/Group[@Name='Platform Card']">
                <article>
                  <xsl:attribute name="class">rbccm-maas-mata__platform-card<xsl:choose>
                      <xsl:when test="translate(normalize-space(Datum[@ID='Theme']/Option[@Selected='true']/Value), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'dark'"> rbccm-maas-mata__platform-card--dark</xsl:when>
                      <xsl:otherwise> rbccm-maas-mata__platform-card--light</xsl:otherwise>
                    </xsl:choose></xsl:attribute>
                  <div class="rbccm-maas-mata__platform-eyebrow"><xsl:value-of select="Datum[@ID='Eyebrow']" /></div>
                  <h3 class="rbccm-maas-mata__platform-title"><xsl:value-of select="Datum[@ID='Title']" /></h3>
                  <p class="rbccm-maas-mata__platform-body"><xsl:value-of select="Datum[@ID='Body']" disable-output-escaping="yes" /></p>
                  <ul class="rbccm-maas-mata__platform-bullets">
                    <xsl:for-each select="Datum[starts-with(@ID, 'Bullet')]">
                      <xsl:if test="normalize-space(.) != ''">
                        <li><xsl:value-of select="." /></li>
                      </xsl:if>
                    </xsl:for-each>
                  </ul>
                </article>
              </xsl:for-each>
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

          <ol class="rbccm-maas-mata__innovation-era-list" data-json-list="innovationEra.features">
            <xsl:for-each select="/Properties/Data/Group[@Name='Innovation Feature']">
              <li class="rbccm-maas-mata__innovation-era-item" data-animate="fadeInUp">
                <xsl:attribute name="data-animate-delay"><xsl:value-of select="150 * position()" /></xsl:attribute>
                <div class="rbccm-maas-mata__innovation-era-number">/<xsl:value-of select="Datum[@ID='Number']" /></div>
                <h3 class="rbccm-maas-mata__innovation-era-title"><xsl:value-of select="Datum[@ID='Title']" /></h3>
                <p class="rbccm-maas-mata__innovation-era-body-item"><xsl:value-of select="Datum[@ID='Body']" disable-output-escaping="yes" /></p>
              </li>
            </xsl:for-each>
          </ol>
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

          <div class="rbccm-maas-mata__mata-cap-grid" data-json-list="mataCapabilities.cards">
            <xsl:for-each select="/Properties/Data/Group[@Name='MATA Capability Card']">
              <article class="rbccm-maas-mata__mata-cap-card" data-animate="fadeInUp">
                <xsl:attribute name="data-animate-delay"><xsl:value-of select="150 * position()" /></xsl:attribute>
                <div class="rbccm-maas-mata__mata-cap-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
                    <use>
                      <xsl:attribute name="href">#mata-cap-icon-<xsl:value-of select="Datum[@ID='Icon']/Option[@Selected='true']/Value" /></xsl:attribute>
                    </use>
                  </svg>
                </div>
                <h3 class="rbccm-maas-mata__mata-cap-title"><xsl:value-of select="Datum[@ID='Title']" /></h3>
                <div class="rbccm-maas-mata__mata-cap-subtitle"><xsl:value-of select="Datum[@ID='Subtitle']" /></div>
                <p class="rbccm-maas-mata__mata-cap-body"><xsl:value-of select="Datum[@ID='Body']" disable-output-escaping="yes" /></p>
              </article>
            </xsl:for-each>

            <!-- Fixed Index Events card (full width below the 3-card grid) -->
            <article class="rbccm-maas-mata__mata-cap-wide" data-animate="fadeInUp">
              <div class="rbccm-maas-mata__mata-cap-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
                  <use>
                    <xsl:attribute name="href">#mata-cap-icon-<xsl:value-of select="$MC_INDEX_ICON" /></xsl:attribute>
                  </use>
                </svg>
              </div>
              <h3 class="rbccm-maas-mata__mata-cap-title"><xsl:value-of select="$MC_INDEX_TITLE" /></h3>
              <div class="rbccm-maas-mata__mata-cap-subtitle"><xsl:value-of select="$MC_INDEX_SUBTITLE" /></div>
              <p class="rbccm-maas-mata__mata-cap-body"><xsl:value-of select="$MC_INDEX_BODY" disable-output-escaping="yes" /></p>
            </article>
          </div>
        </section>


        <!-- 8. MARKET INSIGHTS -->
        <section class="rbccm-maas-mata__market-insights">
          <div class="rbccm-maas-mata__container">
            <h5 class="rbccm-maas-mata__market-insights-eyebrow" data-animate="fadeInUp" data-json="marketInsights.eyebrow"><xsl:value-of select="$MK_EYEBROW" /></h5>
            <h2 class="rbccm-maas-mata__market-insights-heading" data-animate="fadeInUp" data-animate-delay="100" data-json="marketInsights.heading"><xsl:value-of select="$MK_HEADING" /></h2>

            <div class="rbccm-maas-mata__featured-track" data-animate="fadeInUp" data-animate-delay="200" data-insights-track="" data-json-list="marketInsights.items">
              <xsl:for-each select="/Properties/Data/Group[@Name='Market Insight']">
                <article class="rbccm-maas-mata__featured-card">
                  <div class="rbccm-maas-mata__featured-eyebrow"><xsl:value-of select="Datum[@ID='Eyebrow']" /></div>
                  <h3 class="rbccm-maas-mata__featured-title"><xsl:value-of select="Datum[@ID='Title']" /></h3>
                  <p class="rbccm-maas-mata__featured-body"><xsl:value-of select="Datum[@ID='Body']" disable-output-escaping="yes" /></p>
                  <a class="rbccm-maas-mata__featured-cta">
                    <xsl:attribute name="href"><xsl:value-of select="Datum[@ID='CtaHref']" /></xsl:attribute>
                    <span class="rbccm-maas-mata__featured-cta-read"><xsl:value-of select="Datum[@ID='CtaLabel']" /></span>
                    <svg class="rbccm-maas-mata__featured-cta-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </a>
                </article>
              </xsl:for-each>
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
              <span data-json="demoCta.headlinePrefix"><xsl:value-of select="$DEMO_PREFIX" /></span><span class="rbccm-maas-mata__demo-heading-highlight" data-json="demoCta.headlineHighlight"><xsl:value-of select="$DEMO_HIGHLIGHT" /></span>.
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


      <!-- ═══ 10. NEWSLETTER ═══════════════════════════════════
           The <form> element gets Marketo data-* attributes on
           it; the Marketo loader (loaded elsewhere on the page)
           watches for that + injects its own field markup INSIDE
           the form. Everything below <div class="__fields"> is
           an author-editable fallback that also renders standalone
           if Marketo doesn't take over. -->
      <section class="rbccm-maas-mata__newsletter" aria-label="Stay informed">
        <div class="rbccm-maas-mata__container">
          <h2 class="rbccm-maas-mata__newsletter-heading" data-json="newsletter.heading"><xsl:value-of select="$NL_HEADING" /></h2>
          <p class="rbccm-maas-mata__newsletter-body" data-json-html="newsletter.body"><xsl:value-of select="$NL_BODY" disable-output-escaping="yes" /></p>

          <form class="rbccm-maas-mata__newsletter-form" method="post" data-json-attr-data-marketo-form-id="newsletter.marketoFormId">
            <xsl:if test="$NL_MARKETO_BASE != ''">
              <xsl:attribute name="data-marketo-base-url"><xsl:value-of select="$NL_MARKETO_BASE" /></xsl:attribute>
            </xsl:if>
            <xsl:if test="$NL_MARKETO_MUNCHKIN != ''">
              <xsl:attribute name="data-marketo-munchkin-id"><xsl:value-of select="$NL_MARKETO_MUNCHKIN" /></xsl:attribute>
            </xsl:if>
            <xsl:if test="$NL_MARKETO_FORM != ''">
              <xsl:attribute name="data-marketo-form-id"><xsl:value-of select="$NL_MARKETO_FORM" /></xsl:attribute>
            </xsl:if>

            <div class="rbccm-maas-mata__newsletter-fields" data-json-list="newsletter.fields">
              <xsl:for-each select="/Properties/Data/Group[@Name='Newsletter Field']">
                <label class="rbccm-maas-mata__newsletter-field">
                  <span class="rbccm-maas-mata__newsletter-label"><xsl:value-of select="Datum[@ID='Label']" /></span>
                  <input class="rbccm-maas-mata__newsletter-input">
                    <xsl:attribute name="name"><xsl:value-of select="Datum[@ID='Name']" /></xsl:attribute>
                    <xsl:attribute name="type"><xsl:value-of select="Datum[@ID='Type']/Option[@Selected='true']/Value" /></xsl:attribute>
                  </input>
                </label>
              </xsl:for-each>
            </div>

            <xsl:if test="normalize-space($NL_LINKEDIN_HREF) != ''">
              <a class="rbccm-maas-mata__newsletter-linkedin">
                <xsl:attribute name="href"><xsl:value-of select="$NL_LINKEDIN_HREF" /></xsl:attribute>
                <xsl:value-of select="$NL_LINKEDIN_LABEL" />
              </a>
            </xsl:if>

            <label class="rbccm-maas-mata__newsletter-consent">
              <input type="checkbox" class="rbccm-maas-mata__newsletter-consent-check" />
              <span>
                <xsl:value-of select="$NL_CONSENT" disable-output-escaping="yes" />
                <xsl:text> </xsl:text>
                <a class="rbccm-maas-mata__newsletter-privacy">
                  <xsl:attribute name="href"><xsl:value-of select="$NL_PRIVACY_HREF" /></xsl:attribute>
                  <xsl:value-of select="$NL_PRIVACY_LABEL" />
                </a>
              </span>
            </label>

            <button type="submit" class="rbccm-maas-mata__newsletter-submit">
              <span class="rbccm-maas-mata__newsletter-submit-label" data-json="newsletter.submitLabel"><xsl:value-of select="$NL_SUBMIT_LABEL" /></span>
              <svg class="rbccm-maas-mata__newsletter-submit-icon" xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" focusable="false">
                <path d="M0.530273 0.530273L5.53027 5.53027L0.530273 10.5303" stroke="white" stroke-width="1.5"/>
              </svg>
            </button>
          </form>
        </div>
      </section>

    </div><!-- /.rbccm-maas-mata -->

    <!-- Video modal: only emitted when the chart card has a Brightcove
         video attached, otherwise there's no play button to trigger it. -->
    <xsl:if test="$CHART_HAS_VIDEO">
      <div class="rbccm-maas-mata__video-modal" id="rbccm-mm-video-modal" hidden="hidden" role="dialog" aria-modal="true" aria-label="Video player">
        <div class="rbccm-maas-mata__video-modal-backdrop" data-video-close=""></div>
        <div class="rbccm-maas-mata__video-modal-dialog">
          <button type="button" class="rbccm-maas-mata__video-modal-close" data-video-close="" aria-label="Close video">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <div class="rbccm-maas-mata__video-modal-frame">
            <iframe class="rbccm-maas-mata__video-modal-iframe" data-video-iframe="" allow="autoplay; fullscreen" allowfullscreen=""></iframe>
          </div>
        </div>
      </div>
    </xsl:if>

    <script src="/assets/rbccm/js/pages/maas-mata.js"></script>

  </xsl:template>
</xsl:stylesheet>
