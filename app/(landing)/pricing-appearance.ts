import type { PricingTable } from "@clerk/nextjs";
import type { ComponentProps } from "react";
import { PRICING_PLANS } from "@/lib/constants";

type PricingAppearance = NonNullable<
  ComponentProps<typeof PricingTable>["appearance"]
>;

// Clerk derives hover, border and shadow shades from `variables`, so those
// must be literal CSS colours. They mirror the .daybreak tokens in
// app/globals.css. `elements` are plain CSS on nodes rendered inside the
// .daybreak page, so they use the tokens directly.
const DB = {
  surfaceSolid: "#2c272d", // --db-surface-solid
  border: "rgba(214, 228, 255, 0.14)", // --db-border
  accent: "#f49d70", // --db-accent-solid
  onAccent: "#14111c", // --db-on-accent
  text: "#f6f1ec", // --db-text
  muted: "#98999c", // --db-muted
};

const cardShadow = "0 22px 60px rgba(0, 0, 0, 0.3)";

const proPlanId = PRICING_PLANS.find((plan) => plan.key === "pro")?.planId;

// Element overrides are style objects, not Tailwind classes: Clerk's own
// styles are unlayered and would beat Tailwind v4's layered utilities.
export const pricingAppearance: PricingAppearance = {
  variables: {
    colorPrimary: DB.accent,
    colorPrimaryForeground: DB.onAccent,
    colorBackground: DB.surfaceSolid,
    colorForeground: DB.text,
    colorMutedForeground: DB.muted,
    colorNeutral: "white",
    colorBorder: DB.border,
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontFamilyButtons: "var(--font-inter), Inter, sans-serif",
    // Clerk's cards use the xl step (a little above this base), so they land
    // close to the page's 26px cards; buttons use the base.
    borderRadius: "18px",
  },
  elements: {
    // Same glass surface and 1px border as the page's own cards.
    pricingTableCard: {
      background: "var(--db-surface)",
      border: "1px solid var(--db-border)",
      boxShadow: cardShadow,
    },
    ...(proPlanId && {
      [`pricingTableCard__${proPlanId}`]: {
        borderColor: "var(--db-accent-solid)",
      },
    }),
    pricingTableCardFooterButton: {
      backgroundImage: "var(--db-accent)",
      color: "var(--db-on-accent)",
      fontWeight: 520,
      letterSpacing: "-0.0127em",
      boxShadow: "var(--db-accent-shadow)",
    },
    pricingTableCardBadge: {
      backgroundImage: "var(--db-accent)",
      color: "var(--db-on-accent)",
    },
  },
};
