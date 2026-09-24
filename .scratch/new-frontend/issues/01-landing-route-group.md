# 01 — Move landing page into its own route group

Status: ready-for-agent
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
