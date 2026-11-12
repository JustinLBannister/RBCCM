/* =========================================================================
   RBCCM JSON Schema - automatic structured data for every page
   Deploy path: /assets/rbccm/js/components/rbccm-json-schema-auto.js
   Loaded site-wide by a short loader at the end of /assets/rbccm/js/nav.min.js
   =========================================================================
   Builds a schema.org JSON-LD @graph from what every page already has
   and adds it to <head>. Nothing to fill in, per page or per story.

   Every page gets
     Organization    RBC Capital Markets (parent: Royal Bank of Canada)
     WebSite         rbccm.com
     WebPage         url       <link rel="canonical">
                     name      <title>
                     description <meta name="description">
                     image     <meta property="og:image">
                     language  <html lang>
     BreadcrumbList  from the page's breadcrumb trail (hero, story or
                     legacy breadcrumb markup) plus the page itself,
                     named from <title> minus " | RBC Capital Markets"

   Story pages (og:type "article" or article:published_time) also get
     Article         headline  the page <h1> (falls back to the title)
                     author    article:author, else the "By" byline;
                               none = RBC Capital Markets
                     dates     article:published_time / modified_time
                     image     og:image
                     keywords  <meta name="keywords">

   Skipped when
     - the page already has a JSON-LD block (a hand-written block from
       the rbccm-json-schema component wins; pages without one are
       covered automatically)
     - the page is noindex

   The Organization and WebSite @ids match the homepage's hand-written
   block, so search engines read every page as part of the same site.
   ========================================================================= */
(function (w, d) {
  'use strict';

  if (w.rbccmJsonLdAuto) return;
  w.rbccmJsonLdAuto = true;

  var ORIGIN = 'https://www.rbccm.com';
  var ORG_ID = ORIGIN + '/#organization';
  var SITE_ID = ORIGIN + '/#website';
  var PARENT_ID = 'https://www.rbc.com/#organization';

  /* Single source of truth for the company. Edit here, re-upload, and
     every page picks it up. */
  var ORGANIZATION = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'RBC Capital Markets',
    url: ORIGIN + '/en/',
    logo: ORIGIN + '/assets/rbccm/images/rbccm_logo.svg',
    sameAs: [
      'https://www.linkedin.com/company/rbc-capital-markets',
      'https://x.com/rbccm',
      'https://www.youtube.com/channel/UCg-KNEqWQdHFt5Q73-GnBPw'
    ],
    parentOrganization: {
      '@type': 'Organization',
      '@id': PARENT_ID,
      name: 'Royal Bank of Canada',
      url: 'https://www.rbc.com/'
    }
  };

  var BREADCRUMB_LISTS = [
    '.rbccm-hero__breadcrumb-list',
    '.story-breadcrumb',
    'ul.breadcrumb',
    'ol.breadcrumb',
    'nav[aria-label="breadcrumb"] ul',
    'nav[aria-label="breadcrumb"] ol',
    'nav[aria-label="Breadcrumb"] ul',
    'nav[aria-label="Breadcrumb"] ol'
  ];

  function clean(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  }

  function meta(attr, key) {
    var el = d.querySelector('meta[' + attr + '="' + key + '"]');
    return el ? clean(el.getAttribute('content')) : '';
  }

  function metaAll(attr, key) {
    var els = d.querySelectorAll('meta[' + attr + '="' + key + '"]');
    var out = [];
    for (var i = 0; i < els.length; i++) {
      var v = clean(els[i].getAttribute('content'));
      if (v) out.push(v);
    }
    return out;
  }

  /* Absolute https://www.rbccm.com URL without query, hash or trailing
     slash (rbccm.com 404s on /en/about-us/), except the language home
     (/en/, /fr/), which is canonical with the slash. */
  function normalize(href) {
    if (!href) return '';
    var a = d.createElement('a');
    a.href = href;
    if (!/^https?:$/.test(a.protocol)) return '';
    var host = a.hostname.replace(/^rbccm\.com$/, 'www.rbccm.com');
    var path = a.pathname.charAt(0) === '/' ? a.pathname : '/' + a.pathname;
    if (/^\/[a-z]{2}\/?$/i.test(path)) {
      path = path.replace(/\/?$/, '/');
    } else if (path.length > 1) {
      path = path.replace(/\/+$/, '');
    }
    return 'https://' + host + path;
  }

  function absolute(src) {
    if (!src) return '';
    var a = d.createElement('a');
    a.href = src;
    return /^https?:$/.test(a.protocol) ? a.href : '';
  }

  function language() {
    var lang = clean(d.documentElement.getAttribute('lang'));
    return lang || 'en';
  }

  function isNoindex() {
    var r = (meta('name', 'robots') + ' ' + meta('name', 'googlebot')).toLowerCase();
    return r.indexOf('noindex') > -1;
  }

  function hasJsonLd() {
    var els = d.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < els.length; i++) {
      if (!els[i].hasAttribute('data-rbccm-jsonld')) return true;
    }
    return false;
  }

  function pageUrl() {
    var canon = d.querySelector('link[rel="canonical"]');
    return normalize((canon && canon.getAttribute('href')) || meta('property', 'og:url') ||
      w.location.href);
  }

  /* Page <h1>, keeping a space between lines set as separate spans. */
  function heading() {
    var h1 = d.querySelector('main h1, h1');
    if (!h1) return '';
    var parts = [];
    var walker = d.createTreeWalker(h1, 4, null, false);
    while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
    return clean(parts.join(' ')).replace(/\s+([.,:;!?])/g, '$1');
  }

  /* "U.S. Credentials | RBC Capital Markets" -> "U.S. Credentials". */
  function pageName(title) {
    var name = title.replace(/\s+\|\s+[^|]*$/, '');
    return name || title;
  }

  /* Breadcrumb trail from the first breadcrumb list on the page, with
     the current page added as the last step. Null if there's no trail. */
  function breadcrumb(url, currentName) {
    var list = null;
    for (var i = 0; i < BREADCRUMB_LISTS.length && !list; i++) {
      list = d.querySelector(BREADCRUMB_LISTS[i]);
    }
    if (!list) return null;

    var steps = [];
    var seen = {};
    var links = list.querySelectorAll('li a[href]');
    for (var j = 0; j < links.length; j++) {
      var name = clean(links[j].textContent);
      var href = normalize(links[j].getAttribute('href'));
      if (!name || !href || seen[href] || href === url) continue;
      seen[href] = true;
      steps.push({ name: name, item: href });
    }
    if (!steps.length) return null;
    steps.push({ name: currentName, item: url });

    return {
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumb',
      itemListElement: steps.map(function (s, k) {
        return { '@type': 'ListItem', position: k + 1, name: s.name, item: s.item };
      })
    };
  }

  /* Byline names: article:author meta, else the story's "By ..." line
     (the part before Featuring / Published). */
  function authorNames() {
    var names = metaAll('property', 'article:author');
    if (names.length) return names;
    var attr = d.querySelector('.article-attribution');
    if (!attr) return [];
    var m = /\bBy\b([\s\S]*?)(?:<br|\bFeaturing\b|\bPublished\b|$)/i.exec(attr.innerHTML);
    if (!m) return [];
    var tmp = d.createElement('div');
    tmp.innerHTML = m[1];
    var by = clean(tmp.textContent);
    return by ? [by] : [];
  }

  /* "Valerie Grimba" or "A, B and C" -> Person list. Names starting
     with RBC (e.g. RBC Race for the Kids) are organizations;
     RBC Capital Markets itself points at the main Organization. */
  function authors(names) {
    var out = [];
    names.forEach(function (n) {
      n.split(/\s*(?:,|;|\band\b|&)\s*/i).forEach(function (p) {
        p = clean(p);
        if (!p) return;
        if (/^rbc capital markets$/i.test(p)) out.push({ '@id': ORG_ID });
        else if (/^rbc\b/i.test(p)) out.push({ '@type': 'Organization', name: p });
        else out.push({ '@type': 'Person', name: p });
      });
    });
    return out;
  }

  function isArticle() {
    return meta('property', 'og:type').toLowerCase() === 'article' ||
      !!meta('property', 'article:published_time');
  }

  function build() {
    var url = pageUrl();
    if (!url) return null;

    var lang = language();
    var title = clean(d.title) || meta('property', 'og:title');
    var description = meta('name', 'description') || meta('property', 'og:description');
    var image = absolute(meta('property', 'og:image'));
    var h1 = heading();
    var name = pageName(title);

    var webPage = {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url: url,
      name: title,
      isPartOf: { '@id': SITE_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: lang
    };
    if (description) webPage.description = description;
    if (image) webPage.primaryImageOfPage = { '@type': 'ImageObject', url: image };

    var graph = [
      ORGANIZATION,
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        name: 'RBC Capital Markets',
        url: ORIGIN + '/en/',
        publisher: { '@id': ORG_ID }
      },
      webPage
    ];

    var crumbs = breadcrumb(url, name);
    if (crumbs) {
      webPage.breadcrumb = { '@id': crumbs['@id'] };
      graph.push(crumbs);
    }

    if (isArticle()) {
      var published = meta('property', 'article:published_time');
      var modified = meta('property', 'article:modified_time');
      var people = authors(authorNames());
      var keywords = meta('name', 'keywords');
      var article = {
        '@type': 'Article',
        '@id': url + '#article',
        headline: (h1 || name).slice(0, 110),
        mainEntityOfPage: { '@id': url + '#webpage' },
        isPartOf: { '@id': url + '#webpage' },
        author: people.length ? people : { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        inLanguage: lang
      };
      if (description) article.description = description;
      if (image) article.image = [image];
      if (published) article.datePublished = published;
      if (modified || published) article.dateModified = modified || published;
      if (keywords) article.keywords = keywords;
      graph.push(article);
      if (published) webPage.datePublished = published;
      if (modified) webPage.dateModified = modified;
    }

    return { '@context': 'https://schema.org', '@graph': graph };
  }

  function run() {
    if (hasJsonLd() || isNoindex()) return;
    var data = build();
    if (!data) return;
    var s = d.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-rbccm-jsonld', 'auto');
    s.text = JSON.stringify(data).replace(/</g, '\\u003c');
    (d.head || d.documentElement).appendChild(s);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})(window, document);
