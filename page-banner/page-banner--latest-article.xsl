<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Page Banner - Latest Article
       Same campaign hero as the Default XSL skin (background image, energy
       lines, breadcrumb, title, subtitle, lead content, yellow tear), but the
       CTA is a "Read more" button that always points at the newest article
       in a feed. Built for Real-Time Geopolitics: the feed is
       /en/insights/real-time-geopolitics/data/rtg (the geopolitics-tagged
       articles, newest first) and only category "Insights" items count.

       How the link is picked (script at the bottom):
       - Loads the feed, keeps <news> items whose <category> is Insights,
         takes the one with the latest <date>. Ties keep feed order.
       - Sets the button href and an aria-label with the article title.
       - Until the feed answers, the button uses CTA Link (Data) if set, so
         it still works without JS. If CTA Link is blank the button holds its
         space invisibly and only shows once the feed answers; if the feed
         fails it stays hidden.

       Properties / Data used: bgimage, title, subtitle, leadcontent,
       custombreadcrumb, CTAText (button label, default "Read more"),
       CTALink (fallback href), ShowBreadcrumb, ShowYellowTear, EnergyLines,
       LeadToday. ShowCTA, CTAType and CTAColour are ignored: this skin
       always shows the Read more button. The episode mode of the Default
       skin is not part of this skin.

       Remove any hand-made "Read more" link from Lead Content when
       switching to this skin, or the page shows two buttons. -->

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:variable name="CURRENT_PAGE_NAME">
    <xsl:choose>
      <xsl:when test="substring(/Properties/Data/External/Parameters/Datum[@Name = 'iw-ls-page-name']/text(), 1,1) = '/'"><xsl:value-of select="substring(/Properties/Data/External/Parameters/Datum[@Name = 'iw-ls-page-name']/text(), 2)" /></xsl:when>
      <xsl:otherwise><xsl:value-of select="/Properties/Data/External/Parameters/Datum[@Name = 'iw-ls-page-name']/text()"/></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- Feed and category for the latest-article lookup. -->
  <xsl:variable name="LATEST_FEED">/en/insights/real-time-geopolitics/data/rtg</xsl:variable>
  <xsl:variable name="LATEST_CATEGORY">Insights</xsl:variable>

  <xsl:template match="/">
    <xsl:variable name="IMAGE" select="/Properties/Data/Datum[@ID='bgimage']/Image/Path"/>
    <xsl:variable name="PAGE_TITLE" select="/Properties/Data/Datum[@ID='title']"/>
    <xsl:variable name="PAGE_SUBTITLE" select="/Properties/Data/Datum[@ID='subtitle']"/>
    <xsl:variable name="LEAD_CONTENT" select="/Properties/Data/Datum[@ID='leadcontent']"/>
    <xsl:variable name="CUSTOM_BREADCRUMB" select="/Properties/Data/Datum[@ID='custombreadcrumb']"/>
    <xsl:variable name="SHOW_BREADCRUMB" select="/Properties/Datum[@ID='ShowBreadcrumb']/Option[@Selected='true']/Value"/>
    <xsl:variable name="SHOW_YELLOWTEAR" select="/Properties/Datum[@ID='ShowYellowTear']/Option[@Selected='true']/Value"/>
    <xsl:variable name="CTA_LINK" select="normalize-space(/Properties/Data/Datum[@ID='CTALink'])"/>
    <xsl:variable name="CTA_TEXT">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Data/Datum[@ID='CTAText']) != ''"><xsl:value-of select="normalize-space(/Properties/Data/Datum[@ID='CTAText'])"/></xsl:when>
        <xsl:otherwise>Read more</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <style>
      .page-banner .page-banner__latest-cta { margin: 30px 0 0; }
      .page-banner .page-banner__latest-btn,
      .page-banner .page-banner__latest-btn:visited {
        align-items: center;
        background: #0051A5;
        border: 1px solid #FFF;
        color: #fff !important;
        display: flex;
        font-family: 'Roboto Medium', 'Roboto', Arial, Verdana, sans-serif !important;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        justify-content: center;
        letter-spacing: .9px;
        line-height: normal;
        max-width: 185px;
        padding: 13px 33px;
        text-align: center;
        text-decoration: none !important;
      }
      .page-banner .page-banner__latest-btn:focus-visible { outline: 2px solid #FFC72C; outline-offset: 3px; }
      .page-banner .page-banner__latest-btn.is-pending { visibility: hidden; }
      .page-banner .page-banner__latest-btn.is-unavailable { display: none; }
    </style>

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
                  <xsl:value-of select="$CUSTOM_BREADCRUMB" disable-output-escaping="yes"/>
                </ul>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:if>

          <div class="row">
            <div class="col-lg-9 col-md-10 col-xs-10">
              <xsl:if test="$SHOW_BREADCRUMB != 'Yes'">
                <div class="uppercase wide-text content-label" style="margin-top: 50px; color: #fff;"><xsl:value-of select="$PAGE_SUBTITLE" disable-output-escaping="yes"/></div>
              </xsl:if>
              <h1><xsl:value-of select="$PAGE_TITLE" disable-output-escaping="yes"/></h1>
              <xsl:if test="($SHOW_BREADCRUMB = 'Yes') and ($PAGE_SUBTITLE != '')">
                <h2><xsl:value-of select="$PAGE_SUBTITLE" disable-output-escaping="yes"/></h2>
              </xsl:if>

              <p><xsl:value-of select="$LEAD_CONTENT" disable-output-escaping="yes"/></p>

              <div class="hero-cta page-banner__latest-cta">
                <a title="Link to Insights article">
                  <xsl:attribute name="class">
                    <xsl:text>page-banner__latest-btn</xsl:text>
                    <xsl:if test="$CTA_LINK = ''"><xsl:text> is-pending</xsl:text></xsl:if>
                  </xsl:attribute>
                  <xsl:attribute name="href">
                    <xsl:choose>
                      <xsl:when test="$CTA_LINK != ''"><xsl:value-of select="$CTA_LINK"/></xsl:when>
                      <xsl:otherwise>#</xsl:otherwise>
                    </xsl:choose>
                  </xsl:attribute>
                  <xsl:attribute name="data-latest-feed"><xsl:value-of select="$LATEST_FEED"/></xsl:attribute>
                  <xsl:attribute name="data-latest-category"><xsl:value-of select="$LATEST_CATEGORY"/></xsl:attribute>
                  <xsl:value-of select="$CTA_TEXT"/>
                </a>
              </div>
            </div>
          </div>

        </div>
        <xsl:if test="/Properties/Datum[@ID='LeadToday'] = 'true'">
          <div class="hidden-xs tagline" style="position: absolute; top: 35px; right: 25px; color: #fff; text-align: right; font-family: 'RBCDisplay'; letter-spacing: 0.4px; font-size: 24px; display: none;">Lead Today.<br/>Define Tomorrow.&#8482;</div>
        </xsl:if>
        <xsl:if test="$SHOW_YELLOWTEAR = 'Yes'">
          <div class="tear-yellow"></div>
        </xsl:if>
      </div>
    </div>

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

    <!-- Point each Read more button at the newest matching feed article. -->
    <script>
      (function () {
        var buttons = document.querySelectorAll('.page-banner__latest-btn[data-latest-feed]');
        if (!buttons.length || !window.fetch || !window.DOMParser) { return; }

        function text(node, tag) {
          var el = node.getElementsByTagName(tag)[0];
          return el ? (el.textContent || '').replace(/^\s+|\s+$/g, '') : '';
        }

        /* Old-format story links become /en/insights/... */
        function cleanLink(link) {
          var marker = 'templatedata/article/story/data/';
          var at = link.indexOf(marker);
          return at === -1 ? link : '/en/insights/' + link.substring(at + marker.length);
        }

        function giveUp(btn) {
          if (btn.className.indexOf('is-pending') !== -1) {
            btn.className = btn.className.replace('is-pending', 'is-unavailable');
          }
        }

        [].forEach.call(buttons, function (btn) {
          var feed = btn.getAttribute('data-latest-feed');
          var category = (btn.getAttribute('data-latest-category') || '').toLowerCase();

          fetch(feed, { credentials: 'same-origin' }).then(function (r) {
            return r.ok ? r.text() : '';
          }).then(function (xml) {
            var doc = new DOMParser().parseFromString(xml, 'text/xml');
            var items = doc.getElementsByTagName('news');
            var best = null;
            var bestTime = -1;
            for (var i = 0; items.length > i; i++) {
              if (category) {
                if (text(items[i], 'category').toLowerCase() !== category) { continue; }
              }
              var link = text(items[i], 'link');
              var time = Date.parse(text(items[i], 'date'));
              if (!link || isNaN(time)) { continue; }
              if (time > bestTime) { best = items[i]; bestTime = time; }
            }
            if (!best) { giveUp(btn); return; }

            btn.setAttribute('href', cleanLink(text(best, 'link')));
            var title = text(best, 'title');
            if (title) { btn.setAttribute('aria-label', btn.textContent.replace(/^\s+|\s+$/g, '') + ': ' + title); }
            btn.className = btn.className.replace(' is-pending', '');
          })['catch'](function () { giveUp(btn); });
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
            <xsl:value-of select="concat( '/en/', $NODE/link/value )" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$NODE/link/value" />
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
