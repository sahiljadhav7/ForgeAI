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
import { BlueTitle } from "./reusable";
import { PricingTable } from "@clerk/nextjs";

interface PricingModalProps {
  children: React.ReactNode;
  reason?: "credits" | "upgrade";
}

const PricingModal = ({ children, reason = "upgrade" }: PricingModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const title =
    reason == "credits" ? "You're out of credits" : "upgrade your plan";
  const description =
    reason === "credits"
      ? "You've used all your credits. Upgrade to keep building."
      : "choose a plan that fits how much you build.";

  const handleScrollDown = () => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Dialog>
      <DialogTrigger className={"cursor-poiter"}>{children}</DialogTrigger>
      <DialogContent
        className={
          "border-white/8 bg-[#0f0f0f] p-0 text-white w-[min(95vw,1100px)] max-h-[90dvh] overflow-hidden"
        }
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle
            className={"font-serif text-xl tracking-tight text-white/90"}
          >
            <BlueTitle className="text-4xl">{title}</BlueTitle>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          ref={contentRef}
          className="relative max-h-[calc(90dvh-8rem)] overflow-y-auto overflow-x-auto px-6 pb-10"
        >
          <div className="min-w-180 md:min-w-0">
            <PricingTable
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
          </div>

          <button
            type="button"
            onClick={handleScrollDown}
            className="absolute bottom-3 right-3 z-10 rounded-full border border-white/15 bg-white/10 p-2 text-white/80 backdrop-blur transition hover:bg-white/20"
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
