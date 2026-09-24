"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Composer from "./Composer";
import styles from "./landing.module.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Examples", href: "#examples" },
  { label: "Pricing", href: "#pricing" },
];

// Longest entrance animation (the scroll cue) ends at 1.63s; this is the
// fallback teardown from design.md.
const ANIM_TEARDOWN_MS = 2600;

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

// Half-sun on a horizon line with a short reflection, peach → lavender.
function RisingSunMark() {
  const gradientId = useId();
  return (
    <svg className={styles.mark} viewBox="0 0 34 34" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="8" x2="0" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FBBC94" />
          <stop offset="1" stopColor="#9C86CE" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`}>
        <path d="M5.5 22a11.5 11.5 0 0 1 23 0Z" />
        <rect x="2" y="24" width="30" height="2.4" rx="1.2" />
        <rect x="9" y="28.6" width="16" height="2.1" rx="1.05" />
      </g>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 14 8" fill="none" aria-hidden="true">
      <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Nav CTA: Get Started (Clerk sign-up modal) when signed out, My projects
// plus the avatar when signed in. Signed-out markup also covers Clerk's
// loading state, so the CTA is in place on first paint.
function AuthActions({
  ctaClassName,
  onNavigate,
}: {
  ctaClassName: string;
  onNavigate?: () => void;
}) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return (
      <>
        <Link href="/projects" className={ctaClassName} onClick={onNavigate}>
          <span>My projects</span>
        </Link>
        <UserButton appearance={{ elements: { avatarBox: styles.avatar } }} />
      </>
    );
  }
  return (
    <SignUpButton mode="modal">
      <button type="button" className={ctaClassName} onClick={onNavigate}>
        <span>Get Started</span>
      </button>
    </SignUpButton>
  );
}

export default function Hero() {
  const menuRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rendered on the server too, so the entrance starts on first paint. The
  // keyframes only apply under prefers-reduced-motion: no-preference.
  const [anim, setAnim] = useState(true);
  // Autoplay waits for the client (server value false) so reduced-motion
  // users never start the video; preload starts from the server render.
  const motionOK = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDesktop = useMediaQuery("(min-width: 1181px)");

  useEffect(() => {
    const t = setTimeout(() => setAnim(false), ANIM_TEARDOWN_MS);
    return () => clearTimeout(t);
  }, []);

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

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.checked = false;
  };

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
        <input
          ref={menuRef}
          id="landing-menu"
          type="checkbox"
          className={styles.menuToggle}
          aria-label="Menu"
          aria-controls="landing-menu-sheet"
        />

        <header className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="Daybreak home">
            <RisingSunMark />
            <span className={styles.wordmark}>Daybreak</span>
          </Link>

          <nav aria-label="Primary" className={styles.links}>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className={styles.link}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className={styles.navRight}>
            <AuthActions ctaClassName={styles.cta} />
          </div>

          <label htmlFor="landing-menu" className={styles.burger} aria-hidden="true">
            <svg viewBox="0 0 17 12" fill="currentColor">
              <rect y="1" width="17" height="1.8" rx=".9" />
              <rect y="9.2" width="17" height="1.8" rx=".9" />
            </svg>
          </label>

          <div id="landing-menu-sheet" className={styles.sheet}>
            <div className={styles.sheetInner}>
              <div className={styles.panel}>
                {NAV_LINKS.map((l) => (
                  <a key={l.href} href={l.href} className={styles.sheetLink} onClick={closeMenu}>
                    {l.label}
                  </a>
                ))}
                <div className={styles.sheetAuth}>
                  <AuthActions ctaClassName={styles.sheetCta} onNavigate={closeMenu} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.hero}>
          <h1 className={styles.h1}>Describe an app. We&apos;ll build it.</h1>
          <Composer />
        </div>

        <div className={styles.proof}>
          <a
            href="#how-it-works"
            className={styles.cue}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) setAnim(false);
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
