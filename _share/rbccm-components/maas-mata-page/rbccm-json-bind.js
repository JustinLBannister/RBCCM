/**
 * RBCCM JSON Bind
 * ------------------------------------------------------------------
 * Tiny runtime that populates pre-rendered HTML from a JSON file
 * via data-* attributes. Lets content live in JSON while HTML/CSS/JS
 * stay under dev control.
 *
 * Publishing model:
 *   - Content editor drafts JSON in the CMS form (leadership-cms-prototype
 *     style)
 *   - Editor sends the JSON file to the dev
 *   - Dev drops it into /js/data/<page>.json on the RBCCM server
 *   - This script picks it up on next page load — no HTML edit needed
 *
 * Fallback behaviour:
 *   - If fetch succeeds → JSON values overwrite placeholder copy
 *   - If fetch fails (404, offline, blocked) → falls back to
 *     inline #fallback-data script if present
 *   - If neither → leaves the placeholder copy untouched (SEO/no-JS
 *     safe)
 *
 * Supported attributes:
 *   data-json="path.to.value"        → textContent = value.
 *                                       Empty string or "." means the
 *                                       whole current scope (useful for
 *                                       lists of primitive strings).
 *   data-json-html="path.to.value"   → innerHTML = value (use for
 *                                       body copy with <p>, <em>, etc.)
 *   data-json-attr-<name>="path"     → setAttribute(<name>, value)
 *                                       e.g. data-json-attr-href,
 *                                       data-json-attr-src,
 *                                       data-json-attr-alt
 *   data-json-list="path.to.array"   → clones the <template> inside
 *                                       once per array item; child
 *                                       data-json paths are resolved
 *                                       relative to that item
 *   data-json-if="path.to.value"     → hides the element if falsy
 *   data-json-class-<name>="path"    → toggles class <name> based on
 *                                       truthiness of value (useful for
 *                                       positive/negative deltas)
 *   data-json-class="path"           → appends the string value as a
 *                                       class name (useful for theme
 *                                       variants like "light"/"dark")
 *
 * Usage:
 *   <script src="/js/rbccm-json-bind.js"></script>
 *   <script>
 *     RBCCMBind.load({
 *       url: '/js/data/maas-mata.json',
 *       fallbackSelector: '#fallback-data',
 *       root: document.getElementById('maas-mata-page')
 *     });
 *   </script>
 */
(function (global) {
  'use strict';

  var RBCCMBind = {};
  var DEBUG = true;

  // ---- Utilities ------------------------------------------------
  function log()  { if (DEBUG && global.console) console.log.apply(console, ['[JSON-Bind]'].concat([].slice.call(arguments))); }
  function warn() { if (global.console) console.warn.apply(console, ['[JSON-Bind]'].concat([].slice.call(arguments))); }
  function err()  { if (global.console) console.error.apply(console, ['[JSON-Bind]'].concat([].slice.call(arguments))); }

  // getPath({a:{b:1}}, "a.b") -> 1
  // Empty/null path or "." returns the object itself (useful in a list
  // of primitive strings — bind with data-json="")
  function getPath(obj, path) {
    if (obj == null) return undefined;
    if (path == null || path === '' || path === '.') return obj;
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  // Skip elements that are inside an un-rendered <template>
  function insideTemplate(el) {
    var p = el.parentNode;
    while (p) {
      if (p.nodeName === 'TEMPLATE') return true;
      p = p.parentNode;
    }
    return false;
  }

  // Skip elements that live INSIDE a data-json-list container. Once
  // renderList has run, item scopes have already been recursively
  // bound with each item's data. If the outer bindScope pass then
  // re-visits those descendant elements with the WHOLE data object,
  // the empty-path lookup returns the whole object and textContent
  // becomes "[object Object]" — which is exactly the MAAS+MATA
  // headlineLines bug this guard prevents.
  function insideList(el) {
    var p = el.parentNode;
    while (p) {
      if (p.nodeType === 1 && p.hasAttribute && p.hasAttribute('data-json-list')) return true;
      p = p.parentNode;
    }
    return false;
  }

  // ---- Core binding ---------------------------------------------
  function bindScope(root, data) {
    if (!root || data == null) return;

    // 1) Lists first — they create children other bindings will apply to
    var lists = root.querySelectorAll ? root.querySelectorAll('[data-json-list]') : [];
    for (var i = 0; i < lists.length; i++) {
      if (insideTemplate(lists[i])) continue;
      renderList(lists[i], data);
    }

    // 2) Text bindings
    //    insideList guard: any descendant of a data-json-list container
    //    was already bound by renderList's recursive bindScope call with
    //    its own item data. Re-binding here with the WHOLE data object
    //    would clobber the string items with String(fullData) =
    //    "[object Object]".
    var textEls = root.querySelectorAll('[data-json]');
    for (var j = 0; j < textEls.length; j++) {
      var el = textEls[j];
      if (insideTemplate(el) || insideList(el)) continue;
      var val = getPath(data, el.getAttribute('data-json'));
      if (val != null) el.textContent = String(val);
    }

    // 3) innerHTML bindings
    var htmlEls = root.querySelectorAll('[data-json-html]');
    for (var k = 0; k < htmlEls.length; k++) {
      var elH = htmlEls[k];
      if (insideTemplate(elH) || insideList(elH)) continue;
      var valH = getPath(data, elH.getAttribute('data-json-html'));
      if (valH != null) elH.innerHTML = String(valH);
    }

    // 4) Attribute bindings + class toggles (single pass through elements
    //    that carry data-json-attr-* / data-json-class-*)
    var allEls = root.querySelectorAll('*');
    for (var m = 0; m < allEls.length; m++) {
      var elA = allEls[m];
      if (insideTemplate(elA) || insideList(elA)) continue;
      if (!elA.attributes || !elA.attributes.length) continue;
      // Iterate over a copy — setAttribute during iteration is fine, but
      // we don't want to trip on live NamedNodeMap semantics on old IE
      var attrs = [].slice.call(elA.attributes);
      for (var n = 0; n < attrs.length; n++) {
        var a = attrs[n];
        if (a.name.indexOf('data-json-attr-') === 0) {
          var attrName = a.name.substring('data-json-attr-'.length);
          var valA = getPath(data, a.value);
          if (valA != null) elA.setAttribute(attrName, String(valA));
        } else if (a.name === 'data-json-class') {
          // Append raw string value as a class name
          var valS = getPath(data, a.value);
          if (valS != null && String(valS).length) elA.classList.add(String(valS));
        } else if (a.name.indexOf('data-json-class-') === 0) {
          var className = a.name.substring('data-json-class-'.length);
          var valC = getPath(data, a.value);
          if (valC) elA.classList.add(className);
          else      elA.classList.remove(className);
        }
      }
    }

    // 5) Conditional hide
    var ifEls = root.querySelectorAll('[data-json-if]');
    for (var p = 0; p < ifEls.length; p++) {
      var elI = ifEls[p];
      if (insideTemplate(elI) || insideList(elI)) continue;
      var valI = getPath(data, elI.getAttribute('data-json-if'));
      if (!valI) elI.hidden = true;
      else       elI.hidden = false;
    }
  }

  // Render an array into a container by cloning its <template>
  function renderList(container, data) {
    var listPath = container.getAttribute('data-json-list');
    var arr = getPath(data, listPath);
    if (!Array.isArray(arr)) { warn('data-json-list "' + listPath + '" is not an array (got ' + typeof arr + ')'); return; }

    // Template supplies the row markup. Prefer an explicit <template>
    // child; if none exists, promote the first element child (an
    // XSL-rendered fallback card) to serve as the implicit template.
    // That lets list-bound sections work without every fallback needing
    // its own <template> block hand-written.
    var tpl = null;
    var childNodes = container.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      if (childNodes[i].nodeName === 'TEMPLATE') { tpl = childNodes[i]; break; }
    }
    if (!tpl) {
      var firstEl = null;
      for (var j = 0; j < childNodes.length; j++) {
        if (childNodes[j].nodeType === 1 && childNodes[j].nodeName !== 'TEMPLATE') { firstEl = childNodes[j]; break; }
      }
      if (!firstEl) { warn('data-json-list "' + listPath + '" has no <template> or fallback child'); return; }
      tpl = document.createElement('template');
      tpl.innerHTML = firstEl.outerHTML;
      container.insertBefore(tpl, container.firstChild);
    }

    // Clear ALL non-template element children before rendering — this
    // catches previous clones (data-json-list-item), explicit fallback
    // markers (data-json-list-fallback), AND unattributed XSL fallback
    // children (e.g. award cards written straight in the skin). Without
    // this the JSON items append after the fallbacks and the list
    // renders twice.
    var kids = container.childNodes;
    var stripped = [];
    for (var k = 0; k < kids.length; k++) {
      if (kids[k].nodeType === 1 && kids[k].nodeName !== 'TEMPLATE') stripped.push(kids[k]);
    }
    for (var r = 0; r < stripped.length; r++) stripped[r].parentNode.removeChild(stripped[r]);

    // Clone template once per item
    for (var idx = 0; idx < arr.length; idx++) {
      var frag = tpl.content ? tpl.content.cloneNode(true) : null;
      // Fallback for browsers without HTMLTemplateElement.content (very old)
      if (!frag) {
        var wrap = document.createElement('div');
        wrap.innerHTML = tpl.innerHTML;
        frag = document.createDocumentFragment();
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
      }

      // Mark top-level element children as list items so we can remove
      // them next render, and so nested lookups skip them (belt +
      // braces — insideTemplate already handles this)
      var top = [];
      for (var t = 0; t < frag.childNodes.length; t++) {
        if (frag.childNodes[t].nodeType === 1) top.push(frag.childNodes[t]);
      }
      for (var u = 0; u < top.length; u++) top[u].setAttribute('data-json-list-item', '');

      // Wrap in a temporary element so we can query into it, then move
      // children into the container
      var scope = document.createElement('div');
      scope.appendChild(frag);
      bindScope(scope, arr[idx]);

      // Move rendered children into container in order
      while (scope.firstChild) container.appendChild(scope.firstChild);
    }
  }

  // ---- Public API -----------------------------------------------
  RBCCMBind.render = function (data, root) {
    bindScope(root || document.body, data);
  };

  RBCCMBind.load = function (opts) {
    opts = opts || {};
    var url = opts.url;
    var fallbackSelector = opts.fallbackSelector;
    var root = opts.root || document.body;
    var onRendered = typeof opts.onRendered === 'function' ? opts.onRendered : null;
    if (opts.debug === false) DEBUG = false;

    function useFallback() {
      if (!fallbackSelector) return null;
      var el = document.querySelector(fallbackSelector);
      if (!el) { warn('No fallback element at ' + fallbackSelector); return null; }
      try { return JSON.parse(el.textContent); }
      catch (e) { err('Fallback parse error:', e); return null; }
    }

    function apply(data, source) {
      try {
        bindScope(root, data);
        log('Rendered from', source);
        if (data && data.meta && data.meta.title) document.title = data.meta.title;
        // Post-render hook — page-level scripts use this for touch-ups
        // that data-json attributes can't express (e.g. class swaps
        // driven by an attribute value written by data-json-attr-*).
        if (onRendered) {
          try { onRendered(data, root); }
          catch (e) { err('onRendered callback error:', e); }
        }
      } catch (e) { err('Render error:', e); }
    }

    if (url && typeof fetch === 'function') {
      fetch(url, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) { apply(data, url); })
        .catch(function (e) {
          log('Fetch failed (' + e.message + '), using fallback');
          var d = useFallback();
          if (d) apply(d, 'inline-fallback');
          else   log('No fallback — leaving placeholder content in place');
        });
    } else {
      var d = useFallback();
      if (d) apply(d, 'inline-fallback');
    }
  };

  global.RBCCMBind = RBCCMBind;
})(window);
