// Universal podcast/hero handler - detects page type and runs appropriate script
(function() {
    console.log('Universal podcast handler initializing...');
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
        function getFirstEpisodeUrl() {
            const selectors = [
                '.insights-stories.initial .story-podcast-playing iframe[src*="captivate.fm"]',
                '.insights-stories .story-podcast-playing iframe[src*="captivate.fm"]',
                '.story-podcast-playing iframe[src*="captivate.fm"]'
            ];
            for (let i = 0; i < selectors.length; i++) {
                const iframe = document.querySelector(selectors[i]);
                if (iframe && iframe.src) {
                    console.log('Found episode URL via selector ' + (i + 1) + ':', iframe.src);
                    return iframe.src;
                }
            }
            return null;
        }
        function createPodcastOverlay(episodeUrl) {
            const existing = document.getElementById('custom-podcast-overlay');
            if (existing) existing.remove();
            // CHANGED: use <div> instead of <a> to prevent Captivate iframe
            // from bubbling clicks through an anchor and manipulating parent URL
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
            // ADDED: sandbox prevents the Captivate iframe from calling
            // pushState/replaceState on the parent window (which added the URL param/ID).
            // allow-top-navigation is intentionally omitted.
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-autoplay');
            iframe.src = episodeUrl;
            closeButton.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                wrapper.style.display = 'none'; // CHANGED: wrapperLink -> wrapper
                iframe.src = '';
                setTimeout(() => { iframe.src = episodeUrl; }, 100);
            };
            overlay.appendChild(closeButton);
            overlay.appendChild(iframe);
            wrapper.appendChild(overlay); // CHANGED: wrapperLink -> wrapper
            if (document.body) {
                document.body.appendChild(wrapper); // CHANGED: wrapperLink -> wrapper
                console.log('Podcast overlay created with episode:', episodeUrl);
                return wrapper; // CHANGED: wrapperLink -> wrapper
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
                console.log('Hero button not found yet');
                return false;
            }
            console.log('Found hero button:', button);
            const newButton = button.cloneNode(true);
            newButton.removeAttribute('aria-controls');
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Hero play button clicked - showing overlay');
                hideOriginalPlayer();
                if (!document.getElementById('custom-podcast-overlay')) {
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
                    overlay.style.display = 'block';
                    console.log('Podcast overlay now visible');
                }
                setTimeout(hideOriginalPlayer, 100);
                setTimeout(hideOriginalPlayer, 300);
                setTimeout(hideOriginalPlayer, 500);
                return false;
            });
            console.log('Hero button handler attached');
            return true;
        }
        const episodeUrl = getFirstEpisodeUrl();
        if (episodeUrl) {
            createPodcastOverlay(episodeUrl);
        }
        let attempts = 0;
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
        function getFirstCardLink() {
            const firstTile = document.querySelector('#content .tile--campaign-story');
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
        const hasCaptivateIframes = document.querySelector('.story-podcast-playing iframe[src*="captivate.fm"]');
        const hasArticleCards = document.querySelector('#content .tile--campaign-story');
        const hasGenericHeroLink = document.querySelector('.hero-cta .generic-link');
        if (hasCaptivateIframes) {
            initCaptivateOverlay();
        } else if (hasArticleCards && hasGenericHeroLink) {
            initHeroLinkUpdater();
        } else {
            let detectAttempts = 0;
            function retryDetection() {
                detectAttempts++;
                console.log(`Page detection attempt ${detectAttempts}/20...`);
                if (document.querySelector('.story-podcast-playing iframe[src*="captivate.fm"]')) {
                    initCaptivateOverlay();
                } else if (document.querySelector('#content .tile--campaign-story') && document.querySelector('.hero-cta .generic-link')) {
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