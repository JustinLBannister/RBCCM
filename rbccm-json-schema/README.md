# RBCCM JSON Schema

Standalone TeamSite component for injecting Google-readable JSON-LD structured data into any page. Extracted from the MAAS+MATA template so any page (S+E, Insights, About Us, product pages, etc.) can drop it in without duplicating XSL.

> Naming note: the folder is called `rbccm-json-schema` to match the CMS component label. The payload it emits is JSON-LD (schema.org structured data), not a JSON Schema validator (draft-2020-12). If a validator ever ships, it lives here too.

## Files

| File | Purpose |
|---|---|
| `rbccm-json-schema-properties.xml` | Single `SeoJsonLd` Datum (Textarea + CDATA) |
| `rbccm-json-schema.xsl` | Emits `<script type="application/ld+json">` when the Datum is non-empty |

## How editors use it

1. Add the **RBCCM JSON Schema** component to any TeamSite page or section (order doesn't matter — Google reads JSON-LD from anywhere in the document).
2. Get the finished `@graph` block from SEO (whoever owns structured data — Joon on our side).
3. Open the component. Between the `<![CDATA[` and `]]>` markers on **SEO: JSON-LD structured data**, paste the entire JSON payload. Do not touch anything outside the CDATA wrapper.
4. Publish.
5. Validate at [Google's Rich Results Test](https://search.google.com/test/rich-results) — paste the live URL, confirm zero errors + zero warnings.

## Paste example

```
<![CDATA[
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.rbccm.com/en/insights/strategy-economics",
      "url": "https://www.rbccm.com/en/insights/strategy-economics",
      "name": "Strategy & Economics | RBC Capital Markets",
      "description": "Macro perspectives and market strategy to sharpen your business and investment decisions."
    },
    {
      "@type": "Organization",
      "@id": "https://www.rbccm.com/#organization",
      "name": "RBC Capital Markets",
      "url": "https://www.rbccm.com"
    }
  ]
}
]]>
```

## Why the CDATA wrapper matters

TeamSite parses the Datum value as XML. Without CDATA:
- Square brackets `[`, `]` get entity-encoded → JSON-LD is malformed
- Ampersands in URLs become `&amp;` twice → double-encoded
- Stray template markers can inject `<xsl:...>` fragments into the middle of JSON strings

The CDATA wrapper tells TeamSite "hand this block back verbatim, don't touch it." The XSL emits with `disable-output-escaping="yes"` so the output is byte-for-byte what the editor pasted.

## Empty-state behaviour

An empty Datum produces no `<script>` tag at all — deliberately, so an unfilled placeholder never ships a broken empty stub that would fail Rich Results Test.

## Where the script tag lands in the DOM

Wherever the component is placed on the page. Google reads JSON-LD from `<head>` or `<body>` with no preference, so page position doesn't affect SEO. For consistency across the site, place it near the bottom of the page (below `In the media` on S+E, for example).

## Migration note — MAAS+MATA

The `SeoJsonLd` Datum + emission block was extracted from:
- `maas-mata-page/maas-mata-properties.xml` (lines 247-262)
- `maas-mata-page/maas-mata.xsl` (lines 199-229)

Those files still contain the Datum + emission — leaving them in place until MAAS+MATA is republished with the standalone component in front of it (or the block is stripped from MAAS+MATA in a follow-up).
