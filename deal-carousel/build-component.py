#!/usr/bin/env python3
"""
Build deal-carousel-component.html — the single file that goes into Teamsite.

    python3 build-component.py

WHAT IT PRODUCES
----------------
    <!DOCTYPE ...>
    <xsl:stylesheet version="2.0">      the skin (deal-carousel.xsl)
      <link  href=".../css/components/deal-carousel.css">
      <script src=".../js/components/deal-carousel.js">
      ...markup...
    </xsl:stylesheet>
    <Properties> + <Data>               (deal-carousel-properties.xml)

THREE FILES DEPLOY
------------------
    deal-carousel-component.html  ->  Teamsite (the skin + Properties/Data)
    deal-carousel.css             ->  /assets/rbccm/css/components/
    deal-carousel.js              ->  /assets/rbccm/js/components/

Same split as filter-by, conference-insights-tiles and secondary-nav, which all
load their JS from /assets/rbccm/js/components/ rather than inlining it.

An earlier version of this script inlined the JS into a <script> in the skin
(leadership's approach). That works, but it means XML-escaping every `&` and `<`
in the JS and relying on <xsl:output method="html"/> to unescape them on the way
out — one wrong setting and the browser gets literal `&lt;` and throws. Loading
by src sidesteps the whole problem, and the JS stays a plain file you can lint
and diff.

THE ONE TRAP THAT REMAINS
-------------------------
The stylesheet must declare version="2.0" to match Teamsite's "Rendering Mode:
XSLT 2.0" (per the Conference-Insights BRD). Declaring 1.0 forces the 2.0 engine
into backwards-compat mode — the xs:double vs xs:string error story-tiles v1 hit.

deal-carousel-component.html is a BUILD ARTIFACT. Edit the sources, re-run this.
"""

import re
import sys
from pathlib import Path

HERE  = Path(__file__).parent
XSL   = HERE / 'deal-carousel.xsl'
PROPS = HERE / 'deal-carousel-properties.xml'
OUT   = HERE / 'deal-carousel-component.html'

CSS_HREF = '/assets/rbccm/css/components/deal-carousel.css'
JS_SRC   = '/assets/rbccm/js/components/deal-carousel.js'

# Match the real tags, NOT a bare path — the XSL's own comments mention these
# paths, and a substring check on the path silently skips emitting the tag.
LINK_TAG   = f'<link rel="stylesheet" href="{CSS_HREF}"/>'
SCRIPT_TAG = f'<script src="{JS_SRC}"></script>'


def main() -> int:
    xsl   = XSL.read_text()
    props = PROPS.read_text()

    # --- guards --------------------------------------------------------------
    if 'version="2.0"' not in xsl:
        print('ERROR: stylesheet must declare version="2.0" to match Teamsite\'s '
              'XSLT 2.0 rendering mode.', file=sys.stderr)
        return 1

    # --- 1. asset tags ---------------------------------------------------------
    # The XSL emits its own <link> and <script src> inside the guarded xsl:if, so
    # they are only written when the component actually renders — an empty
    # carousel should not pull a stylesheet down. Nothing to inject in that case.
    #
    # The fallback below exists for an XSL that does NOT carry them, and anchors
    # on the <section> tag itself rather than a decorative comment line above it:
    # the previous anchor included a ruler comment, so deleting that comment
    # broke the build with "could not find the <section> anchor" even though the
    # section was right there.
    if LINK_TAG not in xsl or SCRIPT_TAG not in xsl:
        assets = (
            f'      <!-- Component assets. Deploy alongside this skin:\n'
            f'             {CSS_HREF}\n'
            f'             {JS_SRC}\n'
            f'           jQuery + slick (accessible-slick) are already site-wide. -->\n'
            f'      {LINK_TAG}\n'
            f'      {SCRIPT_TAG}\n\n'
        )
        m = re.search(r'^([ \t]*)<section\b', xsl, flags=re.M)
        if not m:
            print('ERROR: could not find a <section> element in the XSL to anchor '
                  'the asset tags to.', file=sys.stderr)
            return 1
        xsl = xsl[:m.start()] + assets + xsl[m.start():]

    # --- 2. Properties + Data -------------------------------------------------
    banner = (
        '<!-- ============================================================\n'
        '     GENERATED FILE — do not edit.\n'
        '     Built by build-component.py from:\n'
        '       deal-carousel.xsl\n'
        '       deal-carousel-properties.xml\n'
        '     Edit those, then re-run:  python3 build-component.py\n'
        '\n'
        '     Deploy:\n'
        f'       this file                ->  Teamsite component\n'
        f'       deal-carousel.css        ->  {CSS_HREF}\n'
        f'       deal-carousel.js         ->  {JS_SRC}\n'
        '     ============================================================ -->\n'
    )
    combined = xsl.rstrip() + '\n\n' + props.strip() + '\n'
    combined = re.sub(r'(^<!DOCTYPE[^>]*>\n)', r'\1' + banner, combined, count=1)

    OUT.write_text(combined)

    # --- verify what we actually emitted -------------------------------------
    ok = True
    for label, needle in (('CSS <link>', LINK_TAG), ('JS <script src>', SCRIPT_TAG)):
        present = needle in combined
        ok &= present
        print(f'  {"OK  " if present else "FAIL"}  {label} emitted')
    if not ok:
        return 1

    print(f'\n  built {OUT.name}  ({len(combined.splitlines())} lines)')
    print(f'    deploy css -> {CSS_HREF}')
    print(f'    deploy js  -> {JS_SRC}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
