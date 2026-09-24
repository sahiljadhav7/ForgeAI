"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import Composer from "./Composer";
import { useEntrance } from "./entrance";
import styles from "./landing.module.css";

// Server render and hydration use `serverValue`, then the real match.
function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 14 8" fill="none" aria-hidden="true">
      <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The full-viewport video hero: headline, composer and scroll cue. The nav
// (Nav.tsx) is laid over it from outside <main>; the spacer holds its place.
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // The scroll cue's entrance is the last one; its animationend tears down.
  const [anim, endAnim] = useEntrance();
  // Autoplay waits for the client (server value false) so reduced-motion
  // users never start the video; preload starts from the server render.
  const motionOK = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDesktop = useMediaQuery("(min-width: 1181px)");

  // Autoplay only when motion is allowed; otherwise the poster stays.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (motionOK) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [motionOK]);

  const preload = reduceMotion ? "none" : isDesktop ? "auto" : "metadata";

  return (
    <div className={cn(styles.stage, anim && styles.anim)}>
      <video
        ref={videoRef}
        className={styles.video}
        src="/daybreak-hero.mp4"
        poster="/daybreak-hero-poster.webp"
        preload={preload}
        autoPlay={motionOK}
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className={styles.fade} aria-hidden="true" />

      <div className={styles.frame}>
        <div className={styles.navSpace} aria-hidden="true" />

        <div className={styles.hero}>
          <h1 className={styles.h1}>Describe an app. We&apos;ll build it.</h1>
          <Composer />
        </div>

        <div className={styles.proof}>
          <a
            href="#how-it-works"
            className={styles.cue}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) endAnim();
            }}
          >
            <span>See how it works</span>
            <ChevronDown />
          </a>
        </div>
      </div>
    </div>
  );
}
