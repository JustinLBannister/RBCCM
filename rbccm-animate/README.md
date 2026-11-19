# RBCCM Animate

A small script that fades page content in: hero content as the page loads, and sections as they scroll into view. It is shared by the pages built from `rbccm-*` components, so they all move with the same pacing. It has no fields and no skin of its own.

---

## For editors and BAs

### Purpose

Gives pages their fade-in motion. Each component decides in its own skin which of its parts animate; this script does the animating. It is in the script bundle of every page in the build config: US Credentials and MAAS+MATA (live), and Strategy & Economics, ETF Innovators and 2027 Outlook (in progress).

Components whose skins use it today: Accordions, Awards, Capability cards, Expertise, Featured insights, Hero, Host profile, In the media, Insight cards, Insight list, Intro statement, Leading experts, Numbered features, Platforms, Two-up cards, Video poster.

### What the editor can change

- Nothing. There is no component to add and there are no fields. Which elements animate, in what order and how fast is set in each component's skin.

### What it does not do

- It does not add, remove or reorder content. Everything it animates is already in the page.
- It does not offer a per-page or per-section on/off switch for editors.
- It does not replay an animation when a visitor scrolls back up.
- It does not drive carousels, accordions, video or any other interaction. Those belong to their own components.

### Limits

- Four animations are built in: fade in, fade in up, fade in down and fade in from the right. Other animation names only work on a page that also loads the animate.css library.
- Timing (delay, duration, stagger between items) is set per element in the skin, not by the editor.

### Empty and edge cases

- Scripts off or blocked: this script adds its own "start hidden" rule, so by itself it hides nothing when it does not run. But several components also carry that rule in their own stylesheet, so their animated parts stay invisible until this script runs: CTA band, Host profile, Insight cards and Insight list. The content is still in the page source; it is only hidden from view.
- The exception is visitors who have asked their device to reduce motion: those four components show everything at once, script or no script.
- Older browsers that cannot detect scrolling into view: scroll-triggered content is shown straight away.
- Adding `?noanim=1` to a page address shows everything immediately with no motion. This is for full-page screenshots and reviews.

### Accessibility

- Visitors who have asked their device to reduce motion get no fades or slides; all content shows at full opacity from the start.
- The script changes only how content appears. It does not change reading order, focus or what assistive technology announces.

### Open questions

- Whether content should stay hidden when scripts do not run. Today it does for the four components listed above; the alternative is to have the script, not each stylesheet, own the "start hidden" rule.

---

## TeamSite locations

| What | Where |
|---|---|
| JS | `/default/main/internet/rbccm/WORKAREA/shared/assets/rbccm/js/components/rbccm-animate.js` |

On the site this loads from `/assets/rbccm/js/components/rbccm-animate.js`.

There is no TeamSite component for this folder; it is a shared file other components use.

## Files

| File | What it is |
|---|---|
| `rbccm-animate.js` | The script. Ships to `/assets/rbccm/js/components/`. Its opening comment lists the attributes a skin can use. |
| `animate.min.css` | Local copy of the animate.css library, for pages or previews that want animations beyond the four built in. |
| `local-test.html` | Local preview. Not deployed. |
