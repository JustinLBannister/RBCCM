<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Testimonials – Slick -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- Component-scoped stylesheet -->
    <link rel="stylesheet" href="/assets/rbccm/css/sub/test/imagine-2025.css"/>

    <section class="rbccm-testimonials" aria-label="Client Testimonials">
      <!-- Inline styles: background color + CSS var for ::after bg image -->
      <xsl:attribute name="style">
        <!-- optional background color -->
        <xsl:if test="//Properties/Datum[@ID='Background'] != ''">
          <xsl:text>background-color:</xsl:text>
          <xsl:value-of select="//Properties/Datum[@ID='Background']"/>
          <xsl:text>;</xsl:text>
        </xsl:if>

        <!-- CSS custom property from image picker -->
        <xsl:text>--rbccm-testimonials-bg:url('</xsl:text>
        <xsl:value-of select="//Properties/Datum[@ID='BgImage']/Image/Path"/>
        <xsl:text>');</xsl:text>
      </xsl:attribute>

      <div class="rbccm-testimonials__container">

        <!-- Text slider: quotes -->
        <div class="rbccm-testimonials__slider-text" id="testimonialTextSlider">
          <xsl:for-each select="//Group[starts-with(@ID,'Slide')]">
            <div class="rbccm-testimonials__text-slide">
              <blockquote class="rbccm-testimonials__quote">
                <xsl:value-of select="Datum[@ID='Quote']" disable-output-escaping="yes"/>
              </blockquote>
              <cite class="rbccm-testimonials__citation">
                <span class="rbccm-testimonials__author">
                  <xsl:value-of select="Datum[@ID='Author']"/>
                </span>
                <span class="rbccm-testimonials__role">
                  <xsl:value-of select="Datum[@ID='Role']" disable-output-escaping="yes"/>
                </span>
              </cite>
            </div>
          </xsl:for-each>
        </div>

        <!-- Controls: arrows + dots -->
        <div class="rbccm-testimonials__controls">
          <div class="rbccm-testimonials__arrows"></div>
          <div class="rbccm-testimonials__dots"></div>
        </div>

        <!-- Image slider: portraits -->
        <div class="rbccm-testimonials__slider-image" id="testimonialImageSlider">
          <xsl:for-each select="//Group[starts-with(@ID,'Slide')]">
            <div class="rbccm-testimonials__image-slide">
              <img>
                <xsl:attribute name="src">
                  <xsl:value-of select="Datum[@ID='Portrait']/Image/Path"/>
                </xsl:attribute>
                <xsl:attribute name="alt">
                  <xsl:value-of select="Datum[@ID='Alt']"/>
                </xsl:attribute>
              </img>
            </div>
          </xsl:for-each>
        </div>
      </div>

      <!-- Desktop-only arrow wrapper (outside container) -->
      <div class="rbccm-testimonials__arrows-desktop"></div>
    </section>

    <!-- Slick init -->
    <script>// <![CDATA[
      (function () {

        function parseBool(raw, defVal) {
          var val = (raw || "").toString().trim().toLowerCase();
          if (val === "") return defVal;
          if (["true", "1", "yes", "on"].indexOf(val) !== -1) return true;
          if (["false", "0", "no", "off"].indexOf(val) !== -1) return false;
          return defVal;
        }

        function buildSliders($, $text, $image) {
          var isDesktop   = window.matchMedia('(min-width: 992px)').matches;
          var $arrowsWrap = isDesktop
            ? $('.rbccm-testimonials__arrows-desktop')
            : $('.rbccm-testimonials__arrows');

          var rawInfinite = "]]><xsl:value-of select="//Properties/Datum[@ID='Infinite']"/><![CDATA[";
          var rawAutoplay = "]]><xsl:value-of select="//Properties/Datum[@ID='Autoplay']"/><![CDATA[";
          var rawShowDots = "]]><xsl:value-of select="//Properties/Datum[@ID='ShowDots']"/><![CDATA[";

          var infinite = parseBool(rawInfinite, true);
          var autoplay = parseBool(rawAutoplay, true);
          var showDots = parseBool(rawShowDots, true);

          var autoplaySpeed = parseInt(
            "]]><xsl:value-of select="//Properties/Datum[@ID='AutoplaySpeed']"/><![CDATA[",
            10
          ) || 4500;

          if ($text.hasClass('slick-initialized')) { $text.slick('unslick'); }
          if ($image.hasClass('slick-initialized')) { $image.slick('unslick'); }

          $text.slick({
            infinite: infinite,
            autoplay: autoplay,
            autoplaySpeed: autoplaySpeed,
            adaptiveHeight: true,
            asNavFor: '#testimonialImageSlider',
            arrows: true,
            appendArrows: $arrowsWrap,
            dots: showDots,
            appendDots: $('.rbccm-testimonials__dots'),
            fade: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow:
              '<button type="button" class="custom-slick-prev">' +
              '<svg width="19" height="38" viewBox="0 0 12 21" fill="none">' +
              '<path d="M10.707 20.3535L0.707031 10.3535L10.707 0.353515" stroke="#979797"/></svg></button>',
            nextArrow:
              '<button type="button" class="custom-slick-next">' +
              '<svg width="19" height="38" viewBox="0 0 12 21" fill="none">' +
              '<path d="M0.353516 0.353516L10.3535 10.3535L0.353516 20.3535" stroke="white"/></svg></button>'
          });

          $image.slick({
            infinite: infinite,
            autoplay: false,
            adaptiveHeight: true,
            asNavFor: '#testimonialTextSlider',
            arrows: false,
            dots: false,
            fade: true,
            slidesToShow: 1,
            slidesToScroll: 1
          });

          var $prevArrow = $arrowsWrap.find('.custom-slick-prev');
          var $nextArrow = $arrowsWrap.find('.custom-slick-next');

          $prevArrow.off('.rbccm');
          $nextArrow.off('.rbccm');

          $prevArrow.on('click.rbccm', function (e) {
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            $text.slick('slickPrev');
          });

          $nextArrow.on('click.rbccm', function (e) {
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            $text.slick('slickNext');
          });
        }

        function waitAndInit() {
          var tries = 0;
          var maxTries = 200;

          var timer = setInterval(function () {
            var $ = window.jQuery;
            if (!$ || !$.fn || !$.fn.slick) {
              tries++;
              if (tries >= maxTries) {
                console.warn('Testimonials slider: jQuery or Slick not available after waiting');
                clearInterval(timer);
              }
              return;
            }

            var $text  = $('#testimonialTextSlider');
            var $image = $('#testimonialImageSlider');

            if (!$text.length || !$image.length) {
              tries++;
              if (tries >= maxTries) {
                console.warn('Testimonials slider: slider elements not found after waiting');
                clearInterval(timer);
              }
              return;
            }

            clearInterval(timer);
            buildSliders($, $text, $image);

            var resizeTimer;
            window.addEventListener('resize', function () {
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(function () {
                buildSliders($, $text, $image);
              }, 250);
            });
          }, 50);
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          waitAndInit();
        } else {
          document.addEventListener('DOMContentLoaded', waitAndInit);
        }
      })();
    // ]]></script>
  </xsl:template>
</xsl:stylesheet>
