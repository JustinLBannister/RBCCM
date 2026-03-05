// Universal podcast/hero handler - detects page type and runs appropriate script
(function() {
    console.log('Universal podcast handler initializing...');
    // DIAGNOSTIC: Intercept history changes to confirm what is writing to the URL.
    // Remove this block once the aliId issue is confirmed resolved in production.
    (function() {
        const origPush = history.pushState;
        const origReplace = history.replaceState;
        history.pushState = function() {
            console.log('[URL Monitor] pushState called:', arguments[2]);
            console.trace('[URL Monitor] pushState stack trace');
            return origPush.apply(this, arguments);
        };
        history.replaceState = function() {
            console.log('[URL Monitor] replaceState called:', arguments[2]);
            console.trace('[URL Monitor] replaceState stack trace');
            return origReplace.apply(this, arguments);
        };
        window.addEventListener('hashchange', function(e) {
            console.log('[URL Monitor] hashchange:', e.oldURL, '->', e.newURL);
        });
        console.log('[URL Monitor] History change monitoring active');
    })();
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
        console.log('[Captivate] Captivate overlay page detected');
        function getFirstEpisodeUrl() {
            const selectors = [
                '.insights-stories.initial .story-podcast-playing iframe[src*="captivate.fm"]',
                '.insights-stories .story-podcast-playing iframe[src*="captivate.fm"]',
                '.story-podcast-playing iframe[src*="captivate.fm"]'
            ];
            for (let i = 0; i < selectors.length; i++) {
                const iframe = document.querySelector(selectors[i]);
                if (iframe && iframe.src) {
                    console.log('[Captivate] Found episode URL via selector ' + (i + 1) + ':', iframe.src);
                    return iframe.src;
                }
            }
            console.warn('[Captivate] No episode URL found in any selector');
            return null;
        }
        function createPodcastOverlay(episodeUrl) {
            const existing = document.getElementById('custom-podcast-overlay');
            if (existing) {
                console.log('[Captivate] Removing existing overlay');
                existing.remove();
            }
            // Use <div> instead of <a> to prevent click events from bubbling
            // through an anchor and triggering unintended navigation
            const wrapper = document.createElement('div');
            wrapper.id = 'custom-podcast-overlay';
            wrapper.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                z-index: 99999;
                display: none;
            `;
            const overlay = document.createElement('div');
            overlay.className = 'story-podcast-playing';
            overlay.style.cssText = `
                background-color: rgb(244, 244, 244);
                box-shadow: rgba(0, 0, 0, 0.1) 0px -2px 10px;
                padding: 0;
            `;
            const closeButton = document.createElement('button');
            closeButton.setAttribute('aria-label', 'Close Player');
            closeButton.className = 'btn-close-player close-btn';
            const closeImg = document.createElement('img');
            closeImg.src = '/assets/rbccm/images/campaign/player-x.svg';
            closeImg.alt = 'Close';
            closeButton.appendChild(closeImg);
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '200';
            iframe.scrolling = 'no';
            iframe.frameBorder = 'no';
            iframe.allow = 'autoplay';
            // sandbox prevents the Captivate iframe from calling pushState/replaceState
            // on the parent window. allow-top-navigation intentionally omitted.
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation');
            iframe.src = episodeUrl;
            console.log('[Captivate] Overlay iframe src set to:', episodeUrl);
            closeButton.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[Captivate] Close button clicked, hiding overlay');
                wrapper.style.display = 'none';
                iframe.src = '';
                setTimeout(() => {
                    iframe.src = episodeUrl;
                    console.log('[Captivate] iframe src restored for next open');
                }, 100);
            };
            overlay.appendChild(closeButton);
            overlay.appendChild(iframe);
            wrapper.appendChild(overlay);
            if (document.body) {
                document.body.appendChild(wrapper);
                console.log('[Captivate] Overlay appended to body');
                return wrapper;
            }
            return null;
        }
        function hideOriginalPlayer() {
            const originalWrapper = document.querySelector('.podcast-player-wrapper');
            if (originalWrapper) {
                originalWrapper.style.display = 'none';
            }
            const originalContainer = document.getElementById('podcast-player-container');
            if (originalContainer) {
                originalContainer.style.display = 'none';
            }
        }
        function setupButton(episodeUrl) {
            const button = document.querySelector('.hero-cta .btn-play-audio');
            if (!button) {
                console.log('[Captivate] Hero button not found yet');
                return false;
            }
            console.log('[Captivate] Found hero button:', button);
            const newButton = button.cloneNode(true);
            newButton.removeAttribute('aria-controls');
            button.parentNode.replaceChild(newButton, button);
            // capture: true ensures this fires before any bubble-phase listeners
            // (including LinkedIn Insight Tag) so stopImmediatePropagation kills
            // the event before LinkedIn can intercept it and trigger a page reload
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[Captivate] Hero play button clicked - showing overlay');
                console.log('[Captivate] URL at time of click:', window.location.href);
                hideOriginalPlayer();
                if (!document.getElementById('custom-podcast-overlay')) {
                    const url = episodeUrl || getFirstEpisodeUrl();
                    if (url) {
                        createPodcastOverlay(url);
                    } else {
                        console.error('[Captivate] No episode URL found, cannot open player');
                        return;
                    }
                }
                const overlay = document.getElementById('custom-podcast-overlay');
                if (overlay) {
                    overlay.style.display = 'block';
                    console.log('[Captivate] Podcast overlay now visible');
                }
                setTimeout(hideOriginalPlayer, 100);
                setTimeout(hideOriginalPlayer, 300);
                setTimeout(hideOriginalPlayer, 500);
            }, true); // true = capture phase, fires before LinkedIn's bubble listener
            console.log('[Captivate] Hero button handler attached');
            return true;
        }
        const episodeUrl = getFirstEpisodeUrl();
        if (episodeUrl) {
            createPodcastOverlay(episodeUrl);
        }
        let attempts = 0;
        function trySetup() {
            if (setupButton(episodeUrl)) {
                console.log('[Captivate] Captivate overlay player ready!');
            } else if (attempts < 20) {
                attempts++;
                console.log(`[Captivate] Button setup attempt ${attempts}/20, retrying...`);
                setTimeout(trySetup, 500);
            } else {
                console.error('[Captivate] Could not find hero button after 20 attempts');
            }
        }
        trySetup();
    }
    // =========================================================================
    // PAGE TYPE 2: Pages with article cards and generic hero link
    // (e.g. Biopharma)
    // =========================================================================
    function initHeroLinkUpdater() {
        console.log('[HeroLink] Article card page detected');
        function getFirstCardLink() {
            const firstTile = document.querySelector('#content .tile--campaign-story');
            if (!firstTile) {
                console.warn('[HeroLink] No episode card found in #content');
                return null;
            }
            const articleLink = firstTile.querySelector('h3 a');
            if (articleLink && articleLink.href) {
                console.log('[HeroLink] Found first card article link:', articleLink.href);
                return articleLink.href;
            }
            console.warn('[HeroLink] No anchor found in first tile h3');
            return null;
        }
        function updateHeroLink() {
            const heroLink = document.querySelector('.hero-cta .generic-link');
            if (!heroLink) {
                console.log('[HeroLink] Hero .generic-link not found yet');
                return false;
            }
            const firstCardUrl = getFirstCardLink();
            if (!firstCardUrl) {
                console.log('[HeroLink] No card link found yet');
                return false;
            }
            heroLink.href = firstCardUrl;
            console.log('[HeroLink] Hero link updated to:', firstCardUrl);
            return true;
        }
        let attempts = 0;
        function tryUpdate() {
            if (updateHeroLink()) {
                console.log('[HeroLink] Hero link update complete!');
            } else if (attempts < 20) {
                attempts++;
                console.log(`[HeroLink] Hero link update attempt ${attempts}/20, retrying...`);
                setTimeout(tryUpdate, 500);
            } else {
                console.error('[HeroLink] Could not update hero link after 20 attempts');
            }
        }
        tryUpdate();
    }
    // =========================================================================
    // PAGE DETECTION - figure out which page we're on and run the right script
    // =========================================================================
    waitForDOM(() => {
        console.log('[Detection] DOM ready, checking page type...');
        const hasCaptivateIframes = document.querySelector('.story-podcast-playing iframe[src*="captivate.fm"]');
        const hasArticleCards = document.querySelector('#content .tile--campaign-story');
        const hasGenericHeroLink = document.querySelector('.hero-cta .generic-link');
        console.log('[Detection] hasCaptivateIframes:', !!hasCaptivateIframes);
        console.log('[Detection] hasArticleCards:', !!hasArticleCards);
        console.log('[Detection] hasGenericHeroLink:', !!hasGenericHeroLink);
        if (hasCaptivateIframes) {
            initCaptivateOverlay();
        } else if (hasArticleCards && hasGenericHeroLink) {
            initHeroLinkUpdater();
        } else {
            console.log('[Detection] No immediate match, starting retry loop...');
            let detectAttempts = 0;
            function retryDetection() {
                detectAttempts++;
                console.log(`[Detection] Page detection attempt ${detectAttempts}/20...`);
                if (document.querySelector('.story-podcast-playing iframe[src*="captivate.fm"]')) {
                    console.log('[Detection] Captivate iframes found on retry');
                    initCaptivateOverlay();
                } else if (document.querySelector('#content .tile--campaign-story') && document.querySelector('.hero-cta .generic-link')) {
                    console.log('[Detection] Article cards found on retry');
                    initHeroLinkUpdater();
                } else if (detectAttempts < 20) {
                    setTimeout(retryDetection, 500);
                } else {
                    console.log('[Detection] No matching page type detected after 20 attempts');
                }
            }
            retryDetection();
        }
    });
})();