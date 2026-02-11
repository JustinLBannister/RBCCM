<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Approach – Video + Text -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <section class="rbccm-approach">
      <xsl:attribute name="id">
        <xsl:value-of select="/Data/Datum[@ID='Id']"/>
      </xsl:attribute>
      <xsl:attribute name="aria-labelledby">
        <xsl:value-of select="/Data/Datum[@ID='Id']"/>
        <xsl:text>-heading</xsl:text>
      </xsl:attribute>

      <div class="rbccm-approach__container">
        <div class="rbccm-approach__content">

          <!-- Video wrapper -->
          <xsl:if test="/Properties/Datum[@ID='ShowVideo'] = 'true'">
            <div class="rbccm-approach__video">
              <xsl:attribute name="data-bc-account">
                <xsl:value-of select="/Data/Datum[@ID='BcAccountId']"/>
              </xsl:attribute>
              <xsl:attribute name="data-bc-player">
                <xsl:value-of select="/Data/Datum[@ID='BcPlayerId']"/>
              </xsl:attribute>
              <xsl:attribute name="data-bc-embed">
                <xsl:value-of select="/Data/Datum[@ID='BcEmbed']"/>
              </xsl:attribute>
              <xsl:attribute name="data-bc-video-id">
                <xsl:value-of select="/Data/Datum[@ID='BcVideoId']"/>
              </xsl:attribute>
            </div>
          </xsl:if>

          <!-- Text details -->
          <div class="rbccm-approach__details">
            <h2 class="rbccm-approach__subtitle">
              <xsl:attribute name="id">
                <xsl:value-of select="/Data/Datum[@ID='Id']"/>
                <xsl:text>-heading</xsl:text>
              </xsl:attribute>
              <xsl:value-of select="/Data/Datum[@ID='Subtitle']" disable-output-escaping="yes"/>
            </h2>
            <xsl:if test="/Data/Datum[@ID='Description'] != ''">
              <p class="rbccm-approach__desc">
                <xsl:value-of select="/Data/Datum[@ID='Description']" disable-output-escaping="yes"/>
              </p>
            </xsl:if>
          </div>

        </div>
      </div>
    </section>

  </xsl:template>
</xsl:stylesheet>
