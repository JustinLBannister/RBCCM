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

The skin now does everything itself. The pages no longer need `podcast-episode-replacer.js`.

Each podcast page's banner component gets an episode query: the same query as that page's story tiles, newest first. Both "generic" branches use it:

- **`PODCAST_TRIGGER`** takes the newest result that has a Captivate episode URL. The Start listening button is a real link to that episode's page, e.g. `/en/insights/2026/09/whats-driving-biotechs-latest-rally`, built from the result's path. If the path can't be turned into a page URL, the link is the Captivate player URL instead. The button is the link itself (no link wrapped around a button).
- **Click:** a few lines of inline script press that episode's "Play episode" button in the story tiles, so the tiles' own player opens at the bottom of the window. That player and its close button are handled by the story tiles component's script, which is already on every podcast page. Closing the player returns focus to Start listening. If the episode isn't in the tiles, the first tile with audio plays. If there are no tiles, the link goes to the episode page.
- **No query, or no episode in the results:** the button and player are left out, with an HTML comment in the source saying why. There is never a broken link.

The CTA Link field is no longer used, so it can't go stale. The button title is now "Start listening to {page title}" instead of the copied "Strategic alternatives podcast".

When a new episode is published, the next page publish or cache refresh picks it up. Nothing needs editing.

---

## Files

| File | What it is |
|---|---|
| `campaign-banner.xsl` | Updated skin. |
| `campaign-banner-episode-query.xml` | The `<External>` episode query to add to the banner component on each podcast page. |
| `_production/campaign-banner.xsl` | Copy of the live skin before the change. Do not edit. |

---

## Deploy checklist

1. Replace the M&A Fall 2022 skin in TeamSite with `campaign-banner.xsl`.
2. On each podcast page, add the `<External>` block from `campaign-banner-episode-query.xml` to the banner component. Copy the query from that page's story tiles (only the sitelocation changes).
3. Remove the `podcast-episode-replacer.js` script tag from the four podcast pages (Biopharma and Powering Sustainable Ideas load `/sub/test/`, Macro Minutes and Markets in Motion load `/sub/podcasts/`). Leave it on Strategic Alternatives, which still uses it. If the tag stays for a while, nothing breaks: the script takes over the click and opens its own player instead of the tiles' player.
4. Publish, then view the page source. `p.hero-cta` should hold `<a class="btn-play-audio generic-link" id="podcast-trigger" href="/en/insights/...">` pointing at the first story tile's episode.
5. Click Start listening and check the player opens the first story tile's episode.

---

## Related: story tile links

On Biopharma and Powering Sustainable Ideas, the story tiles' links in the page source are `/en/insights/templatedata/article/story/data/...`, which return 404. The browser shows the clean `/en/insights/yyyy/mm/slug` link after the page loads, but crawlers reading the source see the 404 form. Macro Minutes already outputs clean links. The story tiles skin needs the same fix as above.
