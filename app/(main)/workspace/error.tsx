"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <h2 className="font-serif text-2xl text-white/90">
        We couldn&apos;t open your workspace
      </h2>
      <p className="text-sm text-white/40">
        Your account couldn&apos;t be loaded. Try again, or sign out and back
        in. If it keeps happening, share the error ID below.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-white/25">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button className="cursor-pointer" onClick={() => retry()}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-full border border-white/15 px-4 text-[13px] font-semibold text-white/80 transition-opacity hover:opacity-90"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
