<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Hero – Video Background -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <section class="rbccm-hero rbccm-hero--video" aria-labelledby="rbccm-hero-title">
      <xsl:attribute name="id">
        <xsl:value-of select="/Data/Datum[@ID='Id']"/>
      </xsl:attribute>

      <!-- Video background layer -->
      <xsl:if test="/Properties/Datum[@ID='ShowVideo'] = 'true'">
        <div class="rbccm-hero__video-bg">
          <div>
            <xsl:attribute name="id">
              <xsl:value-of select="/Data/Datum[@ID='TeaserMountId']"/>
            </xsl:attribute>
          </div>
        </div>
      </xsl:if>

      <!-- Hero content overlay -->
      <div class="rbccm-hero__container">
        <div class="rbccm-hero__intro">
          <!-- Logo -->
          <xsl:if test="/Data/Datum[@ID='LogoImage']/Image/Path != ''">
            <div class="rbccm-hero__logo">
              <img class="rbccm-hero__logo-image">
                <xsl:attribute name="src">
                  <xsl:value-of select="/Data/Datum[@ID='LogoImage']/Image/Path"/>
                </xsl:attribute>
                <xsl:attribute name="alt">
                  <xsl:value-of select="/Data/Datum[@ID='LogoAlt']"/>
                </xsl:attribute>
              </img>
            </div>
          </xsl:if>

          <!-- Title -->
          <h1 id="rbccm-hero-title" class="rbccm-hero__title">
            <xsl:value-of select="/Data/Datum[@ID='Title']" disable-output-escaping="yes"/>
          </h1>

          <!-- Description -->
          <xsl:if test="/Data/Datum[@ID='Description'] != ''">
            <p class="rbccm-hero__desc">
              <xsl:value-of select="/Data/Datum[@ID='Description']" disable-output-escaping="yes"/>
            </p>
          </xsl:if>

          <!-- CTA Button -->
          <xsl:if test="/Properties/Datum[@ID='ShowCta'] = 'true' and /Data/Datum[@ID='CtaLabel'] != ''">
            <div class="rbccm-hero__actions">
              <a class="rbccm-hero__btn" rel="noopener">
                <xsl:attribute name="href">
                  <xsl:value-of select="/Data/Datum[@ID='CtaLink']"/>
                </xsl:attribute>
                <xsl:value-of select="/Data/Datum[@ID='CtaLabel']"/>
              </a>
            </div>
          </xsl:if>
        </div>
      </div>
    </section>

  </xsl:template>
</xsl:stylesheet>
