<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Two-Up Cards :: video-single (single-skin build)
  ============================================================
  Standalone skin for TeamSite's Skin dropdown. Same styling as
  the video-callouts skin, but ONE video: the section heading +
  description sit in the left column (vertically centred) and
  Card 1's video thumbnail sits in the right column. The card is
  the thumbnail and play icon only; Card 1's title, subtitle,
  body and CTA label are not shown (the title still names the
  link for screen readers). Stacks (header, then video) below
  872px. Card 2 fields are ignored. Section classes: the video-callouts modifier (all its
  styling) plus the video-single modifier (the split layout).

  Companion skins: rbccm-two-up-cards (double-dash) features.xsl,
  (double-dash) video-callouts.xsl
  Fields: rbccm-two-up-cards-properties.xml (shared by all skins).
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- ============================================================
       FPO fallback (temporary, Oct 2026). The component won't open in
       the content editor yet, so when Card 1 has no video URL and no
       image (blank, or still the properties defaults, which are
       features-skin copy) the skin shows the hardcoded Institutional
       Investors content below instead of the entered text. Once the
       editor works and Card 1 has a video or image, the entered
       content shows. Remove this block and the USE_FPO branches then.
       FPO_CACHE replaces the stale CacheVersion default so the new
       CSS loads; bump it if the CSS is uploaded again.
       ============================================================ -->
  <xsl:variable name="USE_FPO" select="normalize-space(//Datum[@ID='Card1VideoUrl']/text()[last()]) = '' and normalize-space(//Datum[@ID='Card1MediaImagePath']/text()[last()]) = ''"/>
  <xsl:variable name="FPO_CACHE">2026-10-28-1800</xsl:variable>
  <xsl:variable name="FPO_HEADING">Find conviction through complexity</xsl:variable>
  <xsl:variable name="FPO_DESCRIPTION">&lt;span&gt;Macro shifts, changing correlations, and a broader opportunity set are reshaping how institutions pursue alpha. RBC&#8217;s senior leaders discuss what institutional investors need from a counterparty today, and how innovation, collaboration and creative solutions can help them move with greater speed and agility.&lt;/span&gt;</xsl:variable>
  <xsl:variable name="FPO_TITLE">Institutional Investors</xsl:variable>
  <xsl:variable name="FPO_IMAGE">/assets/rbccm/images/about-us/us-credentials/us-credentials-institutional-investors.webp</xsl:variable>
  <xsl:variable name="FPO_IMAGE_ALT">Institutional Investors</xsl:variable>
  <xsl:variable name="FPO_LINK">/en/about-us/us-credentials?hero=global-markets</xsl:variable>

  <!-- Tag allow-list guard. -->
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

  <!-- ============================================================
       renderVideoCard  (video-single)
       The whole card is ONE link: the thumbnail with the play icon
       over it (the icon shows whenever the card links). aria-label
       names it from the title (or image alt), since there is no
       visible text.
         - Video URL set: href is the video URL and data-video-url is
           on the card; the JS opens the modal (no-JS falls back to the
           video page).
         - No video, CTA URL set: plain link to the CTA URL (a page
           that plays the video), no modal.
         - Neither: a static <article>, no link.
       ============================================================ -->
  <xsl:template name="renderVideoCard">
    <xsl:param name="mediaPath"/>
    <xsl:param name="mediaAlt"/>
    <xsl:param name="videoUrl"/>
    <xsl:param name="title"/>
    <xsl:param name="ctaHref"/>

    <xsl:variable name="cardHref">
      <xsl:choose>
        <xsl:when test="$videoUrl != ''"><xsl:value-of select="$videoUrl"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$ctaHref"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="name">
      <xsl:choose>
        <xsl:when test="$title != ''"><xsl:value-of select="$title"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$mediaAlt"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:element name="{normalize-space(substring('a      article', 1 + 7 * number($cardHref = ''), 7))}">
      <xsl:attribute name="class">
        <xsl:text>rbccm-two-up-cards__card</xsl:text>
        <xsl:if test="$cardHref != ''"><xsl:text> rbccm-two-up-cards__card--link</xsl:text></xsl:if>
      </xsl:attribute>
      <xsl:if test="$cardHref != ''">
        <xsl:attribute name="href"><xsl:value-of select="$cardHref"/></xsl:attribute>
        <xsl:attribute name="aria-label">
          <xsl:choose>
            <xsl:when test="$videoUrl != '' and $name != ''">Watch the video: <xsl:value-of select="$name"/></xsl:when>
            <xsl:when test="$videoUrl != ''">Watch the video</xsl:when>
            <xsl:otherwise><xsl:value-of select="$name"/></xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$videoUrl != ''">
        <xsl:attribute name="data-video-url"><xsl:value-of select="$videoUrl"/></xsl:attribute>
      </xsl:if>

      <!-- Play circle (CSS navy-45% fill + backdrop-blur) holding the
           "Watch the video" CTA arrow from the video-callouts skin, in
           place of the play triangle. White via currentColor. -->
      <div class="rbccm-two-up-cards__card-media">
        <img alt="{$mediaAlt}" loading="lazy" decoding="async">
          <xsl:attribute name="src"><xsl:value-of select="$mediaPath"/></xsl:attribute>
        </img>
        <xsl:if test="$cardHref != ''">
          <span class="rbccm-two-up-cards__card-play" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.00002C1.5 7.86741 1.55268 7.74024 1.64645 7.64647C1.74021 7.5527 1.86739 7.50002 2 7.50002H13.793L10.646 4.35402C10.5521 4.26013 10.4994 4.1328 10.4994 4.00002C10.4994 3.86725 10.5521 3.73991 10.646 3.64602C10.7399 3.55213 10.8672 3.49939 11 3.49939C11.1328 3.49939 11.2601 3.55213 11.354 3.64602L15.354 7.64602C15.4006 7.69247 15.4375 7.74764 15.4627 7.80839C15.4879 7.86913 15.5009 7.93425 15.5009 8.00002C15.5009 8.06579 15.4879 8.13091 15.4627 8.19165C15.4375 8.2524 15.4006 8.30758 15.354 8.35402L11.354 12.354C11.2601 12.4479 11.1328 12.5007 11 12.5007C10.8672 12.5007 10.7399 12.4479 10.646 12.354C10.5521 12.2601 10.4994 12.1328 10.4994 12C10.4994 11.8672 10.5521 11.7399 10.646 11.646L13.793 8.50002H2C1.86739 8.50002 1.74021 8.44734 1.64645 8.35357C1.55268 8.25981 1.5 8.13263 1.5 8.00002Z" fill="currentColor"/>
            </svg>
          </span>
        </xsl:if>
      </div>
    </xsl:element>
  </xsl:template>

  <!-- ============================================================
       renderCardSlot : per-slot lookup.
       ============================================================ -->
  <xsl:template name="renderCardSlot">
    <xsl:param name="n"/>

    <xsl:variable name="title"     select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()])"/>
    <xsl:variable name="mediaPath" select="normalize-space(//Datum[@ID=concat('Card', $n, 'MediaImagePath')]/text()[last()])"/>
    <xsl:variable name="mediaAlt"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'MediaImageAlt')]/text()[last()])"/>
    <xsl:variable name="videoUrl"  select="normalize-space(//Datum[@ID=concat('Card', $n, 'VideoUrl')]/text()[last()])"/>
    <xsl:variable name="ctaHref"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'CtaHref')]/text()[last()])"/>

    <xsl:choose>
      <xsl:when test="$USE_FPO">
        <xsl:call-template name="renderVideoCard">
          <xsl:with-param name="mediaPath" select="string($FPO_IMAGE)"/>
          <xsl:with-param name="mediaAlt" select="string($FPO_IMAGE_ALT)"/>
          <xsl:with-param name="videoUrl" select="''"/>
          <xsl:with-param name="title" select="string($FPO_TITLE)"/>
          <xsl:with-param name="ctaHref" select="string($FPO_LINK)"/>
        </xsl:call-template>
      </xsl:when>
      <!-- No image hides the card (there is nothing else to show). -->
      <xsl:when test="$mediaPath != ''">
        <xsl:call-template name="renderVideoCard">
          <xsl:with-param name="mediaPath" select="$mediaPath"/>
          <xsl:with-param name="mediaAlt" select="$mediaAlt"/>
          <xsl:with-param name="videoUrl" select="$videoUrl"/>
          <xsl:with-param name="title" select="$title"/>
          <xsl:with-param name="ctaHref" select="$ctaHref"/>
        </xsl:call-template>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <!-- Visible text of a rich-text field: tags stripped. Used to treat
       fields the editor left with only placeholder markup
       (<br data-mce-bogus="1">, <p>&nbsp;</p>) as blank. -->
  <xsl:template name="stripTags">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, '&lt;') and contains(substring-after($s, '&lt;'), '&gt;')">
        <xsl:value-of select="substring-before($s, '&lt;')"/>
        <xsl:call-template name="stripTags">
          <xsl:with-param name="s" select="substring-after(substring-after($s, '&lt;'), '&gt;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH_IN"   select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH_IN"    select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_IN"      select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="BG_COLOR"      select="normalize-space(//Datum[@ID='SectionBgColor']/text()[last()])"/>

    <!-- Blank paths fall back to the properties defaults. -->
    <xsl:variable name="CSS_PATH">
      <xsl:choose>
        <xsl:when test="$CSS_PATH_IN != ''"><xsl:value-of select="$CSS_PATH_IN"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/css/components/rbccm-two-up-cards.css</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="JS_PATH">
      <xsl:choose>
        <xsl:when test="$JS_PATH_IN != ''"><xsl:value-of select="$JS_PATH_IN"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/js/components/rbccm-two-up-cards.js</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="CACHE_VERSION">
      <xsl:choose>
        <xsl:when test="$USE_FPO or $CACHE_IN = ''"><xsl:value-of select="$FPO_CACHE"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$CACHE_IN"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- FPO mode: no eyebrow, hardcoded heading and description. -->
    <xsl:variable name="EYEBROW">
      <xsl:if test="not($USE_FPO)"><xsl:value-of select="normalize-space(//Datum[@ID='SectionEyebrowText']/text()[last()])"/></xsl:if>
    </xsl:variable>
    <xsl:variable name="HEADING">
      <xsl:choose>
        <xsl:when test="$USE_FPO"><xsl:value-of select="$FPO_HEADING"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space(//Datum[@ID='SectionHeadingText']/text()[last()])"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="HEADING_TAG_RAW" select="normalize-space(//Datum[@ID='SectionHeadingTag']/text()[last()])"/>
    <xsl:variable name="DESCRIPTION_RAW">
      <xsl:choose>
        <xsl:when test="$USE_FPO"><xsl:value-of select="$FPO_DESCRIPTION"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space(//Datum[@ID='SectionDescriptionText']/text()[last()])"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="DESCRIPTION_TEXT">
      <xsl:call-template name="stripTags"><xsl:with-param name="s" select="$DESCRIPTION_RAW"/></xsl:call-template>
    </xsl:variable>
    <!-- Blank unless real text is left once markup and &nbsp; are gone. -->
    <xsl:variable name="DESCRIPTION">
      <xsl:if test="normalize-space(translate($DESCRIPTION_TEXT, '&#160;&amp;nbsp;', '')) != ''">
        <xsl:value-of select="$DESCRIPTION_RAW"/>
      </xsl:if>
    </xsl:variable>

    <xsl:variable name="HEADING_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$HEADING_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Stylesheet hoist. -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <section>
      <xsl:attribute name="class">
        <xsl:text>rbccm-two-up-cards rbccm-two-up-cards--video-callouts rbccm-two-up-cards--video-single</xsl:text>
        <!-- Section colour set: the CSS gives the card a white background. -->
        <xsl:if test="$BG_COLOR != ''"><xsl:text> rbccm-two-up-cards--has-bg</xsl:text></xsl:if>
      </xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$HEADING"/></xsl:attribute>
        </xsl:when>
      </xsl:choose>
      <!-- Optional section background colour override. -->
      <xsl:if test="$BG_COLOR != ''">
        <xsl:attribute name="style">--rbccm-two-up-cards-bg: <xsl:value-of select="$BG_COLOR"/>;</xsl:attribute>
      </xsl:if>

      <!-- Two columns at 872px+: header left, card right. -->
      <div class="rbccm-two-up-cards__split">

      <xsl:if test="$EYEBROW != '' or $HEADING != '' or $DESCRIPTION != ''">
        <div class="rbccm-two-up-cards__header">
          <xsl:if test="$EYEBROW != ''">
            <p class="rbccm-two-up-cards__eyebrow" data-animate="fadeInUp"><xsl:value-of select="$EYEBROW"/></p>
          </xsl:if>
          <xsl:if test="$HEADING != ''">
            <xsl:element name="{$HEADING_TAG}">
              <xsl:attribute name="class">rbccm-two-up-cards__heading</xsl:attribute>
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:attribute name="data-animate-delay">120</xsl:attribute>
              <xsl:value-of select="$HEADING"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$DESCRIPTION != ''">
            <p class="rbccm-two-up-cards__description" data-animate="fadeInUp" data-animate-delay="240">
              <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$DESCRIPTION"/></xsl:call-template>
            </p>
          </xsl:if>
        </div>
      </xsl:if>

      <div class="rbccm-two-up-cards__grid" data-stagger-parent="fadeInUp" data-stagger-step="150">
        <xsl:call-template name="renderCardSlot">
          <xsl:with-param name="n" select="1"/>
        </xsl:call-template>
      </div>

      </div>

    </section>

    <!-- Video modal runtime. -->
    <xsl:if test="$JS_PATH != ''">
      <script>
        <xsl:attribute name="src">
          <xsl:value-of select="$JS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </script>
    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
