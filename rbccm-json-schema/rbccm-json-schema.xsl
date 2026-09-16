<?xml version="1.0" encoding="UTF-8"?>
<!--
  RBCCM JSON Schema (JSON-LD structured data)  |  XSL skin
  ============================================================
  Standalone component. Reads the SeoJsonLd Datum from
  Properties and emits a &lt;script type="application/ld+json"&gt;
  tag with the value passed through verbatim.

  Guard
  ============================================================
  Empty Datum == no script tag. Prevents empty stubs from
  shipping to production and failing Google's Rich Results
  Test.

  Escaping
  ============================================================
  disable-output-escaping="yes" is required. Without it TeamSite
  will entity-encode the JSON payload (double-quotes become
  &amp;quot;, angle brackets become &amp;lt;) and the resulting
  script block is not valid JSON at runtime. The CDATA wrapper
  in the Datum + disable-output-escaping on the emit is what
  keeps the payload byte-for-byte identical to what the editor
  pasted.
  ============================================================ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="no" omit-xml-declaration="yes"/>

  <xsl:variable name="SEO_JSONLD" select="//Datum[@ID='SeoJsonLd']"/>

  <xsl:template match="/">
    <xsl:if test="normalize-space($SEO_JSONLD) != ''">
      <script type="application/ld+json">
        <xsl:value-of select="$SEO_JSONLD" disable-output-escaping="yes"/>
      </script>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
