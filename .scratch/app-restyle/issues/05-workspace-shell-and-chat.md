# 05 — Restyle the workspace shell and chat panel

Status: ready-for-agent
Blocked by: 01
Spec: `.scratch/app-restyle/spec.md` § Page treatments (Workspace)

## What

Bring the workspace's chat side in line with the landing composer and palette. The 320px chat column, message flow and every generation behaviour stay exactly as they are.

## Skills
- `/run` (project skill `run-app`): sign in with the Clerk dev test user and open an existing project (`/workspace?id=…`) and an empty `/workspace`. Screenshot at 1440×900 and 900×900. **Block `/api/gen-ai-code` and `/api/improve`**, so nothing spends Gemini credits or writes to the DB. To see the status list and streaming states, mock those routes with Playwright `page.route` and canned SSE.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- Fix the double top offset: `app/(main)/workspace/layout.tsx` adds `mt-16` on top of the `(main)` layout's `mt-16`. Remove the workspace one, and keep `h-[calc(100vh-4rem)]` in `WorkspaceClient` so the panels fill the viewport exactly with no page scroll.
- `components/WorkspaceClient.tsx`: drop `bg-[#0a0a0a]` in favour of `--db-base`.
- `components/ChatPanel.tsx`:
  - **Panel:** `--db-surface`-tinted column (replacing `#0d0d0d`) with a `--db-border` right edge. The header title becomes display text in `--db-text` (replacing `BlueTitle`), and the credits badge matches the header's credits pill.
  - **Bubbles:** user messages on `--db-surface-raised`, assistant messages on `--db-surface`. Text in `--db-text` at ≥ AA. Inline code uses `--db-surface-raised` with peach text instead of `blue-300`.
  - **Streaming and status:** the thinking label and wand icon are lavender, and the caret and spinners are peach. Replace every `blue-400`.
  - **Out-of-credits card:** warm red on `--db-surface`. The Upgrade button is the accent pill. Fix the bug where the "Upgrade Plan" text is a child of `<Sparkles>` and so never renders.
  - **Composer:** use the landing composer's glass (`--db-surface`, inset `--db-border`, radius, focus ring). The send button becomes the peach accent circle, disabled state included. The stop button uses `--db-surface-raised`. The paperclip is muted.
  - **Microcopy:** move the `text-white/15`–`/25` lines to `--db-muted`: the empty-chat hint and the footer disclaimer.
  - **Malformed classes:** fix `[&:: -webkit-scrollbar]:hidden` (it has a stray space) and `active-scale`.
- `app/(main)/workspace/error.tsx`: the heading stays display, the text is `--db-muted`, "Try again" is the accent pill, and "Back home" is the secondary pill.

## Acceptance criteria
- No `blue-*`, `#0a0a0a` or `#0d0d0d` left in `ChatPanel.tsx`, `WorkspaceClient.tsx` or the workspace layout.
- `/workspace` has no page-level vertical scroll at 1440×900. The chat list scrolls on its own.
- Enter/Shift+Enter, image attach, stop and the credit gating behave exactly as before. Verify with the mocked routes.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` pass.

## Comments
