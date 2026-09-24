"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { buildWorkspaceUrl, pickSuggestions, planSubmit } from "@/lib/composer";
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

const CHIP_COUNT = CHIP_SLOTS.length;
const PLACEHOLDER_MS = 3000;

const subscribeNever = () => () => {};

// false on the server and while hydrating, true from the next render on.
// React re-renders once after hydration when the snapshots differ.
function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

// The hero composer. Enter submits and Shift+Enter adds a line. The card
// grows downward with the prompt (the textarea's max-height caps it at about
// 2x) and the toolbar stays pinned to its bottom edge. Chips show the first
// three suggestions on the server and first client render, then a random
// three once hydrated.
export default function Composer() {
  const router = useRouter();
  const { openSignIn } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const cardRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  // A random pick is held from the first client render but only shown once
  // hydrated, so server and hydration markup match (the first three).
  const hydrated = useHydrated();
  const [randomChips] = useState(() =>
    pickSuggestions(SUGGESTIONS, CHIP_COUNT),
  );
  const chips = hydrated ? randomChips : SUGGESTIONS.slice(0, CHIP_COUNT);

  useEffect(() => {
    if (isFocused || prompt) return;
    const t = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, PLACEHOLDER_MS);
    return () => clearInterval(t);
  }, [isFocused, prompt]);

  // Height follows scrollHeight up to the CSS max-height. The card grows by
  // the same amount (--grow) and a matching negative margin keeps its layout
  // box the base size, so the centered hero doesn't shift upward.
  const fitToContent = useCallback(() => {
    const el = textareaRef.current;
    const card = cardRef.current;
    if (!el || !card) return;
    el.style.height = "";
    const base = el.offsetHeight;
    el.style.height = `${el.scrollHeight}px`;
    card.style.setProperty("--grow", `${el.offsetHeight - base}px`);
  }, []);

  useLayoutEffect(fitToContent, [prompt, fitToContent]);

  useEffect(() => {
    window.addEventListener("resize", fitToContent);
    return () => window.removeEventListener("resize", fitToContent);
  }, [fitToContent]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const plan = planSubmit(prompt, { isLoaded, isSignedIn });
    if (!plan) return;
    if (plan.type === "navigate") {
      router.push(plan.url);
    } else {
      openSignIn({
        forceRedirectUrl: plan.forceRedirectUrl,
        signUpForceRedirectUrl: plan.signUpForceRedirectUrl,
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleChip = (chipPrompt: string) => {
    setPrompt(chipPrompt);
    textareaRef.current?.focus();
  };

  const canSubmit = buildWorkspaceUrl(prompt) !== null;

  return (
    <form ref={cardRef} className={styles.card} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        name="prompt"
        rows={1}
        aria-label="Describe your app"
        placeholder={PLACEHOLDERS[placeholderIndex]}
        className={styles.ph}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
      />

      <div className={styles.tools}>
        <div className={styles.chips}>
          {chips.map((s, i) => (
            <button
              key={s.label}
              type="button"
              className={styles.chip}
              style={CHIP_SLOTS[i].style}
              onClick={() => handleChip(s.prompt)}
            >
              {CHIP_SLOTS[i].icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.right}>
          <button
            type="submit"
            aria-label="Build it"
            className={styles.send}
            disabled={!canSubmit}
          >
            <svg viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
              <path d="M6 0c.3 0 .6.1.8.3l4.9 4.9a1.1 1.1 0 0 1-1.6 1.6L7.1 3.8v9.1a1.1 1.1 0 1 1-2.2 0V3.8L1.9 6.8A1.1 1.1 0 0 1 .3 5.2L5.2.3C5.4.1 5.7 0 6 0Z" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
