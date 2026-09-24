"use client";

import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { PricingTable } from "@clerk/nextjs";
import { pricingAppearance } from "@/lib/clerk-appearance";
import { displayHeadingClass, focusRingClass } from "@/components/reusable";
import { cn } from "@/lib/utils";

interface PricingModalProps {
  children: React.ReactNode;
  reason?: "credits" | "upgrade";
}

const PricingModal = ({ children, reason = "upgrade" }: PricingModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const title =
    reason === "credits" ? "You're out of credits" : "Upgrade your plan";
  const description =
    reason === "credits"
      ? "You've used all your credits. Upgrade to keep building."
      : "Choose a plan that fits how much you build.";

  const handleScrollDown = () => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer">{children}</DialogTrigger>
      {/* The sm: max-width overrides Dialog's sm:max-w-md, which would
          otherwise clamp the three-column table to one column. */}
      <DialogContent
        className="w-[min(95vw,1100px)] max-h-[90dvh] overflow-hidden p-0 sm:max-w-[min(95vw,1100px)]"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className={cn(displayHeadingClass, "text-4xl")}>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          ref={contentRef}
          className="relative max-h-[calc(90dvh-8rem)] overflow-y-auto px-6 pb-10"
        >
          {/* Clerk's table stacks its cards on narrow screens by itself. */}
          <PricingTable
            appearance={pricingAppearance}
            checkoutProps={{
              appearance: {
                elements: {
                  drawerRoot: {
                    zIndex: 2000,
                  },
                },
              },
            }}
          />

          <button
            type="button"
            onClick={handleScrollDown}
            className={cn(
              "absolute bottom-3 right-3 z-10 rounded-full border border-db-border bg-db-surface p-2 text-db-text transition-colors hover:bg-db-surface-raised",
              focusRingClass,
            )}
            aria-label="Scroll down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PricingModal;
