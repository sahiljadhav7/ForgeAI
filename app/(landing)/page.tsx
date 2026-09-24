import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FEATURES, STEPS } from "@/lib/data";
import { PricingTable, SignInButton } from "@clerk/nextjs";
import { ArrowRight, ChevronRight, Zap } from "lucide-react";
import { SectionLabel, SectionHeading } from "@/components/reusable";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";
import Hero from "./Hero";
import Nav from "./Nav";
import { pricingAppearance } from "./pricing-appearance";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Daybreak — Describe an app. We'll build it." },
  description: "Daybreak turns a written description into a working React app.",
};

// Daybreak card: warm glass surface, 1px border, ~26px radius.
const cardClass = "rounded-db border border-db-border bg-db-surface";

// Nothing is sticky on this page (the nav scrolls away with the hero), so
// anchors only need a little breathing room above the section.
const sectionClass = "scroll-mt-10 px-4 pb-32";

// Kanban columns in the demo mock, with how many placeholder cards each shows.
const DEMO_COLUMNS = [
  { name: "Todo", cards: 3 },
  { name: "In Progress", cards: 2 },
  { name: "Done", cards: 1 },
];

// The assistant's avatar in the demo chat.
function AiAvatar() {
  return (
    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-(image:--db-accent)">
      <Zap className="h-3 w-3 fill-db-on-accent text-db-on-accent" />
    </div>
  );
}

export default function Home() {
  return (
    <div
      className={cn(styles.root, "min-h-screen selection:bg-white/20")}
    >
      <Nav />
      <main>
        <Hero />

        <section id="examples" className={sectionClass}>
          <Reveal
            className={cn(
              cardClass,
              "mx-auto max-w-5xl overflow-hidden shadow-2xl shadow-black/50",
            )}
          >
            <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-3 w-3 rounded-full bg-white/10" />
                ))}
              </div>

              <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-white/5 px-3">
                <span className="text-xs text-white/35">
                  daybreak / workspace
                </span>
              </div>
            </div>

            <div className="flex h-105">
              {/* Chat panel. Phones show it alone: the preview needs sm+ width. */}
              <div className="flex w-full flex-col border-white/6 bg-black/15 sm:w-80 sm:border-r">
                <div className="border-b border-white/6 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-white/35">
                    Chat
                  </p>
                </div>

                <div className="flex-1 space-y-4 px-4 py-4">
                  <div className="flex justify-end">
                    <div className="max-w-55 rounded-2xl rounded-br-sm bg-white/10 px-3.5 py-2.5">
                      <p className="text-xs text-white/80">
                        Build a kanban board with 3 columns and drag-and-drop
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <AiAvatar />

                    <div className="rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-2.5">
                      <p className="text-xs text-white/60">
                        I&apos;ll build a Kanban board with Todo, In Progress,
                        and Done columns. I&apos;ll use{" "}
                        <code className="text-db-accent">@dnd-kit/core</code>{" "}
                        for smooth drag-and-drop…
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <AiAvatar />
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-3">
                      {[0, 0.15, 0.3].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 motion-reduce:animate-none"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/6 px-3 py-3">
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                    <span className="flex-1 text-xs text-white/30">
                      Ask AI to modify…
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                  </div>
                </div>
              </div>

              <div className="hidden flex-1 flex-col sm:flex">
                <div className="flex items-center gap-1 border-b border-white/6 px-4">
                  <span className="border-b-2 border-db-accent px-3 py-2.5 text-xs text-db-text">
                    Preview
                  </span>
                  <span className="px-3 py-2.5 text-xs text-white/35">
                    Code
                  </span>
                </div>

                <div className="flex flex-1 gap-3 overflow-hidden bg-black/20 p-5">
                  {DEMO_COLUMNS.map((col) => (
                    <div key={col.name} className="flex w-1/3 flex-col gap-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-white/40">
                          {col.name}
                        </span>

                        <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-xs text-white/35">
                          {col.cards}
                        </span>
                      </div>

                      {Array.from({ length: col.cards }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-white/8 bg-white/4 p-2.5"
                        >
                          <div
                            className="mb-1.5 h-2 rounded-full bg-white/15"
                            style={{ width: `${60 + i * 15}%` }}
                          />
                          <div className="h-1.5 w-3/4 rounded-full bg-white/8" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="how-it-works" className={sectionClass}>
          <Reveal>
            <div className="mx-auto mb-14 max-w-5xl text-center">
              <SectionLabel>How it works</SectionLabel>
              <SectionHeading line1="Four steps" line2="to a working app." />
            </div>

            <ol className="mx-auto flex max-w-3xl flex-col gap-3">
              {STEPS.map((step) => (
                <li
                  key={step.number}
                  className={cn(cardClass, "flex gap-5 p-6")}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(image:--db-accent) text-xs font-semibold tabular-nums text-db-on-accent">
                    {step.number}
                  </span>

                  <div className="pt-1.5">
                    <p className="mb-1.5 text-sm font-semibold text-db-text sm:text-base">
                      {step.label}
                    </p>
                    <p className="text-sm leading-relaxed text-db-muted">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section id="features" className={sectionClass}>
          <Reveal>
            <div className="mx-auto mb-14 max-w-5xl text-center">
              <SectionLabel>Everything you need</SectionLabel>
              <SectionHeading line1="From prompt" line2="to production." />
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className={cn(cardClass, "group p-7")}>
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/4 group-hover:border-white/15 group-hover:bg-white/8">
                    <Icon className="h-4 w-4 text-white/60 group-hover:text-db-accent" />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-db-text">
                    {label}
                  </p>
                  <p className="text-sm leading-relaxed text-db-muted">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="pricing" className={cn(sectionClass, "relative isolate")}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[80%] bg-(image:--db-glow-peach)"
          />
          <Reveal>
            <div className="mx-auto mb-14 max-w-5xl text-center">
              <SectionLabel>Simple pricing</SectionLabel>
              <SectionHeading line1="Start free" line2="scale when ready." />

              <p className="mx-auto mt-4 max-w-sm text-sm text-db-muted">
                No credit card required. Upgrade or downgrade anytime.
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
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
            </div>
          </Reveal>
        </section>

        <section className="px-4 pb-32">
          <Reveal
            className={cn(
              cardClass,
              "relative isolate mx-auto max-w-5xl overflow-hidden px-6 py-24 text-center sm:px-10",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-(image:--db-glow-lavender)"
            />
            <SectionHeading line1="Start building," line2="for free." />

            <p className="mb-8 mt-4 text-sm leading-relaxed text-db-muted">
              Get 10 free generations on sign up. No credit card required.
              <br />
              upgrade when you&apos;re ready.
            </p>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="relative h-11 rounded-[12px] bg-(image:--db-accent) px-8 text-[15px] font-[520] tracking-[-0.0127em] text-db-on-accent shadow-(--db-accent-shadow) hover:brightness-107 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:border-transparent focus-visible:outline-solid focus-visible:outline-[#f8b285] focus-visible:ring-0 active:scale-[0.98]"
              >
                Get started free
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SignInButton>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex flex-wrap items-center justify-center border-t border-white/7 px-6 py-12 text-sm text-db-muted">
        Made by jadhavsahilcodes@(dot)com
      </footer>
    </div>
  );
}
