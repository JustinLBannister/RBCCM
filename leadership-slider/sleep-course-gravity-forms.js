(function () {
  var formIds = ["16", "17"];
  var queued = false;
  var courseMeta = {
    "16": {
      title: "SELF-GUIDED COURSE",
      description: "Move at your own pace with structured modules you can revisit anytime."
    },
    "17": {
      title: "EMAIL COURSE",
      description: "Receive guidance weekly with a clear structure and ongoing support."
    }
  };

  function ensureHeading(wrapper, formId) {
    var meta = courseMeta[formId];

    if (!meta) {
      return;
    }

    var heading = wrapper.querySelector(".gform_heading");
    var form = wrapper.querySelector("form");

    if (!heading) {
      heading = document.createElement("div");
      heading.className = "gform_heading";

      if (form) {
        wrapper.insertBefore(heading, form);
      } else {
        wrapper.insertBefore(heading, wrapper.firstChild);
      }
    }

    var title = heading.querySelector(".gform_title");
    var description = heading.querySelector(".gform_description");

    if (!title) {
      title = document.createElement("h2");
      title.className = "gform_title";
      heading.insertBefore(title, heading.firstChild);
    }

    if (!description) {
      description = document.createElement("p");
      description.className = "gform_description";
      heading.appendChild(description);
    }

    title.textContent = meta.title;
    description.textContent = meta.description;
  }

  function updateChoiceStates(group) {
    group.querySelectorAll(".gchoice").forEach(function (choice) {
      var input = choice.querySelector(".gfield-choice-input");

      choice.classList.toggle("sleep-course-choice-selected", Boolean(input && input.checked));
    });
  }

  function enhanceSleepCourseForms() {
    formIds.forEach(function (formId) {
      var wrapper = document.getElementById("gform_wrapper_" + formId);

      if (!wrapper) {
        return;
      }

      wrapper.classList.add("sleep-course-card-form");
      ensureHeading(wrapper, formId);

      wrapper.querySelectorAll(".gchoice").forEach(function (choice) {
        var input = choice.querySelector(".gfield-choice-input");
        var label = choice.querySelector(".gform-field-label--type-inline");

        if (!input || !label) {
          return;
        }

        if (!label.querySelector(".sleep-course-choice-value")) {
          var value = document.createElement("span");
          value.className = "sleep-course-choice-value";
          value.textContent = input.value;
          label.appendChild(value);
        }

        if (!choice.dataset.sleepCourseChoiceReady) {
          choice.dataset.sleepCourseChoiceReady = "true";

          choice.addEventListener("click", function () {
            if (!input.checked) {
              input.checked = true;
              input.dispatchEvent(new Event("change", { bubbles: true }));
            }

            var group = choice.closest(".gfield_radio");

            if (group) {
              updateChoiceStates(group);
            }
          });

          input.addEventListener("change", function () {
            var group = choice.closest(".gfield_radio");

            if (group) {
              updateChoiceStates(group);
            }
          });
        }
      });

      wrapper.querySelectorAll(".gfield_radio").forEach(function (group) {
        var checkedInput = group.querySelector(".gfield-choice-input:checked");
        var firstInput = group.querySelector(".gfield-choice-input");

        if (!checkedInput && firstInput) {
          firstInput.checked = true;
          firstInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        updateChoiceStates(group);
      });

      var submit = wrapper.querySelector('.gform_button[type="submit"]');

      if (submit && submit.value.toUpperCase() === "SELECT") {
        submit.value = "Select";
      }
    });
  }

  function queueEnhancement() {
    if (queued) {
      return;
    }

    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      enhanceSleepCourseForms();
    });
  }

  function initObserver() {
    if (!document.body) {
      return;
    }

    var observer = new MutationObserver(queueEnhancement);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      enhanceSleepCourseForms();
      initObserver();
    });
  } else {
    enhanceSleepCourseForms();
    initObserver();
  }

  document.addEventListener("gform/postRender", queueEnhancement);

  if (window.jQuery) {
    window.jQuery(document).on("gform_post_render gform_page_loaded", function () {
      queueEnhancement();
    });
  }
})();
