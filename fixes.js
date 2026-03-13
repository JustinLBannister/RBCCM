Key design decisions:

Uses a delegated listener on the parent ul so it covers all nested dropdown-menu LIs too (the sub-nav items under each primary nav item) — no need to attach individual listeners
Uses useCapture: true so it fires before any existing click handlers on the nav items
Calls closeBtn.click() rather than directly manipulating classes, so it respects whatever existing logic (ARIA attributes, animations, etc.) the close button already handles
The isSearchOpen() guard means it's a no-op when the search isn't open, so it won't interfere with normal nav behavior

Find this existing block (the .close click handler, which is right after the search toggle logic):

$('.close').click(function () {
    $('.search-box').removeClass('on').addClass('invisible');
    $('.search-toggle').focus().attr('aria-expanded', 'false');
});

Add this fix immediately after it:

$('.close').click(function () {
    $('.search-box').removeClass('on').addClass('invisible');
    $('.search-toggle').focus().attr('aria-expanded', 'false');
});
// Fix: Close search bar when any primary nav UL/LI is clicked
(function() {
    var primaryNavUl = Array.from(document.querySelectorAll('nav ul')).find(function(ul) {
        return Array.from(ul.children)
            .filter(function(c) { return c.tagName === 'LI'; })
            .some(function(li) { return li.textContent.trim().startsWith('Client Solutions'); });
    });
    var searchModal = document.getElementById('openSearchModal');
    var closeBtn = searchModal ? searchModal.querySelector('button.close') : null;
    if (!primaryNavUl || !searchModal || !closeBtn) return;
    primaryNavUl.addEventListener('click', function() {
        if (searchModal.classList.contains('on')) {
            closeBtn.click();
        }
    }, true);
})();

/* BEFORE */
footer .heading, footer .sitemap .heading, footer .sitemap .heading a {
    text-decoration: underline;
}
/* AFTER */
footer .sitemap .heading a {
    text-decoration: underline;
}

(function() {
  var carousel = document.getElementById('team-profiles-carousel');
  if (!carousel) return;
  var $carousel = $('#team-profiles-carousel');
  var prevBtn = carousel.querySelector('.owl-prev');
  var nextBtn = carousel.querySelector('.owl-next');
  var slideLock = false;
  var SLIDE_SPEED = 350;
  // 1. Ensure prev/next are in the tab order
  prevBtn.setAttribute('tabindex', '0');
  nextBtn.setAttribute('tabindex', '0');
  // 2. Remove cloned items from tab order (they're duplicates for infinite loop)
  carousel.querySelectorAll('.owl-item.cloned a, .owl-item.cloned button').forEach(function(el) {
    el.setAttribute('tabindex', '-1');
  });
  // 3. Show prev/next buttons when focus is anywhere inside the carousel
  carousel.addEventListener('focusin', function() {
    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
  });
  // 4. Hide them when focus leaves the carousel
  carousel.addEventListener('focusout', function() {
    setTimeout(function() {
      if (!carousel.contains(document.activeElement)) {
        prevBtn.style.opacity = '';
        nextBtn.style.opacity = '';
      }
    }, 0);
  });
  // 5. Slide carousel when tabbing into an off-canvas card
  carousel.addEventListener('focusin', function(e) {
    var item = e.target.closest('.owl-item');
    if (!item || item.classList.contains('cloned') || item.classList.contains('active')) return;
    if (slideLock) return;
    var allItems = Array.from(carousel.querySelectorAll('.owl-item'));
    var itemIndex = allItems.indexOf(item);
    var activeIndexes = allItems
      .map(function(it, i) { return it.classList.contains('active') ? i : -1; })
      .filter(function(i) { return i > -1; });
    if (itemIndex > Math.max.apply(null, activeIndexes)) {
      slideLock = true;
      $carousel.trigger('next.owl.carousel');
      setTimeout(function() { slideLock = false; }, SLIDE_SPEED);
    } else if (itemIndex < Math.min.apply(null, activeIndexes)) {
      slideLock = true;
      $carousel.trigger('prev.owl.carousel');
      setTimeout(function() { slideLock = false; }, SLIDE_SPEED);
    }
  }, true);
})();