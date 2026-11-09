/* =========================================================================
   RBCCM Video Poster - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-video-poster.js

   One pass per .rbccm-video-poster__modal on the page (safe to include
   more than once; each modal is wired once). Ported from the MAAS+MATA
   video modal script.

   - Open: set the iframe src (from data-src) with autoplay=any. The
     viewer clicked play, so the video starts WITH sound; "any" tells
     the Brightcove player to try with sound first and fall back to
     muted only if the browser blocks it (some Safari setups). Nothing
     loads before the modal opens.
   - Close: clear the src so the video actually stops.
   - Focus: move to Close on open, back to the play button on close.
     A guard after the iframe loops Tab back to Close.
   - Bootstrap 5 (native events), Bootstrap 3/4 (jQuery events), or no
     Bootstrap at all (vanilla open / close / Esc / backdrop click).
   - Layering: each modal is moved to the end of <body> so no parent
     wrapper (transforms, z-index from TeamSite or the scroll
     animations) can trap it under the page; the CSS puts the modal and
     its backdrop above everything else, fixed nav included.
   - Other videos: any link with data-video-src (a Brightcove player
     URL) opens the page's video modal playing THAT video instead of
     the poster's own (data-video-modal="<modal id>" picks a modal;
     otherwise the first one). data-video-label names the dialog. The
     poster's video is back on its play button after closing. Used by
     the ETF hero's "Watch the latest interview" button (filtered-content
     sets the attributes). Cmd/Ctrl/Shift-click still follows the link.
   ========================================================================= */
(function () {
  'use strict';

  function withAutoplay(url) {
    if (!url) return url;
    var stripped = url
      .replace(/([&?])autoplay=[^&]*&?/, '$1')
      .replace(/([&?])muted=[^&]*&?/, '$1')
      .replace(/[&?]$/, '');
    return stripped + (stripped.indexOf('?') === -1 ? '?' : '&') + 'autoplay=any';
  }

  function wire(modal) {
    if (!modal || modal.getAttribute('data-rbccm-vp-ready')) return;
    modal.setAttribute('data-rbccm-vp-ready', '1');

    /* Top level, so its z-index is measured against the whole page. */
    if (modal.parentNode !== document.body) document.body.appendChild(modal);

    var iframe   = modal.querySelector('iframe');
    var closeBtn = modal.querySelector('.close');
    var guard    = modal.querySelector('.rbccm-video-poster__focus-guard');
    if (!iframe) return;
    var src = iframe.getAttribute('data-src') || iframe.getAttribute('src') || '';
    iframe.removeAttribute('src');

    var trigger = null;
    var override = '';                            /* another link's video */
    var baseLabel = modal.getAttribute('aria-label');
    var baseTitle = iframe.getAttribute('title');
    function play() { iframe.setAttribute('src', withAutoplay(override || src)); }
    function stop() {
      iframe.removeAttribute('src');
      override = '';
      if (baseLabel != null) modal.setAttribute('aria-label', baseLabel);
      if (baseTitle != null) iframe.setAttribute('title', baseTitle);
    }
    function focusClose() { if (closeBtn) closeBtn.focus(); }
    /* Bootstrap adds its backdrop at its own z-index (1040); lift the
       newest one to sit just under this modal. */
    function liftBackdrop() {
      var drops = document.querySelectorAll('.modal-backdrop');
      if (drops.length) drops[drops.length - 1].classList.add('rbccm-video-poster__backdrop');
    }
    function focusTrigger() {
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
      trigger = null;
    }
    if (guard) guard.addEventListener('focus', focusClose);

    var selector =
      '[data-bs-toggle="modal"][data-bs-target="#' + modal.id + '"],' +
      '[data-toggle="modal"][data-target="#' + modal.id + '"]';
    /* Remember the play button on click whichever path opens it. */
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (btn) {
      btn.addEventListener('click', function () { trigger = btn; });
    });

    var hasBS5    = !!(window.bootstrap && window.bootstrap.Modal);
    var $         = window.jQuery;
    var hasBS3or4 = !!($ && $.fn && $.fn.modal);

    /* Open this modal with another video (see "Other videos" above). */
    modal.rbccmPlayVideo = function (url, label, el) {
      override = url;
      if (label) {
        modal.setAttribute('aria-label', label);
        iframe.setAttribute('title', label);
      }
      trigger = el || null;
      if (hasBS5) window.bootstrap.Modal.getOrCreateInstance(modal).show();
      else if (hasBS3or4) $(modal).modal('show');
      else openModal();
    };

    if (hasBS5) {
      modal.addEventListener('show.bs.modal', function (e) {
        trigger = trigger || (e && e.relatedTarget) || document.activeElement;
        play();
      });
      modal.addEventListener('shown.bs.modal', function () { liftBackdrop(); focusClose(); });
      modal.addEventListener('hidden.bs.modal', function () { stop(); focusTrigger(); });
      return;
    }
    if (hasBS3or4) {
      var $m = $(modal);
      $m.on('show.bs.modal', function (e) {
        trigger = trigger || (e && e.relatedTarget) || document.activeElement;
        play();
      });
      $m.on('shown.bs.modal', function () { liftBackdrop(); focusClose(); });
      $m.on('hidden.bs.modal', function () { stop(); focusTrigger(); });
      return;
    }

    /* ---- No Bootstrap: open / close ourselves ---------------------- */
    var backdrop = null;
    function isShown() { return modal.classList.contains('show') || modal.classList.contains('in'); }
    function openModal() {
      if (isShown()) return;
      modal.style.display = 'block';
      void modal.offsetWidth;                         /* reflow for the fade */
      modal.classList.add('show', 'in');
      modal.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-modal', 'true');
      document.body.classList.add('modal-open');
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show in rbccm-video-poster__backdrop';
      document.body.appendChild(backdrop);
      play();
      setTimeout(focusClose, 0);
    }
    function closeModal() {
      if (!isShown()) return;
      modal.classList.remove('show', 'in');
      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');
      stop();
      setTimeout(function () {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        backdrop = null;
      }, 150);
      focusTrigger();
    }
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (btn) {
      btn.addEventListener('click', function (ev) { ev.preventDefault(); trigger = btn; openModal(); });
    });
    Array.prototype.forEach.call(
      modal.querySelectorAll('[data-bs-dismiss="modal"], [data-dismiss="modal"]'),
      function (btn) { btn.addEventListener('click', function (ev) { ev.preventDefault(); closeModal(); }); }
    );
    modal.addEventListener('click', function (ev) { if (ev.target === modal) closeModal(); });
    document.addEventListener('keydown', function (ev) {
      if ((ev.key === 'Escape' || ev.keyCode === 27) && isShown()) closeModal();
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.rbccm-video-poster__modal'), wire);
  }

  /* Links with data-video-src play in the video modal. Delegated, so it
     also covers links that get the attributes after load. */
  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var el = ev.target && ev.target.closest ? ev.target.closest('[data-video-src]') : null;
    if (!el) return;
    var url = el.getAttribute('data-video-src') || '';
    if (!/^(https?:)?\/\//i.test(url)) return;
    var id = el.getAttribute('data-video-modal');
    var modal = id ? document.getElementById(id) : document.querySelector('.rbccm-video-poster__modal');
    if (!modal) return;
    wire(modal);
    if (!modal.rbccmPlayVideo) return;
    ev.preventDefault();
    modal.rbccmPlayVideo(url, el.getAttribute('data-video-label') || '', el);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
