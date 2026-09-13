<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Tabbed Panels - XSL skin

  Renders a section shell + optional title/lede + 4-tab tablist with
  matching panels. All content is Datum-driven; the runtime JS wires
  tab-click + accordion behavior on top.

  Reads:
    /Properties/Data/Datum[@ID='...']

  Emits:
    <link rel="stylesheet" href="{CssPath}?v={CacheVersion}">
    <section class="rbccm-tabbed-panels[ modifiers]" id="{SectionID}"
             aria-label="{SectionAriaLabel}">
      <h2 class="rbccm-tabbed-panels__title">...</h2>       (if Title)
      <p class="rbccm-tabbed-panels__lede">...</p>          (if Lede)
      <div class="rbccm-tabbed-panels__tablist" role="group"
           aria-label="{TablistAriaLabel}">
        <button class="rbccm-tabbed-panels__tab[ is-active]"
                data-panel="{slug}"
                aria-expanded="true|false"
                aria-controls="{panel-id}"
                aria-label="{Label}, tab N of {count}">
          {Label}{chevron-svg}
        </button>
        ... one per tab ...
        <div class="rbccm-tabbed-panels__panel[ is-active]"
             id="{panel-id}"
             data-panel="{slug}"
             role="region" tabindex="0"
             aria-label="{Label}">
          {Tab{N}Content}
        </div>
        ... one per tab ...
      </div>
    </section>
    <script src="{JsPath}?v={CacheVersion}"></script>

  Tab visibility: a tab renders only when its Tab{N}Label is non-empty.
  Content editors can leave later slots blank to use 2 or 3 tabs.

  Slug fallback: if Tab{N}Slug is blank, the XSL derives a slug from
  Tab{N}Label by lowercasing and stripping non-alphanumeric characters
  (spaces, slashes, ampersands). "Europe / Asia Pacific" -> "europeasiapacific".
-->
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- ============================================================
       Preset helpers - month name + long-form publish date.
       Used by the how-we-think preset's Conferences (SEP 21) and
       Newsroom (September 4, 2026) blocks. Kept as named templates
       so both branches can share the lookup without duplicating
       month tables. XSL 1.0 compatible.
       ============================================================ -->
  <xsl:template name="tpMonthShort">
    <xsl:param name="m"/>
    <xsl:choose>
      <xsl:when test="$m = '01' or $m = '1'">Jan</xsl:when>
      <xsl:when test="$m = '02' or $m = '2'">Feb</xsl:when>
      <xsl:when test="$m = '03' or $m = '3'">Mar</xsl:when>
      <xsl:when test="$m = '04' or $m = '4'">Apr</xsl:when>
      <xsl:when test="$m = '05' or $m = '5'">May</xsl:when>
      <xsl:when test="$m = '06' or $m = '6'">Jun</xsl:when>
      <xsl:when test="$m = '07' or $m = '7'">Jul</xsl:when>
      <xsl:when test="$m = '08' or $m = '8'">Aug</xsl:when>
      <xsl:when test="$m = '09' or $m = '9'">Sep</xsl:when>
      <xsl:when test="$m = '10'">Oct</xsl:when>
      <xsl:when test="$m = '11'">Nov</xsl:when>
      <xsl:when test="$m = '12'">Dec</xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="tpPublishDate">
    <xsl:param name="d"/>
    <xsl:variable name="vYear" select="substring-before($d, '-')"/>
    <xsl:variable name="vnumMonth" select="number(substring-before(substring-after($d, '-'), '-'))"/>
    <xsl:variable name="vDay" select="number(substring-after(substring-after($d, '-'), '-'))"/>
    <xsl:choose>
      <xsl:when test="$vnumMonth = 1">January</xsl:when>
      <xsl:when test="$vnumMonth = 2">February</xsl:when>
      <xsl:when test="$vnumMonth = 3">March</xsl:when>
      <xsl:when test="$vnumMonth = 4">April</xsl:when>
      <xsl:when test="$vnumMonth = 5">May</xsl:when>
      <xsl:when test="$vnumMonth = 6">June</xsl:when>
      <xsl:when test="$vnumMonth = 7">July</xsl:when>
      <xsl:when test="$vnumMonth = 8">August</xsl:when>
      <xsl:when test="$vnumMonth = 9">September</xsl:when>
      <xsl:when test="$vnumMonth = 10">October</xsl:when>
      <xsl:when test="$vnumMonth = 11">November</xsl:when>
      <xsl:when test="$vnumMonth = 12">December</xsl:when>
    </xsl:choose>
    <xsl:text> </xsl:text>
    <xsl:value-of select="$vDay"/>, <xsl:value-of select="$vYear"/>
  </xsl:template>

  <!-- text()[last()] isolates the trailing text of a Datum whose
       body may contain child <Option>/<Display>/<Value> elements
       (the plain <xsl:value-of/> would concatenate all descendant
       text, defeating the "default value after the options" pattern). -->
  <xsl:template match="/">

    <!-- ==================== Datum lookups ==================== -->
    <xsl:variable name="SECTION_ID"        select="normalize-space(/Properties/Data/Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"      select="normalize-space(/Properties/Data/Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="TABLIST_ARIA"      select="normalize-space(/Properties/Data/Datum[@ID='TablistAriaLabel']/text()[last()])"/>

    <xsl:variable name="TITLE"             select="/Properties/Data/Datum[@ID='Title']"/>
    <xsl:variable name="LEDE"              select="/Properties/Data/Datum[@ID='Lede']"/>

    <xsl:variable name="PRESET"            select="normalize-space(/Properties/Data/Datum[@ID='Preset']/text()[last()])"/>
    <xsl:variable name="PLACEMENT"         select="normalize-space(/Properties/Data/Datum[@ID='Placement']/text()[last()])"/>
    <xsl:variable name="ALIGNMENT"         select="normalize-space(/Properties/Data/Datum[@ID='Alignment']/text()[last()])"/>

    <xsl:variable name="CSS_PATH"          select="normalize-space(/Properties/Data/Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"           select="normalize-space(/Properties/Data/Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"     select="normalize-space(/Properties/Data/Datum[@ID='CacheVersion']/text()[last()])"/>

    <xsl:variable name="TAB1_LABEL"        select="normalize-space(/Properties/Data/Datum[@ID='Tab1Label']/text()[last()])"/>
    <xsl:variable name="TAB1_SLUG_RAW"     select="normalize-space(/Properties/Data/Datum[@ID='Tab1Slug']/text()[last()])"/>
    <xsl:variable name="TAB1_CONTENT"      select="/Properties/Data/Datum[@ID='Tab1Content']"/>

    <xsl:variable name="TAB2_LABEL"        select="normalize-space(/Properties/Data/Datum[@ID='Tab2Label']/text()[last()])"/>
    <xsl:variable name="TAB2_SLUG_RAW"     select="normalize-space(/Properties/Data/Datum[@ID='Tab2Slug']/text()[last()])"/>
    <xsl:variable name="TAB2_CONTENT"      select="/Properties/Data/Datum[@ID='Tab2Content']"/>

    <xsl:variable name="TAB3_LABEL"        select="normalize-space(/Properties/Data/Datum[@ID='Tab3Label']/text()[last()])"/>
    <xsl:variable name="TAB3_SLUG_RAW"     select="normalize-space(/Properties/Data/Datum[@ID='Tab3Slug']/text()[last()])"/>
    <xsl:variable name="TAB3_CONTENT"      select="/Properties/Data/Datum[@ID='Tab3Content']"/>

    <xsl:variable name="TAB4_LABEL"        select="normalize-space(/Properties/Data/Datum[@ID='Tab4Label']/text()[last()])"/>
    <xsl:variable name="TAB4_SLUG_RAW"     select="normalize-space(/Properties/Data/Datum[@ID='Tab4Slug']/text()[last()])"/>
    <xsl:variable name="TAB4_CONTENT"      select="/Properties/Data/Datum[@ID='Tab4Content']"/>

    <!-- Slug fallback: derive from label when slug is blank.
         translate() strips spaces, slashes, ampersands, periods,
         commas, and parens; then lowercase via the ASCII alphabet
         translation pair. XSL 1.0 has no toLowerCase() so we roll
         the translation manually. -->
    <xsl:variable name="TAB1_SLUG">
      <xsl:choose>
        <xsl:when test="$TAB1_SLUG_RAW != ''"><xsl:value-of select="$TAB1_SLUG_RAW"/></xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="translate(translate($TAB1_LABEL, ' /&amp;.,()', ''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TAB2_SLUG">
      <xsl:choose>
        <xsl:when test="$TAB2_SLUG_RAW != ''"><xsl:value-of select="$TAB2_SLUG_RAW"/></xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="translate(translate($TAB2_LABEL, ' /&amp;.,()', ''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TAB3_SLUG">
      <xsl:choose>
        <xsl:when test="$TAB3_SLUG_RAW != ''"><xsl:value-of select="$TAB3_SLUG_RAW"/></xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="translate(translate($TAB3_LABEL, ' /&amp;.,()', ''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TAB4_SLUG">
      <xsl:choose>
        <xsl:when test="$TAB4_SLUG_RAW != ''"><xsl:value-of select="$TAB4_SLUG_RAW"/></xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="translate(translate($TAB4_LABEL, ' /&amp;.,()', ''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Count of visible tabs (labels that are non-blank). Used for
         the "tab N of M" ARIA label so screen readers announce
         position correctly. -->
    <xsl:variable name="TAB_COUNT">
      <xsl:variable name="c1"><xsl:choose><xsl:when test="$TAB1_LABEL != ''">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>
      <xsl:variable name="c2"><xsl:choose><xsl:when test="$TAB2_LABEL != ''">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>
      <xsl:variable name="c3"><xsl:choose><xsl:when test="$TAB3_LABEL != ''">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>
      <xsl:variable name="c4"><xsl:choose><xsl:when test="$TAB4_LABEL != ''">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:variable>
      <xsl:value-of select="$c1 + $c2 + $c3 + $c4"/>
    </xsl:variable>

    <!-- Root modifier class(es) from preset + placement + alignment.
         The preset modifier is scoped to enable per-variant CSS hooks
         (e.g. .rbccm-tabbed-panels__conference-insights .__inner-panel
         after class-name substitution). data-preset is also stamped
         on the section for JS branching. -->
    <xsl:variable name="ROOT_CLASS">
      <xsl:text>rbccm-tabbed-panels</xsl:text>
      <xsl:if test="$PRESET != '' and $PRESET != 'generic'">
        <xsl:text> rbccm-tabbed-panels--</xsl:text><xsl:value-of select="$PRESET"/>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$PLACEMENT = 'compact-headless'"> rbccm-tabbed-panels--compact rbccm-tabbed-panels--headless</xsl:when>
        <xsl:when test="$PLACEMENT = 'dark'"> rbccm-tabbed-panels--dark</xsl:when>
        <xsl:when test="$PLACEMENT = 'on-ltblue'"> rbccm-tabbed-panels--on-ltblue</xsl:when>
      </xsl:choose>
      <xsl:choose>
        <xsl:when test="$ALIGNMENT = 'title-left'"> rbccm-tabbed-panels--title-left</xsl:when>
        <xsl:when test="$ALIGNMENT = 'lede-left'"> rbccm-tabbed-panels--lede-left</xsl:when>
        <xsl:when test="$ALIGNMENT = 'align-left'"> rbccm-tabbed-panels--align-left</xsl:when>
      </xsl:choose>
    </xsl:variable>

    <!-- Chevron SVG shared across every tab. Kept as a variable to
         avoid duplicating the path markup four times below. -->
    <xsl:variable name="CHEVRON_SVG"><![CDATA[<svg xmlns="http://www.w3.org/2000/svg" class="rbccm-tabbed-panels__tab-chevron" width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.59 15.555L12 10.9317L7.41 15.555L6 14.1316L12 8.07493L18 14.1316L16.59 15.555Z" fill="currentColor"/></svg>]]></xsl:variable>

    <!-- ============ HOW WE THINK preset lookups ============
         All HWT-prefixed Datums land here regardless of preset;
         the render branch below reads them only when
         $PRESET = 'how-we-think'. Cheap to compute unconditionally
         and keeps the variable block co-located with the shell's
         other lookups. -->
    <xsl:variable name="HWT_INSIGHTS_TAB_LABEL"    select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsTabLabel']/text()[last()])"/>
    <xsl:variable name="HWT_NEWSROOM_TAB_LABEL"    select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomTabLabel']/text()[last()])"/>
    <xsl:variable name="HWT_CONFERENCES_TAB_LABEL" select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesTabLabel']/text()[last()])"/>

    <xsl:variable name="HWT_INSIGHTS_LEDE"    select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsLede']/text()[last()])"/>
    <xsl:variable name="HWT_NEWSROOM_LEDE"    select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomLede']/text()[last()])"/>
    <xsl:variable name="HWT_CONFERENCES_LEDE" select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesLede']/text()[last()])"/>

    <xsl:variable name="HWT_INSIGHTS_CTA_LABEL"     select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsCtaLabel']/text()[last()])"/>
    <xsl:variable name="HWT_INSIGHTS_CTA_LINK"      select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsCtaLink']/text()[last()])"/>
    <xsl:variable name="HWT_INSIGHTS_CTA_NEWTAB"    select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsCtaNewTab']/text()[last()]) = 'true'"/>
    <xsl:variable name="HWT_INSIGHTS_CTA_TITLE"     select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsCtaTitle']/text()[last()])"/>
    <xsl:variable name="HWT_INSIGHTS_CTA_ARIA"      select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightsCtaAriaLabel']/text()[last()])"/>

    <xsl:variable name="HWT_NEWSROOM_CTA_LABEL"     select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomCtaLabel']/text()[last()])"/>
    <xsl:variable name="HWT_NEWSROOM_CTA_LINK"      select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomCtaLink']/text()[last()])"/>
    <xsl:variable name="HWT_NEWSROOM_CTA_NEWTAB"    select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomCtaNewTab']/text()[last()]) = 'true'"/>
    <xsl:variable name="HWT_NEWSROOM_CTA_TITLE"     select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomCtaTitle']/text()[last()])"/>
    <xsl:variable name="HWT_NEWSROOM_CTA_ARIA"      select="normalize-space(/Properties/Data/Datum[@ID='HwtNewsroomCtaAriaLabel']/text()[last()])"/>

    <xsl:variable name="HWT_CONFERENCES_CTA_LABEL"  select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesCtaLabel']/text()[last()])"/>
    <xsl:variable name="HWT_CONFERENCES_CTA_LINK"   select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesCtaLink']/text()[last()])"/>
    <xsl:variable name="HWT_CONFERENCES_CTA_NEWTAB" select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesCtaNewTab']/text()[last()]) = 'true'"/>
    <xsl:variable name="HWT_CONFERENCES_CTA_TITLE"  select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesCtaTitle']/text()[last()])"/>
    <xsl:variable name="HWT_CONFERENCES_CTA_ARIA"   select="normalize-space(/Properties/Data/Datum[@ID='HwtConferencesCtaAriaLabel']/text()[last()])"/>

    <!-- Locale, lower-cased with en fallback. Compared against
         TeamSite/Metadata/language on newsroom records so only
         same-language articles surface. -->
    <xsl:variable name="HWT_LOCALE">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Data/Datum[@ID='HwtLocale']/text()[last()]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'fr'">fr</xsl:when>
        <xsl:otherwise>en</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Insight tile URLs + optional overrides (3 fixed slots). -->
    <xsl:variable name="HWT_TILE1_URL"      select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide1Url']/text()[last()])"/>
    <xsl:variable name="HWT_TILE1_EYEBROW"  select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide1EyebrowOverride']/text()[last()])"/>
    <xsl:variable name="HWT_TILE1_READTIME" select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide1ReadTimeOverride']/text()[last()])"/>
    <xsl:variable name="HWT_TILE2_URL"      select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide2Url']/text()[last()])"/>
    <xsl:variable name="HWT_TILE2_EYEBROW"  select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide2EyebrowOverride']/text()[last()])"/>
    <xsl:variable name="HWT_TILE2_READTIME" select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide2ReadTimeOverride']/text()[last()])"/>
    <xsl:variable name="HWT_TILE3_URL"      select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide3Url']/text()[last()])"/>
    <xsl:variable name="HWT_TILE3_EYEBROW"  select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide3EyebrowOverride']/text()[last()])"/>
    <xsl:variable name="HWT_TILE3_READTIME" select="normalize-space(/Properties/Data/Datum[@ID='HwtInsightSlide3ReadTimeOverride']/text()[last()])"/>

    <!-- Newsroom articles come from the External MetaQueryExternal
         findByQuery result set at /Properties/Data/Result/records/
         metaResult. Filtered by locale below. -->
    <xsl:variable name="HWT_NEWSROOM_ALL" select="/Properties/Data/Result/records/metaResult"/>
    <xsl:variable name="HWT_NEWSROOM_LOCALIZED" select="$HWT_NEWSROOM_ALL[
      translate(attr[@key='TeamSite/Metadata/language'], 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = $HWT_LOCALE
      or (not(attr[@key='TeamSite/Metadata/language'])
          and $HWT_LOCALE = 'en')
      or (normalize-space(attr[@key='TeamSite/Metadata/language']) = ''
          and $HWT_LOCALE = 'en')
    ]"/>

    <!-- Conferences: DCR events walked, filtered to homepage-flagged
         + future-dated, sorted by event_date. Uses XSL 2.0
         format-date + current-date. -->
    <xsl:variable name="HWT_ALL_EVENTS" select="/Properties/Data/Datum[@ID='HwtEventsList']/DCR/events/event"/>
    <xsl:variable name="HWT_TODAY" select="format-date(current-date(), '[Y0001][M01][D01]')"/>
    <xsl:variable name="HWT_HOMEPAGE_EVENTS" select="$HWT_ALL_EVENTS[
        contains(string(sitelocation), 'rbccm-homepage')
        and (concat(
              substring-before(event_date, '-'),
              substring-before(substring-after(event_date, '-'), '-'),
              substring-after(substring-after(event_date, '-'), '-')
            ) &gt;= $HWT_TODAY)
      ]"/>

    <!-- ============ CONFERENCE INSIGHTS preset lookups ============
         Ci-prefixed Datums populate regardless of preset; the branch
         below reads them only when $PRESET = 'conference-insights'.
         Section-level values (BC globals, default poster, ARIA
         overrides). Per-conference values are looked up on-demand
         inside the renderCiConference named template using
         concat('Ci', $n, 'FieldName') so a single template body
         handles Conference 1 / 2 / 3 without triplicating markup. -->
    <xsl:variable name="CI_BC_ACCOUNT"      select="normalize-space(/Properties/Data/Datum[@ID='CiBCAccount']/text()[last()])"/>
    <xsl:variable name="CI_BC_PLAYER"       select="normalize-space(/Properties/Data/Datum[@ID='CiBCPlayer']/text()[last()])"/>
    <xsl:variable name="CI_BC_EMBED"        select="normalize-space(/Properties/Data/Datum[@ID='CiBCEmbed']/text()[last()])"/>
    <xsl:variable name="CI_DEFAULT_POSTER"  select="normalize-space(/Properties/Data/Datum[@ID='CiDefaultPoster']/text()[last()])"/>

    <xsl:variable name="CI_ARIA_SPK_CAROUSEL" select="normalize-space(/Properties/Data/Datum[@ID='CiAriaSpeakersCarouselLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_INS_CAROUSEL" select="normalize-space(/Properties/Data/Datum[@ID='CiAriaInsightsCarouselLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_PREV_SPK"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaPrevSpeakerLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_NEXT_SPK"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaNextSpeakerLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_PREV_INS"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaPrevInsightLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_NEXT_INS"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaNextInsightLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_SPK_DOTS"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaSpeakersDotsLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_INS_DOTS"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaInsightsDotsLabel']/text()[last()])"/>
    <xsl:variable name="CI_ARIA_VIEW_ALL"     select="normalize-space(/Properties/Data/Datum[@ID='CiAriaViewAllInsightsLabel']/text()[last()])"/>

    <!-- Outer conference tab labels (also used as ARIA on outer tabs). -->
    <xsl:variable name="CI1_NAME" select="normalize-space(/Properties/Data/Datum[@ID='Ci1Name']/text()[last()])"/>
    <xsl:variable name="CI2_NAME" select="normalize-space(/Properties/Data/Datum[@ID='Ci2Name']/text()[last()])"/>
    <xsl:variable name="CI3_NAME" select="normalize-space(/Properties/Data/Datum[@ID='Ci3Name']/text()[last()])"/>

    <!-- ==================== Render ==================== -->

    <!-- Sidecar CSS — top of output so styles land before body paint. -->
    <link rel="stylesheet">
      <xsl:attribute name="href"><xsl:value-of select="$CSS_PATH"/>?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:attribute>
    </link>

    <section>
      <xsl:attribute name="class"><xsl:value-of select="$ROOT_CLASS"/></xsl:attribute>
      <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      <xsl:attribute name="data-preset">
        <xsl:choose>
          <xsl:when test="$PRESET != ''"><xsl:value-of select="$PRESET"/></xsl:when>
          <xsl:otherwise>generic</xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <xsl:if test="$SECTION_ARIA != ''">
        <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
      </xsl:if>

      <!-- Title + lede only when populated. The compact + headless
           placement hides them via CSS regardless, so no need to
           gate on placement here. -->
      <xsl:if test="normalize-space($TITLE) != ''">
        <h2 class="rbccm-tabbed-panels__title">
          <xsl:value-of select="$TITLE" disable-output-escaping="yes"/>
        </h2>
      </xsl:if>
      <xsl:if test="normalize-space($LEDE) != ''">
        <p class="rbccm-tabbed-panels__lede">
          <xsl:value-of select="$LEDE" disable-output-escaping="yes"/>
        </p>
      </xsl:if>

      <div class="rbccm-tabbed-panels__tablist" role="group">
        <xsl:if test="$TABLIST_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$TABLIST_ARIA"/></xsl:attribute>
        </xsl:if>
        <!-- Publish the visible tab count as a CSS custom prop so
             the desktop grid-template-columns resolves symmetrically
             for 2- and 3-tab authorings (default is 4). Kept as an
             inline style rather than a class so it needs no matching
             CSS rule per count. HWT preset is a fixed 3-tab layout. -->
        <xsl:attribute name="style">
          <xsl:choose>
            <xsl:when test="$PRESET = 'how-we-think'">--tp-tab-count: 3;</xsl:when>
            <xsl:when test="$PRESET = 'conference-insights'">--tp-tab-count: 3;</xsl:when>
            <xsl:otherwise>--tp-tab-count: <xsl:value-of select="$TAB_COUNT"/>;</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>

        <xsl:choose>

          <!-- ================================================
               HOW WE THINK preset - fixed 3 tabs, structured
               content per panel (insight tiles / newsroom list
               / conferences pills).
               ================================================ -->
          <xsl:when test="$PRESET = 'how-we-think'">

            <!-- Tab buttons -->
            <button type="button" aria-expanded="true">
              <xsl:attribute name="class">rbccm-tabbed-panels__tab is-active</xsl:attribute>
              <xsl:attribute name="data-panel">insights</xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-insights</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_INSIGHTS_TAB_LABEL"/>, tab 1 of 3</xsl:attribute>
              <xsl:value-of select="$HWT_INSIGHTS_TAB_LABEL"/>
              <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
            </button>
            <button type="button" aria-expanded="false">
              <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
              <xsl:attribute name="data-panel">newsroom</xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-newsroom</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_NEWSROOM_TAB_LABEL"/>, tab 2 of 3</xsl:attribute>
              <xsl:value-of select="$HWT_NEWSROOM_TAB_LABEL"/>
              <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
            </button>
            <button type="button" aria-expanded="false">
              <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
              <xsl:attribute name="data-panel">conferences</xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-conferences</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_CONFERENCES_TAB_LABEL"/>, tab 3 of 3</xsl:attribute>
              <xsl:value-of select="$HWT_CONFERENCES_TAB_LABEL"/>
              <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
            </button>

            <!-- Insights panel -->
            <div role="region" tabindex="0">
              <xsl:attribute name="class">rbccm-tabbed-panels__panel is-active</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-insights</xsl:attribute>
              <xsl:attribute name="data-panel">insights</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_INSIGHTS_TAB_LABEL"/></xsl:attribute>

              <xsl:if test="$HWT_INSIGHTS_LEDE != ''">
                <p class="rbccm-tabbed-panels__panel-lede"><xsl:value-of select="$HWT_INSIGHTS_LEDE"/></p>
              </xsl:if>

              <div class="rbccm-tabbed-panels__tiles">
                <xsl:if test="$HWT_TILE1_URL != ''">
                  <a class="rbccm-tabbed-panels__tile" href="{$HWT_TILE1_URL}">
                    <xsl:attribute name="data-hwt-url"><xsl:value-of select="$HWT_TILE1_URL"/></xsl:attribute>
                    <xsl:if test="$HWT_TILE1_EYEBROW  != ''"><xsl:attribute name="data-hwt-eyebrow"><xsl:value-of select="$HWT_TILE1_EYEBROW"/></xsl:attribute></xsl:if>
                    <xsl:if test="$HWT_TILE1_READTIME != ''"><xsl:attribute name="data-hwt-readtime"><xsl:value-of select="$HWT_TILE1_READTIME"/></xsl:attribute></xsl:if>
                    <div class="rbccm-tabbed-panels__tile-img"></div>
                    <div class="rbccm-tabbed-panels__tile-body">
                      <p class="rbccm-tabbed-panels__tile-eyebrow">INSIGHTS</p>
                      <div class="rbccm-tabbed-panels__tile-divider" aria-hidden="true"></div>
                      <h3 class="rbccm-tabbed-panels__tile-title"></h3>
                      <p class="rbccm-tabbed-panels__tile-copy"></p>
                    </div>
                  </a>
                </xsl:if>
                <xsl:if test="$HWT_TILE2_URL != ''">
                  <a class="rbccm-tabbed-panels__tile" href="{$HWT_TILE2_URL}">
                    <xsl:attribute name="data-hwt-url"><xsl:value-of select="$HWT_TILE2_URL"/></xsl:attribute>
                    <xsl:if test="$HWT_TILE2_EYEBROW  != ''"><xsl:attribute name="data-hwt-eyebrow"><xsl:value-of select="$HWT_TILE2_EYEBROW"/></xsl:attribute></xsl:if>
                    <xsl:if test="$HWT_TILE2_READTIME != ''"><xsl:attribute name="data-hwt-readtime"><xsl:value-of select="$HWT_TILE2_READTIME"/></xsl:attribute></xsl:if>
                    <div class="rbccm-tabbed-panels__tile-img"></div>
                    <div class="rbccm-tabbed-panels__tile-body">
                      <p class="rbccm-tabbed-panels__tile-eyebrow">INSIGHTS</p>
                      <div class="rbccm-tabbed-panels__tile-divider" aria-hidden="true"></div>
                      <h3 class="rbccm-tabbed-panels__tile-title"></h3>
                      <p class="rbccm-tabbed-panels__tile-copy"></p>
                    </div>
                  </a>
                </xsl:if>
                <xsl:if test="$HWT_TILE3_URL != ''">
                  <a class="rbccm-tabbed-panels__tile" href="{$HWT_TILE3_URL}">
                    <xsl:attribute name="data-hwt-url"><xsl:value-of select="$HWT_TILE3_URL"/></xsl:attribute>
                    <xsl:if test="$HWT_TILE3_EYEBROW  != ''"><xsl:attribute name="data-hwt-eyebrow"><xsl:value-of select="$HWT_TILE3_EYEBROW"/></xsl:attribute></xsl:if>
                    <xsl:if test="$HWT_TILE3_READTIME != ''"><xsl:attribute name="data-hwt-readtime"><xsl:value-of select="$HWT_TILE3_READTIME"/></xsl:attribute></xsl:if>
                    <div class="rbccm-tabbed-panels__tile-img"></div>
                    <div class="rbccm-tabbed-panels__tile-body">
                      <p class="rbccm-tabbed-panels__tile-eyebrow">INSIGHTS</p>
                      <div class="rbccm-tabbed-panels__tile-divider" aria-hidden="true"></div>
                      <h3 class="rbccm-tabbed-panels__tile-title"></h3>
                      <p class="rbccm-tabbed-panels__tile-copy"></p>
                    </div>
                  </a>
                </xsl:if>
              </div>

              <xsl:if test="$HWT_INSIGHTS_CTA_LABEL != '' and $HWT_INSIGHTS_CTA_LINK != ''">
                <div class="rbccm-tabbed-panels__cta-wrap">
                  <a class="rbccm-tabbed-panels__cta" href="{$HWT_INSIGHTS_CTA_LINK}">
                    <xsl:if test="$HWT_INSIGHTS_CTA_NEWTAB">
                      <xsl:attribute name="target">_blank</xsl:attribute>
                      <xsl:attribute name="rel">noopener</xsl:attribute>
                    </xsl:if>
                    <xsl:if test="$HWT_INSIGHTS_CTA_TITLE != ''">
                      <xsl:attribute name="title"><xsl:value-of select="$HWT_INSIGHTS_CTA_TITLE"/></xsl:attribute>
                    </xsl:if>
                    <xsl:if test="$HWT_INSIGHTS_CTA_ARIA != ''">
                      <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_INSIGHTS_CTA_ARIA"/></xsl:attribute>
                    </xsl:if>
                    <xsl:value-of select="$HWT_INSIGHTS_CTA_LABEL"/>
                  </a>
                </div>
              </xsl:if>
            </div>

            <!-- Newsroom panel -->
            <div role="region" tabindex="0">
              <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-newsroom</xsl:attribute>
              <xsl:attribute name="data-panel">newsroom</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_NEWSROOM_TAB_LABEL"/></xsl:attribute>

              <xsl:if test="$HWT_NEWSROOM_LEDE != ''">
                <p class="rbccm-tabbed-panels__panel-lede"><xsl:value-of select="$HWT_NEWSROOM_LEDE"/></p>
              </xsl:if>

              <div class="rbccm-tabbed-panels__news">
                <xsl:for-each select="$HWT_NEWSROOM_LOCALIZED">
                  <xsl:sort select="./attr[@key='TeamSite/Metadata/publishdate']" order="descending"/>
                  <xsl:if test="position() &lt;= 3">
                    <xsl:variable name="artTitle" select="./attr[@key='TeamSite/Metadata/Title']"/>
                    <xsl:variable name="artDesc"  select="./attr[@key='TeamSite/Metadata/Description']"/>
                    <xsl:variable name="artDate"  select="./attr[@key='TeamSite/Metadata/publishdate']"/>
                    <xsl:variable name="artExtLink" select="./attr[@key='TeamSite/Metadata/link']"/>
                    <xsl:variable name="artPath" select="./@path"/>
                    <xsl:variable name="artLink">
                      <xsl:choose>
                        <xsl:when test="$artExtLink != ''"><xsl:value-of select="$artExtLink"/></xsl:when>
                        <xsl:otherwise><xsl:value-of select="concat('/', $HWT_LOCALE, '/insights/story.page?dcr=', $artPath)"/></xsl:otherwise>
                      </xsl:choose>
                    </xsl:variable>

                    <div class="rbccm-tabbed-panels__news-item">
                      <span class="rbccm-tabbed-panels__news-date">
                        <xsl:call-template name="tpPublishDate">
                          <xsl:with-param name="d" select="$artDate"/>
                        </xsl:call-template>
                      </span>
                      <a class="rbccm-tabbed-panels__news-link">
                        <xsl:attribute name="href"><xsl:value-of select="$artLink"/></xsl:attribute>
                        <xsl:if test="$artExtLink != ''">
                          <xsl:attribute name="target">_blank</xsl:attribute>
                          <xsl:attribute name="rel">noopener</xsl:attribute>
                          <xsl:attribute name="aria-label">
                            <xsl:value-of select="normalize-space($artTitle)"/>
                            <xsl:choose>
                              <xsl:when test="$HWT_LOCALE = 'fr'"> (s'ouvre dans un nouvel onglet)</xsl:when>
                              <xsl:otherwise> (opens in new tab)</xsl:otherwise>
                            </xsl:choose>
                          </xsl:attribute>
                        </xsl:if>
                        <xsl:value-of select="$artTitle" disable-output-escaping="yes"/>
                      </a>
                      <p class="rbccm-tabbed-panels__news-summary">
                        <xsl:value-of select="$artDesc" disable-output-escaping="yes"/>
                      </p>
                    </div>
                  </xsl:if>
                </xsl:for-each>
              </div>

              <xsl:if test="$HWT_NEWSROOM_CTA_LABEL != '' and $HWT_NEWSROOM_CTA_LINK != ''">
                <div class="rbccm-tabbed-panels__cta-wrap">
                  <a class="rbccm-tabbed-panels__cta" href="{$HWT_NEWSROOM_CTA_LINK}">
                    <xsl:if test="$HWT_NEWSROOM_CTA_NEWTAB">
                      <xsl:attribute name="target">_blank</xsl:attribute>
                      <xsl:attribute name="rel">noopener</xsl:attribute>
                    </xsl:if>
                    <xsl:if test="$HWT_NEWSROOM_CTA_TITLE != ''">
                      <xsl:attribute name="title"><xsl:value-of select="$HWT_NEWSROOM_CTA_TITLE"/></xsl:attribute>
                    </xsl:if>
                    <xsl:if test="$HWT_NEWSROOM_CTA_ARIA != ''">
                      <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_NEWSROOM_CTA_ARIA"/></xsl:attribute>
                    </xsl:if>
                    <xsl:value-of select="$HWT_NEWSROOM_CTA_LABEL"/>
                  </a>
                </div>
              </xsl:if>
            </div>

            <!-- Conferences panel (server-rendered) -->
            <div role="region" tabindex="0">
              <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-conferences</xsl:attribute>
              <xsl:attribute name="data-panel">conferences</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_CONFERENCES_TAB_LABEL"/></xsl:attribute>

              <xsl:if test="$HWT_CONFERENCES_LEDE != ''">
                <p class="rbccm-tabbed-panels__panel-lede"><xsl:value-of select="$HWT_CONFERENCES_LEDE"/></p>
              </xsl:if>

              <div class="rbccm-tabbed-panels__conferences">
                <xsl:for-each select="$HWT_HOMEPAGE_EVENTS">
                  <xsl:sort select="normalize-space(event_date)" data-type="text" order="ascending"/>
                  <xsl:if test="position() &lt;= 3">
                    <xsl:variable name="eventDate" select="normalize-space(event_date)"/>
                    <xsl:variable name="eventDateEnd" select="normalize-space(event_date_end)"/>
                    <xsl:variable name="eventMonth" select="substring($eventDate, 6, 2)"/>
                    <xsl:variable name="eventDay" select="substring($eventDate, 9, 2)"/>
                    <xsl:variable name="eventDayEnd" select="substring($eventDateEnd, 9, 2)"/>
                    <xsl:variable name="monthLabel">
                      <xsl:call-template name="tpMonthShort"><xsl:with-param name="m" select="$eventMonth"/></xsl:call-template>
                    </xsl:variable>
                    <xsl:variable name="dayLabel">
                      <xsl:value-of select="number($eventDay)"/>
                      <xsl:if test="$eventDateEnd != '' and $eventDayEnd != '' and $eventDayEnd != $eventDay">
                        <xsl:text>-</xsl:text><xsl:value-of select="number($eventDayEnd)"/>
                      </xsl:if>
                    </xsl:variable>
                    <xsl:variable name="displayTitle">
                      <xsl:choose>
                        <xsl:when test="normalize-space(event_title_override) != ''">
                          <xsl:value-of select="normalize-space(event_title_override)"/>
                        </xsl:when>
                        <xsl:otherwise>
                          <xsl:value-of select="normalize-space(event_name)"/>
                        </xsl:otherwise>
                      </xsl:choose>
                    </xsl:variable>
                    <xsl:variable name="eventUrl" select="normalize-space(event_url)"/>
                    <xsl:variable name="newTab" select="normalize-space(newwindow) = 'y'"/>

                    <xsl:choose>
                      <xsl:when test="$eventUrl != ''">
                        <a class="rbccm-tabbed-panels__conference" href="{$eventUrl}">
                          <xsl:if test="$newTab">
                            <xsl:attribute name="target">_blank</xsl:attribute>
                            <xsl:attribute name="rel">noopener</xsl:attribute>
                          </xsl:if>
                          <div class="rbccm-tabbed-panels__conference-date">
                            <span class="rbccm-tabbed-panels__conference-month"><xsl:value-of select="$monthLabel"/></span>
                            <span class="rbccm-tabbed-panels__conference-day"><xsl:value-of select="$dayLabel"/></span>
                          </div>
                          <div>
                            <p class="rbccm-tabbed-panels__conference-location"><xsl:value-of select="normalize-space(location)"/></p>
                            <p class="rbccm-tabbed-panels__conference-name"><xsl:value-of select="$displayTitle"/></p>
                          </div>
                        </a>
                      </xsl:when>
                      <xsl:otherwise>
                        <div class="rbccm-tabbed-panels__conference">
                          <div class="rbccm-tabbed-panels__conference-date">
                            <span class="rbccm-tabbed-panels__conference-month"><xsl:value-of select="$monthLabel"/></span>
                            <span class="rbccm-tabbed-panels__conference-day"><xsl:value-of select="$dayLabel"/></span>
                          </div>
                          <div>
                            <p class="rbccm-tabbed-panels__conference-location"><xsl:value-of select="normalize-space(location)"/></p>
                            <p class="rbccm-tabbed-panels__conference-name"><xsl:value-of select="$displayTitle"/></p>
                          </div>
                        </div>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:if>
                </xsl:for-each>
              </div>

              <xsl:if test="$HWT_CONFERENCES_CTA_LABEL != '' and $HWT_CONFERENCES_CTA_LINK != ''">
                <div class="rbccm-tabbed-panels__cta-wrap">
                  <a class="rbccm-tabbed-panels__cta" href="{$HWT_CONFERENCES_CTA_LINK}">
                    <xsl:if test="$HWT_CONFERENCES_CTA_NEWTAB">
                      <xsl:attribute name="target">_blank</xsl:attribute>
                      <xsl:attribute name="rel">noopener</xsl:attribute>
                    </xsl:if>
                    <xsl:if test="$HWT_CONFERENCES_CTA_TITLE != ''">
                      <xsl:attribute name="title"><xsl:value-of select="$HWT_CONFERENCES_CTA_TITLE"/></xsl:attribute>
                    </xsl:if>
                    <xsl:if test="$HWT_CONFERENCES_CTA_ARIA != ''">
                      <xsl:attribute name="aria-label"><xsl:value-of select="$HWT_CONFERENCES_CTA_ARIA"/></xsl:attribute>
                    </xsl:if>
                    <xsl:value-of select="$HWT_CONFERENCES_CTA_LABEL"/>
                  </a>
                </div>
              </xsl:if>
            </div>

          </xsl:when>

          <!-- ================================================
               CONFERENCE INSIGHTS preset - nested tabs.
               Outer: 3 conferences (one tab per). Inner:
               Overview / Speakers / Insights per conference.
               ================================================ -->
          <xsl:when test="$PRESET = 'conference-insights'">

            <!-- Outer tab buttons - fixed 3. Uses conf-1/2/3 as the
                 data-panel slug so the shell's tab click handler
                 (main IIFE) can flip .is-active without preset-
                 specific logic. Chevron is intentionally omitted
                 here: outer conf tabs are exclusive-single-active
                 at every viewport (not accordion), so a chevron
                 would suggest expand/collapse and confuse. -->
            <button type="button" aria-expanded="true">
              <xsl:attribute name="class">rbccm-tabbed-panels__tab is-active</xsl:attribute>
              <xsl:attribute name="data-panel">conf-1</xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-conf-1</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$CI1_NAME"/>, tab 1 of 3</xsl:attribute>
              <xsl:value-of select="$CI1_NAME"/>
            </button>
            <button type="button" aria-expanded="false">
              <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
              <xsl:attribute name="data-panel">conf-2</xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-conf-2</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$CI2_NAME"/>, tab 2 of 3</xsl:attribute>
              <xsl:value-of select="$CI2_NAME"/>
            </button>
            <button type="button" aria-expanded="false">
              <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
              <xsl:attribute name="data-panel">conf-3</xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-conf-3</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$CI3_NAME"/>, tab 3 of 3</xsl:attribute>
              <xsl:value-of select="$CI3_NAME"/>
            </button>

            <!-- Outer panels, siblings of the tabs (grid row 2). Each
                 panel hosts an inner-tab set (Overview / Speakers /
                 Insights) rendered by the shared named template so
                 markup for all 3 conferences stays in one place. -->
            <div role="region" tabindex="0">
              <xsl:attribute name="class">rbccm-tabbed-panels__panel is-active</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-conf-1</xsl:attribute>
              <xsl:attribute name="data-panel">conf-1</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$CI1_NAME"/></xsl:attribute>
              <xsl:call-template name="renderCiConference">
                <xsl:with-param name="n" select="1"/>
                <xsl:with-param name="sectionId" select="$SECTION_ID"/>
                <xsl:with-param name="bcAccount" select="$CI_BC_ACCOUNT"/>
                <xsl:with-param name="bcPlayer" select="$CI_BC_PLAYER"/>
                <xsl:with-param name="bcEmbed" select="$CI_BC_EMBED"/>
                <xsl:with-param name="defaultPoster" select="$CI_DEFAULT_POSTER"/>
                <xsl:with-param name="ariaSpkCarousel" select="$CI_ARIA_SPK_CAROUSEL"/>
                <xsl:with-param name="ariaInsCarousel" select="$CI_ARIA_INS_CAROUSEL"/>
                <xsl:with-param name="ariaPrevSpk" select="$CI_ARIA_PREV_SPK"/>
                <xsl:with-param name="ariaNextSpk" select="$CI_ARIA_NEXT_SPK"/>
                <xsl:with-param name="ariaPrevIns" select="$CI_ARIA_PREV_INS"/>
                <xsl:with-param name="ariaNextIns" select="$CI_ARIA_NEXT_INS"/>
                <xsl:with-param name="ariaSpkDots" select="$CI_ARIA_SPK_DOTS"/>
                <xsl:with-param name="ariaInsDots" select="$CI_ARIA_INS_DOTS"/>
                <xsl:with-param name="ariaViewAll" select="$CI_ARIA_VIEW_ALL"/>
              </xsl:call-template>
            </div>

            <div role="region" tabindex="0">
              <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-conf-2</xsl:attribute>
              <xsl:attribute name="data-panel">conf-2</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$CI2_NAME"/></xsl:attribute>
              <xsl:call-template name="renderCiConference">
                <xsl:with-param name="n" select="2"/>
                <xsl:with-param name="sectionId" select="$SECTION_ID"/>
                <xsl:with-param name="bcAccount" select="$CI_BC_ACCOUNT"/>
                <xsl:with-param name="bcPlayer" select="$CI_BC_PLAYER"/>
                <xsl:with-param name="bcEmbed" select="$CI_BC_EMBED"/>
                <xsl:with-param name="defaultPoster" select="$CI_DEFAULT_POSTER"/>
                <xsl:with-param name="ariaSpkCarousel" select="$CI_ARIA_SPK_CAROUSEL"/>
                <xsl:with-param name="ariaInsCarousel" select="$CI_ARIA_INS_CAROUSEL"/>
                <xsl:with-param name="ariaPrevSpk" select="$CI_ARIA_PREV_SPK"/>
                <xsl:with-param name="ariaNextSpk" select="$CI_ARIA_NEXT_SPK"/>
                <xsl:with-param name="ariaPrevIns" select="$CI_ARIA_PREV_INS"/>
                <xsl:with-param name="ariaNextIns" select="$CI_ARIA_NEXT_INS"/>
                <xsl:with-param name="ariaSpkDots" select="$CI_ARIA_SPK_DOTS"/>
                <xsl:with-param name="ariaInsDots" select="$CI_ARIA_INS_DOTS"/>
                <xsl:with-param name="ariaViewAll" select="$CI_ARIA_VIEW_ALL"/>
              </xsl:call-template>
            </div>

            <div role="region" tabindex="0">
              <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-conf-3</xsl:attribute>
              <xsl:attribute name="data-panel">conf-3</xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$CI3_NAME"/></xsl:attribute>
              <xsl:call-template name="renderCiConference">
                <xsl:with-param name="n" select="3"/>
                <xsl:with-param name="sectionId" select="$SECTION_ID"/>
                <xsl:with-param name="bcAccount" select="$CI_BC_ACCOUNT"/>
                <xsl:with-param name="bcPlayer" select="$CI_BC_PLAYER"/>
                <xsl:with-param name="bcEmbed" select="$CI_BC_EMBED"/>
                <xsl:with-param name="defaultPoster" select="$CI_DEFAULT_POSTER"/>
                <xsl:with-param name="ariaSpkCarousel" select="$CI_ARIA_SPK_CAROUSEL"/>
                <xsl:with-param name="ariaInsCarousel" select="$CI_ARIA_INS_CAROUSEL"/>
                <xsl:with-param name="ariaPrevSpk" select="$CI_ARIA_PREV_SPK"/>
                <xsl:with-param name="ariaNextSpk" select="$CI_ARIA_NEXT_SPK"/>
                <xsl:with-param name="ariaPrevIns" select="$CI_ARIA_PREV_INS"/>
                <xsl:with-param name="ariaNextIns" select="$CI_ARIA_NEXT_INS"/>
                <xsl:with-param name="ariaSpkDots" select="$CI_ARIA_SPK_DOTS"/>
                <xsl:with-param name="ariaInsDots" select="$CI_ARIA_INS_DOTS"/>
                <xsl:with-param name="ariaViewAll" select="$CI_ARIA_VIEW_ALL"/>
              </xsl:call-template>
            </div>

          </xsl:when>

          <!-- ================================================
               Default (generic + media-contacts): 4 free-form
               tabs, WYSIWYG panel content.
               ================================================ -->
          <xsl:otherwise>

            <!-- ============ Tab buttons ============ -->

            <xsl:if test="$TAB1_LABEL != ''">
              <button type="button" aria-expanded="true">
                <xsl:attribute name="class">rbccm-tabbed-panels__tab is-active</xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB1_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB1_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB1_LABEL"/>, tab 1 of <xsl:value-of select="$TAB_COUNT"/></xsl:attribute>
                <xsl:value-of select="$TAB1_LABEL"/>
                <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
              </button>
            </xsl:if>

            <xsl:if test="$TAB2_LABEL != ''">
              <button type="button" aria-expanded="false">
                <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB2_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB2_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB2_LABEL"/>, tab 2 of <xsl:value-of select="$TAB_COUNT"/></xsl:attribute>
                <xsl:value-of select="$TAB2_LABEL"/>
                <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
              </button>
            </xsl:if>

            <xsl:if test="$TAB3_LABEL != ''">
              <button type="button" aria-expanded="false">
                <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB3_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB3_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB3_LABEL"/>, tab 3 of <xsl:value-of select="$TAB_COUNT"/></xsl:attribute>
                <xsl:value-of select="$TAB3_LABEL"/>
                <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
              </button>
            </xsl:if>

            <xsl:if test="$TAB4_LABEL != ''">
              <button type="button" aria-expanded="false">
                <xsl:attribute name="class">rbccm-tabbed-panels__tab</xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB4_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-controls"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB4_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB4_LABEL"/>, tab 4 of <xsl:value-of select="$TAB_COUNT"/></xsl:attribute>
                <xsl:value-of select="$TAB4_LABEL"/>
                <xsl:value-of select="$CHEVRON_SVG" disable-output-escaping="yes"/>
              </button>
            </xsl:if>

            <!-- ============ Panels (must be siblings of tabs inside the
                 tablist so the desktop grid can put tabs on row 1 and
                 pin the active panel to row 2 spanning all columns). ============ -->

            <xsl:if test="$TAB1_LABEL != ''">
              <div role="region" tabindex="0">
                <xsl:attribute name="class">rbccm-tabbed-panels__panel is-active</xsl:attribute>
                <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB1_SLUG"/></xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB1_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB1_LABEL"/></xsl:attribute>
                <xsl:value-of select="$TAB1_CONTENT" disable-output-escaping="yes"/>
              </div>
            </xsl:if>

            <xsl:if test="$TAB2_LABEL != ''">
              <div role="region" tabindex="0">
                <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
                <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB2_SLUG"/></xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB2_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB2_LABEL"/></xsl:attribute>
                <xsl:value-of select="$TAB2_CONTENT" disable-output-escaping="yes"/>
              </div>
            </xsl:if>

            <xsl:if test="$TAB3_LABEL != ''">
              <div role="region" tabindex="0">
                <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
                <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB3_SLUG"/></xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB3_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB3_LABEL"/></xsl:attribute>
                <xsl:value-of select="$TAB3_CONTENT" disable-output-escaping="yes"/>
              </div>
            </xsl:if>

            <xsl:if test="$TAB4_LABEL != ''">
              <div role="region" tabindex="0">
                <xsl:attribute name="class">rbccm-tabbed-panels__panel</xsl:attribute>
                <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-panel-<xsl:value-of select="$TAB4_SLUG"/></xsl:attribute>
                <xsl:attribute name="data-panel"><xsl:value-of select="$TAB4_SLUG"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$TAB4_LABEL"/></xsl:attribute>
                <xsl:value-of select="$TAB4_CONTENT" disable-output-escaping="yes"/>
              </div>
            </xsl:if>

          </xsl:otherwise>
        </xsl:choose>

      </div>
    </section>

    <!-- Sidecar JS at end of output so it runs after markup is in DOM. -->
    <script>
      <xsl:attribute name="src"><xsl:value-of select="$JS_PATH"/>?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:attribute>
    </script>

  </xsl:template>

  <!-- ============================================================
       renderCiConference - one call renders the inner-wrap for
       Conference $n (1/2/3). Datum lookups use concat('Ci', $n, ...)
       so the template stays generic across all 3 conferences.
       Params carry section-level values so this template doesn't
       need to touch the outer variable scope.
       ============================================================ -->
  <xsl:template name="renderCiConference">
    <xsl:param name="n"/>
    <xsl:param name="sectionId"/>
    <xsl:param name="bcAccount"/>
    <xsl:param name="bcPlayer"/>
    <xsl:param name="bcEmbed"/>
    <xsl:param name="defaultPoster"/>
    <xsl:param name="ariaSpkCarousel"/>
    <xsl:param name="ariaInsCarousel"/>
    <xsl:param name="ariaPrevSpk"/>
    <xsl:param name="ariaNextSpk"/>
    <xsl:param name="ariaPrevIns"/>
    <xsl:param name="ariaNextIns"/>
    <xsl:param name="ariaSpkDots"/>
    <xsl:param name="ariaInsDots"/>
    <xsl:param name="ariaViewAll"/>

    <xsl:variable name="pfx" select="concat('Ci', $n)"/>
    <xsl:variable name="confKey" select="concat('conf-', $n)"/>
    <xsl:variable name="confName" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Name')]/text()[last()])"/>

    <!-- Media inputs -->
    <xsl:variable name="videoId" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'BCVideoId')]/text()[last()])"/>
    <xsl:variable name="posterOverride" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'BCPoster')]/text()[last()])"/>
    <xsl:variable name="effectivePoster">
      <xsl:choose>
        <xsl:when test="$posterOverride != ''"><xsl:value-of select="$posterOverride"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$defaultPoster"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="mediaMode">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'MediaMode')]/text()[last()]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'video'">video</xsl:when>
        <xsl:otherwise>image</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Per-conference inner-tab visibility. Overview is always shown.
         Speakers / Insights render only when NOT explicitly hidden:
         enter "no" (also accepts false / hide) to hide; blank = show. -->
    <xsl:variable name="showSpeakersVal" select="translate(normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'ShowSpeakers')]/text()[last()]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
    <xsl:variable name="showSpeakers" select="not($showSpeakersVal = 'no' or $showSpeakersVal = 'false' or $showSpeakersVal = 'hide')"/>
    <xsl:variable name="showInsightsVal" select="translate(normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'ShowInsights')]/text()[last()]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
    <xsl:variable name="showInsights" select="not($showInsightsVal = 'no' or $showInsightsVal = 'false' or $showInsightsVal = 'hide')"/>

    <!-- Overview fields -->
    <xsl:variable name="date"     select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Date')]/text()[last()])"/>
    <xsl:variable name="location" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Location')]/text()[last()])"/>
    <xsl:variable name="format"   select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Format')]/text()[last()])"/>
    <xsl:variable name="ovHeading" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'OverviewHeading')]/text()[last()])"/>
    <xsl:variable name="ovBody"    select="/Properties/Data/Datum[@ID=concat($pfx,'OverviewBody')]"/>
    <xsl:variable name="topicsLabel" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'KeyTopicsLabel')]/text()[last()])"/>
    <xsl:variable name="topics"   select="/Properties/Data/Datum[@ID=concat($pfx,'KeyTopics')]"/>
    <xsl:variable name="contact"  select="/Properties/Data/Datum[@ID=concat($pfx,'ContactText')]"/>

    <!-- Speakers fields -->
    <xsl:variable name="spkHeading"  select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'SpeakersHeading')]/text()[last()])"/>
    <xsl:variable name="spkIntro"    select="/Properties/Data/Datum[@ID=concat($pfx,'SpeakersIntro')]"/>
    <xsl:variable name="spkFootnote" select="/Properties/Data/Datum[@ID=concat($pfx,'SpeakersFootnote')]"/>

    <xsl:variable name="s1n" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker1Name')]/text()[last()])"/>
    <xsl:variable name="s1t" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker1Title')]/text()[last()])"/>
    <xsl:variable name="s1i" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker1Image')]/text()[last()])"/>
    <xsl:variable name="s1a" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker1Alt')]/text()[last()])"/>
    <xsl:variable name="s2n" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker2Name')]/text()[last()])"/>
    <xsl:variable name="s2t" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker2Title')]/text()[last()])"/>
    <xsl:variable name="s2i" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker2Image')]/text()[last()])"/>
    <xsl:variable name="s2a" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker2Alt')]/text()[last()])"/>
    <xsl:variable name="s3n" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker3Name')]/text()[last()])"/>
    <xsl:variable name="s3t" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker3Title')]/text()[last()])"/>
    <xsl:variable name="s3i" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker3Image')]/text()[last()])"/>
    <xsl:variable name="s3a" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Speaker3Alt')]/text()[last()])"/>

    <!-- Speaker populated count. A speaker counts when Name OR Image
         is set. Drives empty-state hiding of heading/intro/slider and
         the collapsed-divider treatment on the footnote. -->
    <xsl:variable name="speakerCount" select="
        number($s1n != '' or $s1i != '')
      + number($s2n != '' or $s2i != '')
      + number($s3n != '' or $s3i != '')"/>

    <!-- Insights fields -->
    <xsl:variable name="insightsCtaText" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'InsightsCTAText')]/text()[last()])"/>
    <xsl:variable name="insightsCtaHref" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'InsightsCTAHref')]/text()[last()])"/>
    <xsl:variable name="insightsIntro"   select="/Properties/Data/Datum[@ID=concat($pfx,'InsightsIntro')]"/>
    <xsl:variable name="insightsFootnote" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'InsightsFootnote')]/text()[last()])"/>

    <xsl:variable name="i1L" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight1Label')]/text()[last()])"/>
    <xsl:variable name="i1T" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight1Title')]/text()[last()])"/>
    <xsl:variable name="i1D" select="/Properties/Data/Datum[@ID=concat($pfx,'Insight1Description')]"/>
    <xsl:variable name="i1M" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight1Meta')]/text()[last()])"/>
    <xsl:variable name="i1I" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight1Image')]/text()[last()])"/>
    <xsl:variable name="i1A" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight1ImageAlt')]/text()[last()])"/>
    <xsl:variable name="i1H" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight1Href')]/text()[last()])"/>
    <xsl:variable name="i2L" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight2Label')]/text()[last()])"/>
    <xsl:variable name="i2T" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight2Title')]/text()[last()])"/>
    <xsl:variable name="i2D" select="/Properties/Data/Datum[@ID=concat($pfx,'Insight2Description')]"/>
    <xsl:variable name="i2M" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight2Meta')]/text()[last()])"/>
    <xsl:variable name="i2I" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight2Image')]/text()[last()])"/>
    <xsl:variable name="i2A" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight2ImageAlt')]/text()[last()])"/>
    <xsl:variable name="i2H" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight2Href')]/text()[last()])"/>
    <xsl:variable name="i3L" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight3Label')]/text()[last()])"/>
    <xsl:variable name="i3T" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight3Title')]/text()[last()])"/>
    <xsl:variable name="i3D" select="/Properties/Data/Datum[@ID=concat($pfx,'Insight3Description')]"/>
    <xsl:variable name="i3M" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight3Meta')]/text()[last()])"/>
    <xsl:variable name="i3I" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight3Image')]/text()[last()])"/>
    <xsl:variable name="i3A" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight3ImageAlt')]/text()[last()])"/>
    <xsl:variable name="i3H" select="normalize-space(/Properties/Data/Datum[@ID=concat($pfx,'Insight3Href')]/text()[last()])"/>

    <!-- Insight populated count. Card counts when Title OR Image set. -->
    <xsl:variable name="insightCount" select="
        number($i1T != '' or $i1I != '')
      + number($i2T != '' or $i2I != '')
      + number($i3T != '' or $i3I != '')"/>

    <!-- Inner-tab chevron SVG. Kept local so it can't leak into the
         shell's own tab chevron rendering. -->
    <xsl:variable name="INNER_CHEVRON_SVG"><![CDATA[<svg xmlns="http://www.w3.org/2000/svg" class="rbccm-tabbed-panels__inner-chevron" width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.59 15.555L12 10.9317L7.41 15.555L6 14.1316L12 8.07493L18 14.1316L16.59 15.555Z" fill="currentColor"/></svg>]]></xsl:variable>

    <div class="rbccm-tabbed-panels__inner-wrap">

      <!-- INNER TAB + PANEL: OVERVIEW (always visible, first tab). -->
      <button type="button" aria-expanded="true">
        <xsl:attribute name="class">rbccm-tabbed-panels__inner-tab is-active</xsl:attribute>
        <xsl:attribute name="data-inner"><xsl:value-of select="$confKey"/>-overview</xsl:attribute>
        <span class="rbccm-tabbed-panels__inner-tab-label">Overview</span>
        <xsl:value-of select="$INNER_CHEVRON_SVG" disable-output-escaping="yes"/>
      </button>
      <div role="tabpanel">
        <xsl:attribute name="class">rbccm-tabbed-panels__inner-panel rbccm-tabbed-panels__inner-panel--overview is-active</xsl:attribute>
        <xsl:attribute name="data-inner"><xsl:value-of select="$confKey"/>-overview</xsl:attribute>

        <div class="rbccm-tabbed-panels__overview">

          <!-- 16:9 media frame. video mode = click-to-play facade;
               image mode = static poster. Poster always resolves
               to the per-conference override or the section-level
               default so the frame is never empty. -->
          <div class="rbccm-tabbed-panels__video">
            <div class="rbccm-tabbed-panels__video-frame">
              <xsl:choose>
                <xsl:when test="$mediaMode = 'video'">
                  <button type="button" class="rbccm-tabbed-panels__video-facade" aria-label="Play video">
                    <xsl:attribute name="data-bc-src">//players.brightcove.net/<xsl:value-of select="$bcAccount"/>/<xsl:value-of select="$bcPlayer"/>_<xsl:value-of select="$bcEmbed"/>/index.html?videoId=<xsl:value-of select="$videoId"/>&amp;autoplay=1</xsl:attribute>
                    <img class="rbccm-tabbed-panels__video-poster" alt="" loading="lazy" src="{$effectivePoster}"/>
                    <span class="rbccm-tabbed-panels__video-play" aria-hidden="true">
                      <svg class="rbccm-tabbed-panels__video-play-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                      </svg>
                    </span>
                  </button>
                </xsl:when>
                <xsl:otherwise>
                  <img class="rbccm-tabbed-panels__video-poster" loading="lazy" src="{$effectivePoster}" alt="{$confName}"/>
                </xsl:otherwise>
              </xsl:choose>
            </div>
          </div>

          <!-- Info card (Date / Location / Format). Each item renders
               only when its Datum is non-empty. Format spans the full
               row via the __full modifier (BEM shown with __ so this
               comment stays XML-valid). -->
          <div class="rbccm-tabbed-panels__info">
            <xsl:if test="$date != ''">
              <div class="rbccm-tabbed-panels__info-item">
                <div class="rbccm-tabbed-panels__info-label">Date</div>
                <div class="rbccm-tabbed-panels__info-value"><xsl:value-of select="$date"/></div>
              </div>
            </xsl:if>
            <xsl:if test="$location != ''">
              <div class="rbccm-tabbed-panels__info-item">
                <div class="rbccm-tabbed-panels__info-label">Location</div>
                <div class="rbccm-tabbed-panels__info-value"><xsl:value-of select="$location"/></div>
              </div>
            </xsl:if>
            <xsl:if test="$format != ''">
              <div class="rbccm-tabbed-panels__info-item rbccm-tabbed-panels__info-item--full">
                <div class="rbccm-tabbed-panels__info-label">Format</div>
                <div class="rbccm-tabbed-panels__info-value"><xsl:value-of select="$format"/></div>
              </div>
            </xsl:if>
          </div>

          <!-- Overview body: heading + WYSIWYG copy + key topics + contact. -->
          <div class="rbccm-tabbed-panels__overview-body">
            <h3 class="rbccm-tabbed-panels__overview-heading"><xsl:value-of select="$ovHeading"/></h3>
            <div class="rbccm-tabbed-panels__overview-text">
              <xsl:value-of select="$ovBody" disable-output-escaping="yes"/>
            </div>

            <xsl:if test="normalize-space($topics) != ''">
              <p class="rbccm-tabbed-panels__topics">
                <strong><xsl:value-of select="$topicsLabel"/></strong>
                <xsl:text> </xsl:text>
                <span class="rbccm-tabbed-panels__topics-list">
                  <xsl:value-of select="$topics" disable-output-escaping="yes"/>
                </span>
              </p>
            </xsl:if>

            <xsl:if test="normalize-space($contact) != ''">
              <p class="rbccm-tabbed-panels__contact">
                <em><xsl:value-of select="$contact" disable-output-escaping="yes"/></em>
              </p>
            </xsl:if>
          </div>

        </div>
      </div>

      <!-- INNER TAB + PANEL: SPEAKERS (per-conference toggle). -->
      <xsl:if test="$showSpeakers">
        <button type="button" aria-expanded="false">
          <xsl:attribute name="class">rbccm-tabbed-panels__inner-tab</xsl:attribute>
          <xsl:attribute name="data-inner"><xsl:value-of select="$confKey"/>-speakers</xsl:attribute>
          <span class="rbccm-tabbed-panels__inner-tab-label">Speakers</span>
          <xsl:value-of select="$INNER_CHEVRON_SVG" disable-output-escaping="yes"/>
        </button>
        <div role="tabpanel">
          <xsl:attribute name="class">rbccm-tabbed-panels__inner-panel rbccm-tabbed-panels__inner-panel--speakers</xsl:attribute>
          <xsl:attribute name="data-inner"><xsl:value-of select="$confKey"/>-speakers</xsl:attribute>

          <h3 class="rbccm-tabbed-panels__speakers-heading">
            <xsl:if test="$speakerCount = 0">
              <xsl:attribute name="style">display: none;</xsl:attribute>
            </xsl:if>
            <xsl:value-of select="$spkHeading"/>
          </h3>
          <xsl:if test="normalize-space($spkIntro) != ''">
            <p class="rbccm-tabbed-panels__speakers-intro">
              <xsl:if test="$speakerCount = 0">
                <xsl:attribute name="style">display: none;</xsl:attribute>
              </xsl:if>
              <xsl:value-of select="$spkIntro" disable-output-escaping="yes"/>
            </p>
          </xsl:if>

          <!-- Speakers carousel wrapper. JS binds on __speakers-slider
               and reads data-conf to scope its clones/dots. Optional
               aria-label from Datum wins; if blank the JS supplies
               the default. -->
          <div class="rbccm-tabbed-panels__speakers-slider">
            <xsl:attribute name="data-conf"><xsl:value-of select="$confKey"/></xsl:attribute>
            <xsl:if test="$ariaSpkCarousel != ''">
              <xsl:attribute name="aria-label"><xsl:value-of select="$ariaSpkCarousel"/></xsl:attribute>
            </xsl:if>
            <xsl:if test="$speakerCount = 0">
              <xsl:attribute name="style">display: none;</xsl:attribute>
            </xsl:if>

            <div class="rbccm-tabbed-panels__speakers">
              <xsl:attribute name="id">rbccm-tp-ci-speakers-<xsl:value-of select="$confKey"/></xsl:attribute>
              <xsl:call-template name="renderCiSpeaker">
                <xsl:with-param name="name" select="$s1n"/>
                <xsl:with-param name="title" select="$s1t"/>
                <xsl:with-param name="image" select="$s1i"/>
                <xsl:with-param name="alt" select="$s1a"/>
              </xsl:call-template>
              <xsl:call-template name="renderCiSpeaker">
                <xsl:with-param name="name" select="$s2n"/>
                <xsl:with-param name="title" select="$s2t"/>
                <xsl:with-param name="image" select="$s2i"/>
                <xsl:with-param name="alt" select="$s2a"/>
              </xsl:call-template>
              <xsl:call-template name="renderCiSpeaker">
                <xsl:with-param name="name" select="$s3n"/>
                <xsl:with-param name="title" select="$s3t"/>
                <xsl:with-param name="image" select="$s3i"/>
                <xsl:with-param name="alt" select="$s3a"/>
              </xsl:call-template>
            </div>

            <!-- Prev/dots/next controls. JS toggles .has-overflow on
                 the slider based on measured width; the CSS hides
                 these controls when overflow is absent. -->
            <div class="rbccm-tabbed-panels__speakers-controls">
              <button class="rbccm-tabbed-panels__speakers-btn" type="button" tabindex="0">
                <xsl:attribute name="id">rbccm-tp-ci-speakers-prev-<xsl:value-of select="$confKey"/></xsl:attribute>
                <xsl:if test="$ariaPrevSpk != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaPrevSpk"/></xsl:attribute>
                </xsl:if>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                  <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="rbccm-tabbed-panels__speakers-dots">
                <xsl:attribute name="id">rbccm-tp-ci-speakers-dots-<xsl:value-of select="$confKey"/></xsl:attribute>
                <xsl:if test="$ariaSpkDots != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaSpkDots"/></xsl:attribute>
                </xsl:if>
              </div>
              <button class="rbccm-tabbed-panels__speakers-btn" type="button" tabindex="0">
                <xsl:attribute name="id">rbccm-tp-ci-speakers-next-<xsl:value-of select="$confKey"/></xsl:attribute>
                <xsl:if test="$ariaNextSpk != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaNextSpk"/></xsl:attribute>
                </xsl:if>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                  <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <xsl:if test="normalize-space($spkFootnote) != ''">
            <p class="rbccm-tabbed-panels__speakers-footnote">
              <xsl:if test="$speakerCount = 0">
                <xsl:attribute name="style">border-top: 0px;</xsl:attribute>
              </xsl:if>
              <xsl:value-of select="$spkFootnote" disable-output-escaping="yes"/>
            </p>
          </xsl:if>
        </div>
      </xsl:if>

      <!-- INNER TAB + PANEL: INSIGHTS (per-conference toggle). -->
      <xsl:if test="$showInsights">
        <button type="button" aria-expanded="false">
          <xsl:attribute name="class">rbccm-tabbed-panels__inner-tab</xsl:attribute>
          <xsl:attribute name="data-inner"><xsl:value-of select="$confKey"/>-insights</xsl:attribute>
          <span class="rbccm-tabbed-panels__inner-tab-label">Insights</span>
          <xsl:value-of select="$INNER_CHEVRON_SVG" disable-output-escaping="yes"/>
        </button>
        <div role="tabpanel">
          <xsl:attribute name="class">rbccm-tabbed-panels__inner-panel rbccm-tabbed-panels__inner-panel--insights</xsl:attribute>
          <xsl:attribute name="data-inner"><xsl:value-of select="$confKey"/>-insights</xsl:attribute>

          <div class="rbccm-tabbed-panels__insights-slider">
            <xsl:attribute name="data-conf"><xsl:value-of select="$confKey"/></xsl:attribute>
            <xsl:if test="$ariaInsCarousel != ''">
              <xsl:attribute name="aria-label"><xsl:value-of select="$ariaInsCarousel"/></xsl:attribute>
            </xsl:if>
            <xsl:if test="$insightCount = 0">
              <xsl:attribute name="style">display: none;</xsl:attribute>
            </xsl:if>

            <div class="rbccm-tabbed-panels__insights">
              <xsl:attribute name="id">rbccm-tp-ci-insights-<xsl:value-of select="$confKey"/></xsl:attribute>
              <div class="rbccm-tabbed-panels__insights-row">
                <xsl:call-template name="renderCiInsight">
                  <xsl:with-param name="label" select="$i1L"/>
                  <xsl:with-param name="title" select="$i1T"/>
                  <xsl:with-param name="desc"  select="$i1D"/>
                  <xsl:with-param name="meta"  select="$i1M"/>
                  <xsl:with-param name="image" select="$i1I"/>
                  <xsl:with-param name="alt"   select="$i1A"/>
                  <xsl:with-param name="href"  select="$i1H"/>
                </xsl:call-template>
                <xsl:call-template name="renderCiInsight">
                  <xsl:with-param name="label" select="$i2L"/>
                  <xsl:with-param name="title" select="$i2T"/>
                  <xsl:with-param name="desc"  select="$i2D"/>
                  <xsl:with-param name="meta"  select="$i2M"/>
                  <xsl:with-param name="image" select="$i2I"/>
                  <xsl:with-param name="alt"   select="$i2A"/>
                  <xsl:with-param name="href"  select="$i2H"/>
                </xsl:call-template>
                <xsl:call-template name="renderCiInsight">
                  <xsl:with-param name="label" select="$i3L"/>
                  <xsl:with-param name="title" select="$i3T"/>
                  <xsl:with-param name="desc"  select="$i3D"/>
                  <xsl:with-param name="meta"  select="$i3M"/>
                  <xsl:with-param name="image" select="$i3I"/>
                  <xsl:with-param name="alt"   select="$i3A"/>
                  <xsl:with-param name="href"  select="$i3H"/>
                </xsl:call-template>
              </div>
            </div>

            <!-- Carousel controls (arrows + dots). CSS hides these on
                 desktop where the insights layout flips to a 3-col
                 grid; JS keeps them wired for mobile only. -->
            <div class="rbccm-tabbed-panels__insights-controls">
              <button class="rbccm-tabbed-panels__insights-btn" type="button" tabindex="0">
                <xsl:attribute name="id">rbccm-tp-ci-insights-prev-<xsl:value-of select="$confKey"/></xsl:attribute>
                <xsl:if test="$ariaPrevIns != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaPrevIns"/></xsl:attribute>
                </xsl:if>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                  <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="rbccm-tabbed-panels__insights-dots">
                <xsl:attribute name="id">rbccm-tp-ci-insights-dots-<xsl:value-of select="$confKey"/></xsl:attribute>
                <xsl:if test="$ariaInsDots != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaInsDots"/></xsl:attribute>
                </xsl:if>
              </div>
              <button class="rbccm-tabbed-panels__insights-btn" type="button" tabindex="0">
                <xsl:attribute name="id">rbccm-tp-ci-insights-next-<xsl:value-of select="$confKey"/></xsl:attribute>
                <xsl:if test="$ariaNextIns != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaNextIns"/></xsl:attribute>
                </xsl:if>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                  <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Empty insights: slider is hidden (above); show a centered
               footnote instead. Reuses the speakers-footnote class for
               its centered muted styling. -->
          <xsl:if test="$insightCount = 0">
            <p class="rbccm-tabbed-panels__speakers-footnote" style="border-top: 0px;">
              <xsl:value-of select="$insightsFootnote" disable-output-escaping="yes"/>
            </p>
          </xsl:if>

          <xsl:if test="normalize-space($insightsIntro) != ''">
            <xsl:value-of select="$insightsIntro" disable-output-escaping="yes"/>
          </xsl:if>

          <!-- CTA -->
          <xsl:if test="$insightsCtaHref != ''">
            <div class="rbccm-tabbed-panels__insights-cta-wrap">
              <a class="rbccm-tabbed-panels__insights-cta">
                <xsl:attribute name="href"><xsl:value-of select="$insightsCtaHref"/></xsl:attribute>
                <xsl:if test="$ariaViewAll != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaViewAll"/></xsl:attribute>
                </xsl:if>
                <xsl:value-of select="$insightsCtaText"/>
              </a>
            </div>
          </xsl:if>
        </div>
      </xsl:if>

    </div>
  </xsl:template>

  <!-- Render a single speaker card. Skipped when both name and image
       are blank (empty repeatable slot). -->
  <xsl:template name="renderCiSpeaker">
    <xsl:param name="name"/>
    <xsl:param name="title"/>
    <xsl:param name="image"/>
    <xsl:param name="alt"/>

    <xsl:if test="$name != '' or $image != ''">
      <xsl:variable name="altText">
        <xsl:choose>
          <xsl:when test="$alt != ''"><xsl:value-of select="$alt"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="$name"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <div class="rbccm-tabbed-panels__speaker">
        <div class="rbccm-tabbed-panels__speaker-avatar">
          <img loading="lazy">
            <xsl:attribute name="src"><xsl:value-of select="$image"/></xsl:attribute>
            <xsl:attribute name="alt"><xsl:value-of select="$altText"/></xsl:attribute>
          </img>
        </div>
        <div class="rbccm-tabbed-panels__speaker-name"><xsl:value-of select="$name"/></div>
        <div class="rbccm-tabbed-panels__speaker-title"><xsl:value-of select="$title"/></div>
      </div>
    </xsl:if>
  </xsl:template>

  <!-- Render a single insight card. Skipped when both title and image
       are blank (empty slot). -->
  <xsl:template name="renderCiInsight">
    <xsl:param name="label"/>
    <xsl:param name="title"/>
    <xsl:param name="desc"/>
    <xsl:param name="meta"/>
    <xsl:param name="image"/>
    <xsl:param name="alt"/>
    <xsl:param name="href"/>

    <xsl:if test="$title != '' or $image != ''">
      <xsl:variable name="labelText">
        <xsl:choose>
          <xsl:when test="$label != ''"><xsl:value-of select="$label"/></xsl:when>
          <xsl:otherwise>INSIGHTS</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <a class="rbccm-tabbed-panels__insight rbccm-tabbed-panels__insight--card">
        <xsl:attribute name="href"><xsl:value-of select="$href"/></xsl:attribute>
        <div class="rbccm-tabbed-panels__insight-media">
          <img loading="lazy">
            <xsl:attribute name="src"><xsl:value-of select="$image"/></xsl:attribute>
            <xsl:attribute name="alt"><xsl:value-of select="$alt"/></xsl:attribute>
          </img>
        </div>
        <div class="rbccm-tabbed-panels__insight-body">
          <div class="rbccm-tabbed-panels__insight-label"><xsl:value-of select="$labelText"/></div>
          <div class="rbccm-tabbed-panels__insight-divider" aria-hidden="true"></div>
          <h4 class="rbccm-tabbed-panels__insight-title"><xsl:value-of select="$title"/></h4>
          <p class="rbccm-tabbed-panels__insight-desc">
            <xsl:value-of select="$desc" disable-output-escaping="yes"/>
          </p>
          <xsl:if test="$meta != ''">
            <p class="rbccm-tabbed-panels__insight-meta">
              <span><xsl:value-of select="$meta"/></span>
              <svg class="rbccm-tabbed-panels__insight-arrow" xmlns="http://www.w3.org/2000/svg" width="4" height="10" viewBox="0 0 4 10" fill="none" aria-hidden="true">
                <path d="M0.995898 9.03271L3.46359 5.25064C3.51814 5.16868 3.56143 5.07118 3.59098 4.96374C3.62053 4.85631 3.63574 4.74108 3.63574 4.6247C3.63574 4.50832 3.62053 4.39309 3.59098 4.28566C3.56143 4.17823 3.51814 4.08072 3.46359 3.99876L0.995898 0.260776C0.941794 0.178145 0.877424 0.112559 0.806501 0.067801C0.735579 0.0230433 0.659508 0 0.582677 0C0.505846 0 0.429775 0.0230433 0.358852 0.067801C0.28793 0.112559 0.22356 0.178145 0.169455 0.260776C0.0610566 0.425955 0.000213623 0.649398 0.000213623 0.882305C0.000213623 1.11521 0.0610566 1.33865 0.169455 1.50383L2.22974 4.6247L0.169455 7.74557C0.0619338 7.90978 0.0013175 8.13141 0.000674486 8.36269C0.000231743 8.47871 0.0149126 8.59373 0.0438757 8.70114C0.0728388 8.80855 0.115515 8.90625 0.169455 8.98863C0.221613 9.07421 0.284449 9.14328 0.354334 9.19187C0.424218 9.24045 0.499765 9.26757 0.57661 9.27167C0.653455 9.27577 0.730073 9.25676 0.80204 9.21574C0.874007 9.17473 0.939896 9.11252 0.995898 9.03271Z" fill="currentColor"/>
              </svg>
            </p>
          </xsl:if>
        </div>
      </a>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
