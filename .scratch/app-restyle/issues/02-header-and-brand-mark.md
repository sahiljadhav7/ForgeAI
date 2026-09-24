# 02 — Restyle the global header with the Daybreak brand

Status: ready-for-agent
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
