<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    Skin: Leadership Carousel — DCR-driven, LinkedIn OR Biography modal.
    CSS: /assets/rbccm/css/components/leadership-carousel.css
    JS:  /assets/rbccm/js/components/leadership-carousel.js

    i18n templates emit as data-i18n-* on #rbccm-leadership for the
    external JS to read. Per-breakpoint carousel thresholds emit as
    data-carousel-min-* on the track (only when the matching Datum
    is set). AssetVersion Datum drives ?v= on the CSS/JS URLs.
  -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <!-- ─────────────────────────────────────────────────────────────
       Helper templates
       ───────────────────────────────────────────────────────────── -->

  <!-- fmtName: substitute {name} placeholder in a template string. -->
  <xsl:template name="fmtName">
    <xsl:param name="tpl"/>
    <xsl:param name="name"/>
    <xsl:choose>
      <xsl:when test="contains($tpl, '{name}')">
        <xsl:value-of select="substring-before($tpl, '{name}')"/>
        <xsl:value-of select="$name"/>
        <xsl:value-of select="substring-after($tpl, '{name}')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$tpl"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">

    <xsl:variable name="AUTHORS" select="/Properties/Data/Datum[@Name='Author']"/>
    <xsl:variable name="slideCount" select="count($AUTHORS)"/>

    <!-- Action link mode: 'linkedin' (default) or 'biography' or 'both' -->
    <xsl:variable name="linkType">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='LinkType']) = 'biography'">biography</xsl:when>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='LinkType']) = 'both'">both</xsl:when>
        <xsl:otherwise>linkedin</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Render range: section skips render outside [$minSlides, $maxSlides]. -->
    <xsl:variable name="minSlides">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='MinSlideCount']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='MinSlideCount'])"/>
        </xsl:when>
        <xsl:otherwise>2</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="maxSlides">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='MaxSlideCount']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='MaxSlideCount'])"/>
        </xsl:when>
        <xsl:otherwise>8</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- ?v=<assetVersion> on CSS+JS URLs. Bump when pushing new asset files. -->
    <xsl:variable name="assetVersion">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='AssetVersion']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='AssetVersion'])"/>
        </xsl:when>
        <xsl:otherwise>1</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="($slideCount &gt;= $minSlides) and ($slideCount &lt;= $maxSlides)">

      <!-- ── Locale toggle: 'en' (default) or 'fr' ── -->
      <xsl:variable name="locale">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='Locale']) = 'fr'">fr</xsl:when>
          <xsl:otherwise>en</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- ── Heading ── -->
      <xsl:variable name="heading">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='Heading']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Heading'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Direction européenne</xsl:when>
          <xsl:otherwise>European leadership</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Subheading (optional paragraph below H2) -->
      <xsl:variable name="subheading" select="normalize-space(/Properties/Datum[@ID='Subheading'])"/>

      <!-- Color scheme: 'light' (default, white bg) or 'lightblue' or 'dark' (blue bg) -->
      <xsl:variable name="colorScheme">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='ColorScheme']) = 'dark'">dark</xsl:when>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='ColorScheme']) = 'lightblue'">lightblue</xsl:when>
          <xsl:otherwise>light</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Heading alignment: 'left' (default) or 'center' -->
      <xsl:variable name="headingAlignment">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='HeadingAlignment']) = 'center'">center</xsl:when>
          <xsl:otherwise>left</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Background image (optional). Layers on top of the section's CSS background-color. -->
      <xsl:variable name="bgImage" select="normalize-space(/Properties/Datum[@ID='BackgroundImage'])"/>
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

      <!-- ── Carousel aria label ── -->
      <xsl:variable name="ariaLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='CarouselAriaLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselAriaLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Carrousel de l'équipe de direction européenne</xsl:when>
          <xsl:otherwise>European leadership team carousel</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- ── i18n strings ── per-instance override beats locale default beats English -->

      <xsl:variable name="prevLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='PrevButtonLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='PrevButtonLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Diapositive précédente</xsl:when>
          <xsl:otherwise>Previous slide</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="nextLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='NextButtonLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='NextButtonLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Diapositive suivante</xsl:when>
          <xsl:otherwise>Next slide</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="trackRegionLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='TrackRegionLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='TrackRegionLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Cartes de l'équipe de direction</xsl:when>
          <xsl:otherwise>Leadership cards</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="kbInstructions">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='KeyboardInstructions']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='KeyboardInstructions'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Utilisez les flèches gauche et droite pour naviguer entre les diapositives. Utilisez Tab pour passer d'une carte à l'autre.</xsl:when>
          <xsl:otherwise>Use left and right arrow keys to navigate between slides. Use Tab to move between cards.</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="bioBtnLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='BioButtonLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='BioButtonLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Biographie</xsl:when>
          <xsl:otherwise>Biography</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="bioAriaTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='BioAriaTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='BioAriaTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Lire la biographie de {name}</xsl:when>
          <xsl:otherwise>Read {name}'s biography</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="linkedInAriaTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='LinkedInAriaTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='LinkedInAriaTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Voir le profil LinkedIn de {name}</xsl:when>
          <xsl:otherwise>{name} on LinkedIn, opens in new tab</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="linkedInModalLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='LinkedInModalLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='LinkedInModalLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Voir le profil LinkedIn</xsl:when>
          <xsl:otherwise>View LinkedIn profile</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="emailModalLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='EmailModalLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='EmailModalLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Courriel</xsl:when>
          <xsl:otherwise>Contact through email</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="closeLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='CloseButtonLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='CloseButtonLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Fermer</xsl:when>
          <xsl:otherwise>Close</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="slideRoleDesc">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='SlideRoleDescription']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='SlideRoleDescription'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">diapositive</xsl:when>
          <xsl:otherwise>slide</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="slideAriaTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='SlideAriaTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='SlideAriaTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">diapositive {n} sur {total}</xsl:when>
          <xsl:otherwise>slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="dotAriaTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='DotAriaTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='DotAriaTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Aller à la diapositive {n}</xsl:when>
          <xsl:otherwise>Go to slide {n}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="announceTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='AnnounceTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='AnnounceTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Diapositive {n} sur {total}</xsl:when>
          <xsl:otherwise>Slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Name-enriched a11y templates. {name}/{role}/{n}/{total} are
           substituted in leadership-carousel.js. -->

      <xsl:variable name="slideAriaNameOnlyTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='SlideAriaNameOnlyTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='SlideAriaNameOnlyTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">{name}, diapositive {n} sur {total}</xsl:when>
          <xsl:otherwise>{name}, slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="slideAriaNameTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='SlideAriaNameTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='SlideAriaNameTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">{name}, {role}, diapositive {n} sur {total}</xsl:when>
          <xsl:otherwise>{name}, {role}, slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- "Current" language in the label text — NVDA doesn't reliably
           announce aria-current alone on plain dot buttons. -->
      <xsl:variable name="dotAriaCurrentTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='DotAriaCurrentTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='DotAriaCurrentTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Diapositive actuelle : {name}, diapositive {n} sur {total}</xsl:when>
          <xsl:otherwise>Current slide: {name}, slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="dotAriaCurrentNoNameTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='DotAriaCurrentNoNameTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='DotAriaCurrentNoNameTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Diapositive actuelle {n} sur {total}</xsl:when>
          <xsl:otherwise>Current slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="announceNameTpl">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='AnnounceNameTemplate']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='AnnounceNameTemplate'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">{name}, diapositive {n} sur {total}</xsl:when>
          <xsl:otherwise>{name}, slide {n} of {total}</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="dotsListLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='DotsListLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='DotsListLabel'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Sélection de diapositive</xsl:when>
          <xsl:otherwise>Slide selection</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Placeholder image text (URL-encoded value expected — defaults are already encoded). -->
      <xsl:variable name="placeholderText">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='PlaceholderImageText']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='PlaceholderImageText'])"/>
          </xsl:when>
          <xsl:when test="$locale = 'fr'">Membre%20de%20l%27%C3%A9quipe</xsl:when>
          <xsl:otherwise>Team%20Member</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="placeholderUrl" select="concat('https://fpoimg.com/276x263?text=', $placeholderText, '&amp;text_color=8F8F8F&amp;bg_color=e6e6e6')"/>

      <link rel="stylesheet">
        <xsl:attribute name="href">/assets/rbccm/css/components/leadership-carousel.css?v=<xsl:value-of select="$assetVersion"/></xsl:attribute>
      </link>

      <!-- Precomputed class + style strings. Keeps xsl:attribute calls simple. -->
      <xsl:variable name="sectionClass">
        <xsl:text>rbccm-leadership</xsl:text>
        <xsl:if test="$colorScheme = 'dark'"><xsl:text> rbccm-leadership--on-dark</xsl:text></xsl:if>
        <xsl:if test="$colorScheme = 'lightblue'"><xsl:text> rbccm-leadership--on-ltblue</xsl:text></xsl:if>
        <xsl:if test="$headingAlignment = 'center'"><xsl:text> rbccm-leadership--headings-centered</xsl:text></xsl:if>
      </xsl:variable>

      <xsl:variable name="sectionStyle">
        <xsl:if test="$bgImage != ''">
          <xsl:text>background-image: url('</xsl:text><xsl:value-of select="$bgImage"/><xsl:text>'); background-position: </xsl:text><xsl:value-of select="$bgPosition"/><xsl:text>; background-size: </xsl:text><xsl:value-of select="$bgSize"/><xsl:text>; background-repeat: </xsl:text><xsl:value-of select="$bgRepeat"/><xsl:text>;</xsl:text>
        </xsl:if>
      </xsl:variable>

      <xsl:variable name="headingClass">
        <xsl:text>rbccm-leadership__heading</xsl:text>
        <xsl:if test="$subheading != ''"><xsl:text> rbccm-leadership__heading--with-subhead</xsl:text></xsl:if>
      </xsl:variable>

      <xsl:variable name="headingStyle">
        <xsl:if test="$subheading != ''"><xsl:text>margin-bottom: 25px;</xsl:text></xsl:if>
      </xsl:variable>

      <section id="rbccm-leadership">
        <xsl:attribute name="class"><xsl:value-of select="$sectionClass"/></xsl:attribute>
        <xsl:attribute name="aria-label"><xsl:value-of select="$ariaLabel"/></xsl:attribute>
        <xsl:attribute name="data-link-type"><xsl:value-of select="$linkType"/></xsl:attribute>
        <xsl:attribute name="style"><xsl:value-of select="normalize-space($sectionStyle)"/></xsl:attribute>
        <!-- i18n templates consumed by /assets/rbccm/js/components/leadership-carousel.js.
             English fallbacks are baked into the JS so omitted attributes are safe. -->
        <xsl:attribute name="data-i18n-slide-role"><xsl:value-of select="$slideRoleDesc"/></xsl:attribute>
        <xsl:attribute name="data-i18n-slide-aria-tpl"><xsl:value-of select="$slideAriaTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-slide-aria-name-only-tpl"><xsl:value-of select="$slideAriaNameOnlyTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-slide-aria-name-tpl"><xsl:value-of select="$slideAriaNameTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-dot-aria-tpl"><xsl:value-of select="$dotAriaTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-dot-aria-current-tpl"><xsl:value-of select="$dotAriaCurrentTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-dot-aria-current-noname-tpl"><xsl:value-of select="$dotAriaCurrentNoNameTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-announce-tpl"><xsl:value-of select="$announceTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-announce-name-tpl"><xsl:value-of select="$announceNameTpl"/></xsl:attribute>
        <xsl:attribute name="data-i18n-dots-list-label"><xsl:value-of select="$dotsListLabel"/></xsl:attribute>

        <div class="rbccm-leadership__inner">

          <h2>
            <xsl:attribute name="class"><xsl:value-of select="$headingClass"/></xsl:attribute>
            <xsl:attribute name="style"><xsl:value-of select="$headingStyle"/></xsl:attribute>
            <xsl:value-of select="$heading"/>
          </h2>
          <xsl:if test="$subheading != ''">
            <p class="rbccm-leadership__subheading" style="margin-bottom: 35px;"><xsl:value-of select="$subheading"/></p>
          </xsl:if>

          <div id="rbccm-lead-announce" aria-live="polite" aria-atomic="true" class="rbccm-leadership__sr-only"></div>
          <p id="rbccm-lead-instructions" class="rbccm-leadership__sr-only"><xsl:value-of select="$kbInstructions"/></p>

          <!-- ── Carousel: DOM order is Prev → slides → Next → dots (slick-default).
                  Visual layout reshuffles via CSS grid template-areas in
                  leadership-carousel.css. ── -->
          <div class="rbccm-leadership__carousel">

            <button id="rbccm-lead-prev" class="rbccm-leadership__btn" tabindex="0">
              <xsl:attribute name="aria-label"><xsl:value-of select="$prevLabel"/></xsl:attribute>
              <svg class="rbccm-leadership__btn-icon--mobile" xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg class="rbccm-leadership__btn-icon--desktop" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="21" stroke="#003168" stroke-width="2"/>
                <path d="M25 31L16 21.5L25 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <div class="rbccm-leadership__slider-track"
                 role="region"
                 aria-describedby="rbccm-lead-instructions">
              <xsl:attribute name="aria-label"><xsl:value-of select="$trackRegionLabel"/></xsl:attribute>
              <!-- Only emit when set; JS falls back to presets otherwise. -->
              <xsl:if test="normalize-space(/Properties/Datum[@ID='CarouselMin']) != ''">
                <xsl:attribute name="data-carousel-min"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselMin'])"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="normalize-space(/Properties/Datum[@ID='CarouselMinDesktop']) != ''">
                <xsl:attribute name="data-carousel-min-desktop"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselMinDesktop'])"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="normalize-space(/Properties/Datum[@ID='CarouselMinTablet']) != ''">
                <xsl:attribute name="data-carousel-min-tablet"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselMinTablet'])"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="normalize-space(/Properties/Datum[@ID='CarouselMinMobile']) != ''">
                <xsl:attribute name="data-carousel-min-mobile"><xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselMinMobile'])"/></xsl:attribute>
              </xsl:if>

              <xsl:for-each select="$AUTHORS">

                <xsl:variable name="name"     select="normalize-space(./DCR/authorlist/name)"/>
                <xsl:variable name="title"    select="normalize-space(./DCR/authorlist/title)"/>
                <xsl:variable name="subtitle" select="normalize-space(./DCR/authorlist/subtitle)"/>
                <xsl:variable name="image"    select="normalize-space(./DCR/authorlist/photo)"/>
                <xsl:variable name="linkedin" select="normalize-space(./DCR/authorlist/linkedin)"/>
                <xsl:variable name="email"    select="normalize-space(./DCR/authorlist/email)"/>
                <xsl:variable name="twitter"  select="normalize-space(./DCR/authorlist/twitter)"/>
                <xsl:variable name="bio"      select="./DCR/authorlist/bio"/>
                <xsl:variable name="authorId" select="normalize-space(./DCR/authorlist/id)"/>
                <xsl:variable name="alt"      select="$name"/>
                <xsl:variable name="bioId"    select="concat('rbccm-bio-', position())"/>

                <div class="rbccm-leadership__card">

                  <div class="rbccm-leadership__card-image">
                    <xsl:choose>
                      <xsl:when test="$image != ''">
                        <img loading="lazy">
                          <xsl:attribute name="alt"><xsl:value-of select="$alt"/></xsl:attribute>
                          <xsl:attribute name="src"><xsl:value-of select="$image"/></xsl:attribute>
                          <xsl:attribute name="onerror">this.src='<xsl:value-of select="$placeholderUrl"/>'</xsl:attribute>
                        </img>
                      </xsl:when>
                      <xsl:otherwise>
                        <img loading="lazy">
                          <xsl:attribute name="alt"><xsl:value-of select="$alt"/></xsl:attribute>
                          <xsl:attribute name="src"><xsl:value-of select="$placeholderUrl"/></xsl:attribute>
                          <xsl:attribute name="onerror">this.src='<xsl:value-of select="$placeholderUrl"/>'</xsl:attribute>
                        </img>
                      </xsl:otherwise>
                    </xsl:choose>
                    <div class="rbccm-leadership__fpo" aria-hidden="true">
                      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="28" r="16" stroke="#003168" stroke-width="2.5"/>
                        <path d="M8 72c0-17.673 14.327-32 32-32s32 14.327 32 32" stroke="#003168" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                  </div>

                  <div class="rbccm-leadership__card-body">
                    <h3 class="rbccm-leadership__card-name"><xsl:value-of select="$name"/></h3>
                    <p class="rbccm-leadership__card-role">
                      <xsl:value-of select="$title" disable-output-escaping="yes"/>
                      <xsl:if test="$subtitle != ''">, <xsl:value-of select="$subtitle" disable-output-escaping="yes"/></xsl:if>
                    </p>

                    <!-- BIOGRAPHY MODE -->
                    <xsl:if test="($linkType = 'biography') or ($linkType = 'both')">
                      <xsl:if test="normalize-space($bio) != ''">
                        <button type="button"
                                class="rbccm-leadership__card-action rbccm-leadership__card-bio"
                                tabindex="0">
                          <xsl:attribute name="data-bio-target"><xsl:value-of select="$bioId"/></xsl:attribute>
                          <xsl:attribute name="aria-label">
                            <xsl:call-template name="fmtName">
                              <xsl:with-param name="tpl" select="$bioAriaTpl"/>
                              <xsl:with-param name="name" select="$name"/>
                            </xsl:call-template>
                          </xsl:attribute>
                          <span class="rbccm-leadership__card-bio-label"><xsl:value-of select="$bioBtnLabel"/></span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                            <circle cx="22" cy="22" r="21" stroke="#0051A5" stroke-width="2"/>
                            <path d="M16 19h12M16 23h12M16 27h8" stroke="#0051A5" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </button>
                        <!-- Hidden source content for the modal — copied in on click -->
                        <div class="rbccm-leadership__bio-source" hidden="hidden">
                          <xsl:attribute name="id"><xsl:value-of select="$bioId"/></xsl:attribute>
                          <xsl:attribute name="data-name"><xsl:value-of select="$name"/></xsl:attribute>
                          <xsl:attribute name="data-role">
                            <xsl:value-of select="$title"/>
                            <xsl:if test="$subtitle != ''">, <xsl:value-of select="$subtitle"/></xsl:if>
                          </xsl:attribute>
                          <xsl:attribute name="data-image"><xsl:value-of select="$image"/></xsl:attribute>
                          <xsl:attribute name="data-linkedin"><xsl:value-of select="$linkedin"/></xsl:attribute>
                          <xsl:attribute name="data-email"><xsl:value-of select="$email"/></xsl:attribute>
                          <xsl:attribute name="data-twitter"><xsl:value-of select="$twitter"/></xsl:attribute>
                          <xsl:value-of select="$bio" disable-output-escaping="yes"/>
                        </div>
                      </xsl:if>
                    </xsl:if>

                    <!-- LINKEDIN MODE -->
                    <xsl:if test="($linkType = 'linkedin') or ($linkType = 'both')">
                      <xsl:if test="$linkedin != ''">
                        <a target="_blank" rel="noopener noreferrer" tabindex="0">
                          <xsl:attribute name="class">rbccm-leadership__card-action rbccm-leadership__card-linkedin<xsl:if test="$linkType = 'both'"> rbccm-leadership__card-displayboth</xsl:if></xsl:attribute>
                          <xsl:attribute name="href"><xsl:value-of select="$linkedin"/></xsl:attribute>
                          <xsl:attribute name="aria-label">
                            <xsl:call-template name="fmtName">
                              <xsl:with-param name="tpl" select="$linkedInAriaTpl"/>
                              <xsl:with-param name="name" select="$name"/>
                            </xsl:call-template>
                          </xsl:attribute>
                          <svg class="li-default" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M37.8553 37.2923C26.5589 49.042 6.66437 44.7004 1.28498 29.3755C-4.58997 12.6383 10.6242 -3.77121 27.7414 0.765476C43.8478 5.03332 49.4409 25.2402 37.8553 37.2923ZM20.237 1.79323C6.52717 2.75097 -2.04867 17.5997 3.41284 30.14C9.35592 43.7846 27.8151 46.5916 37.4754 35.1855C49.2449 21.2898 38.3826 0.525573 20.237 1.79323Z" fill="#0051A5"/><path d="M23.0554 18.7546V20.5282L23.7582 19.6908C25.3429 18.3718 28.7278 18.3942 30.3657 19.6115C31.4465 20.4143 31.8319 22.088 31.9206 23.3771C32.111 26.1486 31.7806 29.1255 31.9215 31.9175H28.0018V24.5897C28.0018 23.9363 27.5809 22.7881 27.0452 22.3727C26.2827 21.78 24.6578 21.8976 23.9682 22.5827C23.7022 22.8469 23.2421 23.9615 23.2421 24.3106V31.9184H19.4623V18.7546H23.0554Z" fill="#0051A5"/><path d="M15.3943 15.5C15.3943 16.6 14.5 17.5 13.4 17.5C12.3 17.5 11.4 16.6 11.4 15.5C11.4 14.4 12.3 13.5 13.4 13.5C14.5 13.5 15.3943 14.4 15.3943 15.5Z" fill="#0051A5"/><path d="M15.1 18.75H11.7V31.92H15.1V18.75Z" fill="#0051A5"/></svg>
                          <svg class="li-hover" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="22" fill="#0051A5"/><path d="M23.0554 18.7546V20.5282L23.7582 19.6908C25.3429 18.3718 28.7278 18.3942 30.3657 19.6115C31.4465 20.4143 31.8319 22.088 31.9206 23.3771C32.111 26.1486 31.7806 29.1255 31.9215 31.9175H28.0018V24.5897C28.0018 23.9363 27.5809 22.7881 27.0452 22.3727C26.2827 21.78 24.6578 21.8976 23.9682 22.5827C23.7022 22.8469 23.2421 23.9615 23.2421 24.3106V31.9184H19.4623L19.3428 31.7784V18.6631H22.7288C22.7792 18.6631 22.936 18.8078 23.0554 18.7564V18.7546Z" fill="white"/><path d="M16.7098 18.7544H12.1357V31.9164H16.7098V18.7544Z" fill="white"/><path d="M16.0235 12.7206C18.2661 14.8536 14.8615 18.258 12.73 16.0149C10.5984 13.7717 13.8685 10.6707 16.0235 12.7206Z" fill="white"/></svg>
                        </a>
                      </xsl:if>
                    </xsl:if>

                  </div>

                </div>
              </xsl:for-each>

            </div>

            <button id="rbccm-lead-next" class="rbccm-leadership__btn" tabindex="0">
              <xsl:attribute name="aria-label"><xsl:value-of select="$nextLabel"/></xsl:attribute>
              <svg class="rbccm-leadership__btn-icon--mobile" xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg class="rbccm-leadership__btn-icon--desktop" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="-1" y="1" width="42" height="42" rx="21" transform="matrix(-1 0 0 1 42 0)" stroke="#003168" stroke-width="2"/>
                <path d="M18 31L27 21.5L18 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <div id="rbccm-lead-dots" class="rbccm-leadership__dots-wrap"></div>

          </div>
          <!-- / .rbccm-leadership__carousel -->

        </div>

        <!-- ── Bio Modal (Bootstrap pattern, single shared instance) ── -->
        <xsl:if test="$linkType = 'biography'">
          <div class="modal fade" id="rbccm-lead-modal" tabindex="-1" role="dialog" aria-labelledby="rbccm-lead-modal-name" aria-hidden="true">
            <div class="modal-dialog" style="top: 0px; width: auto; max-width: 960px;" role="document">
              <div class="modal-content">
                <div>
                  <div class="modal-header" style="border: none; border-top: 8px #FBDE00 solid; padding: 0px;">
                    <button class="close" style="font-size: 41px; color: #595959; font-weight: normal;" type="button" data-dismiss="modal" data-bs-dismiss="modal">
                      <xsl:attribute name="aria-label"><xsl:value-of select="$closeLabel"/></xsl:attribute>
                      <xsl:text>&#215;</xsl:text>
                    </button>
                  </div>
                  <div class="modal-body" style="padding: 0px;">
                    <div class="white-box-text" style="padding: 25px; padding-top: 10px;">
                      <div style="margin-bottom: 20px;">
                        <h2 class="rbccm-leadership__modal-name" id="rbccm-lead-modal-name" style="font-size: 20px;"></h2>
                        <p class="rbccm-leadership__modal-role" style="margin: 4px 0 16px 0; color: #4a4a4a;"></p>

                        <xsl:if test="/Properties/Datum[@ID='ContactIcons'] = 'true'">
                          <div class="contact-details">
                            <a class="blue-circle-outline rbccm-leadership__modal-linkedin" target="_blank" rel="noopener noreferrer" hidden="hidden">
                              <em class="fa fa-linkedin"></em>
                            </a>
                            <xsl:if test="/Properties/Datum[@ID='ShowEmail'] = 'true'">
                              <a class="blue-circle-outline rbccm-leadership__modal-email" target="_blank" rel="noopener noreferrer" hidden="hidden">
                                <i class="fa fa-envelope"></i>
                              </a>
                            </xsl:if>
                          </div>
                        </xsl:if>

                        <div class="rbccm-leadership__modal-body"></div>

                        <xsl:if test="/Properties/Datum[@ID='ContactIcons'] = 'false'">
                          <p class="rbccm-leadership__modal-footer" style="margin-top: 20px;">
                            <a class="rbccm-leadership__modal-linkedin" target="_blank" rel="noopener noreferrer" hidden="hidden">
                              <xsl:value-of select="$linkedInModalLabel"/>
                            </a>
                            <xsl:if test="/Properties/Datum[@ID='ShowEmail'] = 'true'">
                              <a class="rbccm-leadership__modal-email" target="_blank" rel="noopener noreferrer" hidden="hidden">
                                <xsl:value-of select="$emailModalLabel"/>
                              </a>
                            </xsl:if>
                          </p>
                        </xsl:if>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </xsl:if>

      </section>

      <!-- External component JS. All runtime behavior lives here; the XSL
           only emits markup + i18n data-attributes on the section. -->
      <script>
        <xsl:attribute name="src">/assets/rbccm/js/components/leadership-carousel.js?v=<xsl:value-of select="$assetVersion"/></xsl:attribute>
      </script>

    </xsl:if>

  </xsl:template>

</xsl:stylesheet>
