export type RevealEntry<T> = { target: T; isIntersecting: boolean };

export type RevealObserver<T> = {
  observe(target: T): void;
  unobserve(target: T): void;
  disconnect(): void;
};

export type RevealObserverFactory<T> = (
  onEntries: (entries: RevealEntry<T>[]) => void,
) => RevealObserver<T>;

/**
 * One-shot reveal bookkeeping on a single shared observer. Each watched
 * target is revealed the first time it intersects, then forgotten. The
 * observer is created on the first watch and disconnected once nothing is
 * left to watch.
 */
export function createRevealRegistry<T>(makeObserver: RevealObserverFactory<T>) {
  const pending = new Map<T, () => void>();
  let observer: RevealObserver<T> | null = null;

  const forget = (target: T) => {
    if (!pending.delete(target)) return;
    observer?.unobserve(target);
    if (pending.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };

  const handle = (entries: RevealEntry<T>[]) => {
    for (const { target, isIntersecting } of entries) {
      const onReveal = pending.get(target);
      if (!isIntersecting || !onReveal) continue;
      forget(target);
      onReveal();
    }
  };

  return {
    /** Watches `target`; returns a function that stops watching it. */
    watch(target: T, onReveal: () => void): () => void {
      observer ??= makeObserver(handle);
      pending.set(target, onReveal);
      observer.observe(target);
      return () => forget(target);
    },
  };
}

/**
 * Whether a target should start hidden and wait to be revealed. Only targets
 * that begin wholly below the fold are hidden, so content already on screen
 * (or scrolled past, e.g. after a reload mid-page) never blinks out. Nothing
 * is hidden under reduced motion.
 */
export function shouldDeferReveal({
  top,
  viewportHeight,
  reducedMotion,
}: {
  top: number;
  viewportHeight: number;
  reducedMotion: boolean;
}): boolean {
  return !reducedMotion && top >= viewportHeight;
}
