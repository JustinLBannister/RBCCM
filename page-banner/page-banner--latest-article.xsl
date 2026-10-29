<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Default XSL + Latest Article button
       Same as the Default XSL skin, but the "Read more" link in Lead Content
       (non-episode banner) is repointed at the newest Insights article in the
       Real-Time Geopolitics feed (/en/insights/real-time-geopolitics/data/rtg).
       If the feed fails or has no article, the link goes to /en/insights.
       The link's own markup and style come from Lead Content as authored. -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:variable name="CURRENT_PAGE_NAME">
    <xsl:choose>
      <xsl:when test="substring(/Properties/Data/External/Parameters/Datum[@Name = 'iw-ls-page-name']/text(), 1,1) = '/'"><xsl:value-of select="substring(/Properties/Data/External/Parameters/Datum[@Name = 'iw-ls-page-name']/text(), 2)" /></xsl:when>
      <xsl:otherwise><xsl:value-of select="/Properties/Data/External/Parameters/Datum[@Name = 'iw-ls-page-name']/text()"/></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="ARTICLES" select="/Properties/Data/Group"/>
  <xsl:variable name="COUNT" select="count(/Properties/Data/Group)"/>
  <xsl:variable name="EPPARAM" select="/Properties/Data/External/Parameters/Datum[@Name='episode']"/>
  <xsl:variable name="EPTOSHOW">
    <xsl:choose>
      <xsl:when test="($EPPARAM != '') and ($EPPARAM &lt;= $COUNT)"><xsl:value-of select="$EPPARAM"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="0"/></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>


  <xsl:template match="/">
    <xsl:variable name="PAGE_SUBTITLE" select="/Properties/Data/Datum[@ID='subtitle']"/>
    <xsl:variable name="CUSTOM_BREADCRUMB" select="/Properties/Data/Datum[@ID='custombreadcrumb']"/>
    <xsl:variable name="SHOW_BREADCRUMB" select="/Properties/Datum[@ID='ShowBreadcrumb']/Option[@Selected='true']/Value"/>
    <xsl:variable name="CTA_TEXT" select="/Properties/Data/Datum[@ID='CTAText']"/>
    <xsl:variable name="CTA_TYPE" select="/Properties/Data/Datum[@ID='CTAType']/Option[@Selected='true']/Value"/>
    <xsl:variable name="SHOW_YELLOWTEAR" select="/Properties/Datum[@ID='ShowYellowTear']/Option[@Selected='true']/Value"/>
    <xsl:variable name="SHOW_CTA" select="/Properties/Datum[@ID='ShowCTA']/Option[@Selected='true']/Value"/>
    <xsl:variable name="CTA_LINK" select="/Properties/Data/Datum[@ID='CTALink']"/>

    <xsl:choose>
      <xsl:when test="$EPTOSHOW != 0">

        <xsl:for-each select="$ARTICLES">
          <xsl:if test="position() = $EPTOSHOW">
            <xsl:variable name="ARTICLE_TITLE">
              <xsl:choose>
                <xsl:when test="Datum[@Name='Source DCR']/DCR/press_release/summarytitle != ''">
                  <xsl:value-of  select="Datum[@Name='Source DCR']/DCR/press_release/summarytitle"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of  select="Datum[@Name='Source DCR']/DCR/press_release/title"/>
                </xsl:otherwise>

              </xsl:choose>
            </xsl:variable>
            <xsl:variable name="ARTICLE_SUBCATEGORY" select="Datum[@Name='Source DCR']/DCR/press_release/subcategory"/>
            <xsl:variable name="ARTICLE_DESCRIPTION">
              <xsl:choose>
                <xsl:when test="Datum[@Name='Source DCR']/DCR/press_release/summarydescription != ''">
                  <xsl:value-of  select="Datum[@Name='Source DCR']/DCR/press_release/summarydescription"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="Datum[@Name='Source DCR']/DCR/press_release/description"/>
                </xsl:otherwise>

              </xsl:choose>
            </xsl:variable>
            <xsl:variable name="ARTICLE_READ_TIME" select="Datum[@Name='Source DCR']/DCR/press_release/time_to_read"/>
            <xsl:variable name="ARTICLE_WATCH_TIME" select="Datum[@Name='Source DCR']/DCR/press_release/time_to_watch"/>
            <xsl:variable name="ARTICLE_AUTHOR" select="Datum[@Name='Source DCR']/DCR/press_release/authors/author/author_name"/>
            <xsl:variable name="ARTICLE_AUTHOR_TITLE" select="Datum[@Name='Source DCR']/DCR/press_release/authors/author/author_title"/>
            <xsl:variable name="IMAGE" select="Datum[@Name='Source DCR']/DCR/press_release/video-th"/>
            <xsl:variable name="ARTICLE_THUMBNAIL" select="Datum[@Name='Source DCR']/DCR/press_release/thumbnail"/>
            <xsl:variable name="ARTICLE_NUM" select="Datum[@Name='Source DCR']/DCR/press_release/episode"/>
            <xsl:variable name="ARTICLE_LINK" select="Datum[@Name='Link']"/>
            <xsl:variable name="ARTICLE_AUTHOR" select="Datum[@Name='Source DCR']/DCR/press_release/author_name"/>
            <xsl:variable name="ARTICLE_AUTHOR_TITLE" select="Datum[@Name='Source DCR']/DCR/press_release/author_title"/>

            <div class="page-banner">
              <div class="page-banner--campaign page-banner--campaign-hero img-stretch">
                <xsl:attribute name="style">background-position: center top;background-image: url('<xsl:value-of select="$IMAGE"/>');</xsl:attribute>
                <xsl:if test="/Properties/Datum[@ID='EnergyLines'] != 'false'">
                  <div class="overlay"></div>
                </xsl:if>
                <div class="container">
                  <xsl:if test="$SHOW_BREADCRUMB = 'Yes'">
                    <xsl:choose>
                      <xsl:when test="normalize-space($CUSTOM_BREADCRUMB) = ''">
                        <ul class="breadcrumb">
                          <xsl:if test="count(//value[.=$CURRENT_PAGE_NAME]) &lt; 1">
                            <li>
                              <a href="/en/home">Home</a>
                            </li>
                          </xsl:if>
                          <xsl:variable name="BREADCRUMB" select="//value[.=$CURRENT_PAGE_NAME]/ancestor::node"/>
                          <xsl:for-each select="$BREADCRUMB">
                            <xsl:call-template name="WRITE_NODE">
                              <xsl:with-param name="NODE" select="." />
                            </xsl:call-template>
                          </xsl:for-each>
                        </ul>
                      </xsl:when>
                      <xsl:otherwise>
                        <ul class="breadcrumb">
                          <xsl:value-of select='$CUSTOM_BREADCRUMB' disable-output-escaping="yes"/>
                        </ul>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:if>

                  <div class="row">
                    <div class="col-lg-8 col-md-9 col-xs-10">
                      <xsl:if test="$SHOW_BREADCRUMB != 'Yes'">
                        <div class="uppercase wide-text content-label" style="margin-top: 50px; color: #fff;"><xsl:value-of select='$PAGE_SUBTITLE' disable-output-escaping="yes"/></div>
                      </xsl:if>
                      <h1><xsl:value-of select='$ARTICLE_TITLE' disable-output-escaping="yes"/></h1>
                      <xsl:if test="$SHOW_BREADCRUMB = 'Yes'">
                        <h2><xsl:value-of select='$PAGE_SUBTITLE' disable-output-escaping="yes"/></h2>
                      </xsl:if>
                      <p><xsl:value-of select="$ARTICLE_AUTHOR"/>, <xsl:value-of select="$ARTICLE_AUTHOR_TITLE"/></p>
                      <hr/>
                      <p><xsl:value-of select='$ARTICLE_DESCRIPTION' disable-output-escaping="yes"/></p>

                      <xsl:if test="$SHOW_CTA = 'Yes'">

                        <xsl:if test="($CTA_TYPE = 'video' and $ARTICLE_LINK != '') or
                          ($CTA_TYPE = 'generic' and $CTA_LINK != '') or
                          ($CTA_TYPE = 'podcast') or
                          ($CTA_TYPE = 'subscribe')">
                          <div class="hero-cta">
                            <xsl:choose>
                              <xsl:when test="$CTA_TYPE = 'video'">
                                <p class="cta-btn"><a class="btn btn-primary" href="{$ARTICLE_LINK}?watch" id="atw1">Watch Video</a><a class="btn btn-outline" href="{$ARTICLE_LINK}">Read Article</a></p>
                              </xsl:when>
                              <xsl:when test="$CTA_TYPE = 'podcast'"><!--REPLACE IMAGE WITH PODCAST ICON-->
                                <button class="btn-play-audio" title="Start listening" aria-label="Start listening"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/podcast.svg" alt="Podcast Icon"/></span><span class="btn-play-audio-text">Start listening</span></button>
                              </xsl:when>
                              <xsl:when test="$CTA_TYPE = 'subscribe'"><!--REPLACE IMAGE WITH SUBSCRIBE ICON-->
                                <p style="margin-top: 0px;"><a class="btn-subscribe-banner" title="Subscribe" aria-label="Subscribe" style="color: #ffffff;" href="#subscribe-form"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/subscribe.svg" alt="Subscribe Icon" style="width: 37px"/></span><span class="btn-subscribe-banner-text">Subscribe</span></a></p>
                              </xsl:when>
                              <xsl:when test="$CTA_TYPE = 'generic'">
                                <p class="watch-video" style="margin-top: 0px;">
                                  <a style="color: #ffffff;"  href="{$CTA_LINK}">
                                    <xsl:attribute name="class">watch-video-link
                                      <xsl:if test="/Properties/Datum[@ID='CTAColour']/Option[@Selected='true']/Value = 'light'">light </xsl:if></xsl:attribute>
                                    <span class="generic-btn-banner"><xsl:value-of select='$CTA_TEXT' disable-output-escaping="yes"/></span></a></p>
                              </xsl:when>
                            </xsl:choose>
                          </div>
                        </xsl:if> </xsl:if>





                    </div>
                  </div>

                </div>
                <xsl:if test="/Properties/Datum[@ID='LeadToday'] = 'true'">
                  <div class="hidden-xs tagline" style="
                        position: absolute;
                        top: 35px;
                        right: 25px;
                        color: #fff;
                        text-align:  right;
                        font-family: 'RBCDisplay';
                        letter-spacing: 0.4px;
                        font-size: 24px;
                        display: none;
                        ">Lead Today.<br/>Define Tomorrow.&#8482;</div>
                </xsl:if>
                <xsl:if test="$SHOW_YELLOWTEAR = 'Yes'">
                  <div class="tear-yellow"></div>
                </xsl:if>
              </div>
            </div>
          </xsl:if>
        </xsl:for-each>

      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="IMAGE" select="/Properties/Data/Datum[@ID='bgimage']/Image/Path"/>
        <xsl:variable name="PAGE_TITLE" select="/Properties/Data/Datum[@ID='title']"/>

        <xsl:variable name="LEAD_CONTENT" select="/Properties/Data/Datum[@ID='leadcontent']"/>




        <div class="page-banner">
          <div class="page-banner--campaign page-banner--campaign-hero img-stretch">
            <xsl:attribute name="style">background-position: center top;background-image: url('<xsl:value-of select="$IMAGE"/>');</xsl:attribute>
            <xsl:if test="/Properties/Datum[@ID='EnergyLines'] != 'false'">
              <div class="overlay"></div>
            </xsl:if>
            <div class="container">
              <xsl:if test="$SHOW_BREADCRUMB = 'Yes'">
                <xsl:choose>
                  <xsl:when test="normalize-space($CUSTOM_BREADCRUMB) = ''">
                    <ul class="breadcrumb">
                      <xsl:if test="count(//value[.=$CURRENT_PAGE_NAME]) &lt; 1">
                        <li>
                          <a href="/en/home">Home</a>
                        </li>
                      </xsl:if>
                      <xsl:variable name="BREADCRUMB" select="//value[.=$CURRENT_PAGE_NAME]/ancestor::node"/>
                      <xsl:for-each select="$BREADCRUMB">
                        <xsl:call-template name="WRITE_NODE">
                          <xsl:with-param name="NODE" select="." />
                        </xsl:call-template>
                      </xsl:for-each>
                    </ul>
                  </xsl:when>
                  <xsl:otherwise>
                    <ul class="breadcrumb">
                      <xsl:value-of select='$CUSTOM_BREADCRUMB' disable-output-escaping="yes"/>
                    </ul>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:if>

              <div class="row">
                <div class="col-lg-9 col-md-10 col-xs-10">
                  <xsl:if test="$SHOW_BREADCRUMB != 'Yes'">
                    <div class="uppercase wide-text content-label" style="margin-top: 50px; color: #fff;"><xsl:value-of select='$PAGE_SUBTITLE' disable-output-escaping="yes"/></div>
                  </xsl:if>
                  <h1><xsl:value-of select='$PAGE_TITLE' disable-output-escaping="yes"/></h1>
                  <xsl:if test="($SHOW_BREADCRUMB = 'Yes') and ($PAGE_SUBTITLE != '')">
                    <h2><xsl:value-of select='$PAGE_SUBTITLE' disable-output-escaping="yes"/></h2>
                  </xsl:if>

                  <!-- Latest article: the script at the bottom points the
                       Read more link in Lead Content at the newest
                       geopolitics article. -->
                  <p data-latest-feed="/en/insights/real-time-geopolitics/data/rtg" data-latest-category="Insights"><xsl:value-of select='$LEAD_CONTENT' disable-output-escaping="yes"/></p>


                  <xsl:if test="$SHOW_CTA = 'Yes'">
                    <xsl:if test="($CTA_TYPE = 'video') or
                      ($CTA_TYPE = 'generic' and string-length(normalize-space($CTA_LINK)) > 0) or
                      ($CTA_TYPE = 'podcast') or
                      ($CTA_TYPE = 'subscribe')">
                      <div class="hero-cta">
                        <xsl:choose>
                          <xsl:when test="$CTA_TYPE = 'video'">
                            <p class="watch-video" style="margin-top: 0px;"><a style="color: #ffffff;">
                                <xsl:attribute name="class">watch-video-link <xsl:if test="/Properties/Datum[@ID='CTAColour']/Option[@Selected='true']/Value = 'light'">light </xsl:if></xsl:attribute>
                                <img style="margin-right: -15px;" src="/assets/rbccm/images/ma-inflections/yellow-play-btn.svg" alt="Play" /><span class="watch-btn-banner"><xsl:value-of select='$CTA_TEXT' disable-output-escaping="yes"/></span></a></p>
                          </xsl:when>
                          <xsl:when test="$CTA_TYPE = 'podcast'"><!--REPLACE IMAGE WITH PODCAST ICON-->
                            <button class="btn-play-audio" title="Start listening" aria-label="Start listening"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/podcast.svg" alt="Podcast Icon"/></span><span class="btn-play-audio-text">Start listening</span></button>
                          </xsl:when>
                          <xsl:when test="$CTA_TYPE = 'subscribe'"><!--REPLACE IMAGE WITH SUBSCRIBE ICON-->
                            <p style="margin-top: 0px;"><a class="btn-subscribe-banner" title="Subscribe" aria-label="Subscribe" style="color: #ffffff;" href="#subscribe-form"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/subscribe.svg" alt="Subscribe Icon" style="width: 37px"/></span><span class="btn-subscribe-banner-text">Subscribe</span></a></p>
                          </xsl:when>
                          <xsl:when test="$CTA_TYPE = 'generic'">
                            <p class="watch-video" style="margin-top: 0px;"><a class="watch-video-link" style="color: #ffffff;"  href="{$CTA_LINK}">
                                <xsl:attribute name="class">watch-video-link <xsl:if test="/Properties/Datum[@ID='CTAColour']/Option[@Selected='true']/Value = 'light'">light </xsl:if></xsl:attribute>
                                <span class="generic-btn-banner"><xsl:value-of select='$CTA_TEXT' disable-output-escaping="yes"/></span></a></p>
                          </xsl:when>
                        </xsl:choose>
                      </div>
                    </xsl:if></xsl:if>
                </div>
              </div>

            </div>
            <xsl:if test="/Properties/Datum[@ID='LeadToday'] = 'true'">
              <div class="hidden-xs tagline" style="
                    position: absolute;
                    top: 35px;
                    right: 25px;
                    color: #fff;
                    text-align:  right;
                    font-family: 'RBCDisplay';
                    letter-spacing: 0.4px;
                    font-size: 24px;
                    display: none;

                    ">Lead Today.<br/>Define Tomorrow.&#8482;</div>
            </xsl:if>
            <xsl:if test="$SHOW_YELLOWTEAR = 'Yes'">
              <div class="tear-yellow"></div>
            </xsl:if>
          </div>
        </div>
      </xsl:otherwise>
    </xsl:choose>

    <script>
      //Replace /rbccm/ with /en/
      $(".breadcrumb li a").attr("href", function(index, oldhref){
      var rbccm = new RegExp("/rbccm/", "g");
      return oldhref.replace(rbccm, "/en/");
      });
      //Replace .page with empty
      $(".breadcrumb li a").attr("href", function(index, oldhref){
      var page = new RegExp(".page", "g");
      return oldhref.replace(page, "");
      });
    </script>

    <!-- Latest article: repoints the Read more link in Lead Content at the
         newest Insights item in the feed, or /en/insights if there isn't one.
         Written without less-than, greater-than or ampersand characters so
         the XSL output can't escape them. -->
    <script>
      (function () {
        var FALLBACK = '/en/insights';

        function text(node, tag) {
          var el = node.getElementsByTagName(tag)[0];
          return el ? (el.textContent || '').replace(/^\s+|\s+$/g, '') : '';
        }

        [].forEach.call(document.querySelectorAll('[data-latest-feed]'), function (lead) {
          var btn = null;
          [].forEach.call(lead.getElementsByTagName('a'), function (a) {
            if (!btn) {
              if ((a.textContent || '').replace(/^\s+|\s+$/g, '').toLowerCase() === 'read more') { btn = a; }
            }
          });
          if (!btn) { return; }

          function fallback() {
            btn.setAttribute('href', FALLBACK);
          }
          if (!window.fetch || !window.DOMParser) { fallback(); return; }

          var category = (lead.getAttribute('data-latest-category') || '').toLowerCase();

          fetch(lead.getAttribute('data-latest-feed'), { credentials: 'same-origin' }).then(function (r) {
            return r.ok ? r.text() : '';
          }).then(function (xml) {
            var items = new DOMParser().parseFromString(xml, 'text/xml').getElementsByTagName('news');
            var best = null;
            var bestTime = -1;
            for (var i = 0; i !== items.length; i++) {
              if (category) {
                if (text(items[i], 'category').toLowerCase() !== category) { continue; }
              }
              var time = Date.parse(text(items[i], 'date'));
              if (!text(items[i], 'link') || isNaN(time)) { continue; }
              /* Newer date wins; same date keeps feed order. */
              if (time !== bestTime) {
                if (Math.max(time, bestTime) === time) { best = items[i]; bestTime = time; }
              }
            }
            if (!best) { fallback(); return; }

            btn.setAttribute('href', text(best, 'link'));
          })['catch'](fallback);
        });
      })();
    </script>

  </xsl:template>


  <xsl:template name="WRITE_NODE">

    <xsl:param name="NODE" />


    <xsl:if test="$NODE/link/@type != ''">
      <xsl:variable name="DISPLAY" select="$NODE/@visible-in-breadcrumbs" />

      <xsl:variable name="LINKVALUE">
        <xsl:choose>
          <xsl:when test="$NODE/link/@type = 'page'">
            <xsl:value-of  select="concat( '/en/', $NODE/link/value )" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of  select="$NODE/link/value" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="TARGET" select="$NODE/link/@target" />

      <xsl:variable name="LABEL">
        <xsl:choose>
          <xsl:when test="contains($NODE/label, 'insert-after(') or contains($NODE/label, 'insert-before(') or contains($NODE/label, 'replace(')">
            <xsl:value-of select="description"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$NODE/label"/>
          </xsl:otherwise>

        </xsl:choose>
      </xsl:variable>

      <xsl:if test="$DISPLAY = 'true'">
        <xsl:choose>

          <xsl:when test="position() = last()">

            <xsl:if test="$LABEL = 'RBCCM'">
              <li class="active">
                Home
              </li>
            </xsl:if>

          </xsl:when>
          <xsl:otherwise>

            <li>
              <a href="{$LINKVALUE}" >

                <xsl:if test="$TARGET != ''">
                  <xsl:attribute name="target"><xsl:value-of select="$TARGET" /></xsl:attribute>
                </xsl:if>

                <xsl:choose>
                  <xsl:when test="$LABEL = 'RBCCM'">
                    Home
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$LABEL" />
                  </xsl:otherwise>
                </xsl:choose>

              </a>

            </li>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:if>
    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
