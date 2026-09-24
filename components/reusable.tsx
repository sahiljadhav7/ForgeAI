import React from "react";
import { cn } from "@/lib/utils";

// The Daybreak focus ring: a solid 2px peach outline, offset from the element.
export const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-db-accent";

// The same ring for every focused descendant, for wrappers whose controls
// are rendered by another component (Clerk, PricingModal's trigger). Rounded
// so it hugs pills and round avatars.
export const focusRingWithinClass =
  "[&_:focus-visible]:rounded-full [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-3 [&_:focus-visible]:outline-db-accent";

// Daybreak display heading type: Inter display in warm white.
export const displayHeadingClass =
  "font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.01em] text-db-text";

// The Daybreak accent pill's colour, shadow, focus ring and press feedback
// (the header's Get Started, the 404's Back home). Callers add size, padding
// and type.
export const accentPillClass = cn(
  "rounded-full bg-(image:--db-accent) text-db-on-accent shadow-(--db-accent-shadow) transition-[filter,transform] hover:brightness-107 active:scale-95",
  focusRingClass,
);

// The Daybreak secondary pill: the header's credits pill look (surface,
// border, peach border on hover) with the focus ring and press feedback.
// Callers add size, padding and type.
export const secondaryPillClass = cn(
  "rounded-full border border-db-border bg-db-surface text-db-text transition-[border-color,transform] hover:border-db-accent/40 active:scale-95",
  focusRingClass,
);

// Daybreak section label: lavender, sentence case.
export const SectionLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="mb-4 text-sm font-medium text-db-lavender">{children}</p>
  );
};

// Daybreak section heading: both lines in the same warm white, Inter display.
// Two lines, split by a line break.
export const SectionHeading = ({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}) => {
  return (
    <h2 className={displayHeadingClass}>
      {line1}
      <br />
      {line2}
    </h2>
  );
};

// A faint Daybreak dawn glow behind a section: lavender falls from the top,
// peach rises from the bottom. The parent needs `relative isolate`; callers
// set the height (e.g. `h-[60%]`).
const glowTone = {
  lavender: "top-0 bg-(image:--db-glow-lavender)",
  peach: "bottom-0 bg-(image:--db-glow-peach)",
};

export const Glow = ({
  tone,
  className,
}: {
  tone: keyof typeof glowTone;
  className?: string;
}) => {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 -z-10",
        glowTone[tone],
        className,
      )}
    />
  );
};
