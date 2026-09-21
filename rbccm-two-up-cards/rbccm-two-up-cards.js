/* =========================================================================
   RBCCM Two-Up Cards - video modal runtime
   Deploy path: /assets/rbccm/js/components/rbccm-two-up-cards.js

   Behavior
   =========================================================================
   Only needed for the video-callouts preset. Attaches a click handler on
   any .rbccm-two-up-cards__card-media[data-video-url] element and opens a
   Bootstrap-shaped modal with the video URL. The DOM shape mirrors the
   MAAS/MATA hero video modal (yellow top border, 8px), so the modal
   inherits site-standard Bootstrap CSS on production while carrying its
   own fallback CSS in rbccm-two-up-cards.css for local previews.

   Player selection is automatic based on URL:
     - Direct file  (.mp4, .m4v, .webm, .ogg, .ogv, .mov)
                    → native <video controls autoplay muted playsinline>
                    (iframes don't play direct files reliably; muted so
                    autoplay isn't blocked by Chrome's policy).
     - YouTube      → <iframe> to youtube.com/embed/… with autoplay=1&rel=0.
     - Vimeo        → <iframe> to player.vimeo.com/video/… with autoplay=1.
     - Everything else (Brightcove players, Wistia, etc.)
                    → <iframe> loading the URL verbatim. If the URL is a
                    Brightcove player embed (players.brightcove.net) and
                    doesn't already carry autoplay/muted, we append
                    ?autoplay=1&muted=1 so the video starts immediately
                    when the modal opens (matches MAAS/MATA hero behavior).

   Open / close mechanism
   =========================================================================
   Runtime tries three backends in order and stops on the first match:
     1. Bootstrap 5 (window.bootstrap.Modal) — live site.
     2. Bootstrap 3/4 (jQuery.fn.modal)      — legacy pages.
     3. Vanilla                              — local previews / edge cases.
   When Bootstrap is present it owns focus trap, backdrop, and Esc; we
   add a supplementary focus-guard span AFTER the iframe so Tab escapes
   from the video player (YouTube etc.) get pulled back to the close
   button — same pattern the MAAS/MATA hero modal uses.

   Accessibility
   =========================================================================
   - Focus is trapped inside the modal while open. Bootstrap handles the
     usual trap; the focus-guard span catches iframe Tab escapes.
   - ESC closes the modal (Bootstrap handles it; vanilla fallback wires it
     manually) and returns focus to the play button that opened it.
   - Clicking the backdrop closes.
   - Play trigger is a real button so screen readers and keyboard users
     activate it the same way sighted users do.
   ========================================================================= */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Element refs (created lazily on first open)
     ------------------------------------------------------------------ */
  var modalEl       = null;   // .modal.fade wrapper
  var playerHost    = null;   // aspect-ratio wrapper the player element lives in
  var closeBtn      = null;
  var focusGuardEl  = null;
  var player        = null;   // active iframe or video
  var lastTrigger   = null;   // the button/link that opened the modal
  var MODAL_ID      = 'rbccm-two-up-cards-modal';
  var MODAL_DESC_ID = MODAL_ID + '-desc';


  /* ------------------------------------------------------------------
     URL classification — decides which player element to mount.
     ------------------------------------------------------------------ */
  function classifyUrl(url) {
    if (!url) return { kind: 'embed', src: '' };
    // Strip querystring/hash for extension check so signed .mp4?sig=…
    // URLs still classify as file.
    var pathOnly = url.split('?')[0].split('#')[0].toLowerCase();

    if (/\.(mp4|m4v|webm|ogg|ogv|mov)$/i.test(pathOnly)) {
      return { kind: 'file', src: url };
    }
    var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i);
    if (ytMatch) {
      return { kind: 'youtube', src: 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1&rel=0' };
    }
    var vmMatch = url.match(/vimeo\.com\/(\d+)/i);
    if (vmMatch) {
      return { kind: 'vimeo', src: 'https://player.vimeo.com/video/' + vmMatch[1] + '?autoplay=1' };
    }

    /* Brightcove player URL — matches players.brightcove.net/.../index.html
       Auto-append autoplay + muted params if the URL doesn't already
       carry them; matches the MAAS/MATA hero pattern (muted required
       because Chrome blocks unmuted autoplay). */
    if (/players\.brightcove\.net/i.test(url)) {
      var next = url;
      if (!/[?&]autoplay=/i.test(next)) {
        next += (next.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
      }
      if (!/[?&]muted=/i.test(next)) {
        next += '&muted=1';
      }
      return { kind: 'embed', src: next };
    }

    // Fallback: use verbatim.
    return { kind: 'embed', src: url };
  }


  /* ------------------------------------------------------------------
     Modal shell construction  (mirrors MAAS/MATA hero video modal)
     ------------------------------------------------------------------ */
  function ensureModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.id = MODAL_ID;
    modalEl.className = 'modal fade rbccm-two-up-cards__modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('tabindex', '-1');
    modalEl.setAttribute('aria-label', 'Video');
    modalEl.setAttribute('aria-describedby', MODAL_DESC_ID);

    /* Inline styles + Bootstrap classes intentionally match the
       MAAS/MATA hero modal so the visual (yellow top border, 960 max
       width, tight padding) is identical across the site. */
    modalEl.innerHTML =
      '<div role="document" class="modal-dialog" style="top: 0px; width: auto; max-width: 960px;">' +
        '<div class="modal-content">' +
          '<div>' +
            '<div class="modal-header" style="border: none; border-top: 8px #FBDE00 solid; padding: 0px;">' +
              '<button aria-label="Close Modal" class="close" style="font-size: 41px; color: #595959; font-weight: normal;" type="button" data-dismiss="modal" data-bs-dismiss="modal">&times;</button>' +
            '</div>' +
            '<div class="modal-body" style="padding: 0px;">' +
              '<div class="white-box-text" style="padding: 25px; padding-top: 10px;">' +
                '<div style="margin-bottom: 20px;">' +
                  '<p id="' + MODAL_DESC_ID + '" class="sr-only">Video opens in an embedded player.</p>' +
                  '<div>' +
                    '<div style="position: relative; display: block; max-width: 960px;">' +
                      '<div class="rbccm-two-up-cards__modal-aspect" style="padding-top: 56.25%;">' +
                        // Player element (iframe or video) mounted here on open.
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<span tabindex="0" aria-hidden="true" data-focus-guard="' + MODAL_ID + '"></span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modalEl);

    playerHost   = modalEl.querySelector('.rbccm-two-up-cards__modal-aspect');
    closeBtn     = modalEl.querySelector('.close');
    focusGuardEl = modalEl.querySelector('[data-focus-guard]');

    /* Close button — Bootstrap's data-bs-dismiss / data-dismiss handles
       this automatically when Bootstrap's JS is on the page. The
       explicit click listener catches the vanilla-fallback path. */
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeModal();
    });

    /* Focus guard — Bootstrap's native focus trap can't reach into the
       iframe (cross-origin), so when Tab moves focus out of the iframe
       it lands on this span. On focus, we shoot it back to the close
       button so the user stays inside the modal. */
    focusGuardEl.addEventListener('focus', function () {
      closeBtn.focus();
    });

    /* Vanilla-fallback wiring — noops when Bootstrap owns open/close. */
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.key === 'Esc') closeModal();
    });

    /* When Bootstrap fires its hidden.bs.modal event, teardown the
       player. Registered for both BS5 (native event) and jQuery/BS3-4.
       Idempotent with the closeModal() teardown path. */
    modalEl.addEventListener('hidden.bs.modal', teardownPlayer);
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery(modalEl).on('hidden.bs.modal', teardownPlayer);
    }
  }


  function isOpen() {
    if (!modalEl) return false;
    return modalEl.classList.contains('show')
        || modalEl.classList.contains('in')
        || modalEl.style.display === 'block';
  }


  /* ------------------------------------------------------------------
     Player mount / teardown
     ------------------------------------------------------------------ */
  function mountPlayer(kind, src) {
    teardownPlayer();

    if (kind === 'file') {
      player = document.createElement('video');
      player.className = 'rbccm-two-up-cards__modal-video';
      player.setAttribute('controls', 'controls');
      player.setAttribute('autoplay', 'autoplay');
      player.setAttribute('muted', 'muted');       // required for Chrome autoplay policy
      player.muted = true;
      player.setAttribute('playsinline', 'playsinline');
      player.setAttribute('preload', 'metadata');
      player.setAttribute('title', 'Video player');
      // Fill the 56.25% aspect-ratio wrapper.
      player.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#000;object-fit:contain;';
      player.src = src;
    } else {
      player = document.createElement('iframe');
      player.className = 'rbccm-two-up-cards__modal-iframe';
      player.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      player.setAttribute('allowfullscreen', 'allowfullscreen');
      player.setAttribute('frameborder', '0');
      player.setAttribute('title', 'Video player');
      player.style.cssText = 'position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;';
      player.src = src;
    }
    playerHost.appendChild(player);
  }

  function teardownPlayer() {
    if (!player) return;
    if (player.tagName === 'IFRAME') {
      player.src = 'about:blank';
    }
    if (player.tagName === 'VIDEO') {
      try { player.pause(); } catch (_e) {}
      player.removeAttribute('src');
      player.load();
    }
    if (player.parentNode) player.parentNode.removeChild(player);
    player = null;
  }


  /* ------------------------------------------------------------------
     Open / close  (BS5 → BS3/4 → vanilla)
     ------------------------------------------------------------------ */
  function openModal(url, trigger) {
    ensureModal();
    lastTrigger = trigger || document.activeElement;

    var route = classifyUrl(url);
    mountPlayer(route.kind, route.src);
    modalEl.setAttribute('data-player-kind', route.kind);

    // Bootstrap 5 (window.bootstrap.Modal) — preferred.
    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
      return;
    }
    // Bootstrap 3/4 via jQuery.
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery(modalEl).modal('show');
      return;
    }
    // Vanilla fallback (local-test path).
    modalEl.classList.add('show', 'in');
    modalEl.style.display = 'block';
    modalEl.removeAttribute('aria-hidden');
    modalEl.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');
    window.setTimeout(function () { closeBtn.focus(); }, 30);
  }

  function closeModal() {
    if (!modalEl) return;

    if (window.bootstrap && window.bootstrap.Modal) {
      var inst = window.bootstrap.Modal.getInstance(modalEl);
      if (inst) {
        inst.hide();
        // teardownPlayer + focus restore happen via hidden.bs.modal listener + below.
        restoreFocusToTrigger();
        return;
      }
    }
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.modal) {
      window.jQuery(modalEl).modal('hide');
      restoreFocusToTrigger();
      return;
    }
    // Vanilla teardown.
    modalEl.classList.remove('show', 'in');
    modalEl.style.display = 'none';
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.removeAttribute('aria-modal');
    document.body.classList.remove('modal-open');
    teardownPlayer();
    restoreFocusToTrigger();
  }

  function restoreFocusToTrigger() {
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }


  /* ------------------------------------------------------------------
     Play-button "explode" animation on click (unchanged)
     ------------------------------------------------------------------ */
  function explodePlayButton(cardEl) {
    if (!cardEl) return;
    var play = cardEl.querySelector('.rbccm-two-up-cards__card-play');
    if (!play) return;
    play.classList.remove('is-launching');
    // eslint-disable-next-line no-unused-expressions
    play.offsetWidth;                       // force reflow to restart transition
    play.classList.add('is-launching');
    window.setTimeout(function () {
      play.classList.remove('is-launching');
    }, 650);
  }


  /* ------------------------------------------------------------------
     Delegated click handler — media button + "Watch the video" CTA.
     Multi-instance safe (any number of cards on the page share one modal).
     ------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;

    // 1. Media button (with data-video-url).
    var mediaTrigger = e.target.closest('.rbccm-two-up-cards__card-media[data-video-url]');
    if (mediaTrigger) {
      e.preventDefault();
      var mediaUrl = mediaTrigger.getAttribute('data-video-url');
      if (mediaUrl) {
        explodePlayButton(mediaTrigger.closest('.rbccm-two-up-cards__card'));
        openModal(mediaUrl, mediaTrigger);
      }
      return;
    }

    // 2. "Watch the video" CTA — opens the same modal, reading the URL
    //    from the sibling media button. Falls through to a plain link
    //    if the card has no video URL.
    var ctaTrigger = e.target.closest('.rbccm-two-up-cards__card-cta');
    if (ctaTrigger) {
      var card = ctaTrigger.closest('.rbccm-two-up-cards__card');
      if (!card) return;
      var media = card.querySelector('.rbccm-two-up-cards__card-media[data-video-url]');
      if (!media) return;
      var ctaUrl = media.getAttribute('data-video-url');
      if (!ctaUrl) return;
      e.preventDefault();
      explodePlayButton(card);
      openModal(ctaUrl, ctaTrigger);
    }
  });


  /* ------------------------------------------------------------------
     Tiny public API — analytics / deep-link teams occasionally need it.
     ------------------------------------------------------------------ */
  window.RBCCMTwoUpCards = {
    open: openModal,
    close: closeModal
  };
})();
