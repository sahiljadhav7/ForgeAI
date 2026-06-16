import React from "react";
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
  reason?: "credits " | "upgrade";
}

const PricingModal = ({ children, reason = "upgrade" }: PricingModalProps) => {
  const title =
    reason == "credits " ? "You're out of credits" : "upgrade your plan";
  const description =
    reason === "credits "
      ? "You've used all your credits. Upgrade to keep building."
      : "choose a plan that fits how much you build.";
  return (
    <Dialog>
      <DialogTrigger className={"cursor-poiter"}>{children}</DialogTrigger>
      <DialogContent
        className={
          "border-white/8 bg-[#0f0f0f] p-0 text-white sm:max-w-xl max-h-[90dvh] overflow-y-auto"
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
        <div className="px-6 pb-6">
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
      </DialogContent>
    </Dialog>
  );
};
export default PricingModal;
