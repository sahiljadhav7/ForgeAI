# 02 — App-wide Inter font and forced dark theme

Status: ready-for-agent
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
