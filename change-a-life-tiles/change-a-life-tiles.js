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


  /* ---------- Filter ----------
     showAll = true is the "Explore" button path: reveal every tile,
     ignore checkbox state, hide the Explore button afterward. */
  function filterFunc(showAll) {
    var $filterCheckboxes  = $(CONFIG.filterDropdown + ' input[type="checkbox"]');
    var $exploreButton     = $('#load-more');
    var $exploreButtonWrap = $('#load-more-wrap');

    // Get selected categories
    var selectedCategories = [];
    $filterCheckboxes.filter(':checked').each(function () {
      selectedCategories.push($(this).val());
    });

    console.log('Filtering with categories:', selectedCategories);

    var $allTiles = $(CONFIG.mainSectionId + ' ' + CONFIG.tileClass);

    if (showAll === true) {
      // "Explore" button clicked — show all tiles
      $allTiles.show();
      $exploreButtonWrap.hide();
      console.log('Showing all ' + $allTiles.length + ' tiles');

    } else if (selectedCategories.length === 0) {
      // No filters — show only original tiles
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
      // Apply filters
      $exploreButtonWrap.show();

      $allTiles.each(function () {
        var $tile = $(this);
        var $categoryElement = $tile.find('[data-category]').first();

        if ($categoryElement.length > 0) {
          var categories = $categoryElement.attr('data-category');
          var shouldShow = false;

          if (categories) {
            var tileCategories = categories.split(' ');
            for (var i = 0; i < selectedCategories.length; i++) {
              if (tileCategories.indexOf(selectedCategories[i]) !== -1) {
                shouldShow = true;
                break;
              }
            }
          }

          $tile.toggle(shouldShow);
        } else {
          $tile.hide();
        }
      });
    }

    var visibleCount = $allTiles.filter(':visible').length;
    console.log('Visible tiles: ' + visibleCount);

    // Equalize heights after filtering
    setTimeout(function () {
      equalizeTileHeights();
    }, 50);
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

    // Filter checkboxes
    $filterCheckboxes.off('change').on('change', function () {
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

    // Prevent dropdown from closing on click inside
    $(CONFIG.filterDropdown).on('click', function (e) {
      e.stopPropagation();
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
