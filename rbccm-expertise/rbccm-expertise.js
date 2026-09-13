/* =========================================================================
   RBCCM Expertise - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-expertise.js

   Behavior
   =========================================================================
   Below 1245px the .rbccm-expertise__track collapses from a 4-column
   grid into a Slick carousel:
     - <768px: 1 pillar per view
     - 768-1244px: 2 pillars per view
     - >=1245px: Slick is destroyed and the CSS grid takes over

   Requires jQuery. Slick is lazy-loaded from CDN on first mobile init
   so the desktop path pays no JS cost.

   Ported from the earlier rbccm-reasons pattern. Class-selector prefix
   swapped rbccm-reasons -> rbccm-expertise; behavior otherwise
   identical. Safe on multi-instance pages (each section binds
   independently).
   ========================================================================= */
jQuery(document).ready(function ($) {
  var reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Universal Slick loader. Runs on ANY page + ANY component that
     uses this pattern. Four resolution paths, in order:
       1. Slick already available globally ($.fn.slick defined) --
          site chrome or a previously-initialized component loaded
          it. Fire the callback immediately.
       2. Our shared window promise exists -- another RBCCM component
          on this page kicked off a load a moment ago. Wait on it.
       3. A <script src="...slick*"> tag is already in the DOM but
          hasn't finished loading yet -- site chrome or a legacy
          component beat us to it. Poll for $.fn.slick until it
          appears, with a 10s safety net that falls back to inject.
       4. Nothing anywhere -- inject the RBCCM-hosted accessible
          Slick (a11y-enhanced fork the site chrome uses site-wide;
          preferred over vanilla Slick for keyboard + SR support).
     Only path 4 hits the network. Paths 1-3 dedupe. Result: multi-
     Slick pages (S&E: expertise + featured-insights + any future
     component) never load Slick more than once. */
  function loadSlick(callback) {
    if (typeof $.fn.slick !== 'undefined') { callback(); return; }
    if (!window.__rbccmSlickLoader__) {
      window.__rbccmSlickLoader__ = new Promise(function (resolve) {
        function poll() {
          if (typeof $.fn.slick !== 'undefined') { resolve(); return true; }
          return false;
        }
        /* Sniff for anything Slick-shaped: RBCCM's accessible-slick
           fork, vanilla slick.min.js, slick-carousel via CDN, etc. */
        var existing = document.querySelector(
          'script[src*="accessible-slick"], script[src*="slick.min.js"], script[src*="slick-carousel"], script[src*="slick.js"]'
        );
        if (existing) {
          var timer = setInterval(function () { if (poll()) clearInterval(timer); }, 30);
          setTimeout(function () {
            clearInterval(timer);
            if (typeof $.fn.slick === 'undefined') inject();
            else resolve();
          }, 10000);
          return;
        }
        inject();
        function inject() {
          /* Two-tier inject:
             (a) Prefer RBCCM's accessible-slick fork (a11y-enhanced,
                 matches what site chrome loads on rbccm.com). Full
                 absolute URL so production, TeamSite, and local
                 file:// previews all resolve the same host.
             (b) If that fails (CORS blocked on file://, network
                 error, 404, etc.) fall back to public cdnjs Slick
                 so local development still works. Production almost
                 never hits (b) because chrome-loaded Slick is picked
                 up by the earlier detection paths anyway. */
          var s = document.createElement('script');
          s.src = 'https://www.rbccm.com/assets/rbccm/js/accessible-slick.min.js';
          s.onload = function () { resolve(); };
          s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
            s2.integrity = 'sha512-HGOnQO9+SP1V92SrtZfjqxxtLmVzqZpjFFekvzZVWoiASSQgSr4cw9Kqd2+l8Llp4Gm0G8GIFJ4ddwZilcdb8A==';
            s2.crossOrigin = 'anonymous';
            s2.referrerPolicy = 'no-referrer';
            s2.onload = function () { resolve(); };
            document.head.appendChild(s2);
          };
          document.head.appendChild(s);
        }
      });
    }
    window.__rbccmSlickLoader__.then(callback);
  }

  function setupSection($section) {
    var $track    = $section.find('.rbccm-expertise__track');
    var $pillars  = $track.children('.rbccm-expertise__pillar');
    var $dots     = $section.find('.rbccm-expertise__dots');
    var $announce = $section.find('.rbccm-expertise__sr-only');

    $section.toggleClass('rbccm-expertise--single', $pillars.length <= 1);

    function updateAnnounce(currentSlide) {
      if (!$announce.length || $pillars.length <= 1) return;
      $announce.text('Item ' + (currentSlide + 1) + ' of ' + $pillars.length);
    }
    function syncDots() {
      var $buttons = $dots.find('li button');
      if (!$buttons.length) return;
      $dots.attr({ 'role': 'group', 'aria-label': 'Choose a pillar' });
      $buttons.each(function (idx) {
        $(this).attr('tabindex', '0').attr('aria-label', 'Go to slide ' + (idx + 1));
      });
    }

    function initSlider() {
      if ($pillars.length <= 1 || $track.hasClass('slick-initialized')) return;
      $track.off('.rbccmExpertise');
      $track.on('init.rbccmExpertise afterChange.rbccmExpertise', function (event, slick, currentSlide) {
        var active = typeof currentSlide === 'number' ? currentSlide : slick.currentSlide;
        updateAnnounce(active);
        syncDots();
      });
      $track.on('destroy.rbccmExpertise', function () {
        $dots.empty();
        $announce.empty();
      });
      $track.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,  /* equalize slide heights (tallest wins) */
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        mobileFirst: true,
        responsive: [
          {
            /* 640-991: 2-per-view slider. */
            breakpoint: 640,
            settings: { slidesToShow: 2, slidesToScroll: 2 }
          },
          {
            /* 992-1244: 3-per-view slider. */
            breakpoint: 992,
            settings: { slidesToShow: 3, slidesToScroll: 3 }
          },
          {
            /* 1245+: 4-per-view. Slick STAYS initialized (not
               unslicked) but the CSS below hides the controls
               since all pillars are visible at once. */
            breakpoint: 1245,
            settings: { slidesToShow: 4, slidesToScroll: 4 }
          }
        ]
      });
      syncDots();

      $section.find('.rbccm-expertise__btn--prev').off('click.rbccmExpertise').on('click.rbccmExpertise', function () {
        if ($track.hasClass('slick-initialized')) $track.slick('slickPrev');
      });
      $section.find('.rbccm-expertise__btn--next').off('click.rbccmExpertise').on('click.rbccmExpertise', function () {
        if ($track.hasClass('slick-initialized')) $track.slick('slickNext');
      });

      /* Keyboard: arrow keys on the controls row scrub prev/next; when
         focus sits on a dot button, arrow keys move focus dot-to-dot. */
      $section.find('.rbccm-expertise__controls').off('keydown.rbccmExpertise').on('keydown.rbccmExpertise', function (e) {
        if (!$track.hasClass('slick-initialized')) return;
        var dir = 0;
        if (e.key === 'ArrowLeft'  || e.key === 'Left')  dir = -1;
        if (e.key === 'ArrowRight' || e.key === 'Right') dir =  1;
        if (!dir) return;
        var $target = $(e.target);
        var $dotBtn = $target.closest('.rbccm-expertise__dots button');
        e.preventDefault();
        if ($dotBtn.length) {
          var $btns = $dots.find('li button');
          var idx = $btns.index($dotBtn);
          if (idx === -1) return;
          var next = (idx + dir + $btns.length) % $btns.length;
          var $nextDot = $btns.eq(next);
          $nextDot.trigger('click');
          window.setTimeout(function () { $nextDot.get(0).focus({ preventScroll: true }); }, 0);
          return;
        }
        if (dir === -1) $track.slick('slickPrev');
        if (dir ===  1) $track.slick('slickNext');
      });
    }

    /* Slick always initializes; its responsive breakpoints handle
       1/2/3/4-per-view. At >=1245 controls are hidden via CSS so the
       row reads as a static 4-col grid. This avoids a first-load bug
       where a desktop viewport skipped init and pillars stacked. */
    loadSlick(initSlider);
  }

  $('.rbccm-expertise').each(function () { setupSection($(this)); });
});
