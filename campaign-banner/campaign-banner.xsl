<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: M&A Fall 2022
       Podcast pages (Biopharma, Macro Minutes, Markets in Motion,
       Powering Sustainable Ideas) use CTA Type "generic" for the
       Start listening button. That button now always plays the first
       story tile using the tiles' own player, and the page source never
       holds a broken link, so the pages no longer need
       podcast-episode-replacer.js (see PODCAST_TRIGGER at the end of
       this file). -->

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
    <xsl:variable name="PAGE_TITLE" select="/Properties/Data/Datum[@ID='title']"/>
    <xsl:variable name="PAGE_SUBTITLE" select="/Properties/Data/Datum[@ID='subtitle']"/>
    <xsl:variable name="CUSTOM_BREADCRUMB" select="/Properties/Data/Datum[@ID='custombreadcrumb']"/>
    <xsl:variable name="SHOW_BREADCRUMB" select="/Properties/Datum[@ID='ShowBreadcrumb']/Option[@Selected='true']/Value"/>
    <xsl:variable name="SHOW_DESCRIPTION" select="/Properties/Datum[@ID='ShowDescription']/Option[@Selected='true']/Value"/>
    <xsl:variable name="SHOW_SERIES_DESCRIPTION" select="/Properties/Datum[@ID='ShowSeriesDescription']/Option[@Selected='true']/Value"/>
    <xsl:variable name="CTA_TEXT" select="/Properties/Data/Datum[@ID='CTAText']"/>
       <xsl:variable name="CTA_LINK" select="/Properties/Data/Datum[@ID='CTALink']"/>
    <xsl:variable name="SERIES_TEXT" select="/Properties/Data/Datum[@ID='seriesText']"/>
    <xsl:variable name="CTA_TYPE" select="/Properties/Data/Datum[@ID='CTAType']/Option[@Selected='true']/Value"/>
    <xsl:variable name="APPLE_PODCAST_LINK" select="/Properties/Data/Datum[@ID='applePodcastLink']"/>
    <xsl:variable name="SPOTIFY_LINK" select="/Properties/Data/Datum[@ID='spotifyLink']"/>
    <xsl:variable name="GOOGLE_PODCAST_LINK" select="/Properties/Data/Datum[@ID='googlePodcastLink']"/>

    <xsl:variable name="SHOW_CTA" select="/Properties/Datum[@ID='ShowCTA']/Option[@Selected='true']/Value"/>
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
            <xsl:variable name="IMAGE" select="Datum[@Name='Source DCR']/DCR/press_release/video-th"/>
            <xsl:variable name="ARTICLE_THUMBNAIL" select="Datum[@Name='Source DCR']/DCR/press_release/thumbnail"/>
            <xsl:variable name="ARTICLE_NUM" select="Datum[@Name='Source DCR']/DCR/press_release/episode"/>
            <xsl:variable name="ARTICLE_LINK" select="Datum[@Name='Link']"/>
            <xsl:variable name="ARTICLE_AUTHOR" select="Datum[@Name='Source DCR']/DCR/press_release/author_name"/>
            <xsl:variable name="ARTICLE_AUTHOR_TITLE" select="Datum[@Name='Source DCR']/DCR/press_release/author_title"/>

            <div class="page-banner">
              <div class="page-banner--campaign page-banner--campaign-hero img-stretch">
                <xsl:attribute name="style">background-image: url('<xsl:value-of select="$IMAGE"/>');</xsl:attribute>
                <div class="overlay">
                </div>
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
                    <div class="col-lg-7 col-md-9 col-xs-12">


                      <xsl:if test="/Properties/Datum[@ID='ShowSeriesDescription'] = 'true'">
                        <p class="series-text"><xsl:value-of select='$SERIES_TEXT' disable-output-escaping="yes"/></p>
                      </xsl:if>
                      <h1><xsl:value-of select='$ARTICLE_TITLE' disable-output-escaping="yes"/></h1>

                      <p><xsl:value-of select="$ARTICLE_AUTHOR"/>, <xsl:value-of select="$ARTICLE_AUTHOR_TITLE"/></p>

                      <xsl:if test="/Properties/Datum[@ID='ShowDescription'] = 'true'">
                        <p><xsl:value-of select='$ARTICLE_DESCRIPTION' disable-output-escaping="yes"/></p>
                      </xsl:if>



                      <xsl:if test="$SHOW_CTA = 'Yes'">
                        <div class="hero-cta">
                          <xsl:choose>
                            <xsl:when test="$CTA_TYPE = 'video'">

                              <!--<p class="cta-btn"><a class="btn btn-primary" href="{$ARTICLE_LINK}?watch" id="atw1">Watch Video</a><a class="btn btn-outline" href="{$ARTICLE_LINK}">Read Article</a></p>
                                   <button class="btn-play-audio" title="Watch Video" aria-label="Watch Video"><span class="icon-circle"><img src="/assets/rbccm/images/gib/icons/watch-icon.svg" alt="Video Icon"/></span><span class="btn-play-audio-text">Watch Video</span></button>-->

                              <p class="watch-video" style="margin-top: 0px;"><a title="Watch Video" aria-label="Watch Video" style="color: #ffffff; font-size: 15px; font-family: 'Roboto Medium', 'Roboto', Arial, sans-serif;" class="btn-play-video watch-video-link" href="{$ARTICLE_LINK}?watch"><img class="play-button" src="/assets/rbccm/images/ma-inflections/yellow-play-btn.svg" style="margin-right:-25px; z-index: 1; position: relative; width: 50px; height: 50px;" alt="Play" /><span class="watch-btn-banner">Watch the trailer</span></a></p>

                            </xsl:when>
                            <xsl:when test="$CTA_TYPE = 'podcast'"><!--REPLACE IMAGE WITH PODCAST ICON-->
                              <!--<button class="btn-play-audio" title="Start listening" aria-label="Start listening"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/podcast.svg" alt="Podcast Icon"/></span><span class="btn-play-audio-text">Listen now</span></button>-->

                              <p class="watch-video" style="margin-top: 0px;"><a title="Start listening" aria-label="Start listening" style="color: #ffffff; font-size: 15px; font-family: 'Roboto Medium', 'Roboto', Arial, sans-serif;" class="btn-play-video watch-video-link" href="{$ARTICLE_LINK}?listen"><img class="play-button" src="/assets/rbccm/images/ma-inflections/yellow-play-btn.svg" style="margin-right:-25px; z-index: 1; position: relative; width: 50px; height: 50px;" alt="Listen" /><span class="watch-btn-banner">Listen now</span></a></p>


                            </xsl:when>
                            <xsl:when test="$CTA_TYPE = 'subscribe'"><!--REPLACE IMAGE WITH SUBSCRIBE ICON-->
                              <p style="margin-top: 0px;"><a class="btn-subscribe-banner" title="Subscribe" aria-label="Subscribe" style="color: #ffffff;" href="#subscribe-form"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/subscribe.svg" alt="Subscribe Icon" style="width: 37px"/></span><span class="btn-subscribe-banner-text">Subscribe</span></a></p>
                            </xsl:when>
                            <xsl:when test="$CTA_TYPE = 'generic'">
                              <xsl:call-template name="PODCAST_TRIGGER">
                                <xsl:with-param name="LABEL" select="$CTA_TEXT"/>
                                <xsl:with-param name="SHOW_NAME" select="$PAGE_TITLE"/>
                                <xsl:with-param name="CTA_LINK" select="$CTA_LINK"/>
                              </xsl:call-template>
                            </xsl:when>
                          </xsl:choose>
                        </div>
                        <p style="margin-bottom: 10px; line-height:normal; font-size: 12px; font-weight: 700; font-family: 'Roboto',Arial,Verdana,sans-serif;">Listen and subscribe on:</p>
                        <div class="btn-container">
                          <a target="_blank" aria-label="Listen on Apple Podcasts" href="{$APPLE_PODCAST_LINK}"><img src="/assets/rbccm/images/icons/apple-icon.svg" alt="Apple Podcasts" /></a>
                          <a target="_blank" aria-label="Listen on Spotify" href="{$SPOTIFY_LINK}"><img src="/assets/rbccm/images/icons/spotify-icon.svg" alt="Spotify" /></a>
                          <a target="_blank" aria-label="Listen to the Biopharama podcast on Youtube Music" href="{$GOOGLE_PODCAST_LINK}"><img src="/assets/rbccm/images/icons/google-icon.svg" alt="Google Podcasts" /></a>
                        </div>
                      </xsl:if>

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
                        ">Lead Today.<br/>Define Tomorrow.&#8482;</div>
                </xsl:if>

                <a class="play-btn lower-right" href="{$ARTICLE_LINK}?watch" id="atw1">
                  <i class="fa fa-play" aria-hidden="true" style="margin-left: -2px;"><span class="sr-only">Play Video</span></i>
                </a>


                <xsl:if test="/Properties/Datum[@Name='Show Yellow Tear']/Option[@Selected='true']/Value = 'Yes'">
                  <div class="tear-yellow"></div>
                </xsl:if>
              </div>
            </div>
          </xsl:if>
        </xsl:for-each>

      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="IMAGE" select="/Properties/Data/Datum[@ID='bgimage']/Image/Path"/>

        <xsl:variable name="LEAD_CONTENT" select="/Properties/Data/Datum[@ID='leadcontent']"/>


        <div class="page-banner">
          <div class="page-banner--campaign page-banner--campaign-hero img-stretch">
            <xsl:attribute name="style">background-image: url('<xsl:value-of select="$IMAGE"/>');</xsl:attribute>
            <div class="overlay">
            </div>
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
                <div class="col-lg-8 col-md-10 col-xs-12">



                  <xsl:if test="/Properties/Datum[@ID='ShowSeriesDescription'] = 'true'">
                    <p class="series-text"><xsl:value-of select='$SERIES_TEXT' disable-output-escaping="yes"/></p>
                  </xsl:if>

                  <h1><xsl:value-of select='$PAGE_TITLE' disable-output-escaping="yes"/></h1>


                  <div id="lead_content"><xsl:value-of select='$LEAD_CONTENT' disable-output-escaping="yes"/></div>


                  <xsl:if test="$SHOW_CTA = 'Yes'">
                    <p class="hero-cta">
                      <xsl:choose>
                        <xsl:when test="$CTA_TYPE = 'video'">
                          <!--<p class="watch-video" style="margin-top: 0px;"><a class="watch-video-link" style="color: #ffffff;"><img style="margin-right: -15px;" src="/assets/rbccm/images/ma-inflections/yellow-play-btn.svg" alt="Play" /><span class="watch-btn-banner"><xsl:value-of select='$CTA_TEXT' disable-output-escaping="yes"/></span></a></p>-->
                          <p class="watch-video" style="margin-top: 0px;"><a style="color: #ffffff; font-size: 15px; font-family: 'Roboto Medium', 'Roboto', Arial, sans-serif;" class="btn-play-video watch-video-link"><img class="play-button" src="/assets/rbccm/images/ma-inflections/yellow-play-btn.svg" style="margin-right:-25px; z-index: 1; position: relative; width: 50px; height: 50px;" alt="Play"/><span class="watch-btn-banner"><xsl:value-of select='$CTA_TEXT' disable-output-escaping="yes"/></span></a></p>

                        </xsl:when>
                        <xsl:when test="$CTA_TYPE = 'podcast'"><!--REPLACE IMAGE WITH PODCAST ICON-->
                          <button type="button" aria-controls="podcast-player-container" aria-expanded="false" class="btn-play-audio" id="podcast-trigger" title="Start listening to Strategic alternatives podcast"><span class="icon-circle">
                              <img src="/assets/rbccm/images/campaign/podcast.svg" alt=""/></span><span id="btn-label" class="btn-play-audio-text">Start listening</span></button>                                        </xsl:when>
                        <xsl:when test="$CTA_TYPE = 'subscribe'"><!--REPLACE IMAGE WITH SUBSCRIBE ICON-->
                          <p style="margin-top: 0px;"><a class="btn-subscribe-banner" title="Subscribe" aria-label="Subscribe" style="color: #ffffff;" href="#subscribe-form"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/subscribe.svg" alt="Subscribe Icon" style="width: 37px"/></span><span class="btn-subscribe-banner-text">Subscribe</span></a></p>
                        </xsl:when>
                        <xsl:when test="$CTA_TYPE = 'generic'">
                          <xsl:call-template name="PODCAST_TRIGGER">
                            <xsl:with-param name="LABEL" select="$CTA_TEXT"/>
                            <xsl:with-param name="SHOW_NAME" select="$PAGE_TITLE"/>
                                <xsl:with-param name="CTA_LINK" select="$CTA_LINK"/>
                          </xsl:call-template>
                        </xsl:when>
                      </xsl:choose>
                    </p>

                    <p style="margin-bottom: 10px; line-height:normal; font-size: 12px; font-weight: 700; font-family: 'Roboto',Arial,Verdana,sans-serif;">Listen and subscribe on:</p>
                          <div class="btn-container">
                            <a target="_blank" aria-label="Listen on Apple Podcasts" href="{$APPLE_PODCAST_LINK}"><img src="/assets/rbccm/images/icons/apple-icon.svg" alt="Apple Podcasts" /></a>
                            <a target="_blank" aria-label="Listen on Spotify" href="{$SPOTIFY_LINK}"><img src="/assets/rbccm/images/icons/spotify-icon.svg" alt="Spotify" /></a>
                            <a target="_blank" aria-label="Listen to the Biopharama podcast on Youtube Music" href="{$GOOGLE_PODCAST_LINK}"><img src="/assets/rbccm/images/icons/google-icon.svg" alt="Google Podcasts" /></a>
                          </div>
                  </xsl:if>

                </div>
              </div>

            </div>

            <xsl:if test="/Properties/Datum[@Name='Show Yellow Tear']/Option[@Selected='true']/Value = 'Yes'">
              <div class="tear-yellow"></div>
            </xsl:if>
          </div>
        </div>
      </xsl:otherwise>
    </xsl:choose>


  </xsl:template>


  <!-- Start listening button (CTA Type "generic").

       Podcast pages (CTA Link empty, a placeholder like "Link", or a
       Captivate URL): the button always plays the first story tile.
       - In the page source it links to #episode-title-1, the first story
         tile's heading on the same page, so the source never holds a
         broken or out-of-date link.
       - Once the page has loaded, the link is set to the first story
         tile's episode page (e.g. /en/insights/2026/09/slug).
       - Clicking it presses the first tile's "Play episode" button, so
         the tiles' own player opens at the bottom of the window (handled
         by the story tiles component's script). Closing the player
         returns focus here.
       No separate script file is needed.

       Other pages (CTA Link is a real page URL, starting with / or http
       and not a Captivate link): same output as before, linking to
       CTA Link. -->
  <xsl:template name="PODCAST_TRIGGER">
    <xsl:param name="LABEL"/>
    <xsl:param name="SHOW_NAME"/>
    <xsl:param name="CTA_LINK"/>

    <xsl:variable name="LINK" select="normalize-space($CTA_LINK)"/>
    <xsl:variable name="TITLE">
      <xsl:choose>
        <xsl:when test="normalize-space($SHOW_NAME) != ''">Start listening to <xsl:value-of select="normalize-space($SHOW_NAME)"/></xsl:when>
        <xsl:otherwise>Start listening</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="(starts-with($LINK, '/') or starts-with($LINK, 'http')) and not(contains($LINK, 'captivate.fm'))">
        <a class="generic-link" href="{$LINK}" style="color: #ffffff;"> <button type="button" aria-controls="podcast-player-container" aria-expanded="false" class="btn-play-audio" id="podcast-trigger" title="{$TITLE}"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/podcast.svg" alt=""/></span><span id="btn-label" class="btn-play-audio-text"><xsl:value-of select="$LABEL" disable-output-escaping="yes"/></span></button> </a>
      </xsl:when>
      <xsl:otherwise>
        <a class="btn-play-audio generic-link" id="podcast-trigger" href="#episode-title-1" title="{$TITLE}" style="display: inline-block; color: #ffffff; text-decoration: none;"><span class="icon-circle"><img src="/assets/rbccm/images/campaign/podcast.svg" alt=""/></span><span id="btn-label" class="btn-play-audio-text"><xsl:value-of select="$LABEL" disable-output-escaping="yes"/><xsl:if test="normalize-space($LABEL) = ''">Start listening</xsl:if></span></a>
        <script>
          (function () {
            var hero = document.getElementById('podcast-trigger');
            if (!hero) return;

            function iframeSrc(frame) {
              // The tiles' script moves src into jQuery data while a player is closed.
              var src = frame.getAttribute('src');
              if (!src) src = window.jQuery ? window.jQuery(frame).data('src') : '';
              return src || '';
            }

            // First story tile that has an episode: its card and "Play episode" button.
            function firstTile() {
              var frames = document.querySelectorAll('.insights-stories .story-podcast-playing iframe');
              for (var i = 0; i !== frames.length; i++) {
                if (!iframeSrc(frames[i])) continue;
                var card = frames[i].parentNode.parentNode.querySelector('.story-card');
                if (!card) continue;
                var button = card.querySelector('.audio-play');
                if (button) return { card: card, button: button };
              }
              return null;
            }

            // Point the link at the first tile's episode page.
            function setLink() {
              var tile = firstTile();
              if (!tile) return;
              var link = tile.card.querySelector('a[href]');
              if (!link) return;
              hero.setAttribute('href', link.getAttribute('href').replace('/templatedata/article/story/data/', '/'));
            }
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', setLink);
            } else {
              setLink();
            }

            hero.addEventListener('click', function (e) {
              var tile = firstTile();
              if (!tile) return; // no tiles: follow the link
              e.preventDefault();
              tile.button.click();
              // Send focus back to this button when the player is closed.
              if (window.jQuery) {
                window.jQuery(tile.card).siblings('.story-podcast-playing').data('triggerButton', window.jQuery(hero));
              }
            });
          })();
        </script>
      </xsl:otherwise>
    </xsl:choose>
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
