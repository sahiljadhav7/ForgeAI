import type { PricingTable } from "@clerk/nextjs";
import type { ComponentProps } from "react";

type PricingAppearance = NonNullable<
  ComponentProps<typeof PricingTable>["appearance"]
>;

// Clerk derives hover, border and shadow shades from `variables`, so those
// must be literal CSS colours. They mirror the .daybreak tokens in
// app/globals.css. `elements` are plain CSS on nodes rendered inside the
// .daybreak page, so they use the tokens directly.
const DB_LITERALS = {
  surfaceSolid: "#2c272d", // --db-surface-solid
  border: "rgba(214, 228, 255, 0.14)", // --db-border
  accent: "#f49d70", // --db-accent-solid
  onAccent: "#14111c", // --db-on-accent
  text: "#f6f1ec", // --db-text
  muted: "#98999c", // --db-muted
};

const cardShadow = "0 22px 60px rgba(0, 0, 0, 0.3)";

// Element overrides are style objects, not Tailwind classes: Clerk's own
// styles are unlayered and would beat Tailwind v4's layered utilities.
export const pricingAppearance: PricingAppearance = {
  variables: {
    colorPrimary: DB_LITERALS.accent,
    colorPrimaryForeground: DB_LITERALS.onAccent,
    colorBackground: DB_LITERALS.surfaceSolid,
    colorForeground: DB_LITERALS.text,
    colorMutedForeground: DB_LITERALS.muted,
    colorNeutral: "white",
    colorBorder: DB_LITERALS.border,
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontFamilyButtons: "var(--font-inter), Inter, sans-serif",
    // Buttons use this base. Clerk scales it up for cards (to 36px), so the
    // card radius is pinned below.
    borderRadius: "18px",
  },
  elements: {
    // Same glass surface, 26px radius and 1px border as the page's own cards.
    // Clerk's `[data-variant="default"]` rule zeroes the border and sets its
    // own shadow, so those go under a doubled-class selector that outranks it.
    pricingTableCard: {
      background: "var(--db-surface)",
      borderRadius: "26px",
      "&&[data-variant]": {
        border: "1px solid var(--db-border)",
        boxShadow: cardShadow,
      },
    },
    // Clerk keys per-plan elements by the plan's slug from the Clerk
    // dashboard, not its cplan_ id, so this matches in every instance.
    pricingTableCard__pro: {
      "&&[data-variant]": {
        borderColor: "var(--db-accent-solid)",
      },
    },
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
