<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: Strategic Themes :: outlook-2027

    2027 Outlook "Strategic themes". An eyebrow and heading, then up to
    five themes. Each theme: its number, title, description, a button
    and a graphic.

    The skin prints every theme into the page as a plain numbered list,
    so all of the text and links are there without the script. The
    script (rbccm-strategic-themes.js) then turns the list into the
    interactive version:

      Tabs        (the default) One theme shows at a time and a row of
                  numbered tabs switches it. The page scrolls past the
                  section as normal.
      Pinned      Only when the PinnedScroll field is "yes": the section
                  pins to the screen and scrolling steps through the
                  themes one by one. Short windows and visitors who
                  have asked for reduced motion still get the tabs.

    The graphics (radar, element tiles, cell grid, bar chart, maple
    leaf) are drawn by the script. They are decoration, hidden from
    screen readers. A theme can use an image instead.

    Options (Properties fields), each off unless set:
      LoopAnimation   "yes": the graphics keep repeating. Otherwise a
                      graphic plays once each time its theme shows.
      HideCount       "yes": hides the "01 / 05" line above the title.
      PictureStyle    Graphic (the default), Clickable graphic (the
                      picture links where the theme's button links),
                      or Article (the picked story's image as a
                      link, in place of the graphic).

    Each theme can be picked with its Story field (TeamSite's article
    picker): the title, description and link then come from the story.
    Typed fields override the picked story. A theme hides when it has
    no title (typed or picked).

    Every element carries the outlook-2027 modifier. Reads
    rbccm-strategic-themes-properties.xml.
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

  <!-- A theme's title: typed, otherwise the picked story's. -->
  <xsl:template name="themeTitle">
    <xsl:param name="n"/>
    <xsl:variable name="typed" select="normalize-space(//Datum[@ID=concat('Theme', $n, 'Title')])"/>
    <xsl:choose>
      <xsl:when test="$typed != ''"><xsl:value-of select="$typed"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="normalize-space(//Datum[@ID=concat('Theme', $n, 'Story')]/DCR/*/title)"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID'])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel'])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath'])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(//Datum[@ID='JsPath'])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion'])"/>
    <!-- Height of the site header that stays fixed at the top, digits
         only. Blank: the script measures it. -->
    <xsl:variable name="OFFSET_RAW"    select="normalize-space(//Datum[@ID='StickyOffset'])"/>
    <xsl:variable name="OFFSET"        select="translate($OFFSET_RAW, translate($OFFSET_RAW, '0123456789', ''), '')"/>
    <!-- Pinned scroll is off unless the field is "yes". -->
    <xsl:variable name="PIN"           select="translate(normalize-space(//Datum[@ID='PinnedScroll']), 'YES', 'yes')"/>
    <xsl:variable name="LOOP"          select="translate(normalize-space(//Datum[@ID='LoopAnimation']), 'YES', 'yes')"/>
    <xsl:variable name="NO_COUNT"      select="translate(normalize-space(//Datum[@ID='HideCount']), 'YES', 'yes')"/>

    <xsl:variable name="EYEBROW" select="normalize-space(//Datum[@ID='Eyebrow'])"/>
    <xsl:variable name="HEADING" select="normalize-space(//Datum[@ID='SectionHeading'])"/>
    <xsl:variable name="INTRO"   select="normalize-space(//Datum[@ID='SectionIntro'])"/>
    <xsl:variable name="TABS_LABEL_RAW" select="normalize-space(//Datum[@ID='TabsLabel'])"/>
    <xsl:variable name="TABS_LABEL">
      <xsl:choose>
        <xsl:when test="$TABS_LABEL_RAW != ''"><xsl:value-of select="$TABS_LABEL_RAW"/></xsl:when>
        <xsl:otherwise>Themes</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Which themes have a title, and how many. -->
    <xsl:variable name="T1"><xsl:call-template name="themeTitle"><xsl:with-param name="n" select="1"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T2"><xsl:call-template name="themeTitle"><xsl:with-param name="n" select="2"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T3"><xsl:call-template name="themeTitle"><xsl:with-param name="n" select="3"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T4"><xsl:call-template name="themeTitle"><xsl:with-param name="n" select="4"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T5"><xsl:call-template name="themeTitle"><xsl:with-param name="n" select="5"/></xsl:call-template></xsl:variable>
    <xsl:variable name="H1" select="number(string($T1) != '')"/>
    <xsl:variable name="H2" select="number(string($T2) != '')"/>
    <xsl:variable name="H3" select="number(string($T3) != '')"/>
    <xsl:variable name="H4" select="number(string($T4) != '')"/>
    <xsl:variable name="H5" select="number(string($T5) != '')"/>
    <xsl:variable name="COUNT" select="$H1 + $H2 + $H3 + $H4 + $H5"/>

    <xsl:variable name="ID_BASE">
      <xsl:choose>
        <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/></xsl:when>
        <xsl:otherwise>rbccm-strategic-themes</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet">
        <xsl:attribute name="href"><xsl:value-of select="$CSS_PATH"/><xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if></xsl:attribute>
      </link>
    </xsl:if>

    <section data-strategic-themes="">
      <xsl:attribute name="class">
        <xsl:text>rbccm-strategic-themes rbccm-strategic-themes--outlook-2027 rbccm-strategic-themes--count-</xsl:text><xsl:value-of select="$COUNT"/>
        <xsl:if test="$LOOP = 'yes'"> rbccm-strategic-themes--loop</xsl:if>
        <xsl:if test="$NO_COUNT = 'yes'"> rbccm-strategic-themes--no-count</xsl:if>
      </xsl:attribute>
      <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/></xsl:attribute>
      <xsl:attribute name="style">--rbccm-themes-count: <xsl:value-of select="$COUNT"/>;</xsl:attribute>
      <xsl:if test="$PIN != 'yes'">
        <xsl:attribute name="data-strategic-themes-pin">no</xsl:attribute>
      </xsl:if>
      <xsl:if test="$OFFSET != ''">
        <xsl:attribute name="data-strategic-themes-offset"><xsl:value-of select="$OFFSET"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-labelledby"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <div class="rbccm-strategic-themes__stage rbccm-strategic-themes__stage--outlook-2027">
        <div class="rbccm-strategic-themes__inner rbccm-strategic-themes__inner--outlook-2027">
          <div class="rbccm-strategic-themes__main rbccm-strategic-themes__main--outlook-2027">

            <xsl:if test="$EYEBROW != '' or $HEADING != '' or $INTRO != ''">
              <header class="rbccm-strategic-themes__header rbccm-strategic-themes__header--outlook-2027">
                <xsl:if test="$EYEBROW != ''">
                  <p class="rbccm-strategic-themes__eyebrow rbccm-strategic-themes__eyebrow--outlook-2027"><xsl:value-of select="$EYEBROW"/></p>
                </xsl:if>
                <xsl:if test="$HEADING != ''">
                  <h2 class="rbccm-strategic-themes__heading rbccm-strategic-themes__heading--outlook-2027">
                    <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
                    <xsl:value-of select="$HEADING"/>
                  </h2>
                </xsl:if>
                <xsl:if test="$INTRO != ''">
                  <p class="rbccm-strategic-themes__intro rbccm-strategic-themes__intro--outlook-2027"><xsl:value-of select="$INTRO"/></p>
                </xsl:if>
              </header>
            </xsl:if>

            <!-- Numbered tabs. Printed hidden; the script shows them, so
                 a page without the script has no dead buttons. -->
            <xsl:if test="$COUNT &gt; 1">
              <div class="rbccm-strategic-themes__tabs rbccm-strategic-themes__tabs--outlook-2027" role="group" hidden="hidden" data-strategic-themes-tabs="">
                <xsl:attribute name="aria-label"><xsl:value-of select="$TABS_LABEL"/></xsl:attribute>
                <xsl:if test="$H1 = 1"><xsl:call-template name="TAB"><xsl:with-param name="n" select="1"/><xsl:with-param name="idx" select="$H1"/><xsl:with-param name="title" select="string($T1)"/></xsl:call-template></xsl:if>
                <xsl:if test="$H2 = 1"><xsl:call-template name="TAB"><xsl:with-param name="n" select="2"/><xsl:with-param name="idx" select="$H1 + $H2"/><xsl:with-param name="title" select="string($T2)"/></xsl:call-template></xsl:if>
                <xsl:if test="$H3 = 1"><xsl:call-template name="TAB"><xsl:with-param name="n" select="3"/><xsl:with-param name="idx" select="$H1 + $H2 + $H3"/><xsl:with-param name="title" select="string($T3)"/></xsl:call-template></xsl:if>
                <xsl:if test="$H4 = 1"><xsl:call-template name="TAB"><xsl:with-param name="n" select="4"/><xsl:with-param name="idx" select="$H1 + $H2 + $H3 + $H4"/><xsl:with-param name="title" select="string($T4)"/></xsl:call-template></xsl:if>
                <xsl:if test="$H5 = 1"><xsl:call-template name="TAB"><xsl:with-param name="n" select="5"/><xsl:with-param name="idx" select="$COUNT"/><xsl:with-param name="title" select="string($T5)"/></xsl:call-template></xsl:if>
              </div>
            </xsl:if>

            <ol class="rbccm-strategic-themes__list rbccm-strategic-themes__list--outlook-2027">
              <xsl:if test="$H1 = 1"><xsl:call-template name="THEME"><xsl:with-param name="n" select="1"/><xsl:with-param name="idx" select="$H1"/><xsl:with-param name="total" select="$COUNT"/><xsl:with-param name="title" select="string($T1)"/></xsl:call-template></xsl:if>
              <xsl:if test="$H2 = 1"><xsl:call-template name="THEME"><xsl:with-param name="n" select="2"/><xsl:with-param name="idx" select="$H1 + $H2"/><xsl:with-param name="total" select="$COUNT"/><xsl:with-param name="title" select="string($T2)"/></xsl:call-template></xsl:if>
              <xsl:if test="$H3 = 1"><xsl:call-template name="THEME"><xsl:with-param name="n" select="3"/><xsl:with-param name="idx" select="$H1 + $H2 + $H3"/><xsl:with-param name="total" select="$COUNT"/><xsl:with-param name="title" select="string($T3)"/></xsl:call-template></xsl:if>
              <xsl:if test="$H4 = 1"><xsl:call-template name="THEME"><xsl:with-param name="n" select="4"/><xsl:with-param name="idx" select="$H1 + $H2 + $H3 + $H4"/><xsl:with-param name="total" select="$COUNT"/><xsl:with-param name="title" select="string($T4)"/></xsl:call-template></xsl:if>
              <xsl:if test="$H5 = 1"><xsl:call-template name="THEME"><xsl:with-param name="n" select="5"/><xsl:with-param name="idx" select="$COUNT"/><xsl:with-param name="total" select="$COUNT"/><xsl:with-param name="title" select="string($T5)"/></xsl:call-template></xsl:if>
            </ol>

          </div>
        </div>
      </div>
    </section>

    <xsl:if test="$JS_PATH != ''">
      <script>
        <xsl:attribute name="src">
          <xsl:value-of select="$JS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </script>
    </xsl:if>

  </xsl:template>

  <!-- One numbered tab: progress bar, number, short title. -->
  <xsl:template name="TAB">
    <xsl:param name="n"/>
    <xsl:param name="idx"/>
    <xsl:param name="title"/>
    <xsl:variable name="SHORT_RAW" select="normalize-space(//Datum[@ID=concat('Theme', $n, 'ShortTitle')])"/>
    <xsl:variable name="SHORT">
      <xsl:choose>
        <xsl:when test="$SHORT_RAW != ''"><xsl:value-of select="$SHORT_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <button type="button" class="rbccm-strategic-themes__tab rbccm-strategic-themes__tab--outlook-2027">
      <xsl:attribute name="data-strategic-themes-tab"><xsl:value-of select="$idx - 1"/></xsl:attribute>
      <span class="rbccm-strategic-themes__tab-bar rbccm-strategic-themes__tab-bar--outlook-2027"><span class="rbccm-strategic-themes__tab-fill rbccm-strategic-themes__tab-fill--outlook-2027"></span></span>
      <span class="rbccm-strategic-themes__tab-num rbccm-strategic-themes__tab-num--outlook-2027"><xsl:value-of select="format-number($idx, '00')"/></span>
      <span class="rbccm-strategic-themes__tab-title rbccm-strategic-themes__tab-title--outlook-2027"><xsl:value-of select="$SHORT"/></span>
    </button>
  </xsl:template>

  <!-- One theme. Typed fields win; otherwise the picked story's
       description and public address (/en/insights/YYYY/MM/slug) are used. The DCR wrapper element
       varies by story type, so it is wildcarded (DCR/*/field), same as
       rbccm-insight-list. -->
  <xsl:template name="THEME">
    <xsl:param name="n"/>
    <xsl:param name="idx"/>
    <xsl:param name="total"/>
    <xsl:param name="title"/>

    <xsl:variable name="UPPER" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
    <xsl:variable name="LOWER" select="'abcdefghijklmnopqrstuvwxyz'"/>

    <xsl:variable name="DCR"       select="//Datum[@ID=concat('Theme', $n, 'Story')]/DCR"/>
    <xsl:variable name="DESC_RAW"  select="//Datum[@ID=concat('Theme', $n, 'Description')]"/>
    <xsl:variable name="LINK_RAW"  select="normalize-space(//Datum[@ID=concat('Theme', $n, 'Link')])"/>
    <xsl:variable name="BTN_RAW"   select="normalize-space(//Datum[@ID=concat('Theme', $n, 'ButtonLabel')])"/>
    <xsl:variable name="BTN_DEFAULT" select="normalize-space(//Datum[@ID='ButtonLabel'])"/>
    <xsl:variable name="GRAPHIC_RAW" select="translate(normalize-space((//Datum[@ID=concat('Theme', $n, 'Graphic')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Theme', $n, 'Graphic')]/text()[last()][not(../Option[@Selected='true'])])[1]), $UPPER, $LOWER)"/>
    <xsl:variable name="CAPTION"   select="normalize-space(//Datum[@ID=concat('Theme', $n, 'GraphicCaption')])"/>
    <xsl:variable name="IMG"       select="normalize-space(//Datum[@ID=concat('Theme', $n, 'Image')]/Image/Path)"/>
    <xsl:variable name="IMG_ALT"   select="normalize-space(//Datum[@ID=concat('Theme', $n, 'Image')]/Image/Description)"/>
    <!-- How the picture behaves: graphic, graphic-link or article. -->
    <xsl:variable name="STYLE" select="translate(normalize-space((//Datum[@ID='PictureStyle']/Option[@Selected='true']/Value | //Datum[@ID='PictureStyle']/text()[last()][not(../Option[@Selected='true'])])[1]), $UPPER, $LOWER)"/>
    <!-- Article style: the picked story's image; its headline names the link. A typed
         Image wins over the story's; with no image at all the theme
         falls back to its graphic. -->
    <xsl:variable name="S_THUMB" select="normalize-space($DCR/*/thumbnail)"/>
    <xsl:variable name="S_TITLE" select="normalize-space($DCR/*/title)"/>
    <xsl:variable name="ART_IMG">
      <xsl:choose>
        <xsl:when test="$IMG != ''"><xsl:value-of select="$IMG"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_THUMB"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="ART_TITLE">
      <xsl:choose>
        <xsl:when test="$S_TITLE != ''"><xsl:value-of select="$S_TITLE"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Graphic drawn by the script; anything else means none. -->
    <xsl:variable name="GRAPHIC">
      <xsl:choose>
        <xsl:when test="$GRAPHIC_RAW = 'defense' or $GRAPHIC_RAW = 'minerals' or $GRAPHIC_RAW = 'ai' or $GRAPHIC_RAW = 'energy' or $GRAPHIC_RAW = 'canada'"><xsl:value-of select="$GRAPHIC_RAW"/></xsl:when>
        <xsl:otherwise>none</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="DESC_RAW_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$DESC_RAW"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_DESC_RAW" select="normalize-space(translate($DESC_RAW_TEXT, '&#160;', '')) != '' and normalize-space($DESC_RAW_TEXT) != '&amp;nbsp;'"/>
    <xsl:variable name="DESC">
      <xsl:choose>
        <xsl:when test="$HAS_DESC_RAW"><xsl:value-of select="$DESC_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$DCR/*/description"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="DESC_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$DESC"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_DESC" select="normalize-space(translate($DESC_TEXT, '&#160;', '')) != '' and normalize-space($DESC_TEXT) != '&amp;nbsp;'"/>

    <xsl:variable name="S_LINK">
      <!-- The story's address. Story pages publish to
           /en/insights/YYYY/MM/slug, which mirrors where the story is
           saved (templatedata/article/story/data/YYYY/MM/slug). The
           record itself only carries the internal viewer address in
           can_url (.../story.page?dcr=templatedata/...), so the clean
           address is built from that path. A story set to an External
           URL links there. -->
      <xsl:variable name="CAN" select="normalize-space($DCR/*/can_url)"/>
      <xsl:variable name="SAVED_AT" select="substring-after($CAN, 'templatedata/article/story/data/')"/>
      <xsl:choose>
        <xsl:when test="normalize-space($DCR/*/content/link) != ''"><xsl:value-of select="normalize-space($DCR/*/content/link)"/></xsl:when>
        <xsl:when test="normalize-space($DCR/*/link) != ''"><xsl:value-of select="normalize-space($DCR/*/link)"/></xsl:when>
        <xsl:when test="$SAVED_AT != '' and contains($SAVED_AT, '.xml')"><xsl:value-of select="concat('/en/insights/', substring-before($SAVED_AT, '.xml'))"/></xsl:when>
        <xsl:when test="$SAVED_AT != '' and contains($SAVED_AT, '&amp;')"><xsl:value-of select="concat('/en/insights/', substring-before($SAVED_AT, '&amp;'))"/></xsl:when>
        <xsl:when test="$SAVED_AT != ''"><xsl:value-of select="concat('/en/insights/', $SAVED_AT)"/></xsl:when>
        <xsl:when test="$CAN != '' and not(contains($CAN, 'dcr='))"><xsl:value-of select="$CAN"/></xsl:when>
        <xsl:when test="normalize-space($DCR/*/url) != ''"><xsl:value-of select="normalize-space($DCR/*/url)"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$CAN"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="LINK">
      <xsl:choose>
        <!-- A typed "#" is the placeholder the field starts with, so
             a picked story's address is used in its place. -->
        <xsl:when test="$LINK_RAW = '#' and string($S_LINK) != ''"><xsl:value-of select="$S_LINK"/></xsl:when>
        <xsl:when test="$LINK_RAW != ''"><xsl:value-of select="$LINK_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_LINK"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="BTN">
      <xsl:choose>
        <xsl:when test="$BTN_RAW != ''"><xsl:value-of select="$BTN_RAW"/></xsl:when>
        <xsl:when test="$BTN_DEFAULT != ''"><xsl:value-of select="$BTN_DEFAULT"/></xsl:when>
        <xsl:otherwise>Watch the episode</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <li class="rbccm-strategic-themes__item rbccm-strategic-themes__item--outlook-2027" data-strategic-themes-item="">
      <div class="rbccm-strategic-themes__text rbccm-strategic-themes__text--outlook-2027">
        <!-- The list already tells screen readers the position. -->
        <p class="rbccm-strategic-themes__count rbccm-strategic-themes__count--outlook-2027" aria-hidden="true">
          <span class="rbccm-strategic-themes__count-num rbccm-strategic-themes__count-num--outlook-2027"><xsl:value-of select="format-number($idx, '00')"/></span>
          <span class="rbccm-strategic-themes__count-total rbccm-strategic-themes__count-total--outlook-2027"> / <xsl:value-of select="format-number($total, '00')"/></span>
        </p>
        <h3 class="rbccm-strategic-themes__title rbccm-strategic-themes__title--outlook-2027"><xsl:value-of select="$title"/></h3>
        <xsl:if test="$HAS_DESC">
          <div class="rbccm-strategic-themes__desc rbccm-strategic-themes__desc--outlook-2027"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$DESC"/></xsl:call-template></div>
        </xsl:if>
        <!-- Button row: the theme's button, then previous, next and
             pause. The three small buttons are printed hidden and shown
             by the script, so a page without it has no dead buttons.
             Pause stops and restarts the movement in the graphic. -->
        <xsl:if test="normalize-space($LINK) != '' or $total &gt; 1">
          <div class="rbccm-strategic-themes__actions rbccm-strategic-themes__actions--outlook-2027">
          <xsl:if test="normalize-space($LINK) != ''">
            <a class="rbccm-strategic-themes__button rbccm-strategic-themes__button--outlook-2027">
              <xsl:attribute name="href"><xsl:value-of select="$LINK"/></xsl:attribute>
              <!-- Screen readers hear which theme: "Watch the episode: {title}". -->
              <xsl:attribute name="aria-label"><xsl:value-of select="concat($BTN, ': ', $title)"/></xsl:attribute>
              <span class="rbccm-strategic-themes__button-label rbccm-strategic-themes__button-label--outlook-2027"><xsl:value-of select="$BTN"/></span>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-strategic-themes__button-icon rbccm-strategic-themes__button-icon--outlook-2027" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false"><path d="M0.875 7.00006C0.875 6.88403 0.921094 6.77275 1.00314 6.69071C1.08519 6.60866 1.19647 6.56256 1.3125 6.56256H11.6314L8.87775 3.80981C8.7956 3.72766 8.74945 3.61624 8.74945 3.50006C8.74945 3.38389 8.7956 3.27247 8.87775 3.19031C8.9599 3.10816 9.07132 3.06201 9.1875 3.06201C9.30368 3.06201 9.4151 3.10816 9.49725 3.19031L12.9973 6.69031C13.038 6.73095 13.0703 6.77923 13.0924 6.83238C13.1144 6.88554 13.1258 6.94252 13.1258 7.00006C13.1258 7.05761 13.1144 7.11459 13.0924 7.16774C13.0703 7.22089 13.038 7.26917 12.9973 7.30981L9.49725 10.8098C9.4151 10.892 9.30368 10.9381 9.1875 10.9381C9.07132 10.9381 8.9599 10.892 8.87775 10.8098C8.7956 10.7277 8.74945 10.6162 8.74945 10.5001C8.74945 10.3839 8.7956 10.2725 8.87775 10.1903L11.6314 7.43756H1.3125C1.19647 7.43756 1.08519 7.39147 1.00314 7.30942C0.921094 7.22738 0.875 7.1161 0.875 7.00006Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></svg>
            </a>
          </xsl:if>
            <xsl:if test="$total &gt; 1">
              <div class="rbccm-strategic-themes__controls rbccm-strategic-themes__controls--outlook-2027" role="group" aria-label="Move between themes" hidden="hidden" data-strategic-themes-controls="">
                <button type="button" class="rbccm-strategic-themes__control rbccm-strategic-themes__control--outlook-2027 rbccm-strategic-themes__control--prev" aria-label="Previous theme" data-strategic-themes-control="prev">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-strategic-themes__control-icon rbccm-strategic-themes__control-icon--outlook-2027" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="15 5 8 12 15 19"/></svg>
                </button>
                <button type="button" class="rbccm-strategic-themes__control rbccm-strategic-themes__control--outlook-2027 rbccm-strategic-themes__control--next" aria-label="Next theme" data-strategic-themes-control="next">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-strategic-themes__control-icon rbccm-strategic-themes__control-icon--outlook-2027" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="9 5 16 12 9 19"/></svg>
                </button>
                <button type="button" class="rbccm-strategic-themes__control rbccm-strategic-themes__control--outlook-2027 rbccm-strategic-themes__control--pause" aria-label="Pause the animation" aria-pressed="false" data-strategic-themes-control="pause">
                  <!-- Ring round the button: how far through its loop the graphic is. -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-strategic-themes__control-ring rbccm-strategic-themes__control-ring--outlook-2027" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle class="rbccm-strategic-themes__control-ring-track rbccm-strategic-themes__control-ring-track--outlook-2027" cx="18" cy="18" r="17" fill="none"/><circle class="rbccm-strategic-themes__control-ring-fill rbccm-strategic-themes__control-ring-fill--outlook-2027" cx="18" cy="18" r="17" fill="none" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" data-strategic-themes-ring=""/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-strategic-themes__control-icon rbccm-strategic-themes__control-icon--outlook-2027 rbccm-strategic-themes__control-icon--pause" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="9" y1="6" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="18"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-strategic-themes__control-icon rbccm-strategic-themes__control-icon--outlook-2027 rbccm-strategic-themes__control-icon--play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </xsl:if>
          </div>
        </xsl:if>
      </div>

      <!-- The theme's picture.
           Article style (with a link and an image): the story's image
           as a link to the story.
           Otherwise an image when one is picked, or the graphic the
           script draws into the empty box. Clickable graphic style
           wraps that picture in a link to where the button goes; the
           picture is decoration, so the link stays out of the tab
           order and screen readers use the button. -->
      <xsl:variable name="IS_ARTICLE" select="$STYLE = 'article' and string($ART_IMG) != '' and normalize-space($LINK) != ''"/>
      <xsl:choose>
        <xsl:when test="$IS_ARTICLE">
          <div class="rbccm-strategic-themes__visual rbccm-strategic-themes__visual--outlook-2027 rbccm-strategic-themes__visual--article">
            <div class="rbccm-strategic-themes__slide rbccm-strategic-themes__slide--outlook-2027 rbccm-strategic-themes__slide--article">
              <a class="rbccm-strategic-themes__article rbccm-strategic-themes__article--outlook-2027">
                <xsl:attribute name="href"><xsl:value-of select="$LINK"/></xsl:attribute>
                <!-- The image is the whole link, so the story's headline is its name. -->
                <xsl:attribute name="aria-label"><xsl:value-of select="$ART_TITLE"/></xsl:attribute>
                <span class="rbccm-strategic-themes__article-media rbccm-strategic-themes__article-media--outlook-2027">
                  <img class="rbccm-strategic-themes__article-img rbccm-strategic-themes__article-img--outlook-2027" width="520" height="292" loading="lazy" decoding="async" alt="">
                    <xsl:attribute name="src"><xsl:value-of select="$ART_IMG"/></xsl:attribute>
                  </img>
                </span>
              </a>
            </div>
          </div>
        </xsl:when>
        <xsl:when test="$IMG != '' or $GRAPHIC != 'none'">
          <div class="rbccm-strategic-themes__visual rbccm-strategic-themes__visual--outlook-2027">
            <xsl:if test="$IMG = '' or $IMG_ALT = ''">
              <xsl:attribute name="aria-hidden">true</xsl:attribute>
            </xsl:if>
            <div class="rbccm-strategic-themes__slide rbccm-strategic-themes__slide--outlook-2027">
              <xsl:choose>
                <xsl:when test="$STYLE = 'graphic-link' and normalize-space($LINK) != ''">
                  <a class="rbccm-strategic-themes__visual-link rbccm-strategic-themes__visual-link--outlook-2027" tabindex="-1" aria-hidden="true">
                    <xsl:attribute name="href"><xsl:value-of select="$LINK"/></xsl:attribute>
                    <xsl:call-template name="PICTURE"><xsl:with-param name="img" select="$IMG"/><xsl:with-param name="alt" select="$IMG_ALT"/><xsl:with-param name="graphic" select="$GRAPHIC"/><xsl:with-param name="caption" select="$CAPTION"/></xsl:call-template>
                  </a>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:call-template name="PICTURE"><xsl:with-param name="img" select="$IMG"/><xsl:with-param name="alt" select="$IMG_ALT"/><xsl:with-param name="graphic" select="$GRAPHIC"/><xsl:with-param name="caption" select="$CAPTION"/></xsl:call-template>
                </xsl:otherwise>
              </xsl:choose>
            </div>
          </div>
        </xsl:when>
      </xsl:choose>
    </li>
  </xsl:template>

  <!-- A theme's image, or the empty box its graphic is drawn into. -->
  <xsl:template name="PICTURE">
    <xsl:param name="img"/>
    <xsl:param name="alt"/>
    <xsl:param name="graphic"/>
    <xsl:param name="caption"/>
    <xsl:choose>
      <xsl:when test="$img != ''">
        <img class="rbccm-strategic-themes__image rbccm-strategic-themes__image--outlook-2027" width="520" height="520" loading="lazy" decoding="async">
          <xsl:attribute name="src"><xsl:value-of select="$img"/></xsl:attribute>
          <xsl:attribute name="alt"><xsl:value-of select="$alt"/></xsl:attribute>
        </img>
      </xsl:when>
      <xsl:otherwise>
        <div>
          <xsl:attribute name="class"><xsl:text>rbccm-strategic-themes__graphic rbccm-strategic-themes__graphic--outlook-2027 rbccm-strategic-themes__graphic--</xsl:text><xsl:value-of select="$graphic"/></xsl:attribute>
          <xsl:attribute name="data-strategic-themes-graphic"><xsl:value-of select="$graphic"/></xsl:attribute>
          <xsl:if test="$caption != ''">
            <xsl:attribute name="data-strategic-themes-caption"><xsl:value-of select="$caption"/></xsl:attribute>
          </xsl:if>
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
