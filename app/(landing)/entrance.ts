import { useCallback, useEffect, useState } from "react";

// design.md's fallback teardown: the entrance class comes off after the last
// animation ends or after this long, whichever is first.
const ENTRANCE_TEARDOWN_MS = 2600;

// Whether a subtree still carries design.md's `anim` class. It is rendered on
// the server too, so the entrance starts on first paint; the keyframes only
// apply under prefers-reduced-motion: no-preference. Call `end` from the
// subtree's last animationend to tear down early.
export function useEntrance() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setActive(false), ENTRANCE_TEARDOWN_MS);
    return () => clearTimeout(t);
  }, []);

  const end = useCallback(() => setActive(false), []);
  return [active, end] as const;
}
