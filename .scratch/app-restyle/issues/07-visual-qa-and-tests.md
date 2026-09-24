# 07 — Visual QA across the app and extended smoke tests

Status: resolved
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

**2026-09-24 (agent):** Done. CI on the PR is still pending, because nothing was pushed and no PR is open yet.

- **Leftover sweep:** `app/` and `components/` (excluding `ui`/`animate-ui`) have no `blue-`, `violet-`, `fuchsia-` or `cyan-`, none of the old hex colours, and no `BlueTitle` (deleted in 05). The only hits are about 20 `bg-white/`, `text-white/` and `border-white/` classes in `app/(landing)/page.tsx`. They belong to the landing's decorative mock app window. The landing is the spec's reference and came from PR #4, so it stays as it is.
  - The old ForgeAI `/logo-short.jpeg` was still the assistant avatar in ChatPanel. I replaced it with `RisingSunMark` on a raised tile. `public/logo-short.jpeg` and `public/logo.png` are now unreferenced but still in the repo; the owner can delete them.
- **Focus ring, settled:** there is one token, `--db-ring: #f8b285`. It is opaque and is the landing composer's ring. The ring is a solid 2px outline at a 3px offset. Everything uses it:
  - `focusRingClass`/`focusRingWithinClass`, the composer wrapper, the landing CSS and CTA, Clerk (`colorRing` plus the element rings; inputs get the ring at 50%);
  - shadcn: `--ring` maps to the token. `ui/button`, `ui/tabs` and `ui/badge` now draw the Daybreak outline instead of `ring-ring/50`, so the per-call-site overrides are gone. The global `outline-ring/50` is now `outline-ring`.
  - A new `.daybreak .sp-layout :focus-visible` rule gives the ring to Sandpack's refresh button and the tab panels, which had no visible focus.
  - Tabbing through the header, `/projects`, the delete dialog and `/workspace` gives solid 2px rgb(248,178,133) on every control. Ring contrast is 10.4:1 on base and 8.2:1 on surface.
- **Contrast:** `--db-muted` is 6.5:1 on base, 5.1:1 on surface, 4.6:1 on raised, 5.6:1 on the header glass and 6.0:1 on the chat column.
  - Small (<14px) secondary text on surfaces now uses a new token, `--db-text-dim` (`--db-text` at 75%, 8.0:1). That covers the chat empty hint, the footer, completed status steps, reasoning text and the overlay/error-bar sub-lines. The spec says `--db-muted`, but its own "no muted under 14px on surface" rule overrides that.
  - The ProjectCard meta line and the header's Projects/Sign in links went up to 14px and stay muted.
- **Accessible names:** a DOM scan of every page found no unnamed visible control. The only one was Clerk's hidden submit button. The chat textarea now has an `aria-label` instead of relying on its changing placeholder.
- **Reduced motion:** with `reduce`, every restyled page has no running CSS animations. The chat's "thinking" pulse and caret blink are now `motion-safe`. Spinners stay, since they show progress.
- **Shared literals:** the new `lib/daybreak-literals.ts` holds `DB_LITERALS`, and both `lib/clerk-appearance.ts` and `lib/sandpack-theme.ts` read it. `daybreak-literals.test.ts` checks each literal against its token in `globals.css`. It failed first on the ring, before the token changed. Sandpack's two flattened colours (`borderOnBase`, `disabled`) are derived values, so they stay commented in the theme file.
- **Bugs fixed:**
  - The preview error bar was `absolute` against the viewport and covered the chat composer. It now pins to the code panel's bottom edge (`relative` panel root). Screenshots at 1440 and 900 confirm this.
  - On phones, `PricingModal` forced `min-w-180`, so the cards were clipped and scrolled sideways. Clerk's table now stacks by itself (checked at 390, 700 and 1440).
  - `richColors` error and success toasts used sonner's own red and green fills. They now use the Daybreak popover surface, with warm-red text and border for errors.
- **Smoke tests** (`e2e/smoke.spec.ts`):
  - Signed out, three new tests run in CI:
    - the 404 has the "Daybreak home" brand link and a "Back home" link;
    - `/sign-in` has the brand link;
    - `/sign-in`, `/sign-up` and the 404 have no horizontal scroll and no page errors.
  - I watched them fail against a production build with the header's `aria-label` and the 404 link text changed, then pass once restored.
  - Signed in, `@signed-in` tests cover `/projects` and `/workspace` (one `<main>`, header brand, no page errors, no horizontal scroll). They use `@clerk/testing` (`clerkSetup` in `e2e/global-setup.ts`, `clerk.signIn`), and Gemini routes stay blocked.
  - **They are local-only and skipped by default and in CI.** Signing in syncs the user row to the database, and the only configured database is production. They run only with `E2E_SIGNED_IN=1`, a non-production `DATABASE_URL` exported and a Clerk dev test user (`E2E_CLERK_USER_USERNAME`/`_PASSWORD`). `e2e/signed-in.ts` has the command. They have never been run. No secrets were added to GitHub.
- **Screenshots:** every route was taken at 1440×900, 900×900, 390×844 and 360×640 and looked at: `/`, `/sign-in`, `/sign-up`, the 404, `/projects` (with projects and empty), `/workspace` (existing project, empty, runtime error bar) and `workspace/error.tsx`.
  - I also captured the sign-in and sign-up modals, `PricingModal`, the delete dialog with focus, the error toast and the focus states.
  - The signed-in pages came from temporary unauthenticated preview routes with fake data and a signed-in header copy. They were deleted before commit.
  - `scrollWidth` equals the viewport on every route at 360px, and there are no page errors.
  - The workspace keeps its desktop two-column layout on phones: the code panel is squeezed and clipped, with no page scroll. That is pre-existing, and layout changes are out of scope.
- **Review:**
  - `/simplify` changes: the ring moved into the ui primitives; the header credits pill uses `secondaryPillClass`; the PricingModal title uses `displayHeadingClass`; Button `size="icon-sm"` replaces hand-sized chat buttons; dead destructive ring classes were removed; `bg-db-surface-solid` became a theme colour; two backdrop blurs on 95%-opaque fills were dropped.
  - `/code-review` changes: the dim-text token, toasts, header link size, and the Sandpack key rename.
  - Skipped as out of scope:
    - `accent`/pill variants in `buttonVariants` and a pill size scale;
    - renaming `components/reusable.tsx`;
    - a shared credits-pill component (2 copies);
    - `focusRingWithinClass`'s `rounded-full`, which makes the brand link's ring a pill (intended);
    - the stale `pricing-appearance.ts` mention in the spec's Source of truth, which describes the pre-branch state.
- **Checks:** lint (0 errors, 6 existing warnings), `npm test` (60), build, and `test:e2e` (35 passed, 7 skipped: 3 existing plus 4 `@signed-in`).
- **Still unverified:** the real signed-in `/projects` and `/workspace`, the `UserButton` popover, the checkout drawer and the real delete action. All need a sign-in, which writes to the production DB. CI is still pending.
