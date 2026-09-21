/* =========================================================================
   RBCCM Capability Cards — runtime  (no-op stub)
   Deploy path: /assets/rbccm/js/components/rbccm-capability-cards.js

   Status
   =========================================================================
   The mobile Slick carousel has been dropped from this component for
   the initial release. Cards stack vertically at mobile via CSS
   (flex-column on `.rbccm-capability-cards__grid`) and flow into the
   3-up / 4-up desktop row at 992+ via flex-row. No JS behavior is
   required to render the component in its current form.

   This file stays present so consumers with the standard
   `<script src=".../rbccm-capability-cards.js"></script>` include
   don't 404, and so the JS path Datum in properties.xml has a real
   target. If we re-add the mobile carousel later, wire the Slick
   loader + init back in here (see git history or rbccm-awards.js for
   the reference pattern). Intentionally jQuery-free so the include
   doesn't force a jQuery dependency on pages that would otherwise
   ship without it.
   ========================================================================= */
(function () {
  'use strict';
  // No-op: layout is entirely CSS-driven.
}());
