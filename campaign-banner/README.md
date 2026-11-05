# Campaign Banner (podcast pages)

The hero banner on the podcast pages (TeamSite skin "M&A Fall 2022"). This folder holds the fix for the Start listening button.

Pages: `/en/insights/podcasts/biopharma`, `/macro-minutes`, `/markets-in-motion`, `/powering-sustainable-ideas`. Strategic Alternatives uses the same skin with CTA Type "podcast" and is not affected.

---

## The problem

With CTA Type "generic", the skin wrapped the Start listening button in `<a class="generic-link" href="{CTA Link}">`:

- Biopharma's CTA Link was the word `Link`, so the page source linked to `/en/insights/podcasts/Link` (404). Emptying the field gives `href=""`, which is still a link.
- The other three pages had a typed-in Captivate URL that was one or two episodes old.
- The player script adds its overlay straight after the button, which put the player inside that link.

Visitors never followed the link (the script takes over the click), but crawlers read it from the page source.

---

## The fix

The skin now handles the button itself, using the story tiles already on the page. No query or extra field is needed, the component's Data XML (including the breadcrumb navigation External) is unchanged, and the pages no longer need `podcast-episode-replacer.js`.

On a podcast page (CTA Link empty, a placeholder like `Link`, or a Captivate URL):

- **Page source:** the button links to `#episode-title-1`, the first story tile's heading on the same page. It can never go stale or 404.
- **After the page loads:** the link is set to the first story tile's episode page, e.g. `/en/insights/2026/10/votes-and-volatility`.
- **Click:** presses the first tile's "Play episode" button, so the tiles' own player opens at the bottom of the window with the newest episode. That player and its close button are handled by the story tiles component's script, which is already on every podcast page. Closing the player returns focus to Start listening.

The button is the link itself (no link wrapped around a button), and its title is now "Start listening to {page title}" instead of the copied "Strategic alternatives podcast".

Other pages using the generic CTA with a real page URL in CTA Link (starting with `/` or `http`, not a Captivate link) get the same output as before.

When a new episode is published, it becomes the first story tile and the button follows. Nothing needs editing.

---

## Files

| File | What it is |
|---|---|
| `campaign-banner.xsl` | Updated skin. |
| `_production/campaign-banner.xsl` | Copy of the live skin before the change. Do not edit. |

---

## Deploy checklist

1. Replace the M&A Fall 2022 skin in TeamSite with `campaign-banner.xsl`.
2. Remove the `podcast-episode-replacer.js` script tag from the four podcast pages (Biopharma and Powering Sustainable Ideas load `/sub/test/`, Macro Minutes and Markets in Motion load `/sub/podcasts/`). Leave it on Strategic Alternatives, which still uses it. If the tag stays for a while, nothing breaks: the script takes over the click and opens its own player instead of the tiles' player.
3. Optional: clear CTA Link on the four pages. The skin ignores Captivate URLs and placeholders there, so this is only tidying.
4. Publish, then view the page source: `p.hero-cta` should hold `<a class="btn-play-audio generic-link" id="podcast-trigger" href="#episode-title-1">`.
5. Click Start listening and check the tiles' player opens on the first story tile's episode.

---

## Related: story tile links

On Biopharma and Powering Sustainable Ideas, the story tiles' links in the page source are `/en/insights/templatedata/article/story/data/...`, which return 404. The browser shows the clean `/en/insights/yyyy/mm/slug` link after the page loads, but crawlers reading the source see the 404 form. Macro Minutes already outputs clean links. The story tiles skin needs to output the clean form.
