<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: Insight Cards :: outlook-2027

    A section of story cards for the 2027 Outlook page: eyebrow, heading
    and intro, then up to five stories. One skin covers Featured
    insight, Macro views, Capital Markets perspectives and Latest
    insights; each is its own instance with its own Layout and Theme.

    Layout "cards": the number of stories sets the layout. One story is
    a wide card (image left, text right); two, three or four sit in
    columns. Layout "featured": Story 1 is the large featured story.
    With no other stories its text sits beside the image; with one or
    two more they stack as cards beside it; with three or four more
    they become the "Also selected" rows.

    Each story can be picked with its Story field (TeamSite's article
    picker): title, summary, image and link then come from the story.
    Typed fields override the picked story. A story hides when it has
    no title (typed or picked).

    Every story is printed into the page here. The script only adds the
    share popup and the filter pills, and both stay hidden without it.

    Every element carries the outlook-2027 modifier. Reads
    rbccm-insight-cards-properties.xml.
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

  <!-- A typed label with a middle dot in it, e.g. "Read (dot) 5 min
       read". TeamSite hands the dot's character code over as plain
       text (the five characters and-hash-1-8-3 plus the semicolon), so
       it would print as code. Each one is turned back into the dot. -->
  <xsl:template name="rbccmDot">
    <xsl:param name="s"/>
    <xsl:choose>
      <xsl:when test="contains($s, '&amp;#183;')">
        <xsl:value-of select="substring-before($s, '&amp;#183;')"/>
        <xsl:text>&#183;</xsl:text>
        <xsl:call-template name="rbccmDot"><xsl:with-param name="s" select="substring-after($s, '&amp;#183;')"/></xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($s, '&amp;middot;')">
        <xsl:value-of select="substring-before($s, '&amp;middot;')"/>
        <xsl:text>&#183;</xsl:text>
        <xsl:call-template name="rbccmDot"><xsl:with-param name="s" select="substring-after($s, '&amp;middot;')"/></xsl:call-template>
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

  <!-- ===== Where the stories come from =====
       Stories are a list in the component's data: one "Story" group
       per story, added with the list's own add button, each with a
       story picker and the typed fields. Only stories that end up with
       a title count (typed, or from the picked story), in the order
       they are listed; the first five show.

       Copies of the component saved before the list existed keep their
       five fixed slots (Item1... to Item5...). Those are read when the
       list has no story with a title, so nothing saved goes blank.

       Inside a list TeamSite can drop a field's ID, so each field is
       matched on its ID or on the first words of its label. The labels
       in the properties file must keep starting with those words. -->
  <xsl:variable name="STORY_LIST" select="//Group[@ID='Story' or @Name='Story'][
        normalize-space(Datum[@ID='Title' or starts-with(@Name, 'Title')]) != ''
        or normalize-space(Datum[@ID='Story' or starts-with(@Name, 'Pick the story')]/DCR/*/summarytitle) != ''
        or normalize-space(Datum[@ID='Story' or starts-with(@Name, 'Pick the story')]/DCR/*/title) != '']"/>

  <!-- One typed field of story n, as text (used for the filter pills). -->
  <xsl:template name="itemText">
    <xsl:param name="n"/>
    <xsl:param name="field"/>
    <xsl:param name="label"/>
    <xsl:variable name="SRC" select="$STORY_LIST[position() = number($n)]/Datum | //Datum[not($STORY_LIST)][starts-with(@ID, concat('Item', $n))]"/>
    <xsl:value-of select="normalize-space($SRC[@ID=concat('Item', $n, $field) or @ID=$field or starts-with(@Name, $label)])"/>
  </xsl:template>

  <!-- A story's title. The picked story's (its short tile title when
       it has one, else its headline) and the typed one; which wins is
       the StoryPriority field, and the other fills in when it is blank. -->
  <xsl:template name="itemTitle">
    <xsl:param name="n"/>
    <xsl:variable name="SRC" select="$STORY_LIST[position() = number($n)]/Datum | //Datum[not($STORY_LIST)][starts-with(@ID, concat('Item', $n))]"/>
    <xsl:variable name="typed" select="normalize-space($SRC[@ID=concat('Item', $n, 'Title') or @ID='Title' or starts-with(@Name, 'Title')])"/>
    <xsl:variable name="record" select="$SRC[@ID=concat('Item', $n, 'Story') or @ID='Story' or starts-with(@Name, 'Pick the story')]/DCR"/>
    <xsl:variable name="storyFirst" select="normalize-space(//Datum[@ID='StoryPriority']/text()[last()]) != 'typed'"/>
    <xsl:variable name="picked">
      <xsl:choose>
        <xsl:when test="normalize-space($record/*/summarytitle) != ''"><xsl:value-of select="normalize-space($record/*/summarytitle)"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($record/*/title)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$storyFirst and string($picked) != ''"><xsl:value-of select="$picked"/></xsl:when>
      <xsl:when test="$typed != ''"><xsl:value-of select="$typed"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="$picked"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Icons. -->
  <xsl:template name="iconArrow">
    <xsl:param name="class"/>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <xsl:attribute name="class"><xsl:value-of select="$class"/></xsl:attribute>
      <path d="M0.875 7.00006C0.875 6.88403 0.921094 6.77275 1.00314 6.69071C1.08519 6.60866 1.19647 6.56256 1.3125 6.56256H11.6314L8.87775 3.80981C8.7956 3.72766 8.74945 3.61624 8.74945 3.50006C8.74945 3.38389 8.7956 3.27247 8.87775 3.19031C8.9599 3.10816 9.07132 3.06201 9.1875 3.06201C9.30368 3.06201 9.4151 3.10816 9.49725 3.19031L12.9973 6.69031C13.038 6.73095 13.0703 6.77923 13.0924 6.83238C13.1144 6.88554 13.1258 6.94252 13.1258 7.00006C13.1258 7.05761 13.1144 7.11459 13.0924 7.16774C13.0703 7.22089 13.038 7.26917 12.9973 7.30981L9.49725 10.8098C9.4151 10.892 9.30368 10.9381 9.1875 10.9381C9.07132 10.9381 8.9599 10.892 8.87775 10.8098C8.7956 10.7277 8.74945 10.6162 8.74945 10.5001C8.74945 10.3839 8.7956 10.2725 8.87775 10.1903L11.6314 7.43756H1.3125C1.19647 7.43756 1.08519 7.39147 1.00314 7.30942C0.921094 7.22738 0.875 7.1161 0.875 7.00006Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/>
    </svg>
  </xsl:template>

  <xsl:template name="iconShare">
    <xsl:param name="class"/>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <xsl:attribute name="class"><xsl:value-of select="$class"/></xsl:attribute>
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  </xsl:template>

  <!-- Type icon on the image: play (video), headphones (podcast),
       open book (article). -->
  <xsl:template name="iconType">
    <xsl:param name="type"/>
    <xsl:choose>
      <xsl:when test="$type = 'video'">
        <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__card-type-icon rbccm-insight-cards__card-type-icon--outlook-2027" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
      </xsl:when>
      <xsl:when test="$type = 'podcast'">
        <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__card-type-icon rbccm-insight-cards__card-type-icon--outlook-2027" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
      </xsl:when>
      <xsl:otherwise>
        <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__card-type-icon rbccm-insight-cards__card-type-icon--outlook-2027" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="UPPER" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
    <xsl:variable name="LOWER" select="'abcdefghijklmnopqrstuvwxyz'"/>

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID'])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel'])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath'])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(//Datum[@ID='JsPath'])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion'])"/>

    <!-- Dropdowns: the chosen value is the Datum's last text node. -->
    <xsl:variable name="LAYOUT_RAW"  select="translate(normalize-space(//Datum[@ID='Layout']/text()[last()]), $UPPER, $LOWER)"/>
    <xsl:variable name="THEME_RAW"   select="translate(normalize-space(//Datum[@ID='Theme']/text()[last()]), $UPPER, $LOWER)"/>
    <xsl:variable name="SHARE_RAW"   select="translate(normalize-space(//Datum[@ID='ShowShare']/text()[last()]), $UPPER, $LOWER)"/>
    <xsl:variable name="FILTERS_RAW" select="translate(normalize-space(//Datum[@ID='ShowFilters']/text()[last()]), $UPPER, $LOWER)"/>
    <xsl:variable name="MOBILE_RAW"  select="translate(normalize-space(//Datum[@ID='MobileLayout']/text()[last()]), $UPPER, $LOWER)"/>

    <xsl:variable name="LAYOUT">
      <xsl:choose>
        <xsl:when test="$LAYOUT_RAW = 'featured'">featured</xsl:when>
        <xsl:otherwise>cards</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="THEME">
      <xsl:choose>
        <xsl:when test="$THEME_RAW = 'tint'">tint</xsl:when>
        <xsl:when test="$THEME_RAW = 'dark'">dark</xsl:when>
        <xsl:otherwise>white</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SHOW_SHARE"   select="$SHARE_RAW != 'no'"/>
    <xsl:variable name="SHOW_FILTERS" select="$FILTERS_RAW = 'yes'"/>
    <!-- Phones: stack the stories (default), or one row to swipe. -->
    <xsl:variable name="MOBILE">
      <xsl:choose>
        <xsl:when test="$MOBILE_RAW = 'carousel-peek'">carousel-peek</xsl:when>
        <xsl:when test="$MOBILE_RAW = 'carousel'">carousel</xsl:when>
        <xsl:otherwise>stack</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="EYEBROW"   select="normalize-space(//Datum[@ID='Eyebrow'])"/>
    <xsl:variable name="HEADING"   select="normalize-space(//Datum[@ID='SectionHeading'])"/>
    <xsl:variable name="INTRO"     select="//Datum[@ID='SectionIntro']"/>
    <xsl:variable name="INTRO_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$INTRO"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_INTRO" select="normalize-space(translate($INTRO_TEXT, '&#160;', '')) != '' and normalize-space($INTRO_TEXT) != '&amp;nbsp;'"/>
    <xsl:variable name="HEADER_BTN_LABEL" select="normalize-space(//Datum[@ID='HeaderButtonLabel'])"/>
    <xsl:variable name="HEADER_BTN_LINK"  select="normalize-space(//Datum[@ID='HeaderButtonLink'])"/>

    <xsl:variable name="FILTER_ALL_RAW" select="normalize-space(//Datum[@ID='FilterAllLabel'])"/>
    <xsl:variable name="FILTER_ALL">
      <xsl:choose>
        <xsl:when test="$FILTER_ALL_RAW != ''"><xsl:value-of select="$FILTER_ALL_RAW"/></xsl:when>
        <xsl:otherwise>All</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SIDE_HEADING"   select="normalize-space(//Datum[@ID='SideHeading'])"/>
    <xsl:variable name="NO_IMAGE_LABEL" select="normalize-space(//Datum[@ID='NoImageLabel'])"/>

    <xsl:variable name="NOTIFY_EYEBROW" select="normalize-space(//Datum[@ID='NotifyEyebrow'])"/>
    <xsl:variable name="NOTIFY_TEXT"    select="normalize-space(//Datum[@ID='NotifyText'])"/>
    <xsl:variable name="NOTIFY_BTN"     select="normalize-space(//Datum[@ID='NotifyButtonLabel'])"/>
    <xsl:variable name="NOTIFY_LINK"    select="normalize-space(//Datum[@ID='NotifyLink'])"/>

    <!-- Which stories have a title, and how many. -->
    <xsl:variable name="T1"><xsl:call-template name="itemTitle"><xsl:with-param name="n" select="1"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T2"><xsl:call-template name="itemTitle"><xsl:with-param name="n" select="2"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T3"><xsl:call-template name="itemTitle"><xsl:with-param name="n" select="3"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T4"><xsl:call-template name="itemTitle"><xsl:with-param name="n" select="4"/></xsl:call-template></xsl:variable>
    <xsl:variable name="T5"><xsl:call-template name="itemTitle"><xsl:with-param name="n" select="5"/></xsl:call-template></xsl:variable>
    <xsl:variable name="H1" select="string($T1) != ''"/>
    <xsl:variable name="H2" select="string($T2) != ''"/>
    <xsl:variable name="H3" select="string($T3) != ''"/>
    <xsl:variable name="H4" select="string($T4) != ''"/>
    <xsl:variable name="H5" select="string($T5) != ''"/>
    <xsl:variable name="COUNT" select="number($H1) + number($H2) + number($H3) + number($H4) + number($H5)"/>
    <!-- Featured layout: stories beside the featured one (Story 1). -->
    <xsl:variable name="SIDE_COUNT" select="number($H2) + number($H3) + number($H4) + number($H5)"/>
    <xsl:variable name="SIDE_ROLE">
      <xsl:choose>
        <xsl:when test="$SIDE_COUNT &gt; 2">side-row</xsl:when>
        <xsl:otherwise>side-card</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Filter pills: each story's filter label, blank for hidden
         stories. A pill prints once per distinct label. -->
    <xsl:variable name="G1"><xsl:if test="$H1"><xsl:call-template name="itemText"><xsl:with-param name="n" select="1"/><xsl:with-param name="field" select="'Filter'"/><xsl:with-param name="label" select="'Filter'"/></xsl:call-template></xsl:if></xsl:variable>
    <xsl:variable name="G2"><xsl:if test="$H2"><xsl:call-template name="itemText"><xsl:with-param name="n" select="2"/><xsl:with-param name="field" select="'Filter'"/><xsl:with-param name="label" select="'Filter'"/></xsl:call-template></xsl:if></xsl:variable>
    <xsl:variable name="G3"><xsl:if test="$H3"><xsl:call-template name="itemText"><xsl:with-param name="n" select="3"/><xsl:with-param name="field" select="'Filter'"/><xsl:with-param name="label" select="'Filter'"/></xsl:call-template></xsl:if></xsl:variable>
    <xsl:variable name="G4"><xsl:if test="$H4"><xsl:call-template name="itemText"><xsl:with-param name="n" select="4"/><xsl:with-param name="field" select="'Filter'"/><xsl:with-param name="label" select="'Filter'"/></xsl:call-template></xsl:if></xsl:variable>
    <xsl:variable name="G5"><xsl:if test="$H5"><xsl:call-template name="itemText"><xsl:with-param name="n" select="5"/><xsl:with-param name="field" select="'Filter'"/><xsl:with-param name="label" select="'Filter'"/></xsl:call-template></xsl:if></xsl:variable>
    <xsl:variable name="HAS_FILTERS" select="$SHOW_FILTERS and $LAYOUT = 'cards' and $COUNT &gt; 1 and concat($G1, $G2, $G3, $G4, $G5) != ''"/>
    <!-- Swipe row on phones: Cards layout with two or more stories. -->
    <xsl:variable name="HAS_CAROUSEL" select="$MOBILE != 'stack' and $LAYOUT = 'cards' and $COUNT &gt; 1"/>

    <xsl:variable name="ID_BASE">
      <xsl:choose>
        <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/></xsl:when>
        <xsl:otherwise>rbccm-insight-cards</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet">
        <xsl:attribute name="href"><xsl:value-of select="$CSS_PATH"/><xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if></xsl:attribute>
      </link>
    </xsl:if>

    <section data-insight-cards="">
      <xsl:attribute name="class">
        <xsl:text>rbccm-insight-cards rbccm-insight-cards--outlook-2027 rbccm-insight-cards--</xsl:text><xsl:value-of select="$LAYOUT"/>
        <xsl:text> rbccm-insight-cards--</xsl:text><xsl:value-of select="$THEME"/>
        <xsl:text> rbccm-insight-cards--count-</xsl:text><xsl:value-of select="$COUNT"/>
        <xsl:if test="$LAYOUT = 'featured'">
          <xsl:choose>
            <xsl:when test="$SIDE_COUNT = 0 or not($H1)"> rbccm-insight-cards--feature-only</xsl:when>
            <xsl:when test="$SIDE_COUNT &gt; 2"> rbccm-insight-cards--side-rows</xsl:when>
            <xsl:otherwise> rbccm-insight-cards--side-cards</xsl:otherwise>
          </xsl:choose>
        </xsl:if>
        <xsl:if test="$HAS_CAROUSEL"> rbccm-insight-cards--mobile-carousel</xsl:if>
        <xsl:if test="$HAS_CAROUSEL and $MOBILE = 'carousel-peek'"> rbccm-insight-cards--mobile-peek</xsl:if>
      </xsl:attribute>
      <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/></xsl:attribute>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-labelledby"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <div class="rbccm-insight-cards__inner rbccm-insight-cards__inner--outlook-2027">

        <xsl:if test="$EYEBROW != '' or $HEADING != '' or $HAS_INTRO or ($HEADER_BTN_LABEL != '' and $HEADER_BTN_LINK != '')">
          <header class="rbccm-insight-cards__header rbccm-insight-cards__header--outlook-2027">
            <div class="rbccm-insight-cards__header-text rbccm-insight-cards__header-text--outlook-2027">
              <xsl:if test="$EYEBROW != ''">
                <p class="rbccm-insight-cards__eyebrow rbccm-insight-cards__eyebrow--outlook-2027" data-animate="fadeInUp"><xsl:value-of select="$EYEBROW"/></p>
              </xsl:if>
              <xsl:if test="$HEADING != ''">
                <h2 class="rbccm-insight-cards__heading rbccm-insight-cards__heading--outlook-2027" data-animate="fadeInUp" data-animate-delay="80">
                  <xsl:attribute name="id"><xsl:value-of select="$ID_BASE"/>-heading</xsl:attribute>
                  <xsl:value-of select="$HEADING"/>
                </h2>
              </xsl:if>
              <xsl:if test="$HAS_INTRO">
                <div class="rbccm-insight-cards__intro rbccm-insight-cards__intro--outlook-2027" data-animate="fadeInUp" data-animate-delay="160"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$INTRO"/></xsl:call-template></div>
              </xsl:if>
            </div>
            <xsl:if test="$HEADER_BTN_LABEL != '' and $HEADER_BTN_LINK != ''">
              <a class="rbccm-insight-cards__header-button rbccm-insight-cards__header-button--outlook-2027" data-animate="fadeInUp" data-animate-delay="160">
                <xsl:attribute name="href"><xsl:value-of select="$HEADER_BTN_LINK"/></xsl:attribute>
                <span class="rbccm-insight-cards__header-button-label rbccm-insight-cards__header-button-label--outlook-2027"><xsl:value-of select="$HEADER_BTN_LABEL"/></span>
                <xsl:call-template name="iconArrow"><xsl:with-param name="class" select="'rbccm-insight-cards__header-button-icon rbccm-insight-cards__header-button-icon--outlook-2027'"/></xsl:call-template>
              </a>
            </xsl:if>
          </header>
        </xsl:if>

        <!-- Filter pills. Printed hidden; the script shows them, so a
             page without the script has no dead buttons. -->
        <xsl:if test="$HAS_FILTERS">
          <div class="rbccm-insight-cards__filters rbccm-insight-cards__filters--outlook-2027" role="group" hidden="hidden" data-insight-filters="">
            <xsl:attribute name="aria-label">
              <xsl:choose>
                <xsl:when test="$HEADING != ''"><xsl:value-of select="concat('Filter: ', $HEADING)"/></xsl:when>
                <xsl:otherwise>Filter</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            <button type="button" class="rbccm-insight-cards__filter rbccm-insight-cards__filter--outlook-2027 rbccm-insight-cards__filter--active" aria-pressed="true" data-insight-filter=""><xsl:value-of select="$FILTER_ALL"/></button>
            <xsl:call-template name="CHIP"><xsl:with-param name="tag" select="string($G1)"/><xsl:with-param name="prev" select="'|'"/></xsl:call-template>
            <xsl:call-template name="CHIP"><xsl:with-param name="tag" select="string($G2)"/><xsl:with-param name="prev" select="concat('|', $G1, '|')"/></xsl:call-template>
            <xsl:call-template name="CHIP"><xsl:with-param name="tag" select="string($G3)"/><xsl:with-param name="prev" select="concat('|', $G1, '|', $G2, '|')"/></xsl:call-template>
            <xsl:call-template name="CHIP"><xsl:with-param name="tag" select="string($G4)"/><xsl:with-param name="prev" select="concat('|', $G1, '|', $G2, '|', $G3, '|')"/></xsl:call-template>
            <xsl:call-template name="CHIP"><xsl:with-param name="tag" select="string($G5)"/><xsl:with-param name="prev" select="concat('|', $G1, '|', $G2, '|', $G3, '|', $G4, '|')"/></xsl:call-template>
          </div>
          <p class="rbccm-insight-cards__status rbccm-insight-cards__status--outlook-2027" role="status" aria-live="polite" data-insight-status=""></p>
        </xsl:if>

        <xsl:choose>

          <!-- Featured: Story 1 large, the others beside it. -->
          <xsl:when test="$LAYOUT = 'featured'">
            <div class="rbccm-insight-cards__layout rbccm-insight-cards__layout--outlook-2027">
              <xsl:call-template name="CARD">
                <xsl:with-param name="n" select="1"/>
                <xsl:with-param name="role" select="'feature'"/>
                <xsl:with-param name="showShare" select="$SHOW_SHARE"/>
                <xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/>
              </xsl:call-template>
              <xsl:if test="$SIDE_COUNT &gt; 0">
                <div class="rbccm-insight-cards__side rbccm-insight-cards__side--outlook-2027">
                  <xsl:if test="$SIDE_ROLE = 'side-row' and $SIDE_HEADING != ''">
                    <p class="rbccm-insight-cards__side-heading rbccm-insight-cards__side-heading--outlook-2027" data-animate="fadeInUp"><xsl:value-of select="$SIDE_HEADING"/></p>
                  </xsl:if>
                  <ul class="rbccm-insight-cards__list rbccm-insight-cards__list--outlook-2027">
                    <xsl:call-template name="CARD"><xsl:with-param name="n" select="2"/><xsl:with-param name="role" select="$SIDE_ROLE"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
                    <xsl:call-template name="CARD"><xsl:with-param name="n" select="3"/><xsl:with-param name="role" select="$SIDE_ROLE"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
                    <xsl:call-template name="CARD"><xsl:with-param name="n" select="4"/><xsl:with-param name="role" select="$SIDE_ROLE"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
                    <xsl:call-template name="CARD"><xsl:with-param name="n" select="5"/><xsl:with-param name="role" select="$SIDE_ROLE"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
                  </ul>
                </div>
              </xsl:if>
            </div>
          </xsl:when>

          <!-- Cards: one wide card, or two to four columns. -->
          <xsl:otherwise>
            <ul class="rbccm-insight-cards__list rbccm-insight-cards__list--outlook-2027">
              <xsl:if test="$HAS_CAROUSEL"><xsl:attribute name="data-insight-carousel"></xsl:attribute></xsl:if>
              <xsl:call-template name="CARD"><xsl:with-param name="n" select="1"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
              <xsl:call-template name="CARD"><xsl:with-param name="n" select="2"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
              <xsl:call-template name="CARD"><xsl:with-param name="n" select="3"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
              <xsl:call-template name="CARD"><xsl:with-param name="n" select="4"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
              <xsl:call-template name="CARD"><xsl:with-param name="n" select="5"/><xsl:with-param name="showShare" select="$SHOW_SHARE"/><xsl:with-param name="noImageLabel" select="$NO_IMAGE_LABEL"/></xsl:call-template>
            </ul>
            <!-- Phones, swipe row only: arrows and dots. Printed hidden;
                 the script adds one dot per story and shows them, so a
                 page without the script has no dead buttons. -->
            <xsl:if test="$HAS_CAROUSEL">
              <div class="rbccm-insight-cards__nav rbccm-insight-cards__nav--outlook-2027" role="group" hidden="hidden" data-insight-carousel-nav="">
                <xsl:attribute name="aria-label">
                  <xsl:choose>
                    <xsl:when test="$HEADING != ''"><xsl:value-of select="concat('Stories: ', $HEADING)"/></xsl:when>
                    <xsl:otherwise>Stories</xsl:otherwise>
                  </xsl:choose>
                </xsl:attribute>
                <button type="button" class="rbccm-insight-cards__nav-arrow rbccm-insight-cards__nav-arrow--outlook-2027 rbccm-insight-cards__nav-arrow--prev" aria-label="Previous story" data-insight-carousel-step="-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__nav-arrow-icon rbccm-insight-cards__nav-arrow-icon--outlook-2027" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="15 4 7 12 15 20"/></svg>
                </button>
                <ol class="rbccm-insight-cards__nav-dots rbccm-insight-cards__nav-dots--outlook-2027" data-insight-carousel-dots=""></ol>
                <button type="button" class="rbccm-insight-cards__nav-arrow rbccm-insight-cards__nav-arrow--outlook-2027 rbccm-insight-cards__nav-arrow--next" aria-label="Next story" data-insight-carousel-step="1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__nav-arrow-icon rbccm-insight-cards__nav-arrow-icon--outlook-2027" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="9 4 17 12 9 20"/></svg>
                </button>
              </div>
            </xsl:if>
          </xsl:otherwise>

        </xsl:choose>

        <!-- The header button again, under the stories. On phones this
             one shows and the one in the header is hidden, so the
             button is read and reached in the order it appears. -->
        <xsl:if test="$HEADER_BTN_LABEL != '' and $HEADER_BTN_LINK != ''">
          <a class="rbccm-insight-cards__header-button rbccm-insight-cards__header-button--outlook-2027 rbccm-insight-cards__header-button--below">
            <xsl:attribute name="href"><xsl:value-of select="$HEADER_BTN_LINK"/></xsl:attribute>
            <span class="rbccm-insight-cards__header-button-label rbccm-insight-cards__header-button-label--outlook-2027"><xsl:value-of select="$HEADER_BTN_LABEL"/></span>
            <xsl:call-template name="iconArrow"><xsl:with-param name="class" select="'rbccm-insight-cards__header-button-icon rbccm-insight-cards__header-button-icon--outlook-2027'"/></xsl:call-template>
          </a>
        </xsl:if>

        <!-- Notification strip under the stories. -->
        <xsl:if test="$NOTIFY_EYEBROW != '' or $NOTIFY_TEXT != ''">
          <div class="rbccm-insight-cards__notify rbccm-insight-cards__notify--outlook-2027" data-animate="fadeInUp">
            <div class="rbccm-insight-cards__notify-text rbccm-insight-cards__notify-text--outlook-2027">
              <xsl:if test="$NOTIFY_EYEBROW != ''">
                <p class="rbccm-insight-cards__notify-eyebrow rbccm-insight-cards__notify-eyebrow--outlook-2027"><xsl:value-of select="$NOTIFY_EYEBROW"/></p>
              </xsl:if>
              <xsl:if test="$NOTIFY_TEXT != ''">
                <p class="rbccm-insight-cards__notify-title rbccm-insight-cards__notify-title--outlook-2027"><xsl:value-of select="$NOTIFY_TEXT"/></p>
              </xsl:if>
            </div>
            <xsl:if test="$NOTIFY_BTN != '' and $NOTIFY_LINK != ''">
              <a class="rbccm-insight-cards__notify-button rbccm-insight-cards__notify-button--outlook-2027">
                <xsl:attribute name="href"><xsl:value-of select="$NOTIFY_LINK"/></xsl:attribute>
                <span class="rbccm-insight-cards__notify-button-label rbccm-insight-cards__notify-button-label--outlook-2027"><xsl:value-of select="$NOTIFY_BTN"/></span>
                <xsl:call-template name="iconArrow"><xsl:with-param name="class" select="'rbccm-insight-cards__notify-button-icon rbccm-insight-cards__notify-button-icon--outlook-2027'"/></xsl:call-template>
              </a>
            </xsl:if>
          </div>
        </xsl:if>

        <!-- Share popup. One per section, hidden; the script moves it
             next to the share button that was pressed and fills in the
             links for that story. -->
        <xsl:if test="$SHOW_SHARE and $COUNT &gt; 0">
          <div class="rbccm-insight-cards__share rbccm-insight-cards__share--outlook-2027" role="dialog" aria-label="Share" hidden="hidden" data-insight-share-panel="">
            <div class="rbccm-insight-cards__share-head rbccm-insight-cards__share-head--outlook-2027">
              <p class="rbccm-insight-cards__share-title rbccm-insight-cards__share-title--outlook-2027">Share</p>
              <button type="button" class="rbccm-insight-cards__share-close rbccm-insight-cards__share-close--outlook-2027" aria-label="Close share options" data-insight-share-close="">
                <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__share-close-icon rbccm-insight-cards__share-close-icon--outlook-2027" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
            </div>
            <ul class="rbccm-insight-cards__share-list rbccm-insight-cards__share-list--outlook-2027">
              <li class="rbccm-insight-cards__share-item rbccm-insight-cards__share-item--outlook-2027">
                <button type="button" class="rbccm-insight-cards__share-option rbccm-insight-cards__share-option--outlook-2027" data-insight-share-to="copy">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__share-option-icon rbccm-insight-cards__share-option-icon--outlook-2027" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <span class="rbccm-insight-cards__share-option-label rbccm-insight-cards__share-option-label--outlook-2027">Copy link</span>
                </button>
              </li>
              <li class="rbccm-insight-cards__share-item rbccm-insight-cards__share-item--outlook-2027">
                <a class="rbccm-insight-cards__share-option rbccm-insight-cards__share-option--outlook-2027" href="#" target="_blank" rel="noopener noreferrer" data-insight-share-to="x">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__share-option-icon rbccm-insight-cards__share-option-icon--outlook-2027" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span class="rbccm-insight-cards__share-option-label rbccm-insight-cards__share-option-label--outlook-2027">X (Twitter)</span>
                </a>
              </li>
              <li class="rbccm-insight-cards__share-item rbccm-insight-cards__share-item--outlook-2027">
                <a class="rbccm-insight-cards__share-option rbccm-insight-cards__share-option--outlook-2027" href="#" target="_blank" rel="noopener noreferrer" data-insight-share-to="linkedin">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__share-option-icon rbccm-insight-cards__share-option-icon--outlook-2027" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
                  <span class="rbccm-insight-cards__share-option-label rbccm-insight-cards__share-option-label--outlook-2027">LinkedIn</span>
                </a>
              </li>
              <li class="rbccm-insight-cards__share-item rbccm-insight-cards__share-item--outlook-2027">
                <a class="rbccm-insight-cards__share-option rbccm-insight-cards__share-option--outlook-2027" href="#" data-insight-share-to="email">
                  <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-insight-cards__share-option-icon rbccm-insight-cards__share-option-icon--outlook-2027" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span class="rbccm-insight-cards__share-option-label rbccm-insight-cards__share-option-label--outlook-2027">Email</span>
                </a>
              </li>
              <!-- Shown only where the device has its own share sheet. -->
              <li class="rbccm-insight-cards__share-item rbccm-insight-cards__share-item--outlook-2027" hidden="hidden" data-insight-share-native="">
                <button type="button" class="rbccm-insight-cards__share-option rbccm-insight-cards__share-option--outlook-2027" data-insight-share-to="native">
                  <xsl:call-template name="iconShare"><xsl:with-param name="class" select="'rbccm-insight-cards__share-option-icon rbccm-insight-cards__share-option-icon--outlook-2027'"/></xsl:call-template>
                  <span class="rbccm-insight-cards__share-option-label rbccm-insight-cards__share-option-label--outlook-2027">More apps&#8230;</span>
                </button>
              </li>
            </ul>
            <p class="rbccm-insight-cards__share-flash rbccm-insight-cards__share-flash--outlook-2027" role="status" aria-live="polite" data-insight-share-flash=""></p>
          </div>
        </xsl:if>

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

  <!-- One filter pill, skipped when blank or already printed. -->
  <xsl:template name="CHIP">
    <xsl:param name="tag"/>
    <xsl:param name="prev"/>
    <xsl:if test="$tag != '' and not(contains($prev, concat('|', $tag, '|')))">
      <button type="button" class="rbccm-insight-cards__filter rbccm-insight-cards__filter--outlook-2027" aria-pressed="false">
        <xsl:attribute name="data-insight-filter"><xsl:value-of select="$tag"/></xsl:attribute>
        <xsl:value-of select="$tag"/>
      </button>
    </xsl:if>
  </xsl:template>

  <!-- One story. Each piece below can come from the picked story (the
       article record) or from a typed field. Both are read on the
       server, so the card is complete in the page source.

       StoryPriority decides which wins:
         story (default)  the picked story's value is used; the typed
                          field shows when no story is picked, or when
                          the story has nothing for that piece
         typed            a typed field wins; leave it blank to use the
                          story

         title          summarytitle, else title
         summary        summarydescription, else description (featured
                        story only; small cards show a typed summary)
         image          thumbnail
         link           the story's public address,
                        /en/insights/YYYY/MM/slug, built from where the
                        story is saved; or its External URL when it has
                        one. The share popup shares the same address.
         type           story_type: text = article, audio = podcast,
                        video = video
         meta line      the first author's name
         date           publish_date (YYYY-MM-DD; 0000-00-00 is ignored)
         action label   Read / Listen / Watch, plus the story's
                        time_to_read or time_to_watch ("Read . 5 min")

       The pill, category, filter label and speaker are always typed.
       The DCR wrapper element varies by story type, so it is wildcarded
       (DCR/*/field), same as rbccm-insight-list.

       role: card (default), feature, side-card or side-row. The markup
       is the same for all four; the styles lay each one out. -->
  <xsl:template name="CARD">
    <xsl:param name="n"/>
    <xsl:param name="role" select="'card'"/>
    <xsl:param name="showShare" select="true()"/>
    <xsl:param name="noImageLabel"/>

    <xsl:variable name="UPPER" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
    <xsl:variable name="LOWER" select="'abcdefghijklmnopqrstuvwxyz'"/>

    <!-- This story's fields: its group in the list, or its fixed slot
         on a copy saved before the list existed. -->
    <xsl:variable name="SRC"         select="$STORY_LIST[position() = number($n)]/Datum | //Datum[not($STORY_LIST)][starts-with(@ID, concat('Item', $n))]"/>
    <xsl:variable name="DCR"         select="$SRC[@ID=concat('Item', $n, 'Story') or @ID='Story' or starts-with(@Name, 'Pick the story')]/DCR"/>
    <xsl:variable name="STORY_FIRST" select="normalize-space(//Datum[@ID='StoryPriority']/text()[last()]) != 'typed'"/>
    <xsl:variable name="HAS_STORY"   select="boolean($DCR/*)"/>
    <!-- The first author with a name (a story can carry several). -->
    <xsl:variable name="S_AUTHOR"    select="normalize-space(($DCR//author_name_new[normalize-space(.) != ''] | $DCR/*/author_name[normalize-space(.) != ''])[1])"/>
    <!-- That author's title and company, for the name on the featured
         story's image: "Chief Economist, RBC". The company is left off
         when the title already says it. -->
    <xsl:variable name="S_AUTHOR_AT"      select="($DCR//author[normalize-space(author_name_new) != ''])[1]"/>
    <xsl:variable name="S_AUTHOR_TITLE"   select="normalize-space($S_AUTHOR_AT/author_title_new)"/>
    <xsl:variable name="S_AUTHOR_COMPANY" select="normalize-space($S_AUTHOR_AT/author_company_new)"/>
    <xsl:variable name="S_AUTHOR_ROLE">
      <xsl:choose>
        <xsl:when test="$S_AUTHOR_TITLE != '' and $S_AUTHOR_COMPANY != '' and not(contains($S_AUTHOR_TITLE, $S_AUTHOR_COMPANY))"><xsl:value-of select="concat($S_AUTHOR_TITLE, ', ', $S_AUTHOR_COMPANY)"/></xsl:when>
        <xsl:when test="$S_AUTHOR_TITLE != ''"><xsl:value-of select="$S_AUTHOR_TITLE"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_AUTHOR_COMPANY"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="S_THUMB"     select="normalize-space($DCR/*/thumbnail)"/>
    <xsl:variable name="S_TYPE"      select="translate(normalize-space($DCR/*/story_type), $UPPER, $LOWER)"/>
    <xsl:variable name="S_DATE">
      <xsl:if test="not(starts-with(normalize-space($DCR/*/publish_date), '0000'))"><xsl:value-of select="normalize-space($DCR/*/publish_date)"/></xsl:if>
    </xsl:variable>
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
    <xsl:variable name="BADGE"       select="normalize-space($SRC[@ID=concat('Item', $n, 'Badge') or @ID='Badge' or starts-with(@Name, 'Pill')])"/>
    <!-- A dropdown's choice is the text after its options, or (as some
         lists save it) the option marked selected. -->
    <xsl:variable name="TYPE_AT"     select="$SRC[@ID=concat('Item', $n, 'Type') or @ID='Type' or starts-with(@Name, 'Type')]"/>
    <xsl:variable name="TYPE_PICKED">
      <xsl:choose>
        <xsl:when test="normalize-space($TYPE_AT/text()[last()]) != ''"><xsl:value-of select="normalize-space($TYPE_AT/text()[last()])"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($TYPE_AT/Option[@Selected='true']/Value)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TYPE_RAW"    select="translate(string($TYPE_PICKED), $UPPER, $LOWER)"/>
    <xsl:variable name="CATEGORY"    select="normalize-space($SRC[@ID=concat('Item', $n, 'Category') or @ID='Category' or starts-with(@Name, 'Category')])"/>
    <xsl:variable name="SUMMARY_RAW" select="$SRC[@ID=concat('Item', $n, 'Summary') or @ID='Summary' or starts-with(@Name, 'Summary')]"/>
    <xsl:variable name="META_TYPED"  select="normalize-space($SRC[@ID=concat('Item', $n, 'Meta') or @ID='Meta' or starts-with(@Name, 'Meta')])"/>
    <!-- Date: typed as YYYY-MM-DD. Shown after the meta line as
         "Oct 9, 2026" inside a time element, so the page says when the
         story was published in a form search engines read. Anything
         that is not YYYY-MM-DD is ignored. -->
    <xsl:variable name="DATE_TYPED"  select="normalize-space($SRC[@ID=concat('Item', $n, 'Date') or @ID='Date' or starts-with(@Name, 'Date')])"/>
    <xsl:variable name="DATE_RAW">
      <xsl:choose>
        <xsl:when test="$STORY_FIRST and string($S_DATE) != ''"><xsl:value-of select="$S_DATE"/></xsl:when>
        <xsl:when test="$DATE_TYPED != ''"><xsl:value-of select="$DATE_TYPED"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_DATE"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="META">
      <xsl:choose>
        <xsl:when test="$STORY_FIRST and $S_AUTHOR != ''"><xsl:value-of select="$S_AUTHOR"/></xsl:when>
        <xsl:when test="$META_TYPED != ''"><xsl:value-of select="$META_TYPED"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_AUTHOR"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="DATE" select="string($DATE_RAW)"/>
    <xsl:variable name="DATE_OK"     select="string-length($DATE) = 10 and translate($DATE, '0123456789', '') = '--' and substring($DATE, 5, 1) = '-' and substring($DATE, 8, 1) = '-' and number(substring($DATE, 6, 2)) &gt;= 1 and number(substring($DATE, 6, 2)) &lt;= 12 and number(substring($DATE, 9, 2)) &gt;= 1 and number(substring($DATE, 9, 2)) &lt;= 31"/>
    <xsl:variable name="DATE_TEXT">
      <xsl:if test="$DATE_OK">
        <xsl:value-of select="concat(substring('JanFebMarAprMayJunJulAugSepOctNovDec', (number(substring($DATE, 6, 2)) - 1) * 3 + 1, 3), ' ', number(substring($DATE, 9, 2)), ', ', substring($DATE, 1, 4))"/>
      </xsl:if>
    </xsl:variable>
    <xsl:variable name="IMG_RAW"     select="normalize-space($SRC[@ID=concat('Item', $n, 'Image') or @ID='Image' or starts-with(@Name, 'Image')]/Image/Path)"/>
    <xsl:variable name="IMG_ALT"     select="normalize-space($SRC[@ID=concat('Item', $n, 'Image') or @ID='Image' or starts-with(@Name, 'Image')]/Image/Description)"/>
    <xsl:variable name="LINK_RAW"    select="normalize-space($SRC[@ID=concat('Item', $n, 'Link') or @ID='Link' or starts-with(@Name, 'Link')])"/>
    <xsl:variable name="ACTION_RAW"  select="normalize-space($SRC[@ID=concat('Item', $n, 'ActionLabel') or @ID='ActionLabel' or starts-with(@Name, 'Action label')])"/>
    <xsl:variable name="FILTER"      select="normalize-space($SRC[@ID=concat('Item', $n, 'Filter') or @ID='Filter' or starts-with(@Name, 'Filter')])"/>
    <!-- Name and role on the image. Typed, or on the featured story
         taken from the picked story's first author (which wins follows
         the same story-first / typed-first setting as the other
         fields). When the name comes from the story so does the role,
         so the two always belong to the same person. -->
    <xsl:variable name="SPEAKER_TYPED"      select="normalize-space($SRC[@ID=concat('Item', $n, 'SpeakerName') or @ID='SpeakerName' or starts-with(@Name, 'Name on the image')])"/>
    <xsl:variable name="SPEAKER_ROLE_TYPED" select="normalize-space($SRC[@ID=concat('Item', $n, 'SpeakerRole') or @ID='SpeakerRole' or starts-with(@Name, 'Role')])"/>
    <xsl:variable name="SPEAKER_FROM_STORY" select="$role = 'feature' and $S_AUTHOR != '' and ($STORY_FIRST or $SPEAKER_TYPED = '')"/>
    <xsl:variable name="SPEAKER">
      <xsl:choose>
        <xsl:when test="$SPEAKER_FROM_STORY"><xsl:value-of select="$S_AUTHOR"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$SPEAKER_TYPED"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SPEAKER_ROLE">
      <xsl:choose>
        <xsl:when test="$SPEAKER_FROM_STORY"><xsl:value-of select="$S_AUTHOR_ROLE"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$SPEAKER_ROLE_TYPED"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- The meta line under the summary leaves the author out when the
         same name is already on the image. -->
    <xsl:variable name="META_TEXT">
      <xsl:if test="not(string($SPEAKER) != '' and string($SPEAKER) = string($META))"><xsl:value-of select="$META"/></xsl:if>
    </xsl:variable>

    <xsl:variable name="TITLE"><xsl:call-template name="itemTitle"><xsl:with-param name="n" select="$n"/></xsl:call-template></xsl:variable>

    <!-- Type: video, podcast or article sets the icon on the image and
         the default action label. Anything else: no icon. Choosing
         None always leaves the icon off, even when a picked story has
         a type of its own (which still sets the action label). -->
    <xsl:variable name="TYPE_SRC">
      <xsl:choose>
        <xsl:when test="($STORY_FIRST and $S_TYPE != '') or $TYPE_RAW = '' or $TYPE_RAW = 'auto'"><xsl:value-of select="$S_TYPE"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$TYPE_RAW"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="TYPE">
      <xsl:choose>
        <xsl:when test="contains($TYPE_SRC, 'video') or contains($TYPE_SRC, 'watch')">video</xsl:when>
        <xsl:when test="contains($TYPE_SRC, 'podcast') or contains($TYPE_SRC, 'listen') or contains($TYPE_SRC, 'audio')">podcast</xsl:when>
        <xsl:when test="contains($TYPE_SRC, 'article') or contains($TYPE_SRC, 'read') or $TYPE_SRC = 'text'">article</xsl:when>
        <xsl:otherwise>none</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="SUMMARY_RAW_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$SUMMARY_RAW"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_SUMMARY_RAW" select="normalize-space(translate($SUMMARY_RAW_TEXT, '&#160;', '')) != '' and normalize-space($SUMMARY_RAW_TEXT) != '&amp;nbsp;'"/>
    <!-- The picked story's summary shows on the featured story only;
         the smaller cards show a summary when one is typed. -->
    <xsl:variable name="SUMMARY">
      <xsl:choose>
        <xsl:when test="$STORY_FIRST and $role = 'feature' and normalize-space($DCR/*/summarydescription) != ''"><xsl:value-of select="$DCR/*/summarydescription"/></xsl:when>
        <xsl:when test="$STORY_FIRST and $role = 'feature' and normalize-space($DCR/*/description) != ''"><xsl:value-of select="$DCR/*/description"/></xsl:when>
        <xsl:when test="$HAS_SUMMARY_RAW"><xsl:value-of select="$SUMMARY_RAW"/></xsl:when>
        <xsl:when test="$role = 'feature' and normalize-space($DCR/*/summarydescription) != ''"><xsl:value-of select="$DCR/*/summarydescription"/></xsl:when>
        <xsl:when test="$role = 'feature'"><xsl:value-of select="$DCR/*/description"/></xsl:when>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="SUMMARY_TEXT"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$SUMMARY"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_SUMMARY" select="normalize-space(translate($SUMMARY_TEXT, '&#160;', '')) != '' and normalize-space($SUMMARY_TEXT) != '&amp;nbsp;'"/>

    <xsl:variable name="IMG">
      <xsl:choose>
        <xsl:when test="$STORY_FIRST and $S_THUMB != ''"><xsl:value-of select="$S_THUMB"/></xsl:when>
        <xsl:when test="$IMG_RAW != ''"><xsl:value-of select="$IMG_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_THUMB"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- The typed image's description is its alt text; it does not
         describe the story's own thumbnail. -->
    <xsl:variable name="IMG_ALT_USED">
      <xsl:if test="string($IMG) = $IMG_RAW"><xsl:value-of select="$IMG_ALT"/></xsl:if>
    </xsl:variable>
    <xsl:variable name="LINK">
      <xsl:choose>
        <xsl:when test="$STORY_FIRST and string($S_LINK) != ''"><xsl:value-of select="$S_LINK"/></xsl:when>
        <xsl:when test="$LINK_RAW != ''"><xsl:value-of select="$LINK_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$S_LINK"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- The story's own length: watch / listen time for video and
         podcast, read time otherwise (typed on the article as "5 min"). -->
    <xsl:variable name="DURATION">
      <xsl:choose>
        <xsl:when test="($TYPE = 'video' or $TYPE = 'podcast') and normalize-space($DCR/*/time_to_watch) != ''"><xsl:value-of select="normalize-space($DCR/*/time_to_watch)"/></xsl:when>
        <xsl:when test="$TYPE != 'video' and $TYPE != 'podcast'"><xsl:value-of select="normalize-space($DCR/*/time_to_read)"/></xsl:when>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="ACTION">
      <xsl:choose>
        <xsl:when test="$ACTION_RAW != '' and not($STORY_FIRST and $HAS_STORY)"><xsl:call-template name="rbccmDot"><xsl:with-param name="s" select="$ACTION_RAW"/></xsl:call-template></xsl:when>
        <xsl:otherwise>
          <xsl:choose>
            <xsl:when test="$TYPE = 'video'">Watch</xsl:when>
            <xsl:when test="$TYPE = 'podcast'">Listen</xsl:when>
            <xsl:otherwise>Read</xsl:otherwise>
          </xsl:choose>
          <xsl:if test="string($DURATION) != ''"><xsl:text> &#183; </xsl:text><xsl:value-of select="$DURATION"/></xsl:if>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- The featured story sits in a div; the others are list items. -->
    <xsl:variable name="WRAP">
      <xsl:choose>
        <xsl:when test="$role = 'feature'">div</xsl:when>
        <xsl:otherwise>li</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="string($TITLE) != ''">
      <xsl:element name="{$WRAP}">
        <xsl:attribute name="class">
          <xsl:text>rbccm-insight-cards__item rbccm-insight-cards__item--outlook-2027 rbccm-insight-cards__item--</xsl:text><xsl:value-of select="$role"/>
        </xsl:attribute>
        <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
        <xsl:if test="$n &gt; 1">
          <xsl:attribute name="data-animate-delay"><xsl:value-of select="($n - 1) * 120"/></xsl:attribute>
        </xsl:if>
        <xsl:if test="$FILTER != ''">
          <xsl:attribute name="data-insight-filter-tag"><xsl:value-of select="$FILTER"/></xsl:attribute>
        </xsl:if>

        <article>
          <xsl:attribute name="class">
            <xsl:text>rbccm-insight-cards__card rbccm-insight-cards__card--outlook-2027 rbccm-insight-cards__card--</xsl:text><xsl:value-of select="$role"/>
            <xsl:text> rbccm-insight-cards__card--type-</xsl:text><xsl:value-of select="$TYPE"/>
          </xsl:attribute>

          <div>
            <xsl:attribute name="class">
              <xsl:text>rbccm-insight-cards__card-media rbccm-insight-cards__card-media--outlook-2027</xsl:text>
              <xsl:if test="$IMG = ''"> rbccm-insight-cards__card-media--placeholder</xsl:if>
            </xsl:attribute>
            <xsl:choose>
              <xsl:when test="$IMG != ''">
                <!-- The title sits beside or under the image, so a blank
                     description makes the image decorative (alt=""). -->
                <img class="rbccm-insight-cards__card-img rbccm-insight-cards__card-img--outlook-2027" width="369" height="194" loading="lazy" decoding="async">
                  <xsl:attribute name="src"><xsl:value-of select="$IMG"/></xsl:attribute>
                  <xsl:attribute name="alt"><xsl:value-of select="$IMG_ALT_USED"/></xsl:attribute>
                </img>
              </xsl:when>
              <xsl:when test="$noImageLabel != ''">
                <span class="rbccm-insight-cards__card-placeholder rbccm-insight-cards__card-placeholder--outlook-2027"><xsl:value-of select="$noImageLabel"/></span>
              </xsl:when>
            </xsl:choose>
            <xsl:if test="$BADGE != ''">
              <span class="rbccm-insight-cards__card-badge rbccm-insight-cards__card-badge--outlook-2027"><xsl:value-of select="$BADGE"/></span>
            </xsl:if>
            <xsl:if test="$TYPE != 'none' and $TYPE_RAW != 'none'">
              <span class="rbccm-insight-cards__card-type rbccm-insight-cards__card-type--outlook-2027" aria-hidden="true">
                <xsl:call-template name="iconType"><xsl:with-param name="type" select="$TYPE"/></xsl:call-template>
              </span>
            </xsl:if>
            <xsl:if test="string($SPEAKER) != ''">
              <p class="rbccm-insight-cards__card-speaker rbccm-insight-cards__card-speaker--outlook-2027">
                <span class="rbccm-insight-cards__card-speaker-name rbccm-insight-cards__card-speaker-name--outlook-2027"><xsl:value-of select="$SPEAKER"/></span>
                <xsl:if test="string($SPEAKER_ROLE) != ''">
                  <span class="rbccm-insight-cards__card-speaker-role rbccm-insight-cards__card-speaker-role--outlook-2027"><xsl:value-of select="$SPEAKER_ROLE"/></span>
                </xsl:if>
              </p>
            </xsl:if>
          </div>

          <div class="rbccm-insight-cards__card-content rbccm-insight-cards__card-content--outlook-2027">
            <div class="rbccm-insight-cards__card-body rbccm-insight-cards__card-body--outlook-2027">
              <xsl:if test="$CATEGORY != ''">
                <p class="rbccm-insight-cards__card-category rbccm-insight-cards__card-category--outlook-2027"><xsl:value-of select="$CATEGORY"/></p>
              </xsl:if>
              <!-- The title links to the story, so the link's words say
                   what the story is. The action link below goes to the
                   same place and is the one keyboard users tab to, so
                   the title is left out of the tab order. -->
              <h3 class="rbccm-insight-cards__card-title rbccm-insight-cards__card-title--outlook-2027">
                <xsl:choose>
                  <xsl:when test="normalize-space($LINK) != ''">
                    <a class="rbccm-insight-cards__card-title-link rbccm-insight-cards__card-title-link--outlook-2027" tabindex="-1">
                      <xsl:attribute name="href"><xsl:value-of select="$LINK"/></xsl:attribute>
                      <xsl:value-of select="$TITLE"/>
                    </a>
                  </xsl:when>
                  <xsl:otherwise><xsl:value-of select="$TITLE"/></xsl:otherwise>
                </xsl:choose>
              </h3>
              <xsl:if test="$HAS_SUMMARY">
                <div class="rbccm-insight-cards__card-summary rbccm-insight-cards__card-summary--outlook-2027"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$SUMMARY"/></xsl:call-template></div>
              </xsl:if>
              <xsl:if test="string($META_TEXT) != '' or $DATE_OK">
                <p class="rbccm-insight-cards__card-meta rbccm-insight-cards__card-meta--outlook-2027">
                  <xsl:value-of select="$META_TEXT"/>
                  <xsl:if test="$DATE_OK">
                    <xsl:if test="string($META_TEXT) != ''"><xsl:text> &#183; </xsl:text></xsl:if>
                    <time class="rbccm-insight-cards__card-date rbccm-insight-cards__card-date--outlook-2027"><xsl:attribute name="datetime"><xsl:value-of select="$DATE"/></xsl:attribute><xsl:value-of select="$DATE_TEXT"/></time>
                  </xsl:if>
                </p>
              </xsl:if>
            </div>

            <xsl:if test="normalize-space($LINK) != '' or $showShare">
              <div class="rbccm-insight-cards__card-footer rbccm-insight-cards__card-footer--outlook-2027">
                <xsl:if test="normalize-space($LINK) != ''">
                  <a class="rbccm-insight-cards__card-action rbccm-insight-cards__card-action--outlook-2027">
                    <xsl:attribute name="href"><xsl:value-of select="$LINK"/></xsl:attribute>
                    <!-- Screen readers hear which story: "Read: {title}". -->
                    <xsl:attribute name="aria-label"><xsl:value-of select="concat($ACTION, ': ', $TITLE)"/></xsl:attribute>
                    <span class="rbccm-insight-cards__card-action-label rbccm-insight-cards__card-action-label--outlook-2027"><xsl:value-of select="$ACTION"/></span>
                    <xsl:call-template name="iconArrow"><xsl:with-param name="class" select="'rbccm-insight-cards__card-action-icon rbccm-insight-cards__card-action-icon--outlook-2027'"/></xsl:call-template>
                  </a>
                </xsl:if>
                <!-- Share button. Printed hidden; the script shows it. -->
                <xsl:if test="$showShare">
                  <button type="button" class="rbccm-insight-cards__card-share rbccm-insight-cards__card-share--outlook-2027" aria-haspopup="dialog" aria-expanded="false" hidden="hidden" data-insight-share="">
                    <xsl:attribute name="aria-label"><xsl:value-of select="concat('Share: ', $TITLE)"/></xsl:attribute>
                    <xsl:attribute name="data-insight-share-title"><xsl:value-of select="$TITLE"/></xsl:attribute>
                    <xsl:if test="normalize-space($LINK) != ''">
                      <xsl:attribute name="data-insight-share-url"><xsl:value-of select="$LINK"/></xsl:attribute>
                    </xsl:if>
                    <xsl:call-template name="iconShare"><xsl:with-param name="class" select="'rbccm-insight-cards__card-share-icon rbccm-insight-cards__card-share-icon--outlook-2027'"/></xsl:call-template>
                    <span class="rbccm-insight-cards__card-share-label rbccm-insight-cards__card-share-label--outlook-2027">Share</span>
                  </button>
                </xsl:if>
              </div>
            </xsl:if>
          </div>
        </article>
      </xsl:element>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
