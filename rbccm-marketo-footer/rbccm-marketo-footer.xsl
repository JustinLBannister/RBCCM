<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM Marketo Footer  |  XSL skin
  ============================================================
  "Stay informed" band: heading + subheading + embedded Marketo
  form. Emits the same three lines Marketo's embed snippet uses:

    script  {MarketoBaseUrl}/js/forms2/js/forms2.min.js
    form    id="mktoForm_{MarketoFormId}"
    script  MktoForms2.loadForm(base, munchkin, formId)

  Fields, consent checkbox and button are built by Marketo; the
  CSS restyles Marketo's markup to the RBCCM design.
  Fields: rbccm-marketo-footer-properties.xml
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:template match="/">

    <xsl:variable name="CSS_PATH"      select="normalize-space(//Datum[@ID='CssPath']/text()[last()])"/>
    <xsl:variable name="CACHE_VERSION" select="normalize-space(//Datum[@ID='CacheVersion']/text()[last()])"/>
    <xsl:variable name="SECTION_ID"    select="normalize-space(//Datum[@ID='SectionID']/text()[last()])"/>
    <xsl:variable name="SECTION_ARIA"  select="normalize-space(//Datum[@ID='SectionAriaLabel']/text()[last()])"/>
    <xsl:variable name="BASE_RAW"      select="normalize-space(//Datum[@ID='MarketoBaseUrl']/text()[last()])"/>
    <xsl:variable name="MUNCHKIN_RAW"  select="normalize-space(//Datum[@ID='MarketoMunchkinId']/text()[last()])"/>
    <xsl:variable name="HEADING"       select="normalize-space(//Datum[@ID='HeadingText']/text()[last()])"/>
    <xsl:variable name="SUBHEADING"    select="//Datum[@ID='SubheadingText']"/>
    <xsl:variable name="FORM_ID_RAW"   select="normalize-space(//Datum[@ID='MarketoFormId']/text()[last()])"/>

    <!-- Digits only (goes straight into a script). -->
    <xsl:variable name="FORM_ID" select="translate($FORM_ID_RAW, translate($FORM_ID_RAW, '0123456789', ''), '')"/>
    <!-- Base URL / Munchkin: drop quotes and angle brackets so a typo
         can't break out of the script string. -->
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

    <xsl:if test="$CSS_PATH != ''">
      <link rel="stylesheet" type="text/css">
        <xsl:attribute name="href">
          <xsl:value-of select="$CSS_PATH"/>
          <xsl:if test="$CACHE_VERSION != ''">?v=<xsl:value-of select="$CACHE_VERSION"/></xsl:if>
        </xsl:attribute>
      </link>
    </xsl:if>

    <section class="rbccm-marketo-footer">
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

      <div class="rbccm-marketo-footer__inner">

        <xsl:if test="$HEADING != '' or normalize-space($SUBHEADING) != ''">
          <div class="rbccm-marketo-footer__header">
            <xsl:if test="$HEADING != ''">
              <h2 class="rbccm-marketo-footer__heading"><xsl:value-of select="$HEADING"/></h2>
            </xsl:if>
            <xsl:if test="normalize-space($SUBHEADING) != ''">
              <p class="rbccm-marketo-footer__subheading"><xsl:value-of select="$SUBHEADING" disable-output-escaping="yes"/></p>
            </xsl:if>
          </div>
        </xsl:if>

        <xsl:if test="$FORM_ID != ''">
          <div class="rbccm-marketo-footer__form">
            <script>
              <xsl:attribute name="src"><xsl:value-of select="$BASE"/>/js/forms2/js/forms2.min.js</xsl:attribute>
            </script>
            <form>
              <xsl:attribute name="id">mktoForm_<xsl:value-of select="$FORM_ID"/></xsl:attribute>
            </form>
            <script>MktoForms2.loadForm("<xsl:value-of select="$BASE"/>", "<xsl:value-of select="$MUNCHKIN"/>", <xsl:value-of select="$FORM_ID"/>);</script>
            <!-- LinkedIn autofill (same block as the live page). The
                 behaviour script below moves it into the consent row once
                 Marketo has built the form, and hides it on Safari. -->
            <div id="autofill">
              <script src="/assets/rbccm/js/sub/linkedin/autofill.min.js" async="async" type="text/javascript"></script>
              <script type="IN/Form2" data-field-firstname="FirstName" data-field-lastname="LastName" data-field-email="Email" data-field-company="Company" data-field-title="Title">
                <xsl:attribute name="data-form">mktoForm_<xsl:value-of select="$FORM_ID"/></xsl:attribute>
              </script>
            </div>
            <!-- Form behaviour, ported from the existing live subscription
                 embed and scoped to THIS form (by ID) and THIS section:
                 business-email check, gacid hidden field, LinkedIn autofill
                 placement (Safari hides it), dataLayer "mktoLead" push, and
                 the in-place thank-you message. jQuery bits are skipped if
                 jQuery isn't on the page. -->
            <script>
(function () {
  var FORM_ID = "<xsl:value-of select="$FORM_ID"/>";
  var BAD_DOMAINS = ["@gmail.", "@yahoo.", "@hotmail.", "@live.", "@aol.", "@outlook."];
  var formEl = document.getElementById("mktoForm_" + FORM_ID);
  var section = formEl ? formEl.closest(".rbccm-marketo-footer") : null;
  if (!window.MktoForms2 || !section) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&amp;&lt;&gt;"']/g, function (c) {
      return { "&amp;": "&amp;amp;", "&lt;": "&amp;lt;", "&gt;": "&amp;gt;", '"': "&amp;quot;", "'": "&amp;#39;" }[c];
    });
  }
  function emailOk(email) {
    email = String(email).toLowerCase();
    for (var i = 0; i &lt; BAD_DOMAINS.length; i++) {
      if (email.indexOf(BAD_DOMAINS[i]) !== -1) return false;
    }
    return true;
  }
  function gacid() {
    try { return window.ga.getAll()[0].get("clientId"); } catch (e) { return "n/a"; }
  }

  MktoForms2.whenReady(function (form) {
    if (String(form.getId()) !== FORM_ID) return;
    var $f = form.getFormElem();
    $f.css("width", "auto");
    $f.find(".mktoButton").html("Sign up");

    var $ = window.jQuery;
    if ($) {
      var $af = $(section).find("#autofill");
      var isSafari = navigator.vendor &amp;&amp; navigator.vendor.indexOf("Apple") &gt; -1 &amp;&amp;
        navigator.userAgent.indexOf("CriOS") === -1 &amp;&amp; navigator.userAgent.indexOf("FxiOS") === -1;
      if (isSafari) $af.hide();
      $af.detach().prependTo($f.find(".mktoCheckboxList")).css({ "text-align": "left", "margin": "0 0 10px 0" });
    }

    form.onValidate(function () {
      var email = form.vals().Email;
      if (!email) return;
      if (!emailOk(email)) {
        form.submitable(false);
        form.showErrorMessage("Must be Business email.", $f.find("#Email"));
      } else {
        form.submitable(true);
      }
    });

    form.vals({ gacid: gacid() });

    form.onSuccess(function (vals) {
      if (window.dataLayer) window.dataLayer.push({ event: "mktoLead", mktoFormId: form.getId() });
      var inner = section.querySelector(".rbccm-marketo-footer__inner");
      if (inner) {
        inner.innerHTML =
          '&lt;div class="rbccm-marketo-footer__header"&gt;' +
            '&lt;h2 class="rbccm-marketo-footer__heading"&gt;Thanks for signing up.&lt;/h2&gt;' +
            '&lt;p class="rbccm-marketo-footer__subheading"&gt;' + esc(vals.FirstName) +
            ', look for RBC Capital Markets insights in your inbox soon.&lt;/p&gt;' +
          '&lt;/div&gt;';
      }
      return false;
    });
  });
})();
            </script>
          </div>
        </xsl:if>

      </div>
    </section>

  </xsl:template>

</xsl:stylesheet>
