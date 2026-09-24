# 01 — Move landing page into its own route group

Status: done
Blocked by: none
Spec: `.scratch/new-frontend/spec.md` § Routing and layout

## What

Give the landing page its own layout, without the global header and its 64px offset, so the full-viewport hero can own the top of the page. Every other page must look exactly as it does now.

## Skills
- `/run`: check that `/`, `/workspace`, `/projects`, `/sign-in` and `/sign-up` render as expected, each with a single `<main>`.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- Move `app/(main)/page.tsx` to `app/(landing)/page.tsx`. Add `app/(landing)/layout.tsx`, a bare wrapper with no `mt-16` and no `Header`.
- Remove `<Header />` from `app/layout.tsx`. Render it in `app/(main)/layout.tsx` (keeping `mt-16`) and in `app/(auth)/layout.tsx`.
- The root layout's `<main>` wrapper is removed or kept neutral so the landing page can render its own `<main class="hero">` without nesting `<main>` in `<main>`.
- Don't restyle anything yet. The old homepage content moves as-is.

## Acceptance criteria
- `/` renders the current homepage content with **no** global header and no top gap.
- `/workspace`, `/projects`, `/sign-in` and `/sign-up` look the same as before, header included.
- There's only one `<main>` element per page.
- `proxy.ts` route protection is unchanged: `/workspace` and `/projects` still require sign-in, and `/` doesn't.
- `npm run build` and `npm test` pass.

## Comments

**2026-09-24 (Claude):** Implemented and left uncommitted on `feat/new-frontend`.

- `app/(main)/page.tsx` → `app/(landing)/page.tsx` (unchanged, `git mv`). New `app/(landing)/layout.tsx` is a bare fragment wrapper.
- `app/layout.tsx`: removed `<Header />` and the `<main>` wrapper; it now renders `{children}` directly.
- `app/(main)/layout.tsx` renders `<Header />` + `<main className="mt-16">`. `app/(auth)/layout.tsx` renders `<Header />` + `<main className="flex justify-center pt-40">`. Each layout now owns the page's single `<main>`.
- `app/(main)/projects/page.tsx`: its own `<main>` became a `<div>` (same classes) so it doesn't nest inside the layout's `<main>`. Before this change, `/` and `/projects` both had nested `<main>` elements.

**Verification**
- `npm test`: 11/11 pass. `npm run build`: passes. (The first build failed on stale `.next/dev/types` left by an old dev server that still pointed at `app/(main)/page.js`. Deleting `.next/dev/types` fixed it.)
- `npm run lint`: 12 problems (2 errors, 10 warnings), the same count as on HEAD. The errors are in the untouched `components/animate-ui/.../gravity-stars.tsx` and `stars.tsx`. None are new.
- Prod build with headless Chromium, signed out: `/` has 1 `<main>`, 0 `<header>`, and `main` top = 0 (old homepage content, no gap). `/sign-in` and `/sign-up` each have 1 `<main>` and 1 `<header>`, with no nesting. `/workspace` and `/projects` 307 to `/sign-in` (proxy unchanged). No page errors.
- **Not verified visually:** signed-in `/workspace` and `/projects`, and the Clerk widgets on the auth pages. `.env` has production Clerk keys (`pk_live`), which Clerk rejects on localhost ("Production Keys are only allowed for domain forgeai.lol"). The only change on those pages is the wrapper element (`div` → `main`, same classes), so the risk is low. A check with dev keys or on a preview deploy would close this.

**Review notes (/code-review)**
- The spec review found nothing blocking. The standards review found only smells: `(main)` and `(auth)` layouts repeat the Header+main block (acceptable at two copies), `(landing)/layout.tsx` is a pass-through (kept because the ticket asks for it), and `(main)/layout.tsx` still names its component `layout`.
- Existing quirk, unchanged: `/workspace` gets a double `mt-16`, from the `(main)` layout plus `app/(main)/workspace/layout.tsx`. The old tree had it too.
- Small visible change: there's no `app/not-found.tsx`, so the default 404 page no longer gets the global header. Add a `not-found.tsx` with `<Header />` if that matters.
- `public/ForgeAI-video.mp4` and its `:Zone.Identifier` file are still untracked. They belong to the housekeeping ticket, not this one.

**2026-09-24 follow-up (Claude):** Fixed the 404 regression.

- Added `app/not-found.tsx`. It renders `<Header />` plus a single `<main>` around a copy of Next's default 404 markup ("404 | This page could not be found.", same layout and type sizes). Before this, unknown URLs matched no route group and rendered with no header and no `<main>`.
- One difference from the old 404: Next's built-in page injected a `body` style that turned the page white when the OS was in light mode. The new page keeps the app's dark background, which fits ticket 02's forced dark.
- Checked on a fresh prod build with the `run-app` skill: `/does-not-exist` returns 404 with 1 `<main>` and 1 `<header>`. `/`, `/sign-in`, `/sign-up` and `/workspace` (redirects to sign-in) are unchanged. Lint is still 12 pre-existing problems, and tests pass 11/11.
- Still open, blocked on the environment: signed-in visual checks of `/workspace` and `/projects`. These need Clerk dev keys in `.env.local`.
