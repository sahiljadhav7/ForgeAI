# 02 — Restyle the global header with the Daybreak brand

Status: resolved
Blocked by: 01
Spec: `.scratch/app-restyle/spec.md` § Shared pieces, § Page treatments (Header)

## What

The header on `/projects`, `/workspace`, the auth pages and the 404 page should read as the landing nav's sibling. That means the rising-sun mark and "Daybreak" wordmark, warm glass, and the peach CTA pill.

## Skills
- `/run` (project skill `run-app`): screenshot the header on `/projects` (signed in) and `/sign-in` (signed out) at 1440×900 and 390×844, next to the landing nav.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- Move `RisingSunMark` out of `app/(landing)/Nav.tsx` into `components/brand/RisingSunMark.tsx`, with a `className` prop for sizing. The landing nav imports it from there and must render identically.
- Rewrite `components/Header.tsx`'s styling:
  - Bar: 64px tall, fixed, `--db-surface`-based glass with backdrop blur and a `--db-border` bottom border.
  - Brand: the mark plus the "Daybreak" wordmark in the landing nav's weight and letter-spacing, linking to `/` with `aria-label="Daybreak home"`. Stop using `/logo.png`.
  - Signed out: "Sign in" as a `--db-muted` text button that turns `--db-text` on hover, and "Get Started" as the accent pill (`bg-(image:--db-accent)`, `text-db-on-accent`, `--db-accent-shadow`).
  - Signed in: "Projects" link (muted to text on hover), a credits pill (`--db-surface`, `--db-border`, peach `Zap`) that opens `PricingModal`, and `UserButton` at the landing avatar size.
- Fix the existing bugs:
  - `hover:text-whtite/80`;
  - `gap=1.5`;
  - the missing space in "{credits}credits";
  - the non-existent `text-13px` class. Use `text-[13px]`.
- On phone widths (<640px), the header must fit without overflow: hide the wordmark or the Projects label if needed, and keep the mark, credits and avatar.

## Acceptance criteria
- `/logo.png` is no longer referenced by the header. Leave the file itself for the owner to delete.
- The landing nav looks the same as before the mark moved.
- No horizontal scroll at 360px on any page that has the header.
- Each state is keyboard reachable with a visible focus ring: signed out (Sign in, Get Started) and signed in (Projects, credits, avatar).
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass.

## Comments

**2026-09-24 (agent):** Done.
- `RisingSunMark` now lives in `components/brand/RisingSunMark.tsx` and takes a `className` prop. Its gradient stops read tokens: a new `--db-accent-light: #fbbc94`, which is the accent gradient's first stop, and `--db-lavender`. They are set via `style={{ stopColor }}`, so the component needs to render under `.daybreak`. The landing nav's brand region at 1440×900 with reduced motion is pixel-identical before and after the move.
- `components/Header.tsx` was rewritten. It is 64px tall, `bg-db-surface/70` with a `backdrop-blur-md` glass and a `--db-border` bottom border.
  - The wordmark copies the landing typography: 18.5px, weight 500, opsz 32, -0.0154em.
  - Signed out, it shows a muted "Sign in" text button and the accent "Get Started" pill.
  - Signed in, it shows "Projects", a credits pill (`--db-surface`, `--db-border`, peach `Zap`, "N credits") and `UserButton` at 36px (`size-9`).
  - The four listed bugs are gone. `/logo.png` is no longer referenced, and the file itself is left in place.
- On phones (<640px) the wordmark is hidden only when signed in. Signed out, it fits at 360px.
- Focus: one rule on the `<nav>` gives every focused descendant, including the Clerk and PricingModal trigger buttons, a solid 2px `--db-accent-solid` outline with a 3px offset and rounded-full shape. It is not the composer's exact `#f8b285`. Ticket 07 should reconcile the ring token (see ticket 01's note).
- Verification:
  - Screenshots at 1440×900, 390×844 and 360×740 look right on `/sign-in` and the 404.
  - `scrollWidth` equals the viewport at 360px on `/`, `/sign-in`, `/sign-up` and the 404.
  - Tab order was checked: home, Sign in, Get Started, each with a visible peach ring.
  - Signed in was not run against the real app, because it writes to the production DB. Instead the signed-in markup was injected into the header DOM. It fits at 360, 390 and 1440 with no overflow, and the credits trigger's ring is visible.
  - lint (0 errors, 9 existing warnings), `npm test` (47 passed), build and `test:e2e` (25 passed, 3 skipped) all pass. e2e needs `PLAYWRIGHT_CHROMIUM_PATH=~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` on this machine.
- For later tickets:
  - The accent pill's classes, `bg-(image:--db-accent) text-db-on-accent shadow-(--db-accent-shadow) hover:brightness-107`, now appear in both `page.tsx` and the header. Consider extracting a shared pill before 03/04 add more copies.
  - `PricingModal`'s trigger still has the `cursor-poiter` typo. That belongs to ticket 03.
