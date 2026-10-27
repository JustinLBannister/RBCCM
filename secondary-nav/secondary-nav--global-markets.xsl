<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Secondary Nav - Global Markets (static links)
       Same markup, CSS and JS as the standard Secondary Nav skin, but the
       nine Global Markets links are fixed in this skin, so editors can't
       change them. The component's Nav Item rows are ignored by this skin.

       Still editable in Properties: Locale (en / fr), the three aria-label
       overrides, and Show Top Border.

       Active item: secondary-nav.js highlights the link whose URL the page
       path starts with. Electronic Trading links to .../electronic-trading/
       multi-asset-electronic-trading but should light up on every Electronic Trading page (MAAS,
       FX, ...), so it carries data-nav-match with the section path and the
       small script below marks it first (secondary-nav.js keeps an item
       that's already active). -->

  <xsl:strip-space elements="*"/>

  <!-- HTML output so the inline script below is written as-is (XML output
       would escape its ">" and break it). -->
  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <!-- One fixed nav item. -->
  <xsl:template name="navItem">
    <xsl:param name="key"/>
    <xsl:param name="mod"/>
    <xsl:param name="href"/>
    <xsl:param name="label"/>
    <xsl:param name="match"/>
    <li itemprop="name">
      <xsl:attribute name="class">secondary-nav__item secondary-nav__item--<xsl:value-of select="$mod"/></xsl:attribute>
      <xsl:attribute name="data-nav-item"><xsl:value-of select="$key"/></xsl:attribute>
      <xsl:if test="$match != ''">
        <xsl:attribute name="data-nav-match"><xsl:value-of select="$match"/></xsl:attribute>
      </xsl:if>
      <a itemprop="url">
        <xsl:attribute name="href"><xsl:value-of select="$href"/></xsl:attribute>
        <xsl:value-of select="$label"/>
      </a>
    </li>
  </xsl:template>

  <xsl:template match="/">

    <!-- Locale toggle: 'en' (default) or 'fr' -->
    <xsl:variable name="locale">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='Locale']) = 'fr'">fr</xsl:when>
        <xsl:otherwise>en</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Aria labels: override wins, else locale default. -->
    <xsl:variable name="navAriaLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='NavAriaLabel']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='NavAriaLabel'])"/>
        </xsl:when>
        <xsl:when test="$locale = 'fr'">Navigation secondaire</xsl:when>
        <xsl:otherwise>Secondary navigation</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="prevAriaLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel'])"/>
        </xsl:when>
        <xsl:when test="$locale = 'fr'">Faire d&#233;filer la navigation secondaire vers la gauche</xsl:when>
        <xsl:otherwise>Scroll secondary navigation left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="nextAriaLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel'])"/>
        </xsl:when>
        <xsl:when test="$locale = 'fr'">Faire d&#233;filer la navigation secondaire vers la droite</xsl:when>
        <xsl:otherwise>Scroll secondary navigation right</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Top border: on unless ShowBorderTop is explicitly false (any case). -->
    <xsl:variable name="showBorderTop">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Datum[@ID='ShowBorderTop']),
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'false'">false</xsl:when>
        <xsl:otherwise>true</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <link rel="stylesheet" href="/assets/rbccm/css/components/secondary-nav.css"/>

    <nav itemscope="itemscope" itemtype="https://schema.org/SiteNavigationElement">
      <xsl:attribute name="class">
        <xsl:text>secondary-nav secondary-nav--global-markets</xsl:text>
        <xsl:if test="$showBorderTop = 'false'"><xsl:text> secondary-nav--no-border-top</xsl:text></xsl:if>
      </xsl:attribute>
      <xsl:attribute name="aria-label"><xsl:value-of select="$navAriaLabel"/></xsl:attribute>

      <div class="secondary-nav__inner">

        <button type="button" class="secondary-nav__arrow secondary-nav__arrow--prev is-not-needed"
                aria-controls="secondary-nav-wrapper">
          <xsl:attribute name="aria-label"><xsl:value-of select="$prevAriaLabel"/></xsl:attribute>
          <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polyline points="8,2 3,6 8,10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor"/>
          </svg>
        </button>

        <div id="secondary-nav-wrapper" class="secondary-nav__wrapper">
          <ul class="secondary-nav__list" data-nav-section="expertise">
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'fixed-income'"/>
              <xsl:with-param name="mod" select="'fixed-income'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/fixed-income'"/>
              <xsl:with-param name="label" select="'Fixed Income'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'debt-origination'"/>
              <xsl:with-param name="mod" select="'debt-origination'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/debt-origination'"/>
              <xsl:with-param name="label" select="'Debt Origination'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'asset-based'"/>
              <xsl:with-param name="mod" select="'asset-based'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/asset-based-finance'"/>
              <xsl:with-param name="label" select="'Asset-Based Finance'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'foreign-exchange'"/>
              <xsl:with-param name="mod" select="'foreign-exchange'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/foreign-exchange'"/>
              <xsl:with-param name="label" select="'Foreign Exchange'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'commodities'"/>
              <xsl:with-param name="mod" select="'commodities'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/commodities'"/>
              <xsl:with-param name="label" select="'Commodities'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'global-equities'"/>
              <xsl:with-param name="mod" select="'equities'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/global-equities'"/>
              <xsl:with-param name="label" select="'Global Equities'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'prime-brokerage'"/>
              <xsl:with-param name="mod" select="'prime-brokerage'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/canadian-prime-brokerage'"/>
              <xsl:with-param name="label" select="'Canadian Prime Brokerage'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'global-etf-services'"/>
              <xsl:with-param name="mod" select="'global-etf-services'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/global-etf-services'"/>
              <xsl:with-param name="label" select="'Global ETF Services'"/>
            </xsl:call-template>
            <xsl:call-template name="navItem">
              <xsl:with-param name="key" select="'electronic-trading'"/>
              <xsl:with-param name="mod" select="'electronic-trading'"/>
              <xsl:with-param name="href" select="'/en/expertise/global-markets/electronic-trading/multi-asset-electronic-trading'"/>
              <xsl:with-param name="label" select="'Electronic Trading'"/>
              <xsl:with-param name="match" select="'/en/expertise/global-markets/electronic-trading'"/>
            </xsl:call-template>
          </ul>
        </div>

        <button type="button" class="secondary-nav__arrow secondary-nav__arrow--next is-not-needed"
                aria-controls="secondary-nav-wrapper">
          <xsl:attribute name="aria-label"><xsl:value-of select="$nextAriaLabel"/></xsl:attribute>
          <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polyline points="4,2 9,6 4,10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor"/>
          </svg>
        </button>

      </div>

      <div class="secondary-nav__progress-bar" aria-hidden="true">
        <div class="secondary-nav__progress-fill"></div>
      </div>
    </nav>

    <!-- Section match for items whose link isn't the section root (Electronic
         Trading). Runs before secondary-nav.js, which leaves an item that's
         already active alone. -->
    <script>
      (function () {
        var p = window.location.pathname;
        var items = document.querySelectorAll('.secondary-nav--global-markets [data-nav-match]');
        for (var i = 0; items.length > i; i++) {
          if (p.indexOf(items[i].getAttribute('data-nav-match')) === 0) {
            items[i].className += ' active';
            var a = items[i].querySelector('a');
            if (a) { a.setAttribute('aria-current', 'page'); }
            break;
          }
        }
      })();
    </script>

    <script src="/assets/rbccm/js/components/secondary-nav.js"></script>

  </xsl:template>

</xsl:stylesheet>
