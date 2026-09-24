# 06 — Restyle the code panel and replace the Sandpack theme

Status: resolved
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

**2026-09-24 (agent):** Done.
- `lib/sandpack-theme.ts` holds `SANDPACK_LITERALS`, each commented with the token it mirrors, and `daybreakSandpackTheme`, a plain `SandpackTheme` object literal, so there is no TDD test: the type already requires every key.
  - surface1 is `--db-base`, surface2 is `--db-border` flattened to #2f2f3c, surface3 is `--db-surface-solid`, and the accent is peach.
  - Syntax on base: keywords lavender (6.0:1), strings a warm green (10.4:1), numbers amber (9.1:1), functions peach (8.8:1), comments `--db-muted` italic (6.5:1). UI text is Inter and code uses a system mono stack.
  - Green and amber became tokens: `--db-syntax-string` and `--db-syntax-number`.
  - `@codesandbox/sandpack-themes` was removed. Nothing else used it.
- Tabs bar: `--db-surface`, 44px tall, with a `--db-border` bottom. Inactive tabs are muted. The focus ring is inset, so the header doesn't clip it.
  - Bug fix: the active underline never showed before. shadcn's `group-data-horizontal` variants don't match Base UI's `data-orientation`, so the underline is positioned in CodePanel instead.
- Improve with Agent is a lavender→peach wash with a lavender edge, a peach Bot icon and a peach PRO badge with `--db-on-accent` text.
  - Bug fix: `@keyframes shimmer` never existed. It is added to globals.css and runs only under `motion-safe`. Its computed animation is `none` with reduced motion.
  - The expanded input uses the same wash and a peach circle send button. Both got `aria-label`s.
  - The non-Pro trigger's ring comes from a `focusRingWithinClass` wrapper.
- Download is a `secondaryPillClass` pill.
- The overlay is `bg-db-base/85` with a blur and a peach `RingLoader`, replacing the blue one. The sub-line is `text-db-text/75`: over a light preview, muted text only reaches 4.2:1.
- The error bar is opaque `--db-surface-solid` with a `--db-danger` border, icon and title (4.8:1). The translucent surface only reaches 4.1:1 over a white preview. Fix with AI is the accent pill.
- The explorer border is `--db-border`. The placeholder app, which runs in the iframe without tokens, uses `SANDPACK_LITERALS`.
- Verified with a temporary preview route (deleted) that renders CodePanel with fake files, with `/api/gen-ai-code` and `/api/improve` aborted. Screenshots at 1440×900 and 900×900 cover Preview, Code, the Improve input, the locked state, generating, improving, the runtime error bar and the focus rings.
  - lint (0 errors, 6 warnings), `npm test` (47), build and `test:e2e` (25 passed, 3 skipped) all pass.
  - Not re-shot after review: the non-Pro wrapper span and the opaque error bar.
  - Not verified: the real signed-in workspace.
- For 07: the error bar is `absolute inset-x-0` with no positioned ancestor, so it spans the whole viewport, over the chat column too. This is unchanged from before. SANDPACK_LITERALS repeats four values from `DB_LITERALS` in `lib/clerk-appearance.ts`.
