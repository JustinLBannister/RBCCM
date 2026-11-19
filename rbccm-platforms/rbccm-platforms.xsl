<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Platforms - XSL skin
  ==============================================================
  Renders a Preset-driven grid of four to six platform tiles
  (cards 5 and 6 print only when they have a title). Each
  card is a whole-tile anchor with a background photo (real
  &lt;img&gt;), a title + body, and a gold "Explore" link at the
  bottom.

  Presets
  ==============================================================
  The $VARIANT_CLASS map resolves the Preset Datum to a BEM
  modifier class on the .rbccm-platforms section. Extend by:
    1. Adding a &lt;xsl:when&gt; branch to VARIANT_CLASS
    2. Adding a modifier scope in rbccm-platforms.css
    3. Adding a matching &lt;Option&gt; to the Preset Datum

  Current presets:
    strategy-and-economics-platforms
    outlook-2027-platforms

  Photo hookup (mobile + desktop DAM pickers)
  ==============================================================
  Each card ships two Type="Image" Datums (native DAM picker):
    Card{N}PhotoDesktop  wide-crop art for &gt;=992px, and the
                         fallback &lt;img&gt; inside &lt;picture&gt;
    Card{N}PhotoMobile   portrait-crop art served at &lt;992px via
                         &lt;source media="(max-width: 991px)"&gt;
  The XSL emits a &lt;picture&gt; per card:
    Card{N}PhotoDesktop/Image/Path         src on the fallback &lt;img&gt;
    Card{N}PhotoMobile/Image/Path          srcset on the &lt;source&gt;
    Card{N}PhotoDesktop/Image/Description  alt on the &lt;img&gt;
  Mobile Description is not read (decorative). When the desktop
  Description is blank the alt falls through to Card{N}TitleText
  so the tile still has an accessible name.

  Focal point (optional per card)
  ==============================================================
  Card{N}FocalPoint is an optional String Datum that overrides
  the CSS default object-position (50% 50%) for that card's
  photo. Values are standard CSS object-position ("50% 15%",
  "70% 40%", "top center"). When set, the XSL writes it inline
  on the &lt;a&gt; as the CSS custom property that .__photo reads.

  Body max-width (optional per card)
  ==============================================================
  Card{N}BodyMaxWidth is an optional String Datum (e.g. "274px")
  that caps the body copy width at desktop only via the CSS custom
  property rbccm-platforms-body-max-width (double-dash prefix at
  write time). Kicks in at 992+ where the grid narrows each card
  naturally.

  Semantic tag pickers guarded via the pickTag allow-list. Blank
  Card{N}TitleText hides that slot entirely.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Tag allow-list guard. -->
  <!-- Rich text output. Text pasted into the editor straight from Figma
       carries two hidden spans (data-metadata="(figmeta)..." and
       data-buffer="(figma)...") holding the Figma file key and a base64
       copy of the design, often tens of KB per field. They are invisible
       but bloat the page and expose internal file details, so they are
       removed here; all other HTML is output as entered. -->
  <!-- Visible text of a rich-text field: tags stripped. TeamSite's
       editor leaves placeholder markup in a field that was emptied
       (<br data-mce-bogus="1">, <p>&amp;nbsp;</p>), which would otherwise
       print as an empty paragraph and push the content below it down.
       A field with no visible text is treated as blank. -->
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

  <!-- A heading tag from a tag dropdown. noH1: for the tiles and the
       subtitle, which must never be the page's h1. (Their dropdowns
       list h1 first, and TeamSite saves the first option when nobody
       chooses, so an untouched tile would otherwise come out as h1.) -->
  <xsl:template name="pickTag">
    <xsl:param name="raw"/>
    <xsl:param name="default"/>
    <xsl:param name="noH1" select="false()"/>
    <xsl:choose>
      <xsl:when test="$noH1 and $raw = 'h1'"><xsl:value-of select="$default"/></xsl:when>
      <xsl:when test="$raw = 'h1' or $raw = 'h2' or $raw = 'h3' or $raw = 'h4' or $raw = 'h5' or $raw = 'h6' or $raw = 'p' or $raw = 'div' or $raw = 'span'">
        <xsl:value-of select="$raw"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$default"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Render one platform card. -->
  <xsl:template name="renderCard">
    <xsl:param name="photo"/>
    <xsl:param name="photoMobile"/>
    <xsl:param name="photoAlt"/>
    <xsl:param name="focalPoint"/>
    <xsl:param name="bodyMaxWidth"/>
    <xsl:param name="titleText"/>
    <xsl:param name="titleTag"/>
    <xsl:param name="bodyText"/>
    <xsl:param name="bodyTag"/>
    <xsl:param name="ctaText"/>
    <xsl:param name="ctaHref"/>
    <xsl:param name="photoScale"/>

    <a class="rbccm-platforms__card">
      <xsl:attribute name="href">
        <xsl:choose>
          <xsl:when test="$ctaHref != ''"><xsl:value-of select="$ctaHref"/></xsl:when>
          <xsl:otherwise>#</xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <!-- No aria-label on the whole-card anchor. Per accessibility QA
           the entire card text should be read out (title + body + CTA)
           so screen-reader users get the full context of where the link
           leads. An aria-label here would replace all descendant text
           with just the title, which QA noted "doesn't make sense". -->

      <!-- aria-label emission on the anchor was intentionally removed per
           the accessibility QA note above. If you're re-adding one, the
           $titleText Datum is still populated. -->

      <!-- Optional per-card inline style: focal point + body cap.
           Concatenated into one style attr when either is set. -->
      <xsl:if test="$focalPoint != '' or $bodyMaxWidth != '' or $photoScale != ''">
        <xsl:attribute name="style">
          <xsl:if test="$focalPoint != ''">--rbccm-platforms-focal: <xsl:value-of select="$focalPoint"/>;</xsl:if>
          <xsl:if test="$photoScale != ''"> --rbccm-platforms-scale: <xsl:value-of select="$photoScale"/>;</xsl:if>
          <xsl:if test="$bodyMaxWidth != ''"> --rbccm-platforms-body-max-width: <xsl:value-of select="$bodyMaxWidth"/>;</xsl:if>
        </xsl:attribute>
      </xsl:if>

      <xsl:if test="$photo != '' or $photoMobile != ''">
        <picture>
          <xsl:if test="$photoMobile != ''">
            <source media="(max-width: 991px)">
              <xsl:attribute name="srcset"><xsl:value-of select="$photoMobile"/></xsl:attribute>
            </source>
          </xsl:if>
          <img class="rbccm-platforms__photo" loading="lazy" decoding="async">
            <xsl:attribute name="src"><xsl:value-of select="$photo"/></xsl:attribute>
            <xsl:attribute name="alt"><xsl:value-of select="$photoAlt"/></xsl:attribute>
            <xsl:if test="normalize-space($focalPoint) != ''">
              <xsl:attribute name="style">object-position: <xsl:value-of select="$focalPoint"/>;</xsl:attribute>
            </xsl:if>
          </img>
        </picture>
      </xsl:if>

      <div class="rbccm-platforms__card-content">
        <xsl:element name="{$titleTag}">
          <xsl:attribute name="class">rbccm-platforms__card-title</xsl:attribute>
          <xsl:value-of select="$titleText"/>
        </xsl:element>
        <xsl:variable name="bodyVisible"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="string($bodyText)"/></xsl:call-template></xsl:variable>
        <xsl:if test="normalize-space(translate($bodyVisible, '&#160;', '')) != '' and normalize-space($bodyVisible) != '&amp;nbsp;'">
          <xsl:element name="{$bodyTag}">
            <xsl:attribute name="class">rbccm-platforms__card-body</xsl:attribute>
            <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$bodyText"/></xsl:call-template>
          </xsl:element>
        </xsl:if>
      </div>

      <xsl:if test="$ctaText != ''">
        <span class="rbccm-platforms__card-cta">
          <span><xsl:value-of select="$ctaText"/></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.00014C1.5 7.86753 1.55268 7.74036 1.64645 7.64659C1.74021 7.55282 1.86739 7.50014 2 7.50014H13.793L10.646 4.35414C10.5521 4.26026 10.4994 4.13292 10.4994 4.00014C10.4994 3.86737 10.5521 3.74003 10.646 3.64614C10.7399 3.55226 10.8672 3.49951 11 3.49951C11.1328 3.49951 11.2601 3.55226 11.354 3.64614L15.354 7.64614C15.4006 7.69259 15.4375 7.74776 15.4627 7.80851C15.4879 7.86926 15.5009 7.93438 15.5009 8.00014C15.5009 8.06591 15.4879 8.13103 15.4627 8.19178C15.4375 8.25252 15.4006 8.3077 15.354 8.35414L11.354 12.3541C11.2601 12.448 11.1328 12.5008 11 12.5008C10.8672 12.5008 10.7399 12.448 10.646 12.3541C10.5521 12.2603 10.4994 12.1329 10.4994 12.0001C10.4994 11.8674 10.5521 11.74 10.646 11.6461L13.793 8.50014H2C1.86739 8.50014 1.74021 8.44746 1.64645 8.3537C1.55268 8.25993 1.5 8.13275 1.5 8.00014Z" fill="currentColor"/>
          </svg>
        </span>
      </xsl:if>
    </a>
  </xsl:template>

  <!-- Per-slot lookup + renderCard dispatcher (reads Card{N}FieldName). -->
  <!-- ===== The platforms list (what the editor fills in) =====
       A repeatable list in the component's data: one "Platform" entry
       per tile, each a single dropdown that picks a platform and its
       wording. Entries are added, removed and reordered with the
       list's own controls, and the tiles print in that order.

       When the list has at least one entry with a platform picked, the
       list is the whole section. With none (a new, empty list, or a
       copy saved before the list existed) the six card slots are used
       instead: each either typed by hand or, on copies made while the
       cards had their own dropdown, picked there.

       Inside a list TeamSite can drop a field's ID, so the dropdown is
       matched on its ID or on its label starting with "Platform". -->
  <xsl:variable name="PLATFORM_LIST" select="//Group[@ID='PlatformTile' or @Name='Platform'][contains(normalize-space((Datum[@ID='PlatformPick' or starts-with(@Name, 'Platform')]/Option[@Selected='true']/Value | Datum[@ID='PlatformPick' or starts-with(@Name, 'Platform')]/text()[last()][not(../Option[@Selected='true'])])[1]), '@')]"/>

  <!-- ===== The platforms =====
       The six platforms are the same on every page, so they live here
       once. A tile's "platform" dropdown picks one, and its title,
       description, link, button label and photo come from this list.

       The title, link and photo of a platform never vary. Its
       description, button label and description width do: three pages
       were written with their own wording, so each wording is kept as
       a named version and the dropdown offers "Markets in Motion -
       Outlook 2027", "Markets in Motion - US Credentials" and so on.
       The dropdown's value is key@version, e.g.
       markets-in-motion@us-credentials.

       key                      title                   link
       strategic-alternatives   Strategic Alternatives  /en/insights/podcasts/strategic-alternatives
       rbc-imagine              RBC Imagine             /en/insights/imagine
       rbc-economics            RBC Economics           https://www.rbc.com/en/economics
       real-time-geopolitics    Real-Time Geopolitics   /en/insights/real-time-geopolitics
       markets-in-motion        Markets in Motion       /en/insights/podcasts/markets-in-motion
       macro-minutes            Macro Minutes           /en/insights/podcasts/macro-minutes

       versions                 which platforms have one
       outlook-2027             all six
       us-credentials           RBC Imagine, RBC Economics, Markets in Motion
       strategy-and-economics   RBC Economics, Real-Time Geopolitics, Markets in Motion, Macro Minutes
       (Strategic Alternatives reads the same everywhere, so it has one.)

       Photo: /assets/rbccm/images/insights/strategy-economics/platforms/{key}.webp
       (the same file on desktop and mobile).

       To change a platform everywhere, change it here. To add a
       wording, add its row under "body" (and under "cta" / "width" if
       they differ) and an option to every Card{N}Platform dropdown in
       the properties file. -->
  <xsl:template name="platformText">
    <xsl:param name="key"/>
    <xsl:param name="version"/>
    <xsl:param name="field"/>
    <xsl:variable name="at" select="concat($key, '@', $version)"/>
    <xsl:choose>
      <xsl:when test="$field = 'title'">
        <xsl:choose>
          <xsl:when test="$key = 'strategic-alternatives'">Strategic Alternatives</xsl:when>
          <xsl:when test="$key = 'rbc-imagine'">RBC Imagine</xsl:when>
          <xsl:when test="$key = 'rbc-economics'">RBC Economics</xsl:when>
          <xsl:when test="$key = 'real-time-geopolitics'">Real-Time Geopolitics</xsl:when>
          <xsl:when test="$key = 'markets-in-motion'">Markets in Motion</xsl:when>
          <xsl:when test="$key = 'macro-minutes'">Macro Minutes</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$field = 'href'">
        <xsl:choose>
          <xsl:when test="$key = 'strategic-alternatives'">/en/insights/podcasts/strategic-alternatives</xsl:when>
          <xsl:when test="$key = 'rbc-imagine'">/en/insights/imagine</xsl:when>
          <xsl:when test="$key = 'rbc-economics'">https://www.rbc.com/en/economics</xsl:when>
          <xsl:when test="$key = 'real-time-geopolitics'">/en/insights/real-time-geopolitics</xsl:when>
          <xsl:when test="$key = 'markets-in-motion'">/en/insights/podcasts/markets-in-motion</xsl:when>
          <xsl:when test="$key = 'macro-minutes'">/en/insights/podcasts/macro-minutes</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$field = 'body'">
        <xsl:choose>
          <!-- Outlook 2027 -->
          <xsl:when test="$key = 'strategic-alternatives'">Uncover new ways to drive growth and create value with insights from our capital markets experts.</xsl:when>
          <xsl:when test="$at = 'rbc-imagine@outlook-2027'">Discover the forces of change reshaping industries, economies and societies &#8211; and turn disruption into strategic direction.</xsl:when>
          <xsl:when test="$at = 'rbc-economics@outlook-2027'">In-depth analysis and perspectives on the economic and market forces shaping the year ahead.</xsl:when>
          <xsl:when test="$at = 'real-time-geopolitics@outlook-2027'">Timely insight into the geopolitical developments influencing economies, markets, and industries.</xsl:when>
          <xsl:when test="$at = 'markets-in-motion@outlook-2027'">Perspectives on the trends, catalysts, and market developments shaping U.S. equities.</xsl:when>
          <xsl:when test="$at = 'macro-minutes@outlook-2027'">Concise analysis of the latest economic and market developments from RBC&#8217;s strategists.</xsl:when>
          <!-- US Credentials -->
          <xsl:when test="$at = 'rbc-imagine@us-credentials'">Forward-looking insights into the disruptive forces redefining business and society.</xsl:when>
          <xsl:when test="$at = 'rbc-economics@us-credentials'">The macro backdrop and rates outlook behind every capital decision.</xsl:when>
          <xsl:when test="$at = 'markets-in-motion@us-credentials'">Timely reads on the macro and market forces moving U.S. capital markets today.</xsl:when>
          <!-- Strategy and Economics -->
          <xsl:when test="$at = 'rbc-economics@strategy-and-economics'">In-depth analysis and insights on the forces shaping businesses and markets.</xsl:when>
          <xsl:when test="$at = 'real-time-geopolitics@strategy-and-economics'">Decode the evolving power dynamics around energy, commodities and security.</xsl:when>
          <xsl:when test="$at = 'markets-in-motion@strategy-and-economics'">Nuanced, data-driven perspectives on the trends moving U.S. equity markets.</xsl:when>
          <xsl:when test="$at = 'macro-minutes@strategy-and-economics'">High-conviction insights on the latest market and economic developments from RBC's desk strategists.</xsl:when>
        </xsl:choose>
      </xsl:when>
      <!-- Button label: "Listen" only on the two podcasts as Strategy
           and Economics words them; "Explore" everywhere else. -->
      <xsl:when test="$field = 'cta'">
        <xsl:choose>
          <xsl:when test="$at = 'markets-in-motion@strategy-and-economics' or $at = 'macro-minutes@strategy-and-economics'">Listen</xsl:when>
          <xsl:otherwise>Explore</xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <!-- Photo. Each platform has one photo, named after its key. A
           wording can have its own: the Outlook 2027 Real-Time
           Geopolitics tile carries a portrait. -->
      <xsl:when test="$field = 'photo'">
        <xsl:text>/assets/rbccm/images/insights/strategy-economics/platforms/</xsl:text>
        <xsl:choose>
          <xsl:when test="$at = 'real-time-geopolitics@outlook-2027'">real-time-geopolitics-outlook-2027</xsl:when>
          <xsl:otherwise><xsl:value-of select="$key"/></xsl:otherwise>
        </xsl:choose>
        <xsl:text>.webp</xsl:text>
      </xsl:when>
      <!-- Which part of the photo stays in view when the tile crops it,
           and how far the photo is zoomed at rest (blank = the usual
           1.2). The portrait sits top right and is shown unzoomed, so
           the head and shoulders are never cut. -->
      <xsl:when test="$field = 'focal'">
        <xsl:if test="$at = 'real-time-geopolitics@outlook-2027'">85% 0%</xsl:if>
      </xsl:when>
      <xsl:when test="$field = 'scale'">
        <xsl:if test="$at = 'real-time-geopolitics@outlook-2027'">1</xsl:if>
      </xsl:when>
      <!-- Description width on desktop, where a wording was tuned to
           break a certain way. Blank uses the default (340px). -->
      <xsl:when test="$field = 'width'">
        <xsl:choose>
          <xsl:when test="$at = 'rbc-economics@us-credentials' or $at = 'rbc-economics@strategy-and-economics'">274px</xsl:when>
          <xsl:when test="$at = 'markets-in-motion@us-credentials' or $at = 'markets-in-motion@strategy-and-economics' or $at = 'macro-minutes@strategy-and-economics' or $at = 'rbc-imagine@us-credentials'">295px</xsl:when>
        </xsl:choose>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <!-- One tile. Its platform dropdown picks a platform (and wording)
       from the list above; left on "Typed", the tile uses its own
       typed fields as it always has. Focal point and the tag dropdowns
       apply either way, and a typed description width replaces the
       list's. A tile with no title is not printed. -->
  <xsl:template name="renderSlot">
    <xsl:param name="n"/>
    <!-- From the platforms list: the entry's own choice. A card slot
         reads its Card{N}Platform dropdown instead (older copies). -->
    <xsl:param name="listed"/>
    <xsl:variable name="picked">
      <xsl:choose>
        <xsl:when test="string($listed) != ''"><xsl:value-of select="$listed"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space((//Datum[@ID=concat('Card', $n, 'Platform')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'Platform')]/text()[last()][not(../Option[@Selected='true'])])[1])"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="platform" select="substring-before(concat(string($picked), '@'), '@')"/>
    <xsl:variable name="versionRaw" select="substring-after(string($picked), '@')"/>
    <xsl:variable name="version">
      <xsl:choose>
        <xsl:when test="$versionRaw != ''"><xsl:value-of select="$versionRaw"/></xsl:when>
        <xsl:otherwise>outlook-2027</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="listBody"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="version" select="string($version)"/><xsl:with-param name="field" select="'body'"/></xsl:call-template></xsl:variable>
    <!-- Known: a platform in the list, in a wording the list has. -->
    <xsl:variable name="known" select="string($listBody) != ''"/>
    <xsl:variable name="title">
      <xsl:choose>
        <xsl:when test="$known"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="field" select="'title'"/></xsl:call-template></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space((//Datum[@ID=concat('Card', $n, 'TitleText')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()][not(../Option[@Selected='true'])])[1])"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="string($title) != ''">
      <xsl:variable name="platformPhoto"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="version" select="string($version)"/><xsl:with-param name="field" select="'photo'"/></xsl:call-template></xsl:variable>
      <xsl:variable name="photo">
        <xsl:choose>
          <xsl:when test="$known"><xsl:value-of select="$platformPhoto"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="normalize-space(//Datum[@ID=concat('Card', $n, 'PhotoDesktop')]/Image/Path)"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="photoMobile">
        <xsl:choose>
          <xsl:when test="$known"><xsl:value-of select="$platformPhoto"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="normalize-space(//Datum[@ID=concat('Card', $n, 'PhotoMobile')]/Image/Path)"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="photoAltRaw"   select="normalize-space(//Datum[@ID=concat('Card', $n, 'PhotoDesktop')]/Image/Description)"/>
      <xsl:variable name="photoAlt">
        <xsl:choose>
          <xsl:when test="not($known) and $photoAltRaw != ''"><xsl:value-of select="$photoAltRaw"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="focalPointTyped" select="normalize-space((//Datum[@ID=concat('Card', $n, 'FocalPoint')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'FocalPoint')]/text()[last()][not(../Option[@Selected='true'])])[1])"/>
      <xsl:variable name="focalPoint">
        <xsl:choose>
          <xsl:when test="$focalPointTyped != ''"><xsl:value-of select="$focalPointTyped"/></xsl:when>
          <xsl:when test="$known"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="version" select="string($version)"/><xsl:with-param name="field" select="'focal'"/></xsl:call-template></xsl:when>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="photoScale">
        <xsl:if test="$known"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="version" select="string($version)"/><xsl:with-param name="field" select="'scale'"/></xsl:call-template></xsl:if>
      </xsl:variable>
      <xsl:variable name="bodyMaxWidthTyped" select="normalize-space((//Datum[@ID=concat('Card', $n, 'BodyMaxWidth')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'BodyMaxWidth')]/text()[last()][not(../Option[@Selected='true'])])[1])"/>
      <xsl:variable name="bodyMaxWidth">
        <xsl:choose>
          <xsl:when test="$bodyMaxWidthTyped != ''"><xsl:value-of select="$bodyMaxWidthTyped"/></xsl:when>
          <xsl:when test="$known"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="version" select="string($version)"/><xsl:with-param name="field" select="'width'"/></xsl:call-template></xsl:when>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="titleTagRaw"   select="normalize-space((//Datum[@ID=concat('Card', $n, 'TitleTag')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'TitleTag')]/text()[last()][not(../Option[@Selected='true'])])[1])"/>
      <xsl:variable name="bodyTyped"     select="//Datum[@ID=concat('Card', $n, 'BodyText')]"/>
      <xsl:variable name="body">
        <xsl:choose>
          <xsl:when test="$known"><xsl:value-of select="$listBody"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="$bodyTyped"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="bodyTagRaw"    select="normalize-space((//Datum[@ID=concat('Card', $n, 'BodyTag')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'BodyTag')]/text()[last()][not(../Option[@Selected='true'])])[1])"/>
      <xsl:variable name="ctaText">
        <xsl:choose>
          <xsl:when test="$known"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="version" select="string($version)"/><xsl:with-param name="field" select="'cta'"/></xsl:call-template></xsl:when>
          <xsl:otherwise><xsl:value-of select="normalize-space((//Datum[@ID=concat('Card', $n, 'CtaText')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'CtaText')]/text()[last()][not(../Option[@Selected='true'])])[1])"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="ctaHref">
        <xsl:choose>
          <xsl:when test="$known"><xsl:call-template name="platformText"><xsl:with-param name="key" select="$platform"/><xsl:with-param name="field" select="'href'"/></xsl:call-template></xsl:when>
          <xsl:otherwise><xsl:value-of select="normalize-space((//Datum[@ID=concat('Card', $n, 'CtaHref')]/Option[@Selected='true']/Value | //Datum[@ID=concat('Card', $n, 'CtaHref')]/text()[last()][not(../Option[@Selected='true'])])[1])"/></xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="titleTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$titleTagRaw"/>
          <xsl:with-param name="default" select="'h3'"/>
          <xsl:with-param name="noH1" select="true()"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="bodyTag">
        <xsl:call-template name="pickTag">
          <xsl:with-param name="raw" select="$bodyTagRaw"/>
          <xsl:with-param name="default" select="'p'"/>
          <xsl:with-param name="noH1" select="true()"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:call-template name="renderCard">
        <xsl:with-param name="photo" select="$photo"/>
        <xsl:with-param name="photoMobile" select="$photoMobile"/>
        <xsl:with-param name="photoAlt" select="$photoAlt"/>
        <xsl:with-param name="focalPoint" select="string($focalPoint)"/>
        <xsl:with-param name="photoScale" select="string($photoScale)"/>
        <xsl:with-param name="bodyMaxWidth" select="$bodyMaxWidth"/>
        <xsl:with-param name="titleText" select="$title"/>
        <xsl:with-param name="titleTag" select="$titleTag"/>
        <xsl:with-param name="bodyText" select="$body"/>
        <xsl:with-param name="bodyTag" select="$bodyTag"/>
        <xsl:with-param name="ctaText" select="$ctaText"/>
        <xsl:with-param name="ctaHref" select="$ctaHref"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"       select="normalize-space((//Datum[@ID='SectionID']/Option[@Selected='true']/Value | //Datum[@ID='SectionID']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="SECTION_ARIA"     select="normalize-space((//Datum[@ID='SectionAriaLabel']/Option[@Selected='true']/Value | //Datum[@ID='SectionAriaLabel']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="CSS_PATH"         select="normalize-space((//Datum[@ID='CssPath']/Option[@Selected='true']/Value | //Datum[@ID='CssPath']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="JS_PATH"          select="normalize-space((//Datum[@ID='JsPath']/Option[@Selected='true']/Value | //Datum[@ID='JsPath']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="CACHE_VERSION"    select="normalize-space((//Datum[@ID='CacheVersion']/Option[@Selected='true']/Value | //Datum[@ID='CacheVersion']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="PRESET"           select="normalize-space((//Datum[@ID='Preset']/Option[@Selected='true']/Value | //Datum[@ID='Preset']/text()[last()][not(../Option[@Selected='true'])])[1])"/>

    <xsl:variable name="TITLE_TEXT"       select="normalize-space((//Datum[@ID='SectionTitleText']/Option[@Selected='true']/Value | //Datum[@ID='SectionTitleText']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="TITLE_TAG_RAW"    select="normalize-space((//Datum[@ID='SectionTitleTag']/Option[@Selected='true']/Value | //Datum[@ID='SectionTitleTag']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="SUBTITLE_TEXT"       select="normalize-space((//Datum[@ID='SectionSubtitleText']/Option[@Selected='true']/Value | //Datum[@ID='SectionSubtitleText']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="SUBTITLE_VISIBLE"><xsl:call-template name="stripTags"><xsl:with-param name="s" select="$SUBTITLE_TEXT"/></xsl:call-template></xsl:variable>
    <xsl:variable name="HAS_SUBTITLE" select="normalize-space(translate($SUBTITLE_VISIBLE, '&#160;', '')) != '' and normalize-space($SUBTITLE_VISIBLE) != '&amp;nbsp;'"/>
    <xsl:variable name="SUBTITLE_TAG_RAW"    select="normalize-space((//Datum[@ID='SectionSubtitleTag']/Option[@Selected='true']/Value | //Datum[@ID='SectionSubtitleTag']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="SECTION_BG_COLOR"    select="normalize-space((//Datum[@ID='SectionBgColor']/Option[@Selected='true']/Value | //Datum[@ID='SectionBgColor']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="HEADER_ALIGN_RAW" select="normalize-space((//Datum[@ID='HeaderAlignment']/Option[@Selected='true']/Value | //Datum[@ID='HeaderAlignment']/text()[last()][not(../Option[@Selected='true'])])[1])"/>
    <xsl:variable name="HEADER_ALIGN">
      <xsl:choose>
        <xsl:when test="$HEADER_ALIGN_RAW = 'center'">center</xsl:when>
        <xsl:otherwise>left</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="TITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$TITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="SUBTITLE_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$SUBTITLE_TAG_RAW"/>
        <xsl:with-param name="default" select="'p'"/>
        <xsl:with-param name="noH1" select="true()"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Stylesheet hoist -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <!-- Preset-to-variant-class map. Extend by adding another
         xsl:when here + a matching CSS scope + Properties Option. -->
    <xsl:variable name="VARIANT_CLASS">
      <xsl:choose>
        <xsl:when test="$PRESET = 'strategy-and-economics-platforms'">rbccm-platforms--strategy-and-economics-platforms</xsl:when>
        <xsl:when test="$PRESET = 'outlook-2027-platforms'">rbccm-platforms--outlook-2027-platforms</xsl:when>
        <xsl:otherwise/>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$VARIANT_CLASS != ''">

      <xsl:variable name="TITLE_ID">
        <xsl:choose>
          <xsl:when test="$SECTION_ID != ''"><xsl:value-of select="$SECTION_ID"/>-title</xsl:when>
          <xsl:otherwise>rbccm-platforms-title</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <section>
        <xsl:attribute name="class">rbccm-platforms <xsl:value-of select="$VARIANT_CLASS"/><xsl:if test="$HEADER_ALIGN = 'center'"> rbccm-platforms--header-center</xsl:if></xsl:attribute>
        <xsl:if test="$SECTION_ID != ''">
          <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
        </xsl:if>
        <!-- Prefer aria-labelledby pointing at the visible title so
             SR users don't hear the label twice. Falls back to
             aria-label when no title is present. -->
        <xsl:choose>
          <xsl:when test="$TITLE_TEXT != ''">
            <xsl:attribute name="aria-labelledby"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
          </xsl:when>
          <xsl:when test="$SECTION_ARIA != ''">
            <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
          </xsl:when>
        </xsl:choose>
        <!-- Optional section background colour override. Sets the CSS
             custom property the base rule reads. Blank Datum == the
             preset default (e.g. transparent for base, #E7EEF1 for S+E). -->
        <xsl:if test="$SECTION_BG_COLOR != ''">
          <xsl:attribute name="style">--rbccm-platforms-bg-color: <xsl:value-of select="$SECTION_BG_COLOR"/>;</xsl:attribute>
        </xsl:if>

        <div class="rbccm-platforms__inner">

          <xsl:if test="$TITLE_TEXT != '' or $HAS_SUBTITLE">
            <header class="rbccm-platforms__header">
              <xsl:if test="$TITLE_TEXT != ''">
                <xsl:element name="{$TITLE_TAG}">
                  <xsl:attribute name="class">rbccm-platforms__title</xsl:attribute>
                  <xsl:attribute name="id"><xsl:value-of select="$TITLE_ID"/></xsl:attribute>
                  <!-- Scroll-triggered reveal driven by rbccm-animate/rbccm-animate.js. -->
                  <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
                  <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$TITLE_TEXT"/></xsl:call-template>
                </xsl:element>
              </xsl:if>
              <xsl:if test="$HAS_SUBTITLE">
                <xsl:element name="{$SUBTITLE_TAG}">
                  <xsl:attribute name="class">rbccm-platforms__subtitle</xsl:attribute>
                  <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
                  <xsl:attribute name="data-animate-delay">250</xsl:attribute>
                  <xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$SUBTITLE_TEXT"/></xsl:call-template>
                </xsl:element>
              </xsl:if>
            </header>
          </xsl:if>

          <!-- data-stagger-parent lets rbccm-animate.js reveal each
               .rbccm-platforms__card in sequence as the grid appears. -->
          <div class="rbccm-platforms__grid" data-stagger-parent="fadeInUp" data-stagger-step="200">
            <xsl:choose>
              <!-- The platforms list, in the order the editor put it. -->
              <xsl:when test="$PLATFORM_LIST">
                <xsl:for-each select="$PLATFORM_LIST">
                  <xsl:call-template name="renderSlot">
                    <xsl:with-param name="n" select="0"/>
                    <xsl:with-param name="listed" select="normalize-space((Datum[@ID='PlatformPick' or starts-with(@Name, 'Platform')]/Option[@Selected='true']/Value | Datum[@ID='PlatformPick' or starts-with(@Name, 'Platform')]/text()[last()][not(../Option[@Selected='true'])])[1])"/>
                  </xsl:call-template>
                </xsl:for-each>
              </xsl:when>
              <!-- No list: the six card slots. -->
              <xsl:otherwise>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="1"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="2"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="3"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="4"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="5"/></xsl:call-template>
              <xsl:call-template name="renderSlot"><xsl:with-param name="n" select="6"/></xsl:call-template>
              </xsl:otherwise>
            </xsl:choose>
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

    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
