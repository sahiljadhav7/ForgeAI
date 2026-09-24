import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DB_LITERALS } from "./daybreak-literals";

// The .daybreak token values as app/globals.css declares them.
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
function tokenValue(name: string) {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match?.[1].trim();
}

// Each literal and the token it mirrors.
const tokenOf: Record<keyof typeof DB_LITERALS, string> = {
  base: "--db-base",
  surfaceSolid: "--db-surface-solid",
  border: "--db-border",
  text: "--db-text",
  muted: "--db-muted",
  accent: "--db-accent-solid",
  accentLight: "--db-accent-light",
  onAccent: "--db-on-accent",
  lavender: "--db-lavender",
  danger: "--db-danger",
  ring: "--db-ring",
  syntaxString: "--db-syntax-string",
  syntaxNumber: "--db-syntax-number",
};

describe("DB_LITERALS", () => {
  it.each(Object.entries(tokenOf))("%s matches %s in globals.css", (key, token) => {
    const expected = tokenValue(token);
    expect(expected).toBeDefined();
    expect(DB_LITERALS[key as keyof typeof DB_LITERALS]).toBe(expected);
  });
});
