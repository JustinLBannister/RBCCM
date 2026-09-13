<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM In the Media - XSL skin
  ==============================================================
  Preset-driven section that renders a section title + a featured
  video/media card on the left + a 3-row list of media appearances
  on the right + a "See all" link. All item content is fetched at
  runtime by the sidecar JS (rbccm-in-the-media.js) from the same
  media/press feed the filtered-content ITM preset uses.

  XSL responsibilities
  ==============================================================
  Emit the shell only. The JS runtime populates:
    - .__image src           = feed item[0].thumbnail (or HeroPoster fallback)
    - .__media href          = feed item[0].link
    - .__eyebrow             = "Featured Media Coverage / Video Interview / Podcast" + date
    - .__featured-title      = feed item[0].title (raw quoted)
    - .__featured-expert     = "Featured Expert: <parsed person>"
    - .__list li[N]          = items 1..3 (source, date, title, person)
  Wrapper elements carry data-* hooks so the JS can target them
  without querying every child selector.

  Presets
  ==============================================================
  Current presets:
    strategy-and-economics-in-the-media
  Extend by:
    1. Adding a &lt;xsl:when&gt; branch to $VARIANT_CLASS
    2. Adding a modifier scope in rbccm-in-the-media.css
    3. Adding a matching &lt;Option&gt; to the Preset Datum

  Feed hookup (runtime)
  ==============================================================
  The FeedUrl Datum feeds window.RBCCM_IN_THE_MEDIA_CONFIG.feedUrl,
  which the sidecar JS fetches, parses (&lt;news&gt; nodes), sorts by
  date desc, and populates the first 4 items into the featured
  card + list rows. If the fetch fails, the initial static markup
  emitted here stays in place (graceful degradation).
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Tag allow-list guard. -->
  <xsl:template name="pickTag">
    <xsl:param name="raw"/>
    <xsl:param name="default"/>
    <xsl:choose>
      <xsl:when test="$raw = 'h1' or $raw = 'h2' or $raw = 'h3' or $raw = 'h4' or $raw = 'h5' or $raw = 'h6' or $raw = 'p' or $raw = 'div' or $raw = 'span'">
        <xsl:value-of select="$raw"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$default"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Right-arrow SVG for the See-all link (uses currentColor). -->
  <xsl:template name="seeAllArrow">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.16602 10H15.8327" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 4.1665L15.8333 9.99984L10 15.8332" stroke="currentColor" stroke-width="1.08333" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </xsl:template>

  <!-- Play-triangle SVG (decorative overlay). -->
  <xsl:template name="playTriangle">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 5v14l11-7z" fill="currentColor"/>
    </svg>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"       select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"     select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"         select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"          select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION"    select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="PRESET"           select="normalize-space(//Datum[@ID='Preset']/text()[last()])"/>

    <xsl:variable name="TITLE_TEXT"       select="normalize-space(//Datum[@ID='SectionTitleText']/text()[last()])"/>
    <xsl:variable name="TITLE_TAG_RAW"    select="normalize-space(//Datum[@ID='SectionTitleTag']/text()[last()])"/>
    <xsl:variable name="SUBHEAD_TEXT"     select="normalize-space(//Datum[@ID='SectionSubhead']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space(//Datum[@ID='HeaderAlignment']/text()[last()])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="SEE_ALL_TEXT"     select="normalize-space(//Datum[@ID='SeeAllText']/text()[last()])"/>
    <xsl:variable name="SEE_ALL_HREF"     select="normalize-space(//Datum[@ID='SeeAllHref']/text()[last()])"/>

    <xsl:variable name="FEED_URL"         select="normalize-space(//Datum[@ID='FeedUrl']/text()[last()])"/>
    <xsl:variable name="ITEM_COUNT"       select="normalize-space(//Datum[@ID='ItemCount']/text()[last()])"/>

    <xsl:variable name="HERO_POSTER"      select="normalize-space(//Datum[@ID='HeroPoster']/Image/Path)"/>

    <xsl:variable name="TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Stylesheet hoist -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <!-- Runtime config pushed onto window before the sidecar JS runs. -->
    <script>
      window.RBCCM_IN_THE_MEDIA_CONFIG = window.RBCCM_IN_THE_MEDIA_CONFIG || {};
      <xsl:if test="$FEED_URL != ''">window.RBCCM_IN_THE_MEDIA_CONFIG.feedUrl = "<xsl:value-of select="$FEED_URL"/>";</xsl:if>
      <xsl:if test="$ITEM_COUNT != ''">window.RBCCM_IN_THE_MEDIA_CONFIG.itemCount = <xsl:value-of select="$ITEM_COUNT"/>;</xsl:if>
      <xsl:if test="$HERO_POSTER != ''">window.RBCCM_IN_THE_MEDIA_CONFIG.heroPoster = "<xsl:value-of select="$HERO_POSTER"/>";</xsl:if>
    </script>

    <xsl:variable name="VARIANT_CLASS">
      <xsl:choose>
        <xsl:when test="$PRESET = 'strategy-and-economics-in-the-media'">rbccm-in-the-media--strategy-and-economics-in-the-media</xsl:when>
        <xsl:otherwise/>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$VARIANT_CLASS != ''">

      <xsl:variable name="TITLE_ID">
        <xsl:choose>
          <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/>-title</xsl:when>
          <xsl:otherwise>rbccm-in-the-media-title</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <section>
        <xsl:attribute name="class">rbccm-in-the-media <xsl:value-of select="$VARIANT_CLASS"/><xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-in-the-media--header-center</xsl:if></xsl:attribute>
        <xsl:if test="$SECTION_ID != ''">
          <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
        </xsl:if>
        <!-- Prefer aria-labelledby pointing at the visible title so
             SR users don't hear the label twice. Falls back to
             aria-label when no title is present. -->
        <xsl:choose>
          <xsl:when test="$TITLE_TEXT != ''">
            <xsl:attribute name="aria-labelledby"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
          </xsl:when>
          <xsl:when test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:when>
        </xsl:choose>
        <xsl:attribute name="data-rbccm-in-the-media-root">true</xsl:attribute>

        <div class="container rbccm-in-the-media__inner">

          <xsl:if test="$TITLE_TEXT != ''">
            <xsl:element name="{$TITLE_TAG}">
              <xsl:attribute name="class">rbccm-in-the-media__title</xsl:attribute>
              <xsl:attribute name="id"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
              <!-- Scroll-triggered reveal driven by rbccm-animate/rbccm-animate.js. -->
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:value-of select="$TITLE_TEXT" disable-output-escaping="yes"/>
            </xsl:element>
          </xsl:if>

          <!-- Optional subhead. Skipped entirely when the Datum is blank
               in TeamSite so no empty &lt;p&gt; ships to the DOM. -->
          <xsl:if test="$SUBHEAD_TEXT != ''">
            <p class="rbccm-in-the-media__subtitle" data-animate="fadeInUp" data-animate-delay="100"><xsl:value-of select="$SUBHEAD_TEXT" disable-output-escaping="yes"/></p>
          </xsl:if>

          <div class="rbccm-in-the-media__content">

            <!-- Featured card shell. Empty by default; JS populates
                 from item[0] of the feed. Scroll-triggered reveal via
                 rbccm-animate/rbccm-animate.js. -->
            <article class="rbccm-in-the-media__featured" data-rbccm-in-the-media-featured="true" data-animate="fadeInUp" data-animate-delay="200">
              <!-- Static aria-label so the anchor has an accessible
                   name even if the sidecar JS never runs (WCAG 4.1.2
                   graceful-degradation). JS overrides this with the
                   full title + "opens in new tab" once feed data
                   arrives. -->
              <a class="rbccm-in-the-media__media" href="#" target="_blank" rel="noopener" aria-label="Featured media coverage" data-rbccm-in-the-media-media-anchor="true">
                <img class="rbccm-in-the-media__image" alt="" loading="lazy" decoding="async" data-rbccm-in-the-media-image="true">
                  <xsl:if test="$HERO_POSTER != ''">
                    <xsl:attribute name="src"><xsl:value-of select="$HERO_POSTER"/></xsl:attribute>
                  </xsl:if>
                </img>
                <span class="rbccm-in-the-media__play" aria-hidden="true">
                  <xsl:call-template name="playTriangle"/>
                </span>
              </a>
              <div class="rbccm-in-the-media__featured-content">
                <span class="rbccm-in-the-media__eyebrow" data-rbccm-in-the-media-eyebrow="true"></span>
                <h3 class="rbccm-in-the-media__featured-title" data-rbccm-in-the-media-featured-title="true"></h3>
                <div class="rbccm-in-the-media__featured-expert" data-rbccm-in-the-media-featured-expert="true"></div>
              </div>
            </article>

            <!-- Media-appearance list shell. Empty rows by default;
                 JS populates from items 1..itemCount-1 of the feed.
                 data-stagger-parent lets rbccm-animate.js reveal each
                 populated row in sequence. fadeInRight (not fadeInUp)
                 differentiates the list from the featured card that
                 already fades up from below. -->
            <ul class="rbccm-in-the-media__list" data-rbccm-in-the-media-list="true" data-stagger-parent="fadeInRight" data-stagger-step="200"></ul>

          </div>

          <xsl:if test="$SEE_ALL_TEXT != ''">
            <a class="rbccm-in-the-media__see-all">
              <xsl:attribute name="href">
                <xsl:choose>
                  <xsl:when test="$SEE_ALL_HREF != ''"><xsl:value-of select="$SEE_ALL_HREF"/></xsl:when>
                  <xsl:otherwise>#</xsl:otherwise>
                </xsl:choose>
              </xsl:attribute>
              <span><xsl:value-of select="$SEE_ALL_TEXT"/></span>
              <xsl:call-template name="seeAllArrow"/>
            </a>
          </xsl:if>

        </div>
      </section>

      <xsl:if test="$JS_PATH != ''">
        <script>
          <xsl:attribute name="src">
            <xsl:value-of select="$JS_PATH"/>
            <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
          </xsl:attribute>
        </script>
      </xsl:if>

    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
