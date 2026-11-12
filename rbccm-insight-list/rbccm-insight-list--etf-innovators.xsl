<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: Insight List :: etf-innovators

    ETF Innovators "More on ETFs". White section: heading and intro,
    then a list of up to four stories. Each story: image, category
    label, title, summary, meta line and a "Read the story" button.
    One column on mobile, two from 768.

    Each story can be picked with its Story field (TeamSite's article
    picker): the title, summary, image and link then come from the
    story itself. Anything typed in the story's own fields overrides
    the picked story. The category and meta line are always typed.

    Every element carries the etf-innovators modifier. Reads
    rbccm-insight-list-properties.xml. Blank fields don't render; a
    story hides when it has no title (typed or picked).
  -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <!-- Rich text output. Text pasted into the editor straight from Figma
       carries two hidden spans (data-metadata="(figmeta)..." and
       data-buffer="(figma)...") holding the Figma file key and a base64
       copy of the design, often tens of KB per field. They are invisible
       but bloat the page and expose internal file details, so they are
       removed here; all other HTML is output as entered. -->
  <xsl:template name="rbccmRich">
    <xsl:param name="s"/>
    <xsl:variable name="clean"><xsl:call-template name="rbccmStripFigma"><xsl:with-param name="s" select="string($s)"/></xsl:call-template></xsl:variable>
    <xsl:value-of select="$clean" disable-output-escaping="yes"/>
  </xsl:template>

  <xsl:template name="rbccmStripFigma">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, '&lt;span data-metadata=') and contains(substring-after($s, '&lt;span data-metadata='), '&lt;/span&gt;')">
        <xsl:call-template name="rbccmStripFigma">
          <xsl:with-param name="s" select="concat(substring-before($s, '&lt;span data-metadata='), substring-after(substring-after($s, '&lt;span data-metadata='), '&lt;/span&gt;'))"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($s, '&lt;span data-buffer=') and contains(substring-after($s, '&lt;span data-buffer='), '&lt;/span&gt;')">
        <xsl:call-template name="rbccmStripFigma">
          <xsl:with-param name="s" select="concat(substring-before($s, '&lt;span data-buffer='), substring-after(substring-after($s, '&lt;span data-buffer='), '&lt;/span&gt;'))"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Visible text of a rich-text field: tags stripped. Used to treat
       fields the editor left with only placeholder markup
       (<br data-mce-bogus="1">, <p>&nbsp;</p>) as blank. -->
  <xsl:template name="stripTags">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, '&lt;') and contains(substring-after($s, '&lt;'), '&gt;')">
        <xsl:value-of select="substring-before($s, '&lt;')"/>
        <xsl:call-template name="stripTags">
          <xsl:with-param name="s" select="substring-after(substring-after($s, '&lt;'), '&gt;')"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Character limit from a field: a number, "full" or 0 = no limit,
       blank = the default. -->
  <xsl:template name="limitValue">
    <xsl:param name="raw"/>
    <xsl:param name="default"/>
    <xsl:variable name="v" select="translate(normalize-space($raw), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
    <xsl:variable name="digits" select="translate($v, translate($v, '0123456789', ''), '')"/>
    <xsl:choose>
      <xsl:when test="$v = 'full'">0</xsl:when>
      <xsl:when test="$digits != ''"><xsl:value-of select="number($digits)"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="$default"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Position of the last space in $s (0 if none). -->
  <xsl:template name="lastSpace">
    <xsl:param name="s"/>
    <xsl:param name="offset" select="0"/>
    <xsl:choose>
      <xsl:when test="contains($s, ' ')">
        <xsl:call-template name="lastSpace">
          <xsl:with-param name="s" select="substring-after($s, ' ')"/>
          <xsl:with-param name="offset" select="$offset + string-length(substring-before($s, ' ')) + 1"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$offset"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Cut $text to at most $max characters including the ellipsis, at
       the last whole word (unless that drops more than 40% of the
       allowance), trailing punctuation trimmed. Same as
       rbccm-featured-insights. $max = 0 or short enough: unchanged. -->
  <xsl:template name="truncate">
    <xsl:param name="text"/>
    <xsl:param name="max"/>
    <xsl:variable name="t" select="normalize-space($text)"/>
    <xsl:choose>
      <xsl:when test="$max &lt;= 0 or string-length($t) &lt;= $max"><xsl:value-of select="$t"/></xsl:when>
      <xsl:otherwise>
        <xsl:variable name="cut" select="substring($t, 1, $max - 1)"/>
        <xsl:variable name="sp"><xsl:call-template name="lastSpace"><xsl:with-param name="s" select="$cut"/></xsl:call-template></xsl:variable>
        <xsl:variable name="word">
          <xsl:choose>
            <xsl:when test="$sp &gt; ($max * 0.6)"><xsl:value-of select="substring($cut, 1, $sp - 1)"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$cut"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:call-template name="trimEnd"><xsl:with-param name="s" select="$word"/></xsl:call-template>
        <xsl:text>&#8230;</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Drop trailing spaces and , ; : . - before the ellipsis. -->
  <xsl:template name="trimEnd">
    <xsl:param name="s"/>
    <xsl:variable name="last" select="substring($s, string-length($s))"/>
    <xsl:choose>
      <xsl:when test="$s != '' and contains(' ,;:.-', $last)">
        <xsl:call-template name="trimEnd"><xsl:with-param name="s" select="substring($s, 1, string-length($s) - 1)"/></xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$s"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID'])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel'])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath'])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion'])"/>

    <xsl:variable name="HEADING"   select="normalize-space(//Datum[@ID='SectionHeading'])"/>
    <xsl:variable name="INTRO"     select="//Datum[@ID='SectionIntro']"/>
    <xsl:variable name="INTRO_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$INTRO"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_INTRO" select="normalize-space(translate($INTRO_TEXT, '&#160;', '')) != '' and normalize-space($INTRO_TEXT) != '&amp;nbsp;'"/>

    <xsl:variable name="ID_BASE">
      <xsl:choose>
        <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/></xsl:when>
        <xsl:otherwise>rbccm-insight-list</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet">
        <xsl:attribute name="href"><xsl:value-of select="$CSS_PATH"/><xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if></xsl:attribute>
      </link>
    </xsl:if>

    <section class="rbccm-insight-list rbccm-insight-list--etf-innovators">
      <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/></xsl:attribute>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-labelledby"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <div class="rbccm-insight-list__inner rbccm-insight-list__inner--etf-innovators">

        <xsl:if test="$HEADING != '' or $HAS_INTRO">
          <div class="rbccm-insight-list__header rbccm-insight-list__header--etf-innovators">
            <xsl:if test="$HEADING != ''">
              <h2 class="rbccm-insight-list__heading rbccm-insight-list__heading--etf-innovators" data-animate="fadeInUp">
                <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
                <xsl:value-of select="$HEADING"/>
              </h2>
            </xsl:if>
            <xsl:if test="$HAS_INTRO">
              <div class="rbccm-insight-list__intro rbccm-insight-list__intro--etf-innovators" data-animate="fadeInUp" data-animate-delay="120"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$INTRO"/></xsl:call-template></div>
            </xsl:if>
          </div>
        </xsl:if>

        <ul class="rbccm-insight-list__list rbccm-insight-list__list--etf-innovators">
          <xsl:call-template name="ITEM"><xsl:with-param name="n" select="1"/></xsl:call-template>
          <xsl:call-template name="ITEM"><xsl:with-param name="n" select="2"/></xsl:call-template>
          <xsl:call-template name="ITEM"><xsl:with-param name="n" select="3"/></xsl:call-template>
          <xsl:call-template name="ITEM"><xsl:with-param name="n" select="4"/></xsl:call-template>
        </ul>

      </div>
    </section>
  </xsl:template>

  <!-- One story. Typed fields win; otherwise the picked story's
       title / description / thumbnail / link (or url) are used. The DCR
       wrapper element varies by story type, so it is wildcarded
       (DCR/*/field), same as rbccm-featured-insights. -->
  <xsl:template name="ITEM">
    <xsl:param name="n"/>

    <xsl:variable name="DCR"       select="//Datum[@ID=concat('Item', $n, 'Story')]/DCR"/>
    <xsl:variable name="CATEGORY"  select="normalize-space(//Datum[@ID=concat('Item', $n, 'Category')])"/>
    <xsl:variable name="TITLE_RAW" select="normalize-space(//Datum[@ID=concat('Item', $n, 'Title')])"/>
    <xsl:variable name="SUMMARY_RAW" select="//Datum[@ID=concat('Item', $n, 'Summary')]"/>
    <xsl:variable name="META"      select="normalize-space(//Datum[@ID=concat('Item', $n, 'Meta')])"/>
    <xsl:variable name="IMG_RAW"   select="normalize-space(//Datum[@ID=concat('Item', $n, 'Image')]/Image/Path)"/>
    <xsl:variable name="IMG_ALT"   select="normalize-space(//Datum[@ID=concat('Item', $n, 'Image')]/Image/Description)"/>
    <xsl:variable name="LINK_RAW"  select="normalize-space(//Datum[@ID=concat('Item', $n, 'Link')])"/>
    <xsl:variable name="BTN_RAW"   select="normalize-space(//Datum[@ID=concat('Item', $n, 'ButtonLabel')])"/>
    <xsl:variable name="SUMMARY_MAX">
      <xsl:call-template name="limitValue">
        <xsl:with-param name="raw" select="//Datum[@ID='SummaryLimit']"/>
        <xsl:with-param name="default" select="90"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:variable name="SUMMARY_RAW_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$SUMMARY_RAW"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_SUMMARY_RAW" select="normalize-space(translate($SUMMARY_RAW_TEXT, '&#160;', '')) != '' and normalize-space($SUMMARY_RAW_TEXT) != '&amp;nbsp;'"/>

    <xsl:variable name="TITLE">
      <xsl:choose>
        <xsl:when test="$TITLE_RAW != ''"><xsl:value-of select="$TITLE_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($DCR/*/title)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SUMMARY">
      <xsl:choose>
        <xsl:when test="$HAS_SUMMARY_RAW"><xsl:value-of select="$SUMMARY_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$DCR/*/description"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SUMMARY_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$SUMMARY"/></xsl:call-template></xsl:variable>
    <xsl:variable name="IMG">
      <xsl:choose>
        <xsl:when test="$IMG_RAW != ''"><xsl:value-of select="$IMG_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($DCR/*/thumbnail)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="LINK">
      <xsl:choose>
        <xsl:when test="$LINK_RAW != ''"><xsl:value-of select="$LINK_RAW"/></xsl:when>
        <xsl:when test="normalize-space($DCR/*/link) != ''"><xsl:value-of select="normalize-space($DCR/*/link)"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($DCR/*/url)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="BTN">
      <xsl:choose>
        <xsl:when test="$BTN_RAW != ''"><xsl:value-of select="$BTN_RAW"/></xsl:when>
        <xsl:otherwise>Read the story</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="normalize-space($TITLE) != ''">
      <li class="rbccm-insight-list__item rbccm-insight-list__item--etf-innovators" data-animate="fadeInUp">
        <xsl:if test="$n &gt; 1">
          <xsl:attribute name="data-animate-delay"><xsl:value-of select="($n - 1) * 150"/></xsl:attribute>
        </xsl:if>

        <xsl:if test="$IMG != ''">
          <div class="rbccm-insight-list__image rbccm-insight-list__image--etf-innovators">
            <!-- The title sits right under the image, so a blank
                 description makes the image decorative (alt=""). -->
            <img class="rbccm-insight-list__img rbccm-insight-list__img--etf-innovators" width="329" height="187" loading="lazy" decoding="async">
              <xsl:attribute name="src"><xsl:value-of select="$IMG"/></xsl:attribute>
              <xsl:attribute name="alt"><xsl:value-of select="$IMG_ALT"/></xsl:attribute>
            </img>
          </div>
        </xsl:if>

        <div class="rbccm-insight-list__content rbccm-insight-list__content--etf-innovators">
          <xsl:if test="$CATEGORY != ''">
            <p class="rbccm-insight-list__category rbccm-insight-list__category--etf-innovators"><xsl:value-of select="$CATEGORY"/></p>
          </xsl:if>

          <h3 class="rbccm-insight-list__title rbccm-insight-list__title--etf-innovators"><xsl:value-of select="$TITLE"/></h3>

          <xsl:if test="normalize-space(translate($SUMMARY_TEXT, '&#160;', '')) != '' and normalize-space($SUMMARY_TEXT) != '&amp;nbsp;'">
            <!-- Within the limit (SummaryLimit, default 90 characters):
                 output as entered, inline HTML kept. Over it: plain text
                 cut at the last whole word with an ellipsis, so no tag is
                 cut in half. -->
            <div class="rbccm-insight-list__summary rbccm-insight-list__summary--etf-innovators">
              <xsl:choose>
                <xsl:when test="number($SUMMARY_MAX) &gt; 0 and string-length(normalize-space($SUMMARY_TEXT)) &gt; number($SUMMARY_MAX)">
                  <xsl:call-template name="truncate">
                    <xsl:with-param name="text" select="$SUMMARY_TEXT"/>
                    <xsl:with-param name="max" select="number($SUMMARY_MAX)"/>
                  </xsl:call-template>
                </xsl:when>
                <xsl:otherwise><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$SUMMARY"/></xsl:call-template></xsl:otherwise>
              </xsl:choose>
            </div>
          </xsl:if>

          <xsl:if test="$META != ''">
            <p class="rbccm-insight-list__meta rbccm-insight-list__meta--etf-innovators"><xsl:value-of select="$META"/></p>
          </xsl:if>

          <xsl:if test="normalize-space($LINK) != ''">
            <a class="rbccm-insight-list__button rbccm-insight-list__button--etf-innovators">
              <xsl:attribute name="href"><xsl:value-of select="$LINK"/></xsl:attribute>
              <!-- Screen readers hear which story: "Read the story: {title}". -->
              <xsl:attribute name="aria-label"><xsl:value-of select="concat($BTN, ': ', $TITLE)"/></xsl:attribute>
              <span class="rbccm-insight-list__button-label rbccm-insight-list__button-label--etf-innovators"><xsl:value-of select="$BTN"/></span>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-list__button-icon rbccm-insight-list__button-icon--etf-innovators" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false"><path d="M0.875 7.00006C0.875 6.88403 0.921094 6.77275 1.00314 6.69071C1.08519 6.60866 1.19647 6.56256 1.3125 6.56256H11.6314L8.87775 3.80981C8.7956 3.72766 8.74945 3.61624 8.74945 3.50006C8.74945 3.38389 8.7956 3.27247 8.87775 3.19031C8.9599 3.10816 9.07132 3.06201 9.1875 3.06201C9.30368 3.06201 9.4151 3.10816 9.49725 3.19031L12.9973 6.69031C13.038 6.73095 13.0703 6.77923 13.0924 6.83238C13.1144 6.88554 13.1258 6.94252 13.1258 7.00006C13.1258 7.05761 13.1144 7.11459 13.0924 7.16774C13.0703 7.22089 13.038 7.26917 12.9973 7.30981L9.49725 10.8098C9.4151 10.892 9.30368 10.9381 9.1875 10.9381C9.07132 10.9381 8.9599 10.892 8.87775 10.8098C8.7956 10.7277 8.74945 10.6162 8.74945 10.5001C8.74945 10.3839 8.7956 10.2725 8.87775 10.1903L11.6314 7.43756H1.3125C1.19647 7.43756 1.08519 7.39147 1.00314 7.30942C0.921094 7.22738 0.875 7.1161 0.875 7.00006Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></svg>
            </a>
          </xsl:if>
        </div>
      </li>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
