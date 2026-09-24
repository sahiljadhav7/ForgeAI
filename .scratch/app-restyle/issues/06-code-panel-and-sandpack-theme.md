# 06 — Restyle the code panel and replace the Sandpack theme

Status: ready-for-agent
Blocked by: 01
Spec: `.scratch/app-restyle/spec.md` § Page treatments (Workspace, Sandpack)

## What

The right-hand side of the workspace uses `dracula` plus violet/fuchsia/cyan "Improve with AI" controls. Give it a Daybreak Sandpack theme and peach/lavender controls, so the editor and preview frame belong to the same product.

## Skills
- `/tdd`: for the Sandpack theme builder, if you write one as a function of the palette literals. Test that every required `SandpackTheme` key is present. Skip this if it's a plain object literal.
- `/run` (project skill `run-app`): sign in with the Clerk dev test user and open an existing project with generated files. Screenshot the Code and Preview tabs, the Improve input (Pro) and its locked badge (non-Pro), the generating overlay and the preview error bar, at 1440×900 and 900×900. Block or mock `/api/gen-ai-code` and `/api/improve`.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- Add a `daybreakSandpackTheme: SandpackTheme` in one file, e.g. `lib/sandpack-theme.ts`. Each literal gets a comment naming its `.daybreak` token, as in `lib/clerk-appearance.ts`.
  - Surfaces from `--db-base`/`--db-surface-solid`.
  - Borders from `--db-border`.
  - Accent peach.
  - Syntax: keywords lavender, strings a warm green, numbers and constants muted amber, functions peach, comments `--db-muted`.
  - Font Inter for UI and a monospace stack for code.
  - Replace `dracula` in `components/CodePanel.tsx`.
- **Tabs bar:** `--db-surface` background with a `--db-border` bottom. The active tab underline is peach, and inactive tabs are `--db-muted`.
- **Improve with AI:** replace the violet/fuchsia/cyan gradients, glows and text gradient with a lavender→peach treatment built from tokens (e.g. `--db-lavender` border at low alpha and an `--db-accent` icon). Keep the shimmer only under `prefers-reduced-motion: no-preference`. The "Pro" badge uses `--db-accent` with `--db-on-accent` text.
- **Download button:** a secondary pill in the header style.
- **Generating overlay:** `--db-base` at 85% with a blur. Text in `--db-text`/`--db-muted`. Replace `white/20`.
- **Preview error bar:** `--db-danger` accents on `--db-surface`, replacing `bg-red-950/99`. The "Fix with AI" button is the accent pill.

## Acceptance criteria
- No `violet-*`, `fuchsia-*`, `cyan-*`, `blue-*`, `#0a0a0a` or `dracula` left in `CodePanel.tsx`.
- Syntax highlighting stays readable: keywords, strings and comments each meet at least 4.5:1 on the editor background.
- Sandpack still hot-updates files without remounting, and the file explorer, editor and preview layout is unchanged.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass.

## Comments
