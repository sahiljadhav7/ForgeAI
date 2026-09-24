# 07 — Visual QA against design.md and final polish

Status: done
Blocked by: 03, 05, 06
Spec: `.scratch/new-frontend/spec.md` § Testing

## What

A final pass on the finished landing page. Check it against `design.md` at every breakpoint, and check that the palette actually matches the hero video now that real frames can be seen.

## Skills
- `/run`: screenshots at every listed viewport, signed out and signed in, plus reduced motion and Lighthouse.
- `/diagnosing-bugs`: for measurement drift or a hero/section seam that doesn't go away on a first fix.
- `/simplify`: clean up the branch's changes once everything works.
- `/code-review`: review the whole `feat/new-frontend` branch against `main` (Standards + Spec).

## Tasks
- **Run the app and screenshot** `/` at 1560×1008, 1920×1080, 1280×800, 900×900, 768×1024, 390×844, 360×640 and 900×500, signed out and signed in.
- **Desktop 1560×1008:** measure against the `design.md` coordinates:
  - card at (425, 413), 708×143
  - chips starting at x=444, y=505, 30u tall
  - send at (1084, 507), 35u
  - headline at y≈323
  - nav brand, links and CTA positions

  Fix any drift of more than 1px.
- **Palette vs video:** sample the video's bottom-edge colors across a few frames (the first frame, a mid-loop frame and the loop point) and adjust `--db-base` and the hero fade gradient so the handoff has no visible seam. Record the final values in the spec's Decisions.
- **Accessibility**
  - Keyboard: tab order is nav → CTA → textarea → chips → send → scroll cue → sections, and the focus ring is visible everywhere.
  - The textarea has an accessible name (`aria-label="Describe your app"`).
  - The video is `aria-hidden` with no controls.
  - The burger has `aria-label`.
- **Reduced motion:** confirm there's no entrance animation, no reveal and no video.
- **Performance:** check the Lighthouse LCP element (should be the poster or headline) and that the video doesn't block first paint.
- **Checks:** `npm run lint`, `npm test` and `npm run build` pass.
- Append the screenshots' findings and any fixes under `## Comments`.

## Acceptance criteria
- Desktop measurements are within 1px of `design.md` (after the spec's overrides).
- No horizontal scroll at any tested size, and nothing clipped at 900×500.
- No seam between the hero video and the lower sections.
- Lint, test and build are all green.

## Comments

**2026-09-24 (Claude):** QA and polish done on `feat/new-frontend`, in commits `640af83` (QA fixes), `beeafff` (/simplify) and a final review-fix/docs commit.

**What changed**
- **Banner landmark.** The landing header used to sit inside `<main>`. It is now its own component (`app/(landing)/Nav.tsx`) and is rendered before `<main>`. `page.tsx`'s root is a `<div class="root daybreak">`. The header is placed absolutely over the stage at the frame padding, using the new `--pad-top/right/bottom/left` tokens that `.frame` also uses in all three layouts. A `.navSpace` of `--nav-h` holds its row inside the frame. The footer moved after `</main>` (contentinfo). Desktop geometry is identical to ticket 04's measurements.
- **Entrance.** A shared `useEntrance()` hook (`app/(landing)/entrance.ts`) holds the anim class plus the 2600ms teardown, for both the header and the stage. The stage also tears down on the cue's `animationend`. The header only uses the timeout, since its entrance ends at 0.89s, and on compact `.navRight` is hidden and never fires.
- **404 `<title>`.** `app/not-found.tsx` now does `export const metadata = { title: "Page not found" }` in place of its inline `<title>`. Next 16 honours this even though the docs only document it for `global-not-found`. The served HTML has exactly one `<title>`: "Page not found · Daybreak". The status is still 404.
- **A11y.**
  - Textarea `aria-label="Describe your app"`, per this ticket.
  - The demo mock's decorative "Preview"/"Code" `<button>`s were dead tab stops. They are now `<span>`s.
  - The "Get started free" CTA had only shadcn's gray `ring/50` on the orange fill. It now uses the hero's `#F8B285` 2px outline (offset 3), with the shadcn ring removed. `outline-solid` was needed because the Button's `outline-none` sets `--tw-outline-style: none`.
- **Demo mock at phone width.** Below `sm` the chat panel is full width and the preview pane is hidden, replacing the cut-off kanban.
- **/simplify** (4 reviewers: reuse, simplification, efficiency, altitude). Fixed:
  - The per-control focus-radius list became one zero-specificity default, `:where(.nav, .stage) :where(:focus-visible)`. Shaped controls keep their own radius.
  - `--nav-h` is shared by the nav and its spacer.
  - The fade end, send gradient and caret now use `--db-base`, `--db-accent` and `--db-accent-solid`. `--e-soft` is `var(--db-ease)`, so the hero and the reveal share one curve (this also fixes the review's spec note).
  - Enter now calls `form.requestSubmit()`, so there is a single submit path.
  - The demo gets `DEMO_COLUMNS` in place of two index-matched arrays, plus an `AiAvatar` helper and merged lucide imports.
  - The reveal ease fallback is dropped.
- **Skipped from /simplify:**
  - Reworking design.md's blanket reduced-motion `!important` rule. It is a literal port of design.md's rule.
  - Caching `fitToContent`'s base height and rAF-throttling resize. This is typing-time micro-perf with no visible cost.
  - Moving the rotating placeholder into a child component.
  - Merging `motionOK`/`reduceMotion`. Their server values differ on purpose: autoplay off, preload `metadata`.
  - Sharing `checkoutProps` with `PricingModal`. That is outside this branch's diff.
  - A `hooks/` directory for `useMediaQuery`/`useHydrated`. There are two private copies, as already accepted in 05.

**Flagged items from earlier tickets**
- **404 double title:** fixed (see above).
- **Header not a banner landmark:** fixed (see above).
- **Focus ring while typing:** kept. design.md says `:focus-visible { outline: 2px solid #F8B285; outline-offset: 3px; border-radius: 4px; }` for every control, and the spec keeps "focus ring" as written. Chrome treats a focused textarea as `:focus-visible`, so the ring showing while you type is what the spec asks for. Softening it would be a design change for the owner to decide.
- **Demo mock at 390px:** fixed (see above).
- **Pricing accent: Pro vs `featured: true` on Starter.** The Pro accent border stays. The spec says "Buttons and highlights (step numbers, "Pro") use `--db-accent`". `PRICING_PLANS[].featured` isn't read anywhere in the codebase (grep: only `lib/constants.ts`), so it has no visual effect. I left it alone because it's the owner's plan data. Clerk's own badge, if one is configured in the Clerk dashboard, may still point at a different plan.
- **`public/project1ForgeAi.mp4`:** tracked, not referenced anywhere, not deleted. Listed for the owner below.

**Decisions**
- **Palette vs video:** sampled and left unchanged. The values are recorded in the spec's Decisions under "Final values from visual QA".
- **Phone tab order:** it starts with the menu toggle, then brand → textarea → chips → cue. design.md's CSS-only burger needs the checkbox to be the header's preceding sibling (`.menuToggle:checked ~ .nav …`). On compact layouts the toggle is the nav, so it coming first is reasonable. The desktop order matches the ticket exactly.
- **Send is not in the tab order while the prompt is empty,** because it is `disabled` (ticket 05's decision). Once there's text, the order is textarea → chips → send, and the ring is round.
- **Burger `aria-label`:** the focusable control is the checkbox, which has `aria-label="Menu"` and `aria-controls`. The visual `<label>` is `aria-hidden`, and its ring shows through `.menuToggle:focus-visible ~ .nav .burger`. Verified.
- **No new pure logic,** so no TDD. `useEntrance` is a React hook wrapper around a timer. The existing 47 tests cover the composer and reveal logic.

**Verification** (prod build via `run-app`, headless Chromium; the server was stopped with `fuser` and `port 3100 free` was confirmed after each run)
- Desktop 1560×1008, measured with `getBoundingClientRect`, against design.md:

  | Element | Measured | design.md |
  | --- | --- | --- |
  | Card | (424.5, 413.4) 708×143 | (425, 413) 708×143 |
  | Chips | x 443.5, y 505.4, 30 tall | x 444, y 505, 30u |
  | Send | (1083.5, 507.4) 35×35, card-relative (659, 94) | (1084, 507), 35u |
  | h1 top | 322.6 | ≈323 |
  | Brand | (225, 45.5), mark 34 | (225, 45), 34 |
  | Links | top 50.5 | 50.5 |
  | CTA | (1195, 42) 140×43 | (1195, 42) 140×43 |
  | Cue | top 799 | 799 |

  Everything is within 1px. The half-pixel offsets come from design.md's `margin-right: 3u` on the card.
- **Per viewport** (signed out; `scrollWidth` equals the viewport width at every size, so there is no horizontal scroll; no page errors; exactly 1 `<title>`, 1 `<header>` outside `<main>`, 1 `<main>`, footer outside main):
  - 1920×1080: scaled desktop composition. Card 871×176, send 43px. Fine.
  - 1280×800: scaled desktop. Card 581×117. Fine.
  - 900×900: tablet. One-row toolbar, 3 links + Get Started, one-line headline. Fine.
  - 768×1024: tablet. One-row toolbar, one-line headline. Fine.
  - 390×844: compact. Burger (the sheet opens over the headline, with its ring visible), two-line headline, chips wrap, send on the right of row 2. Fine.
  - 360×640: compact. Same layout; the cue ends at 620 of 640. Fine.
  - 900×500: compact + extra-short. The cue ends at 480 of 500, so nothing is clipped. Fine.
- **Reduced motion** (1560×1008, 390×844, 900×500): no entrance (h1 opacity is 1 at first sample), the video is `paused`, `autoplay=false`, `preload=none`, and the poster shows. Reveal is off: full-page shots show every section visible.
- **Seam:** a close-up of the hero bottom at 1560 (scrolled 650px) shows no band between the video and the Examples section. Full-page shots at 1560 and 390 look right.
- **Keyboard, desktop:** brand → Features → Examples → Pricing → Get Started → textarea → 3 chips → cue → Get started free. Every stop shows the `#F8B285` ring, and the burger ring shows on phone.
- **Enter submit after the requestSubmit change:** `"  a⇧↵b "` → Enter → `/sign-in?redirect_url=…/workspace?prompt=a%0Ab` (Clerk-loading path: trimmed, newline kept).
- **Lighthouse 12** (`npx lighthouse`, cached Chromium, `--headless=new --no-sandbox`, prod server on localhost):
  - Mobile preset: Perf 87, A11y 100, BP 73, SEO 100. LCP 3.9s, FCP 0.9s, CLS 0, TBT 120ms.
  - Desktop preset: Perf 100, A11y 100, BP 73, SEO 100. LCP 0.8s, FCP 0.3s, CLS 0, TBT 0.
  - **The LCP element is the h1 on both.** The video doesn't block first paint (FCP 0.3/0.9s).
  - Mobile LCP is mostly design.md's entrance: the h1 fades in from 0.3s over 1s, plus Inter `font-display: block` under simulated 4G.
  - BP 73 comes only from the Clerk `pk_live` localhost errors (console 400s, third-party cookies), which prod won't have.
  - The mobile run downloads the full 2.9 MB video even though `preload=metadata`, because the spec requires autoplay on all sizes. The owner may want a smaller mobile encode.
- **Checks:**
  - `npm run lint`: 11 problems (2 errors, 9 warnings), the same as the baseline. The errors are only the pre-existing `gravity-stars.tsx`/`stars.tsx` ones.
  - `npm test`: 5 files, 47/47 pass.
  - `npm run build`: passes.

**Review (/code-review against `main`, two sub-agents)**
- **Standards:** no hard violations. CRLF is intact in every modified CRLF file.
  - Fixed: `DB` in `pricing-appearance.ts` read like "database", so it's renamed to `DB_LITERALS`.
  - Left as is:
    - Clerk hex literals duplicating the tokens. Clerk needs literals; this was documented in 06.
    - The CTA's `#f8b285`/520/−0.0127em repeating hero values. That's a Tailwind class on the shared Button; a token would be new infrastructure for one use.
    - The label+heading intro repeated 3× in page.tsx. Pricing's variant adds a paragraph; this is a judgement call.
    - The pass-through `(landing)/layout.tsx`, which ticket 01 asks for.
- **Spec:**
  - Fixed: the reveal easing copied rather than referencing `--e-soft` → `--e-soft: var(--db-ease)`.
  - Recorded:
    - Palette values and the landmark structure → spec Decisions.
    - Phone tab order and the split anim class → decisions above.
  - Also flagged: this ticket still had no QA evidence when the review ran. That is this comment.
  - No scope creep found.

**Needs a human**
1. **Signed-in and Clerk flows.** None of these could be rendered locally: Clerk `pk_live` keys only work on forgeai.lol. Check with Clerk dev keys in `.env.local` or on a preview deploy:
   - Nav/sheet "My projects" + avatar.
   - Get Started opening the sign-up modal.
   - Signed-out composer submit opening the sign-in modal and landing on `/workspace?prompt=…`.
   - Signed-in submit → generation.
   - The "Get started free" CTA modal.
   - Signed-in `/workspace` and `/projects` with Inter and the rename.
   - The ZIP export.
2. **`<PricingTable>` visuals.** It renders empty locally. Check the dark glass cards, the orange button, Inter, the Pro accent border, and whether Clerk's own highlight badge agrees (Pro vs `featured: true` on Starter in `lib/constants.ts`, which is unused).
3. **`public/project1ForgeAi.mp4`:** committed and unreferenced. Delete or rename it.
4. **Out-of-scope rename items** (spec): the domain, the GitHub repo name, the Clerk app name and email templates, the Vercel project, `scripts/capture-readme-visuals.mjs`'s URL, the README live-demo link (forgeai.lol), and a Daybreak `/logo.png` for the global Header (it still shows "<forge>").
5. **Design calls:**
   - Whether the always-on textarea focus ring (per design.md) should be softened.
   - Whether the disabled send needs a visual state (05).
   - Whether a lighter mobile video encode is wanted (mobile LCP/bytes).

