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
  7 Platforms                     rbccm-platforms, Outlook 2027 preset, six cards
  8 Stay informed                 rbccm-marketo-footer
  9 Structured data               rbccm-json-schema (not visible)

Structured data: the same copy is written as JSON-LD to
outlook-2027/seo-jsonld-paste.json, the block to paste into the
rbccm-json-schema component. It describes the page and its breadcrumb,
and lists every story that has a real link. Stories whose link is still
a placeholder are left out, so run this again once the links are real.

Images are placeholders (FPO) from the team's page preview; links are
placeholders.

Asset paths: /assets/rbccm/css|js/components/NAME.* -> ../NAME/NAME.*
(local component folders); other /assets/... -> https://www.rbccm.com.

Run:  python3 outlook-2027/build-components-test.py
Then: npm run build   (writes dist/outlook-2027.html from this page)
Not shipped.
"""
import copy, json, os, re
import lxml.etree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'outlook-2027-components.html')
JSONLD_OUT = os.path.join(HERE, 'seo-jsonld-paste.json')

# The page as it will be published. Check the address before the block
# is pasted; update PAGE_MODIFIED when the page content changes.
SITE = 'https://www.rbccm.com'
PAGE_URL = SITE + '/en/insights/outlook-2027'
PAGE_NAME = '2027 Outlook'
PAGE_DESCRIPTION = 'Gain perspective on the economic, market, and industry forces shaping opportunities in 2027.'
PAGE_MODIFIED = '2026-11-18'

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

def pick_option(options, value):
    """Choose a dropdown option the way TeamSite saves it: the chosen
    option is marked Selected. The text after the options is set too."""
    for o in options:
        if (o.findtext('Value') or '').strip() == value:
            o.set('Selected', 'true')
        elif 'Selected' in o.attrib:
            del o.attrib['Selected']
    options[-1].tail = value

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
        pick_option(options, value)
    else:
        d.text = value

def set_stories(tree, stories):
    """The component's story list: one Story group per story, built from
    the blank group the properties file ships with."""
    blank = tree.xpath("//Group[@ID='Story']")
    if not blank:
        return
    blank = blank[0]
    parent = blank.getparent()
    at = parent.index(blank)
    parent.remove(blank)
    for i, story in enumerate(stories):
        group = copy.deepcopy(blank)
        for field, value in story.items():
            d = group.xpath('Datum[@ID=$k]', k=field)[0]
            path = d.find('Image/Path')
            options = d.findall('Option')
            if path is not None:
                path.text = value
            elif options:
                pick_option(options, value)
            else:
                d.text = value
        parent.insert(at + i, group)

def render(skin, props_file, overrides):
    """Component defaults from its properties file, then the Outlook copy."""
    tree = copy.deepcopy(load_props(os.path.join(ROOT, props_file)))
    overrides = dict(overrides)
    stories = overrides.pop('stories', None)
    if stories is not None:
        set_stories(tree, stories)
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
          'summary': 'Summary', 'meta': 'Meta', 'date': 'Date', 'img': 'Image', 'link': 'Link',
          'action': 'ActionLabel', 'filter': 'Filter', 'speaker': 'SpeakerName',
          'role': 'SpeakerRole'}

SECTIONS = []   # (section heading, stories) for the structured data

def cards(stories, **section):
    """Datum overrides for one rbccm-insight-cards instance."""
    SECTIONS.append((section.get('SectionHeading', ''), stories))
    d = {'Eyebrow': '', 'SectionIntro': '', 'HeaderButtonLabel': '', 'HeaderButtonLink': '',
         'NotifyEyebrow': '', 'NotifyText': '', 'NotifyButtonLabel': '', 'NotifyLink': '',
         'Layout': 'cards', 'Theme': 'white', 'ShowFilters': 'no', 'ShowShare': 'yes'}
    d['stories'] = [dict((field, story.get(short, 'none' if short == 'type' else ''))
                         for short, field in FIELDS.items()) for story in stories]
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
        'SubtitleText': PAGE_DESCRIPTION,
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
         meta='Frances Donald', date='2026-10-09', img=FPO + 'macro-1-fpo.jpg', link='#', action='Read %s 5 min read' % DOT),
    dict(badge='Markets in Motion', type='podcast', cat='Macro & rates', title='Monetary policy and rates outlook',
         meta='Emma Laurent', date='2026-10-05', img=FPO + 'macro-2-fpo.jpg', link='#', action='Listen %s 22 min' % DOT),
    dict(badge='Strategic Alternatives', type='article', cat='Equities', title='U.S. equity market outlook',
         meta='Daniel Reyes', date='2026-10-01', img=FPO + 'macro-3-fpo.jpg', link='#', action='Read %s 6 min' % DOT),
    dict(badge='Strategic Alternatives', type='video', cat='Consumer', title='FX outlook',
         meta='Daniel Reyes', date='2026-09-28', img=FPO + 'macro-4-fpo.jpg', link='#', action='Watch %s 6 min' % DOT),
], SectionID='macro-views', MobileLayout='carousel-peek', SectionHeading='Macro views',
   NotifyEyebrow='Never miss an Outlook episode',
   NotifyText='Stay up to date with the latest conversations and insights.',
   NotifyButtonLabel='Get notified', NotifyLink='#'))))

S.append(('Strategic themes (rbccm-strategic-themes; pins and steps through the themes as the page scrolls)', render(
    'rbccm-strategic-themes/rbccm-strategic-themes--outlook-2027.xsl',
    'rbccm-strategic-themes/rbccm-strategic-themes-properties.xml', {
        'SectionID': 'strategic-themes',
    })))

S.append(('Capital Markets perspectives (rbccm-insight-cards, Cards, dark)', render(CARDS_SKIN, CARDS_PROPS, cards([
    dict(type='video', cat='Deals & financing', title='M&A Outlook',
         date='2026-09-13', img=FPO + 'perspectives-1-fpo.jpg', link='#', action='Watch %s 5 min' % DOT),
    dict(type='article', cat='Deals & financing', title='Capital Solutions',
         date='2026-10-26', img=FPO + 'perspectives-2-fpo.jpg', link='#', action='Read %s 6 min' % DOT),
    dict(type='podcast', cat='Deals & financing', title='Lending / Loan Outlook',
         date='2026-11-02', img=FPO + 'macro-2-fpo.jpg', link='#', action='Listen %s 5 min' % DOT),
], SectionID='capital-markets-perspectives', Theme='dark', MobileLayout='carousel',
   Eyebrow='Capital Markets perspectives',
   SectionHeading=u'Perspectives on what’s ahead for dealmaking and capital markets.'))))

S.append(('Latest insights (rbccm-insight-cards, Cards, light blue)', render(CARDS_SKIN, CARDS_PROPS, cards([
    dict(badge='Conference', cat='Conference', title='Macro & Markets Conference',
         meta='London, UK %s Dec 2-3, 2026' % DOT, img=FPO + 'latest-1-fpo.jpg', link='#',
         action='Learn more'),
    dict(badge='Breakfast', cat='Breakfast', title='Global Economic & Market Outlook Breakfast',
         meta='Toronto, CA %s January X, 2027' % DOT, img=FPO + 'macro-1-fpo.jpg', link='#',
         action='Listen %s 4 min' % DOT),
    dict(badge='Webinar', type='video', cat='Preview', title='New Years Previews',
         meta='On-demand webinars', img=FPO + 'macro-3-fpo.jpg', link='#',
         action='Watch %s 12 min' % DOT),
], SectionID='latest-insights', Theme='tint',
   SectionHeading='Latest insights & highlights',
   SectionIntro='Stay up to date with our latest insights, perspectives and featured events.',
   HeaderButtonLabel='Explore all insights', HeaderButtonLink='#'))))

PLATFORM_PHOTOS = '../rbccm-platforms/photos/'
PLATFORMS = [
    ('strategic-alternatives', 'Strategic Alternatives',
     'Uncover new ways to drive growth and create value with insights from our capital markets experts.',
     '/en/insights/podcasts/strategic-alternatives'),
    ('rbc-imagine', 'RBC Imagine',
     u'Discover the forces of change reshaping industries, economies and societies – and turn disruption into strategic direction.',
     '/en/insights/imagine'),
    ('rbc-economics', 'RBC Economics',
     'In-depth analysis and perspectives on the economic and market forces shaping the year ahead.',
     'https://www.rbc.com/en/economics'),
    ('real-time-geopolitics', 'Real-Time Geopolitics',
     'Timely insight into the geopolitical developments influencing economies, markets, and industries.',
     '/en/insights/real-time-geopolitics'),
    ('markets-in-motion', 'Markets in Motion',
     'Perspectives on the trends, catalysts, and market developments shaping U.S. equities.',
     '/en/insights/podcasts/markets-in-motion'),
    ('macro-minutes', 'Macro Minutes',
     u'Concise analysis of the latest economic and market developments from RBC’s strategists.',
     '/en/insights/podcasts/macro-minutes'),
]
platform_fields = {
    'SectionID': 'outlook-platforms',
    'Preset': 'outlook-2027-platforms',
    # The <br> breaks the heading before "RBC" from 992px wide only
    # (typed the same way in TeamSite, with the space before it);
    # narrower screens wrap by themselves.
    'SectionTitleText': u'Access insights from across <br>RBC Capital Markets’ global platform',
    'SectionSubtitleText': '',
}
for n, (photo, title, body, href) in enumerate(PLATFORMS, 1):
    platform_fields.update({
        'Card%dPhotoDesktop' % n: PLATFORM_PHOTOS + photo + '.webp',
        'Card%dPhotoMobile' % n: PLATFORM_PHOTOS + photo + '.webp',
        'Card%dTitleText' % n: title,
        'Card%dBodyText' % n: body,
        'Card%dBodyMaxWidth' % n: '',
        'Card%dCtaText' % n: 'Explore',
        'Card%dCtaHref' % n: href,
    })
S.append(('Platforms (rbccm-platforms, Outlook 2027 preset, six cards)', render(
    'rbccm-platforms/rbccm-platforms.xsl', 'rbccm-platforms/rbccm-platforms-properties.xml', platform_fields)))

S.append(('Stay informed (rbccm-marketo-footer)', render(
    'rbccm-marketo-footer/rbccm-marketo-footer.xsl', 'rbccm-marketo-footer/rbccm-marketo-footer-properties.xml', {
        'SectionID': 'stay-informed',
    })))

# ---- Structured data ------------------------------------------------------
def absolute(url):
    """A real address on the site or elsewhere; None for a placeholder."""
    url = (url or '').strip()
    if not url or url == '#' or url.startswith('..'):
        return None
    return SITE + url if url.startswith('/') else url

def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def strip_tags(text):
    return re.sub(r'<[^>]+>', '', text or '').strip()

def story_node(story):
    url = absolute(story.get('link'))
    if not url:
        return None
    kind = story.get('type', '')
    node = {'@id': PAGE_URL + '#' + slug(story['title']), 'url': url, 'inLanguage': 'en-US'}
    if kind == 'video':
        node.update({'@type': 'VideoObject', 'name': story['title']})
        if story.get('date'): node['uploadDate'] = story['date']
        if absolute(story.get('img')): node['thumbnailUrl'] = absolute(story['img'])
    else:
        if kind == 'podcast':
            node.update({'@type': 'PodcastEpisode', 'name': story['title']})
        else:
            node.update({'@type': 'Article', 'headline': story['title']})
        if story.get('date'): node['datePublished'] = story['date']
        if absolute(story.get('img')): node['image'] = absolute(story['img'])
    if strip_tags(story.get('summary')): node['description'] = strip_tags(story['summary'])
    node['isPartOf'] = {'@id': PAGE_URL + '#webpage'}
    node['publisher'] = {'@id': SITE + '/#organization'}
    return node

def structured_data():
    """(JSON text, stories listed, stories left out)."""
    # Organization and WebSite: the same two entries every page carries.
    shared = json.load(open(os.path.join(ROOT, 'rbccm-json-schema', 'pages', 'conference-insights.json'), encoding='utf-8'))
    site = [n for n in shared['@graph'] if n.get('@type') in ('Organization', 'WebSite')]
    nodes, left_out, seen = [], 0, set()
    for _, stories in SECTIONS:
        for story in stories:
            node = story_node(story)
            if node is None:
                left_out += 1
            elif node['@id'] not in seen:
                seen.add(node['@id'])
                nodes.append(node)
    page = {
        '@type': 'CollectionPage', '@id': PAGE_URL + '#webpage', 'url': PAGE_URL,
        'name': PAGE_NAME, 'headline': PAGE_NAME, 'description': PAGE_DESCRIPTION,
        'inLanguage': 'en-US', 'dateModified': PAGE_MODIFIED,
        'isPartOf': {'@type': 'WebSite', '@id': SITE + '/#website'},
        'publisher': {'@id': SITE + '/#organization'},
        'breadcrumb': {'@id': PAGE_URL + '#breadcrumb'},
    }
    crumbs = {
        '@type': 'BreadcrumbList', '@id': PAGE_URL + '#breadcrumb',
        'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/en/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Insights', 'item': SITE + '/en/insights'},
            {'@type': 'ListItem', 'position': 3, 'name': PAGE_NAME, 'item': PAGE_URL},
        ],
    }
    graph = site + [page, crumbs]
    if nodes:
        page['mainEntity'] = {'@id': PAGE_URL + '#insightlist'}
        graph.append({
            '@type': 'ItemList', '@id': PAGE_URL + '#insightlist', 'name': PAGE_NAME + ' insights',
            'url': PAGE_URL, 'numberOfItems': len(nodes),
            'itemListElement': [{'@type': 'ListItem', 'position': i, 'item': {'@id': n['@id']}}
                                for i, n in enumerate(nodes, 1)],
        })
        graph.extend(nodes)
    text = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=True)
    # Safe inside the page and the TeamSite field: no raw & or <.
    return text.replace('&', '\\u0026').replace('<', '\\u003c'), len(nodes), left_out

JSONLD, LISTED, LEFT_OUT = structured_data()
open(JSONLD_OUT, 'w', encoding='ascii').write(JSONLD + '\n')

S.append(('Structured data (rbccm-json-schema; not visible)', render(
    'rbccm-json-schema/rbccm-json-schema.xsl', 'rbccm-json-schema/rbccm-json-schema-properties.xml', {
        'SeoJsonLd': JSONLD,
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
print('Wrote', os.path.relpath(JSONLD_OUT, ROOT), '-', LISTED, 'stories listed,', LEFT_OUT, 'left out (placeholder links)')
