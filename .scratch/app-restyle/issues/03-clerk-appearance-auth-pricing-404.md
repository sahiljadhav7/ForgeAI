# 03 — Shared Clerk appearance, auth pages, pricing modal and 404

Status: ready-for-agent
Blocked by: 01
Spec: `.scratch/app-restyle/spec.md` § Shared pieces (Clerk appearance), § Page treatments (Auth pages, 404, Modals)

## What

Theme every Clerk surface once, at the provider. Then give the auth pages and the 404 page the landing page's dawn-glow backdrop, and bring `PricingModal` in line with the landing pricing section.

## Skills
- `/tdd`: only if you extract logic such as a helper that merges the base and pricing appearances. Skip it for pure styling.
- `/run` (project skill `run-app`): screenshot the following at 1440×900 and 390×844:
  - `/sign-in` and `/sign-up`;
  - the landing sign-in modal (type a prompt, press Enter);
  - the `UserButton` popover (signed in);
  - `PricingModal` opened from the header's credits pill;
  - `/does-not-exist`.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- Move `app/(landing)/pricing-appearance.ts` to `lib/clerk-appearance.ts`.
  - Export `daybreakAppearance`: variables from the existing `DB_LITERALS`, plus elements for card, headings, form inputs, primary button, footer links and social buttons.
  - Export `pricingAppearance`: the pricing-card overrides, layered on the base.
  - Update the landing import.
- In `app/layout.tsx`, pass `appearance={daybreakAppearance}` to `ClerkProvider`.
  - Check that the landing pricing table is unchanged.
  - Check that the landing modals and `UserButton` now match.
  - Remove per-call overrides that the base now covers.
- Auth layout (`app/(auth)/layout.tsx`):
  - `--db-base` with `--db-glow-lavender` at the top and `--db-glow-peach` at the bottom, as the landing CTA does.
  - The Clerk card on `--db-surface` with `rounded-db`.
  - Keep `pt-40` or tune it so the card sits optically centred at 900px and 844px viewport heights.
- `PricingModal`:
  - Replace `BlueTitle` with plain display text and fix the lowercase copy ("Upgrade your plan", "Choose a plan…").
  - Fix `cursor-poiter`.
  - Use `pricingAppearance`, keeping the checkout drawer's `zIndex: 2000`.
  - The scroll-down button uses `--db-surface`/`--db-border`.
- `app/not-found.tsx`:
  - A display heading "This page doesn't exist", a `--db-muted` line, and an accent "Back home" pill to `/`, over a faint glow.
  - Keep the `Header` and one `<main>`.
  - The smoke test looks for "This page could not be found.". Update that assertion in the same commit.

## Acceptance criteria
- No Clerk surface anywhere shows Clerk's default blue or purple: pages, modals, the `UserButton` popover and the checkout drawer.
- The landing pricing table looks the same as before the move.
- `/sign-in`, `/sign-up` and the 404 page show the dawn glow, with no horizontal scroll at 360px.
- `BlueTitle` has no call site in `PricingModal`.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass.

## Comments
