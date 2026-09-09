"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { type PointerEvent, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  showArrow?: boolean;
}

export function GenerateButton({
  className,
  disabled = false,
  onClick,
  showArrow = false,
}: GenerateButtonProps) {
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number }>();

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      id: Date.now(),
    });
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      className={cn(
        "group relative isolate h-8 overflow-hidden rounded-full border border-white/15 bg-white px-5 font-semibold text-black shadow-[0_2px_8px_rgba(255,255,255,0.08)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-white hover:shadow-[0_8px_20px_rgba(255,255,255,0.16)] active:translate-y-0 active:scale-[0.96] disabled:border-transparent disabled:bg-white/10 disabled:text-white/25 disabled:shadow-none motion-reduce:transform-none",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-500 group-hover:left-[110%] group-hover:opacity-100 motion-reduce:hidden" />
      {ripple && (
        <span
          key={ripple.id}
          className="pointer-events-none absolute size-3 rounded-full bg-black/15 animate-[generate-ripple_500ms_ease-out_forwards]"
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        <Sparkles className="size-3 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110 motion-reduce:transform-none" />
        Generate
        {showArrow && <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none" />}
      </span>
    </Button>
  );
}
