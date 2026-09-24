# 06 — Restyle the lower sections in the dawn-dusk palette

Status: ready-for-agent
Blocked by: 01, 02
Spec: `.scratch/new-frontend/spec.md` § Below the hero

## What

Keep the structure and content of every section below the hero; change only how they look, so they match the hero. Nothing blue, no gray/blue gradient titles.

## Skills
- `/research`: confirm the Clerk v7 `<PricingTable appearance>` API (`variables` and `elements` keys) from Clerk's docs before theming.
- `frontend-design:frontend-design`: for restyling the sections within the spec's palette and constraints.
- `/run`: check anchors, scroll reveal (and its absence under reduced motion), and the themed pricing table.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- **Tokens:** define the `--db-*` palette variables from the spec once, in a place later pages can reuse. Put them in `app/globals.css` under a `.daybreak` scope, or in a small `app/(landing)/tokens.css` imported by the landing layout. Expose them to Tailwind via `@theme` if that keeps the markup simple.
- **Page background** below the hero: `--db-base` (`#14111c`).
- **Section ids:** demo video `id="examples"`, How it works `id="how-it-works"`, Everything you need `id="features"`, Simple pricing `id="pricing"`. Add `scroll-margin-top` so anchors land cleanly.
- **Headings:** replace `GrayTitle`/`BlueTitle` usage on the landing page with plain warm-white Inter display headings. `SectionHeading` keeps its two-part API if convenient, but both parts render in the same color. `SectionLabel` becomes lavender `#9C86CE`.
- **Cards** (demo video frame, steps, feature tiles, CTA box): `--db-surface` background, a 1px inset border `rgba(214,228,255,.14)`, and a radius of about 26px.
- **Accents:** step numbers, "Pro" highlights and the CTA button use `--db-accent` (the send gradient). Body copy is `--db-muted`.
- **Glows:** faint radial gradients behind Pricing (peach, low) and the CTA (lavender, high), at under 15% opacity.
- **Pricing:** theme `<PricingTable>` with Clerk's `appearance` prop: `variables` (colorPrimary `#F49D70`, colorBackground from `--db-surface`, colorText warm white, colorTextSecondary `#98999C`, fontFamily Inter, borderRadius about 18px), plus `elements` class overrides where the variables aren't enough.
- **CTA button** ("Start building"): if it currently goes to sign-up or the workspace, keep that. Restyle it with the send gradient and the spec's CTA typography.
- **Footer:** Inter, `--db-muted`, a top border `rgba(255,255,255,.07)`, and the "Daybreak" brand text if it shows one.
- **Scroll reveal:** add one small client hook or component (for example `components/Reveal.tsx`) with a shared `IntersectionObserver` and `threshold ~0.15`. It fades and rises each section 6px once, over `.5s` with `cubic-bezier(.22,1,.36,1)`, and does nothing under `prefers-reduced-motion: reduce`.

## Acceptance criteria
- Every section from today's homepage is present in the same order with the same copy (except brand renames).
- No blue anywhere below the hero, and no serif.
- Nav links and the scroll cue land on the right sections.
- The Pricing table reads as part of the page: dark glass cards, orange primary button, Inter.
- Sections reveal once on scroll, and don't under reduced motion.
- Contrast: body text on `--db-base` and `--db-surface` meets WCAG AA (4.5:1).
