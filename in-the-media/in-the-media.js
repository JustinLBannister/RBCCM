(async function brokenLinkChecker() {
  const isSameOrigin = (href) => {
    try { return new URL(href).origin === window.location.origin; }
    catch(e) { return false; }
  };
  const stripAnchor = (anchor) => {
    const parent = anchor.parentNode;
    parent.replaceChild(document.createTextNode(anchor.textContent), anchor);
  };
  const report = { checked: 0, broken: [], ok: [] };
  for (const item of document.querySelectorAll('.news-item')) {
    const anchor = item.querySelector('a[href]');
    if (!anchor) continue;
    const rawHref = anchor.getAttribute('href') || '';
    if (!rawHref || rawHref === '#' || rawHref.startsWith('mailto:') || rawHref.startsWith('#')) {
      if (rawHref === '#') { stripAnchor(anchor); report.broken.push({ href: anchor.href, reason: 'Hash-only (#)' }); }
      continue;
    }
    report.checked++;
    let broken = false, reason = '';
    try {
      const opts = isSameOrigin(anchor.href)
        ? { method: 'HEAD', signal: AbortSignal.timeout(10000) }
        : { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(10000) };
      const res = await fetch(anchor.href, opts);
      if (isSameOrigin(anchor.href) && (res.status === 404 || res.status === 410 || res.status >= 500)) {
        broken = true; reason = `HTTP ${res.status}`;
      }
    } catch(e) {
      if (e.name === 'AbortError' || e.message.includes('Failed to fetch')) {
        broken = true; reason = e.name === 'AbortError' ? 'Timeout' : 'Network error';
      }
    }
    if (broken) { stripAnchor(anchor); report.broken.push({ href: anchor.href, reason }); }
    else report.ok.push({ href: anchor.href });
  }
  console.log('Broken & stripped:', report.broken);
  console.log('OK:', report.ok);
  return report;
})();