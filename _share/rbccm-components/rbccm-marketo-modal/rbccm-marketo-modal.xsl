<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Marketo Modal  |  XSL skin
  ============================================================
  "Talk with an expert." popup with an embedded Marketo form.
  Emits a closed native <dialog id="{ModalID}">; nothing shows
  until a trigger is clicked. Triggers: any link whose URL is
  #{ModalID} (default #request-demo) or any element with
  data-rbccm-modal="{ModalID}". A page URL ending in #{ModalID}
  opens it on load.

  rbccm-marketo-modal.js loads Marketo forms2 (or reuses it when
  the page already has it, e.g. the Marketo footer), loads the
  form, restyles nothing inline, adds the field classes the CSS
  keys off, swaps the submit label, adds Cancel, checks for a
  business email, fills the gacid hidden field, pushes the
  dataLayer "mktoLead" event and shows the thank-you block.
  Fields: rbccm-marketo-modal-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

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

  <xsl:template match="/">

    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="JS_PATH_RAW"   select="normalize-space(//Datum[@ID='JsPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="MODAL_ID_RAW"  select="normalize-space(//Datum[@ID='ModalID']/text()[last()])"/>
    <xsl:variable name="BASE_RAW"      select="normalize-space(//Datum[@ID='MarketoBaseUrl']/text()[last()])"/>
    <xsl:variable name="MUNCHKIN_RAW"  select="normalize-space(//Datum[@ID='MarketoMunchkinId']/text()[last()])"/>
    <xsl:variable name="FORM_ID_RAW"   select="normalize-space(//Datum[@ID='MarketoFormId']/text()[last()])"/>
    <xsl:variable name="HEADING"       select="normalize-space(//Datum[@ID='HeadingText']/text()[last()])"/>
    <xsl:variable name="HIGHLIGHT"     select="normalize-space(//Datum[@ID='HeadingHighlightText']/text()[last()])"/>
    <xsl:variable name="SUBHEADING"    select="//Datum[@ID='SubheadingText']"/>
    <xsl:variable name="SUBMIT_RAW"    select="normalize-space(//Datum[@ID='SubmitLabel']/text()[last()])"/>
    <xsl:variable name="CANCEL_RAW"    select="normalize-space(//Datum[@ID='CancelLabel']/text()[last()])"/>
    <xsl:variable name="CLOSE_RAW"     select="normalize-space(//Datum[@ID='CloseLabel']/text()[last()])"/>
    <xsl:variable name="THANKS_HEAD"   select="normalize-space(//Datum[@ID='ThankYouHeading']/text()[last()])"/>
    <xsl:variable name="THANKS_MSG"    select="//Datum[@ID='ThankYouMessage']"/>
    <xsl:variable name="THANKS_CLOSE_RAW" select="normalize-space(//Datum[@ID='ThankYouCloseLabel']/text()[last()])"/>

    <xsl:variable name="JS_PATH">
      <xsl:choose>
        <xsl:when test="$JS_PATH_RAW != ''"><xsl:value-of select="$JS_PATH_RAW"/></xsl:when>
        <xsl:otherwise>/assets/rbccm/js/components/rbccm-marketo-modal.js</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Modal ID: letters, digits, hyphens and underscores only (it is
         an element id and a URL hash). Blank falls back to request-demo. -->
    <xsl:variable name="MODAL_ID_CLEAN" select="translate($MODAL_ID_RAW, translate($MODAL_ID_RAW, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_', ''), '')"/>
    <xsl:variable name="MODAL_ID">
      <xsl:choose>
        <xsl:when test="$MODAL_ID_CLEAN != ''"><xsl:value-of select="$MODAL_ID_CLEAN"/></xsl:when>
        <xsl:otherwise>request-demo</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Digits only. -->
    <xsl:variable name="FORM_ID" select="translate($FORM_ID_RAW, translate($FORM_ID_RAW, '0123456789', ''), '')"/>
    <!-- Base URL / Munchkin: drop quotes, angle brackets and spaces. -->
    <xsl:variable name="BAD">"'&lt;&gt;\ </xsl:variable>
    <xsl:variable name="BASE">
      <xsl:choose>
        <xsl:when test="$BASE_RAW != ''"><xsl:value-of select="translate($BASE_RAW, $BAD, '')"/></xsl:when>
        <xsl:otherwise>//discover.rbccm.com</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="MUNCHKIN">
      <xsl:choose>
        <xsl:when test="$MUNCHKIN_RAW != ''"><xsl:value-of select="translate($MUNCHKIN_RAW, $BAD, '')"/></xsl:when>
        <xsl:otherwise>577-RQV-784</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="SUBMIT">
      <xsl:choose>
        <xsl:when test="$SUBMIT_RAW != ''"><xsl:value-of select="$SUBMIT_RAW"/></xsl:when>
        <xsl:otherwise>Submit</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="CANCEL">
      <xsl:choose>
        <xsl:when test="$CANCEL_RAW != ''"><xsl:value-of select="$CANCEL_RAW"/></xsl:when>
        <xsl:otherwise>Cancel</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="CLOSE">
      <xsl:choose>
        <xsl:when test="$CLOSE_RAW != ''"><xsl:value-of select="$CLOSE_RAW"/></xsl:when>
        <xsl:otherwise>Close</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="THANKS_CLOSE">
      <xsl:choose>
        <xsl:when test="$THANKS_CLOSE_RAW != ''"><xsl:value-of select="$THANKS_CLOSE_RAW"/></xsl:when>
        <xsl:otherwise>Close</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <!-- tabindex -1: the JS focuses the panel itself on open, so screen
         readers start at the heading and the X shows no focus ring until
         someone tabs to it. -->
    <dialog class="rbccm-marketo-modal" tabindex="-1">
      <xsl:attribute name="id"><xsl:value-of select="$MODAL_ID"/></xsl:attribute>
      <xsl:attribute name="aria-labelledby"><xsl:value-of select="$MODAL_ID"/>-title</xsl:attribute>
      <xsl:attribute name="data-form-id"><xsl:value-of select="$FORM_ID"/></xsl:attribute>
      <xsl:attribute name="data-base-url"><xsl:value-of select="$BASE"/></xsl:attribute>
      <xsl:attribute name="data-munchkin"><xsl:value-of select="$MUNCHKIN"/></xsl:attribute>
      <xsl:attribute name="data-submit-label"><xsl:value-of select="$SUBMIT"/></xsl:attribute>
      <xsl:attribute name="data-cancel-label"><xsl:value-of select="$CANCEL"/></xsl:attribute>

      <button type="button" class="rbccm-marketo-modal__close" data-rbccm-modal-close="">
        <xsl:attribute name="aria-label"><xsl:value-of select="$CLOSE"/></xsl:attribute>
        <svg class="rbccm-marketo-modal__close-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.4"/></svg>
      </button>

      <div class="rbccm-marketo-modal__body">

        <div class="rbccm-marketo-modal__header">
          <h2 class="rbccm-marketo-modal__heading">
            <xsl:attribute name="id"><xsl:value-of select="$MODAL_ID"/>-title</xsl:attribute>
            <xsl:value-of select="$HEADING"/>
            <xsl:if test="$HEADING != '' and $HIGHLIGHT != ''"><xsl:text> </xsl:text></xsl:if>
            <xsl:if test="$HIGHLIGHT != ''">
              <span class="rbccm-marketo-modal__heading-highlight"><xsl:value-of select="$HIGHLIGHT"/></span>
            </xsl:if>
          </h2>
          <xsl:if test="normalize-space($SUBHEADING) != ''">
            <p class="rbccm-marketo-modal__subheading"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$SUBHEADING"/></xsl:call-template></p>
          </xsl:if>
        </div>

        <xsl:if test="$FORM_ID != ''">
          <div class="rbccm-marketo-modal__form">
            <form>
              <xsl:attribute name="id">mktoForm_<xsl:value-of select="$FORM_ID"/></xsl:attribute>
            </form>
          </div>
        </xsl:if>

        <!-- Thank-you state. Hidden until Marketo reports success; the
             JS fills {FirstName} and moves focus to the heading. -->
        <div class="rbccm-marketo-modal__thanks" hidden="hidden">
          <h2 class="rbccm-marketo-modal__thanks-heading" tabindex="-1"><xsl:value-of select="$THANKS_HEAD"/></h2>
          <xsl:if test="normalize-space($THANKS_MSG) != ''">
            <p class="rbccm-marketo-modal__thanks-message"><xsl:call-template name="rbccmRich"><xsl:with-param name="s" select="$THANKS_MSG"/></xsl:call-template></p>
          </xsl:if>
          <button type="button" class="rbccm-marketo-modal__thanks-close" data-rbccm-modal-close=""><xsl:value-of select="$THANKS_CLOSE"/></button>
        </div>

      </div>
    </dialog>

    <script>
      <xsl:attribute name="src">
        <xsl:value-of select="$JS_PATH"/>
        <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
      </xsl:attribute>
    </script>

  </xsl:template>

</xsl:stylesheet>
