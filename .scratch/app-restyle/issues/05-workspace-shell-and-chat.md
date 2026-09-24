# 05 — Restyle the workspace shell and chat panel

Status: resolved
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

**2026-09-24 (agent):** Done.
- Double offset: `app/(main)/workspace/layout.tsx` only added the second `mt-16`, so it is deleted. `WorkspaceClient` keeps `h-[calc(100vh-4rem)]` on `bg-db-base`. At 1440×900 the document is exactly 900px tall, and the chat list scrolls on its own (scrollHeight 1179, clientHeight 647).
- ChatPanel:
  - The column is `bg-db-surface/40` with a `--db-border` right edge and dividers.
  - The title is `font-display` in `--db-text`. `BlueTitle` is deleted from `reusable.tsx`, and nothing uses it any more.
  - The credits badge is the header pill (`secondaryPillClass` + peach `Zap`), warm red when out of credits. The "N creditss" typo is fixed: it now reads "1 credit" or "N credits".
  - User bubbles are on `--db-surface-raised`. Assistant bubbles and the status bubble are on `--db-surface` with a `--db-border` edge, so they separate from the column.
  - Inline code is peach on raised.
  - The Thinking and "Agent reasoning" labels and the wand are lavender. The caret and running spinner are peach. Reasoning text is `text-db-text/75`, about 8:1.
  - The out-of-credits card is warm red on surface with an accent "Upgrade Plan" pill. The text had been a child of `<Sparkles>`, which is fixed.
  - The composer is `rounded-db` glass: `bg-db-surface`, an inset `--db-border` ring and a blur, with the peach outline when the textarea has focus (`has-[textarea:focus-visible]`).
  - Send is an `accentPillClass` circle, dimmed by `Button`'s `disabled:opacity-50`. Stop is `variant="secondary"` (raised surface). The paperclip is muted.
  - The empty hint and the footer are `--db-muted`.
  - Fixed `[&::-webkit-scrollbar]:hidden`, `active:scale-95` and `border-white//8`.
  - Buttons get `aria-label`s and the Daybreak ring, via `focus-visible:outline-solid` because shadcn `Button` sets `outline-none`.
- `error.tsx`: text is `--db-muted`, "Try again" is `accentPillClass` and "Back home" is the new `secondaryPillClass`.
- New shared classes in `reusable.tsx`:
  - `focusRingWithinClass`, the header's descendant ring. The Header now uses it with no visual change.
  - `secondaryPillClass`, the header credits-pill look plus ring and press. Ticket 06 can use it for Download.
- Verified: I used a temporary unauthenticated preview route (deleted) that renders `WorkspaceClient` with fake data, plus an init-script fake `fetch` that streams canned SSE for `/api/gen-ai-code` and `/api/improve`. `page.route` aborted every other `/api/**` call, and Supabase storage was mocked.
  - Screenshots at 1440×900 and 900×900 cover an existing project, an empty workspace, the status list while generating, the Thinking state, the reasoning stream with its caret, a pending image, the out-of-credits state and the focus ring.
  - Behaviour matches before:
    - Shift+Enter adds a newline without sending, and Enter sends.
    - Stop aborts and removes the user message.
    - Attaching an image shows the preview, and the X clears it.
    - Out of credits, the textarea is disabled and Upgrade opens the pricing dialog.
  - lint (0 errors, 6 warnings, down from 9), `npm test` (47), build and `test:e2e` (25 passed, 3 skipped) all pass.
- Not verified:
  - The real signed-in `/workspace` with DB data, because signing in writes to the production DB.
  - The `error.tsx` visuals. It only typechecks.
- Review notes:
  - The completed status steps (12px, muted, 5.1:1) and the ticket-mandated muted hint and footer are small `--db-muted` text on a surface tint. They pass AA but sit against the spec's "no muted under 14px on surface" rule. Ticket 07 may want to revisit this.
  - The ring is `--db-accent-solid`, not the composer's `#f8b285`. That is still ticket 07's to reconcile.
