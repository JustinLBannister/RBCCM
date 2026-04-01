<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: European Leadership Carousel -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- Only render if between 4 and 8 slides exist -->
    <xsl:variable name="slideCount" select="count(
        /Properties/Data/Group[@ID='LeadershipSlide' or @Name='Leadership Slide']
        | /Data/Group[@ID='LeadershipSlide' or @Name='Leadership Slide']
      )"/>

    <xsl:if test="$slideCount >= 4 and $slideCount &lt;= 8">

      <!-- ── Heading ── -->
      <xsl:variable name="heading">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='Heading']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Heading'])"/>
          </xsl:when>
          <xsl:otherwise>European leadership</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- ── Aria label ── -->
      <xsl:variable name="ariaLabel">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='CarouselAriaLabel']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='CarouselAriaLabel'])"/>
          </xsl:when>
          <xsl:otherwise>European leadership</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- ── Load CSS ── -->
      <link rel="stylesheet" href="/assets/rbccm/css/sub/test/leadership-carousel.css"/>

      <!-- ── Component HTML ── -->
      <section class="rbccm-leadership" id="rbccm-leadership">
        <xsl:attribute name="aria-label"><xsl:value-of select="$ariaLabel"/></xsl:attribute>

        <div class="rbccm-leadership__inner">

          <h2 class="rbccm-leadership__heading">
            <xsl:value-of select="$heading"/>
          </h2>

          <!-- Screen reader live region -->
          <div id="rbccm-lead-announce" aria-live="polite" aria-atomic="true" class="rbccm-leadership__sr-only"></div>
          <p id="rbccm-lead-instructions" class="rbccm-leadership__sr-only">Use left and right arrow keys to navigate between slides. Use Tab to move between cards.</p>

          <!-- Desktop arrows -->
          <div class="rbccm-leadership__arrows-desktop">
            <button id="rbccm-lead-prev-desk" class="rbccm-leadership__btn-desk" aria-label="Previous slide" tabindex="0">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="46" viewBox="0 0 25 46" fill="none" aria-hidden="true">
                <path d="M23.4143 45L1.41431 23L23.4143 1" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button id="rbccm-lead-next-desk" class="rbccm-leadership__btn-desk" aria-label="Next slide" tabindex="0">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="46" viewBox="0 0 25 46" fill="none" aria-hidden="true">
                <path d="M1.58569 45L23.5857 23L1.58569 1" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Slider -->
          <div class="rbccm-leadership__slider-track"
               role="region"
               aria-label="Leadership cards"
               aria-describedby="rbccm-lead-instructions">

            <!-- ── Loop through slides ── -->
            <xsl:for-each select="
                /Properties/Data/Group[@ID='LeadershipSlide' or @Name='Leadership Slide']
                | /Data/Group[@ID='LeadershipSlide' or @Name='Leadership Slide']
              ">

              <xsl:variable name="name"      select="normalize-space(Datum[@ID='Name'           or @Name='Person Name'])"/>
              <xsl:variable name="role"      select="normalize-space(Datum[@ID='Role'           or @Name='Role / Title'])"/>
              <xsl:variable name="image"     select="normalize-space(Datum[@ID='Image'          or @Name='Headshot Image'])"/>
              <xsl:variable name="alt"       select="normalize-space(Datum[@ID='ImageAlt'       or @Name='Image Alt Text'])"/>
              <xsl:variable name="linkedin"  select="normalize-space(Datum[@ID='LinkedInHandle' or @Name='LinkedIn Handle'])"/>

              <div class="rbccm-leadership__card">

                <!-- Image zone -->
                <div class="rbccm-leadership__card-image">
                  <xsl:choose>
                    <xsl:when test="$image != ''">
                      <img loading="lazy" alt="{$alt}">
                        <xsl:attribute name="src"><xsl:value-of select="$image"/></xsl:attribute>
                        <xsl:attribute name="onerror">this.src='https://fpoimg.com/276x263?text=Team%20Member&amp;text_color=8F8F8F&amp;bg_color=e6e6e6'</xsl:attribute>
                      </img>
                    </xsl:when>
                    <xsl:otherwise>
                      <img loading="lazy" alt="{$alt}" src="https://fpoimg.com/276x263?text=Team%20Member&amp;text_color=8F8F8F&amp;bg_color=e6e6e6">
                        <xsl:attribute name="onerror">this.src='https://fpoimg.com/276x263?text=Team%20Member&amp;text_color=8F8F8F&amp;bg_color=e6e6e6'</xsl:attribute>
                      </img>
                    </xsl:otherwise>
                  </xsl:choose>
                  <div class="rbccm-leadership__fpo" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="40" cy="28" r="16" stroke="#003168" stroke-width="2.5"/>
                      <path d="M8 72c0-17.673 14.327-32 32-32s32 14.327 32 32" stroke="#003168" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>

                <!-- Card body -->
                <div class="rbccm-leadership__card-body">
                  <h3 class="rbccm-leadership__card-name"><xsl:value-of select="$name"/></h3>
                  <p class="rbccm-leadership__card-role"><xsl:value-of select="$role"/></p>

                  <xsl:if test="$linkedin != ''">
                    <a class="rbccm-leadership__card-linkedin"
                       target="_blank"
                       rel="noopener noreferrer"
                       tabindex="0">
                      <xsl:attribute name="href">https://www.linkedin.com/in/<xsl:value-of select="$linkedin"/></xsl:attribute>
                      <xsl:attribute name="aria-label"><xsl:value-of select="$name"/> on LinkedIn, opens in new tab</xsl:attribute>
                      <svg class="li-default" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M37.8553 37.2923C26.5589 49.042 6.66437 44.7004 1.28498 29.3755C-4.58997 12.6383 10.6242 -3.77121 27.7414 0.765476C43.8478 5.03332 49.4409 25.2402 37.8553 37.2923ZM20.237 1.79323C6.52717 2.75097 -2.04867 17.5997 3.41284 30.14C9.35592 43.7846 27.8151 46.5916 37.4754 35.1855C49.2449 21.2898 38.3826 0.525573 20.237 1.79323Z" fill="#0051A5"/><path d="M23.0554 18.7546V20.5282L23.7582 19.6908C25.3429 18.3718 28.7278 18.3942 30.3657 19.6115C31.4465 20.4143 31.8319 22.088 31.9206 23.3771C32.111 26.1486 31.7806 29.1255 31.9215 31.9175H28.0018V24.5897C28.0018 23.9363 27.5809 22.7881 27.0452 22.3727C26.2827 21.78 24.6578 21.8976 23.9682 22.5827C23.7022 22.8469 23.2421 23.9615 23.2421 24.3106V31.9184H19.4623V18.7546H23.0554Z" fill="#0051A5"/><path d="M15.3943 15.5C15.3943 16.6 14.5 17.5 13.4 17.5C12.3 17.5 11.4 16.6 11.4 15.5C11.4 14.4 12.3 13.5 13.4 13.5C14.5 13.5 15.3943 14.4 15.3943 15.5Z" fill="#0051A5"/><path d="M15.1 18.75H11.7V31.92H15.1V18.75Z" fill="#0051A5"/></svg>
                      <svg class="li-hover" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="22" fill="#0051A5"/><path d="M23.0554 18.7546V20.5282L23.7582 19.6908C25.3429 18.3718 28.7278 18.3942 30.3657 19.6115C31.4465 20.4143 31.8319 22.088 31.9206 23.3771C32.111 26.1486 31.7806 29.1255 31.9215 31.9175H28.0018V24.5897C28.0018 23.9363 27.5809 22.7881 27.0452 22.3727C26.2827 21.78 24.6578 21.8976 23.9682 22.5827C23.7022 22.8469 23.2421 23.9615 23.2421 24.3106V31.9184H19.4623L19.3428 31.7784V18.6631H22.7288C22.7792 18.6631 22.936 18.8078 23.0554 18.7564V18.7546Z" fill="white"/><path d="M16.7098 18.7544H12.1357V31.9164H16.7098V18.7544Z" fill="white"/><path d="M16.0235 12.7206C18.2661 14.8536 14.8615 18.258 12.73 16.0149C10.5984 13.7717 13.8685 10.6707 16.0235 12.7206Z" fill="white"/></svg>
                    </a>
                  </xsl:if>
                </div>

              </div>
            </xsl:for-each>

          </div><!-- /.slider-track -->

          <!-- Mobile controls -->
          <div class="rbccm-leadership__controls">
            <button id="rbccm-lead-prev" class="rbccm-leadership__btn" aria-label="Previous slide" tabindex="0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M12.3032 1L1.41422 11.889L12.3032 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <div id="rbccm-lead-dots" class="rbccm-leadership__dots-wrap"></div>
            <button id="rbccm-lead-next" class="rbccm-leadership__btn" aria-label="Next slide" tabindex="0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden="true">
                <path d="M1.69678 1L12.5858 11.889L1.69678 22.778" stroke="#003168" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

        </div><!-- /.inner -->
      </section>

      <!-- ── Inline JS ── -->
      <script>
        jQuery(document).ready(function ($) {
          var $track = $('.rbccm-leadership__slider-track');
          var $dots  = $('#rbccm-lead-dots');

          // Ensure arrow buttons are in tab order from the start
          $('#rbccm-lead-prev, #rbccm-lead-prev-desk, #rbccm-lead-next, #rbccm-lead-next-desk')
            .attr('tabindex', '0');

          var entryLinkedInIdx = 0;

          $('#rbccm-lead-prev, #rbccm-lead-prev-desk').on('click', function () {
            focusQueue = [];
            $track.slick('slickPrev');
          });
          $('#rbccm-lead-next, #rbccm-lead-next-desk').on('click', function () {
            focusQueue = [];
            $track.slick('slickNext');
          });

          function syncArrows() {
            var slick      = $track.slick('getSlick');
            var current    = slick.currentSlide;
            var total      = slick.slideCount;
            var isInfinite = slick.options.infinite;

            if (isInfinite) {
              $('#rbccm-lead-prev, #rbccm-lead-prev-desk, #rbccm-lead-next, #rbccm-lead-next-desk')
                .prop('disabled', false)
                .attr('aria-disabled', 'false')
                .css('opacity', 1);
              return;
            }

            var cardWidth    = $('.rbccm-leadership__card').first().outerWidth(true);
            var trackWidth   = $track.width();
            var visibleCards = Math.ceil(trackWidth / cardWidth);
            var maxIndex     = total - visibleCards;

            var atStart = current &lt;= 0;
            var atEnd   = current >= maxIndex;

            $('#rbccm-lead-prev, #rbccm-lead-prev-desk')
              .prop('disabled', atStart)
              .attr('aria-disabled', atStart ? 'true' : 'false')
              .css('opacity', atStart ? 0.3 : 1);
            $('#rbccm-lead-next, #rbccm-lead-next-desk')
              .prop('disabled', atEnd)
              .attr('aria-disabled', atEnd ? 'true' : 'false')
              .css('opacity', atEnd ? 0.3 : 1);
          }

          var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          function initCarousel() {
            $track.slick({
            slidesToShow:    1,
            slidesToScroll:  1,
            variableWidth:   true,
            infinite:        true,
            initialSlide:    0,
            arrows:          false,
            dots:            true,
            dotsClass:       'slick-dots',
            appendDots:      $dots,
            speed:           reducedMotion ? 0 : 350,
            cssEase:         reducedMotion ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
            easing:          'linear',
            useCSS:          true,
            useTransform:    true,
            fade:            false,
            centerMode:      true,
            centerPadding:   '0px',
            adaptiveHeight:  false,
            rows:            1,
            slidesPerRow:    1,
            vertical:        false,
            verticalSwiping: false,
            rtl:             false,
            draggable:       false,
            swipe:           true,
            swipeToSlide:    false,
            touchMove:       true,
            touchThreshold:  5,
            edgeFriction:    0.35,
            autoplay:        false,
            autoplaySpeed:   3000,
            accessibility:   false,
            pauseOnHover:    true,
            pauseOnFocus:    true,
            pauseOnDotsHover: false,
            respondTo:       'window',
            mobileFirst:     false,
            responsive: [
              {
                breakpoint: 99999,
                settings: {
                  centerMode:     false,
                  centerPadding:  '0px',
                  draggable:      false,
                  infinite:       false,
                  slidesToScroll: 1,
                  swipe:          false,
                  touchMove:      false,
                  variableWidth:  true
                }
              },
              {
                breakpoint: 1245,
                settings: {
                  centerMode:     true,
                  centerPadding:  '0px',
                  draggable:      true,
                  infinite:       true,
                  slidesToScroll: 1,
                  swipe:          true,
                  touchMove:      true,
                  variableWidth:  true
                }
              },
              {
                breakpoint: 1025,
                settings: {
                  centerMode:     true,
                  centerPadding:  '0px',
                  draggable:      true,
                  infinite:       true,
                  slidesToScroll: 1,
                  swipe:          true,
                  touchMove:      true,
                  variableWidth:  true
                }
              },
              {
                breakpoint: 640,
                settings: {
                  centerMode:     true,
                  centerPadding:  '0px',
                  draggable:      true,
                  infinite:       true,
                  slidesToScroll: 1,
                  swipe:          true,
                  touchMove:      true,
                  variableWidth:  true
                }
              }
            ],
            asNavFor:       null,
            waitForAnimate: true,
            zIndex:         1000
          });
          } // end initCarousel

          // Check if Slick is already loaded, if not load from CDN then init
          if (typeof $.fn.slick !== 'undefined') {
            initCarousel();
          } else {
            var slickScript = document.createElement('script');
            slickScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js';
            slickScript.integrity = 'sha512-HGOnQO9+SP1V92SrtZfjqxxtLmVzqZpjFFekvzZVWoiASSQgSr4cw9Kqd2+l8Llp4Gm0G8GIFJ4ddwZilcdb8A==';
            slickScript.crossOrigin = 'anonymous';
            slickScript.referrerPolicy = 'no-referrer';
            slickScript.onload = function () { initCarousel(); };
            document.head.appendChild(slickScript);
          }

          $track.on('afterChange init', function (e, slick, currentSlide) {
            syncArrows();

            $track.find('.slick-slide').each(function () {
              $(this).removeAttr('aria-hidden');
              $(this).find('a, button').removeAttr('tabindex');
            });

            $('#rbccm-lead-prev, #rbccm-lead-prev-desk, #rbccm-lead-next, #rbccm-lead-next-desk')
              .attr('tabindex', '0');

            if (typeof currentSlide !== 'undefined') {
              var total = slick.slideCount;
              $('#rbccm-lead-announce').text('Slide ' + (currentSlide + 1) + ' of ' + total);
              entryLinkedInIdx = currentSlide;
            }

            isAnimating = false;
            processQueue();
          });

          var isAnimating = false;
          var focusQueue  = [];

          function processQueue() {
            if (focusQueue.length === 0) return;
            var $next = focusQueue.shift();
            if ($next &amp;&amp; $next.length) {
              $next.get(0).focus({ preventScroll: true });
            }
          }

          function getFocusable() {
            var $prev = $('#rbccm-lead-prev-desk').is(':visible')
              ? $('#rbccm-lead-prev-desk')
              : $('#rbccm-lead-prev');
            var $next = $('#rbccm-lead-next-desk').is(':visible')
              ? $('#rbccm-lead-next-desk')
              : $('#rbccm-lead-next');
            return $().add($prev)
                      .add($next)
                      .add($track.find('.rbccm-leadership__card-linkedin'));
          }

          function navigateSequence(direction) {
            var $focusable = getFocusable();
            var $links     = $track.find('.rbccm-leadership__card-linkedin');
            var currIdx    = $focusable.index(document.activeElement);
            var onPrevBtn  = $(document.activeElement).is('#rbccm-lead-prev, #rbccm-lead-prev-desk');
            var onNextBtn  = $(document.activeElement).is('#rbccm-lead-next, #rbccm-lead-next-desk');

            if (currIdx === -1) return false;

            if (onNextBtn &amp;&amp; direction === 1) {
              var currentSlide = $track.slick('getSlick').currentSlide;
              var $target      = $links.eq(currentSlide);
              if ($target.length) {
                $target.get(0).focus({ preventScroll: true });
                return true;
              }
            }

            if (onPrevBtn &amp;&amp; direction === -1) return false;

            var nextIdx = currIdx + direction;

            if (nextIdx &lt; 0 || nextIdx >= $focusable.length) return false;

            var $next      = $focusable.eq(nextIdx);
            var isLinkedIn = $next.hasClass('rbccm-leadership__card-linkedin');

            if (isLinkedIn) {
              if (isAnimating) {
                focusQueue.push($next);
                return true;
              }

              var slickNav       = $track.slick('getSlick');
              var currentNav     = slickNav.currentSlide;
              var cardWidthNav   = $('.rbccm-leadership__card').first().outerWidth(true);
              var trackWidthNav  = $track.width();
              var visibleNav     = Math.ceil(trackWidthNav / cardWidthNav);
              var lastVisibleNav = currentNav + visibleNav - 1;
              var linkedInIdx    = $links.index($next);

              if (direction === 1 &amp;&amp; linkedInIdx > lastVisibleNav) {
                isAnimating = true;
                focusQueue.push($next);
                $track.slick('slickNext');
                return true;
              } else if (direction === -1 &amp;&amp; linkedInIdx &lt; currentNav) {
                isAnimating = true;
                focusQueue.push($next);
                $track.slick('slickPrev');
                return true;
              }
            }

            $next.get(0).focus({ preventScroll: true });
            return true;
          }

          $(document).on('keydown', function (e) {
            if (!$.contains(document.getElementById('rbccm-leadership'), document.activeElement)) return;

            var handled = false;

            if ((e.key === 'Enter' || e.key === ' ') &amp;&amp;
                $(document.activeElement).closest('#rbccm-lead-prev, #rbccm-lead-prev-desk, #rbccm-lead-next, #rbccm-lead-next-desk').length) {
              e.preventDefault();
              focusQueue = [];
              $(document.activeElement).trigger('click');
              return;
            }

            if (e.key === 'ArrowRight') {
              e.preventDefault();
              handled = navigateSequence(1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              handled = navigateSequence(-1);
            } else if (e.key === 'Tab') {
              var direction = e.shiftKey ? -1 : 1;
              handled = navigateSequence(direction);
              if (handled) e.preventDefault();
            }
          });

          var resizeTimer;
          $(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
              if ($track.hasClass('slick-initialized')) {
                $track.slick('setPosition');
                syncArrows();
              }
            }, 50);
          });

        });
      </script>

    </xsl:if>

  </xsl:template>
</xsl:stylesheet>
