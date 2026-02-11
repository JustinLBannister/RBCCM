<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Future-Defining Themes – Tabs/Accordion -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <section class="rbccm-themes" aria-labelledby="themes-heading">
      <div class="rbccm-themes__container">

        <h2 class="rbccm-themes__heading" id="themes-heading">
          <xsl:value-of select="/Data/Datum[@ID='Heading']" disable-output-escaping="yes"/>
        </h2>

        <div class="rbccm-themes__wrapper">
          <!-- Tab list -->
          <div class="rbccm-themes__tablist" role="tablist">

            <xsl:for-each select="
                /Properties/Data/Group[@ID='Theme' or @Name='Theme']
                | /Data/Group[@ID='Theme' or @Name='Theme']
              ">

              <!-- Tab button -->
              <button class="rbccm-themes__tab" role="tab">
                <xsl:attribute name="aria-controls">
                  <xsl:text>panel-</xsl:text>
                  <xsl:value-of select="Datum[@ID='PanelId']"/>
                </xsl:attribute>
                <xsl:attribute name="data-panel">
                  <xsl:value-of select="Datum[@ID='PanelId']"/>
                </xsl:attribute>
                <xsl:attribute name="aria-expanded">false</xsl:attribute>
                <xsl:if test="position() = 1">
                  <xsl:attribute name="class">rbccm-themes__tab is-active</xsl:attribute>
                </xsl:if>
                <xsl:value-of select="Datum[@ID='TabLabel']"/>
                <svg class="rbccm-themes__chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.59 15.555L12 10.9317L7.41 15.555L6 14.1316L12 8.07493L18 14.1316L16.59 15.555Z" fill="white"/>
                </svg>
              </button>

              <!-- Panel -->
              <div class="rbccm-themes__panel" role="tabpanel">
                <xsl:attribute name="id">
                  <xsl:text>panel-</xsl:text>
                  <xsl:value-of select="Datum[@ID='PanelId']"/>
                </xsl:attribute>
                <xsl:attribute name="data-panel">
                  <xsl:value-of select="Datum[@ID='PanelId']"/>
                </xsl:attribute>

                <h3 class="rbccm-theme__title">
                  <xsl:value-of select="Datum[@ID='Title']" disable-output-escaping="yes"/>
                </h3>
                <p>
                  <xsl:value-of select="Datum[@ID='Tagline']" disable-output-escaping="yes"/>
                </p>

                <div class="rbccm-theme__content">
                  <xsl:if test="Datum[@ID='ThemeImage']/Image/Path != ''">
                    <img class="rbccm-theme__image">
                      <xsl:attribute name="src">
                        <xsl:value-of select="Datum[@ID='ThemeImage']/Image/Path"/>
                      </xsl:attribute>
                      <xsl:attribute name="alt">
                        <xsl:value-of select="Datum[@ID='ThemeImageAlt']"/>
                      </xsl:attribute>
                    </img>
                  </xsl:if>
                  <div class="rbccm-theme__text">
                    <xsl:value-of select="Datum[@ID='Body']" disable-output-escaping="yes"/>
                  </div>
                </div>
              </div>

            </xsl:for-each>

          </div>
          <!-- Desktop panels container -->
          <div class="rbccm-themes__panels"><!-- Panels will be moved here via JavaScript on desktop --></div>
        </div>

      </div>
    </section>

  </xsl:template>
</xsl:stylesheet>
