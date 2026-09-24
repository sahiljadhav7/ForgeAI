# 05 — Composer behavior: submit, sign-in redirect, rotating placeholder, random suggestion chips

Status: done
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

## Comments

**2026-09-24 (Claude):** Implemented on `feat/new-frontend`.

**What changed**
- `lib/composer.ts` (new) has three pure functions:
  - `buildWorkspaceUrl(prompt)`: trims, returns `null` for empty or whitespace-only input, otherwise `/workspace?prompt=<encodeURIComponent(trimmed)>`.
  - `pickSuggestions(items, count, rng = Math.random)`: a partial Fisher–Yates shuffle, so the picks are distinct. It returns everything when `count > length`, doesn't mutate the input, and is deterministic for a given `rng`. Out-of-range RNG values (1, negative, NaN) are clamped, so the result is always distinct items from the list (the spec's "stable fallback").
  - `planSubmit(prompt, { isLoaded, isSignedIn })`: decides what submit does. It returns `null` for a blank prompt, `{ type: "navigate", url }` when signed in or while Clerk is still loading, and `{ type: "sign-in", forceRedirectUrl, signUpForceRedirectUrl }` (both set to the same URL) when signed out.
- `lib/composer.test.ts` (new) has 20 tests, written red → green one slice at a time with the `tdd` skill:
  - URL building: trimming, `&`/`?`/`#`, newlines, emoji, a `URLSearchParams` round-trip, and `null` on `""`, `"   \n"` and `"\t \n  "`.
  - Picking: always 3 distinct items from the list (200 runs), `count > length` returns everything, a hand-worked stub RNG gives `["f","d","c"]` every time, no mutation of the input, and the misbehaving-RNG fallback.
  - Submit planning: signed out opens sign-in with both redirects, signed in navigates, Clerk loading navigates, and a blank prompt plans nothing.
  - The encoding tests passed on their first run, since `encodeURIComponent` already covers them. I checked they can fail by briefly swapping in `encodeURI`, which turns two of them red.
- `app/(landing)/Composer.tsx`:
  - Controlled `prompt`. Enter submits and Shift+Enter adds a line. Enter during IME composition doesn't submit.
  - The 3s placeholder rotation over `PLACEHOLDERS` pauses while the textarea is focused or non-empty.
  - Send is `disabled` when `buildWorkspaceUrl` returns `null`. The silent signed-out `return` is gone.
  - Signed in → `router.push(url)`. Signed out → `useClerk().openSignIn({ forceRedirectUrl, signUpForceRedirectUrl })`.
  - Chips: the first three on the server and during hydration, then a random three. Clicking a chip sets `prompt` to its `prompt` and focuses the textarea.
  - Auto-grow: a layout effect, which also re-runs on window resize, sets the textarea height from `scrollHeight`, capped by the CSS `max-height`. It writes the growth to `--grow` on the card.
- `app/(landing)/landing.module.css`:
  - The card is `height: calc(143u + var(--grow))` with `margin-bottom: calc(-1 * var(--grow))`. The card grows downward, and its layout box stays the base size, so the vertically centred hero (headline) doesn't move.
  - Desktop `.tools` is anchored with `bottom: 21u` (`--tools-bottom`, replacing `--tools-y`).
  - The textarea gets `overflow-y: auto`, a thin scrollbar, and a `max-height` per layout: desktop `1.35em + 143u` (exactly 2×), tablet 7 lines, phone 12 lines, extra-short 4 lines.
  - The disabled send drops its hover and active effects.
- `lib/data.ts` is unchanged. Ticket 04 had already reshaped `SUGGESTIONS` to `{ label, prompt }[]`, and its only usage is the composer.
- Confirmed: `app/(main)/workspace/page.tsx` passes `?prompt=` as `initialPrompt`, and `ChatPanel` auto-submits it once on mount.

**Decisions**
- **Chips without `useEffect`.** `setChips(...)` inside a `useEffect` is a lint error here (`react-hooks/set-state-in-effect`, which would add a new error to the baseline). I used a `useSyncExternalStore` "hydrated" flag instead, the same pattern as `Hero.tsx`'s `useMediaQuery`. It is `false` on the server and during hydration and `true` after. The random pick is held in `useState` and only shown once hydrated. The behaviour is what the spec asks for: first three on the server and first client render, then a swap, with no hydration warning. On a client-side navigation back to `/` the random chips show on the first render, which is fine because nothing hydrates then.
- **Clerk still loading → navigate, not the modal.** Before Clerk loads we can't tell whether the user is signed in. `openSignIn` would queue a modal even for a signed-in user. So submit does a `router.push`, and `proxy.ts`'s `redirectToSignIn()` sends signed-out users to hosted sign-in with `redirect_url` = the full `/workspace?prompt=…` URL. The prompt survives and nothing returns silently, but in this edge case the sign-in is a page, not a modal. Once Clerk has loaded, signed-out users get the modal as specified.
- **`planSubmit` keeps Clerk's option shape** (`forceRedirectUrl` + `signUpForceRedirectUrl`) instead of a single `url`, so the exact `openSignIn` options are covered by unit tests. This is the test seam for the signed-out path, which can't run locally.
- **Growth caps.** The spec says "about 2×". I measured the base → capped card height at each layout:

  | Layout | Base | Capped | Ratio |
  | --- | --- | --- | --- |
  | Desktop 1560×1008 | 143 | 286 | 2.0× |
  | Tablet 900×900 | 112 | 214 | 1.9× |
  | Phone 390×844 | 194 | 364 | 1.88× |
  | Extra-short 900×500 | 160 | 217 | 1.36× |

  Extra-short is deliberately below 2×. At 2× the card ran past the bottom of the 100dvh stage (bottom at y=537 of 500) and was clipped. Four lines keeps it inside the stage and above the scroll cue.
- **The disabled send keeps the design.md look** (only the cursor, hover and active change), so the empty state stays pixel-exact per the spec. The tradeoff is that the button gives no visual cue that it's disabled.
- **Reduced motion.** Ticket 04's reduce rule forces `transition-duration: .01ms !important` on every `.stage *`. With the default `transition-property: all`, that turned the textarea and card height changes into transitions, so the synchronous height read-back returned the old value. The card never grew, and after a chip click the textarea kept its old height. The card and textarea now opt out with `transition: none !important` inside that block.

**Verification**
- `npm run lint`: 12 problems (2 errors, 10 warnings), the same as the baseline. The errors are the pre-existing `gravity-stars.tsx`/`stars.tsx` ones, and the files with problems are unchanged.
- `npm test`: 4 files, 36/36 pass (16 existing + 20 new).
- `npm run build`: passes.
- Prod build, headless Chromium, run with the `run-app` skill. The server was stopped with `fuser` and `port 3100 free` confirmed. I drove the composer with ad-hoc Playwright scripts at 1560×1008 (with and without reduced motion), 900×900, 390×844 and 900×500:
  - Empty state is unchanged at 1560×1008: card (424.5, 413.4) 708×143, send at card-relative (659, 94), h1 top 322.6, cue top 799.
  - Send is disabled when empty and when whitespace-only (spaces plus a Shift+Enter newline). Enter on whitespace doesn't navigate.
  - Shift+Enter gives `"line one\nline two"` with no navigation.
  - The placeholder rotates after 3.3s when idle. It doesn't change over 3.5s while focused, or over 3.3s while non-empty and blurred.
  - Growth at desktop, one line at a time: 143 → 157 → 170 → … → 286, then the textarea scrolls (`scrollHeight` 404 vs `clientHeight` 156). Send stays 49u from the card bottom at every height (= 143 − 94), chips stay 51u from it, and the h1 doesn't move. The other layouts behave the same (send-to-bottom distance constant, h1 fixed), with the caps in the table above.
  - Clicking a chip fills the textarea with its prompt, focuses it, and shrinks the card back to the base height.
  - Chips: server HTML has Spotify stats / Kanban board / Weather app, and hydrated chips differ. Five reloads gave 5 different sets.
  - Console: no hydration or React warnings. The only messages are the expected Clerk `pk_live` 400 and the "Production Keys" warning.
  - Enter with `"  Tom & Jerry? #1 🚀 "`: Clerk never loads on localhost, so the loading branch navigated. The proxy then landed on `/sign-in?redirect_url=http://localhost:3100/workspace?prompt=Tom+%26+Jerry%3F+%231+%F0%9F%9A%80`, i.e. trimmed, with the prompt kept.
  - I looked at every screenshot (empty, mid-growth, capped and chip-filled at each size): the toolbar is pinned to the bottom edge, and nothing is clipped or overlaps the cue.

**Review (/code-review, two sub-agents)**
- Spec, fixed: the phone cap comment claimed "about 2x" while measuring 1.7×. I raised the cap to 12 lines (1.88×, card bottom 746 vs cue 791) and corrected the comment.
- Spec, recorded as decisions above: the loading-state navigation instead of the modal, the reduced extra-short cap, `useSyncExternalStore` instead of `useEffect`, and the lack of a visual disabled state on send. The reviewer also flagged `planSubmit`, the RNG clamping and the thin scrollbar as minor, defensible extras. I kept them: `planSubmit` is the only test seam for the signed-out path, and the clamping implements the spec's "stable fallback".
- Standards (no hard violations):
  - Negative `margin-bottom` makes the grown card overlap the content below on tablet and phone → intended. That's how the card grows downward without moving the centred hero. Measured: it never reaches the cue.
  - Data Clump: the sign-in plan carries two identical URLs → kept, so tests cover Clerk's exact options (see Decisions).
  - `useHydrated` duplicates the idea behind Hero's `useMediaQuery` → left as is at two copies. Extract a shared hook if a third appears.
  - Hand-derived `em` caps → each has a lines/ratio comment. Left as is.
  - `disabled` removes send from the tab order → kept, since the ticket says "Send is `disabled`". Enter in the textarea covers keyboard users.
  - Older Safari reports `keyCode 229` rather than `isComposing` → nit, not handled.

**Unverified / left for later**
- **Signed out, end to end:** the Clerk modal opening, sign-in completing, and landing on `/workspace?prompt=…` with generation starting. Clerk `pk_live` keys only work on forgeai.lol, so Clerk never loads locally. The `openSignIn` options are covered by the `planSubmit` tests and by reading the code. The prop names were checked against `@clerk/shared` types, and `openSignIn` queues until Clerk loads. **Needs a human** with dev keys or on a preview deploy.
- **Signed in, end to end:** typing + Enter → `/workspace?prompt=…` → generation. The same Clerk limitation applies. Covered by the `buildWorkspaceUrl`/`planSubmit` tests, plus the checked `initialPrompt` → `ChatPanel` auto-submit path.
- **For 07:** Chrome treats any textarea focus as `:focus-visible`, so ticket 04's `#F8B285` ring shows around the textarea the whole time you type, including after a chip click. It's heavy inside the glass card. Consider a subtler ring for the textarea only, or a ring on the card via `:focus-within`.
- **For 07:** on phone the card's max growth sits about 45px above the cue. If the compact layout changes, recheck the 12-line cap.

