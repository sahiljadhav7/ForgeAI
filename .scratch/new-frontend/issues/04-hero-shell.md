# 04 — Hero shell: video, nav, headline, composer card, scroll cue, entrance

Status: ready-for-agent
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
