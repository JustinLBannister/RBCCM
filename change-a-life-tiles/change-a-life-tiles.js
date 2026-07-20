/* =========================================================================
   Change a Life Tiles: consolidation + filtering
   -------------------------------------------------------------------------
   The Change a Life page in TeamSite renders multiple separate <section>
   blocks (one main visible section + several hidden overflow sections).
   Authors add tiles to whichever section has capacity, which produces a
   visually-fragmented page: the main section shows N tiles and the rest
   are hidden entirely.

   This script runs after page load and:

   1. Consolidates all tiles from the hidden sections into the main
      section's grid, so the page renders as a single visual grid.
   2. Marks the newly-added tiles with a class so they can be hidden by
      default (only revealed on filter change or "Explore" click).
   3. Wires up filter checkboxes so selecting a topic shows only tiles
      whose data-category matches.
   4. Equalizes tile heights per row (text box + image box) so the grid
      stays tidy when tile content varies.
   5. Re-equalizes on window resize.

   jQuery is required (already loaded site-wide on rbccm.com).

   -------------------------------------------------------------------------
   HOW TO UPDATE IDS
   -------------------------------------------------------------------------
   TeamSite section IDs change when the page is republished. If tiles
   stop consolidating or filtering, the IDs in CONFIG below are the
   first thing to check:

   1. View source or inspect on the live page.
   2. Find the main visible section (usually the one with ~6 tiles).
      Copy its numeric id (e.g. 1756778868629) into CONFIG.mainSectionId.
   3. Find the hidden sections (they have style="display: none" or
      similar). Copy each of their ids into CONFIG.hiddenSectionIds.
   4. Save, republish the script asset, hard-refresh the page.
   ========================================================================= */

$(document).ready(function () {

  /* ---------- CONFIG ----------
     Update the IDs here when TeamSite regenerates them. Everything else
     under CONFIG is stable and shouldn't need edits. */
  var CONFIG = {
    // Main visible section ID
    mainSectionId: '#1756778868629',

    // Hidden section IDs — add / remove as needed
    hiddenSectionIds: [
      '#1760735061761',
      '#1756778868630',
      '#1756778868631'
    ],

    // Other settings (should be stable)
    filterDropdown:     '#etTopicDropdown',
    tileClass:          '.col-md-4',
    consolidatedMarker: 'cal-consolidated-tile',
    initDelay:          1000  // 1s delay for page load
  };


  /* ---------- Consolidate tiles ---------- */
  function consolidateTiles() {
    console.log('Starting tile consolidation...');

    // Find the main visible section's row
    var $mainRow = $(CONFIG.mainSectionId + ' .container .row').first();

    if ($mainRow.length === 0) {
      console.error('Main section not found with ID: ' + CONFIG.mainSectionId);
      console.log('Please update CONFIG.mainSectionId in the script');
      return false;
    }

    console.log('Found main row');

    var totalConsolidated = 0;

    // Process each hidden section
    CONFIG.hiddenSectionIds.forEach(function (sectionId) {
      var $hiddenSection = $(sectionId);

      if ($hiddenSection.length > 0) {
        // Find all tiles in this hidden section
        var $tiles = $hiddenSection.find(CONFIG.tileClass);

        $tiles.each(function () {
          var $tile = $(this).clone(true, true);

          // Mark as consolidated and hide initially
          $tile.addClass(CONFIG.consolidatedMarker);
          $tile.hide();

          // Add to main section
          $mainRow.append($tile);
          totalConsolidated++;
        });

        console.log('Consolidated ' + $tiles.length + ' tiles from ' + sectionId);

        // Remove the hidden section from DOM
        $hiddenSection.parent('.ls-cmp-wrap').remove();
      } else {
        console.warn('Hidden section not found: ' + sectionId);
      }
    });

    console.log('Total tiles consolidated: ' + totalConsolidated);
    return totalConsolidated > 0;
  }


  /* ---------- Height equalization ----------
     Groups visible tiles into rows of 3 (col-md-4) and forces the text
     box + image box in each row to match the row's tallest. Modals are
     explicitly excluded — they need to stay auto-height. */
  function equalizeTileHeights() {
    var $visibleTiles = $(CONFIG.mainSectionId + ' ' + CONFIG.tileClass + ':visible');

    if ($visibleTiles.length === 0) return;

    // Reset heights first to get natural heights — BUT EXCLUDE MODALS
    $visibleTiles.find('.tile--box > div > div > .white-box-text').css('height', '');
    $visibleTiles.find('.tile--box > div > div > .img-stretch').css('height', '');

    // Group tiles by row (3 per row for col-md-4)
    var tilesPerRow = 3;
    var rows = [];

    $visibleTiles.each(function (index) {
      var rowIndex = Math.floor(index / tilesPerRow);
      if (!rows[rowIndex]) {
        rows[rowIndex] = [];
      }
      rows[rowIndex].push($(this));
    });

    // Equalize heights per row
    rows.forEach(function (rowTiles) {
      if (rowTiles.length > 0) {
        var maxTextHeight = 0;
        var maxImageHeight = 0;

        rowTiles.forEach(function ($tile) {
          // Be specific — only get the tile's content, not modal content
          var $textBox  = $tile.find('.tile--box > div > div > .white-box-text').first();
          var $imageBox = $tile.find('.tile--box > div > div > .img-stretch').first();

          maxTextHeight  = Math.max(maxTextHeight,  $textBox.outerHeight());
          maxImageHeight = Math.max(maxImageHeight, $imageBox.outerHeight());
        });

        // Apply max heights to all tiles in this row — NOT to modals
        rowTiles.forEach(function ($tile) {
          $tile.find('.tile--box > div > div > .white-box-text').first().height(maxTextHeight);
          $tile.find('.tile--box > div > div > .img-stretch').first().height(maxImageHeight);
        });
      }
    });

    // Ensure modals keep auto height
    $('.modal .white-box-text').css('height', 'auto');

    console.log('Equalized heights for ' + $visibleTiles.length + ' tiles');
  }


  /* ---------- Normalizer ----------
     Bridges checkbox slug values (e.g. "ai-and-innovation") to the visible
     eyebrow label text (e.g. "AI & Innovation"). Also unifies "&" vs "and",
     collapses whitespace, and lowercases everything. Result: comparing a
     checkbox value to a label always matches even when the CMS surfaces
     them in different formats. */
  function normTopic(s) {
    return (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
  }


  /* ---------- Dropdown button label ----------
     Single-select mode (only one topic allowed at a time). Trigger text:
       0 checked → default HTML captured at page load (e.g. "Filter by topic ⌄")
       1 checked → "Filter: <topic>" with the chevron preserved

     Captured default handles whatever the CMS put in the button at load so
     we don't have to hardcode "Filter by topic" here. The chevron icon
     (<i class="fa fa-angle-down">) is captured separately and reappended
     after the "Filter: X" prefix so the trigger visually stays consistent. */
  /* Captured lazily on first use — the button may not exist in the DOM
     when this IIFE first runs, so we defer the initial HTML/icon capture
     until we actually need to update the label. */
  var defaultButtonHtml = null;
  var iconHtml          = null;

  function captureButtonDefaults($btn) {
    if (defaultButtonHtml !== null) return; // already captured
    defaultButtonHtml = $btn.html();
    var $icon = $btn.find('i').first();
    iconHtml = $icon.length ? $icon[0].outerHTML : '';

    /* Force the button label to wrap to a new line when it runs out of
       horizontal room. The confirmed-working combo is:
         padding: 5px 10px    (breathing room inside the button)
         overflow: hidden     (prevents any stray horizontal spill)
         white-space: break-spaces  (allows wrap to second line)
       Plus max-width: 100% + display: inline-block so the button sizes
       to its container. All inline !important via setProperty so no
       external CSS can override. */
    var btn = $btn[0];
    if (btn) {
      btn.style.setProperty('padding',       '5px 10px',     'important');
      btn.style.setProperty('overflow',      'hidden',       'important');
      btn.style.setProperty('white-space',   'break-spaces', 'important');
      btn.style.setProperty('max-width',     '100%',         'important');
      btn.style.setProperty('display',       'inline-block', 'important');
    }
  }

  function updateTopicButtonLabel($checkedBoxes) {
    var $topicButton = $('#etTopicMenu');
    if (!$topicButton.length) return;

    captureButtonDefaults($topicButton);

    if ($checkedBoxes.length === 0) {
      // Nothing selected — restore the exact default HTML (text + icon)
      $topicButton.html(defaultButtonHtml);
      return;
    }

    // Escape the label text (it's static content but $.text() is safest)
    var label = $checkedBoxes.first().closest('label').text().trim();
    var escapedLabel = $('<div>').text(label).html();

    $topicButton.html('Filter: ' + escapedLabel + iconHtml);
  }


  /* ---------- Filter (matches on p.content-label eyebrow, not data-category) ----------
     showAll = true is the "Explore" button path: reveal every tile,
     ignore checkbox state, hide the Explore button afterward. */
  function filterFunc(showAll) {
    var $filterCheckboxes  = $(CONFIG.filterDropdown + ' input[type="checkbox"]');
    var $checkedBoxes      = $filterCheckboxes.filter(':checked');
    var $exploreButtonWrap = $('#load-more-wrap');

    // Get selected categories (normalized)
    var selectedCategories = [];
    $checkedBoxes.each(function () {
      selectedCategories.push(normTopic($(this).val()));
    });

    // Keep the dropdown trigger label in sync with the current selection
    updateTopicButtonLabel($checkedBoxes);

    console.log('Filtering with categories:', selectedCategories);

    var $allTiles = $(CONFIG.mainSectionId + ' ' + CONFIG.tileClass);

    if (showAll === true) {
      // "Explore" button clicked — show all tiles
      $allTiles.show();
      $exploreButtonWrap.hide();
      console.log('Showing all ' + $allTiles.length + ' tiles');

    } else if (selectedCategories.length === 0) {
      // No filters — show only original (non-consolidated) tiles
      $allTiles.each(function () {
        var $tile = $(this);
        if ($tile.hasClass(CONFIG.consolidatedMarker)) {
          $tile.hide();
        } else {
          $tile.show();
        }
      });
      $exploreButtonWrap.show();

    } else {
      // Apply filters by eyebrow label text
      $exploreButtonWrap.show();

      $allTiles.each(function () {
        var $tile  = $(this);
        var $label = $tile.find('p.content-label').first();
        var shouldShow = false;

        if ($label.length) {
          var tileTopic = normTopic($label.text());
          shouldShow = selectedCategories.indexOf(tileTopic) !== -1;
        }

        $tile.toggle(shouldShow);
      });
    }

    var visibleCount = $allTiles.filter(':visible').length;
    console.log('Visible tiles: ' + visibleCount);

    setTimeout(function () { equalizeTileHeights(); }, 50);
  }


  /* ---------- Init ---------- */
  function initialize() {
    console.log('Initializing Change a Life tile system...');

    var success = consolidateTiles();

    if (!success) {
      console.error('Failed to consolidate tiles — check the section IDs in CONFIG');
      return;
    }

    // If a site-wide tileScale() helper exists, prefer it for equalization
    if (typeof tileScale === 'function') {
      console.log('Found existing tileScale function — will use it for height equalization');
      window.equalizeTileHeights = function () { tileScale(); };
    }

    // Equalize heights of initial tiles
    setTimeout(function () { equalizeTileHeights(); }, 100);

    // Event handlers
    var $filterCheckboxes = $(CONFIG.filterDropdown + ' input[type="checkbox"]');
    var $exploreButton    = $('#load-more');

    // Filter checkboxes — enforce single-select behavior. When one is
    // checked, uncheck all the others so only one topic is ever active.
    // Unchecking the current one still works (clears the filter).
    // Delegated from document for the same reason as the button toggle:
    // markup order / re-render safety.
    $(document).off('change.cal-filter').on('change.cal-filter',
      CONFIG.filterDropdown + ' input[type="checkbox"]',
      function () {
        var $this = $(this);
        if ($this.is(':checked')) {
          $(CONFIG.filterDropdown + ' input[type="checkbox"]').not($this).prop('checked', false);
        }
        filterFunc(false);
      });

    // Explore button — show all tiles
    $exploreButton.off('click').on('click', function (e) {
      e.preventDefault();
      console.log('Explore button clicked');

      // Clear filters
      $filterCheckboxes.prop('checked', false);

      // Show all tiles
      filterFunc(true);
    });

    // Prevent dropdown from closing when the user clicks a checkbox or
    // its wrapping label. Scoped narrowly (labels/inputs only, not the
    // whole <ul>) so Bootstrap's own dropdown open/close click handling
    // isn't blocked by the propagation stop.
    $(CONFIG.filterDropdown).on('click', 'label, input[type="checkbox"]', function (e) {
      e.stopPropagation();
    });

    /* Manual open/close for the trigger button, bound via document-level
       DELEGATION so it fires regardless of:
        - whether the button existed when our script ran
        - whether the button gets re-rendered by a later theme script
        - whether Bootstrap dropdown JS is loaded / working
       Owning this ourselves also sidesteps whatever was intercepting
       the click on desktop viewports (mobile worked with Bootstrap,
       desktop didn't). */
    $(document).off('click.cal-toggle').on('click.cal-toggle', '#etTopicMenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $btn  = $(this);
      var $menu = $(CONFIG.filterDropdown);
      var willOpen = !$menu.hasClass('show');
      $menu.toggleClass('show', willOpen);
      $btn.attr('aria-expanded', willOpen ? 'true' : 'false');

      /* Full inline-JS control — do not trust the site CSS at all. Some
         external rules use !important to hide the dropdown on hover;
         normal inline styles can't beat that. `setProperty(..., 'important')`
         writes an inline !important which does beat external !important
         per CSS specificity rules. Also pin position/z-index inline so
         the menu can't get clipped or hidden behind other stacking
         contexts. Everything cleared on close so no residue in the DOM. */
      var menu = $menu[0];
      if (!menu) return;

      if (willOpen) {
        menu.style.setProperty('display',   'block',    'important');
        menu.style.setProperty('position',  'absolute', 'important');
        menu.style.setProperty('top',       '100%',     'important');
        menu.style.setProperty('left',      '0',        'important');
        menu.style.setProperty('z-index',   '9999',     'important');
        menu.style.setProperty('visibility','visible',  'important');
        menu.style.setProperty('opacity',   '1',        'important');
      } else {
        menu.style.removeProperty('display');
        menu.style.removeProperty('position');
        menu.style.removeProperty('top');
        menu.style.removeProperty('left');
        menu.style.removeProperty('z-index');
        menu.style.removeProperty('visibility');
        menu.style.removeProperty('opacity');
      }
    });

    // Outside click closes the dropdown (matches Bootstrap behavior).
    $(document).off('click.cal-outside').on('click.cal-outside', function (e) {
      var $btn  = $('#etTopicMenu');
      var $menu = $(CONFIG.filterDropdown);
      if (!$btn.is(e.target) && !$menu.has(e.target).length && !$btn.has(e.target).length) {
        $menu.removeClass('show');
        $btn.attr('aria-expanded', 'false');
        // Strip every inline !important we set on open so the site CSS
        // can control the closed state without our overrides lingering.
        var menu = $menu[0];
        if (menu) {
          ['display', 'position', 'top', 'left', 'z-index', 'visibility', 'opacity']
            .forEach(function (prop) { menu.style.removeProperty(prop); });
        }
      }
    });

    // Also equalize on window resize (debounced)
    $(window).on('resize.tileHeight', function () {
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(function () {
        equalizeTileHeights();
      }, 250);
    });

    console.log('Initialization complete!');
  }

  // Wait a bit for page to load, then initialize
  setTimeout(initialize, CONFIG.initDelay);

});
