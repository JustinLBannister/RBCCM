<!DOCTYPE html-entities SYSTEM http://www.interwoven.com/livesite/xsl/xsl-html.dtd>
<xsl:stylesheet version="1.0" xmlns:xsl=http://www.w3.org/1999/XSL/Transform>
  <!-- Skin: RBCCM - Insights new -->
 
  <xsl:include href=http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl />
  <xsl:include href=http://www.interwoven.com/livesite/xsl/StringTemplates.xsl />
  <xsl:template match="/">
 
    <div class="insights-stories initial" style="display:none">
      <div>
        <xsl:attribute name="class">
          <xsl:if test="/Properties/Datum[@ID='Container'] = 'true'">container</xsl:if>
        </xsl:attribute>
        <div class="row">
 
          <div class="white-box content--wrapper">
            <div class="white-box-text">
 
              <xsl:if test="normalize-space(/Properties/Data/Datum[@ID='Title']) != ''">
                <div class="col-xs-12">
                  <h2 style="font-family: 'RBCDisplay',Georgia,Times,serif !important; font-size: 28px;">
                    <xsl:value-of select="/Properties/Data/Datum[@ID='Title']" />
                  </h2>
                </div>
              </xsl:if>
 
              <xsl:variable name="VIEW_PAGE" select="/Properties/Data/Datum[@ID='ViewPage']" />
              <xsl:variable name="ARCHIVE_PAGE" select="/Properties/Data/Datum[@ID='ArchivePage']" />
 
              <xsl:variable name="ARTICLES" select="Properties/Data/Result/records" />
              <div class="news-listing">
 
                <xsl:for-each select="$ARTICLES/metaResult">
                  <xsl:sort
                    select="concat(./attr[ @key = 'TeamSite/Metadata/publishdate' ], ' ', ./attr[ @key = 'TeamSite/Metadata/CreationDate' ])"
                    order="descending" />
 
 
                  <xsl:if test="position() &lt; 10">
 
                    <xsl:variable name="ARTICLE_TITLE" select="./attr[ @key = 'TeamSite/Metadata/Title' ]" />
                    <xsl:variable name="ARTICLE_DATE" select="./attr[ @key = 'TeamSite/Metadata/publishdate' ]" />
                    <xsl:variable name="ARTICLE_DESCRIPTION" select="./attr[ @key = 'TeamSite/Metadata/Description' ]" />
                    <xsl:variable name="ARTICLE_THUMBNAIL" select="./attr[ @key = 'TeamSite/Metadata/thumbnail' ]" />
                    <xsl:variable name="ARTICLE_SERIES" select="./attr[ @key = 'TeamSite/Metadata/sitelocation' ]" />
                    <xsl:variable name="ARTICLE_ID" select=./@path />
                    <xsl:variable name="ARTICLE_PODCAST" select="./attr[ @key = 'TeamSite/Metadata/podcast' ]" />
                    <xsl:variable name="ARTICLE_TEMPLATE_TITLE" select="tokenize($ARTICLE_ID,'/')[last()]" />
                    <xsl:variable name="ARTICLE_SUBCATEGORY" select="./attr[ @key = 'TeamSite/Metadata/subcategory' ]" />
                    <xsl:variable name="ARTICLE_ALTCATEGORY" select="./attr[ @key = 'TeamSite/Metadata/altsubcategory' ]" />
                    <xsl:variable name="ARTICLE_TYPE" select="./attr[ @key = 'TeamSite/Metadata/story_type' ]" />
                    <xsl:variable name="ARTICLE_READTIME" select="./attr[ @key = 'TeamSite/Metadata/time_to_read' ]" />
                    <xsl:variable name="ARTICLE_WATCHTIME" select="./attr[ @key = 'TeamSite/Metadata/time_to_watch' ]" />
                    <xsl:variable name="AUTHOR_NAME" select="./attr[ @key = 'TeamSite/Metadata/author_name' ]" />
                    <xsl:variable name="AUTHOR_TITLE" select="./attr[ @key = 'TeamSite/Metadata/author_title' ]" />
                    <xsl:variable name="CHARACTER_LIMIT" select="/Properties/Datum[@ID='CharacterLimit']" />
                    <xsl:variable name="ARTICLE_LINK" select="./attr[ @key = 'TeamSite/Metadata/link' ]" />
                    <xsl:variable name="ARTICLE_SERIES_SUB_TEXT" select="substring-before($ARTICLE_SERIES, ',')" />
                    <xsl:variable name="ARTICLE_SERIES_SUB_TEXT2" select="substring-before(substring-after($ARTICLE_SERIES, ','), ',')" />
                    <xsl:variable name="ARTICLE_SERIES_SUB" select="translate(normalize-space($ARTICLE_SERIES_SUB_TEXT), '-', ' ')" />
                    <xsl:variable name="ARTICLE_SERIES_SUB2" select="translate(normalize-space($ARTICLE_SERIES_SUB_TEXT2), '-', ' ')" />
                    <xsl:variable name="READ_ICON">https://www.rbccm.com/assets/rbccm/images/gib/icons/read-icon-bl.svg</xsl:variable>
                    <xsl:variable name="WATCH_ICON">https://www.rbccm.com/assets/rbccm/images/gib/icons/watch-icon-dark.svg</xsl:variable>
                    <xsl:variable name="LISTEN_ICON">https://www.rbccm.com/assets/rbccm/images/campaign/podcast-sm-bl.svg</xsl:variable>
 
 
                    <div class="col-xs-12 col-sm-12 col-md-12">
                      <a aria-label="article">
                        <xsl:attribute name="href">
                          <xsl:choose>
                            <xsl:when test="$ARTICLE_LINK != ''"><xsl:value-of select="$ARTICLE_LINK" /></xsl:when>
                            <xsl:otherwise>
                              <xsl:choose>
                                <xsl:when test="./attr[ @key = 'TeamSite/Metadata/link' ]!=''">
                                  <xsl:value-of select="./attr[ @key = 'TeamSite/Metadata/link' ]" />
                                </xsl:when>
                                <xsl:when test="contains($ARTICLE_ID, 'episode/data/biopharma')">/en/gib/biopharma/episode/<xsl:value-of select="$ARTICLE_TEMPLATE_TITLE" /></xsl:when>
                                <xsl:when test="contains($ARTICLE_ID, 'episode/data/energy')">/en/insights/energy-transition/episode/<xsl:value-of
                                    select="$ARTICLE_TEMPLATE_TITLE" /></xsl:when>
                                <xsl:when test="contains($ARTICLE_ID, 'episode/data/ma')">/en/gib/ma-inflection-points/episode/<xsl:value-of select="$ARTICLE_TEMPLATE_TITLE" />
                                </xsl:when>
                                <xsl:when test="contains($ARTICLE_ID, 'article/podcast')">
                                  <xsl:choose>
                                    <xsl:when test="contains(upper-case($ARTICLE_SERIES), upper-case('esg'))">/en/insights/markets-in-motion/podcast.page?dcr=<xsl:value-of
                                        select="$ARTICLE_ID" /></xsl:when>
                                    <xsl:when test="contains(upper-case($ARTICLE_SERIES), upper-case('markets'))">/en/insights/markets-in-motion/podcast.page?dcr=<xsl:value-of
                                        select="$ARTICLE_ID" /></xsl:when>
                                    <xsl:when test="contains(upper-case($ARTICLE_SERIES), upper-case('industries'))">/en/insights/industries-in-motion/podcast.page?dcr=<xsl:value-of
                                        select="$ARTICLE_ID" /></xsl:when>
                                    <xsl:when test="contains(upper-case($ARTICLE_SERIES), upper-case('real'))">/en/insights/the-real-pulse/podcast.page?dcr=<xsl:value-of select="$ARTICLE_ID" />
                                    </xsl:when>
                                    <xsl:otherwise>/en/insights/story.page?dcr=<xsl:value-of select="$ARTICLE_ID" /></xsl:otherwise>
                                  </xsl:choose>
                                </xsl:when>
                                <xsl:when test="contains($ARTICLE_ID, 'article/story')">/en/story/story.page?dcr=<xsl:value-of select="$ARTICLE_ID" /></xsl:when>
                                <xsl:otherwise>/en/insights/story.page?dcr=<xsl:value-of select="$ARTICLE_ID" />
                                </xsl:otherwise>
                              </xsl:choose>
                            </xsl:otherwise>
                          </xsl:choose>
                        </xsl:attribute>
                      <div>
                        <xsl:attribute name="class">white-box tile--news tile--gib tile story tile--white</xsl:attribute>
                        <div class="row">
                            <div class="col-md-4">
                        <div class="img-stretch inline">
                          <xsl:attribute name="style">width: auto; background-image:
                            url('<xsl:value-of select="$ARTICLE_THUMBNAIL" />');
                          </xsl:attribute>
                          <div class="tile-overlay"></div>
                        </div>
                        </div>
                        <div class="col-md-8">
                        <div class="white-box-text">
 
                          <p class="uppercase wide-text">
                            <div class="news-date">
                                <p class="date"><xsl:call-template name="PUBLISH_DATE">
                                    <xsl:with-param name="publish_date" select="$ARTICLE_DATE" />
                                  </xsl:call-template></p>
                              </div>
                          </p>
 
                          <div class="yellow-line-sm"></div>
 
                          <xsl:if test="/Properties/Datum[@ID='ShowDate'] = 'true'">
                            <div class="news-date">
                              <p class="date"><xsl:value-of select="$ARTICLE_DATE"/></p>
                            </div>
                          </xsl:if>
 
                          <div class="row">
                            <div class="col-md-12 col-sm-12">
                          <h2><xsl:value-of select="$ARTICLE_TITLE" disable-output-escaping="yes" /></h2>
                          </div>
  </div>
                          <p class="description" style="padding-bottom: 0px;">
                            <xsl:choose>
                              <xsl:when test="string-length($ARTICLE_DESCRIPTION) > $CHARACTER_LIMIT">
                                <xsl:for-each
                                  select="tokenize(substring($ARTICLE_DESCRIPTION, 0, $CHARACTER_LIMIT), ' ')">
                                  <xsl:if test="position() != last()">
                                    <xsl:if test="position() != 1">
                                      <xsl:text> </xsl:text>
                                    </xsl:if>
                                    <xsl:choose>
                                      <xsl:when test="position() = last()-1">
                                        <xsl:choose>
                                          <xsl:when
                                            test="substring(normalize-space(.), string-length(normalize-space(.)), string-length(normalize-space(.))) = ','">
                                            <xsl:value-of
                                              select="substring(normalize-space(.), 1, string-length(normalize-space(.)) - 1)"
                                              disable-output-escaping="yes" />
                                          </xsl:when>
                                          <xsl:otherwise>
                                            <xsl:value-of select="." disable-output-escaping="yes" />
                                          </xsl:otherwise>
                                        </xsl:choose>
                                      </xsl:when>
                                      <xsl:otherwise>
                                        <xsl:value-of select="." disable-output-escaping="yes" />
                                      </xsl:otherwise>
                                    </xsl:choose>
                                  </xsl:if>
                                </xsl:for-each>...
                              </xsl:when>
                              <xsl:otherwise>
                                <xsl:value-of select="$ARTICLE_DESCRIPTION" disable-output-escaping="yes" />
                              </xsl:otherwise>
                            </xsl:choose>
                          </p>
 
                          <div class="external-button-group">
                          <a href="javascript:void(0)" aria-label="Player"><div class="story-podcast-playing" style="display: none;">
                            <button aria-label="Close Player" class="btn-close-player close-btn"><img src="/assets/rbccm/images/campaign/player-x.svg" alt="Close" /></button>
                           <iframe width="100%" height="200" scrolling="no" frameborder="no" allow="autoplay" src="{$ARTICLE_PODCAST}"></iframe>
                         </div></a>
                            <a class="learn-more audio-play btn-close-player" target="_blank">
                                <xsl:attribute name="style">
                                          <xsl:choose>
                                            <xsl:when test="$ARTICLE_PODCAST = ''">
                                              display: none</xsl:when>
                                            <xsl:otherwise></xsl:otherwise>
                                          </xsl:choose>
                                        </xsl:attribute>
                         <u>Play episode</u>
                              </a>
                              <p class="read-watch" style="padding-top: 30px;">
                                <xsl:if test="$ARTICLE_WATCHTIME != ''">
                                  <xsl:choose>
                                    <xsl:when test="$ARTICLE_TYPE = 'video'">
                                      <img src="{$WATCH_ICON}" alt="Watch Time"/>&nbsp;<xsl:value-of select="$ARTICLE_WATCHTIME"/>
                                    </xsl:when>
                                    <xsl:otherwise>
                                      <img src="{$LISTEN_ICON}" alt="Listen Time"/>&nbsp;<xsl:value-of select="$ARTICLE_WATCHTIME"/>
                                    </xsl:otherwise>
                                  </xsl:choose>
                                </xsl:if>
                                <xsl:if test="($ARTICLE_READTIME != '') and ($ARTICLE_WATCHTIME != '')"><span class="separator" role="presentation" style="display: inline-block;height: 15px;border-left: 1px #000000 solid;opacity: .5;margin: 0 7px;"></span></xsl:if>
                                <xsl:if test="$ARTICLE_READTIME != ''">
                                  <img src="{$READ_ICON}" alt="Read Time"/>&nbsp;<xsl:value-of select="$ARTICLE_READTIME"/>
                                </xsl:if>
                              </p>
                          </div>
 
                        </div>
                        </div></div>
                      </div>
                    </a>
                    </div>
 
                  </xsl:if>
                </xsl:for-each>
 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
 
 
    <div class="insights-stories ko">
 
      <div class="container" style="display: none" data-bind="visible: show() &gt;= 0">
 
        <div class="row">
          <div style="display: none;" class="text-center col-xs-12"
            data-bind="visible: (loaded()==true)&amp;&amp;(filteredItems().length &lt; 1)">
            <div class="insights-alert">
              There are no articles matching your criteria.
            </div>
          </div>
 
          <div data-bind="foreach:filteredItems">
            <div data-bind="visible: $index() &lt; $parent.show(),
            css: {{
            'col-md-12' : ($index() &gt;= 0),
            'col-sm-12': true}}">
            <a data-bind="visible: link != '', attr:{{href: link}}">
              <div data-bind="css: {{ 'tile--white' : ($index() >= 0) }}">
                <xsl:attribute name="class">white-box tile--news tile--gib tile story tile--white</xsl:attribute>
 
                <div data-bind="visible: $index() &gt;= 0">
                    <div class="col-md-4 ko-mobile">
                    <div class="img-stretch inline"
                    data-bind="attr: {{style: 'width:auto; background-image: url(\''+thumbnail+'\')'}}">
                    <div class="tile-overlay"></div>
                  </div></div>
                  <div class="col-md-8">
                  <div class="white-box-text">
                    <div class="news-date">
                        <p class="date" data-bind="html: date"></p>
                      </div>
                    <div class="yellow-line-sm">&nbsp;</div>
 
                    <div class="row">
                      <div class="col-md-12 col-sm-12">
                      <h2 data-bind="html: title"></h2></div>
                      <div class="col-md-5 col-sm-12">
                        <div class="external-button-group">
                            <div class="story-podcast-playing" style="display: none;">
                                <button aria-label="Close Player" class="btn-close-player close-btn"><img src="/assets/rbccm/images/campaign/player-x.svg" alt="Close" /></button>
                              <iframe width="100%" height="200" scrolling="no" frameborder="no" allow="autoplay" data-bind="visible: podcast != '', attr:{{src: podcast}}">
                              </iframe>
                            </div>
                      </div>
                      </div></div>
                    <p class="description" style="padding-bottom: 0px;" data-bind="visible: description != '', html: description"></p>
 
                    <div class="external-button-group">
                          <a href="javascript:void(0)"></a><div class="story-podcast-playing" style="display: none;">
                            <a href="javascript:void(0)"><button aria-label="Close Player" class="btn-close-player close-btn"><img src="/assets/rbccm/images/campaign/player-x.svg" alt="Close" /></button>
                            <iframe width="100%" height="200" scrolling="no" frameborder="no" allow="autoplay" data-bind="visible: podcast != '', attr:{{src: podcast}}">
                            </iframe></a>
                          </div>
 
                      <a class="learn-more audio-play btn-close-player" href="javascript:void(0);" data-bind="visible: podcast !== ''" aria-label="Play episode"><u>Play episode</u></a>
 
                          <p class="read-watch" style="padding-top: 30px;">
                           <img src=https://www.rbccm.com/assets/rbccm/images/gib/icons/watch-icon-dark.svg alt="Watch Time" data-bind="visible: type === 'video'"/><span class="date" data-bind="visible: type === 'video', html: watchtime"></span>
                           <img src=https://www.rbccm.com/assets/rbccm/images/campaign/podcast-sm-bl.svg alt="Listen Time" data-bind="visible: type === 'audio'"/><span class="date" data-bind="visible: type === 'audio', html: watchtime"></span>
                           <span class="separator" role="presentation" style="display: inline-block;height: 15px;border-left: 1px #000000 solid;opacity: .5;margin: 0 7px;" data-bind="visible: watchtime != ''"></span>
                            <img src=https://www.rbccm.com/assets/rbccm/images/gib/icons/read-icon-bl.svg alt="Read Time" data-bind="visible: readtime != ''"/><span class="date" data-bind="visible: readtime != '', html: readtime"></span>
                          </p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
              </a>
 
            </div>
          </div>
 
        </div>
      </div>

      <!-- Skeleton loader shown while fetching more episodes on "See more" click -->
      <div class="container" id="load-more-skeleton" style="display:none">
        <div class="row">
          <div class="col-md-12"><div class="white-box tile--news tile--gib tile story tile--white" style="min-height:290px;background:#f0f0f0;margin-bottom:15px;"></div></div>
          <div class="col-md-12"><div class="white-box tile--news tile--gib tile story tile--white" style="min-height:290px;background:#f0f0f0;margin-bottom:15px;"></div></div>
          <div class="col-md-12"><div class="white-box tile--news tile--gib tile story tile--white" style="min-height:290px;background:#f0f0f0;margin-bottom:15px;"></div></div>
        </div>
      </div>

      <div class="container">
        <div class="text-center" data-bind="visible: loaded() &amp;&amp; (filteredItems().length &gt; show() || hasMore())">
          <a id="load-more" href="javascript:void(0);" class="btn btn-inverse"
            data-bind="click: loadMore" aria-label="See more episodes">See more episodes</a>
        </div>
      </div>
    </div>
 
       <script>
 
$(document).ready(function () {
  // Handle Play episode button click
  $(document).on("click", ".audio-play", function () {
    console.log("Yes");
 
    $('.story-podcast-playing:visible').each(function() {
      var iframe = $(this).find("iframe");
      iframe.data("src", iframe.attr("src"));
      iframe.attr("src", "");
      $(this).hide();
    });
 
    var podcastElement = $(this).closest(".external-button-group").find(".story-podcast-playing");
    var iframe = podcastElement.find("iframe");
 
    if (!podcastElement.is(":visible")) {
      podcastElement.show();
      iframe.attr("src", iframe.data("src"));
    }
  });
 
  // Handle "X" button click (Close podcast player)
  $(document).on("click", ".close-btn", function () {
    var podcastElement = $(this).closest(".story-podcast-playing");
    var iframe = podcastElement.find("iframe");
    podcastElement.hide();
    iframe.data("src", iframe.attr("src"));
    iframe.attr("src", "");
  });
 
  // Additional styling
  $(this).closest(".white-box-text").find(".tile--gib").css("padding", "15px 20px");
  $(".tile--gib").css("height", "290px");
  $(".white-box.tile--news.tile--gib.tile.story.tile--white").css({
    "max-height": "290px",
    "min-height": "290px"
  });
 
  $('a').each
});
 
    </script>
 
  </xsl:template>
 
 
  <xsl:template name="PUBLISH_DATE">
    <xsl:param name="publish_date" />
    <xsl:variable name="vYear" select="substring-before($publish_date, '-')" />
    <xsl:variable name="vnumMonth" select="number(substring-before(substring-after($publish_date, '-'), '-'))" />
    <xsl:variable name="vDay" select="number(substring-after(substring-after($publish_date, '-'), '-'))" />
    <xsl:choose>
      <xsl:when test="$vnumMonth = '1' or $vnumMonth = '01'">JAN</xsl:when>
      <xsl:when test="$vnumMonth = '2' or $vnumMonth = '02'">FEB</xsl:when>
      <xsl:when test="$vnumMonth = '3' or $vnumMonth = '03'">MAR</xsl:when>
      <xsl:when test="$vnumMonth = '4' or $vnumMonth = '04'">APR</xsl:when>
      <xsl:when test="$vnumMonth = '5' or $vnumMonth = '05'">MAY</xsl:when>
      <xsl:when test="$vnumMonth = '6' or $vnumMonth = '06'">JUN</xsl:when>
      <xsl:when test="$vnumMonth = '7' or $vnumMonth = '07'">JUL</xsl:when>
      <xsl:when test="$vnumMonth = '8' or $vnumMonth = '08'">AUG</xsl:when>
      <xsl:when test="$vnumMonth = '9' or $vnumMonth = '09'">SEP</xsl:when>
      <xsl:when test="$vnumMonth = '10'">OCT</xsl:when>
      <xsl:when test="$vnumMonth = '11'">NOV</xsl:when>
      <xsl:when test="$vnumMonth = '12'">DEC</xsl:when>
    </xsl:choose>
    <xsl:text> </xsl:text>
    <xsl:value-of select="$vDay" />, <xsl:value-of select="$vYear" />
  </xsl:template>
 
 
</xsl:stylesheet>
