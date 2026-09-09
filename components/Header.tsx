import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import {
  SignUpButton,
  UserButton,
  SignInButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "./ui/button";
import PricingModal from "./PricingModal";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  const { userId } = await auth();
  const user = await checkUser();

  return (
    <header className="w-full fixed top-0 left-0 z-50 h-16 border-b border-white/6 bg-white/7 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="Logo"
            width={100}
            height={100}
            loading="eager"
            className="h-9 w-auto rounded-md"
          />
        </Link>

        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <Link
                href={"/projects"}
                className="text-13px font-medium text-white/40 transition-colors hover:text-whtite/80"
              >
                Projects
              </Link>

              {user && (
                <PricingModal>
                  <span className="inline-flex h-8 items-center gap=1.5 rounded-full border border-white/10 bg-white/5 px-3 text-white/70 text-13px font-medium">
                    <Zap className="h-3 w-3 fill-white/70" /> {user.credits}
                    credits
                  </span>
                </PricingModal>
              )}

              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className={"*:text-white/40"}>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  type="button"
                  className={
                    "h-8 rounded-full font-semibold active:scale-95 px-4 pt-0.5"
                  }
                >
                  Get started
                  <ArrowRight className=" h-3 w-3 opacity-60" />
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Header;
