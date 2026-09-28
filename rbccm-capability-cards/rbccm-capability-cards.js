/* =========================================================================
   RBCCM Capability Cards - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-capability-cards.js

   Only acts on `.rbccm-capability-cards--slider` sections (the US
   Credentials skin). The MAAS+MATA skin has no --slider class, so this
   file is a no-op there.

   Behaviour (same pattern as rbccm-awards)
   =========================================================================
   - Slick, variableWidth + infinite. Cards are a fixed 276px (CSS), the
     row starts at the rail's left edge and runs off the right edge of
     the viewport so the next card peeks in. Prev / dots / next below.
   - Static mode: when every card fits the rail (e.g. 4 cards on a wide
     screen) the section gets .is-static. The CSS centres the row at its
     own width and hides the controls; the JS turns swipe off and snaps
     back to card 1. Re-checked on resize.
   - Accessibility: a card link is a Tab stop only when its card is
     fully on screen. Cards that are off canvas (or only peeking) get
     aria-hidden="true" and tabindex="-1" on the link. Slick's
     tabpanel roles are replaced with "slide N of M" groups, and the
     dots get plain "Go to slide N" labels + aria-current. This covers
     both modes: in static mode every real card is visible, so all of
     them are reachable and read, and the clones stay hidden.

   Needs jQuery (on every RBCCM page). Loads accessible-slick (or the
   cdnjs fallback) through the shared window promise used by
   rbccm-awards and the other RBCCM carousels.
   ========================================================================= */
jQuery(document).ready(function ($) {
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function px(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }

  function setupSection($section) {
    var section = $section[0];
    var $grid   = $section.find('.rbccm-capability-cards__grid');
    var $cards  = $grid.children('.rbccm-capability-cards__card');
    var $dots   = $section.find('.rbccm-capability-cards__dots');
    var $prev   = $section.find('.rbccm-capability-cards__btn--prev');
    var $next   = $section.find('.rbccm-capability-cards__btn--next');
    var count   = $cards.length;

    if (count <= 1) { $section.addClass('is-static'); return; }

    /* Row width from the CSS custom properties, so the numbers live
       in one place (the stylesheet). */
    var cs    = window.getComputedStyle(section);
    var cardW = px(cs.getPropertyValue('--rbccm-cc-card'), 276);
    var gapW  = px(cs.getPropertyValue('--rbccm-cc-gap'), 12);
    var rowW  = count * cardW + (count - 1) * gapW;
    section.style.setProperty('--rbccm-cc-row', rowW + 'px');

    function railWidth() {
      var rail = px(window.getComputedStyle(section)
        .getPropertyValue('--rbccm-capability-cards-max-width'), 1140);
      return Math.min(rail, section.clientWidth - 46);   /* 23px each side */
    }
    function fitsStatically() { return rowW <= railWidth(); }

    function isFullyVisible(slideEl) {
      var list = $grid.find('.slick-list')[0];
      if (!list) return true;
      var lr = list.getBoundingClientRect();
      var sr = slideEl.getBoundingClientRect();
      var w  = sr.right - sr.left;
      if (w <= 0) return false;
      var vis = Math.min(sr.right, lr.right) - Math.max(sr.left, lr.left);
      return vis / w >= 0.9;
    }

    function applyA11y() {
      if (!$grid.hasClass('slick-initialized')) return;
      var slick = $grid.slick('getSlick');
      var total = slick ? slick.slideCount : count;
      $grid.find('.slick-slide').each(function () {
        var el = this;
        var raw = parseInt(el.getAttribute('data-slick-index'), 10);
        var n = ((raw % total) + total) % total + 1;
        var visible = isFullyVisible(el);

        el.removeAttribute('tabindex');
        el.removeAttribute('aria-describedby');
        el.setAttribute('role', 'group');
        el.setAttribute('aria-roledescription', 'slide');
        el.setAttribute('aria-label', n + ' of ' + total);
        el.setAttribute('aria-hidden', visible ? 'false' : 'true');

        $(el).find('a, button').each(function () {
          if (visible) this.removeAttribute('tabindex');
          else this.setAttribute('tabindex', '-1');
        });
      });

      var current = slick ? slick.currentSlide : 0;
      $dots.find('li').removeAttr('role');
      $dots.find('button').each(function (i) {
        this.removeAttribute('role');
        this.removeAttribute('aria-controls');
        this.removeAttribute('aria-selected');
        this.removeAttribute('tabindex');
        this.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        if (i === current) this.setAttribute('aria-current', 'true');
        else this.removeAttribute('aria-current');
      });
      $dots.find('ul').removeAttr('role');
    }

    /* Static mode: no swipe / drag, controls hidden (CSS), back to
       card 1 so the row lines up. Slick reads these options on each
       touch / drag, so setting them on the instance is enough (no
       slickSetOption - it relies on $.type, removed in jQuery 4). */
    var wasStatic = null;
    function syncMode() {
      if (!$grid.hasClass('slick-initialized')) return;
      var isStatic = fitsStatically();
      $section.toggleClass('is-static', isStatic);
      var slick = $grid.slick('getSlick');
      if (slick && slick.options) {
        slick.options.swipe = !isStatic;
        slick.options.draggable = !isStatic;
        slick.options.touchMove = !isStatic;
        $grid.find('.slick-list').toggleClass('draggable', !isStatic);
      }
      if (isStatic !== wasStatic) {
        $grid.slick('setPosition');
        if (isStatic) $grid.slick('slickGoTo', 0, true);
      }
      wasStatic = isStatic;
      applyA11y();
    }

    function initSlider() {
      if ($grid.hasClass('slick-initialized')) return;

      /* Wrap each card in a plain slide div and run Slick with rows: 0,
         so the slide is always that div, whichever Slick build the page
         has (some make the card itself the slide, some add their own
         wrapper). Slide roles and aria-hidden then never land on the
         card link. */
      $cards.wrap('<div class="rbccm-capability-cards__slide"></div>');

      $grid.slick({
        rows: 0,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        arrows: false,
        dots: true,
        appendDots: $dots,
        infinite: true,
        adaptiveHeight: false,
        accessibility: false,         /* a11y handled in applyA11y */
        speed: reducedMotion ? 0 : 350,
        cssEase: reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)'
      });

      $prev.off('click.rbccmCap').on('click.rbccmCap', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickPrev');
      });
      $next.off('click.rbccmCap').on('click.rbccmCap', function () {
        if ($grid.hasClass('slick-initialized')) $grid.slick('slickNext');
      });

      $grid.on('afterChange.rbccmCap', applyA11y);
      /* Dot buttons are rebuilt by some slick builds; re-label on click. */
      $dots.on('click.rbccmCap', 'button', function () { setTimeout(applyA11y, 0); });

      syncMode();

      var t;
      $(window).on('resize.rbccmCap', function () {
        clearTimeout(t);
        t = setTimeout(syncMode, 100);
      });
    }

    loadSlick(initSlider);
  }

  $('.rbccm-capability-cards--slider').each(function () { setupSection($(this)); });
});
