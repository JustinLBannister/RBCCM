<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: Secondary Navigation V2 — Sections -->

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- Only render if nav items exist -->
    <xsl:if test="
        /Properties/Data/Group[@ID='NavItem' or @Name='Navigation Item']
        | /Data/Group[@ID='NavItem' or @Name='Navigation Item']
      ">

      <!-- ── Load CSS ── -->
      <link rel="stylesheet" href="/assets/rbccm/css/sub/test/secondary-navigation-v2.css"/>

      <!-- ── Component HTML ── -->
      <nav class="secondary-nav secondary-nav--sections"
           itemscope=""
           itemtype="https://schema.org/SiteNavigationElement">

        <!-- aria-label from properties -->
        <xsl:attribute name="aria-label">
          <xsl:choose>
            <xsl:when test="/Properties/Datum[@ID='NavAriaLabel'] != ''">
              <xsl:value-of select="/Properties/Datum[@ID='NavAriaLabel']"/>
            </xsl:when>
            <xsl:otherwise>Section Navigation</xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>

        <!-- Sticky offset: inline top + data attribute for JS -->
        <xsl:variable name="offset">
          <xsl:choose>
            <xsl:when test="/Properties/Datum[@ID='StickyOffset'] != ''">
              <xsl:value-of select="/Properties/Datum[@ID='StickyOffset']"/>
            </xsl:when>
            <xsl:otherwise>60</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <xsl:attribute name="style">
          <xsl:text>top:</xsl:text>
          <xsl:value-of select="$offset"/>
          <xsl:text>px;</xsl:text>
        </xsl:attribute>

        <xsl:attribute name="data-sticky-offset">
          <xsl:value-of select="$offset"/>
        </xsl:attribute>

        <div class="secondary-nav__wrapper">
          <ul class="secondary-nav__list" data-nav-section="sections" role="list">

            <!-- ── Loop through nav items ── -->
            <xsl:for-each select="
                /Properties/Data/Group[@ID='NavItem' or @Name='Navigation Item']
                | /Data/Group[@ID='NavItem' or @Name='Navigation Item']
              ">
              <li itemprop="name">
                <!-- Build CSS class with optional modifier -->
                <xsl:attribute name="class">
                  <xsl:text>secondary-nav__item</xsl:text>
                  <xsl:if test="Datum[@ID='Key' or @Name='Item Key'] != ''">
                    <xsl:text> secondary-nav__item--</xsl:text>
                    <xsl:value-of select="Datum[@ID='Key' or @Name='Item Key']"/>
                  </xsl:if>
                </xsl:attribute>

                <!-- data-nav-item attribute -->
                <xsl:if test="Datum[@ID='Key' or @Name='Item Key'] != ''">
                  <xsl:attribute name="data-nav-item">
                    <xsl:value-of select="Datum[@ID='Key' or @Name='Item Key']"/>
                  </xsl:attribute>
                </xsl:if>

                <a itemprop="url">
                  <xsl:attribute name="href">
                    <xsl:value-of select="Datum[@ID='Href' or @Name='Link URL / Anchor']"/>
                  </xsl:attribute>

                  <!-- Link text -->
                  <xsl:value-of select="Datum[@ID='Label' or @Name='Link Label']"/>

                  <!-- Inline SVG chevron -->
                  <svg class="secondary-nav__chevron"
                       xmlns="http://www.w3.org/2000/svg"
                       width="10" height="15"
                       viewBox="0 0 10 15"
                       fill="none"
                       aria-hidden="true">
                    <path d="M2.73876 14.6125L9.52646 8.49415C9.67651 8.36156 9.79561 8.20382 9.87688 8.03003C9.95816 7.85623 10 7.66982 10 7.48154C10 7.29327 9.95816 7.10686 9.87688 6.93306C9.79561 6.75927 9.67651 6.60153 9.52646 6.46894L2.73876 0.421867C2.58994 0.288192 2.41288 0.18209 2.2178 0.109684C2.02272 0.037278 1.81348 0 1.60214 0C1.39081 0 1.18156 0.037278 0.986483 0.109684C0.791402 0.18209 0.614344 0.288192 0.465522 0.421867C0.167357 0.689083 0 1.05055 0 1.42734C0 1.80412 0.167357 2.16559 0.465522 2.43281L6.13261 7.48154L0.465522 12.5303C0.169769 12.7959 0.0030365 13.1545 0.00126839 13.5286C4.95911e-05 13.7163 0.040432 13.9024 0.120099 14.0762C0.199765 14.2499 0.31715 14.408 0.465522 14.5412C0.608989 14.6797 0.781828 14.7914 0.974054 14.87C1.16628 14.9486 1.37408 14.9925 1.58545 14.9991C1.79683 15.0057 2.00758 14.975 2.20553 14.9086C2.40348 14.8423 2.58472 14.7416 2.73876 14.6125Z" fill="#003168"/>
                  </svg>
                </a>
              </li>
            </xsl:for-each>

          </ul>
        </div>

        <!-- Progress bar — visible in overflow/mobile state only (CSS-controlled) -->
        <div class="secondary-nav__progress-bar" aria-hidden="true">
          <div class="secondary-nav__progress-fill"></div>
        </div>

      </nav>

      <!-- ── Load JS ── -->
      <script src="/assets/rbccm/js/sub/test/secondary-navigation-v2.js"></script>

    </xsl:if>

  </xsl:template>
</xsl:stylesheet>


<Properties ComponentID="secondary-nav-v2">
  <!-- Accessibility -->
  <Datum ID="NavAriaLabel" Type="String" Name="Navigation Aria Label">Section Navigation</Datum>
  <!-- Layout -->
  <Datum ID="StickyOffset" Type="String" Name="Sticky Offset (px)">60</Datum>
</Properties>


<Data>
  <Datum ID="Id" Type="String" Name="Id">secondary-nav-v2</Datum>
  <Group ID="NavItem" Name="Navigation Item" Replicatable="true" CloneGroupID="nav-item">
    <Datum ID="Label" Type="String" Name="Link Label">
      <!-- e.g. "Our industry expertise" -->
    </Datum>
    <Datum ID="Href" Type="String" Name="Link URL / Anchor">
      <!-- e.g. "#expertise" or "/page-url" -->
    </Datum>
    <Datum ID="Key" Type="String" Name="Item Key">
      <!-- e.g. "expertise" — used for data attributes and CSS modifier classes -->
    </Datum>
  </Group>
</Data>
