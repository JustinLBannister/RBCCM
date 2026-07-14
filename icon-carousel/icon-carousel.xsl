<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<!-- Declared 2.0 to match the skin's XSLT 2.0 rendering mode (the house setting
     per the Conference-Insights BRD). Do NOT set this to 1.0: story-tiles v1 did,
     which forced the 2.0 engine into backwards-compat mode and produced an
     xs:double vs xs:string type error. The stylesheet/rendering-mode versions
     must agree. -->
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Icon Carousel
       ===================================================================
       Datum-driven replacement for the Bootstrap 3 #ecm-carousel.

       Authors supply a FLAT list of Icon Items (min 4). This template
       emits them as a flat <li> list — it does NOT group them into
       slides. The JS chunks them at runtime per breakpoint and rebuilds
       on resize, so the slide count, dot count and the 4/4/3 split all
       derive themselves. The legacy markup hardcoded that split across
       three .item divs, which is why adding a sector meant rebalancing
       all three by hand.

       Deploy alongside this skin:
         /assets/rbccm/css/components/icon-carousel.css
         /assets/rbccm/js/components/icon-carousel.js

       jQuery + slick (accessible-slick build) are already site-wide; the JS
       loads accessible-slick itself if it isn't present.
       =================================================================== -->

  <!-- HTML output, as filter-by / conference-insights-tiles / story-tiles all
       declare. This is what stops the serializer re-escaping the `&lt;` and
       `&amp;&amp;` inside the inlined <script> — in HTML, script content is CDATA and
       is emitted raw. Without it the browser would receive literal &lt; in the
       JS and throw a SyntaxError. -->
  <xsl:output method="html" indent="no" encoding="UTF-8"/>

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- ── Item count guard ──
         Min 4 (see icon-carousel-properties.xml). Below that the 4-across
         desktop row can't be filled. No upper bound — the JS scales.

         Counts only rows that will ACTUALLY RENDER, i.e. those with a
         label. Counting raw Groups would let an author leave two of six
         rows blank and still trip the guard into rendering a 4-across row
         with four real items — the blank rows are dropped further down, so
         the count here has to use the same test the render does. -->
    <xsl:variable name="itemCount" select="count(
        /Properties/Data/Group[(@ID='IconItem' or @Name='Icon Item')
                               and normalize-space(Datum[@ID='Label' or @Name='Label']) != '']
        | /Data/Group[(@ID='IconItem' or @Name='Icon Item')
                      and normalize-space(Datum[@ID='Label' or @Name='Label']) != '']
      )"/>

    <xsl:if test="$itemCount >= 4">

      <!-- ── Config ── -->
      <xsl:variable name="heading" select="normalize-space(/Properties/Datum[@ID='Heading'])"/>
      <xsl:variable name="intro"   select="normalize-space(/Properties/Datum[@ID='Intro'])"/>

      <!-- Per-view counts. Fall back to the Figma defaults when unset, so a
           half-configured DCR still renders the intended layout. -->
      <xsl:variable name="pvDesktopRaw" select="normalize-space(/Properties/Datum[@ID='PerViewDesktop'])"/>
      <xsl:variable name="pvTabletRaw"  select="normalize-space(/Properties/Datum[@ID='PerViewTablet'])"/>
      <xsl:variable name="pvMobileRaw"  select="normalize-space(/Properties/Datum[@ID='PerViewMobile'])"/>

      <xsl:variable name="pvDesktop">
        <xsl:choose>
          <xsl:when test="$pvDesktopRaw != ''"><xsl:value-of select="$pvDesktopRaw"/></xsl:when>
          <xsl:otherwise>4</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="pvTablet">
        <xsl:choose>
          <xsl:when test="$pvTabletRaw != ''"><xsl:value-of select="$pvTabletRaw"/></xsl:when>
          <xsl:otherwise>2</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="pvMobile">
        <xsl:choose>
          <xsl:when test="$pvMobileRaw != ''"><xsl:value-of select="$pvMobileRaw"/></xsl:when>
          <xsl:otherwise>4</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Booleans arrive as the strings "true"/"false". Loop defaults ON
           because it's what fills the short final slide. -->
      <xsl:variable name="loop">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='Loop']) = 'false'">false</xsl:when>
          <xsl:otherwise>true</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="autoplay">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='Autoplay']) = 'true'">true</xsl:when>
          <xsl:otherwise>false</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>


      <!-- ── Aria labels: override → derive from heading → generic ── -->
      <xsl:variable name="carouselAria">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='CarouselAriaLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselAriaLabel'])"/>
          </xsl:when>
          <xsl:when test="$heading != ''"><xsl:value-of select="$heading"/></xsl:when>
          <xsl:otherwise>Icon carousel</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="prevAria">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel'])"/>
          </xsl:when>
          <xsl:otherwise>Previous</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="nextAria">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel'])"/>
          </xsl:when>
          <xsl:otherwise>Next</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Region label (accessible-slick's `regionLabel`). Distinct labels are
           what let a screen-reader user tell two carousels on the same page
           apart, so this derives from the heading rather than being a fixed
           string like "Industries" — two instances would otherwise be
           indistinguishable. -->
      <xsl:variable name="regionLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='RegionLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='RegionLabel'])"/>
          </xsl:when>
          <xsl:when test="$heading != ''"><xsl:value-of select="$heading"/></xsl:when>
          <xsl:otherwise>Icon carousel</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Optional sr-only instructions (accessible-slick's `instructionsText`).
           Blank by default — see the Datum comment for why. -->
      <xsl:variable name="instructions" select="normalize-space(/Properties/Datum[@ID='InstructionsText'])"/>

      <!-- Unique per instance. Two carousels on one page would otherwise emit
           duplicate ids and every aria-describedby would resolve to the first. -->
      <xsl:variable name="instructionsId" select="concat('rbccm-ic-instructions-', generate-id(.))"/>

      <!-- ── Appearance modifiers ──
           Mirrors leadership-slider-bio.html exactly: same Datum names, same
           class suffixes, same background-image assembly and defaults. The two
           components are configured the same way on purpose.

           ColorScheme and HeadingAlignment are independent — centred headings
           on a light section, or left-aligned on a dark one, are both valid. -->
      <xsl:variable name="colorScheme">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='ColorScheme']) = 'dark'">dark</xsl:when>
          <xsl:otherwise>light</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="headingAlignment">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='HeadingAlignment']) = 'center'">center</xsl:when>
          <xsl:otherwise>left</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Item layout: 'inline' (icon beside label, per the Figma comp) or
           'centered' (icon above label, both centred). Anything unrecognised
           falls back to inline. -->
      <xsl:variable name="itemAlignment">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='ItemAlignment']) = 'centered'">centered</xsl:when>
          <xsl:otherwise>inline</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Asset picker → Image/Path, unlike leadership's plain String URL. -->
      <xsl:variable name="bgImage" select="normalize-space(/Properties/Datum[@ID='BackgroundImage']/Image/Path)"/>

      <xsl:variable name="bgPosition">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='BackgroundImagePosition']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='BackgroundImagePosition'])"/>
          </xsl:when>
          <xsl:otherwise>center center</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="bgSize">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='BackgroundImageSize']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='BackgroundImageSize'])"/>
          </xsl:when>
          <xsl:otherwise>cover</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="bgRepeat">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='BackgroundImageRepeat']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='BackgroundImageRepeat'])"/>
          </xsl:when>
          <xsl:otherwise>no-repeat</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Precomputed class + style strings, so the xsl:attribute calls on the
           <section> stay readable. -->
      <xsl:variable name="sectionClass">
        <xsl:text>rbccm-icon-carousel</xsl:text>
        <xsl:if test="$colorScheme = 'dark'"><xsl:text> rbccm-icon-carousel--on-dark</xsl:text></xsl:if>
        <xsl:if test="$headingAlignment = 'center'"><xsl:text> rbccm-icon-carousel--headings-centered</xsl:text></xsl:if>
        <xsl:if test="$itemAlignment = 'centered'"><xsl:text> rbccm-icon-carousel--items-centered</xsl:text></xsl:if>
      </xsl:variable>

      <!-- Padding overrides, written as CSS custom properties (filter-by's
           pattern). The stylesheet reads them via var() with the default as the
           fallback, so a blank Datum must emit NOTHING — writing an empty value
           would resolve to `padding: ;` and blow away the default. Hence one
           xsl:if per property rather than a single unconditional block. -->
      <xsl:variable name="padTopMobile"     select="normalize-space(/Properties/Datum[@ID='PadTopMobile'])"/>
      <xsl:variable name="padBottomMobile"  select="normalize-space(/Properties/Datum[@ID='PadBottomMobile'])"/>
      <xsl:variable name="padTopDesktop"    select="normalize-space(/Properties/Datum[@ID='PadTopDesktop'])"/>
      <xsl:variable name="padBottomDesktop" select="normalize-space(/Properties/Datum[@ID='PadBottomDesktop'])"/>

      <!-- ONE style attribute carries BOTH the padding vars and the background
           image. They have to be assembled into a single string — a second
           xsl:attribute name="style" would silently overwrite the first, and
           whichever ran last would win. That's the trap this variable avoids.

           Emitted only when something is actually set; otherwise the section
           carries no style attribute at all and the CSS defaults (including any
           background-color the on-dark modifier set) show through untouched. -->
      <xsl:variable name="sectionStyle">
        <xsl:if test="$padTopMobile != ''">
          <xsl:text>--rbccm-ic-pt-m: </xsl:text><xsl:value-of select="$padTopMobile"/><xsl:text>; </xsl:text>
        </xsl:if>
        <xsl:if test="$padBottomMobile != ''">
          <xsl:text>--rbccm-ic-pb-m: </xsl:text><xsl:value-of select="$padBottomMobile"/><xsl:text>; </xsl:text>
        </xsl:if>
        <xsl:if test="$padTopDesktop != ''">
          <xsl:text>--rbccm-ic-pt-d: </xsl:text><xsl:value-of select="$padTopDesktop"/><xsl:text>; </xsl:text>
        </xsl:if>
        <xsl:if test="$padBottomDesktop != ''">
          <xsl:text>--rbccm-ic-pb-d: </xsl:text><xsl:value-of select="$padBottomDesktop"/><xsl:text>; </xsl:text>
        </xsl:if>
        <xsl:if test="$bgImage != ''">
          <xsl:text>background-image: url('</xsl:text><xsl:value-of select="$bgImage"/><xsl:text>'); background-position: </xsl:text><xsl:value-of select="$bgPosition"/><xsl:text>; background-size: </xsl:text><xsl:value-of select="$bgSize"/><xsl:text>; background-repeat: </xsl:text><xsl:value-of select="$bgRepeat"/><xsl:text>;</xsl:text>
        </xsl:if>
      </xsl:variable>

      <!-- ================================================================ -->
      <section aria-roledescription="carousel">
        <xsl:attribute name="class"><xsl:value-of select="$sectionClass"/></xsl:attribute>
        <!-- Gated on the assembled string, not on $bgImage — a padding override
             with no background image must still emit a style attribute. -->
        <xsl:if test="normalize-space($sectionStyle) != ''">
          <xsl:attribute name="style"><xsl:value-of select="normalize-space($sectionStyle)"/></xsl:attribute>
        </xsl:if>
        <xsl:attribute name="data-per-view-mobile"><xsl:value-of select="$pvMobile"/></xsl:attribute>
        <xsl:attribute name="data-per-view-tablet"><xsl:value-of select="$pvTablet"/></xsl:attribute>
        <xsl:attribute name="data-per-view-desktop"><xsl:value-of select="$pvDesktop"/></xsl:attribute>
        <xsl:attribute name="data-loop"><xsl:value-of select="$loop"/></xsl:attribute>
        <xsl:attribute name="data-autoplay"><xsl:value-of select="$autoplay"/></xsl:attribute>
        <xsl:attribute name="aria-label"><xsl:value-of select="$carouselAria"/></xsl:attribute>

        <div class="rbccm-icon-carousel__inner">

          <!-- ── Header (optional) ──
               Heading and intro are independently optional, and the WRAPPER is
               conditional too. __inner is a flex column with a 64px gap, so an
               empty __header div would still be a flex child — it would sit
               there contributing a phantom 64px of space above the carousel.
               Emit nothing at all when neither is authored.

               Four valid states: both, heading only, intro only, neither. -->
          <xsl:if test="$heading != '' or $intro != ''">
            <div class="rbccm-icon-carousel__header">
              <xsl:if test="$heading != ''">
                <h2 class="rbccm-icon-carousel__heading">
                  <xsl:value-of select="$heading" disable-output-escaping="yes"/>
                </h2>
              </xsl:if>
              <xsl:if test="$intro != ''">
                <p class="rbccm-icon-carousel__intro">
                  <xsl:value-of select="$intro" disable-output-escaping="yes"/>
                </p>
              </xsl:if>
            </div>
          </xsl:if>

          <!-- Polite live region. The JS writes "Slide 2 of 3" here on every
               user-initiated change; without it the carousel moves silently for
               a screen-reader user. This is what accessible-slick provides to
               the slick-based carousels — we're vanilla, so we supply it. -->
          <div class="rbccm-icon-carousel__announce rbccm-icon-carousel__sr-only"
               aria-live="polite" aria-atomic="true"></div>

          <!-- Optional sr-only instructions, at the START of the carousel per
               accessible-slick's guidance. Emitted only when authored. -->
          <xsl:if test="$instructions != ''">
            <p class="rbccm-icon-carousel__sr-only">
              <xsl:attribute name="id"><xsl:value-of select="$instructionsId"/></xsl:attribute>
              <xsl:value-of select="$instructions"/>
            </p>
          </xsl:if>

          <!-- ── Carousel row ── -->
          <div class="rbccm-icon-carousel__viewport-row">

            <!-- Two icons per arrow: bare chevron (mobile), circled chevron
                 (desktop). CSS swaps them. Ported from the leadership slider
                 so the two components read as one family. -->
            <button type="button" class="rbccm-icon-carousel__arrow rbccm-icon-carousel__arrow--prev">
              <xsl:attribute name="aria-label"><xsl:value-of select="$prevAria"/></xsl:attribute>
              <svg class="rbccm-icon-carousel__arrow-icon--mobile" xmlns="http://www.w3.org/2000/svg"
                   width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg class="rbccm-icon-carousel__arrow-icon--desktop" xmlns="http://www.w3.org/2000/svg"
                   width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false">
                <rect x="1" y="1" width="42" height="42" rx="21" stroke="#003168" stroke-width="2"/>
                <path d="M25 31L16 21.5L25 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- role=region + a DISTINCT aria-label (accessible-slick's
                 regionLabel). aria-describedby only when instructions exist —
                 pointing at a missing id would be a dangling reference. -->
            <div class="rbccm-icon-carousel__viewport" role="region">
              <xsl:attribute name="aria-label"><xsl:value-of select="$regionLabel"/></xsl:attribute>
              <xsl:if test="$instructions != ''">
                <xsl:attribute name="aria-describedby"><xsl:value-of select="$instructionsId"/></xsl:attribute>
              </xsl:if>
              <div class="rbccm-icon-carousel__track">

                <!-- ── Items ──
                     Flat list. The JS groups them; the XSL must not.

                     Matching on @ID *or* @Name: Teamsite strips @ID from
                     Datums inside a Replicatable Group, so @Name is the only
                     reliable selector. Keeping both means the template works
                     whether or not the ID survives. -->
                <xsl:for-each select="
                    /Properties/Data/Group[@ID='IconItem' or @Name='Icon Item']
                    | /Data/Group[@ID='IconItem' or @Name='Icon Item']
                  ">
                  <!-- Icon: pick the dark variant automatically on a dark section.
                       CSS can't recolour an <img>-embedded SVG, so the only way to
                       get white strokes while KEEPING the yellow accent is a second
                       file. Selection is automatic (never an author choice), so a
                       navy icon can't end up on a navy background.

                       If the section is dark but no dark variant was supplied, fall
                       back to the light icon — low contrast, but still renders. -->
                  <xsl:variable name="iconLight" select="normalize-space(Datum[@ID='Icon'     or @Name='Icon']/Image/Path)"/>
                  <xsl:variable name="iconDark"  select="normalize-space(Datum[@ID='IconDark' or @Name='Icon Dark Variant']/Image/Path)"/>
                  <xsl:variable name="iconPath">
                    <xsl:choose>
                      <xsl:when test="$colorScheme = 'dark' and $iconDark != ''">
                        <xsl:value-of select="$iconDark"/>
                      </xsl:when>
                      <xsl:otherwise><xsl:value-of select="$iconLight"/></xsl:otherwise>
                    </xsl:choose>
                  </xsl:variable>
                  <xsl:variable name="iconAlt"  select="normalize-space(Datum[@ID='IconAlt' or @Name='Icon Alt Text'])"/>
                  <xsl:variable name="label"    select="normalize-space(Datum[@ID='Label' or @Name='Label'])"/>

                  <!-- Skip rows with no label: an icon with no name is
                       meaningless here, and an empty cell would break the
                       4-across rhythm. -->
                  <xsl:if test="$label != ''">
                    <div class="rbccm-icon-carousel__item">

                      <xsl:if test="$iconPath != ''">
                        <img class="rbccm-icon-carousel__icon" loading="lazy">
                          <xsl:attribute name="src"><xsl:value-of select="$iconPath"/></xsl:attribute>
                          <!-- alt="" by default: the label beside the icon already
                               names the sector, so a duplicate alt makes a screen
                               reader announce it twice. Authors can override. -->
                          <xsl:attribute name="alt"><xsl:value-of select="$iconAlt"/></xsl:attribute>
                        </img>
                      </xsl:if>

                      <span class="rbccm-icon-carousel__label">
                        <xsl:value-of select="$label" disable-output-escaping="yes"/>
                      </span>

                    </div>
                  </xsl:if>

                </xsl:for-each>

              </div>
            </div>

            <button type="button" class="rbccm-icon-carousel__arrow rbccm-icon-carousel__arrow--next">
              <xsl:attribute name="aria-label"><xsl:value-of select="$nextAria"/></xsl:attribute>
              <svg class="rbccm-icon-carousel__arrow-icon--mobile" xmlns="http://www.w3.org/2000/svg"
                   width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg class="rbccm-icon-carousel__arrow-icon--desktop" xmlns="http://www.w3.org/2000/svg"
                   width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false">
                <rect x="-1" y="1" width="42" height="42" rx="21" transform="matrix(-1 0 0 1 42 0)" stroke="#003168" stroke-width="2"/>
                <path d="M18 31L27 21.5L18 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

          </div>

          <!-- Dots are generated by the JS (count follows the slide count),
               so there is nothing to author or maintain here. -->
          <div class="rbccm-icon-carousel__dots"></div>

        </div>
      </section>

    </xsl:if>

  </xsl:template>
</xsl:stylesheet>
