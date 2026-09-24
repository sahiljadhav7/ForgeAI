# Spec: Daybreak restyle for the rest of the app

Status: ready-for-agent
Branch: `feat/app-restyle` (branch from `main` after `feat/new-frontend` / PR #4 merges)

## Problem

The landing page now follows the Daybreak "dawn dusk" look: Inter display headings, warm-white text, glass surfaces tinted warm, a peach accent gradient, lavender labels and faint radial dawn glows. Every other page still has the old ForgeAI look:

- **Global header** (`components/Header.tsx`): white-glass bar with `/logo.png` and a white shadcn "Get started" button. It has typos too (`hover:text-whtite/80`, `gap=1.5`, and "credits" with no space before it).
- **`/projects`**: `#0a0a0a` page, blue gradient `BlueTitle` heading, `#0f0f0f` cards with `rounded-xl`, and a white shadcn button.
- **`/workspace`**: `#0a0a0a`/`#0d0d0d` panels, blue status accents, and violet/fuchsia/cyan "Improve with AI" controls. Sandpack uses the `dracula` theme, and the page has a double `mt-16`.
- **Auth pages, `/sign-in` and `/sign-up`**: Clerk's default dark widget on a flat page.
- **Modals**: `PricingModal` has a blue `BlueTitle` and an un-themed `PricingTable`. `DeleteProjectModal` uses `#111111`, and shadcn `Dialog` uses neutral grey tokens.
- **404** (`app/not-found.tsx`): a copy of Next's default markup.

The goal is to make these pages feel like the same product as the hero.

## Source of truth

- **Palette and type:** the `.daybreak` tokens in `app/globals.css` and the `font-display` utility. The landing sections (`app/(landing)/page.tsx`) are the reference for how they're applied: cards, buttons, headings, labels and glows.
- **Header and brand:** the landing nav (`app/(landing)/Nav.tsx`, `landing.module.css`), including the rising-sun mark, wordmark, CTA pill and avatar size.
- **Composer:** the landing composer (`app/(landing)/Composer.tsx`), which sets the glass card, send circle and focus ring.
- **Clerk theming:** `app/(landing)/pricing-appearance.ts`. It holds the `variables` literals and the `&&[data-variant]` specificity trick.

`design.md` is **not** the reference here. It describes only the hero.

## Decisions

### Scope
- **Restyle only.** Page layouts, information architecture and behaviour stay the same:
  - the workspace keeps the 320px chat on the left and the code/preview on the right;
  - projects stays a grid of cards;
  - auth stays a centred Clerk widget.
- **No functional changes**, except bug fixes the restyle trips over. Those are listed in the tickets.
- **No blue, violet, fuchsia or cyan anywhere in the app.** The accents are `--db-accent` (peach) and `--db-lavender`. Red stays for destructive actions and errors, using a warm red.

### Tokens go app-wide
- Put the `daybreak` class on `<body>` in `app/layout.tsx`, so the tokens and base colour apply on every route. The landing root can drop its own `daybreak` class once the body carries it.
- Remap the shadcn `.dark` tokens in `app/globals.css` to the Daybreak palette, so `Button`, `Dialog`, `Tabs`, `Textarea`, `DropdownMenu`, `Badge` and `sonner` inherit it without per-call overrides:

  | shadcn token | Daybreak value |
  | --- | --- |
  | `--background` | `--db-base` |
  | `--foreground` | `--db-text` |
  | `--card`, `--popover` | `--db-surface-solid` |
  | `--border`, `--input` | `--db-border` |
  | `--primary` | `--db-accent-solid` |
  | `--primary-foreground` | `--db-on-accent` |
  | `--muted-foreground` | `--db-muted` |
  | `--ring` | peach at ~50% |
  | `--destructive` | warm red |

  The final values come out of ticket 01's QA.
- New tokens are added under `.daybreak`, never as hex literals in components. If a component needs an extra shade (e.g. a raised surface for chat bubbles), it becomes a token.

### Shared pieces
- **`RisingSunMark`** moves from `app/(landing)/Nav.tsx` to `components/brand/RisingSunMark.tsx`. Both the landing nav and the global header use it. `/logo.png` is no longer used by the header.
- **Clerk appearance:**
  - `pricing-appearance.ts` becomes `lib/clerk-appearance.ts` with a base `daybreakAppearance`: variables plus shared elements such as the Inter font, surfaces, primary button and inputs.
  - `ClerkProvider` in `app/layout.tsx` gets `appearance={daybreakAppearance}`. That themes `<SignIn>`, `<SignUp>`, the modals, `UserButton` and the checkout drawer everywhere.
  - Pricing-card overrides stay as a `pricingAppearance` that extends the base, used by both the landing page and `PricingModal`.
- **Headings:** `BlueTitle` is deleted. Its call sites use `font-display` warm-white text, with `SectionHeading` or a single-line equivalent where it fits.

### Page treatments
- **Header:** glass bar in `--db-surface` with a `--db-border` bottom border, the same backdrop blur, and the mark plus "Daybreak" wordmark in the landing nav's typography.
  - Signed out: Sign in is a muted text link, and Get Started is the landing CTA pill.
  - Signed in: Projects link, credits pill in `--db-surface` with a peach `Zap`, and `UserButton`.
  - Height stays 64px, so `mt-16` offsets keep working.
- **Projects:**
  - A display heading "Projects" with the lavender label "Your apps" above it.
  - Cards in `--db-surface` with `rounded-db` and `--db-border`. Hover raises the border to peach at low alpha.
  - The New project button is the accent pill.
  - The empty state reuses the landing CTA's glow and button.
  - Page background is `--db-base` with a faint lavender glow at the top.
- **Workspace:**
  - Chat panel and code panel headers use `--db-surface`/`--db-base`, with `--db-border` dividers.
  - User bubbles use a raised warm surface. Assistant bubbles use `--db-surface`.
  - Status spinners and the streaming caret are peach. The "Thinking" label is lavender.
  - The chat composer takes the landing composer's glass, radius and focus ring, and the send button becomes the peach circle.
  - "Improve with AI" drops violet/fuchsia/cyan for a lavender→peach treatment. The Pro badge uses `--db-accent`.
  - The generating overlay uses `--db-base` at 85% with a blur.
  - The error bar uses warm red on `--db-surface`.
- **Sandpack:** replace `dracula` with a custom theme object derived from the palette:
  - surfaces from `--db-base`/`--db-surface-solid`;
  - accent peach;
  - syntax colours: peach, lavender, a warm green and a muted amber.

  Sandpack takes literals, so the theme lives in one file beside the Clerk literals, with a comment tying each value to its token.
- **Auth pages:** `--db-base` with the dawn glows (lavender high, peach low) behind a themed Clerk card. The card uses `--db-surface`, radius 26px, the peach primary button and Inter.
- **404:** a display heading "This page doesn't exist", a muted line and an accent "Back home" pill, centred over a faint glow. The title metadata stays as it is.
- **Modals:** `Dialog` content uses `--db-surface-solid`, `rounded-db` and `--db-border` through the token remap. `PricingModal`'s title is plain display text, and its table uses `pricingAppearance`. `DeleteProjectModal` uses the remapped tokens and a warm-red Delete button.
- **Toasts:** sonner inherits the dark palette. Check that `richColors` doesn't bring in blue.

### Accessibility
- Text contrast stays at or above WCAG AA on `--db-base` and `--db-surface`. `--db-muted` is for secondary text only, never for body copy under 14px on surface. The current `text-white/15`–`/25` microcopy on the workspace and projects pages fails AA, so it moves to `--db-muted`.
- The focus ring is visible on every interactive element, using the same ring as the landing composer.

## Out of scope
- Layout redesigns of the workspace, projects or auth pages.
- Workspace features such as resizable panels or new toolbar actions.
- Light mode. The app stays forced dark.
- A new favicon or social image. This is a follow-up once the brand assets exist.
- Clerk dashboard text: plan feature typos and the app name "Forge". That's an owner task.

## Testing
- Unit tests (Vitest, `node` env) only for any pure logic that appears. Most tickets are styling and need none. Don't write tests that assert class names.
- **Smoke tests** (`e2e/smoke.spec.ts`) keep passing after every ticket. Ticket 07 adds:
  - signed-out checks for the restyled auth and 404 pages;
  - a signed-in pass over `/projects` and `/workspace` using `@clerk/testing`'s Playwright helpers and a Clerk dev test user, if that can run in CI without writing to the production DB. If it can't, the signed-in pass is a local-only run.
- **Visual checks** use the `run-app` skill. Take screenshots at 1440×900, 900×900 and 390×844 for each page, signed out and signed in, compare them against the landing sections, and look at every screenshot.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` all pass.

## Tickets
See `issues/`. Dependency order:

```
01 tokens app-wide ─┬─> 02 header + brand mark ──────────────────┐
                    ├─> 03 Clerk appearance, auth, pricing, 404 ─┼─> 07 QA + tests
                    ├─> 04 projects page + delete modal ─────────┤
                    ├─> 05 workspace shell + chat ───────────────┤
                    └─> 06 code panel + Sandpack theme ──────────┘
```

02–06 touch separate files and can be done in any order once 01 is done.
