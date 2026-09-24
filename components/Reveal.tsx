"use client";

import { useEffect, useRef } from "react";
import { createRevealRegistry, shouldDeferReveal } from "@/lib/reveal";

// One IntersectionObserver for every <Reveal> on the page.
let registry: ReturnType<typeof createRevealRegistry<Element>> | null = null;

function getRegistry() {
  registry ??= createRevealRegistry<Element>(
    (onEntries) => new IntersectionObserver(onEntries, { threshold: 0.15 }),
  );
  return registry;
}

/**
 * Fades and rises its content 6px the first time it scrolls into view.
 * Server HTML is fully visible: only content that starts below the fold is
 * hidden, and only once the client has checked motion preferences. The
 * transition itself lives in globals.css ([data-reveal]).
 */
export default function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const defer = shouldDeferReveal({
      top: el.getBoundingClientRect().top,
      viewportHeight: window.innerHeight,
      reducedMotion,
    });
    if (!defer) return;

    el.dataset.reveal = "pending";
    const unwatch = getRegistry().watch(el, () => {
      el.dataset.reveal = "shown";
    });
    return () => {
      unwatch();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
