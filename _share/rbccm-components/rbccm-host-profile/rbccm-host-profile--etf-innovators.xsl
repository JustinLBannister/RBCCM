<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: Host Profile :: etf-innovators

    ETF Innovators "Meet the host". Light blue section: heading, then
    photo left and text right on desktop (stacked on mobile). Text:
    name, role, up to three bio paragraphs, LinkedIn icon, and up to
    six media appearances as white cards (outlet, date + topic, and an
    outlined button that opens the link in a new tab).

    Every element carries the etf-innovators modifier. Reads
    rbccm-host-profile-properties.xml. Blank fields don't render; an
    appearance hides when its outlet is blank.
  -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

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

  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"   select="normalize-space(//Datum[@ID='SectionID'])"/>
    <xsl:variable name="SECTION_ARIA" select="normalize-space(//Datum[@ID='SectionAriaLabel'])"/>
    <xsl:variable name="CSS_PATH"     select="normalize-space(//Datum[@ID='CssPath'])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion'])"/>
    <xsl:variable name="JS_PATH"      select="normalize-space(//Datum[@ID='JsPath'])"/>
    <xsl:variable name="FEED_MATCH"   select="normalize-space(//Datum[@ID='MediaFeedMatch'])"/>
    <xsl:variable name="FEED_URL"     select="normalize-space(//Datum[@ID='MediaFeedUrlTemplate'])"/>
    <xsl:variable name="FEED_COUNT"   select="normalize-space(//Datum[@ID='MediaFeedCount'])"/>
    <xsl:variable name="USE_FEED"     select="$FEED_MATCH != '' and $FEED_URL != ''"/>

    <xsl:variable name="HEADING"   select="normalize-space(//Datum[@ID='SectionHeading'])"/>
    <xsl:variable name="PHOTO"     select="normalize-space(//Datum[@ID='Photo']/Image/Path)"/>
    <xsl:variable name="PHOTO_ALT_RAW" select="normalize-space(//Datum[@ID='Photo']/Image/Description)"/>
    <xsl:variable name="NAME"      select="normalize-space(//Datum[@ID='Name'])"/>
    <xsl:variable name="ROLE"      select="normalize-space(//Datum[@ID='Role'])"/>
    <xsl:variable name="BIO1"      select="//Datum[@ID='Bio1']"/>
    <xsl:variable name="BIO2"      select="//Datum[@ID='Bio2']"/>
    <xsl:variable name="BIO3"      select="//Datum[@ID='Bio3']"/>
    <xsl:variable name="LI_URL"    select="normalize-space(//Datum[@ID='LinkedInUrl'])"/>
    <xsl:variable name="LI_LABEL_RAW" select="normalize-space(//Datum[@ID='LinkedInLabel'])"/>
    <xsl:variable name="MEDIA_HEADING" select="normalize-space(//Datum[@ID='MediaHeading'])"/>

    <xsl:variable name="ID_BASE">
      <xsl:choose>
        <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/></xsl:when>
        <xsl:otherwise>rbccm-host-profile</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="PHOTO_ALT">
      <xsl:choose>
        <xsl:when test="$PHOTO_ALT_RAW != ''"><xsl:value-of select="$PHOTO_ALT_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$NAME"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="LI_LABEL">
      <xsl:choose>
        <xsl:when test="$LI_LABEL_RAW != ''"><xsl:value-of select="$LI_LABEL_RAW"/></xsl:when>
        <xsl:when test="$NAME != ''"><xsl:value-of select="$NAME"/> on LinkedIn</xsl:when>
        <xsl:otherwise>LinkedIn</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="HAS_MEDIA" select="normalize-space(concat(//Datum[@ID='Media1Outlet'], //Datum[@ID='Media2Outlet'], //Datum[@ID='Media3Outlet'], //Datum[@ID='Media4Outlet'], //Datum[@ID='Media5Outlet'], //Datum[@ID='Media6Outlet'])) != ''"/>

    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet">
        <xsl:attribute name="href"><xsl:value-of select="$CSS_PATH"/><xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if></xsl:attribute>
      </link>
    </xsl:if>
    <!-- Script only needed when the feed fills the media appearances. -->
    <xsl:if test="$USE_FEED and $JS_PATH != ''">
      <script defer="defer">
        <xsl:attribute name="src"><xsl:value-of select="$JS_PATH"/><xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if></xsl:attribute>
      </script>
    </xsl:if>

    <section class="rbccm-host-profile rbccm-host-profile--etf-innovators">
      <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/></xsl:attribute>
      <xsl:if test="$USE_FEED">
        <xsl:attribute name="data-media-feed"><xsl:value-of select="$FEED_URL"/></xsl:attribute>
        <xsl:attribute name="data-media-match"><xsl:value-of select="$FEED_MATCH"/></xsl:attribute>
        <xsl:if test="$FEED_COUNT != ''">
          <xsl:attribute name="data-media-count"><xsl:value-of select="$FEED_COUNT"/></xsl:attribute>
        </xsl:if>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-labelledby"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <div class="rbccm-host-profile__inner rbccm-host-profile__inner--etf-innovators">

        <xsl:if test="$HEADING != ''">
          <h2 class="rbccm-host-profile__heading rbccm-host-profile__heading--etf-innovators" data-animate="fadeInUp">
            <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
            <xsl:value-of select="$HEADING"/>
          </h2>
        </xsl:if>

        <div class="rbccm-host-profile__body rbccm-host-profile__body--etf-innovators">

          <xsl:if test="$PHOTO != ''">
            <div class="rbccm-host-profile__photo-wrap rbccm-host-profile__photo-wrap--etf-innovators" data-animate="fadeInUp">
              <img class="rbccm-host-profile__photo rbccm-host-profile__photo--etf-innovators" width="368" height="368" loading="lazy">
                <xsl:attribute name="src"><xsl:value-of select="$PHOTO"/></xsl:attribute>
                <xsl:attribute name="alt"><xsl:value-of select="$PHOTO_ALT"/></xsl:attribute>
              </img>
            </div>
          </xsl:if>

          <div class="rbccm-host-profile__content rbccm-host-profile__content--etf-innovators" data-animate="fadeInUp" data-animate-delay="150">

            <!-- Top group: name + role, bio, LinkedIn. -->
            <div class="rbccm-host-profile__summary rbccm-host-profile__summary--etf-innovators">

            <xsl:if test="$NAME != '' or $ROLE != ''">
              <div class="rbccm-host-profile__title-group rbccm-host-profile__title-group--etf-innovators">
                <xsl:if test="$NAME != ''">
                  <h3 class="rbccm-host-profile__name rbccm-host-profile__name--etf-innovators"><xsl:value-of select="$NAME"/></h3>
                </xsl:if>
                <xsl:if test="$ROLE != ''">
                  <p class="rbccm-host-profile__role rbccm-host-profile__role--etf-innovators"><xsl:value-of select="$ROLE"/></p>
                </xsl:if>
              </div>
            </xsl:if>

            <xsl:if test="normalize-space(concat($BIO1, $BIO2, $BIO3)) != ''">
              <div class="rbccm-host-profile__bio rbccm-host-profile__bio--etf-innovators">
                <xsl:if test="normalize-space($BIO1) != ''">
                  <p class="rbccm-host-profile__bio-text rbccm-host-profile__bio-text--etf-innovators"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$BIO1"/></xsl:call-template></p>
                </xsl:if>
                <xsl:if test="normalize-space($BIO2) != ''">
                  <p class="rbccm-host-profile__bio-text rbccm-host-profile__bio-text--etf-innovators"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$BIO2"/></xsl:call-template></p>
                </xsl:if>
                <xsl:if test="normalize-space($BIO3) != ''">
                  <p class="rbccm-host-profile__bio-text rbccm-host-profile__bio-text--etf-innovators"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$BIO3"/></xsl:call-template></p>
                </xsl:if>
              </div>
            </xsl:if>

            <xsl:if test="$LI_URL != ''">
              <a class="rbccm-host-profile__linkedin rbccm-host-profile__linkedin--etf-innovators" target="_blank" rel="noopener">
                <xsl:attribute name="href"><xsl:value-of select="$LI_URL"/></xsl:attribute>
                <xsl:attribute name="aria-label"><xsl:value-of select="$LI_LABEL"/> (opens in a new tab)</xsl:attribute>
                <svg class="rbccm-host-profile__linkedin-icon rbccm-host-profile__linkedin-icon--etf-innovators" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false"><path d="M5.71429 0C2.5625 0 0 2.5625 0 5.71429V34.2857C0 37.4375 2.5625 40 5.71429 40H34.2857C37.4375 40 40 37.4375 40 34.2857V5.71429C40 2.5625 37.4375 0 34.2857 0H5.71429ZM6.16071 15.1964H12.0982V34.2857H6.16071V15.1964ZM12.5625 9.15179C12.5625 10.0635 12.2003 10.9378 11.5557 11.5825C10.911 12.2271 10.0367 12.5893 9.125 12.5893C8.21332 12.5893 7.33898 12.2271 6.69432 11.5825C6.04966 10.9378 5.6875 10.0635 5.6875 9.15179C5.6875 8.2401 6.04966 7.36576 6.69432 6.72111C7.33898 6.07645 8.21332 5.71429 9.125 5.71429C10.0367 5.71429 10.911 6.07645 11.5557 6.72111C12.2003 7.36576 12.5625 8.2401 12.5625 9.15179ZM28.3839 34.2857V25C28.3839 22.7857 28.3393 19.9375 25.3036 19.9375C22.2143 19.9375 21.7411 22.3482 21.7411 24.8393V34.2857H15.8125V15.1964H21.5V17.8036H21.5804C22.375 16.3036 24.3125 14.7232 27.1964 14.7232C33.1964 14.7232 34.3125 18.6786 34.3125 23.8214V34.2857H28.3839Z" fill="currentColor"/></svg>
              </a>
            </xsl:if>

            </div>

            <xsl:if test="$HAS_MEDIA or $USE_FEED">
              <div class="rbccm-host-profile__appearances rbccm-host-profile__appearances--etf-innovators">
                <!-- No typed appearances: stays hidden until the feed fills it. -->
                <xsl:if test="not($HAS_MEDIA)"><xsl:attribute name="hidden">hidden</xsl:attribute></xsl:if>
                <xsl:if test="$MEDIA_HEADING != ''">
                  <h4 class="rbccm-host-profile__appearances-heading rbccm-host-profile__appearances-heading--etf-innovators"><xsl:value-of select="$MEDIA_HEADING"/></h4>
                </xsl:if>
                <ul class="rbccm-host-profile__appearance-list rbccm-host-profile__appearance-list--etf-innovators">
                  <xsl:call-template name="appearance"><xsl:with-param name="n" select="1"/></xsl:call-template>
                  <xsl:call-template name="appearance"><xsl:with-param name="n" select="2"/></xsl:call-template>
                  <xsl:call-template name="appearance"><xsl:with-param name="n" select="3"/></xsl:call-template>
                  <xsl:call-template name="appearance"><xsl:with-param name="n" select="4"/></xsl:call-template>
                  <xsl:call-template name="appearance"><xsl:with-param name="n" select="5"/></xsl:call-template>
                  <xsl:call-template name="appearance"><xsl:with-param name="n" select="6"/></xsl:call-template>
                </ul>
              </div>
            </xsl:if>

          </div>
        </div>
      </div>
    </section>

  </xsl:template>


  <!-- One media appearance card. Hidden when its outlet is blank.
       Second line: date, source (RBC TV / RBC Radio) and topic as
       separate parts; the CSS puts the dot between the parts that show
       and currently hides the topic. The button names the outlet and
       date for screen readers. rbccm-host-profile.js builds the same
       markup for appearances from the In the Media feed. -->
  <xsl:template name="appearance">
    <xsl:param name="n"/>
    <xsl:variable name="OUTLET" select="normalize-space(//Datum[@ID=concat('Media', $n, 'Outlet')])"/>
    <xsl:variable name="DATE"   select="normalize-space(//Datum[@ID=concat('Media', $n, 'Date')])"/>
    <xsl:variable name="SOURCE" select="normalize-space(//Datum[@ID=concat('Media', $n, 'Source')])"/>
    <xsl:variable name="TOPIC"  select="normalize-space(//Datum[@ID=concat('Media', $n, 'Topic')])"/>
    <xsl:variable name="URL"    select="normalize-space(//Datum[@ID=concat('Media', $n, 'Url')])"/>
    <xsl:variable name="ACTION_RAW" select="normalize-space(//Datum[@ID=concat('Media', $n, 'Action')])"/>
    <xsl:variable name="ACTION">
      <xsl:choose>
        <xsl:when test="$ACTION_RAW != ''"><xsl:value-of select="$ACTION_RAW"/></xsl:when>
        <xsl:otherwise>Watch</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="$OUTLET != ''">
      <li class="rbccm-host-profile__appearance rbccm-host-profile__appearance--etf-innovators">
        <div class="rbccm-host-profile__appearance-text rbccm-host-profile__appearance-text--etf-innovators">
          <p class="rbccm-host-profile__appearance-outlet rbccm-host-profile__appearance-outlet--etf-innovators"><xsl:value-of select="$OUTLET"/></p>
          <xsl:if test="$DATE != '' or $SOURCE != '' or $TOPIC != ''">
            <p class="rbccm-host-profile__appearance-meta rbccm-host-profile__appearance-meta--etf-innovators"><xsl:if test="$DATE != ''"><span class="rbccm-host-profile__appearance-date rbccm-host-profile__appearance-date--etf-innovators"><xsl:value-of select="$DATE"/></span></xsl:if><xsl:if test="$SOURCE != ''"><span class="rbccm-host-profile__appearance-source rbccm-host-profile__appearance-source--etf-innovators"><xsl:value-of select="$SOURCE"/></span></xsl:if><xsl:if test="$TOPIC != ''"><span class="rbccm-host-profile__appearance-topic rbccm-host-profile__appearance-topic--etf-innovators"><xsl:value-of select="$TOPIC"/></span></xsl:if></p>
          </xsl:if>
        </div>
        <xsl:if test="$URL != ''">
          <a class="rbccm-host-profile__appearance-link rbccm-host-profile__appearance-link--etf-innovators" target="_blank" rel="noopener">
            <xsl:attribute name="href"><xsl:value-of select="$URL"/></xsl:attribute>
            <xsl:attribute name="aria-label"><xsl:value-of select="$ACTION"/>: <xsl:value-of select="$OUTLET"/><xsl:if test="$DATE != ''">, <xsl:value-of select="$DATE"/></xsl:if> (opens in a new tab)</xsl:attribute>
            <xsl:value-of select="$ACTION"/>
          </a>
        </xsl:if>
      </li>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
