import { useId } from "react";

// The Daybreak brand mark: a half-sun on a horizon line with a short
// reflection, peach → lavender. Size it through `className`. The stops read
// .daybreak tokens, so it must render inside <body> (which carries .daybreak).
export default function RisingSunMark({ className }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="8" x2="0" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--db-accent-light)" }} />
          <stop offset="1" style={{ stopColor: "var(--db-lavender)" }} />
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
