/* =========================================================================
   RBCCM Marketo Modal - runtime
   Deploy path: /assets/rbccm/js/components/rbccm-marketo-modal.js
   =========================================================================
   One <dialog class="rbccm-marketo-modal" id="{ModalID}"> per instance
   (rbccm-marketo-modal.xsl). This file:

   Open / close
     - Opens on any click of a link whose URL is #{ModalID} on this page
       (e.g. the hero and CTA band "Request a demo" buttons) or of any
       element with data-rbccm-modal="{ModalID}". Listens in the capture
       phase so smooth-scroll or Bootstrap hash handlers never see it.
     - Opens on load when the page URL ends in #{ModalID} (shareable).
     - Native showModal(): focus is trapped in the dialog, Escape closes,
       the page behind is inert. A focus guard loops Tab / Shift+Tab
       between the X and the last control (same as the video poster and
       two-up card modals). Closes on the X, Cancel, the thank-you
       Close button, or a click on the backdrop. Focus returns to the
       trigger, the page stops scrolling while open, and a #{ModalID}
       hash is cleared from the URL on close.

   Marketo
     - Reuses window.MktoForms2 when the page already has it (the Marketo
       footer, or a legacy form), waits for an existing forms2 script
       tag, otherwise injects {base}/js/forms2/js/forms2.min.js.
     - Loads the form up front so it is ready when the modal opens.
     - Prefixes the form's element IDs with {ModalID}- (labels and aria
       references follow) so they can't clash with another Marketo form
       on the page, which uses the same field IDs.
     - Tags each field column with rbccm-marketo-modal__field--{name}
       (+ --text / --checkbox) so the CSS can lay the form out by field
       name instead of Marketo's own rows and inline widths, and marks
       text fields .is-filled for the floating labels.
     - Submit button label + arrow, Cancel button next to it.
     - Business email check, gacid hidden field, dataLayer "mktoLead"
       push and the thank-you state (same behaviour as the Marketo
       footer, scoped to this form ID).
   ========================================================================= */
(function () {
  'use strict';

  var BAD_DOMAINS = ['@gmail.', '@yahoo.', '@hotmail.', '@live.', '@aol.', '@outlook.'];
  /* Figma: 18 x 18 frame, 15.751 x 10.126 glyph, white (currentColor). */
  var ARROW_SVG = '<svg class="rbccm-marketo-modal__submit-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.125 8.99998C1.125 8.85079 1.18426 8.70772 1.28975 8.60223C1.39524 8.49674 1.53832 8.43748 1.6875 8.43748H14.9546L11.4142 4.89823C11.3086 4.79261 11.2493 4.64935 11.2493 4.49998C11.2493 4.35061 11.3086 4.20735 11.4142 4.10173C11.5199 3.99611 11.6631 3.93677 11.8125 3.93677C11.9619 3.93677 12.1051 3.99611 12.2108 4.10173L16.7108 8.60173C16.7631 8.65398 16.8047 8.71605 16.8331 8.78439C16.8614 8.85273 16.876 8.92599 16.876 8.99998C16.876 9.07397 16.8614 9.14723 16.8331 9.21557C16.8047 9.2839 16.7631 9.34598 16.7108 9.39823L12.2108 13.8982C12.1051 14.0038 11.9619 14.0632 11.8125 14.0632C11.6631 14.0632 11.5199 14.0038 11.4142 13.8982C11.3086 13.7926 11.2493 13.6494 11.2493 13.5C11.2493 13.3506 11.3086 13.2073 11.4142 13.1017L14.9546 9.56248H1.6875C1.53832 9.56248 1.39524 9.50321 1.28975 9.39773C1.18426 9.29224 1.125 9.14916 1.125 8.99998Z" fill="currentColor"/></svg>';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* One shared forms2 loader for every modal on the page. */
  var forms2Promise = null;
  function loadForms2(base) {
    if (window.MktoForms2) return Promise.resolve();
    if (forms2Promise) return forms2Promise;
    forms2Promise = new Promise(function (resolve) {
      var existing = document.querySelector('script[src*="forms2.min.js"]');
      if (existing) {
        var tries = 0;
        var timer = setInterval(function () {
          if (window.MktoForms2) { clearInterval(timer); resolve(); }
          else if (++tries > 200) { clearInterval(timer); inject(); }   /* ~10s */
        }, 50);
        return;
      }
      inject();
      function inject() {
        var s = document.createElement('script');
        s.src = base + '/js/forms2/js/forms2.min.js';
        s.onload = function () { resolve(); };
        document.head.appendChild(s);
      }
    });
    return forms2Promise;
  }

  function emailOk(email) {
    email = String(email || '').toLowerCase();
    for (var i = 0; i < BAD_DOMAINS.length; i++) {
      if (email.indexOf(BAD_DOMAINS[i]) !== -1) return false;
    }
    return true;
  }
  function gacid() {
    try { return window.ga.getAll()[0].get('clientId'); } catch (e) { return 'n/a'; }
  }
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function initModal(modal) {
    if (modal.getAttribute('data-rbccm-modal-ready') === 'true') return;
    modal.setAttribute('data-rbccm-modal-ready', 'true');

    var id       = modal.id;
    var formId   = modal.getAttribute('data-form-id') || '';
    var base     = modal.getAttribute('data-base-url') || '//discover.rbccm.com';
    var munchkin = modal.getAttribute('data-munchkin') || '577-RQV-784';
    var submitLabel = modal.getAttribute('data-submit-label') || 'Submit';
    var cancelLabel = modal.getAttribute('data-cancel-label') || 'Cancel';
    var header   = modal.querySelector('.rbccm-marketo-modal__header');
    var formWrap = modal.querySelector('.rbccm-marketo-modal__form');
    var thanks   = modal.querySelector('.rbccm-marketo-modal__thanks');
    var thanksHeading = thanks ? thanks.querySelector('.rbccm-marketo-modal__thanks-heading') : null;
    var thanksTemplate = thanksHeading ? thanksHeading.textContent : '';
    var lastTrigger = null;
    var canShowModal = typeof modal.showModal === 'function';

    /* ---------- open / close ---------- */
    function open(trigger) {
      lastTrigger = trigger || document.activeElement;
      if (modal.open) return;
      document.documentElement.classList.add('rbccm-marketo-modal-open');
      if (canShowModal) modal.showModal();
      else { modal.setAttribute('open', ''); modal.classList.add('is-fallback-open'); }
      /* Focus the panel (tabindex -1), not the first control: screen
         readers announce the dialog + heading, and Tab moves to the X. */
      try { modal.focus({ preventScroll: true }); } catch (e) { modal.focus(); }
    }
    function close() {
      if (!modal.open) return;
      if (canShowModal) modal.close();
      else { modal.removeAttribute('open'); modal.classList.remove('is-fallback-open'); onClosed(); }
    }
    function onClosed() {
      document.documentElement.classList.remove('rbccm-marketo-modal-open');
      if (window.location.hash === '#' + id && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        try { lastTrigger.focus({ preventScroll: true }); } catch (e) { lastTrigger.focus(); }
      }
    }
    modal.addEventListener('close', onClosed);

    /* Focus guard: Tab past the last control loops back to the X and
       Shift+Tab past the X loops to the last one (Cancel, or the
       thank-you Close). showModal() already makes the page behind inert,
       but browsers send Tab out to their own toolbar before wrapping, and
       the no-showModal fallback has no trap at all. Only visible controls
       count, so the hidden form / thank-you state is skipped. */
    var TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
                   'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !modal.open) return;
      var items = Array.prototype.filter.call(modal.querySelectorAll(TABBABLE), function (el) {
        return el.tabIndex >= 0 && el.getClientRects().length > 0;
      });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || active === modal)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* X, Cancel, thank-you Close; and a click on the backdrop (the dialog
       element itself is the panel, so a click whose point is outside its
       box landed on ::backdrop). */
    modal.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-rbccm-modal-close]')) { close(); return; }
      if (e.target === modal) {
        var r = modal.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
      }
    });

    /* Triggers. Capture phase so other hash / smooth-scroll handlers on
       the page don't act on #{ModalID} first. Only same-page links. */
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-rbccm-modal], a[href*="#"]') : null;
      if (!el || modal.contains(el)) return;
      var target = el.getAttribute('data-rbccm-modal');
      if (!target) {
        if (el.hash !== '#' + id) return;
        if (el.pathname && el.pathname !== window.location.pathname) return;
        target = id;
      }
      if (target !== id) return;
      e.preventDefault();
      open(el);
    }, true);

    if (window.location.hash === '#' + id) open(null);

    /* ---------- Marketo ---------- */
    if (!formId) return;

    loadForms2(base).then(function () {
      if (!window.MktoForms2) return;
      window.MktoForms2.loadForm(base, munchkin, Number(formId));
      window.MktoForms2.whenReady(function (form) {
        if (String(form.getId()) !== formId) return;
        decorate(form);
      });
    });

    function decorate(form) {
      var formEl = form.getFormElem()[0];
      if (!formEl || formEl.getAttribute('data-rbccm-decorated') === 'true') return;
      formEl.setAttribute('data-rbccm-decorated', 'true');

      /* Unique IDs. Marketo gives every form the same field IDs (#Email,
         #FirstName...), so with a second form on the page (the Marketo
         footer) each label for="" resolves to whichever form comes first
         and the other form's inputs lose their labels. Prefix this form's
         IDs and repoint its label / aria references to match. */
      var prefix = id + '-';
      var idMap = {};
      Array.prototype.forEach.call(formEl.querySelectorAll('[id]'), function (el) {
        if (el.id.indexOf(prefix) === 0) return;
        idMap[el.id] = prefix + el.id;
        el.id = idMap[el.id];
      });
      Array.prototype.forEach.call(formEl.querySelectorAll('label[for]'), function (el) {
        var f = el.getAttribute('for');
        if (idMap[f]) el.setAttribute('for', idMap[f]);
      });
      Array.prototype.forEach.call(formEl.querySelectorAll('[aria-describedby], [aria-labelledby]'), function (el) {
        ['aria-describedby', 'aria-labelledby'].forEach(function (attr) {
          var v = el.getAttribute(attr);
          if (!v) return;
          el.setAttribute(attr, v.split(/\s+/).map(function (ref) { return idMap[ref] || ref; }).join(' '));
        });
      });

      /* Field classes: layout by field name, not Marketo's rows. */
      var cols = formEl.querySelectorAll('.mktoFormCol');
      Array.prototype.forEach.call(cols, function (col) {
        var field = col.querySelector('.mktoField');
        if (!field || field.type === 'hidden') return;
        var isCheckbox = field.type === 'checkbox' || field.type === 'radio';
        col.classList.add('rbccm-marketo-modal__field');
        col.classList.add('rbccm-marketo-modal__field--' + slug(field.name));
        col.classList.add(isCheckbox ? 'rbccm-marketo-modal__field--checkbox' : 'rbccm-marketo-modal__field--text');
        if (isCheckbox) return;
        /* Floating label: .is-filled keeps it up once there is a value
           (typed, autofilled or restored). */
        var sync = function () { col.classList.toggle('is-filled', !!field.value); };
        field.addEventListener('input', sync);
        field.addEventListener('change', sync);
        field.addEventListener('blur', sync);
        sync();
        setTimeout(sync, 600);
      });

      /* Submit label + arrow, Cancel beside it. */
      var btn = formEl.querySelector('.mktoButton');
      if (btn) {
        btn.innerHTML = '<span class="rbccm-marketo-modal__submit-label"></span>' + ARROW_SVG;
        btn.querySelector('.rbccm-marketo-modal__submit-label').textContent = submitLabel;
        btn.classList.add('rbccm-marketo-modal__submit');
      }
      var buttonRow = formEl.querySelector('.mktoButtonRow');
      if (buttonRow && !buttonRow.querySelector('.rbccm-marketo-modal__cancel')) {
        var cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'rbccm-marketo-modal__cancel';
        cancel.setAttribute('data-rbccm-modal-close', '');
        cancel.textContent = cancelLabel;
        buttonRow.appendChild(cancel);
      }

      form.onValidate(function () {
        var email = form.vals().Email;
        if (!email) return;
        if (!emailOk(email)) {
          form.submitable(false);
          form.showErrorMessage('Must be Business email.', form.getFormElem().find('[name="Email"]'));
        } else {
          form.submitable(true);
        }
      });

      form.vals({ gacid: gacid() });

      form.onSuccess(function (vals) {
        if (window.dataLayer) window.dataLayer.push({ event: 'mktoLead', mktoFormId: form.getId() });
        if (thanks) {
          var name = String((vals && vals.FirstName) || '').trim();
          if (thanksHeading) {
            thanksHeading.textContent = name
              ? thanksTemplate.replace('{FirstName}', name)
              : thanksTemplate.replace(/,?\s*\{FirstName\}/, '');
          }
          if (header) header.hidden = true;
          if (formWrap) formWrap.hidden = true;
          thanks.hidden = false;
          if (thanksHeading) thanksHeading.focus();
        }
        return false;     /* stay on the page */
      });
    }
  }

  ready(function () {
    var modals = document.querySelectorAll('dialog.rbccm-marketo-modal[id]');
    for (var i = 0; i < modals.length; i++) initModal(modals[i]);
  });
})();
