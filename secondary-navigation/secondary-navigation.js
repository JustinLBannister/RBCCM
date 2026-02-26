document.addEventListener("DOMContentLoaded", function () {
  // Set aria-current="page" on matching h1 title
  const pageTitle = document.querySelector("h1");
  const links = document.querySelectorAll(".secondary-nav__item a");

  if (pageTitle) {
    const titleText = pageTitle.textContent.trim().toLowerCase();

    links.forEach((link) => {
      const linkText = link.textContent.trim().toLowerCase();
      if (linkText === titleText) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  const wrapper = document.querySelector(".secondary-nav__wrapper");
  const list = document.querySelector(".secondary-nav__list");
  const fill = document.querySelector(".secondary-nav__progress-fill");

  if (!wrapper || !list || !fill) return;

  function updateProgressBar() {
    const scrollLeft = wrapper.scrollLeft;
    const maxScroll = list.scrollWidth - wrapper.clientWidth;
    const percent = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    fill.style.width = `${percent}%`;
  }

  function centerItem(el) {
    const itemCenter = el.offsetLeft + el.offsetWidth / 2;
    const wrapperCenter = wrapper.clientWidth / 2;
    wrapper.scrollLeft = itemCenter - wrapperCenter;
  }

  function leftAlignItem(el) {
    const targetScrollLeft = el.offsetLeft;
    const maxScroll = list.scrollWidth - wrapper.clientWidth;

    // If we can left-align (item isn't too far right), do it
    if (targetScrollLeft <= maxScroll) {
      wrapper.scrollLeft = targetScrollLeft;
    } else {
      // Otherwise, center the item
      centerItem(el);
    }
  }

  wrapper.addEventListener("scroll", updateProgressBar);
  updateProgressBar();
  fill.style.display =
    list.scrollWidth <= wrapper.clientWidth ? "none" : "block";

  // Add window resize event to update progress bar and reposition scroll
  window.addEventListener("resize", () => {
    updateProgressBar();
    fill.style.display =
      list.scrollWidth <= wrapper.clientWidth ? "none" : "block";

    // Reposition active item on resize
    const currentItem = wrapper.querySelector('a[aria-current="page"]');
    if (currentItem) {
      const parentLi = currentItem.closest(".secondary-nav__item");
      if (parentLi) {
        leftAlignItem(parentLi);
        updateProgressBar();
      }
    }
  });

  // Scroll to current item on load (left-aligned when possible)
  const currentItem = wrapper.querySelector('a[aria-current="page"]');
  if (currentItem) {
    const parentLi = currentItem.closest(".secondary-nav__item");
    if (parentLi) {
      leftAlignItem(parentLi);
      updateProgressBar();
    }
  }
});
