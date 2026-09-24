# 03 — Shared Clerk appearance, auth pages, pricing modal and 404

Status: resolved
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

**2026-09-24 (agent):** Done.
- `lib/clerk-appearance.ts` replaces `app/(landing)/pricing-appearance.ts`.
  - `daybreakAppearance` holds the `DB_LITERALS` variables plus elements for the card box and card, the header title and subtitle, the input focus, the primary button, footer links and social buttons. `ClerkProvider` in `app/layout.tsx` passes it.
  - `pricingAppearance` holds only the pricing-card overrides plus `colorBorder`. Clerk layers a component's `appearance` over the provider's, so it doesn't spread the base. The landing pricing section is byte-identical before and after, at 1440×900 and 390×844.
  - `colorBorder` isn't in the base. Clerk scales its alpha down for input and divider borders, and `--db-border`'s 14% made them invisible. The neutral-derived default reads right.
- New token `--db-card-shadow` replaces the `cardShadow` literal.
- The auth layout is a `min-h-dvh` flex-centred `<main>` with `py-20`, lavender glow high and peach glow low. The card is centred on the viewport, a touch above the space under the header.
- `PricingModal`:
  - `BlueTitle` is gone. The title is a `font-display` heading and the copy is capitalised.
  - `cursor-pointer` is fixed.
  - `pricingAppearance` is used, and `zIndex: 2000` is kept.
  - The scroll button is on `--db-surface`/`--db-border`.
  - The hardcoded `#0f0f0f` and white overrides are dropped, so the Dialog remap applies.
  - Bug fix: `sm:max-w-[min(95vw,1100px)]`. shadcn's `sm:max-w-md` was clamping the intended 1100px to one column.
- 404: a display heading, a muted line and the "Back home" pill over a lavender glow. The smoke test now looks for the heading by role and name.
- `accentPillClass` in `components/reusable.tsx` (colour, shadow, focus ring, press) is shared by the Header's Get Started and the 404. The landing CTA, which has a 12px radius and a different ring, is untouched.
- Clerk focus uses the header's ring (`--db-accent-solid`, 2px, offset 3). Ticket 07 still owns reconciling it with the composer's `#f8b285`.
- Verified:
  - Screenshots at 1440×900 and 390×844 of `/sign-in`, `/sign-up`, the landing sign-in modal, the 404, and `PricingModal`. The modal was opened on a temporary signed-out probe route, since removed. None of them show blue or purple.
  - `scrollWidth` is 360 at 360px on `/sign-in`, `/sign-up` and the 404.
  - lint (0 errors, 9 existing warnings), `npm test` (47), build and `test:e2e` (25 passed, 3 skipped) all pass.
- Not verified: the `UserButton` popover and the checkout drawer both need a signed-in session, which writes to the production DB. They get the provider appearance, with its peach `colorPrimary`, and no overrides of their own. Ticket 07's signed-in pass should look at them.
- For later tickets: the auth layout and the 404 now use the same glow `div`. If 04 adds more glows, consider a small `<Glow>` component. `BlueTitle` is still used by ChatPanel and projects.
