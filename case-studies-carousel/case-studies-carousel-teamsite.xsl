<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  
  <xsl:template name="clean">
    <xsl:param name="s" select="''"/>
    <xsl:value-of select="normalize-space(translate(string($s), '&#160;', ' '))"/>
  </xsl:template>

  <xsl:template name="story-url">
    <xsl:param name="path" select="''"/>
    <xsl:if test="$path != ''">
      <xsl:variable name="tail" select="substring-after($path, 'templatedata/rbccm/casestudy/data/')"/>
      <xsl:text>/en/expertise/transactions/case-study/</xsl:text>
      <xsl:choose>
        <xsl:when test="$tail != ''"><xsl:value-of select="$tail"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$path"/></xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  
  <xsl:template match="/">

    <xsl:variable name="heading">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='Heading']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Heading'])"/>
        </xsl:when>
        <xsl:otherwise>Signature case studies</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="headingId" select="normalize-space(/Properties/Datum[@ID='HeadingId'])"/>

    <xsl:variable name="ariaLabel">
      <xsl:choose>
        <xsl:when test="normalize-space(/Properties/Datum[@ID='AriaLabel']) != ''">
          <xsl:value-of select="normalize-space(/Properties/Datum[@ID='AriaLabel'])"/>
        </xsl:when>
        <xsl:otherwise><xsl:value-of select="$heading"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="introRaw" select="/Properties/Datum[@ID='Intro']"/>
    <xsl:variable name="intro">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$introRaw"/></xsl:call-template>
    </xsl:variable>

    <xsl:variable name="ctaLabel" select="normalize-space(/Properties/Datum[@ID='CtaLabel'])"/>
    <xsl:variable name="ctaLink"  select="normalize-space(/Properties/Datum[@ID='CtaLink'])"/>
    <xsl:variable name="ctaNewTab" select="/Properties/Datum[@ID='CtaNewTab'] = 'true'"/>
    <xsl:variable name="ariaViewAllLabel" select="normalize-space(/Properties/Datum[@ID='AriaViewAllLabel'])"/>

    <xsl:variable name="regionLabel"      select="normalize-space(/Properties/Datum[@ID='RegionLabel'])"/>
    <xsl:variable name="instructionsText" select="normalize-space(/Properties/Datum[@ID='InstructionsText'])"/>
    <xsl:variable name="prevArrowAriaLabel" select="normalize-space(/Properties/Datum[@ID='PrevArrowAriaLabel'])"/>
    <xsl:variable name="nextArrowAriaLabel" select="normalize-space(/Properties/Datum[@ID='NextArrowAriaLabel'])"/>

    <xsl:variable name="transitionMode">
      <xsl:choose>
        <xsl:when test="translate(normalize-space(/Properties/Datum[@ID='TransitionMode']),
                                  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                                  'abcdefghijklmnopqrstuvwxyz') = 'fade'">fade</xsl:when>
        <xsl:otherwise>slide</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="slides"     select="/Properties/Data/Group[@ID='CaseStudy' or @Name='Case Study']"/>
    <xsl:variable name="slideCount" select="count($slides)"/>

    <xsl:variable name="padTopMobile"     select="normalize-space(/Properties/Datum[@ID='PadTopMobile'])"/>
    <xsl:variable name="padBottomMobile"  select="normalize-space(/Properties/Datum[@ID='PadBottomMobile'])"/>
    <xsl:variable name="padTopDesktop"    select="normalize-space(/Properties/Datum[@ID='PadTopDesktop'])"/>
    <xsl:variable name="padBottomDesktop" select="normalize-space(/Properties/Datum[@ID='PadBottomDesktop'])"/>
    <xsl:variable name="hasPadOverride"
                  select="$padTopMobile != '' or $padBottomMobile != ''
                       or $padTopDesktop != '' or $padBottomDesktop != ''"/>

    
    <xsl:if test="$slideCount &gt;= 3">

      <link rel="stylesheet" href="/assets/rbccm/css/components/case-studies-carousel.css"/>

      <xsl:if test="$hasPadOverride">
        <style>
          #rbccm-case-studies {
            <xsl:if test="$padTopMobile     != ''">--cs-pad-top-mobile: <xsl:value-of select="$padTopMobile"/>;</xsl:if>
            <xsl:if test="$padBottomMobile  != ''">--cs-pad-bottom-mobile: <xsl:value-of select="$padBottomMobile"/>;</xsl:if>
            <xsl:if test="$padTopDesktop    != ''">--cs-pad-top-desktop: <xsl:value-of select="$padTopDesktop"/>;</xsl:if>
            <xsl:if test="$padBottomDesktop != ''">--cs-pad-bottom-desktop: <xsl:value-of select="$padBottomDesktop"/>;</xsl:if>
          }
        </style>
      </xsl:if>

      
      <section class="rbccm-case-studies" id="rbccm-case-studies">
        <xsl:attribute name="aria-label"><xsl:value-of select="$ariaLabel"/></xsl:attribute>
        
        <xsl:if test="$regionLabel      != ''"><xsl:attribute name="data-region-label"><xsl:value-of select="$regionLabel"/></xsl:attribute></xsl:if>
        <xsl:if test="$instructionsText != ''"><xsl:attribute name="data-instructions"><xsl:value-of select="$instructionsText"/></xsl:attribute></xsl:if>
        
        <xsl:attribute name="data-transition"><xsl:value-of select="$transitionMode"/></xsl:attribute>

        <div class="rbccm-case-studies__container">

          <header class="rbccm-case-studies__header">
            <h2 class="rbccm-case-studies__heading">
              <xsl:if test="$headingId != ''">
                <xsl:attribute name="id"><xsl:value-of select="$headingId"/></xsl:attribute>
              </xsl:if>
              <xsl:if test="$headingId = ''">
                <xsl:attribute name="id">rbccm-case-studies-heading</xsl:attribute>
              </xsl:if>
              <xsl:value-of select="$heading"/>
            </h2>
            <xsl:if test="$intro != ''">
              <p class="rbccm-case-studies__intro"><xsl:value-of select="$intro"/></p>
            </xsl:if>
          </header>

          <div class="rbccm-case-studies__carousel">

            <button type="button"
                    class="rbccm-case-studies__btn rbccm-case-studies__btn--prev"
                    tabindex="0">
              <xsl:attribute name="aria-label">
                <xsl:choose>
                  <xsl:when test="$prevArrowAriaLabel != ''"><xsl:value-of select="$prevArrowAriaLabel"/></xsl:when>
                  <xsl:otherwise>Previous case study</xsl:otherwise>
                </xsl:choose>
              </xsl:attribute>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--mobile" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--desktop" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="21" stroke="#003168" stroke-width="2"/>
                <path d="M25 31L16 21.5L25 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <div class="rbccm-case-studies__track">
              <xsl:for-each select="$slides">
                <xsl:call-template name="render-slide"/>
              </xsl:for-each>
            </div>

            <button type="button"
                    class="rbccm-case-studies__btn rbccm-case-studies__btn--next"
                    tabindex="0">
              <xsl:attribute name="aria-label">
                <xsl:choose>
                  <xsl:when test="$nextArrowAriaLabel != ''"><xsl:value-of select="$nextArrowAriaLabel"/></xsl:when>
                  <xsl:otherwise>Next case study</xsl:otherwise>
                </xsl:choose>
              </xsl:attribute>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--mobile" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="rbccm-case-studies__btn-icon--desktop" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="42" height="42" rx="21" stroke="#003168" stroke-width="2"/>
                <path d="M19 31L28 21.5L19 12" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <div class="rbccm-case-studies__dots-wrap"></div>

          </div>

          <xsl:if test="$ctaLabel != '' and $ctaLink != ''">
            <div class="rbccm-case-studies__viewall-wrap">
              <a class="rbccm-case-studies__viewall">
                <xsl:attribute name="href"><xsl:value-of select="$ctaLink"/></xsl:attribute>
                <xsl:if test="$ctaNewTab">
                  <xsl:attribute name="target">_blank</xsl:attribute>
                  <xsl:attribute name="rel">noopener</xsl:attribute>
                </xsl:if>
                <xsl:if test="$ariaViewAllLabel != ''">
                  <xsl:attribute name="aria-label"><xsl:value-of select="$ariaViewAllLabel"/></xsl:attribute>
                </xsl:if>
                <xsl:value-of select="$ctaLabel"/>
              </a>
            </div>
          </xsl:if>

        </div>
      </section>

      <script src="/assets/rbccm/js/components/case-studies-carousel.js"></script>

    </xsl:if>

  </xsl:template>

  
  <xsl:template name="render-slide">

    <xsl:variable name="dcr"     select="Datum[@Name='Case Study Record']/DCR/press_release"/>
    <xsl:variable name="dcrPath" select="Datum[@Name='Case Study Record']/DCR/@path"/>

    <xsl:variable name="ovEyebrow"  select="normalize-space(Datum[@Name='Eyebrow Label (blank = record subcategory or Expertise)'])"/>
    <xsl:variable name="ovTitle"    select="normalize-space(Datum[@Name='Title'])"/>
    <xsl:variable name="ovDescRaw" select="Datum[@Name='Description']"/>
    <xsl:variable name="ovDesc">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$ovDescRaw"/></xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ovImage"    select="normalize-space(Datum[@Name='Card Image']/Image/Path)"/>
    <xsl:variable name="ovImageAlt" select="normalize-space(Datum[@Name='Card Image Alt Text (blank = title)'])"/>
    <xsl:variable name="ovMeta"     select="normalize-space(Datum[@Name='Read Time (e.g. 4 min read)'])"/>
    <xsl:variable name="ovLink"     select="normalize-space(Datum[@Name='Card Link URL'])"/>
    <xsl:variable name="ovNewTab"   select="Datum[@Name='Open Card Link in New Tab'] = 'true'"/>

    <xsl:variable name="eyebrow">
      <xsl:choose>
        <xsl:when test="$ovEyebrow != ''"><xsl:value-of select="$ovEyebrow"/></xsl:when>
        <xsl:when test="normalize-space($dcr/eyebrow) != ''"><xsl:value-of select="normalize-space($dcr/eyebrow)"/></xsl:when>
        <xsl:when test="normalize-space($dcr/subcategory) != ''"><xsl:value-of select="normalize-space($dcr/subcategory)"/></xsl:when>
        <xsl:otherwise>Expertise</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="titleRaw">
      <xsl:choose>
        <xsl:when test="$ovTitle != ''"><xsl:value-of select="$ovTitle"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$dcr/title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="title">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$titleRaw"/></xsl:call-template>
    </xsl:variable>

    <xsl:variable name="descRaw">
      <xsl:choose>
        <xsl:when test="$ovDesc != ''"><xsl:value-of select="$ovDesc"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$dcr/description"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="desc">
      <xsl:call-template name="clean"><xsl:with-param name="s" select="$descRaw"/></xsl:call-template>
    </xsl:variable>

    <xsl:variable name="imagePath">
      <xsl:choose>
        <xsl:when test="$ovImage != ''"><xsl:value-of select="$ovImage"/></xsl:when>
        
        <xsl:otherwise><xsl:value-of select="normalize-space($dcr/thumbnail)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="imageAlt">
      <xsl:choose>
        <xsl:when test="$ovImageAlt != ''"><xsl:value-of select="$ovImageAlt"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$title"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="meta">
      <xsl:choose>
        <xsl:when test="$ovMeta != ''"><xsl:value-of select="$ovMeta"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="normalize-space($dcr/time_to_read)"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="link">
      <xsl:choose>
        <xsl:when test="$ovLink != ''"><xsl:value-of select="$ovLink"/></xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="story-url"><xsl:with-param name="path" select="$dcrPath"/></xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$title != '' or $dcr">
      <div class="rbccm-case-studies__slide">
        <a class="rbccm-case-studies__card">
          <xsl:attribute name="href">
            <xsl:choose>
              <xsl:when test="$link != ''"><xsl:value-of select="$link"/></xsl:when>
              <xsl:otherwise>#</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:if test="$ovNewTab">
            <xsl:attribute name="target">_blank</xsl:attribute>
            <xsl:attribute name="rel">noopener</xsl:attribute>
          </xsl:if>

          <div class="rbccm-case-studies__media">
            <xsl:if test="$imagePath != ''">
              <img loading="lazy">
                <xsl:attribute name="src"><xsl:value-of select="$imagePath"/></xsl:attribute>
                <xsl:attribute name="alt"><xsl:value-of select="$imageAlt"/></xsl:attribute>
              </img>
            </xsl:if>
          </div>

          <div class="rbccm-case-studies__body">
            <p class="rbccm-case-studies__eyebrow"><xsl:value-of select="$eyebrow"/></p>
            <div class="rbccm-case-studies__divider" aria-hidden="true"></div>
            <h3 class="rbccm-case-studies__title"><xsl:value-of select="$title"/></h3>
            <xsl:if test="$desc != ''">
              <p class="rbccm-case-studies__desc"><xsl:value-of select="$desc"/></p>
            </xsl:if>
            <xsl:if test="$meta != ''">
              <span class="rbccm-case-studies__cta">
                <xsl:value-of select="$meta"/>
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="10" viewBox="0 0 8 10" fill="currentColor" aria-hidden="true"><path d="M2 0L1 1l3 4-3 4 1 1 4-5z"/></svg>
              </span>
            </xsl:if>
          </div>
        </a>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>

<Properties ComponentID="case-studies-carousel-v1">

  <Datum ID="Heading" Type="String" Name="Section Heading">Signature case studies</Datum>

  <Datum ID="Intro" Type="Textarea" Name="Section Intro (optional)"></Datum>

  <Datum ID="AriaLabel" Type="String" Name="Section Aria Label (blank = heading)"></Datum>

  <Datum ID="HeadingId" Type="String" Name="Section Heading Anchor Id (optional, e.g. case-studies)"></Datum>

  
  <Datum ID="TransitionMode" Type="String" Name="Transition Mode (slide or fade)">slide</Datum>

  
  <Datum ID="CtaLabel" Type="String" Name="View All Button Label (blank = no button)">View all</Datum>
  <Datum ID="CtaLink"  Type="String" Name="View All Button Link (blank = no button)">/en/expertise/transactions</Datum>
  <Datum ID="CtaNewTab" Type="Boolean" Name="Open View All in New Tab">false</Datum>

  

  <Datum ID="Locale" Type="String" Name="Locale (en or fr)">en</Datum>

  <Datum ID="RegionLabel" Type="String" Name="Carousel Region Aria Label (blank = heading)"></Datum>

  <Datum ID="InstructionsText" Type="String" Name="Screen Reader Instructions (blank = none)"></Datum>

  <Datum ID="PrevArrowAriaLabel" Type="String" Name="Prev Arrow Aria Label (override)"></Datum>
  <Datum ID="NextArrowAriaLabel" Type="String" Name="Next Arrow Aria Label (override)"></Datum>
  <Datum ID="AriaViewAllLabel"   Type="String" Name="View All Aria Label (override)"></Datum>

  
  <Datum ID="PadTopMobile"     Type="String" Name="Mobile padding-top (blank = 40px)"/>
  <Datum ID="PadBottomMobile"  Type="String" Name="Mobile padding-bottom (blank = 40px)"/>
  <Datum ID="PadTopDesktop"    Type="String" Name="Desktop padding-top (blank = 64px)"/>
  <Datum ID="PadBottomDesktop" Type="String" Name="Desktop padding-bottom (blank = 64px)"/>

</Properties>

<Data>

  <Group ID="CaseStudy"
         Name="Case Study"
         Replicatable="true"
         CloneGroupID="case-studies-slide">

    <Datum ID="CaseStudyRecord" Type="DCR" Name="Case Study Record">
      <DCR></DCR>
    </Datum>

    
    <Datum ID="EyebrowOverride" Type="String" Name="Eyebrow Label (blank = record subcategory or Expertise)"></Datum>

    <Datum ID="TitleOverride" Type="String" Name="Title"></Datum>
    <Datum ID="DescriptionOverride" Type="Textarea" Name="Description"></Datum>

    <Datum ID="ImageOverride" Type="Image" Name="Card Image">
      <Image>
        <Path/>
        <Description/>
      </Image>
    </Datum>
    <Datum ID="ImageAltOverride" Type="String" Name="Card Image Alt Text (blank = title)"></Datum>

    <Datum ID="MetaOverride" Type="String" Name="Read Time (e.g. 4 min read)"></Datum>

    <Datum ID="LinkOverride" Type="String" Name="Card Link URL"></Datum>
    <Datum ID="LinkNewTab" Type="Boolean" Name="Open Card Link in New Tab">false</Datum>

  </Group>

</Data>
