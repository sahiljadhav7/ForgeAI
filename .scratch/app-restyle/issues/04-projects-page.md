# 04 — Restyle the projects page and delete modal

Status: ready-for-agent
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
