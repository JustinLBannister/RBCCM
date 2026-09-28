/* =========================================================================
   RBCCM Video Poster - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-video-poster.js

   One pass per .rbccm-video-poster__modal on the page (safe to include
   more than once; each modal is wired once). Ported from the MAAS+MATA
   video modal script.

   - Open: set the iframe src (from data-src) with autoplay=1&muted=1.
     The click that opened the modal counts as the user gesture; muted
     is what lets autoplay work across browsers. Nothing loads before
     the modal opens.
   - Close: clear the src so the video actually stops.
   - Focus: move to Close on open, back to the play button on close.
     A guard after the iframe loops Tab back to Close.
   - Bootstrap 5 (native events), Bootstrap 3/4 (jQuery events), or no
     Bootstrap at all (vanilla open / close / Esc / backdrop click).
   ========================================================================= */
(function () {
  'use strict';

  function withAutoplay(url) {
    if (!url) return url;
    var stripped = url
      .replace(/([&?])autoplay=[^&]*&?/, '$1')
      .replace(/([&?])muted=[^&]*&?/, '$1')
      .replace(/[&?]$/, '');
    return stripped + (stripped.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1&muted=1';
  }

  function wire(modal) {
    if (!modal || modal.getAttribute('data-rbccm-vp-ready')) return;
    modal.setAttribute('data-rbccm-vp-ready', '1');

    var iframe   = modal.querySelector('iframe');
    var closeBtn = modal.querySelector('.close');
    var guard    = modal.querySelector('.rbccm-video-poster__focus-guard');
    if (!iframe) return;
    var src = iframe.getAttribute('data-src') || iframe.getAttribute('src') || '';
    iframe.removeAttribute('src');

    var trigger = null;
    function play() { iframe.setAttribute('src', withAutoplay(src)); }
    function stop() { iframe.removeAttribute('src'); }
    function focusClose() { if (closeBtn) closeBtn.focus(); }
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

    if (hasBS5) {
      modal.addEventListener('show.bs.modal', function (e) {
        trigger = trigger || (e && e.relatedTarget) || document.activeElement;
        play();
      });
      modal.addEventListener('shown.bs.modal', focusClose);
      modal.addEventListener('hidden.bs.modal', function () { stop(); focusTrigger(); });
      return;
    }
    if (hasBS3or4) {
      var $m = $(modal);
      $m.on('show.bs.modal', function (e) {
        trigger = trigger || (e && e.relatedTarget) || document.activeElement;
        play();
      });
      $m.on('shown.bs.modal', focusClose);
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
      backdrop.className = 'modal-backdrop fade show in';
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
