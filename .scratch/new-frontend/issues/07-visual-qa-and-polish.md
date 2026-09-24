# 07 — Visual QA against design.md and final polish

Status: ready-for-agent
Blocked by: 03, 05, 06
Spec: `.scratch/new-frontend/spec.md` § Testing

## What

A final pass on the finished landing page. Check it against `design.md` at every breakpoint, and check that the palette actually matches the hero video now that real frames can be seen.

## Skills
- `/run`: screenshots at every listed viewport, signed out and signed in, plus reduced motion and Lighthouse.
- `/diagnosing-bugs`: for measurement drift or a hero/section seam that doesn't go away on a first fix.
- `/simplify`: clean up the branch's changes once everything works.
- `/code-review`: review the whole `feat/new-frontend` branch against `main` (Standards + Spec).

## Tasks
- **Run the app and screenshot** `/` at 1560×1008, 1920×1080, 1280×800, 900×900, 768×1024, 390×844, 360×640 and 900×500, signed out and signed in.
- **Desktop 1560×1008:** measure against the `design.md` coordinates:
  - card at (425, 413), 708×143
  - chips starting at x=444, y=505, 30u tall
  - send at (1084, 507), 35u
  - headline at y≈323
  - nav brand, links and CTA positions

  Fix any drift of more than 1px.
- **Palette vs video:** sample the video's bottom-edge colors across a few frames (the first frame, a mid-loop frame and the loop point) and adjust `--db-base` and the hero fade gradient so the handoff has no visible seam. Record the final values in the spec's Decisions.
- **Accessibility**
  - Keyboard: tab order is nav → CTA → textarea → chips → send → scroll cue → sections, and the focus ring is visible everywhere.
  - The textarea has an accessible name (`aria-label="Describe your app"`).
  - The video is `aria-hidden` with no controls.
  - The burger has `aria-label`.
- **Reduced motion:** confirm there's no entrance animation, no reveal and no video.
- **Performance:** check the Lighthouse LCP element (should be the poster or headline) and that the video doesn't block first paint.
- **Checks:** `npm run lint`, `npm test` and `npm run build` pass.
- Append the screenshots' findings and any fixes under `## Comments`.

## Acceptance criteria
- Desktop measurements are within 1px of `design.md` (after the spec's overrides).
- No horizontal scroll at any tested size, and nothing clipped at 900×500.
- No seam between the hero video and the lower sections.
- Lint, test and build are all green.
