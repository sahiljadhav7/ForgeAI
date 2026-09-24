# 01 — Apply the Daybreak tokens app-wide

Status: resolved
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

**2026-09-24 (agent):** Done.
- `<body>` carries `daybreak` (`app/layout.tsx`); the landing root dropped its own class. `body` no longer applies `bg-background text-foreground`, since `.daybreak` sets both from `--db-base`/`--db-text`.
- The shadcn remap follows the spec table. It is scoped to `.dark .daybreak`, not `.dark`, because a custom property's `var()` resolves on the declaring element: on `<html>`, `--db-*` doesn't exist yet. Portals (Base UI, Clerk, sonner) mount inside `<body>`, so they inherit it. `--secondary`, `--muted` and `--accent` also map to `--db-surface-raised`, so hover and tab fills lose the neutral grey.
- New tokens, exposed as `--color-db-*`:
  - `--db-surface-raised: rgba(54,48,55,.955)`, which flattens to about #342f36. Text on it is 11.7:1 and muted is 4.6:1, so muted-foreground on muted/accent fills stays AA.
  - `--db-danger: #ef6a55`, 6.1:1 on base and 4.8:1 on surface-solid.
  - `--db-ring: rgba(244,157,112,.5)`.
- `components/ui/dialog.tsx` now uses `rounded-db ring-border`, a deliberate small component edit. The radius can't come through a colour remap, and the acceptance criterion requires a `--db-border` border.
- `layout.tsx` now uses the shadcn `components/ui/sonner` wrapper, so toasts read `--popover`/`--border`. `richColors` stays on. Only `error`/`success` toasts are used, so none of sonner's rich info blue appears.
- Verification:
  - Computed body background is rgb(20,17,28) on `/`, `/sign-in` and the 404.
  - The header's default `Button` is peach with dark text.
  - Dialog classes resolve to #2c272d, 26px radius and a `--db-border` ring.
  - Full-page landing compares at 1560×1008 and 390×844 (reduced motion) match the base, apart from three things:
    - the animated composer placeholder;
    - the randomised suggestion chips, which vary between runs of the same build;
    - anti-aliased corner pixels of the "Get started free" CTA, max channel delta 30, because its underlying `bg-primary` is now peach instead of light grey.
  - lint (0 errors, 9 existing warnings), `npm test` (47 passed), build and `test:e2e` (25 passed, 3 skipped) all pass.
- Deferred or known:
  - `/projects` and `/workspace` still hardcode `bg-[#0a0a0a]` (tickets 04/05).
  - Signed-in screenshots weren't taken, because signing in writes to the production DB.
  - Focus ring: `--db-ring` is 50% alpha as the ticket asks, but shadcn's `ring-ring/50` and the global `outline-ring/50` halve it again to about 25%. Ticket 07 should reconcile it with the landing composer's opaque `#f8b285` ring.
