# 04 — Restyle the projects page and delete modal

Status: resolved
Blocked by: 01
Spec: `.scratch/app-restyle/spec.md` § Page treatments (Projects, Modals)

## What

`/projects` should look like a landing section: a lavender label over a warm display heading, warm glass cards and the peach accent button. The grid layout and behaviour stay the same.

## Skills
- `/run` (project skill `run-app`): sign in with the Clerk dev test user and screenshot `/projects` at 1440×900, 900×900 and 390×844, with projects and empty. Open the delete modal, but don't confirm a delete on real data.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- `app/(main)/projects/page.tsx`:
  - Drop `bg-[#0a0a0a]` so the page sits on `--db-base`, and add a faint `--db-glow-lavender` at the top.
  - Heading: `SectionLabel` "Your apps" plus a single-line display `<h1>` "Projects" in `--db-text`. Replace `BlueTitle`.
  - Subtitle in `--db-muted`.
  - "New project" becomes the accent pill. Fix the nested `<Link><Button>`, which is interactive content inside interactive content: use one element.
  - Stack the heading and button on phone widths.
- Empty state: an icon tile on `--db-surface`, text in `--db-text`/`--db-muted` (no `white/20`), and the accent "Start building" pill.
- `components/ProjectCard.tsx`:
  - Cards on `--db-surface`, `rounded-db`, `--db-border`. On hover the border goes peach at low alpha and the card goes to `--db-surface-raised`.
  - Title in `--db-text`, prompt and meta in `--db-muted`. The divider uses `--db-border`.
  - The delete icon is muted and turns `--db-danger` on hover. It needs an accessible name (`aria-label="Delete {title}"`) and a visible focus ring.
- `components/DeleteProjectModal.tsx`:
  - Remove the `#111111` and `white/*` overrides so the dialog inherits the remapped tokens.
  - Cancel is a proper secondary button (it's a `<span>` inside `DialogClose` today).
  - Delete uses `--db-danger`.

## Acceptance criteria
- No `#0a0a0a`, `#0f0f0f`, `#111111` or blue left in these three files.
- All text meets AA contrast on its background. Check the card meta and the empty-state line.
- Cards stay a 1/2/3-column grid, and the whole card is still the link to `/workspace?id=…`.
- The delete button is reachable by keyboard without opening the card.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass.

## Comments

**2026-09-24 (agent):** Done.
- `/projects` sits on `--db-base` with a faint lavender `<Glow>` at the top.
  - The heading is `SectionLabel` "Your apps" over a display `<h1>` "Projects", with the subtitle in `--db-muted`.
  - "New project" is one `<Link>` styled with `accentPillClass`, which fixes the nested `<Link><Button>`. The heading and button stack below `sm`.
  - The empty state has a `--db-surface` icon tile, text in `--db-text`/`--db-muted` (the muted line is 14px, 6.5:1 on base) and the accent "Start building" pill.
  - The empty state has no glow of its own. It sits under the page's lavender glow, which is the same `--db-glow-lavender` the landing CTA uses. A nested glow left a visible seam where it met the page glow.
- Shared pieces in `components/reusable.tsx`:
  - `Glow` (tone `lavender`/`peach`, height via `className`). The auth layout and the 404 now use it, with identical classes and no visual change.
  - `focusRingClass`, the solid peach 2px outline at offset 3. `accentPillClass` uses it.
  - `displayHeadingClass`, shared by `SectionHeading`, the 404 and projects.
- `ProjectCard`:
  - Cards are `--db-surface`, `rounded-db` and `--db-border`. On hover the border goes `db-accent/40` and the card goes `--db-surface-raised`.
  - The title is in `--db-text`. The prompt (now 14px) and the meta (12px) are in `--db-muted`: 5.1:1 on surface and 4.6:1 on hover.
  - The whole card is still the link, and the link now has the focus ring. The grid is still 1/2/3 columns.
- `DeleteProjectModal`:
  - It now renders its own trash `DialogTrigger`, with `aria-label="Delete {title}"`, muted text that turns `--db-danger` on hover, and the focus ring. Its `children` prop is gone, and ProjectCard was the only caller.
  - The dialog inherits the remapped tokens.
  - Cancel is `DialogClose render={<Button variant="outline">}`.
  - Delete is `bg-db-danger` with `--db-base` text, 6.1:1. White text would be 3.1:1.
- `BlueTitle` is kept, because ChatPanel still uses it (ticket 05 should delete it).
- Verification:
  - Screenshots at 1440×900, 900×900 and 390×844, with projects and empty, came from a temporary unauthenticated preview route that rendered the page's markup with fake projects. I deleted the route before committing.
  - The hover state was checked through computed styles. Keyboard tab order is New project → Open card → Delete card → next card, and the ring is visible.
  - Enter on the delete button opens the modal without navigating. Cancel closes it.
  - I never confirmed a delete, and I didn't sign in, because signing in writes to the production DB. So the real `/projects` data path and the delete action are unverified. Ticket 07's signed-in pass should cover them.
  - lint (0 errors, 9 existing warnings), `npm test` (47), build and `test:e2e` (25 passed, 3 skipped) all pass.
- Code review fixes:
  - Moved the trigger styling into the modal instead of passing a `triggerClassName`.
  - Extracted the focus ring and display heading classes.
  - Dropped the peach empty-state icon and the danger-on-focus colour.
