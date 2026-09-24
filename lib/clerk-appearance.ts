import type { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";
import { DB_LITERALS } from "./daybreak-literals";

type ClerkAppearance = NonNullable<
  ComponentProps<typeof ClerkProvider>["appearance"]
>;

// The peach gradient fill with dark text.
const accentFill = {
  backgroundImage: "var(--db-accent)",
  color: "var(--db-on-accent)",
};

// The landing CTA's peach gradient button.
const accentButton = {
  ...accentFill,
  fontWeight: 520,
  letterSpacing: "-0.0127em",
  boxShadow: "var(--db-accent-shadow)",
};

// The Daybreak focus ring (focusRingClass in components/reusable.tsx).
const focusRing = {
  outline: "2px solid var(--db-ring)",
  outlineOffset: "3px",
};

// The base theme for every Clerk surface: <SignIn>, <SignUp>, the modals,
// the UserButton popover and the checkout drawer. ClerkProvider applies it
// (app/layout.tsx), and each component's own `appearance` is layered on top.
//
// Element overrides are style objects, not Tailwind classes: Clerk's own
// styles are unlayered and would beat Tailwind v4's layered utilities. Where
// Clerk's rule outranks a single class, `&&` doubles the class to win.
export const daybreakAppearance: ClerkAppearance = {
  // Clerk derives hover, border and shadow shades from `variables`, so they
  // are literal colours. `elements` sit inside <body>, which carries
  // .daybreak, so they use the tokens directly.
  variables: {
    colorPrimary: DB_LITERALS.accent,
    colorPrimaryForeground: DB_LITERALS.onAccent,
    colorBackground: DB_LITERALS.surfaceSolid,
    colorForeground: DB_LITERALS.text,
    colorMutedForeground: DB_LITERALS.muted,
    // Clerk derives its neutral greys (default borders, dividers, hovers) as
    // alphas of this, so it stays plain white rather than a token.
    colorNeutral: "white",
    // No colorBorder here: Clerk scales its alpha down for input and divider
    // borders, and --db-border's 14% would vanish. The neutral-derived
    // default reads the same.
    colorRing: DB_LITERALS.ring,
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontFamilyButtons: "var(--font-inter), Inter, sans-serif",
    // Buttons and inputs use this base. Clerk scales it up for cards, so the
    // card radius is pinned below.
    borderRadius: "18px",
  },
  elements: {
    // Same glass surface, 26px radius and 1px border as the landing cards.
    // The box holds the card and its footer; its solid fill shows through
    // the card's rounded bottom corners.
    cardBox: {
      background: "var(--db-surface-solid)",
      borderRadius: "var(--db-radius)",
      "&&": {
        border: "1px solid var(--db-border)",
        boxShadow: "var(--db-card-shadow)",
      },
    },
    card: {
      background: "var(--db-surface)",
    },
    headerTitle: {
      fontVariationSettings: '"opsz" 32',
      fontWeight: 410,
      letterSpacing: "-0.01em",
      color: "var(--db-text)",
    },
    headerSubtitle: {
      color: "var(--db-muted)",
    },
    formFieldInput: {
      "&&:focus-visible, &&:focus": {
        borderColor: "var(--db-ring)",
        // The ring at ~50%, like shadcn's inputs (ring-ring/50).
        boxShadow:
          "0 0 0 3px color-mix(in srgb, var(--db-ring) 50%, transparent)",
      },
    },
    formButtonPrimary: {
      ...accentButton,
      "&&": { boxShadow: "var(--db-accent-shadow)" },
      "&&:hover": { filter: "brightness(1.07)" },
      "&&:focus-visible": focusRing,
    },
    footerActionLink: {
      color: "var(--db-accent-solid)",
      "&:hover": { color: "var(--db-accent-light)" },
    },
    socialButtonsBlockButton: {
      background: "var(--db-surface-raised)",
      "&&": { border: "1px solid var(--db-border)" },
      "&&:focus-visible": focusRing,
    },
  },
};

// The pricing cards on the landing page and in PricingModal. Clerk layers
// this over `daybreakAppearance`, so it holds only the pricing overrides.
export const pricingAppearance: ClerkAppearance = {
  variables: {
    // The card borders are pinned below, so the faint derived shades only
    // reach the dividers inside a card.
    colorBorder: DB_LITERALS.border,
  },
  elements: {
    // Clerk's `[data-variant="default"]` rule zeroes the border and sets its
    // own shadow, so those go under a doubled-class selector that outranks it.
    pricingTableCard: {
      background: "var(--db-surface)",
      borderRadius: "var(--db-radius)",
      "&&[data-variant]": {
        border: "1px solid var(--db-border)",
        boxShadow: "var(--db-card-shadow)",
      },
    },
    // Clerk keys per-plan elements by the plan's slug from the Clerk
    // dashboard, not its cplan_ id, so this matches in every instance.
    pricingTableCard__pro: {
      "&&[data-variant]": {
        borderColor: "var(--db-accent-solid)",
      },
    },
    pricingTableCardFooterButton: accentButton,
    pricingTableCardBadge: accentFill,
  },
};
