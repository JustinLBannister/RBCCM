# Local test fixtures

Files in this folder replicate what the production RBCCM feed URLs return,
letting you exercise the tiles feed enhancement locally without hitting
`www.rbccm.com` (which would fail CORS anyway from a browser opening
local files).

## Files

| File | Mirrors | How to refresh |
|------|---------|----------------|
| `whitelist.json` | `/assets/rbccm/js/components/data/conference-insights-whitelist.json` | Copy from `../conference-insights-whitelist.json` after regenerating from Joe's CSV |
| `2025-insights.xml` | `https://www.rbccm.com/en/insights/data/2025-insights` | Visit the URL in a browser, view source, paste the full `<root>...</root>` block |
| `2026-insights.xml` | `https://www.rbccm.com/en/insights/data/2026-insights` | Same as above but for 2026 |

## Running the local test

Because `fetch()` from a `file://` URL is blocked by browsers, serve the
folder over a tiny HTTP server first:

```bash
cd /Users/bannister/Documents/Freelance/RBCCM
python3 -m http.server 8000
```

Then open http://localhost:8000/conference-insights.html in your browser.

The `conference-insights.html` file has a `window.RBCCM_FEED_CONFIG` block
in its `<head>` that points the feed script at these fixture files. If you
also want to test with production data, delete or comment out that block
and the feed will fall back to hitting `/en/insights/data/{year}-insights`
directly — which still won't work from localhost due to CORS, but is a
useful test that the fallback path resolves correctly.
