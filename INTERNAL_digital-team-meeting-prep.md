# The 3 P's

## Process → Platform → Passiveness

_Internal meeting prep. Not for client distribution._

---

## In short

**The process is paramount to anything else. The process relies on the platform, and the platform relies on the process — but that's created a passive approach that doesn't have any initiative or forward thinking built into it.**

---

## P1 — Process

**Fifteen-plus months of improvements deflected by process language.**

> **The core problem is this: the process — no matter how wrong or how right — is used always.**
>
> For 15+ months, sticking to it has produced inaccurate brand representation, broken designs, execution errors, and things that ship half-built. The process itself is the constant source of those failures, and it's still the default answer to every question. It's antiquated. It has no forward thinking built into it. It doesn't need to be used anymore.

> **The feedback-loop problem — LJ has raised this too.**
>
> I've built innovations specifically to speed up the content-side back-and-forth — inline Datum comments, editor-guide docs, JSON-driven previews. Content side wants those. Marketing wants those. Digital side hasn't prioritized adopting them.
>
> Concrete example: the most recent design build has received about five minutes of feedback, total. Not five minutes per session — five minutes cumulative. That's not "the process is slow." That's "the process isn't running on the digital side at all."

> **Same work, opposite receptions.**
>
> Every time I bring something new to the digital side, the first response is: "Well, but what about this? What about process?" Never once, in 15+ months, has an innovation been met with "oh, this is great." There's always a problem. "It's not intuitive." "That's not how we do it." "But the framework…"
>
> Meanwhile — marketing, June, LJ — love what I bring. Because it's thinking ahead. It's anticipating what could be. It's forward motion, not a reactive audit of every proposal.
>
> The exact same work. Two opposite receptions. The one that blocks it is the one inside the digital team.
>
> **How does anyone inspire creativity when every idea is treated as problematic instead of as forward motion?**


| Action (what I brought) | Reaction (the process response) |
|---|---|
| Improvements, innovations, time-savers, feedback-loop reductions | "That's not our process." |
| Modern approaches (BEM, componentization, Preset architecture) | "It's not in the framework." |
| Editor-friendly Datum patterns with inline comments | "It's not intuitive." |
| Any net-new proposal | "Be innovative." (then shot down when I am) |
| A shipped, working improvement | "Great job!" (with no adoption, no rollout) |
| Water-cooler / direct conversations that inspire collaboration | "Route everything through Claudia." |
| Marketing (June, LJ) reaches me because it's fast | "Redirect them to Claudia." (slower — nothing gets done) |
| Cross-team informal collaboration | "Not practical." (per the routing rule) |
| Sharing progress with marketing early | "Going around us." Not sharing? "Hiding it." No-win. |

**Bottom line on Process:** the door is always open in language, always closed in practice. The routing rule kills the informal collaboration that actually moves work. Every improvement is either process-blocked, framework-blocked, or praised into a drawer.

---

## P2 — Platform

**A legacy platform we're afraid to touch — used for work it wasn't built for.**

> **The platform itself is antiquated.** Bootstrap, legacy CSS, jQuery, old components — the whole foundation.
>
> Modern CSS (Grid, Flexbox, custom properties, container queries) can accomplish what Bootstrap does with less code, better responsiveness, and no framework debt. Figma's own dev-mode exports usable CSS we could treat as an exact spec — pixel-accurate, tokenized, ready to drop in.
>
> Instead we do "round up, round down" — take a Figma design, force it into Bootstrap's grid, override what breaks, and end up with a build that doesn't match the design and doesn't match the framework either. That's not a compromise, it's the worst of both.

> **BEM isn't AI. It's industry standard.**
>
> Lauren asked if the class names were AI-generated. They're not. BEM (Block-Element-Modifier) is a standard CSS component methodology used by **Google, Stripe, CBRE, Home Depot** — every serious front-end team you can name. It's the same approach any modern component library ships with.
>
> The fact that the question was even asked points at the real issue: the team's frame of reference doesn't extend past Bootstrap and TeamSite. Not their fault — but a matter of fact. And it's why any modernization proposal gets read as "weird" instead of "standard."

> **This has implications for the CMS migration.**
>
> If the plan is to move to .cms, React, Vue, or any modern framework, the team as currently trained can't execute in it. They only know one method of working — legacy TeamSite + Bootstrap classes. Modern components, JSX/SFC patterns, utility-first CSS, design tokens — none of that is in the toolkit.
>
> I have very low confidence in the team's ability to execute a modern build post-migration without significant re-skilling. That's a bigger risk than "will Justin document conferences well enough."

> **"Work within the framework" vs. "match the design."**
>
> Lauren's phrasing was: "I know you're trying to do Figma to page one-to-one, but we need to work within the framework."
>
> If maintaining design integrity is negotiable, then what is the design *for*? What's the point of the Figma? What's marketing paying GlueIQ for? The developer's core job — the reason the role exists at all — is to translate the design into a working page as faithfully as the medium allows. "Work within the framework" as a reason to miss the design is not a technical constraint. It's a decision to lower the bar.

> **There is no QA environment. Everything happens in production.**
>
> I found out recently that there's no stable QA-to-production pipeline. No staging. Every build, every fix, every change happens in production. That explains a lot — including the "could break the site" fear that came up around updating Bootstrap. Of course people are afraid to touch anything. There's no safety net.
>
> That's an infrastructure problem, not a component problem. It's also why the new components I'm building don't carry the same risk profile: they're self-contained, namespaced, and I've validated the inputs. I know they render exactly how they should because I control the environment for each one. That's not luck — that's what a QA process would give the whole team, on every build, if one existed.


| Action (what makes sense) | Reaction (what actually happens) |
|---|---|
| Use BEM — framework-independent, portable, industry-standard | "You have to use Bootstrap." |
| Update Bootstrap so we're not out of date | "That could break the site." (from 2 months ago) |
| Build for the modern visual bar marketing/GlueIQ is designing to | "Fit it into existing components." (which the designs don't fit) |
| Build forward — the CMS is migrating anyway | "Not until the CMS migrates." (which never has a date) |
| Consolidate components into Preset architecture | New one-off components get built alongside, not folded in |
| Deprecate old folders (how-we-think, featured-conferences) into tabbed-panels | Old folders stay, still get referenced, still get maintained |
| Standardize on real `<img>` + alt for a11y | Some components still use bg-image, different a11y treatments |
| One shared runtime (icon-carousel multi-instance loader, rbccm-json-bind) | Each new build gets its own bespoke init script |
| BEM namespace prevents CSS collisions | Legacy IDs + Bootstrap classes still get added, so both systems coexist |

**Bottom line on Platform:** the system is admittedly broken, admittedly can't be touched, admittedly won't survive the CMS migration — yet is the mandated foundation for every new build. Every project adds surface area instead of collapsing it. Fragmentation isn't a Justin problem; it's the default outcome of "don't touch anything."

---

## P3 — Passiveness

**Process applied to platform produces passiveness.**

> **The passive aspect is this: everyone waits to be told what to do.**
>
> Someone comes across a problem, a hiccup, an edge case — and the default move is to look outward for the answer instead of proposing one. Nobody says "hey, what about this?" They wait. They escalate. They defer.
>
> That's not laziness. That's not incompetence. It's the learned response of a team where every proactive suggestion gets deflected by process or by platform. Passiveness is the safest strategy in a system that punishes initiative.

> **The routing rule makes it worse.**
>
> Every conversation gets routed through Claudia — translated to marketing, to June, to Lauren, whoever — and then we wait for a response instead of bringing an idea forward, collaborating transparently, and iterating on it in real time. That's not collaboration. That's queue management.
>
> Bulk feedback and shared visibility matter, yes. But a one-off "hey, what do you think about this?" doesn't need a PM as an intermediary every single time.

> **And it's paired with over-communication.**
>
> Meanwhile we're getting Asana notifications, emails, Slack pings, immediate follow-ups on everything. The system is somehow both too slow (routing) and too noisy (notifications) at the same time.
>
> Let people own their assignments. Let people own their responsibilities. Let things get done without a wrapper of PM translation and channel spam around every decision.


| Symptom | Root cause (P1 + P2) |
|---|---|
| Team only works on what's assigned, nothing forward-looking | Every forward-looking proposal is process-blocked |
| Marketing bypasses digital and comes to me directly | The official channel is too slow to be useful |
| Same conversations recur every quarter with no movement | No mechanism exists to make a real decision |
| The audit last week found duplicated components, coexisting runtimes, legacy + BEM CSS on the same page | Nobody is authorized to say "kill the old one" |
| "When we move to the new CMS…" for 12+ months running | Deferral is easier than deciding |
| Even standing syncs (last year with June, recent attempts by Lauren) get canceled and never revived | No one owns the meta-process |

**Bottom line on Passiveness:** the team isn't broken; it's been trained. Fifteen months of "not the process / not the framework / route through / when the CMS migrates" produces a team whose optimal strategy is to do nothing new. Passiveness is the rational response to this system.

---

## The through-line

**Process defends the platform. The platform can't evolve. So the team goes passive.**

The meeting isn't about BEM, DMs to June, or how well conferences was documented. It's about whether this three-part cycle is going to keep running for another 15 months — or whether we're going to name it and break it.

---

_Concerns 5+ to be added — send them and I'll fold them under whichever P they land in._
