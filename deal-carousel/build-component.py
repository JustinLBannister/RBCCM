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

    # Datum NAMES must be plain ASCII: letters, digits and spaces only.
    #
    # This is not cosmetic. Teamsite serialises every Datum name into the
    # propertyTabs form payload, and punctuation in a name breaks the save with a
    # bare "Error in XMLHttpRequest [500/Internal Server Error]" — no field named,
    # no clue what went wrong. It only fires once a repeated Group has enough rows
    # to be worth saving, so it looks like a size limit and is not.
    #
    # Apostrophes are doubly fatal: the XSL matches replicated Datums with
    # @Name='...', a single-quoted XPath string, which an apostrophe terminates.
    #
    # We shipped "Show RBC's role" and three em-dashes and it cost an afternoon.
    names = re.findall(r'<Datum\b[^>]*\bName="([^"]+)"', re.sub(r'<!--.*?-->', '', props, flags=re.S))
    dirty = [n for n in names if not re.fullmatch(r'[A-Za-z0-9 ]+', n)]
    if dirty:
        for n in dirty:
            junk = ''.join(sorted({c for c in n if not re.match(r'[A-Za-z0-9 ]', c)}))
            print(f'ERROR: Datum Name="{n}" contains {junk!r}. Names must be letters, '
                  f'digits and spaces only, or Teamsite 500s on save.', file=sys.stderr)
        return 1
    print(f'  OK    all {len(names)} Datum names are plain ASCII')

    # A <DCR> or <Image> default must be EMPTY.
    #
    # Anything in there is a DEPENDENCY the publisher has to resolve, and it gets
    # inherited by every cloned row of the repeated Group — including rows where
    # the author never touched the picker. A path that doesn't resolve renders
    # fine in PREVIEW (it just finds nothing) and then fails at PUBLISH, which is
    # the worst possible place to find out.
    #
    # We shipped <DCR ...>templatedata/rbccm/deals/data</DCR>, which is the folder
    # the deal records live under, not a record. Fifteen cards, fifteen dangling
    # dependencies, publish blocked.
    # Lint the MARKUP, not the prose — the comments quote example <DCR> elements
    # (featured-conferences') to explain why this rule exists, and matching those
    # would fail the build on its own documentation.
    props_bare = re.sub(r'<!--.*?-->', '', props, flags=re.S)
    for tag in ('DCR', 'Image'):
        for m in re.finditer(rf'<{tag}\b[^>]*>(.*?)</{tag}>', props_bare, re.S):
            inner = m.group(1)
            # <Path/> and <Description/> are the required empty skeleton
            text = re.sub(r'<[^>]+/>|<Path>\s*</Path>|<Description>\s*</Description>', '', inner).strip()
            if text:
                print(f'ERROR: <{tag}> default is not empty: {text[:60]!r}. A default path '
                      f'is a dependency the publisher must resolve, inherited by every '
                      f'cloned row. Renders in preview, fails at publish.', file=sys.stderr)
                return 1
    print('  OK    all DCR / Image defaults are empty (no dangling publish dependencies)')

    # Teamsite STRIPS @ID from Datums inside a Replicatable Group, so @Name is the
    # only thing the XSL can match on. That makes a renamed Datum a silent,
    # invisible break: the properties still validate, the XSL still compiles, the
    # card just quietly loses that field in production and nowhere else.
    #
    # Already happened once — "Card link URL (blank = the deal DCR link field)"
    # was renamed in the properties and the XSL kept matching the old string, so
    # every hand-authored card silently lost its link.
    #
    # So: every @Name declared inside the repeatable Group must be matched
    # somewhere in the XSL, and vice versa.
    grp = re.search(r'<Group\b[^>]*>(.*?)</Group>', props, re.S)
    if grp:
        declared = set(re.findall(r'<Datum\b[^>]*\bName="([^"]+)"', grp.group(1)))
        matched  = set(re.findall(r"@Name='([^']+)'", xsl))
        orphaned = sorted(n for n in declared if n not in matched)
        phantom  = sorted(n for n in matched if n not in declared
                          and n not in {'Deal'})   # the Group's own name
        if orphaned or phantom:
            for n in orphaned:
                print(f'ERROR: Datum Name="{n}" is declared in the Group but the XSL '
                      f'never matches it. Teamsite strips @ID on replicated Datums, '
                      f'so this field will silently render nothing.', file=sys.stderr)
            for n in phantom:
                print(f'ERROR: XSL matches @Name=\'{n}\' but no such Datum is declared '
                      f'in the Group. Renamed and not updated?', file=sys.stderr)
            return 1
        print(f'  OK    all {len(declared)} replicated Datum names match the XSL')

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
    combined = xsl.rstrip() + '\n\n' + props.strip() + '\n'

    # --- 3. STRIP EVERY COMMENT ----------------------------------------------
    # This artifact goes into a live Teamsite component. The comments in the
    # sources are for us: bug post-mortems, why a rule exists, what broke last
    # time. None of that should be sitting in production, and a "GENERATED FILE"
    # banner least of all.
    #
    # The sources keep all of it. Only the built file is stripped, which is the
    # whole reason the build step exists.
    #
    # Pass --comments to keep them (useful when handing the file to someone who
    # has to debug it in Teamsite without the repo).
    if '--comments' not in sys.argv:
        doctype = ''
        m = re.match(r'^(<!DOCTYPE[^>]*>\n)', combined)
        if m:                      # the DOCTYPE is not a comment; keep it
            doctype = m.group(1)
            combined = combined[m.end():]

        before = combined.count('<!--')
        combined = re.sub(r'<!--.*?-->\s*', '', combined, flags=re.S)
        # collapse the blank lines the comments left behind
        combined = re.sub(r'\n{3,}', '\n\n', combined)
        combined = doctype + combined.lstrip('\n')
        print(f'  OK    stripped {before} comments from the shipped artifact')

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
