/*
   Leadership Carousel — component JS
   Deploy path: /assets/rbccm/js/components/leadership-carousel.js

   XSL emits i18n templates on #rbccm-leadership as data-i18n-* attrs;
   English fallbacks below keep the component working if any are missing.

   Loads accessible-slick from /assets/rbccm/js/accessible-slick.min.js
   and falls back to vanilla slick from cdnjs.

   DEBUG is off by default. Turn on via window.__RBCCM_LEADERSHIP_DEBUG
   in DevTools before init to trace Tab/focus events.
*/

(function () {
  'use strict';

  // Wait for jQuery + DOM ready. Same entry point as the previous
  // inline version so nothing about init timing changes.
  if (typeof jQuery === 'undefined') return;

  jQuery(document).ready(function ($) {
    var section = document.getElementById('rbccm-leadership');
    if (!section) return;

    var $track    = $('.rbccm-leadership__slider-track');
    var $dots     = $('#rbccm-lead-dots');
    var FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

    // i18n templates — read from data-i18n-* on the section, English fallbacks below.
    var I18N = {
      slideRoleDesc:            section.getAttribute('data-i18n-slide-role')                   || 'slide',
      slideAriaTpl:             section.getAttribute('data-i18n-slide-aria-tpl')               || 'slide {n} of {total}',
      slideAriaNameOnlyTpl:     section.getAttribute('data-i18n-slide-aria-name-only-tpl')     || '{name}, slide {n} of {total}',
      slideAriaNameTpl:         section.getAttribute('data-i18n-slide-aria-name-tpl')          || '{name}, {role}, slide {n} of {total}',
      dotAriaTpl:               section.getAttribute('data-i18n-dot-aria-tpl')                 || 'Go to slide {n} of {total}',
      dotAriaCurrentTpl:        section.getAttribute('data-i18n-dot-aria-current-tpl')         || 'Current slide: {name}, slide {n} of {total}',
      dotAriaCurrentNoNameTpl:  section.getAttribute('data-i18n-dot-aria-current-noname-tpl')  || 'Current slide {n} of {total}',
      announceTpl:              section.getAttribute('data-i18n-announce-tpl')                 || 'Slide {n} of {total}',
      announceNameTpl:          section.getAttribute('data-i18n-announce-name-tpl')            || '{name}, slide {n} of {total}',
      dotsListLabel:            section.getAttribute('data-i18n-dots-list-label')              || 'Slide selection'
    };

    // {placeholder} substitution. Also strips orphan commas so a missing
    // {role} in "{name}, {role}, slide N" doesn't leave dangling punctuation.
    function fmt(tpl, vars) {
      return String(tpl).replace(/\{(\w+)\}/g, function (_, k) {
        return (vars && vars[k] != null && vars[k] !== '') ? vars[k] : '';
      })
        .replace(/\s+,/g, ',')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Name/role cache indexed 0..slideCount-1. Clones share the same index
    // via (data-slick-index % slideCount) and hit the same entry.
    var SLIDE_INFO = [];
    function buildSlideInfoCache() {
      SLIDE_INFO = [];
      $track.find('.slick-slide').not('.slick-cloned').each(function (i) {
        var nameEl = this.querySelector('.rbccm-leadership__card-name');
        var roleEl = this.querySelector('.rbccm-leadership__card-role');
        SLIDE_INFO[i] = {
          name: nameEl ? (nameEl.textContent || '').trim() : '',
          role: roleEl ? (roleEl.textContent || '').trim() : ''
        };
      });
    }
    function slideInfoFor(index) {
      return SLIDE_INFO[index] || { name: '', role: '' };
    }

    // Long-role detection: if any card's role text exceeds the
    // threshold, add a class to the section so CSS can bump the
    // bottom spacing on EVERY card uniformly (so they all match
    // visually rather than only the long one looking different).
    var LONG_ROLE_THRESHOLD = 70;
    function checkLongRoles() {
      var hasLong = false;
      $('.rbccm-leadership__card-role').each(function () {
        if ((this.textContent || '').trim().length > LONG_ROLE_THRESHOLD) {
          hasLong = true; return false; // break
        }
      });
      section.classList.toggle('rbccm-leadership--long-role', hasLong);
    }
    checkLongRoles();

    // === BEGIN DEBUG =======================================================
    // Tab / focus tracing for QA. Off by default — flip DEBUG to true here,
    // or set `window.__RBCCM_LEADERSHIP_DEBUG = true` before this script
    // loads, to re-enable the console traces.
    var DEBUG = window.__RBCCM_LEADERSHIP_DEBUG === true;
    if (DEBUG) {
      var __describeEl = function (el) {
        if (!el || el === document.body) return '(body)';
        var tag  = el.tagName.toLowerCase();
        var id   = el.id ? '#' + el.id : '';
        var cls  = el.className && typeof el.className === 'string'
                   ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
        var name = el.getAttribute('aria-label')
                   || (el.textContent || '').trim().slice(0, 40);
        var ti   = el.getAttribute('tabindex');
        var inCarousel = section.contains(el) ? ' [in carousel]' : ' [OUTSIDE]';
        return tag + id + cls + ' "' + name + '"' + (ti !== null ? ' tabindex=' + ti : '') + inCarousel;
      };
      $(document).on('keydown.rbccmDebug', function (e) {
        if (e.key === 'Tab') {
          console.log('%c[TAB ' + (e.shiftKey ? 'shift' : 'fwd') + ']',
            'color:#fff;background:#003168;padding:2px 6px;border-radius:3px;',
            'from:', __describeEl(document.activeElement));
        }
      });
      document.addEventListener('focusin', function (e) {
        console.log('%c[FOCUS]',
          'color:#003168;background:#FFC72C;padding:2px 6px;border-radius:3px;',
          __describeEl(e.target));
      });
    }
    // === END DEBUG =========================================================

    $('#rbccm-lead-prev, #rbccm-lead-next').attr('tabindex', '0');

    // Prev / Next advance the carousel
    $('#rbccm-lead-prev').on('click', function () {
      if ($track.hasClass('slick-initialized')) $track.slick('slickPrev');
    });
    $('#rbccm-lead-next').on('click', function () {
      if ($track.hasClass('slick-initialized')) $track.slick('slickNext');
    });

    function syncArrows() {
      var slick      = $track.slick('getSlick');
      var current    = slick.currentSlide;
      var total      = slick.slideCount;
      var isInfinite = slick.options.infinite;

      if (isInfinite) {
        $('#rbccm-lead-prev, #rbccm-lead-next')
          .prop('disabled', false)
          .attr('aria-disabled', 'false')
          .css('opacity', 1);
        return;
      }

      var cardWidth    = $('.rbccm-leadership__card').first().outerWidth(true);
      var trackWidth   = $track.width();
      var visibleCards = Math.ceil(trackWidth / cardWidth);
      var maxIndex     = total - visibleCards;

      var atStart = current <= 0;
      var atEnd   = current >= maxIndex;

      $('#rbccm-lead-prev')
        .prop('disabled', atStart)
        .attr('aria-disabled', atStart ? 'true' : 'false')
        .css('opacity', atStart ? 0.3 : 1);
      $('#rbccm-lead-next')
        .prop('disabled', atEnd)
        .attr('aria-disabled', atEnd ? 'true' : 'false')
        .css('opacity', atEnd ? 0.3 : 1);
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Per-breakpoint carousel threshold. Below the threshold we swap slick
    // settings to a static block (no infinite/swipe/dots) instead of unslicking,
    // so there's no destroy/rebuild flicker at bucket boundaries.
    // Author overrides via data-carousel-min-<bucket> on the track.
    var PRESETS  = { desktop: 5, tablet: 3, mobile: 2 };
    var trackEl  = $track[0];
    var cardCount = $track.find('.rbccm-leadership__card').length;

    function threshold(bucket) {
      if (!trackEl) return PRESETS[bucket];
      var perBucket = trackEl.getAttribute('data-carousel-min-' + bucket);
      if (perBucket && !isNaN(parseInt(perBucket, 10))) return parseInt(perBucket, 10);
      var fallback  = trackEl.getAttribute('data-carousel-min');
      if (fallback && !isNaN(parseInt(fallback, 10)))   return parseInt(fallback, 10);
      return PRESETS[bucket];
    }
    function isCarouselAt(bucket) { return cardCount >= threshold(bucket); }

    // centerMode stays false everywhere — cards render left-aligned.
    var STATIC_SETTINGS = {
      centerMode: false, centerPadding: '0px', variableWidth: true,
      infinite: false, slidesToScroll: 1,
      swipe: false, touchMove: false, draggable: false,
      arrows: false, dots: false
    };
    var CAROUSEL_SETTINGS = {
      centerMode: false, centerPadding: '0px', variableWidth: true,
      infinite: true, slidesToScroll: 1,
      swipe: true, touchMove: true, draggable: true,
      arrows: false, dots: true
    };
    function settingsForBucket(bucket) {
      return isCarouselAt(bucket) ? CAROUSEL_SETTINGS : STATIC_SETTINGS;
    }

    // Hide the outer arrows + dots wrap when the current bucket is static.
    // Slick handles the internal settings swap; this is just the outer chrome.
    function currentBucket() {
      var w = window.innerWidth;
      if (w >= 1300) return 'desktop';
      if (w >= 640)  return 'tablet';
      return 'mobile';
    }
    function syncControlsVisibility() {
      section.classList.toggle('rbccm-leadership--no-controls', !isCarouselAt(currentBucket()));
    }

    function initCarousel() {
      $track.one('init', function () {
        setTimeout(function () {
          applyA11y();
          syncArrows();
          syncControlsVisibility();
        }, 0);
      });

      // Base config = desktop bucket; responsive[] overrides for smaller ones.
      var base = settingsForBucket('desktop');
      $track.slick({
        slidesToShow:    1,
        slidesToScroll:  1,
        initialSlide:    0,
        dotsClass:       'slick-dots',
        appendDots:      $dots,
        speed:           reducedMotion ? 0 : 350,
        cssEase:         reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        easing:          'linear',
        useCSS:          true,
        useTransform:    true,
        fade:            false,
        adaptiveHeight:  false,
        rows:            1,
        slidesPerRow:    1,
        vertical:        false,
        verticalSwiping: false,
        rtl:             false,
        swipeToSlide:    false,
        touchThreshold:  5,
        edgeFriction:    0.35,
        autoplay:        false,
        autoplaySpeed:   3000,
        accessibility:   false,
        pauseOnHover:    true,
        pauseOnFocus:    true,
        pauseOnDotsHover: false,
        respondTo:       'window',
        mobileFirst:     false,
        centerMode:      base.centerMode,
        centerPadding:   base.centerPadding,
        variableWidth:   base.variableWidth,
        infinite:        base.infinite,
        swipe:           base.swipe,
        touchMove:       base.touchMove,
        draggable:       base.draggable,
        arrows:          base.arrows,
        dots:            base.dots,
        responsive: [
          { breakpoint: 99999, settings: settingsForBucket('desktop') },
          { breakpoint: 1300,  settings: settingsForBucket('desktop') },
          { breakpoint: 1025,  settings: settingsForBucket('tablet')  },
          { breakpoint: 640,   settings: settingsForBucket('mobile')  }
        ],
        asNavFor:       null,
        waitForAnimate: true,
        zIndex:         1000
      });
    }

    // Debounced resize handler — flips the --no-controls class on bucket change.
    var __bucketTimer;
    $(window).on('resize.rbccmBucket', function () {
      clearTimeout(__bucketTimer);
      __bucketTimer = setTimeout(syncControlsVisibility, 60);
    });

    if (typeof $.fn.slick !== 'undefined') {
      initCarousel();
    } else {
      // Prefer the accessible-slick build hosted on rbccm.com so we get
      // the same SR experience as pages that already include it.
      var slickScript = document.createElement('script');
      slickScript.src = '/assets/rbccm/js/accessible-slick.min.js';
      slickScript.onload  = function () { initCarousel(); };
      slickScript.onerror = function () {
        // Last-resort fallback to vanilla slick from cdnjs.
        var fallback = document.createElement('script');
        fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
        fallback.onload = function () { initCarousel(); };
        document.head.appendChild(fallback);
      };
      document.head.appendChild(slickScript);
    }

    // ─────────────────────────────────────────────────────────────
    // Accessibility: roving tabindex on slide content.
    //
    // The DOM is laid out in the slick-default order
    //   [Prev] → [slides] → [Next] → [dots]
    // so native browser tab order already produces the desired
    // sequence. No Tab interceptor is needed. We only have to keep
    // tabindex correct on slide children so off-canvas / cloned
    // slides (and any cards without an action element) don't pull
    // focus.
    // ─────────────────────────────────────────────────────────────

    // True for any slide (original OR cloned) essentially fully in view.
    // 90% visibility threshold: flush-edge cards stay tabbable;
    // peek neighbours in centerMode (typically 30–50% visible) are out.
    function isSlideInView(slideEl) {
      var list = $track.find('.slick-list')[0];
      if (!list) return false;
      var lr = list.getBoundingClientRect();
      var sr = slideEl.getBoundingClientRect();
      var visLeft  = Math.max(sr.left, lr.left);
      var visRight = Math.min(sr.right, lr.right);
      var visWidth = Math.max(0, visRight - visLeft);
      var slideW   = sr.right - sr.left;
      return slideW > 0 && (visWidth / slideW) >= 0.9;
    }

    // Give the dots UL an aria-label so SR announces "Slide selection, list
    // with N items" instead of just "list with N items".
    function labelDotsList() {
      var ul = $dots.find('ul.slick-dots')[0];
      if (ul) ul.setAttribute('aria-label', I18N.dotsListLabel);
    }

    // Roving tabindex on slides + labelled aria on slides and dots.
    // "Current slide" is baked into the active dot's aria-label text on top
    // of aria-current — NVDA doesn't reliably announce aria-current alone
    // on plain buttons, so we need both.
    function applyA11y() {
      var slick      = $track.slick('getSlick');
      var slideCount = slick ? slick.slideCount : 0;
      var current    = slick ? slick.currentSlide : 0;

      if (!SLIDE_INFO.length) buildSlideInfoCache();

      $track.find('.slick-slide').each(function () {
        var inView = isSlideInView(this);
        if (inView) { this.removeAttribute('aria-hidden'); }
        else        { this.setAttribute('aria-hidden', 'true'); }

        // data-slick-index goes negative on pre-clones, normalise to 0..N-1.
        var raw = parseInt(this.getAttribute('data-slick-index'), 10);
        if (!isNaN(raw) && slideCount > 0) {
          var idx  = ((raw % slideCount) + slideCount) % slideCount;
          var n    = idx + 1;
          var info = slideInfoFor(idx);
          var label = info.name
            ? (info.role
                ? fmt(I18N.slideAriaNameTpl,     { name: info.name, role: info.role, n: n, total: slideCount })
                : fmt(I18N.slideAriaNameOnlyTpl, { name: info.name, n: n, total: slideCount }))
            : fmt(I18N.slideAriaTpl, { n: n, total: slideCount });

          this.setAttribute('role', 'group');
          this.setAttribute('aria-roledescription', I18N.slideRoleDesc);
          this.setAttribute('aria-label', label);

          // Applies to the visible original + its off-canvas clones sharing idx.
          if (idx === current) this.setAttribute('aria-current', 'true');
          else                 this.removeAttribute('aria-current');
        }

        // Start with every focusable child + the card itself at -1.
        var kids = this.querySelectorAll(FOCUSABLE);
        for (var i = 0; i < kids.length; i++) kids[i].setAttribute('tabindex', '-1');
        var card = this.querySelector('.rbccm-leadership__card');
        if (card) card.setAttribute('tabindex', '-1');

        if (!inView) return;

        // Promote the appropriate tab stop on visible slides.
        var action = this.querySelector('.rbccm-leadership__card-action');
        if (action)    action.setAttribute('tabindex', '0');
        else if (card) card.setAttribute('tabindex', '0');
      });

      // Dot list + dot buttons.
      labelDotsList();
      $dots.find('button').each(function (i) {
        var isActive = (i === current);
        if (isActive) this.setAttribute('aria-current', 'true');
        else          this.removeAttribute('aria-current');
        var info = slideInfoFor(i);
        var label = isActive
          ? (info.name
              ? fmt(I18N.dotAriaCurrentTpl,       { name: info.name, n: i + 1, total: slideCount })
              : fmt(I18N.dotAriaCurrentNoNameTpl, { n: i + 1, total: slideCount }))
          : fmt(I18N.dotAriaTpl, { n: i + 1, total: slideCount });
        this.setAttribute('aria-label', label);
      });
    }

    // Re-evaluate after every settle.
    $track.on('afterChange', function (e, slick, currentSlide) {
      applyA11y();
      syncArrows();
      if (typeof currentSlide !== 'undefined' && slick) {
        var info = slideInfoFor(currentSlide);
        var msg  = info.name
          ? fmt(I18N.announceNameTpl, { name: info.name, n: currentSlide + 1, total: slick.slideCount })
          : fmt(I18N.announceTpl,     { n: currentSlide + 1, total: slick.slideCount });
        $('#rbccm-lead-announce').text(msg);
      }
    });

    // Force the focus border via inline style + !important on focusin.
    // ALSO paint twin duplicates (original + slick clones of the same
    // author) — slick can park keyboard focus on the off-canvas cloned
    // copy while the on-canvas original is what the user is looking at.
    // Painting both copies guarantees the visible one shows the border.
    function setFocusedCard(card) {
      document.querySelectorAll('.rbccm-leadership__card').forEach(function (c) {
        c.style.removeProperty('border-color');
        c.classList.remove('is-focused');
      });
      document.querySelectorAll('.rbccm-leadership__card-action').forEach(function (a) {
        a.style.removeProperty('outline');
        a.style.removeProperty('border-radius');
      });
      if (!card) return;
      var slide = card.closest('.slick-slide');
      if (slide) slide.removeAttribute('aria-hidden');
      var name = card.querySelector('.rbccm-leadership__card-name');
      name = name ? name.textContent : null;
      document.querySelectorAll('.rbccm-leadership__card').forEach(function (c) {
        var n = c.querySelector('.rbccm-leadership__card-name');
        var same = !name || (n && n.textContent === name);
        if (c === card || same) {
          c.classList.add('is-focused');
          c.style.setProperty('border-color', '#003168', 'important');
          var action = c.querySelector('.rbccm-leadership__card-action');
          if (action) {
            action.style.setProperty('outline', '2px solid #003168', 'important');
            action.style.setProperty('border-radius', '4px', 'important');
          }
        }
      });
    }

    // Track input modality — only paint the focus state when focus
    // arrives via keyboard (matches :focus-visible semantics).
    var focusViaKeyboard = false;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') focusViaKeyboard = true;
    }, true);
    document.addEventListener('mousedown',   function () { focusViaKeyboard = false; }, true);
    document.addEventListener('touchstart',  function () { focusViaKeyboard = false; }, true);
    document.addEventListener('pointerdown', function () { focusViaKeyboard = false; }, true);

    document.addEventListener('focusin', function (e) {
      if (!focusViaKeyboard) { setFocusedCard(null); return; }
      var card = e.target && e.target.closest && e.target.closest('.rbccm-leadership__card');
      setFocusedCard(card);
    });

    // Targeted Tab handler — covers all four directions in/out of the
    // card row. Native browser Tab refuses to walk to focusable
    // elements inside slick's cloned slides (even with tabindex=0), so
    // we explicitly .focus() the next/prev visible card stop.
    function visibleStopIn(slide) {
      if (!isSlideInView(slide)) return null;
      return slide.querySelector('.rbccm-leadership__card-action') ||
             slide.querySelector('.rbccm-leadership__card[tabindex="0"]');
    }

    // Tab between cards.
    $track.on('keydown', '.rbccm-leadership__card-action, .rbccm-leadership__card[tabindex="0"]', function (e) {
      if (e.key !== 'Tab') return;
      var slides = $track.find('.slick-slide').toArray();
      var currentSlide = this.closest('.slick-slide');
      var idx = slides.indexOf(currentSlide);
      if (idx === -1) return;
      var step = e.shiftKey ? -1 : 1;
      for (var i = idx + step; i >= 0 && i < slides.length; i += step) {
        var target = visibleStopIn(slides[i]);
        if (target) { e.preventDefault(); target.focus(); return; }
      }
    });

    // Tab forward from Prev → first visible card (cloned or not).
    $('#rbccm-lead-prev').on('keydown', function (e) {
      if (e.key !== 'Tab' || e.shiftKey) return;
      var slides = $track.find('.slick-slide').toArray();
      for (var i = 0; i < slides.length; i++) {
        var target = visibleStopIn(slides[i]);
        if (target) { e.preventDefault(); target.focus(); return; }
      }
    });

    // Shift+Tab back from Next → last visible card (cloned or not).
    $('#rbccm-lead-next').on('keydown', function (e) {
      if (e.key !== 'Tab' || !e.shiftKey) return;
      var slides = $track.find('.slick-slide').toArray();
      for (var i = slides.length - 1; i >= 0; i--) {
        var target = visibleStopIn(slides[i]);
        if (target) { e.preventDefault(); target.focus(); return; }
      }
    });

    var resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if ($track.hasClass('slick-initialized')) {
          $track.slick('setPosition');
          syncArrows();
          applyA11y();
        }
      }, 50);
    });

    // ─────────────────────────────────────────────────────────
    // Biography modal — Bootstrap pattern
    // ─────────────────────────────────────────────────────────
    var $modal      = $('#rbccm-lead-modal');
    var $modalName  = $modal.find('.rbccm-leadership__modal-name');
    var $modalRole  = $modal.find('.rbccm-leadership__modal-role');
    var $modalBody  = $modal.find('.rbccm-leadership__modal-body');
    var $modalLi    = $modal.find('.rbccm-leadership__modal-linkedin');
    var $modalEmail = $modal.find('.rbccm-leadership__modal-email');

    $(document).on('click', '.rbccm-leadership__card-bio', function (e) {
      e.preventDefault();
      var $src = $('#' + $(this).attr('data-bio-target'));
      if (!$src.length) return;

      $modalName.text($src.attr('data-name') || '');
      $modalRole.text($src.attr('data-role') || '');
      $modalBody.html($src.html());

      var li = $src.attr('data-linkedin') || '';
      if (li) { $modalLi.attr('href', li).removeAttr('hidden'); }
      else    { $modalLi.attr('hidden', 'hidden'); }

      var em = $src.attr('data-email') || '';
      if (em) { $modalEmail.attr('href', 'mailto:' + em).removeAttr('hidden'); }
      else    { $modalEmail.attr('hidden', 'hidden'); }

      $modal.modal('show');
    });
  });
})();
