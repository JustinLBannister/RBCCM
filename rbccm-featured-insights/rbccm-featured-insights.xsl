<?xml version="1.0" encoding="UTF-8"?>
<!--
  rbccm-featured-insights.xsl
  =========================================================================
  Preset-driven skin for the Featured Insights section. Author-curated
  4-tile block (1 featured + 3 regular) with a section header + subhead
  on top and a VIEW ALL INSIGHTS link pinned bottom-LEFT.

  The $VARIANT_CLASS map resolves the Preset Datum to a BEM modifier
  class stamped onto the section root. Add a new preset by:
    1. Adding an Option to the Preset Datum in Properties.xml
    2. Adding a matching <xsl:when> branch to VARIANT_CLASS below

  Presets:
    default
    strategy-and-economics-featured-insights

  Tile source dispatch
  =========================================================================
  Each tile resolves its content via a per-field <xsl:choose> chain with
  the same priority order the hero insight card uses:

    1. Manual override wins  If the Tile{N}<Field> text Datum is non-blank,
                             use it. Applies in every mode.
    2. DCR field             Only in dcr-picker mode. The Tile{N}Dcr picker
                             surfaces a DCR record whose wrapper element
                             name varies by picked type (article/insights,
                             article/.*, rbccm/episode, rbccm/imagine2025,
                             rbccm/casestudy) - the XSL wildcards the
                             wrapper via DCR/*/{field}.
    3. Pre-hydration fallback The manual Datum's value emits as the pre-
                             hydration server render; the tile also gets
                             data-hydrate-* attributes so rbccm-featured-
                             insights.js can overwrite it at runtime if
                             Tile{N}PinnedUrl matches a feed record.

  Runtime dispatch is section-level: the JS reads data-tile-source and
  data-tile-feed-urls off the section root, then walks each tile with a
  non-blank data-tile-pinned-url. In manual mode (and in dcr-picker mode
  when no tile has a pinned URL) the JS bails and the server-rendered
  content is authoritative.
  =========================================================================
-->
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- =====================================================================
       Datum variables
       ===================================================================== -->
  <xsl:variable name="PRESET"           select="//Datum[@ID='Preset']"/>
  <xsl:variable name="ASSET_VERSION"    select="//Datum[@ID='AssetVersion']"/>

  <xsl:variable name="SECTION_TITLE"    select="//Datum[@ID='SectionTitle']"/>
  <xsl:variable name="SECTION_TITLE_TAG" select="//Datum[@ID='SectionTitleTag']"/>
  <xsl:variable name="SECTION_SUBHEAD"  select="//Datum[@ID='SectionSubhead']"/>
  <xsl:variable name="HEADER_ALIGN"     select="//Datum[@ID='HeaderAlignment']"/>

  <!-- Tile source (section-level dispatch). TileSource has Options, so
       use text()[last()] to isolate the trailing default text. Unknown
       values coerce to dcr-picker (matches the Datum's default). -->
  <xsl:variable name="TILE_SOURCE_RAW" select="normalize-space(//Datum[@ID='TileSource']/text()[last()])"/>
  <xsl:variable name="TILE_SOURCE">
    <xsl:choose>
      <xsl:when test="$TILE_SOURCE_RAW = 'manual'">manual</xsl:when>
      <xsl:when test="$TILE_SOURCE_RAW = 'pinned-url'">pinned-url</xsl:when>
      <xsl:otherwise>dcr-picker</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="TILE_FEED_URLS"  select="normalize-space(//Datum[@ID='TileFeedUrls'])"/>

  <!-- Tile 1 (featured) -->
  <xsl:variable name="T1_EYEBROW"    select="//Datum[@ID='Tile1Eyebrow']"/>
  <xsl:variable name="T1_TITLE"      select="//Datum[@ID='Tile1Title']"/>
  <xsl:variable name="T1_DESC"       select="//Datum[@ID='Tile1Desc']"/>
  <xsl:variable name="T1_META"       select="//Datum[@ID='Tile1Meta']"/>
  <xsl:variable name="T1_HREF"       select="//Datum[@ID='Tile1Href']"/>
  <xsl:variable name="T1_ARIA"       select="//Datum[@ID='Tile1AriaLabel']"/>
  <xsl:variable name="T1_IMG_PATH"   select="//Datum[@ID='Tile1Image']/Image/Path"/>
  <xsl:variable name="T1_IMG_ALT"    select="//Datum[@ID='Tile1Image']/Image/Description"/>
  <xsl:variable name="T1_TOPIC"      select="//Datum[@ID='Tile1Topic']"/>
  <xsl:variable name="T1_REGION"     select="//Datum[@ID='Tile1Region']"/>
  <xsl:variable name="T1_DATE"       select="//Datum[@ID='Tile1Date']"/>
  <xsl:variable name="T1_DCR"        select="//Datum[@ID='Tile1Dcr']/DCR"/>
  <xsl:variable name="T1_PINNED"     select="normalize-space(//Datum[@ID='Tile1PinnedUrl'])"/>

  <!-- Tile 2 -->
  <xsl:variable name="T2_EYEBROW"    select="//Datum[@ID='Tile2Eyebrow']"/>
  <xsl:variable name="T2_TITLE"      select="//Datum[@ID='Tile2Title']"/>
  <xsl:variable name="T2_DESC"       select="//Datum[@ID='Tile2Desc']"/>
  <xsl:variable name="T2_META"       select="//Datum[@ID='Tile2Meta']"/>
  <xsl:variable name="T2_HREF"       select="//Datum[@ID='Tile2Href']"/>
  <xsl:variable name="T2_ARIA"       select="//Datum[@ID='Tile2AriaLabel']"/>
  <xsl:variable name="T2_IMG_PATH"   select="//Datum[@ID='Tile2Image']/Image/Path"/>
  <xsl:variable name="T2_IMG_ALT"    select="//Datum[@ID='Tile2Image']/Image/Description"/>
  <xsl:variable name="T2_TOPIC"      select="//Datum[@ID='Tile2Topic']"/>
  <xsl:variable name="T2_REGION"     select="//Datum[@ID='Tile2Region']"/>
  <xsl:variable name="T2_DATE"       select="//Datum[@ID='Tile2Date']"/>
  <xsl:variable name="T2_DCR"        select="//Datum[@ID='Tile2Dcr']/DCR"/>
  <xsl:variable name="T2_PINNED"     select="normalize-space(//Datum[@ID='Tile2PinnedUrl'])"/>

  <!-- Tile 3 -->
  <xsl:variable name="T3_EYEBROW"    select="//Datum[@ID='Tile3Eyebrow']"/>
  <xsl:variable name="T3_TITLE"      select="//Datum[@ID='Tile3Title']"/>
  <xsl:variable name="T3_DESC"       select="//Datum[@ID='Tile3Desc']"/>
  <xsl:variable name="T3_META"       select="//Datum[@ID='Tile3Meta']"/>
  <xsl:variable name="T3_HREF"       select="//Datum[@ID='Tile3Href']"/>
  <xsl:variable name="T3_ARIA"       select="//Datum[@ID='Tile3AriaLabel']"/>
  <xsl:variable name="T3_IMG_PATH"   select="//Datum[@ID='Tile3Image']/Image/Path"/>
  <xsl:variable name="T3_IMG_ALT"    select="//Datum[@ID='Tile3Image']/Image/Description"/>
  <xsl:variable name="T3_TOPIC"      select="//Datum[@ID='Tile3Topic']"/>
  <xsl:variable name="T3_REGION"     select="//Datum[@ID='Tile3Region']"/>
  <xsl:variable name="T3_DATE"       select="//Datum[@ID='Tile3Date']"/>
  <xsl:variable name="T3_DCR"        select="//Datum[@ID='Tile3Dcr']/DCR"/>
  <xsl:variable name="T3_PINNED"     select="normalize-space(//Datum[@ID='Tile3PinnedUrl'])"/>

  <!-- Tile 4 -->
  <xsl:variable name="T4_EYEBROW"    select="//Datum[@ID='Tile4Eyebrow']"/>
  <xsl:variable name="T4_TITLE"      select="//Datum[@ID='Tile4Title']"/>
  <xsl:variable name="T4_DESC"       select="//Datum[@ID='Tile4Desc']"/>
  <xsl:variable name="T4_META"       select="//Datum[@ID='Tile4Meta']"/>
  <xsl:variable name="T4_HREF"       select="//Datum[@ID='Tile4Href']"/>
  <xsl:variable name="T4_ARIA"       select="//Datum[@ID='Tile4AriaLabel']"/>
  <xsl:variable name="T4_IMG_PATH"   select="//Datum[@ID='Tile4Image']/Image/Path"/>
  <xsl:variable name="T4_IMG_ALT"    select="//Datum[@ID='Tile4Image']/Image/Description"/>
  <xsl:variable name="T4_TOPIC"      select="//Datum[@ID='Tile4Topic']"/>
  <xsl:variable name="T4_REGION"     select="//Datum[@ID='Tile4Region']"/>
  <xsl:variable name="T4_DATE"       select="//Datum[@ID='Tile4Date']"/>
  <xsl:variable name="T4_DCR"        select="//Datum[@ID='Tile4Dcr']/DCR"/>
  <xsl:variable name="T4_PINNED"     select="normalize-space(//Datum[@ID='Tile4PinnedUrl'])"/>

  <!-- Convenience: does any tile carry a non-blank pinned URL? Used to
       decide when the section as a whole needs the JS hydrator to walk
       the feed (dcr-picker mode is server-authoritative unless at least
       one tile opts into the safety-net path via Tile{N}PinnedUrl). -->
  <xsl:variable name="ANY_PINNED_URL" select="$T1_PINNED != '' or $T2_PINNED != '' or $T3_PINNED != '' or $T4_PINNED != ''"/>

  <!-- View all CTA -->
  <xsl:variable name="VIEW_ALL_LABEL" select="//Datum[@ID='ViewAllLabel']"/>
  <xsl:variable name="VIEW_ALL_HREF"  select="//Datum[@ID='ViewAllHref']"/>
  <xsl:variable name="VIEW_ALL_ARIA"  select="//Datum[@ID='ViewAllAriaLabel']"/>


  <!-- =====================================================================
       Reusable arrow SVGs (Datum-free, DRY)
       ===================================================================== -->
  <xsl:template name="tileArrowSvg">
    <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-tiles__insight-arrow" viewBox="0 0 7 11" fill="none" aria-hidden="true" focusable="false">
      <path d="M0.5 0.5L5.5 5.5L0.5 10.5" stroke-linecap="round"/>
    </svg>
  </xsl:template>

  <xsl:template name="viewAllArrowSvg">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 10H16 M16 10L10.5 4.5 M16 10L10.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </xsl:template>


  <!-- =====================================================================
       Tile template (call with tile params). Applies the __featured
       modifier class (BEM double-hyphen, __ substitution in comment
       to keep XML well-formed) when $featured = 'yes'.

       Resolution chain per emitted field:
         1. Manual override (Tile{N}<Field> non-blank) wins.
         2. Else, if $tileSource = 'dcr-picker' AND the DCR record ships
            the matching field, use the DCR value.
         3. Else, emit the manual value (may be blank) as pre-hydration
            fallback. The tile gets data-hydrate-* markers so the JS can
            overwrite it at runtime when $pinnedUrl matches a feed record.
       ===================================================================== -->
  <xsl:template name="renderTile">
    <xsl:param name="featured"/>
    <xsl:param name="tileSource"/>
    <xsl:param name="pinnedUrl"/>
    <xsl:param name="dcrRoot"/>
    <xsl:param name="eyebrow"/>
    <xsl:param name="title"/>
    <xsl:param name="desc"/>
    <xsl:param name="meta"/>
    <xsl:param name="href"/>
    <xsl:param name="aria"/>
    <xsl:param name="imgPath"/>
    <xsl:param name="imgAlt"/>
    <xsl:param name="topic"/>
    <xsl:param name="region"/>
    <xsl:param name="date"/>

    <!-- DCR field lookups. Wildcard the DCR wrapper element name because
         the Tile{N}Dcr picker allows several types (article/.*, rbccm/
         episode, rbccm/imagine2025, rbccm/casestudy) - the wrapper
         element name is not fixed. Field names mirror the story-tiles-
         default XPath convention (title / description / publish_date /
         link / thumbnail). -->
    <xsl:variable name="dcrTitle" select="normalize-space($dcrRoot/*/title)"/>
    <xsl:variable name="dcrDesc"  select="$dcrRoot/*/description"/>
    <xsl:variable name="dcrDate"  select="normalize-space($dcrRoot/*/publish_date)"/>
    <xsl:variable name="dcrLink"  select="normalize-space($dcrRoot/*/link)"/>
    <xsl:variable name="dcrUrl"   select="normalize-space($dcrRoot/*/url)"/>
    <xsl:variable name="dcrThumb" select="normalize-space($dcrRoot/*/thumbnail)"/>

    <!-- Effective title: manual > dcr-picker/DCR > manual fallback. -->
    <xsl:variable name="effTitle">
      <xsl:choose>
        <xsl:when test="normalize-space($title) != ''"><xsl:value-of select="$title"/></xsl:when>
        <xsl:when test="$tileSource = 'dcr-picker' and $dcrTitle != ''"><xsl:value-of select="$dcrTitle"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Effective description. Preserves inline HTML via disable-output-
         escaping downstream. -->
    <xsl:variable name="effDesc">
      <xsl:choose>
        <xsl:when test="normalize-space($desc) != ''"><xsl:value-of select="$desc"/></xsl:when>
        <xsl:when test="$tileSource = 'dcr-picker' and normalize-space($dcrDesc) != ''"><xsl:value-of select="$dcrDesc"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$desc"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Effective date. Pass DCR publish_date through as-is (the feed and
         DCR both ship human-readable strings on RBCCM). -->
    <xsl:variable name="effDate">
      <xsl:choose>
        <xsl:when test="normalize-space($date) != ''"><xsl:value-of select="$date"/></xsl:when>
        <xsl:when test="$tileSource = 'dcr-picker' and $dcrDate != ''"><xsl:value-of select="$dcrDate"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$date"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Effective href: manual > dcr-picker/DCR link (or url) > manual. -->
    <xsl:variable name="effHref">
      <xsl:choose>
        <xsl:when test="normalize-space($href) != ''"><xsl:value-of select="$href"/></xsl:when>
        <xsl:when test="$tileSource = 'dcr-picker' and $dcrLink != ''"><xsl:value-of select="$dcrLink"/></xsl:when>
        <xsl:when test="$tileSource = 'dcr-picker' and $dcrUrl != ''"><xsl:value-of select="$dcrUrl"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$href"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Effective image path: manual > dcr-picker/DCR thumbnail > manual. -->
    <xsl:variable name="effImg">
      <xsl:choose>
        <xsl:when test="normalize-space($imgPath) != ''"><xsl:value-of select="$imgPath"/></xsl:when>
        <xsl:when test="$tileSource = 'dcr-picker' and $dcrThumb != ''"><xsl:value-of select="$dcrThumb"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$imgPath"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Should we stamp hydrate hooks on this tile? Yes when the tile
         will be a client-hydration target: either the section is in
         pinned-url mode (all tiles hydrate) or the section is in dcr-
         picker mode AND this tile has a pinned URL (safety net). In
         both cases we need a non-blank pinnedUrl for JS to match.
         Manual mode = never. -->
    <xsl:variable name="hydrateThisTile" select="($tileSource = 'pinned-url' or $tileSource = 'dcr-picker') and normalize-space($pinnedUrl) != ''"/>

    <!-- Wrapper is a <div role="listitem"> instead of a real <li> because
         Slick moves each item into <div class="slick-slide"> at init,
         which breaks the "li must be a child of ul/ol" a11y rule.
         Keeping ARIA roles preserves the "list, N items" announcement
         for screen readers without depending on the DOM parent. -->
    <div class="rbccm-insight-tiles__item" role="listitem">
      <xsl:if test="$hydrateThisTile">
        <xsl:attribute name="data-tile-pinned-url"><xsl:value-of select="$pinnedUrl"/></xsl:attribute>
      </xsl:if>
      <a>
        <xsl:attribute name="class">
          <xsl:choose>
            <xsl:when test="$featured = 'yes'">rbccm-insight-tiles__insight rbccm-insight-tiles__insight--featured</xsl:when>
            <xsl:otherwise>rbccm-insight-tiles__insight</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:attribute name="href"><xsl:value-of select="$effHref"/></xsl:attribute>
        <!-- NO aria-label on the tile anchor. Screen readers should read the
             full card content (eyebrow, title, description, meta) as the
             accessible name of the link. An aria-label on the <a> would
             override all that with a single flat string. Matches the home
             page implementation. AriaLabel Datum is intentionally kept in
             Properties.xml as an author-facing note but no longer emitted. -->

        <div class="rbccm-insight-tiles__insight-media">
          <img loading="lazy">
            <xsl:attribute name="src"><xsl:value-of select="$effImg"/></xsl:attribute>
            <xsl:attribute name="alt"><xsl:value-of select="$imgAlt"/></xsl:attribute>
          </img>
        </div>

        <div class="rbccm-insight-tiles__insight-body">
          <div class="rbccm-insight-tiles__insight-label"><xsl:value-of select="$eyebrow"/></div>
          <div class="rbccm-insight-tiles__insight-divider" aria-hidden="true"></div>
          <h2 class="rbccm-insight-tiles__insight-title">
            <xsl:if test="$hydrateThisTile">
              <xsl:attribute name="data-hydrate-title"></xsl:attribute>
            </xsl:if>
            <xsl:value-of select="$effTitle"/>
          </h2>
          <p class="rbccm-insight-tiles__insight-desc">
            <xsl:if test="$hydrateThisTile">
              <xsl:attribute name="data-hydrate-desc"></xsl:attribute>
            </xsl:if>
            <xsl:value-of select="$effDesc" disable-output-escaping="yes"/>
          </p>

          <!-- Bottom row: meta (left) + taxonomy stack (right). Topic +
               Region are in the DOM for downstream flip (the baseline
               CSS hides them and shows only Date) but authors fill
               them per tile so they're ready when the page turns them
               on. Matches the rbccm-conference-insights-tiles pattern. -->
          <div class="rbccm-insight-tiles__insight-bottom">
            <p class="rbccm-insight-tiles__insight-meta">
              <span><xsl:value-of select="$meta"/></span>
              <xsl:call-template name="tileArrowSvg"/>
            </p>
            <div class="rbccm-insight-tiles__insight-taxonomy">
              <xsl:if test="normalize-space($topic) != ''">
                <span class="rbccm-insight-tiles__insight-topic"><xsl:value-of select="$topic"/></span>
              </xsl:if>
              <xsl:if test="normalize-space($region) != ''">
                <span class="rbccm-insight-tiles__insight-region"><xsl:value-of select="$region"/></span>
              </xsl:if>
              <xsl:if test="normalize-space($effDate) != ''">
                <span class="rbccm-insight-tiles__insight-date">
                  <xsl:if test="$hydrateThisTile">
                    <xsl:attribute name="data-hydrate-date"></xsl:attribute>
                  </xsl:if>
                  <xsl:value-of select="$effDate"/>
                </span>
              </xsl:if>
              <!-- When there is no server-side date but the tile will
                   hydrate, emit an empty span so the JS has a slot to
                   write into rather than injecting a new element. -->
              <xsl:if test="normalize-space($effDate) = '' and $hydrateThisTile">
                <span class="rbccm-insight-tiles__insight-date" data-hydrate-date=""></span>
              </xsl:if>
            </div>
          </div>
        </div>
      </a>
    </div>
  </xsl:template>


  <!-- =====================================================================
       Root template
       ===================================================================== -->
  <xsl:template match="/">

    <!-- Preset-to-variant-class map. Extend by adding another
         xsl:when branch below AND a matching Option in Properties.xml. -->
    <xsl:variable name="VARIANT_CLASS">
      <xsl:choose>
        <xsl:when test="$PRESET = 'strategy-and-economics-featured-insights'">rbccm-featured-insights--strategy-and-economics-featured-insights</xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Stylesheet link (append AssetVersion for cache-busting) -->
    <link rel="stylesheet">
      <xsl:attribute name="href">/assets/rbccm/css/components/rbccm-featured-insights.css?v=<xsl:value-of select="$ASSET_VERSION"/></xsl:attribute>
    </link>

    <section aria-label="Featured insights">
      <xsl:attribute name="class">rbccm-featured-insights <xsl:value-of select="$VARIANT_CLASS"/><xsl:if test="normalize-space($HEADER_ALIGN) = 'center'"> rbccm-featured-insights--header-center</xsl:if></xsl:attribute>

      <!-- Section-level hydration config. data-tile-source is always
           stamped so the JS's per-section dispatch is unambiguous.
           data-tile-feed-urls is only emitted when the section might
           hydrate (pinned-url mode always; dcr-picker only when at least
           one tile has a pinned URL). In manual mode neither the feed
           URLs nor the per-tile pinned-URL attributes are read - the JS
           short-circuits after reading data-tile-source. -->
      <xsl:attribute name="data-tile-source"><xsl:value-of select="$TILE_SOURCE"/></xsl:attribute>
      <xsl:if test="($TILE_SOURCE = 'pinned-url' or ($TILE_SOURCE = 'dcr-picker' and $ANY_PINNED_URL)) and $TILE_FEED_URLS != ''">
        <xsl:attribute name="data-tile-feed-urls"><xsl:value-of select="$TILE_FEED_URLS"/></xsl:attribute>
      </xsl:if>

      <div class="rbccm-featured-insights__inner">

        <!-- ===== Section header ===== -->
        <div class="rbccm-featured-insights__header">
          <xsl:choose>
            <xsl:when test="$SECTION_TITLE_TAG = 'h2'">
              <h2 class="rbccm-featured-insights__title" data-animate="fadeInUp"><xsl:value-of select="$SECTION_TITLE"/></h2>
            </xsl:when>
            <xsl:when test="$SECTION_TITLE_TAG = 'h4'">
              <h4 class="rbccm-featured-insights__title" data-animate="fadeInUp"><xsl:value-of select="$SECTION_TITLE"/></h4>
            </xsl:when>
            <xsl:otherwise>
              <h3 class="rbccm-featured-insights__title" data-animate="fadeInUp"><xsl:value-of select="$SECTION_TITLE"/></h3>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:if test="normalize-space($SECTION_SUBHEAD) != ''">
            <p class="rbccm-featured-insights__subtitle" data-animate="fadeInUp" data-animate-delay="250"><xsl:value-of select="$SECTION_SUBHEAD" disable-output-escaping="yes"/></p>
          </xsl:if>
        </div>

        <!-- Screen-reader-only live region for the Slick a11y announcer. -->
        <div class="rbccm-featured-insights__sr-only" aria-live="polite" aria-atomic="true"></div>

        <!-- ===== Tile grid =====
             data-stagger-parent lets rbccm-animate/rbccm-animate.js reveal
             each tile in sequence as the row enters the viewport. -->
        <!-- Row container is a <div role="list"> so screen readers still
             hear "list, 4 items" even after Slick reparents each child
             into <div class="slick-slide">. Using semantic <ul>/<li>
             would trip axe's "li must be direct child of ul/ol" check
             once Slick moves the items. -->
        <div class="rbccm-insight-tiles__row" role="list" data-stagger-parent="fadeInUp" data-stagger-step="200">

          <xsl:call-template name="renderTile">
            <xsl:with-param name="featured"   select="'yes'"/>
            <xsl:with-param name="tileSource" select="$TILE_SOURCE"/>
            <xsl:with-param name="pinnedUrl"  select="$T1_PINNED"/>
            <xsl:with-param name="dcrRoot"    select="$T1_DCR"/>
            <xsl:with-param name="eyebrow"    select="$T1_EYEBROW"/>
            <xsl:with-param name="title"      select="$T1_TITLE"/>
            <xsl:with-param name="desc"       select="$T1_DESC"/>
            <xsl:with-param name="meta"       select="$T1_META"/>
            <xsl:with-param name="href"       select="$T1_HREF"/>
            <xsl:with-param name="aria"       select="$T1_ARIA"/>
            <xsl:with-param name="imgPath"    select="$T1_IMG_PATH"/>
            <xsl:with-param name="imgAlt"     select="$T1_IMG_ALT"/>
            <xsl:with-param name="topic"      select="$T1_TOPIC"/>
            <xsl:with-param name="region"     select="$T1_REGION"/>
            <xsl:with-param name="date"       select="$T1_DATE"/>
          </xsl:call-template>

          <xsl:call-template name="renderTile">
            <xsl:with-param name="featured"   select="'no'"/>
            <xsl:with-param name="tileSource" select="$TILE_SOURCE"/>
            <xsl:with-param name="pinnedUrl"  select="$T2_PINNED"/>
            <xsl:with-param name="dcrRoot"    select="$T2_DCR"/>
            <xsl:with-param name="eyebrow"    select="$T2_EYEBROW"/>
            <xsl:with-param name="title"      select="$T2_TITLE"/>
            <xsl:with-param name="desc"       select="$T2_DESC"/>
            <xsl:with-param name="meta"       select="$T2_META"/>
            <xsl:with-param name="href"       select="$T2_HREF"/>
            <xsl:with-param name="aria"       select="$T2_ARIA"/>
            <xsl:with-param name="imgPath"    select="$T2_IMG_PATH"/>
            <xsl:with-param name="imgAlt"     select="$T2_IMG_ALT"/>
            <xsl:with-param name="topic"      select="$T2_TOPIC"/>
            <xsl:with-param name="region"     select="$T2_REGION"/>
            <xsl:with-param name="date"       select="$T2_DATE"/>
          </xsl:call-template>

          <xsl:call-template name="renderTile">
            <xsl:with-param name="featured"   select="'no'"/>
            <xsl:with-param name="tileSource" select="$TILE_SOURCE"/>
            <xsl:with-param name="pinnedUrl"  select="$T3_PINNED"/>
            <xsl:with-param name="dcrRoot"    select="$T3_DCR"/>
            <xsl:with-param name="eyebrow"    select="$T3_EYEBROW"/>
            <xsl:with-param name="title"      select="$T3_TITLE"/>
            <xsl:with-param name="desc"       select="$T3_DESC"/>
            <xsl:with-param name="meta"       select="$T3_META"/>
            <xsl:with-param name="href"       select="$T3_HREF"/>
            <xsl:with-param name="aria"       select="$T3_ARIA"/>
            <xsl:with-param name="imgPath"    select="$T3_IMG_PATH"/>
            <xsl:with-param name="imgAlt"     select="$T3_IMG_ALT"/>
            <xsl:with-param name="topic"      select="$T3_TOPIC"/>
            <xsl:with-param name="region"     select="$T3_REGION"/>
            <xsl:with-param name="date"       select="$T3_DATE"/>
          </xsl:call-template>

          <xsl:call-template name="renderTile">
            <xsl:with-param name="featured"   select="'no'"/>
            <xsl:with-param name="tileSource" select="$TILE_SOURCE"/>
            <xsl:with-param name="pinnedUrl"  select="$T4_PINNED"/>
            <xsl:with-param name="dcrRoot"    select="$T4_DCR"/>
            <xsl:with-param name="eyebrow"    select="$T4_EYEBROW"/>
            <xsl:with-param name="title"      select="$T4_TITLE"/>
            <xsl:with-param name="desc"       select="$T4_DESC"/>
            <xsl:with-param name="meta"       select="$T4_META"/>
            <xsl:with-param name="href"       select="$T4_HREF"/>
            <xsl:with-param name="aria"       select="$T4_ARIA"/>
            <xsl:with-param name="imgPath"    select="$T4_IMG_PATH"/>
            <xsl:with-param name="imgAlt"     select="$T4_IMG_ALT"/>
            <xsl:with-param name="topic"      select="$T4_TOPIC"/>
            <xsl:with-param name="region"     select="$T4_REGION"/>
            <xsl:with-param name="date"       select="$T4_DATE"/>
          </xsl:call-template>

        </div>

        <!-- ===== Slick controls (only shown &lt;992px via CSS) ===== -->
        <div class="rbccm-featured-insights__controls">
          <button class="rbccm-featured-insights__btn rbccm-featured-insights__btn--prev" type="button" aria-label="Previous insight">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="rbccm-featured-insights__dots"></div>
          <button class="rbccm-featured-insights__btn rbccm-featured-insights__btn--next" type="button" aria-label="Next insight">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- ===== VIEW ALL CTA (bottom-LEFT) ===== -->
        <div class="rbccm-featured-insights__cta-row">
          <a class="rbccm-featured-insights__view-all">
            <xsl:attribute name="href"><xsl:value-of select="$VIEW_ALL_HREF"/></xsl:attribute>
            <xsl:if test="normalize-space($VIEW_ALL_ARIA) != ''">
              <xsl:attribute name="aria-label"><xsl:value-of select="$VIEW_ALL_ARIA"/></xsl:attribute>
            </xsl:if>
            <span><xsl:value-of select="$VIEW_ALL_LABEL"/></span>
            <xsl:call-template name="viewAllArrowSvg"/>
          </a>
        </div>

      </div>
    </section>

    <!-- Sidecar JS. This file ships two concerns:
           1. The Slick carousel init (below 992px) - required for ANY
              mode, so the script include is unconditional.
           2. The pinned-URL feed hydrator - guarded internally by a
              section-level dispatch that reads data-tile-source. In
              manual mode (and in dcr-picker with no pinned URLs) the
              hydrator short-circuits and only the carousel runs.
         Rendering the include unconditionally keeps the carousel alive
         regardless of TileSource; the hydration cost is only paid when
         the section opts in via a non-blank Tile{N}PinnedUrl. -->
    <script>
      <xsl:attribute name="src">/assets/rbccm/js/components/rbccm-featured-insights.js?v=<xsl:value-of select="$ASSET_VERSION"/></xsl:attribute>
    </script>

  </xsl:template>
</xsl:stylesheet>
