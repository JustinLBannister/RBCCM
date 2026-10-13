/* RBCCM Marketo Modal - live console test (not for deploy)
   Paste the whole file into the browser console on the live MAAS page.
   - Adds the modal CSS, the <dialog id="request-demo"> markup and the
     modal JS, exactly as the component will once uploaded.
   - Points any "Request a demo" link on the page at #request-demo so
     the real buttons open it.
   - Reload the page before pasting again.
   Submitting a valid form creates a real Marketo lead. */
(function () {
  if (document.getElementById('request-demo')) {
    console.warn('[rbccm-marketo-modal] #request-demo already on the page - reload before pasting again.');
    return;
  }
  var style = document.createElement('style');
  style.id = 'rbccm-marketo-modal-test-css';
  style.textContent = "/* =========================================================================\n   RBCCM Marketo Modal\n   Deploy path: /assets/rbccm/css/components/rbccm-marketo-modal.css\n   =========================================================================\n   \"Talk with an expert.\" popup (native <dialog>) with an embedded\n   Marketo form. Opened by links to #{ModalID}; see\n   rbccm-marketo-modal.js.\n\n   Design (desktop):\n     panel     100% wide up to 600, 563 tall (min), white, 24 radius, 48/40 padding\n     close     36 circle, 10px padding, #F1F5FB, 16px X (1.4 stroke,\n               #003168), 18 from the top-right corner\n     header    column, centred, 11px gaps, 27/52/41.594 padding\n     heading   RBC Display 500 36/36, -0.6px, #082043; last word(s) #0051A5;\n               45 x 2 yellow rule\n     subhead   Roboto 400 16/24, #494949\n     fields    2 columns (First/Last, Company/Title), Email full width,\n               32px column gap, 24px row gap; #979797 underline, 11/0\n               field padding; label Roboto 500 13/15, 0.52px, #858585,\n               sits in the field until it has focus or a value\n     consent   18px checkbox; copy Roboto 400 13/18.85 #494949; privacy\n               link Roboto 400 13/15 #0051A5\n     buttons   submit: 45 tall, 14/35 padding, 14 gap, #0051A5 pill,\n               Roboto 500 17/20 white, 18px arrow; Cancel right: Roboto\n               400 15/18 #494949, underlined\n   Mobile (<600): full-width panel, one column, 28px heading.\n\n   Marketo injects forms2.css + its theme AFTER this file, with inline\n   widths, floats and a gradient button, so the form overrides below\n   carry !important. Every rule is scoped to .rbccm-marketo-modal so\n   other Marketo forms on the page (e.g. the footer) are untouched.\n   ========================================================================= */\n\nhtml.rbccm-marketo-modal-open {\n  overflow: hidden;                   /* no page scroll behind the modal */\n}\n\n/* ---- Panel (the <dialog> itself) --------------------------------------- */\ndialog.rbccm-marketo-modal {\n  background: #FFF;\n  border: 0;\n  border-radius: 24px;\n  box-shadow: 0 20px 60px rgba(0, 33, 68, 0.25);\n  box-sizing: border-box;\n  color: #252525;\n  margin: auto;\n  min-height: 563px;                  /* Figma 563; grows (not scrolls) when Marketo adds error lines */\n  max-height: calc(100% - 32px);\n  max-width: min(600px, calc(100% - 32px));\n  overflow: auto;\n  overscroll-behavior: contain;\n  padding: 48px 40px;\n  width: 100%;\n}\ndialog.rbccm-marketo-modal *,\ndialog.rbccm-marketo-modal *::before,\ndialog.rbccm-marketo-modal *::after {\n  box-sizing: border-box;\n}\ndialog.rbccm-marketo-modal:focus {\n  outline: none;                      /* focused on open (tabindex -1) */\n}\ndialog.rbccm-marketo-modal::backdrop {\n  background: rgba(0, 33, 68, 0.35);\n  -webkit-backdrop-filter: blur(4px);\n  backdrop-filter: blur(4px);\n}\ndialog.rbccm-marketo-modal[open] {\n  animation: rbccm-marketo-modal-in 0.25s ease-out;\n}\ndialog.rbccm-marketo-modal[open]::backdrop {\n  animation: rbccm-marketo-modal-fade 0.25s ease-out;\n}\n@keyframes rbccm-marketo-modal-in {\n  from { opacity: 0; transform: translateY(12px) scale(0.98); }\n  to   { opacity: 1; transform: none; }\n}\n@keyframes rbccm-marketo-modal-fade {\n  from { opacity: 0; }\n  to   { opacity: 1; }\n}\n/* Browsers without showModal(): fixed, centred, over a plain scrim. */\ndialog.rbccm-marketo-modal.is-fallback-open {\n  box-shadow: 0 0 0 100vmax rgba(0, 33, 68, 0.35);\n  left: 50%;\n  position: fixed;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 10000;\n}\n.rbccm-marketo-modal [hidden] {\n  display: none !important;\n}\n\n/* ---- Close (X) ---------------------------------------------------------- */\n/* Figma: 36 x 36, 10px padding, 100px radius, #F1F5FB; 16px X frame\n   (10px glyph, 1.4 stroke, #003168). */\n.rbccm-marketo-modal__close {\n  align-items: center;\n  background: #F1F5FB;\n  border: 0;\n  border-radius: 100px;\n  color: #003168;\n  cursor: pointer;\n  display: flex;\n  height: 36px;\n  justify-content: center;\n  padding: 10px;\n  position: absolute;\n  right: 18px;\n  top: 18px;\n  transition: background-color 0.15s ease;\n  width: 36px;\n}\n.rbccm-marketo-modal__close-icon {\n  display: block;\n  flex-shrink: 0;\n  height: 16px;\n  width: 16px;\n}\n.rbccm-marketo-modal__close:hover {\n  background: #E1E9F5;\n}\n.rbccm-marketo-modal__close:focus-visible {\n  outline: 2px solid var(--Blue-Bright-Blue, #0051A5);\n  outline-offset: 2px;\n}\n\n/* ---- Header ------------------------------------------------------------- */\n/* Figma: column, centred, 11px between heading / rule / paragraph,\n   27 / 52 / 41.594 padding. The bottom padding is the space before the\n   first field (the form wrap adds none). */\n.rbccm-marketo-modal__header {\n  align-items: center;\n  display: flex;\n  flex-direction: column;\n  gap: 11px;\n  padding: 27px 52px 41.594px;\n  text-align: center;\n}\n.rbccm-marketo-modal h2.rbccm-marketo-modal__heading {\n  color: #082043 !important;\n  font-family: \"RBC Display\", RBCDisplay, Georgia, Times, serif !important;\n  font-size: 36px !important;\n  font-style: normal !important;\n  font-weight: 500 !important;\n  letter-spacing: -0.6px !important;\n  line-height: 36px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  text-transform: none !important;\n}\n.rbccm-marketo-modal__heading-highlight {\n  color: #0051A5;\n  font-family: inherit !important;\n  letter-spacing: inherit;\n}\n/* Yellow rule under the heading (no empty element in the markup). */\n.rbccm-marketo-modal h2.rbccm-marketo-modal__heading::after {\n  background: #FFC72C;\n  content: '';\n  display: block;\n  height: 2px;\n  margin: 11px auto 0;                /* same 11px as the header gap */\n  width: 45px;\n}\n.rbccm-marketo-modal p.rbccm-marketo-modal__subheading {\n  color: #494949 !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 16px !important;\n  font-style: normal !important;\n  font-weight: 400 !important;\n  letter-spacing: 0 !important;\n  line-height: 24px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\n/* ---- Form shell --------------------------------------------------------- */\n.rbccm-marketo-modal__form {\n  margin-top: 0;\n}\n.rbccm-marketo-modal .mktoForm {\n  color: #252525 !important;\n  column-gap: 32px;\n  display: grid !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 16px !important;\n  grid-template-columns: minmax(0, 1fr);\n  padding: 0 !important;\n  row-gap: 24px;\n  width: 100% !important;\n}\n@media (min-width: 600px) {\n  .rbccm-marketo-modal .mktoForm {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n}\n/* forms2.css gives EVERY element in a form `padding: 10px` under 480px\n   (.mktoForm *), which collapses the 20px submit arrow to nothing and\n   insets the fields. Zeroed here at higher specificity; the elements\n   that need padding (inputs, labels, button, Cancel) set it with\n   !important or a more specific selector below. */\n.rbccm-marketo-modal .mktoForm * {\n  padding: 0;\n}\n/* Marketo's rows become transparent so every field column is a direct\n   grid item; layout then follows field names (classes from the JS). */\n.rbccm-marketo-modal .mktoForm .mktoFormRow {\n  display: contents !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoFormCol {\n  float: none !important;\n  grid-column: 1 / -1;                /* unknown fields: full width, after the known ones */\n  margin: 0 !important;\n  min-height: 0 !important;\n  order: 10;\n  width: auto !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoOffset,\n.rbccm-marketo-modal .mktoForm .mktoGutter,\n.rbccm-marketo-modal .mktoForm .mktoClear,\n.rbccm-marketo-modal .mktoForm .mktoAsterix,\n.rbccm-marketo-modal .mktoForm .mktoInstruction {\n  display: none !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoFieldWrap {\n  float: none !important;\n  width: 100% !important;\n}\n/* Design order: First | Last, Company | Title, Email, consent, buttons. */\n@media (min-width: 600px) {\n  .rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--firstname,\n  .rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--lastname,\n  .rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--company,\n  .rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--title {\n    grid-column: auto;\n  }\n}\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--firstname { order: 1; }\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--lastname  { order: 2; }\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--company   { order: 3; }\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--title     { order: 4; }\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--email     { order: 5; }\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--checkbox  { order: 20; }\n\n/* ---- Text fields: underline + floating label ---------------------------- */\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--text .mktoFieldWrap {\n  position: relative;\n}\n/* display: block !important because form-level custom CSS (form 1574)\n   hides every .mktoLabel under 800px and relies on placeholders; here the\n   label IS the prompt (placeholders are transparent). */\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--text .mktoLabel {\n  color: #858585 !important;\n  display: block !important;\n  float: none !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 13px !important;\n  font-style: normal !important;\n  font-weight: 500 !important;\n  left: 0;\n  letter-spacing: 0.52px !important;\n  line-height: 15px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  pointer-events: none;\n  position: absolute;\n  top: 11px;                          /* Figma field padding 11 / 0 */\n  transition: top 0.15s ease, font-size 0.15s ease, color 0.15s ease;\n  white-space: nowrap;\n  width: auto !important;\n}\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--text:focus-within .mktoLabel,\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--text.is-filled .mktoLabel {\n  font-size: 11px !important;\n  top: -8px;\n}\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--text:focus-within .mktoLabel {\n  color: var(--Blue-Bright-Blue, #0051A5) !important;\n}\n.rbccm-marketo-modal .mktoForm input.mktoField:not([type=\"checkbox\"]):not([type=\"radio\"]),\n.rbccm-marketo-modal .mktoForm textarea.mktoField,\n.rbccm-marketo-modal .mktoForm select.mktoField {\n  background: transparent !important;\n  border: 0 !important;\n  border-bottom: 1px solid #979797 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  color: #252525 !important;\n  float: none !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 15px !important;\n  height: 38px;                       /* 11 + 15 + 11 + 1px underline */\n  line-height: 15px !important;\n  margin: 0 !important;\n  outline: none;\n  padding: 11px 0 !important;\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\n  width: 100% !important;\n}\n.rbccm-marketo-modal .mktoForm textarea.mktoField {\n  height: auto;\n  min-height: 88px;\n}\n.rbccm-marketo-modal .mktoForm .mktoField::placeholder {\n  color: transparent !important;      /* the label is the visible prompt */\n}\n.rbccm-marketo-modal .mktoForm input.mktoField:not([type=\"checkbox\"]):not([type=\"radio\"]):focus,\n.rbccm-marketo-modal .mktoForm textarea.mktoField:focus,\n.rbccm-marketo-modal .mktoForm select.mktoField:focus {\n  border-bottom-color: var(--Blue-Bright-Blue, #0051A5) !important;\n  box-shadow: 0 1px 0 0 var(--Blue-Bright-Blue, #0051A5) !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoField.mktoInvalid {\n  border-bottom-color: #C8102E !important;\n}\n\n/* ---- Consent checkbox --------------------------------------------------- */\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--checkbox .mktoFieldWrap > .mktoLabel {\n  display: none !important;           /* Marketo's empty outer label (just the asterisk) */\n}\n.rbccm-marketo-modal .mktoForm .mktoCheckboxList,\n.rbccm-marketo-modal .mktoForm .mktoRadioList {\n  align-items: flex-start;\n  display: flex !important;\n  float: none !important;\n  gap: 14px;\n  padding: 0 !important;\n  width: auto !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoCheckboxList > input,\n.rbccm-marketo-modal .mktoForm .mktoRadioList > input {\n  accent-color: var(--Blue-Bright-Blue, #0051A5);\n  flex: 0 0 auto;\n  height: 18px !important;\n  margin: 0.5px 0 0 !important;       /* centred on the first 18.85px line */\n  opacity: 1 !important;\n  padding: 0 !important;\n  width: 18px !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoCheckboxList > label,\n.rbccm-marketo-modal .mktoForm .mktoRadioList > label {\n  color: #494949 !important;\n  display: block !important;\n  float: none !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 13px !important;\n  font-style: normal !important;\n  font-weight: 400 !important;\n  line-height: 18.85px !important;\n  margin: 0 !important;\n  min-height: 0 !important;\n  padding: 0 !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoCheckboxList > label a,\n.rbccm-marketo-modal .mktoForm .mktoHtmlText a {\n  color: #0051A5 !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 13px !important;\n  font-style: normal !important;\n  font-weight: 400 !important;\n  line-height: 15px !important;\n  text-decoration: none !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoCheckboxList > label a:hover,\n.rbccm-marketo-modal .mktoForm .mktoCheckboxList > label a:focus-visible,\n.rbccm-marketo-modal .mktoForm .mktoHtmlText a:hover {\n  text-decoration: underline !important;\n}\n\n/* ---- Errors: inline under the field, not Marketo's tooltip -------------- */\n.rbccm-marketo-modal .mktoForm .mktoError {\n  bottom: auto !important;\n  left: auto !important;\n  margin: 6px 0 0 !important;\n  position: static !important;\n  right: auto !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoErrorArrowWrap {\n  display: none !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoErrorMsg {\n  background: none !important;\n  border: 0 !important;\n  border-radius: 0 !important;\n  box-shadow: none !important;\n  color: #C8102E !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 12px !important;\n  line-height: 1.3 !important;\n  margin: 0 !important;\n  max-width: none !important;\n  padding: 0 !important;\n  text-shadow: none !important;\n}\n\n/* ---- Buttons: submit pill + Cancel -------------------------------------- */\n/* Figma: padding-bottom 3px, items centred, gap 317.328px. That gap is\n   Figma's space-between at the 520px content width (Submit hard left,\n   Cancel hard right), so it is space-between here; a fixed 317px gap\n   would wrap Cancel onto its own line on narrower modals. */\n.rbccm-marketo-modal .mktoForm .mktoButtonRow {\n  align-items: center;\n  display: flex !important;\n  flex-wrap: wrap;\n  gap: 16px;\n  grid-column: 1 / -1;\n  justify-content: space-between;\n  margin-top: 12px;\n  order: 30;\n  padding-bottom: 3px !important;\n}\n/* Form-level custom CSS in Marketo (e.g. form 1574) sets the wrap to\n   width: 100% and adds a FontAwesome arrow on the button's ::after;\n   undone here so Cancel fits beside the button and only our arrow shows. */\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap {\n  display: block !important;\n  margin: 0 !important;\n  width: auto !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoButton::before,\n.rbccm-marketo-modal .mktoForm .mktoButton::after {\n  content: none !important;\n  display: none !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton {\n  align-items: center !important;\n  background: var(--Blue-Bright-Blue, #0051A5) !important;\n  background-image: none !important;\n  border: 0 !important;\n  border-radius: 100px !important;\n  box-shadow: none !important;\n  color: #FFF !important;\n  cursor: pointer;\n  display: inline-flex !important;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 17px !important;\n  font-style: normal !important;\n  font-weight: 500 !important;\n  gap: 14px;\n  height: 45px;\n  justify-content: center !important;\n  letter-spacing: 0 !important;\n  line-height: 20px !important;\n  padding: 14px 35px !important;\n  text-align: center !important;\n  text-shadow: none !important;\n  transition: background-color 0.15s ease;\n  width: auto !important;\n}\n/* Marketo's theme adds a 1px border on :hover / :focus / :active, which\n   widened the pill by 2px and squeezed its content (looked like a\n   shrink). Border stays off in every state. */\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton:hover,\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton:focus,\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton:active {\n  border: 0 !important;\n  box-shadow: none !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton:hover {\n  background: #003168 !important;\n}\n/* Marketo's theme sets outline: none on the focused button, so keyboard\n   users could tab onto Submit with no visible ring; forced back on. */\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton:focus-visible {\n  outline: 2px solid var(--Blue-Bright-Blue, #0051A5) !important;\n  outline-offset: 3px !important;\n}\n.rbccm-marketo-modal .mktoForm .mktoButtonWrap .mktoButton[disabled] {\n  cursor: progress;\n  opacity: 0.7;\n}\n.rbccm-marketo-modal__submit-arrow {\n  display: block;\n  flex-shrink: 0;\n  height: 18px;\n  width: 18px;\n  transition: transform 0.15s ease;\n}\n.rbccm-marketo-modal .mktoForm .mktoButton:hover .rbccm-marketo-modal__submit-arrow {\n  transform: translateX(3px);\n}\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__cancel {\n  background: none;\n  border: 0;\n  color: #494949;\n  cursor: pointer;\n  font-family: Roboto, Arial, sans-serif;\n  font-size: 15px;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 18px;\n  padding: 4px 0;\n  text-align: center;\n  text-decoration-line: underline;\n  text-decoration-skip-ink: auto;\n  text-decoration-style: solid;\n  text-decoration-thickness: auto;\n  text-underline-offset: auto;\n  text-underline-position: from-font;\n}\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__cancel:hover {\n  color: var(--Blue-Bright-Blue, #0051A5);\n}\n.rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__cancel:focus-visible {\n  outline: 2px solid var(--Blue-Bright-Blue, #0051A5);\n  outline-offset: 2px;\n}\n\n/* ---- Thank-you ---------------------------------------------------------- */\n.rbccm-marketo-modal__thanks {\n  text-align: center;\n}\n.rbccm-marketo-modal h2.rbccm-marketo-modal__thanks-heading {\n  color: #002144 !important;\n  font-family: RBCDisplay, \"RBC Display\", Georgia, Times, serif !important;\n  font-size: 32px !important;\n  font-weight: 500 !important;\n  line-height: 1.15 !important;\n  margin: 0 !important;\n  outline: none;\n}\n.rbccm-marketo-modal h2.rbccm-marketo-modal__thanks-heading::after {\n  background: #FFC72C;\n  content: '';\n  display: block;\n  height: 2px;\n  margin: 16px auto 0;\n  width: 45px;\n}\n.rbccm-marketo-modal p.rbccm-marketo-modal__thanks-message {\n  color: #333;\n  font-family: Roboto, Arial, sans-serif !important;\n  font-size: 16px !important;\n  line-height: 1.4 !important;\n  margin: 18px 0 0 !important;\n}\n.rbccm-marketo-modal__thanks-close {\n  background: transparent;\n  border: 1px solid var(--Blue-Bright-Blue, #0051A5);\n  border-radius: 999px;\n  color: var(--Blue-Bright-Blue, #0051A5);\n  cursor: pointer;\n  font-family: Roboto, Arial, sans-serif;\n  font-size: 16px;\n  font-weight: 500;\n  height: 48px;\n  margin-top: 32px;\n  padding: 0 32px;\n  transition: background-color 0.15s ease, color 0.15s ease;\n}\n.rbccm-marketo-modal__thanks-close:hover,\n.rbccm-marketo-modal__thanks-close:focus-visible {\n  background: var(--Blue-Bright-Blue, #0051A5);\n  color: #FFF;\n  outline: none;\n}\n\n/* ---- Mobile ------------------------------------------------------------- */\n@media (max-width: 599px) {\n  /* One column; height follows the content (the stacked form is taller\n     than 563). Header side padding drops so the copy isn't squeezed. */\n  dialog.rbccm-marketo-modal {\n    border-radius: 20px;\n    min-height: 0;\n    padding: 48px 20px 32px;\n  }\n  .rbccm-marketo-modal__header {\n    padding: 27px 0 32px;\n  }\n  .rbccm-marketo-modal h2.rbccm-marketo-modal__heading {\n    font-size: 30px !important;\n    line-height: 32px !important;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  dialog.rbccm-marketo-modal[open],\n  dialog.rbccm-marketo-modal[open]::backdrop {\n    animation: none;\n  }\n  .rbccm-marketo-modal .mktoForm .rbccm-marketo-modal__field--text .mktoLabel,\n  .rbccm-marketo-modal__submit-arrow {\n    transition: none;\n  }\n}\n";
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.innerHTML = "<dialog class=\"rbccm-marketo-modal\" tabindex=\"-1\" id=\"request-demo\" aria-labelledby=\"request-demo-title\" data-form-id=\"1602\" data-base-url=\"//discover.rbccm.com\" data-munchkin=\"577-RQV-784\" data-submit-label=\"Submit\" data-cancel-label=\"Cancel\"><button type=\"button\" class=\"rbccm-marketo-modal__close\" data-rbccm-modal-close=\"\" aria-label=\"Close\"><svg class=\"rbccm-marketo-modal__close-icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M3 3L13 13M13 3L3 13\" stroke=\"currentColor\" stroke-width=\"1.4\"></path></svg></button><div class=\"rbccm-marketo-modal__body\"><div class=\"rbccm-marketo-modal__header\"><h2 class=\"rbccm-marketo-modal__heading\" id=\"request-demo-title\">Talk with an <span class=\"rbccm-marketo-modal__heading-highlight\">expert.</span></h2><p class=\"rbccm-marketo-modal__subheading\">Connect with our product team to arrange a custom demo.</p></div><div class=\"rbccm-marketo-modal__form\"><form id=\"mktoForm_1602\"></form></div><div class=\"rbccm-marketo-modal__thanks\" hidden=\"hidden\"><h2 class=\"rbccm-marketo-modal__thanks-heading\" tabindex=\"-1\">Thanks, {FirstName}.</h2><p class=\"rbccm-marketo-modal__thanks-message\">A member of our product team will be in touch shortly to arrange your demo.</p><button type=\"button\" class=\"rbccm-marketo-modal__thanks-close\" data-rbccm-modal-close=\"\">Close</button></div></div></dialog>";
  document.body.appendChild(wrap.firstElementChild);

  var links = Array.prototype.filter.call(document.querySelectorAll('a'), function (a) {
    return /request (a )?demo/i.test(a.textContent);
  });
  links.forEach(function (a) { a.setAttribute('href', '#request-demo'); });
  console.log('[rbccm-marketo-modal] ' + links.length + ' "Request a demo" link(s) now point to #request-demo', links);
})();

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

console.log('[rbccm-marketo-modal] loaded - click a "Request a demo" button, or run: rbccmOpenDemo()');
window.rbccmOpenDemo = function () {
  var t = document.createElement('a');
  t.href = '#request-demo';
  document.body.appendChild(t);
  t.click();
  t.remove();
};
