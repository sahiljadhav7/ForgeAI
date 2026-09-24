# 05 — Composer behavior: submit, sign-in redirect, rotating placeholder, random suggestion chips

Status: ready-for-agent
Blocked by: 04
Spec: `.scratch/new-frontend/spec.md` § Composer

## What

Make the hero composer work. The logic is pulled into small pure functions so it can be unit-tested in Vitest's `node` environment.

## Skills
- `/tdd`: build `lib/composer.ts` test-first (`buildWorkspaceUrl`, `pickSuggestions`) in `lib/composer.test.ts`.
- `/run`: verify Enter/Shift+Enter, auto-grow to the cap, chip clicks, and no hydration warning. The signed-out → sign-in → `/workspace?prompt=` flow needs a human to complete the Clerk sign-in.
- `/diagnosing-bugs`: if the chip hydration mismatch or the textarea auto-grow misbehaves.
- `/code-review`: review the diff against this ticket before committing.

## Tasks
- **`lib/composer.ts`** (new), with pure functions:
  - `buildWorkspaceUrl(prompt: string): string | null`: trims, returns `null` for empty or whitespace-only prompts, otherwise `/workspace?prompt=<encodeURIComponent(trimmed)>`.
  - `pickSuggestions<T>(items: T[], count: number, rng = Math.random): T[]`: returns `count` distinct items, or all of them if there are fewer. Deterministic given `rng`.
- **`lib/composer.test.ts`**:
  - URL building: trimming, encoding of `&`, `?`, `#`, newlines and emoji, and `null` on `""` and `"   \n"`.
  - Picking: always `count` distinct items, no duplicates, a stub RNG gives a stable result, and `count > length` returns everything.
- **`lib/data.ts`**: change `SUGGESTIONS` to `{ label: string; prompt: string }[]`, with a short label (2–3 words) for each existing prompt. Update every usage.
- **Textarea**
  - Controlled `prompt` state. Enter submits; Shift+Enter adds a new line.
  - Auto-grow: the height follows `scrollHeight`, and the card grows downward to a cap of about 2× the base card height, after which the textarea scrolls. The toolbar stays pinned to the card's bottom, so on desktop `.tools` is anchored with `bottom` instead of `top`: 143 − 92 − 30 = 21u from the card bottom.
  - Keep the existing 3s placeholder rotation over `PLACEHOLDERS`, paused while focused or non-empty.
- **Submit**
  - Signed in: `router.push(buildWorkspaceUrl(prompt))`.
  - Signed out: open Clerk sign-in in a modal with `forceRedirectUrl` and `signUpForceRedirectUrl` set to the same URL, using `useClerk().openSignIn({...})` so the redirect can be dynamic.
  - Send is `disabled` when `buildWorkspaceUrl` returns `null`.
  - Remove the silent `return` for signed-out users.
- **Chips:** render `SUGGESTIONS.slice(0, 3)` on the server and on the first client render, then replace them with `pickSuggestions(SUGGESTIONS, 3)` in a `useEffect`. Clicking a chip sets `prompt` to the chip's `prompt` and focuses the textarea.
- Confirm `/workspace` still starts generation from `?prompt=` (`app/(main)/workspace/page.tsx` passes it as `initialPrompt`).

## Acceptance criteria
- `npm test` passes, including the new `lib/composer.test.ts`.
- Signed in: typing a prompt and pressing Enter lands on `/workspace?prompt=…` and generation starts.
- Signed out: pressing send opens the sign-in modal, and after signing in the user lands on `/workspace?prompt=<their prompt>` and generation starts.
- An empty or whitespace-only prompt can't be submitted by Enter or the button.
- Chips differ between reloads (usually), and there's no hydration warning in the console.
- A long prompt grows the card to the cap and then scrolls inside. The send button stays at its spec position relative to the card's bottom.
