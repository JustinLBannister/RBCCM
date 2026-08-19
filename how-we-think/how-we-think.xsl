<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: RBC CM How We Think
       ===================================================================
       Three-tab component: Insights / Newsroom / Conferences.

       Insights    - URL shells emitted here per author Datum. The
                     external JS below fetches the 2024/2025/2026
                     insights feeds and injects each tile's markup by
                     matching the URL slug. Same pattern as
                     case-studies-carousel.

       Newsroom    - Empty shell. JS fetches the Newsroom feed URL
                     (Datum default /en/insights/data/all) at page
                     load and injects the top N items.

       Conferences - Server-rendered here from the EventsList DCR
                     pick. XSL filters events where sitelocation
                     contains "rbccm-homepage", sorts by event_date,
                     applies Min/Max caps, emits month/day badge +
                     location + name per event.

       Deploy alongside this skin:
         /assets/rbccm/css/components/how-we-think.css
         /assets/rbccm/js/components/how-we-think.js
       =================================================================== -->

  <xsl:output method="html" indent="no" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>


  <!-- ═══════════════════════════════════════════════════════════════════
       clean - fold non-breaking spaces + collapse whitespace.
       XSLT-1.0 compatible. -->
  <xsl:template name="clean">
    <xsl:param name="s" select="''"/>
    <xsl:value-of select="normalize-space(translate(string($s), '&#160;', ' '))"/>
  </xsl:template>

  <!-- Numeric month name from a 2-digit month string. -->
  <xsl:template name="monthName">
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


  <!-- ═══════════════════════════════════════════════════════════════════
       PUBLISH_DATE - "Month D, YYYY" from a YYYY-MM-DD publishdate.
       Copied verbatim from the Newsroom DCR's Default XSL so the
       server-rendered output matches the rest of the site exactly. -->
  <xsl:template name="PUBLISH_DATE">
    <xsl:param name="publish_date"/>
    <xsl:variable name="vYear" select="substring-before($publish_date, '-')"/>
    <xsl:variable name="vnumMonth" select="number(substring-before(substring-after($publish_date, '-'), '-'))"/>
    <xsl:variable name="vDay" select="number(substring-after(substring-after($publish_date, '-'), '-'))"/>
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


  <!-- ═══════════════════════════════════════════════════════════════════
       Main
       =================================================================== -->
  <xsl:template match="/">

    <!-- Section-level Datums -->
    <xsl:variable name="heading">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='Heading']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Heading'])"/>
        </xsl:when>
        <xsl:otherwise>How we think</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="headingId" select="normalize-space(/Properties/Datum[@ID='HeadingId'])"/>
    <xsl:variable name="ariaLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='AriaLabel']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='AriaLabel'])"/>
        </xsl:when>
        <xsl:otherwise><xsl:value-of select="$heading"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Tab labels + ledes + CTAs (per tab) -->
    <xsl:variable name="insightsTabLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='InsightsTabLabel']) != ''"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='InsightsTabLabel'])"/></xsl:when>
        <xsl:otherwise>Insights</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="newsroomTabLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='NewsroomTabLabel']) != ''"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='NewsroomTabLabel'])"/></xsl:when>
        <xsl:otherwise>Newsroom</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="conferencesTabLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='ConferencesTabLabel']) != ''"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='ConferencesTabLabel'])"/></xsl:when>
        <xsl:otherwise>Conferences</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="insightsLede">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="/Properties/Datum[@ID='InsightsLede']"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="newsroomLede">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="/Properties/Datum[@ID='NewsroomLede']"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="conferencesLede">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="/Properties/Datum[@ID='ConferencesLede']"/></xsl:call-template>
    </xsl:variable>

    <xsl:variable name="insightsCtaLabel" select="normalize-space(/Properties/Datum[@ID='InsightsCtaLabel'])"/>
    <xsl:variable name="insightsCtaLink"  select="normalize-space(/Properties/Datum[@ID='InsightsCtaLink'])"/>
    <xsl:variable name="insightsCtaNewTab" select="/Properties/Datum[@ID='InsightsCtaNewTab'] = 'true'"/>
    <xsl:variable name="insightsCtaTitle"     select="normalize-space(/Properties/Datum[@ID='InsightsCtaTitle'])"/>
    <xsl:variable name="insightsCtaAriaLabel" select="normalize-space(/Properties/Datum[@ID='InsightsCtaAriaLabel'])"/>

    <xsl:variable name="newsroomCtaLabel" select="normalize-space(/Properties/Datum[@ID='NewsroomCtaLabel'])"/>
    <xsl:variable name="newsroomCtaLink"  select="normalize-space(/Properties/Datum[@ID='NewsroomCtaLink'])"/>
    <xsl:variable name="newsroomCtaNewTab" select="/Properties/Datum[@ID='NewsroomCtaNewTab'] = 'true'"/>
    <xsl:variable name="newsroomCtaTitle"     select="normalize-space(/Properties/Datum[@ID='NewsroomCtaTitle'])"/>
    <xsl:variable name="newsroomCtaAriaLabel" select="normalize-space(/Properties/Datum[@ID='NewsroomCtaAriaLabel'])"/>

    <!-- Newsroom is server-rendered from MetaQueryExternal.findByQuery
         defined in the properties file's <Data><External> block. The
         result set lands at /Properties/Data/Result/records/metaResult
         and is iterated further down. -->
    <xsl:variable name="newsroomArticles" select="/Properties/Data/Result/records/metaResult"/>

    <!-- Component locale (lower-cased, 'en' fallback). Compared
         against TeamSite/Metadata/language on each record to keep
         only news items authored in the same language as the
         page. Missing language attr on legacy records is treated
         as 'en' so pre-migration articles remain visible on EN
         pages. -->
    <xsl:variable name="locale">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Datum[@ID='Locale']), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'fr'">fr</xsl:when>
        <xsl:otherwise>en</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Language-filtered newsroom set. Match rules:
           1. Article has language attr → must equal $locale
              (case-insensitive)
           2. Article has no language attr (legacy) → include
              only when $locale is 'en' (back-compat)
         Everything else is dropped before the sort/cap pass. -->
    <xsl:variable name="newsroomArticlesLocalized" select="$newsroomArticles[
      translate(attr[@key='TeamSite/Metadata/language'], 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = $locale
      or (not(attr[@key='TeamSite/Metadata/language'])
          and $locale = 'en')
      or (normalize-space(attr[@key='TeamSite/Metadata/language']) = ''
          and $locale = 'en')
    ]"/>

    <xsl:variable name="conferencesCtaLabel" select="normalize-space(/Properties/Datum[@ID='ConferencesCtaLabel'])"/>
    <xsl:variable name="conferencesCtaLink"  select="normalize-space(/Properties/Datum[@ID='ConferencesCtaLink'])"/>
    <xsl:variable name="conferencesCtaNewTab" select="/Properties/Datum[@ID='ConferencesCtaNewTab'] = 'true'"/>
    <xsl:variable name="conferencesCtaTitle"     select="normalize-space(/Properties/Datum[@ID='ConferencesCtaTitle'])"/>
    <xsl:variable name="conferencesCtaAriaLabel" select="normalize-space(/Properties/Datum[@ID='ConferencesCtaAriaLabel'])"/>


    <!-- Insights tiles: URL shells from replicated Slide groups. -->
    <xsl:variable name="insightSlides"
                  select="/Properties/Data/Group[@ID='InsightSlide' or @Name='Insights Tile']"/>


    <!-- ═══ CONFERENCES: filter + sort + cap ══════════════════
         Path per the live homepage featured-conferences component:
         DCR Category="about-us" Type="conferences" with the pick
         resolving to /DCR/events/event nodes. Each <event> has
         event_date, event_name, location, sitelocation etc. as
         children. -->
    <xsl:variable name="allEvents"
                  select="/Properties/Data/Datum[@ID='EventsList' or @Name='Events List']/DCR/events/event"/>

    <!-- Today as YYYYMMDD (XSL 2.0). Used to drop past events even
         when authors forget to unflag them - matches the main
         homepage behaviour exactly. -->
    <xsl:variable name="CURRENT_DATE"
                  select="format-date(current-date(), '[Y0001][M01][D01]')"/>

    <!-- Homepage-flagged, future-dated events. The compact date
         comparison collapses event_date (YYYY-MM-DD) into YYYYMMDD
         via substring maths - matches the main homepage's exact
         idiom. contains() on stringified sitelocation handles every
         TeamSite checkbox serialization. -->
    <xsl:variable name="homepageEvents" select="$allEvents[
        contains(string(sitelocation), 'rbccm-homepage')
        and (concat(
              substring-before(event_date, '-'),
              substring-before(substring-after(event_date, '-'), '-'),
              substring-after(substring-after(event_date, '-'), '-')
            ) &gt;= $CURRENT_DATE)
      ]"/>
    <xsl:variable name="homepageCount" select="count($homepageEvents)"/>

    <xsl:variable name="minConferences">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='ConferencesMinCount']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='ConferencesMinCount'])"/>
        </xsl:when>
        <xsl:otherwise>1</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="maxConferencesRaw" select="normalize-space(/Properties/Datum[@ID='ConferencesMaxCount'])"/>

    <!-- Debug marker in page source only (invisible to end users). -->
    <xsl:comment> hwt debug: eventsTotal=<xsl:value-of select="count($allEvents)"/> homepage=<xsl:value-of select="$homepageCount"/> </xsl:comment>


    <!-- ═══════════════════════════════════════════════════════════
         MARKUP
         =================================================================== -->
    <link rel="stylesheet" href="/assets/rbccm/css/components/how-we-think.css"/>

    <section class="rbccm-how-we-think" id="rbccm-how-we-think">
      <xsl:attribute name="aria-label"><xsl:value-of select="$ariaLabel"/></xsl:attribute>

      <div class="rbccm-how-we-think__container">

        <h2 class="rbccm-how-we-think__heading">
          <xsl:choose>
            <xsl:when test="$headingId != ''">
              <xsl:attribute name="id"><xsl:value-of select="$headingId"/></xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="id">rbccm-how-we-think-heading</xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:value-of select="$heading"/>
        </h2>

        <div class="rbccm-how-we-think__tablist" role="group">
          <xsl:attribute name="aria-label"><xsl:value-of select="concat($heading, ' content sections')"/></xsl:attribute>

          <!-- ─── TAB BUTTONS ─── -->
          <button type="button"
                  class="rbccm-how-we-think__tab is-active"
                  data-panel="insights"
                  aria-expanded="true"
                  aria-controls="hwt-panel-insights">
            <xsl:value-of select="$insightsTabLabel"/>
            <svg class="rbccm-how-we-think__tab-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.59 15.555L12 10.9317L7.41 15.555L6 14.1316L12 8.07493L18 14.1316L16.59 15.555Z" fill="currentColor"/></svg>
          </button>

          <button type="button"
                  class="rbccm-how-we-think__tab"
                  data-panel="newsroom"
                  aria-expanded="false"
                  aria-controls="hwt-panel-newsroom">
            <xsl:value-of select="$newsroomTabLabel"/>
            <svg class="rbccm-how-we-think__tab-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.59 15.555L12 10.9317L7.41 15.555L6 14.1316L12 8.07493L18 14.1316L16.59 15.555Z" fill="currentColor"/></svg>
          </button>

          <button type="button"
                  class="rbccm-how-we-think__tab"
                  data-panel="conferences"
                  aria-expanded="false"
                  aria-controls="hwt-panel-conferences">
            <xsl:value-of select="$conferencesTabLabel"/>
            <svg class="rbccm-how-we-think__tab-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.59 15.555L12 10.9317L7.41 15.555L6 14.1316L12 8.07493L18 14.1316L16.59 15.555Z" fill="currentColor"/></svg>
          </button>


          <!-- ─── INSIGHTS PANEL ─── -->
          <div class="rbccm-how-we-think__panel is-active"
               id="hwt-panel-insights"
               data-panel="insights"
               role="region"
               tabindex="0">
            <xsl:if test="$insightsLede != ''">
              <p class="rbccm-how-we-think__panel-lede"><xsl:value-of select="$insightsLede"/></p>
            </xsl:if>

            <div class="rbccm-how-we-think__tiles">
              <xsl:for-each select="$insightSlides">
                <xsl:variable name="tileUrl" select="normalize-space(Datum[@ID='Url' or @Name='Insight URL'])"/>
                <xsl:if test="$tileUrl != ''">
                  <a class="rbccm-how-we-think__tile" href="{$tileUrl}">
                    <xsl:attribute name="data-hwt-url"><xsl:value-of select="$tileUrl"/></xsl:attribute>
                    <xsl:variable name="ovEyebrow"  select="normalize-space(Datum[@ID='EyebrowOverride'  or @Name='Eyebrow Override (blank = use feed)'])"/>
                    <xsl:variable name="ovReadtime" select="normalize-space(Datum[@ID='ReadTimeOverride' or @Name='Read/Watch/Listen Time Override (blank = use feed)'])"/>
                    <xsl:if test="$ovEyebrow  != ''"><xsl:attribute name="data-hwt-eyebrow"><xsl:value-of select="$ovEyebrow"/></xsl:attribute></xsl:if>
                    <xsl:if test="$ovReadtime != ''"><xsl:attribute name="data-hwt-readtime"><xsl:value-of select="$ovReadtime"/></xsl:attribute></xsl:if>
                    <!-- Empty shell; JS overwrites innerHTML on hydration. -->
                    <div class="rbccm-how-we-think__tile-img"></div>
                    <div class="rbccm-how-we-think__tile-body">
                      <p class="rbccm-how-we-think__tile-eyebrow">INSIGHTS</p>
                      <div class="rbccm-how-we-think__tile-divider" aria-hidden="true"></div>
                      <h3 class="rbccm-how-we-think__tile-title"></h3>
                      <p class="rbccm-how-we-think__tile-copy"></p>
                    </div>
                  </a>
                </xsl:if>
              </xsl:for-each>
            </div>

            <xsl:if test="$insightsCtaLabel != '' and $insightsCtaLink != ''">
              <div class="rbccm-how-we-think__cta-wrap">
                <a class="rbccm-how-we-think__cta" href="{$insightsCtaLink}">
                  <xsl:if test="$insightsCtaNewTab">
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:attribute name="rel">noopener</xsl:attribute>
                  </xsl:if>
                  <xsl:if test="$insightsCtaTitle != ''">
                    <xsl:attribute name="title"><xsl:value-of select="$insightsCtaTitle"/></xsl:attribute>
                  </xsl:if>
                  <xsl:if test="$insightsCtaAriaLabel != ''">
                    <xsl:attribute name="aria-label"><xsl:value-of select="$insightsCtaAriaLabel"/></xsl:attribute>
                  </xsl:if>
                  <xsl:value-of select="$insightsCtaLabel"/>
                </a>
              </div>
            </xsl:if>
          </div>


          <!-- ─── NEWSROOM PANEL ─── -->
          <div class="rbccm-how-we-think__panel"
               id="hwt-panel-newsroom"
               data-panel="newsroom"
               role="region"
               tabindex="0">
            <xsl:if test="$newsroomLede != ''">
              <p class="rbccm-how-we-think__panel-lede"><xsl:value-of select="$newsroomLede"/></p>
            </xsl:if>

            <!-- Server-rendered from the External MetaQueryExternal
                 block in properties.xml. Iterates the top 3 news
                 records, sorted newest first. Each record's fields
                 come from TeamSite/Metadata/* keys. -->
            <div class="rbccm-how-we-think__news">
              <!-- Iterate the language-filtered set. sorted-position() <= 3
                   caps the output at 3 items even though the External query
                   returns up to 20 candidates. Title/Description use the
                   metadata written by the article DCR — if authors provide
                   FR-localised versions on the article, those come through
                   automatically because the External query returns metadata
                   verbatim per record. -->
              <xsl:for-each select="$newsroomArticlesLocalized">
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
                      <xsl:otherwise><xsl:value-of select="concat('/', $locale, '/insights/story.page?dcr=', $artPath)"/></xsl:otherwise>
                    </xsl:choose>
                  </xsl:variable>

                  <div class="rbccm-how-we-think__news-item">
                    <span class="rbccm-how-we-think__news-date">
                      <xsl:call-template name="PUBLISH_DATE">
                        <xsl:with-param name="publish_date" select="$artDate"/>
                      </xsl:call-template>
                    </span>
                    <a class="rbccm-how-we-think__news-link">
                      <xsl:attribute name="href"><xsl:value-of select="$artLink"/></xsl:attribute>
                      <xsl:if test="$artExtLink != ''">
                        <xsl:attribute name="target">_blank</xsl:attribute>
                        <xsl:attribute name="rel">noopener</xsl:attribute>
                      </xsl:if>
                      <xsl:value-of select="$artTitle" disable-output-escaping="yes"/>
                    </a>
                    <p class="rbccm-how-we-think__news-summary">
                      <xsl:value-of select="$artDesc" disable-output-escaping="yes"/>
                    </p>
                  </div>
                </xsl:if>
              </xsl:for-each>
            </div>

            <xsl:if test="$newsroomCtaLabel != '' and $newsroomCtaLink != ''">
              <div class="rbccm-how-we-think__cta-wrap">
                <a class="rbccm-how-we-think__cta" href="{$newsroomCtaLink}">
                  <xsl:if test="$newsroomCtaNewTab">
                    <xsl:attribute name="target">_blank</xsl:attribute>
                    <xsl:attribute name="rel">noopener</xsl:attribute>
                  </xsl:if>
                  <xsl:if test="$newsroomCtaTitle != ''">
                    <xsl:attribute name="title"><xsl:value-of select="$newsroomCtaTitle"/></xsl:attribute>
                  </xsl:if>
                  <xsl:if test="$newsroomCtaAriaLabel != ''">
                    <xsl:attribute name="aria-label"><xsl:value-of select="$newsroomCtaAriaLabel"/></xsl:attribute>
                  </xsl:if>
                  <xsl:value-of select="$newsroomCtaLabel"/>
                </a>
              </div>
            </xsl:if>
          </div>


          <!-- ─── CONFERENCES PANEL (server-rendered) ─── -->
          <div class="rbccm-how-we-think__panel"
               id="hwt-panel-conferences"
               data-panel="conferences"
               role="region"
               tabindex="0">

            <xsl:choose>
              <xsl:when test="$homepageCount &gt;= number($minConferences)">

                <xsl:if test="$conferencesLede != ''">
                  <p class="rbccm-how-we-think__panel-lede"><xsl:value-of select="$conferencesLede"/></p>
                </xsl:if>

                <div class="rbccm-how-we-think__conferences">
                  <xsl:for-each select="$homepageEvents">
                    <xsl:sort select="normalize-space(event_date)" data-type="text" order="ascending"/>
                    <xsl:variable name="pos" select="position()"/>
                    <xsl:if test="$maxConferencesRaw = '' or $pos &lt;= number($maxConferencesRaw)">
                      <xsl:variable name="eventDate" select="normalize-space(event_date)"/>
                      <xsl:variable name="eventDateEnd" select="normalize-space(event_date_end)"/>
                      <xsl:variable name="eventYear" select="substring($eventDate, 1, 4)"/>
                      <xsl:variable name="eventMonth" select="substring($eventDate, 6, 2)"/>
                      <xsl:variable name="eventDay" select="substring($eventDate, 9, 2)"/>
                      <xsl:variable name="eventDayEnd" select="substring($eventDateEnd, 9, 2)"/>
                      <xsl:variable name="monthLabel">
                        <xsl:call-template name="monthName"><xsl:with-param name="m" select="$eventMonth"/></xsl:call-template>
                      </xsl:variable>
                      <!-- Day label: "21" for single-day events, "21-22"
                           when an end date exists and differs from the
                           start. Strips leading zero on the end day
                           (via number() cast) to match "SEP 21-22"
                           display, not "SEP 21-02". -->
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
                          <a class="rbccm-how-we-think__conference" href="{$eventUrl}">
                            <xsl:if test="$newTab">
                              <xsl:attribute name="target">_blank</xsl:attribute>
                              <xsl:attribute name="rel">noopener</xsl:attribute>
                            </xsl:if>
                            <div class="rbccm-how-we-think__conference-date">
                              <span class="rbccm-how-we-think__conference-month"><xsl:value-of select="$monthLabel"/></span>
                              <span class="rbccm-how-we-think__conference-day"><xsl:value-of select="$dayLabel"/></span>
                            </div>
                            <div>
                              <p class="rbccm-how-we-think__conference-location"><xsl:value-of select="normalize-space(location)"/></p>
                              <p class="rbccm-how-we-think__conference-name"><xsl:value-of select="$displayTitle"/></p>
                            </div>
                          </a>
                        </xsl:when>
                        <xsl:otherwise>
                          <!-- No URL - render as div, not link. -->
                          <div class="rbccm-how-we-think__conference">
                            <div class="rbccm-how-we-think__conference-date">
                              <span class="rbccm-how-we-think__conference-month"><xsl:value-of select="$monthLabel"/></span>
                              <span class="rbccm-how-we-think__conference-day"><xsl:value-of select="$dayLabel"/></span>
                            </div>
                            <div>
                              <p class="rbccm-how-we-think__conference-location"><xsl:value-of select="normalize-space(location)"/></p>
                              <p class="rbccm-how-we-think__conference-name"><xsl:value-of select="$displayTitle"/></p>
                            </div>
                          </div>
                        </xsl:otherwise>
                      </xsl:choose>
                    </xsl:if>
                  </xsl:for-each>
                </div>

                <xsl:if test="$conferencesCtaLabel != '' and $conferencesCtaLink != ''">
                  <div class="rbccm-how-we-think__cta-wrap">
                    <a class="rbccm-how-we-think__cta" href="{$conferencesCtaLink}">
                      <xsl:if test="$conferencesCtaNewTab">
                        <xsl:attribute name="target">_blank</xsl:attribute>
                        <xsl:attribute name="rel">noopener</xsl:attribute>
                      </xsl:if>
                      <xsl:if test="$conferencesCtaTitle != ''">
                        <xsl:attribute name="title"><xsl:value-of select="$conferencesCtaTitle"/></xsl:attribute>
                      </xsl:if>
                      <xsl:if test="$conferencesCtaAriaLabel != ''">
                        <xsl:attribute name="aria-label"><xsl:value-of select="$conferencesCtaAriaLabel"/></xsl:attribute>
                      </xsl:if>
                      <xsl:value-of select="$conferencesCtaLabel"/>
                    </a>
                  </div>
                </xsl:if>

              </xsl:when>
              <xsl:otherwise>
                <!-- Below the flagged-count threshold: empty panel body.
                     The tab still renders (labels are always emitted)
                     but there's nothing inside. -->
              </xsl:otherwise>
            </xsl:choose>

          </div>

        </div><!-- /.__tablist -->
      </div><!-- /.__container -->
    </section>


    <!-- ═══ EXTERNAL JS ═══ -->
    <script src="/assets/rbccm/js/components/how-we-think.js"></script>
    <script src="/assets/rbccm/js/components/how-we-think-feeds.js"></script>

  </xsl:template>

</xsl:stylesheet>
