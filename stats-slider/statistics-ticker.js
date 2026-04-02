/* =============================================================
   RBC CM — Stats Ticker Component
   stats-ticker.js
   No dependencies. Scoped IIFE — safe to include globally.
   ============================================================= */

(function () {

  function initStatsTicker() {
    var grid        = document.querySelector('.rbccm-stats__grid');
    var progressBar = document.querySelector('.rbccm-stats__progress-bar');
    if (!grid) return;

    var items = Array.from(grid.querySelectorAll('.rbccm-stats__item'));

    // Clone items twice for seamless infinite loop
    for (var i = 0; i < 2; i++) {
      items.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        grid.appendChild(clone);
      });
    }

    // Measure one full set width after cloning
    var setWidth = 0;
    items.forEach(function (item) { setWidth += item.offsetWidth; });

    var isPlaying             = true;
    var wasPlayingBeforeHover = true;
    var scrollPos             = 0;
    var animationId           = null;
    var speed                 = 0.5;

    var isDragging      = false;
    var dragStartX      = 0;
    var dragStartScroll = 0;

    var currentBarWidth = 25;
    var currentBarLeft  = 0;

    // ── Progress bar ──────────────────────────────────────────
    function updateProgressBar() {
      if (!progressBar) return;
      var progress   = (scrollPos % setWidth) / setWidth;
      var targetLeft = progress * (100 - 25);

      if (targetLeft < currentBarLeft - 30) {
        elasticReset();
        return;
      }

      currentBarWidth = 25;
      currentBarLeft  = targetLeft;
      progressBar.style.width = currentBarWidth + '%';
      progressBar.style.left  = currentBarLeft  + '%';
    }

    function elasticReset() {
      if (!progressBar) return;
      progressBar.style.transition = 'width 0.3s ease-in, left 0.3s ease-in';
      progressBar.style.left  = '100%';
      progressBar.style.width = '0%';

      setTimeout(function () {
        progressBar.style.transition = 'none';
        progressBar.style.left  = '0%';
        progressBar.style.width = '0%';

        requestAnimationFrame(function () {
          progressBar.style.transition = 'width 0.3s ease-out';
          progressBar.style.width = '25%';
          currentBarLeft  = 0;
          currentBarWidth = 25;
          setTimeout(function () { progressBar.style.transition = ''; }, 300);
        });
      }, 300);
    }

    // ── Animation tick ────────────────────────────────────────
    function tick() {
      if (!isPlaying || isDragging) return;
      scrollPos += speed;
      if (scrollPos >= setWidth) scrollPos -= setWidth;
      grid.scrollLeft = scrollPos;
      updateProgressBar();
      animationId = requestAnimationFrame(tick);
    }

    // ── Pause / play button ───────────────────────────────────
    var SVG_PAUSE = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">'
      + '<circle cx="16" cy="16" r="15.5" fill="white" fill-opacity="0.38" stroke="white"/>'
      + '<rect x="12" y="10" width="2.66667" height="12" rx="1" fill="white"/>'
      + '<rect x="17.3335" y="10" width="2.66667" height="12" rx="1" fill="white"/>'
      + '</svg>';

    var SVG_PLAY = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">'
      + '<circle cx="16" cy="16" r="15.5" fill="white" fill-opacity="0.38" stroke="white"/>'
      + '<polygon points="13,10 22,16 13,22" fill="white"/>'
      + '</svg>';

    var playBtn       = document.createElement('button');
    playBtn.className = 'rbccm-stats__ticker-btn';
    playBtn.setAttribute('aria-label', 'Pause ticker');
    playBtn.innerHTML = SVG_PAUSE;
    document.querySelector('.rbccm-stats').appendChild(playBtn);

    function play() {
      isPlaying = true;
      playBtn.setAttribute('aria-label', 'Pause ticker');
      playBtn.innerHTML = SVG_PAUSE;
      tick();
    }

    function pause() {
      isPlaying = false;
      if (animationId) cancelAnimationFrame(animationId);
      playBtn.setAttribute('aria-label', 'Play ticker');
      playBtn.innerHTML = SVG_PLAY;
    }

    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isPlaying) { wasPlayingBeforeHover = false; pause(); }
      else           { wasPlayingBeforeHover = true;  play();  }
    });

    // ── Hover: pause on enter, resume on leave ────────────────
    grid.addEventListener('mouseenter', function () {
      wasPlayingBeforeHover = isPlaying;
      if (isPlaying) pause();
      grid.style.cursor = 'grab';
    });

    grid.addEventListener('mouseleave', function () {
      if (isDragging) isDragging = false;
      if (wasPlayingBeforeHover) play();
    });

    // ── Mouse drag ────────────────────────────────────────────
    grid.addEventListener('mousedown', function (e) {
      isDragging      = true;
      dragStartX      = e.pageX;
      dragStartScroll = scrollPos;
      grid.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = dragStartX - e.pageX;
      scrollPos = dragStartScroll + dx;
      while (scrollPos < 0)        scrollPos += setWidth;
      while (scrollPos >= setWidth) scrollPos -= setWidth;
      grid.scrollLeft = scrollPos;
      updateProgressBar();
    });

    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging        = false;
      grid.style.cursor = 'grab';
    });

    // ── Touch drag ────────────────────────────────────────────
    var touchStartX      = 0;
    var touchStartScroll = 0;

    grid.addEventListener('touchstart', function (e) {
      wasPlayingBeforeHover = isPlaying;
      if (isPlaying) pause();
      touchStartX      = e.touches[0].pageX;
      touchStartScroll = scrollPos;
    }, { passive: true });

    grid.addEventListener('touchmove', function (e) {
      var dx = touchStartX - e.touches[0].pageX;
      scrollPos = touchStartScroll + dx;
      while (scrollPos < 0)        scrollPos += setWidth;
      while (scrollPos >= setWidth) scrollPos -= setWidth;
      grid.scrollLeft = scrollPos;
      updateProgressBar();
    }, { passive: true });

    grid.addEventListener('touchend', function () {
      if (wasPlayingBeforeHover) play();
    });

    // ── Disable native scroll (we control it via rAF) ─────────
    grid.style.overflowX = 'hidden';

    // ── Go ────────────────────────────────────────────────────
    play();
  }

  // Init on DOMContentLoaded or immediately if already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatsTicker);
  } else {
    initStatsTicker();
  }

})();
