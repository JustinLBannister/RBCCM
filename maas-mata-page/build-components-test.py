#!/usr/bin/env python3
"""
Builds maas-mata-page/maas-mata-components.html: the MAAS+MATA page
assembled section by section from the TeamSite component skins, the way
it would be built in the page builder (one component per slot, no
hand-made wrappers).

Every section is rendered with its real XSL skin (lxml) using the
MAAS+MATA copy from maas-mata-properties.xml, then wrapped in a
<div class="iw_component"> like TeamSite does. The dark strip and the
deep band are made with rbccm-section-group start/end markers.

Only the deep-band gradient is pulled out of maas-mata.css (the rest of
that file isn't loaded, so nothing page-level leaks onto the components).

Asset paths: /assets/rbccm/css|js/components/NAME.* -> ../NAME/NAME.*
(local component folders); other /assets/... -> https://www.rbccm.com.

Run:  python3 maas-mata-page/build-components-test.py
Not shipped.
"""
import os, re
import lxml.etree as ET
import lxml.html as LH

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'maas-mata-components.html')


# ---- MAAS+MATA content (the page's own Datums) --------------------------
def load_datums(path):
    raw = open(path, 'rb').read().replace(b'<?xml version="1.0" encoding="UTF-8"?>', b'')
    w = ET.fromstring(b'<w>' + raw + b'</w>')
    return {d.get('ID'): (d.text or '').strip() for d in w.iter('Datum')}

MM = load_datums(os.path.join(HERE, 'maas-mata-properties.xml'))


# ---- Skin rendering ------------------------------------------------------
def load_xsl(path):
    src = open(path, encoding='utf-8').read()
    src = re.sub(r'<!DOCTYPE[^>]*>', '', src)
    src = re.sub(r'<xsl:(include|import)[^>]*interwoven[^>]*/>', '', src)
    return ET.XSLT(ET.fromstring(src.encode('utf-8')))

def esc(v):
    return (v.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))

def render(skin, props_file, overrides):
    """Component defaults from its properties file, then MAAS+MATA overrides."""
    base = load_datums(os.path.join(ROOT, props_file))
    base.update(overrides)
    xml = '<Properties>' + ''.join(
        '<Datum ID="%s">%s</Datum>' % (k, esc(v)) for k, v in base.items()) + '</Properties>'
    out = str(load_xsl(os.path.join(ROOT, skin))(ET.fromstring(xml.encode('utf-8'))))
    frags = LH.fragments_fromstring(out) if out.strip() else []
    html = ''.join(f if isinstance(f, str) else LH.tostring(f, encoding='unicode', method='html')
                   for f in frags)
    return localize(html)

def localize(html):
    def comp(m):
        kind, name, ext = m.group(1), m.group(2), m.group(3)
        local = os.path.join(ROOT, name, name + '.' + ext)
        return ('../%s/%s.%s' % (name, name, ext)) if os.path.exists(local) else m.group(0)
    html = re.sub(r'/assets/rbccm/(css|js)/components/([a-z0-9-]+)\.(css|js)', comp, html)
    html = re.sub(r'(["\'(])/assets/', r'\1https://www.rbccm.com/assets/', html)
    html = html.replace(' viewbox=', ' viewBox=')
    return html

def iw(i, html, label):
    return ('<!-- %s -->\n<div class="iw_component" id="iw-%02d">\n%s\n</div>\n' % (label, i, html))


# ---- Innovation era: markup from maas-mata.html + its own CSS -------------
page = open(os.path.join(HERE, 'maas-mata.html'), encoding='utf-8').read()
m = re.search(r'<section class="rbccm-maas-mata__innovation-era">.*?</section>', page, re.S)
innovation_html = m.group(0)

def css_rules(css, wanted):
    """Top-level + @media rules whose selector mentions any `wanted` token."""
    out, i, n = [], 0, len(css)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    def block_end(s, start):
        depth = 0
        for j in range(start, len(s)):
            if s[j] == '{': depth += 1
            elif s[j] == '}':
                depth -= 1
                if depth == 0: return j
        return len(s) - 1
    def walk(s):
        res, i = [], 0
        while True:
            b = s.find('{', i)
            if b == -1: break
            sel = s[i:b].strip()
            e = block_end(s, b)
            body = s[b + 1:e]
            if sel.startswith('@media') or sel.startswith('@supports'):
                inner = walk(body)
                if inner: res.append(sel + ' {\n' + '\n'.join(inner) + '\n}')
            elif sel.startswith('@keyframes'):
                pass
            elif any(w in sel for w in wanted):
                res.append(sel + ' {' + body + '}')
            i = e + 1
        return res
    return walk(css)

mm_css = open(os.path.join(HERE, 'maas-mata.css'), encoding='utf-8').read()
innovation_css = ''


# ---- Sections, top to bottom ---------------------------------------------
S = []
S.append(('Hero :: rbccm-hero--maas-mata.xsl', render(
    'rbccm-hero/rbccm-hero--maas-mata.xsl', 'rbccm-hero/rbccm-hero-sample-dcr.xml', {
        'SectionID': 'rbccm-mm-hero', 'SectionAriaLabel': 'Hero',
        'EyebrowText': MM['HeroEyebrow'],
        'TitleLine1Text': MM['HeroTitleLine1'], 'TitleLine2Text': MM['HeroTitleLine2'],
        'SubtitleText': MM['HeroSubtitle'],
        'MmCta1Label': MM['HeroCtaLabel'], 'MmCta1Href': MM['HeroCtaHref'],
        'MmCta2Label': '', 'MmCta2Href': '',
    })))
S.append(('Chart image + video :: rbccm-video-poster.xsl', render(
    'rbccm-video-poster/rbccm-video-poster.xsl', 'rbccm-video-poster/rbccm-video-poster-properties.xml', {
        'SectionID': 'rbccm-mm-chart-image',
        'PosterImage': './maas-execution-console-reveal.png',
        'PosterAlt': MM['ChartImageAlt'],
        'BrightcoveAccount': MM['ChartBrightcoveAccount'],
        'BrightcovePlayer': MM['ChartBrightcovePlayer'],
        'BrightcoveVideoId': MM['ChartBrightcoveVideoId'],
    })))
S.append(('Dark strip START :: rbccm-section-group--start.xsl', render(
    'rbccm-section-group/rbccm-section-group--start.xsl', 'rbccm-section-group/rbccm-section-group-properties.xml', {
        'GroupName': 'dark-strip', 'SpaceAbove': '222',
    })))
S.append(('New standard :: rbccm-intro-statement.xsl', render(
    'rbccm-intro-statement/rbccm-intro-statement.xsl', 'rbccm-intro-statement/rbccm-intro-statement-properties.xml', {
        'SectionAriaLabel': 'A new standard for multi-asset trading',
        'HeadingLead': MM['NewStandardHeadingLead'],
        'HeadingHighlight': MM['NewStandardHeadingHighlight'],
        'HeadingAccent': MM['NewStandardHeadingAccent'],
        'Paragraph1': MM['NewStandardParagraph1'],
        'Paragraph2': MM['NewStandardParagraph2'],
        'Paragraph3': MM['NewStandardParagraph3'],
        'CtaLabel': MM['NewStandardCtaLabel'], 'CtaHref': MM['NewStandardCtaHref'],
    })))

# Awards: repeatable Group, so build the DCR by hand.
awards_xml = ('<Properties>'
    '<Datum ID="CssPath">/assets/rbccm/css/components/rbccm-awards.css</Datum>'
    '<Datum ID="JsPath">/assets/rbccm/js/components/rbccm-awards.js</Datum>'
    '<Datum ID="CacheVersion">local</Datum>'
    '<Datum ID="SectionID">rbccm-mm-awards</Datum>'
    '<Datum ID="SectionAriaLabel">Awards and recognition</Datum>'
    '<Datum ID="SectionBgColor">transparent</Datum>'
    '<Datum ID="SectionEyebrowText">%s</Datum>' % esc(MM['AwardsEyebrow']) +
    ''.join('<Group ID="AwardCard" Name="Award Card"><Datum ID="Year">%s</Datum><Datum ID="Title">%s</Datum><Datum ID="Issuer">%s</Datum></Group>'
            % (esc(MM['Award%dYear' % n]), esc(MM['Award%dTitle' % n]), esc(MM['Award%dIssuer' % n])) for n in (1, 2, 3)) +
    '</Properties>')
out = str(load_xsl(os.path.join(ROOT, 'rbccm-awards/rbccm-awards.xsl'))(ET.fromstring(awards_xml.encode('utf-8'))))
S.append(('Awards :: rbccm-awards.xsl (3 cards)', localize(''.join(
    f if isinstance(f, str) else LH.tostring(f, encoding='unicode', method='html')
    for f in LH.fragments_fromstring(out)))))

plat = {'SectionID': 'platform', 'SectionAriaLabel': 'Two platforms, one connected workflow',
        'SectionBgColor': 'transparent',
        'SectionEyebrowText': MM['PlatformsEyebrow'], 'SectionHeadingText': MM['PlatformsHeading'],
        'SectionDescriptionText': ''}
for n in (1, 2):
    plat['Card%dTheme' % n] = MM['Platform%dTheme' % n] or ('dark' if n == 1 else 'light')
    plat['Card%dEyebrowText' % n] = MM['Platform%dEyebrow' % n]
    plat['Card%dTitleText' % n] = MM['Platform%dTitle' % n]
    plat['Card%dBodyText' % n] = MM['Platform%dBody' % n]
    for b in range(1, 6):
        plat['Card%dBullet%dText' % (n, b)] = MM['Platform%dBullet%d' % (n, b)]
S.append(('Platforms :: rbccm-two-up-cards--features.xsl', render(
    'rbccm-two-up-cards/rbccm-two-up-cards--features.xsl', 'rbccm-two-up-cards/rbccm-two-up-cards-properties.xml', plat)))

cap = {'SectionAriaLabel': 'MATA capabilities',
       'SectionEyebrowText': MM['MataCapEyebrow'] or 'MATA capabilities',
       'SectionHeadingText': MM['MataCapHeading'],
       'SectionDescriptionText': MM['MataCapSubheading']}
for n, icon in ((1, 'investment-banking'), (2, 'markets'), (3, 'corporate-banking')):
    cap['Card%dIconType' % n] = MM['Card%dIcon' % n] or icon
    cap['Card%dTitleText' % n] = MM['Card%dTitle' % n]
    cap['Card%dSubtitleText' % n] = MM['Card%dSubtitle' % n]
    cap['Card%dBodyText' % n] = MM['Card%dBody' % n]
cap.update({'Card4IconType': MM['IndexEventsIcon'] or 'info',
            'Card4TitleText': MM['IndexEventsTitle'],
            'Card4SubtitleText': MM['IndexEventsSubtitle'],
            'Card4BodyText': MM['IndexEventsBody'],
            'Card5TitleText': ''})
S.append(('MATA capabilities :: rbccm-capability-cards--maas-mata.xsl', render(
    'rbccm-capability-cards/rbccm-capability-cards--maas-mata.xsl', 'rbccm-capability-cards/rbccm-capability-cards-properties.xml', cap)))
S.append(('Dark strip END :: rbccm-section-group--end.xsl', render(
    'rbccm-section-group/rbccm-section-group--end.xsl', 'rbccm-section-group/rbccm-section-group-properties.xml', {
        'GroupName': 'dark-strip'})))

S.append(('Deep band START :: rbccm-section-group--start.xsl', render(
    'rbccm-section-group/rbccm-section-group--start.xsl', 'rbccm-section-group/rbccm-section-group-properties.xml', {
        'GroupName': 'deep-band', 'WrapperClasses': 'rbccm-section-group--deep-band rbccm-maas-mata__deep-band', 'SpaceAbove': '0'})))
nf = {'SectionAriaLabel': MM['InnovationEraHeading'],
      'HeadingText': MM['InnovationEraHeading'], 'IntroText': MM['InnovationEraBody']}
for n in (1, 2, 3):
    nf['Feature%dNumber' % n] = MM['Feature%dNumber' % n]
    nf['Feature%dTitle' % n] = MM['Feature%dTitle' % n]
    nf['Feature%dBody' % n] = MM['Feature%dBody' % n]
S.append(('Innovation era :: rbccm-numbered-features.xsl', render(
    'rbccm-numbered-features/rbccm-numbered-features.xsl', 'rbccm-numbered-features/rbccm-numbered-features-properties.xml', nf)))
S.append(('Demo CTA :: rbccm-cta-band--maas-mata.xsl', render(
    'rbccm-cta-band/rbccm-cta-band--maas-mata.xsl', 'rbccm-cta-band/rbccm-cta-band-properties.xml', {
        'BgTransparent': 'yes', 'SectionId': 'demo', 'SectionAriaLabel': 'See the platform',
        'Eyebrow': MM['DemoEyebrow'], 'HeadingLead': MM['DemoHeadlinePrefix'],
        'HeadingHighlight': MM['DemoHeadlineHighlight'], 'Body': MM['DemoBody'],
        'Cta1Label': MM['DemoCtaLabel'], 'Cta1Href': MM['DemoCtaHref'], 'Cta2Label': '', 'Cta2Href': ''})))
S.append(('Deep band END :: rbccm-section-group--end.xsl', render(
    'rbccm-section-group/rbccm-section-group--end.xsl', 'rbccm-section-group/rbccm-section-group-properties.xml', {
        'GroupName': 'deep-band'})))

S.append(('Newsletter :: rbccm-marketo-footer.xsl', render(
    'rbccm-marketo-footer/rbccm-marketo-footer.xsl', 'rbccm-marketo-footer/rbccm-marketo-footer-properties.xml', {})))


body = ''.join(iw(i + 1, html, label) for i, (label, html) in enumerate(S))
legend = ''.join('<li>%s</li>' % esc(l) for l, _ in S)

doc = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MAAS+MATA - built from components (local test)</title>
<!-- GENERATED by build-components-test.py - edit the components or that
     script, not this file. Re-run: python3 maas-mata-page/build-components-test.py -->
<!-- Stand-ins for what the live site shell provides: Bootstrap 3 (modal,
     base type), jQuery, animate.css + the shared scroll-reveal script. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="../rbccm-animate/rbccm-animate.js"></script>
<style>
  body { margin: 0; background: #fff; }
  .demo-bar { position: sticky; top: 0; z-index: 2000; background: #FFF8DC; color: #333; font: 13px/1.4 Roboto, Arial, sans-serif; padding: 8px 23px; border-bottom: 1px solid #e5d9a8; }
  .demo-bar summary { cursor: pointer; font-weight: 600; }
  .demo-bar ol { margin: 6px 0 2px 18px; padding: 0; columns: 2; }
  .demo-bar label { margin-left: 16px; font-weight: 400; }
  body.demo-outlines .iw_component { outline: 1px dashed rgba(255, 0, 128, .6); outline-offset: -1px; }
  body.demo-outlines [data-rbccm-section-group] { outline: 2px dashed #FFC72C; outline-offset: -3px; }
  .demo-no-component { outline: 3px dashed #d33; outline-offset: -6px; }
  /* The hero sits at the top of the page, which is navy on MAAS+MATA
     between the hero and the dark strip (behind the poster's space above). */
  .iw_component#iw-02 { background: #061730; }
</style>
<!-- Nothing from maas-mata.css is loaded: every section is a component. -->
<style>
''' + innovation_css + '''
</style>
</head>
<body>
<div class="demo-bar">
  <details>
    <summary>MAAS+MATA built from TeamSite components, one per slot (click for the list)</summary>
    <ol>''' + legend + '''</ol>
    Pink dashes: each component slot. Yellow dashes: wrappers built by rbccm-section-group.
  </details>
  <label><input type="checkbox" id="demo-outline-toggle"> Show outlines</label>
</div>
<script>
  document.getElementById('demo-outline-toggle').addEventListener('change', function () {
    document.body.classList.toggle('demo-outlines', this.checked);
  });
</script>

<main id="page-body">
''' + body + '''
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js"></script>
</body>
</html>
'''
open(OUT, 'w', encoding='utf-8').write(doc.encode('ascii', 'xmlcharrefreplace').decode('ascii'))
print('Wrote', os.path.relpath(OUT, ROOT), '-', len(S), 'slots')
