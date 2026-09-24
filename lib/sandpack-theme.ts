import type { SandpackTheme } from "@codesandbox/sandpack-react";
import { DB_LITERALS } from "./daybreak-literals";

// Sandpack's theme takes literal colours (it builds its own CSS variables
// from them), so it reads DB_LITERALS. Translucent tokens are flattened onto
// --db-base, since the editor paints them over nothing.
const palette = {
  ...DB_LITERALS,
  borderOnBase: "#2f2f3c", // --db-border flattened onto --db-base
  // --db-muted at 45% alpha flattened onto --db-base, for disabled controls
  // (exempt from contrast minimums). Not a token: only Sandpack needs it.
  disabled: "#4f4e56",
} as const;

// The Daybreak editor, file explorer and preview frame. Surfaces come from
// --db-base and --db-surface-solid, borders from --db-border, the accent is
// peach. Syntax: keywords lavender, strings warm green, numbers and constants
// muted amber, functions peach, comments muted.
export const daybreakSandpackTheme: SandpackTheme = {
  colors: {
    // Editor, explorer and tab bar background.
    surface1: palette.base,
    // Borders and dividers.
    surface2: palette.borderOnBase,
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
