/*
 * Metabolic Risk Calculator — behavior for Gravity Form 18 ("Waist To Height Ratio")
 *
 * The form's own conditional logic (field 36: Metric / Imperial) handles all
 * show/hide of the height and waist fields — this script only:
 *  - keeps the .mrc-selected class in sync on the Metric/Imperial pill rows
 *  - toggles .mrc-imperial on #metabolic-risk (styling hook)
 *  - updates the optional unit badge on the waist section header
 *  - wires the scroll-down chevron under the wave
 *
 * Re-init-safe for AJAX embeds (gform/post_render re-renders the form DOM).
 */

(function () {
  "use strict";

  var FORM_ID = 18;
  var UNIT_FIELD = 36;

  function init() {
    var root = document.getElementById("metabolic-risk");
    if (!root) {
      return;
    }

    var form = document.getElementById("gform_" + FORM_ID);
    if (form && form.dataset.mrcInit !== "1") {
      form.dataset.mrcInit = "1";

      var unitRadios = Array.prototype.slice.call(
        form.querySelectorAll(
          "#field_" + FORM_ID + "_" + UNIT_FIELD + " input[type=radio]"
        )
      );

      var sync = function () {
        var imperial = false;
        unitRadios.forEach(function (input) {
          var choice = input.closest(".gchoice");
          if (choice) {
            choice.classList.toggle("mrc-selected", input.checked);
          }
          if (input.checked && /^imperial/i.test(input.value)) {
            imperial = true;
          }
        });
        root.classList.toggle("mrc-imperial", imperial);

        var badge = root.querySelector(".mrc-unit-badge");
        if (badge) {
          badge.textContent = imperial ? "in" : "cm";
        }
      };

      unitRadios.forEach(function (input) {
        input.addEventListener("change", sync);
      });
      sync();
    }

    var scrollBtn = root.querySelector(".mrc-scroll-btn");
    if (scrollBtn && scrollBtn.dataset.mrcInit !== "1") {
      scrollBtn.dataset.mrcInit = "1";
      scrollBtn.addEventListener("click", function () {
        var next = root.nextElementSibling;
        var top = next
          ? next.getBoundingClientRect().top + window.pageYOffset
          : root.getBoundingClientRect().bottom + window.pageYOffset;
        window.scrollTo({ top: top - 20, behavior: "smooth" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Gravity Forms 2.9+ re-render hook (AJAX embeds, validation reloads).
  document.addEventListener("gform/post_render", init);
  // Older GF jQuery event, if jQuery is present.
  if (window.jQuery) {
    window.jQuery(document).on("gform_post_render", init);
  }
})();
