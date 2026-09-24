// Pure logic behind the landing composer (app/(landing)/Composer.tsx).

// The /workspace URL that starts generation for `prompt`, or null when there
// is nothing to submit (empty or whitespace only).
export function buildWorkspaceUrl(prompt: string): string | null {
  const trimmed = prompt.trim();
  if (!trimmed) return null;
  return `/workspace?prompt=${encodeURIComponent(trimmed)}`;
}

export type SubmitPlan =
  | { type: "navigate"; url: string }
  | {
      type: "sign-in";
      forceRedirectUrl: string;
      signUpForceRedirectUrl: string;
    };

// What submitting `prompt` should do. Signed in: go to the workspace. Signed
// out: open Clerk sign-in, landing on the workspace afterwards so the prompt
// survives. While Clerk is still loading we can't tell, so navigate and let
// the proxy's redirectToSignIn (which keeps the URL) handle signed-out users.
export function planSubmit(
  prompt: string,
  auth: { isLoaded: boolean; isSignedIn: boolean | undefined },
): SubmitPlan | null {
  const url = buildWorkspaceUrl(prompt);
  if (!url) return null;
  if (auth.isSignedIn || !auth.isLoaded) return { type: "navigate", url };
  return { type: "sign-in", forceRedirectUrl: url, signUpForceRedirectUrl: url };
}

// `count` distinct items in random order (all of them if there are fewer),
// via a partial Fisher–Yates shuffle. Deterministic for a given `rng`; an
// out-of-range value (1, negative, NaN) is clamped so the result is always
// made of distinct items from the list.
export function pickSuggestions<T>(
  items: T[],
  count: number,
  rng: () => number = Math.random,
): T[] {
  const pool = [...items];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const r = rng();
    const unit = r >= 0 && r < 1 ? r : 0;
    const j = i + Math.floor(unit * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
