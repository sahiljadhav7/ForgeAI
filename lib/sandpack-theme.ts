import type { SandpackTheme } from "@codesandbox/sandpack-react";

// Sandpack's theme takes literal colours (it builds its own CSS variables
// from them), so these mirror the .daybreak tokens in app/globals.css, as
// lib/clerk-appearance.ts does for Clerk. Translucent tokens are flattened
// onto --db-base, since the editor paints them over nothing.
export const SANDPACK_LITERALS = {
  base: "#14111c", // --db-base
  surfaceSolid: "#2c272d", // --db-surface-solid
  border: "#2f2f3c", // --db-border flattened onto --db-base
  text: "#f6f1ec", // --db-text
  muted: "#98999c", // --db-muted (6.5:1 on --db-base)
  // --db-muted at 45% alpha flattened onto --db-base, for disabled controls
  // (exempt from contrast minimums). Not a token: only Sandpack needs it.
  disabled: "#4f4e56",
  accent: "#f49d70", // --db-accent-solid (8.8:1 on --db-base)
  accentLight: "#fbbc94", // --db-accent-light
  lavender: "#9c86ce", // --db-lavender (6.0:1 on --db-base)
  danger: "#ef6a55", // --db-danger
  syntaxString: "#b5c98a", // --db-syntax-string (10.4:1 on --db-base)
  syntaxNumber: "#d4b06a", // --db-syntax-number (9.1:1 on --db-base)
} as const;

const palette = SANDPACK_LITERALS;

// The Daybreak editor, file explorer and preview frame. Surfaces come from
// --db-base and --db-surface-solid, borders from --db-border, the accent is
// peach. Syntax: keywords lavender, strings warm green, numbers and constants
// muted amber, functions peach, comments muted.
export const daybreakSandpackTheme: SandpackTheme = {
  colors: {
    // Editor, explorer and tab bar background.
    surface1: palette.base,
    // Borders and dividers.
    surface2: palette.border,
    // Hover fills.
    surface3: palette.surfaceSolid,
    disabled: palette.disabled,
    // Default UI text: file names, inactive tabs, line numbers.
    base: palette.muted,
    clickable: palette.muted,
    hover: palette.text,
    accent: palette.accent,
    error: palette.danger,
    errorSurface: palette.surfaceSolid,
  },
  syntax: {
    plain: palette.text,
    comment: { color: palette.muted, fontStyle: "italic" },
    keyword: palette.lavender,
    definition: palette.accent,
    punctuation: palette.muted,
    property: palette.accentLight,
    tag: palette.accent,
    static: palette.syntaxNumber,
    string: palette.syntaxString,
  },
  font: {
    body: "var(--font-inter), Inter, -apple-system, 'Segoe UI', sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
    size: "13px",
    lineHeight: "20px",
  },
};
