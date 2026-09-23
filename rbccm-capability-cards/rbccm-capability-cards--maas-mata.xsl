<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Capability Cards :: maas-mata (single-skin build)
  ============================================================
  Standalone skin for TeamSite's Skin dropdown. MAAS+MATA "MATA
  capabilities": Card1-Card3 in a 3-up row plus Card4 as the
  full-width wide card underneath. Cards are static <article>s:
  no links, no "Learn more" chip (CTA fields are ignored).
  Transparent section so the page's dark-strip gradient shows
  through (SectionBgColor still overrides).

  Always Card1-Card4. A blank title hides that card.
  Companion skin: rbccm-capability-cards (double-dash) us-credentials.xsl
  Fields: rbccm-capability-cards-properties.xml (shared).
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <!-- Tag allow-list guard. -->
  <xsl:template name="pickTag">
    <xsl:param name="raw"/>
    <xsl:param name="default"/>
    <xsl:choose>
      <xsl:when test="$raw = 'h1' or $raw = 'h2' or $raw = 'h3' or $raw = 'h4' or $raw = 'h5' or $raw = 'h6' or $raw = 'p' or $raw = 'div' or $raw = 'span'">
        <xsl:value-of select="$raw"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$default"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Icons: the exact design glyphs (same as the local test sprite).
       Name typed in Card{N}IconType, case-insensitive:
         investment-banking  corporate-banking  markets  research  info
       Older names still work (chart-trend, building, globe, search).
       Blank or unknown uses the $fallback passed in. Colour comes
       from currentColor on __icon (yellow). -->
  <xsl:template name="renderIcon">
    <xsl:param name="type"/>
    <xsl:param name="fallback" select="'investment-banking'"/>
    <xsl:variable name="t">
      <xsl:choose>
        <xsl:when test="$type = 'investment-banking' or $type = 'gib' or $type = 'chart-trend'">investment-banking</xsl:when>
        <xsl:when test="$type = 'corporate-banking' or $type = 'cb' or $type = 'building'">corporate-banking</xsl:when>
        <xsl:when test="$type = 'markets' or $type = 'gm' or $type = 'globe'">markets</xsl:when>
        <xsl:when test="$type = 'research' or $type = 'gr' or $type = 'search'">research</xsl:when>
        <xsl:when test="$type = 'info'">info</xsl:when>
        <xsl:otherwise><xsl:value-of select="$fallback"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$t = 'investment-banking'"><svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 30" fill="none" aria-hidden="true" focusable="false"><path d="M31.9491 0.200487C31.832 0.09921 31.5412 0 31.358 0L29.2814 0.0199798C29.0934 0.0220467 28.9197 0.0978321 28.7923 0.233557C28.6621 0.372038 28.5939 0.558745 28.6035 0.746142C28.6228 1.10371 28.9066 1.37378 29.278 1.38894L29.7844 1.40961L26.5532 4.56917C23.2324 7.81692 19.2378 10.3047 14.6803 11.9651C10.395 13.5263 5.73285 14.3179 0.823331 14.3179H0.756502C0.523634 14.3179 0.318324 14.3985 0.179844 14.5446C0.0544532 14.6769 -0.00893092 14.856 0.0007145 15.0489C0.0206943 15.4368 0.325214 15.6972 0.758569 15.6972C5.85066 15.6938 10.6747 14.8801 15.0965 13.279C19.8131 11.5711 23.9572 9.00262 27.4137 5.64395L30.7875 2.36588L30.8054 2.91705C30.8178 3.30218 31.112 3.59292 31.4895 3.59292C31.5026 3.59292 31.5157 3.59292 31.5281 3.59154C31.8354 3.57569 32.1689 3.31251 32.1737 2.91498L32.1978 0.841218C32.1999 0.646932 32.0917 0.324499 31.9477 0.200487H31.9491Z" fill="currentColor"/><path d="M30.9363 19.2777C30.9232 19.2777 30.9108 19.2777 30.8977 19.2791C30.5835 19.297 30.2501 19.5437 30.2501 19.966L30.2487 27.6548C30.2487 27.8821 30.0606 28.0737 29.8381 28.0737H28.7371C28.5063 28.073 28.3251 27.8863 28.3251 27.6479V11.1749C28.3251 10.9372 28.5063 10.7505 28.7371 10.7498L29.8388 10.7484C30.0606 10.7484 30.2487 10.9386 30.2487 11.1632L30.2521 15.0117C30.2521 15.4389 30.6028 15.6945 30.9411 15.6945C30.9535 15.6945 30.9659 15.6945 30.9783 15.6938C31.2897 15.6772 31.6259 15.4113 31.6252 15.0124V11.1577C31.6238 10.1745 30.826 9.37396 29.8443 9.37396L28.7309 9.37534C27.7319 9.37603 26.95 10.1635 26.95 11.168V27.6555C26.95 28.66 27.7326 29.4474 28.7316 29.4481H29.8463C30.8274 29.4481 31.6252 28.6469 31.6252 27.661V19.9653C31.6252 19.5354 31.2759 19.2777 30.937 19.2777H30.9363Z" fill="currentColor"/><path d="M23.2366 14.4626H22.135C21.8381 14.4626 21.5852 14.703 21.5852 15.0234V28.1997C21.5852 28.5229 21.8381 28.7578 22.135 28.7592L23.2704 28.7661C23.5653 28.7116 23.7857 28.5112 23.7857 28.1991V15.0234C23.7857 14.7024 23.5322 14.4619 23.2366 14.4619V14.4626Z" fill="currentColor"/><path d="M23.2427 13.2252H22.1293C21.1304 13.2252 20.3484 14.012 20.3484 15.0165V28.2073C20.3484 29.2125 21.1276 29.9993 22.1218 29.9993L23.2868 29.9938C24.2451 29.989 25.0243 29.1877 25.0243 28.2073V15.0172C25.0243 14.0127 24.2424 13.2259 23.2434 13.2259L23.2427 13.2252Z" fill="currentColor"/><path d="M16.6356 17.7627H15.534C15.237 17.7627 14.9849 18.0059 14.9849 18.3214V28.2025C14.9849 28.5201 15.2377 28.7578 15.5347 28.7598L16.6701 28.766C16.9642 28.7144 17.1854 28.507 17.1854 28.2018V18.3214C17.1854 18.0052 16.9319 17.7627 16.6363 17.7627H16.6356Z" fill="currentColor"/><path d="M16.6418 16.5261H15.5278C14.546 16.5261 13.7468 17.3287 13.7468 18.3153V28.2101C13.7468 29.1967 14.5419 30 15.5195 30L16.6845 29.9945C17.6422 29.9897 18.4221 29.1891 18.4221 28.2108V18.316C18.4221 17.8323 18.2368 17.3811 17.8992 17.0448C17.5643 16.7107 17.1172 16.5268 16.6418 16.5268V16.5261Z" fill="currentColor"/><path d="M10.0348 21.0635H8.93313C8.63619 21.0635 8.38403 21.3101 8.38403 21.6188V28.2066C8.38403 28.5173 8.63688 28.7592 8.93313 28.7605L10.0692 28.766C10.3627 28.7171 10.5839 28.5022 10.5839 28.2052V21.6181C10.5839 21.3088 10.3303 21.0628 10.0348 21.0628V21.0635Z" fill="currentColor"/><path d="M10.041 19.8262H8.927C8.45162 19.8262 8.00517 20.0108 7.66965 20.3456C7.33206 20.6825 7.14673 21.1317 7.14673 21.612V28.2129C7.14673 29.1981 7.94179 29.9993 8.91942 29.9993L10.0844 29.9938C11.0421 29.989 11.8213 29.1905 11.8213 28.2136V21.6126C11.8213 20.6281 11.0228 19.8269 10.041 19.8269V19.8262Z" fill="currentColor"/><path d="M3.43997 23.1263H2.32592C1.34416 23.1263 0.545654 23.9255 0.545654 24.9079V28.217C0.545654 29.2001 1.34071 29.9993 2.31834 29.9993L3.48337 29.9938C4.44102 29.989 5.21955 29.1926 5.22024 28.2177V24.9086C5.22024 24.4319 5.03491 23.9847 4.69801 23.6478C4.36179 23.3116 3.91535 23.127 3.44066 23.127L3.43997 23.1263Z" fill="currentColor"/><path d="M3.43395 24.3636H2.3323C2.03605 24.3636 1.7832 24.6144 1.7832 24.9148V28.2107C1.7832 28.5132 2.03605 28.7598 2.3323 28.7605L3.4684 28.7654C3.76051 28.7199 3.98305 28.496 3.98305 28.2094V24.9141C3.98305 24.613 3.72951 24.3629 3.43395 24.3629V24.3636Z" fill="currentColor"/><path d="M30.9343 16.5267C30.9219 16.5267 30.9102 16.5267 30.8978 16.5274C30.587 16.544 30.2515 16.8078 30.2522 17.2067L30.2536 17.7662C30.2543 18.1237 30.5374 18.4214 30.8978 18.4434C30.9095 18.4441 30.9219 18.4448 30.9336 18.4448C31.2409 18.4448 31.5757 18.2312 31.6039 17.8736C31.6212 17.6594 31.6274 17.441 31.6239 17.2074C31.6184 16.8257 31.3153 16.5267 30.9343 16.5267Z" fill="currentColor"/></svg></xsl:when>
      <xsl:when test="$t = 'corporate-banking'"><svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M15 0L2.60652 5.625H0.937811C0.689175 5.625 0.450724 5.72377 0.274912 5.89959C0.0991001 6.0754 0.000333786 6.31386 0.000333786 6.5625V10.3125C0.000333786 10.5611 0.0991001 10.7996 0.274912 10.9754C0.450724 11.1512 0.689175 11.25 0.937811 11.25H1.87529V24.375C1.66592 24.3752 1.46264 24.4454 1.29783 24.5745C1.13302 24.7037 1.01618 24.8842 0.965935 25.0875L0.0284557 28.8375C-0.00644112 28.9756 -0.00927925 29.1199 0.0201569 29.2592C0.0495949 29.3986 0.110525 29.5294 0.198288 29.6416C0.286051 29.7538 0.398319 29.8444 0.526499 29.9065C0.654678 29.9686 0.795372 30.0006 0.937811 30H29.0622C29.2046 30.0006 29.3453 29.9686 29.4735 29.9065C29.6017 29.8444 29.7139 29.7538 29.8017 29.6416C29.8895 29.5294 29.9504 29.3986 29.9798 29.2592C30.0093 29.1199 30.0064 28.9756 29.9715 28.8375L29.0341 25.0875C28.9838 24.8842 28.867 24.7037 28.7022 24.5745C28.5374 24.4454 28.3341 24.3752 28.1247 24.375V11.25H29.0622C29.3108 11.25 29.5493 11.1512 29.7251 10.9754C29.9009 10.7996 29.9997 10.5611 29.9997 10.3125V6.5625C29.9997 6.31386 29.9009 6.0754 29.7251 5.89959C29.5493 5.72377 29.3108 5.625 29.0622 5.625H27.3935L15 0ZM22.918 5.625H7.08018L15 1.875L22.918 5.625ZM26.2498 11.25V24.375H24.3748V11.25H26.2498ZM22.4998 11.25V24.375H17.8124V11.25H22.4998ZM15.9375 11.25V24.375H14.0625V11.25H15.9375ZM12.1876 11.25V24.375H7.50017V11.25H12.1876ZM5.62521 11.25V24.375H3.75025V11.25H5.62521ZM1.87529 9.375V7.5H28.1247V9.375H1.87529ZM2.60652 26.25H27.3935L27.8622 28.125H2.13778L2.60652 26.25Z" fill="currentColor"/></svg></xsl:when>
      <xsl:when test="$t = 'markets'"><svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M30 15C30 11.0218 28.4196 7.20644 25.6066 4.3934C22.7936 1.58035 18.9782 0 15 0C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15C0 18.9782 1.58035 22.7936 4.3934 25.6066C7.20644 28.4196 11.0218 30 15 30C18.9782 30 22.7936 28.4196 25.6066 25.6066C28.4196 22.7936 30 18.9782 30 15ZM15.9375 2.01938C17.1938 2.40188 18.4406 3.55687 19.4756 5.4975C19.7444 6.00125 19.9913 6.54625 20.2163 7.1325C18.8944 7.42687 17.4563 7.61438 15.9375 7.67063V2.01938ZM22.0331 6.63562C21.7656 5.91437 21.465 5.24062 21.1313 4.61438C20.8049 4.0026 20.4306 3.41764 20.0119 2.865C21.6084 3.52606 23.0586 4.49586 24.2794 5.71875C23.5994 6.065 22.8506 6.36938 22.0331 6.63562ZM23.4206 14.0625C23.3531 12.0562 23.0681 10.1494 22.6031 8.4225C23.6185 8.09921 24.6011 7.68047 25.5375 7.17188C27.0312 9.17671 27.9176 11.5684 28.0912 14.0625H23.4206ZM20.7956 8.92312C21.2383 10.6025 21.4899 12.3266 21.5456 14.0625H15.9375V9.54562C17.6438 9.48938 19.2806 9.27375 20.7956 8.92312ZM14.0625 9.54375V14.0625H8.45625C8.51132 12.3267 8.76229 10.6026 9.20438 8.92312C10.7194 9.27375 12.3563 9.48563 14.0625 9.54375ZM21.5437 15.9375C21.4781 17.7881 21.2137 19.5263 20.7956 21.0769C19.1999 20.7146 17.573 20.5068 15.9375 20.4562V15.9375H21.5437ZM14.0625 15.9375V20.4544C12.3563 20.5106 10.7194 20.7262 9.20438 21.0769C8.78625 19.5263 8.52188 17.7881 8.45437 15.9375H14.0625ZM20.2163 22.8675C19.9913 23.4538 19.7444 23.9987 19.4756 24.5025C18.4406 26.4431 17.1919 27.5963 15.9375 27.9806V22.3312C17.4563 22.3875 18.8944 22.5731 20.2163 22.8675ZM20.01 27.135C20.4294 26.5824 20.8043 25.9975 21.1313 25.3856C21.4759 24.7317 21.7771 24.0559 22.0331 23.3625C22.8044 23.6105 23.5554 23.9177 24.2794 24.2812C23.0586 25.5041 21.6065 26.4739 20.01 27.135ZM22.6031 21.5775C23.0893 19.7347 23.3642 17.8425 23.4225 15.9375H28.0912C27.9176 18.4316 27.0312 20.8233 25.5375 22.8281C24.6562 22.3444 23.6719 21.9244 22.6031 21.5775ZM9.98812 27.135C8.39247 26.4743 6.9429 25.5051 5.7225 24.2831C6.4459 23.9196 7.19625 23.6125 7.96688 23.3644C8.22294 24.0571 8.52422 24.7323 8.86875 25.3856C9.19508 25.9974 9.56938 26.5824 9.98812 27.135ZM14.0625 22.3294V27.9806C12.8062 27.5981 11.5594 26.4431 10.5244 24.5025C10.2544 23.9987 10.0075 23.4538 9.78375 22.8675C11.1907 22.5587 12.6229 22.3773 14.0625 22.3294ZM7.39687 21.5775C6.32812 21.9244 5.34375 22.3444 4.4625 22.8281C2.96877 20.8233 2.08237 18.4316 1.90875 15.9375H6.5775C6.63583 17.8425 6.91072 19.7347 7.39687 21.5775ZM1.90875 14.0625C2.08237 11.5684 2.96877 9.17671 4.4625 7.17188C5.34375 7.65562 6.32812 8.07563 7.39687 8.4225C6.93188 10.1475 6.64688 12.0562 6.5775 14.0625H1.90875ZM8.86875 4.61438C8.53625 5.24188 8.235 5.91563 7.965 6.63562C7.19501 6.38742 6.4453 6.08026 5.7225 5.71688C6.94306 4.49554 8.39262 3.52704 9.98812 2.86688C9.57937 3.3975 9.20437 3.98625 8.86875 4.61438ZM9.78375 7.1325C9.99777 6.5732 10.2451 6.02723 10.5244 5.4975C11.5594 3.55687 12.8062 2.40375 14.0625 2.01938V7.66875C12.5438 7.6125 11.1056 7.42687 9.78375 7.1325Z" fill="currentColor"/></svg></xsl:when>
      <xsl:when test="$t = 'research'"><svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M7.98289 19.3935C6.16741 16.9158 5.35427 13.8439 5.70616 10.7923C6.05805 7.74072 7.54901 4.93455 9.88077 2.9352C12.2125 0.93585 15.2131 -0.109228 18.2822 0.00904609C21.3513 0.12732 24.2626 1.40022 26.4336 3.5731C28.6046 5.74597 29.8752 8.65856 29.9913 11.7282C30.1073 14.7978 29.0603 17.798 27.0595 20.1287C25.0588 22.4593 22.252 23.9485 19.2006 24.2983C16.1492 24.648 13.0782 23.8326 10.6022 22.015H10.604C10.549 22.0901 10.4878 22.1619 10.4203 22.2307L3.20182 29.4502C2.85026 29.8021 2.37334 29.9998 1.87597 30C1.37861 30.0002 0.90155 29.8027 0.549736 29.4511C0.197924 29.0995 0.000177383 28.6225 0 28.1251C-0.000175476 27.6277 0.197235 27.1505 0.5488 26.7987L7.76728 19.5792C7.83428 19.5113 7.90636 19.4505 7.98289 19.3935ZM7.49916 12.1853C7.49916 13.5397 7.76589 14.8808 8.28412 16.1321C8.80236 17.3834 9.56194 18.5204 10.5195 19.4781C11.4771 20.4358 12.6139 21.1955 13.865 21.7138C15.1161 22.2321 16.4571 22.4988 17.8113 22.4988C19.1655 22.4988 20.5064 22.2321 21.7575 21.7138C23.0087 21.1955 24.1455 20.4358 25.103 19.4781C26.0606 18.5204 26.8202 17.3834 27.3384 16.1321C27.8567 14.8808 28.1234 13.5397 28.1234 12.1853C28.1234 9.44996 27.0369 6.82666 25.103 4.89249C23.1691 2.95832 20.5462 1.87172 17.8113 1.87172C15.0763 1.87172 12.4534 2.95832 10.5195 4.89249C8.58561 6.82666 7.49916 9.44996 7.49916 12.1853Z" fill="currentColor"/></svg></xsl:when>
      <xsl:otherwise><svg class="rbccm-capability-cards__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false"><path d="M15 0C6.7 0 0 6.7 0 15C0 23.3 6.7 30 15 30C23.3 30 30 23.3 30 15C30 6.7 23.3 0 15 0zM15 2.5C21.9 2.5 27.5 8.1 27.5 15C27.5 21.9 21.9 27.5 15 27.5C8.1 27.5 2.5 21.9 2.5 15C2.5 8.1 8.1 2.5 15 2.5zM13.75 6.25V8.75H16.25V6.25H13.75zM13.75 12.5V22.5H16.25V12.5H13.75z" fill="currentColor"/></svg></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Shared card body — the guts inside __content (icon + title +
       optional subtitle + body + optional CTA). Called from both
       branches of renderCard so the anchor and article variants share
       one source of truth. -->
  <xsl:template name="renderCardContent">
    <xsl:param name="iconType"/>
    <xsl:param name="title"/>
    <xsl:param name="subtitle"/>
    <xsl:param name="body"/>
    <xsl:param name="ctaLabel"/>

    <div class="rbccm-capability-cards__content">
      <xsl:call-template name="renderIcon"><xsl:with-param name="type" select="$iconType"/></xsl:call-template>
      <h3 class="rbccm-capability-cards__title"><xsl:value-of select="$title"/></h3>
      <xsl:if test="$subtitle != ''">
        <p class="rbccm-capability-cards__subtitle"><xsl:value-of select="$subtitle"/></p>
      </xsl:if>
      <p class="rbccm-capability-cards__body"><xsl:value-of select="$body" disable-output-escaping="yes"/></p>
      <!-- CTA chip. Rendered whenever a label is present — the parent
           renderCard branch has already decided whether the card is an
           <a> (link semantics live on the card, not the chip) or a
           static <article>. The chip is presentational either way. -->
      <xsl:if test="$ctaLabel != ''">
        <span class="rbccm-capability-cards__cta">
          <span><xsl:value-of select="$ctaLabel"/></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.00014C1.5 7.86753 1.55268 7.74036 1.64645 7.64659C1.74021 7.55282 1.86739 7.50014 2 7.50014H13.793L10.646 4.35414C10.5521 4.26026 10.4994 4.13292 10.4994 4.00014C10.4994 3.86737 10.5521 3.74003 10.646 3.64614C10.7399 3.55226 10.8672 3.49951 11 3.49951C11.1328 3.49951 11.2601 3.55226 11.354 3.64614L15.354 7.64614C15.4006 7.69259 15.4375 7.74776 15.4627 7.80851C15.4879 7.86926 15.5009 7.93438 15.5009 8.00014C15.5009 8.06591 15.4879 8.13103 15.4627 8.19178C15.4375 8.25252 15.4006 8.3077 15.354 8.35414L11.354 12.3541C11.2601 12.448 11.1328 12.5008 11 12.5008C10.8672 12.5008 10.7399 12.448 10.646 12.3541C10.5521 12.2603 10.4994 12.1329 10.4994 12.0001C10.4994 11.8674 10.5521 11.74 10.646 11.6461L13.793 8.50014H2C1.86739 8.50014 1.74021 8.44746 1.64645 8.3537C1.55268 8.25993 1.5 8.13275 1.5 8.00014Z" fill="currentColor"/></svg>
        </span>
      </xsl:if>
    </div>
  </xsl:template>

  <!-- Render one card. Skipped when title is blank.
       Conditional wrapper: when a CtaHref is provided the whole card
       becomes an <a> (the __cta chip inside is decorative — the click
       target is the card). Without a href it renders as a static
       <article>. Card guts live inside a shared __content wrapper so
       the CSS's `margin-top: auto` push on __cta bottom-aligns the
       chip across mixed-height cards. -->
  <xsl:template name="renderCard">
    <xsl:param name="n"/>

    <xsl:variable name="title"    select="normalize-space(//Datum[@ID=concat('Card', $n, 'TitleText')]/text()[last()])"/>
    <!-- Plain text icon name, see renderIcon. -->
    <xsl:variable name="iconType" select="translate(normalize-space(//Datum[@ID=concat('Card', $n, 'IconType')]/text()[last()]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ', 'abcdefghijklmnopqrstuvwxyz-')"/>
    <xsl:variable name="subtitle" select="normalize-space(//Datum[@ID=concat('Card', $n, 'SubtitleText')]/text()[last()])"/>
    <xsl:variable name="body"     select="//Datum[@ID=concat('Card', $n, 'BodyText')]"/>
    <!-- MAAS+MATA cards never link: CTA fields are ignored. -->
    <xsl:variable name="ctaLabel" select="''"/>
    <xsl:variable name="ctaHref"  select="''"/>

    <xsl:if test="$title != ''">
      <xsl:choose>
        <xsl:when test="$ctaHref != ''">
          <!-- Anchor variant: whole card is the link. aria-label sets
               a descriptive accessible name combining title + CTA. -->
          <a class="rbccm-capability-cards__card">
            <xsl:attribute name="href"><xsl:value-of select="$ctaHref"/></xsl:attribute>
            <xsl:attribute name="aria-label">
              <xsl:value-of select="$title"/>
              <xsl:if test="$ctaLabel != ''"> — <xsl:value-of select="$ctaLabel"/></xsl:if>
            </xsl:attribute>
            <xsl:call-template name="renderCardContent">
              <xsl:with-param name="iconType" select="$iconType"/>
              <xsl:with-param name="title"    select="$title"/>
              <xsl:with-param name="subtitle" select="$subtitle"/>
              <xsl:with-param name="body"     select="$body"/>
              <xsl:with-param name="ctaLabel" select="$ctaLabel"/>
            </xsl:call-template>
          </a>
        </xsl:when>
        <xsl:otherwise>
          <!-- Static variant: no href, no CTA — pure informational card. -->
          <article class="rbccm-capability-cards__card">
            <xsl:call-template name="renderCardContent">
              <xsl:with-param name="iconType" select="$iconType"/>
              <xsl:with-param name="title"    select="$title"/>
              <xsl:with-param name="subtitle" select="$subtitle"/>
              <xsl:with-param name="body"     select="$body"/>
              <xsl:with-param name="ctaLabel" select="''"/>
            </xsl:call-template>
          </article>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>


  <xsl:template match="/">

    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH"       select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="BG_COLOR"      select="normalize-space(//Datum[@ID='SectionBgColor']/text()[last()])"/>
    <xsl:variable name="MAX_WIDTH_RAW" select="normalize-space(//Datum[@ID='SectionMaxWidth']/text()[last()])"/>
    <!-- Accept bare integers ("1140") or values with a CSS unit
         ("1140px", "72rem"). Bare integers get a px suffix appended. -->
    <xsl:variable name="MAX_WIDTH">
      <xsl:choose>
        <xsl:when test="$MAX_WIDTH_RAW = ''"></xsl:when>
        <xsl:when test="contains($MAX_WIDTH_RAW, 'px') or contains($MAX_WIDTH_RAW, 'rem') or contains($MAX_WIDTH_RAW, 'em') or contains($MAX_WIDTH_RAW, '%')"><xsl:value-of select="$MAX_WIDTH_RAW"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$MAX_WIDTH_RAW"/>px</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="EYEBROW"     select="normalize-space(//Datum[@ID='SectionEyebrowText']/text()[last()])"/>
    <xsl:variable name="HEADING"     select="normalize-space(//Datum[@ID='SectionHeadingText']/text()[last()])"/>
    <xsl:variable name="HEADING_TAG_RAW" select="normalize-space(//Datum[@ID='SectionHeadingTag']/text()[last()])"/>
    <xsl:variable name="DESCRIPTION" select="normalize-space(//Datum[@ID='SectionDescriptionText']/text()[last()])"/>

    <xsl:variable name="HEADING_TAG">
      <xsl:call-template name="pickTag">
        <xsl:with-param name="raw" select="$HEADING_TAG_RAW"/>
        <xsl:with-param name="default" select="'h2'"/>
      </xsl:call-template>
    </xsl:variable>


    <!-- Stylesheet hoist. -->
    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <section>
      <xsl:attribute name="class">rbccm-capability-cards rbccm-capability-cards--3 rbccm-capability-cards--bg-transparent</xsl:attribute>
      <xsl:if test="$SECTION_ID != ''">
        <xsl:attribute name="id"><xsl:value-of select="$SECTION_ID"/></xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$SECTION_ARIA != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$SECTION_ARIA"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="$HEADING != ''">
          <xsl:attribute name="aria-label"><xsl:value-of select="$HEADING"/></xsl:attribute>
        </xsl:when>
      </xsl:choose>
      <xsl:if test="$BG_COLOR != '' or $MAX_WIDTH != ''">
        <xsl:attribute name="style">
          <xsl:if test="$BG_COLOR != ''">--rbccm-capability-cards-bg: <xsl:value-of select="$BG_COLOR"/>;</xsl:if>
          <xsl:if test="$MAX_WIDTH != ''">--rbccm-capability-cards-max-width: <xsl:value-of select="$MAX_WIDTH"/>;</xsl:if>
        </xsl:attribute>
      </xsl:if>

      <xsl:if test="$EYEBROW != '' or $HEADING != '' or $DESCRIPTION != ''">
        <div class="rbccm-capability-cards__header">
          <xsl:if test="$EYEBROW != ''">
            <p class="rbccm-capability-cards__eyebrow" data-animate="fadeInUp"><xsl:value-of select="$EYEBROW"/></p>
          </xsl:if>
          <xsl:if test="$HEADING != ''">
            <xsl:element name="{$HEADING_TAG}">
              <xsl:attribute name="class">rbccm-capability-cards__heading</xsl:attribute>
              <xsl:attribute name="data-animate">fadeInUp</xsl:attribute>
              <xsl:attribute name="data-animate-delay">120</xsl:attribute>
              <xsl:value-of select="$HEADING"/>
            </xsl:element>
          </xsl:if>
          <xsl:if test="$DESCRIPTION != ''">
            <p class="rbccm-capability-cards__description" data-animate="fadeInUp" data-animate-delay="240">
              <xsl:value-of select="$DESCRIPTION" disable-output-escaping="yes"/>
            </p>
          </xsl:if>
        </div>
      </xsl:if>

      <!-- Cards wrapper (max-width 1100 desktop) holds the grid. Mobile
           stacks the grid vertically via CSS flex-column; no carousel
           JS is emitted for this release. See rbccm-capability-cards.js
           for the design note. -->
      <div class="rbccm-capability-cards__cards">
        <div class="rbccm-capability-cards__grid" data-stagger-parent="fadeInUp" data-stagger-step="120">
          <xsl:call-template name="renderCard"><xsl:with-param name="n" select="1"/></xsl:call-template>
          <xsl:call-template name="renderCard"><xsl:with-param name="n" select="2"/></xsl:call-template>
          <xsl:call-template name="renderCard"><xsl:with-param name="n" select="3"/></xsl:call-template>
        </div>

        <!-- Card 4 renders as the full-width "wide" card under the
             3-up row (Index events in the MAAS+MATA design). -->
        <xsl:variable name="W_TITLE"    select="normalize-space(//Datum[@ID='Card4TitleText']/text()[last()])"/>
        <xsl:variable name="W_SUBTITLE" select="normalize-space(//Datum[@ID='Card4SubtitleText']/text()[last()])"/>
        <xsl:variable name="W_BODY"     select="//Datum[@ID='Card4BodyText']"/>
        <xsl:variable name="W_ICON"     select="translate(normalize-space(//Datum[@ID='Card4IconType']/text()[last()]), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ', 'abcdefghijklmnopqrstuvwxyz-')"/>
        <xsl:if test="$W_TITLE != ''">
          <article class="rbccm-capability-cards__wide" data-animate="fadeInUp">
            <xsl:call-template name="renderIcon">
              <xsl:with-param name="type" select="$W_ICON"/>
              <xsl:with-param name="fallback" select="'info'"/>
            </xsl:call-template>
            <div class="rbccm-capability-cards__wide-body">
              <h3 class="rbccm-capability-cards__title"><xsl:value-of select="$W_TITLE"/></h3>
              <xsl:if test="$W_SUBTITLE != ''">
                <p class="rbccm-capability-cards__subtitle"><xsl:value-of select="$W_SUBTITLE"/></p>
              </xsl:if>
              <xsl:if test="normalize-space($W_BODY) != ''">
                <p class="rbccm-capability-cards__body"><xsl:value-of select="$W_BODY" disable-output-escaping="yes"/></p>
              </xsl:if>
            </div>
          </article>
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

</xsl:stylesheet>
