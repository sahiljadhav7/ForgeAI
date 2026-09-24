# 04 — Hero shell: video, nav, headline, composer card, scroll cue, entrance

Status: done
Blocked by: 01, 02
Spec: `.scratch/new-frontend/spec.md` § Overrides to `design.md`, § Hero
Pixel reference: `design.md`

## What

Build the full-viewport hero from `design.md` as a Next.js page, with the spec's overrides applied. The composer is **visually** complete here: the textarea is in place with a static placeholder, the chips show the first three suggestions, and the send circle sits at its coordinates. Its behavior is ticket 05.

## Skills
- `frontend-design:frontend-design`: for craft only (the rising-sun SVG, the bottom fade, the scroll cue). `design.md` and the spec overrides are the pixel reference and win over any aesthetic suggestion from the skill.
- `/run`: capture the poster frame, and screenshot 1560×1008, ~900×900, ~390×844 and ~900×500 against the acceptance criteria.
- `/diagnosing-bugs`: if layout drift or the `dvh`/`--u` scaling resists a first look.
- `/code-review`: review the diff against this ticket and the spec before committing.

## Tasks
- **Assets**
  - Rename `public/ForgeAI-video.mp4` → `public/daybreak-hero.mp4` and delete `public/ForgeAI-video.mp4:Zone.Identifier`.
  - Capture the first frame as `public/daybreak-hero-poster.webp`: run the app, pause the video at 0s, screenshot it, and crop to the video.
- **CSS module** `app/(landing)/landing.module.css`: port the `design.md` CSS near-literally.
  - `:root` `--u`/`--vu` and the `dvh` `@supports` block, scoped to the landing root class, not `:root`.
  - All nav, hero, composer and footer variables. The three architectures: desktop default, the tablet media query and the compact media query, plus the extra-short query.
- **Stage**
  - The hero is `position:relative; height:100dvh; overflow:hidden`, not fixed, and the body scrolls.
  - The video is `absolute inset-0` with `object-fit:cover` and a `poster`.
  - Preload: `auto` at ≥1181px wide, otherwise `metadata`.
  - Under `prefers-reduced-motion: reduce`, render without `autoPlay` (poster only).
  - A bottom gradient fades the video into `#14111c`.
- **Nav**
  - Brand: a **rising-sun mark** SVG in the 34×34u box (half-sun on a horizon line, peach `#FBBC94` → lavender `#9C86CE`), the wordmark "Daybreak", and `aria-label="Daybreak home"`.
  - Links: Features → `#features`, Examples → `#examples`, Pricing → `#pricing`. Remove Docs. Use `scroll-behavior: smooth` on the landing root.
  - Right side:
    - Signed out: "Get Started" wrapped in Clerk `<SignUpButton mode="modal">`.
    - Signed in: a "My projects" `<Link href="/projects">` in the same CTA styling, plus `<UserButton />`.
    - Use `useAuth()` / `<SignedIn>`/`<SignedOut>`.
  - Burger and sheet: the CSS-only checkbox menu per `design.md`, with the same links and auth states.
- **Headline:** "Describe an app. We'll build it." per `design.md` typography. No subtitle, no badge.
- **Composer card (visual)**
  - A `<form>` with the `.card` styles.
  - A `<textarea>` at the `.ph` position and typography.
  - A `.tools` strip with three chips, each carrying one of the spec's filled-blob icons.
  - The send `<button type="submit" aria-label="Build it">` at `left:640u; top:2u; 35×35u` relative to `.tools`.
  - No model label and no paperclip; nothing moves into their space.
  - Tablet and compact layouts: the `.right` flex rules keep send right-aligned (`margin-left:auto`).
- **Scroll cue** in the `footer.proof` slot: "See how it works" in 14.01u, weight 480, with the spec's text-shadow, plus a small down chevron. It links to `#how-it-works`.
- **Entrance animation**
  - All `design.md` keyframes and timings, minus the removed elements. The scroll cue uses the "proof caption" timing (`e-settle-up .55s soft 1.08s`).
  - Implement with an `anim` class on the landing root. Remove it on the last `animationend` or after 2600ms, whichever comes first.
  - Only under `prefers-reduced-motion: no-preference`.
- **Metadata:** `export const metadata` in the landing page or layout: title "Daybreak — Describe an app. We'll build it." (absolute, not templated) and the spec's description. The landing page needs a server component wrapper for this if the page is a client component.
- Remove `GravityStarsBackground` and the old hero markup from the landing page. Leave the lower sections in place, unstyled, for ticket 06.

## Acceptance criteria
- At **1560×1008** the screenshot matches `design.md`'s composition. The send circle's top-left is at card-relative (659, 94); it's 35×35 and overhangs the 30u chip row by 7u; its right edge is 14u from the card's right edge.
- At about **900×900**: horizontal nav with three links plus the CTA, a one-line headline, and a one-row toolbar with send on the right.
- At about **390×844**: burger menu, chips on row 1, send on the right of row 2, and no horizontal scroll.
- Short landscape (about **900×500**): the extra-short rules apply and nothing is clipped.
- The video covers the viewport with no letterboxing and no pan or zoom. The page scrolls past the hero.
- Signed out, Get Started opens the sign-up modal. Signed in, "My projects" and the avatar show, and the burger sheet mirrors this.
- Reduced motion: no entrance animation, and the poster is shown instead of the video.
- The focus ring (`#F8B285`) is visible on the links, CTA, chips, textarea and send.

## Comments

**2026-09-24 (Claude):** Implemented on `feat/new-frontend`.

**What changed**
- Assets: `public/ForgeAI-video.mp4` renamed to `public/daybreak-hero.mp4` (1192×772, 10s). The `:Zone.Identifier` file is deleted. `public/daybreak-hero-poster.webp` (1192×772, 35 KB) is the first frame. `ffmpeg` isn't on PATH, so I loaded the video in headless Chromium, seeked to 0s, drew it onto a canvas and exported it as webp at quality 0.85.
- `app/(landing)/landing.module.css`: design.md's CSS ported near-literally. `--u`/`--vu`, the `dvh` `@supports` block and the ≥1561px insets are on `.root` (the landing `<main>`), not `:root`. It also has the nav/hero/composer/footer variables that are still used, the desktop, tablet, compact and extra-short architectures, all keyframes and the `.anim` entrance rules. `scroll-behavior: smooth` is set with `:global(html):has(.root)`, because smooth scrolling only works on the scrolling element. It turns off under reduced motion.
- `app/(landing)/Hero.tsx` (client) contains:
  - The stage: `100dvh`, `overflow:hidden`, not fixed. The video is `object-fit:cover` with the poster, and a bottom gradient fades it into `#14111c`.
  - The nav: rising-sun mark, "Daybreak" wordmark, `aria-label="Daybreak home"`, and anchors to `#features`/`#examples`/`#pricing`.
  - An `AuthActions` component, shared by the nav and the burger sheet. Signed out it renders `<SignUpButton mode="modal">` "Get Started". Signed in it renders "My projects" (`/projects`) plus `<UserButton />`.
  - The CSS-only checkbox burger and sheet, the headline, the "See how it works" cue (→ `#how-it-works`), and the `anim` class teardown.
- `app/(landing)/Composer.tsx` (client) is the visual composer:
  - A `<form>` card and a one-line `<textarea>` at `.ph`, with the static placeholder `PLACEHOLDERS[0]`.
  - Three auto-width chips with filled-blob icons, using design.md's `--pl`/`--ig`/icon widths per slot.
  - The send `<button type="submit" aria-label="Build it">` at `left:640u; top:2u`. Submit currently only calls `preventDefault()`, marked `TODO(05)`.
- `app/(landing)/page.tsx` is now a server component. It exports the metadata: absolute title "Daybreak — Describe an app. We'll build it." and the spec's description. It renders `<main class=root>` → `<Hero />` + the old lower sections. The old hero markup, its hooks and both `GravityStarsBackground` uses are gone.

**Decisions**
- `SUGGESTIONS` in `lib/data.ts` is already `{ label, prompt }[]` (labels: Spotify stats, Kanban board, Weather app, Finance tracker, Recipe finder, Pomodoro timer). Chips need short labels to fit the 30u row without running into send, so I did this here instead of in 05. **Ticket 05 doesn't need to reshape it again.** It only needs to wire the chip clicks and the random pick.
- The anim class is on the hero stage, which is the animated subtree. The design variables are on the landing root, so ticket 06's scroll reveal can reuse `--e-soft`. The class is rendered on the server, so the entrance starts on first paint. The keyframes live inside `prefers-reduced-motion: no-preference`, so the server-rendered class does nothing for reduced-motion users. The class is removed on the cue's `animationend` (the last animation, ending at 1.63s) or after 2600ms.
- Video:
  - `autoPlay`/`play()` wait for the client, so reduced-motion users never start playback.
  - `preload` starts as `metadata` from the server, becomes `auto` at ≥1181px, and becomes `none` under reduced motion. `none` is my addition: there's no point fetching a video that won't play.
- Auth: `useAuth()`. Signed-out markup also covers Clerk's loading state, so the CTA is present on first paint and when Clerk fails to load. The tradeoff is that signed-in users may briefly see "Get Started" before it swaps. The CTA's entrance fade (from 0.34s) mostly hides this.
- The `:focus-visible` 4px radius from design.md applies only to controls without their own shape: brand, links, cue, textarea and sheet links. The send circle, chips and CTA keep their radius, so their rings stay round.
- The footer keeps design.md's 103u height (`--proof-h`), so the headline and card land on the reference coordinates now that the logo row is gone. The chevron sits 9u under the caption.
- The textarea placeholder stays on one line with an ellipsis on every layout, per the spec's "one line, ellipsis when empty". design.md's tablet `white-space: normal` was dropped.
- Compact chips keep design.md's px sizes (30px tall, 9px text). design.md sets no compact chip rule. Ticket 07 can revisit this if it reads too small.
- Mark: a half-sun above a horizon bar, plus a shorter bar below as a reflection that echoes the lake in the video. It fills the 34×34 box with a peach→lavender gradient.
- The menu checkbox is `display:none` outside the compact layout, so it isn't a hidden tab stop on desktop and tablet. Clicking a sheet link or CTA unchecks it.
- Small overlaps with 06, made so 04's anchors work: I added `id`s to the four lower sections (`examples`, `how-it-works`, `features`, `pricing`). I also set the `<main>` background to `#14111c` so the hero fade meets the page colour. **06 still owns** the tokens, `scroll-margin-top`, restyling and reveal.
- No pure logic in this ticket, so no new tests. The composer logic (`buildWorkspaceUrl`, `pickSuggestions`) is 05's TDD work.

**Verification**
- `npm run lint`: 12 problems (2 errors, 10 warnings), the same as the baseline. The errors are the pre-existing `gravity-stars.tsx`/`stars.tsx` ones. The only landing warning is the pre-existing unused `i` in the STEPS map. `npm test`: 3 files, 16/16 pass. `npm run build`: passes.
- Prod build, headless Chromium, run with the `run-app` skill. The server was stopped with `fuser` and `port 3100 free` confirmed. No page errors. The only failed requests are the expected Clerk `pk_live` 400s.
- **1560×1008**, measured with `getBoundingClientRect`:

  | Element | Measured | design.md |
  | --- | --- | --- |
  | Card | (424.5, 413.4) 708×143 | (425, 413) |
  | Send (card-relative) | (659, 94), 35×35, 14u from card right, bottom 7u below the 30u chip row | (659, 94) |
  | Textarea (card-relative) | (27, 33) | (27, 33) |
  | Chips top | 505.4 | 505 |
  | h1 top | 322.6 | 323 |
  | Brand/mark | (225, 45.5), 34u | (225, 45) |
  | Links top | 50.5 | 50.5 |
  | CTA | (1195, 42) 140×43 | (1195, 42) 140×43 |
  | Scroll cue top | 799 | 799 |

  The video plays (`preload=auto`) and covers the frame.
- **900×900:** horizontal nav with 3 links plus Get Started, one-line headline (43px), card 666px wide, one-row toolbar with send 32px on the right. `preload=metadata`.
- **390×844:** burger is shown and links/CTA are hidden. The headline is two lines. Chips are on row 1 and send (40px) is on the right of row 2. `scrollWidth` 390, so no horizontal scroll. The burger opens the sheet (links + Get Started). Tapping a sheet link scrolls and closes the sheet.
- **900×500:** compact + extra-short rules apply (headline 27px, gap 16px). The cue ends at y=480, so nothing is clipped.
- **Reduced motion** (1560×1008 and 390×844): opacity is 1 from the first sample, so there's no entrance. The video has `paused`, `autoplay=false`, `preload=none`, and the poster is visible.
- **Motion:** h1/card/cue opacity sampled at 150/700/1200/2000ms: 0 → rising → 1. The `anim` class is gone by 2000ms.
- The page scrolls past the hero: the cue lands `#how-it-works` at top 0, and the nav Pricing link lands `#pricing`.
- Tabbing through brand, links, CTA, textarea, chips, send and cue shows the solid `#F8B285` outline on each.

**Review (/code-review, two sub-agents)**
- Standards, fixed:
  - The signed-in/out branch was duplicated in the nav and the sheet → extracted `AuthActions`.
  - `.ph:focus{outline:none}` only lost to the focus ring because of source order → removed.
  - The unexplained `right:(425+708−1134)u` → commented.
  - The reduced-motion override left `transition-delay` in place → zeroed.
  - The template literal in page.tsx → `cn()`.
- Standards, left as is:
  - Tablet and compact media blocks repeat some rules. They are kept as a literal port of design.md's three architectures.
  - Chip slots and suggestions are paired by index. Icons belong to slots, not to suggestions, which 05 will randomise.
  - `.ph`/`.right`/`--pl` names are kept from design.md so the port can be traced back to it.
  - No Escape key to close the menu. design.md specifies a CSS-only menu.
- Standards, noted for 07: `<header>`/`<nav>` sit inside the landing `<main>` (the structure from ticket 01), so the header isn't a `banner` landmark. The nav is still a navigation landmark. Fixing this means pulling the nav out of the stage's flex frame, which would risk the measured geometry.
- Spec, fixed:
  - Server HTML had `preload="none"`, so desktop loading waited for hydration → the server now renders `preload="metadata"`.
  - The sheet's "My projects" didn't close the menu → it does now, via `AuthActions`' `onNavigate`.
- Spec, recorded above as decisions: the `SUGGESTIONS` reshape, `preload=none` under reduced motion, the reflection bar on the mark, and the brief signed-in CTA flash.

**Unverified / left for later**
- **Signed in:** "My projects" + avatar in the nav and sheet, and Get Started actually opening the Clerk sign-up modal. Clerk `pk_live` keys only work on forgeai.lol, so on localhost Clerk never loads, the modal can't open, and the signed-in branch can't render. The markup is in place.
- **Ticket 05:** the composer doesn't submit yet, so the homepage prompt → `/workspace` flow is missing until 05 lands. 05 also owns chip clicks, the rotating placeholder, auto-grow (anchor `.tools` with `bottom:21u`) and random chips. Don't ship 04 without 05.
- **Ticket 06:** `scroll-margin-top` and the lower-section restyle.
