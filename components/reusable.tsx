import React from "react";

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
    <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.01em] text-db-text">
      {line1}
      <br />
      {line2}
    </h2>
  );
};
