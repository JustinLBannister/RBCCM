/* =========================================
   RBC Imagine - JS
   - Themes tabs/accordion
   - Testimonials Slick carousel
   - Brightcove autoloader
   - Marketo multi-step forms
   - Hero download modal
   - Hero background teaser video (with optional fade)
   ========================================= */

/* -----------------------------------------------------------
   Themes Section Tabs/Accordion
----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('.rbccm-themes__tab');
  var panels = document.querySelectorAll('.rbccm-themes__panel');
  var panelsContainer = document.querySelector('.rbccm-themes__panels');

  function isDesktop() {
    return window.matchMedia('(min-width: 992px)').matches;
  }

  var previousViewportState = isDesktop() ? 'desktop' : 'mobile';

  function handleTabClick(clickedTab) {
    var targetPanel = clickedTab.getAttribute('data-panel');

    if (isDesktop()) {
      // Desktop: traditional tab behavior (single active)
      Array.prototype.forEach.call(tabs, function (tab) {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-expanded', 'false');
      });

      Array.prototype.forEach.call(panels, function (panel) {
        panel.classList.remove('is-active');
      });

      clickedTab.classList.add('is-active');
      clickedTab.setAttribute('aria-expanded', 'true');

      var activePanel = document.querySelector(
        '[data-panel="' + targetPanel + '"].rbccm-themes__panel'
      );
      if (activePanel) {
        activePanel.classList.add('is-active');
      }
    } else {
      // Mobile: accordion-style toggle; can open/close individually
      var isActive = clickedTab.classList.contains('is-active');

      if (isActive) {
        clickedTab.classList.remove('is-active');
        clickedTab.setAttribute('aria-expanded', 'false');
      } else {
        clickedTab.classList.add('is-active');
        clickedTab.setAttribute('aria-expanded', 'true');
      }
      // Panels on mobile are handled by CSS using the adjacent sibling selector
    }
  }

  function reorganizeForDesktop() {
    if (isDesktop() && panelsContainer) {
      // Move all panels into the shared container on desktop
      Array.prototype.forEach.call(panels, function (panel) {
        panelsContainer.appendChild(panel);
      });
    } else {
      // On mobile, each panel follows its tab
      Array.prototype.forEach.call(tabs, function (tab, index) {
        if (panels[index]) {
          tab.parentNode.insertBefore(panels[index], tab.nextSibling);
        }
      });
    }
  }

  function activateFirstDesktopTab() {
    if (!tabs.length || !panels.length) return;

    // Clear everything first
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-expanded', 'false');
    });
    Array.prototype.forEach.call(panels, function (panel) {
      panel.classList.remove('is-active');
    });

    // Activate the first tab + its panel
    var firstTab = tabs[0];
    var firstPanelKey = firstTab.getAttribute('data-panel');
    var firstPanel = document.querySelector(
      '[data-panel="' + firstPanelKey + '"].rbccm-themes__panel'
    ) || panels[0];

    firstTab.classList.add('is-active');
    firstTab.setAttribute('aria-expanded', 'true');

    if (firstPanel) {
      firstPanel.classList.add('is-active');
    }
  }

  function handleViewportChange() {
    var currentViewportState = isDesktop() ? 'desktop' : 'mobile';

    if (previousViewportState === currentViewportState) {
      return;
    }

    reorganizeForDesktop();

    if (currentViewportState === 'desktop') {
      // MOBILE -> DESKTOP
      activateFirstDesktopTab();
    } else {
      // DESKTOP -> MOBILE
      // Clear all active states so nothing is open by default
      Array.prototype.forEach.call(tabs, function (tab) {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-expanded', 'false');
      });
      Array.prototype.forEach.call(panels, function (panel) {
        panel.classList.remove('is-active');
      });
      // On mobile, accordion open/close is purely user-driven
    }

    previousViewportState = currentViewportState;
  }

  // Tab click wiring
  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      handleTabClick(tab);
    });
  });

  // Initial layout
  reorganizeForDesktop();

  // Initial active state:
  if (isDesktop()) {
    // On desktop, guarantee one active tab + panel
    activateFirstDesktopTab();
  } else {
    // On mobile, all tabs start inactive
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-expanded', 'false');
    });
    Array.prototype.forEach.call(panels, function (panel) {
      panel.classList.remove('is-active');
    });
  }

  // Resize handling with a simple debounce
  var resizing = false;
  window.addEventListener('resize', function () {
    if (!resizing) {
      resizing = true;
      requestAnimationFrame(function () {
        handleViewportChange();
        resizing = false;
      });
    }
  });
});

/* -----------------------------------------------------------
   Testimonials Slick Carousel
   - Rebuilds safely on resize
   - Infinite scroll
   - Custom arrow handlers (no Slick arrow binding)
----------------------------------------------------------- */
/* -----------------------------------------------------------
   Testimonials Slick Carousel
   - Rebuilds safely on resize
   - Infinite scroll
   - Custom arrow handlers that stop propagation so
     external GTM/analytics click handlers can't hijack.
----------------------------------------------------------- */
$(function () {
  var $text  = $('#testimonialTextSlider');
  var $image = $('#testimonialImageSlider');

  if (!$text.length || !$image.length) return;

  function buildSliders() {
    var isDesktop   = window.matchMedia('(min-width: 992px)').matches;
    var $arrowsWrap = isDesktop
      ? $('.rbccm-testimonials__arrows-desktop')
      : $('.rbccm-testimonials__arrows');

    // Always destroy any existing instances first
    if ($text.hasClass('slick-initialized')) {
      $text.slick('unslick');
    }
    if ($image.hasClass('slick-initialized')) {
      $image.slick('unslick');
    }

    // Text slider
    $text.slick({
      infinite: true,
      autoplay: true,          // auto-scroll
      autoplaySpeed: 4500,
      adaptiveHeight: true,
      asNavFor: '#testimonialImageSlider',
      arrows: true,
      appendArrows: $arrowsWrap,
      dots: true,
      appendDots: $('.rbccm-testimonials__dots'),
      fade: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow:
        '<button type="button" class="custom-slick-prev">' +
        '<svg width="19" height="38" viewBox="0 0 12 21" fill="none">' +
        '<path d="M10.707 20.3535L0.707031 10.3535L10.707 0.353515" stroke="#979797"/></svg></button>',
      nextArrow:
        '<button type="button" class="custom-slick-next">' +
        '<svg width="19" height="38" viewBox="0 0 12 21" fill="none">' +
        '<path d="M0.353516 0.353516L10.3535 10.3535L0.353516 20.3535" stroke="white"/></svg></button>'
    });

    // Image slider
    $image.slick({
      infinite: true,
      autoplay: false,
      adaptiveHeight: true,
      asNavFor: '#testimonialTextSlider',
      arrows: false,
      dots: false,
      fade: true,
      slidesToShow: 1,
      slidesToScroll: 1
    });

    // --------- HARDENED ARROW HANDLERS ----------
    var $prevArrow = $arrowsWrap.find('.custom-slick-prev');
    var $nextArrow = $arrowsWrap.find('.custom-slick-next');

    // Remove any existing handlers on these arrows
    $prevArrow.off('.rbccm');
    $nextArrow.off('.rbccm');

    // Our own click handlers that stop propagation
    $prevArrow.on('click.rbccm', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // block other click handlers on same element
      $text.slick('slickPrev');
    });

    $nextArrow.on('click.rbccm', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      $text.slick('slickNext');
    });
  }

  // Initial build
  buildSliders();

  // Rebuild on resize with a small debounce
  var resizeTimer;
  $(window).on('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildSliders, 250);
  });
});

/* -----------------------------------------------------------
   Brightcove Autoloader (non-intrusive)
   Looks for containers with data-bc-* attrs and initializes
   Brightcove players without touching the rest of the code.
----------------------------------------------------------- */
(function () {
  var DEFAULTS = {
    account: '6021289101001',
    player: 'VyvCc9BZx',
    embed: 'default'
  };

  function ensureBrightcove(opts) {
    var account = opts.account;
    var player = opts.player;
    var embed = opts.embed;

    return new Promise(function (resolve, reject) {
      if (window.videojs) return resolve();

      var id = 'bc-' + account + '-' + player + '-' + embed;
      if (!document.getElementById(id)) {
        var s = document.createElement('script');
        s.id = id;
        s.async = true;
        s.src =
          'https://players.brightcove.net/' +
          account +
          '/' +
          player +
          '_' +
          embed +
          '/index.min.js';
        s.onload = function () {
          resolve();
        };
        s.onerror = function () {
          reject(new Error('Failed to load Brightcove runtime'));
        };
        (document.head || document.body).appendChild(s);
      }

      var t0 = Date.now();
      (function waitForVJS() {
        if (window.videojs) return resolve();
        if (Date.now() - t0 > 8000) {
          return reject(new Error('Timed out waiting for Brightcove'));
        }
        requestAnimationFrame(waitForVJS);
      })();
    });
  }

  function initBrightcoveContainers() {
    var nodes = document.querySelectorAll('[data-bc-video-id]');
    if (!nodes.length) return;

    var a =
      nodes[0].getAttribute('data-bc-account') || DEFAULTS.account;
    var p =
      nodes[0].getAttribute('data-bc-player') || DEFAULTS.player;
    var e =
      nodes[0].getAttribute('data-bc-embed') || DEFAULTS.embed;

    ensureBrightcove({ account: a, player: p, embed: e })
      .then(function () {
        Array.prototype.forEach.call(nodes, function (el) {
          // Remove TinyMCE script placeholders if present
          var scriptPlaceholders = el.querySelectorAll(
            'img.mce-object-script, [data-mce-object="script"]'
          );
          Array.prototype.forEach.call(scriptPlaceholders, function (n) {
            n.remove();
          });

          // Avoid duplicate init
          if (el.querySelector('video-js')) return;

          var account =
            el.getAttribute('data-bc-account') || a;
          var player =
            el.getAttribute('data-bc-player') || p;
          var embed =
            el.getAttribute('data-bc-embed') || e;
          var videoId = el.getAttribute('data-bc-video-id');

          if (!videoId) return;

          var v = document.createElement('video-js');
          v.className = 'video-js vjs-fluid';
          v.setAttribute('data-account', account);
          v.setAttribute('data-player', player);
          v.setAttribute('data-embed', embed);
          v.setAttribute('data-video-id', videoId);
          v.setAttribute('controls', '');
          v.setAttribute('width', '960');
          v.setAttribute('height', '540');

          var poster = el.getAttribute('data-bc-poster');
          if (poster) v.setAttribute('poster', poster);

          el.appendChild(v);

          try {
            if (window.bc) {
              window.bc(v);
            } else if (window.videojs) {
              window.videojs(v);
            }
          } catch (err) {
            if (window.console && console.error) {
              console.error('Brightcove init failed:', err);
            }
          }
        });
      })
      .catch(function (err) {
        if (window.console && console.error) {
          console.error(err);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrightcoveContainers);
  } else {
    initBrightcoveContainers();
  }
})();

/* -----------------------------------------------------------
   Marketo Imagine Subscribe Form Loader
   Step 1: Form 1232  -> basic info + business email validation
   Step 2: Form 1182  -> follow-up preferences
----------------------------------------------------------- */
(function () {
  var MARKETO = {
    baseUrl: '//discover.rbccm.com',
    munchkinId: '577-RQV-784',
    stepOneFormId: 1232,
    stepTwoFormId: 1182,
    containerSelector: '#mkto_wrap'
  };

  function loadScript(src, id) {
    return new Promise(function (resolve, reject) {
      if (id && document.getElementById(id)) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = true;
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        if (window.console && console.error) {
          console.error('Failed to load script:', src);
        }
        reject(new Error('Failed to load ' + src));
      };
      (document.head || document.body).appendChild(s);
    });
  }

  function ensureMktoForms2() {
    return new Promise(function (resolve, reject) {
      if (window.MktoForms2) return resolve(window.MktoForms2);

      loadScript(
        MARKETO.baseUrl + '/js/forms2/js/forms2.min.js',
        'mkto-forms2-script'
      )
        .then(function () {
          var start = Date.now();
          (function waitForMkto() {
            if (window.MktoForms2) {
              return resolve(window.MktoForms2);
            }
            if (Date.now() - start > 8000) {
              return reject(
                new Error('Timed out waiting for MktoForms2')
              );
            }
            requestAnimationFrame(waitForMkto);
          })();
        })
        .catch(reject);
    });
  }

  function injectLinkedInAutofill() {
    var subContent = document.getElementById('sub-content');
    if (!subContent) return;

    var autofillDiv = document.getElementById('autofill');
    if (!autofillDiv) {
      autofillDiv = document.createElement('div');
      autofillDiv.id = 'autofill';
      subContent.appendChild(autofillDiv);
    }

    loadScript(
      'https://www.linkedin.com/autofill/js/autofill.js',
      'linkedin-autofill-js'
    )
      .then(function () {
        var initScript = document.getElementById(
          'linkedin-autofill-init'
        );
        if (!initScript) {
          initScript = document.createElement('script');
          initScript.id = 'linkedin-autofill-init';
          initScript.type = 'text/javascript';
          initScript.setAttribute(
            'data-form',
            'mktoForm_' + MARKETO.stepOneFormId
          );
          initScript.setAttribute(
            'data-field-firstname',
            'FirstName'
          );
          initScript.setAttribute(
            'data-field-lastname',
            'LastName'
          );
          initScript.setAttribute('data-field-email', 'Email');
          initScript.setAttribute('data-field-company', 'Company');
          initScript.setAttribute('data-field-title', 'Title');
          autofillDiv.appendChild(initScript);
        }

        var isSafari =
          navigator.vendor &&
          navigator.vendor.indexOf('Apple') > -1 &&
          navigator.userAgent &&
          navigator.userAgent.indexOf('CriOS') === -1 &&
          navigator.userAgent.indexOf('FxiOS') === -1;

        if (isSafari) {
          autofillDiv.style.display = 'none';
        }
      })
      .catch(function (err) {
        if (window.console && console.error) {
          console.error('LinkedIn Autofill load error:', err);
        }
      });
  }

  function initMarketoForm() {
    var container = document.querySelector(MARKETO.containerSelector);
    if (!container) return;

    ensureMktoForms2()
      .then(function (MktoForms2) {
        MktoForms2.loadForm(
          MARKETO.baseUrl,
          MARKETO.munchkinId,
          MARKETO.stepOneFormId,
          function (form1) {
            var formEl1 = form1.getFormElem()[0];
            container.innerHTML = '';
            container.appendChild(formEl1);

            try {
              form1.getFormElem().css('width', 'auto');
            } catch (e) {}

            var invalidDomains = [
              '@gmail.',
              '@hotmail.',
              '@live.',
              '@aol.',
              '@outlook.'
            ];

            function isBusinessEmail(email) {
              for (var i = 0; i < invalidDomains.length; i++) {
                if (email.indexOf(invalidDomains[i]) !== -1) {
                  return false;
                }
              }
              return true;
            }

            form1.onValidate(function () {
              var vals = form1.vals();
              var email = vals.Email;

              if (email && !isBusinessEmail(email)) {
                form1.submitable(false);
                var emailElem =
                  form1.getFormElem().find('#Email');
                form1.showErrorMessage(
                  'Must be Business email.',
                  emailElem
                );
              } else {
                form1.submitable(true);
              }
            });

            form1.onSuccess(function (vals) {
              var email = vals.Email;

              var subPre = document.getElementById('sub-pre');
              if (subPre) {
                subPre.innerHTML =
                  '<h2 style="margin-top: 0;">Thank you!</h2>' +
                  '<p style="color: #002144;">We\'ll send you an email with a link to download your ' +
                  'RBC Imagine&trade; <strong>The Great Recalibration: Forces of Exponential Change</strong> report.</p>';
              }

              container.innerHTML = '';

              MktoForms2.loadForm(
                MARKETO.baseUrl,
                MARKETO.munchkinId,
                MARKETO.stepTwoFormId,
                function (form2) {
                  var formEl2 = form2.getFormElem()[0];
                  container.appendChild(formEl2);

                  try {
                    form2.getFormElem().css('width', 'auto');
                  } catch (e2) {}

                  if (email) {
                    form2.addHiddenFields({
                      Email: email
                    });
                  }

                  form2.onSuccess(function () {
                    return false;
                  });
                }
              );

              return false;
            });

            injectLinkedInAutofill();
          }
        );
      })
      .catch(function (err) {
        if (window.console && console.error) {
          console.error('Marketo init error:', err);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarketoForm);
  } else {
    initMarketoForm();
  }
})();

/* -----------------------------------------------------------
   HERO DOWNLOAD MODAL + MARKETO 1225
----------------------------------------------------------- */
(function ($) {
  var MARKETO = {
    baseUrl: '//discover.rbccm.com',
    munchkinId: '577-RQV-784',
    formId: 1225
  };

  // Inject CSS to prevent body padding-right jump on modal-open
  (function ensureModalScrollFixRule() {
    var existing = document.getElementById('rbccm-modal-scrollfix-style');
    if (existing) return;

    var style = document.createElement('style');
    style.id = 'rbccm-modal-scrollfix-style';
    style.type = 'text/css';
    style.appendChild(
      document.createTextNode('body.modal-open { padding-right: 0 !important; }')
    );
    document.head.appendChild(style);
  })();

  function loadMktoScript() {
    return new Promise(function (resolve, reject) {
      if (window.MktoForms2) return resolve();

      var s = document.createElement('script');
      s.src = MARKETO.baseUrl + '/js/forms2/js/forms2.min.js';
      s.async = true;

      s.onload = function () {
        var start = Date.now();
        (function check() {
          if (window.MktoForms2) return resolve();
          if (Date.now() - start > 8000) {
            return reject(
              new Error('MktoForms2 load timeout')
            );
          }
          requestAnimationFrame(check);
        })();
      };

      s.onerror = function () {
        reject(new Error('Failed to load Mkto script'));
      };
      document.head.appendChild(s);
    });
  }

  function businessEmailCheck(form) {
    var invalid = [
      '@gmail.',
      '@hotmail.',
      '@live.',
      '@aol.',
      '@outlook.'
    ];

    form.onValidate(function () {
      var email = form.vals().Email;
      if (!email) return;

      var bad = invalid.some(function (d) {
        return email.indexOf(d) !== -1;
      });

      if (bad) {
        form.submitable(false);
        var emailElem = form.getFormElem().find('#Email');
        form.showErrorMessage(
          'Must be Business email.',
          emailElem
        );
      } else {
        form.submitable(true);
      }
    });
  }

  function injectSuccessModal() {
    return (
      '<div class="modal-content">' +
      '<div>' +
      '<div class="modal-header" style="border: none;border-top: 8px #FBDE00 solid;padding: 0;height: 0;">' +
      '<button class="close" ' +
      'style="font-size: 41px;color: #595959;font-weight: normal;position: absolute;top: 0;right: 0;z-index: 100;" ' +
      'type="button" data-dismiss="modal">\u00D7</button>' +
      '</div>' +
      '<div class="modal-body" style="padding: 0;background: #11223E;">' +
      '<div class="row row-no-gutters">' +
      '<div class="col-md-7">' +
      '<div class="dark" ' +
      'style="background: #11223E; color: #fff; height: 600px; padding: 60px;">' +
      '<div style="margin-bottom: 70px;">' +
      '<img src="/assets/rbccm/images/imagine/rbc-imagine.png" ' +
      'alt="RBC Imagine" style="width: 123px;">' +
      '</div>' +
      '<h2 style="color: #fff; font-size: 42px;">Thank you!</h2>' +
      '<p style="color: #fff;font-size: 24px;">' +
      "We'll send you an email with a link to download your RBC Imagine\u2122 " +
      '<span style="color: #FBDE00;">The Great Recalibration: Forces of Exponential Change</span> report.' +
      '</p>' +
      '<p style="margin-top: 70px;">' +
      '<a class="modal-close-link" href="#" type="button" data-dismiss="modal">' +
      'Close window' +
      '</a>' +
      '</p>' +
      '</div>' +
      '</div>' +
      '<div class="col-md-5">' +
      '<div class="img-stretch" ' +
      "style=\"height: 600px; background-image: url('/assets/rbccm/images/imagine/confirmation-bg.jpg'); background-color: #000;\"></div>" +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function initDownloadModal() {
    var $modal = $('#download');
    var formLoaded = false;

    $(document).on(
      'click',
      '.rbccm-hero__btn[href="#download"]',
      function (e) {
        e.preventDefault();
        $modal.modal('show');

        if (formLoaded) return;
        formLoaded = true;

        loadMktoScript().then(function () {
          var container = document.getElementById(
            'download-form-container'
          );

          var formShell = document.createElement('form');
          formShell.id = 'mktoForm_' + MARKETO.formId;
          container.appendChild(formShell);

          MktoForms2.loadForm(
            MARKETO.baseUrl,
            MARKETO.munchkinId,
            MARKETO.formId,
            function (form) {
              businessEmailCheck(form);

              form.onSuccess(function () {
                var html = injectSuccessModal();
                $modal.find('.modal-content').replaceWith(html);
                return false;
              });
            }
          );
        });
      }
    );
  }

  $(initDownloadModal);
})(jQuery);

/* -----------------------------------------------------------
   IMAGINE HERO BACKGROUND VIDEO (TEASER ONLY)
   - Injects teaser into #imagine-teaser-mount
   - Video src / pause / fade / loop driven by data attributes
   - pauseAfterSeconds can be fractional (e.g., 2.5)
   - Fades out the video overlay to reveal CSS background
----------------------------------------------------------- */
(function () {
  var HERO_VIDEO_CONFIG = {
    // Defaults â€“ can all be overridden via data attributes
    pauseAfterSeconds: null, // null = play to end
    fadeInImage: false,      // if true, fade overlay out
    defaultSrc: '/assets/rbccm/images/imagine-images/imagine-2025-tall-hero-clean.mp4',
    defaultLoop: false       // default looping behavior if not overridden
  };

  function parseBoolAttr(raw, defVal) {
    if (raw == null) return defVal;
    var val = raw.toString().trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].indexOf(val) !== -1) return true;
    if (['false', '0', 'no', 'off'].indexOf(val) !== -1) return false;
    return defVal;
  }

  function parseNumberAttr(raw, defVal) {
    if (raw == null || raw === '') return defVal;
    var n = parseFloat(raw);
    return isNaN(n) ? defVal : n;
  }

  function fadeOutOverlay(video, overlay, fadeInImage) {
    if (!overlay) return;

    if (!fadeInImage) {
      // Hard switch: no animation, just keep overlay visible (or reveal image as needed)
      if (video) {
        try { video.pause(); } catch (e) {}
      }
      overlay.style.display = 'block';
      return;
    }

    // Smooth fade
    overlay.style.transition = 'opacity 800ms ease';
    overlay.style.opacity = '0';

    setTimeout(function () {
      if (video) {
        try { video.pause(); } catch (e) {}
      }
      overlay.style.display = 'none';
    }, 850);
  }

  function initImagineHeroTeaser() {
    var hero        = document.getElementById('imagine-hero');
    var teaserMount = document.getElementById('imagine-teaser-mount');

    if (!hero || !teaserMount) return;

    // Make sure we don't double-inject
    if (teaserMount.querySelector('video')) return;

    // --- Read config from data attributes ---
    var customVideoSrc = teaserMount.getAttribute('data-hero-video');
    var pauseAttr      = teaserMount.getAttribute('data-hero-pause');
    var fadeAttr       = teaserMount.getAttribute('data-hero-fade');
    var loopAttr       = teaserMount.getAttribute('data-hero-loop');

    var videoSrc = (customVideoSrc && customVideoSrc.trim()) || HERO_VIDEO_CONFIG.defaultSrc;
    if (!videoSrc) return;

    var pauseAfterSeconds = parseNumberAttr(pauseAttr, HERO_VIDEO_CONFIG.pauseAfterSeconds);
    var fadeInImage       = parseBoolAttr(fadeAttr, HERO_VIDEO_CONFIG.fadeInImage);
    var shouldLoop        = parseBoolAttr(loopAttr, HERO_VIDEO_CONFIG.defaultLoop);

    // If a pause time is explicitly provided, that wins over loop.
    if (typeof pauseAfterSeconds === 'number') {
      shouldLoop = false;
    }

    // This is the video layer we want to fade away;
    // gradient should live on #imagine-teaser-mount::before above the video.
    var overlay = hero.querySelector('.rbccm-hero__video-bg') || teaserMount;

    if (overlay) {
      overlay.style.opacity = '1';
    }

    var video = document.createElement('video');
    video.id = 'imagine-teaser-video';
    video.className = 'rbccm-hero__video-teaser';
    video.autoplay = true;
    video.loop = !!shouldLoop;
    video.muted = true;
    video.playsInline = true;

    // Ensure it covers the mount/overlay fully and sits under gradient
    video.style.position = 'absolute';
    video.style.inset = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '1';

    var source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';

    video.appendChild(source);
    teaserMount.appendChild(video);

    function handleFinished() {
      video.removeEventListener('ended', handleFinished);
      video.removeEventListener('timeupdate', checkPausePoint);
      fadeOutOverlay(video, overlay, fadeInImage);
    }

    function checkPausePoint() {
      if (
        typeof pauseAfterSeconds === 'number' &&
        pauseAfterSeconds >= 0 &&
        video.currentTime >= pauseAfterSeconds
      ) {
        handleFinished();
      }
    }

    // Only wire â€œstopâ€ logic if we are **not** looping
    if (!shouldLoop) {
      if (typeof pauseAfterSeconds === 'number') {
        video.addEventListener('timeupdate', checkPausePoint);
      } else {
        video.addEventListener('ended', handleFinished);
      }
    }

    video.play().catch(function () {
      // Autoplay restrictions â€“ if it fails, we just leave the hero background image.
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImagineHeroTeaser);
  } else {
    initImagineHeroTeaser();
  }
})();

setTimeout(() => {
  document
    .querySelectorAll('.row a[target="_blank"]')
    .forEach(a => a.target = '_self');
}, 500); // adjust delay if needed (300â€“1500ms)

/* -----------------------------------------------------------
   PREVIEW-ONLY: Latest Insights section
   - Triggered by ?preview in the URL
   - Moves #w1776721949713 between .rbccm-themes and .rbccm-testimonials
   - Inserts an <h2>Latest insights</h2> before the first .row
     inside #imagine-article-tiles
   ----------------------------------------------------------- */
(function () {
  function initImaginePreview() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (!params.has('preview')) return;

      // 1) Reposition the preview wrapper between themes and testimonials
      var wrap   = document.getElementById('w1776721949713');
      var themes = document.querySelector('.rbccm-themes');
      if (wrap && themes && wrap.previousElementSibling !== themes) {
        themes.parentNode.insertBefore(wrap, themes.nextSibling);
      }

      // 2) Insert "Latest insights" heading above the tile grid
      var tiles = document.getElementById('imagine-article-tiles');
      var row   = tiles && tiles.querySelector(':scope > .row');
      if (
        tiles &&
        row &&
        !tiles.querySelector(':scope > h2.latest-insights-heading')
      ) {
        var h2 = document.createElement('h2');
        h2.className = 'latest-insights-heading';
        h2.textContent = 'Latest insights';
        tiles.insertBefore(h2, row);
      }
    } catch (e) {
      if (window.console && console.error) {
        console.error('Imagine preview init error:', e);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImaginePreview);
  } else {
    initImaginePreview();
  }
})();