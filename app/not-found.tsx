import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { accentPillClass } from "@/components/reusable";
import { cn } from "@/lib/utils";

// Rendered through the root layout's "%s · Daybreak" template, so the page
// gets exactly one <title>.
export const metadata: Metadata = {
  title: "Page not found",
};

// The root layout doesn't provide the Header or <main>, so this page renders
// both around the Daybreak 404 message.
const NotFound = () => {
  return (
    <>
      <Header />
      <main className="relative isolate flex min-h-dvh flex-col items-center justify-center px-4 py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-(image:--db-glow-lavender)"
        />
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.01em] text-db-text">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-db-muted">
          The link may be broken, or the page may have moved.
        </p>
        <Link
          href="/"
          className={cn(
            accentPillClass,
            "mt-8 inline-flex h-10 items-center px-5 text-sm font-semibold",
          )}
        >
          Back home
        </Link>
      </main>
    </>
  );
};

export default NotFound;
