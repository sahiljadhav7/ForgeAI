# 01 — Apply the Daybreak tokens app-wide

Status: ready-for-agent
Blocked by: none
Spec: `.scratch/app-restyle/spec.md` § Tokens go app-wide

## What

Make the Daybreak palette available on every route and make shadcn components inherit it. Every later ticket builds on this. On its own, it should shift the other pages from neutral grey to the warm dark base without any component edits.

## Skills
- `/run` (project skill `run-app`): screenshot `/`, `/projects`, `/workspace`, `/sign-in` and `/does-not-exist` before and after, signed in and signed out, at 1440×900.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- In `app/layout.tsx`, add `daybreak` to `<body>`'s classes. Remove the now-redundant `daybreak` class from the landing root (`app/(landing)/page.tsx`) and check that the landing page is unchanged.
- In `app/globals.css`, remap the `.dark` shadcn tokens to the Daybreak palette per the spec table. Keep the `:root` light values untouched, since forced dark means they're never shown.
- Add any shade later tickets will need as a `.daybreak` token now, and document each one in the palette comment:
  - `--db-surface-raised`: user chat bubbles and hovered cards, a step lighter than `--db-surface`;
  - `--db-danger`: warm red for destructive actions and errors;
  - `--db-ring`: peach at ~50% alpha, used as `--ring`.

  Expose each through `@theme inline` like the existing `--color-db-*`.
- The body background comes from `.daybreak`'s `background-color`. Make sure `body`'s `bg-background` doesn't fight it, since both should resolve to `--db-base`.

## Acceptance criteria
- Every route's page background is `#14111c`, and no route shows neutral `oklch(0.145 0 0)` grey.
- A default shadcn `<Button>` renders with the peach accent and dark text. `Dialog` content renders on `--db-surface-solid` with a `--db-border` border.
- The landing page is pixel-identical to before at 1560×1008 and 390×844. Compare screenshots.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass.

## Comments
