"use client";

import { useRef } from "react";
import Link from "next/link";
import { SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import RisingSunMark from "@/components/brand/RisingSunMark";
import { useEntrance } from "./entrance";
import styles from "./landing.module.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Examples", href: "#examples" },
  { label: "Pricing", href: "#pricing" },
];

// Nav CTA: Get Started (Clerk sign-up modal) when signed out, My projects
// plus the avatar when signed in. My projects is a plain nav link like
// Features/Examples/Pricing; only Get Started is a pill. Signed-out markup
// also covers Clerk's loading state, so the CTA is in place on first paint.
function AuthActions({
  ctaClassName,
  linkClassName,
  onNavigate,
}: {
  ctaClassName: string;
  linkClassName: string;
  onNavigate?: () => void;
}) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return (
      <>
        <Link href="/projects" className={linkClassName} onClick={onNavigate}>
          My projects
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
          <RisingSunMark className={styles.mark} />
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
          <AuthActions ctaClassName={styles.cta} linkClassName={styles.link} />
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
                <AuthActions
                  ctaClassName={styles.sheetCta}
                  linkClassName={styles.sheetLink}
                  onNavigate={closeMenu}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
