// Universal podcast/hero handler - detects page type and runs appropriate script
(function () {
  console.log('Universal podcast handler initializing...');

  // Detect current page language (EN or FR)
  function detectLanguage() {
    // Check URL for /fr/ or /en/
    if (window.location.href.includes('/fr/')) {
      return 'fr';
    }
    if (window.location.href.includes('/en/')) {
      return 'en';
    }
    // Fallback to HTML lang attribute
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang && htmlLang.startsWith('fr')) {
      return 'fr';
    }
    return 'en'; // Default to English
  }

  // Language-specific aria-labels and alt text
  const lang = detectLanguage();
  const labels = {
    en: {
      player: 'Player',
      closePlayer: 'Close Player',
      closeAlt: 'Close',
    },
    fr: {
      player: 'Lecteur',
      closePlayer: 'Fermer le lecteur',
      closeAlt: 'Fermer',
    },
  };
  const currentLabels = labels[lang] || labels.en;

  // Wait until body exists because some pages inject markup late.
  function waitForDOM(callback) {
    if (document.body) {
      callback();
    } else {
      setTimeout(() => waitForDOM(callback), 100);
    }
  }

  // =========================================================================
  // PAGE TYPE 1: Pages with Captivate iframes in story listings
  // (e.g. Strategic Alternatives, Climate)
  // =========================================================================
  function initCaptivateOverlay() {
    console.log('Captivate overlay page detected');

    function focusElement(el) {
      if (!el || typeof el.focus !== 'function') return;
      try {
        el.focus({ preventScroll: true });
      } catch (err) {
        el.focus();
      }
    }

    // Mobile browsers can ignore immediate focus after display changes,
    // so retry across a few paint cycles.
    function focusCloseButtonWhenReady(overlay) {
      if (!overlay) return;

      const tryFocus = () => {
        const closeBtn = overlay.querySelector('.close-btn');
        if (!closeBtn) return;
        if (overlay.style.display === 'none') return;
        focusElement(closeBtn);
      };

      tryFocus();
      setTimeout(tryFocus, 50);
      setTimeout(tryFocus, 150);
      setTimeout(tryFocus, 300);
    }

    // Try multiple known selectors; return the first valid Captivate iframe URL.
    function getFirstEpisodeUrl() {
      const selectors = [
        '.insights-stories.initial .story-podcast-playing iframe[src*="captivate.fm"]',
        '.insights-stories .story-podcast-playing iframe[src*="captivate.fm"]',
        '.story-podcast-playing iframe[src*="captivate.fm"]',
      ];

      for (let i = 0; i < selectors.length; i++) {
        const iframe = document.querySelector(selectors[i]);
        if (iframe && iframe.src) {
          console.log(
            'Found episode URL via selector ' + (i + 1) + ':',
            iframe.src
          );
          return iframe.src;
        }
      }
      return null;
    }

    function createPodcastOverlay(episodeUrl) {
      // Re-create overlay from scratch to avoid stale iframe/playback state.
      const existing = document.getElementById('custom-podcast-overlay');
      if (existing) existing.remove();

      const wrapper = document.createElement('div');
      wrapper.setAttribute('aria-label', currentLabels.player);
      wrapper.id = 'custom-podcast-overlay';
      wrapper.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                z-index: 99999;
                display: none;
                text-decoration: none;
            `;

      const overlay = document.createElement('div');
      overlay.className = 'story-podcast-playing';
      overlay.style.cssText = `
                background-color: rgb(244, 244, 244);
                box-shadow: rgba(0, 0, 0, 0.1) 0px -2px 10px;
                padding: 0;
            `;

      const closeButton = document.createElement('button');
      closeButton.setAttribute('aria-label', currentLabels.closePlayer);
      closeButton.className = 'btn-close-player close-btn';

      const closeImg = document.createElement('img');
      closeImg.src = '/assets/rbccm/images/campaign/player-x.svg';
      closeImg.alt = currentLabels.closeAlt;
      closeButton.appendChild(closeImg);

      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '200';
      iframe.scrolling = 'no';
      iframe.frameBorder = 'no';
      iframe.allow = 'autoplay';
      iframe.src = episodeUrl;

      // Close hides the panel and resets iframe src to stop active playback.
      closeButton.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        wrapper.style.display = 'none';
        iframe.src = '';
        const triggerButton = wrapper.__triggerButton;
        if (triggerButton && typeof triggerButton.focus === 'function') {
          triggerButton.focus();
        }
        setTimeout(() => {
          iframe.src = episodeUrl;
        }, 100);
      };

      overlay.appendChild(closeButton);
      overlay.appendChild(iframe);
      wrapper.appendChild(overlay);

      const trigger = document.getElementById('podcast-trigger');
      if (trigger && trigger.parentNode) {
        // Insert overlay after the trigger, or after the link around it,
        // so the player never ends up inside a link.
        const anchor = trigger.closest('a');
        (anchor || trigger).insertAdjacentElement('afterend', wrapper);
        console.log(
          'Podcast overlay created after #podcast-trigger with episode:',
          episodeUrl
        );
        return wrapper;
      } else {
        document.body.appendChild(wrapper);
        console.log('Podcast overlay created with episode:', episodeUrl);
        return wrapper;
      }

      return null;
    }

    function hideOriginalPlayer() {
      // Defensive hide of native player containers so only custom overlay is visible.
      const originalWrapper = document.querySelector('.podcast-player-wrapper');
      if (originalWrapper) {
        originalWrapper.style.display = 'none';
      }
      const originalContainer = document.getElementById(
        'podcast-player-container'
      );
      if (originalContainer) {
        originalContainer.style.display = 'none';
      }
    }

    function setupButton(episodeUrl) {
      // Hero trigger used to open custom overlay.
      const button = document.querySelector('.hero-cta .btn-play-audio');
      if (!button) {
        console.log('Hero button not found yet');
        return false;
      }

      console.log('Found hero button:', button);

      // Clone removes previously attached listeners and conflicting attributes.
      const newButton = button.cloneNode(true);
      newButton.removeAttribute('aria-controls');
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('Hero play button clicked - showing overlay');

        hideOriginalPlayer();

        if (!document.getElementById('custom-podcast-overlay')) {
          // Use pre-resolved URL when available; otherwise resolve on demand.
          const url = episodeUrl || getFirstEpisodeUrl();
          if (url) {
            createPodcastOverlay(url);
          } else {
            console.error('No episode found');
            return;
          }
        }

        const overlay = document.getElementById('custom-podcast-overlay');
        if (overlay) {
          // Keep track of the opener so focus can be restored on close.
          overlay.__triggerButton = newButton;
          overlay.style.display = 'block';
          // Shift focus into the opened player for keyboard/screen-reader users.
          focusCloseButtonWhenReady(overlay);
        }

        // Re-hide native player after click in case page scripts toggle it back.
        setTimeout(hideOriginalPlayer, 100);
        setTimeout(hideOriginalPlayer, 300);
        setTimeout(hideOriginalPlayer, 500);

        return false;
      });

      console.log('Hero button handler attached');
      return true;
    }

    // First story tile's article page (the newest episode). Some pages
    // still have the raw TeamSite path in the tile link, so tidy it to the
    // public URL (/en/insights/templatedata/article/story/data/2026/09/x
    // becomes /en/insights/2026/09/x).
    function getFirstStoryLink() {
      const tile =
        document.querySelector('.insights-stories.initial a.tile--news[href]') ||
        document.querySelector('.insights-stories a.tile--news[href]');
      if (!tile) return null;
      return tile
        .getAttribute('href')
        .replace('/templatedata/article/story/data/', '/');
    }

    // Point the hero link at the first story tile, so the banner never
    // links to an empty, placeholder or out-of-date URL. Works with the
    // old markup (a.generic-link around the button) and with the trigger
    // itself being the link.
    function updateHeroHref() {
      const trigger = document.getElementById('podcast-trigger');
      const link =
        (trigger && trigger.closest('a')) ||
        document.querySelector('.hero-cta .generic-link');
      if (!link) return true; // plain button, nothing to update
      const storyLink = getFirstStoryLink();
      if (!storyLink) return false;
      link.setAttribute('href', storyLink);
      console.log('Hero link set to first story tile:', storyLink);
      return true;
    }

    const episodeUrl = getFirstEpisodeUrl();
    if (episodeUrl) {
      createPodcastOverlay(episodeUrl);
    }

    let hrefAttempts = 0;
    function tryUpdateHref() {
      if (!updateHeroHref() && hrefAttempts < 20) {
        hrefAttempts++;
        setTimeout(tryUpdateHref, 500);
      }
    }
    tryUpdateHref();

    let attempts = 0;
    // Retry until hero button is rendered (async CMS fragments).
    function trySetup() {
      if (setupButton(episodeUrl)) {
        console.log('Captivate overlay player ready!');
      } else if (attempts < 20) {
        attempts++;
        console.log(`Button setup attempt ${attempts}/20, retrying...`);
        setTimeout(trySetup, 500);
      } else {
        console.error('Could not find hero button after 20 attempts');
      }
    }
    trySetup();
  }

  // =========================================================================
  // PAGE TYPE 2: Pages with article cards and generic hero link
  // (e.g. Biopharma)
  // =========================================================================
  function initHeroLinkUpdater() {
    console.log('Article card page detected');

    // Use first card as canonical destination for hero CTA.
    function getFirstCardLink() {
      const firstTile = document.querySelector(
        '#content .tile--campaign-story'
      );
      if (!firstTile) {
        console.warn('No episode card found in #content');
        return null;
      }

      const articleLink = firstTile.querySelector('h3 a');
      if (articleLink && articleLink.href) {
        console.log('Found first card article link:', articleLink.href);
        return articleLink.href;
      }

      return null;
    }

    function updateHeroLink() {
      const heroLink = document.querySelector('.hero-cta .generic-link');
      if (!heroLink) {
        console.log('Hero .generic-link not found yet');
        return false;
      }

      const firstCardUrl = getFirstCardLink();
      if (!firstCardUrl) {
        console.log('No card link found yet');
        return false;
      }

      heroLink.href = firstCardUrl;
      console.log('Hero link updated to:', firstCardUrl);
      return true;
    }

    let attempts = 0;
    // Retry hero-link rewiring while page content finishes rendering.
    function tryUpdate() {
      if (updateHeroLink()) {
        console.log('Hero link update complete!');
      } else if (attempts < 20) {
        attempts++;
        console.log(`Hero link update attempt ${attempts}/20, retrying...`);
        setTimeout(tryUpdate, 500);
      } else {
        console.error('Could not update hero link after 20 attempts');
      }
    }
    tryUpdate();
  }

  // =========================================================================
  // PAGE DETECTION - figure out which page we're on and run the right script
  // =========================================================================
  waitForDOM(() => {
    // Check for Captivate iframes first (story listing pages)
    const hasCaptivateIframes = document.querySelector(
      '.story-podcast-playing iframe[src*="captivate.fm"]'
    );

    // Check for article card tiles (Biopharma-style pages)
    const hasArticleCards = document.querySelector(
      '#content .tile--campaign-story'
    );

    // Check for generic hero link (Biopharma)
    const hasGenericHeroLink = document.querySelector(
      '.hero-cta .generic-link'
    );

    if (hasCaptivateIframes) {
      // Podcast listing experience.
      initCaptivateOverlay();
    } else if (hasArticleCards && hasGenericHeroLink) {
      // Card-based landing experience.
      initHeroLinkUpdater();
    } else {
      // Content might not be loaded yet - retry detection
      let detectAttempts = 0;
      function retryDetection() {
        detectAttempts++;
        console.log(`Page detection attempt ${detectAttempts}/20...`);

        if (
          document.querySelector(
            '.story-podcast-playing iframe[src*="captivate.fm"]'
          )
        ) {
          initCaptivateOverlay();
        } else if (
          document.querySelector('#content .tile--campaign-story') &&
          document.querySelector('.hero-cta .generic-link')
        ) {
          initHeroLinkUpdater();
        } else if (detectAttempts < 20) {
          setTimeout(retryDetection, 500);
        } else {
          console.log('No matching page type detected after 20 attempts');
        }
      }
      retryDetection();
    }
  });
})();