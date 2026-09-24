# 02 — App-wide Inter font and forced dark theme

Status: done
Blocked by: none
Spec: `.scratch/new-frontend/spec.md` § Fonts and theme

## What

Replace Lora and DM Sans with Inter across the whole app, and force dark mode.

## Skills
- `/run`: confirm only Inter loads in the network tab, pages stay dark with the OS in light mode, and the three former serif headings look right.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- In `app/layout.tsx`, load Inter with `next/font/google` (variable font, `axes: ["opsz"]`, `display: "block"` per `design.md`). Remove the `Lora` and `DM_Sans` imports.
- Point both `--font-sans` and `--font-serif` at Inter (check `app/globals.css` `@theme` for where the font tokens are wired). Existing `font-serif` class names keep working.
- Add a `font-display` utility or class: Inter with `font-variation-settings: "opsz" 32` and weight 410. Apply it where `font-serif` is used for headings today:
  - `components/reusable.tsx` (`BlueTitle`, `SectionHeading`)
  - `components/PricingModal.tsx:48`
  - `app/(main)/workspace/error.tsx:20`
- Add `body` smoothing from `design.md`: `font-synthesis:none`, antialiased, `text-rendering:geometricPrecision`.
- Add `forcedTheme="dark"` to `ThemeProvider` in `app/layout.tsx`.

## Acceptance criteria
- No page loads Lora or DM Sans; the network tab shows only Inter.
- With the OS in **light** mode, every page still renders dark.
- The workspace, projects and pricing modal render in Inter and headings don't look broken (check the three former serif spots).
- `npm run build` passes.

## Comments

**2026-09-24 (Claude):** Implemented on `feat/new-frontend`.

**What changed**
- `app/layout.tsx` now loads Inter with `next/font/google` (`axes: ["opsz"]`, `display: "block"`, `variable: "--font-inter"`). The Lora and DM_Sans imports are removed. `ThemeProvider` gets `forcedTheme="dark"`. `enableSystem` is gone because it does nothing once the theme is forced. `defaultTheme="dark"` stays.
- `app/globals.css`:
  - `@theme inline` sets `--font-sans` to Inter plus design.md's fallback stack, and `--font-serif: var(--font-sans)`. Existing `font-sans` and `font-serif` classes resolve to Inter.
  - New `@utility font-display`: Inter, `font-variation-settings: "opsz" 32`, weight 410.
  - `body` gets `antialiased` (covers both the -webkit and -moz smoothing properties), `font-synthesis: none` and `text-rendering: geometricPrecision`.
- `font-serif` → `font-display` in `components/reusable.tsx` (`BlueTitle`, `SectionHeading`), `components/PricingModal.tsx:48` and `app/(main)/workspace/error.tsx:20`.

**Decisions**
- The font variable class is on `<html>`, not `<body>`. `@theme` writes `--font-sans` on `:root`, where it refers to `--font-inter`, so `--font-inter` has to be defined on `<html>`. If it were only on `<body>`, `font-display` and `font-serif` would fall back to the browser default. There's a code comment explaining this.
- `app/not-found.tsx` (added in ticket 01) had Next's hard-coded `system-ui` font stack. I removed it so the 404 page uses Inter, per "Replace Lora and DM Sans with Inter across the whole app".
- `app/(landing)/page.tsx:75` h1 keeps `font-serif`, so it renders as plain Inter at weight 400. The ticket doesn't list it, and ticket 04 rewrites that page.
- No pure logic here, so no new tests. This ticket is font and theme config only.

**Verification**
- `npm run lint`: 12 problems (2 errors, 10 warnings), the same as the baseline. Both errors are in the untouched `gravity-stars.tsx` and `stars.tsx`. No new problems.
- `npm test`: 2 files, 11/11 pass. `npm run build`: passes.
- Prod server with headless Chromium, OS emulated in **light** mode (`colorScheme: "light"`):
  - `/`, `/sign-in`, `/sign-up` and `/does-not-exist` each request exactly one font file, an Inter woff2. `document.fonts` shows only Inter loaded.
  - `<html>` has the `dark` class and `color-scheme: dark`. The body background is dark. Body font is Inter, with antialiasing, geometricPrecision and `font-synthesis: none` applied.
  - `font-display` computes to Inter, weight 410, `"opsz" 32`. I checked the landing "Four steps / to a working app." `SectionHeading` in a screenshot: it renders cleanly in Inter display. The 404 page renders in Inter.
- **Not verified** (Clerk `pk_live` keys only work on forgeai.lol): signed-in `/workspace` and `/projects`, the workspace error heading and the pricing modal. They use the same `font-display` utility that was checked above, so the risk is low.

**Review findings (/code-review)**
- Spec axis: nothing missing. The not-found change was flagged as mild scope creep, but reasonable, so I kept it. One nit said the Toaster might ignore `forcedTheme` because `components/ui/sonner.tsx` reads `useTheme().theme`. That doesn't apply: `app/layout.tsx` imports `Toaster` straight from `sonner`, not from the wrapper.
- Standards axis, no hard violations. Handled:
  - The `<html>` placement of the variable is fragile → added a code comment.
  - `enableSystem` does nothing under `forcedTheme` → removed.
- Standards axis, left as is (noted for later):
  - `.font-display` is emitted before Tailwind's weight utilities, so `font-medium` or `font-semibold` on the same element wins. `DialogTitle` has `font-medium`, but its visible text is inside `BlueTitle`, which applies 410 again.
  - tailwind-merge puts `font-display` in the font-family group, so `cn("font-display", "font-sans")` drops it. No current call does this.
  - `DialogTitle`'s `font-heading` class has no token and never did. It could be defined as Inter in a later ticket.
  - `SectionHeading`/`BlueTitle` apply `font-display` twice. This is harmless.
