"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { accentPillClass, secondaryPillClass } from "@/components/reusable";

export default function WorkspaceError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="font-display text-2xl text-db-text">
        We couldn&apos;t open your workspace
      </h2>
      <p className="text-sm text-db-muted">
        Your account couldn&apos;t be loaded. Try again, or sign out and back
        in. If it keeps happening, share the error ID below.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-db-muted">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => retry()}
          className={cn(
            accentPillClass,
            "inline-flex h-9 cursor-pointer items-center px-4 text-[13px] font-semibold",
          )}
        >
          Try again
        </button>
        <Link
          href="/"
          className={cn(
            secondaryPillClass,
            "inline-flex h-9 items-center px-4 text-[13px] font-semibold",
          )}
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
