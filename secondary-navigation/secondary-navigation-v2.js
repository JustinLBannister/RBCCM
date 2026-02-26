document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".secondary-nav--sections");
  if (!nav) return;

  const wrapper = nav.querySelector(".secondary-nav__wrapper");
  const list = nav.querySelector(".secondary-nav__list");
  const fill = nav.querySelector(".secondary-nav__progress-fill");
  const progressBar = nav.querySelector(".secondary-nav__progress-bar");
  const links = nav.querySelectorAll(".secondary-nav__item a");

  // ── Configurable sticky offset (from data attribute or default 60) ──
  const stickyOffset = parseInt(nav.getAttribute("data-sticky-offset"), 10) || 60;

  // ── Active state detection ──
  function setActiveItem() {
    const hash = window.location.hash;

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (hash && href === hash) {
        link.setAttribute("aria-current", "page");
      }
    });

    // Fallback: match by h1 text
    const hasActive = nav.querySelector('a[aria-current="page"]');
    if (!hasActive) {
      const pageTitle = document.querySelector("h1");
      if (pageTitle) {
        const titleText = pageTitle.textContent.trim().toLowerCase();
        links.forEach((link) => {
          const linkText = link.textContent.trim().toLowerCase();
          if (linkText === titleText) {
            link.setAttribute("aria-current", "page");
          }
        });
      }
    }
  }

  setActiveItem();

  // ── Progress bar — tracks vertical page scroll through sections ──
  // Uses document scroll position rather than section element heights,
  // so it works with <span> anchors, <div> wrappers, or full <section> blocks
  function updateProgressBar() {
    if (!fill) return;

    if (!sections || !sections.length) {
      fill.style.width = "0%";
      return;
    }

    const triggerPoint = stickyOffset + nav.offsetHeight + 10;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Document-relative position of first anchor
    const firstDocTop = sections[0].getBoundingClientRect().top + scrollTop;

    // Scroll position where progress starts (first anchor reaches trigger)
    const startScroll = firstDocTop - triggerPoint;

    // End of scrollable content
    const endScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Total range and current progress
    const totalRange = endScroll - startScroll;
    const scrolled = scrollTop - startScroll;

    let percent = 0;
    if (totalRange > 0) {
      percent = Math.max(0, Math.min(100, (scrolled / totalRange) * 100));
    }

    fill.style.width = percent + "%";
  }

  // Reference sections early so updateProgressBar can use them
  let sections = [];

  // ── Scroll positioning ──
  function centerItem(el) {
    const itemCenter = el.offsetLeft + el.offsetWidth / 2;
    const wrapperCenter = wrapper.clientWidth / 2;
    wrapper.scrollLeft = itemCenter - wrapperCenter;
  }

  function leftAlignItem(el) {
    const targetScrollLeft = el.offsetLeft;
    const maxScroll = list.scrollWidth - wrapper.clientWidth;

    if (targetScrollLeft <= maxScroll) {
      wrapper.scrollLeft = targetScrollLeft;
    } else {
      centerItem(el);
    }
  }

  // ── Dynamic layout evaluation ──
  // Two-pass measurement: checks desktop padding first, then re-checks at mobile padding
  function evaluateLayout() {
    // Clear any inline styles so CSS rules take over
    if (progressBar) progressBar.style.display = "";

    // Pass 1: Remove overflow, measure at desktop padding
    nav.classList.remove("is-overflowing");
    void list.offsetWidth; // Force reflow

    const desktopItemsWidth = list.scrollWidth;
    const desktopAvailable = wrapper.clientWidth;

    if (desktopItemsWidth <= desktopAvailable) {
      // Items fit at desktop padding — centered mode, done
      wrapper.scrollLeft = 0;
      return;
    }

    // Items overflow at desktop padding — switch to mobile layout
    nav.classList.add("is-overflowing");
    void list.offsetWidth; // Force reflow with mobile padding applied

    // Pass 2: Re-measure at mobile padding
    const mobileItemsWidth = list.scrollWidth;
    const mobileAvailable = wrapper.clientWidth;

    if (mobileItemsWidth > mobileAvailable) {
      // Still overflows at mobile padding — enable horizontal scroll
      // Left-align active item into view
      const active = nav.querySelector('a[aria-current="page"]');
      if (active) {
        const parentLi = active.closest(".secondary-nav__item");
        if (parentLi) {
          leftAlignItem(parentLi);
        }
      }
    } else {
      // Fits at mobile padding — keep compact layout, no dead scroll space
      wrapper.scrollLeft = 0;
    }
  }

  // ── Init ──
  evaluateLayout();

  // ── Resize handler ──
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      evaluateLayout();
    }, 50);
  });

  // ── Hash change support (for anchor-based navigation) ──
  window.addEventListener("hashchange", () => {
    // Clear old active states
    links.forEach((link) => link.removeAttribute("aria-current"));

    // Set new active
    setActiveItem();

    // Re-evaluate and scroll to newly active item
    evaluateLayout();
  });

  // ── Scroll-based active section detection ──
  // Updates active nav item based on which section is in view
  const sectionIds = Array.from(links).map((link) =>
    link.getAttribute("href").replace("#", "")
  );
  sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sections.length) {
    let scrollTicking = false;

    window.addEventListener("scroll", () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          // Detect if nav is stuck at its sticky position
          const navTop = nav.getBoundingClientRect().top;
          if (navTop <= stickyOffset + 1) {
            nav.classList.add("is-sticky");
          } else {
            nav.classList.remove("is-sticky");
          }

          // Update progress bar based on vertical scroll through sections
          updateProgressBar();

          // Offset = sticky header + secondary nav height
          const offset = stickyOffset + nav.offsetHeight + 10;
          let currentSection = null;

          sections.forEach((section) => {
            const top = section.getBoundingClientRect().top;
            if (top <= offset) {
              currentSection = section;
            }
          });

          if (currentSection) {
            const currentId = currentSection.id;
            const currentHref = "#" + currentId;
            const alreadyActive = nav.querySelector(
              'a[aria-current="page"][href="' + currentHref + '"]'
            );

            if (!alreadyActive) {
              // Clear all active states
              links.forEach((link) => link.removeAttribute("aria-current"));

              // Set new active
              const matchingLink = nav.querySelector(
                'a[href="' + currentHref + '"]'
              );
              if (matchingLink) {
                matchingLink.setAttribute("aria-current", "page");

                // Scroll nav to active item if overflowing
                if (nav.classList.contains("is-overflowing")) {
                  const parentLi = matchingLink.closest(".secondary-nav__item");
                  if (parentLi) {
                    leftAlignItem(parentLi);
                    updateProgressBar();
                  }
                }
              }
            }
          }

          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });
  }
});
