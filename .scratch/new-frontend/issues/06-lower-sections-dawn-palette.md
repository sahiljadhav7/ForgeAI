# 06 — Restyle the lower sections in the dawn-dusk palette

Status: done
Blocked by: 01, 02
Spec: `.scratch/new-frontend/spec.md` § Below the hero

## What

Keep the structure and content of every section below the hero; change only how they look, so they match the hero. Nothing blue, no gray/blue gradient titles.

## Skills
- `/research`: confirm the Clerk v7 `<PricingTable appearance>` API (`variables` and `elements` keys) from Clerk's docs before theming.
- `frontend-design:frontend-design`: for restyling the sections within the spec's palette and constraints.
- `/run`: check anchors, scroll reveal (and its absence under reduced motion), and the themed pricing table.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- **Tokens:** define the `--db-*` palette variables from the spec once, in a place later pages can reuse. Put them in `app/globals.css` under a `.daybreak` scope, or in a small `app/(landing)/tokens.css` imported by the landing layout. Expose them to Tailwind via `@theme` if that keeps the markup simple.
- **Page background** below the hero: `--db-base` (`#14111c`).
- **Section ids:** demo video `id="examples"`, How it works `id="how-it-works"`, Everything you need `id="features"`, Simple pricing `id="pricing"`. Add `scroll-margin-top` so anchors land cleanly.
- **Headings:** replace `GrayTitle`/`BlueTitle` usage on the landing page with plain warm-white Inter display headings. `SectionHeading` keeps its two-part API if convenient, but both parts render in the same color. `SectionLabel` becomes lavender `#9C86CE`.
- **Cards** (demo video frame, steps, feature tiles, CTA box): `--db-surface` background, a 1px inset border `rgba(214,228,255,.14)`, and a radius of about 26px.
- **Accents:** step numbers, "Pro" highlights and the CTA button use `--db-accent` (the send gradient). Body copy is `--db-muted`.
- **Glows:** faint radial gradients behind Pricing (peach, low) and the CTA (lavender, high), at under 15% opacity.
- **Pricing:** theme `<PricingTable>` with Clerk's `appearance` prop: `variables` (colorPrimary `#F49D70`, colorBackground from `--db-surface`, colorText warm white, colorTextSecondary `#98999C`, fontFamily Inter, borderRadius about 18px), plus `elements` class overrides where the variables aren't enough.
- **CTA button** ("Start building"): if it currently goes to sign-up or the workspace, keep that. Restyle it with the send gradient and the spec's CTA typography.
- **Footer:** Inter, `--db-muted`, a top border `rgba(255,255,255,.07)`, and the "Daybreak" brand text if it shows one.
- **Scroll reveal:** add one small client hook or component (for example `components/Reveal.tsx`) with a shared `IntersectionObserver` and `threshold ~0.15`. It fades and rises each section 6px once, over `.5s` with `cubic-bezier(.22,1,.36,1)`, and does nothing under `prefers-reduced-motion: reduce`.

## Acceptance criteria
- Every section from today's homepage is present in the same order with the same copy (except brand renames).
- No blue anywhere below the hero, and no serif.
- Nav links and the scroll cue land on the right sections.
- The Pricing table reads as part of the page: dark glass cards, orange primary button, Inter.
- Sections reveal once on scroll, and don't under reduced motion.
- Contrast: body text on `--db-base` and `--db-surface` meets WCAG AA (4.5:1).

## Comments

**2026-09-24 (Claude):** Implemented on `feat/new-frontend`.

**What changed**
- `app/globals.css`: the `--db-*` palette under a `.daybreak` scope (in `@layer base`, so utilities still win), exposed to Tailwind through `@theme inline` as `bg-db-base`, `bg-db-surface`, `border-db-border`, `text-db-text`, `text-db-muted`, `text-db-lavender`, `text-db-accent`, `text-db-on-accent` and `rounded-db`. The gradients are custom properties, used as `bg-(image:--db-accent)` and `bg-(image:--db-glow-peach|lavender)`. There are extra tokens as well: `--db-surface-solid`, `--db-accent-solid`, `--db-on-accent`, `--db-accent-shadow`, `--db-radius` (26px) and `--db-ease` (the same curve as the hero's `--e-soft`). The `[data-reveal]` transition rules are in `@layer components`, inside `prefers-reduced-motion: no-preference`.
- `app/(landing)/page.tsx`:
  - `<main>` gets `daybreak`, which replaces 04's inline `bg-[#14111c]`.
  - Every section has `scroll-mt-10`.
  - The demo frame, the four steps (now an `<ol>` of cards), the six feature tiles (now separate cards, `gap-3`) and the CTA box use `--db-surface`, a 1px `--db-border` and a 26px radius.
  - Step numbers, the demo avatar, the Preview tab underline and the `@dnd-kit/core` code use the accent. Body copy is `--db-muted`.
  - There is a peach glow at the bottom of Pricing (12%) and a lavender glow at the top of the CTA card (14%).
  - The CTA keeps `SignInButton mode="modal"` and "Get started free". It now has the send gradient and weight 520 / −0.0127em (design.md's CTA), with a 12px radius like the hero CTA.
  - The footer is Inter, `--db-muted` and `border-white/7`, with the same copy. It has no brand text.
  - Each section's content is wrapped in `<Reveal>`.
- `components/reusable.tsx` (CRLF kept):
  - `SectionHeading` renders both lines in `--db-text` Inter display. Its props are renamed `gray`/`blue` → `line1`/`line2`.
  - `SectionLabel` is lavender `#9C86CE`. This also fixes the `front-semibold` typo.
  - `GrayTitle` is deleted, since it had no other users. `BlueTitle` stays for `/projects`, `ChatPanel` and `PricingModal`, which are out of scope.
- `app/(landing)/pricing-appearance.ts`: the `<PricingTable appearance>`.
  - `variables`: colorPrimary `#f49d70`, colorPrimaryForeground `#14111c`, colorBackground `#2c272d`, colorForeground warm white, colorMutedForeground `#98999c`, colorNeutral white, colorBorder, Inter, borderRadius 18px.
  - `elements` (style objects using the tokens): cards get the glass surface and 1px border, the Pro card (`pricingTableCard__<pro planId>`) gets an accent border, and the footer button and badge get the gradient.
- `components/Reveal.tsx` + `lib/reveal.ts` (+ `lib/reveal.test.ts`, 11 tests, written red→green with `tdd`):
  - `createRevealRegistry` holds the observer bookkeeping. It uses one lazily created shared observer, reveals each target once, then unobserves it. It disconnects when nothing is left and returns an unwatch function.
  - `shouldDeferReveal` decides whether content starts hidden.
  - The component uses one `IntersectionObserver` (threshold 0.15) and fades each section in with a 6px rise, 0.5s, `cubic-bezier(.22,1,.36,1)`.
  - The seams tested are the registry's `watch` (with a fake observer) and `shouldDeferReveal`.
- `.scratch/new-frontend/research/clerk-pricing-appearance.md`: the `/research` notes on the Clerk v7 appearance API, checked against the installed types and Clerk's docs.

**Decisions**
- **Clerk v7 names.** `colorText` and `colorTextSecondary` no longer exist in the installed types, so I used `colorForeground` and `colorMutedForeground` (see the research notes).
- **Clerk colours.** `variables` need literal colours, because Clerk derives shades from them. So colorBackground is the opaque `--db-surface-solid` (`#2c272d`, the glass flattened onto the base). The card's `elements` style then puts the real translucent `--db-surface` back on. Element overrides are style objects, not Tailwind classes: Clerk's CSS is unlayered and would beat Tailwind v4's layered utilities.
- **Reveal hides only content that starts fully below the fold.** The server renders everything visible. The client marks a section `pending` only if it starts at or below the fold and motion is allowed. So there's no content lost without JS, and nothing blinks out on a mid-page reload. The tradeoff is that a section already partly on screen at load doesn't animate. The hero is 100dvh, so this never happens on a fresh load.
- **Borders.** Page cards use a real 1px border in the spec colour, not an inset box-shadow. The demo frame's panels and the CTA glow would paint over an inset shadow. Clerk cards use the same border, so the two match.
- **CTA text is dark (`#14111c`) on the gradient**, at 8.8:1. White on `#F49D70` is about 2.2:1 and fails AA.
- **Section labels.** They are sentence case, weight 500, without the all-caps tracking and the dashes. The spec only says "lavender"; the design skill steers away from tracked caps eyebrows.
- **Pro highlight.** The spec says "'Pro' highlights" use the accent. Pro is the only place "Pro" appears on the landing page, and it's inside Clerk. `lib/constants.ts` marks **Starter** as `featured`, so if Clerk also highlights a plan, it may not be the same one. Check on prod.
- **Small extras:** `motion-reduce:animate-none` on the demo's typing dots, and the demo's faint `white/20–25` text raised to `/30–35` for legibility on the lighter surface. Copy and section order are unchanged, apart from a stray leading space removed in each feature label and description.

**Verification**
- `npm run lint`: 11 problems (2 errors, 9 warnings). The baseline was 12. The only errors are the pre-existing `gravity-stars.tsx` and `stars.tsx` ones. The drop is the unused `i` in the old STEPS map, which is gone.
- `npm test`: 5 files, 47/47 pass (36 before + 11 new).
- `npm run build`: passes.
- Prod build + headless Chromium via `run-app`. The server was stopped with `fuser` and `port 3100 free` was confirmed after each run. No page errors. The only failures are the expected two Clerk `pk_live` 400s.
  - Full-page screenshots at 1440×900 and 390×844 (normal and reduced motion) all looked right: warm cards, lavender labels, peach numbers and CTA, faint glows. `scrollWidth` equals the viewport width.
  - Anchors: `#examples`, `#how-it-works`, `#features` and `#pricing` each land at top 40px, at both widths and under reduced motion.
  - Reveal, normal motion: every below-fold section starts `pending`, with opacity 0. `#how-it-works` sampled 120ms after scrolling in shows opacity 0.6 and translateY 2.4px, then 1 and `none`. After scrolling through, all sections are `shown`, and scrolling back up doesn't hide them again.
  - Reveal, reduced motion: no `data-reveal` on anything, and opacity is 1 throughout.
  - Blue: I scanned computed colours below the hero. The only hits are the spec-mandated border `rgba(214,228,255,.14)` and lavender. There are no `blue` classes in the served landing HTML. The shared CSS chunk still has `blue-*` utilities from `BlueTitle` and `ChatPanel`, which are used by `/projects` and `/workspace` (out of scope). No serif: computed fonts are Inter everywhere, plus the demo's `<code>` monospace.
  - Contrast: muted text is 6.5:1 on base and 5.1:1 on surface (about 4.5–4.7:1 at the brightest point of the CTA glow). Lavender labels are 6.0:1 on base. Warm white is 13–16.6:1.

**Review (/code-review, two sub-agents)**
- Standards, fixed:
  - `.daybreak`/`[data-reveal]` were unlayered, so they would beat utilities → moved to `@layer base`/`components`.
  - The accent shadow and gradient were duplicated between the page and the Clerk config → added a `--db-accent-shadow` token, and the Clerk `elements` now use `var(--db-*)`. Only `variables` keep literals, each commented with its token.
  - The duplicated easing fallback → a single `--reveal-ease`.
  - The `gray`/`blue` prop names → `line1`/`line2`.
  - The terse `card`/`section` constants → `cardClass`/`sectionClass`.
- Standards, left as is: the Zap avatar block and `[3,2,1][ci]` repeated in the demo mock (pre-existing), and `db-*` utilities resolving only inside `.daybreak` (by design, documented in the CSS comment).
- Spec, fixed: the inset border was built differently on Clerk cards (inset shadow) and page cards (border) → both use a 1px border now. The Clerk cards were solid rather than glass → the card element now uses the translucent `--db-surface`.
- Spec, recorded above as decisions: partly visible sections not animating, sentence-case labels, the 12px CTA radius, dark CTA text, Pro versus the featured Starter plan, the small demo-mock extras, and deleting `GrayTitle`.

**Unverified / left for later**
- **`<PricingTable>` visuals:** Clerk `pk_live` keys don't load on localhost, so the section renders empty locally. The appearance config was checked against the installed Clerk types (`tsc` passes). Check on forgeai.lol or with dev keys: dark glass cards, orange primary button, Inter, and which card gets the accent border or badge.
- **For 07:** on phone the demo frame keeps its fixed `w-80` chat panel (pre-existing layout), so the preview kanban is cramped and cut off at 390px. Consider hiding the preview pane or stacking the panels below `sm`.
- **For 07:** the `SignInButton` CTA can't be clicked through locally (Clerk).
