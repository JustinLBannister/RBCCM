<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: RBC CM Stats Ticker (Dark) -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- ── Guard: only render if between 4 and 8 stats ── -->
    <xsl:variable name="statCount" select="count(
        /Properties/Data/Group[@ID='StatItem' or @Name='Stat Item']
        | /Data/Group[@ID='StatItem' or @Name='Stat Item']
      )"/>

    <xsl:if test="$statCount &gt;= 4 and $statCount &lt;= 8">

      <!-- ── Header fields (from appearance XML) ── -->
      <xsl:variable name="title">
        <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Title'])"/>
      </xsl:variable>

      <xsl:variable name="subtitle">
        <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Subtitle'])"/>
      </xsl:variable>

      <xsl:variable name="footnote">
        <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Footnote'])"/>
      </xsl:variable>

      <!-- ── Load CSS ── -->
      <link rel="stylesheet" href="/assets/rbccm/css/sub/test/statistics-ticker.css"/>

      <!-- ── Component HTML ── -->
      <section class="rbccm-stats rbccm-stats--dark">

        <!-- Header -->
        <div class="rbccm-stats__header">
          <div class="rbccm-stats__container">
            <xsl:if test="$title != ''">
              <h2 class="rbccm-stats__title">
                <xsl:value-of select="$title" disable-output-escaping="yes"/>
              </h2>
            </xsl:if>
            <xsl:if test="$subtitle != ''">
              <p class="rbccm-stats__subtitle">
                <xsl:value-of select="$subtitle" disable-output-escaping="yes"/>
              </p>
            </xsl:if>
          </div>
        </div>

        <!-- Stat grid -->
        <div class="rbccm-stats__grid">
          <xsl:for-each select="
              /Properties/Data/Group[@ID='StatItem' or @Name='Stat Item']
              | /Data/Group[@ID='StatItem' or @Name='Stat Item']
            ">
            <xsl:variable name="number"      select="normalize-space(Datum[@Name='Stat Number'])"/>
            <xsl:variable name="description" select="normalize-space(Datum[@Name='Description'])"/>

            <div class="rbccm-stats__item rbccm-stats__item--big">
              <div class="rbccm-stats__number">
                <xsl:value-of select="$number" disable-output-escaping="yes"/>
              </div>
              <p class="rbccm-stats__desc">
                <xsl:value-of select="$description" disable-output-escaping="yes"/>
              </p>
            </div>
          </xsl:for-each>
        </div>

        <!-- Footnote -->
        <xsl:if test="$footnote != ''">
          <p class="rbccm-stats__footnote">
            <xsl:value-of select="$footnote" disable-output-escaping="yes"/>
          </p>
        </xsl:if>

        <!-- Progress bar -->
        <div class="rbccm-stats__progress">
          <div class="rbccm-stats__progress-bar"></div>
        </div>

      </section>

      <!-- ── Load JS ── -->
      <script src="/assets/rbccm/js/sub/test/statistics-ticker.js"></script>

    </xsl:if>

  </xsl:template>
</xsl:stylesheet>

