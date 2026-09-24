import React from "react";
import { cn } from "@/lib/utils";

export const BlueTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`bg-linear-to-br font-display from-blue-300 via-blue-400 to-blue-600 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

// The Daybreak focus ring: a solid 2px peach outline, offset from the element.
export const focusRingClass =
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-db-accent";

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
