/* =========================================================================
   Page bundle manifest
   =========================================================================
   One entry per page. `npm run build` turns each entry into:

     dist/css/<page>.css       readable, with a banner per component
     dist/css/<page>.min.css   minified (what you deploy)
     dist/js/<page>.js         readable
     dist/js/<page>.min.js     minified (what you deploy)

   Order matters. CSS and JS are concatenated in the order listed, the
   same way separate <link>/<script> tags would load. Keep the order
   the page used before bundling.

   A component can be listed two ways:

     'rbccm-hero'
        Shorthand. Picks up rbccm-hero/rbccm-hero.css and
        rbccm-hero/rbccm-hero.js if they exist. A component with no
        JS (e.g. rbccm-button) is fine.

     { name: 'rbccm-animate', css: [], js: ['rbccm-animate/rbccm-animate.js'] }
        Explicit. Use when the files don't follow the naming convention,
        or to leave one half out. Paths are relative to the repo root.

   `extra` adds page-level files that aren't components (e.g. the
   MAAS+MATA page stylesheet). They are placed where `extraPosition`
   says: 'before' (default) or 'after' the components.

   Third-party libraries (jQuery, Slick, animate.css) are NOT bundled.
   The site already loads them globally.
   ========================================================================= */

export default {
  version: '1',

  pages: {
    'us-credentials': {
      components: [
        'rbccm-button',
        'rbccm-hero',
        'rbccm-awards',
        'rbccm-capability-cards',
        'rbccm-two-up-cards',
        'rbccm-platforms',
        'rbccm-cta-band',
        // JS only. animate.css itself comes from the site-wide include.
        { name: 'rbccm-animate', css: [], js: ['rbccm-animate/rbccm-animate.js'] }
      ]
    },

    'strategy-and-economics': {
      components: [
        'rbccm-hero',
        'rbccm-accordions',
        'rbccm-expertise',
        'rbccm-leading-experts',
        'rbccm-cta-band',
        'rbccm-platforms',
        'rbccm-in-the-media',
        'rbccm-featured-insights',
        { name: 'rbccm-animate', css: [], js: ['rbccm-animate/rbccm-animate.js'] }
      ]
    },

    'maas-mata': {
      extraPosition: 'before',
      extra: {
        css: ['maas-mata-page/maas-mata.css'],
        js: ['maas-mata-page/rbccm-json-bind.js', 'maas-mata-page/maas-mata.js']
      },
      components: [
        'rbccm-awards',
        'rbccm-cta-band'
      ]
    }
  }
};
