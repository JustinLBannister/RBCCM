<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Video Poster :: etf-innovators (single-skin build)
  ============================================================
  Standalone skin for TeamSite's Skin dropdown. Same poster, play
  button, Brightcove modal and JS as the default skin, laid out as
  the ETF Innovators "Featured" section:

    - navy section (#092549) with a heading and a description
      above the poster (SectionHeading / SectionDescription)
    - the poster is a 16:9 box at the full content width (max
      1100px) instead of the 1100 x 366 strip, no overlap into the
      next section (SpaceAbove / OverlapBelow are ignored)
    - optional pill in the top right corner (BadgeText, e.g.
      "Season Promo")

  Companion skin: rbccm-video-poster.xsl (default, MAAS+MATA)
  Fields: rbccm-video-poster-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Datum reader: last text node, whitespace collapsed. -->
  <xsl:template name="datum">
    <xsl:param name="id"/>
    <xsl:value-of select="normalize-space(//Datum[@ID=$id]/text()[last()])"/>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="CSS_PATH_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CssPath'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="JS_PATH_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'JsPath'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CACHE_VERSION"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CacheVersion'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="SECTION_ID_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionID'"/></xsl:call-template></xsl:variable>

    <xsl:variable name="POSTER"><xsl:call-template name="datum"><xsl:with-param name="id" select="'PosterImage'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="POSTER_ALT"><xsl:call-template name="datum"><xsl:with-param name="id" select="'PosterAlt'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="POSTER_WEBP"><xsl:call-template name="datum"><xsl:with-param name="id" select="'PosterImageWebp'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="LOADING_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'PosterLoading'"/></xsl:call-template></xsl:variable>
    <!-- priority (default) or lazy. See the PosterLoading field. -->
    <xsl:variable name="LAZY" select="translate($LOADING_RAW, 'LAZY', 'lazy') = 'lazy'"/>
    <xsl:variable name="PLAY_LABEL_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'PlayButtonLabel'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="VIDEO_TITLE_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'VideoTitle'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="BC_ACCOUNT_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'BrightcoveAccount'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="BC_PLAYER_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'BrightcovePlayer'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="BC_VIDEO"><xsl:call-template name="datum"><xsl:with-param name="id" select="'BrightcoveVideoId'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HEADING"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionHeading'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="DESCRIPTION" select="//Datum[@ID='SectionDescription']"/>
    <xsl:variable name="BADGE"><xsl:call-template name="datum"><xsl:with-param name="id" select="'BadgeText'"/></xsl:call-template></xsl:variable>

    <!-- Defaults -->
    <xsl:variable name="CSS_PATH">
      <xsl:choose>
        <xsl:when test="$CSS_PATH_RAW != ''"><xsl:value-of select="$CSS_PATH_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/css/components/rbccm-video-poster.css</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="JS_PATH">
      <xsl:choose>
        <xsl:when test="$JS_PATH_RAW != ''"><xsl:value-of select="$JS_PATH_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/js/components/rbccm-video-poster.js</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SECTION_ID">
      <xsl:choose>
        <xsl:when test="$SECTION_ID_RAW != ''"><xsl:value-of select="translate($SECTION_ID_RAW, ' ', '-')"/></xsl:when>
        <xsl:otherwise>rbccm-video-poster-1</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="MODAL_ID" select="concat($SECTION_ID, '-modal')"/>
    <xsl:variable name="PLAY_LABEL">
      <xsl:choose>
        <xsl:when test="$PLAY_LABEL_RAW != ''"><xsl:value-of select="$PLAY_LABEL_RAW"/></xsl:when>
        <xsl:otherwise>Play video</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="VIDEO_TITLE">
      <xsl:choose>
        <xsl:when test="$VIDEO_TITLE_RAW != ''"><xsl:value-of select="$VIDEO_TITLE_RAW"/></xsl:when>
        <xsl:otherwise>Video</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- Account + player are RBC-wide constants; only the video ID
         normally changes. -->
    <xsl:variable name="BC_ACCOUNT">
      <xsl:choose>
        <xsl:when test="$BC_ACCOUNT_RAW != ''"><xsl:value-of select="$BC_ACCOUNT_RAW"/></xsl:when>
        <xsl:otherwise>6021289101001</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="BC_PLAYER">
      <xsl:choose>
        <xsl:when test="$BC_PLAYER_RAW != ''"><xsl:value-of select="$BC_PLAYER_RAW"/></xsl:when>
        <xsl:otherwise>VyvCc9BZx</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="HAS_VIDEO" select="$BC_VIDEO != ''"/>
    <xsl:variable name="BC_SRC" select="concat('https://players.brightcove.net/', $BC_ACCOUNT, '/', $BC_PLAYER, '_default/index.html?videoId=', $BC_VIDEO)"/>

    <link rel="stylesheet" type="text/css">
      <xsl:attribute name="href">
        <xsl:value-of select="$CSS_PATH"/>
        <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
      </xsl:attribute>
    </link>

    <section class="rbccm-video-poster-section rbccm-video-poster-section--etf-innovators">
      <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-section</xsl:attribute>
      <xsl:if test="$HEADING != ''">
        <xsl:attribute name="aria-labelledby"><xsl:value-of select="$SECTION_ID"/>-heading</xsl:attribute>
      </xsl:if>
      <div class="rbccm-video-poster-section__inner rbccm-video-poster-section__inner--etf-innovators">

        <xsl:if test="$HEADING != '' or normalize-space($DESCRIPTION) != ''">
          <div class="rbccm-video-poster-section__header rbccm-video-poster-section__header--etf-innovators" data-animate="fadeInUp">
            <xsl:if test="$HEADING != ''">
              <h2 class="rbccm-video-poster-section__heading rbccm-video-poster-section__heading--etf-innovators">
                <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/>-heading</xsl:attribute>
                <xsl:value-of select="$HEADING"/>
              </h2>
            </xsl:if>
            <xsl:if test="normalize-space($DESCRIPTION) != ''">
              <!-- HTML allowed (strong, em, a, br), output as entered. -->
              <p class="rbccm-video-poster-section__description rbccm-video-poster-section__description--etf-innovators"><xsl:value-of select="$DESCRIPTION" disable-output-escaping="yes"/></p>
            </xsl:if>
          </div>
        </xsl:if>

        <div class="rbccm-video-poster rbccm-video-poster--etf-innovators" data-animate="fadeInUp" data-animate-delay="150">
          <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>

          <xsl:if test="$POSTER != ''">
            <!-- width / height reserve the 16:9 box before the file
                 arrives. Optional WebP offered first. -->
            <picture>
              <xsl:if test="$POSTER_WEBP != ''">
                <source type="image/webp">
                  <xsl:attribute name="srcset"><xsl:value-of select="$POSTER_WEBP"/></xsl:attribute>
                </source>
              </xsl:if>
              <img class="rbccm-video-poster__image rbccm-video-poster__image--etf-innovators" width="1100" height="619">
                <xsl:choose>
                  <xsl:when test="$LAZY">
                    <xsl:attribute name="loading">lazy</xsl:attribute>
                    <xsl:attribute name="decoding">async</xsl:attribute>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:attribute name="fetchpriority">high</xsl:attribute>
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:attribute name="src"><xsl:value-of select="$POSTER"/></xsl:attribute>
                <xsl:attribute name="alt"><xsl:value-of select="$POSTER_ALT"/></xsl:attribute>
              </img>
            </picture>
          </xsl:if>

          <!-- Pill, top right. Blank = none. -->
          <xsl:if test="$BADGE != ''">
            <span class="rbccm-video-poster__badge rbccm-video-poster__badge--etf-innovators"><xsl:value-of select="$BADGE"/></span>
          </xsl:if>

          <!-- Play button only when there's a video to play. -->
          <xsl:if test="$HAS_VIDEO">
            <button type="button" class="rbccm-video-poster__play rbccm-video-poster__play--etf-innovators" data-toggle="modal" data-bs-toggle="modal" aria-haspopup="dialog">
              <xsl:attribute name="data-target">#<xsl:value-of select="$MODAL_ID"/></xsl:attribute>
              <xsl:attribute name="data-bs-target">#<xsl:value-of select="$MODAL_ID"/></xsl:attribute>
              <xsl:attribute name="aria-controls"><xsl:value-of select="$MODAL_ID"/></xsl:attribute>
              <xsl:attribute name="aria-label"><xsl:value-of select="$PLAY_LABEL"/></xsl:attribute>
              <svg class="rbccm-video-poster__play-icon rbccm-video-poster__play-icon--etf-innovators" xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="currentColor" aria-hidden="true" focusable="false"><path d="M36.6843 28.4791L22.9275 36.4216L22.9275 20.5366L36.6843 28.4791Z"/></svg>
            </button>
          </xsl:if>
        </div>

      </div>
    </section>

    <xsl:if test="$HAS_VIDEO">
      <!-- Site-standard modal (same shell as the two-up cards video
           modal). width: 100% on the dialog - with width: auto the
           16:9 box has nothing to size against and the modal opens
           at zero width. The iframe src sits in data-src and is only
           set on open, so nothing buffers on page load. -->
      <div class="modal fade rbccm-video-poster__modal" role="dialog" tabindex="-1" aria-hidden="true">
        <xsl:attribute name="id"><xsl:value-of select="$MODAL_ID"/></xsl:attribute>
        <xsl:attribute name="aria-label"><xsl:value-of select="$VIDEO_TITLE"/></xsl:attribute>
        <div role="document" class="modal-dialog" style="top: 0px; width: 100%; max-width: 960px;">
          <div class="modal-content">
            <div class="modal-header" style="border: none; border-top: 8px #FBDE00 solid; padding: 0px;">
              <button aria-label="Close video" class="close" style="font-size: 41px; color: #595959; font-weight: normal;" type="button" data-dismiss="modal" data-bs-dismiss="modal">&#215;</button>
            </div>
            <div class="modal-body" style="padding: 0px;">
              <div class="white-box-text" style="padding: 25px; padding-top: 10px;">
                <div style="position: relative; display: block; max-width: 960px;">
                  <div style="padding-top: 56.25%;">
                    <iframe class="rbccm-video-poster__iframe" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; width: 100%; height: 100%;" allowfullscreen="allowfullscreen" allow="autoplay; fullscreen" frameborder="0">
                      <xsl:attribute name="title"><xsl:value-of select="$VIDEO_TITLE"/></xsl:attribute>
                      <xsl:attribute name="data-src"><xsl:value-of select="$BC_SRC"/></xsl:attribute>
                    </iframe>
                  </div>
                </div>
                <!-- Focus guard: Tab past the iframe loops back to Close. -->
                <span class="rbccm-video-poster__focus-guard" tabindex="0" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </xsl:if>

    <script>
      <xsl:attribute name="src">
        <xsl:value-of select="$JS_PATH"/>
        <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
      </xsl:attribute>
    </script>

  </xsl:template>

</xsl:stylesheet>
