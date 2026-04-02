<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Skin: RBC CM Stats Ticker (Dark) -->

  <xsl:strip-space elements="*"/>

  <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl"/>
  <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl"/>

  <xsl:template match="/">

    <!-- ── Guard: only render if between 4 and 8 stats ── -->
    <xsl:variable name="statCount" select="count(
        /Properties/Data/Group[@ID='StatItem' or @Name='Stat Item']
        | /Data/Group[@ID='StatItem' or @Name='Stat Item']
      )"/>

    <xsl:if test="$statCount &gt;= 4 and $statCount &lt;= 8">

      <!-- ── Header fields ── -->
      <xsl:variable name="title">
        <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Title'])"/>
      </xsl:variable>

      <xsl:variable name="subtitle">
        <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Subtitle'])"/>
      </xsl:variable>

      <xsl:variable name="footnote">
        <xsl:value-of select="normalize-space(/Properties/Datum[@ID='Footnote'])"/>
      </xsl:variable>

      <!-- ── Asset paths ── -->
      <xsl:variable name="cssPath">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='CSSPath']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='CSSPath'])"/>
          </xsl:when>
          <xsl:otherwise>/assets/rbccm/css/sub/stats-ticker.css</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:variable name="jsPath">
        <xsl:choose>
          <xsl:when test="normalize-space(/Properties/Datum[@ID='JSPath']) != ''">
            <xsl:value-of select="normalize-space(/Properties/Datum[@ID='JSPath'])"/>
          </xsl:when>
          <xsl:otherwise>/assets/rbccm/js/sub/stats-ticker.js</xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- ── Load CSS ── -->
      <link rel="stylesheet">
        <xsl:attribute name="href"><xsl:value-of select="$cssPath"/></xsl:attribute>
      </link>

      <!-- ── Component HTML ── -->
      <section class="rbccm-stats rbccm-stats--dark">

        <!-- Header -->
        <div class="rbccm-stats__header">
          <div class="rbccm-stats__container">
            <xsl:if test="$title != ''">
              <h2 class="rbccm-stats__title">
                <xsl:value-of select="$title" disable-output-escaping="yes"/>
              </h2>
            </xsl:if>
            <xsl:if test="$subtitle != ''">
              <p class="rbccm-stats__subtitle">
                <xsl:value-of select="$subtitle" disable-output-escaping="yes"/>
              </p>
            </xsl:if>
          </div>
        </div>

        <!-- Stat grid -->
        <div class="rbccm-stats__grid">
          <xsl:for-each select="
              /Properties/Data/Group[@ID='StatItem' or @Name='Stat Item']
              | /Data/Group[@ID='StatItem' or @Name='Stat Item']
            ">
            <xsl:variable name="number"      select="normalize-space(Datum[@ID='Number'      or @Name='Stat Number'])"/>
            <xsl:variable name="description" select="normalize-space(Datum[@ID='Description' or @Name='Description'])"/>

            <div class="rbccm-stats__item rbccm-stats__item--big">
              <div class="rbccm-stats__number">
                <xsl:value-of select="$number" disable-output-escaping="yes"/>
              </div>
              <p class="rbccm-stats__desc">
                <xsl:value-of select="$description" disable-output-escaping="yes"/>
              </p>
            </div>
          </xsl:for-each>
        </div>

        <!-- Footnote -->
        <xsl:if test="$footnote != ''">
          <p class="rbccm-stats__footnote">
            <xsl:value-of select="$footnote" disable-output-escaping="yes"/>
          </p>
        </xsl:if>

        <!-- Progress bar -->
        <div class="rbccm-stats__progress">
          <div class="rbccm-stats__progress-bar"></div>
        </div>

      </section>

      <!-- ── Load JS (scoped to component, mirrors leadership carousel pattern) ── -->
      <script>
        (function () {
          function initStatsTicker() {
            var grid        = document.querySelector('.rbccm-stats__grid');
            var progressBar = document.querySelector('.rbccm-stats__progress-bar');
            if (!grid) return;

            var items = Array.from(grid.querySelectorAll('.rbccm-stats__item'));

            // Clone items twice for seamless infinite loop
            for (var i = 0; i &lt; 2; i++) {
              items.forEach(function (item) {
                var clone = item.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                grid.appendChild(clone);
              });
            }

            var setWidth = 0;
            items.forEach(function (item) { setWidth += item.offsetWidth; });

            var isPlaying           = true;
            var wasPlayingBeforeHover = true;
            var scrollPos           = 0;
            var animationId         = null;
            var speed               = 0.5;
            var isDragging          = false;
            var dragStartX          = 0;
            var dragStartScroll     = 0;
            var currentBarWidth     = 25;
            var currentBarLeft      = 0;

            function updateProgressBar() {
              if (!progressBar) return;
              var progress   = (scrollPos % setWidth) / setWidth;
              var targetLeft = progress * (100 - 25);
              if (targetLeft &lt; currentBarLeft - 30) { elasticReset(); return; }
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

            function tick() {
              if (!isPlaying || isDragging) return;
              scrollPos += speed;
              if (scrollPos >= setWidth) scrollPos -= setWidth;
              grid.scrollLeft = scrollPos;
              updateProgressBar();
              animationId = requestAnimationFrame(tick);
            }

            // Pause/play button
            var SVG_PAUSE = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.5" fill="white" fill-opacity="0.38" stroke="white"/><rect x="12" y="10" width="2.66667" height="12" rx="1" fill="white"/><rect x="17.3335" y="10" width="2.66667" height="12" rx="1" fill="white"/></svg>';
            var SVG_PLAY  = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15.5" fill="white" fill-opacity="0.38" stroke="white"/><polygon points="13,10 22,16 13,22" fill="white"/></svg>';

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

            grid.addEventListener('mouseenter', function () {
              wasPlayingBeforeHover = isPlaying;
              if (isPlaying) pause();
              grid.style.cursor = 'grab';
            });
            grid.addEventListener('mouseleave', function () {
              if (isDragging) isDragging = false;
              if (wasPlayingBeforeHover) play();
            });
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
              while (scrollPos &lt; 0)         scrollPos += setWidth;
              while (scrollPos >= setWidth)  scrollPos -= setWidth;
              grid.scrollLeft = scrollPos;
              updateProgressBar();
            });
            document.addEventListener('mouseup', function () {
              if (!isDragging) return;
              isDragging        = false;
              grid.style.cursor = 'grab';
            });

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
              while (scrollPos &lt; 0)        scrollPos += setWidth;
              while (scrollPos >= setWidth) scrollPos -= setWidth;
              grid.scrollLeft = scrollPos;
              updateProgressBar();
            }, { passive: true });
            grid.addEventListener('touchend', function () {
              if (wasPlayingBeforeHover) play();
            });

            grid.style.overflowX = 'hidden';
            play();
          }

          // Init on DOMContentLoaded or immediately if already ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initStatsTicker);
          } else {
            initStatsTicker();
          }
        })();
      </script>

    </xsl:if>

  </xsl:template>
</xsl:stylesheet>