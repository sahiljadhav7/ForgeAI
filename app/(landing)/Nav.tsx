"use client";

import { useId, useRef } from "react";
import Link from "next/link";
import { SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useEntrance } from "./entrance";
import styles from "./landing.module.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Examples", href: "#examples" },
  { label: "Pricing", href: "#pricing" },
];

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

// The landing nav. It sits outside <main> (so it's the page's banner
// landmark) and is laid over the hero at the frame's padding; the hero keeps
// a nav-height spacer in its place. The burger menu is design.md's CSS-only
// checkbox, which has to stay the header's preceding sibling.
export default function Nav() {
  const menuRef = useRef<HTMLInputElement>(null);
  // The nav's entrance ends by 0.9s; the timeout teardown is enough.
  const [anim] = useEntrance();

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.checked = false;
  };

  return (
    <>
      <input
        ref={menuRef}
        id="landing-menu"
        type="checkbox"
        className={styles.menuToggle}
        aria-label="Menu"
        aria-controls="landing-menu-sheet"
      />

      <header className={cn(styles.nav, anim && styles.anim)}>
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
    </>
  );
}
