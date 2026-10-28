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

   `preview` (optional) shapes dist/<page>.html, the page preview each
   build writes (details in build/page-preview.mjs):
     variants  which data-variant of a component's preview page to show
               (the label text on its variant picker); default: the first
     skip      components left out of the preview; default: rbccm-button
               and rbccm-animate, whose previews are demos
     file      one whole preview page to use instead of the components'

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
      ],
      preview: {
        variants: {
          'rbccm-hero': 'US Credentials - background images',
          'rbccm-capability-cards': '4-up (US Creds)',
          'rbccm-two-up-cards': 'Features',
          'rbccm-platforms': 'US Credentials',
          'rbccm-cta-band': 'US Credentials'
        }
      }
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
      ],
      preview: {
        variants: {
          'rbccm-hero': 'Strategy & Economics',
          'rbccm-cta-band': 'Strategy & Economics',
          'rbccm-platforms': 'Strategy & Economics'
        }
      }
    },

    // Same files, same order as the live page
    // (.../electronic-trading/multi-asset-agency-solutions). Live loads no
    // hero or two-up-cards JS here, so those are CSS only.
    'maas-mata': {
      components: [
        { name: 'rbccm-animate', css: [], js: ['rbccm-animate/rbccm-animate.js'] },
        { name: 'rbccm-hero', css: ['rbccm-hero/rbccm-hero.css'], js: [] },
        'rbccm-video-poster',
        'rbccm-section-group',
        'rbccm-intro-statement',
        'rbccm-awards',
        { name: 'rbccm-two-up-cards', css: ['rbccm-two-up-cards/rbccm-two-up-cards.css'], js: [] },
        'rbccm-capability-cards',
        'rbccm-numbered-features',
        'rbccm-cta-band',
        'rbccm-marketo-modal'
      ],
      preview: {
        file: 'maas-mata-page/maas-mata-components.html'
      }
    }
  }
};
