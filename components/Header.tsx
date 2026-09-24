import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { SignUpButton, UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import PricingModal from "./PricingModal";
import RisingSunMark from "./brand/RisingSunMark";
import { checkUser } from "@/lib/checkUser";
import { cn } from "@/lib/utils";

// The app-wide header: the landing nav's sibling in the Daybreak palette.
// Height stays 64px (h-16) so pages' mt-16 offsets keep working.
const Header = async () => {
  const { userId } = await auth();
  const user = await checkUser();

  return (
    <header className="fixed top-0 left-0 z-50 h-16 w-full border-b border-db-border bg-db-surface/70 backdrop-blur-md">
      {/* One focus ring for every control in the bar, including the ones
          Clerk and PricingModal render: a solid --db-accent-solid outline (close
          to the landing composer's; ticket 07 reconciles the ring token),
          rounded so it hugs the pills and the round avatar. */}
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-3 [&_:focus-visible]:outline-db-accent [&_:focus-visible]:rounded-full">
        <Link
          href="/"
          aria-label="Daybreak home"
          className="inline-flex shrink-0 items-center gap-3 text-db-text"
        >
          <RisingSunMark className="block size-8 flex-none" />
          <span
            className={cn(
              "text-[18.5px] leading-none font-medium [font-variation-settings:'opsz'_32] tracking-[-0.0154em]",
              // Signed in, phones drop the wordmark so Projects, credits and
              // the avatar fit at 360px; the link keeps its aria-label.
              userId && "hidden sm:inline",
            )}
          >
            Daybreak
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {userId ? (
            <>
              <Link
                href={"/projects"}
                className="text-[13px] font-medium text-db-muted transition-[color] hover:text-db-text"
              >
                Projects
              </Link>

              {user && (
                <PricingModal>
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-db-border bg-db-surface px-3 text-[13px] font-medium whitespace-nowrap text-db-text transition-colors hover:border-db-accent/40">
                    <Zap className="size-3 fill-db-accent text-db-accent" />
                    {user.credits} credits
                  </span>
                </PricingModal>
              )}

              <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-[13px] font-medium whitespace-nowrap text-db-muted transition-[color] hover:text-db-text"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-full bg-(image:--db-accent) px-4 text-[13px] font-semibold whitespace-nowrap text-db-on-accent shadow-(--db-accent-shadow) transition-[filter,transform] hover:brightness-107 active:scale-95"
                >
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Header;
