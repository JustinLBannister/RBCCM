#!/usr/bin/env python3
"""
Builds outlook-2027/outlook-2027-components.html: the 2027 Outlook page
assembled section by section from the TeamSite component skins, the way
it would be built in the page builder (one component per slot).

Every section is rendered with its real XSL skin (lxml) using the
component's own properties file plus the Outlook copy below, then
wrapped in a <div class="iw_component"> like TeamSite does.

Page order (from the design):
  1 Hero                          rbccm-hero (outlook-2027 skin)
  2 Featured insight              rbccm-insight-cards, Featured layout
  3 Macro views                   rbccm-insight-cards, Cards, white
  4 Strategic themes              rbccm-strategic-themes
  5 Capital Markets perspectives  rbccm-insight-cards, Cards, dark
  6 Latest insights               rbccm-insight-cards, Cards, light blue
  7 Platforms                     rbccm-platforms (the four existing
                                  cards; the two new cards aren't built)
  8 Stay informed                 rbccm-marketo-footer

Images are placeholders (FPO) from the team's page preview; links are
placeholders.

Asset paths: /assets/rbccm/css|js/components/NAME.* -> ../NAME/NAME.*
(local component folders); other /assets/... -> https://www.rbccm.com.

Run:  python3 outlook-2027/build-components-test.py
Then: npm run build   (writes dist/outlook-2027.html from this page)
Not shipped.
"""
import copy, os, re
import lxml.etree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'outlook-2027-components.html')

DOT = u'·'
TIMES = u'×'
FPO = '../rbccm-insight-cards/photos/outlook-2027-'


# ---- Skin rendering ------------------------------------------------------
def load_xsl(path):
    src = open(path, encoding='utf-8').read()
    src = re.sub(r'<!DOCTYPE[^>]*>', '', src)
    src = re.sub(r'<xsl:(include|import)[^>]*interwoven[^>]*/>', '', src)
    src = re.sub(r'(<xsl:stylesheet[^>]*>)', r'\1<xsl:output method="html" encoding="utf-8" indent="no"/>', src, count=1)
    return ET.XSLT(ET.fromstring(src.encode('utf-8')))

def load_props(path):
    raw = open(path, encoding='utf-8').read()
    raw = re.sub(r'<\?xml[^>]*\?>', '', raw)
    return ET.fromstring(('<w>' + raw + '</w>').encode('utf-8'))

def set_datum(tree, key, value):
    """Text field, dropdown (value after its options) or image (Path)."""
    found = tree.xpath('//Datum[@ID=$k]', k=key)
    if not found:
        d = ET.SubElement(tree, 'Datum', ID=key)
        d.text = value
        return
    d = found[0]
    path = d.find('Image/Path')
    options = d.findall('Option')
    if path is not None:
        path.text = value
    elif options:
        options[-1].tail = value
    else:
        d.text = value

def render(skin, props_file, overrides):
    """Component defaults from its properties file, then the Outlook copy."""
    tree = copy.deepcopy(load_props(os.path.join(ROOT, props_file)))
    for key, value in overrides.items():
        set_datum(tree, key, value)
    out = str(load_xsl(os.path.join(ROOT, skin))(tree))
    return localize(out.strip())

def localize(html):
    def comp(m):
        name, ext = m.group(2), m.group(3)
        local = os.path.join(ROOT, name, name + '.' + ext)
        return ('../%s/%s.%s' % (name, name, ext)) if os.path.exists(local) else m.group(0)
    html = re.sub(r'/assets/rbccm/(css|js)/components/([a-z0-9-]+)\.(css|js)', comp, html)
    html = re.sub(r'(["\'(])/assets/', r'\1https://www.rbccm.com/assets/', html)
    return html

def iw(i, html, label):
    return '<!-- %s -->\n<div class="iw_component" id="iw-%02d">\n%s\n</div>\n' % (label, i, html)


# ---- Insight cards helpers ------------------------------------------------
FIELDS = {'badge': 'Badge', 'type': 'Type', 'cat': 'Category', 'title': 'Title',
          'summary': 'Summary', 'meta': 'Meta', 'img': 'Image', 'link': 'Link',
          'action': 'ActionLabel', 'filter': 'Filter', 'speaker': 'SpeakerName',
          'role': 'SpeakerRole'}

def cards(stories, **section):
    """Datum overrides for one rbccm-insight-cards instance."""
    d = {'Eyebrow': '', 'SectionIntro': '', 'HeaderButtonLabel': '', 'HeaderButtonLink': '',
         'NotifyEyebrow': '', 'NotifyText': '', 'NotifyButtonLabel': '', 'NotifyLink': '',
         'Layout': 'cards', 'Theme': 'white', 'ShowFilters': 'no', 'ShowShare': 'yes'}
    for n in range(1, 6):
        story = stories[n - 1] if n <= len(stories) else {}
        for short, field in FIELDS.items():
            d['Item%d%s' % (n, field)] = story.get(short, 'none' if short == 'type' else '')
    d.update(section)
    return d

CARDS_SKIN = 'rbccm-insight-cards/rbccm-insight-cards--outlook-2027.xsl'
CARDS_PROPS = 'rbccm-insight-cards/rbccm-insight-cards-properties.xml'


# ---- The page -------------------------------------------------------------
S = []   # (label, html)

S.append(('Hero (rbccm-hero, outlook-2027 skin)', render(
    'rbccm-hero/rbccm-hero--outlook-2027.xsl', 'rbccm-hero/rbccm-hero-properties.xml', {
        'SectionID': 'rbccm-hero-outlook',
        'SectionAriaLabel': '2027 Outlook hero',
        'HeroBreadcrumbs': '<li><a href="/en/">Home</a></li><li><a href="/en/insights">Insights</a></li>',
        'TitleLine1Text': '2027',
        'TitleLine2Text': 'Outlook',
        'SubtitleText': 'Gain perspective on the economic, market, and industry forces shaping opportunities in 2027.',
        'OlYearRoll': 'yes',
        'MmCta1Label': 'Download the report',
        'MmCta1Href': '#',
        'MmCta1Icon': 'arrow',
        'BgVideoMp4': '../rbccm-hero/hero-background-animation-4k-loop.mp4',
        'BgBrightcoveVideoId': '',
    })))

S.append(('Featured insight (rbccm-insight-cards, Featured layout)', render(CARDS_SKIN, CARDS_PROPS, cards([
    dict(cat='Geopolitics %s Economics %s U.S. Equities' % (TIMES, TIMES),
         title='Geoeconomics outlook',
         summary=u'Our senior strategists on geopolitics, the global economy and U.S. equities — and how the three will collide in the year ahead.',
         img=FPO + 'featured-fpo.jpg', link='#', action='Watch the episode',
         speaker='Lindsay Patrick', role='Chief Economist, RBC'),
], SectionID='featured-insight', Layout='featured',
   Eyebrow='2027 Outlook %s Flagship' % DOT, SectionHeading='Featured insight'))))

S.append(('Macro views (rbccm-insight-cards, Cards, white, with the notification strip)', render(CARDS_SKIN, CARDS_PROPS, cards([
    dict(badge='RBC Economics', type='article', cat='Macro & rates', title='Global economic outlook',
         meta='Frances Donald %s Oct 9, 2026' % DOT, img=FPO + 'macro-1-fpo.jpg', link='#', action='Read %s 5 min read' % DOT),
    dict(badge='Markets in Motion', type='podcast', cat='Macro & rates', title='Monetary policy and rates outlook',
         meta='Emma Laurent %s Oct 5, 2026' % DOT, img=FPO + 'macro-2-fpo.jpg', link='#', action='Listen %s 22 min' % DOT),
    dict(badge='Strategic Alternatives', type='article', cat='Equities', title='U.S. equity market outlook',
         meta='Daniel Reyes %s Oct 1, 2026' % DOT, img=FPO + 'macro-3-fpo.jpg', link='#', action='Read %s 6 min' % DOT),
    dict(badge='Strategic Alternatives', type='video', cat='Consumer', title='FX outlook',
         meta='Daniel Reyes %s Sep 28, 2026' % DOT, img=FPO + 'macro-4-fpo.jpg', link='#', action='Watch %s 6 min' % DOT),
], SectionID='macro-views', SectionHeading='Macro views',
   NotifyEyebrow='Never miss an Outlook episode',
   NotifyText='Stay up to date with the latest conversations and insights.',
   NotifyButtonLabel='Get notified', NotifyLink='#'))))

S.append(('Strategic themes (rbccm-strategic-themes; pins and steps through the themes on desktop)', render(
    'rbccm-strategic-themes/rbccm-strategic-themes--outlook-2027.xsl',
    'rbccm-strategic-themes/rbccm-strategic-themes-properties.xml', {
        'SectionID': 'strategic-themes',
    })))

S.append(('Capital Markets perspectives (rbccm-insight-cards, Cards, dark)', render(CARDS_SKIN, CARDS_PROPS, cards([
    dict(badge='Video', type='video', cat='Deals & financing', title='M&A Outlook',
         meta='Dec 2026 %s 5 min watch' % DOT, img=FPO + 'perspectives-1-fpo.jpg', link='#', action='Watch %s 5 min' % DOT),
    dict(badge='Article', type='article', cat='Deals & financing', title='Capital Solutions',
         meta='Dec 2026', img=FPO + 'perspectives-2-fpo.jpg', link='#', action='Read %s 6 min' % DOT),
    dict(badge='Podcast', type='podcast', cat='Deals & financing', title='Lending / Loan Outlook',
         meta='Dec 2026', img=FPO + 'macro-2-fpo.jpg', link='#', action='Listen %s 5 min' % DOT),
], SectionID='capital-markets-perspectives', Theme='dark',
   Eyebrow='Capital Markets perspectives',
   SectionHeading=u'Perspectives on what’s ahead for dealmaking and capital markets.'))))

S.append(('Latest insights (rbccm-insight-cards, Cards, light blue, filter pills)', render(CARDS_SKIN, CARDS_PROPS, cards([
    dict(badge='Conference', cat='Conference', title='Macro & Markets Conference',
         meta='London, UK %s December 2-3, 2026' % DOT, img=FPO + 'latest-1-fpo.jpg', link='#',
         action='View conference', filter='Conferences'),
    dict(badge='Research', type='article', cat='Research %s Sector' % DOT, title='[Research report title]',
         meta='[Analyst] %s [Date] %s [X] min read' % (DOT, DOT), link='#',
         action='Read the research', filter='Research'),
    dict(badge='Event', cat='Breakfast', title='Global Economic & Market Outlook Breakfast',
         meta='Toronto, CA %s January X, 2027' % DOT, img=FPO + 'macro-1-fpo.jpg', link='#',
         action='Register', filter='Events'),
    dict(badge='Webinar', type='video', cat='Preview', title='New Years Previews',
         meta='On-demand webinars', img=FPO + 'macro-3-fpo.jpg', link='#',
         action='Watch on demand', filter='Webinars'),
], SectionID='latest-insights', Theme='tint', ShowFilters='yes',
   SectionHeading='Latest insights & highlights',
   SectionIntro='Stay up to date with our latest insights, perspectives and featured events.',
   HeaderButtonLabel='Explore all insights', HeaderButtonLink='#'))))

S.append(('Platforms (rbccm-platforms; four existing cards, the two new ones are not built)', render(
    'rbccm-platforms/rbccm-platforms.xsl', 'rbccm-platforms/rbccm-platforms-properties.xml', {
        'SectionID': 'outlook-platforms',
        'SectionTitleText': u'Access insights from across RBC Capital Markets’ global platform',
        'SectionSubtitleText': '',
    })))

S.append(('Stay informed (rbccm-marketo-footer)', render(
    'rbccm-marketo-footer/rbccm-marketo-footer.xsl', 'rbccm-marketo-footer/rbccm-marketo-footer-properties.xml', {
        'SectionID': 'stay-informed',
    })))

body = '\n'.join(iw(i, html, label) for i, (label, html) in enumerate(S, 1))
legend = ''.join('<li>%s</li>' % label.replace('&', '&amp;') for label, _ in S)

doc = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>2027 Outlook - built from components (local test)</title>
<!-- GENERATED by build-components-test.py - edit the components or that
     script, not this file. Re-run: python3 outlook-2027/build-components-test.py -->
<!-- Stand-ins for what the live site shell provides: animate.css + the
     shared scroll-reveal script. -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
<script src="../rbccm-animate/rbccm-animate.js"></script>
<style>
  body { margin: 0; background: #fff; font-family: Roboto, Arial, sans-serif; }
  .demo-bar { position: sticky; top: 0; z-index: 2000; background: #FFF8DC; color: #333; font: 13px/1.4 Roboto, Arial, sans-serif; padding: 8px 23px; border-bottom: 1px solid #e5d9a8; }
  .demo-bar summary { cursor: pointer; font-weight: 600; }
  .demo-bar ol { margin: 6px 0 2px 18px; padding: 0; columns: 2; }
  .demo-bar label { margin-left: 16px; font-weight: 400; }
  body.demo-outlines .iw_component { outline: 1px dashed rgba(255, 0, 128, .6); outline-offset: -1px; }
  .demo-no-component { background: #F1F5FB; color: #003168; font: 16px/1.5 Roboto, Arial, sans-serif; outline: 3px dashed #d33; outline-offset: -6px; padding: 72px 23px; text-align: center; }
  .demo-no-component p { margin: 0 auto 8px; max-width: 640px; }
</style>
</head>
<body>
<div class="demo-bar">
  <details>
    <summary>2027 Outlook built from TeamSite components, one per slot (click for the list)</summary>
    <ol>''' + legend + '''</ol>
    Pink dashes: each component slot.
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

</body>
</html>
'''
open(OUT, 'w', encoding='utf-8').write(doc.encode('ascii', 'xmlcharrefreplace').decode('ascii'))
print('Wrote', os.path.relpath(OUT, ROOT), '-', len(S), 'slots')
