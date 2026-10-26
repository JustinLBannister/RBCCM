<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Video Poster
  ============================================================
  Rounded poster image with a centred play button that opens a
  Brightcove video in a modal. Extracted from the MAAS+MATA page
  (the "Execution Console" image under the hero).

  Layout: 1140px wide x 366px tall box (full width minus 23px
  gutters on smaller screens). The image is shown at a fixed
  1100 x 366 and centred, so narrow screens crop to the middle of
  it. By default the box pulls the next section up underneath it
  by 200px (OverlapBelow), like on MAAS+MATA.

  Output: the poster box, then the modal as a sibling (outside the
  box so its stacking/overflow can't trap the modal), then the JS.
  The modal uses Bootstrap's modal markup (BS3 and BS5 attributes
  both present); rbccm-video-poster.js handles autoplay on open,
  stopping the video on close, focus, and a no-Bootstrap fallback.

  Fields: rbccm-video-poster-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Datum reader: last text node, whitespace collapsed. -->
  <xsl:template name="datum">
    <xsl:param name="id"/>
    <xsl:value-of select="normalize-space(//Datum[@ID=$id]/text()[last()])"/>
  </xsl:template>

  <!-- Digits-only helper for the px fields ("200", "200px" -> 200). -->
  <xsl:template name="px">
    <xsl:param name="raw"/>
    <xsl:param name="default"/>
    <xsl:variable name="n" select="translate($raw, translate($raw, '0123456789', ''), '')"/>
    <xsl:choose>
      <xsl:when test="$n != ''"><xsl:value-of select="$n"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="$default"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="CSS_PATH_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CssPath'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="JS_PATH_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'JsPath'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="CACHE_VERSION"><xsl:call-template name="datum"><xsl:with-param name="id" select="'CacheVersion'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="SECTION_ID_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SectionID'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="SPACE_ABOVE_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'SpaceAbove'"/></xsl:call-template></xsl:variable>
    <xsl:variable name="OVERLAP_RAW"><xsl:call-template name="datum"><xsl:with-param name="id" select="'OverlapBelow'"/></xsl:call-template></xsl:variable>

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
    <xsl:variable name="SPACE_ABOVE">
      <xsl:call-template name="px"><xsl:with-param name="raw" select="$SPACE_ABOVE_RAW"/><xsl:with-param name="default" select="'75'"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="OVERLAP">
      <xsl:call-template name="px"><xsl:with-param name="raw" select="$OVERLAP_RAW"/><xsl:with-param name="default" select="'200'"/></xsl:call-template>
    </xsl:variable>
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

    <div class="rbccm-video-poster" data-hero-rise="rise" data-animate-delay="600">
      <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      <xsl:attribute name="style">--rbccm-vp-space-above: <xsl:value-of select="$SPACE_ABOVE"/>px; --rbccm-vp-overlap: <xsl:value-of select="$OVERLAP"/>px;</xsl:attribute>

      <xsl:if test="$POSTER != ''">
        <!-- Near the top of a page this image is usually the Largest
             Contentful Paint, so by default it loads right away at high
             priority instead of lazily. width / height reserve the box
             before the file arrives. An optional WebP version is offered
             first to browsers that support it (much smaller than PNG). -->
        <picture>
          <xsl:if test="$POSTER_WEBP != ''">
            <source type="image/webp">
              <xsl:attribute name="srcset"><xsl:value-of select="$POSTER_WEBP"/></xsl:attribute>
            </source>
          </xsl:if>
          <img class="rbccm-video-poster__image" width="1100" height="366">
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

      <!-- Play button only when there's a video to play. -->
      <xsl:if test="$HAS_VIDEO">
        <button type="button" class="rbccm-video-poster__play" data-toggle="modal" data-bs-toggle="modal" aria-haspopup="dialog">
          <xsl:attribute name="data-target">#<xsl:value-of select="$MODAL_ID"/></xsl:attribute>
          <xsl:attribute name="data-bs-target">#<xsl:value-of select="$MODAL_ID"/></xsl:attribute>
          <xsl:attribute name="aria-controls"><xsl:value-of select="$MODAL_ID"/></xsl:attribute>
          <xsl:attribute name="aria-label"><xsl:value-of select="$PLAY_LABEL"/></xsl:attribute>
          <svg class="rbccm-video-poster__play-icon" xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="currentColor" aria-hidden="true" focusable="false"><path d="M36.6843 28.4791L22.9275 36.4216L22.9275 20.5366L36.6843 28.4791Z"/></svg>
        </button>
      </xsl:if>
    </div>

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
