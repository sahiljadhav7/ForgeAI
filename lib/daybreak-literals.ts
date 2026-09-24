// The .daybreak tokens (app/globals.css) as literal colours, for libraries
// that build their own styles from literals instead of CSS variables: Clerk's
// `variables` (lib/clerk-appearance.ts) and Sandpack's theme
// (lib/sandpack-theme.ts). daybreak-literals.test.ts checks each one still
// matches its token.
export const DB_LITERALS = {
  base: "#14111c", // --db-base
  surfaceSolid: "#2c272d", // --db-surface-solid
  border: "rgba(214, 228, 255, 0.14)", // --db-border
  text: "#f6f1ec", // --db-text
  muted: "#98999c", // --db-muted (6.5:1 on --db-base)
  accent: "#f49d70", // --db-accent-solid (8.8:1 on --db-base)
  accentLight: "#fbbc94", // --db-accent-light
  onAccent: "#14111c", // --db-on-accent
  lavender: "#9c86ce", // --db-lavender (6.0:1 on --db-base)
  danger: "#ef6a55", // --db-danger
  ring: "#f8b285", // --db-ring
  syntaxString: "#b5c98a", // --db-syntax-string (10.4:1 on --db-base)
  syntaxNumber: "#d4b06a", // --db-syntax-number (9.1:1 on --db-base)
} as const;
