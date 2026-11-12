
/* ---------- RBCCM structured data (JSON-LD) ----------
   Loads the automatic JSON-LD builder on every page.
   Builder: /assets/rbccm/js/components/rbccm-json-schema-auto.js
   Bump ?v= after each upload of the builder. */
(function (d) {
  if (d.querySelector('script[data-rbccm-jsonld-loader]')) return;
  var s = d.createElement('script');
  s.src = '/assets/rbccm/js/components/rbccm-json-schema-auto.js?v=2026-11-09';
  s.async = true;
  s.setAttribute('data-rbccm-jsonld-loader', '');
  (d.head || d.documentElement).appendChild(s);
})(document);
