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

// Fix: Close search bar when any nav UL/LI is clicked
(function() {
  var searchModal = document.getElementById('openSearchModal');
  var closeBtn = searchModal ? searchModal.querySelector('button.close') : null;
  if (!searchModal || !closeBtn) return;
  document.querySelectorAll('nav ul').forEach(function(ul) {
    ul.addEventListener('click', function() {
      if (searchModal.classList.contains('on')) {
        closeBtn.click();
      }
    }, true);
  });
})();

(function() {
  var carousel = document.getElementById('team-profiles-carousel');
  if (!carousel) return;
  var $carousel = $('#team-profiles-carousel');
  var prevBtn  = carousel.querySelector('.owl-prev');
  var nextBtn  = carousel.querySelector('.owl-next');
  var slideLock = false;
  var SLIDE_SPEED = 350;
  // The real prev/next buttons are positioned off-screen (left:-120px / right:-120px)
  // which causes page scroll when natively focused. Instead we create visually-hidden
  // proxy buttons INSIDE the carousel track (always in-viewport) that delegate to them.
  // The real buttons are untouched for normal mouse interaction.
  var proxyStyle = [
    'position:absolute',
    'width:1px',
    'height:1px',
    'overflow:hidden',
    'clip:rect(0,0,0,0)',
    'white-space:nowrap',
    'border:0',
    'padding:0',
    'background:transparent'
  ].join(';');
  var proxyPrev = document.createElement('button');
  proxyPrev.setAttribute('type', 'button');
  proxyPrev.setAttribute('aria-label', 'Previous Slide');
  proxyPrev.setAttribute('style', proxyStyle);
  var proxyNext = document.createElement('button');
  proxyNext.setAttribute('type', 'button');
  proxyNext.setAttribute('aria-label', 'Next Slide');
  proxyNext.setAttribute('style', proxyStyle);
  // Place proxies inside owl-nav so they're always within the viewport
  var owlNav = carousel.querySelector('.owl-nav');
  owlNav.insertBefore(proxyPrev, prevBtn);
  owlNav.appendChild(proxyNext);
  // Proxy delegates to the real button clicks (preserves all existing mouse handlers)
  proxyPrev.addEventListener('click', function() { prevBtn.click(); });
  proxyNext.addEventListener('click', function() { nextBtn.click(); });
  proxyPrev.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prevBtn.click(); }
  });
  proxyNext.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextBtn.click(); }
  });
  // Show real buttons when focus is anywhere inside carousel (visual affordance)
  carousel.addEventListener('focusin', function() {
    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
  });
  carousel.addEventListener('focusout', function() {
    setTimeout(function() {
      if (!carousel.contains(document.activeElement)) {
        prevBtn.style.opacity = '';
        nextBtn.style.opacity = '';
      }
    }, 0);
  });
  // Slide carousel when tabbing into an off-canvas real card
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
  // Tab boundary: intercept Tab at last real card so focus skips clones
  // and lands on proxyPrev (which is in-viewport, no scroll side-effect)
  carousel.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var realItems = Array.from(carousel.querySelectorAll('.owl-item:not(.cloned)'));
    var firstFocusable = realItems[0].querySelector('a, button');
    var lastFocusable  = realItems[realItems.length - 1].querySelector('a, button');
    // Forward Tab from last real card → proxyPrev
    if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      proxyPrev.focus();
    }
    // Shift+Tab from first real card → proxyNext
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      proxyNext.focus();
    }
    // Shift+Tab from proxyPrev → back to last real card
    if (e.shiftKey && document.activeElement === proxyPrev) {
      e.preventDefault();
      lastFocusable.focus();
    }
  }, true);
})();