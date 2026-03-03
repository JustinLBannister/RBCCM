<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: RBCCM - Insights new -->
  <!-- VERSION 2 - Removed server-rendered .initial block; Knockout/JS handles all rendering via fetchYear() -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl" />
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl" />
  <xsl:template match="/">

    <!-- ============================================================ -->
    <!-- V2 CHANGE: .initial server-rendered block has been removed.  -->
    <!-- All episode tiles are now rendered by Knockout via           -->
    <!-- fetchYear() which pulls from the year XML data files.        -->
    <!-- This eliminates the ordering mismatch on "See more" click.   -->
    <!-- ============================================================ -->

    <!-- Loading skeleton shown while fetchYear() is in progress -->
    <style>
      @keyframes pulse {
        0% { background-color: #e0e0e0; }
        50% { background-color: #ececec; }
        100% { background-color: #e0e0e0; }
      }
      .skeleton-tile {
        display: flex;
        margin-bottom: 20px;
        border: 1px solid #e5e5e5;
        min-height: 200px;
      }
      .skeleton-img {
        width: 33%;
        min-height: 200px;
        animation: pulse 1.5s ease-in-out infinite;
      }
      .skeleton-content {
        width: 67%;
        padding: 20px;
      }
      .skeleton-line {
        height: 14px;
        margin-bottom: 12px;
        border-radius: 3px;
        animation: pulse 1.5s ease-in-out infinite;
      }
    </style>

    <div class="container" data-bind="visible: loaded() === false">
      <div class="row">
        <xsl:for-each select="1 to 5">
          <div class="col-xs-12">
            <div class="skeleton-tile">
              <div class="skeleton-img"></div>
              <div class="skeleton-content">
                <div class="skeleton-line" style="width: 25%;"></div>
                <div class="skeleton-line" style="width: 60%; height: 20px; margin-bottom: 16px;"></div>
                <div class="skeleton-line" style="width: 90%;"></div>
                <div class="skeleton-line" style="width: 80%;"></div>
                <div class="skeleton-line" style="width: 30%; margin-top: 20px;"></div>
              </div>
            </div>
          </div>
        </xsl:for-each>
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
                          <a href="javascript:void(0)"></a>
                          <div class="story-podcast-playing" style="display: none;">
                            <a href="javascript:void(0)">
                              <button aria-label="Close Player" class="btn-close-player close-btn">
                                <img src="/assets/rbccm/images/campaign/player-x.svg" alt="Close" />
                              </button>
                              <iframe width="100%" height="200" scrolling="no" frameborder="no" allow="autoplay" data-bind="visible: podcast != '', attr:{{src: podcast}}">
                              </iframe>
                            </a>
                          </div>

                      <a class="learn-more audio-play btn-close-player" href="javascript:void(0);" data-bind="visible: podcast !== ''" aria-label="Play episode"><u>Play episode</u></a>

                          <p class="read-watch" style="padding-top: 30px;">
                           <img src="https://www.rbccm.com/assets/rbccm/images/gib/icons/watch-icon-dark.svg" alt="Watch Time" data-bind="visible: type === 'video'"/>
                           <span class="date" data-bind="visible: type === 'video', html: watchtime"></span>
                           <img src="https://www.rbccm.com/assets/rbccm/images/campaign/podcast-sm-bl.svg" alt="Listen Time" data-bind="visible: type === 'audio'"/>
                           <span class="date" data-bind="visible: type === 'audio', html: watchtime"></span>
                           <span class="separator" role="presentation" style="display: inline-block;height: 15px;border-left: 1px #000000 solid;opacity: .5;margin: 0 7px;" data-bind="visible: watchtime != ''"></span>
                           <img src="https://www.rbccm.com/assets/rbccm/images/gib/icons/read-icon-bl.svg" alt="Read Time" data-bind="visible: readtime != ''"/>
                           <span class="date" data-bind="visible: readtime != '', html: readtime"></span>
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

      <div class="container">
        <div class="text-center" data-bind="visible: (show()==5)||(show() &lt; filteredItems().length) ">
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

    // Hide any currently visible podcast players and clear their iframes src
    $('.story-podcast-playing:visible').each(function() {
      var iframe = $(this).find("iframe");
      iframe.data("src", iframe.attr("src"));
      iframe.attr("src", "");
      $(this).hide();
    });

    // Show the selected podcast player and restore its iframe src
    var podcastElement = $(this).closest(".external-button-group").find(".story-podcast-playing");
    var iframe = podcastElement.find("iframe");

    if (!podcastElement.is(":visible")) {
      podcastElement.show();
      iframe.attr("src", iframe.data("src"));
    }
  });

  // Handle X button click to close podcast player
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

<Properties ComponentID="1445986034770">
  <Datum ID="Container" Type="Boolean" Name="Wrap in Container">true</Datum>
  <Datum ID="ShowPlayButton" Type="Boolean" Name="Show Video Play Button">true</Datum>
  <Datum ID="ShowDate" Type="Boolean" Name="Show Publish Date">false</Datum>
  <Datum ID="ShowAuthor" Type="Boolean" Name="Show Author">true</Datum>
  <Datum ID="CharacterLimit" Type="Number" Name="Allowed characters for description">140</Datum>
</Properties>

<Data>
  <Datum ID="Title" Type="String" Name="My String">Recent Articles</Datum>
  <Datum ID="ArchiveYear" Type="Number" Name="Archive Year" Replicatable="true" CloneGroupID="irnlszht">2016</Datum>
  <Datum ID="ViewPage" Type="PageLink" Name="View Article Page"><![CDATA[$PAGE_LINK[about-us]]]></Datum>
  <Datum ID="ArchivePage" Type="PageLink" Name="Archive Page"><![CDATA[$PAGE_LINK[about-us]]]></Datum>
  <External>
    <Parameters>
      <Datum ID="qQuery" Name="qQuery" Type="String" Label="Query"> ((TeamSite/Templating/DCR/Type:article/story) OR (TeamSite/Templating/DCR/Type:rbccm/episode)) AND ((TeamSite/Metadata/sitelocation:ma-inflection-points) OR (TeamSite/Metadata/podcast_type=:strategic)) AND (TeamSite/Metadata/publishdate:&gt;2020-00-00)</Datum>
      <Datum ID="qSort" Name="qSort" Type="String" Label="Sort">-TeamSite/Metadata/publishdate</Datum>
      <Datum ID="qPagesize" Name="qPagesize" Type="String" Label="Maximum Items">4</Datum>
    </Parameters>
    <Object Scope="local">com.rbccm.livesite.external.core.MetaQueryExternal</Object>
    <Method>findByQuery</Method>
  </External>
</Data>
