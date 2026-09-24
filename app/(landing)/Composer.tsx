"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { PLACEHOLDERS, SUGGESTIONS } from "@/lib/data";
import styles from "./landing.module.css";

// Filled blob icons in design.md's three chip slots. --pl is the label
// offset, --ig the icon gap and --iw the icon width, in reference px.
const CHIP_SLOTS: { style: CSSProperties; icon: ReactNode }[] = [
  {
    style: { "--pl": 12, "--ig": 3.7, "--iw": 15.06 } as CSSProperties,
    icon: (
      <svg viewBox="0 0 16 13" fill="currentColor" aria-hidden="true">
        <rect x="5" y="0" width="11" height="8.5" rx="2.2" opacity=".5" />
        <rect x="0" y="3.5" width="11.5" height="9.5" rx="2.4" />
      </svg>
    ),
  },
  {
    style: { "--pl": 16, "--ig": 3.9, "--iw": 11.8 } as CSSProperties,
    icon: (
      <svg viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
        <path d="M2.8 0h3v5.4h-3A2.7 2.7 0 0 1 2.8 0Z" />
        <path d="M5.8 0h3a2.7 2.7 0 0 1 0 5.4h-3V0Z" opacity=".5" />
        <path d="M2.8 5.3h3v5.4h-3a2.7 2.7 0 0 1 0-5.4Z" opacity=".75" />
        <circle cx="8.8" cy="8" r="2.7" />
        <path d="M2.8 10.6h3v2.7a2.7 2.7 0 1 1-3-2.7Z" opacity=".5" />
      </svg>
    ),
  },
  {
    style: { "--pl": 15.8, "--ig": 2.9, "--iw": 12.13 } as CSSProperties,
    icon: (
      <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 0c.6 3.5 2.5 5.4 6 6-3.5.6-5.4 2.5-6 6-.6-3.5-2.5-5.4-6-6 3.5-.6 5.4-2.5 6-6Z" />
      </svg>
    ),
  },
];

// Visual shell of the hero composer. Ticket 05 adds the behaviour: controlled
// prompt, Enter to submit, auto-grow, rotating placeholder, random chips and
// the signed-in/out submit paths.
export default function Composer() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // TODO(05): route to /workspace?prompt=… or open Clerk sign-in.
    e.preventDefault();
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <textarea
        name="prompt"
        rows={1}
        aria-label="Describe the app you want to build"
        placeholder={PLACEHOLDERS[0]}
        className={styles.ph}
      />

      <div className={styles.tools}>
        <div className={styles.chips}>
          {SUGGESTIONS.slice(0, CHIP_SLOTS.length).map((s, i) => (
            <button
              key={s.label}
              type="button"
              className={styles.chip}
              style={CHIP_SLOTS[i].style}
            >
              {CHIP_SLOTS[i].icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.right}>
          <button type="submit" aria-label="Build it" className={styles.send}>
            <svg viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
              <path d="M6 0c.3 0 .6.1.8.3l4.9 4.9a1.1 1.1 0 0 1-1.6 1.6L7.1 3.8v9.1a1.1 1.1 0 1 1-2.2 0V3.8L1.9 6.8A1.1 1.1 0 0 1 .3 5.2L5.2.3C5.4.1 5.7 0 6 0Z" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
