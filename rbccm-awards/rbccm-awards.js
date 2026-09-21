/* =========================================================================
   RBCCM Awards - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-awards.js

   Behavior
   =========================================================================
   Slick is initialized once at page load with a single static config
   that works at every viewport. NO breakpoint-related Slick params:
   no `responsive` block, no matchMedia listener, no slickSetOption
   calls. The layout adapts via CSS only.

   Config rationale
     - slidesToShow: 1        Slick's "current slide" anchors to the left
                              of the list at every breakpoint. On mobile
                              that's the peek card; on desktop, with
                              `.slick-list { overflow: visible }` and
                              `variableWidth: true`, the extra cards flow
                              out to the right and are all visible in the
                              wider container.
     - variableWidth: true    Cards are fixed 250px (CSS !important); Slick
                              measures them and lays out the track as sum
                              of card widths + gaps. No slide-width math
                              to fight.
     - infinite: true         Carousel loops.

   Controls (arrows + dots) are hidden at desktop via CSS (there's
   nothing to page through when every card is on screen).

   Uses accessible-slick (or CDN fallback) via a shared window promise
   so co-hosted RBCCM components (expertise, capability-cards, etc.)
   dedupe the loader cost.
   ========================================================================= */
jQuery(document).ready(function ($) {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Universal Slick loader shared across RBCCM components. */
  function loadSlick(callback) {
    if (typeof $.fn.slick !== 'undefined') { callback(); return; }
    if (!window.__rbccmSlickLoader__) {
      window.__rbccmSlickLoader__ = new Promise(function (resolve) {
        function poll() {
          if (typeof $.fn.slick !== 'undefined') { resolve(); return true; }
          return false;
        }
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
          var s = document.createElement('script');
          s.src = 'https://www.rbccm.com/assets/rbccm/js/accessible-slick.min.js';
          s.onload = function () { resolve(); };
          s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
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
    var $grid  = $section.find('.rbccm-awards__grid');
    var $cards = $grid.children('.rbccm-awards__card');
    var $dots  = $section.find('.rbccm-awards__dots');
    var $prev  = $section.find('.rbccm-awards__btn--prev');
    var $next  = $section.find('.rbccm-awards__btn--next');

    /* Breakpoint per variant matches the CSS (row-fits-statically
       width including the 23×2 side inset):
         --3 (MAAS/MATA, 264 cards): 3×264 + 2×16 + 23×2 = 870
         --4 (US Creds,  250 cards): 4×250 + 3×16 + 23×2 = 1146
       On the upward cross we snap to slide 0 so cards 1-N are the
       ones you see, not whatever slide the user paged to on mobile. */
    var desktopBp = $section.hasClass('rbccm-awards--4') ? 1146 : 870;
    var mqDesktop = window.matchMedia('(min-width: ' + desktopBp + 'px)');

    if ($cards.length <= 1) return;

    function initSlider() {
      if ($grid.hasClass('slick-initialized')) return;

      $grid.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      if ($prev.length) $prev[0].disabled = false;
      if ($next.length) $next[0].disabled = false;

      $prev.off('click.rbccmAwards').on('click.rbccmAwards', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickPrev');
      });
      $next.off('click.rbccmAwards').on('click.rbccmAwards', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickNext');
      });

      /* Reset to slide 0 whenever the viewport crosses INTO desktop
         (>=1100). Without this, if the user paged to slide 3 on
         mobile then resized up, Slick's internal transform still
         points to slide 3 — cards 1 and 2 end up off-canvas to the
         left. Only fires on the upward cross; downward transitions
         leave whatever slide is active alone. `true` on slickGoTo
         suppresses the animation for an instant snap. */
      function onBreakpointChange() {
        if (!mqDesktop.matches) return;
        if (!$grid.hasClass('slick-initialized')) return;
        $grid.slick('slickGoTo', 0, true);
      }
      if (typeof mqDesktop.addEventListener === 'function') {
        mqDesktop.addEventListener('change', onBreakpointChange);
      } else if (typeof mqDesktop.addListener === 'function') {
        mqDesktop.addListener(onBreakpointChange);
      }
    }

    loadSlick(initSlider);
  }

  $('.rbccm-awards').each(function () { setupSection($(this)); });
});
