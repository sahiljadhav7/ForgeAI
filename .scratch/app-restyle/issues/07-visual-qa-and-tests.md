# 07 — Visual QA across the app and extended smoke tests

Status: ready-for-agent
Blocked by: 02, 03, 04, 05, 06
Spec: `.scratch/app-restyle/spec.md` § Accessibility, § Testing

## What

A final pass across every restyled page. Check it looks like one product with the landing page, clean up leftovers, and extend the smoke suite so CI guards the new look.

## Skills
- `/run` (project skill `run-app`): screenshot every route at 1440×900, 900×900, 390×844 and 360×640, signed out and signed in:
  - `/`
  - `/sign-in`
  - `/sign-up`
  - `/projects` (with projects, and empty)
  - `/workspace` (empty, and with an existing project)
  - `/does-not-exist`

  Also capture the modals: sign-in, sign-up, `UserButton`, `PricingModal` and delete. Look at every screenshot.
- `/diagnosing-bugs`: for any visual regression that a first fix doesn't clear.
- `/simplify`: clean up the branch's changes once everything works.
- `/code-review`: review the whole `feat/app-restyle` branch against `main` (Standards + Spec).

## Tasks
- **Leftover sweep:** `grep` `app/` and `components/` (excluding `components/ui` and `components/animate-ui`) for:
  - `blue-`, `violet-`, `fuchsia-`, `cyan-`, `#0a0a0a`, `#0d0d0d`, `#0f0f0f`, `#111111`, `bg-white/`, `text-white/`;
  - `BlueTitle`.

  Replace each with a token, or justify it in Comments. Delete `BlueTitle` from `components/reusable.tsx` once nothing uses it.
- **Consistency:** accent pills, focus rings, card radius and heading sizes should match across pages and the landing sections. Where two pages build the same pill or card differently, extract a small shared component or class, but only where there are three or more copies.
- **Accessibility:**
  - Every interactive element has a visible focus ring.
  - Text contrast is AA. Spot-check the muted text on each page with a contrast tool.
  - Icon-only buttons have accessible names.
- **Reduced motion:** there's no shimmer or reveal on the restyled pages.
- **Smoke tests** (`e2e/smoke.spec.ts`):
  - Signed out: `/sign-in` and the 404 page have the header brand ("Daybreak home" link), and the 404 page has the "Back home" link.
  - Signed in: use `@clerk/testing` (`clerkSetup` plus `setupClerkTestingToken`) with the Clerk dev test user to load `/projects` and `/workspace`, and assert one `<main>`, the header, no page errors and no horizontal scroll. Keep blocking `/api/gen-ai-code` and `/api/improve`.
    - The signed-in pages read the database. If CI has no safe (non-production) `DATABASE_URL`, tag these tests `@signed-in`, skip them in CI, run them locally, and say so in Comments. Don't add production DB credentials to GitHub secrets.
- **Checks:** `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass locally, and CI is green on the PR.
- Append findings, screenshots summary and fixes under `## Comments`. Set the spec's `Status:` to done.

## Acceptance criteria
- The leftover sweep finds nothing unjustified.
- No horizontal scroll at 360px on any route.
- The smoke suite covers the restyled signed-out pages in CI. Signed-in coverage runs in CI or is documented as local-only, with the reason.
- CI is green on the PR.

## Comments
